import { createServiceRoleClient, requireAdmin } from "@/lib/server/admin"
import { applyGlobalApiKeysToProfile, getGlobalApiKeyMap } from "@/lib/server/global-api-keys"
import {
  fetchOpenRouterCatalog,
  getAllCustomModels,
  getEnabledHostedApiModels,
  getModelPolicies,
  mapCustomModelsToCatalog,
  mapHostedModelsToCatalog
} from "@/lib/server/model-access"
import { createResponse } from "@/lib/server/server-utils"
import { VALID_ENV_KEYS } from "@/types/valid-keys"

type ModelAccessUpdatePayload = {
  modelKey: string
  isGlobal: boolean
  allowedUserIds: string[]
}

function withEnvOverrides<T extends Record<string, any>>(profile: T): T {
  const merged = { ...profile }
  const envToFieldMap: Record<string, string> = {
    [VALID_ENV_KEYS.OPENAI_API_KEY]: "openai_api_key",
    [VALID_ENV_KEYS.ANTHROPIC_API_KEY]: "anthropic_api_key",
    [VALID_ENV_KEYS.GOOGLE_GEMINI_API_KEY]: "google_gemini_api_key",
    [VALID_ENV_KEYS.MISTRAL_API_KEY]: "mistral_api_key",
    [VALID_ENV_KEYS.GROQ_API_KEY]: "groq_api_key",
    [VALID_ENV_KEYS.PERPLEXITY_API_KEY]: "perplexity_api_key",
    [VALID_ENV_KEYS.AZURE_OPENAI_API_KEY]: "azure_openai_api_key",
    [VALID_ENV_KEYS.OPENROUTER_API_KEY]: "openrouter_api_key"
  }

  for (const [envKey, profileField] of Object.entries(envToFieldMap)) {
    if (process.env[envKey]) {
      ;(merged as any)[profileField] = process.env[envKey]
    }
  }

  return merged
}

export async function GET() {
  try {
    const { profile } = await requireAdmin()
    const supabaseAdmin = createServiceRoleClient()
    const globalApiKeyMap = await getGlobalApiKeyMap(supabaseAdmin)
    const mergedProfile = withEnvOverrides(
      applyGlobalApiKeysToProfile(profile, globalApiKeyMap)
    )

    const hostedModels = getEnabledHostedApiModels(mergedProfile)
    const openRouterModels = await fetchOpenRouterCatalog(mergedProfile)
    const customModels = await getAllCustomModels(supabaseAdmin)

    const catalog = [
      ...mapHostedModelsToCatalog(hostedModels, "hosted"),
      ...mapHostedModelsToCatalog(openRouterModels, "openrouter"),
      ...mapCustomModelsToCatalog(customModels)
    ]

    const modelKeys = [...new Set(catalog.map(item => item.modelKey))]
    const { byKey, allowedUsersByKey } = await getModelPolicies(
      supabaseAdmin,
      modelKeys
    )

    const models = catalog.map(item => ({
      ...item,
      isGlobal: byKey.get(item.modelKey)?.isGlobal ?? false,
      allowedUserIds: allowedUsersByKey.get(item.modelKey) || []
    }))

    const { data: users, error: usersError } = await supabaseAdmin
      .from("profiles")
      .select("user_id, username, display_name, is_admin")
      .order("username", { ascending: true })

    if (usersError) {
      throw new Error(usersError.message)
    }

    return createResponse({ models, users: users || [] }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to load model access settings" },
      500
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { user } = await requireAdmin()
    const body = (await req.json()) as ModelAccessUpdatePayload
    const modelKey = String(body.modelKey || "").trim()
    const isGlobal = Boolean(body.isGlobal)
    const allowedUserIds = Array.from(new Set(body.allowedUserIds || [])).filter(
      Boolean
    )

    if (!modelKey.includes(":")) {
      return createResponse({ message: "Invalid modelKey" }, 400)
    }

    const supabaseAdmin = createServiceRoleClient()

    const { error: upsertError } = await (supabaseAdmin as any)
      .from("app_model_access")
      .upsert(
        {
          model_key: modelKey,
          is_global: isGlobal,
          updated_by: user.id
        },
        { onConflict: "model_key" }
      )

    if (upsertError) {
      throw new Error(upsertError.message)
    }

    const { error: deleteError } = await (supabaseAdmin as any)
      .from("app_model_access_users")
      .delete()
      .eq("model_key", modelKey)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    if (!isGlobal && allowedUserIds.length > 0) {
      const { error: insertError } = await (supabaseAdmin as any)
        .from("app_model_access_users")
        .insert(
          allowedUserIds.map(userId => ({
            model_key: modelKey,
            user_id: userId
          }))
        )

      if (insertError) {
        throw new Error(insertError.message)
      }
    }

    return createResponse({ success: true }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to update model access settings" },
      500
    )
  }
}

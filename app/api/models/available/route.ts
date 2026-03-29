import { createServiceRoleClient, getServerAuthContext } from "@/lib/server/admin"
import { applyGlobalApiKeysToProfile, getGlobalApiKeyMap } from "@/lib/server/global-api-keys"
import {
  filterCatalogForUser,
  getCustomModelsByWorkspace,
  getEnabledHostedApiModels,
  getModelPolicies,
  mapCustomModelsToCatalog,
  mapHostedModelsToCatalog,
  fetchOpenRouterCatalog,
  buildModelKey
} from "@/lib/server/model-access"
import { createResponse } from "@/lib/server/server-utils"
import { VALID_ENV_KEYS } from "@/types/valid-keys"

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

  if (process.env[VALID_ENV_KEYS.OPENAI_ORGANIZATION_ID]) {
    ;(merged as any).openai_organization_id =
      process.env[VALID_ENV_KEYS.OPENAI_ORGANIZATION_ID]
  }
  if (process.env[VALID_ENV_KEYS.AZURE_OPENAI_ENDPOINT]) {
    ;(merged as any).azure_openai_endpoint =
      process.env[VALID_ENV_KEYS.AZURE_OPENAI_ENDPOINT]
  }
  if (process.env[VALID_ENV_KEYS.AZURE_GPT_35_TURBO_NAME]) {
    ;(merged as any).azure_openai_35_turbo_id =
      process.env[VALID_ENV_KEYS.AZURE_GPT_35_TURBO_NAME]
  }
  if (process.env[VALID_ENV_KEYS.AZURE_GPT_45_TURBO_NAME]) {
    ;(merged as any).azure_openai_45_turbo_id =
      process.env[VALID_ENV_KEYS.AZURE_GPT_45_TURBO_NAME]
  }
  if (process.env[VALID_ENV_KEYS.AZURE_GPT_45_VISION_NAME]) {
    ;(merged as any).azure_openai_45_vision_id =
      process.env[VALID_ENV_KEYS.AZURE_GPT_45_VISION_NAME]
  }
  if (process.env[VALID_ENV_KEYS.AZURE_EMBEDDINGS_NAME]) {
    ;(merged as any).azure_openai_embeddings_id =
      process.env[VALID_ENV_KEYS.AZURE_EMBEDDINGS_NAME]
  }

  return merged
}

export async function GET(req: Request) {
  try {
    const { user, profile } = await getServerAuthContext()
    const supabaseAdmin = createServiceRoleClient()
    const globalApiKeyMap = await getGlobalApiKeyMap(supabaseAdmin)
    const mergedProfile = withEnvOverrides(
      applyGlobalApiKeysToProfile(profile, globalApiKeyMap)
    )

    const hostedModels = getEnabledHostedApiModels(mergedProfile)
    const openRouterModels = await fetchOpenRouterCatalog(mergedProfile)

    const apiCatalog = [
      ...mapHostedModelsToCatalog(hostedModels, "hosted"),
      ...mapHostedModelsToCatalog(openRouterModels, "openrouter")
    ]

    const url = new URL(req.url)
    const workspaceId = url.searchParams.get("workspaceId")

    let customModels: any[] = []
    if (workspaceId) {
      customModels = await getCustomModelsByWorkspace(supabaseAdmin, workspaceId)
      apiCatalog.push(...mapCustomModelsToCatalog(customModels))
    }

    const modelKeys = [...new Set(apiCatalog.map(item => item.modelKey))]
    const { byKey, allowedUsersByKey } = await getModelPolicies(
      supabaseAdmin,
      modelKeys
    )
    const filteredCatalog = filterCatalogForUser({
      isAdmin: Boolean(profile.is_admin),
      userId: user.id,
      catalog: apiCatalog,
      policyByKey: byKey,
      allowedUsersByKey
    })
    const allowedKeys = new Set(filteredCatalog.map(item => item.modelKey))

    const filteredHostedModels = hostedModels.filter(model =>
      allowedKeys.has(buildModelKey(model.provider, String(model.modelId)))
    )
    const filteredOpenRouterModels = openRouterModels.filter(model =>
      allowedKeys.has(buildModelKey(model.provider, String(model.modelId)))
    )
    const filteredCustomModels = customModels.filter(model =>
      allowedKeys.has(buildModelKey("custom", model.model_id))
    )

    return createResponse(
      {
        hostedModels: filteredHostedModels,
        openRouterModels: filteredOpenRouterModels,
        customModels: filteredCustomModels
      },
      200
    )
  } catch (error: any) {
    return createResponse(
      { message: error.message || "Failed to load available models" },
      500
    )
  }
}

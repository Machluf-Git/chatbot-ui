import { LLM_LIST_MAP } from "@/lib/models/llm/llm-list"
import { Database, Tables } from "@/supabase/types"
import { LLM } from "@/types"
import { SupabaseClient } from "@supabase/supabase-js"

export type ApiModelCatalogItem = {
  modelKey: string
  provider: string
  modelId: string
  modelName: string
  source: "hosted" | "openrouter" | "custom"
  customModelId?: string
}

export function buildModelKey(provider: string, modelId: string) {
  return `${provider.trim().toLowerCase()}:${modelId.trim()}`
}

function hasValue(value: string | null | undefined) {
  return Boolean(value && value.trim())
}

export function getEnabledHostedApiModels(profile: Tables<"profiles">) {
  const providers: string[] = []

  if (profile.use_azure_openai) {
    if (hasValue(profile.azure_openai_api_key)) {
      providers.push("azure")
    }
  } else if (hasValue(profile.openai_api_key)) {
    providers.push("openai")
  }

  if (hasValue(profile.google_gemini_api_key)) providers.push("google")
  if (hasValue(profile.anthropic_api_key)) providers.push("anthropic")
  if (hasValue(profile.mistral_api_key)) providers.push("mistral")
  if (hasValue(profile.groq_api_key)) providers.push("groq")
  if (hasValue(profile.perplexity_api_key)) providers.push("perplexity")

  const hostedModels: LLM[] = []

  for (const provider of providers) {
    const models = LLM_LIST_MAP[provider]
    if (Array.isArray(models)) {
      hostedModels.push(...models)
    }
  }

  return hostedModels
}

export async function fetchOpenRouterCatalog(
  profile: Tables<"profiles">
): Promise<LLM[]> {
  if (!hasValue(profile.openrouter_api_key)) {
    return []
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      signal: controller.signal,
      cache: "no-store"
    })
    clearTimeout(timeoutId)

    if (!response.ok) {
      return []
    }

    const { data } = await response.json()
    return (data || []).map(
      (model: { id: string; name: string }): LLM => ({
        modelId: model.id as any,
        modelName: model.id,
        provider: "openrouter",
        hostedId: model.name,
        platformLink: "https://openrouter.dev",
        imageInput: false
      })
    )
  } catch {
    return []
  }
}

export async function getCustomModelsByWorkspace(
  supabaseAdmin: SupabaseClient<Database>,
  workspaceId: string
) {
  const { data, error } = await (supabaseAdmin as any)
    .from("model_workspaces")
    .select("models(*)")
    .eq("workspace_id", workspaceId)

  if (error) {
    throw new Error(error.message)
  }

  return ((data || [])
    .map((row: any) => row.models)
    .filter(Boolean) ?? []) as Tables<"models">[]
}

export async function getAllCustomModels(
  supabaseAdmin: SupabaseClient<Database>
) {
  const { data, error } = await supabaseAdmin
    .from("models")
    .select("*")
    .order("name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export function mapHostedModelsToCatalog(
  hostedModels: LLM[],
  source: "hosted" | "openrouter"
) {
  return hostedModels.map<ApiModelCatalogItem>(model => ({
    modelKey: buildModelKey(model.provider, String(model.modelId)),
    provider: model.provider,
    modelId: String(model.modelId),
    modelName: model.modelName,
    source
  }))
}

export function mapCustomModelsToCatalog(customModels: Tables<"models">[]) {
  return customModels.map<ApiModelCatalogItem>(model => ({
    modelKey: buildModelKey("custom", model.model_id),
    provider: "custom",
    modelId: model.model_id,
    modelName: model.name,
    source: "custom",
    customModelId: model.id
  }))
}

export async function getModelPolicies(
  supabaseAdmin: SupabaseClient<Database>,
  modelKeys: string[]
) {
  if (modelKeys.length === 0) {
    return {
      byKey: new Map<string, { isGlobal: boolean }>(),
      allowedUsersByKey: new Map<string, string[]>()
    }
  }

  const { data: policies, error: policyError } = await (supabaseAdmin as any)
    .from("app_model_access")
    .select("model_key, is_global")
    .in("model_key", modelKeys)

  if (policyError) {
    throw new Error(policyError.message)
  }

  const { data: userRows, error: userError } = await (supabaseAdmin as any)
    .from("app_model_access_users")
    .select("model_key, user_id")
    .in("model_key", modelKeys)

  if (userError) {
    throw new Error(userError.message)
  }

  const byKey = new Map<string, { isGlobal: boolean }>()
  for (const row of policies || []) {
    byKey.set(row.model_key, { isGlobal: Boolean(row.is_global) })
  }

  const allowedUsersByKey = new Map<string, string[]>()
  for (const row of userRows || []) {
    const current = allowedUsersByKey.get(row.model_key) || []
    current.push(row.user_id)
    allowedUsersByKey.set(row.model_key, current)
  }

  return { byKey, allowedUsersByKey }
}

export function filterCatalogForUser(args: {
  isAdmin: boolean
  userId: string
  catalog: ApiModelCatalogItem[]
  policyByKey: Map<string, { isGlobal: boolean }>
  allowedUsersByKey: Map<string, string[]>
}) {
  const { isAdmin, userId, catalog, policyByKey, allowedUsersByKey } = args

  if (isAdmin) {
    return catalog
  }

  return catalog.filter(item => {
    const policy = policyByKey.get(item.modelKey)
    if (!policy) {
      return false
    }

    if (policy.isGlobal) {
      return true
    }

    const allowedUsers = allowedUsersByKey.get(item.modelKey) || []
    return allowedUsers.includes(userId)
  })
}

export function isModelAllowedForUser(args: {
  isAdmin: boolean
  userId: string
  modelKey: string
  policyByKey: Map<string, { isGlobal: boolean }>
  allowedUsersByKey: Map<string, string[]>
}) {
  const { isAdmin, userId, modelKey, policyByKey, allowedUsersByKey } = args

  if (isAdmin) {
    return true
  }

  const policy = policyByKey.get(modelKey)
  if (!policy) {
    return false
  }

  if (policy.isGlobal) {
    return true
  }

  return (allowedUsersByKey.get(modelKey) || []).includes(userId)
}

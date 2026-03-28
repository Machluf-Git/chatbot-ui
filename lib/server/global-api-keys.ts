import { Database, Tables } from "@/supabase/types"
import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { SupabaseClient } from "@supabase/supabase-js"

const GLOBAL_PROFILE_FIELDS = [
  "openai_api_key",
  "openai_organization_id",
  "azure_openai_api_key",
  "azure_openai_endpoint",
  "azure_openai_35_turbo_id",
  "azure_openai_45_turbo_id",
  "azure_openai_45_vision_id",
  "azure_openai_embeddings_id",
  "use_azure_openai",
  "anthropic_api_key",
  "google_gemini_api_key",
  "mistral_api_key",
  "groq_api_key",
  "perplexity_api_key",
  "openrouter_api_key"
] as const

export type GlobalApiKeyField = (typeof GLOBAL_PROFILE_FIELDS)[number]

export const SENSITIVE_GLOBAL_API_KEY_FIELDS = new Set<GlobalApiKeyField>([
  "openai_api_key",
  "openai_organization_id",
  "azure_openai_api_key",
  "anthropic_api_key",
  "google_gemini_api_key",
  "mistral_api_key",
  "groq_api_key",
  "perplexity_api_key",
  "openrouter_api_key"
])

export function getGlobalApiKeyFields() {
  return [...GLOBAL_PROFILE_FIELDS]
}

export async function getGlobalApiKeyMap(
  supabaseAdmin: SupabaseClient<Database>
) {
  const { data, error } = await supabaseAdmin
    .from("app_api_keys")
    .select("provider, api_key")

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).reduce<Record<string, string>>((acc, row) => {
    acc[row.provider] = row.api_key
    return acc
  }, {})
}

export function applyGlobalApiKeysToProfile(
  profile: Tables<"profiles">,
  globalApiKeyMap: Record<string, string>
) {
  const profileWithGlobalApiKeys = { ...profile }

  for (const field of GLOBAL_PROFILE_FIELDS) {
    const globalValue = globalApiKeyMap[field]

    if (globalValue === undefined || globalValue === "") {
      continue
    }

    if (field === "use_azure_openai") {
      ;(profileWithGlobalApiKeys as any)[field] = globalValue === "true"
      continue
    }

    ;(profileWithGlobalApiKeys as any)[field] = globalValue
  }

  return profileWithGlobalApiKeys
}

export function getGlobalProviderAvailability(
  globalApiKeyMap: Record<string, string>
) {
  return {
    azure: Boolean(globalApiKeyMap.azure_openai_api_key),
    openai: Boolean(globalApiKeyMap.openai_api_key),
    google: Boolean(globalApiKeyMap.google_gemini_api_key),
    anthropic: Boolean(globalApiKeyMap.anthropic_api_key),
    mistral: Boolean(globalApiKeyMap.mistral_api_key),
    groq: Boolean(globalApiKeyMap.groq_api_key),
    perplexity: Boolean(globalApiKeyMap.perplexity_api_key),
    openrouter: Boolean(globalApiKeyMap.openrouter_api_key),
    openai_organization_id: Boolean(globalApiKeyMap.openai_organization_id),
    azure_openai_endpoint: Boolean(globalApiKeyMap.azure_openai_endpoint),
    azure_gpt_35_turbo_name: Boolean(globalApiKeyMap.azure_openai_35_turbo_id),
    azure_gpt_45_vision_name: Boolean(
      globalApiKeyMap.azure_openai_45_vision_id
    ),
    azure_gpt_45_turbo_name: Boolean(globalApiKeyMap.azure_openai_45_turbo_id),
    azure_embeddings_name: Boolean(globalApiKeyMap.azure_openai_embeddings_id)
  }
}

export function getEnvProviderAvailability() {
  return {
    azure: Boolean(process.env[VALID_ENV_KEYS.AZURE_OPENAI_API_KEY]),
    openai: Boolean(process.env[VALID_ENV_KEYS.OPENAI_API_KEY]),
    google: Boolean(process.env[VALID_ENV_KEYS.GOOGLE_GEMINI_API_KEY]),
    anthropic: Boolean(process.env[VALID_ENV_KEYS.ANTHROPIC_API_KEY]),
    mistral: Boolean(process.env[VALID_ENV_KEYS.MISTRAL_API_KEY]),
    groq: Boolean(process.env[VALID_ENV_KEYS.GROQ_API_KEY]),
    perplexity: Boolean(process.env[VALID_ENV_KEYS.PERPLEXITY_API_KEY]),
    openrouter: Boolean(process.env[VALID_ENV_KEYS.OPENROUTER_API_KEY]),
    openai_organization_id: Boolean(
      process.env[VALID_ENV_KEYS.OPENAI_ORGANIZATION_ID]
    ),
    azure_openai_endpoint: Boolean(
      process.env[VALID_ENV_KEYS.AZURE_OPENAI_ENDPOINT]
    ),
    azure_gpt_35_turbo_name: Boolean(
      process.env[VALID_ENV_KEYS.AZURE_GPT_35_TURBO_NAME]
    ),
    azure_gpt_45_vision_name: Boolean(
      process.env[VALID_ENV_KEYS.AZURE_GPT_45_VISION_NAME]
    ),
    azure_gpt_45_turbo_name: Boolean(
      process.env[VALID_ENV_KEYS.AZURE_GPT_45_TURBO_NAME]
    ),
    azure_embeddings_name: Boolean(
      process.env[VALID_ENV_KEYS.AZURE_EMBEDDINGS_NAME]
    )
  }
}

export function maskApiKey(value: string) {
  if (!value) return ""
  if (value.length <= 4) return "****"
  return `${value.slice(0, 2)}${"*".repeat(Math.min(value.length - 4, 12))}${value.slice(-2)}`
}

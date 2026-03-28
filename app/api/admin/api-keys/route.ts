import { requireAdmin, createServiceRoleClient } from "@/lib/server/admin"
import {
  getGlobalApiKeyFields,
  getGlobalApiKeyMap,
  maskApiKey,
  SENSITIVE_GLOBAL_API_KEY_FIELDS,
  type GlobalApiKeyField
} from "@/lib/server/global-api-keys"
import { createResponse } from "@/lib/server/server-utils"

type ApiKeyEntryResponse = {
  configured: boolean
  maskedValue: string | null
  value: string | null
  sensitive: boolean
}

export async function GET() {
  try {
    await requireAdmin()
    const supabaseAdmin = createServiceRoleClient()
    const globalApiKeyMap = await getGlobalApiKeyMap(supabaseAdmin)

    const entries = getGlobalApiKeyFields().reduce<
      Record<string, ApiKeyEntryResponse>
    >((acc, field) => {
      const rawValue = globalApiKeyMap[field]
      const hasValue = typeof rawValue === "string" && rawValue.length > 0
      const isSensitive = SENSITIVE_GLOBAL_API_KEY_FIELDS.has(
        field as GlobalApiKeyField
      )

      acc[field] = {
        configured: hasValue,
        maskedValue: hasValue && isSensitive ? maskApiKey(rawValue) : null,
        value: hasValue && !isSensitive ? rawValue : null,
        sensitive: isSensitive
      }
      return acc
    }, {})

    return createResponse({ entries }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to load API keys" },
      500
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { user } = await requireAdmin()
    const json = await req.json()
    const updates = (json?.updates || {}) as Record<string, string | boolean>

    const allowedFields = new Set(getGlobalApiKeyFields())
    const supabaseAdmin = createServiceRoleClient()

    const fieldsToUpsert: {
      provider: string
      api_key: string
      updated_by: string
    }[] = []
    const fieldsToDelete: string[] = []

    for (const [field, value] of Object.entries(updates)) {
      if (!allowedFields.has(field as GlobalApiKeyField)) {
        continue
      }

      const normalized =
        typeof value === "boolean" ? String(value) : String(value || "").trim()

      if (normalized) {
        fieldsToUpsert.push({
          provider: field,
          api_key: normalized,
          updated_by: user.id
        })
      } else {
        fieldsToDelete.push(field)
      }
    }

    if (fieldsToUpsert.length > 0) {
      const { error } = await supabaseAdmin
        .from("app_api_keys")
        .upsert(fieldsToUpsert, { onConflict: "provider" })

      if (error) {
        throw new Error(error.message)
      }
    }

    if (fieldsToDelete.length > 0) {
      const { error } = await supabaseAdmin
        .from("app_api_keys")
        .delete()
        .in("provider", fieldsToDelete)

      if (error) {
        throw new Error(error.message)
      }
    }

    return createResponse({ success: true }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to update API keys" },
      500
    )
  }
}

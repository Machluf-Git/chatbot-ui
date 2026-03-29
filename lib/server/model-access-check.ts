import { createServiceRoleClient, getServerAuthContext } from "@/lib/server/admin"
import {
  buildModelKey,
  getModelPolicies,
  isModelAllowedForUser
} from "@/lib/server/model-access"

export async function ensureCurrentUserCanUseModel(
  provider: string,
  modelId: string
) {
  const { user, profile } = await getServerAuthContext()

  if (profile.is_admin) {
    return
  }

  const modelKey = buildModelKey(provider, modelId)
  const supabaseAdmin = createServiceRoleClient()
  const { byKey, allowedUsersByKey } = await getModelPolicies(supabaseAdmin, [
    modelKey
  ])

  const allowed = isModelAllowedForUser({
    isAdmin: false,
    userId: user.id,
    modelKey,
    policyByKey: byKey,
    allowedUsersByKey
  })

  if (!allowed) {
    throw new Error("Forbidden")
  }
}

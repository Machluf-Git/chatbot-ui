import { createServiceRoleClient } from "@/lib/server/admin"
import {
  getEnvProviderAvailability,
  getGlobalApiKeyMap,
  getGlobalProviderAvailability
} from "@/lib/server/global-api-keys"
import { createResponse } from "@/lib/server/server-utils"

export async function GET() {
  try {
    const supabaseAdmin = createServiceRoleClient()
    const globalApiKeyMap = await getGlobalApiKeyMap(supabaseAdmin)

    const envAvailability = getEnvProviderAvailability()
    const globalAvailability = getGlobalProviderAvailability(globalApiKeyMap)

    const isUsingEnvKeyMap = Object.keys(envAvailability).reduce<
      Record<string, boolean>
    >((acc, provider) => {
      acc[provider] =
        envAvailability[provider as keyof typeof envAvailability] ||
        globalAvailability[provider as keyof typeof globalAvailability]
      return acc
    }, {})

    return createResponse({ isUsingEnvKeyMap }, 200)
  } catch (error: any) {
    return createResponse(
      { message: error.message || "Failed to load key configuration" },
      500
    )
  }
}

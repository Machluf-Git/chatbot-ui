import { createServiceRoleClient, requireAdmin } from "@/lib/server/admin"
import { createResponse } from "@/lib/server/server-utils"

type UpdateUserRolePayload = {
  userId: string
  isAdmin: boolean
}

export async function GET() {
  try {
    await requireAdmin()
    const supabaseAdmin = createServiceRoleClient()

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, user_id, username, display_name, is_admin, created_at")
      .order("username", { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return createResponse({ users: data || [] }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to load users" },
      500
    )
  }
}

export async function PUT(req: Request) {
  try {
    const { user } = await requireAdmin()
    const body = (await req.json()) as UpdateUserRolePayload

    const userId = String(body?.userId || "").trim()
    const isAdmin = Boolean(body?.isAdmin)

    if (!userId) {
      return createResponse({ message: "Invalid user id" }, 400)
    }

    if (user.id === userId && !isAdmin) {
      return createResponse(
        { message: "You cannot remove your own admin role" },
        400
      )
    }

    const supabaseAdmin = createServiceRoleClient()
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update({ is_admin: isAdmin })
      .eq("user_id", userId)
      .select("id, user_id, username, display_name, is_admin, created_at")
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return createResponse({ user: data }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to update user role" },
      500
    )
  }
}

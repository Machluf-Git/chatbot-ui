import {
  getWorkflowApiErrorResponse,
  getRunForUser,
  getWorkflowRunSteps
} from "@/lib/server/workflows"
import { createResponse } from "@/lib/server/server-utils"

type RouteContext = {
  params: {
    runId: string
  }
}

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const runId = String(params.runId || "").trim()

    if (!runId) {
      return createResponse({ message: "runId is required" }, 400)
    }

    const { run, supabaseAdmin } = await getRunForUser(runId)
    const steps = await getWorkflowRunSteps(supabaseAdmin, run.id)

    const { data: approvals, error: approvalsError } = await supabaseAdmin
      .from("workflow_approvals")
      .select("*")
      .eq("run_id", run.id)
      .order("requested_at", { ascending: true })

    if (approvalsError) {
      throw new Error(approvalsError.message)
    }

    const { data: events, error: eventsError } = await supabaseAdmin
      .from("workflow_events")
      .select("*")
      .eq("run_id", run.id)
      .order("occurred_at", { ascending: true })

    if (eventsError) {
      throw new Error(eventsError.message)
    }

    return createResponse(
      {
        run,
        steps,
        approvals: approvals || [],
        events: events || []
      },
      200
    )
  } catch (error: any) {
    const mapped = getWorkflowApiErrorResponse(error)
    return createResponse(
      { message: mapped.message || "Failed to load workflow run" },
      mapped.status
    )
  }
}

import {
  getTemplateForUser,
  getWorkflowTemplateSteps,
  normalizeRunCreatePayload,
  requireWorkspaceOwner,
  WorkflowRunCreatePayload
} from "@/lib/server/workflows"
import { createResponse } from "@/lib/server/server-utils"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = String(searchParams.get("workspaceId") || "").trim()

    if (!workspaceId) {
      return createResponse({ message: "workspaceId is required" }, 400)
    }

    const { supabaseAdmin } = await requireWorkspaceOwner(workspaceId)

    const { data: runs, error } = await supabaseAdmin
      .from("workflow_runs")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return createResponse({ runs: runs || [] }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to load workflow runs" },
      500
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WorkflowRunCreatePayload
    const payload = normalizeRunCreatePayload(body)
    const { user, template, workspace, supabaseAdmin } =
      await getTemplateForUser(payload.templateId)
    const templateSteps = await getWorkflowTemplateSteps(
      supabaseAdmin,
      template.id
    )

    if (template.status === "archived") {
      return createResponse(
        { message: "Archived workflow templates cannot be run" },
        400
      )
    }

    const firstStep = templateSteps[0] || null

    const { data: run, error } = await supabaseAdmin
      .from("workflow_runs")
      .insert({
        template_id: template.id,
        template_version: template.version,
        template_snapshot: {
          template,
          steps: templateSteps
        },
        workspace_id: workspace.id,
        status: "queued",
        trigger_source: payload.triggerSource,
        trigger_ref: payload.triggerRef,
        current_step_key: firstStep?.step_key ?? null,
        input_payload: payload.inputPayload,
        context_payload: {},
        created_by: user.id
      })
      .select("*")
      .single()

    if (error || !run) {
      throw new Error(error?.message || "Failed to create workflow run")
    }

    if (templateSteps.length > 0) {
      const { error: stepsError } = await supabaseAdmin
        .from("workflow_run_steps")
        .insert(
          templateSteps.map(step => ({
            run_id: run.id,
            template_step_id: step.id,
            step_key: step.step_key,
            attempt: 1,
            status: "pending",
            input_payload: {},
            output_payload: null
          }))
        )

      if (stepsError) {
        throw new Error(stepsError.message)
      }
    }

    const { error: eventError } = await supabaseAdmin.from("workflow_events").insert([
      {
        run_id: run.id,
        run_step_id: null,
        event_type: "run_created",
        level: "info",
        message: `Workflow run created from template ${template.name}`,
        payload: {
          templateId: template.id,
          templateVersion: template.version,
          triggerSource: payload.triggerSource
        },
        emitted_by_type: "user",
        emitted_by_id: user.id
      }
    ])

    if (eventError) {
      throw new Error(eventError.message)
    }

    return createResponse({ run }, 201)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    const status = error.message === "Workflow template not found" ? 404 : 500

    return createResponse(
      { message: error.message || "Failed to create workflow run" },
      status
    )
  }
}

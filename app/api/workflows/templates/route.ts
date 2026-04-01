import {
  NormalizedWorkflowTemplateStepInput,
  normalizeTemplatePayload,
  requireWorkspaceOwner,
  WorkflowTemplatePayload
} from "@/lib/server/workflows"
import { createResponse } from "@/lib/server/server-utils"
import { Json } from "@/supabase/types"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const workspaceId = String(searchParams.get("workspaceId") || "").trim()

    if (!workspaceId) {
      return createResponse({ message: "workspaceId is required" }, 400)
    }

    const { supabaseAdmin } = await requireWorkspaceOwner(workspaceId)

    const { data: templates, error } = await supabaseAdmin
      .from("workflow_templates")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    const templateIds = (templates || []).map(template => template.id)
    const { data: steps, error: stepsError } =
      templateIds.length > 0
        ? await supabaseAdmin
            .from("workflow_template_steps")
            .select("*")
            .in("template_id", templateIds)
            .order("step_order", { ascending: true })
        : { data: [], error: null }

    if (stepsError) {
      throw new Error(stepsError.message)
    }

    const stepsByTemplateId = new Map<string, typeof steps>()
    for (const step of steps || []) {
      const current = stepsByTemplateId.get(step.template_id) || []
      current.push(step)
      stepsByTemplateId.set(step.template_id, current)
    }

    return createResponse(
      {
        templates: (templates || []).map(template => ({
          ...template,
          steps: stepsByTemplateId.get(template.id) || []
        }))
      },
      200
    )
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to load workflow templates" },
      500
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as WorkflowTemplatePayload
    const payload = normalizeTemplatePayload(body)
    const workspaceId = String(payload.workspaceId)
    const steps = payload.steps as NormalizedWorkflowTemplateStepInput[]

    const { user, supabaseAdmin } = await requireWorkspaceOwner(workspaceId)

    const insertPayload = {
      workspace_id: workspaceId,
      name: String(payload.name),
      description: String(payload.description ?? ""),
      version: Number(payload.version ?? 1),
      status: String(payload.status ?? "draft"),
      trigger_type: String(payload.triggerType),
      trigger_config: (payload.triggerConfig ?? {}) as Json,
      input_schema: (payload.inputSchema ?? {}) as Json,
      is_active: Boolean(payload.isActive ?? true),
      created_by: user.id,
      updated_by: user.id
    }

    const { data: template, error } = await supabaseAdmin
      .from("workflow_templates")
      .insert(insertPayload)
      .select("*")
      .single()

    if (error || !template) {
      throw new Error(error?.message || "Failed to create workflow template")
    }

    const { data: insertedSteps, error: stepsError } = await supabaseAdmin
      .from("workflow_template_steps")
      .insert(
        steps.map(step => ({
          template_id: template.id,
          step_key: step.stepKey,
          step_order: step.stepOrder,
          step_type: step.stepType,
          title: step.title,
          config: step.config,
          input_mapping: step.inputMapping,
          output_schema: step.outputSchema,
          on_success_step_key: step.onSuccessStepKey,
          on_failure_step_key: step.onFailureStepKey,
          retry_max: step.retryMax,
          retry_backoff_seconds: step.retryBackoffSeconds,
          timeout_seconds: step.timeoutSeconds,
          is_required: step.isRequired
        }))
      )
      .select("*")

    if (stepsError) {
      throw new Error(stepsError.message)
    }

    return createResponse(
      {
        template: {
          ...template,
          steps: insertedSteps || []
        }
      },
      201
    )
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    return createResponse(
      { message: error.message || "Failed to create workflow template" },
      500
    )
  }
}

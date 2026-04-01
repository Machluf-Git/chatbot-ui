import {
  getTemplateForUser,
  getWorkflowTemplateSteps,
  NormalizedWorkflowTemplateStepInput,
  normalizeTemplatePayload,
  WorkflowTemplateUpdatePayload
} from "@/lib/server/workflows"
import { Json } from "@/supabase/types"
import { createResponse } from "@/lib/server/server-utils"

type RouteContext = {
  params: {
    templateId: string
  }
}

export async function GET(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const templateId = String(params.templateId || "").trim()

    if (!templateId) {
      return createResponse({ message: "templateId is required" }, 400)
    }

    const { template, supabaseAdmin } = await getTemplateForUser(templateId)
    const steps = await getWorkflowTemplateSteps(supabaseAdmin, templateId)

    return createResponse({ template: { ...template, steps } }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    const status = error.message === "Workflow template not found" ? 404 : 500

    return createResponse(
      { message: error.message || "Failed to load workflow template" },
      status
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: RouteContext
) {
  try {
    const templateId = String(params.templateId || "").trim()

    if (!templateId) {
      return createResponse({ message: "templateId is required" }, 400)
    }

    const body = (await req.json()) as WorkflowTemplateUpdatePayload
    const payload = normalizeTemplatePayload(body)
    const { user, template, supabaseAdmin } = await getTemplateForUser(templateId)
    const normalizedSteps = payload.steps as
      | NormalizedWorkflowTemplateStepInput[]
      | undefined

    const updatePayload: Record<string, unknown> = {
      updated_by: user.id
    }

    if (payload.name !== undefined) updatePayload.name = payload.name
    if (payload.description !== undefined) {
      updatePayload.description = payload.description
    }
    if (payload.version !== undefined) updatePayload.version = payload.version
    if (payload.status !== undefined) updatePayload.status = payload.status
    if (payload.triggerType !== undefined) {
      updatePayload.trigger_type = payload.triggerType
    }
    if (payload.triggerConfig !== undefined) {
      updatePayload.trigger_config = payload.triggerConfig as Json
    }
    if (payload.inputSchema !== undefined) {
      updatePayload.input_schema = payload.inputSchema as Json
    }
    if (payload.isActive !== undefined) {
      updatePayload.is_active = payload.isActive
    }

    const { data: updatedTemplate, error } = await supabaseAdmin
      .from("workflow_templates")
      .update(updatePayload)
      .eq("id", template.id)
      .select("*")
      .single()

    if (error || !updatedTemplate) {
      throw new Error(error?.message || "Failed to update workflow template")
    }

    if (normalizedSteps !== undefined) {
      const { error: deleteError } = await supabaseAdmin
        .from("workflow_template_steps")
        .delete()
        .eq("template_id", template.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      if (normalizedSteps.length > 0) {
        const { error: insertError } = await supabaseAdmin
          .from("workflow_template_steps")
          .insert(
            normalizedSteps.map(step => ({
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

        if (insertError) {
          throw new Error(insertError.message)
        }
      }
    }

    const steps = await getWorkflowTemplateSteps(supabaseAdmin, template.id)

    return createResponse(
      { template: { ...updatedTemplate, steps } },
      200
    )
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    const status = error.message === "Workflow template not found" ? 404 : 500

    return createResponse(
      { message: error.message || "Failed to update workflow template" },
      status
    )
  }
}

export async function DELETE(
  _req: Request,
  { params }: RouteContext
) {
  try {
    const templateId = String(params.templateId || "").trim()

    if (!templateId) {
      return createResponse({ message: "templateId is required" }, 400)
    }

    const { template, supabaseAdmin } = await getTemplateForUser(templateId)

    const { error } = await supabaseAdmin
      .from("workflow_templates")
      .delete()
      .eq("id", template.id)

    if (error) {
      throw new Error(error.message)
    }

    return createResponse({ success: true }, 200)
  } catch (error: any) {
    if (error.message === "Forbidden") {
      return createResponse({ message: "Forbidden" }, 403)
    }

    const status = error.message === "Workflow template not found" ? 404 : 500

    return createResponse(
      { message: error.message || "Failed to delete workflow template" },
      status
    )
  }
}

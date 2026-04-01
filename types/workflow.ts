import { Json, Tables } from "@/supabase/types"

export type WorkflowTemplateStep =
  Tables<"workflow_template_steps">

export type WorkflowTemplate = Tables<"workflow_templates"> & {
  steps: WorkflowTemplateStep[]
}

export type WorkflowRun = Tables<"workflow_runs">

export type WorkflowRunStep = Tables<"workflow_run_steps">

export type WorkflowApproval = Tables<"workflow_approvals">

export type WorkflowEvent = Tables<"workflow_events">

export type WorkflowRunDetail = {
  run: WorkflowRun
  steps: WorkflowRunStep[]
  approvals: WorkflowApproval[]
  events: WorkflowEvent[]
}

export type WorkflowTemplateStepInput = {
  stepKey: string
  title: string
  stepType: WorkflowTemplateStep["step_type"]
  timeoutSeconds: number
  retryMax: number
  retryBackoffSeconds: number
  isRequired: boolean
  onSuccessStepKey: string
  onFailureStepKey: string
  config: string
  inputMapping: string
  outputSchema: string
}

export type WorkflowTemplateInput = {
  name: string
  description: string
  status: WorkflowTemplate["status"]
  triggerType: WorkflowTemplate["trigger_type"]
  isActive: boolean
  triggerConfig: string
  inputSchema: string
  steps: WorkflowTemplateStepInput[]
}

export type WorkflowRunInput = {
  inputPayload: string
  triggerRef: string
}

export const DEFAULT_WORKFLOW_STEP: WorkflowTemplateStepInput = {
  stepKey: "step_1",
  title: "New Step",
  stepType: "tool",
  timeoutSeconds: 300,
  retryMax: 0,
  retryBackoffSeconds: 0,
  isRequired: true,
  onSuccessStepKey: "",
  onFailureStepKey: "",
  config: "{}",
  inputMapping: "{}",
  outputSchema: "{}"
}

export const DEFAULT_WORKFLOW_TEMPLATE_INPUT: WorkflowTemplateInput = {
  name: "",
  description: "",
  status: "draft",
  triggerType: "manual",
  isActive: true,
  triggerConfig: "{}",
  inputSchema: "{}",
  steps: [{ ...DEFAULT_WORKFLOW_STEP }]
}

export const DEFAULT_WORKFLOW_RUN_INPUT: WorkflowRunInput = {
  inputPayload: "{}",
  triggerRef: ""
}

function prettyJson(value: Json | null | undefined) {
  if (value === null || value === undefined) {
    return "{}"
  }

  return JSON.stringify(value, null, 2)
}

export function workflowTemplateToInput(
  template: WorkflowTemplate
): WorkflowTemplateInput {
  return {
    name: template.name,
    description: template.description || "",
    status: template.status,
    triggerType: template.trigger_type,
    isActive: template.is_active,
    triggerConfig: prettyJson(template.trigger_config),
    inputSchema: prettyJson(template.input_schema),
    steps:
      template.steps.length > 0
        ? template.steps.map(step => ({
            stepKey: step.step_key,
            title: step.title,
            stepType: step.step_type,
            timeoutSeconds: step.timeout_seconds,
            retryMax: step.retry_max,
            retryBackoffSeconds: step.retry_backoff_seconds,
            isRequired: step.is_required,
            onSuccessStepKey: step.on_success_step_key || "",
            onFailureStepKey: step.on_failure_step_key || "",
            config: prettyJson(step.config),
            inputMapping: prettyJson(step.input_mapping),
            outputSchema: prettyJson(step.output_schema)
          }))
        : [{ ...DEFAULT_WORKFLOW_STEP }]
  }
}

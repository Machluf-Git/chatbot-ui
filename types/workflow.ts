import { Tables } from "@/supabase/types"

export type WorkflowTemplateStep = Tables<"workflow_template_steps">

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

export type WorkflowInputFieldType =
  | "short_text"
  | "long_text"
  | "number"
  | "boolean"
  | "date"

export type WorkflowScheduleFrequency = "daily" | "weekly"

export type WorkflowDelayUnit = "minutes" | "hours"

export type WorkflowFieldInputSourceType =
  | "workflow_field"
  | "previous_step"
  | "fixed_text"

export type WorkflowInputField = {
  id: string
  key: string
  label: string
  type: WorkflowInputFieldType
  required: boolean
  placeholder: string
  helpText: string
}

export type GuidedTriggerConfig = {
  type: "manual" | "schedule"
  scheduleFrequency: WorkflowScheduleFrequency
  scheduleTime: string
  scheduleTimezone: string
  scheduleDaysOfWeek: string[]
}

export type GuidedWorkflowStep = {
  prompt: string
  modelId: string
  useWorkspaceDefaultModel: boolean
  outputKey: string
  toolId: string
  inputSourceType: WorkflowFieldInputSourceType
  inputFieldKey: string
  inputStepKey: string
  inputFixedText: string
  approvalInstructions: string
  approverLabel: string
  delayDuration: number
  delayUnit: WorkflowDelayUnit
  endSummary: string
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
  rawConfig: string
  rawInputMapping: string
  rawOutputSchema: string
  guided: GuidedWorkflowStep
}

export type WorkflowTemplateInput = {
  name: string
  description: string
  status: WorkflowTemplate["status"]
  triggerType: WorkflowTemplate["trigger_type"]
  isActive: boolean
  rawTriggerConfig: string
  rawInputSchema: string
  inputFields: WorkflowInputField[]
  guidedTrigger: GuidedTriggerConfig
  steps: WorkflowTemplateStepInput[]
  editorMode: "guided" | "raw"
  supportsGuidedMode: boolean
  unsupportedReason: string | null
}

export type WorkflowRunInput = {
  triggerRef: string
  rawInputPayload: string
  fieldValues: Record<string, string | boolean>
  editorMode: "guided" | "raw"
}

export const WORKFLOW_WEEKDAY_OPTIONS = [
  { value: "sun", label: "Sun" },
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" }
] as const

export const DEFAULT_WORKFLOW_INPUT_FIELD: WorkflowInputField = {
  id: "field_1",
  key: "field_1",
  label: "New field",
  type: "short_text",
  required: false,
  placeholder: "",
  helpText: ""
}

export const DEFAULT_GUIDED_TRIGGER_CONFIG: GuidedTriggerConfig = {
  type: "manual",
  scheduleFrequency: "daily",
  scheduleTime: "09:00",
  scheduleTimezone: "UTC",
  scheduleDaysOfWeek: ["mon"]
}

export const DEFAULT_GUIDED_WORKFLOW_STEP: GuidedWorkflowStep = {
  prompt: "",
  modelId: "",
  useWorkspaceDefaultModel: true,
  outputKey: "",
  toolId: "",
  inputSourceType: "workflow_field",
  inputFieldKey: "",
  inputStepKey: "",
  inputFixedText: "",
  approvalInstructions: "",
  approverLabel: "Workspace owner",
  delayDuration: 5,
  delayUnit: "minutes",
  endSummary: ""
}

export const DEFAULT_WORKFLOW_STEP: WorkflowTemplateStepInput = {
  stepKey: "step_1",
  title: "AI Step",
  stepType: "llm",
  timeoutSeconds: 300,
  retryMax: 0,
  retryBackoffSeconds: 0,
  isRequired: true,
  onSuccessStepKey: "",
  onFailureStepKey: "",
  rawConfig: "{}",
  rawInputMapping: "{}",
  rawOutputSchema: "{}",
  guided: { ...DEFAULT_GUIDED_WORKFLOW_STEP }
}

export const DEFAULT_WORKFLOW_TEMPLATE_INPUT: WorkflowTemplateInput = {
  name: "",
  description: "",
  status: "draft",
  triggerType: "manual",
  isActive: true,
  rawTriggerConfig: "{}",
  rawInputSchema: "{}",
  inputFields: [],
  guidedTrigger: { ...DEFAULT_GUIDED_TRIGGER_CONFIG },
  steps: [
    { ...DEFAULT_WORKFLOW_STEP, guided: { ...DEFAULT_GUIDED_WORKFLOW_STEP } }
  ],
  editorMode: "guided",
  supportsGuidedMode: true,
  unsupportedReason: null
}

export const DEFAULT_WORKFLOW_RUN_INPUT: WorkflowRunInput = {
  triggerRef: "",
  rawInputPayload: "{}",
  fieldValues: {},
  editorMode: "guided"
}

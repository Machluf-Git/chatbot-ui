import { Json } from "@/supabase/types"
import {
  DEFAULT_GUIDED_TRIGGER_CONFIG,
  DEFAULT_GUIDED_WORKFLOW_STEP,
  DEFAULT_WORKFLOW_INPUT_FIELD,
  DEFAULT_WORKFLOW_RUN_INPUT,
  DEFAULT_WORKFLOW_STEP,
  DEFAULT_WORKFLOW_TEMPLATE_INPUT,
  GuidedTriggerConfig,
  GuidedWorkflowStep,
  WorkflowInputField,
  WorkflowRunInput,
  WorkflowTemplate,
  WorkflowTemplateInput,
  WorkflowTemplateStep,
  WorkflowTemplateStepInput
} from "@/types"

const GUIDED_STEP_TYPES = new Set(["llm", "tool", "approval", "delay", "end"])
const INPUT_FIELD_TYPES = new Set([
  "short_text",
  "long_text",
  "number",
  "boolean",
  "date"
])
const WEEKDAY_VALUES = new Set([
  "sun",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat"
])

export type SerializedWorkflowStepInput = {
  stepKey: string
  stepOrder: number
  stepType: WorkflowTemplateStep["step_type"]
  title: string
  timeoutSeconds: number
  retryMax: number
  retryBackoffSeconds: number
  isRequired: boolean
  onSuccessStepKey: string | null
  onFailureStepKey: string | null
  config: Json
  inputMapping: Json
  outputSchema: Json
}

export type SerializedWorkflowTemplateInput = {
  name: string
  description: string
  status: WorkflowTemplate["status"]
  triggerType: WorkflowTemplate["trigger_type"]
  isActive: boolean
  triggerConfig: Json
  inputSchema: Json
  steps: SerializedWorkflowStepInput[]
}

function createUniqueId(prefix: string, index: number) {
  try {
    return `${prefix}_${crypto.randomUUID()}`
  } catch {
    return `${prefix}_${Date.now()}_${index}`
  }
}

function getDefaultTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
  } catch {
    return "UTC"
  }
}

function prettyJson(value: Json | null | undefined) {
  if (value === null || value === undefined) {
    return "{}"
  }

  return JSON.stringify(value, null, 2)
}

function parseJsonString(raw: string, label: string) {
  try {
    return JSON.parse(raw || "{}") as Json
  } catch {
    throw new Error(`${label} must be valid JSON`)
  }
}

function isPlainObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function asJsonObject(
  value: Json | unknown
): Record<string, Json | undefined> | null {
  if (!isPlainObject(value)) {
    return null
  }

  return value as Record<string, Json | undefined>
}

function isEmptyObject(value: unknown) {
  return isPlainObject(value) && Object.keys(value).length === 0
}

export function slugifyWorkflowKey(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  return normalized || fallback
}

export function cloneWorkflowInput(
  input: WorkflowTemplateInput
): WorkflowTemplateInput {
  return {
    ...input,
    guidedTrigger: {
      ...input.guidedTrigger,
      scheduleDaysOfWeek: [...input.guidedTrigger.scheduleDaysOfWeek]
    },
    inputFields: input.inputFields.map(field => ({ ...field })),
    steps: input.steps.map(step => ({
      ...step,
      guided: {
        ...step.guided
      }
    }))
  }
}

export function cloneWorkflowRunInput(
  input: WorkflowRunInput
): WorkflowRunInput {
  return {
    ...input,
    fieldValues: { ...input.fieldValues }
  }
}

export function createEmptyWorkflowInput(): WorkflowTemplateInput {
  return {
    ...DEFAULT_WORKFLOW_TEMPLATE_INPUT,
    rawTriggerConfig: "{}",
    rawInputSchema: "{}",
    guidedTrigger: {
      ...DEFAULT_GUIDED_TRIGGER_CONFIG,
      scheduleTimezone: getDefaultTimezone()
    },
    inputFields: [],
    steps: [createEmptyWorkflowStep(0, "llm")],
    supportsGuidedMode: true,
    unsupportedReason: null,
    editorMode: "guided"
  }
}

export function createEmptyInputField(index: number): WorkflowInputField {
  return {
    ...DEFAULT_WORKFLOW_INPUT_FIELD,
    id: createUniqueId("workflow_field", index),
    key: `field_${index + 1}`,
    label: `Field ${index + 1}`
  }
}

export function createStepKey(index: number) {
  return `step_${index + 1}`
}

export function createDefaultGuidedStep(
  stepType: WorkflowTemplateStep["step_type"]
): GuidedWorkflowStep {
  const base = {
    ...DEFAULT_GUIDED_WORKFLOW_STEP
  }

  if (stepType === "approval") {
    return {
      ...base,
      approverLabel: "Workspace owner"
    }
  }

  if (stepType === "delay") {
    return {
      ...base,
      delayDuration: 5,
      delayUnit: "minutes"
    }
  }

  return base
}

export function createEmptyWorkflowStep(
  index: number,
  stepType: WorkflowTemplateStep["step_type"] = "llm"
): WorkflowTemplateStepInput {
  const fallbackKey = createStepKey(index)
  const titleMap: Record<string, string> = {
    llm: "AI Step",
    tool: "Tool Step",
    approval: "Approval Step",
    delay: "Delay Step",
    end: "End Step"
  }

  return {
    ...DEFAULT_WORKFLOW_STEP,
    stepKey: fallbackKey,
    title: titleMap[stepType] || "Workflow Step",
    stepType,
    rawConfig: "{}",
    rawInputMapping: "{}",
    rawOutputSchema: "{}",
    guided: createDefaultGuidedStep(stepType)
  }
}

function parseInputFields(inputSchema: Json) {
  const inputSchemaObject = asJsonObject(inputSchema)

  if (isEmptyObject(inputSchema)) {
    return {
      supported: true,
      reason: null,
      fields: [] as WorkflowInputField[]
    }
  }

  if (!inputSchemaObject || !Array.isArray(inputSchemaObject.fields)) {
    return {
      supported: false,
      reason: "The saved input form uses an unsupported structure.",
      fields: [] as WorkflowInputField[]
    }
  }

  const rawFields = inputSchemaObject.fields as Json[]

  const fields = rawFields
    .map((item: Json, index: number) => {
      if (!isPlainObject(item)) return null

      const itemObject = item as Record<string, Json | undefined>

      const type = String(itemObject.type || "short_text")
      if (!INPUT_FIELD_TYPES.has(type)) return null

      return {
        id: String(itemObject.id || createUniqueId("workflow_field", index)),
        key: String(itemObject.key || `field_${index + 1}`),
        label: String(itemObject.label || `Field ${index + 1}`),
        type: type as WorkflowInputField["type"],
        required: Boolean(itemObject.required),
        placeholder: String(itemObject.placeholder || ""),
        helpText: String(itemObject.helpText || "")
      }
    })
    .filter(Boolean) as WorkflowInputField[]

  if (fields.length !== rawFields.length) {
    return {
      supported: false,
      reason:
        "One or more saved input fields are not supported by the guided builder.",
      fields: [] as WorkflowInputField[]
    }
  }

  return {
    supported: true,
    reason: null,
    fields
  }
}

function parseGuidedTrigger(
  triggerType: WorkflowTemplate["trigger_type"],
  triggerConfig: Json
) {
  const fallback: GuidedTriggerConfig = {
    ...DEFAULT_GUIDED_TRIGGER_CONFIG,
    scheduleTimezone: getDefaultTimezone()
  }

  if (triggerType === "manual") {
    if (!isEmptyObject(triggerConfig)) {
      return {
        supported: false,
        reason:
          "Manual triggers with custom settings can only be edited in Raw JSON.",
        guidedTrigger: fallback
      }
    }

    return {
      supported: true,
      reason: null,
      guidedTrigger: {
        ...fallback,
        type: "manual"
      }
    }
  }

  if (triggerType !== "schedule") {
    return {
      supported: false,
      reason: `The ${triggerType} trigger is only available in Raw JSON mode.`,
      guidedTrigger: fallback
    }
  }

  const triggerConfigObject = asJsonObject(triggerConfig)
  const scheduleObject = asJsonObject(triggerConfigObject?.schedule)

  if (!triggerConfigObject || !scheduleObject) {
    return {
      supported: false,
      reason:
        "The saved schedule format is not supported by the guided builder.",
      guidedTrigger: {
        ...fallback,
        type: "schedule" as const
      }
    }
  }

  const frequency = String(scheduleObject.frequency || "")
  const time = String(scheduleObject.time || "")
  const timezone = String(scheduleObject.timezone || getDefaultTimezone())
  const rawDays = Array.isArray(scheduleObject.daysOfWeek)
    ? (scheduleObject.daysOfWeek as Json[]).map((day: Json) => String(day))
    : []
  const validDays = rawDays.filter((day: string) => WEEKDAY_VALUES.has(day))

  if (!["daily", "weekly"].includes(frequency) || !/^\d{2}:\d{2}$/.test(time)) {
    return {
      supported: false,
      reason:
        "The saved schedule settings are not supported by the guided builder.",
      guidedTrigger: {
        ...fallback,
        type: "schedule" as const
      }
    }
  }

  if (frequency === "weekly" && validDays.length === 0) {
    return {
      supported: false,
      reason: "Weekly schedules must include at least one day.",
      guidedTrigger: {
        ...fallback,
        type: "schedule" as const
      }
    }
  }

  return {
    supported: true,
    reason: null,
    guidedTrigger: {
      type: "schedule",
      scheduleFrequency: frequency as GuidedTriggerConfig["scheduleFrequency"],
      scheduleTime: time,
      scheduleTimezone: timezone,
      scheduleDaysOfWeek: frequency === "weekly" ? validDays : ["mon"]
    }
  }
}

function parseGuidedStep(
  step: WorkflowTemplateStep,
  index: number,
  nextStepKey: string
) {
  const fallback = createEmptyWorkflowStep(index, step.step_type)
  const rawConfig = prettyJson(step.config)
  const rawInputMapping = prettyJson(step.input_mapping)
  const rawOutputSchema = prettyJson(step.output_schema)

  const base: WorkflowTemplateStepInput = {
    ...fallback,
    stepKey: step.step_key,
    title: step.title,
    stepType: step.step_type,
    timeoutSeconds: step.timeout_seconds,
    retryMax: step.retry_max,
    retryBackoffSeconds: step.retry_backoff_seconds,
    isRequired: step.is_required,
    onSuccessStepKey: step.on_success_step_key || "",
    onFailureStepKey: step.on_failure_step_key || "",
    rawConfig,
    rawInputMapping,
    rawOutputSchema
  }

  if (!GUIDED_STEP_TYPES.has(step.step_type)) {
    return {
      supported: false,
      reason: `The ${step.step_type} step type is only available in Raw JSON mode.`,
      stepInput: base
    }
  }

  if ((step.on_failure_step_key || "").trim()) {
    return {
      supported: false,
      reason: "Failure branches are only supported in Raw JSON mode.",
      stepInput: base
    }
  }

  const currentSuccessTarget = (step.on_success_step_key || "").trim()
  const expectedSuccessTarget = nextStepKey.trim()

  if (currentSuccessTarget !== expectedSuccessTarget) {
    return {
      supported: false,
      reason: "Custom step routing is only supported in Raw JSON mode.",
      stepInput: base
    }
  }

  const config = asJsonObject(step.config) || {}
  const inputMapping = asJsonObject(step.input_mapping) || {}

  if (step.step_type === "llm") {
    return {
      supported: true,
      reason: null,
      stepInput: {
        ...base,
        guided: {
          ...base.guided,
          prompt: String(config.prompt || ""),
          modelId: String(config.modelId || ""),
          useWorkspaceDefaultModel: !String(config.modelId || "").trim(),
          outputKey: String(config.outputKey || "")
        }
      }
    }
  }

  if (step.step_type === "tool") {
    const sourceType = String(inputMapping.sourceType || "workflow_field")

    return {
      supported: true,
      reason: null,
      stepInput: {
        ...base,
        guided: {
          ...base.guided,
          toolId: String(config.toolId || ""),
          outputKey: String(config.outputKey || ""),
          inputSourceType: [
            "workflow_field",
            "previous_step",
            "fixed_text"
          ].includes(sourceType)
            ? (sourceType as GuidedWorkflowStep["inputSourceType"])
            : "workflow_field",
          inputFieldKey: String(inputMapping.fieldKey || ""),
          inputStepKey: String(inputMapping.stepKey || ""),
          inputFixedText: String(inputMapping.value || "")
        }
      }
    }
  }

  if (step.step_type === "approval") {
    return {
      supported: true,
      reason: null,
      stepInput: {
        ...base,
        guided: {
          ...base.guided,
          approvalInstructions: String(config.instructions || ""),
          approverLabel: String(config.approverLabel || "Workspace owner")
        }
      }
    }
  }

  if (step.step_type === "delay") {
    const unit = String(config.unit || "minutes")

    return {
      supported: true,
      reason: null,
      stepInput: {
        ...base,
        guided: {
          ...base.guided,
          delayDuration:
            typeof config.duration === "number" && config.duration > 0
              ? config.duration
              : 5,
          delayUnit: (unit === "hours"
            ? "hours"
            : "minutes") as GuidedWorkflowStep["delayUnit"]
        }
      }
    }
  }

  return {
    supported: true,
    reason: null,
    stepInput: {
      ...base,
      guided: {
        ...base.guided,
        endSummary: String(config.summary || "")
      }
    }
  }
}

export function workflowTemplateToInput(
  template: WorkflowTemplate
): WorkflowTemplateInput {
  const parsedTrigger = parseGuidedTrigger(
    template.trigger_type,
    template.trigger_config
  )
  const parsedFields = parseInputFields(template.input_schema)
  const reasons: string[] = []

  if (!parsedTrigger.supported && parsedTrigger.reason) {
    reasons.push(parsedTrigger.reason)
  }

  if (!parsedFields.supported && parsedFields.reason) {
    reasons.push(parsedFields.reason)
  }

  const steps = template.steps.map((step, index) => {
    const parsedStep = parseGuidedStep(
      step,
      index,
      template.steps[index + 1]?.step_key || ""
    )

    if (!parsedStep.supported && parsedStep.reason) {
      reasons.push(parsedStep.reason)
    }

    return parsedStep.stepInput
  })

  const supportsGuidedMode = reasons.length === 0

  return {
    name: template.name,
    description: template.description || "",
    status: template.status,
    triggerType: template.trigger_type,
    isActive: template.is_active,
    rawTriggerConfig: prettyJson(template.trigger_config),
    rawInputSchema: prettyJson(template.input_schema),
    inputFields: parsedFields.fields,
    guidedTrigger: parsedTrigger.guidedTrigger as GuidedTriggerConfig,
    steps,
    editorMode: supportsGuidedMode ? "guided" : "raw",
    supportsGuidedMode,
    unsupportedReason: supportsGuidedMode ? null : reasons[0]
  }
}

export function convertRawWorkflowInputToGuided(
  input: WorkflowTemplateInput
): WorkflowTemplateInput {
  const fakeTemplate = {
    id: "draft-template",
    workspace_id: "workspace",
    name: input.name,
    description: input.description,
    version: 1,
    status: input.status,
    trigger_type: input.triggerType,
    trigger_config: parseJsonString(input.rawTriggerConfig, "Trigger settings"),
    input_schema: parseJsonString(input.rawInputSchema, "Input form"),
    is_active: input.isActive,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    steps: input.steps.map((step, index) => ({
      id: `draft-step-${index}`,
      template_id: "draft-template",
      step_key: step.stepKey,
      step_order: index,
      step_type: step.stepType,
      title: step.title,
      config: parseJsonString(step.rawConfig, `${step.title} config`),
      input_mapping: parseJsonString(
        step.rawInputMapping,
        `${step.title} input mapping`
      ),
      output_schema: parseJsonString(
        step.rawOutputSchema,
        `${step.title} output schema`
      ),
      on_success_step_key: step.onSuccessStepKey || null,
      on_failure_step_key: step.onFailureStepKey || null,
      retry_max: step.retryMax,
      retry_backoff_seconds: step.retryBackoffSeconds,
      timeout_seconds: step.timeoutSeconds,
      is_required: step.isRequired,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))
  } as WorkflowTemplate

  const converted = workflowTemplateToInput(fakeTemplate)

  if (!converted.supportsGuidedMode) {
    throw new Error(
      converted.unsupportedReason ||
        "This workflow still uses features that are only available in Raw JSON mode."
    )
  }

  return {
    ...converted,
    editorMode: "guided"
  }
}

export function serializeWorkflowTemplateInput(
  input: WorkflowTemplateInput
): SerializedWorkflowTemplateInput {
  if (input.editorMode === "raw") {
    return {
      name: input.name.trim(),
      description: input.description.trim(),
      status: input.status,
      triggerType: input.triggerType,
      isActive: input.isActive,
      triggerConfig: parseJsonString(
        input.rawTriggerConfig,
        "Trigger settings"
      ),
      inputSchema: parseJsonString(input.rawInputSchema, "Input form"),
      steps: input.steps.map((step, index) => ({
        stepKey: step.stepKey.trim(),
        stepOrder: index,
        stepType: step.stepType,
        title: step.title.trim(),
        timeoutSeconds: step.timeoutSeconds,
        retryMax: step.retryMax,
        retryBackoffSeconds: step.retryBackoffSeconds,
        isRequired: step.isRequired,
        onSuccessStepKey: step.onSuccessStepKey.trim() || null,
        onFailureStepKey: step.onFailureStepKey.trim() || null,
        config: parseJsonString(step.rawConfig, `${step.title} config`),
        inputMapping: parseJsonString(
          step.rawInputMapping,
          `${step.title} input mapping`
        ),
        outputSchema: parseJsonString(
          step.rawOutputSchema,
          `${step.title} output schema`
        )
      }))
    }
  }

  return {
    name: input.name.trim(),
    description: input.description.trim(),
    status: input.status,
    triggerType: input.guidedTrigger.type,
    isActive: input.isActive,
    triggerConfig:
      input.guidedTrigger.type === "schedule"
        ? {
            schedule: {
              frequency: input.guidedTrigger.scheduleFrequency,
              time: input.guidedTrigger.scheduleTime,
              timezone: input.guidedTrigger.scheduleTimezone,
              daysOfWeek:
                input.guidedTrigger.scheduleFrequency === "weekly"
                  ? input.guidedTrigger.scheduleDaysOfWeek
                  : []
            }
          }
        : {},
    inputSchema:
      input.inputFields.length === 0
        ? {}
        : {
            fields: input.inputFields.map(field => ({
              id: field.id,
              key: field.key.trim(),
              label: field.label.trim(),
              type: field.type,
              required: field.required,
              placeholder: field.placeholder.trim(),
              helpText: field.helpText.trim()
            }))
          },
    steps: input.steps.map((step, index) => {
      const nextStepKey = input.steps[index + 1]?.stepKey.trim() || null

      if (!GUIDED_STEP_TYPES.has(step.stepType)) {
        throw new Error(
          `${step.title || step.stepKey} uses a step type that requires Raw JSON mode`
        )
      }

      if (step.stepType === "llm") {
        return {
          stepKey: step.stepKey.trim(),
          stepOrder: index,
          stepType: step.stepType,
          title: step.title.trim(),
          timeoutSeconds: step.timeoutSeconds,
          retryMax: step.retryMax,
          retryBackoffSeconds: step.retryBackoffSeconds,
          isRequired: step.isRequired,
          onSuccessStepKey: nextStepKey,
          onFailureStepKey: null,
          config: {
            prompt: step.guided.prompt.trim(),
            modelId: step.guided.useWorkspaceDefaultModel
              ? null
              : step.guided.modelId.trim() || null,
            outputKey: step.guided.outputKey.trim() || null
          },
          inputMapping: {},
          outputSchema: {}
        }
      }

      if (step.stepType === "tool") {
        const inputMapping: Record<string, Json> = {
          sourceType: step.guided.inputSourceType
        }

        if (step.guided.inputSourceType === "workflow_field") {
          inputMapping.fieldKey = step.guided.inputFieldKey.trim() || null
        }

        if (step.guided.inputSourceType === "previous_step") {
          inputMapping.stepKey = step.guided.inputStepKey.trim() || null
        }

        if (step.guided.inputSourceType === "fixed_text") {
          inputMapping.value = step.guided.inputFixedText
        }

        return {
          stepKey: step.stepKey.trim(),
          stepOrder: index,
          stepType: step.stepType,
          title: step.title.trim(),
          timeoutSeconds: step.timeoutSeconds,
          retryMax: step.retryMax,
          retryBackoffSeconds: step.retryBackoffSeconds,
          isRequired: step.isRequired,
          onSuccessStepKey: nextStepKey,
          onFailureStepKey: null,
          config: {
            toolId: step.guided.toolId.trim() || null,
            outputKey: step.guided.outputKey.trim() || null
          },
          inputMapping,
          outputSchema: {}
        }
      }

      if (step.stepType === "approval") {
        return {
          stepKey: step.stepKey.trim(),
          stepOrder: index,
          stepType: step.stepType,
          title: step.title.trim(),
          timeoutSeconds: step.timeoutSeconds,
          retryMax: step.retryMax,
          retryBackoffSeconds: step.retryBackoffSeconds,
          isRequired: step.isRequired,
          onSuccessStepKey: nextStepKey,
          onFailureStepKey: null,
          config: {
            instructions: step.guided.approvalInstructions.trim(),
            approverLabel: step.guided.approverLabel.trim() || "Workspace owner"
          },
          inputMapping: {},
          outputSchema: {}
        }
      }

      if (step.stepType === "delay") {
        return {
          stepKey: step.stepKey.trim(),
          stepOrder: index,
          stepType: step.stepType,
          title: step.title.trim(),
          timeoutSeconds: step.timeoutSeconds,
          retryMax: step.retryMax,
          retryBackoffSeconds: step.retryBackoffSeconds,
          isRequired: step.isRequired,
          onSuccessStepKey: nextStepKey,
          onFailureStepKey: null,
          config: {
            duration: step.guided.delayDuration,
            unit: step.guided.delayUnit
          },
          inputMapping: {},
          outputSchema: {}
        }
      }

      return {
        stepKey: step.stepKey.trim(),
        stepOrder: index,
        stepType: step.stepType,
        title: step.title.trim(),
        timeoutSeconds: step.timeoutSeconds,
        retryMax: step.retryMax,
        retryBackoffSeconds: step.retryBackoffSeconds,
        isRequired: step.isRequired,
        onSuccessStepKey: null,
        onFailureStepKey: null,
        config: {
          summary: step.guided.endSummary.trim()
        },
        inputMapping: {},
        outputSchema: {}
      }
    })
  }
}

export function convertWorkflowInputToRawMode(
  input: WorkflowTemplateInput
): WorkflowTemplateInput {
  if (input.editorMode === "raw") {
    return cloneWorkflowInput(input)
  }

  const serialized = serializeWorkflowTemplateInput(input)

  return {
    ...cloneWorkflowInput(input),
    triggerType: serialized.triggerType,
    rawTriggerConfig: prettyJson(serialized.triggerConfig),
    rawInputSchema: prettyJson(serialized.inputSchema),
    steps: input.steps.map((step, index) => ({
      ...step,
      stepType: serialized.steps[index].stepType,
      onSuccessStepKey: serialized.steps[index].onSuccessStepKey || "",
      onFailureStepKey: serialized.steps[index].onFailureStepKey || "",
      rawConfig: prettyJson(serialized.steps[index].config),
      rawInputMapping: prettyJson(serialized.steps[index].inputMapping),
      rawOutputSchema: prettyJson(serialized.steps[index].outputSchema)
    })),
    editorMode: "raw",
    supportsGuidedMode: true,
    unsupportedReason: null
  }
}

export function createInitialWorkflowRunInput(
  input?: WorkflowTemplateInput | null
): WorkflowRunInput {
  if (!input) {
    return {
      ...DEFAULT_WORKFLOW_RUN_INPUT
    }
  }

  return {
    ...DEFAULT_WORKFLOW_RUN_INPUT,
    editorMode: input.inputFields.length > 0 ? "guided" : "raw",
    fieldValues: Object.fromEntries(
      input.inputFields.map(field => [
        field.key,
        field.type === "boolean" ? false : ""
      ])
    )
  }
}

export function serializeWorkflowRunInput(
  input: WorkflowRunInput,
  fields: WorkflowInputField[]
) {
  if (input.editorMode === "raw") {
    return parseJsonString(input.rawInputPayload, "Run input")
  }

  const payload: Record<string, Json> = {}

  for (const field of fields) {
    const rawValue = input.fieldValues[field.key]

    if (field.type === "boolean") {
      payload[field.key] = Boolean(rawValue)
      continue
    }

    const normalized = String(rawValue ?? "").trim()

    if (!normalized) {
      continue
    }

    if (field.type === "number") {
      const parsed = Number(normalized)
      if (Number.isNaN(parsed)) {
        throw new Error(`${field.label} must be a number`)
      }
      payload[field.key] = parsed
      continue
    }

    payload[field.key] = normalized
  }

  return payload as Json
}

export function validateWorkflowInput(input: WorkflowTemplateInput) {
  if (!input.name.trim()) {
    throw new Error("Workflow name is required")
  }

  if (input.steps.length === 0) {
    throw new Error("At least one step is required")
  }

  const seenKeys = new Set<string>()

  for (const step of input.steps) {
    if (!step.stepKey.trim()) {
      throw new Error("Each step must have a step key")
    }

    if (seenKeys.has(step.stepKey.trim())) {
      throw new Error(`Duplicate step key: ${step.stepKey}`)
    }

    seenKeys.add(step.stepKey.trim())

    if (!step.title.trim()) {
      throw new Error(`Step ${step.stepKey} must have a title`)
    }
  }

  if (input.editorMode === "raw") {
    if (!input.triggerType.trim()) {
      throw new Error("Trigger type is required")
    }

    parseJsonString(input.rawTriggerConfig, "Trigger settings")
    parseJsonString(input.rawInputSchema, "Input form")

    for (const step of input.steps) {
      parseJsonString(step.rawConfig, `${step.title} config`)
      parseJsonString(step.rawInputMapping, `${step.title} input mapping`)
      parseJsonString(step.rawOutputSchema, `${step.title} output schema`)

      if (
        step.onSuccessStepKey &&
        !seenKeys.has(step.onSuccessStepKey.trim())
      ) {
        throw new Error(
          `Step ${step.stepKey} has an invalid success target: ${step.onSuccessStepKey}`
        )
      }

      if (
        step.onFailureStepKey &&
        !seenKeys.has(step.onFailureStepKey.trim())
      ) {
        throw new Error(
          `Step ${step.stepKey} has an invalid failure target: ${step.onFailureStepKey}`
        )
      }
    }

    return
  }

  if (input.guidedTrigger.type === "schedule") {
    if (!input.guidedTrigger.scheduleTime.trim()) {
      throw new Error("Scheduled workflows require a time")
    }

    if (!input.guidedTrigger.scheduleTimezone.trim()) {
      throw new Error("Scheduled workflows require a timezone")
    }

    if (
      input.guidedTrigger.scheduleFrequency === "weekly" &&
      input.guidedTrigger.scheduleDaysOfWeek.length === 0
    ) {
      throw new Error("Weekly schedules must include at least one day")
    }
  }

  const fieldKeys = new Set<string>()
  for (const field of input.inputFields) {
    if (!field.label.trim()) {
      throw new Error("Each input field must have a label")
    }

    if (!field.key.trim()) {
      throw new Error(`Field ${field.label} must have a key`)
    }

    if (fieldKeys.has(field.key.trim())) {
      throw new Error(`Duplicate input field key: ${field.key}`)
    }

    fieldKeys.add(field.key.trim())
  }

  input.steps.forEach((step, index) => {
    if (!GUIDED_STEP_TYPES.has(step.stepType)) {
      throw new Error(`${step.title} requires Raw JSON mode`)
    }

    if (step.stepType === "llm" && !step.guided.prompt.trim()) {
      throw new Error(`${step.title} requires AI instructions`)
    }

    if (step.stepType === "tool") {
      if (!step.guided.toolId.trim()) {
        throw new Error(`${step.title} requires a tool selection`)
      }

      if (
        step.guided.inputSourceType === "workflow_field" &&
        !step.guided.inputFieldKey.trim()
      ) {
        throw new Error(`${step.title} must choose an input field`)
      }

      if (
        step.guided.inputSourceType === "previous_step" &&
        !step.guided.inputStepKey.trim()
      ) {
        throw new Error(`${step.title} must choose a previous step output`)
      }

      if (
        step.guided.inputSourceType === "fixed_text" &&
        !step.guided.inputFixedText.trim()
      ) {
        throw new Error(`${step.title} requires fixed text input`)
      }
    }

    if (step.stepType === "delay" && step.guided.delayDuration <= 0) {
      throw new Error(`${step.title} must have a positive delay`)
    }

    if (step.stepType === "end" && index !== input.steps.length - 1) {
      throw new Error("The End step must be the last step")
    }
  })
}

export function validateWorkflowRunInput(
  runInput: WorkflowRunInput,
  fields: WorkflowInputField[]
) {
  if (runInput.editorMode === "raw") {
    parseJsonString(runInput.rawInputPayload, "Run input")
    return
  }

  for (const field of fields) {
    const value = runInput.fieldValues[field.key]

    if (field.required) {
      if (field.type === "boolean") {
        continue
      }

      if (!String(value ?? "").trim()) {
        throw new Error(`${field.label} is required`)
      }
    }

    if (field.type === "number" && String(value ?? "").trim()) {
      const parsed = Number(String(value))
      if (Number.isNaN(parsed)) {
        throw new Error(`${field.label} must be a number`)
      }
    }
  }
}

export function formatWorkflowTemplateStatus(template: WorkflowTemplate) {
  return template.status.replace("_", " ")
}

export function getWorkflowRunsForTemplate<
  T extends { template_id: string | null }
>(templateId: string, templatesRuns: T[]): T[] {
  return templatesRuns.filter(run => run.template_id === templateId)
}

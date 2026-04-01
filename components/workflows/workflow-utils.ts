import {
  DEFAULT_WORKFLOW_STEP,
  WorkflowTemplate,
  WorkflowTemplateInput,
  WorkflowTemplateStepInput
} from "@/types"

export function cloneWorkflowInput(
  input: WorkflowTemplateInput
): WorkflowTemplateInput {
  return {
    ...input,
    steps: input.steps.map(step => ({ ...step }))
  }
}

export function createEmptyWorkflowInput(): WorkflowTemplateInput {
  return {
    name: "",
    description: "",
    status: "draft",
    triggerType: "manual",
    isActive: true,
    triggerConfig: "{}",
    inputSchema: "{}",
    steps: [{ ...DEFAULT_WORKFLOW_STEP }]
  }
}

export function createStepKey(index: number) {
  return `step_${index + 1}`
}

export function createEmptyWorkflowStep(
  index: number
): WorkflowTemplateStepInput {
  return {
    ...DEFAULT_WORKFLOW_STEP,
    stepKey: createStepKey(index)
  }
}

export function validateWorkflowInput(input: WorkflowTemplateInput) {
  if (!input.name.trim()) {
    throw new Error("Workflow name is required")
  }

  if (!input.triggerType.trim()) {
    throw new Error("Trigger type is required")
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

  for (const step of input.steps) {
    if (step.onSuccessStepKey && !seenKeys.has(step.onSuccessStepKey.trim())) {
      throw new Error(
        `Step ${step.stepKey} has an invalid success target: ${step.onSuccessStepKey}`
      )
    }

    if (step.onFailureStepKey && !seenKeys.has(step.onFailureStepKey.trim())) {
      throw new Error(
        `Step ${step.stepKey} has an invalid failure target: ${step.onFailureStepKey}`
      )
    }
  }

  JSON.parse(input.triggerConfig || "{}")
  JSON.parse(input.inputSchema || "{}")

  for (const step of input.steps) {
    JSON.parse(step.config || "{}")
    JSON.parse(step.inputMapping || "{}")
    JSON.parse(step.outputSchema || "{}")
  }
}

export function formatWorkflowTemplateStatus(template: WorkflowTemplate) {
  return template.status.replace("_", " ")
}

export function getWorkflowRunsForTemplate<T extends { template_id: string | null }>(
  templateId: string,
  templatesRuns: T[]
): T[] {
  return templatesRuns.filter(run => run.template_id === templateId)
}

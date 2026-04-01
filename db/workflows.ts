import {
  WorkflowRun,
  WorkflowRunDetail,
  WorkflowTemplate,
  WorkflowTemplateInput
} from "@/types"

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.message || "Workflow request failed")
  }

  return payload as T
}

export async function getWorkflowTemplatesByWorkspaceId(workspaceId: string) {
  const response = await fetch(`/api/workflows/templates?workspaceId=${workspaceId}`)
  const payload = await parseResponse<{ templates: WorkflowTemplate[] }>(response)
  return payload.templates || []
}

export async function createWorkflowTemplate(
  workspaceId: string,
  input: WorkflowTemplateInput
) {
  const response = await fetch("/api/workflows/templates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      workspaceId,
      ...input,
      steps: input.steps.map((step, index) => ({
        stepKey: step.stepKey,
        stepOrder: index,
        stepType: step.stepType,
        title: step.title,
        timeoutSeconds: step.timeoutSeconds,
        retryMax: step.retryMax,
        retryBackoffSeconds: step.retryBackoffSeconds,
        isRequired: step.isRequired,
        onSuccessStepKey: step.onSuccessStepKey || null,
        onFailureStepKey: step.onFailureStepKey || null,
        config: JSON.parse(step.config),
        inputMapping: JSON.parse(step.inputMapping),
        outputSchema: JSON.parse(step.outputSchema)
      })),
      triggerConfig: JSON.parse(input.triggerConfig),
      inputSchema: JSON.parse(input.inputSchema)
    })
  })

  const payload = await parseResponse<{ template: WorkflowTemplate }>(response)
  return payload.template
}

export async function updateWorkflowTemplate(
  templateId: string,
  input: WorkflowTemplateInput
) {
  const response = await fetch(`/api/workflows/templates/${templateId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...input,
      steps: input.steps.map((step, index) => ({
        stepKey: step.stepKey,
        stepOrder: index,
        stepType: step.stepType,
        title: step.title,
        timeoutSeconds: step.timeoutSeconds,
        retryMax: step.retryMax,
        retryBackoffSeconds: step.retryBackoffSeconds,
        isRequired: step.isRequired,
        onSuccessStepKey: step.onSuccessStepKey || null,
        onFailureStepKey: step.onFailureStepKey || null,
        config: JSON.parse(step.config),
        inputMapping: JSON.parse(step.inputMapping),
        outputSchema: JSON.parse(step.outputSchema)
      })),
      triggerConfig: JSON.parse(input.triggerConfig),
      inputSchema: JSON.parse(input.inputSchema)
    })
  })

  const payload = await parseResponse<{ template: WorkflowTemplate }>(response)
  return payload.template
}

export async function deleteWorkflowTemplate(templateId: string) {
  const response = await fetch(`/api/workflows/templates/${templateId}`, {
    method: "DELETE"
  })

  await parseResponse<{ success: boolean }>(response)
  return true
}

export async function getWorkflowRunsByWorkspaceId(workspaceId: string) {
  const response = await fetch(`/api/workflows/runs?workspaceId=${workspaceId}`)
  const payload = await parseResponse<{ runs: WorkflowRun[] }>(response)
  return payload.runs || []
}

export async function createWorkflowRun(
  templateId: string,
  inputPayload: string,
  triggerRef: string
) {
  const response = await fetch("/api/workflows/runs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      templateId,
      inputPayload: JSON.parse(inputPayload),
      triggerRef: triggerRef || null
    })
  })

  const payload = await parseResponse<{ run: WorkflowRun }>(response)
  return payload.run
}

export async function getWorkflowRunById(runId: string) {
  const response = await fetch(`/api/workflows/runs/${runId}`)
  const payload = await parseResponse<WorkflowRunDetail>(response)
  return payload
}

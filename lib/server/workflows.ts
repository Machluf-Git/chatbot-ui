import { createServiceRoleClient, getServerAuthContext } from "@/lib/server/admin"
import { Database, Json } from "@/supabase/types"

type WorkflowTemplateRow =
  Database["public"]["Tables"]["workflow_templates"]["Row"]
type WorkflowTemplateStepRow =
  Database["public"]["Tables"]["workflow_template_steps"]["Row"]
type WorkflowRunRow = Database["public"]["Tables"]["workflow_runs"]["Row"]
type WorkflowRunStepRow =
  Database["public"]["Tables"]["workflow_run_steps"]["Row"]

export type WorkflowTemplateStepInput = {
  stepKey: string
  stepOrder?: number
  stepType: WorkflowTemplateStepRow["step_type"]
  title: string
  config?: Json
  inputMapping?: Json
  outputSchema?: Json
  onSuccessStepKey?: string | null
  onFailureStepKey?: string | null
  retryMax?: number
  retryBackoffSeconds?: number
  timeoutSeconds?: number
  isRequired?: boolean
}

export type NormalizedWorkflowTemplateStepInput = {
  stepKey: string
  stepOrder: number
  stepType: WorkflowTemplateStepRow["step_type"]
  title: string
  config: Json
  inputMapping: Json
  outputSchema: Json
  onSuccessStepKey: string | null
  onFailureStepKey: string | null
  retryMax: number
  retryBackoffSeconds: number
  timeoutSeconds: number
  isRequired: boolean
}

export type WorkflowTemplatePayload = {
  workspaceId: string
  name: string
  description?: string
  version?: number
  status?: WorkflowTemplateRow["status"]
  triggerType: WorkflowTemplateRow["trigger_type"]
  triggerConfig?: Json
  inputSchema?: Json
  isActive?: boolean
  steps: WorkflowTemplateStepInput[]
}

export type WorkflowTemplateUpdatePayload = Partial<WorkflowTemplatePayload> & {
  steps?: WorkflowTemplateStepInput[]
}

export type WorkflowRunCreatePayload = {
  templateId: string
  inputPayload?: Json
  triggerSource?: WorkflowRunRow["trigger_source"]
  triggerRef?: string | null
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeJson(value: unknown): Json {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map(item => normalizeJson(item)) as Json
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        normalizeJson(nestedValue)
      ])
    ) as Json
  }

  return {}
}

function validateText(value: unknown, label: string, maxLength: number) {
  const normalized = String(value || "").trim()

  if (!normalized) {
    throw new Error(`${label} is required`)
  }

  if (normalized.length > maxLength) {
    throw new Error(`${label} is too long`)
  }

  return normalized
}

function optionalText(value: unknown, maxLength: number) {
  const normalized = String(value || "").trim()

  if (!normalized) {
    return null
  }

  if (normalized.length > maxLength) {
    throw new Error("Field is too long")
  }

  return normalized
}

const VALID_TEMPLATE_STATUSES = new Set(["draft", "active", "archived"])
const VALID_TRIGGER_TYPES = new Set(["manual", "schedule", "webhook", "event"])
const VALID_TRIGGER_SOURCES = new Set([
  "manual",
  "schedule",
  "webhook",
  "api",
  "system"
])
const VALID_STEP_TYPES = new Set([
  "llm",
  "tool",
  "condition",
  "approval",
  "delay",
  "webhook",
  "end"
])

export function normalizeTemplateSteps(
  steps: WorkflowTemplateStepInput[]
): NormalizedWorkflowTemplateStepInput[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    throw new Error("At least one workflow step is required")
  }

  const seenKeys = new Set<string>()

  return steps.map((step, index) => {
    const stepKey = validateText(step?.stepKey, `steps[${index}].stepKey`, 100)
    const stepType = validateText(
      step?.stepType,
      `steps[${index}].stepType`,
      50
    ) as WorkflowTemplateStepRow["step_type"]

    if (!VALID_STEP_TYPES.has(stepType)) {
      throw new Error(`Invalid step type for ${stepKey}`)
    }

    if (seenKeys.has(stepKey)) {
      throw new Error(`Duplicate stepKey: ${stepKey}`)
    }
    seenKeys.add(stepKey)

    return {
      stepKey,
      stepOrder:
        typeof step?.stepOrder === "number" && step.stepOrder >= 0
          ? step.stepOrder
          : index,
      stepType,
      title: validateText(step?.title, `steps[${index}].title`, 200),
      config: normalizeJson(step?.config ?? {}),
      inputMapping: normalizeJson(step?.inputMapping ?? {}),
      outputSchema: normalizeJson(step?.outputSchema ?? {}),
      onSuccessStepKey: optionalText(step?.onSuccessStepKey, 100),
      onFailureStepKey: optionalText(step?.onFailureStepKey, 100),
      retryMax:
        typeof step?.retryMax === "number" && step.retryMax >= 0
          ? step.retryMax
          : 0,
      retryBackoffSeconds:
        typeof step?.retryBackoffSeconds === "number" &&
        step.retryBackoffSeconds >= 0
          ? step.retryBackoffSeconds
          : 0,
      timeoutSeconds:
        typeof step?.timeoutSeconds === "number" && step.timeoutSeconds > 0
          ? step.timeoutSeconds
          : 300,
      isRequired: step?.isRequired ?? true
    }
  })
}

export function normalizeTemplatePayload(
  payload: WorkflowTemplatePayload | WorkflowTemplateUpdatePayload
) {
  const normalized: Record<string, unknown> = {}

  if ("workspaceId" in payload && payload.workspaceId !== undefined) {
    normalized.workspaceId = validateText(payload.workspaceId, "workspaceId", 100)
  }

  if ("name" in payload && payload.name !== undefined) {
    normalized.name = validateText(payload.name, "name", 200)
  }

  if ("description" in payload) {
    const description = String(payload.description || "").trim()
    if (description.length > 2000) {
      throw new Error("description is too long")
    }
    normalized.description = description
  }

  if ("version" in payload && payload.version !== undefined) {
    if (typeof payload.version !== "number" || payload.version <= 0) {
      throw new Error("version must be a positive number")
    }
    normalized.version = payload.version
  }

  if ("status" in payload && payload.status !== undefined) {
    if (!VALID_TEMPLATE_STATUSES.has(payload.status)) {
      throw new Error("Invalid workflow status")
    }
    normalized.status = payload.status
  }

  if ("triggerType" in payload && payload.triggerType !== undefined) {
    if (!VALID_TRIGGER_TYPES.has(payload.triggerType)) {
      throw new Error("Invalid trigger type")
    }
    normalized.triggerType = payload.triggerType
  }

  if ("triggerConfig" in payload) {
    normalized.triggerConfig = normalizeJson(payload.triggerConfig ?? {})
  }

  if ("inputSchema" in payload) {
    normalized.inputSchema = normalizeJson(payload.inputSchema ?? {})
  }

  if ("isActive" in payload && payload.isActive !== undefined) {
    normalized.isActive = Boolean(payload.isActive)
  }

  if ("steps" in payload && payload.steps !== undefined) {
    normalized.steps = normalizeTemplateSteps(payload.steps)
  }

  return normalized
}

export function normalizeRunCreatePayload(payload: WorkflowRunCreatePayload) {
  const templateId = validateText(payload?.templateId, "templateId", 100)
  const triggerSource = (
    payload?.triggerSource ? String(payload.triggerSource) : "manual"
  ) as WorkflowRunRow["trigger_source"]

  if (!VALID_TRIGGER_SOURCES.has(triggerSource)) {
    throw new Error("Invalid trigger source")
  }

  const triggerRef = optionalText(payload?.triggerRef, 200)

  return {
    templateId,
    inputPayload: normalizeJson(payload?.inputPayload ?? {}),
    triggerSource,
    triggerRef
  }
}

export function getWorkflowApiErrorResponse(error: any) {
  const message = String(error?.message || error || "")
  const normalized = message.toLowerCase()

  if (message === "Forbidden") {
    return { status: 403, message: "Forbidden" }
  }

  if (
    normalized.includes("required") ||
    normalized.includes("invalid") ||
    normalized.includes("duplicate") ||
    normalized.includes("too long") ||
    normalized.includes("must be") ||
    normalized.includes("at least one workflow step") ||
    normalized.includes("cannot be run")
  ) {
    return { status: 400, message }
  }

  if (
    normalized.includes("workflow_templates") ||
    normalized.includes("workflow_template_steps") ||
    normalized.includes("workflow_runs") ||
    normalized.includes("workflow_run_steps") ||
    normalized.includes("workflow_approvals") ||
    normalized.includes("workflow_events") ||
    normalized.includes("does not exist") ||
    normalized.includes("relation") ||
    normalized.includes("column") ||
    normalized.includes("schema cache")
  ) {
    return {
      status: 503,
      message:
        "Workflow storage is not ready on this server yet. Apply the latest database migrations and try again."
    }
  }

  if (
    normalized.includes("not found") ||
    normalized.includes("workspace not found") ||
    normalized.includes("template not found") ||
    normalized.includes("run not found")
  ) {
    return { status: 404, message }
  }

  return {
    status: 500,
    message: message || "Unexpected workflow error"
  }
}

export async function requireWorkspaceOwner(workspaceId: string) {
  const { user } = await getServerAuthContext()
  const supabaseAdmin = createServiceRoleClient()

  const { data: workspace, error } = await supabaseAdmin
    .from("workspaces")
    .select("id, user_id, name")
    .eq("id", workspaceId)
    .single()

  if (error || !workspace) {
    throw new Error("Workspace not found")
  }

  if (workspace.user_id !== user.id) {
    throw new Error("Forbidden")
  }

  return { user, workspace, supabaseAdmin }
}

export async function getTemplateForUser(templateId: string) {
  const { user } = await getServerAuthContext()
  const supabaseAdmin = createServiceRoleClient()

  const { data: template, error } = await supabaseAdmin
    .from("workflow_templates")
    .select("*")
    .eq("id", templateId)
    .single()

  if (error || !template) {
    throw new Error("Workflow template not found")
  }

  const { data: workspace, error: workspaceError } = await supabaseAdmin
    .from("workspaces")
    .select("id, user_id, name")
    .eq("id", template.workspace_id)
    .single()

  if (workspaceError || !workspace) {
    throw new Error("Workspace not found")
  }

  if (workspace.user_id !== user.id) {
    throw new Error("Forbidden")
  }

  return { user, template, workspace, supabaseAdmin }
}

export async function getRunForUser(runId: string) {
  const { user } = await getServerAuthContext()
  const supabaseAdmin = createServiceRoleClient()

  const { data: run, error } = await supabaseAdmin
    .from("workflow_runs")
    .select("*")
    .eq("id", runId)
    .single()

  if (error || !run) {
    throw new Error("Workflow run not found")
  }

  const { data: workspace, error: workspaceError } = await supabaseAdmin
    .from("workspaces")
    .select("id, user_id, name")
    .eq("id", run.workspace_id)
    .single()

  if (workspaceError || !workspace) {
    throw new Error("Workspace not found")
  }

  if (workspace.user_id !== user.id) {
    throw new Error("Forbidden")
  }

  return { user, run, workspace, supabaseAdmin }
}

export async function getWorkflowTemplateSteps(
  supabaseAdmin: ReturnType<typeof createServiceRoleClient>,
  templateId: string
) {
  const { data: steps, error } = await supabaseAdmin
    .from("workflow_template_steps")
    .select("*")
    .eq("template_id", templateId)
    .order("step_order", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return steps || []
}

export async function getWorkflowRunSteps(
  supabaseAdmin: ReturnType<typeof createServiceRoleClient>,
  runId: string
) {
  const { data: steps, error } = await supabaseAdmin
    .from("workflow_run_steps")
    .select("*")
    .eq("run_id", runId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return steps || []
}

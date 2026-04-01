import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ChatbotUIContext } from "@/context/context"
import {
  createWorkflowRun,
  deleteWorkflowTemplate,
  getWorkflowRunById,
  getWorkflowRunsByWorkspaceId,
  updateWorkflowTemplate
} from "@/db/workflows"
import {
  DEFAULT_WORKFLOW_RUN_INPUT,
  WorkflowRun,
  WorkflowRunInput,
  workflowTemplateToInput
} from "@/types"
import {
  IconPlayerPlay,
  IconRefresh,
  IconTrash,
  IconBinaryTree2
} from "@tabler/icons-react"
import { FC, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { WorkflowEditorFields } from "./workflow-editor-fields"
import {
  cloneWorkflowInput,
  createEmptyWorkflowStep,
  getWorkflowRunsForTemplate,
  validateWorkflowInput
} from "./workflow-utils"

export const WorkflowWorkspace: FC = () => {
  const {
    profile,
    selectedWorkspace,
    workflowTemplates,
    setWorkflowTemplates,
    selectedWorkflowTemplate,
    setSelectedWorkflowTemplate,
    workflowRuns,
    setWorkflowRuns,
    selectedWorkflowRun,
    setSelectedWorkflowRun,
    isLoadingWorkflowTemplates,
    isLoadingWorkflowRuns,
    setIsLoadingWorkflowRuns,
    isLoadingWorkflowRunDetail,
    setIsLoadingWorkflowRunDetail
  } = useContext(ChatbotUIContext)

  const [editorValue, setEditorValue] = useState(
    selectedWorkflowTemplate
      ? workflowTemplateToInput(selectedWorkflowTemplate)
      : null
  )
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [runDialogOpen, setRunDialogOpen] = useState(false)
  const [runInput, setRunInput] = useState<WorkflowRunInput>(
    DEFAULT_WORKFLOW_RUN_INPUT
  )
  const [running, setRunning] = useState(false)

  const isWorkspaceOwner =
    Boolean(profile?.user_id) &&
    Boolean(selectedWorkspace?.user_id) &&
    profile?.user_id === selectedWorkspace?.user_id

  useEffect(() => {
    if (selectedWorkflowTemplate) {
      setEditorValue(workflowTemplateToInput(selectedWorkflowTemplate))
    } else {
      setEditorValue(null)
    }
    setSelectedWorkflowRun(null)
  }, [selectedWorkflowTemplate, setSelectedWorkflowRun])

  const refreshRuns = async () => {
    if (!selectedWorkspace || !selectedWorkflowTemplate) return

    try {
      setIsLoadingWorkflowRuns(true)
      const runs = await getWorkflowRunsByWorkspaceId(selectedWorkspace.id)
      setWorkflowRuns(runs)

      if (selectedWorkflowRun?.run?.id) {
        const detail = await getWorkflowRunById(selectedWorkflowRun.run.id)
        setSelectedWorkflowRun(detail)
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load workflow runs")
    } finally {
      setIsLoadingWorkflowRuns(false)
    }
  }

  useEffect(() => {
    if (!selectedWorkflowTemplate || !selectedWorkspace || !isWorkspaceOwner) {
      return
    }

    refreshRuns()
  }, [selectedWorkflowTemplate?.id, selectedWorkspace?.id, isWorkspaceOwner])

  const runsForSelectedTemplate = useMemo(
    () =>
      selectedWorkflowTemplate
        ? getWorkflowRunsForTemplate(selectedWorkflowTemplate.id, workflowRuns)
        : [],
    [selectedWorkflowTemplate, workflowRuns]
  )

  const handleAddStep = () => {
    if (!editorValue) return

    setEditorValue({
      ...editorValue,
      steps: [...editorValue.steps, createEmptyWorkflowStep(editorValue.steps.length)]
    })
  }

  const handleRemoveStep = (index: number) => {
    if (!editorValue) return

    setEditorValue({
      ...editorValue,
      steps: editorValue.steps.filter((_, stepIndex) => stepIndex !== index)
    })
  }

  const handleMoveStep = (index: number, direction: -1 | 1) => {
    if (!editorValue) return

    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= editorValue.steps.length) return

    const steps = [...editorValue.steps]
    const [removed] = steps.splice(index, 1)
    steps.splice(nextIndex, 0, removed)

    setEditorValue({
      ...editorValue,
      steps
    })
  }

  const handleSave = async () => {
    if (!selectedWorkflowTemplate || !editorValue) return

    try {
      setSaving(true)
      validateWorkflowInput(editorValue)

      const updatedTemplate = await updateWorkflowTemplate(
        selectedWorkflowTemplate.id,
        editorValue
      )

      setWorkflowTemplates(prev =>
        prev.map(template =>
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      )
      setSelectedWorkflowTemplate(updatedTemplate)
      toast.success("Workflow saved")
    } catch (error: any) {
      toast.error(error.message || "Failed to save workflow")
    } finally {
      setSaving(false)
    }
  }

  const handleArchive = async () => {
    if (!selectedWorkflowTemplate || !editorValue) return

    await handleSaveWithPatch({
      ...editorValue,
      status: "archived"
    })
  }

  const handleSaveWithPatch = async (valueOverride: typeof editorValue) => {
    if (!selectedWorkflowTemplate || !valueOverride) return

    try {
      setSaving(true)
      validateWorkflowInput(valueOverride)

      const updatedTemplate = await updateWorkflowTemplate(
        selectedWorkflowTemplate.id,
        valueOverride
      )

      setWorkflowTemplates(prev =>
        prev.map(template =>
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      )
      setSelectedWorkflowTemplate(updatedTemplate)
      setEditorValue(cloneWorkflowInput(valueOverride))
      toast.success("Workflow updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to update workflow")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedWorkflowTemplate) return

    try {
      setDeleting(true)
      await deleteWorkflowTemplate(selectedWorkflowTemplate.id)

      const remaining = workflowTemplates.filter(
        template => template.id !== selectedWorkflowTemplate.id
      )
      setWorkflowTemplates(remaining)
      setSelectedWorkflowTemplate(remaining[0] || null)
      setSelectedWorkflowRun(null)
      toast.success("Workflow deleted")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete workflow")
    } finally {
      setDeleting(false)
    }
  }

  const handleRun = async () => {
    if (!selectedWorkflowTemplate) return

    try {
      setRunning(true)
      const createdRun = await createWorkflowRun(
        selectedWorkflowTemplate.id,
        runInput.inputPayload,
        runInput.triggerRef
      )
      setWorkflowRuns(prev => [createdRun, ...prev])
      setRunDialogOpen(false)
      setRunInput(DEFAULT_WORKFLOW_RUN_INPUT)
      toast.success("Workflow run created")
      await refreshRuns()
    } catch (error: any) {
      toast.error(error.message || "Failed to run workflow")
    } finally {
      setRunning(false)
    }
  }

  const handleSelectRun = async (run: WorkflowRun) => {
    try {
      setIsLoadingWorkflowRunDetail(true)
      const detail = await getWorkflowRunById(run.id)
      setSelectedWorkflowRun(detail)
    } catch (error: any) {
      toast.error(error.message || "Failed to load run details")
    } finally {
      setIsLoadingWorkflowRunDetail(false)
    }
  }

  if (!isWorkspaceOwner) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>You do not have access to workflows in this workspace</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (isLoadingWorkflowTemplates) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm">
        Loading workflows...
      </div>
    )
  }

  if (workflowTemplates.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Create your first workflow</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Use the New Workflow button in the sidebar to start building a workflow.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!selectedWorkflowTemplate || !editorValue) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Select a workflow</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Choose a workflow from the sidebar to edit it and inspect its runs.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b px-6 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <IconBinaryTree2 size={20} />
            <h1 className="truncate text-xl font-semibold">
              {selectedWorkflowTemplate.name}
            </h1>
            <Badge variant="secondary">{selectedWorkflowTemplate.status}</Badge>
            <Badge variant="outline">
              {selectedWorkflowTemplate.trigger_type}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setRunDialogOpen(true)}>
            <IconPlayerPlay className="mr-1" size={16} />
            Run Workflow
          </Button>
          <Button variant="outline" onClick={handleArchive} disabled={saving}>
            Archive
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <IconTrash className="mr-1" size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid h-full min-h-0 gap-4 overflow-hidden p-4 lg:grid-cols-[minmax(0,2fr)_minmax(360px,1fr)]">
        <div className="min-h-0 overflow-auto rounded-lg border p-4">
          <WorkflowEditorFields
            value={editorValue}
            onChange={nextValue => setEditorValue(cloneWorkflowInput(nextValue))}
            onAddStep={handleAddStep}
            onRemoveStep={handleRemoveStep}
            onMoveStep={handleMoveStep}
          />
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <Card className="min-h-0 flex-1 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Recent Runs</CardTitle>
              <Button variant="ghost" size="icon" onClick={refreshRuns}>
                <IconRefresh size={16} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 overflow-auto">
              {isLoadingWorkflowRuns ? (
                <div className="text-sm">Loading runs...</div>
              ) : runsForSelectedTemplate.length === 0 ? (
                <div className="text-muted-foreground text-sm">
                  No runs yet for this workflow.
                </div>
              ) : (
                runsForSelectedTemplate.map(run => (
                  <button
                    key={run.id}
                    type="button"
                    className="hover:bg-accent flex w-full flex-col items-start rounded-lg border p-3 text-left"
                    onClick={() => handleSelectRun(run)}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <Badge variant="secondary">{run.status}</Badge>
                      <span className="text-muted-foreground text-xs">
                        {new Date(run.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-medium">
                      {run.trigger_source}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      Current step: {run.current_step_key || "not started"}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="min-h-0 flex-1 overflow-hidden">
            <CardHeader>
              <CardTitle>Run Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-auto">
              {isLoadingWorkflowRunDetail ? (
                <div className="text-sm">Loading run details...</div>
              ) : !selectedWorkflowRun ? (
                <div className="text-muted-foreground text-sm">
                  Select a run to inspect steps, approvals, and events.
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{selectedWorkflowRun.run.status}</Badge>
                    <Badge variant="outline">
                      {selectedWorkflowRun.run.trigger_source}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground text-xs">
                    Created {new Date(selectedWorkflowRun.run.created_at).toLocaleString()}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Steps</div>
                    {selectedWorkflowRun.steps.map(step => (
                      <div key={step.id} className="rounded-md border p-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-sm font-medium">{step.step_key}</div>
                          <Badge variant="secondary">{step.status}</Badge>
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          Attempt {step.attempt}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Approvals</div>
                    {selectedWorkflowRun.approvals.length === 0 ? (
                      <div className="text-muted-foreground text-sm">
                        No approvals for this run.
                      </div>
                    ) : (
                      selectedWorkflowRun.approvals.map(approval => (
                        <div key={approval.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium">
                              Approval request
                            </div>
                            <Badge variant="secondary">{approval.status}</Badge>
                          </div>
                          <div className="text-muted-foreground mt-1 text-xs">
                            Requested {new Date(approval.requested_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Event Log</div>
                    {selectedWorkflowRun.events.length === 0 ? (
                      <div className="text-muted-foreground text-sm">
                        No events for this run.
                      </div>
                    ) : (
                      selectedWorkflowRun.events.map(event => (
                        <div key={event.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="text-sm font-medium">
                              {event.event_type}
                            </div>
                            <Badge variant="outline">{event.level}</Badge>
                          </div>
                          <div className="mt-1 text-sm">{event.message}</div>
                          <div className="text-muted-foreground mt-1 text-xs">
                            {new Date(event.occurred_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run Workflow</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Trigger Reference</div>
              <Textarea
                rows={2}
                value={runInput.triggerRef}
                onChange={e =>
                  setRunInput(prev => ({ ...prev, triggerRef: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium">Input Payload JSON</div>
              <Textarea
                rows={10}
                className="font-mono text-xs"
                value={runInput.inputPayload}
                onChange={e =>
                  setRunInput(prev => ({
                    ...prev,
                    inputPayload: e.target.value
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRunDialogOpen(false)}>
              Cancel
            </Button>
            <Button disabled={running} onClick={handleRun}>
              {running ? "Running..." : "Run Workflow"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

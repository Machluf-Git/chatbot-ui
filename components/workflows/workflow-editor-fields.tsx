"use client"

import { ModelSelect } from "@/components/models/model-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ChatbotUIContext } from "@/context/context"
import {
  WORKFLOW_WEEKDAY_OPTIONS,
  WorkflowInputField,
  WorkflowTemplateInput,
  WorkflowTemplateStepInput
} from "@/types"
import {
  convertRawWorkflowInputToGuided,
  convertWorkflowInputToRawMode,
  createDefaultGuidedStep,
  createEmptyInputField,
  slugifyWorkflowKey
} from "./workflow-utils"
import {
  IconArrowDown,
  IconArrowUp,
  IconBraces,
  IconPlus,
  IconTrash
} from "@tabler/icons-react"
import { FC, useContext } from "react"
import { toast } from "sonner"

interface WorkflowEditorFieldsProps {
  value: WorkflowTemplateInput
  onChange: (value: WorkflowTemplateInput) => void
  onAddStep: () => void
  onRemoveStep: (index: number) => void
  onMoveStep: (index: number, direction: -1 | 1) => void
}

const STATUS_OPTIONS = ["draft", "active", "archived"] as const
const RAW_TRIGGER_OPTIONS = ["manual", "schedule", "webhook", "event"] as const
const RAW_STEP_TYPE_OPTIONS = [
  "llm",
  "tool",
  "condition",
  "approval",
  "delay",
  "webhook",
  "end"
] as const
const GUIDED_STEP_OPTIONS = [
  { value: "llm", label: "AI" },
  { value: "tool", label: "Tool" },
  { value: "approval", label: "Approval" },
  { value: "delay", label: "Delay" },
  { value: "end", label: "End" }
] as const
const INPUT_FIELD_OPTIONS = [
  { value: "short_text", label: "Short text" },
  { value: "long_text", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Yes / No" },
  { value: "date", label: "Date" }
] as const

export const WorkflowEditorFields: FC<WorkflowEditorFieldsProps> = ({
  value,
  onChange,
  onAddStep,
  onRemoveStep,
  onMoveStep
}) => {
  const { tools, selectedWorkspace } = useContext(ChatbotUIContext)

  const updateField = <K extends keyof WorkflowTemplateInput>(
    key: K,
    fieldValue: WorkflowTemplateInput[K]
  ) => {
    onChange({
      ...value,
      [key]: fieldValue
    })
  }

  const updateGuidedTrigger = (
    key: keyof WorkflowTemplateInput["guidedTrigger"],
    fieldValue: string | string[]
  ) => {
    onChange({
      ...value,
      triggerType:
        key === "type"
          ? (fieldValue as WorkflowTemplateInput["guidedTrigger"]["type"])
          : value.triggerType,
      guidedTrigger: {
        ...value.guidedTrigger,
        [key]: fieldValue
      }
    })
  }

  const updateInputField = (
    index: number,
    key: keyof WorkflowInputField,
    fieldValue: string | boolean
  ) => {
    onChange({
      ...value,
      inputFields: value.inputFields.map((field, fieldIndex) =>
        fieldIndex === index
          ? {
              ...field,
              [key]: fieldValue
            }
          : field
      )
    })
  }

  const handleInputFieldLabelChange = (index: number, nextLabel: string) => {
    const currentField = value.inputFields[index]
    const fallbackKey = `field_${index + 1}`
    const currentAutoKey = slugifyWorkflowKey(currentField.label, fallbackKey)
    const shouldSyncKey =
      !currentField.key.trim() || currentField.key.trim() === currentAutoKey

    onChange({
      ...value,
      inputFields: value.inputFields.map((field, fieldIndex) => {
        if (fieldIndex !== index) return field

        return {
          ...field,
          label: nextLabel,
          key: shouldSyncKey
            ? slugifyWorkflowKey(nextLabel, fallbackKey)
            : field.key
        }
      })
    })
  }

  const addInputField = () => {
    onChange({
      ...value,
      inputFields: [
        ...value.inputFields,
        createEmptyInputField(value.inputFields.length)
      ]
    })
  }

  const removeInputField = (index: number) => {
    onChange({
      ...value,
      inputFields: value.inputFields.filter(
        (_, fieldIndex) => fieldIndex !== index
      )
    })
  }

  const moveInputField = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= value.inputFields.length) return

    const nextFields = [...value.inputFields]
    const [removed] = nextFields.splice(index, 1)
    nextFields.splice(nextIndex, 0, removed)

    onChange({
      ...value,
      inputFields: nextFields
    })
  }

  const updateStep = (
    index: number,
    key: keyof WorkflowTemplateStepInput,
    stepValue: string | number | boolean
  ) => {
    onChange({
      ...value,
      steps: value.steps.map((step, stepIndex) =>
        stepIndex === index
          ? {
              ...step,
              [key]: stepValue
            }
          : step
      )
    })
  }

  const updateStepGuided = (
    index: number,
    key: keyof WorkflowTemplateStepInput["guided"],
    stepValue: string | number | boolean
  ) => {
    onChange({
      ...value,
      steps: value.steps.map((step, stepIndex) =>
        stepIndex === index
          ? {
              ...step,
              guided: {
                ...step.guided,
                [key]: stepValue
              }
            }
          : step
      )
    })
  }

  const handleStepTitleChange = (index: number, nextTitle: string) => {
    const currentStep = value.steps[index]
    const fallbackKey = `step_${index + 1}`
    const currentAutoKey = slugifyWorkflowKey(currentStep.title, fallbackKey)
    const shouldSyncKey =
      !currentStep.stepKey.trim() ||
      currentStep.stepKey.trim() === currentAutoKey ||
      currentStep.stepKey.trim() === fallbackKey

    onChange({
      ...value,
      steps: value.steps.map((step, stepIndex) => {
        if (stepIndex !== index) return step

        return {
          ...step,
          title: nextTitle,
          stepKey: shouldSyncKey
            ? slugifyWorkflowKey(nextTitle, fallbackKey)
            : step.stepKey
        }
      })
    })
  }

  const handleGuidedStepTypeChange = (
    index: number,
    stepType: WorkflowTemplateStepInput["stepType"]
  ) => {
    onChange({
      ...value,
      steps: value.steps.map((step, stepIndex) =>
        stepIndex === index
          ? {
              ...step,
              stepType,
              guided: createDefaultGuidedStep(stepType)
            }
          : step
      )
    })
  }

  const handleModeChange = (mode: "guided" | "raw") => {
    if (mode === value.editorMode) return

    if (mode === "raw") {
      try {
        onChange(convertWorkflowInputToRawMode(value))
      } catch (error: any) {
        toast.error(error.message || "Failed to open Raw JSON mode")
      }
      return
    }

    try {
      onChange(convertRawWorkflowInputToGuided(value))
    } catch (error: any) {
      toast.error(error.message || "This workflow still requires Raw JSON mode")
    }
  }
  const renderGuidedStepBody = (
    step: WorkflowTemplateStepInput,
    index: number
  ) => {
    if (step.stepType === "llm") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label>AI Instructions</Label>
            <Textarea
              rows={4}
              placeholder="Summarize the form submission and prepare a response."
              value={step.guided.prompt}
              onChange={e => updateStepGuided(index, "prompt", e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2 md:col-span-2">
            <div>
              <Label>Use workspace default model</Label>
              <div className="text-muted-foreground text-xs">
                Default model: {selectedWorkspace?.default_model || "Not set"}
              </div>
            </div>
            <Switch
              checked={step.guided.useWorkspaceDefaultModel}
              onCheckedChange={checked =>
                updateStepGuided(index, "useWorkspaceDefaultModel", checked)
              }
            />
          </div>

          {!step.guided.useWorkspaceDefaultModel && (
            <div className="space-y-1 md:col-span-2">
              <Label>Specific model</Label>
              <ModelSelect
                selectedModelId={
                  (step.guided.modelId ||
                    selectedWorkspace?.default_model ||
                    "") as any
                }
                onSelectModel={modelId =>
                  updateStepGuided(index, "modelId", modelId as string)
                }
              />
            </div>
          )}

          <div className="space-y-1 md:col-span-2">
            <Label>Save output as</Label>
            <Input
              placeholder="summary"
              value={step.guided.outputKey}
              onChange={e =>
                updateStepGuided(index, "outputKey", e.target.value)
              }
            />
          </div>
        </div>
      )
    }

    if (step.stepType === "tool") {
      const previousSteps = value.steps.slice(0, index)

      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label>Tool</Label>
            <Select
              value={step.guided.toolId || "__none"}
              onValueChange={option =>
                updateStepGuided(
                  index,
                  "toolId",
                  option === "__none" ? "" : option
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a tool" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">Select a tool</SelectItem>
                {tools.map(tool => (
                  <SelectItem key={tool.id} value={tool.id}>
                    {tool.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Input source</Label>
            <Select
              value={step.guided.inputSourceType}
              onValueChange={option =>
                updateStepGuided(index, "inputSourceType", option)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workflow_field">
                  Workflow form field
                </SelectItem>
                <SelectItem value="previous_step">
                  Previous step output
                </SelectItem>
                <SelectItem value="fixed_text">Fixed text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label>Save output as</Label>
            <Input
              placeholder="tool_result"
              value={step.guided.outputKey}
              onChange={e =>
                updateStepGuided(index, "outputKey", e.target.value)
              }
            />
          </div>

          {step.guided.inputSourceType === "workflow_field" && (
            <div className="space-y-1 md:col-span-2">
              <Label>Workflow field</Label>
              <Select
                value={step.guided.inputFieldKey || "__none"}
                onValueChange={option =>
                  updateStepGuided(
                    index,
                    "inputFieldKey",
                    option === "__none" ? "" : option
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Choose a field</SelectItem>
                  {value.inputFields.map(field => (
                    <SelectItem key={field.id} value={field.key}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step.guided.inputSourceType === "previous_step" && (
            <div className="space-y-1 md:col-span-2">
              <Label>Previous step output</Label>
              <Select
                value={step.guided.inputStepKey || "__none"}
                onValueChange={option =>
                  updateStepGuided(
                    index,
                    "inputStepKey",
                    option === "__none" ? "" : option
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a previous step" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Choose a previous step</SelectItem>
                  {previousSteps.map(previousStep => (
                    <SelectItem
                      key={previousStep.stepKey}
                      value={previousStep.stepKey}
                    >
                      {previousStep.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step.guided.inputSourceType === "fixed_text" && (
            <div className="space-y-1 md:col-span-2">
              <Label>Fixed text</Label>
              <Textarea
                rows={3}
                placeholder="Enter the fixed text this tool should receive."
                value={step.guided.inputFixedText}
                onChange={e =>
                  updateStepGuided(index, "inputFixedText", e.target.value)
                }
              />
            </div>
          )}
        </div>
      )
    }

    if (step.stepType === "approval") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <Label>Approval instructions</Label>
            <Textarea
              rows={4}
              placeholder="Explain what the approver should review before continuing."
              value={step.guided.approvalInstructions}
              onChange={e =>
                updateStepGuided(index, "approvalInstructions", e.target.value)
              }
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label>Approver</Label>
            <Input value={step.guided.approverLabel} disabled />
            <div className="text-muted-foreground text-xs">
              v1 always routes approvals to the workspace owner.
            </div>
          </div>
        </div>
      )
    }

    if (step.stepType === "delay") {
      return (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Wait for</Label>
            <Input
              type="number"
              min={1}
              value={step.guided.delayDuration}
              onChange={e =>
                updateStepGuided(
                  index,
                  "delayDuration",
                  Number(e.target.value || 0)
                )
              }
            />
          </div>

          <div className="space-y-1">
            <Label>Unit</Label>
            <Select
              value={step.guided.delayUnit}
              onValueChange={option =>
                updateStepGuided(index, "delayUnit", option)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-1">
        <Label>End step summary</Label>
        <Textarea
          rows={3}
          placeholder="Describe what this workflow delivers when it finishes."
          value={step.guided.endSummary}
          onChange={e => updateStepGuided(index, "endSummary", e.target.value)}
        />
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <Tabs
        value={value.editorMode}
        onValueChange={mode => handleModeChange(mode as "guided" | "raw")}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Workflow Builder</div>
            <div className="text-muted-foreground text-xs">
              Use Guided Builder for everyday setup. Raw JSON is for advanced
              routing and unsupported features.
            </div>
          </div>

          <TabsList>
            <TabsTrigger value="guided">Guided Builder</TabsTrigger>
            <TabsTrigger value="raw">
              <IconBraces className="mr-1" size={14} />
              Raw JSON
            </TabsTrigger>
          </TabsList>
        </div>

        {value.editorMode === "raw" && value.unsupportedReason && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {value.unsupportedReason}
          </div>
        )}

        <TabsContent value="guided" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                placeholder="Customer onboarding"
                value={value.name}
                onChange={e => updateField("name", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={value.status}
                onValueChange={option => updateField("status", option as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2 md:col-span-2">
              <div>
                <Label>Active</Label>
                <div className="text-muted-foreground text-xs">
                  Turn this on when the workflow is ready to use.
                </div>
              </div>
              <Switch
                checked={value.isActive}
                onCheckedChange={checked => updateField("isActive", checked)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="Describe what this workflow is supposed to do."
              value={value.description}
              onChange={e => updateField("description", e.target.value)}
            />
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div>
              <div className="text-sm font-semibold">
                How this workflow starts
              </div>
              <div className="text-muted-foreground text-xs">
                Choose whether users start it manually or on a schedule.
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Start type</Label>
                <Select
                  value={value.guidedTrigger.type}
                  onValueChange={option => updateGuidedTrigger("type", option)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {value.guidedTrigger.type === "schedule" && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Frequency</Label>
                  <Select
                    value={value.guidedTrigger.scheduleFrequency}
                    onValueChange={option =>
                      updateGuidedTrigger("scheduleFrequency", option)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={value.guidedTrigger.scheduleTime}
                    onChange={e =>
                      updateGuidedTrigger("scheduleTime", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label>Timezone</Label>
                  <Input
                    value={value.guidedTrigger.scheduleTimezone}
                    onChange={e =>
                      updateGuidedTrigger("scheduleTimezone", e.target.value)
                    }
                  />
                </div>

                {value.guidedTrigger.scheduleFrequency === "weekly" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Days</Label>
                    <div className="flex flex-wrap gap-3">
                      {WORKFLOW_WEEKDAY_OPTIONS.map(day => {
                        const checked =
                          value.guidedTrigger.scheduleDaysOfWeek.includes(
                            day.value
                          )

                        return (
                          <label
                            key={day.value}
                            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={nextChecked => {
                                const nextDays = nextChecked
                                  ? [
                                      ...value.guidedTrigger.scheduleDaysOfWeek,
                                      day.value
                                    ]
                                  : value.guidedTrigger.scheduleDaysOfWeek.filter(
                                      currentDay => currentDay !== day.value
                                    )

                                updateGuidedTrigger(
                                  "scheduleDaysOfWeek",
                                  Array.from(new Set(nextDays))
                                )
                              }}
                            />
                            {day.label}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Input fields</div>
                <div className="text-muted-foreground text-xs">
                  Build the form users will fill before this workflow runs.
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={addInputField}>
                <IconPlus className="mr-1" size={16} />
                Add Field
              </Button>
            </div>

            {value.inputFields.length === 0 ? (
              <div className="text-muted-foreground text-sm">
                No input fields yet. Add fields if the workflow needs
                information from the user.
              </div>
            ) : (
              <div className="space-y-3">
                {value.inputFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">
                          Field {index + 1}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          This field will appear in the Run form.
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveInputField(index, -1)}
                          disabled={index === 0}
                        >
                          <IconArrowUp size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => moveInputField(index, 1)}
                          disabled={index === value.inputFields.length - 1}
                        >
                          <IconArrowDown size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeInputField(index)}
                        >
                          <IconTrash size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Label</Label>
                        <Input
                          value={field.label}
                          onChange={e =>
                            handleInputFieldLabelChange(index, e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Key</Label>
                        <Input
                          value={field.key}
                          onChange={e =>
                            updateInputField(index, "key", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={option =>
                            updateInputField(index, "type", option)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INPUT_FIELD_OPTIONS.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div>
                          <Label>Required</Label>
                          <div className="text-muted-foreground text-xs">
                            Users must fill this before running the workflow.
                          </div>
                        </div>
                        <Switch
                          checked={field.required}
                          onCheckedChange={checked =>
                            updateInputField(index, "required", checked)
                          }
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <Label>Placeholder</Label>
                        <Input
                          value={field.placeholder}
                          onChange={e =>
                            updateInputField(
                              index,
                              "placeholder",
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <Label>Help text</Label>
                        <Input
                          value={field.helpText}
                          onChange={e =>
                            updateInputField(index, "helpText", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Steps</div>
                <div className="text-muted-foreground text-xs">
                  Steps run in order from top to bottom. Branching is available
                  only in Raw JSON mode.
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={onAddStep}>
                <IconPlus className="mr-1" size={16} />
                Add Step
              </Button>
            </div>

            <div className="space-y-4">
              {value.steps.map((step, index) => (
                <div
                  key={`${step.stepKey}-${index}`}
                  className="space-y-4 rounded-lg border p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">
                        Step {index + 1}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        Configure what happens at this stage.
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveStep(index, -1)}
                        disabled={index === 0}
                      >
                        <IconArrowUp size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMoveStep(index, 1)}
                        disabled={index === value.steps.length - 1}
                      >
                        <IconArrowDown size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemoveStep(index)}
                        disabled={value.steps.length === 1}
                      >
                        <IconTrash size={16} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input
                        value={step.title}
                        onChange={e =>
                          handleStepTitleChange(index, e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Step key</Label>
                      <Input
                        value={step.stepKey}
                        onChange={e =>
                          updateStep(index, "stepKey", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Step type</Label>
                      <Select
                        value={step.stepType}
                        onValueChange={option =>
                          handleGuidedStepTypeChange(
                            index,
                            option as WorkflowTemplateStepInput["stepType"]
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GUIDED_STEP_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div>
                        <Label>Required</Label>
                        <div className="text-muted-foreground text-xs">
                          Keep this on unless the step can be skipped safely.
                        </div>
                      </div>
                      <Switch
                        checked={step.isRequired}
                        onCheckedChange={checked =>
                          updateStep(index, "isRequired", checked)
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Timeout (seconds)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={step.timeoutSeconds}
                        onChange={e =>
                          updateStep(
                            index,
                            "timeoutSeconds",
                            Number(e.target.value || 0)
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1">
                      <Label>Retry attempts</Label>
                      <Input
                        type="number"
                        min={0}
                        value={step.retryMax}
                        onChange={e =>
                          updateStep(
                            index,
                            "retryMax",
                            Number(e.target.value || 0)
                          )
                        }
                      />
                    </div>

                    <div className="space-y-1 md:col-span-2">
                      <Label>Retry wait (seconds)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={step.retryBackoffSeconds}
                        onChange={e =>
                          updateStep(
                            index,
                            "retryBackoffSeconds",
                            Number(e.target.value || 0)
                          )
                        }
                      />
                    </div>
                  </div>

                  {renderGuidedStepBody(step, index)}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="raw" className="space-y-6">
          <div className="rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-sm text-sky-100">
            Raw JSON mode gives you access to unsupported triggers, custom
            routing, and advanced step payloads.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                placeholder="Customer onboarding"
                value={value.name}
                onChange={e => updateField("name", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={value.status}
                onValueChange={option => updateField("status", option as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Trigger type</Label>
              <Select
                value={value.triggerType}
                onValueChange={option =>
                  updateField("triggerType", option as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RAW_TRIGGER_OPTIONS.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <Label>Active</Label>
                <div className="text-muted-foreground text-xs">
                  Control whether this workflow should be available to run.
                </div>
              </div>
              <Switch
                checked={value.isActive}
                onCheckedChange={checked => updateField("isActive", checked)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              rows={3}
              placeholder="Describe what this workflow is supposed to do."
              value={value.description}
              onChange={e => updateField("description", e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <Label>Trigger settings JSON</Label>
              <Textarea
                rows={8}
                className="font-mono text-xs"
                value={value.rawTriggerConfig}
                onChange={e => updateField("rawTriggerConfig", e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Input form JSON</Label>
              <Textarea
                rows={8}
                className="font-mono text-xs"
                value={value.rawInputSchema}
                onChange={e => updateField("rawInputSchema", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Steps</div>
                <div className="text-muted-foreground text-xs">
                  Advanced step editor with full routing and JSON payload
                  control.
                </div>
              </div>

              <Button variant="outline" size="sm" onClick={onAddStep}>
                <IconPlus className="mr-1" size={16} />
                Add Step
              </Button>
            </div>

            {value.steps.map((step, index) => (
              <div
                key={`${step.stepKey}-${index}`}
                className="space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold">
                      Step {index + 1}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Full control over routing and payloads.
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveStep(index, -1)}
                      disabled={index === 0}
                    >
                      <IconArrowUp size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onMoveStep(index, 1)}
                      disabled={index === value.steps.length - 1}
                    >
                      <IconArrowDown size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveStep(index)}
                      disabled={value.steps.length === 1}
                    >
                      <IconTrash size={16} />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Step key</Label>
                    <Input
                      value={step.stepKey}
                      onChange={e =>
                        updateStep(index, "stepKey", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Title</Label>
                    <Input
                      value={step.title}
                      onChange={e => updateStep(index, "title", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Step type</Label>
                    <Select
                      value={step.stepType}
                      onValueChange={option =>
                        updateStep(index, "stepType", option as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RAW_STEP_TYPE_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <div>
                      <Label>Required</Label>
                      <div className="text-muted-foreground text-xs">
                        Mark whether this step is mandatory.
                      </div>
                    </div>
                    <Switch
                      checked={step.isRequired}
                      onCheckedChange={checked =>
                        updateStep(index, "isRequired", checked)
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Timeout seconds</Label>
                    <Input
                      type="number"
                      min={1}
                      value={step.timeoutSeconds}
                      onChange={e =>
                        updateStep(
                          index,
                          "timeoutSeconds",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Retry max</Label>
                    <Input
                      type="number"
                      min={0}
                      value={step.retryMax}
                      onChange={e =>
                        updateStep(
                          index,
                          "retryMax",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Retry backoff seconds</Label>
                    <Input
                      type="number"
                      min={0}
                      value={step.retryBackoffSeconds}
                      onChange={e =>
                        updateStep(
                          index,
                          "retryBackoffSeconds",
                          Number(e.target.value || 0)
                        )
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>On success step key</Label>
                    <Input
                      value={step.onSuccessStepKey}
                      onChange={e =>
                        updateStep(index, "onSuccessStepKey", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <Label>On failure step key</Label>
                    <Input
                      value={step.onFailureStepKey}
                      onChange={e =>
                        updateStep(index, "onFailureStepKey", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <Label>Config JSON</Label>
                    <Textarea
                      rows={6}
                      className="font-mono text-xs"
                      value={step.rawConfig}
                      onChange={e =>
                        updateStep(index, "rawConfig", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Input mapping JSON</Label>
                    <Textarea
                      rows={6}
                      className="font-mono text-xs"
                      value={step.rawInputMapping}
                      onChange={e =>
                        updateStep(index, "rawInputMapping", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Output schema JSON</Label>
                    <Textarea
                      rows={6}
                      className="font-mono text-xs"
                      value={step.rawOutputSchema}
                      onChange={e =>
                        updateStep(index, "rawOutputSchema", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import { Button } from "@/components/ui/button"
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
import { Textarea } from "@/components/ui/textarea"
import { WorkflowTemplateInput } from "@/types"
import {
  IconArrowDown,
  IconArrowUp,
  IconPlus,
  IconTrash
} from "@tabler/icons-react"
import { FC } from "react"

interface WorkflowEditorFieldsProps {
  value: WorkflowTemplateInput
  onChange: (value: WorkflowTemplateInput) => void
  onAddStep: () => void
  onRemoveStep: (index: number) => void
  onMoveStep: (index: number, direction: -1 | 1) => void
}

const STATUS_OPTIONS = ["draft", "active", "archived"] as const
const TRIGGER_OPTIONS = ["manual", "schedule", "webhook", "event"] as const
const STEP_TYPE_OPTIONS = [
  "llm",
  "tool",
  "condition",
  "approval",
  "delay",
  "webhook",
  "end"
] as const

export const WorkflowEditorFields: FC<WorkflowEditorFieldsProps> = ({
  value,
  onChange,
  onAddStep,
  onRemoveStep,
  onMoveStep
}) => {
  const updateField = <K extends keyof WorkflowTemplateInput>(
    key: K,
    fieldValue: WorkflowTemplateInput[K]
  ) => {
    onChange({
      ...value,
      [key]: fieldValue
    })
  }

  const updateStep = (
    index: number,
    key: keyof WorkflowTemplateInput["steps"][number],
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

  return (
    <div className="space-y-6">
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
          <Label>Trigger Type</Label>
          <Select
            value={value.triggerType}
            onValueChange={option => updateField("triggerType", option as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRIGGER_OPTIONS.map(option => (
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
          <Label>Trigger Config JSON</Label>
          <Textarea
            rows={8}
            className="font-mono text-xs"
            value={value.triggerConfig}
            onChange={e => updateField("triggerConfig", e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Input Schema JSON</Label>
          <Textarea
            rows={8}
            className="font-mono text-xs"
            value={value.inputSchema}
            onChange={e => updateField("inputSchema", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Steps</div>
            <div className="text-muted-foreground text-xs">
              Ordered execution steps for this workflow.
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onAddStep}>
            <IconPlus className="mr-1" size={16} />
            Add Step
          </Button>
        </div>

        <div className="space-y-4">
          {value.steps.map((step, index) => (
            <div key={`${step.stepKey}-${index}`} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold">
                    Step {index + 1}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Configure execution and routing.
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
                  <Label>Step Key</Label>
                  <Input
                    value={step.stepKey}
                    onChange={e => updateStep(index, "stepKey", e.target.value)}
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
                  <Label>Step Type</Label>
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
                      {STEP_TYPE_OPTIONS.map(option => (
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
                  <Label>Timeout Seconds</Label>
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
                  <Label>Retry Max</Label>
                  <Input
                    type="number"
                    min={0}
                    value={step.retryMax}
                    onChange={e =>
                      updateStep(index, "retryMax", Number(e.target.value || 0))
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label>Retry Backoff Seconds</Label>
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
                  <Label>On Success Step Key</Label>
                  <Input
                    placeholder="step_2"
                    value={step.onSuccessStepKey}
                    onChange={e =>
                      updateStep(index, "onSuccessStepKey", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label>On Failure Step Key</Label>
                  <Input
                    placeholder="step_3"
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
                    value={step.config}
                    onChange={e => updateStep(index, "config", e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <Label>Input Mapping JSON</Label>
                  <Textarea
                    rows={6}
                    className="font-mono text-xs"
                    value={step.inputMapping}
                    onChange={e =>
                      updateStep(index, "inputMapping", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-1">
                  <Label>Output Schema JSON</Label>
                  <Textarea
                    rows={6}
                    className="font-mono text-xs"
                    value={step.outputSchema}
                    onChange={e =>
                      updateStep(index, "outputSchema", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

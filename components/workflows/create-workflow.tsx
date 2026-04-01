import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { ChatbotUIContext } from "@/context/context"
import { createWorkflowTemplate } from "@/db/workflows"
import {
  WorkflowTemplateInput
} from "@/types"
import { FC, useContext, useState } from "react"
import { toast } from "sonner"
import { WorkflowEditorFields } from "./workflow-editor-fields"
import {
  cloneWorkflowInput,
  createEmptyWorkflowInput,
  createEmptyWorkflowStep,
  validateWorkflowInput
} from "./workflow-utils"

interface CreateWorkflowProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

export const CreateWorkflow: FC<CreateWorkflowProps> = ({
  isOpen,
  onOpenChange
}) => {
  const {
    selectedWorkspace,
    workflowTemplates,
    setWorkflowTemplates,
    setSelectedWorkflowTemplate
  } = useContext(ChatbotUIContext)

  const [value, setValue] = useState<WorkflowTemplateInput>(
    createEmptyWorkflowInput()
  )
  const [creating, setCreating] = useState(false)

  const handleAddStep = () => {
    setValue(prev => ({
      ...prev,
      steps: [...prev.steps, createEmptyWorkflowStep(prev.steps.length)]
    }))
  }

  const handleRemoveStep = (index: number) => {
    setValue(prev => ({
      ...prev,
      steps: prev.steps.filter((_, stepIndex) => stepIndex !== index)
    }))
  }

  const handleMoveStep = (index: number, direction: -1 | 1) => {
    setValue(prev => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= prev.steps.length) {
        return prev
      }

      const steps = [...prev.steps]
      const [removed] = steps.splice(index, 1)
      steps.splice(nextIndex, 0, removed)

      return {
        ...prev,
        steps
      }
    })
  }

  const resetState = () => {
    setValue(createEmptyWorkflowInput())
  }

  const handleCreate = async () => {
    if (!selectedWorkspace) return

    try {
      setCreating(true)
      validateWorkflowInput(value)

      const createdTemplate = await createWorkflowTemplate(
        selectedWorkspace.id,
        value
      )

      setWorkflowTemplates([createdTemplate, ...workflowTemplates])
      setSelectedWorkflowTemplate(createdTemplate)
      resetState()
      onOpenChange(false)
      toast.success("Workflow created")
    } catch (error: any) {
      toast.error(error.message || "Failed to create workflow")
    } finally {
      setCreating(false)
    }
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => {
        if (!open) {
          resetState()
        }
        onOpenChange(open)
      }}
    >
      <SheetContent
        className="flex min-w-[720px] flex-col justify-between overflow-auto"
        side="left"
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">
              Create Workflow
            </SheetTitle>
          </SheetHeader>

          <div className="mt-4">
            <WorkflowEditorFields
              value={value}
              onChange={nextValue => setValue(cloneWorkflowInput(nextValue))}
              onAddStep={handleAddStep}
              onRemoveStep={handleRemoveStep}
              onMoveStep={handleMoveStep}
            />
          </div>
        </div>

        <SheetFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={creating} onClick={handleCreate}>
            {creating ? "Creating..." : "Create Workflow"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

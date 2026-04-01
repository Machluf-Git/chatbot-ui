import { Badge } from "@/components/ui/badge"
import { ChatbotUIContext } from "@/context/context"
import { cn } from "@/lib/utils"
import { WorkflowTemplate } from "@/types"
import { IconBinaryTree2 } from "@tabler/icons-react"
import { FC, useContext } from "react"

interface WorkflowItemProps {
  workflow: WorkflowTemplate
}

export const WorkflowItem: FC<WorkflowItemProps> = ({ workflow }) => {
  const { selectedWorkflowTemplate, setSelectedWorkflowTemplate } =
    useContext(ChatbotUIContext)

  const isSelected = selectedWorkflowTemplate?.id === workflow.id

  return (
    <button
      className={cn(
        "hover:bg-accent flex w-full flex-col items-start rounded-lg border p-3 text-left transition-opacity hover:opacity-80",
        isSelected && "bg-accent border-primary"
      )}
      onClick={() => setSelectedWorkflowTemplate(workflow)}
      type="button"
    >
      <div className="flex w-full items-center gap-2">
        <IconBinaryTree2 size={18} />
        <div className="truncate text-sm font-semibold">{workflow.name}</div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{workflow.status}</Badge>
        <Badge variant="outline">{workflow.trigger_type}</Badge>
      </div>

      <div className="text-muted-foreground mt-2 text-xs">
        Updated {new Date(workflow.updated_at).toLocaleString()}
      </div>
    </button>
  )
}

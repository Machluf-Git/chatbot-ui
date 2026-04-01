import { ContentType } from "@/types"
import {
  IconAdjustmentsHorizontal,
  IconBolt,
  IconBinaryTree2,
  IconBooks,
  IconFile,
  IconMessage,
  IconPencil,
  IconRobotFace,
  IconSparkles
} from "@tabler/icons-react"
import { FC, ReactNode, useContext, useMemo } from "react"
import { TabsList } from "../ui/tabs"
import { WithTooltip } from "../ui/with-tooltip"
import { AdminApiKeysSettings } from "../utility/admin-api-keys-settings"
import { ProfileSettings } from "../utility/profile-settings"
import { SidebarSwitchItem } from "./sidebar-switch-item"
import { ChatbotUIContext } from "@/context/context"

export const SIDEBAR_ICON_SIZE = 28

interface SidebarSwitcherProps {
  onContentTypeChange: (contentType: ContentType) => void
}

export const SidebarSwitcher: FC<SidebarSwitcherProps> = ({
  onContentTypeChange
}) => {
  const { profile, selectedWorkspace } = useContext(ChatbotUIContext)
  const isAdmin = Boolean(profile?.is_admin)
  const isWorkspaceOwner =
    Boolean(profile?.user_id) &&
    Boolean(selectedWorkspace?.user_id) &&
    profile?.user_id === selectedWorkspace?.user_id

  const items = useMemo(
    () =>
      [
        { icon: <IconMessage size={SIDEBAR_ICON_SIZE} />, contentType: "chats" },
        {
          icon: <IconAdjustmentsHorizontal size={SIDEBAR_ICON_SIZE} />,
          contentType: "presets"
        },
        { icon: <IconPencil size={SIDEBAR_ICON_SIZE} />, contentType: "prompts" },
        isAdmin
          ? {
              icon: <IconSparkles size={SIDEBAR_ICON_SIZE} />,
              contentType: "models"
            }
          : null,
        { icon: <IconFile size={SIDEBAR_ICON_SIZE} />, contentType: "files" },
        {
          icon: <IconBooks size={SIDEBAR_ICON_SIZE} />,
          contentType: "collections"
        },
        {
          icon: <IconRobotFace size={SIDEBAR_ICON_SIZE} />,
          contentType: "assistants"
        },
        isWorkspaceOwner
          ? {
              icon: <IconBinaryTree2 size={SIDEBAR_ICON_SIZE} />,
              contentType: "workflows"
            }
          : null,
        { icon: <IconBolt size={SIDEBAR_ICON_SIZE} />, contentType: "tools" }
      ].filter(Boolean) as { icon: ReactNode; contentType: ContentType }[],
    [isAdmin, isWorkspaceOwner]
  )

  return (
    <div className="flex flex-col justify-between border-r-2 pb-5">
      <TabsList
        className="bg-background grid h-[440px]"
        style={{
          gridTemplateRows: `repeat(${items.length}, minmax(0, 1fr))`
        }}
      >
        {items.map(item => (
          <SidebarSwitchItem
            key={item.contentType}
            icon={item.icon}
            contentType={item.contentType}
            onContentTypeChange={onContentTypeChange}
          />
        ))}
      </TabsList>

      <div className="flex flex-col items-center space-y-4">
        {/* TODO */}
        {/* <WithTooltip display={<div>Import</div>} trigger={<Import />} /> */}

        {/* TODO */}
        {/* <Alerts /> */}

        <WithTooltip
          display={<div>Profile Settings</div>}
          trigger={<ProfileSettings />}
        />

        <WithTooltip
          display={<div>Admin Settings</div>}
          trigger={<AdminApiKeysSettings />}
        />
      </div>
    </div>
  )
}

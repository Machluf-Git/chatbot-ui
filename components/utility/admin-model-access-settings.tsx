"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { IconLoader2 } from "@tabler/icons-react"
import { FC, useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type AdminUser = {
  user_id: string
  username: string
  display_name: string
  is_admin: boolean
}

type ModelAccessEntry = {
  modelKey: string
  provider: string
  modelId: string
  modelName: string
  source: "hosted" | "openrouter" | "custom"
  isGlobal: boolean
  allowedUserIds: string[]
}

interface AdminModelAccessSettingsProps {
  isOpen: boolean
}

export const AdminModelAccessSettings: FC<AdminModelAccessSettingsProps> = ({
  isOpen
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<AdminUser[]>([])
  const [models, setModels] = useState<ModelAccessEntry[]>([])
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const loadSettings = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/models/access")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to load model access settings")
      }

      setUsers(data.users || [])
      setModels(data.models || [])
      setLoaded(true)
    } catch (error: any) {
      toast.error(error.message || "Failed to load model access settings")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen && !loaded && !isLoading) {
      void loadSettings()
    }
  }, [isLoading, isOpen, loaded, loadSettings])

  const userOptions = useMemo(() => {
    return users.map(user => ({
      id: user.user_id,
      label: user.display_name || user.username || user.user_id,
      isAdmin: user.is_admin
    }))
  }, [users])

  const filteredModels = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return models

    return models.filter(model => {
      return (
        model.modelName.toLowerCase().includes(normalized) ||
        model.modelId.toLowerCase().includes(normalized) ||
        model.provider.toLowerCase().includes(normalized) ||
        model.modelKey.toLowerCase().includes(normalized)
      )
    })
  }, [models, query])

  const updateModelLocal = (
    modelKey: string,
    patch: Partial<Pick<ModelAccessEntry, "isGlobal" | "allowedUserIds">>
  ) => {
    setModels(prev =>
      prev.map(model =>
        model.modelKey === modelKey
          ? {
              ...model,
              ...patch
            }
          : model
      )
    )
  }

  const handleSave = async (model: ModelAccessEntry) => {
    setSavingKey(model.modelKey)
    try {
      const response = await fetch("/api/admin/models/access", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          modelKey: model.modelKey,
          isGlobal: model.isGlobal,
          allowedUserIds: model.allowedUserIds
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update model access")
      }

      toast.success(`Saved access policy for ${model.modelName}`)
    } catch (error: any) {
      toast.error(error.message || "Failed to update model access")
    } finally {
      setSavingKey(null)
    }
  }

  const getAllowedUsersSummary = (model: ModelAccessEntry) => {
    if (model.allowedUserIds.length === 0) {
      return "No users selected"
    }

    if (model.allowedUserIds.length === 1) {
      const selected = userOptions.find(u => u.id === model.allowedUserIds[0])
      return selected?.label || "1 user selected"
    }

    return `${model.allowedUserIds.length} users selected`
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="space-y-1">
        <Label>Search models</Label>
        <Input
          placeholder="Search by name, provider, or key..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <IconLoader2 className="animate-spin" size={16} />
          Loading model access settings...
        </div>
      ) : (
        <div className="space-y-3">
          {filteredModels.length === 0 && (
            <div className="text-muted-foreground rounded-md border p-3 text-sm">
              No models found.
            </div>
          )}

          {filteredModels.map(model => (
            <div className="space-y-3 rounded-md border p-3" key={model.modelKey}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">{model.modelName}</div>
                  <div className="text-muted-foreground text-xs">
                    {model.provider.toUpperCase()} • {model.modelId} •{" "}
                    {model.source.toUpperCase()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`global-${model.modelKey}`}>
                    Available to all users
                  </Label>
                  <Switch
                    id={`global-${model.modelKey}`}
                    checked={model.isGlobal}
                    onCheckedChange={checked =>
                      updateModelLocal(model.modelKey, { isGlobal: checked })
                    }
                  />
                </div>
              </div>

              {!model.isGlobal && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Allowed users</div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full justify-between" variant="outline">
                        <span>{getAllowedUsersSummary(model)}</span>
                        <span className="text-muted-foreground text-xs">
                          Select users
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-72 w-72 overflow-y-auto">
                      {userOptions.map(user => {
                        const checked = model.allowedUserIds.includes(user.id)
                        return (
                          <DropdownMenuCheckboxItem
                            key={`${model.modelKey}-${user.id}`}
                            checked={checked}
                            onCheckedChange={nextChecked => {
                              const allow = Boolean(nextChecked)
                              const nextUserIds = allow
                                ? [...model.allowedUserIds, user.id]
                                : model.allowedUserIds.filter(id => id !== user.id)

                              updateModelLocal(model.modelKey, {
                                allowedUserIds: [...new Set(nextUserIds)]
                              })
                            }}
                          >
                            {user.label}
                            {user.isAdmin ? " (admin)" : ""}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  disabled={savingKey === model.modelKey}
                  onClick={() =>
                    handleSave(models.find(m => m.modelKey === model.modelKey)!)
                  }
                  size="sm"
                >
                  {savingKey === model.modelKey ? "Saving..." : "Save Access"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

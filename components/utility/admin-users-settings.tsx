"use client"

import { ChatbotUIContext } from "@/context/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { IconLoader2 } from "@tabler/icons-react"
import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"

type AdminUser = {
  id: string
  user_id: string
  username: string
  display_name: string
  is_admin: boolean
  created_at: string
}

interface AdminUsersSettingsProps {
  isOpen: boolean
}

export const AdminUsersSettings: FC<AdminUsersSettingsProps> = ({ isOpen }) => {
  const { profile } = useContext(ChatbotUIContext)
  const [isLoading, setIsLoading] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState("")
  const [savingUserId, setSavingUserId] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/users", { method: "GET" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to load users")
      }

      setUsers(data.users || [])
    } catch (error: any) {
      toast.error(error.message || "Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      void loadUsers()
    }
  }, [isOpen, loadUsers])

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return users

    return users.filter(user => {
      const username = (user.username || "").toLowerCase()
      const displayName = (user.display_name || "").toLowerCase()
      const userId = (user.user_id || "").toLowerCase()

      return (
        username.includes(normalized) ||
        displayName.includes(normalized) ||
        userId.includes(normalized)
      )
    })
  }, [query, users])

  const handleToggleAdmin = async (user: AdminUser, nextIsAdmin: boolean) => {
    setSavingUserId(user.user_id)
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          userId: user.user_id,
          isAdmin: nextIsAdmin
        })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update role")
      }

      setUsers(prev =>
        prev.map(current =>
          current.user_id === user.user_id
            ? { ...current, is_admin: nextIsAdmin }
            : current
        )
      )
      toast.success(
        `${user.display_name || user.username || user.user_id} is now ${nextIsAdmin ? "admin" : "regular"}`
      )
    } catch (error: any) {
      toast.error(error.message || "Failed to update role")
    } finally {
      setSavingUserId(null)
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="space-y-1">
        <Label>Search users</Label>
        <Input
          placeholder="Search by username, display name, or user id..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <IconLoader2 className="animate-spin" size={16} />
          Loading users...
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <div className="text-muted-foreground rounded-md border p-3 text-sm">
              No users found.
            </div>
          ) : (
            filteredUsers.map(user => {
              const isSelf = user.user_id === profile?.user_id
              const isSaving = savingUserId === user.user_id
              return (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                  key={user.user_id}
                >
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {user.display_name || user.username || user.user_id}
                    </div>
                    <div className="text-muted-foreground truncate text-xs">
                      @{user.username || "no-username"} • {user.user_id}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor={`admin-${user.user_id}`}>Admin</Label>
                    <Switch
                      id={`admin-${user.user_id}`}
                      checked={user.is_admin}
                      disabled={isSelf || isSaving}
                      onCheckedChange={checked =>
                        handleToggleAdmin(user, Boolean(checked))
                      }
                    />
                    {isSelf ? (
                      <Button variant="ghost" size="sm" disabled>
                        You
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

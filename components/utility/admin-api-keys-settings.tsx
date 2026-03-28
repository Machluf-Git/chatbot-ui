"use client"

import { ChatbotUIContext } from "@/context/context"
import { IconKey, IconLoader2 } from "@tabler/icons-react"
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react"
import { toast } from "sonner"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { Switch } from "../ui/switch"

type EntryState = {
  configured: boolean
  maskedValue: string | null
  value: string | null
  sensitive: boolean
}

const fieldLabels: Record<string, string> = {
  openai_api_key: "OpenAI API Key",
  openai_organization_id: "OpenAI Organization ID",
  azure_openai_api_key: "Azure OpenAI API Key",
  azure_openai_endpoint: "Azure OpenAI Endpoint",
  azure_openai_35_turbo_id: "Azure GPT-3.5 Turbo Deployment Name",
  azure_openai_45_turbo_id: "Azure GPT-4.5 Turbo Deployment Name",
  azure_openai_45_vision_id: "Azure GPT-4.5 Vision Deployment Name",
  azure_openai_embeddings_id: "Azure Embeddings Deployment Name",
  use_azure_openai: "Use Azure OpenAI",
  anthropic_api_key: "Anthropic API Key",
  google_gemini_api_key: "Google Gemini API Key",
  mistral_api_key: "Mistral API Key",
  groq_api_key: "Groq API Key",
  perplexity_api_key: "Perplexity API Key",
  openrouter_api_key: "OpenRouter API Key"
}

const keyFields = Object.keys(fieldLabels).filter(
  field => field !== "use_azure_openai"
)

interface AdminApiKeysSettingsProps {}

export const AdminApiKeysSettings: FC<AdminApiKeysSettingsProps> = ({}) => {
  const { profile } = useContext(ChatbotUIContext)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [entries, setEntries] = useState<Record<string, EntryState>>({})
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [useAzureOpenai, setUseAzureOpenai] = useState(false)

  const isAdmin = !!profile?.is_admin

  const loadEntries = useCallback(async () => {
    if (!isAdmin) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/api-keys", { method: "GET" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to load API keys")
      }

      const loadedEntries = data.entries as Record<string, EntryState>
      setEntries(loadedEntries)

      const nonSensitiveValues = Object.entries(loadedEntries).reduce<
        Record<string, string>
      >((acc, [field, entry]) => {
        if (!entry.sensitive && entry.value) {
          acc[field] = entry.value
        } else {
          acc[field] = ""
        }
        return acc
      }, {})

      setFormValues(nonSensitiveValues)
      setUseAzureOpenai(loadedEntries.use_azure_openai?.value === "true")
    } catch (error: any) {
      toast.error(error.message || "Failed to load API keys")
    } finally {
      setIsLoading(false)
    }
  }, [isAdmin])

  useEffect(() => {
    if (isOpen) {
      loadEntries()
    }
  }, [isOpen, loadEntries])

  const configuredCount = useMemo(() => {
    return Object.values(entries).filter(entry => entry.configured).length
  }, [entries])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const updates: Record<string, string | boolean> = {
        use_azure_openai: useAzureOpenai
      }

      for (const field of keyFields) {
        const value = formValues[field] ?? ""
        if (value.trim()) {
          updates[field] = value.trim()
        }
      }

      const response = await fetch("/api/admin/api-keys", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ updates })
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to save API keys")
      }

      toast.success("Global API keys updated")
      await loadEntries()
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to save API keys")
    } finally {
      setIsSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      buttonRef.current?.click()
    }
  }

  if (!isAdmin) return null

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost">
          <IconKey size={SIDEBAR_ICON_SIZE} />
        </Button>
      </SheetTrigger>

      <SheetContent
        className="flex flex-col justify-between"
        side="left"
        onKeyDown={handleKeyDown}
      >
        <div className="grow overflow-auto">
          <SheetHeader>
            <SheetTitle>API Keys (Admin)</SheetTitle>
          </SheetHeader>

          {isLoading ? (
            <div className="text-muted-foreground mt-6 flex items-center gap-2 text-sm">
              <IconLoader2 className="animate-spin" size={16} />
              Loading key settings...
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-md border p-3 text-sm">
                Configured fields: {configuredCount}
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="use_azure_openai">
                  {fieldLabels.use_azure_openai}
                </Label>
                <Switch
                  id="use_azure_openai"
                  checked={useAzureOpenai}
                  onCheckedChange={setUseAzureOpenai}
                />
              </div>

              {keyFields.map(field => {
                const entry = entries[field]
                const statusLabel = entry?.configured
                  ? entry.maskedValue || "Configured"
                  : "Not configured"

                return (
                  <div className="space-y-1" key={field}>
                    <Label>{fieldLabels[field] || field}</Label>
                    <Input
                      placeholder={
                        entry?.configured
                          ? `Current: ${statusLabel}. Enter new value to replace`
                          : "Enter value"
                      }
                      type={entry?.sensitive ? "password" : "text"}
                      value={formValues[field] || ""}
                      onChange={e =>
                        setFormValues(prev => ({
                          ...prev,
                          [field]: e.target.value
                        }))
                      }
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end space-x-2">
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>

          <Button
            ref={buttonRef}
            disabled={isLoading || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

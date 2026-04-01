import { Database } from "@/supabase/types"
import { getServerAuthContext } from "@/lib/server/admin"
import { buildModelKey, getModelPolicies, isModelAllowedForUser } from "@/lib/server/model-access"
import { ChatSettings } from "@/types"
import { createClient } from "@supabase/supabase-js"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { chatSettings, messages, customModelId } = json as {
    chatSettings: ChatSettings
    messages: any[]
    customModelId: string
  }

  try {
    const { user, profile } = await getServerAuthContext()
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: customModel, error } = await supabaseAdmin
      .from("models")
      .select("*")
      .eq("id", customModelId)
      .single()

    if (!customModel) {
      throw new Error(error.message)
    }

    if (!profile.is_admin) {
      const modelKey = buildModelKey("custom", customModel.model_id)
      const { byKey, allowedUsersByKey } = await getModelPolicies(
        supabaseAdmin,
        [modelKey]
      )

      const allowed = isModelAllowedForUser({
        isAdmin: false,
        userId: user.id,
        modelKey,
        policyByKey: byKey,
        allowedUsersByKey
      })

      if (!allowed) {
        throw new Error("Forbidden")
      }
    }

    const custom = new OpenAI({
      apiKey: customModel.api_key || "",
      baseURL: customModel.base_url
    })

    const response = await custom.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      stream: true
    })

    const stream = OpenAIStream(response)

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    const message = String(error?.message || "")
    const normalized = message.toLowerCase()

    if (normalized === "user not found") {
      return new Response(
        JSON.stringify({ message: "You need to sign in before using custom chat." }),
        { status: 401 }
      )
    }

    if (normalized === "profile not found") {
      return new Response(
        JSON.stringify({
          message: "Your profile is not ready yet. Please sign out and sign in again."
        }),
        { status: 404 }
      )
    }

    if (error.message === "Forbidden") {
      return new Response(JSON.stringify({ message: "Forbidden" }), {
        status: 403
      })
    }

    let errorMessage = message || "An unexpected error occurred"
    const errorCode = error.status || 500

    if (errorMessage.toLowerCase().includes("api key not found")) {
      errorMessage =
        "Custom API Key not found. Please set it in your profile settings."
    } else if (errorMessage.toLowerCase().includes("incorrect api key")) {
      errorMessage =
        "Custom API Key is incorrect. Please fix it in your profile settings."
    }

    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}

import { supabase } from "@/lib/supabase/browser-client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const getModelById = async (modelId: string) => {
  const { data: model, error } = await supabase
    .from("models")
    .select("*")
    .eq("id", modelId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!model) {
    throw new Error("Model not found")
  }

  return model
}

export const getModelWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      name,
      models (*)
    `
    )
    .eq("id", workspaceId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!workspace) {
    throw new Error("Workspace not found")
  }

  return workspace
}

export const getModelWorkspacesByModelId = async (modelId: string) => {
  const { data: model, error } = await supabase
    .from("models")
    .select(
      `
      id, 
      name, 
      workspaces (*)
    `
    )
    .eq("id", modelId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!model) {
    throw new Error("Model not found")
  }

  return model
}

export const createModel = async (
  model: TablesInsert<"models">,
  workspace_id: string
) => {
  const { data: createdModel, error } = await supabase
    .from("models")
    .insert([model])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await createModelWorkspace({
    user_id: model.user_id,
    model_id: createdModel.id,
    workspace_id: workspace_id
  })

  return createdModel
}

export const createModels = async (
  models: TablesInsert<"models">[],
  workspace_id: string
) => {
  const { data: createdModels, error } = await supabase
    .from("models")
    .insert(models)
    .select("*")

  if (error) {
    throw new Error(error.message)
  }

  await createModelWorkspaces(
    createdModels.map(model => ({
      user_id: model.user_id,
      model_id: model.id,
      workspace_id
    }))
  )

  return createdModels
}

export const createModelWorkspace = async (item: {
  user_id: string
  model_id: string
  workspace_id: string
}) => {
  const { data: createdModelWorkspace, error } = await supabase
    .from("model_workspaces")
    .insert([item])
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!createdModelWorkspace) {
    throw new Error("Failed to create model workspace")
  }

  return createdModelWorkspace
}

export const createModelWorkspaces = async (
  items: { user_id: string; model_id: string; workspace_id: string }[]
) => {
  const { data: createdModelWorkspaces, error } = await supabase
    .from("model_workspaces")
    .insert(items)
    .select("*")

  if (error) throw new Error(error.message)

  return createdModelWorkspaces
}

export const updateModel = async (
  modelId: string,
  model: TablesUpdate<"models">
) => {
  const { data: updatedModel, error } = await supabase
    .from("models")
    .update(model)
    .eq("id", modelId)
    .select("*")
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!updatedModel) {
    throw new Error("Failed to update model")
  }

  return updatedModel
}

export const deleteModel = async (modelId: string) => {
  const { error } = await supabase.from("models").delete().eq("id", modelId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}

export const deleteModelWorkspace = async (
  modelId: string,
  workspaceId: string
) => {
  const { error } = await supabase
    .from("model_workspaces")
    .delete()
    .eq("model_id", modelId)
    .eq("workspace_id", workspaceId)

  if (error) throw new Error(error.message)

  return true
}

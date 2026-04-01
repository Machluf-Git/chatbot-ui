# Supabase Tables Documentation

Source: `supabase/types.ts`

Generated: 2026-03-30T17:02:59.100Z

This document lists all tables currently defined in Supabase type definitions, including columns and foreign-key relationships.

## public Schema

Total tables: **33**

### Table List

- `assistant_collections`
- `assistant_files`
- `assistant_tools`
- `assistant_workspaces`
- `assistants`
- `chat_files`
- `chats`
- `collection_files`
- `collection_workspaces`
- `collections`
- `file_items`
- `file_workspaces`
- `files`
- `folders`
- `message_file_items`
- `messages`
- `model_workspaces`
- `app_api_keys`
- `models`
- `preset_workspaces`
- `presets`
- `profiles`
- `prompt_workspaces`
- `prompts`
- `tool_workspaces`
- `tools`
- `workflow_approvals`
- `workflow_events`
- `workflow_run_steps`
- `workflow_runs`
- `workflow_template_steps`
- `workflow_templates`
- `workspaces`

### `assistant_collections`

**Columns (5)**

| Column | Type |
|---|---|
| `assistant_id` | `string` |
| `collection_id` | `string` |
| `created_at` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (3)**

- `assistant_collections_assistant_id_fkey`: `assistant_id` -> `assistants.id`
- `assistant_collections_collection_id_fkey`: `collection_id` -> `collections.id`
- `assistant_collections_user_id_fkey`: `user_id` -> `users.id`

### `assistant_files`

**Columns (5)**

| Column | Type |
|---|---|
| `assistant_id` | `string` |
| `created_at` | `string` |
| `file_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (3)**

- `assistant_files_assistant_id_fkey`: `assistant_id` -> `assistants.id`
- `assistant_files_file_id_fkey`: `file_id` -> `files.id`
- `assistant_files_user_id_fkey`: `user_id` -> `users.id`

### `assistant_tools`

**Columns (5)**

| Column | Type |
|---|---|
| `assistant_id` | `string` |
| `created_at` | `string` |
| `tool_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (3)**

- `assistant_tools_assistant_id_fkey`: `assistant_id` -> `assistants.id`
- `assistant_tools_tool_id_fkey`: `tool_id` -> `tools.id`
- `assistant_tools_user_id_fkey`: `user_id` -> `users.id`

### `assistant_workspaces`

**Columns (5)**

| Column | Type |
|---|---|
| `assistant_id` | `string` |
| `created_at` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (3)**

- `assistant_workspaces_assistant_id_fkey`: `assistant_id` -> `assistants.id`
- `assistant_workspaces_user_id_fkey`: `user_id` -> `users.id`
- `assistant_workspaces_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `assistants`

**Columns (16)**

| Column | Type |
|---|---|
| `context_length` | `number` |
| `created_at` | `string` |
| `description` | `string` |
| `embeddings_provider` | `string` |
| `folder_id` | `string \| null` |
| `id` | `string` |
| `image_path` | `string` |
| `include_profile_context` | `boolean` |
| `include_workspace_instructions` | `boolean` |
| `model` | `string` |
| `name` | `string` |
| `prompt` | `string` |
| `sharing` | `string` |
| `temperature` | `number` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (2)**

- `assistants_folder_id_fkey`: `folder_id` -> `folders.id`
- `assistants_user_id_fkey`: `user_id` -> `users.id`

### `chat_files`

**Columns (5)**

| Column | Type |
|---|---|
| `chat_id` | `string` |
| `created_at` | `string` |
| `file_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (3)**

- `chat_files_chat_id_fkey`: `chat_id` -> `chats.id`
- `chat_files_file_id_fkey`: `file_id` -> `files.id`
- `chat_files_user_id_fkey`: `user_id` -> `users.id`

### `chats`

**Columns (16)**

| Column | Type |
|---|---|
| `assistant_id` | `string \| null` |
| `context_length` | `number` |
| `created_at` | `string` |
| `embeddings_provider` | `string` |
| `folder_id` | `string \| null` |
| `id` | `string` |
| `include_profile_context` | `boolean` |
| `include_workspace_instructions` | `boolean` |
| `model` | `string` |
| `name` | `string` |
| `prompt` | `string` |
| `sharing` | `string` |
| `temperature` | `number` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (4)**

- `chats_assistant_id_fkey`: `assistant_id` -> `assistants.id`
- `chats_folder_id_fkey`: `folder_id` -> `folders.id`
- `chats_user_id_fkey`: `user_id` -> `users.id`
- `chats_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `collection_files`

**Columns (5)**

| Column | Type |
|---|---|
| `collection_id` | `string` |
| `created_at` | `string` |
| `file_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (3)**

- `collection_files_collection_id_fkey`: `collection_id` -> `collections.id`
- `collection_files_file_id_fkey`: `file_id` -> `files.id`
- `collection_files_user_id_fkey`: `user_id` -> `users.id`

### `collection_workspaces`

**Columns (5)**

| Column | Type |
|---|---|
| `collection_id` | `string` |
| `created_at` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (3)**

- `collection_workspaces_collection_id_fkey`: `collection_id` -> `collections.id`
- `collection_workspaces_user_id_fkey`: `user_id` -> `users.id`
- `collection_workspaces_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `collections`

**Columns (8)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `description` | `string` |
| `folder_id` | `string \| null` |
| `id` | `string` |
| `name` | `string` |
| `sharing` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (2)**

- `collections_folder_id_fkey`: `folder_id` -> `folders.id`
- `collections_user_id_fkey`: `user_id` -> `users.id`

### `file_items`

**Columns (10)**

| Column | Type |
|---|---|
| `content` | `string` |
| `created_at` | `string` |
| `file_id` | `string` |
| `id` | `string` |
| `local_embedding` | `string \| null` |
| `openai_embedding` | `string \| null` |
| `sharing` | `string` |
| `tokens` | `number` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (2)**

- `file_items_file_id_fkey`: `file_id` -> `files.id`
- `file_items_user_id_fkey`: `user_id` -> `users.id`

### `file_workspaces`

**Columns (5)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `file_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (3)**

- `file_workspaces_file_id_fkey`: `file_id` -> `files.id`
- `file_workspaces_user_id_fkey`: `user_id` -> `users.id`
- `file_workspaces_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `files`

**Columns (12)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `description` | `string` |
| `file_path` | `string` |
| `folder_id` | `string \| null` |
| `id` | `string` |
| `name` | `string` |
| `sharing` | `string` |
| `size` | `number` |
| `tokens` | `number` |
| `type` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (2)**

- `files_folder_id_fkey`: `folder_id` -> `folders.id`
- `files_user_id_fkey`: `user_id` -> `users.id`

### `folders`

**Columns (8)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `description` | `string` |
| `id` | `string` |
| `name` | `string` |
| `type` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (2)**

- `folders_user_id_fkey`: `user_id` -> `users.id`
- `folders_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `message_file_items`

**Columns (5)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `file_item_id` | `string` |
| `message_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (3)**

- `message_file_items_file_item_id_fkey`: `file_item_id` -> `file_items.id`
- `message_file_items_message_id_fkey`: `message_id` -> `messages.id`
- `message_file_items_user_id_fkey`: `user_id` -> `users.id`

### `messages`

**Columns (11)**

| Column | Type |
|---|---|
| `assistant_id` | `string \| null` |
| `chat_id` | `string` |
| `content` | `string` |
| `created_at` | `string` |
| `id` | `string` |
| `image_paths` | `string[]` |
| `model` | `string` |
| `role` | `string` |
| `sequence_number` | `number` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (3)**

- `messages_assistant_id_fkey`: `assistant_id` -> `assistants.id`
- `messages_chat_id_fkey`: `chat_id` -> `chats.id`
- `messages_user_id_fkey`: `user_id` -> `users.id`

### `model_workspaces`

**Columns (5)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `model_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (3)**

- `model_workspaces_model_id_fkey`: `model_id` -> `models.id`
- `model_workspaces_user_id_fkey`: `user_id` -> `users.id`
- `model_workspaces_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `app_api_keys`

**Columns (4)**

| Column | Type |
|---|---|
| `api_key` | `string` |
| `provider` | `string` |
| `updated_at` | `string` |
| `updated_by` | `string \| null` |

**Relationships (1)**

- `app_api_keys_updated_by_fkey`: `updated_by` -> `users.id`

### `models`

**Columns (12)**

| Column | Type |
|---|---|
| `api_key` | `string` |
| `base_url` | `string` |
| `context_length` | `number` |
| `created_at` | `string` |
| `description` | `string` |
| `folder_id` | `string \| null` |
| `id` | `string` |
| `model_id` | `string` |
| `name` | `string` |
| `sharing` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (2)**

- `models_folder_id_fkey`: `folder_id` -> `folders.id`
- `models_user_id_fkey`: `user_id` -> `users.id`

### `preset_workspaces`

**Columns (5)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `preset_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (3)**

- `preset_workspaces_preset_id_fkey`: `preset_id` -> `presets.id`
- `preset_workspaces_user_id_fkey`: `user_id` -> `users.id`
- `preset_workspaces_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `presets`

**Columns (15)**

| Column | Type |
|---|---|
| `context_length` | `number` |
| `created_at` | `string` |
| `description` | `string` |
| `embeddings_provider` | `string` |
| `folder_id` | `string \| null` |
| `id` | `string` |
| `include_profile_context` | `boolean` |
| `include_workspace_instructions` | `boolean` |
| `model` | `string` |
| `name` | `string` |
| `prompt` | `string` |
| `sharing` | `string` |
| `temperature` | `number` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (2)**

- `presets_folder_id_fkey`: `folder_id` -> `folders.id`
- `presets_user_id_fkey`: `user_id` -> `users.id`

### `profiles`

**Columns (27)**

| Column | Type |
|---|---|
| `anthropic_api_key` | `string \| null` |
| `azure_openai_35_turbo_id` | `string \| null` |
| `azure_openai_45_turbo_id` | `string \| null` |
| `azure_openai_45_vision_id` | `string \| null` |
| `azure_openai_api_key` | `string \| null` |
| `azure_openai_embeddings_id` | `string \| null` |
| `azure_openai_endpoint` | `string \| null` |
| `bio` | `string` |
| `created_at` | `string` |
| `display_name` | `string` |
| `google_gemini_api_key` | `string \| null` |
| `groq_api_key` | `string \| null` |
| `has_onboarded` | `boolean` |
| `id` | `string` |
| `image_path` | `string` |
| `image_url` | `string` |
| `is_admin` | `boolean` |
| `mistral_api_key` | `string \| null` |
| `openai_api_key` | `string \| null` |
| `openai_organization_id` | `string \| null` |
| `openrouter_api_key` | `string \| null` |
| `perplexity_api_key` | `string \| null` |
| `profile_context` | `string` |
| `updated_at` | `string \| null` |
| `use_azure_openai` | `boolean` |
| `user_id` | `string` |
| `username` | `string` |

**Relationships (1)**

- `profiles_user_id_fkey`: `user_id` -> `users.id`

### `prompt_workspaces`

**Columns (5)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `prompt_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (3)**

- `prompt_workspaces_prompt_id_fkey`: `prompt_id` -> `prompts.id`
- `prompt_workspaces_user_id_fkey`: `user_id` -> `users.id`
- `prompt_workspaces_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `prompts`

**Columns (8)**

| Column | Type |
|---|---|
| `content` | `string` |
| `created_at` | `string` |
| `folder_id` | `string \| null` |
| `id` | `string` |
| `name` | `string` |
| `sharing` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (2)**

- `prompts_folder_id_fkey`: `folder_id` -> `folders.id`
- `prompts_user_id_fkey`: `user_id` -> `users.id`

### `tool_workspaces`

**Columns (5)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `tool_id` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |
| `workspace_id` | `string` |

**Relationships (3)**

- `tool_workspaces_tool_id_fkey`: `tool_id` -> `tools.id`
- `tool_workspaces_user_id_fkey`: `user_id` -> `users.id`
- `tool_workspaces_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `tools`

**Columns (11)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `custom_headers` | `Json` |
| `description` | `string` |
| `folder_id` | `string \| null` |
| `id` | `string` |
| `name` | `string` |
| `schema` | `Json` |
| `sharing` | `string` |
| `updated_at` | `string \| null` |
| `url` | `string` |
| `user_id` | `string` |

**Relationships (2)**

- `tools_folder_id_fkey`: `folder_id` -> `folders.id`
- `tools_user_id_fkey`: `user_id` -> `users.id`

### `workspaces`

**Columns (17)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `default_context_length` | `number` |
| `default_model` | `string` |
| `default_prompt` | `string` |
| `default_temperature` | `number` |
| `description` | `string` |
| `embeddings_provider` | `string` |
| `id` | `string` |
| `image_path` | `string` |
| `include_profile_context` | `boolean` |
| `include_workspace_instructions` | `boolean` |
| `instructions` | `string` |
| `is_home` | `boolean` |
| `name` | `string` |
| `sharing` | `string` |
| `updated_at` | `string \| null` |
| `user_id` | `string` |

**Relationships (1)**

- `workspaces_user_id_fkey`: `user_id` -> `users.id`

## storage Schema

Total tables: **3**

### Table List

- `buckets`
- `migrations`
- `objects`

### `buckets`

**Columns (10)**

| Column | Type |
|---|---|
| `allowed_mime_types` | `string[] \| null` |
| `avif_autodetection` | `boolean \| null` |
| `created_at` | `string \| null` |
| `file_size_limit` | `number \| null` |
| `id` | `string` |
| `name` | `string` |
| `owner` | `string \| null` |
| `owner_id` | `string \| null` |
| `public` | `boolean \| null` |
| `updated_at` | `string \| null` |

**Relationships (0)**

- None

### `migrations`

**Columns (4)**

| Column | Type |
|---|---|
| `executed_at` | `string \| null` |
| `hash` | `string` |
| `id` | `number` |
| `name` | `string` |

**Relationships (0)**

- None

### `objects`

**Columns (11)**

| Column | Type |
|---|---|
| `bucket_id` | `string \| null` |
| `created_at` | `string \| null` |
| `id` | `string` |
| `last_accessed_at` | `string \| null` |
| `metadata` | `Json \| null` |
| `name` | `string \| null` |
| `owner` | `string \| null` |
| `owner_id` | `string \| null` |
| `path_tokens` | `string[] \| null` |
| `updated_at` | `string \| null` |
| `version` | `string \| null` |

**Relationships (1)**

- `objects_bucketId_fkey`: `bucket_id` -> `buckets.id`


### `workflow_approvals`

**Columns (15)**

| Column | Type |
|---|---|
| `approval_payload` | `Json` |
| `approver_group` | `string \| null` |
| `approver_user_id` | `string \| null` |
| `created_at` | `string` |
| `decision_at` | `string \| null` |
| `decision_by` | `string \| null` |
| `decision_note` | `string \| null` |
| `expires_at` | `string \| null` |
| `id` | `string` |
| `requested_at` | `string` |
| `requested_by` | `string \| null` |
| `run_id` | `string` |
| `run_step_id` | `string` |
| `status` | `string` |
| `updated_at` | `string` |

**Relationships (5)**

- `workflow_approvals_approver_user_id_fkey`: `approver_user_id` -> `users.id`
- `workflow_approvals_decision_by_fkey`: `decision_by` -> `users.id`
- `workflow_approvals_requested_by_fkey`: `requested_by` -> `users.id`
- `workflow_approvals_run_id_fkey`: `run_id` -> `workflow_runs.id`
- `workflow_approvals_run_step_id_fkey`: `run_step_id` -> `workflow_run_steps.id`

### `workflow_events`

**Columns (10)**

| Column | Type |
|---|---|
| `emitted_by_id` | `string \| null` |
| `emitted_by_type` | `string` |
| `event_type` | `string` |
| `id` | `number` |
| `level` | `string` |
| `message` | `string` |
| `occurred_at` | `string` |
| `payload` | `Json` |
| `run_id` | `string` |
| `run_step_id` | `string \| null` |

**Relationships (2)**

- `workflow_events_run_id_fkey`: `run_id` -> `workflow_runs.id`
- `workflow_events_run_step_id_fkey`: `run_step_id` -> `workflow_run_steps.id`

### `workflow_run_steps`

**Columns (19)**

| Column | Type |
|---|---|
| `attempt` | `number` |
| `cost_usd` | `number \| null` |
| `created_at` | `string` |
| `error_code` | `string \| null` |
| `error_message` | `string \| null` |
| `finished_at` | `string \| null` |
| `id` | `string` |
| `input_payload` | `Json` |
| `model_used` | `string \| null` |
| `output_payload` | `Json \| null` |
| `run_id` | `string` |
| `started_at` | `string \| null` |
| `status` | `string` |
| `step_key` | `string` |
| `template_step_id` | `string \| null` |
| `tokens_in` | `number \| null` |
| `tokens_out` | `number \| null` |
| `tool_used` | `string \| null` |
| `updated_at` | `string` |

**Relationships (2)**

- `workflow_run_steps_run_id_fkey`: `run_id` -> `workflow_runs.id`
- `workflow_run_steps_template_step_id_fkey`: `template_step_id` -> `workflow_template_steps.id`

### `workflow_runs`

**Columns (19)**

| Column | Type |
|---|---|
| `context_payload` | `Json` |
| `created_at` | `string` |
| `created_by` | `string \| null` |
| `current_step_key` | `string \| null` |
| `error_code` | `string \| null` |
| `error_message` | `string \| null` |
| `finished_at` | `string \| null` |
| `id` | `string` |
| `input_payload` | `Json` |
| `output_payload` | `Json \| null` |
| `started_at` | `string \| null` |
| `status` | `string` |
| `template_id` | `string \| null` |
| `template_snapshot` | `Json` |
| `template_version` | `number` |
| `trigger_ref` | `string \| null` |
| `trigger_source` | `string` |
| `updated_at` | `string` |
| `workspace_id` | `string` |

**Relationships (3)**

- `workflow_runs_created_by_fkey`: `created_by` -> `users.id`
- `workflow_runs_template_id_fkey`: `template_id` -> `workflow_templates.id`
- `workflow_runs_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

### `workflow_template_steps`

**Columns (17)**

| Column | Type |
|---|---|
| `config` | `Json` |
| `created_at` | `string` |
| `id` | `string` |
| `input_mapping` | `Json` |
| `is_required` | `boolean` |
| `on_failure_step_key` | `string \| null` |
| `on_success_step_key` | `string \| null` |
| `output_schema` | `Json` |
| `retry_backoff_seconds` | `number` |
| `retry_max` | `number` |
| `step_key` | `string` |
| `step_order` | `number` |
| `step_type` | `string` |
| `template_id` | `string` |
| `timeout_seconds` | `number` |
| `title` | `string` |
| `updated_at` | `string` |

**Relationships (1)**

- `workflow_template_steps_template_id_fkey`: `template_id` -> `workflow_templates.id`

### `workflow_templates`

**Columns (14)**

| Column | Type |
|---|---|
| `created_at` | `string` |
| `created_by` | `string \| null` |
| `description` | `string` |
| `id` | `string` |
| `input_schema` | `Json` |
| `is_active` | `boolean` |
| `name` | `string` |
| `status` | `string` |
| `trigger_config` | `Json` |
| `trigger_type` | `string` |
| `updated_at` | `string` |
| `updated_by` | `string \| null` |
| `version` | `number` |
| `workspace_id` | `string` |

**Relationships (3)**

- `workflow_templates_created_by_fkey`: `created_by` -> `users.id`
- `workflow_templates_updated_by_fkey`: `updated_by` -> `users.id`
- `workflow_templates_workspace_id_fkey`: `workspace_id` -> `workspaces.id`

## Tables From Migrations Not Yet Reflected In `supabase/types.ts`

- `app_model_access`
- `app_model_access_users`

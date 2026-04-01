export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assistant_collections: {
        Row: {
          assistant_id: string
          collection_id: string
          created_at: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assistant_id: string
          collection_id: string
          created_at?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assistant_id?: string
          collection_id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_collections_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_files: {
        Row: {
          assistant_id: string
          created_at: string
          file_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          file_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          file_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_files_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_tools: {
        Row: {
          assistant_id: string
          created_at: string
          tool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          tool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          tool_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_tools_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_tools_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_workspaces: {
        Row: {
          assistant_id: string
          created_at: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          assistant_id: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          assistant_id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_workspaces_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistant_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      assistants: {
        Row: {
          context_length: number
          created_at: string
          description: string
          embeddings_provider: string
          folder_id: string | null
          id: string
          image_path: string
          include_profile_context: boolean
          include_workspace_instructions: boolean
          model: string
          name: string
          prompt: string
          sharing: string
          temperature: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_length: number
          created_at?: string
          description: string
          embeddings_provider: string
          folder_id?: string | null
          id?: string
          image_path: string
          include_profile_context: boolean
          include_workspace_instructions: boolean
          model: string
          name: string
          prompt: string
          sharing?: string
          temperature: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_length?: number
          created_at?: string
          description?: string
          embeddings_provider?: string
          folder_id?: string | null
          id?: string
          image_path?: string
          include_profile_context?: boolean
          include_workspace_instructions?: boolean
          model?: string
          name?: string
          prompt?: string
          sharing?: string
          temperature?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistants_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assistants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_files: {
        Row: {
          chat_id: string
          created_at: string
          file_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          file_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          file_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_files_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          assistant_id: string | null
          context_length: number
          created_at: string
          embeddings_provider: string
          folder_id: string | null
          id: string
          include_profile_context: boolean
          include_workspace_instructions: boolean
          model: string
          name: string
          prompt: string
          sharing: string
          temperature: number
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          assistant_id?: string | null
          context_length: number
          created_at?: string
          embeddings_provider: string
          folder_id?: string | null
          id?: string
          include_profile_context: boolean
          include_workspace_instructions: boolean
          model: string
          name: string
          prompt: string
          sharing?: string
          temperature: number
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          assistant_id?: string | null
          context_length?: number
          created_at?: string
          embeddings_provider?: string
          folder_id?: string | null
          id?: string
          include_profile_context?: boolean
          include_workspace_instructions?: boolean
          model?: string
          name?: string
          prompt?: string
          sharing?: string
          temperature?: number
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chats_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_files: {
        Row: {
          collection_id: string
          created_at: string
          file_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          file_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          file_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_files_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_files_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_workspaces: {
        Row: {
          collection_id: string
          created_at: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_workspaces_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string
          folder_id: string | null
          id: string
          name: string
          sharing: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          folder_id?: string | null
          id?: string
          name: string
          sharing?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          folder_id?: string | null
          id?: string
          name?: string
          sharing?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      file_items: {
        Row: {
          content: string
          created_at: string
          file_id: string
          id: string
          local_embedding: string | null
          openai_embedding: string | null
          sharing: string
          tokens: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          file_id: string
          id?: string
          local_embedding?: string | null
          openai_embedding?: string | null
          sharing?: string
          tokens: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          file_id?: string
          id?: string
          local_embedding?: string | null
          openai_embedding?: string | null
          sharing?: string
          tokens?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_items_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      file_workspaces: {
        Row: {
          created_at: string
          file_id: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          file_id: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          file_id?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "file_workspaces_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "file_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          description: string
          file_path: string
          folder_id: string | null
          id: string
          name: string
          sharing: string
          size: number
          tokens: number
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          file_path: string
          folder_id?: string | null
          id?: string
          name: string
          sharing?: string
          size: number
          tokens: number
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          file_path?: string
          folder_id?: string | null
          id?: string
          name?: string
          sharing?: string
          size?: number
          tokens?: number
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          type: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          type: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "folders_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      message_file_items: {
        Row: {
          created_at: string
          file_item_id: string
          message_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_item_id: string
          message_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_item_id?: string
          message_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_file_items_file_item_id_fkey"
            columns: ["file_item_id"]
            isOneToOne: false
            referencedRelation: "file_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_file_items_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_file_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          assistant_id: string | null
          chat_id: string
          content: string
          created_at: string
          id: string
          image_paths: string[]
          model: string
          role: string
          sequence_number: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assistant_id?: string | null
          chat_id: string
          content: string
          created_at?: string
          id?: string
          image_paths: string[]
          model: string
          role: string
          sequence_number: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assistant_id?: string | null
          chat_id?: string
          content?: string
          created_at?: string
          id?: string
          image_paths?: string[]
          model?: string
          role?: string
          sequence_number?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "assistants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      model_workspaces: {
        Row: {
          created_at: string
          model_id: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          model_id: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          model_id?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_workspaces_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "model_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      app_api_keys: {
        Row: {
          api_key: string
          provider: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          api_key: string
          provider: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          api_key?: string
          provider?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_api_keys_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      models: {
        Row: {
          api_key: string
          base_url: string
          context_length: number
          created_at: string
          description: string
          folder_id: string | null
          id: string
          model_id: string
          name: string
          sharing: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          base_url: string
          context_length?: number
          created_at?: string
          description: string
          folder_id?: string | null
          id?: string
          model_id: string
          name: string
          sharing?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          base_url?: string
          context_length?: number
          created_at?: string
          description?: string
          folder_id?: string | null
          id?: string
          model_id?: string
          name?: string
          sharing?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "models_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "models_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      preset_workspaces: {
        Row: {
          created_at: string
          preset_id: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          preset_id: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          preset_id?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preset_workspaces_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "presets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preset_workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preset_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      presets: {
        Row: {
          context_length: number
          created_at: string
          description: string
          embeddings_provider: string
          folder_id: string | null
          id: string
          include_profile_context: boolean
          include_workspace_instructions: boolean
          model: string
          name: string
          prompt: string
          sharing: string
          temperature: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context_length: number
          created_at?: string
          description: string
          embeddings_provider: string
          folder_id?: string | null
          id?: string
          include_profile_context: boolean
          include_workspace_instructions: boolean
          model: string
          name: string
          prompt: string
          sharing?: string
          temperature: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context_length?: number
          created_at?: string
          description?: string
          embeddings_provider?: string
          folder_id?: string | null
          id?: string
          include_profile_context?: boolean
          include_workspace_instructions?: boolean
          model?: string
          name?: string
          prompt?: string
          sharing?: string
          temperature?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "presets_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          anthropic_api_key: string | null
          azure_openai_35_turbo_id: string | null
          azure_openai_45_turbo_id: string | null
          azure_openai_45_vision_id: string | null
          azure_openai_api_key: string | null
          azure_openai_embeddings_id: string | null
          azure_openai_endpoint: string | null
          bio: string
          created_at: string
          display_name: string
          google_gemini_api_key: string | null
          groq_api_key: string | null
          has_onboarded: boolean
          id: string
          image_path: string
          image_url: string
          is_admin: boolean
          mistral_api_key: string | null
          openai_api_key: string | null
          openai_organization_id: string | null
          openrouter_api_key: string | null
          perplexity_api_key: string | null
          profile_context: string
          updated_at: string | null
          use_azure_openai: boolean
          user_id: string
          username: string
        }
        Insert: {
          anthropic_api_key?: string | null
          azure_openai_35_turbo_id?: string | null
          azure_openai_45_turbo_id?: string | null
          azure_openai_45_vision_id?: string | null
          azure_openai_api_key?: string | null
          azure_openai_embeddings_id?: string | null
          azure_openai_endpoint?: string | null
          bio: string
          created_at?: string
          display_name: string
          google_gemini_api_key?: string | null
          groq_api_key?: string | null
          has_onboarded?: boolean
          id?: string
          image_path: string
          image_url: string
          is_admin?: boolean
          mistral_api_key?: string | null
          openai_api_key?: string | null
          openai_organization_id?: string | null
          openrouter_api_key?: string | null
          perplexity_api_key?: string | null
          profile_context: string
          updated_at?: string | null
          use_azure_openai: boolean
          user_id: string
          username: string
        }
        Update: {
          anthropic_api_key?: string | null
          azure_openai_35_turbo_id?: string | null
          azure_openai_45_turbo_id?: string | null
          azure_openai_45_vision_id?: string | null
          azure_openai_api_key?: string | null
          azure_openai_embeddings_id?: string | null
          azure_openai_endpoint?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          google_gemini_api_key?: string | null
          groq_api_key?: string | null
          has_onboarded?: boolean
          id?: string
          image_path?: string
          image_url?: string
          is_admin?: boolean
          mistral_api_key?: string | null
          openai_api_key?: string | null
          openai_organization_id?: string | null
          openrouter_api_key?: string | null
          perplexity_api_key?: string | null
          profile_context?: string
          updated_at?: string | null
          use_azure_openai?: boolean
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_workspaces: {
        Row: {
          created_at: string
          prompt_id: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          prompt_id: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          prompt_id?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_workspaces_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          content: string
          created_at: string
          folder_id: string | null
          id: string
          name: string
          sharing: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          folder_id?: string | null
          id?: string
          name: string
          sharing?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          folder_id?: string | null
          id?: string
          name?: string
          sharing?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_workspaces: {
        Row: {
          created_at: string
          tool_id: string
          updated_at: string | null
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          tool_id: string
          updated_at?: string | null
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          tool_id?: string
          updated_at?: string | null
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_workspaces_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tool_workspaces_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          created_at: string
          custom_headers: Json
          description: string
          folder_id: string | null
          id: string
          name: string
          schema: Json
          sharing: string
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_headers?: Json
          description: string
          folder_id?: string | null
          id?: string
          name: string
          schema?: Json
          sharing?: string
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_headers?: Json
          description?: string
          folder_id?: string | null
          id?: string
          name?: string
          schema?: Json
          sharing?: string
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tools_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_approvals: {
        Row: {
          approval_payload: Json
          approver_group: string | null
          approver_user_id: string | null
          created_at: string
          decision_at: string | null
          decision_by: string | null
          decision_note: string | null
          expires_at: string | null
          id: string
          requested_at: string
          requested_by: string | null
          run_id: string
          run_step_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approval_payload?: Json
          approver_group?: string | null
          approver_user_id?: string | null
          created_at?: string
          decision_at?: string | null
          decision_by?: string | null
          decision_note?: string | null
          expires_at?: string | null
          id?: string
          requested_at?: string
          requested_by?: string | null
          run_id: string
          run_step_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approval_payload?: Json
          approver_group?: string | null
          approver_user_id?: string | null
          created_at?: string
          decision_at?: string | null
          decision_by?: string | null
          decision_note?: string | null
          expires_at?: string | null
          id?: string
          requested_at?: string
          requested_by?: string | null
          run_id?: string
          run_step_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_approvals_approver_user_id_fkey"
            columns: ["approver_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_approvals_decision_by_fkey"
            columns: ["decision_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_approvals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_approvals_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_approvals_run_step_id_fkey"
            columns: ["run_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_run_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_events: {
        Row: {
          emitted_by_id: string | null
          emitted_by_type: string
          event_type: string
          id: number
          level: string
          message: string
          occurred_at: string
          payload: Json
          run_id: string
          run_step_id: string | null
        }
        Insert: {
          emitted_by_id?: string | null
          emitted_by_type: string
          event_type: string
          id?: never
          level?: string
          message: string
          occurred_at?: string
          payload?: Json
          run_id: string
          run_step_id?: string | null
        }
        Update: {
          emitted_by_id?: string | null
          emitted_by_type?: string
          event_type?: string
          id?: never
          level?: string
          message?: string
          occurred_at?: string
          payload?: Json
          run_id?: string
          run_step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_events_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_events_run_step_id_fkey"
            columns: ["run_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_run_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_run_steps: {
        Row: {
          attempt: number
          cost_usd: number | null
          created_at: string
          error_code: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json
          model_used: string | null
          output_payload: Json | null
          run_id: string
          started_at: string | null
          status: string
          step_key: string
          template_step_id: string | null
          tokens_in: number | null
          tokens_out: number | null
          tool_used: string | null
          updated_at: string
        }
        Insert: {
          attempt?: number
          cost_usd?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json
          model_used?: string | null
          output_payload?: Json | null
          run_id: string
          started_at?: string | null
          status?: string
          step_key: string
          template_step_id?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
          tool_used?: string | null
          updated_at?: string
        }
        Update: {
          attempt?: number
          cost_usd?: number | null
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json
          model_used?: string | null
          output_payload?: Json | null
          run_id?: string
          started_at?: string | null
          status?: string
          step_key?: string
          template_step_id?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
          tool_used?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_run_steps_run_id_fkey"
            columns: ["run_id"]
            isOneToOne: false
            referencedRelation: "workflow_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_run_steps_template_step_id_fkey"
            columns: ["template_step_id"]
            isOneToOne: false
            referencedRelation: "workflow_template_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          context_payload: Json
          created_at: string
          created_by: string | null
          current_step_key: string | null
          error_code: string | null
          error_message: string | null
          finished_at: string | null
          id: string
          input_payload: Json
          output_payload: Json | null
          started_at: string | null
          status: string
          template_id: string | null
          template_snapshot: Json
          template_version: number
          trigger_ref: string | null
          trigger_source: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          context_payload?: Json
          created_at?: string
          created_by?: string | null
          current_step_key?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json
          output_payload?: Json | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          template_snapshot?: Json
          template_version: number
          trigger_ref?: string | null
          trigger_source: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          context_payload?: Json
          created_at?: string
          created_by?: string | null
          current_step_key?: string | null
          error_code?: string | null
          error_message?: string | null
          finished_at?: string | null
          id?: string
          input_payload?: Json
          output_payload?: Json | null
          started_at?: string | null
          status?: string
          template_id?: string | null
          template_snapshot?: Json
          template_version?: number
          trigger_ref?: string | null
          trigger_source?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_template_steps: {
        Row: {
          config: Json
          created_at: string
          id: string
          input_mapping: Json
          is_required: boolean
          on_failure_step_key: string | null
          on_success_step_key: string | null
          output_schema: Json
          retry_backoff_seconds: number
          retry_max: number
          step_key: string
          step_order: number
          step_type: string
          template_id: string
          timeout_seconds: number
          title: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          input_mapping?: Json
          is_required?: boolean
          on_failure_step_key?: string | null
          on_success_step_key?: string | null
          output_schema?: Json
          retry_backoff_seconds?: number
          retry_max?: number
          step_key: string
          step_order: number
          step_type: string
          template_id: string
          timeout_seconds?: number
          title: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          input_mapping?: Json
          is_required?: boolean
          on_failure_step_key?: string | null
          on_success_step_key?: string | null
          output_schema?: Json
          retry_backoff_seconds?: number
          retry_max?: number
          step_key?: string
          step_order?: number
          step_type?: string
          template_id?: string
          timeout_seconds?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_template_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "workflow_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_templates: {
        Row: {
          created_at: string
          created_by: string | null
          description: string
          id: string
          input_schema: Json
          is_active: boolean
          name: string
          status: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
          updated_by: string | null
          version: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          input_schema?: Json
          is_active?: boolean
          name: string
          status?: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          input_schema?: Json
          is_active?: boolean
          name?: string
          status?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_templates_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          default_context_length: number
          default_model: string
          default_prompt: string
          default_temperature: number
          description: string
          embeddings_provider: string
          id: string
          image_path: string
          include_profile_context: boolean
          include_workspace_instructions: boolean
          instructions: string
          is_home: boolean
          name: string
          sharing: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          default_context_length: number
          default_model: string
          default_prompt: string
          default_temperature: number
          description: string
          embeddings_provider: string
          id?: string
          image_path?: string
          include_profile_context: boolean
          include_workspace_instructions: boolean
          instructions: string
          is_home?: boolean
          name: string
          sharing?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          default_context_length?: number
          default_model?: string
          default_prompt?: string
          default_temperature?: number
          description?: string
          embeddings_provider?: string
          id?: string
          image_path?: string
          include_profile_context?: boolean
          include_workspace_instructions?: boolean
          instructions?: string
          is_home?: boolean
          name?: string
          sharing?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_duplicate_messages_for_new_chat: {
        Args: {
          old_chat_id: string
          new_chat_id: string
          new_user_id: string
        }
        Returns: undefined
      }
      delete_message_including_and_after: {
        Args: {
          p_user_id: string
          p_chat_id: string
          p_sequence_number: number
        }
        Returns: undefined
      }
      delete_messages_including_and_after: {
        Args: {
          p_user_id: string
          p_chat_id: string
          p_sequence_number: number
        }
        Returns: undefined
      }
      delete_storage_object: {
        Args: {
          bucket: string
          object: string
        }
        Returns: Record<string, unknown>
      }
      delete_storage_object_from_bucket: {
        Args: {
          bucket_name: string
          object_path: string
        }
        Returns: Record<string, unknown>
      }
      match_file_items_local: {
        Args: {
          query_embedding: string
          match_count?: number
          file_ids?: string[]
        }
        Returns: {
          id: string
          file_id: string
          content: string
          tokens: number
          similarity: number
        }[]
      }
      match_file_items_openai: {
        Args: {
          query_embedding: string
          match_count?: number
          file_ids?: string[]
        }
        Returns: {
          id: string
          file_id: string
          content: string
          tokens: number
          similarity: number
        }[]
      }
      non_private_assistant_exists: {
        Args: {
          p_name: string
        }
        Returns: boolean
      }
      non_private_file_exists: {
        Args: {
          p_name: string
        }
        Returns: boolean
      }
      non_private_workspace_exists: {
        Args: {
          p_name: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            isOneToOne: false
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never


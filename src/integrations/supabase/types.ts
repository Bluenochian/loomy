export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chapters: {
        Row: {
          chapter_number: number
          content: string | null
          created_at: string
          id: string
          intent: string | null
          project_id: string
          status: string
          title: string
          updated_at: string
          word_count: number | null
        }
        Insert: {
          chapter_number: number
          content?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
          word_count?: number | null
        }
        Update: {
          chapter_number?: number
          content?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chapters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          arc: Json | null
          backstory: string | null
          created_at: string
          description: string | null
          id: string
          motivations: string[] | null
          name: string
          project_id: string
          relationships: Json | null
          role: string
          traits: string[] | null
          updated_at: string
        }
        Insert: {
          arc?: Json | null
          backstory?: string | null
          created_at?: string
          description?: string | null
          id?: string
          motivations?: string[] | null
          name: string
          project_id: string
          relationships?: Json | null
          role?: string
          traits?: string[] | null
          updated_at?: string
        }
        Update: {
          arc?: Json | null
          backstory?: string | null
          created_at?: string
          description?: string | null
          id?: string
          motivations?: string[] | null
          name?: string
          project_id?: string
          relationships?: Json | null
          role?: string
          traits?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      lore_entries: {
        Row: {
          category: string
          content: string | null
          created_at: string
          id: string
          is_canon: boolean | null
          project_id: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          is_canon?: boolean | null
          project_id: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string | null
          created_at?: string
          id?: string
          is_canon?: boolean | null
          project_id?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lore_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      outlines: {
        Row: {
          arcs: Json | null
          conflicts: Json | null
          created_at: string
          id: string
          project_id: string
          structure: Json
          updated_at: string
        }
        Insert: {
          arcs?: Json | null
          conflicts?: Json | null
          created_at?: string
          id?: string
          project_id: string
          structure?: Json
          updated_at?: string
        }
        Update: {
          arcs?: Json | null
          conflicts?: Json | null
          created_at?: string
          id?: string
          project_id?: string
          structure?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "outlines_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          concept: string
          created_at: string
          genre_influences: string[] | null
          id: string
          inferred_genres: Json | null
          language: string
          narrative_rules: Json | null
          status: string
          theme_profile: Json | null
          title: string
          tone_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          concept: string
          created_at?: string
          genre_influences?: string[] | null
          id?: string
          inferred_genres?: Json | null
          language?: string
          narrative_rules?: Json | null
          status?: string
          theme_profile?: Json | null
          title?: string
          tone_value?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          concept?: string
          created_at?: string
          genre_influences?: string[] | null
          id?: string
          inferred_genres?: Json | null
          language?: string
          narrative_rules?: Json | null
          status?: string
          theme_profile?: Json | null
          title?: string
          tone_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      story_map_edges: {
        Row: {
          created_at: string
          edge_type: string | null
          id: string
          label: string | null
          project_id: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          created_at?: string
          edge_type?: string | null
          id?: string
          label?: string | null
          project_id: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          created_at?: string
          edge_type?: string | null
          id?: string
          label?: string | null
          project_id?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_map_edges_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_map_edges_source_node_id_fkey"
            columns: ["source_node_id"]
            isOneToOne: false
            referencedRelation: "story_map_nodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_map_edges_target_node_id_fkey"
            columns: ["target_node_id"]
            isOneToOne: false
            referencedRelation: "story_map_nodes"
            referencedColumns: ["id"]
          },
        ]
      }
      story_map_nodes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          linked_chapter_id: string | null
          linked_character_id: string | null
          linked_lore_id: string | null
          metadata: Json | null
          node_type: string
          position_x: number
          position_y: number
          project_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          linked_chapter_id?: string | null
          linked_character_id?: string | null
          linked_lore_id?: string | null
          metadata?: Json | null
          node_type?: string
          position_x?: number
          position_y?: number
          project_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          linked_chapter_id?: string | null
          linked_character_id?: string | null
          linked_lore_id?: string | null
          metadata?: Json | null
          node_type?: string
          position_x?: number
          position_y?: number
          project_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_map_nodes_linked_chapter_id_fkey"
            columns: ["linked_chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_map_nodes_linked_character_id_fkey"
            columns: ["linked_character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_map_nodes_linked_lore_id_fkey"
            columns: ["linked_lore_id"]
            isOneToOne: false
            referencedRelation: "lore_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_map_nodes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      story_overviews: {
        Row: {
          central_themes: string[] | null
          created_at: string
          id: string
          narrative_intent: string | null
          project_id: string
          setting_description: string | null
          stakes: string | null
          time_period: string | null
          updated_at: string
        }
        Insert: {
          central_themes?: string[] | null
          created_at?: string
          id?: string
          narrative_intent?: string | null
          project_id: string
          setting_description?: string | null
          stakes?: string | null
          time_period?: string | null
          updated_at?: string
        }
        Update: {
          central_themes?: string[] | null
          created_at?: string
          id?: string
          narrative_intent?: string | null
          project_id?: string
          setting_description?: string | null
          stakes?: string | null
          time_period?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_overviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      donor_profiles: {
        Row: {
          blurb: string | null
          donor_kind: string | null
          focus_areas: string[]
          hq_country: string | null
          id: string
          interests: string[]
          organisation_name: string | null
          recently_funded: number
          regions: string[]
          updated_at: string
          website: string | null
        }
        Insert: {
          blurb?: string | null
          donor_kind?: string | null
          focus_areas?: string[]
          hq_country?: string | null
          id: string
          interests?: string[]
          organisation_name?: string | null
          recently_funded?: number
          regions?: string[]
          updated_at?: string
          website?: string | null
        }
        Update: {
          blurb?: string | null
          donor_kind?: string | null
          focus_areas?: string[]
          hq_country?: string | null
          id?: string
          interests?: string[]
          organisation_name?: string | null
          recently_funded?: number
          regions?: string[]
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string
          from_user_id: string
          id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string
          from_user_id: string
          id?: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string
          from_user_id?: string
          id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_log: {
        Row: {
          channel: string
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          to_org_ref: string
          to_project_ref: string | null
          to_user_id: string | null
        }
        Insert: {
          channel: string
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          to_org_ref: string
          to_project_ref?: string | null
          to_user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          to_org_ref?: string
          to_project_ref?: string | null
          to_user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sms_submissions: {
        Row: {
          beneficiaries: string | null
          category: string
          claimed_at: string | null
          claimed_by_user_id: string | null
          claimed_project_id: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          id: string
          lat: number
          lng: number
          location_label: string
          needs: Json
          project_type: string
          submitted_at: string
          suggested_seed_org_id: string | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          beneficiaries?: string | null
          category: string
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          claimed_project_id?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          location_label: string
          needs?: Json
          project_type?: string
          submitted_at?: string
          suggested_seed_org_id?: string | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          beneficiaries?: string | null
          category?: string
          claimed_at?: string | null
          claimed_by_user_id?: string | null
          claimed_project_id?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          location_label?: string
          needs?: Json
          project_type?: string
          submitted_at?: string
          suggested_seed_org_id?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sms_submissions_claimed_project_id_fkey"
            columns: ["claimed_project_id"]
            isOneToOne: false
            referencedRelation: "user_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          created_at: string
          id: string
          participant_a: string
          participant_b: string
          project_ref: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          participant_a: string
          participant_b: string
          project_ref?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          participant_a?: string
          participant_b?: string
          project_ref?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_orgs: {
        Row: {
          brings: string[]
          claimed_seed_org_id: string | null
          country: string | null
          created_at: string
          description: string | null
          entity_kind: string
          id: string
          lat: number | null
          lng: number | null
          name: string
          org_type: string | null
          owner_id: string
          phone: string | null
          region: string | null
          updated_at: string
          year_founded: number | null
        }
        Insert: {
          brings?: string[]
          claimed_seed_org_id?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          entity_kind: string
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          org_type?: string | null
          owner_id: string
          phone?: string | null
          region?: string | null
          updated_at?: string
          year_founded?: number | null
        }
        Update: {
          brings?: string[]
          claimed_seed_org_id?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          entity_kind?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          org_type?: string | null
          owner_id?: string
          phone?: string | null
          region?: string | null
          updated_at?: string
          year_founded?: number | null
        }
        Relationships: []
      }
      user_projects: {
        Row: {
          beneficiaries: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          lat: number
          lng: number
          location_label: string
          needs: Json
          org_id: string | null
          owner_id: string
          partner_org_refs: string[]
          photos: string[]
          project_type: string
          seed_org_id: string | null
          status: string
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          beneficiaries?: string | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          lat: number
          lng: number
          location_label: string
          needs?: Json
          org_id?: string | null
          owner_id: string
          partner_org_refs?: string[]
          photos?: string[]
          project_type?: string
          seed_org_id?: string | null
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          beneficiaries?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          lat?: number
          lng?: number
          location_label?: string
          needs?: Json
          org_id?: string | null
          owner_id?: string
          partner_org_refs?: string[]
          photos?: string[]
          project_type?: string
          seed_org_id?: string | null
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "user_orgs"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "rlo" | "ngo" | "donor"
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
    Enums: {
      app_role: ["rlo", "ngo", "donor"],
    },
  },
} as const

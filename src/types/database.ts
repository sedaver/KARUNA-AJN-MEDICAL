// Generated from Supabase project pgpiihzzovfwkjafbnuj on 2026-11-02. No credentials included.
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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          record_id: string
          table_name: string
          trust_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          record_id: string
          table_name: string
          trust_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          record_id?: string
          table_name?: string
          trust_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_trust_id_fkey"
            columns: ["trust_id"]
            isOneToOne: false
            referencedRelation: "trusts"
            referencedColumns: ["id"]
          },
        ]
      }
      camp_media: {
        Row: {
          alt_text: string | null
          camp_id: string
          caption: string | null
          created_at: string
          id: string
          publication_consent_verified: boolean
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          storage_path: string
          trust_id: string
          updated_at: string
        }
        Insert: {
          alt_text?: string | null
          camp_id: string
          caption?: string | null
          created_at?: string
          id?: string
          publication_consent_verified?: boolean
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path: string
          trust_id: string
          updated_at?: string
        }
        Update: {
          alt_text?: string | null
          camp_id?: string
          caption?: string | null
          created_at?: string
          id?: string
          publication_consent_verified?: boolean
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          storage_path?: string
          trust_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_media_trust_id_camp_id_fkey"
            columns: ["trust_id", "camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["trust_id", "id"]
          },
          {
            foreignKeyName: "camp_media_trust_id_reviewed_by_fkey"
            columns: ["trust_id", "reviewed_by"]
            isOneToOne: false
            referencedRelation: "trust_memberships"
            referencedColumns: ["trust_id", "user_id"]
          },
        ]
      }
      camp_partners: {
        Row: {
          camp_id: string
          created_at: string
          id: string
          organisation_name: string
          trust_id: string
        }
        Insert: {
          camp_id: string
          created_at?: string
          id?: string
          organisation_name: string
          trust_id: string
        }
        Update: {
          camp_id?: string
          created_at?: string
          id?: string
          organisation_name?: string
          trust_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "camp_partners_trust_id_camp_id_fkey"
            columns: ["trust_id", "camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["trust_id", "id"]
          },
        ]
      }
      camps: {
        Row: {
          camp_date: string
          camp_number: string
          camp_type: string
          created_at: string
          description: string | null
          district: string | null
          id: string
          local_body: string | null
          location: string
          name: string
          status: string
          target_population: string | null
          trust_id: string
          updated_at: string
          village: string | null
        }
        Insert: {
          camp_date: string
          camp_number: string
          camp_type: string
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          local_body?: string | null
          location: string
          name: string
          status?: string
          target_population?: string | null
          trust_id: string
          updated_at?: string
          village?: string | null
        }
        Update: {
          camp_date?: string
          camp_number?: string
          camp_type?: string
          created_at?: string
          description?: string | null
          district?: string | null
          id?: string
          local_body?: string | null
          location?: string
          name?: string
          status?: string
          target_population?: string | null
          trust_id?: string
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "camps_trust_id_fkey"
            columns: ["trust_id"]
            isOneToOne: false
            referencedRelation: "trusts"
            referencedColumns: ["id"]
          },
        ]
      }
      examination_findings: {
        Row: {
          created_at: string
          examination_id: string
          eye: string
          finding: string
          id: string
          notes: string | null
          trust_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          examination_id: string
          eye: string
          finding: string
          id?: string
          notes?: string | null
          trust_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          examination_id?: string
          eye?: string
          finding?: string
          id?: string
          notes?: string | null
          trust_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examination_findings_trust_id_examination_id_fkey"
            columns: ["trust_id", "examination_id"]
            isOneToOne: false
            referencedRelation: "eye_examinations"
            referencedColumns: ["trust_id", "id"]
          },
        ]
      }
      eye_examinations: {
        Row: {
          created_at: string
          examined_at: string
          examiner_id: string | null
          id: string
          iop_left: number | null
          iop_right: number | null
          near_vision_left: string | null
          near_vision_right: string | null
          notes: string | null
          refraction_left: string | null
          refraction_right: string | null
          trust_id: string
          updated_at: string
          visit_id: string
          visual_acuity_left: string | null
          visual_acuity_right: string | null
        }
        Insert: {
          created_at?: string
          examined_at?: string
          examiner_id?: string | null
          id?: string
          iop_left?: number | null
          iop_right?: number | null
          near_vision_left?: string | null
          near_vision_right?: string | null
          notes?: string | null
          refraction_left?: string | null
          refraction_right?: string | null
          trust_id: string
          updated_at?: string
          visit_id: string
          visual_acuity_left?: string | null
          visual_acuity_right?: string | null
        }
        Update: {
          created_at?: string
          examined_at?: string
          examiner_id?: string | null
          id?: string
          iop_left?: number | null
          iop_right?: number | null
          near_vision_left?: string | null
          near_vision_right?: string | null
          notes?: string | null
          refraction_left?: string | null
          refraction_right?: string | null
          trust_id?: string
          updated_at?: string
          visit_id?: string
          visual_acuity_left?: string | null
          visual_acuity_right?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eye_examinations_trust_id_examiner_id_fkey"
            columns: ["trust_id", "examiner_id"]
            isOneToOne: false
            referencedRelation: "trust_memberships"
            referencedColumns: ["trust_id", "user_id"]
          },
          {
            foreignKeyName: "eye_examinations_trust_id_visit_id_fkey"
            columns: ["trust_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["trust_id", "id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          contact_result: string
          created_at: string
          follow_up_date: string
          id: string
          next_follow_up_date: string | null
          notes: string | null
          recorded_by: string | null
          referral_id: string
          treatment_status: string | null
          trust_id: string
          updated_at: string
        }
        Insert: {
          contact_result: string
          created_at?: string
          follow_up_date: string
          id?: string
          next_follow_up_date?: string | null
          notes?: string | null
          recorded_by?: string | null
          referral_id: string
          treatment_status?: string | null
          trust_id: string
          updated_at?: string
        }
        Update: {
          contact_result?: string
          created_at?: string
          follow_up_date?: string
          id?: string
          next_follow_up_date?: string | null
          notes?: string | null
          recorded_by?: string | null
          referral_id?: string
          treatment_status?: string | null
          trust_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_trust_id_recorded_by_fkey"
            columns: ["trust_id", "recorded_by"]
            isOneToOne: false
            referencedRelation: "trust_memberships"
            referencedColumns: ["trust_id", "user_id"]
          },
          {
            foreignKeyName: "follow_ups_trust_id_referral_id_fkey"
            columns: ["trust_id", "referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["trust_id", "id"]
          },
        ]
      }
      import_errors: {
        Row: {
          created_at: string
          error_code: string
          field_name: string | null
          id: string
          import_id: string
          row_number: number
          trust_id: string
        }
        Insert: {
          created_at?: string
          error_code: string
          field_name?: string | null
          id?: string
          import_id: string
          row_number: number
          trust_id: string
        }
        Update: {
          created_at?: string
          error_code?: string
          field_name?: string | null
          id?: string
          import_id?: string
          row_number?: number
          trust_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "import_errors_trust_id_import_id_fkey"
            columns: ["trust_id", "import_id"]
            isOneToOne: false
            referencedRelation: "imports"
            referencedColumns: ["trust_id", "id"]
          },
        ]
      }
      imports: {
        Row: {
          created_at: string
          id: string
          status: string
          storage_path: string
          total_rows: number | null
          trust_id: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          storage_path: string
          total_rows?: number | null
          trust_id: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          storage_path?: string
          total_rows?: number | null
          trust_id?: string
          updated_at?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "imports_trust_id_fkey"
            columns: ["trust_id"]
            isOneToOne: false
            referencedRelation: "trusts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imports_trust_id_uploaded_by_fkey"
            columns: ["trust_id", "uploaded_by"]
            isOneToOne: false
            referencedRelation: "trust_memberships"
            referencedColumns: ["trust_id", "user_id"]
          },
        ]
      }
      outcomes: {
        Row: {
          created_at: string
          id: string
          outcome: string
          recorded_at: string
          recorded_by: string
          referral_id: string
          trust_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          outcome: string
          recorded_at?: string
          recorded_by: string
          referral_id: string
          trust_id: string
        }
        Update: {
          created_at?: string
          id?: string
          outcome?: string
          recorded_at?: string
          recorded_by?: string
          referral_id?: string
          trust_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outcomes_trust_id_recorded_by_fkey"
            columns: ["trust_id", "recorded_by"]
            isOneToOne: false
            referencedRelation: "trust_memberships"
            referencedColumns: ["trust_id", "user_id"]
          },
          {
            foreignKeyName: "outcomes_trust_id_referral_id_fkey"
            columns: ["trust_id", "referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["trust_id", "id"]
          },
        ]
      }
      patient_consents: {
        Row: {
          created_at: string
          event_number: number
          guardian_name: string | null
          guardian_relationship: string | null
          id: string
          method: string
          notice_version: string
          patient_id: string
          purpose: string
          recorded_at: string
          recorded_by: string
          status: string
          trust_id: string
        }
        Insert: {
          created_at?: string
          event_number?: never
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          method: string
          notice_version: string
          patient_id: string
          purpose: string
          recorded_at?: string
          recorded_by: string
          status: string
          trust_id: string
        }
        Update: {
          created_at?: string
          event_number?: never
          guardian_name?: string | null
          guardian_relationship?: string | null
          id?: string
          method?: string
          notice_version?: string
          patient_id?: string
          purpose?: string
          recorded_at?: string
          recorded_by?: string
          status?: string
          trust_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_consents_trust_id_patient_id_fkey"
            columns: ["trust_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["trust_id", "id"]
          },
          {
            foreignKeyName: "patient_consents_trust_id_recorded_by_fkey"
            columns: ["trust_id", "recorded_by"]
            isOneToOne: false
            referencedRelation: "trust_memberships"
            referencedColumns: ["trust_id", "user_id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          age_recorded_on: string | null
          archived_at: string | null
          created_at: string
          date_of_birth: string | null
          district: string | null
          estimated_age: number | null
          full_name: string
          gender: string | null
          id: string
          local_body: string | null
          mobile: string | null
          patient_number: string
          trust_id: string
          updated_at: string
          village: string | null
        }
        Insert: {
          address?: string | null
          age_recorded_on?: string | null
          archived_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          estimated_age?: number | null
          full_name: string
          gender?: string | null
          id?: string
          local_body?: string | null
          mobile?: string | null
          patient_number?: string
          trust_id: string
          updated_at?: string
          village?: string | null
        }
        Update: {
          address?: string | null
          age_recorded_on?: string | null
          archived_at?: string | null
          created_at?: string
          date_of_birth?: string | null
          district?: string | null
          estimated_age?: number | null
          full_name?: string
          gender?: string | null
          id?: string
          local_body?: string | null
          mobile?: string | null
          patient_number?: string
          trust_id?: string
          updated_at?: string
          village?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patients_trust_id_fkey"
            columns: ["trust_id"]
            isOneToOne: false
            referencedRelation: "trusts"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          description: string
          id: string
        }
        Insert: {
          description: string
          id: string
        }
        Update: {
          description?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          priority: string
          reason: string
          referral_date: string
          referred_facility: string
          status: string
          trust_id: string
          updated_at: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string
          reason: string
          referral_date?: string
          referred_facility: string
          status?: string
          trust_id: string
          updated_at?: string
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          priority?: string
          reason?: string
          referral_date?: string
          referred_facility?: string
          status?: string
          trust_id?: string
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_trust_id_visit_id_fkey"
            columns: ["trust_id", "visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["trust_id", "id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          permission_id: string
          role_id: string
        }
        Insert: {
          permission_id: string
          role_id: string
        }
        Update: {
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      trust_memberships: {
        Row: {
          active: boolean
          created_at: string
          trust_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          trust_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          trust_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trust_memberships_trust_id_fkey"
            columns: ["trust_id"]
            isOneToOne: false
            referencedRelation: "trusts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trust_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      trusts: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role_id: string
          trust_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role_id: string
          trust_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          role_id?: string
          trust_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_trust_id_user_id_fkey"
            columns: ["trust_id", "user_id"]
            isOneToOne: false
            referencedRelation: "trust_memberships"
            referencedColumns: ["trust_id", "user_id"]
          },
        ]
      }
      visits: {
        Row: {
          camp_id: string
          created_at: string
          examiner_id: string | null
          id: string
          notes: string | null
          patient_id: string
          screening_status: string
          trust_id: string
          updated_at: string
          visited_at: string
        }
        Insert: {
          camp_id: string
          created_at?: string
          examiner_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          screening_status?: string
          trust_id: string
          updated_at?: string
          visited_at?: string
        }
        Update: {
          camp_id?: string
          created_at?: string
          examiner_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          screening_status?: string
          trust_id?: string
          updated_at?: string
          visited_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_trust_id_camp_id_fkey"
            columns: ["trust_id", "camp_id"]
            isOneToOne: false
            referencedRelation: "camps"
            referencedColumns: ["trust_id", "id"]
          },
          {
            foreignKeyName: "visits_trust_id_examiner_id_fkey"
            columns: ["trust_id", "examiner_id"]
            isOneToOne: false
            referencedRelation: "trust_memberships"
            referencedColumns: ["trust_id", "user_id"]
          },
          {
            foreignKeyName: "visits_trust_id_patient_id_fkey"
            columns: ["trust_id", "patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["trust_id", "id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_patient: {
        Args: {
          p_archive: boolean
          p_patient: string
          p_trust: string
          p_version: string
        }
        Returns: undefined
      }
      list_trust_staff: {
        Args: { p_trust_id: string }
        Returns: {
          active: boolean
          display_name: string
          role_ids: string[]
          user_id: string
        }[]
      }
      manage_trust_staff: {
        Args: {
          p_active: boolean
          p_display_name: string
          p_role_id: string
          p_trust_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      record_consent: {
        Args: { p_input: Json; p_trust: string }
        Returns: string
      }
      register_visit: {
        Args: {
          p_camp: string
          p_patient: string
          p_repeat?: boolean
          p_trust: string
        }
        Returns: string
      }
      save_camp: { Args: { p_input: Json; p_trust: string }; Returns: string }
      save_patient: {
        Args: { p_input: Json; p_trust: string }
        Returns: string
      }
      staff_contexts: {
        Args: never
        Returns: {
          role_ids: string[]
          trust_id: string
          trust_name: string
        }[]
      }
      staff_permissions: {
        Args: { p_trust_id: string }
        Returns: {
          permission_id: string
        }[]
      }
      update_visit_status: {
        Args: {
          p_status: string
          p_trust: string
          p_version: string
          p_visit: string
        }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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

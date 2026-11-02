// Handwritten table/RPC subset for Phase 2. Replace with Supabase-generated
// types after applying migrations; see README. This is NOT generated output.
type ReadTable<Row> = {
  Row: Row;
  Insert: never;
  Update: never;
  Relationships: [];
};
export type Database = {
  public: {
    Tables: {
      profiles: ReadTable<{
        id: string;
        display_name: string;
        created_at: string;
        updated_at: string;
      }>;
      trust_memberships: ReadTable<{
        trust_id: string;
        user_id: string;
        active: boolean;
        created_at: string;
        updated_at: string;
      }>;
    };
    Views: { [_ in never]: never };
    Functions: {
      staff_contexts: { Args: Record<string, never>; Returns: { trust_id: string; trust_name: string; role_ids: string[] }[] };
      staff_permissions: { Args: { p_trust_id: string }; Returns: { permission_id: string }[] };
      list_trust_staff: { Args: { p_trust_id: string }; Returns: { user_id: string; display_name: string; active: boolean; role_ids: string[] }[] };
      manage_trust_staff: { Args: { p_trust_id: string; p_user_id: string; p_display_name: string; p_role_id: string; p_active: boolean }; Returns: undefined };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

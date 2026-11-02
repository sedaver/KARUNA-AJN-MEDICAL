// Handwritten, read-only subset for Phase 1. Replace with Supabase-generated
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
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

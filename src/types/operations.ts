export type Camp = {
  id: string; trust_id: string; camp_number: string; name: string; camp_type: string;
  camp_date: string; location: string; district: string | null; status: string;
  description: string | null; created_at: string; updated_at: string;
};
export type Patient = {
  id: string; trust_id: string; patient_number: string; full_name: string;
  date_of_birth: string | null; estimated_age: number | null; age_recorded_on: string | null;
  gender: string | null; mobile: string | null; address: string | null; village: string | null;
  local_body: string | null; district: string | null; archived_at: string | null;
  created_at: string; updated_at: string;
};
export type Consent = {
  id: string; trust_id: string; patient_id: string; purpose: string; status: string;
  notice_version: string; method: string; recorded_at: string; recorded_by: string;
  guardian_name: string | null; guardian_relationship: string | null; event_number: number;
};
export type Visit = {
  id: string; trust_id: string; patient_id: string; camp_id: string; visited_at: string;
  screening_status: string; examiner_id: string | null; notes: string | null;
  updated_at: string; created_at: string;
};

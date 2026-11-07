export type SessionType = "delivery" | "return";
export type SessionStatus = "active" | "completed" | "cancelled" | "in_progress" | "flagged";

export interface EvidenceFile {
  id: number;
  session_id: number;
  file_name: string;
  file_type: string;
  file_path?: string | null;
  file_hash: string;
  file_size: number;
  uploaded_by?: number | null;
  uploaded_at: string;
  download_url?: string | null;
}

export interface ConditionReport {
  id: number;
  session_id: number;
  product_condition: string;
  damage_description?: string | null;
  accessories_status?: string | null;
  packaging_condition?: string | null;
  additional_notes?: string | null;
  created_at: string;
}

export interface EvidenceSession {
  id: number;
  order_id: number;
  session_type: SessionType;
  session_status: SessionStatus;
  status?: string;
  created_by?: number | null;
  created_at: string;
  completed_at?: string | null;
  updated_at?: string | null;
  files?: EvidenceFile[];
  condition_reports?: ConditionReport[];
}

export type VerificationStatusType =
  | "match"
  | "possible_mismatch"
  | "inconclusive"
  | "not_checked"
  | "review_required";

export interface VerificationResult {
  id: number;
  order_id: number;
  original_session_id?: number | null;
  return_session_id?: number | null;
  identity_result: VerificationStatusType | string;
  damage_result: string;
  accessories_result: string;
  packaging_result?: string | null;
  overall_status: VerificationStatusType | string;
  confidence_score?: number | null;
  findings?: string | null;
  created_at: string;
  difference_image_url?: string | null;
  severity?: "low" | "medium" | "high" | "critical" | null;
  human_review_required?: boolean;
}

export interface Dispute {
  id: number;
  order_id: number;
  raised_by: number;
  dispute_reason: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: number;
  user_id: number | null;
  order_id: number | null;
  event_type: string;
  event_description: string;
  previous_hash: string | null;
  current_hash: string;
  created_at: string;
}

export interface AuditVerificationResponse {
  is_valid: boolean;
  total_records: number;
  verified_records: number;
  tampered_records: number[];
  errors: string[];
}

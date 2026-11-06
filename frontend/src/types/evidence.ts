export type SessionType = "delivery" | "return";
export type SessionStatus = "in_progress" | "completed" | "flagged";

export interface EvidenceSession {
  id: number;
  order_id: number;
  session_type: SessionType;
  created_by: number;
  session_status: SessionStatus;
  created_at: string;
  completed_at: string | null;
}

export interface EvidenceFile {
  id: number;
  session_id: number;
  file_name: string;
  file_type: string;
  file_path: string;
  file_hash: string;
  file_size: number;
  uploaded_by: number;
  uploaded_at: string;
}

export interface ConditionReport {
  id: number;
  session_id: number;
  product_condition: string;
  damage_description: string | null;
  accessories_status: string;
  packaging_condition: string;
  created_at: string;
}

export interface VerificationResult {
  id: number;
  order_id: number;
  original_session_id: number;
  return_session_id: number;
  identity_result: string;
  damage_result: string;
  accessories_result: string;
  overall_status: string;
  confidence_score: number | null;
  findings: string | null;
  created_at: string;
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
  previous_hash: string;
  current_hash: string;
  created_at: string;
}


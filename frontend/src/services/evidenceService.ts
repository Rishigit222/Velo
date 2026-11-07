import { apiClient } from "@/lib/apiClient";
import { env } from "@/lib/config";
import {
  AuditVerificationResponse,
  ConditionReport,
  EvidenceFile,
  EvidenceSession,
  SessionType,
} from "@/types";

export interface EvidenceSessionCreateParams {
  order_id: number;
  session_type: SessionType;
}

export interface ConditionReportCreateParams {
  product_condition: string;
  damage_description?: string;
  accessories_status?: string;
  packaging_condition?: string;
  additional_notes?: string;
}

export const evidenceService = {
  /**
   * List evidence sessions with optional filters (e.g. order_id, session_type)
   */
  async listSessions(params?: {
    order_id?: number;
    session_type?: string;
  }): Promise<EvidenceSession[]> {
    return apiClient.get<EvidenceSession[]>("/evidence/sessions", {
      params: params as Record<string, string | number | boolean | undefined | null>,
    });
  },

  /**
   * Get single evidence session by ID (includes files and condition_reports)
   */
  async getSession(sessionId: number): Promise<EvidenceSession> {
    return apiClient.get<EvidenceSession>(`/evidence/sessions/${sessionId}`);
  },

  /**
   * Create a new delivery or return evidence session
   */
  async createSession(data: EvidenceSessionCreateParams): Promise<EvidenceSession> {
    return apiClient.post<EvidenceSession>("/evidence/sessions", data);
  },

  /**
   * Update evidence session lifecycle status (active -> completed / cancelled)
   */
  async updateStatus(sessionId: number, session_status: string): Promise<EvidenceSession> {
    return apiClient.patch<EvidenceSession>(`/evidence/sessions/${sessionId}/status`, {
      session_status,
      status: session_status,
    });
  },

  /**
   * Upload media files (photos/videos) to an active evidence session
   * Automatically computes SHA-256 digests on the server
   */
  async uploadFiles(sessionId: number, files: File[]): Promise<EvidenceFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    return apiClient.post<EvidenceFile[]>(`/evidence/sessions/${sessionId}/files`, formData);
  },

  /**
   * List files for a specific evidence session
   */
  async listFiles(sessionId: number): Promise<EvidenceFile[]> {
    return apiClient.get<EvidenceFile[]>(`/evidence/sessions/${sessionId}/files`);
  },

  /**
   * Get single file metadata & SHA-256 hash
   */
  async getFile(fileId: number): Promise<EvidenceFile> {
    return apiClient.get<EvidenceFile>(`/evidence/files/${fileId}`);
  },

  /**
   * Get the direct download URL for an evidence file
   */
  getDownloadUrl(fileId: number): string {
    const baseUrl = env.apiUrl || "http://localhost:8000/api/v1";
    return `${baseUrl}/evidence/files/${fileId}/download`;
  },

  /**
   * List physical condition assessment reports for a session
   */
  async listConditionReports(sessionId: number): Promise<ConditionReport[]> {
    return apiClient.get<ConditionReport[]>(`/evidence/sessions/${sessionId}/condition`);
  },

  /**
   * Submit a condition report for an active session
   */
  async submitConditionReport(
    sessionId: number,
    data: ConditionReportCreateParams
  ): Promise<ConditionReport> {
    return apiClient.post<ConditionReport>(`/evidence/sessions/${sessionId}/condition`, data);
  },

  /**
   * Verify cryptographic audit chain integrity
   */
  async verifyAudit(orderId?: number): Promise<AuditVerificationResponse> {
    return apiClient.get<AuditVerificationResponse>("/evidence/audit/verify", {
      params: orderId ? { order_id: orderId } : undefined,
    });
  },
};

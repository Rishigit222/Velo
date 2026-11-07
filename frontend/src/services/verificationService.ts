import { apiClient, ApiError } from "@/lib/apiClient";
import { VerificationResult } from "@/types";

export interface RunVerificationRequest {
  order_id: number;
  original_session_id?: number;
  return_session_id?: number;
}

export interface VerificationServiceStatus {
  isAvailable: boolean;
  message: string;
}

export const verificationService = {
  /**
   * Run automated AI verification between delivery and return evidence sessions.
   * Connects to the backend verification engine endpoint.
   * If the endpoint is not yet deployed on the backend (Step 6 roadmap),
   * surfaces the actual HTTP 404/501 status without faking results.
   */
  async runVerification(payload: RunVerificationRequest): Promise<VerificationResult> {
    try {
      return await apiClient.post<VerificationResult>("/verification/run", payload);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        throw new ApiError(
          error.status,
          "Backend endpoint 'POST /api/v1/verification/run' is not yet implemented on the FastAPI server (Scheduled for Step 6). Both delivery and return evidence sessions are captured and cryptographically anchored."
        );
      }
      throw error;
    }
  },

  /**
   * Fetch verification history for an order or global history
   */
  async getHistory(orderId?: number): Promise<VerificationResult[]> {
    try {
      return await apiClient.get<VerificationResult[]>("/verification/history", {
        params: orderId ? { order_id: orderId } : undefined,
      });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        // Verification history endpoint not yet implemented on backend
        return [];
      }
      throw error;
    }
  },

  /**
   * Check verification engine service availability
   */
  async checkStatus(): Promise<VerificationServiceStatus> {
    try {
      await apiClient.get("/verification/status");
      return { isAvailable: true, message: "Online" };
    } catch {
      return {
        isAvailable: false,
        message: "Awaiting Step 6 Backend Implementation (POST /api/v1/verification/run)",
      };
    }
  },
};


import { apiClient, ApiError } from "@/lib/apiClient";
import { Dispute, DisputeCreateInput, DisputeUpdateInput } from "@/types";

export interface DisputeServiceStatus {
  isAvailable: boolean;
  message: string;
}

export const disputeService = {
  /**
   * List all disputes with optional filters (order_id, status)
   * Connects to GET /api/v1/disputes
   */
  async listDisputes(params?: {
    order_id?: number;
    status?: string;
  }): Promise<Dispute[]> {
    try {
      return await apiClient.get<Dispute[]>("/disputes", {
        params: params as Record<string, string | number | boolean | undefined | null>,
      });
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        // Dispute listing endpoint scheduled for Step 7 on backend
        return [];
      }
      throw error;
    }
  },

  /**
   * Get single dispute details by ID
   * Connects to GET /api/v1/disputes/{id}
   */
  async getDispute(id: number): Promise<Dispute> {
    try {
      return await apiClient.get<Dispute>(`/disputes/${id}`);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        throw new ApiError(
          error.status,
          `Dispute #${id} cannot be retrieved from the backend: Dispute API is scheduled for Step 7.`
        );
      }
      throw error;
    }
  },

  /**
   * Submit a new customer or merchant dispute
   * Connects to POST /api/v1/disputes
   */
  async createDispute(payload: DisputeCreateInput): Promise<Dispute> {
    try {
      return await apiClient.post<Dispute>("/disputes", payload);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        throw new ApiError(
          error.status,
          "Backend endpoint 'POST /api/v1/disputes' is not yet implemented on the FastAPI server (Scheduled for Step 7 roadmap). The dispute table and Pydantic schemas exist on the server."
        );
      }
      throw error;
    }
  },

  /**
   * Update dispute status or description
   * Connects to PATCH /api/v1/disputes/{id}
   */
  async updateDispute(id: number, payload: DisputeUpdateInput): Promise<Dispute> {
    try {
      return await apiClient.patch<Dispute>(`/disputes/${id}`, payload);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        throw new ApiError(
          error.status,
          "Backend dispute status update endpoint is not yet active (Scheduled for Step 7)."
        );
      }
      throw error;
    }
  },

  /**
   * Check if backend dispute API is actively mounted
   */
  async checkStatus(): Promise<DisputeServiceStatus> {
    try {
      await apiClient.get("/disputes");
      return {
        isAvailable: true,
        message: "Dispute management engine is live.",
      };
    } catch (error) {
      if (error instanceof ApiError && (error.status === 404 || error.status === 405)) {
        return {
          isAvailable: false,
          message:
            "Dispute API ('/api/v1/disputes') is scheduled for Step 7 on the FastAPI backend. Dispute models are defined.",
        };
      }
      return {
        isAvailable: false,
        message: error instanceof Error ? error.message : "Service connection error.",
      };
    }
  },
};

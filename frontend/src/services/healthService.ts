import { apiClient } from "@/lib/apiClient";
import { HealthCheckResponse } from "@/types";

export const healthService = {
  /**
   * Root API Health check
   */
  async getRoot(): Promise<{ message: string; version: string }> {
    return apiClient.get<{ message: string; version: string }>("/");
  },

  /**
   * Full V1 Health check including live database connectivity
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    return apiClient.get<HealthCheckResponse>("/health");
  },
};

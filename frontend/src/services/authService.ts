import { apiClient, tokenStorage } from "@/lib/apiClient";
import { AuthResponse, LoginRequest, RegisterRequest, User } from "@/types";

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<User> {
    return apiClient.post<User>("/auth/register", data);
  },

  /**
   * Log in user and persist token to localStorage
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    if (response?.access_token) {
      tokenStorage.set(response.access_token);
    }
    return response;
  },

  /**
   * Fetch current authenticated user's profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>("/auth/me");
  },

  /**
   * Clear authentication token
   */
  logout(): void {
    tokenStorage.clear();
  },

  /**
   * Check if token is present
   */
  isAuthenticated(): boolean {
    return Boolean(tokenStorage.get());
  },

  /**
   * Get active token
   */
  getToken(): string | null {
    return tokenStorage.get();
  },
};

import { env } from "./config";
import { ApiErrorResponse } from "@/types";

export class ApiError extends Error {
  public status: number;
  public details: ApiErrorResponse["detail"] | null;

  constructor(status: number, message: string, details?: ApiErrorResponse["detail"]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details || null;
  }
}

const TOKEN_KEY = "returnproof_access_token";

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (token: string): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error("Failed to persist token to localStorage", e);
    }
  },
  clear: (): void => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.error("Failed to clear token from localStorage", e);
    }
  },
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  token?: string | null;
}

/**
 * Universal typed API Client for ReturnProof FastAPI Backend
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, token: explicitToken, headers: customHeaders, body, ...restOptions } = options;

  // Build clean URL
  let fullUrl = endpoint.startsWith("http")
    ? endpoint
    : `${env.apiUrl}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const url = new URL(fullUrl);
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    });
    fullUrl = url.toString();
  }

  // Build headers
  const headers = new Headers(customHeaders);

  // Set default Accept
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Set Content-Type only if not FormData
  if (!(body instanceof FormData) && !headers.has("Content-Type") && body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  // Attach JWT Bearer Token if available
  const token = explicitToken !== undefined ? explicitToken : tokenStorage.get();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(fullUrl, {
      ...restOptions,
      headers,
      body: body instanceof FormData ? body : typeof body === "object" ? JSON.stringify(body) : body,
    });

    // Handle 204 No Content
    if (response.status === 204) {
      return null as unknown as T;
    }

    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      let errorDetails: ApiErrorResponse["detail"] | undefined;

      if (isJson && data && typeof data === "object") {
        if ("detail" in data) {
          errorDetails = data.detail;
          if (typeof data.detail === "string") {
            errorMessage = data.detail;
          } else if (Array.isArray(data.detail)) {
            errorMessage = data.detail.map((d: { msg?: string }) => d.msg || "Validation error").join(", ");
          }
        } else if ("message" in data) {
          errorMessage = String(data.message);
        }
      }

      throw new ApiError(response.status, errorMessage, errorDetails);
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Network error occurred";
    throw new ApiError(0, message);
  }
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "POST", body: body as BodyInit }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "PUT", body: body as BodyInit }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "PATCH", body: body as BodyInit }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

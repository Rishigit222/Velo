/**
 * Application environment configuration
 */
export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  backendBaseUrl:
    (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1").replace(
      /\/api\/v1\/?$/,
      ""
    ),
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",
};

export interface ApiErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiErrorResponse {
  detail: string | ApiErrorDetail[];
}

export interface HealthCheckResponse {
  status: string;
  database?: string;
  environment?: string;
  timestamp?: string;
}


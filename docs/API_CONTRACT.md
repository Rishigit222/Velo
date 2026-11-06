# ReturnProof - Frontend Integration API Contract
**Version:** 1.0.0  
**Target Environment:** Local Development & Azure Staging  
**Backend Base URL:** `http://127.0.0.1:8000` (or `http://localhost:8000`)  
**Frontend Base URL:** `http://localhost:3000` (or `http://127.0.0.1:3000`)  
**Interactive API Documentation (Swagger UI):** `http://127.0.0.1:8000/docs`  
**OpenAPI Specification:** `http://127.0.0.1:8000/openapi.json`  

---

## 1. Overview & Connection Architecture

This contract establishes the formal communication interface between the Next.js frontend and the FastAPI backend for the **ReturnProof** digital chain-of-custody platform.

### CORS Policy
The backend is configured with permissive CORS credentials for the Next.js development server:
- `http://localhost:3000`
- `http://127.0.0.1:3000`
- Headers: `*`
- Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`
- Credentials: `true`

### Authentication Flow
1. User registers or logs in via `/api/v1/auth/register` or `/api/v1/auth/login`.
2. Backend returns a signed **JWT Access Token** in `access_token` and the user profile.
3. Frontend stores the token (e.g., in `localStorage`, secure cookie, or NextAuth session).
4. For all protected endpoints, the frontend sends the token in the standard HTTP Authorization header:
   ```http
   Authorization: Bearer <ACCESS_TOKEN>
   ```

---

## 2. Standard Response & Error Format

### Success Responses
Standard JSON payloads with HTTP 200 (OK) or 201 (Created).

### Error Responses
All error responses adhere to standard FastAPI structure:
```json
{
  "detail": "Descriptive error message"
}
```

For validation errors (HTTP 422 Unprocessable Entity):
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "value is not a valid email address: ...",
      "type": "value_error"
    }
  ]
}
```

---

## 3. Endpoints Specification

### 3.1 Health & Diagnostics

#### `GET /`
- **Description:** Basic API service meta and health.
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "name": "ReturnProof API",
    "version": "1.0.0",
    "status": "online",
    "docs_url": "/docs"
  }
  ```

#### `GET /health`
- **Description:** Global system and database ping.
- **Auth Required:** No
- **Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "database": "connected",
    "environment": "development",
    "timestamp": "2026-11-06T13:30:00.000Z"
  }
  ```

#### `GET /api/v1/health`
- **Description:** API v1 health and database connectivity diagnostics.
- **Auth Required:** No
- **Response (200 OK):** Same as `/health`.

---

### 3.2 Authentication & User Profile

#### `POST /api/v1/auth/register`
- **Description:** Register a new user with Argon2 password hashing.
- **Auth Required:** No
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "buyer@example.com",
    "full_name": "Jane Doe",
    "password": "StrongPassword123!",
    "role": "buyer"
  }
  ```
  *Allowed `role` values:* `"buyer"`, `"seller"`, `"admin"` (defaults to `"buyer"`).  
  *Password requirements:* Minimum 8 characters.
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "email": "buyer@example.com",
    "full_name": "Jane Doe",
    "role": "buyer",
    "created_at": "2026-11-06T13:30:00.000Z"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"detail": "A user with this email already exists."}`
  - `422 Unprocessable Entity`: Validation failure on email or password length.

---

#### `POST /api/v1/auth/login`
- **Description:** User login via JSON payload.
- **Auth Required:** No
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "buyer@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "buyer@example.com",
      "full_name": "Jane Doe",
      "role": "buyer",
      "created_at": "2026-11-06T13:30:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"detail": "Incorrect email or password."}`

---

#### `GET /api/v1/auth/me`
- **Description:** Retrieve currently authenticated user's profile.
- **Auth Required:** Yes (`Authorization: Bearer <TOKEN>`)
- **Response (200 OK):**
  ```json
  {
    "id": 1,
    "email": "buyer@example.com",
    "full_name": "Jane Doe",
    "role": "buyer",
    "created_at": "2026-11-06T13:30:00.000Z"
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"detail": "Could not validate authentication credentials."}`

---

### 3.3 Orders & Chain of Custody

#### `POST /api/v1/orders`
- **Description:** Create an order transaction.
- **Auth Required:** Yes (`Authorization: Bearer <TOKEN>`)
- **Roles:** `buyer`, `admin`
- **Request Body (Example 1: Existing Product):**
  ```json
  {
    "seller_id": 2,
    "product_id": 1
  }
  ```
- **Request Body (Example 2: Inline New Product & Custom Order Number):**
  ```json
  {
    "order_number": "ORD-2026-0099",
    "seller_id": 2,
    "product_name": "Apple MacBook Pro 16",
    "brand": "Apple",
    "serial_number": "C02XYZ123456"
  }
  ```
  *Note:* If `order_number` is omitted, the backend auto-generates a unique identifier (`ORD-YYYYMMDD-XXXXXX`).
- **Response (201 Created):**
  ```json
  {
    "id": 1,
    "order_number": "ORD-20261106-A1B2C3",
    "buyer_id": 1,
    "seller_id": 2,
    "product_id": 1,
    "order_date": "2026-11-06T13:30:00.000Z",
    "status": "pending",
    "created_at": "2026-11-06T13:30:00.000Z",
    "buyer": {
      "id": 1,
      "email": "buyer@example.com",
      "full_name": "Jane Doe",
      "role": "buyer",
      "created_at": "2026-11-06T13:30:00.000Z"
    },
    "seller": {
      "id": 2,
      "email": "seller@example.com",
      "full_name": "Tech Gadgets Store",
      "role": "seller",
      "created_at": "2026-11-06T13:30:00.000Z"
    },
    "product": {
      "id": 1,
      "product_name": "Apple MacBook Pro 16",
      "brand": "Apple",
      "serial_number": "C02XYZ123456",
      "created_at": "2026-11-06T13:30:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"detail": "Product with ID 999 not found."}` or duplicate order number.
  - `401 Unauthorized`: Token missing or expired.

---

#### `GET /api/v1/orders`
- **Description:** List orders with role-based filtering:
  - **Buyer:** Returns all purchases where `buyer_id == current_user.id`.
  - **Seller:** Returns all orders assigned where `seller_id == current_user.id`.
  - **Admin:** Returns all orders across the platform.
- **Auth Required:** Yes
- **Response (200 OK):**
  ```json
  [
    {
      "id": 1,
      "order_number": "ORD-20261106-A1B2C3",
      "buyer_id": 1,
      "seller_id": 2,
      "product_id": 1,
      "order_date": "2026-11-06T13:30:00.000Z",
      "status": "pending",
      "created_at": "2026-11-06T13:30:00.000Z",
      "buyer": { ... },
      "seller": { ... },
      "product": { ... }
    }
  ]
  ```

---

#### `GET /api/v1/orders/{order_id}`
- **Description:** Retrieve details for a specific order.
- **Auth Required:** Yes
- **Access Control:**
  - Buyer can only view their own purchase.
  - Seller can only view orders assigned to them.
  - Admin can view any order.
- **Response (200 OK):** Single order object.
- **Error Responses:**
  - `403 Forbidden`: `{"detail": "You do not have permission to access this order."}`
  - `404 Not Found`: `{"detail": "Order with ID 999 not found."}`

---

#### `PUT /api/v1/orders/{order_id}`
- **Description:** Update status or assignments of an order.
- **Auth Required:** Yes
- **Allowed Status Values:**
  - `"pending"`
  - `"confirmed"`
  - `"shipped"`
  - `"delivered"`
  - `"return_requested"`
  - `"returned"`
  - `"cancelled"`
- **Role Permissions:**
  - **Admin:** Can update status, seller_id, product_id.
  - **Seller:** Can update status (e.g., mark `"shipped"`, `"delivered"`) on orders assigned to them.
  - **Buyer:** Can update status to `"cancelled"` (if pending) or `"return_requested"` (if delivered).
- **Request Body (Example):**
  ```json
  {
    "status": "shipped"
  }
  ```
- **Response (200 OK):** Updated order object.
- **Error Responses:**
  - `400 Bad Request`: `{"detail": "Buyers may only update status to 'cancelled' or 'return_requested'."}`
  - `403 Forbidden`: `{"detail": "You can only update orders assigned to you."}`
  - `404 Not Found`: `{"detail": "Order with ID 999 not found."}`

---

## 4. File Upload Conventions (Upcoming Chain-of-Custody Evidence)

For future unboxing videos, tamper seal photographs, and shipping label scans:
- **Encoding:** `multipart/form-data`
- **Header:** `Authorization: Bearer <TOKEN>` (do not set `Content-Type` manually; allow browser/axios/fetch to include boundary parameter automatically)
- **Form Fields Convention:**
  - `file`: The binary media file (e.g. `image/jpeg`, `image/png`, `video/mp4`)
  - `order_id`: Integer reference
  - `evidence_type`: String (`"delivery_label"`, `"seal_intact"`, `"unboxing"`, `"item_condition"`)
  - `recorded_at`: ISO 8601 UTC timestamp
- **Storage Directory:** Stored in server-side `/uploads` directory and referenced via relative asset URL.

---

## 5. Next.js Integration Example (TypeScript / Fetch)

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(errorBody.detail || `Request failed with status ${response.status}`);
  }

  return response.json();
}
```


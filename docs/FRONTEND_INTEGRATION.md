# ReturnProof — Next.js Frontend Integration Contract
**Version:** 4.0.0 (Step 4: Frontend-Backend Integration Contract)  
**Author:** ReturnProof Backend Architecture Team  
**Target Client:** Next.js, React, TypeScript, Tailwind CSS  

---

## 1. Backend Configuration & Connection Endpoints

The FastAPI backend runs locally at:

| Service | URL |
|---|---|
| **Backend Base URL** | `http://localhost:8000` (or `http://127.0.0.1:8000`) |
| **API Base URL (v1)** | `http://localhost:8000/api/v1` |
| **Interactive Swagger UI** | `http://localhost:8000/docs` |
| **Interactive ReDoc** | `http://localhost:8000/redoc` |
| **OpenAPI Schema (JSON)** | `http://localhost:8000/openapi.json` |

---

## 2. Authentication & Authorization Workflow

ReturnProof uses **JSON Web Tokens (JWT)** with the `HS256` signing algorithm.

### 2.1 The Authentication Flow
1. **Registration:** The client calls `POST /api/v1/auth/register` to register an account (`buyer`, `seller`, or `admin`).
2. **Login:** The client sends JSON credentials to `POST /api/v1/auth/login`.
3. **Token Issuance:** The backend verifies credentials using Argon2 and returns:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "bearer",
     "user": {
       "id": 1,
       "email": "jane@example.com",
       "full_name": "Jane Doe",
       "role": "buyer",
       "created_at": "2026-11-06T12:00:00Z"
     }
   }
   ```
4. **Sending Token:** For all protected endpoints, attach the token in the standard HTTP header:
   ```http
   Authorization: Bearer <access_token>
   ```
5. **Handling Expired / Invalid Tokens:** When a request returns `401 Unauthorized`, clear the stored token on the frontend and redirect the user to `/login`.
6. **User Profile:** Call `GET /api/v1/auth/me` with the `Authorization` header to fetch the currently authenticated user's session data.

> [!CAUTION]
> **Client Security Rules:**
> - Never store plaintext passwords or admin API secret keys in the Next.js frontend code.
> - Store the JWT token in `localStorage`, a secure cookie (`httpOnly` where applicable), or session storage.
> - Never hardcode sample tokens or mock IDs in production components.

---

## 3. CORS Configuration

The backend is configured with strict, origin-validated CORS settings:

- **Allowed Development Origins:**
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
- **Allowed Methods:** `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- **Allowed Headers:** `*`
- **Credentials Support:** `true` (`Access-Control-Allow-Credentials: true`)

> [!NOTE]
> **Deploying to Staging or Production:**  
> To authorize additional frontend domain origins (e.g. `https://returnproof-web.azurewebsites.net`), update the `BACKEND_CORS_ORIGINS` variable in `backend/.env`:
> ```ini
> BACKEND_CORS_ORIGINS=["http://localhost:3000","https://your-frontend-domain.com"]
> ```
> Wildcard origins (`*`) are disallowed when `Allow-Credentials` is enabled.

---

## 4. API Specification (Actual Implemented Endpoints)

### 4.1 System & Health Diagnostics

#### `GET /`
- **Purpose:** Service root status and documentation links.
- **Auth:** No
- **Success Response (200 OK):**
  ```json
  {
    "name": "ReturnProof API",
    "version": "1.0.0",
    "status": "online",
    "docs_url": "/docs"
  }
  ```

#### `GET /health` & `GET /api/v1/health`
- **Purpose:** System health and database connectivity diagnostics.
- **Auth:** No
- **Success Response (200 OK):**
  ```json
  {
    "status": "healthy",
    "version": "1.0.0",
    "database": "connected",
    "environment": "development",
    "timestamp": "2026-11-06T14:40:00Z"
  }
  ```

---

### 4.2 Authentication & User Identity

#### `POST /api/v1/auth/register`
- **Purpose:** Create a new user account.
- **Auth:** No
- **Request Body:**
  ```json
  {
    "email": "seller@techstore.com",
    "full_name": "Tech Gadgets Store",
    "password": "StrongPassword123!",
    "role": "seller"
  }
  ```
  *Allowed `role` values:* `"buyer"`, `"seller"`, `"admin"` (defaults to `"buyer"`).  
  *Password rule:* Minimum 8 characters.
- **Success Response (201 Created):**
  ```json
  {
    "id": 2,
    "email": "seller@techstore.com",
    "full_name": "Tech Gadgets Store",
    "role": "seller",
    "created_at": "2026-11-06T14:00:00Z"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"detail": "A user with this email already exists."}`
  - `422 Unprocessable Entity`: Password too short or invalid email address.

#### `POST /api/v1/auth/login`
- **Purpose:** Authenticate credentials and receive JWT access token.
- **Auth:** No
- **Request Body:**
  ```json
  {
    "email": "seller@techstore.com",
    "password": "StrongPassword123!"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 2,
      "email": "seller@techstore.com",
      "full_name": "Tech Gadgets Store",
      "role": "seller",
      "created_at": "2026-11-06T14:00:00Z"
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: `{"detail": "Incorrect email or password."}`

#### `GET /api/v1/auth/me`
- **Purpose:** Retrieve the profile of the currently logged-in user.
- **Auth:** Yes (`Bearer <token>`)
- **Success Response (200 OK):** User object matching `POST /api/v1/auth/register`.
- **Error Responses:**
  - `401 Unauthorized`: `{"detail": "Could not validate authentication credentials."}`

---

### 4.3 Product Catalog APIs

#### `POST /api/v1/products`
- **Purpose:** Create a new product.
- **Auth:** Yes (Roles: `seller`, `admin`). Buyers receive `403 Forbidden`.
- **Request Body:**
  ```json
  {
    "product_name": "Sony Alpha A7 IV",
    "description": "Full-frame hybrid mirrorless camera body.",
    "sku": "SONY-A7IV-BODY",
    "category": "Cameras",
    "brand": "Sony",
    "price": 2498.00,
    "serial_number": "SN-SONY-112233"
  }
  ```
  *Note:* `seller_id` is automatically set to the authenticated seller's ID.
- **Success Response (201 Created):**
  ```json
  {
    "id": 1,
    "product_name": "Sony Alpha A7 IV",
    "description": "Full-frame hybrid mirrorless camera body.",
    "sku": "SONY-A7IV-BODY",
    "category": "Cameras",
    "brand": "Sony",
    "price": 2498.0,
    "serial_number": "SN-SONY-112233",
    "seller_id": 2,
    "created_at": "2026-11-06T14:10:00Z",
    "updated_at": "2026-11-06T14:10:00Z"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{"detail": "A product with SKU '...' already exists."}`
  - `403 Forbidden`: `{"detail": "Only registered sellers and administrators can create products."}`
  - `422 Unprocessable Entity`: Negative price or missing product name.

#### `GET /api/v1/products`
- **Purpose:** Browse the product catalog.
- **Auth:** Yes
- **Query Parameters (Optional):**
  - `category` (string): Filter by product category.
  - `brand` (string): Filter by brand name.
  - `seller_id` (integer): Filter by seller ID.
- **Success Response (200 OK):** Array of product objects.

#### `GET /api/v1/products/{product_id}`
- **Purpose:** Retrieve details for a single product.
- **Auth:** Yes
- **Success Response (200 OK):** Single product object.
- **Error Responses:**
  - `404 Not Found`: `{"detail": "Product with ID 999 not found."}`

#### `PUT /api/v1/products/{product_id}`
- **Purpose:** Update product fields (e.g., price, description, title).
- **Auth:** Yes (Only the owning seller or an admin).
- **Request Body:** Partial or complete product fields (`price`, `description`, `product_name`, etc.).
- **Success Response (200 OK):** Updated product object.
- **Error Responses:**
  - `403 Forbidden`: `{"detail": "You do not have permission to modify another seller's product."}`
  - `404 Not Found`: `{"detail": "Product with ID 999 not found."}`

#### `DELETE /api/v1/products/{product_id}`
- **Purpose:** Remove a product from the catalog.
- **Auth:** Yes (Only the owning seller or an admin).
- **Success Response:** `204 No Content` (empty body).
- **Error Responses:**
  - `400 Bad Request`: `{"detail": "Cannot delete product '...' because it has associated customer orders."}`
  - `403 Forbidden`: `{"detail": "You do not have permission to delete another seller's product."}`
  - `404 Not Found`: Product not found.

---

### 4.4 Order Management APIs

#### `POST /api/v1/orders`
- **Purpose:** Place a purchase order.
- **Auth:** Yes (Roles: `buyer`, `admin`).
- **Request Body:**
  ```json
  {
    "product_id": 1,
    "quantity": 2,
    "tracking_number": "TRK-FEDEX-998811"
  }
  ```
  *Note:* `total_amount` is automatically calculated from `product.price * quantity`.
- **Success Response (201 Created):**
  ```json
  {
    "id": 10,
    "order_number": "ORD-20261106-7C8D9E",
    "buyer_id": 1,
    "seller_id": 2,
    "product_id": 1,
    "quantity": 2,
    "total_amount": 4996.0,
    "tracking_number": "TRK-FEDEX-998811",
    "delivery_date": null,
    "order_date": "2026-11-06T14:20:00Z",
    "status": "pending",
    "created_at": "2026-11-06T14:20:00Z",
    "updated_at": "2026-11-06T14:20:00Z",
    "buyer": {
      "id": 1,
      "email": "buyer@example.com",
      "full_name": "Jane Doe",
      "role": "buyer"
    },
    "seller": {
      "id": 2,
      "email": "seller@techstore.com",
      "full_name": "Tech Gadgets Store",
      "role": "seller"
    },
    "product": {
      "id": 1,
      "product_name": "Sony Alpha A7 IV",
      "price": 2498.0
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Invalid seller or product ID.
  - `422 Unprocessable Entity`: Quantity <= 0.

#### `GET /api/v1/orders`
- **Purpose:** List orders accessible to current user.
- **Auth:** Yes
- **Data Isolation:**
  - **Buyer:** Sees their purchases (`buyer_id == user.id`).
  - **Seller:** Sees orders assigned to their store (`seller_id == user.id`).
  - **Admin:** Sees all orders across the platform.
- **Success Response (200 OK):** Array of order objects.

#### `GET /api/v1/orders/{order_id}`
- **Purpose:** Retrieve single order details.
- **Auth:** Yes (Only accessible to the order's buyer, assigned seller, or admin).
- **Success Response (200 OK):** Order object with nested buyer, seller, and product summaries.
- **Error Responses:**
  - `403 Forbidden`: `{"detail": "You do not have permission to access this order."}`
  - `404 Not Found`: `{"detail": "Order with ID 999 not found."}`

#### `PUT /api/v1/orders/{order_id}`
- **Purpose:** Update order information (e.g. carrier tracking code, delivery date).
- **Auth:** Yes (Role permissions apply).
- **Request Body (Example):**
  ```json
  {
    "tracking_number": "TRK-UPS-112233",
    "delivery_date": "2026-11-12T18:00:00Z"
  }
  ```
- **Success Response (200 OK):** Updated order object.

#### `PATCH /api/v1/orders/{order_id}/status`
- **Purpose:** Dedicated endpoint for order status transitions.
- **Auth:** Yes
- **Allowed Status Values:** `"pending"`, `"confirmed"`, `"shipped"`, `"delivered"`, `"return_requested"`, `"returned"`, `"cancelled"`.
- **Role Permission State Machine:**
  - **Seller:** Can transition to `"confirmed"`, `"shipped"`, `"delivered"`, `"returned"`.
  - **Buyer:** Can transition to `"cancelled"` (if pending) or `"return_requested"` (if delivered).
  - **Admin:** Can transition to any valid status.
- **Request Body:**
  ```json
  {
    "status": "shipped"
  }
  ```
- **Success Response (200 OK):** Updated order object.
- **Error Responses:**
  - `400 Bad Request`: `{"detail": "Buyers may only update status to 'cancelled' or 'return_requested'."}`
  - `403 Forbidden`: Not authorized to transition this order.
  - `404 Not Found`: Order ID not found.

---

## 5. Endpoints Audit & Roadmap Status

| Category | Endpoint / Capability | Status in Backend | Note for Frontend Developer |
|---|---|:---:|---|
| **System** | `GET /` | **LIVE** | Service status |
| **System** | `GET /health` | **LIVE** | Health ping |
| **System** | `GET /api/v1/health` | **LIVE** | Health ping |
| **Auth** | `POST /api/v1/auth/register` | **LIVE** | Register buyer/seller |
| **Auth** | `POST /api/v1/auth/login` | **LIVE** | JSON login, returns JWT |
| **Auth** | `POST /api/v1/auth/token` | **LIVE** | Form login for Swagger UI |
| **Auth** | `GET /api/v1/auth/me` | **LIVE** | Current user session |
| **Products** | `POST /api/v1/products` | **LIVE** | Seller creates product |
| **Products** | `GET /api/v1/products` | **LIVE** | Catalog query & filtering |
| **Products** | `GET /api/v1/products/{id}` | **LIVE** | Single item details |
| **Products** | `PUT /api/v1/products/{id}` | **LIVE** | Seller updates item |
| **Products** | `DELETE /api/v1/products/{id}` | **LIVE** | Seller deletes item |
| **Orders** | `POST /api/v1/orders` | **LIVE** | Place purchase order |
| **Orders** | `GET /api/v1/orders` | **LIVE** | Role-filtered order list |
| **Orders** | `GET /api/v1/orders/{id}` | **LIVE** | Single order details |
| **Orders** | `PUT /api/v1/orders/{id}` | **LIVE** | Update permitted fields |
| **Orders** | `PATCH /api/v1/orders/{id}/status` | **LIVE** | State transition |
| **Evidence** | `POST /api/v1/evidence/sessions` | **LIVE** | Initiate delivery/return session |
| **Evidence** | `GET /api/v1/evidence/sessions` | **LIVE** | List role-scoped sessions |
| **Evidence** | `GET /api/v1/evidence/sessions/{session_id}` | **LIVE** | Session details & files |
| **Evidence** | `PATCH /api/v1/evidence/sessions/{session_id}/status` | **LIVE** | Active/Completed/Cancelled status |
| **Evidence** | `POST /api/v1/evidence/sessions/{session_id}/files` | **LIVE** | Upload evidence (JPEG/PNG/WebP/MP4/WebM) |
| **Evidence** | `GET /api/v1/evidence/sessions/{session_id}/files` | **LIVE** | List session media files |
| **Evidence** | `GET /api/v1/evidence/files/{file_id}` | **LIVE** | File metadata & SHA-256 hash |
| **Evidence** | `GET /api/v1/evidence/files/{file_id}/download` | **LIVE** | Authorized media stream download |
| **Evidence** | `POST /api/v1/evidence/sessions/{session_id}/condition` | **LIVE** | Condition & packaging report |
| **Evidence** | `GET /api/v1/evidence/sessions/{session_id}/condition` | **LIVE** | List session condition reports |
| **Audit** | `GET /api/v1/evidence/audit/verify` | **LIVE** | Cryptographic audit chain verification |
| **Verification**| `POST /api/v1/verification/run` | *Upcoming (Step 6)* | Verification tables ready |
| **Disputes** | `POST /api/v1/disputes` | *Upcoming (Step 7)* | Dispute tables ready |

---

## 6. Frontend TypeScript Integration Examples

Create the following files in your Next.js project (`src/lib/api.ts` and `src/types/api.ts`):

### 6.1 TypeScript Interfaces (`types/api.ts`)

```typescript
export type UserRole = "buyer" | "seller" | "admin";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Product {
  id: number;
  product_name: string;
  description?: string | null;
  sku?: string | null;
  category?: string | null;
  brand?: string | null;
  price: number;
  serial_number?: string | null;
  seller_id?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "return_requested"
  | "returned"
  | "cancelled";

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  seller_id?: number | null;
  product_id?: number | null;
  quantity: number;
  total_amount: number;
  tracking_number?: string | null;
  delivery_date?: string | null;
  order_date: string;
  status: OrderStatus;
  created_at: string;
  updated_at?: string | null;
  buyer?: User;
  seller?: User;
  product?: Product;
}

export interface ApiError {
  detail: string | Array<{ loc: string[]; msg: string; type: string }>;
}
```

---

### 6.2 HTTP Client Implementation (`lib/api.ts`)

```typescript
import { AuthResponse, Order, OrderStatus, Product, User } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Helper for managing JWT token
export const tokenStorage = {
  get: (): string | null => (typeof window !== "undefined" ? localStorage.getItem("returnproof_token") : null),
  set: (token: string): void => {
    if (typeof window !== "undefined") localStorage.setItem("returnproof_token", token);
  },
  clear: (): void => {
    if (typeof window !== "undefined") localStorage.removeItem("returnproof_token");
  },
};

// Generic fetch wrapper with automatic error parsing and token injection
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = tokenStorage.get();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized (expired token)
  if (response.status === 401) {
    tokenStorage.clear();
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Authentication session expired. Please sign in again.");
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Parse error payload
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ detail: "Unknown server error" }));
    const message =
      typeof errorBody.detail === "string"
        ? errorBody.detail
        : Array.isArray(errorBody.detail)
        ? errorBody.detail.map((e: any) => e.msg).join(", ")
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

// ==========================================
// Authentication APIs
// ==========================================

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const data = await apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  tokenStorage.set(data.access_token);
  return data;
}

export async function registerUser(payload: {
  email: string;
  full_name: string;
  password: string;
  role?: "buyer" | "seller";
}): Promise<User> {
  return apiRequest<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiRequest<User>("/auth/me");
}

// ==========================================
// Product APIs
// ==========================================

export async function getProducts(filters?: {
  category?: string;
  brand?: string;
  seller_id?: number;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append("category", filters.category);
  if (filters?.brand) params.append("brand", filters.brand);
  if (filters?.seller_id) params.append("seller_id", filters.seller_id.toString());

  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest<Product[]>(`/products${query}`);
}

export async function getProductById(productId: number): Promise<Product> {
  return apiRequest<Product>(`/products/${productId}`);
}

export async function createProduct(payload: {
  product_name: string;
  description?: string;
  sku?: string;
  category?: string;
  brand?: string;
  price: number;
}): Promise<Product> {
  return apiRequest<Product>("/products", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateProduct(
  productId: number,
  payload: Partial<Product>
): Promise<Product> {
  return apiRequest<Product>(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteProduct(productId: number): Promise<void> {
  await apiRequest<void>(`/products/${productId}`, {
    method: "DELETE",
  });
}

// ==========================================
// Order APIs
// ==========================================

export async function getOrders(): Promise<Order[]> {
  return apiRequest<Order[]>("/orders");
}

export async function getOrderById(orderId: number): Promise<Order> {
  return apiRequest<Order>(`/orders/${orderId}`);
}

export async function createOrder(payload: {
  product_id: number;
  quantity: number;
  tracking_number?: string;
}): Promise<Order> {
  return apiRequest<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatus(
  orderId: number,
  status: OrderStatus
): Promise<Order> {
  return apiRequest<Order>(`/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// ==========================================
// Evidence & Chain-of-Custody APIs (Step 5)
// ==========================================

export async function createEvidenceSession(payload: {
  order_id: number;
  session_type: "delivery" | "return";
}): Promise<any> {
  return apiRequest("/evidence/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getEvidenceSession(sessionId: number): Promise<any> {
  return apiRequest(`/evidence/sessions/${sessionId}`);
}

export async function uploadEvidenceFiles(
  sessionId: number,
  files: File[]
): Promise<any> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const token = tokenStorage.get();
  const res = await fetch(`${API_BASE_URL}/evidence/sessions/${sessionId}/files`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) throw new Error("File upload failed");
  return res.json();
}

export async function submitConditionReport(
  sessionId: number,
  payload: {
    product_condition: string;
    damage_description?: string;
    packaging_condition?: string;
    accessories_status?: string;
    additional_notes?: string;
  }
): Promise<any> {
  return apiRequest(`/evidence/sessions/${sessionId}/condition`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyAuditChain(orderId?: number): Promise<any> {
  return apiRequest(orderId ? `/evidence/audit/verify?order_id=${orderId}` : "/evidence/audit/verify");
}
```

---

## 7. Frontend `.env` Setup

The expected environment configuration for the Next.js frontend has been placed in [frontend/.env.example](file:///c:/Users/rishi/OneDrive/Desktop/velo/frontend/.env.example):

```ini
# Next.js Frontend Environment Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

To run your Next.js project locally:
```bash
cp frontend/.env.example frontend/.env.local
npm run dev
```
The Next.js app will automatically connect to the live backend running on `http://127.0.0.1:8000`.


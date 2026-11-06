# ReturnProof — Product and Order API Specification
**Version:** 3.0.0 (Step 3: Product & Order API Development)  
**Base URL:** `http://127.0.0.1:8000` (or `http://localhost:8000`)  
**Interactive Docs:** `http://127.0.0.1:8000/docs`  
**OpenAPI Spec:** `http://127.0.0.1:8000/openapi.json`  

---

## 1. Overview & Authentication

All endpoints in this specification require Bearer authentication using a JWT token issued from `/api/v1/auth/login`.

```http
Authorization: Bearer <ACCESS_TOKEN>
```

### Role-Based Access Control (RBAC) Matrix

| Endpoint | Method | Allowed Roles | Restrictions / Ownership Rules |
|---|---|---|---|
| `/api/v1/products` | `POST` | `seller`, `admin` | Sellers can only create products for themselves; buyers forbidden (403). |
| `/api/v1/products` | `GET` | `buyer`, `seller`, `admin` | Public catalog view with optional filtering (`category`, `brand`, `seller_id`). |
| `/api/v1/products/{id}` | `GET` | `buyer`, `seller`, `admin` | Retrieve single product details (404 if missing). |
| `/api/v1/products/{id}` | `PUT` | `seller`, `admin` | Sellers can only modify their own products; other sellers or buyers receive 403. |
| `/api/v1/products/{id}` | `DELETE` | `seller`, `admin` | Only allowed if product has no customer orders (400 Bad Request otherwise). |
| `/api/v1/orders` | `POST` | `buyer`, `admin` | Buyers create orders for themselves; quantity must be > 0. |
| `/api/v1/orders` | `GET` | `buyer`, `seller`, `admin` | Filtered by role: buyers see purchases, sellers see assigned orders, admins see all. |
| `/api/v1/orders/{id}` | `GET` | `buyer`, `seller`, `admin` | Access restricted to participants (buyer, seller, or admin); otherwise 403. |
| `/api/v1/orders/{id}` | `PUT` | `buyer`, `seller`, `admin` | Role-restricted field modification. |
| `/api/v1/orders/{id}/status` | `PATCH` | `buyer`, `seller`, `admin` | Status transition: sellers ship/deliver, buyers cancel/request return. |

---

## 2. Product APIs

### 2.1 Create Product
- **Method:** `POST`
- **Path:** `/api/v1/products`
- **Auth:** Required (`seller` or `admin`)
- **Status Code:** `201 Created`

#### Request Body
```json
{
  "product_name": "Apple MacBook Pro 16",
  "description": "M3 Max chip, 36GB RAM, 1TB SSD Space Black",
  "sku": "MBP-16-M3MAX-BLK",
  "category": "Laptops",
  "brand": "Apple",
  "price": 3499.00,
  "serial_number": "C02XYZ987654"
}
```

#### Response Body (`201 Created`)
```json
{
  "id": 1,
  "product_name": "Apple MacBook Pro 16",
  "description": "M3 Max chip, 36GB RAM, 1TB SSD Space Black",
  "sku": "MBP-16-M3MAX-BLK",
  "category": "Laptops",
  "brand": "Apple",
  "price": 3499.0,
  "serial_number": "C02XYZ987654",
  "seller_id": 2,
  "created_at": "2026-11-06T14:30:00.000Z",
  "updated_at": "2026-11-06T14:30:00.000Z"
}
```

#### Example cURL
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/products" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Apple MacBook Pro 16",
    "description": "M3 Max chip, 36GB RAM, 1TB SSD Space Black",
    "sku": "MBP-16-M3MAX-BLK",
    "category": "Laptops",
    "brand": "Apple",
    "price": 3499.00
  }'
```

---

### 2.2 List Products
- **Method:** `GET`
- **Path:** `/api/v1/products`
- **Query Parameters (Optional):**
  - `category` (string): e.g. `Laptops`
  - `brand` (string): e.g. `Apple`
  - `seller_id` (integer): e.g. `2`
- **Auth:** Required
- **Status Code:** `200 OK`

#### Response Body
```json
[
  {
    "id": 1,
    "product_name": "Apple MacBook Pro 16",
    "description": "M3 Max chip, 36GB RAM, 1TB SSD Space Black",
    "sku": "MBP-16-M3MAX-BLK",
    "category": "Laptops",
    "brand": "Apple",
    "price": 3499.0,
    "serial_number": "C02XYZ987654",
    "seller_id": 2,
    "created_at": "2026-11-06T14:30:00.000Z",
    "updated_at": "2026-11-06T14:30:00.000Z"
  }
]
```

#### Example cURL
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/products?category=Laptops" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 2.3 Get Product by ID
- **Method:** `GET`
- **Path:** `/api/v1/products/{product_id}`
- **Auth:** Required
- **Status Code:** `200 OK` (or `404 Not Found`)

#### Example cURL
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/products/1" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 2.4 Update Product
- **Method:** `PUT`
- **Path:** `/api/v1/products/{product_id}`
- **Auth:** Required (`seller` owner or `admin`)
- **Status Code:** `200 OK`

#### Request Body
```json
{
  "price": 3299.00,
  "description": "Price drop: M3 Max chip, 36GB RAM, 1TB SSD Space Black"
}
```

#### Response Body
```json
{
  "id": 1,
  "product_name": "Apple MacBook Pro 16",
  "description": "Price drop: M3 Max chip, 36GB RAM, 1TB SSD Space Black",
  "sku": "MBP-16-M3MAX-BLK",
  "category": "Laptops",
  "brand": "Apple",
  "price": 3299.0,
  "serial_number": "C02XYZ987654",
  "seller_id": 2,
  "created_at": "2026-11-06T14:30:00.000Z",
  "updated_at": "2026-11-06T14:35:00.000Z"
}
```

#### Example cURL
```bash
curl -X PUT "http://127.0.0.1:8000/api/v1/products/1" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"price": 3299.00}'
```

---

### 2.5 Delete Product
- **Method:** `DELETE`
- **Path:** `/api/v1/products/{product_id}`
- **Auth:** Required (`seller` owner or `admin`)
- **Status Code:** `204 No Content`
- **Safety Restriction:** If active customer orders reference this product, returns `400 Bad Request`.

#### Example cURL
```bash
curl -X DELETE "http://127.0.0.1:8000/api/v1/products/1" \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 3. Order APIs

### 3.1 Create Order
- **Method:** `POST`
- **Path:** `/api/v1/orders`
- **Auth:** Required (`buyer` or `admin`)
- **Status Code:** `201 Created`

#### Request Body
```json
{
  "product_id": 1,
  "quantity": 2,
  "tracking_number": "TRK-UPS-778899"
}
```
*Note:* `total_amount` is automatically calculated from `product.price * quantity` if omitted.

#### Response Body (`201 Created`)
```json
{
  "id": 10,
  "order_number": "ORD-20261106-98AB12",
  "buyer_id": 1,
  "seller_id": 2,
  "product_id": 1,
  "quantity": 2,
  "total_amount": 6598.0,
  "tracking_number": "TRK-UPS-778899",
  "delivery_date": null,
  "order_date": "2026-11-06T14:40:00.000Z",
  "status": "pending",
  "created_at": "2026-11-06T14:40:00.000Z",
  "updated_at": "2026-11-06T14:40:00.000Z",
  "buyer": {
    "id": 1,
    "email": "buyer@example.com",
    "full_name": "Jane Doe",
    "role": "buyer",
    "created_at": "2026-11-06T12:00:00.000Z"
  },
  "seller": {
    "id": 2,
    "email": "seller@example.com",
    "full_name": "Apple Store Authorized",
    "role": "seller",
    "created_at": "2026-11-06T12:00:00.000Z"
  },
  "product": {
    "id": 1,
    "product_name": "Apple MacBook Pro 16",
    "price": 3299.0
  }
}
```

#### Example cURL
```bash
curl -X POST "http://127.0.0.1:8000/api/v1/orders" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 1,
    "quantity": 2,
    "tracking_number": "TRK-UPS-778899"
  }'
```

---

### 3.2 List Orders
- **Method:** `GET`
- **Path:** `/api/v1/orders`
- **Auth:** Required
- **Data Filtering:**
  - `buyer`: returns orders where `buyer_id == current_user.id`.
  - `seller`: returns orders where `seller_id == current_user.id`.
  - `admin`: returns all orders across the platform.

#### Example cURL
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/orders" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 3.3 Get Order by ID
- **Method:** `GET`
- **Path:** `/api/v1/orders/{order_id}`
- **Auth:** Required (must be buyer, assigned seller, or admin; 403 otherwise).

#### Example cURL
```bash
curl -X GET "http://127.0.0.1:8000/api/v1/orders/10" \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 3.4 Update Permitted Order Details
- **Method:** `PUT`
- **Path:** `/api/v1/orders/{order_id}`
- **Auth:** Required

#### Request Body
```json
{
  "tracking_number": "TRK-FEDEX-554433",
  "delivery_date": "2026-11-10T18:00:00Z"
}
```

#### Example cURL
```bash
curl -X PUT "http://127.0.0.1:8000/api/v1/orders/10" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"tracking_number": "TRK-FEDEX-554433"}'
```

---

### 3.5 Patch Order Status (Dedicated Lifecycle Transition)
- **Method:** `PATCH`
- **Path:** `/api/v1/orders/{order_id}/status`
- **Auth:** Required
- **Permitted Transitions:**
  - `seller`: `'confirmed'`, `'shipped'`, `'delivered'`, `'returned'`.
  - `buyer`: `'cancelled'` (if pending), `'return_requested'` (if delivered).
  - `admin`: all statuses.

#### Request Body
```json
{
  "status": "shipped"
}
```

#### Response Body
```json
{
  "id": 10,
  "order_number": "ORD-20261106-98AB12",
  "status": "shipped",
  "updated_at": "2026-11-06T15:00:00.000Z",
  ...
}
```

#### Example cURL
```bash
curl -X PATCH "http://127.0.0.1:8000/api/v1/orders/10/status" \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

---

## 4. Error Responses

All error payloads follow FastAPI's standard format:

```json
{
  "detail": "Descriptive error message"
}
```

| HTTP Code | Description | Typical Cause |
|---|---|---|
| `400 Bad Request` | Invalid request / Constraint violation | Duplicate SKU, deleting product with active orders, illegal buyer status transition. |
| `401 Unauthorized` | Authentication failure | Missing, expired, or malformed JWT token. |
| `403 Forbidden` | Permission denied | Buyer trying to create products; seller attempting to modify another seller's product/order. |
| `404 Not Found` | Resource missing | Product or order ID does not exist. |
| `422 Unprocessable Entity` | Schema validation error | Negative price, zero or negative order quantity, invalid email format. |


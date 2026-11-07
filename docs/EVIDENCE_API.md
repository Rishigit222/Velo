# ReturnProof — Evidence Capture & Chain-of-Custody Engine API Specification

**Version:** 1.0.0 (Step 5: Evidence Capture & Chain-of-Custody Engine)  
**Target:** FastAPI REST Backend & Next.js/React Frontend  
**Base URL:** `http://localhost:8000/api/v1/evidence`

---

## 1. Overview & Architecture

ReturnProof's Evidence Engine is a digital chain-of-custody platform that cryptographically captures, verifies, and maintains immutable physical condition evidence during e-commerce package delivery, unboxing, and returns.

```
+-----------------------------------------------------------------------------------+
|                            EVIDENCE CAPTURE WORKFLOW                              |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [Merchant / Buyer]                                                               |
|          │                                                                        |
|          ▼ (1) POST /api/v1/evidence/sessions                                     |
|  ┌──────────────────────────────┐                                                 |
|  │ EvidenceSession              │ ──> Validates Order ID & RBAC Boundaries        |
|  │ type: delivery | return      │ ──> Generates Hash-Linked Audit Event           |
|  └──────────────────────────────┘                                                 |
|          │                                                                        |
|          ▼ (2) POST /api/v1/evidence/sessions/{id}/files                          |
|  ┌──────────────────────────────┐                                                 |
|  │ EvidenceFiles Ingestion      │ ──> Magic Bytes & Extension Inspection          |
|  │ JPEG, PNG, WebP, MP4, WebM   │ ──> Backend SHA-256 Hash Calculation (Never Client)|
|  └──────────────────────────────┘ ──> Private Storage & Nonce-Named UUID Path     |
|          │                                                                        |
|          ▼ (3) POST /api/v1/evidence/sessions/{id}/condition                      |
|  ┌──────────────────────────────┐                                                 |
|  │ Condition Assessment Report  │ ──> Physical & Packaging Integrity Assessment   |
|  │ Damage notes & accessories   │ ──> Hash-Linked Audit Event                     |
|  └──────────────────────────────┘                                                 |
|          │                                                                        |
|          ▼ (4) GET /api/v1/evidence/audit/verify                                  |
|  ┌──────────────────────────────┐                                                 |
|  │ Cryptographic Audit Ledger   │ ──> Sequential SHA-256 Chain Verification       |
|  │ Detects Tampering & Breaks   │ ──> Proves Non-Repudiation for Disputes         |
|  └──────────────────────────────┘                                                 |
+-----------------------------------------------------------------------------------+
```

---

## 2. Supported Formats & Storage Specifications

### 2.1 File Formats & Magic Byte Signatures

Every uploaded file is inspected on the backend using both its lowercase file extension and its binary magic bytes to prevent MIME-type spoofing:

| Media Type | Extension | MIME Type | Magic Byte Binary Signature |
| :--- | :--- | :--- | :--- |
| **JPEG Image** | `.jpg`, `.jpeg` | `image/jpeg` | Starts with `0xFF 0xD8 0xFF` |
| **PNG Image** | `.png` | `image/png` | Starts with `0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A` (`\x89PNG\r\n\x1a\n`) |
| **WebP Image** | `.webp` | `image/webp` | Bytes 0..4 = `RIFF`, Bytes 8..12 = `WEBP` |
| **MP4 Video** | `.mp4` | `video/mp4` | Bytes 4..8 = `ftyp` (ISO Base Media container) |
| **WebM Video** | `.webm` | `video/webm` | Starts with `0x1A 0x45 0xDF 0xA3` (Matroska/EBML container) |

### 2.2 Storage Security & Path Traversal Protection

- **Private Storage:** Files are stored in a private directory configured via `UPLOAD_DIR` (default: `uploads/evidence`). Files are **never served directly via static public URLs**.
- **No Path Traversal:** User-provided filenames are stripped using `os.path.basename` and replaced on disk with collision-resistant UUIDs:
  `{uuid4}_{timestamp}{ext}` (e.g., `4a7b9c2d1e0f4a8b9c2d1e0f4a8b9c2d_1794041200.jpg`).
- **No Physical Path Exposure:** API responses never expose server filesystem paths (e.g. `C:\Users\...` or `/var/storage/...`). Responses return safe virtual download endpoints (e.g. `/api/v1/evidence/files/{file_id}/download`).

### 2.3 File Size Limits

- **Default Limit:** `52,428,800 bytes` (50 MB).
- **Environment Variable:** Configurable via `MAX_UPLOAD_SIZE_BYTES` in `.env`.
- **Enforcement:** If an uploaded payload exceeds the threshold, the server rejects the request with `HTTP 413 Content Too Large`.

---

## 3. SHA-256 File Integrity Engine

For every incoming media file:
1. **Raw Byte Ingestion:** The server streams raw file chunks into memory/buffer.
2. **Backend Computation:** The backend calculates `hashlib.sha256(content).hexdigest()`. Frontend-submitted hashes are strictly ignored to prevent forgery.
3. **Audit Anchorage:** The computed 64-character lowercase hex digest is written directly to the `evidence_files.file_hash` column and anchored to the tamper-evident audit log.
4. **Download Integrity:** During custody review or disputes, parties can download the file and independently verify the SHA-256 digest matches the database record.

> [!WARNING]
> **Cryptographic Scope Limitation:**  
> A SHA-256 digest mathematically guarantees that the stored file has not been modified or corrupted since the exact moment it reached the ReturnProof backend. However, SHA-256 alone cannot independently prove that the original recording was genuine, unmanipulated prior to upload, or that the client device timestamp was accurate.

---

## 4. Tamper-Evident Audit Chain Architecture

All operations produce sequential, hash-linked ledger entries in the `audit_logs` table:

$$\text{Current Hash} = \text{SHA-256}\left(\text{Previous Hash} \mid \text{Event Type} \mid \text{User ID} \mid \text{Order ID} \mid \text{Event Description} \mid \text{Timestamp}\right)$$

### 4.1 Tracked Audit Events

| Event Identifier | Trigger Condition |
| :--- | :--- |
| `EVIDENCE_SESSION_CREATED` | Delivery unboxing or return session initiated |
| `FILE_UPLOADED` | Video/photo uploaded with backend SHA-256 hash |
| `CONDITION_REPORT_SUBMITTED` | Product or packaging condition assessment logged |
| `FILE_DOWNLOADED` | Authorized user streamed/downloaded evidence media |
| `SESSION_STATUS_CHANGED` | Session lifecycle transitioned (active $\to$ completed / cancelled) |

### 4.2 Concurrency & Transactional Guarantee

- **Database-Level Atomicity:** Audit records are written within the same database transaction as the operational record. If file storage or database writes fail, the audit record is rolled back.
- **Process Mutex Locking:** Sequential chain tip calculations are protected by a thread-safe reentrant lock (`threading.RLock`) to guarantee strict sequential continuity under high-concurrency requests.

> [!WARNING]
> **Privileged Administrator Scope Limitation:**  
> A hash chain alone cannot prevent a privileged system administrator with direct database write access (`UPDATE` / `DELETE` privileges on the underlying SQL database) from modifying a row and recomputing the entire forward hash chain. Complete immutability requires external append-only storage, WORM media, or distributed ledger anchoring.

---

## 5. Endpoints & API Reference

All evidence endpoints require a valid JWT access token:
`Authorization: Bearer <token>`

### 5.1 Evidence Sessions

#### `POST /api/v1/evidence/sessions`
Create an evidence capture session for an order.

- **Permissions:**
  - `buyer`: Allowed if `order.buyer_id == current_user.id`.
  - `seller`: Allowed if `order.seller_id == current_user.id`.
  - `admin`: Allowed for any order.
- **Request Body (`application/json`):**
  ```json
  {
    "order_id": 1,
    "session_type": "delivery"
  }
  ```
  *(Supported session types: `"delivery"`, `"return"`)*
- **Response (`201 Created`):**
  ```json
  {
    "id": 1,
    "order_id": 1,
    "session_type": "delivery",
    "session_status": "active",
    "status": "active",
    "created_by": 1,
    "created_at": "2026-11-07T08:30:00Z",
    "completed_at": null,
    "updated_at": "2026-11-07T08:30:00Z",
    "files": [],
    "condition_reports": []
  }
  ```

---

#### `GET /api/v1/evidence/sessions`
List evidence sessions with role-based filtering.

- **Query Parameters:**
  - `order_id` (optional, integer): Filter sessions by specific order.
  - `session_type` (optional, string): Filter by `"delivery"` or `"return"`.
- **Permissions:** Buyers see only their sessions; sellers see only their sold products; admins see all.
- **Response (`200 OK`):**
  ```json
  [
    {
      "id": 1,
      "order_id": 1,
      "session_type": "delivery",
      "session_status": "active",
      "status": "active",
      "created_by": 1,
      "created_at": "2026-11-07T08:30:00Z",
      "completed_at": null,
      "updated_at": "2026-11-07T08:30:00Z",
      "files": [],
      "condition_reports": []
    }
  ]
  ```

---

#### `GET /api/v1/evidence/sessions/{session_id}`
Retrieve complete evidence session details including files and condition reports.

- **Response (`200 OK`):**
  ```json
  {
    "id": 1,
    "order_id": 1,
    "session_type": "delivery",
    "session_status": "active",
    "status": "active",
    "created_by": 1,
    "created_at": "2026-11-07T08:30:00Z",
    "completed_at": null,
    "updated_at": "2026-11-07T08:30:00Z",
    "files": [
      {
        "id": 1,
        "session_id": 1,
        "file_name": "unboxing_video.mp4",
        "file_type": "video/mp4",
        "file_path": "/api/v1/evidence/files/1/download",
        "file_hash": "2fbb8ac0dcf0888dd977635c871c22e143e649c8a3e630f8e846f1bd9049ec46",
        "file_size": 24508312,
        "uploaded_by": 1,
        "uploaded_at": "2026-11-07T08:31:00Z",
        "download_url": "/api/v1/evidence/files/1/download"
      }
    ],
    "condition_reports": [
      {
        "id": 1,
        "session_id": 1,
        "product_condition": "damaged",
        "damage_description": "Crack near charge port.\nNotes: Exterior box was torn.",
        "accessories_status": "complete",
        "packaging_condition": "torn",
        "additional_notes": null,
        "created_at": "2026-11-07T08:32:00Z"
      }
    ]
  }
  ```

---

#### `PATCH /api/v1/evidence/sessions/{session_id}/status`
Transition session lifecycle status.

- **Request Body (`application/json`):**
  ```json
  {
    "session_status": "completed"
  }
  ```
  *(Allowed: `"active"`, `"completed"`, `"cancelled"`)*
- **Response (`200 OK`):** Updated `EvidenceSessionResponse` with populated `completed_at`.

---

### 5.2 Evidence File Upload & Download

#### `POST /api/v1/evidence/sessions/{session_id}/files`
Upload one or more media files (`multipart/form-data`) to an active session.

- **Request:**
  ```http
  POST /api/v1/evidence/sessions/1/files HTTP/1.1
  Authorization: Bearer <access_token>
  Content-Type: multipart/form-data; boundary=----Boundary

  ------Boundary
  Content-Disposition: form-data; name="files"; filename="front_seal.jpg"
  Content-Type: image/jpeg

  <binary bytes>
  ------Boundary--
  ```
- **Response (`201 Created`):**
  ```json
  [
    {
      "id": 1,
      "session_id": 1,
      "file_name": "front_seal.jpg",
      "file_type": "image/jpeg",
      "file_path": "/api/v1/evidence/files/1/download",
      "file_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "file_size": 2048500,
      "uploaded_by": 1,
      "uploaded_at": "2026-11-07T08:31:00Z",
      "download_url": "/api/v1/evidence/files/1/download"
    }
  ]
  ```

---

#### `GET /api/v1/evidence/sessions/{session_id}/files`
List all files uploaded to a specific evidence session.

- **Response (`200 OK`):** `List[EvidenceFileResponse]`

---

#### `GET /api/v1/evidence/files/{file_id}`
Retrieve metadata and SHA-256 digest for an individual file.

- **Response (`200 OK`):** `EvidenceFileResponse`

---

#### `GET /api/v1/evidence/files/{file_id}/download`
Securely stream and download the raw evidence media file.

- **Permissions:** Only the buyer of the order, assigned seller, uploader, or administrator can download.
- **Audit:** Automatically logs a `FILE_DOWNLOADED` event to the chain-of-custody ledger.
- **Response (`200 OK`):** Binary stream (`FileResponse`) with original content-type header.

---

### 5.3 Physical Condition Assessment Reports

#### `POST /api/v1/evidence/sessions/{session_id}/condition`
Submit a physical condition assessment report for an active session.

- **Request Body (`application/json`):**
  ```json
  {
    "product_condition": "damaged",
    "damage_description": "Crack on corner of chassis.",
    "packaging_condition": "crushed",
    "accessories_status": "missing_cable",
    "additional_notes": "Delivered with shipping label punctured."
  }
  ```
- **Response (`201 Created`):**
  ```json
  {
    "id": 1,
    "session_id": 1,
    "product_condition": "damaged",
    "damage_description": "Crack on corner of chassis.\nNotes: Delivered with shipping label punctured.",
    "packaging_condition": "crushed",
    "accessories_status": "missing_cable",
    "additional_notes": null,
    "created_at": "2026-11-07T08:32:00Z"
  }
  ```

---

#### `GET /api/v1/evidence/sessions/{session_id}/condition`
Retrieve all condition assessment reports for an evidence session.

- **Response (`200 OK`):** `List[ConditionReportResponse]`

---

### 5.4 Audit Ledger Verification

#### `GET /api/v1/evidence/audit/verify`
Recalculates cryptographic SHA-256 hashes across the chain-of-custody ledger.

- **Query Parameters:**
  - `order_id` (optional, integer): Scope verification to events for a specific order.
- **Response (`200 OK`):**
  ```json
  {
    "is_valid": true,
    "total_records": 48,
    "verified_records": 48,
    "tampered_records": [],
    "errors": []
  }
  ```
- **Tampered Failure Example (`200 OK`):**
  ```json
  {
    "is_valid": false,
    "total_records": 48,
    "verified_records": 46,
    "tampered_records": [12, 13],
    "errors": [
      "Cryptographic tampering detected at audit record ID 12: stored hash 'abc...' does not match computed 'def...'",
      "Chain continuity broken at audit record ID 13: expected previous hash 'def...', found 'abc...'"
    ]
  }
  ```

---

## 6. Error Handling & HTTP Status Codes

| Code | Title | Scenario |
| :--- | :--- | :--- |
| `400 Bad Request` | Invalid Input | Empty file, unsupported extension, mismatched magic bytes, or non-active session upload |
| `401 Unauthorized` | Invalid Token | Missing, expired, or malformed JWT access token |
| `403 Forbidden` | Access Denied | User attempting to create or view evidence for an order they do not own or sell |
| `404 Not Found` | Resource Missing | Non-existent Order ID, Session ID, File ID, or missing file on disk |
| `413 Content Too Large` | File Too Large | Payload size exceeds `MAX_UPLOAD_SIZE_BYTES` (50 MB default) |
| `422 Unprocessable` | Schema Validation | Missing required JSON fields in session creation or condition report |

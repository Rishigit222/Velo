# Velo

**"Every return has a history. Every piece of evidence tells a story."**

> **Positioning Statement:** Velo is a digital chain-of-custody and return verification platform designed to record, structure, and verify physical product condition across the e-commerce fulfillment and returns lifecycle. By combining server-side cryptographic hashing (SHA-256), sequential tamper-evident audit logging, strict role-based access control (RBAC), and automated PDF evidence dossier compilation, Velo establishes verifiable provenance for high-value merchandise.

---

### Scope and Project Limitations

Velo provides an immutable, verifiable record of uploaded media, structured condition declarations, and custody events. It is designed to replace ambiguous email threads, unorganized image folders, and subjective dispute claims with structured, cryptographically anchored documentation.

> [!NOTE]
> **Defensive Engineering Scope:**
> - Velo **does not** claim to unilaterally eliminate e-commerce fraud or physically verify the authenticity of merchandise without human or hardware attestation.
> - Automated visual verification capabilities are architected as assistive analysis tools; final dispute arbitration remains governed by platform administrators and merchants.
> - Evidence integrity guarantees apply to the data stored on the platform from the exact point of ingestion onward; Velo cannot attest to physical events that occur outside of a recorded evidence session.

---

## At a Glance

| Dimension | Specification | Implementation Detail |
| :--- | :--- | :--- |
| **System Status** | Production-Ready Core / Staging Pilot | All 78 backend pytest suites passing (100%); Next.js frontend builds cleanly. |
| **Backend Framework** | FastAPI 0.162.0 / Python 3.11.15 | Asynchronous REST API, Pydantic v2 data validation, Starlette ASGI runtime. |
| **Frontend Framework** | Next.js 16.4.5 / React 19 / TypeScript 5 | Turbopack compilation, Tailwind CSS v4, custom Charcoal & Silver Devnovate theme. |
| **Database & ORM** | SQLAlchemy 2.0.38 / SQLite | Fully relational schema, foreign key constraints, parameterized queries, Alembic ready. |
| **Cryptographic Integrity** | Server-Side SHA-256 | SHA-256 digests computed during bounded chunk streaming; client hashes never trusted. |
| **Audit Ledger** | Hash-Linked Sequential Chain | Block-inspired deterministic hashing: `SHA-256(prev_hash \| event_type \| user_id \| order_id \| desc \| timestamp)`. |
| **Authentication & AuthZ** | Argon2id + JWT (HS256) | RFC 9106 Argon2id password hashing (64MB memory cost, 2 time passes); stateless signed JWTs. |
| **PDF Generation Engine** | ReportLab 5.1.0 | Two-pass `NumberedCanvas` compiling certified dossiers with SHA-256 checksums and audit histories. |
| **Test Coverage** | 78 Automated Tests | 100% passing across authentication, catalog, orders, evidence, disputes, reports, and security audit. |

---

## Table of Contents

- [1. Overview](#1-overview)
- [2. Why E-Commerce Return Verification Matters](#2-why-e-commerce-return-verification-matters)
- [3. Key Features](#3-key-features)
- [4. Flagship Workflow: Complete Order-to-Return Lifecycle](#4-flagship-workflow-complete-order-to-return-lifecycle)
- [5. Additional Workflows](#5-additional-workflows)
- [6. How Velo Works](#6-how-velo-works)
- [7. System Architecture](#7-system-architecture)
- [8. Evidence and Chain-of-Custody Model](#8-evidence-and-chain-of-custody-model)
- [9. AI-Assisted Image Verification Engine](#9-ai-assisted-image-verification-engine)
- [10. Web Application (Frontend)](#10-web-application-frontend)
- [11. Backend Application](#11-backend-application)
- [12. API Reference](#12-api-reference)
- [13. Technology Stack](#13-technology-stack)
- [14. Repository Structure](#14-repository-structure)
- [15. Quick Start and Installation](#15-quick-start-and-installation)
- [16. Configuration and Environment Variables](#16-configuration-and-environment-variables)
- [17. Testing and Quality Assurance](#17-testing-and-quality-assurance)
- [18. Evidence Integrity and Auditability](#18-evidence-integrity-and-auditability)
- [19. Security Model](#19-security-model)
- [20. Deployment Guide](#20-deployment-guide)
- [21. Scientific and Technical Limitations](#21-scientific-and-technical-limitations)
- [22. Development Roadmap](#22-development-roadmap)
- [23. Contributing](#23-contributing)
- [24. License](#24-license)
- [25. Acknowledgments](#25-acknowledgments)

---

## 1. Overview

E-commerce supply chains suffer from a structural visibility gap between warehouse dispatch and customer return inspection. When high-value electronics, luxury apparel, or serialized items are returned damaged, altered, or missing components, merchants and consumers frequently find themselves in zero-trust deadlock:

- Merchants face **friendly fraud**, **wardrobing**, and **box-swapping** where items are claimed to have arrived damaged or incomplete.
- Consumers face **unfair dispute rejections**, arbitrary restocking fees, and prolonged arbitration windows when legitimate transit damage occurs.
- Payment processors and card networks lack objective, contemporaneous technical records to adjudicate chargebacks accurately.

Velo solves this by introducing a **dual-session evidence protocol**. By capturing structured photographic and video evidence during outbound packing (*Delivery Session*) and inbound receipt (*Return Session*), computing cryptographic digests immediately upon receipt, and maintaining a chronological, tamper-evident audit ledger, Velo produces court-admissible custody dossiers that eliminate ambiguity.

---

## 2. Why E-Commerce Return Verification Matters

According to the National Retail Federation (NRF), return fraud and abuse cost retailers tens of billions of dollars annually. Beyond immediate balance sheet loss, return disputes generate massive operational friction:

1. **Information Asymmetry:** Buyers and sellers possess isolated, non-verifiable claims regarding the condition of an item at the exact moment of unboxing or return packing.
2. **Media Spoofing & Metadata Manipulation:** Conventional image uploads via support tickets routinely strip EXIF metadata, alter compression artifacts, and allow post-facto modification or recycling of stock photos.
3. **Arbitration Latency:** Payment dispute processes (e.g. Visa/Mastercard representment, PayPal claims) take 45–90 days because submitted evidence consists of unauthenticated screenshots and conflicting statements.
4. **Administrative Overhead:** Support teams spend hundreds of hours manually verifying serial numbers, comparing condition descriptions, and assembling dispute packets.

Velo converts fragmented claim interactions into a unified, mathematically verifiable chain-of-custody dossier that can be exported as a certified PDF or verified cryptographically in real time.

---

## 3. Key Features

### 3.1 Dual-Session Chain of Custody
- **Outbound Dispatch Evidence:** Merchants capture multi-angle photos, serial number close-ups, and factory seal integrity before packing.
- **Inbound Customer Evidence:** Customers capture unboxing photos, packaging conditions, and damage notes upon receipt or return dispatch.
- **Session State Transitions:** Evidence sessions maintain strict finite state transitions (`active` $\rightarrow$ `completed` or `cancelled`). Once marked completed, a session is permanently frozen against further file uploads.

### 3.2 Cryptographic Integrity & File Ingestion
- **Server-Side SHA-256:** Cryptographic checksums are calculated on the backend during bounded chunk streaming; client-provided hashes are never trusted.
- **Magic Byte Inspection:** Uploaded files undergo binary signature validation to prevent MIME-spoofing attacks (verifying real JPEG, PNG, WebP, MP4, and WebM byte headers).
- **Private Access Control:** Evidence files are stored in non-public storage directories with collision-free UUID identifiers. Unauthenticated or third-party access returns `403 Forbidden`.

### 3.3 Tamper-Evident Hash-Chained Audit Ledger
- **Blockchain-Inspired Hash Chaining:** Every custody event (session creation, file upload, condition assessment, status transition, dispute action, report download) generates an immutable audit record linked to the previous record's SHA-256 hash.
- **Deterministic Serialization:** Hash computation utilizes pipe-delimited canonical formatting with UTC ISO timestamps.
- **Thread-Safe Mutex Lock:** Concurrency is protected by a process-level re-entrant lock (`threading.RLock`) ensuring unbroken sequential chain continuity under concurrent traffic.

### 3.4 Dispute Management & Finite State Machine
- **Structured Dispute Intake:** Claims require standardized taxonomies (`damaged`, `wrong_item`, `missing_parts`, `tampered`).
- **Conflict Prevention:** Active duplicate disputes on the same order are rejected with `409 Conflict`.
- **Governed Lifecycles:** Enforces authorized state transitions (`submitted` $\rightarrow$ `under_review` $\rightarrow$ `resolved` / `rejected`). Finalized disputes cannot be altered.

### 3.5 Institutional ReportLab PDF Evidence Dossiers
- **Dynamic Two-Pass Pagination:** Utilizes `NumberedCanvas` to calculate total pages and render running headers and footers ("Page X of Y").
- **Audit-Grade Content:** Automatically compiles order metadata, participant identities, outbound/return evidence tables with SHA-256 hashes, condition reports, and the complete audit trail.
- **Authenticated Streaming:** Supports direct streaming via order aliases (`/reports/order/{id}/pdf`) and authenticated binary downloads.

---

## 4. Flagship Workflow: Complete Order-to-Return Lifecycle

The primary operational workflow demonstrates how Velo establishes an unbroken custody record from initial order placement through return dispute resolution:

```mermaid
sequenceDiagram
    autonumber
    actor Seller as Merchant / Seller
    actor Buyer as Customer / Buyer
    participant API as Velo REST API
    participant Ledger as Audit Hash Ledger
    participant Storage as Private Media Store
    participant PDF as ReportLab PDF Engine

    Seller->>API: POST /api/v1/products (Create Product SKU & Serial)
    Buyer->>API: POST /api/v1/orders (Place Order)
    Seller->>API: POST /api/v1/evidence/sessions (Start Delivery Session)
    Seller->>API: POST /api/v1/evidence/sessions/{id}/files (Upload Dispatch Media)
    API->>Storage: Stream & Store Payload (SHA-256 Calculated)
    API->>Ledger: Record Audit Event (FILE_UPLOADED)
    Seller->>API: PATCH /api/v1/evidence/sessions/{id}/status (Complete Session)
    
    Note over Buyer,Seller: Physical Transit & Delivery Phase

    Buyer->>API: POST /api/v1/evidence/sessions (Start Return Session)
    Buyer->>API: POST /api/v1/evidence/sessions/{id}/files (Upload Unboxing/Return Media)
    API->>Storage: Stream & Store Payload (SHA-256 Calculated)
    Buyer->>API: POST /api/v1/evidence/sessions/{id}/condition (Submit Damage Report)
    API->>Ledger: Record Audit Event (CONDITION_REPORT_SUBMITTED)
    Buyer->>API: PATCH /api/v1/evidence/sessions/{id}/status (Complete Session)

    Buyer->>API: POST /api/v1/disputes (File Dispute Claim)
    API->>Ledger: Record Audit Event (DISPUTE_CREATED)
    Seller->>API: PATCH /api/v1/disputes/{id}/status (Move to under_review)
    
    Seller->>API: POST /api/v1/reports/orders/{id}/generate (Compile Custody Dossier)
    API->>PDF: Assemble Two-Pass Numbered Dossier
    PDF->>Storage: Store Certified PDF
    API->>Ledger: Record Audit Event (REPORT_GENERATED)
    Seller->>API: GET /api/v1/reports/{id}/download (Stream Verified PDF)
```

---

## 5. Additional Workflows

### 5.1 Physical Condition Assessment Workflow
Beyond media uploads, participants submit structured condition questionnaires attached directly to active sessions:
1. Participant specifies `product_condition` (`New / Sealed`, `Used`, `Damaged`).
2. Documents `packaging_condition` (`Pristine`, `Torn`, `Missing Box`).
3. Verifies `accessories_status` (`All Included`, `Missing Cables / Adapters`).
4. Submits specific narrative notes regarding observed transit or handling flaws.
5. Record is immutably committed and rendered into the final PDF evidence report.

### 5.2 Cryptographic Chain Integrity Verification
Administrators and authorized parties can trigger mathematical chain-of-custody verification at any point:
- `GET /api/v1/evidence/audit/verify?order_id={id}`
- The engine fetches all chronological audit events, re-computes canonical SHA-256 digests from raw properties, and compares stored hashes against expected sequential values.
- If an audit record was modified, inserted, or deleted directly in the database, the endpoint identifies the exact record ID where continuity failed and returns `is_valid: false`.

---

## 6. How Velo Works

Velo implements a zero-trust model between all transacting parties:

```
[Merchant Dispatch]              [Carrier Transit]              [Customer Unboxing]
        │                                │                               │
        ▼                                │                               ▼
┌──────────────────┐                     │                     ┌──────────────────┐
│ Delivery Session │                     │                     │  Return Session  │
│ - Factory Seals  │                     │                     │ - Exterior Box   │
│ - Serial Number  │                     │                     │ - Internal Wrap  │
│ - Package Weight │                     │                     │ - Defect Details │
└────────┬─────────┘                     │                     └────────┬─────────┘
         │                               │                              │
         ▼                               │                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          Velo Ingestion & Ledger Core                           │
│  - Stream Payload ──> 64KB Chunk Buffer ──> Server-Side SHA-256 Digest           │
│  - Magic Byte Filter (JPEG/PNG/WebP/MP4/WebM) ──> Private Storage Isolation     │
│  - Transactional Hash-Chaining: SHA-256(PrevHash + Event + Timestamp)           │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      Arbitration & Dossier Export Engine                        │
│  - Multi-Party Dispute State Machine (Submitted ──> Under Review ──> Resolved)  │
│  - Certified ReportLab PDF Generation with Checksums and Running Audit Trail     │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. System Architecture

The Velo platform is split into a Next.js 16 frontend, a FastAPI asynchronous backend, a relational database, and private filesystem storage:

```mermaid
flowchart TD
    subgraph ClientLayer["Frontend Client (Next.js 16 / React 19)"]
        UI_Buyer["Buyer Dashboard & Capture Portal"]
        UI_Seller["Seller Dashboard & Catalog"]
        UI_Admin["Admin Arbitration Interface"]
        APIClient["Typed API Client & Token Storage"]
    end

    subgraph Gateway["FastAPI Application Gateway (Port 8000)"]
        CORSMW["CORS Middleware"]
        SecHeaders["Security Headers Middleware"]
        RateLimit["Sliding Window Rate Limiter"]
        JWTDeps["JWT & RBAC Dependencies"]
    end

    subgraph ServiceLayer["Business Logic Services"]
        AuthSvc["Auth Service (Argon2id)"]
        OrderSvc["Order & Catalog Service"]
        EvidenceSvc["Evidence & Ingestion Service"]
        AuditSvc["Cryptographic Audit Service"]
        DisputeSvc["Dispute Arbitration Engine"]
        ReportSvc["ReportLab PDF Engine"]
    end

    subgraph StorageLayer["Persistence & Storage Layer"]
        DB[("SQLite Database (returnproof.db)")]
        PrivateStorage[("Private File Storage (/uploads)")]
    end

    UI_Buyer --> APIClient
    UI_Seller --> APIClient
    UI_Admin --> APIClient
    APIClient --> CORSMW
    CORSMW --> SecHeaders
    SecHeaders --> RateLimit
    RateLimit --> JWTDeps
    JWTDeps --> ServiceLayer

    AuthSvc --> DB
    OrderSvc --> DB
    EvidenceSvc --> DB
    EvidenceSvc --> PrivateStorage
    AuditSvc --> DB
    DisputeSvc --> DB
    ReportSvc --> DB
    ReportSvc --> PrivateStorage
```

---

## 8. Evidence and Chain-of-Custody Model

The evidence capture model governs media ingestion, validation, and lifecycle states:

```mermaid
stateDiagram-v2
    [*] --> SessionInitiated: POST /sessions (delivery or return)
    SessionInitiated --> Active: Initialized with Audit Record
    
    state Active {
        [*] --> ChunkStreaming: Multipart Upload
        ChunkStreaming --> MagicByteCheck: Validate Binary Signature
        MagicByteCheck --> HashComputation: Server-side SHA-256 Digest
        HashComputation --> SecureDiskWrite: UUID-named Private Storage
        SecureDiskWrite --> ConditionAssessment: POST /condition (Packaging/Damage Notes)
    }

    Active --> Completed: PATCH /status (session_status = completed)
    Active --> Cancelled: PATCH /status (session_status = cancelled)

    state Completed {
        [*] --> ImmutableState
        ImmutableState --> PartyInspection: Authenticated Download (RBAC 403)
        ImmutableState --> AuditVerification: Mathematical Chain Recalculation
        ImmutableState --> PDFDossierCompilation: Ingested into Evidence Dossier
    }

    Completed --> [*]
    Cancelled --> [*]
```

### Mathematical Chaining Formulation
Each audit event $E_i$ is bound to the preceding record $E_{i-1}$ via:

$$H_i = \text{SHA-256}\left( H_{i-1} \parallel T_i \parallel U_i \parallel O_i \parallel D_i \parallel S_i \right)$$

Where:
- $H_i$: Current record cryptographic digest.
- $H_{i-1}$: Previous record hash ($H_0 = \text{"GENESIS"}$).
- $T_i$: Event type identifier (e.g. `FILE_UPLOADED`, `DISPUTE_CREATED`).
- $U_i$: Acting User ID.
- $O_i$: Associated Order ID.
- $D_i$: Normalized event description payload.
- $S_i$: Canonical UTC ISO-8601 timestamp string.

---

## 9. AI-Assisted Image Verification Engine

Velo is architected with a dedicated relational schema for automated condition verification:

- **Database Entity:** `verification_results` table stores comparison records linking `original_session_id` and `return_session_id`.
- **Tracked Metrics:** `identity_result`, `damage_result`, `accessories_result`, `overall_status`, `confidence_score`, and detailed `findings`.
- **Honest Disconnected State Handling:** As documented in `frontend/src/services/verificationService.ts`, when backend computer vision endpoints return `404 Not Found`, the frontend gracefully surfaces a clean roadmap status. **Zero fake, mock, or fabricated confidence scores are emitted.**

---

## 10. Web Application (Frontend)

Built with Next.js 16.4.5 (Turbopack) and React 19:

- **Design System:** Devnovate-inspired charcoal palette (`#0F0F11`, `#141416`, `#1E1E22`), subtle silver borders (`white/[0.08]`), and refined typography.
- **Role-Aware Portals:** Custom interfaces tailored for Buyers (order review, unboxing capture, dispute submission) and Sellers (inventory catalog, dispatch capture, arbitration review).
- **Authentication Context:** `useAuth()` hook provides reactive session management, JWT decoding, and protected route redirection.
- **Optimized Compilation:** All 15 application routes compile with partial prerendering and static optimization.

---

## 11. Backend Application

Built with FastAPI 0.162.0 and Python 3.11:

- **Pydantic Validation:** Strict schema enforcement on all incoming requests and outgoing serialization models.
- **Relational Integrity:** SQLAlchemy ORM models with explicit foreign key cascades (`users`, `products`, `orders`, `evidence_sessions`, `evidence_files`, `condition_reports`, `disputes`, `reports`, `audit_logs`).
- **Defensive Middleware:**
  - Sliding-window rate limiter on authentication routes (30 req/min per IP).
  - Security headers middleware (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`, HSTS).
  - Global exception handler preventing internal traceback exposure.
  - Interactive OpenAPI `/docs` automatically disabled in production.

---

## 12. API Reference

All endpoints are prefixed with `/api/v1` and require `Authorization: Bearer <token>` unless marked Public.

### 12.1 Authentication Endpoints

| Method | Endpoint | Auth | Purpose | Access Rules |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new user account | Buyer or Seller role only (Admin self-registration returns `403`). Rate limited. |
| `POST` | `/auth/login` | Public | Authenticate user (JSON) | Validates email & Argon2 password; returns JWT token. Rate limited. |
| `POST` | `/auth/token` | Public | OAuth2 Form Login | Swagger UI compatibility endpoint. Rate limited. |
| `GET` | `/auth/me` | Bearer | Retrieve authenticated profile | Returns current user ID, email, name, and role. |

### 12.2 Product Catalog Endpoints

| Method | Endpoint | Auth | Purpose | Access Rules |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/products` | Bearer | Create catalog item | Seller or Admin only. Buyers receive `403 Forbidden`. |
| `GET` | `/products` | Bearer | List & filter products | Supports `category`, `brand`, `seller_id`, and `sku` query filters. |
| `GET` | `/products/{id}` | Bearer | Get product details | Open to all authenticated users. |
| `PUT` | `/products/{id}` | Bearer | Update product | Owning Seller or Admin only. |
| `DELETE` | `/products/{id}` | Bearer | Delete product | Owning Seller or Admin only. Blocked if product has associated orders. |

### 12.3 Order Management Endpoints

| Method | Endpoint | Auth | Purpose | Access Rules |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/orders` | Bearer | Place an order | Buyer creates for self; Admin can specify `buyer_id`. |
| `GET` | `/orders` | Bearer | List user orders | Buyers see their purchases; Sellers see assigned orders; Admins see all. |
| `GET` | `/orders/{id}` | Bearer | Get order details | Restricted to order Buyer, assigned Seller, or Admin (`403` otherwise). |
| `PUT` | `/orders/{id}` | Bearer | Update order properties | Role-based: Sellers update tracking/delivery; Buyers request returns. |
| `PATCH` | `/orders/{id}/status` | Bearer | Update lifecycle status | Role-governed order status transition. |
| `GET` | `/orders/{id}/disputes`| Bearer | List disputes for order | Restricted to order Buyer, Seller, or Admin. |

### 12.4 Evidence Capture & Custody Endpoints

| Method | Endpoint | Auth | Purpose | Access Rules |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/evidence/sessions` | Bearer | Create evidence session | Initiates `delivery` or `return` session. Order parties only. |
| `GET` | `/evidence/sessions` | Bearer | List evidence sessions | Filter by `order_id` or `session_type`. Role-filtered. |
| `GET` | `/evidence/sessions/{id}` | Bearer | Get session details | Includes uploaded files and condition reports. |
| `PATCH`| `/evidence/sessions/{id}/status` | Bearer | Update session status | Transitions between `active`, `completed`, and `cancelled`. |
| `POST` | `/evidence/sessions/{id}/files` | Bearer | Upload evidence media | Multipart upload. Magic byte validation, SHA-256 computation. Active session only. |
| `GET` | `/evidence/sessions/{id}/files` | Bearer | List files in session | Restricted to order parties. |
| `GET` | `/evidence/files/{id}` | Bearer | Get file metadata | Returns SHA-256 digest, size, and download URL. |
| `GET` | `/evidence/files/{id}/download`| Bearer | Stream media file | Secure binary download. Third-party users blocked with `403`. |
| `POST` | `/evidence/sessions/{id}/condition` | Bearer | Submit condition report | Documents packaging, damage, and accessories status. |
| `GET` | `/evidence/sessions/{id}/condition` | Bearer | Get condition reports | Retrieves condition reports for session. |
| `GET` | `/evidence/audit/verify` | Bearer | Verify audit hash chain | Verifies order ledger for parties; global verification requires Admin. |

### 12.5 Dispute Management Endpoints

| Method | Endpoint | Auth | Purpose | Access Rules |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/disputes` | Bearer | File dispute claim | Buyer or Seller on order. Duplicate active claims return `409 Conflict`. |
| `GET` | `/disputes` | Bearer | List user disputes | Filter by `order_id` and `status`. Filtered by user role. |
| `GET` | `/disputes/{id}` | Bearer | Get dispute dossier | Restricted to order parties and Admin. |
| `PATCH`| `/disputes/{id}/status` | Bearer | Transition dispute state| Validates status transitions (`submitted` $\rightarrow$ `under_review` $\rightarrow$ `resolved`). |

### 12.6 PDF Evidence Report Endpoints

| Method | Endpoint | Auth | Purpose | Access Rules |
| :--- | :--- | :---: | :--- | :--- |
| `POST` | `/reports/orders/{id}/generate` | Bearer | Compile PDF dossier | Generates ReportLab certified PDF with checksums. Order parties only. |
| `GET` | `/reports/orders/{id}` | Bearer | Get latest report meta | Retrieves metadata for most recent report. Auto-generates if absent. |
| `GET` | `/reports/{id}` | Bearer | Get report metadata | Metadata and SHA-256 checksum by report ID. |
| `GET` | `/reports/{id}/download` | Bearer | Download PDF binary | Streams verified `%PDF-` document (`Content-Type: application/pdf`). |
| `GET` | `/reports/order/{id}/pdf` | Bearer | Direct stream alias | Instant PDF stream by Order ID for arbitration packs. |

### 12.7 Health & System Endpoints

| Method | Endpoint | Auth | Purpose | Access Rules |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/` | Public | API Root Info | Returns service name, version, status, and docs link. |
| `GET` | `/health` | Public | Global Health Check | Database connectivity, environment status, and UTC timestamp. |
| `GET` | `/api/v1/health` | Public | API v1 Health Check | Redundant v1-prefixed health probe. |

---

## 13. Technology Stack

### Frontend Application
- **Next.js 16.4.5 (Turbopack):** App Router, Server Components, and Partial Prerendering.
- **React 19.3.0 & React DOM 19.3.0:** Modern concurrent UI rendering.
- **TypeScript 5:** Static end-to-end type safety.
- **Tailwind CSS v4:** Hardware-accelerated styling with custom CSS design tokens.
- **Lucide React 1.70.0:** Standardized iconography.

### Backend Application
- **FastAPI 0.162.0:** Asynchronous Python web framework with ASGI performance.
- **Starlette 1.10.0 & Uvicorn 0.54.0:** ASGI toolkit and production HTTP server.
- **SQLAlchemy 2.1.8:** Type-safe relational ORM with connection pooling.
- **Pydantic 2.14.3 & Pydantic-Settings 2.16.2:** Declarative validation and configuration.
- **Argon2-Cffi 23.1.0:** Password hashing conforming to RFC 9106.
- **PyJWT 2.15.1:** Cryptographic JSON Web Token issuance and validation.
- **ReportLab 5.1.0:** Institutional PDF document assembly.
- **Pillow 13.0.0:** Image verification and manipulation primitives.

---

## 14. Repository Structure

```
velo/
├── backend/
│   ├── alembic/                      # Database migration configuration
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py             # Pydantic environment settings & validators
│   │   │   ├── rate_limiter.py       # Sliding-window brute force protection
│   │   │   └── security.py           # Argon2id hasher & JWT encoding/decoding
│   │   ├── database/
│   │   │   ├── base.py               # Declarative SQLAlchemy base
│   │   │   └── connection.py         # Engine binding & session factory
│   │   ├── models/                   # SQLAlchemy database entity models
│   │   │   ├── audit_log.py          # Tamper-evident hash chain entity
│   │   │   ├── condition_report.py   # Physical condition assessment entity
│   │   │   ├── dispute.py            # Dispute lifecycle entity
│   │   │   ├── evidence_file.py      # Stored media metadata entity
│   │   │   ├── evidence_session.py   # Delivery/return session entity
│   │   │   ├── order.py              # Order tracking entity
│   │   │   ├── product.py            # Inventory catalog entity
│   │   │   ├── report.py             # Compiled PDF metadata entity
│   │   │   ├── user.py               # User account entity
│   │   │   └── verification_result.py# Visual comparison result entity
│   │   ├── routes/                   # FastAPI route handlers
│   │   │   ├── api_v1.py             # Consolidated v1 router
│   │   │   ├── auth.py               # Registration, login & profile routes
│   │   │   ├── deps.py               # JWT authentication & RBAC dependencies
│   │   │   ├── disputes.py           # Dispute claims and resolution routes
│   │   │   ├── evidence.py           # Session, file upload & audit routes
│   │   │   ├── health.py             # Health check endpoints
│   │   │   ├── orders.py             # Order lifecycle routes
│   │   │   ├── products.py           # Product catalog routes
│   │   │   └── reports.py            # PDF compilation & download routes
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── services/                 # Core business logic modules
│   │   │   ├── audit_service.py      # Hash chaining & tamper detection
│   │   │   ├── auth_service.py       # Authentication & user registration
│   │   │   ├── dispute_service.py    # Dispute state machine & conflict rules
│   │   │   ├── evidence_service.py   # Chunk streaming, magic bytes & storage
│   │   │   ├── order_service.py      # Order fulfillment & RBAC
│   │   │   ├── product_service.py    # Product catalog management
│   │   │   └── report_service.py     # ReportLab PDF dossier generation
│   │   ├── utils/                    # Structured logging and utilities
│   │   └── main.py                   # Application factory & middleware configuration
│   ├── tests/                        # Automated pytest test suites (78 tests)
│   ├── requirements.txt              # Backend dependencies
│   └── pytest.ini                    # Pytest configuration
├── frontend/
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages and layouts
│   │   │   ├── dashboard/            # Orders, disputes, reports, verification
│   │   │   ├── login/                # Velo secure login portal
│   │   │   ├── register/             # Velo registration portal
│   │   │   ├── layout.tsx            # Global layout & metadata
│   │   │   └── page.tsx              # Landing page
│   │   ├── components/               # UI components, layout & landing sections
│   │   ├── hooks/                    # useAuth and custom React hooks
│   │   ├── lib/                      # Typed apiClient and configuration
│   │   ├── services/                 # Service layer mirroring backend APIs
│   │   └── types/                    # TypeScript interfaces & models
│   ├── package.json                  # Frontend dependencies and scripts
│   └── tailwind.config.ts            # Tailwind styling tokens
└── docs/                             # Engineering audit and API specifications
    ├── API_CONTRACT.md               # Original API contract specification
    ├── DATABASE_SCHEMA.md            # Relational database architecture
    ├── DISPUTE_REPORT_API.md         # Dispute & PDF report documentation
    ├── E2E_TEST_REPORT.md            # Comprehensive end-to-end integration audit
    ├── EVIDENCE_API.md               # Evidence session & upload specification
    ├── FRONTEND_INTEGRATION.md       # TypeScript frontend integration guide
    └── SECURITY_AUDIT_REPORT.md      # Comprehensive 15-point AppSec audit report
```

---

## 15. Quick Start and Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ (Node 20+ recommended)
- Git

### 15.1 Clone Repository
```bash
git clone https://github.com/Rishigit222/Velo.git
cd Velo
```

### 15.2 Backend Setup
```bash
# 1. Create and activate Python virtual environment
python -m venv backend/.venv

# Windows (PowerShell):
backend\.venv\Scripts\Activate.ps1
# Linux / macOS:
source backend/.venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Start FastAPI server (Port 8000)
backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Backend Health Probe: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 15.3 Frontend Setup
```bash
# Open a separate terminal in repository root
cd frontend

# 1. Install dependencies
npm install

# 2. Start Next.js development server (Port 3000)
npm run dev -- -p 3000
```
- Web Application: [http://localhost:3000](http://localhost:3000)

---

## 16. Configuration and Environment Variables

### Backend Configuration (`backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PROJECT_NAME` | `"ReturnProof API"` | Application display name. |
| `ENVIRONMENT` | `"development"` | Mode (`development`, `staging`, `production`). In `production`, insecure secrets fail fast. |
| `DEBUG` | `True` | Debug mode. Automatically disabled in production. |
| `HOST` | `"127.0.0.1"` | Server host binding. |
| `PORT` | `8000` | Server port binding. |
| `DATABASE_URL` | `"sqlite:///./returnproof.db"` | SQLAlchemy connection URI. Supports SQLite and PostgreSQL. |
| `SECRET_KEY` | `***` | JWT signing key. Must exceed 32 characters in production. |
| `ALGORITHM` | `"HS256"` | JWT signing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT expiration duration in minutes (24 hours). |
| `BACKEND_CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed CORS origins list. |
| `UPLOAD_DIR` | `"uploads"` | Local storage root for private evidence and reports. |
| `MAX_UPLOAD_SIZE_BYTES` | `52428800` | Maximum allowed file upload size (50 MB). |

### Frontend Configuration (`frontend/.env.local`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `"http://localhost:8000/api/v1"` | Base URL for FastAPI backend endpoints. |

---

## 17. Testing and Quality Assurance

Velo enforces strict quality gates through automated regression suites, live HTTP test scripts, and static analysis:

### 17.1 Backend Automated Test Suite (78 Tests)
Run the complete automated test suite:
```bash
backend\.venv\Scripts\python.exe -m pytest backend/tests -v
```

**Results:**
- `test_auth.py`: 10 passed (Registration, Argon2 hashing, JWT claims, duplicate checks)
- `test_database.py`: 2 passed (Relational mapping, foreign key cascades)
- `test_disputes.py`: 10 passed (Claim creation, conflict rules, state transitions, order listings)
- `test_evidence.py`: 15 passed (Dual sessions, magic bytes, chunk streaming, tamper detection, audit logs)
- `test_health.py`: 3 passed (Root, health, and v1 health endpoints)
- `test_orders.py`: 11 passed (Order lifecycle, ownership isolation, role permissions)
- `test_products.py`: 8 passed (Catalog creation, SKU collision, RBAC forbidden checks)
- `test_relational_schema.py`: 7 passed (Cross-table cascades, orphan prevention)
- `test_reports.py`: 6 passed (ReportLab PDF compilation, download streaming, order aliases)
- `test_security_audit.py`: 6 passed (Admin self-registration block, rate limiter, security headers, BOLA check)
- **Total: 78 passed, 0 failed (100% passing).**

### 17.2 Frontend Static Analysis & Production Build
```bash
# In frontend/ directory:
npm run lint    # 0 errors, 0 warnings
npm run build   # Compiled successfully; all 15 routes statically / partially prerendered
```

### 17.3 Live End-to-End Integration Test
A live integration probe executes live HTTP requests against running backend and frontend instances:
```bash
backend\.venv\Scripts\python.exe scratch/e2e_integration_test.py
```
- **Evaluated Operations:** 34
- **Passed:** 32
- **Partial (Roadmap):** 2 (AI verification endpoints gracefully returning 404 with zero mock data)
- **Failed:** 0

---

## 18. Evidence Integrity and Auditability

Velo guarantees data integrity using mathematical verification:

1. **Server-Side Digests:** Hashes are computed byte-by-byte on ingestion via `hashlib.sha256()`. A client cannot falsify or spoof an evidence digest.
2. **Deterministic Canonical Formatting:** Audit records concatenate raw values into a predictable canonical structure:
   `{prev_hash}|{event_type}|{user_id}|{order_id}|{description}|{timestamp_iso}`
3. **Tampering Detection:** If any historical record is modified directly in the database, subsequent records break chain continuity. Calling `GET /api/v1/evidence/audit/verify` re-calculates all links and identifies tampered records instantly.
4. **Audit Immutability:** Audit records possess no `UPDATE` or `DELETE` API routes.

---

## 19. Security Model

Velo adheres to defensive application security best practices:

- **Argon2id Password Storage:** Passwords hashed with RFC 9106 recommended parameters (64 MB RAM cost, 2 time iterations).
- **Privilege Escalation Prevention:** Self-registration is strictly restricted to `buyer` and `seller` accounts. Direct API calls specifying `role: "admin"` are rejected with `403 Forbidden`.
- **Brute-Force Rate Limiting:** Sensitive authentication routes (`/auth/login`, `/auth/register`, `/auth/token`) are protected by an in-memory sliding-window limiter enforcing a maximum of 30 attempts per minute per IP.
- **Memory-Safe Uploads:** Uploaded media streams are consumed in 64KB bounded chunks. Streams exceeding 50 MB are terminated immediately with `413 Content Too Large`, preventing RAM exhaustion attacks.
- **Broken Object Level Authorization (BOLA) Prevention:** All queries on orders, evidence files, disputes, and reports enforce ownership checks (`buyer_id == user.id` or `seller_id == user.id` or `role == "admin"`).
- **HTTP Security Headers:** Responses automatically include `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, and `Referrer-Policy: strict-origin-when-cross-origin`.

---

## 20. Deployment Guide

### Production Hardening Checklist
Before deploying Velo to staging or production:
1. **Set `ENVIRONMENT="production"`:** Automatically disables Swagger UI, enforces strict error sanitation, and enables HSTS headers.
2. **Configure Strong `SECRET_KEY`:** Must be a cryptographically random string exceeding 32 characters (e.g. `openssl rand -hex 32`). The application will refuse to start in production with default keys.
3. **Migrate to PostgreSQL / Azure SQL:** Update `DATABASE_URL` from SQLite to a production-grade relational database:
   `postgresql://user:password@host:5432/velo`
4. **Configure Persistent Object Storage:** For high-volume multi-instance deployments, mount shared network volumes or configure cloud blob storage for `/uploads`.
5. **Reverse Proxy Configuration:** Deploy behind Nginx, Caddy, or Cloudflare with TLS termination and gzip/brotli compression.

---

## 21. Scientific and Technical Limitations

- **Pre-Ingestion Physical Reality:** Velo cryptographically guarantees the integrity of uploaded media *from the moment it reaches the server*. It cannot detect physical tampering that occurs off-camera prior to recording.
- **Single-Host Concurrency:** The default SQLite configuration operates with file-level write locking. While process locks serialize hash calculations, multi-pod Kubernetes deployments require PostgreSQL to maintain transactional concurrency across instances.
- **Hardware Attestation:** In its current software-only release, Velo does not incorporate hardware security module (HSM) attestation or mobile device TPM signatures on captured camera streams.

---

## 22. Development Roadmap

- [x] **Phase 1: Architecture & Data Foundations** (Relational models, Argon2id, JWT auth, Pydantic schemas).
- [x] **Phase 2: Core Custody & Evidence Engine** (Dual sessions, SHA-256 calculation, magic byte inspection, chunk streaming).
- [x] **Phase 3: Cryptographic Audit Ledger** (Hash-chaining, thread locks, verification endpoint).
- [x] **Phase 4: Dispute Management & PDF Dossiers** (State machine, ReportLab two-pass pagination, direct stream aliases).
- [x] **Phase 5: Brand Unification & AppSec Hardening** (Velo design system, rate limiting, security headers, privilege escalation fix).
- [ ] **Phase 6: Computer Vision Comparison Engine** (Structural similarity comparison, perceptual hashing, automated packaging tear detection).
- [ ] **Phase 7: Cloud Blob Storage Drivers** (Amazon S3 and Azure Blob storage adapters).
- [ ] **Phase 8: Webhook Notification Bus** (Real-time webhook notifications for external ERP / e-commerce platforms like Shopify and WooCommerce).

---

## 23. Contributing

Contributions to Velo are welcome. Please adhere to the following workflow:

1. **Fork the Repository:** Create a feature branch (`git checkout -b feature/custody-enhancement`).
2. **Adhere to Code Standards:** Run `npm run lint` in `frontend/` and ensure all Python code strictly adheres to PEP 8 standards.
3. **Add Automated Tests:** Every new endpoint or service method must include automated pytest test cases in `backend/tests/`.
4. **Verify Test Suite:** Ensure all 78 existing tests pass cleanly before submitting a pull request (`pytest backend/tests -v`).
5. **Submit Pull Request:** Detail the problem solved, architectural considerations, and test coverage.

---

## 24. License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 25. Acknowledgments

- **FastAPI & Starlette** for the asynchronous Python API foundation.
- **ReportLab** for the precision document layout and PDF compilation engine.
- **SQLAlchemy** for the relational ORM and query builder.
- **Next.js & Tailwind CSS** for the high-performance modern user interface.
- **Argon2 / Password Hashing Competition** for password hashing security standards.

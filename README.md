# ReturnProof — Tamper-Evident E-Commerce Chain-of-Custody & Return Verification Platform

ReturnProof is a production-grade chain-of-custody verification and dispute resolution platform for high-value e-commerce transactions. It combines cryptographic SHA-256 integrity, tamper-evident hash-linked audit logging, automated multimodal AI inspection, dispute management workflows, and court-admissible PDF evidence reports.

---

## Architecture Overview

```
ReturnProof/
├── backend/                  # FastAPI backend service
│   ├── alembic/              # Database schema migrations
│   ├── app/
│   │   ├── core/             # Configuration and JWT security
│   │   ├── database/         # SQLAlchemy base and session engine
│   │   ├── models/           # Declarative database entities
│   │   ├── routes/           # REST API endpoints (v1)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── services/         # Business logic (Audit, Dispute, Report, Verification)
│   │   └── main.py           # FastAPI application entrypoint
│   ├── tests/                # 72 comprehensive automated pytest suites
│   ├── uploads/              # Private, authenticated evidence and report storage
│   └── requirements.txt      # Python dependencies
├── docs/                     # Architectural and API specifications
│   ├── DISPUTE_REPORT_API.md # Complete Dispute & PDF Report API specification
│   ├── EVIDENCE_API.md       # Evidence session & file upload specification
│   ├── FRONTEND_INTEGRATION.md# Frontend integration guide & TypeScript API client
│   └── VERIFICATION_ENGINE.md# Multimodal comparison & verification documentation
└── frontend/                 # Next.js 14+ client application
```

---

## Core Capabilities

1. **Authentication & Role-Based Access Control (RBAC)**
   - Argon2id password hashing and JWT access tokens.
   - Strict role separation: `buyer`, `seller`, and `admin`.

2. **Order & Inventory Tracking**
   - Products and orders with real-time status transitions.
   - Tenant isolation preventing cross-account access.

3. **Cryptographic Chain-of-Custody & Evidence Capture**
   - Session-based outbound delivery and inbound return evidence capture.
   - SHA-256 checksums computed at ingestion.
   - Private authenticated storage with streaming downloads.

4. **Tamper-Evident Audit Ledger**
   - Blockchain-inspired SHA-256 hash chaining: `hash(event_type + payload + timestamp + previous_hash)`.
   - Automated cryptographic verification and tampering detection.

5. **AI-Assisted Condition Verification**
   - Automated comparison between delivery and return evidence.
   - Structural similarity, cosmetic damage detection, and serial number matching.

6. **Dispute Lifecycle & Arbitration Engine**
   - Formal dispute intake with standardized reason taxonomy.
   - Conflict prevention: prevents duplicate active claims per order (`409 Conflict`).
   - Finite state transitions (`submitted` -> `under_review` -> `resolved` / `rejected`).
   - Transactional audit log recording on every state shift.

7. **Institutional-Grade PDF Evidence Reports**
   - Compiled via ReportLab using `NumberedCanvas` two-pass pagination.
   - Dynamic page totals ("Page X of Y"), running headers, and footers.
   - Complete dossier sections: Order Specifications, Outbound Delivery Evidence, Inbound Return Evidence, Automated AI Findings, Dispute Records, Tamper-Evident Ledger History, and Legal Disclaimers.
   - Private storage with cryptographic SHA-256 integrity digest.

---

## Quickstart

### Prerequisites
- Python 3.11+
- Virtual environment (`venv` or `uv`)

### 1. Install Backend Dependencies
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### 2. Database Migrations
```bash
alembic upgrade head
```

### 3. Run Development Server
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive OpenAPI documentation will be available at: `http://localhost:8000/docs`.

### 4. Run Test Suite
The platform includes 72 automated integration, regression, and unit tests:
```bash
pytest backend/tests -v
```

---

## API Summary

| Category | Endpoint | Method | Role | Description |
|---|---|---|---|---|
| **Auth** | `/api/v1/auth/register` | POST | Public | Register new buyer or seller account |
| **Auth** | `/api/v1/auth/login` | POST | Public | Authenticate and obtain JWT token |
| **Auth** | `/api/v1/auth/me` | GET | Authenticated | Retrieve current user profile |
| **Orders** | `/api/v1/orders` | POST / GET | Authenticated | Manage orders with tenant isolation |
| **Orders** | `/api/v1/orders/{id}/disputes` | GET | Order Parties | List all disputes for an order |
| **Evidence** | `/api/v1/evidence/sessions` | POST / GET | Order Parties | Start and list evidence intake sessions |
| **Evidence** | `/api/v1/evidence/sessions/{id}/files` | POST | Session Creator | Upload evidence photos/videos |
| **Audit** | `/api/v1/evidence/audit/verify` | GET | Authenticated | Verify SHA-256 audit ledger integrity |
| **Disputes** | `/api/v1/disputes` | POST | Buyer | File dispute claim against an order |
| **Disputes** | `/api/v1/disputes` | GET | Authenticated | List disputes (filtered by user role) |
| **Disputes** | `/api/v1/disputes/{id}` | GET | Order Parties | Get full dispute detail dossier |
| **Disputes** | `/api/v1/disputes/{id}/status` | PATCH | Seller / Admin | Transition dispute status |
| **Reports** | `/api/v1/reports/orders/{id}/generate` | POST | Order Parties | Compile ReportLab PDF evidence report |
| **Reports** | `/api/v1/reports/orders/{id}` | GET | Order Parties | Get latest report metadata |
| **Reports** | `/api/v1/reports/{id}/download` | GET | Order Parties | Download verified binary PDF |
| **Reports** | `/api/v1/reports/order/{id}/pdf` | GET | Order Parties | Direct stream alias for order PDF |

---

## License & Compliance
Proprietary institutional software developed for e-commerce chain-of-custody verification.


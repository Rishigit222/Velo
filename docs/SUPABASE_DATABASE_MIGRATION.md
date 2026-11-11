# VELO — SUPABASE POSTGRESQL & STORAGE MIGRATION GUIDE

**Database Engine:** PostgreSQL 15+ (Hosted on Supabase)  
**ORM Framework:** SQLAlchemy 2.0 (Mapped Declarative)  
**Storage Provider:** Supabase Storage (Private Encrypted Bucket: `evidence`)  
**Target Codebase:** Velo Chain-of-Custody & Return Verification Platform  
**SQL DDL File:** [`docs/supabase_schema.sql`](file:///c:/Users/rishi/OneDrive/Desktop/velo/docs/supabase_schema.sql)  

---

## 1. Executive Summary

This guide provides the complete, step-by-step procedure for provisioning, configuring, and migrating the Velo data tier from local SQLite to **Supabase PostgreSQL** and **Supabase Storage**.

### Key Architectural Advantages
1. **Concurrency & Horizontal Scaling:** Replaces SQLite's single-writer serialization with PostgreSQL Multi-Version Concurrency Control (MVCC) and connection pooling, supporting thousands of concurrent buyer and merchant transactions.
2. **Infinite Private Evidence Storage:** Offloads 50MB video files and photos to Supabase Storage, bypassing server disk limitations and enabling stateless container hosting on Render.
3. **Data Safety:** Zero local SQLite data is deleted or overwritten during this process. Local development and automated testing continue to run against SQLite seamlessly.

---

## 2. Supabase Project Setup & Credential Retrieval

### Step 1: Create Supabase Project
1. Navigate to [https://supabase.com/dashboard](https://supabase.com/dashboard) and log in.
2. Click **New Project**.
3. Set the following fields:
   - **Name:** `velo-production` (or `velo-db`)
   - **Database Password:** Generate and securely save a strong 24+ character password.
   - **Region:** Choose a region geographically close to your Render backend (e.g. `US West (Oregon)` if deploying Render in Oregon).
   - **Pricing Plan:** Free tier or Pro.
4. Click **Create new project** and wait $\approx 2\text{ minutes}$ for provisioning to finalize.

### Step 2: Retrieve PostgreSQL Connection String
1. In the Supabase Dashboard, go to **Project Settings (gear icon) $\rightarrow$ Database**.
2. Scroll to **Connection string**:
   - **Connection Pooling (Recommended for Render):** Select **Session** or **Transaction** mode.
     - Port: `6543`
     - Format:
       ```
       postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require
       ```
   - **Direct Connection:**
     - Port: `5432`
     - Format:
       ```
       postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].supabase.co:5432/postgres?sslmode=require
       ```
   *(Note: The Velo backend automatically detects `postgres://` or `postgresql://` and handles protocol normalization automatically).*

### Step 3: Retrieve Storage API Credentials
1. Go to **Project Settings $\rightarrow$ API**.
2. Copy the following credentials:
   - **Project URL:** `https://<project-ref>.supabase.co` $\rightarrow$ Map to `SUPABASE_URL`
   - **service_role (secret):** `eyJhbGciOi...` $\rightarrow$ Map to `SUPABASE_KEY`  
     *(Use the `service_role` key because the FastAPI backend manages private uploads and signed downloads on behalf of authenticated users).*

---

## 3. Database Schema Provisioning

You have two verified methods to create all 10 relational tables on Supabase:

### Method A: Supabase Web SQL Editor (Recommended - 1 Click)
1. In your Supabase Dashboard, open the **SQL Editor** tab from the left sidebar.
2. Click **+ New Query**.
3. Copy the entire contents of [`docs/supabase_schema.sql`](file:///c:/Users/rishi/OneDrive/Desktop/velo/docs/supabase_schema.sql) and paste it into the editor.
4. Click **Run** (or `Ctrl + Enter`).
5. Verify output:
   ```text
   Success. No rows returned.
   ```
6. Navigate to **Table Editor** to confirm all 10 tables are present:
   - `users`
   - `products`
   - `orders`
   - `evidence_sessions`
   - `evidence_files`
   - `condition_reports`
   - `verification_results`
   - `disputes`
   - `reports`
   - `audit_logs`

---

### Method B: Automated Python Initialization
Alternatively, point your local Python environment to the Supabase connection string to execute DDL automatically:

```powershell
$env:DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"

backend\.venv\Scripts\python.exe -c "
from backend.app.database.connection import init_db
init_db()
print('Supabase database initialized successfully!')
"
```

---

## 4. Private Supabase Storage Bucket Setup

Evidence photos and unboxing videos are protected by strict role-based access control and must reside in a **private** bucket.

### Step 1: Create the Bucket
1. In the Supabase Dashboard, click **Storage** in the left sidebar.
2. Click **+ New bucket**.
3. Configure:
   - **Name:** `evidence`
   - **Public bucket:** **OFF (Disabled / Private)**  
     *(Ensures raw URLs cannot be enumerated or scraped without authentication).*
   - **File size limit:** `50 MB` (matches Velo's `MAX_UPLOAD_SIZE_BYTES`).
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp, video/mp4, video/webm`.
4. Click **Save bucket**.

### Step 2: Storage Architecture in Code
The Velo backend integrates with Supabase Storage via [`backend/app/services/storage_service.py`](file:///c:/Users/rishi/OneDrive/Desktop/velo/backend/app/services/storage_service.py):
1. **Upload:** Files uploaded via `POST /api/v1/evidence/sessions/{id}/upload` are saved directly to `{SUPABASE_URL}/storage/v1/object/evidence/evidence/{uuid}_{timestamp}.ext`.
2. **Download:** Authorized users request `/api/v1/evidence/files/{id}/download`. The backend verifies RBAC and streams the binary payload with appropriate `Content-Disposition` headers.
3. **Computer Vision:** The verification service (`verification_service.py`) dynamically reads media bytes from Supabase Storage for pixel RMS divergence comparison.

---

## 5. Non-Destructive Data Migration from SQLite to Supabase (Optional)

If you wish to copy your existing local development records (`users`, `products`, `orders`, `audit_logs`) from `returnproof.db` into Supabase without deleting SQLite:

### Safe Migration Script (`scratch/migrate_sqlite_to_supabase.py`)
```python
import sqlite3
from sqlalchemy import create_engine
from backend.app.database.base import Base
import backend.app.models

# 1. Connect to local SQLite (Read-Only)
sqlite_conn = sqlite3.connect("returnproof.db")
sqlite_c = sqlite_conn.cursor()

# 2. Connect to Supabase PostgreSQL
supabase_url = "postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"
pg_engine = create_engine(supabase_url)

print("Starting non-destructive data copy to Supabase...")

# Tables in dependency order
tables = [
    "users", "products", "orders", "evidence_sessions",
    "evidence_files", "condition_reports", "verification_results",
    "disputes", "reports", "audit_logs"
]

with pg_engine.begin() as pg_conn:
    for t in tables:
        rows = sqlite_c.execute(f"SELECT * FROM {t}").fetchall()
        cols = [col[1] for col in sqlite_c.execute(f"PRAGMA table_info({t})").fetchall()]
        if not rows:
            continue
        
        col_names = ", ".join(cols)
        val_placeholders = ", ".join([f":{c}" for c in cols])
        insert_sql = f"INSERT INTO {t} ({col_names}) VALUES ({val_placeholders}) ON CONFLICT (id) DO NOTHING"
        
        for row in rows:
            data_dict = dict(zip(cols, row))
            pg_conn.execute(sa.text(insert_sql), data_dict)
        print(f"Copied {len(rows)} rows into {t}")

sqlite_conn.close()
print("Migration completed without modifying local SQLite!")
```

---

## 6. Verification and Health Testing

Once your Supabase database and storage bucket are active, test connectivity:

### Test 1: Verify PostgreSQL Connectivity
```powershell
$env:DATABASE_URL="postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require"

backend\.venv\Scripts\python.exe -c "
from backend.app.database.connection import check_db_connection
print('DB Connected:', check_db_connection())
"
```
*Expected Output:* `DB Connected: True`

### Test 2: Verify Supabase Storage Upload & Download
```powershell
$env:SUPABASE_URL="https://[project-ref].supabase.co"
$env:SUPABASE_KEY="eyJhbGciOi..."
$env:SUPABASE_STORAGE_BUCKET="evidence"

backend\.venv\Scripts\python.exe -c "
from backend.app.services.storage_service import storage_service
# Test upload
path = storage_service.save_file(b'test payload', '.txt', 'text/plain')
print('Stored path:', path)
# Test download
data = storage_service.get_file_bytes(path)
print('Retrieved payload:', data.decode('utf-8'))
"
```
*Expected Output:*
```text
Stored path: supabase://evidence/evidence/[uuid]_[timestamp].txt
Retrieved payload: test payload
```


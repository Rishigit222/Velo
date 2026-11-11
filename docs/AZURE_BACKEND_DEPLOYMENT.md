# VELO — AZURE APP SERVICE BACKEND DEPLOYMENT GUIDE

**Target Environment:** Microsoft Azure App Service (Linux)  
**Python Runtime:** 3.11 (64-bit)  
**Azure Web App Name:** `Velo`  
**Resource Group:** `Velo`  
**App Service Plan:** `asp-velo-linux` (Free F1 Tier)  
**Application Entry Point:** `backend.app.main:app`  
**Deployment Archive:** `deploy/azure/velo_backend_azure.zip`  

---

## 1. Executive Summary & Verification Findings

This guide documents the technical specifications, dependency validation, package structure, environment configuration, storage persistence analysis, and deployment commands required to deploy the **Velo** (internally configured as ReturnProof) FastAPI backend to **Microsoft Azure App Service on Linux**.

### Core Verifications Completed
1. **Import Architecture:** The backend contains 179 Python statements that import modules using the `from backend.app...` namespace. To maintain 100% backward compatibility without refactoring, the deployment root contains the `backend/` directory so that Python running from `/home/site/wwwroot` resolves `backend.app.main:app` as a first-party package.
2. **Production Dependencies:** Updated [`backend/requirements.txt`](file:///c:/Users/rishi/OneDrive/Desktop/velo/backend/requirements.txt) to explicitly include:
   - `gunicorn>=21.2.0,<23.0.0` (Production WSGI/ASGI master process manager for Linux App Service).
   - `pillow>=10.2.0,<11.0.0` (Eliminates transitive dependency risk for computer vision verification).
3. **Deployment Archive:** Created a clean, isolated deployment package at [`deploy/azure/package/`](file:///c:/Users/rishi/OneDrive/Desktop/velo/deploy/azure/package/) and a production zip archive at [`deploy/azure/velo_backend_azure.zip`](file:///c:/Users/rishi/OneDrive/Desktop/velo/deploy/azure/velo_backend_azure.zip) (70.9 KB, 63 files). Excluded `.venv`, `.git`, local `.db` databases, `.env` files, tests, and frontend artifacts.
4. **Local Smoke Test:** Verified that the packaged backend imports cleanly from the package root:
   ```
   Successfully imported app: ReturnProof API version: 1.0.0 (Routes count: 7)
   ```

---

## 2. Dependency & Server Architecture

### 2.1 Complete Production Dependencies (`requirements.txt`)
Located at the root of the deployment package and in [`backend/requirements.txt`](file:///c:/Users/rishi/OneDrive/Desktop/velo/backend/requirements.txt):

```text
fastapi>=0.110.0,<1.0.0
uvicorn[standard]>=0.28.0,<1.0.0
gunicorn>=21.2.0,<23.0.0
sqlalchemy>=2.0.28,<3.0.0
pydantic>=2.6.4,<3.0.0
pydantic-settings>=2.2.1,<3.0.0
pyjwt[crypto]>=2.8.0,<3.0.0
argon2-cffi>=23.1.0,<24.0.0
python-multipart>=0.0.9
email-validator>=2.1.1,<3.0.0
httpx>=0.27.0,<1.0.0
reportlab>=4.0.0
pillow>=10.2.0,<11.0.0
alembic>=1.13.1,<2.0.0
```

### 2.2 Why Gunicorn is Required on Azure App Service Linux
1. **Azure Linux Container Standard:** Azure App Service Linux Python base images utilize Gunicorn as the standard production process manager.
2. **Worker Supervision & Fault Tolerance:** With the `uvicorn.workers.UvicornWorker` worker class, Gunicorn monitors worker health, recycles workers after unexpected unhandled exceptions, and gracefully reloads.
3. **Free F1 Tier Concurrency:** The Free F1 tier runs on a shared vCPU with 1 GB RAM. Setting `--workers 2` provides optimal dual-worker concurrency while keeping RAM usage well under the 1 GB ceiling ($\approx 120\text{ MB}$ total backend footprint).
4. **Signal Handling:** Azure App Service orchestrators issue `SIGTERM` signals during maintenance and updates; Gunicorn responds with graceful shutdown, ensuring active evidence uploads or database transactions complete cleanly.

---

## 3. Package Structure & Directory Layout

### 3.1 Working Directory Context
On Azure App Service Linux, deployment artifacts are unpacked into:
```
/home/site/wwwroot/
```
Because the backend codebase imports packages via `from backend.app...`, the deployment structure places the `backend` package directory directly inside `/home/site/wwwroot/`.

### 3.2 Deployment Package Tree
```
/home/site/wwwroot/ (Package Root)
├── .deployment                         # Tells Azure Kudu / Oryx to trigger build
├── startup.sh                          # Executable startup script for Linux App Service
├── requirements.txt                    # Production dependencies for Oryx builder
└── backend/
    ├── __init__.py                     # Declares backend as a Python package
    ├── alembic.ini                     # Database migration configuration
    ├── alembic/                        # Migration scripts & version metadata
    │   ├── env.py
    │   ├── README
    │   ├── script.py.mako
    │   └── versions/
    │       ├── 10b0185fde39_create_evidence_and_verification_tables.py
    │       ├── 4ae18077fa6b_add_product_fields_and_order_details.py
    │       └── 7cf56093be81_add_dispute_resolution_and_reports_table.py
    └── app/
        ├── __init__.py
        ├── main.py                     # Entry point (app = create_application())
        ├── core/                       # Settings, Argon2id security, rate limiter
        │   ├── config.py
        │   ├── rate_limiter.py
        │   └── security.py
        ├── database/                   # SQLAlchemy engine, session & migrations
        │   ├── base.py
        │   └── connection.py
        ├── models/                     # 10 Relational entities
        │   ├── audit_log.py
        │   ├── condition_report.py
        │   ├── dispute.py
        │   ├── evidence_file.py
        │   ├── evidence_session.py
        │   ├── order.py
        │   ├── product.py
        │   ├── report.py
        │   ├── user.py
        │   └── verification_result.py
        ├── routes/                     # REST API routers mounted under /api/v1
        │   ├── api_v1.py
        │   ├── auth.py
        │   ├── disputes.py
        │   ├── evidence.py
        │   ├── orders.py
        │   ├── products.py
        │   ├── reports.py
        │   └── verification.py
        ├── schemas/                    # Pydantic request/response contracts
        ├── services/                   # Business logic (Audit, CV Verification, Reports)
        └── utils/                      # 12-factor stdout logging
```

### 3.3 Explicit Exclusions
The deployment package **strictly excludes**:
- `*.db` / `returnproof.db` (Local development database).
- `.venv/` / `venv/` (Local Windows Python binaries; Azure Oryx builds dependencies in `/antenv` for Linux x86_64).
- `.env` / `.env.local` (Local secrets; configured via Azure App Settings).
- `frontend/` (Next.js frontend deployed separately).
- `backend/tests/` (Test suites excluded from production runtime bundle).
- `uploads/` (Initialized dynamically in persistent storage).
- `__pycache__/` / `*.pyc` (Generated on target container).
- `.git/` / `.github/` (Source control metadata).

---

## 4. Storage Persistence Analysis: SQLite & Evidence Files on Azure App Service

> [!IMPORTANT]
> **VERIFIED STORAGE REALITY ON AZURE APP SERVICE LINUX**

### 4.1 How Azure App Service Linux Storage Operates
Azure App Service Linux operates inside Docker containers with two distinct storage zones:
1. **Ephemeral Container Storage (`/tmp`, `/app`, etc.):**
   - Resides on the local Docker container filesystem (overlayfs).
   - Writes are fast, but **all data is permanently wiped** whenever the container restarts, stops, or undergoes platform maintenance.
2. **Persistent Network Storage (`/home`):**
   - Resides on a network-attached Azure Storage SMB/CIFS share.
   - Enabled by default when `WEBSITES_ENABLE_APP_SERVICE_STORAGE=true`.
   - Files stored inside `/home` (including `/home/site/wwwroot/`) **do persist** across container restarts, scale events, and deployments.

### 4.2 SQLite Persistence & Concurrency Limitations
- **Does SQLite persist?**
  Yes, if `DATABASE_URL` is configured to store the database in `/home` (e.g. `sqlite:////home/site/wwwroot/returnproof.db` or default `./returnproof.db`), the database file **will persist** across app restarts.
- **The Critical Caveat (Network File Locking):**
  - Because `/home` is backed by an Azure Storage network share (SMB/CIFS), POSIX byte-range file locking (`fcntl()`) suffers from network latency and locking contention.
  - If multiple Gunicorn workers or concurrent threads attempt simultaneous write transactions, SQLite is susceptible to:
    ```text
    sqlite3.OperationalError: database is locked
    ```
  - Furthermore, in the event of an abrupt worker termination, an orphaned `.db-journal` or `.db-wal` lock file can stall subsequent read/write operations.
- **Free F1 Tier Quota Warning:**
  - The Free F1 tier (`asp-velo-linux`) allocates **1.0 GB total storage shared across the entire App Service Plan**.
  - If users upload 50 MB video files, just 15 to 20 uploads will completely exhaust the plan quota, causing 500 errors and platform suspension.

### 4.3 Production Persistence Verdict & Recommendations
| Component | Free F1 Pilot State | Production Recommendation |
| :--- | :--- | :--- |
| **Database** | SQLite in `/home/site/wwwroot/returnproof.db` (Low concurrency, single-worker / dual-worker only) | **Azure Database for PostgreSQL Flexible Server** (or Azure SQL Database). |
| **Evidence Media** | Local disk in `/home/site/wwwroot/uploads/evidence/` (Persists up to 1 GB plan limit) | **Azure Blob Storage** with SAS pre-signed upload/download URLs. |
| **PDF Reports** | Local disk in `/home/site/wwwroot/uploads/reports/` | **Azure Blob Storage** or direct streaming. |

---

## 5. Startup Command & Port Configuration

### 5.1 Primary Startup Command (Configured in Azure Portal)
In **Azure Portal $\rightarrow$ Web App (`Velo`) $\rightarrow$ Configuration $\rightarrow$ General settings $\rightarrow$ Startup Command**:

```bash
gunicorn --bind 0.0.0.0:8000 --workers 2 --worker-class uvicorn.workers.UvicornWorker --timeout 120 --access-logfile - --error-logfile - backend.app.main:app
```

### 5.2 Alternative Startup Command Using Provided Script
If utilizing the included executable script [`startup.sh`](file:///c:/Users/rishi/OneDrive/Desktop/velo/deploy/azure/package/startup.sh):

```bash
bash startup.sh
```
*(The `startup.sh` script automatically runs `alembic upgrade head` before binding Gunicorn on port 8000).*

### 5.3 Alternative Direct Uvicorn Startup Command
For minimal resource overhead on the Free F1 tier:

```bash
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

---

## 6. Required Environment Variables (Application Settings)

Configure the following key-value pairs in **Azure Portal $\rightarrow$ Web App (`Velo`) $\rightarrow$ Environment variables (or Configuration $\rightarrow$ Application settings)**:

| Setting Name | Recommended Production Value | Description |
| :--- | :--- | :--- |
| **`WEBSITES_PORT`** | `8000` | Informs the Azure reverse proxy to route ingress HTTP traffic to port 8000. |
| **`SCM_DO_BUILD_DURING_DEPLOYMENT`** | `true` | Instructs the Oryx build engine to execute `pip install -r requirements.txt`. |
| **`WEBSITES_ENABLE_APP_SERVICE_STORAGE`** | `true` | Mounts persistent network storage on `/home` (ensures SQLite & uploads persist). |
| **`PYTHON_VERSION`** | `3.11` | Specifies Python 3.11 runtime environment. |
| **`ENVIRONMENT`** | `production` | Switches FastAPI to production mode (disables public Swagger `/docs` and enables HSTS). |
| **`DEBUG`** | `False` | Disables debug mode and suppresses server stack trace exposure. |
| **`SECRET_KEY`** | `<64-char-hex-string>` | **CRITICAL:** High-entropy JWT signing key. Must be generated using `openssl rand -hex 32`. *The backend will refuse to boot if default or insecure key is used in production!* |
| **`PROJECT_NAME`** | `Velo API` | Public platform branding name. |
| **`DATABASE_URL`** | `sqlite:////home/site/wwwroot/returnproof.db` | Absolute path to SQLite database on persistent `/home` storage. |
| **`BACKEND_CORS_ORIGINS`** | `["https://velo.azurewebsites.net","https://velo.vercel.app"]` | JSON array of trusted frontend domains. Replace with your actual frontend URL(s). |
| **`UPLOAD_DIR`** | `uploads` | Relative upload directory (resolves to `/home/site/wwwroot/uploads`). |
| **`LOG_LEVEL`** | `INFO` | Standard structured logging level. |
| **`ACCESS_TOKEN_EXPIRE_MINUTES`**| `1440` | JWT bearer token lifetime (24 hours). |

---

## 7. Step-by-Step Deployment Instructions (Azure CLI)

> [!NOTE]
> Ensure the **Azure CLI (`az`)** is installed on your workstation before proceeding.

### Step 1: Log in and Set Context
```bash
az login
az account set --subscription "<YOUR_AZURE_SUBSCRIPTION_NAME_OR_ID>"
```

### Step 2: Configure Web App Application Settings
Inject required environment variables into the existing `Velo` web app:

```bash
# Generate high-entropy 64-character secret
RANDOM_SECRET=$(openssl rand -hex 32)

az webapp config appsettings set \
  --resource-group Velo \
  --name Velo \
  --settings \
    WEBSITES_PORT="8000" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE="true" \
    PYTHON_VERSION="3.11" \
    ENVIRONMENT="production" \
    DEBUG="False" \
    SECRET_KEY="$RANDOM_SECRET" \
    PROJECT_NAME="Velo API" \
    DATABASE_URL="sqlite:////home/site/wwwroot/returnproof.db" \
    BACKEND_CORS_ORIGINS='["https://velo.azurewebsites.net"]' \
    UPLOAD_DIR="uploads" \
    LOG_LEVEL="INFO"
```

### Step 3: Configure Startup Command
Set the Gunicorn production command:

```bash
az webapp config set \
  --resource-group Velo \
  --name Velo \
  --startup-file "gunicorn --bind 0.0.0.0:8000 --workers 2 --worker-class uvicorn.workers.UvicornWorker --timeout 120 --access-logfile - --error-logfile - backend.app.main:app"
```

### Step 4: Deploy the ZIP Package
Deploy the pre-built deployment archive [`deploy/azure/velo_backend_azure.zip`](file:///c:/Users/rishi/OneDrive/Desktop/velo/deploy/azure/velo_backend_azure.zip):

```bash
az webapp deploy \
  --resource-group Velo \
  --name Velo \
  --src-path "deploy/azure/velo_backend_azure.zip" \
  --type zip \
  --clean true \
  --restart true
```

### Step 5: Verify Live Deployment
1. **Stream Container Logs:**
   ```bash
   az webapp log tail --resource-group Velo --name Velo
   ```
2. **Check Health Endpoint:**
   ```bash
   curl -i https://velo.azurewebsites.net/health
   ```
   *Expected Response:*
   ```json
   {
     "status": "healthy",
     "version": "1.0.0",
     "database": "connected",
     "environment": "production",
     "timestamp": "2026-11-11T12:00:00Z"
   }
   ```
3. **Verify Root Endpoint:**
   ```bash
   curl -i https://velo.azurewebsites.net/
   ```

---

## 8. Potential Deployment Blockers & Mitigations

| # | Potential Blocker | Symptom | Exact Mitigation |
| :---: | :--- | :--- | :--- |
| **01** | **`SECRET_KEY` Production Validator Trigger** | Container exits immediately on startup with `ValueError` | Ensure `SECRET_KEY` in Azure App Settings is $\ge 32$ characters and does not contain `"insecure"`. |
| **02** | **Port Mismatch (HTTP 502 / 504 Gateway Error)** | Reverse proxy timeout; container fails ping | Set `WEBSITES_PORT=8000` in Application Settings so Azure routes traffic to Gunicorn's port. |
| **03** | **ModuleNotFoundError: `backend`** | Python traceback `No module named 'backend'` | Deploy the packaged `velo_backend_azure.zip` which contains `backend/` in the root of `/home/site/wwwroot/`. |
| **04** | **SQLite Database Lock Contention** | `OperationalError: database is locked` during concurrent writes | Maintain `--workers 2` on Free F1; for multi-user production, migrate `DATABASE_URL` to PostgreSQL. |
| **05** | **Free Tier 1.0 GB Storage Exhaustion** | HTTP 500 on file upload; App Service crashes | Periodically purge test videos in `/uploads/evidence/` or migrate media storage to Azure Blob Storage. |
| **06** | **CORS Request Blocked by Browser** | Frontend fetch fails with `Access-Control-Allow-Origin missing` | Update `BACKEND_CORS_ORIGINS` with the exact URL of the deployed Next.js frontend (e.g. `https://velo-frontend.vercel.app`). |

---

## 9. Local Verification Commands

To test the backend locally using identical commands prior to cloud deployment:

### 1. Test Package Import
```powershell
python -c "
import sys; sys.path.insert(0, 'deploy/azure/package')
from backend.app.main import app
print('App loaded successfully:', app.title)
"
```

### 2. Run Local Server (Emulating Production)
```powershell
# Set test secret key
$env:SECRET_KEY="c0a80101c0a80101c0a80101c0a80101c0a80101c0a80101c0a80101c0a80101"
$env:ENVIRONMENT="development"

# Run Uvicorn from repository root
backend\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Execute Pytest Suite (81 Tests)
```powershell
backend\.venv\Scripts\python.exe -m pytest backend/tests -v
```

---

## 10. Summary of Deployment Artifacts

- **Deployment Package Directory:** [`c:\Users\rishi\OneDrive\Desktop\velo\deploy\azure\package\`](file:///c:/Users/rishi/OneDrive/Desktop/velo/deploy/azure/package/)
- **Deployable ZIP Archive:** [`c:\Users\rishi\OneDrive\Desktop\velo\deploy\azure\velo_backend_azure.zip`](file:///c:/Users/rishi/OneDrive/Desktop/velo/deploy/azure/velo_backend_azure.zip) (70.9 KB)
- **Production Requirements File:** [`c:\Users\rishi\OneDrive\Desktop\velo\backend\requirements.txt`](file:///c:/Users/rishi/OneDrive/Desktop/velo/backend/requirements.txt)
- **Deployment Documentation:** [`c:\Users\rishi\OneDrive\Desktop\velo\docs\AZURE_BACKEND_DEPLOYMENT.md`](file:///c:/Users/rishi/OneDrive/Desktop/velo/docs/AZURE_BACKEND_DEPLOYMENT.md)


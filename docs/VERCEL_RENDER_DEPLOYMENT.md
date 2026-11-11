# VELO — VERCEL, RENDER & SUPABASE DEPLOYMENT GUIDE

**Frontend Target:** Vercel (Next.js 16.4.5, React 19, Turbopack)  
**Backend Target:** Render (FastAPI Web Service, Python 3.11, Uvicorn)  
**Database Target:** Supabase PostgreSQL (Managed Relational Engine)  
**Media Storage:** Supabase Storage (Private Encrypted Bucket: `evidence`)  
**Source Control:** GitHub ([https://github.com/Rishigit222/Velo](https://github.com/Rishigit222/Velo))  

---

## 1. Architectural Topology Overview

The Velo platform utilizes a modern, decoupled micro-monolith architecture optimized for high developer velocity, zero-maintenance database hosting, and infinite media scalability:

```
                            [ User / Browser ]
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
             HTTPS (HTML/JS)                  HTTPS (API / JWT)
                    │                               │
                    ▼                               ▼
       ┌────────────────────────┐      ┌────────────────────────┐
       │     Vercel Edge        │      │    Render Web Service  │
       │   Next.js 16 Frontend  │      │     FastAPI Backend    │
       │  (velo.vercel.app)     │      │ (velo-api.onrender.com)│
       └────────────────────────┘      └───────────┬────────────┘
                                                   │
                       ┌───────────────────────────┴───────────────────────────┐
                       │                                                       │
                       ▼                                                       ▼
          ┌──────────────────────────┐                            ┌──────────────────────────┐
          │   Supabase PostgreSQL    │                            │     Supabase Storage     │
          │     (Port 6543/5432)     │                            │ (Private Bucket: evidence│
          └──────────────────────────┘                            └──────────────────────────┘
```

---

## 2. Reusable Preparation Work from Azure Phase

The preparatory work completed during the earlier Azure inspection is **100% reusable and directly benefits this modern stack**:

1. **Dependency Hardening (`backend/requirements.txt`):**
   - Explicitly added `gunicorn>=21.2.0,<23.0.0` and `pillow>=10.2.0,<11.0.0`.
   - Added `psycopg2-binary>=2.9.9` for native PostgreSQL connectivity.
2. **Package Structure (`backend/__init__.py`):**
   - Declared `backend` as an explicit Python package.
   - Running Render from the repository root guarantees all 179 `from backend.app...` imports resolve naturally.
3. **Automated Test Suite (81 Tests Passing):**
   - Comprehensive test suite in `backend/tests/` verifies RBAC, disputes, chunked uploads, and image comparison.
4. **Production Configuration Security Guards:**
   - Automated Pydantic validator in `backend/app/core/config.py` enforces high-entropy `SECRET_KEY` in production.
   - HSTS and security headers automatically active in `ENVIRONMENT="production"`.

---

## 3. Step 1: Supabase Database & Storage Provisioning

Follow the detailed instructions in [`docs/SUPABASE_DATABASE_MIGRATION.md`](file:///c:/Users/rishi/OneDrive/Desktop/velo/docs/SUPABASE_DATABASE_MIGRATION.md):

1. **Create Supabase Project:** Name it `velo-db`.
2. **Execute Schema SQL:** Copy and run [`docs/supabase_schema.sql`](file:///c:/Users/rishi/OneDrive/Desktop/velo/docs/supabase_schema.sql) in the Supabase **SQL Editor**. Confirm all 10 tables appear in Table Editor.
3. **Create Private Storage Bucket:** Go to **Storage $\rightarrow$ New bucket**:
   - Bucket name: `evidence`
   - Public bucket: **Disabled (Private)**
   - Size limit: `50 MB`
4. **Save Credentials:**
   - `DATABASE_URL`: `postgresql://postgres.[ref]:[pass]@aws-0-[region].pooler.supabase.com:6543/postgres?sslmode=require`
   - `SUPABASE_URL`: `https://[ref].supabase.co`
   - `SUPABASE_KEY`: Project Settings $\rightarrow$ API $\rightarrow$ `service_role` secret key.

---

## 4. Step 2: Render Backend Deployment (FastAPI)

Render hosts the FastAPI backend as an auto-deploying Web Service linked directly to GitHub.

### Option A: Deploy via Render Blueprint (Recommended)
The repository includes a ready-to-use [`render.yaml`](file:///c:/Users/rishi/OneDrive/Desktop/velo/render.yaml) at the repository root:
1. Log in to [https://dashboard.render.com](https://dashboard.render.com).
2. Click **New + $\rightarrow$ Blueprint**.
3. Connect your GitHub repository: `Rishigit222/Velo`.
4. Render detects `render.yaml` and prepares the `velo-api` service.
5. In the configuration prompt, provide your Supabase credentials:
   - `DATABASE_URL`: Your Supabase connection string.
   - `SUPABASE_URL`: Your Supabase project URL.
   - `SUPABASE_KEY`: Your Supabase `service_role` secret key.
6. Click **Apply**.

---

### Option B: Deploy via Render Dashboard (Manual)
1. Go to [https://dashboard.render.com](https://dashboard.render.com).
2. Click **New + $\rightarrow$ Web Service**.
3. Select **Build and deploy from a Git repository** and pick `Rishigit222/Velo`.
4. Fill in the service configuration:
   - **Name:** `velo-api`
   - **Region:** `Oregon (US West)` (matches Supabase region)
   - **Branch:** `main`
   - **Root Directory:** Leave **EMPTY (Blank)**  
     *(Running from repo root ensures Python resolves all 179 `from backend.app...` imports).*
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT --workers 2
     ```
   - **Plan:** Free or Starter ($7/mo recommended for production to avoid free-tier spin-down).
5. Click **Advanced** and set **Health Check Path** to:
   ```
   /health
   ```
6. Under **Environment Variables**, add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `PYTHON_VERSION` | `3.11.10` | Uses Python 3.11 runtime. |
| `ENVIRONMENT` | `production` | Switches FastAPI to production mode (disables `/docs`, enables HSTS). |
| `DEBUG` | `False` | Disables verbose debug logging. |
| `PROJECT_NAME` | `Velo API` | Public platform branding name. |
| `SECRET_KEY` | `<generate via openssl rand -hex 32>` | **CRITICAL:** High-entropy JWT signing key. |
| `DATABASE_URL` | `postgresql://postgres.[ref]:[pass]@...` | Supabase connection string. |
| `BACKEND_CORS_ORIGINS` | `["https://velo.vercel.app","https://*.vercel.app"]` | Allows cross-origin requests from Vercel. |
| `SUPABASE_URL` | `https://[ref].supabase.co` | Supabase API URL. |
| `SUPABASE_KEY` | `eyJhbGciOi...` | Supabase `service_role` secret key. |
| `SUPABASE_STORAGE_BUCKET` | `evidence` | Private evidence bucket name. |
| `UPLOAD_DIR` | `uploads` | Local directory fallback. |
| `LOG_LEVEL` | `INFO` | Standard structured logging. |

7. Click **Create Web Service**.
8. Wait for the build to finish. Once live, note your assigned Render URL:
   ```
   https://velo-api.onrender.com
   ```
9. Verify by querying:
   ```bash
   curl -i https://velo-api.onrender.com/health
   ```
   *Expected Response:*
   ```json
   {"status":"healthy","version":"1.0.0","database":"connected","environment":"production"}
   ```

---

## 5. Step 3: Vercel Frontend Deployment (Next.js)

Vercel provides native zero-configuration deployments for Next.js 16 with Turbopack.

### Step 1: Import Project into Vercel
1. Log in to [https://vercel.com/dashboard](https://vercel.com/dashboard).
2. Click **Add New... $\rightarrow$ Project**.
3. Select your GitHub repository: `Rishigit222/Velo`.
4. In the **Configure Project** screen:
   - **Project Name:** `velo` (or `velo-frontend`)
   - **Framework Preset:** `Next.js` (Automatically detected)
   - **Root Directory:** Click **Edit** and select:
     ```
     frontend
     ```
     *(This is essential because the Next.js app resides inside `frontend/`).*
   - **Build Command:** `next build` (Default)
   - **Output Directory:** `.next` (Default)
   - **Install Command:** `npm install` (Default)

### Step 2: Configure Environment Variables
Under **Environment Variables**, add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://velo-api.onrender.com/api/v1` | **CRITICAL:** Public URL of your deployed Render backend with `/api/v1` path. |

> [!IMPORTANT]
> Because Next.js bakes `NEXT_PUBLIC_*` variables into client-side JavaScript bundles during compilation, `NEXT_PUBLIC_API_URL` must be set **before** initiating the deployment build on Vercel.

### Step 3: Deploy
1. Click **Deploy**.
2. Vercel will clone `frontend/`, run Turbopack compilation, execute TypeScript checks, and prerender all 15 routes in $\approx 45\text{ seconds}$.
3. Once finished, Vercel provides your live URL:
   ```
   https://velo.vercel.app
   ```

### Step 4: Synchronize CORS on Render
Once you know your exact Vercel production domain (e.g. `https://velo.vercel.app`), return to the **Render Dashboard $\rightarrow$ velo-api $\rightarrow$ Environment**:
Ensure `BACKEND_CORS_ORIGINS` includes your live Vercel domain:
```json
["https://velo.vercel.app", "https://*.vercel.app"]
```
*(Saving this triggers an instant zero-downtime rolling restart on Render).*

---

## 6. Verification & End-to-End Testing Checklist

Once both services are live, verify the complete chain-of-custody journey:

- [ ] **Public Landing Page:** Open `https://velo.vercel.app` — verify responsive layout, Hero banner, and zero broken assets.
- [ ] **User Registration:** Register a new Buyer account (`buyer@test.com`) and Merchant account (`seller@test.com`). Confirm records appear in Supabase `users` table.
- [ ] **JWT Authentication:** Log in — verify `velo_access_token` is stored in browser `localStorage` and redirects to `/dashboard`.
- [ ] **Catalog & Orders:** Merchant creates a product; buyer purchases it. Verify order state updates in Supabase `orders` table.
- [ ] **WebRTC Evidence Capture:** Open the order in the buyer dashboard. Initiate a `delivery` session, snap a live camera photo, and record a video.
- [ ] **Supabase Storage Upload:** Complete the upload. Inspect Supabase **Storage $\rightarrow$ evidence** bucket — confirm the file appears with its UUID filename and SHA-256 hash.
- [ ] **Visual Verification Engine:** Trigger `/dashboard/verification`. Verify that pixel-level RMS divergence runs and records results in `verification_results`.
- [ ] **Dispute Arbitration:** File a dispute claim. Verify status moves to `submitted` in `disputes` table.
- [ ] **Certified ReportLab PDF Dossier:** Click **Download PDF Report**. Verify the browser streams the compiled PDF report with running headers, footers ("Page X of Y"), and chronological SHA-256 audit ledger entries.

---

## 7. Known Production Considerations & Workarounds

| Concern | Impact | Recommended Solution |
| :--- | :--- | :--- |
| **Render Free Tier Cold Starts** | Render spins down free Web Services after 15 minutes of inactivity; next request takes 30-50s to spin up. | • Upgrade to Render **Starter ($7/mo)** for zero cold starts.<br>• Alternatively, set up a free scheduled ping (e.g. UptimeRobot) calling `GET /health` every 10 minutes. |
| **Supabase Connection Limits** | Serverless connections can exhaust database connection pools. | Always use the **Supabase Session/Transaction Pooler** on port `6543` in `DATABASE_URL` instead of direct port `5432`. |
| **Vercel Preview Deployments** | Pull Request previews generate random URLs (e.g. `velo-git-branch.vercel.app`). | The backend CORS validator supports wildcard subdomain matching when using `https://*.vercel.app`. |
| **50 MB Video Upload Buffering** | Free proxy limits. | Render handles 50 MB streaming natively; Velo streams uploads in 64KB bounded chunks to prevent memory spikes. |


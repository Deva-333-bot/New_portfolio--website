# Production Deployment & Infrastructure Guide

This guide details the procedure for provisioning, configuring, and deploying the portfolio platform to **Vercel** (Frontend) and **Render** (Backend API + Managed PostgreSQL).

---

## 1. Prerequisites

- A GitHub repository containing the codebase.
- A **Render** account (for FastAPI and Managed PostgreSQL).
- A **Vercel** account (for Next.js App Router edge hosting).
- (Optional) Domain names configured with DNS provider (e.g., Cloudflare).

---

## 2. Managed Database Setup (Render PostgreSQL)

1. Sign in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **PostgreSQL**.
3. Name the database `portfolio-postgres`.
4. Choose the region closest to your target audience (e.g., `Frankfurt` for EMEA / Africa latency optimization).
5. Set database name `portfolio_db` and user `portfolio_user`.
6. Once provisioned, copy the **Internal Database URL** (for Render web services) and **External Database URL** (for remote maintenance or migrations).

---

## 3. Backend Deployment (Render Web Service)

1. In the Render Dashboard, click **New +** and choose **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `portfolio-backend-api`
   - **Region**: Same region as your database (`Frankfurt`).
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`

4. Add the required Environment Variables:
   | Variable | Value / Description |
   | :--- | :--- |
   | `APP_ENV` | `production` |
   | `DEBUG` | `False` |
   | `DATABASE_URL` | Use Render's database linking or paste the connection string: `postgresql+psycopg2://user:pass@host:5432/portfolio_db` |
   | `CANONICAL_SITE_URL` | Your frontend production URL (e.g., `https://florante.tech`) |
   | `API_BASE_URL` | Your backend production URL (e.g., `https://api.florante.tech`) |
   | `SESSION_SECRET` | Generate with `openssl rand -hex 32` |
   | `PASSWORD_RESET_SECRET`| Generate with `openssl rand -hex 32` |
   | `FRONTEND_ORIGINS` | `https://florante.tech,https://www.florante.tech` |
   | `ADMIN_BOOTSTRAP_EMAIL`| `admin@florante.tech` |
   | `ADMIN_BOOTSTRAP_PASSWORD`| Choose a secure initial 16+ character password |
   | `EMAIL_PROVIDER` | `console`, `smtp`, `sendgrid`, or `resend` |
   | `EMAIL_FROM_ADDRESS` | `hello@florante.tech` |

5. Deploy the service. Verify that `GET https://<render-url>/health` returns `{"status": "healthy"}` and `GET https://<render-url>/ready` returns `{"status": "ready", "database": "connected"}`.

---

## 4. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project** and import your repository.
3. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: Edit to `frontend`
4. Configure Environment Variables:
   | Variable | Value |
   | :--- | :--- |
   | `NEXT_PUBLIC_SITE_URL` | `https://florante.tech` |
   | `NEXT_PUBLIC_API_BASE_URL` | `https://<your-render-backend-url>/api/v1` |

5. Click **Deploy**.
6. Once deployed, verify that the public website displays the developer hero, skills, and projects, and that `/admin/login` loads properly.

---

## 5. First-Time Administrator Bootstrap

On the first deployment, database tables are automatically initialized and pre-seeded with verified initial data seeds (Oduor Daivine Oluoch profile, Florante Tech Limited, Kirinyaga University, verified draft projects, and CV document).

To sign in to the Administrative CMS:
1. Navigate to `https://<your-frontend-domain>/admin/login`.
2. Enter the bootstrap email configured in `ADMIN_BOOTSTRAP_EMAIL` (default: `admin@florante.tech`).
3. Enter the bootstrap password set in `ADMIN_BOOTSTRAP_PASSWORD`.
4. Once inside the dashboard, immediately navigate to **Settings** -> **Change Password** to set your permanent private password.

---

## 6. Database Migrations & Rollback Plan

### Applying Migrations via Alembic
To apply schema versioning manually or via CD release phase:
```bash
cd backend
alembic upgrade head
```

### Rollback Procedure
If a migration or backend release causes regressions:
1. Roll back the previous commit in Render deployment history (instant rollback).
2. If schema changes need reversal, run:
```bash
alembic downgrade -1
```
3. Vercel allows instant 1-click rollback to any previously successful deployment via the **Deployments** tab.

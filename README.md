# Personal Portfolio Website & Admin CMS

A full-stack portfolio application for Oduor Daivine Oluoch, software engineering student, AI/ML enthusiast, and founder of Florante Tech Limited. The project combines a Next.js frontend with a FastAPI API, SQLAlchemy models, and a relational database.

## Technology stack

- **Frontend:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI, Pydantic, SQLAlchemy
- **Database:** PostgreSQL in deployment; SQLite can be used locally
- **Security:** Argon2id password hashing, server-side sessions, HttpOnly cookies, origin checks for state-changing authenticated requests
- **Operations:** Docker Compose, Render blueprint, GitHub Actions CI

## Features

### Public website
- Hero, biography, skills, project cards and project details
- Education, internship, and project timeline
- Blog pages (starter articles remain drafts until reviewed and published)
- Contact form that stores inquiries and creates a lead record
- Privacy notice and opt-in first-party analytics (visitors can accept or decline)
- CV download endpoint that only serves a published CV record

### Administrator CMS
- Profile and social-link management
- Project and skill management
- Blog publishing workflow
- Testimonial approval and visibility controls
- CV and media upload management
- Contact inbox, lead pipeline, CSV export, analytics, settings, GitHub integration, and audit logs

## Important content and deployment notes

- No testimonial or CV is automatically seeded. Upload a genuine CV before publishing it, and publish testimonials only after confirming permission.
- Seeded blog articles are drafts. Review their content and attribution before publishing.
- Project descriptions avoid invented performance metrics and unverified live/repository links. Update project details in the CMS only when they have been checked.
- Numeric skill proficiency scores are not shown publicly. Use descriptive levels or scores only when you have a meaningful basis for them.
- The starter data only seeds tables that are empty. Existing databases are not automatically rewritten when seed code changes. See [the legacy-content cleanup guide](docs/DEPLOYMENT.md#8-review-legacy-seeded-content).
- There is no hard-coded default administrator password. Configure a unique password through environment secrets or use the interactive bootstrap command.
- Production email notifications and password resets require working SMTP configuration. If SMTP is missing, the backend will not print message bodies or reset links into production logs.
- Uploaded files need persistent storage or object storage in deployment. Local container filesystems may be ephemeral.
- The source review environment could not complete `npm ci` because the package registry was unreachable; rerun the frontend production build after dependencies are installed.

## Repository structure

```text
backend/
  app/
    api/v1/endpoints/    FastAPI public and admin endpoints
    cli/                 Seed, administrator bootstrap, and legacy cleanup commands
    core/                Settings, database, security, and middleware
    models/              SQLAlchemy models
    schemas/             Pydantic request/response schemas
    services/             Authentication, email, analytics, audit, and GitHub services
  tests/                 Pytest suite
  migrations/            Alembic configuration
  Dockerfile

frontend/
  app/                   Public pages and admin CMS pages
  components/             Reusable UI components
  lib/                    API client and analytics helper
  Dockerfile

docs/                     Deployment, security, API, and admin guides
.github/workflows/ci.yml  Backend tests and frontend build
docker-compose.yml        Local PostgreSQL + API + frontend
```

## Local backend setup

Use Python 3.11 or later.

```bash
cd backend
python -m venv .venv

# Windows Git Bash:
source .venv/Scripts/activate

# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env` and set a unique local `ADMIN_BOOTSTRAP_PASSWORD` (at least 14 characters), `SESSION_SECRET`, and `PASSWORD_RESET_SECRET`. For local development, the values in `.env.example` are placeholders and should be replaced.

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

- API: `http://localhost:8000`
- Health: `http://localhost:8000/health`
- Readiness: `http://localhost:8000/ready`
- API docs are enabled when `DEBUG=True`: `http://localhost:8000/docs`

If no administrator has been created, bootstrap one interactively from `backend`:

```bash
python -m app.cli.bootstrap_admin
```

The password is prompted securely and is not echoed.

## Local frontend setup

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. The default API base is `http://localhost:8000/api/v1`; set `NEXT_PUBLIC_API_BASE_URL` when using a different API origin.

Useful commands:

```bash
npm run typecheck
npm run build
npm start
```

The `lint` script currently aliases the TypeScript check; ESLint rules are not configured in this repository yet.

## Docker Compose

From the repository root:

```bash
cp .env.example .env
```

Edit `.env` to replace the local database and secret values, then run:

```bash
docker compose up --build
```

The example intentionally does not create an administrator. After the services start, run:

```bash
docker compose exec backend python -m app.cli.bootstrap_admin
```

Local URLs:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000`

## Tests and verification

Run the backend suite from the repository root:

```bash
python -m pytest backend/tests -q
```

The source review run completed **31 backend tests successfully**. Python compilation and lightweight JavaScript/configuration syntax checks also passed. The frontend production build was not re-run because `npm ci` could not download a package from the npm registry in the review environment; rerun it locally or in CI before deployment.

## Deployment

See [Deployment Guide](docs/DEPLOYMENT.md) for Render/Vercel configuration, required environment variables, persistent storage considerations, and the safe legacy-content cleanup procedure.

Do not commit `.env` files, database files, uploads, or production secrets.
# New_portfolio--website

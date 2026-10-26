# Production-Grade Personal Portfolio Platform & Admin CMS

[![CI Pipeline](https://github.com/florantetech/portfolio-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/florantetech/portfolio-platform/actions/workflows/ci.yml)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.119.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg?style=flat&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

A complete, production-grade personal technology portfolio and administrative content management system engineered for **Oduor Daivine Oluoch** (Founder, Software Engineer & Technology Innovator at **Florante Tech Limited**).

Inspired directly by modern developer portfolio visual designs: deep interstellar `#050816` dark aesthetic, vibrant `#7857FF` violet gradients, interactive floating code snippet card, real visitor business intelligence, lead pipeline triage, and persistent PostgreSQL storage.

---

## Key Architecture & Capabilities

### 1. Public Portfolio Experience
- **Hero Section**: Two-column layout matching reference design with developer greeting, verified technology badges, circular radial violet glow, floating interactive code snippet card, primary *"View My Work"* CTA, and secondary *"Download CV"* button.
- **About Me**: Professional biography, founder vision, Kirinyaga University BSc Software Engineering credentials (expected 2028), and 4 honest highlight metric cards (Years Experience, Projects Completed, Clients, Satisfaction).
- **Skills Grid**: 3-column layout featuring categorized skills with custom violet progress bars and proficiency percentages.
- **Featured Projects**: 3-card showcase with card index numbers (`01`, `02`, `03`), cover images, status badges, tech pills, and an interactive **Deep-Dive Case Study Drawer** (Problem, Solution, Architecture, Outcomes, Live Demo, and GitHub links).
- **Trajectory Timeline**: Academic milestones, founder initiatives at Florante Tech Limited, and software engineering experience.
- **Technical Writing / Blog**: Engineering articles with reading times, tag pills, and dedicated reading pages.
- **Testimonials**: Authentic reviews rendered only upon administrative approval.
- **Contact & Hiring Conversion**: Inquiry form with honeypot bot protection, budget/timeline parameters, submission confirmation, email alerts, and automatic lead creation.
- **Footer**: 3-column footer with quick consultation CTA, testimonial quote card, social links, and copyright bar.
- **Dark & Light Mode**: Defaulting to the reference visual dark developer theme with seamless toggle and persisted preference.

### 2. Full Admin CMS & Business Intelligence (`/admin`)
- **Single-Administrator Security**: Protected with **Argon2id** password hashing and **opaque server-validated sessions** (storing only SHA-256 hashes in `admin_sessions`).
- **Real-Time BI Dashboard**: Interactive Recharts analytics tracking Page Views over time, Unique Visitors, CV Downloads, Contact Inquiries, Conversion Funnel, Top Visited Pages, and Top Projects.
- **Profile Manager**: Live updating of headlines, bios, education, stats, and social links without code edits.
- **Project Manager**: Complete CRUD for projects, slug generation, rich case study fields, and draft/published/archived lifecycle controls.
- **CV Manager**: Upload replacement PDF resumes, set public filenames, preview live, and toggle public availability.
- **Contact Inbox & Lead Pipeline**: Triage inquiries, advance leads through deal stages (`Lead` → `Qualified` → `Proposal` → `Won`), record estimated values, and **Export CSV**.
- **GitHub Integration**: Server-side synchronization with the GitHub API, repo caching, and manual refresh controls.
- **Audit Log**: Immutable audit trail of administrative activities and logins.

---

## Repository Structure

```
Portfolio/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST API endpoints (auth, public, admin modules)
│   │   ├── cli/             # CLI tools (bootstrap_admin, seed_data)
│   │   ├── core/            # Config, database engine, Argon2id security, middleware
│   │   ├── models/          # 14+ SQLAlchemy 2.0 relational models
│   │   ├── schemas/         # Strict Pydantic v2 validation contracts
│   │   ├── services/        # Business logic (analytics, email, github, audit)
│   │   └── main.py          # FastAPI application initialization
│   ├── migrations/          # Alembic versioned migrations
│   ├── tests/               # 22 automated Pytest security & CRUD tests
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js 14 App Router (public pages + /admin CMS)
│   ├── components/          # Reusable UI components (Hero, Navbar, Projects, Skills, etc.)
│   ├── lib/                 # Typed API client and analytics helpers
│   ├── Dockerfile
│   └── package.json
├── docs/
│   ├── DEPLOYMENT.md        # Vercel & Render step-by-step setup
│   ├── ADMIN_GUIDE.md       # Complete CMS user manual
│   ├── SECURITY.md          # Threat model & KDPA 2019 compliance
│   └── API_DOCUMENTATION.md # OpenAPI contract
├── .github/workflows/ci.yml # Automated CI pipeline
├── docker-compose.yml       # Local multi-container full-stack execution
└── README.md
```

---

## Quickstart & Local Setup

### 1. Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- (Optional) Docker & Docker Compose

### 2. Local Backend Run
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI with auto-reload (defaults cleanly to SQLite for zero-config local run)
uvicorn app.main:app --reload --port 8000
```
- Swagger API Docs: `http://localhost:8000/docs`
- Health Probe: `http://localhost:8000/health`

### 3. Local Frontend Run
```bash
cd frontend
npm install
npm run dev
```
- Public Portfolio: `http://localhost:3000`
- Admin CMS: `http://localhost:3000/admin/login`

### 4. Running Full Stack via Docker Compose
To run PostgreSQL, FastAPI, and Next.js together:
```bash
docker-compose up --build
```

---

## Automated Test Verification

Execute the backend test suite covering authentication, session revocation, public content isolation, CSRF/security headers, CRUD operations, and analytics:
```bash
python -m pytest backend/tests -v
```
*(All 22 automated test suites pass with 100% success rate).*

Execute frontend static page generation and typechecking:
```bash
cd frontend
npm run build
```
*(All 22 Next.js static pages, dynamic slugs, sitemap, and robots.txt compile successfully).*

---

## Default Initial Administrator Credentials

*Seeded upon first database initialization:*
- **Email**: `admin@florante.tech`
- **Password**: `AdminPass2026!`
*(Note: Change your password immediately in `/admin/settings` after initial login).*

---

## License & Credits

Architected and developed by **Oduor Daivine Oluoch** / Florante Tech Limited. Licensed under the MIT License.

# Administrator & Content Management System (CMS) Manual

This guide documents the administrative capabilities of the personal portfolio and business intelligence platform accessible at `/admin`.

---

## 1. Access & Security

- **Portal URL**: `/admin/login`
- **Authentication**: Single-administrator account protected with **Argon2id** password hashing.
- **Session Architecture**: Upon successful sign-in, an opaque, cryptographically secure 48-byte token is issued and set as a secure, `HttpOnly`, `SameSite=Lax` cookie (`portfolio_session`). The database stores only a SHA-256 hash of the token.
- **Rate Limiting**: Brute-force login attempts are rate-limited to 10-20 requests per minute per IP address.
- **Audit Logging**: Every login attempt, content change, lead status update, and CV replacement is permanently recorded in the immutable `audit_logs` table.

---

## 2. Business Intelligence Overview (`/admin/overview`)

The Overview dashboard provides genuine analytics derived from recorded telemetry:
- **Total Page Views**: Real count of public page views.
- **Unique Visitors**: Unique pseudonymous session references calculated within the chosen time window.
- **CV Downloads**: Total count of recruiter clicks on the public CV download action.
- **Contact Inquiries**: Total inquiries received via the contact form.
- **Qualified Leads**: Count of inquiries or leads that have advanced to "Qualified", "In Discussion", "Proposal", or "Won".
- **Conversion Rate %**: Calculated dynamically as `(Contact Inquiries / Unique Visitors) * 100`.
- **Pipeline Total Value**: Sum of estimated dollar opportunities in your active lead pipeline.
- **Traffic Acquisition & Top Pages**: Breakdown of referring domains and top-visited projects.
- **Time Window Filtering**: Toggle metrics across 7 days, 30 days, or 90 days.

---

## 3. Profile & Personal Brand Manager (`/admin/profile`)

Allows you to update all personal branding parameters without editing code:
- **Identity Fields**: Display Name, Legal Full Name, and Professional Headline.
- **Biographies**:
  - *Short Bio*: Displayed in the hero introduction.
  - *Full Bio*: Displayed in the About Me section.
- **Credentials & Institution**: Company association (Florante Tech Limited), university education (Kirinyaga University), expected graduation year, location, and availability status.
- **Metric Cards**: Configure the 4 About section highlight cards (Years Experience, Projects Completed, Clients, Satisfaction).
- **Social Channels**: Add, edit, reorder, or delete links to GitHub, LinkedIn, Twitter/X, Email, or custom websites.

---

## 4. Projects Portfolio Manager (`/admin/projects`)

Manage genuine case studies and showcase technical depth:
- **Project Lifecycle States**:
  - `Concept`: Experimental or proposed system.
  - `In progress`: Active software in development.
  - `Prototype`: Functional MVP or research model.
  - `Completed`: Verified finished engineering project.
  - `Deployed`: Active in production.
  - `Archived`: Deprecated or historical.
- **Publication Visibility**:
  - `Draft`: Kept internal; never exposed to public API or visitors.
  - `Published`: Immediately rendered on public website and included in project catalogs.
  - `Archived`: Unlisted from public view.
- **Technical Case Study Fields**:
  - Title and auto-generated unique slug.
  - Problem Statement and intended requirements.
  - Solution Architecture.
  - Engineering challenges and lessons learned.
  - Verified outcomes and metrics.
  - Technology stack (comma-separated list rendered as pills).
  - Live Demo and GitHub Repository URLs.

---

## 5. Skills & Technology Manager (`/admin/skills`)

- Add new languages, frameworks, databases, and DevOps tools.
- Group by categories: *Languages*, *Frontend*, *Backend*, *Databases*, *AI / ML*, *DevOps*, *Security*, *Tools*.
- Set visual proficiency percentages (0-100%) and descriptive labels (*Beginner*, *Developing*, *Proficient*, *Advanced*).

---

## 6. Blog & Technical Writing Manager (`/admin/blog`)

- Author original technical articles supporting Markdown formatting.
- Automatically calculates estimated reading time based on word count (~200 wpm).
- Configure article slugs, categories, tags, and publication statuses (`Draft`, `Published`).
- Public readers can only view articles explicitly marked as `Published`.

---

## 7. CV / Résumé Manager (`/admin/cv`)

- **Upload New CV**: Upload an updated PDF document.
- **Custom Filename**: Set the public downloaded filename (e.g., `Oduor_Daivine_Oluoch_CV.pdf`).
- **Live Toggle**: Instantly publish or unpublish the CV download. When unpublished, the public download button is cleanly hidden.
- **Preview Link**: Direct link to inspect the currently published document.

---

## 8. Inquiries & Lead Management (`/admin/messages` and `/admin/leads`)

- **Contact Inbox**: All human inquiries submitted through the contact form arrive here.
  - Spam honeypot automatically filters out bots.
  - Update status: `New`, `Read`, `Qualified`, `In progress`, `Replied`, `Converted`, `Spam`.
  - Add internal notes and follow-up schedules.
- **Deal Pipeline (`/admin/leads`)**:
  - Move opportunities through stages: `Lead` → `Qualified` → `In Discussion` → `Proposal` → `Won / Converted` → `Closed / Lost`.
  - Assign estimated deal values in USD or other currencies.
  - **Export CSV**: Download an authorized CSV report of leads with 1 click.

---

## 9. GitHub Sync (`/admin/github`)

- Displays public repositories for your configured GitHub username (`florantetech`).
- Highlights pinned repositories.
- Click **Refresh from GitHub** to invalidate server-side cache and fetch fresh stars, forks, and language metrics directly from the GitHub API.

---

## 10. Audit Log Viewer (`/admin/audit-logs`)

- Displays an immutable log of administrative activity.
- Each entry records: Timestamp, Action Type (e.g. `auth.login_success`, `project.published`, `cv.uploaded`), Entity Type, and Request ID.

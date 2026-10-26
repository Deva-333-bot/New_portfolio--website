# REST API Specification (`/api/v1`)

The FastAPI backend provides structured, type-safe REST contracts formatted under the `/api/v1` namespace.

---

## 1. Authentication Endpoints

### `POST /api/v1/auth/login`
- **Request Body**:
  ```json
  {
    "email": "admin@florante.tech",
    "password": "SecurePassword123!",
    "remember_me": false
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "expires_at": "2026-10-27T00:00:00Z",
    "user": {
      "id": "uuid",
      "email": "admin@florante.tech",
      "is_active": true,
      "mfa_enabled": false
    }
  }
  ```
- **Side Effect**: Sets the `portfolio_session` HttpOnly cookie. The response body intentionally does not expose the raw session token.

### `POST /api/v1/auth/logout`
- **Headers / Cookie**: Requires valid session.
- **Response** (`200 OK`): `{"message": "Successfully logged out"}`.
- **Side Effect**: Marks session as revoked in the database and clears the cookie.

### `GET /api/v1/auth/me`
- **Response** (`200 OK`): Current authenticated administrator record.

### `POST /api/v1/auth/password/change`
- **Request Body**: `{"current_password": "...", "new_password": "..."}`
- **Side Effect**: Re-hashes with Argon2id and revokes all active sessions.

---

## 2. Public Endpoints (Unauthenticated)

| Method | Path | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/public/profile` | Returns the configured public profile and visible social links. |
| `GET` | `/api/v1/public/skills` | Returns visible skills grouped by category. |
| `GET` | `/api/v1/public/projects` | Returns list of published projects. Supports `?category=Backend`. |
| `GET` | `/api/v1/public/projects/{slug}` | Returns detailed case study (problem, solution, architecture, outcomes). |
| `GET` | `/api/v1/public/posts` | Returns list of published blog posts. |
| `GET` | `/api/v1/public/posts/{slug}` | Returns single published blog article with content. |
| `GET` | `/api/v1/public/testimonials` | Returns approved and visible testimonials. |
| `GET` | `/api/v1/public/cv` | Streams the active public PDF CV document. |
| `POST`| `/api/v1/public/contact` | Submits contact message, generates lead, triggers email notification. |
| `POST`| `/api/v1/public/analytics/events`| Logs first-party privacy-conscious telemetry event. |

---

## 3. Admin CMS Endpoints (Protected - Require Admin Session)

| Module | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| **Profile** | `GET` | `/api/v1/admin/profile` | Retrieve editable profile. |
| | `PUT` | `/api/v1/admin/profile` | Update profile headline, bios, stats, education. |
| **Social Links** | `GET` | `/api/v1/admin/social-links` | List social links. |
| | `POST` | `/api/v1/admin/social-links` | Add new social channel. |
| | `DELETE`| `/api/v1/admin/social-links/{id}`| Remove social link. |
| **Projects** | `GET` | `/api/v1/admin/projects` | List all projects (including drafts). |
| | `POST` | `/api/v1/admin/projects` | Create new project case study. |
| | `PATCH`| `/api/v1/admin/projects/{id}` | Update project fields. |
| | `POST` | `/api/v1/admin/projects/{id}/publish` | Make project live on public site. |
| | `POST` | `/api/v1/admin/projects/{id}/unpublish` | Revert project to draft. |
| | `DELETE`| `/api/v1/admin/projects/{id}` | Delete project. |
| **Skills** | `GET` | `/api/v1/admin/skills` | List all skills. |
| | `POST` | `/api/v1/admin/skills` | Add new technology skill. |
| | `DELETE`| `/api/v1/admin/skills/{id}` | Remove skill. |
| **Blog** | `GET` | `/api/v1/admin/posts` | List all articles. |
| | `POST` | `/api/v1/admin/posts` | Author new article. |
| | `PATCH`| `/api/v1/admin/posts/{id}` | Update article body or SEO tags. |
| | `POST` | `/api/v1/admin/posts/{id}/publish` | Publish article live. |
| | `DELETE`| `/api/v1/admin/posts/{id}` | Delete article. |
| **CV** | `GET` | `/api/v1/admin/cv` | List CV revisions. |
| | `POST` | `/api/v1/admin/cv` | Upload replacement PDF and set as active. |
| | `POST` | `/api/v1/admin/cv/{id}/publish` | Publish CV. |
| | `POST` | `/api/v1/admin/cv/{id}/unpublish`| Unpublish CV. |
| **Inquiries** | `GET` | `/api/v1/admin/messages` | List inbox messages. Supports `?status_filter=New`. |
| | `PATCH`| `/api/v1/admin/messages/{id}` | Update status (`Qualified`, `Replied`, etc.) and notes. |
| | `DELETE`| `/api/v1/admin/messages/{id}` | Delete inquiry. |
| **Leads** | `GET` | `/api/v1/admin/leads` | List pipeline opportunities. |
| | `POST` | `/api/v1/admin/leads` | Create new deal lead. |
| | `PATCH`| `/api/v1/admin/leads/{id}` | Advance pipeline status or edit value. |
| | `GET` | `/api/v1/admin/leads-export/csv`| Download CSV report. |
| **Analytics**| `GET` | `/api/v1/admin/analytics/overview` | Aggregated BI metrics (views, funnel, referrers). |
| **GitHub** | `GET` | `/api/v1/admin/integrations/github/repositories` | Get cached repositories. |
| | `POST` | `/api/v1/admin/integrations/github/refresh` | Trigger immediate GitHub API sync. |
| **Audit Logs**| `GET` | `/api/v1/admin/audit-logs` | Retrieve immutable audit history. |

---

## 4. Operational Endpoints

- `GET /health`: Basic liveness probe returning environment and status.
- `GET /ready`: Readiness probe verifying live PostgreSQL connectivity.

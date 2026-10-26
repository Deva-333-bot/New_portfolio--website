# Security Architecture, Threat Modeling & Compliance Report

Security is engineered as a core foundation of this application, aligning with OWASP Top 10 recommendations and the principles of the Kenya Data Protection Act (KDPA), 2019.

---

## 1. Authentication & Session Security

### Password Hashing with Argon2id
- Passwords are encrypted using **Argon2id** (the winner of the Password Hashing Competition), configured with:
  - `memory_cost = 19456` (19 MiB RAM per verification)
  - `time_cost = 2` iterations
  - `parallelism = 1` thread
- Argon2id provides superior resistance against GPU and ASIC brute-force attacks compared to legacy bcrypt or PBKDF2 algorithms.

### Opaque Server-Validated Sessions
- Raw authentication tokens are never stored in the database.
- When an administrator signs in, a 48-byte cryptographically random token is generated via `secrets.token_urlsafe(48)`.
- Only a **SHA-256 hash** of the token keyed with `SESSION_SECRET` is persisted in the `admin_sessions` table.
- Even in the event of an unauthorized database dump, an adversary cannot reconstruct the raw tokens needed to forge valid sessions.
- Sessions automatically expire after 24 hours (or 7 days if "Remember Me" is selected) and can be immediately revoked upon logout or password reset.

### Transport & Cookie Settings
- The session cookie `portfolio_session` is marked:
  - `HttpOnly = True` (inaccessible to client-side JavaScript, preventing token theft via XSS).
  - `SameSite = Lax` in development and `SameSite = None; Secure` in production so separate frontend/API hosts can use the cookie. State-changing authenticated requests also validate an included `Origin` against configured frontend origins.
  - `Secure = True` in production (transmitted exclusively over HTTPS).

---

## 2. Threat Modeling & Countermeasures

| Threat / Vulnerability | OWASP Category | Countermeasure Implemented |
| :--- | :--- | :--- |
| **Brute Force & Credential Stuffing** | A07: Identification and Authentication Failures | In-memory sliding-window rate limiting on `/api/v1/auth/login`. Generic failure responses preventing user enumeration. |
| **SQL Injection** | A03: Injection | All database interactions strictly utilize SQLAlchemy 2.0 ORM parameterized queries and typed Pydantic models. Raw SQL concatenation is forbidden. |
| **Cross-Site Scripting (XSS)** | A03: Injection | Strict input validation via Pydantic; Next.js automatic React string escaping for all rendered output. |
| **Broken Access Control** | A01: Broken Access Control | All administrative endpoints (`/api/v1/admin/*`) require server-side session validation via the `get_current_admin` FastAPI dependency. Frontend route protection is paired with mandatory backend enforcement. |
| **Security Misconfiguration** | A05: Security Misconfiguration | Production security headers applied globally via middleware: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`. |
| **Bot & Form Spam** | Anti-Abuse | Contact form utilizes a hidden honeypot field. Submissions containing honeypot values are silently rejected. |
| **Malicious File Uploads** | A08: Software and Data Integrity Failures | CV uploads require the PDF MIME type and a PDF file signature, limit files to 10 MB, and store files outside the public static-media mount. Public media uploads accept JPEG, PNG, WebP, or GIF only, check the extension and file signature, limit files to 10 MB, and use random storage keys. SVG uploads are rejected to avoid active-content risks. |

---

## 3. Data protection considerations (Kenya Data Protection Act, 2019)

The following technical controls are intended to support privacy-conscious handling of data. This document is not a legal compliance certification; review the actual deployment, retention practices, and applicable obligations before making compliance claims.

1. **Lawfulness, Fairness and Transparency**:
   - A dedicated `/privacy` policy page explains all personal data processing activities.
2. **Purpose Limitation**:
   - Contact form information is gathered strictly for answering prospective client and employer inquiries.
3. **Data Minimization**:
   - The contact form collects the fields shown in the form. Production logs do not print message bodies when SMTP is not configured; the development console email provider may print sample message bodies, so it should not be used with real personal data.
4. **Storage Limitation & Deletion**:
   - Administrators can delete contact messages, lead records, and media assets. CV documents can be unpublished; a dedicated CV deletion route is not currently implemented.
5. **Pseudonymized Telemetry**:
   - Analytics is opt-in through the website consent banner. The API ignores events unless consent is indicated; the server generates a truncated, server-keyed daily pseudonymous reference derived from the request IP, and does not store the raw IP in the analytics event. Pseudonymous data may still be personal data. The privacy notice describes current behavior and does not by itself establish legal compliance.

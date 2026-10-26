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
- Only the **SHA-256 hash** (`hashlib.sha256(token + salt)`) is persisted in the `admin_sessions` table.
- Even in the event of an unauthorized database dump, an adversary cannot reconstruct the raw tokens needed to forge valid sessions.
- Sessions automatically expire after 24 hours (or 7 days if "Remember Me" is selected) and can be immediately revoked upon logout or password reset.

### Transport & Cookie Settings
- The session cookie `portfolio_session` is marked:
  - `HttpOnly = True` (inaccessible to client-side JavaScript, preventing token theft via XSS).
  - `SameSite = Lax` (defends against Cross-Site Request Forgery).
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
| **Malicious File Uploads** | A08: Software and Data Integrity Failures | File uploads validate MIME types against an explicit whitelist (`.pdf` for CV, images for media), limit files to 10 MB, generate random UUID storage keys, and block executable extensions. |

---

## 3. Data Protection Compliance (Kenya Data Protection Act, 2019)

As a software platform operating within Kenya and internationally, the platform adheres to key principles of data protection:

1. **Lawfulness, Fairness and Transparency**:
   - A dedicated `/privacy` policy page explains all personal data processing activities.
2. **Purpose Limitation**:
   - Contact form information is gathered strictly for answering prospective client and employer inquiries.
3. **Data Minimization**:
   - Only necessary contact information (name, email, subject, message) is requested. Full contact messages are never logged in plain text within server diagnostic logs.
4. **Storage Limitation & Deletion**:
   - Administrators possess complete authority within the CMS to permanently delete contact messages, lead pipeline records, and uploaded files.
5. **Pseudonymized Telemetry**:
   - Analytics events avoid collecting personally identifiable information. Unique visitor counts rely on daily salted cryptographic hashes rather than persistent tracking identifiers.

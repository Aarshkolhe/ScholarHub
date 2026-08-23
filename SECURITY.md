# ScholarHub Security & Data Protection Guide

> **Document Version:** 2.0  
> **Last Updated:** August 23, 2026  
> **Target Audience:** Teachers, Students, Project Evaluators, Clients, Managers, and Developers  

---

## 1. What SECURITY.md Is

This document explains in simple, clear, non-technical language how **ScholarHub** protects its users, student profile details, academic records, applications, bookmarks, passwords, and administrative capabilities.

ScholarHub is designed to help students discover and apply for scholarships across India securely. Keeping student data safe and ensuring only authorized people can perform administrative tasks are top priorities for the platform.

---

## 2. How ScholarHub Protects Users

ScholarHub enforces a simple 7-step security flow every time a user interacts with the application:

$$\text{User} \longrightarrow \text{Login} \longrightarrow \text{Password Verification} \longrightarrow \text{JWT Token} \longrightarrow \text{Server Verification} \longrightarrow \text{Permission Check} \longrightarrow \text{Requested Action}$$

1. **User Request**: The user enters their details on the frontend application.
2. **Login**: The user sends their email and password to the `/login` endpoint over a secure connection.
3. **Password Verification**: The backend server compares the password against the encrypted hash stored in PostgreSQL using `bcrypt`.
4. **JWT Token (Digital Pass)**: Upon successful verification, the server issues a cryptographically signed JSON Web Token (JWT) pass to the user's browser.
5. **Server Verification**: For every subsequent request to a protected area, the server inspects the digital pass to confirm it has not expired or been tampered with.
6. **Permission Check**: The server checks whether the user's role (**Student** vs. **Admin**) permits the requested action.
7. **Requested Action**: If all security checks pass, the server executes the action and returns the data.

---

## 3. Login & Role Security

ScholarHub uses **one single login page** located at `/login`:

- **Single Entry Point**: Both Students and Admins log in through the exact same `/login` form.
- **Automatic Role-Based Dashboard Routing**: Once a user successfully logs in, the system checks their role in their digital pass (token):
  - **Students** are routed to their personal Student Dashboard (`/student/dashboard`).
  - **Admins** are routed to the Admin Management Dashboard (`/admin/dashboard`).
- **User Experience**: Users do not need to remember different login links or select a role manually during login.

---

## 4. Password Security

Passwords are the primary lock guarding user accounts. ScholarHub ensures passwords can never be stolen from the system:

- **No Plain-Text Storage**: Passwords are never saved in plain text anywhere in the database or logs.
- **Strong Encryption (Bcrypt Hashing)**: When a user registers or changes their password, ScholarHub turns the password into a unique mathematical scramble called a **hash** using `bcrypt` (with 12 security rounds).
- **Secure Matching**: When logging in, ScholarHub compares the newly entered password against the stored hash. Even if someone obtains access to the database, they cannot reverse the hashes to find the real passwords.

---

## 5. Password Reset & One-Time Password (OTP) Security

If a user forgets their password, ScholarHub provides a secure recovery process:

1. **Email Verification**: The user enters their registered email address at `/forgot-password`.
2. **6-Digit OTP**: ScholarHub sends a temporary 6-digit One-Time Password (OTP) via automated email.
3. **Encrypted Storage**: The 6-digit OTP is hashed using SHA-256 before being stored in the database. Raw OTP numbers are never kept in the database.
4. **Time Expiration**: Each OTP expires automatically after **10 minutes**.
5. **Single-Use Enforcement**: Once an OTP is used successfully to reset a password, it is permanently marked as used and cannot be reused.
6. **Brute-Force Safeguard**: If someone tries guessing an OTP incorrectly **5 times**, that OTP is automatically locked and rendered invalid.
7. **Old OTP Invalidation**: If a user requests a new OTP, any previous active OTPs for that user are immediately canceled.

---

## 6. Authentication Tokens (JWT) & Session Expiration

Once a user logs in, ScholarHub gives their browser a temporary digital pass called a **JSON Web Token (JWT)**.

> **Analogy**: Imagine a digital wristband given at a concert. Every time you try to enter a restricted area (like the VIP section), the security guard inspects your wristband to see who you are and what access level you have.

- **Cryptographic Signature**: The digital pass is signed with a secret key (`JWT_SECRET`) stored safely on the server. If a user tries to alter their pass in the browser (for example, trying to change their role from "Student" to "Admin"), the server detects that the signature is broken and immediately rejects the request with a **401 Unauthorized** error.
- **Automatic Expiration**: Digital passes expire automatically after **1 hour**, requiring users to log in again if inactive.
- **Session Expiration Handling**: When a token expires, the client detects the `401 TOKEN_EXPIRED` API response, dispatches a `scholarhub_session_expired` event, and safely returns the user to `/login` with an informative toast message.
- **Issuer & Audience Validation**: The server verifies that the digital pass was issued specifically by ScholarHub (`scholarhub-api`) for the ScholarHub web client (`scholarhub-frontend`).

---

## 7. Student vs. Admin Capabilities

ScholarHub strictly separates what normal students and platform administrators can do:

### Student Capabilities
- Access the **Student Dashboard**, personal **Profile**, and **Scholarship Search**.
- View and apply to scholarships.
- Save (bookmark) scholarships.
- View and track their **own submitted applications**.
- Use the **Simulation Sandbox** to test eligibility criteria.
- Interact with the **AI Counselor** for application advice.

### Admin Capabilities
- Access the **Admin Dashboard** and **System Statistics**.
- View all registered users and manage user roles (**Student** $\leftrightarrow$ **Admin**).
- Create, edit, and delete scholarships in the catalog.
- Review and update application approval statuses (**Submitted**, **Approved**, **Rejected**).
- Manage external **Scholarship Portals** (Create, edit, toggle active status, and delete unused portals).

---

## 8. Server-Side Admin API Protection

In web applications, protecting frontend buttons or hiding website pages in the browser is **not** enough for real security. A malicious user could bypass the browser UI and send direct network calls to admin web addresses.

ScholarHub enforces security directly on the backend server:

Every single Admin API endpoint (such as `/api/admin/stats`, `/api/admin/users`, or `/api/admin/portals`) is guarded by two mandatory security checkpoints:

$$\text{Incoming Request} \longrightarrow [\text{authenticateToken}] \longrightarrow [\text{requireAdmin}] \longrightarrow \text{Admin API Action}$$

1. **`authenticateToken` Check**: Verifies that the user has a valid, non-expired digital pass. If missing or invalid, the server responds with **401 Unauthorized**.
2. **`requireAdmin` Check**: Verifies that the digital pass strictly belongs to an **Admin**. If a student attempts to call an Admin API, the server immediately responds with **403 Forbidden**.

Even if a student manually types `/admin/dashboard` in their browser, all background API requests fail with **403 Forbidden**, ensuring system administrative data remains completely safe.

---

## 9. Ownership Protection (Preventing IDOR)

**IDOR** (Insecure Direct Object Reference) is a common web security flaw where a user changes an ID number in a request to view or edit another person's private data.

ScholarHub prevents IDOR entirely by obeying one strict rule:

> **Rule**: Protected student endpoints (`GET /api/profile`, `POST /api/profile`, `POST /api/scholarships/bookmark`, `POST /api/scholarships/apply`) **never trust** user IDs sent in request bodies or web link parameters.

Instead, the server extracts the user's identity directly from their verified digital pass (`req.user.id`). Even if User A sends a request containing User B's ID, the server ignores the submitted ID and operates exclusively on User A's data.

---

## 10. Privilege Escalation Protection

Privilege escalation occurs when a normal user tries to give themselves higher privileges (such as Admin access).

ScholarHub prevents privilege escalation:

- **Self-Registration Constraint**: When anyone signs up on the registration page (`POST /register`), ScholarHub hardcodes their account role to **`Student`** in PostgreSQL.
- **Payload Sanitization**: If a user attempts to inject secret fields like `role: "Admin"`, `isAdmin: true`, or `permissions: ["*"]` during registration or profile updates, the server strips and ignores those fields.
- **Controlled Admin Role Assignment**: User roles can only be updated by authenticated Admins through protected Admin management endpoints (`POST /api/admin/users/role`).

---

## 11. Database Query Protection (SQL Injection Defense)

**SQL Injection** is an attack where malicious database commands are typed into form fields (such as search boxes or login inputs) to trick the database into running unauthorized commands.

ScholarHub prevents SQL injection completely:

- **Parameterized Queries**: Every database query uses parameterized placeholder variables (`$1`, `$2`, `$3`) provided by the official PostgreSQL driver (`pg`).
- **Data Isolation**: User inputs are treated strictly as literal data strings, never as executable SQL code. Malicious test payloads (such as `' OR '1'='1` or `'; DROP TABLE users; --`) are safely stored or searched as literal text without affecting database execution.

---

## 12. Cross-Site Scripting (XSS) Protection

**Cross-Site Scripting (XSS)** occurs when an attacker tries to inject malicious code or scripts into web pages viewed by other users.

ScholarHub protects users against XSS:

- **React Automatic HTML Escaping**: The frontend is built using React. React automatically escapes all string variables before rendering them in the DOM tree, preventing injected script tags (such as `<script>alert(1)</script>`) from running.
- **Safe Link Handling**: External website links render with standard HTML text elements and safe attributes (`target="_blank" rel="noopener noreferrer"`).

---

## 13. Input Validation & UUID Hardening

- **UUID Sanitization**: All endpoint controllers validate UUID parameters using strict regex checks (`isValidUUID`). Supplying malformed or invalid UUIDs returns a clean `400 Bad Request` validation response rather than exposing database tracebacks.
- **URL Validation**: Portal creation and editing endpoints validate URL prefixes (`http://` or `https://`), rejecting malformed links with `400 Bad Request`.

---

## 14. Cross-Origin Resource Sharing (CORS)

**CORS** is a browser security feature that controls which websites are allowed to request data from an API server.

- **Production Origin Restriction**: In production, ScholarHub's backend configures CORS (`cors` middleware) to allow requests exclusively from trusted frontend domain origins specified in `ALLOWED_ORIGINS` (such as `https://scholarhub.app`).
- **Blocking Unauthorized Domains**: Requests sent from unauthorized third-party websites are automatically blocked by the browser.

---

## 15. HTTP Security Headers (Helmet)

ScholarHub uses **`helmet`** middleware to set essential HTTP security headers on all API responses:

- **`X-Content-Type-Options: nosniff`**: Stops browsers from trying to guess file types, preventing MIME-type attacks.
- **`X-Frame-Options: DENY`**: Prevents the application from being embedded inside hidden `<iframe>` frames on malicious websites (protecting against clickjacking attacks).
- **`Strict-Transport-Security` (HSTS)**: Forces web browsers to communicate with the server exclusively over encrypted HTTPS connections in production.

---

## 16. Request Rate Limiting

To protect public endpoints against automated abuse, denial-of-service, and high-speed password guessing:

- **Rate Limiting Middleware**: Public authentication routes (`/register`, `/login`, `/forgot-password`, `/verify-otp`, `/reset-password`) use `express-rate-limit` to restrict excessive requests per IP address within a 15-minute window.
- **Configurable Limits**: Development and production request thresholds can be adjusted smoothly using the `AUTH_RATE_LIMIT_MAX` environment variable.

---

## 17. Database Structure, Indexes & Cascade Safety

ScholarHub uses a **PostgreSQL 16** relational database engineered for data accuracy and reliability:

- **UUID Identifiers**: Uses 128-bit universally unique identifiers (UUIDs) for primary keys, preventing predictable sequential ID guessing (e.g., `user/1`, `user/2`).
- **Foreign Key Cascade Relationships**: Related tables (such as student profiles, saved scholarships, and applications) link directly to `users` and `scholarships` tables using `ON DELETE CASCADE` or `ON DELETE SET NULL`. Deleting a user or scholarship cleanly updates or removes child records without creating orphan rows.
- **B-Tree Performance Indexes**: Indexes exist on high-frequency lookup columns (`users.email`, `student_profiles.user_id`, `user_saved_scholarships.user_id`, `user_scholarship_applications.user_id`, `password_reset_otps.user_id`, `scholarships.portal_id`) for sub-5ms query execution.

---

## 18. Scholarship Portal Authorization & Safe Delete Protection

ScholarHub includes dedicated **Scholarship Portal Management** (`scholarship_portals` table):

- **Admin Authorization**: All portal CRUD endpoints (`GET/POST/PUT/DELETE /api/admin/portals` and `PATCH /api/admin/portals/:id/status`) are guarded by `authenticateToken` + `requireAdmin`. Student requests receive `403 Forbidden`.
- **Phase 4 Safe Delete Protection**: Deleting a portal (`DELETE /api/admin/portals/:id`) checks if any scholarships currently reference `portal_id`. If scholarships are linked, the backend blocks deletion and returns HTTP `409 Conflict` (`PORTAL_IN_USE`), advising the Admin to disable the portal instead.
- **Active Status Toggle**: Admins can soft-enable or disable portals (`is_active = FALSE`) without deleting historical student applications or bookmarks.
- **Backward Compatibility**: `scholarships.portal_url` and `scholarships.provider` columns are preserved as fallbacks, ensuring existing scholarship displays, email alerts, and AI prompts continue to resolve URLs seamlessly.

---

## 19. Protection of Sensitive Information

ScholarHub ensures confidential system secrets never leak to unauthorized parties:

- **Sanitized API Responses**: Endpoints returning user details (such as `GET /api/admin/users`) sanitize user objects to strip out `password_hash` fields before sending data to the client.
- **Secret Isolation**: System secrets (`DB_PASSWORD`, `JWT_SECRET`, `EMAIL_APP_PASSWORD`, `GEMINI_API_KEY`) remain strictly on the backend server inside the `.env` configuration file.
- **Git Safety**: Environment configuration files (`.env`), compiled build artifacts (`dist/`), log files, and dependency folders (`node_modules/`) are explicitly excluded from Git tracking via `.gitignore`.

---

## 20. What Happens If Someone Tries to Break In?

Here are simple real-world examples of how ScholarHub stops unauthorized access:

1. **Invalid Login Attempts**: If someone guesses a password incorrectly, ScholarHub returns a generic `"Invalid email or password"` message without revealing whether the email exists.
2. **Student Accessing Admin APIs**: If a student attempts to access `/api/admin/stats` or `/api/admin/portals`, the server checks their JWT role and blocks the request with **403 Forbidden**.
3. **Trying to Access Another User's Data**: If User A passes User B's ID in a request body to `/api/profile`, the server ignores the submitted ID and operates exclusively on User A's token identity (`req.user.id`).
4. **SQL Injection Attempts**: If an attacker types `' OR '1'='1` into a search box, the database treats it as literal search text rather than executable SQL logic.
5. **Guessing OTPs**: If someone guesses a 6-digit OTP incorrectly 5 times, the system automatically locks that OTP.
6. **Sending Excessive Requests**: If an automated script sends dozens of login requests per minute, `express-rate-limit` blocks the IP address.
7. **Invalid UUID Inputs**: Passing malformed IDs returns `400 Bad Request` without exposing database tracebacks.
8. **Deleting a Portal in Use**: If an Admin tries to delete a portal that is linked to active scholarships, the server blocks deletion with **409 Conflict**, protecting scholarship data.

---

## 21. Production Security Guidelines

To maintain security when deploying ScholarHub to a live cloud environment:

- **Strong Production JWT Secret**: Set `JWT_SECRET` to a random 256-bit secret generated via `openssl rand -base64 32`.
- **Private Backend Credentials**: Keep database passwords, Gmail SMTP passwords, and Gemini API keys inside server environment variables.
- **Frontend Variable Safety**: Never put private backend keys into frontend `VITE_*` variables.
- **Git Protection**: Never commit `.env` files to Git repositories. Track `.env.example` templates instead.
- **HTTPS Enforcement**: Serve all web traffic over encrypted HTTPS connections in production.
- **Restricted CORS**: Configure `ALLOWED_ORIGINS` to allow only trusted frontend domains.

---

## 22. Security Maintenance for Future Developers

Future developers working on ScholarHub must follow these rules:

1. **Keep Dependencies Updated**: Regularly run `npm audit` to patch package vulnerabilities.
2. **Protect New APIs**: Mount `authenticateToken` on new student routes and `requireAdmin` on new admin routes.
3. **Derive User Ownership**: Always extract identity from `req.user.id`. Never trust user-supplied `userId` parameters.
4. **Never Commit Secrets**: Ensure `.env` files remain un-tracked by Git.
5. **Review Admin Permissions**: Audit access control whenever adding new administrative capabilities.
6. **Update SECURITY.md**: Update this document whenever security features are added, modified, or updated.

---

## 23. Security & QA Assessment Summary (Rounds 1–10)

ScholarHub has undergone 10 comprehensive Quality Assurance (QA) testing passes:

1. **Round 1 — Authentication & Session QA**: Verified registration, login, logout, token persistence, and session expiration.
2. **Round 2 — Scholarship & IDOR QA**: Verified scholarship filtering, application submissions, bookmarking, and identity protection.
3. **Round 3 — Student Profile QA**: Verified student profile section updates, partial update preservation, and field validation.
4. **Round 4 — Admin Authorization QA**: Verified server-side admin role enforcement (`requireAdmin`), privilege escalation defense, and user management.
5. **Round 5 — Comprehensive End-to-End QA**: Ran automated E2E tests across all 37 application workflows and corrected partial profile section updates.
6. **Round 6 — Security QA**: Tested authentication bypasses, JWT tampering, SQL injection, stored XSS, data exposure, and CORS.
7. **Round 7 — Full Functionality & Edge Cases**: Tested edge-case inputs, empty states, boundary values, network failure recovery, and browser navigation.
8. **Round 8 — Production Readiness & Hardening**: Removed hardcoded backend URLs, added Helmet security headers, configured CORS, set up rate limiting, added PostgreSQL B-Tree indexes, and created environment templates.
9. **Round 9 — Scholarship Portal Management QA**: Verified portal CRUD, active status toggles, safe delete protection (`409 Conflict`), and backward-compatible scholarship links.
10. **Round 10 — Production Release Audit**: Conducted complete 23-point production release audit across all features, code syntax, build performance, database integrity, and documentation (**100% Score — PASS**).

---

## 24. Known Security Limitation & Future Enhancement

- **Stateless JWT Role Revocation**:
  - *Current Behavior*: ScholarHub uses stateless JWT tokens for performance and scalability. If an Admin demotes an account from `Admin` to `Student` in the database, a previously issued Admin token remains valid until it expires (up to 1 hour), because the server verifies the cryptographic token signature without querying PostgreSQL on every request. Conversely, promoting a Student to Admin requires the user to log in again to receive a token with the new `Admin` claim.
  - *Future Enhancement*: In a future enterprise release, a server-side token revocation list (blacklisting token IDs upon role changes) can be added if instantaneous role revocation is required.

---

## 25. Security Verification Checklist

| Security Control | Status | Description |
| --- | --- | --- |
| **Password Hashing** | `[PASS]` | Passwords hashed using `bcrypt` with 12 rounds |
| **JWT Verification** | `[PASS]` | HMAC-SHA256 signature, expiry, issuer, and audience verified |
| **Server Admin Authorization** | `[PASS]` | Admin routes enforce `authenticateToken` + `requireAdmin` (`403 Forbidden`) |
| **IDOR Protection** | `[PASS]` | Identity derived strictly from token (`req.user.id`); body `userId` ignored |
| **Privilege Escalation Defense** | `[PASS]` | Self-registration hardcoded to `Student`; role injection attempts ignored |
| **SQL Injection Defense** | `[PASS]` | All database queries use parameterized SQL placeholders (`$1`, `$2`) |
| **XSS Defense** | `[PASS]` | React JSX automatically HTML-escapes all rendered text strings |
| **OTP Hashing & Single-Use** | `[PASS]` | 6-digit OTPs stored as SHA-256 hashes; single-use with 5-attempt limit |
| **Rate Limiting** | `[PASS]` | `express-rate-limit` active on public authentication routes |
| **CORS Control** | `[PASS]` | Environment-driven `ALLOWED_ORIGINS` restriction |
| **Security Headers** | `[PASS]` | `helmet` active (`X-Content-Type-Options: nosniff`, Frameguard) |
| **Secret Protection** | `[PASS]` | `password_hash` omitted from API outputs; secrets excluded from Git |
| **Database Constraints & Indexes** | `[PASS]` | UUID primary keys, CASCADE constraints, and B-Tree indexes active |
| **Portal Management Security** | `[PASS]` | Portal CRUD protected by `requireAdmin`; in-use deletion returns `409 Conflict` |
| **Production Build Cleanliness** | `[PASS]` | `npm run build` compiles with zero errors |

---
*ScholarHub Security Guide — Maintained by the ScholarHub Engineering & Security Team.*

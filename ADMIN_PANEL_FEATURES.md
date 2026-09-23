# ScholarHub Admin Panel & Role-Based Access Control (RBAC) Specification

This document details all completed features across Phases 1–4, system architecture, database changes, environment setup, and the upcoming Phase 5 plan for ScholarHub.

---

## 🛡️ 1. Core Security Architecture & Business Rules

### Single Unified Login Flow
* Everyone logs in via the **SAME login page** (`/login`). No second login page is built.
* After a successful login, the server evaluates account status and role:
  * `status === 'blocked'` -> Render alert: **"Your account is blocked"** and reject access.
  * `role === 'user'` -> Standard user flow (`/landing` -> `/student/dashboard`).
  * `role === 'admin'` or `'super_admin'` -> Redirect directly to `/admin/dashboard` (skips landing name prompt).

### Role Determination Hierarchy
1. **Super Admin**: Checked server-side against the `SUPER_ADMIN_EMAILS` environment variable (comma-separated, lowercased comparison). Email match always yields `super_admin` regardless of DB column value.
2. **Admin**: Stored in the PostgreSQL database (`users.role = 'admin'`). Managed dynamically by the Super Admin via `/admin/admins`.
3. **User**: Regular student/user (`users.role = 'user'`).

### Server-Side Permission Enforcement
* Every `/api/admin/*` backend route is guarded with server-side middleware: `requireRole('admin', 'super_admin')` or `requireRole('super_admin')`.
* Non-admin users attempting to access `/admin` on the frontend are redirected away.
* **Immediate Access Revocation**: `authenticateToken` checks DB user status on every request. When a user is blocked, their access is revoked immediately.
* **Safeguards**:
  * Admins can block/unblock regular users only—never other admins or super admins.
  * Super admins cannot be blocked, demoted, or removed.
  * Only super admins can promote or demote admins.
  * Every sensitive action (block, unblock, promote, demote, send notification) is recorded in `audit_log`.

---

## 🔑 2. Environment Configuration

Add `SUPER_ADMIN_EMAILS` to your `backend/.env` file:

```env
SUPER_ADMIN_EMAILS=superadmin@example.com,admin1@scholarhub.com
```

---

## 🗄️ 3. Database Schema Changes & Migrations

The database tables are automatically migrated on server startup (`backend/src/config/db.js`):

```sql
-- Modified users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_by INT REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS block_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT TRUE;

-- New audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  actor_id INT REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  target_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  scholarship_id INT REFERENCES scholarships(id) ON DELETE SET NULL,
  created_by INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- New user_notifications junction table
CREATE TABLE IF NOT EXISTS user_notifications (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  notification_id INT REFERENCES notifications(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  UNIQUE(user_id, notification_id)
);
```

---

## 🚀 4. Summary of Implemented & Planned Phases

### ✅ Phase 1: Database Migrations, Role/Status Middleware & Login Redirect
* **Backend**:
  * Added `backend/src/utils/roleUtils.js` for environment parsing.
  * Updated `backend/src/middleware/authMiddleware.js` for DB status checks & `requireRole`.
  * Updated `backend/src/controllers/authController.js` to return user role/status and reject blocked accounts.
* **Frontend**:
  * Updated `frontend/src/routes/ProtectedRoute.jsx` for role-based route protection.
  * Updated `frontend/src/components/auth/LoginForm.jsx` for admin redirection.

### ✅ Phase 2: Admin Panel Shell, User Management & Security Audit Log
* **Admin Sidebar & Navigation**: Dedicated dark-themed sidebar with role badges and quick site switcher.
* **Dashboard (`/admin/dashboard`)**: Metric cards for Total Users, Blocked Users, Admins, Notifications Sent.
* **User Management (`/admin/users`)**: Search & filter regular users vs admins; view student credentials and document metadata; block modal with mandatory reason; instant unblock.
* **Audit Log (`/admin/audit-log`)**: Super Admin security log listing all block/unblock, role change, and broadcast events.

### ✅ Phase 3: Super Admin Manage Admins Page
* **Manage Admins (`/admin/admins`)**: Accessible exclusively to `super_admin`.
* **Promote to Admin**: `POST /api/admin/users/:id/promote` with user search modal.
* **Remove Admin Access**: `POST /api/admin/users/:id/demote` with confirmation modal.
* Protected Super Admin badges with disabled demote options for Super Admins.

### ✅ Phase 4: In-App Notifications & Admin Broadcasting
* **Student Topbar Bell Dropdown**: Real-time polling badge, dropdown list, and "Mark all read".
* **Broadcast Composition (`/admin/notifications`)**: Form for Announcements, New Scholarship alerts, and Deadline reminders. Targeted filter options (Category, Domicile, Education Level) with live recipient preview.
* **1-Click Scholarship Alert (`/admin/scholarships`)**: Dedicated notify button on scholarship rows.

### ✅ Phase 5: Automated Daily Deadline Reminders (Completed)
* **Automated Scheduler Service (`schedulerService.js`)**:
  * Scans PostgreSQL `scholarships` table daily for active schemes closing in **7, 3, and 1 days**.
  * Matches eligible active non-blocked students based on category/degree qualification.
  * Creates targeted `deadline_reminder` notifications in `notifications` and `user_notifications`.
  * Enforces duplicate delivery prevention via PostgreSQL `UNIQUE(user_id, notification_id)` constraints.
* **Email Extensibility Hook**:
  * Includes `sendDeadlineAlertEmail` helper hook to trigger email alerts asynchronously without blocking backend execution.
* **Server Boot Integration**:
  * Automatically initialized in `backend/index.js` on server startup (`initDeadlineScheduler`).

---

## 📂 5. Key File Matrix & Permissions

| Page / Component | Route | File Path | Required Role |
| :--- | :--- | :--- | :--- |
| **Admin Dashboard** | `/admin/dashboard` | `frontend/src/pages/admin/AdminDashboardPage.jsx` | `admin`, `super_admin` |
| **User Management** | `/admin/users` | `frontend/src/pages/admin/AdminUsersPage.jsx` | `admin`, `super_admin` |
| **Scholarships Admin** | `/admin/scholarships` | `frontend/src/pages/admin/AdminScholarshipsPage.jsx` | `admin`, `super_admin` |
| **Notification Center** | `/admin/notifications` | `frontend/src/pages/admin/AdminNotificationsPage.jsx` | `admin`, `super_admin` |
| **Manage Admins** | `/admin/admins` | `frontend/src/pages/admin/AdminAdminsPage.jsx` | **`super_admin` Only** |
| **Audit Logs** | `/admin/audit-log` | `frontend/src/pages/admin/AdminAuditLogPage.jsx` | **`super_admin` Only** |
| **User Topbar Bell** | Main Navigation | `frontend/src/components/dashboard/Topbar.jsx` | All Authenticated Users |

---

## 🛠️ 6. How to Test & Verify

1. **Set Up Environment Variable**:
   In `backend/.env`, set: `SUPER_ADMIN_EMAILS=your_email@example.com`

2. **Start Backend & Frontend**:
   ```bash
   cd backend && npm run dev
   cd frontend && npm run dev
   ```

3. **Verify Super Admin Flow**:
   Log in with `your_email@example.com`. Notice you are taken straight to `/admin/dashboard`. You can access `/admin/admins` and `/admin/audit-log`.

4. **Verify Regular Admin Flow**:
   Promote another account to `admin` using the `/admin/admins` page. Log in with that account. Verify access to `/admin/users` and `/admin/notifications`, but restricted access away from `/admin/admins`.

5. **Verify User Blocking**:
   Block a regular user from `/admin/users`. Try logging in with that user—the server will display: *"Your account is blocked"*.

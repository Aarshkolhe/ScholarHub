/**
 * Reads SUPER_ADMIN_EMAILS from environment variables and returns a clean array of lowercased emails.
 */
export function getSuperAdminEmails() {
  const envEmails = process.env.SUPER_ADMIN_EMAILS || "";
  return envEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Determines the effective role of a user.
 * 
 * Rules:
 * 1. If user's email is present in SUPER_ADMIN_EMAILS (compared lowercase), return 'super_admin'.
 * 2. Otherwise return user.role from DB if valid ('admin' | 'user' | 'super_admin'), defaulting to 'user'.
 */
export function getUserRole(user) {
  if (!user || !user.email) return "user";

  const cleanEmail = String(user.email).trim().toLowerCase();
  const superAdmins = getSuperAdminEmails();

  if (superAdmins.includes(cleanEmail)) {
    return "super_admin";
  }

  const role = String(user.role || "").toLowerCase().trim();
  if (role === "admin" || role === "super_admin") {
    return role;
  }

  return "user";
}

import express from "express";
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  getAdminApplications,
  updateApplicationStatus,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getAdminPortals,
  createAdminPortal,
  updateAdminPortal,
  toggleAdminPortalStatus,
  deleteAdminPortal,
} from "../controllers/adminController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Apply authenticateToken + requireAdmin to ALL admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// System Stats
router.get("/api/admin/stats", getAdminStats);

// User Role & Management
router.get("/api/admin/users", getAdminUsers);
router.post("/api/admin/users/role", updateUserRole);
router.put("/api/admin/users/:id/role", updateUserRole);

// Applications Administration
router.get("/api/admin/applications", getAdminApplications);
router.put("/api/admin/applications/:id/status", updateApplicationStatus);
router.post("/api/admin/applications/status", updateApplicationStatus);

// Scholarship Administration (CRUD)
router.post("/api/admin/scholarships", createScholarship);
router.put("/api/admin/scholarships/:id", updateScholarship);
router.delete("/api/admin/scholarships/:id", deleteScholarship);
router.delete("/api/admin/scholarships", deleteScholarship);

// Scholarship Portal Management (CRUD & Status Toggle)
router.get("/api/admin/portals", getAdminPortals);
router.post("/api/admin/portals", createAdminPortal);
router.put("/api/admin/portals/:id", updateAdminPortal);
router.patch("/api/admin/portals/:id/status", toggleAdminPortalStatus);
router.delete("/api/admin/portals/:id", deleteAdminPortal);

export default router;

import express from "express";
import {
  getScholarships,
  applyScholarship,
  bookmarkScholarship,
  unbookmarkScholarship,
  getSavedScholarships,
  getUserApplications,
} from "../controllers/scholarshipController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Scholarship Listing
router.get("/api/scholarships", getScholarships);

// Protected Application Endpoints (supporting canonical and legacy alias paths)
router.post("/api/scholarships/apply", authenticateToken, applyScholarship);
router.post("/api/applications", authenticateToken, applyScholarship);
router.get("/api/scholarships/applications", authenticateToken, getUserApplications);
router.get("/api/applications", authenticateToken, getUserApplications);

// Protected Bookmark Endpoints
router.post("/api/scholarships/bookmark", authenticateToken, bookmarkScholarship);
router.post("/api/scholarships/unbookmark", authenticateToken, unbookmarkScholarship);
router.delete("/api/scholarships/bookmark", authenticateToken, unbookmarkScholarship);
router.get("/api/scholarships/saved", authenticateToken, getSavedScholarships);
router.get("/api/scholarships/bookmarks", authenticateToken, getSavedScholarships);

export default router;

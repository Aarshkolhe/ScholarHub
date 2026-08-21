import express from "express";
import { getScholarships, applyScholarship, bookmarkScholarship } from "../controllers/scholarshipController.js";

const router = express.Router();

router.get("/api/scholarships", getScholarships);
router.post("/api/scholarships/apply", applyScholarship);
router.post("/api/scholarships/bookmark", bookmarkScholarship);

export default router;

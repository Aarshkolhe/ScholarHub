import express from "express";
import { getProfile, saveProfile } from "../controllers/profileController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/api/profile", authenticateToken, getProfile);
router.post("/api/profile", authenticateToken, saveProfile);

export default router;

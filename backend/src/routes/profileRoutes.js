import express from "express";
import { getProfile, saveProfile } from "../controllers/profileController.js";

const router = express.Router();

router.get("/api/profile", getProfile);
router.post("/api/profile", saveProfile);

export default router;

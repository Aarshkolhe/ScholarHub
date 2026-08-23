import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/authRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import scholarshipRoutes from "./src/routes/scholarshipRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import { testEmailConnection } from "./src/services/emailService.js";

import {
  testDatabaseConnection,
  initializeDatabase
} from "./src/config/db.js";
import helmet from "helmet";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Security & Production Middleware
// --------------------------------------------------

// 1. Helmet Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);

// 2. Production Environment-Based CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed."));
    }
  })
);

app.use(express.json());

// --------------------------------------------------
// Health Check
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "ScholarHub backend is running"
  });
});

// --------------------------------------------------
// API Routes
// --------------------------------------------------

app.use("/", authRoutes);
app.use("/", aiRoutes);
app.use("/", profileRoutes);
app.use("/", scholarshipRoutes);
app.use("/", notificationRoutes);
app.use("/", adminRoutes);

// --------------------------------------------------
// Start Server
// --------------------------------------------------

async function startServer() {
  try {
    // Check PostgreSQL connection first.
    await testDatabaseConnection();

    // Create required database tables/indexes & seed government schemes.
    await initializeDatabase();

    // Test Gmail SMTP connection.
    await testEmailConnection();

    // Start Express only after all services are ready.
    app.listen(PORT, () => {
      console.log(
        `ScholarHub backend running on http://localhost:${PORT}`
      );

      console.log("Authentication, Profile, Scholarships & AI routes:");
      console.log(`POST http://localhost:${PORT}/register`);
      console.log(`POST http://localhost:${PORT}/login`);
      console.log(`GET  http://localhost:${PORT}/api/scholarships`);
      console.log(`POST http://localhost:${PORT}/api/scholarships/apply`);
      console.log(`POST http://localhost:${PORT}/api/profile`);
      console.log(`POST http://localhost:${PORT}/api/ai/chat`);
    });
  } catch (error) {
    console.error(
      "Failed to start ScholarHub backend:",
      error
    );

    process.exit(1);
  }
}

startServer();
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/authRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import scholarshipRoutes from "./src/routes/scholarshipRoutes.js";
import notificationRoutes from "./src/routes/notificationRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import cronRoutes from "./src/routes/cronRoutes.js";
import { testEmailConnection } from "./src/services/emailService.js";

import { initDeadlineScheduler } from "./src/services/schedulerService.js";

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
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173"
];

const configuredOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
      .map((o) => o.trim().replace(/\/$/, ""))
      .filter(Boolean)
  : [];

const isProduction = process.env.NODE_ENV === "production";
const allowedOrigins = isProduction && configuredOrigins.length > 0
  ? configuredOrigins
  : [...new Set([...defaultOrigins, ...configuredOrigins])];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. server-to-server, curl, mobile apps, cron)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, "");
      const isAllowed = allowedOrigins.includes(normalizedOrigin);

      if (isAllowed) {
        return callback(null, true);
      }

      // Reject unauthorized origins cleanly without throwing an unhandled Error (prevents Express 500)
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-cron-secret"],
    optionsSuccessStatus: 204
  })
);

app.use(express.json());

// --------------------------------------------------
// Health Check & Root Public Status
// --------------------------------------------------

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "ScholarHub API is running"
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    message: "ScholarHub Finder backend is running"
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
app.use("/api/admin", adminRoutes);
app.use("/api/cron", cronRoutes);

// --------------------------------------------------
// Start Server
// --------------------------------------------------

async function startServer() {
  try {
    // Check PostgreSQL connection first.
    await testDatabaseConnection();

    // Create required database tables/indexes & seed government schemes.
    await initializeDatabase();

    // Initialize daily deadline reminder scheduler service
    initDeadlineScheduler();

    // Test Gmail SMTP connection.
    await testEmailConnection();

    // Start Express only after all services are ready.
    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `ScholarHub Finder backend running on http://localhost:${PORT}`
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
      "Failed to start ScholarHub Finder backend:",
      error
    );

    process.exit(1);
  }
}

startServer();
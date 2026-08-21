import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./src/routes/authRoutes.js";
import aiRoutes from "./src/routes/aiRoutes.js";
import { testEmailConnection } from "./src/services/emailService.js";

import {
  testDatabaseConnection,
  initializeDatabase
} from "./src/config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// Middleware
// --------------------------------------------------

app.use(cors());
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

// --------------------------------------------------
// Start Server
// --------------------------------------------------

async function startServer() {
  try {
    // Check PostgreSQL connection first.
    await testDatabaseConnection();

    // Create required database tables/indexes.
    await initializeDatabase();

    // Test Gmail SMTP connection.
    await testEmailConnection();

    // Start Express only after all services are ready.
    app.listen(PORT, () => {
      console.log(
        `ScholarHub backend running on http://localhost:${PORT}`
      );

      console.log("Authentication & AI routes:");
      console.log(`POST http://localhost:${PORT}/register`);
      console.log(`POST http://localhost:${PORT}/login`);
      console.log(`POST http://localhost:${PORT}/api/ai/chat`);
      console.log(`POST http://localhost:${PORT}/api/ai/essay`);
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
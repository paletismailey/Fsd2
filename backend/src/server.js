import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",").map((origin) => origin.trim());

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by CORS"));
  },
}));
app.use(express.json({ limit: "100kb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 250, standardHeaders: true, legacyHeaders: false }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "smart-spam-detection-api" }));
app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.message);
  const status = err.status || 500;
  res.status(status).json({ message: status === 500 ? "Something went wrong on the server." : err.message });
});

async function start() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Configure backend/.env.");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
}
start().catch((error) => {
  console.error("Failed to start:", error.message);
  process.exit(1);
});

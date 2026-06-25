<<<<<<< HEAD
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import subscriptionRoutes from './routes/subscriptions';
import alertRoutes from './routes/alerts';
import { startAlertScheduler, startAlertWorker } from './jobs/alertScheduler';
import { verifySmtp } from './services/emailService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ── Security middleware ─────────────────────────────────────── */
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

/* ── Body parsing ────────────────────────────────────────────── */
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

/* ── Request logging (dev only) ──────────────────────────────── */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* ── Health check ────────────────────────────────────────────── */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'SubscriptionGhost API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: Math.floor(process.uptime()),
=======
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors         from "cors";
import helmet       from "helmet";
import morgan       from "morgan";
import mongoose     from "mongoose";
import { connectDB }          from "./config/db";
import { apiLimiter }         from "./middleware/rateLimiter";
import authRoutes             from "./routes/auth";
import subscriptionRoutes     from "./routes/subscriptions";
import alertRoutes            from "./routes/alerts";
import { startAlertScheduler, startAlertWorker } from "./jobs/alertScheduler";
import { verifySmtp }         from "./services/emailService";

const app  = express();
const PORT = Number(process.env.PORT ?? 5000);

/* ── Security ─────────────────────────────────────────────────── */
app.use(helmet());
app.use(cors({
  origin:      process.env.CLIENT_URL ?? "http://localhost:5173",
  credentials: true,
  methods:     ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));

/* ── Body parsing ─────────────────────────────────────────────── */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

/* ── Logging ──────────────────────────────────────────────────── */
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

/* ── Global rate limit ────────────────────────────────────────── */
app.use("/api", apiLimiter);

/* ── Health check ─────────────────────────────────────────────── */
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status:    "OK",
    env:       process.env.NODE_ENV ?? "development",
    db:        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime:    Math.floor(process.uptime()),
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
    timestamp: new Date().toISOString(),
  });
});

<<<<<<< HEAD
/* ── Routes ──────────────────────────────────────────────────── */
app.use('/api/auth',          authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/alerts',        alertRoutes);

/* ── 404 handler ─────────────────────────────────────────────── */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

/* ── Global error handler ────────────────────────────────────── */
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
});

/* ── Bootstrap ───────────────────────────────────────────────── */
const startServer = async (): Promise<void> => {
  await connectDB();

  // These were previously defined but never called anywhere — the entire
  // renewal-alert pipeline (cron check + email worker) never actually ran.
  startAlertScheduler();
  startAlertWorker();
  void verifySmtp(); // non-blocking — don't fail server startup over email config

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📄 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
};

startServer();
=======
/* ── Routes ───────────────────────────────────────────────────── */
app.use("/api/auth",          authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/alerts",        alertRoutes);

/* ── 404 ──────────────────────────────────────────────────────── */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ── Global error handler ─────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[UNHANDLED]", err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  });
});

/* ── Bootstrap ────────────────────────────────────────────────── */
(async () => {
  await connectDB();
  await verifySmtp();

  if (process.env.NODE_ENV !== "test") {
    startAlertScheduler();
    startAlertWorker();
  }

  app.listen(PORT, () => {
    console.log(`\n🚀  API  →  http://localhost:${PORT}/api`);
    console.log(`❤️   Health →  http://localhost:${PORT}/api/health\n`);
  });
})();

export default app;
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699

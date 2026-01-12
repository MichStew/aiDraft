import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import authRoutes from "./routes/auth.js";
import dailyLogsRoutes from "./routes/dailyLogs.js";
import userRoutes from "./routes/user.js";
import forumRoutes from "./routes/forum.js";
import mfaRoutes from "./routes/mfa.js";

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: config.appOrigin,
    credentials: true,
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/daily-logs", dailyLogsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/forum", forumRoutes);
app.use("/api/mfa", mfaRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "server error" });
});

app.listen(config.apiPort, () => {
  console.log(`API listening on ${config.apiPort}`);
});

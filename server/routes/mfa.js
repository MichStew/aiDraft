import express from "express";
import { authMiddleware, verifyPassword } from "../auth.js";
import { config } from "../config.js";
import { getDb } from "../db.js";
import {
  buildOtpAuthUrl,
  generateMfaSecret,
  normalizeToken,
  verifyMfaToken,
} from "../mfa.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/status", (req, res) => {
  return res.json({ enabled: Boolean(req.user?.mfa?.enabled) });
});

router.post("/setup", async (req, res) => {
  const secret = generateMfaSecret();
  const issuer = config.appName;
  const accountName = req.user.email;
  const otpauthUrl = buildOtpAuthUrl({ issuer, accountName, secret });

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: req.user._id },
    {
      $set: {
        mfa: {
          secret,
          enabled: false,
          createdAt: new Date(),
        },
        updatedAt: new Date(),
      },
    }
  );

  return res.json({ secret, otpauthUrl, issuer, accountName });
});

router.post("/enable", async (req, res) => {
  const code = normalizeToken(req.body?.code);
  if (!code) {
    return res.status(400).json({ error: "invalid code" });
  }

  const secret = req.user?.mfa?.secret;
  if (!secret) {
    return res.status(400).json({ error: "mfa not setup" });
  }

  if (!verifyMfaToken(secret, code)) {
    return res.status(401).json({ error: "invalid mfa code" });
  }

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: req.user._id },
    {
      $set: {
        "mfa.enabled": true,
        "mfa.enabledAt": new Date(),
        updatedAt: new Date(),
      },
    }
  );

  return res.json({ enabled: true });
});

router.post("/disable", async (req, res) => {
  const code = normalizeToken(req.body?.code);
  const password = req.body?.password;

  if (!code) {
    return res.status(400).json({ error: "invalid code" });
  }

  if (req.user?.passwordHash) {
    if (!password || typeof password !== "string") {
      return res.status(400).json({ error: "password required" });
    }

    const validPassword = await verifyPassword(password, req.user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: "invalid password" });
    }
  }

  const secret = req.user?.mfa?.secret;
  if (!secret || !verifyMfaToken(secret, code)) {
    return res.status(401).json({ error: "invalid mfa code" });
  }

  const db = await getDb();
  await db.collection("users").updateOne(
    { _id: req.user._id },
    {
      $set: {
        mfa: { enabled: false },
        updatedAt: new Date(),
      },
    }
  );

  return res.json({ enabled: false });
});

export default router;

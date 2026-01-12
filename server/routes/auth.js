import express from "express";
import crypto from "node:crypto";
import rateLimit from "express-rate-limit";
import { config } from "../config.js";
import { getDb } from "../db.js";
import {
  clearAuthCookie,
  createToken,
  getUserFromToken,
  hashPassword,
  sanitizeUser,
  setAuthCookie,
  validateEmail,
  verifyPassword,
} from "../auth.js";
import { normalizeToken, verifyMfaToken } from "../mfa.js";

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const defaultSettings = {
  goalPuffs: 30,
  reductionPlan: 10,
  dailySpend: 12,
  minimalUseThreshold: 3,
  reductionPercent: 60,
  notificationsEnabled: true,
  goalAlerts: true,
  dailyCheckins: true,
  dataSharing: false,
  aiDataUse: true,
  emailUpdates: true,
};

const normalizeEmail = (email) => email.trim().toLowerCase();
const ensureSettings = (user) => ({
  ...user,
  settings: { ...defaultSettings, ...(user.settings ?? {}) },
});

router.post("/register", authLimiter, async (req, res) => {
  const { email, password, name } = req.body ?? {};

  if (!email || !validateEmail(email)) {
    return res.status(400).json({ error: "invalid email" });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: "password too short" });
  }

  const db = await getDb();
  const normalizedEmail = normalizeEmail(email);

  const existing = await db
    .collection("users")
    .findOne({ email: normalizedEmail });

  if (existing) {
    return res.status(409).json({ error: "email already registered" });
  }

  const passwordHash = await hashPassword(password);
  const now = new Date();
  const user = {
    email: normalizedEmail,
    name: name?.trim() || "",
    passwordHash,
    settings: defaultSettings,
    createdAt: now,
    updatedAt: now,
  };

  const result = await db.collection("users").insertOne(user);
  const token = createToken({ _id: result.insertedId, email: normalizedEmail });
  setAuthCookie(res, token);

  return res.json({ user: sanitizeUser({ ...user, _id: result.insertedId }) });
});

router.post("/login", authLimiter, async (req, res) => {
  const { email, password, mfaCode } = req.body ?? {};

  if (!email || !validateEmail(email) || !password) {
    return res.status(400).json({ error: "invalid credentials" });
  }

  const db = await getDb();
  const normalizedEmail = normalizeEmail(email);
  const user = await db
    .collection("users")
    .findOne({ email: normalizedEmail });

  if (!user || !user.passwordHash) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  if (user.mfa?.enabled) {
    const normalized = normalizeToken(mfaCode);
    if (!normalized) {
      return res.status(401).json({ error: "mfa_required", mfaRequired: true });
    }
    if (!verifyMfaToken(user.mfa.secret, normalized)) {
      return res.status(401).json({ error: "invalid mfa code", mfaRequired: true });
    }
  }

  const hydratedUser = ensureSettings(user);
  const token = createToken(hydratedUser);
  setAuthCookie(res, token);

  return res.json({ user: sanitizeUser(hydratedUser) });
});

router.post("/logout", async (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

router.get("/me", async (req, res) => {
  const token = req.cookies?.[config.sessionCookieName];
  if (!token) {
    return res.status(401).json({ error: "unauthenticated" });
  }

  try {
    const user = await getUserFromToken(token);
    if (!user) {
      return res.status(401).json({ error: "unauthenticated" });
    }

    return res.json({ user: sanitizeUser(ensureSettings(user)) });
  } catch (error) {
    return res.status(401).json({ error: "unauthenticated" });
  }
});

router.get("/google", (req, res) => {
  if (!config.googleClientId || !config.googleCallbackUrl) {
    return res.status(500).json({ error: "google oauth not configured" });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const requestedReturn = req.query.returnTo?.toString() || config.appOrigin;
  const returnTo = requestedReturn.startsWith(config.appOrigin)
    ? requestedReturn
    : config.appOrigin;

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 10,
    path: "/",
  });
  res.cookie("oauth_return", returnTo, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 10,
    path: "/",
  });

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleCallbackUrl,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });

  return res.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
});

router.get("/google/callback", async (req, res) => {
  const { code, state } = req.query ?? {};
  const storedState = req.cookies?.oauth_state;
  const rawReturnTo = req.cookies?.oauth_return || config.appOrigin;
  const returnTo = rawReturnTo.startsWith(config.appOrigin)
    ? rawReturnTo
    : config.appOrigin;

  if (!config.googleClientId || !config.googleClientSecret || !config.googleCallbackUrl) {
    return res.status(500).send("Google OAuth not configured");
  }

  if (!code || !state || state !== storedState) {
    return res.status(400).send("Invalid OAuth state");
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code.toString(),
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleCallbackUrl,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      return res.status(401).send("OAuth exchange failed");
    }

    const tokenData = await tokenResponse.json();
    const userinfoResponse = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    if (!userinfoResponse.ok) {
      return res.status(401).send("OAuth userinfo failed");
    }

    const profile = await userinfoResponse.json();
    const email = profile.email ? normalizeEmail(profile.email) : "";

    if (!email) {
      return res.status(400).send("OAuth email missing");
    }

    const db = await getDb();
    const now = new Date();
    const existing = await db.collection("users").findOne({ email });

    let userId;
    if (existing) {
      userId = existing._id;
      await db.collection("users").updateOne(
        { _id: existing._id },
        {
          $set: {
            oauth: {
              provider: "google",
              providerId: profile.sub,
            },
            name: existing.name || profile.name || "",
            updatedAt: now,
          },
        }
      );
    } else {
      const newUser = {
        email,
        name: profile.name || "",
        oauth: {
          provider: "google",
          providerId: profile.sub,
        },
        settings: defaultSettings,
        createdAt: now,
        updatedAt: now,
      };
      const result = await db.collection("users").insertOne(newUser);
      userId = result.insertedId;
    }

    const token = createToken({ _id: userId, email });
    setAuthCookie(res, token);
    res.clearCookie("oauth_state");
    res.clearCookie("oauth_return");

    return res.redirect(returnTo);
  } catch (error) {
    return res.status(500).send("OAuth login failed");
  }
});

export default router;

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "./config.js";
import { ObjectId, getDb } from "./db.js";

const TOKEN_TTL = "7d";

export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function createToken(user) {
  if (!config.jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { sub: user._id.toString(), email: user.email },
    config.jwtSecret,
    { expiresIn: TOKEN_TTL }
  );
}

export function setAuthCookie(res, token) {
  res.cookie(config.sessionCookieName, token, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(config.sessionCookieName, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.[config.sessionCookieName] ??
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "unauthenticated" });
    }

    const payload = jwt.verify(token, config.jwtSecret);
    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(payload.sub) });

    if (!user) {
      return res.status(401).json({ error: "unauthenticated" });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "unauthenticated" });
  }
}

export async function getUserFromToken(token) {
  if (!token) return null;
  if (!config.jwtSecret) throw new Error("JWT_SECRET is not configured");

  const payload = jwt.verify(token, config.jwtSecret);
  const db = await getDb();
  return db.collection("users").findOne({ _id: new ObjectId(payload.sub) });
}

export function sanitizeUser(user) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name ?? "",
    settings: user.settings ?? {},
    mfaEnabled: Boolean(user.mfa?.enabled),
    hasPassword: Boolean(user.passwordHash),
  };
}

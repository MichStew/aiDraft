import express from "express";
import { authMiddleware, sanitizeUser } from "../auth.js";
import { getDb } from "../db.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/settings", async (req, res) => {
  return res.json({ settings: req.user.settings ?? {} });
});

router.patch("/settings", async (req, res) => {
  const updates = req.body ?? {};
  const numericFields = {
    goalPuffs: { min: 5, max: 60 },
    reductionPlan: { min: 0, max: 50 },
    dailySpend: { min: 1, max: 100 },
    minimalUseThreshold: { min: 0, max: 20 },
    reductionPercent: { min: 10, max: 100 },
  };

  const booleanFields = [
    "notificationsEnabled",
    "goalAlerts",
    "dailyCheckins",
    "dataSharing",
    "aiDataUse",
    "emailUpdates",
  ];

  const sanitizedNumbers = {};
  for (const [key, bounds] of Object.entries(numericFields)) {
    if (updates[key] === undefined) continue;
    const value = Number(updates[key]);
    if (Number.isNaN(value)) continue;
    sanitizedNumbers[key] = Math.min(Math.max(value, bounds.min), bounds.max);
  }

  const sanitizedBooleans = {};
  for (const key of booleanFields) {
    if (updates[key] === undefined) continue;
    if (typeof updates[key] === "boolean") {
      sanitizedBooleans[key] = updates[key];
      continue;
    }
    if (updates[key] === "true" || updates[key] === "false") {
      sanitizedBooleans[key] = updates[key] === "true";
    }
  }

  const setPayload = { updatedAt: new Date() };
  for (const [key, value] of Object.entries(sanitizedNumbers)) {
    setPayload[`settings.${key}`] = value;
  }
  for (const [key, value] of Object.entries(sanitizedBooleans)) {
    setPayload[`settings.${key}`] = value;
  }
  if (Object.keys(setPayload).length === 1) {
    return res.status(400).json({ error: "no valid settings" });
  }

  const db = await getDb();
  const result = await db.collection("users").findOneAndUpdate(
    { _id: req.user._id },
    {
      $set: setPayload,
    },
    { returnDocument: "after" }
  );

  const updatedUser =
    result.value ?? (await db.collection("users").findOne({ _id: req.user._id }));

  if (!updatedUser) {
    return res.status(404).json({ error: "user not found" });
  }

  return res.json({ user: sanitizeUser(updatedUser) });
});

export default router;

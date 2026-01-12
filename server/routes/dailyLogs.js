import express from "express";
import { authMiddleware } from "../auth.js";
import { getDb } from "../db.js";

const router = express.Router();

const toDateKey = (date) => date.toISOString().slice(0, 10);

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const daysParam = Number.parseInt(req.query.days ?? "7", 10);
  const days = Number.isNaN(daysParam)
    ? 7
    : Math.min(Math.max(daysParam, 1), 365);

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));

  const db = await getDb();
  const logs = await db
    .collection("daily_logs")
    .find({
      userId: req.user._id,
      date: { $gte: toDateKey(start), $lte: toDateKey(end) },
    })
    .sort({ date: 1 })
    .toArray();

  return res.json({ logs });
});

router.get("/today", async (req, res) => {
  const today = toDateKey(new Date());
  const db = await getDb();
  const log = await db
    .collection("daily_logs")
    .findOne({ userId: req.user._id, date: today });

  return res.json({ log: log ?? null });
});

router.get("/:date", async (req, res) => {
  const date = req.params.date;
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
    return res.status(400).json({ error: "invalid date" });
  }

  const db = await getDb();
  const log = await db
    .collection("daily_logs")
    .findOne({ userId: req.user._id, date });

  return res.json({ log: log ?? null });
});

router.post("/", async (req, res) => {
  const { date, metrics, notes } = req.body ?? {};
  if (date && !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
    return res.status(400).json({ error: "invalid date" });
  }

  const resolvedDate = date || toDateKey(new Date());

  if (
    !metrics ||
    typeof metrics.puffCount !== "number" ||
    typeof metrics.goalPuffs !== "number"
  ) {
    return res.status(400).json({ error: "invalid metrics" });
  }

  const sanitizedNotes =
    typeof notes === "string" ? notes.trim().slice(0, 500) : undefined;

  const payload = {
    userId: req.user._id,
    date: resolvedDate,
    metrics: {
      puffCount: Math.max(0, Math.round(metrics.puffCount)),
      goalPuffs: Math.max(1, Math.round(metrics.goalPuffs)),
    },
    notes: sanitizedNotes,
    updatedAt: new Date(),
  };

  const db = await getDb();
  await db.collection("daily_logs").updateOne(
    { userId: req.user._id, date: resolvedDate },
    {
      $set: payload,
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  );

  const saved = await db
    .collection("daily_logs")
    .findOne({ userId: req.user._id, date: resolvedDate });

  return res.json({ log: saved });
});

export default router;

import express from "express";
import { authMiddleware } from "../auth.js";
import { getDb } from "../db.js";
import { containsExplicitContent, sanitizeContent } from "../contentFilter.js";

const router = express.Router();

const MIN_CONTENT_LENGTH = 12;
const MAX_CONTENT_LENGTH = 500;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const getAuthorName = (user) => {
  const name = user?.name?.trim();
  if (name) return name;
  const email = user?.email ?? "";
  if (email.includes("@")) {
    return email.split("@")[0];
  }
  return "Member";
};

const mapPost = (post) => ({
  id: post._id.toString(),
  author: post.author,
  content: post.content,
  createdAt: post.createdAt,
});

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const limitParam = Number.parseInt(req.query.limit ?? `${DEFAULT_LIMIT}`, 10);
  const limit = Number.isNaN(limitParam)
    ? DEFAULT_LIMIT
    : Math.min(Math.max(limitParam, 1), MAX_LIMIT);

  const db = await getDb();
  const posts = await db
    .collection("forum_posts")
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray();

  return res.json({ posts: posts.map(mapPost) });
});

router.post("/", async (req, res) => {
  const { content } = req.body ?? {};

  if (!content || typeof content !== "string") {
    return res.status(400).json({ error: "invalid content" });
  }

  const sanitized = sanitizeContent(content);

  if (sanitized.length < MIN_CONTENT_LENGTH) {
    return res.status(400).json({ error: "content too short" });
  }

  if (sanitized.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: "content too long" });
  }

  if (containsExplicitContent(sanitized)) {
    return res.status(400).json({ error: "explicit content not allowed" });
  }

  const post = {
    userId: req.user._id,
    author: getAuthorName(req.user),
    content: sanitized,
    createdAt: new Date(),
  };

  const db = await getDb();
  const result = await db.collection("forum_posts").insertOne(post);

  return res.json({ post: mapPost({ ...post, _id: result.insertedId }) });
});

export default router;

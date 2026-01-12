import { MongoClient, ObjectId } from "mongodb";
import { config } from "./config.js";

let client;
let db;
let indexesReady = false;

export async function getDb() {
  if (!config.mongoUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!client) {
    client = new MongoClient(config.mongoUri, {
      maxPoolSize: 10,
    });
    await client.connect();
    db = client.db(config.mongoDbName);
  }

  if (!indexesReady) {
    await ensureIndexes(db);
    indexesReady = true;
  }

  return db;
}

async function ensureIndexes(database) {
  const users = database.collection("users");
  const dailyLogs = database.collection("daily_logs");
  const forumPosts = database.collection("forum_posts");

  await users.createIndex({ email: 1 }, { unique: true });
  await dailyLogs.createIndex({ userId: 1, date: 1 }, { unique: true });
  await dailyLogs.createIndex({ userId: 1, createdAt: -1 });
  await forumPosts.createIndex({ createdAt: -1 });
  await forumPosts.createIndex({ userId: 1, createdAt: -1 });
}

export { ObjectId };

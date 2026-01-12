import dotenv from "dotenv";

dotenv.config();

export const config = {
  mongoUri: process.env.MONGODB_URI ?? "",
  mongoDbName: process.env.MONGODB_DATABASE ?? "acqd",
  jwtSecret: process.env.JWT_SECRET ?? "",
  appOrigin: process.env.APP_ORIGIN ?? "http://localhost:5173",
  apiPort: Number(process.env.API_PORT ?? 5174),
  appName: process.env.APP_NAME ?? "ACQD",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? "",
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "acqd_session",
  nodeEnv: process.env.NODE_ENV ?? "development",
};

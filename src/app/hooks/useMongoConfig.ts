import { useMemo } from "react";
import {
  MONGODB_DATABASE,
  MONGODB_DAILY_LOGS_COLLECTION,
} from "../services/mongodb";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function useMongoConfig() {
  return useMemo(
    () => ({
      apiBaseUrl: API_BASE_URL,
      database: MONGODB_DATABASE,
      collection: MONGODB_DAILY_LOGS_COLLECTION,
      isConfigured: API_BASE_URL.trim().length > 0,
    }),
    []
  );
}

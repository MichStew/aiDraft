import { apiFetch } from "./apiClient";

export interface DailyLogMetrics {
  puffCount: number;
  goalPuffs: number;
}

export interface DailyLog {
  id?: string;
  date: string;
  metrics: DailyLogMetrics;
  notes?: string;
}

export interface DailyLogPayload {
  date?: string;
  metrics: DailyLogMetrics;
  notes?: string;
}

export async function fetchDailyLogs(days: number) {
  return apiFetch<{ logs: DailyLog[] }>(`/daily-logs?days=${days}`, {
    method: "GET",
  });
}

export async function fetchTodayLog() {
  return apiFetch<{ log: DailyLog | null }>("/daily-logs/today", {
    method: "GET",
  });
}

export async function fetchDailyLog(date: string) {
  return apiFetch<{ log: DailyLog | null }>(`/daily-logs/${date}`, {
    method: "GET",
  });
}

export async function saveDailyLog(payload: DailyLogPayload) {
  return apiFetch<{ log: DailyLog }>("/daily-logs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

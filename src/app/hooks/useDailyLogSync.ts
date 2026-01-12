import { useEffect, useRef } from "react";
import { saveDailyLog } from "../services/dailyLogs";

interface DailyLogSyncInput {
  enabled?: boolean;
  puffCount: number;
  goalPuffs: number;
  notes?: string;
  date?: string;
}

export function useDailyLogSync({
  enabled = true,
  puffCount,
  goalPuffs,
  notes,
  date,
}: DailyLogSyncInput) {
  const lastPayloadRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const resolvedDate = date ?? new Date().toISOString().slice(0, 10);
    const payload = {
      date: resolvedDate,
      metrics: {
        puffCount,
        goalPuffs,
      },
      notes,
    };

    const payloadKey = JSON.stringify(payload);
    if (payloadKey === lastPayloadRef.current) return;

    const timeout = setTimeout(() => {
      saveDailyLog(payload).catch(() => undefined);
      lastPayloadRef.current = payloadKey;
    }, 800);

    return () => clearTimeout(timeout);
  }, [enabled, puffCount, goalPuffs, notes, date]);
}

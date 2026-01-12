import { useEffect, useMemo, useState } from "react";
import { fetchDailyLogs, DailyLog } from "../services/dailyLogs";
import { useAuth } from "./useAuth";

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

export function buildDailySeries(
  days: number,
  logs: DailyLog[],
  goalPuffs?: number | null
) {
  const end = new Date();
  const series: DailyLog[] = [];
  const lookup = new Map(logs.map((log) => [log.date, log]));
  const fallbackGoal = typeof goalPuffs === "number" ? goalPuffs : 0;

  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date(end);
    date.setDate(end.getDate() - i);
    const key = toDateKey(date);
    series.push(
      lookup.get(key) ?? {
        date: key,
        metrics: { puffCount: 0, goalPuffs: fallbackGoal },
      }
    );
  }

  return series;
}

export function useDailyLogs(days: number, goalPuffs?: number | null) {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setLogs([]);
      setIsLoading(false);
      setHasLoaded(false);
      setError(null);
      return undefined;
    }

    setIsLoading(true);
    setHasLoaded(false);
    setError(null);

    fetchDailyLogs(days)
      .then((data) => {
        if (!isMounted) return;
        setLogs(data.logs ?? []);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load daily logs");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
        setHasLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, [days, user]);

  const series = useMemo(
    () => buildDailySeries(days, logs, goalPuffs),
    [days, logs, goalPuffs]
  );

  return {
    logs,
    series,
    isLoading,
    hasLoaded,
    error,
  };
}

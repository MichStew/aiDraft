import { useEffect, useState } from "react";
import { fetchDailyLog, DailyLog } from "../services/dailyLogs";
import { useAuth } from "./useAuth";

export function useDailyLogByDate(date: string) {
  const { user } = useAuth();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!user || !date) {
      setLog(null);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    fetchDailyLog(date)
      .then((response) => {
        if (!isMounted) return;
        setLog(response.log ?? null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load daily log");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [date, user]);

  return { log, isLoading, error };
}

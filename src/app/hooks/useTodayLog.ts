import { useEffect, useState } from "react";
import { fetchTodayLog } from "../services/dailyLogs";
import { useAuth } from "./useAuth";

export function useTodayLog(goalFromSettings?: number | null) {
  const { user } = useAuth();
  const [puffCount, setPuffCount] = useState(0);
  const [goalPuffs, setGoalPuffs] = useState<number | null>(
    typeof goalFromSettings === "number" ? goalFromSettings : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasLog, setHasLog] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      setPuffCount(0);
      setGoalPuffs(typeof goalFromSettings === "number" ? goalFromSettings : null);
      setHasLog(false);
      setIsReady(false);
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    setIsReady(false);
    fetchTodayLog()
      .then((response) => {
        if (!isMounted) return;
        const goalFromLog = response.log?.metrics?.goalPuffs;
        const resolvedGoal =
          typeof goalFromSettings === "number"
            ? goalFromSettings
            : typeof goalFromLog === "number"
              ? goalFromLog
              : null;
        if (response.log) {
          setPuffCount(response.log.metrics.puffCount ?? 0);
          setGoalPuffs(resolvedGoal);
          setHasLog(true);
        } else {
          setPuffCount(0);
          setGoalPuffs(resolvedGoal);
          setHasLog(false);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setHasLog(false);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
        setIsReady(true);
      });

    return () => {
      isMounted = false;
    };
  }, [goalFromSettings, user]);

  useEffect(() => {
    if (!user) return;
    if (typeof goalFromSettings === "number") {
      setGoalPuffs(goalFromSettings);
    }
  }, [goalFromSettings, user]);

  return {
    puffCount,
    setPuffCount,
    goalPuffs,
    setGoalPuffs,
    isLoading,
    hasLog,
    isReady,
  };
}

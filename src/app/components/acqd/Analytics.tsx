import { useMemo, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { SavingsTracker } from "./SavingsTracker";
import { useDailyLogs } from "../../hooks/useDailyLogs";
import { useAuth } from "../../hooks/useAuth";
import { DailyLog } from "../../services/dailyLogs";

interface AnalyticsProps {
  onBack: () => void;
}

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

export function Analytics({ onBack }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("7");
  const { user } = useAuth();
  const goalFromSettings = user?.settings?.goalPuffs;
  const days = Number.parseInt(timeRange, 10);
  const { series, logs, isLoading, hasLoaded } = useDailyLogs(days, goalFromSettings);

  const resolveGoal = (log?: DailyLog) => {
    const goalFromLog = log?.metrics?.goalPuffs;
    if (typeof goalFromLog === "number" && goalFromLog > 0) return goalFromLog;
    if (typeof goalFromSettings === "number" && goalFromSettings > 0) {
      return goalFromSettings;
    }
    return null;
  };

  const data = series.map((log) => log.metrics?.puffCount ?? 0);
  const maxValue = Math.max(1, ...data);
  const trackedDays = logs.length;
  const statsReady = hasLoaded;
  const avgValue = trackedDays
    ? Math.round(logs.reduce((total, log) => total + (log.metrics?.puffCount ?? 0), 0) / trackedDays)
    : 0;

  const goalMetDays = logs.filter((log) => {
    const goal = resolveGoal(log);
    if (!goal) return false;
    return (log.metrics?.puffCount ?? 0) <= goal;
  }).length;
  const goalTrackedDays = logs.filter((log) => Boolean(resolveGoal(log))).length;
  const goalMetPercent = goalTrackedDays
    ? Math.round((goalMetDays / goalTrackedDays) * 100)
    : 0;

  const logsByDate = useMemo(
    () => new Map(logs.map((log) => [log.date, log])),
    [logs]
  );

  const streak = useMemo(() => {
    let count = 0;
    for (let i = series.length - 1; i >= 0; i -= 1) {
      const dayLog = logsByDate.get(series[i].date);
      if (!dayLog) break;
      const goal = resolveGoal(dayLog);
      if (!goal) break;
      if ((dayLog.metrics?.puffCount ?? 0) <= goal) {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  }, [series, logsByDate, goalFromSettings]);

  const calendar = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const key = toDateKey(date);
      const log = logsByDate.get(key);
      const goal = resolveGoal(log);
      const value = log?.metrics?.puffCount ?? 0;
      const hasLog = Boolean(log);
      return {
        day,
        hasLog,
        goalMet: hasLog && goal ? value <= goal : false,
      };
    });
  }, [logsByDate, goalFromSettings]);

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      <div className="h-12" />

      <div className="px-6 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-2xl text-white tracking-tight">Analytics</h1>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-center">
            <p className="text-2xl text-white mb-1">
              {statsReady ? avgValue : "--"}
            </p>
            <p className="text-xs text-[#A6A6A6]">Daily Avg</p>
          </div>
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-center">
            <p className="text-2xl text-[#00F0FF] mb-1">
              {statsReady ? streak : "--"}
            </p>
            <p className="text-xs text-[#A6A6A6]">Day Streak</p>
          </div>
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-center">
            <p className="text-2xl text-white mb-1">
              {statsReady ? `${goalMetPercent}%` : "--"}
            </p>
            <p className="text-xs text-[#A6A6A6]">Goal Met</p>
          </div>
        </div>
        <p className="text-xs text-[#A6A6A6] mt-2">
          Based on {statsReady ? trackedDays : "--"} tracked days.
        </p>
      </div>

      <div className="px-6 mb-6">
        <SavingsTracker />
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Daily Puffs</h3>
            <div className="flex gap-2">
              {(["7", "30", "90"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-full text-xs transition-colors ${
                    timeRange === range
                      ? "bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D]"
                      : "bg-[#2C2C2E] text-[#A6A6A6]"
                  }`}
                >
                  {range}d
                </button>
              ))}
            </div>
          </div>

          {(!hasLoaded || isLoading) && (
            <p className="text-sm text-[#A6A6A6]">Loading chart...</p>
          )}

          {hasLoaded && !isLoading && trackedDays === 0 && (
            <p className="text-sm text-[#A6A6A6]">
              No logs yet. Your chart will appear after the first sync.
            </p>
          )}

          {hasLoaded && !isLoading && trackedDays > 0 && (
            <div className="h-48 relative">
              <svg className="w-full h-full" viewBox={`0 0 ${data.length * 10} 100`}>
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2={data.length * 10}
                    y2={y}
                    stroke="#1C1C1E"
                    strokeWidth="0.5"
                  />
                ))}

                <path
                  d={data
                    .map((value, i) => {
                      const x = i * 10 + 5;
                      const y = 100 - (value / maxValue) * 90;
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ")}
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    filter:
                      "drop-shadow(0 0 6px rgba(0, 240, 255, 0.55)) drop-shadow(0 0 8px rgba(255, 58, 242, 0.35))",
                  }}
                />

                <path
                  d={
                    data
                      .map((value, i) => {
                        const x = i * 10 + 5;
                        const y = 100 - (value / maxValue) * 90;
                        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                      })
                      .join(" ") + ` L ${data.length * 10} 100 L 5 100 Z`
                  }
                  fill="url(#gradient)"
                />

                {data.map((value, i) => {
                  const x = i * 10 + 5;
                  const y = 100 - (value / maxValue) * 90;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#00F0FF"
                    />
                  );
                })}

                <defs>
                  <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF3AF2" />
                    <stop offset="100%" stopColor="#00F0FF" />
                  </linearGradient>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FF3AF2" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <h3 className="text-white mb-4">Hour of Day</h3>
          <div className="bg-[#0B0B0D] rounded-[14px] p-4 text-sm text-[#A6A6A6]">
            Hourly breakdown will appear once device-level events are synced.
          </div>
        </div>
      </div>

      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <h3 className="text-white mb-4">This Month</h3>

          <div className="grid grid-cols-7 gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-center text-xs text-[#A6A6A6] mb-1">
                {day}
              </div>
            ))}

            {calendar.map((item) => (
              <div
                key={item.day}
                className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                  item.hasLog
                    ? item.goalMet
                      ? "bg-[#00F0FF]/20 text-[#00F0FF]"
                      : "bg-[#FFB84D]/20 text-[#FFB84D]"
                    : "bg-[#2C2C2E]/60 text-[#A6A6A6]"
                }`}
              >
                {item.day}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#00F0FF]/20" />
              <span className="text-[#A6A6A6]">Goal Met</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#FFB84D]/20" />
              <span className="text-[#A6A6A6]">Over Goal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#2C2C2E]/60" />
              <span className="text-[#A6A6A6]">No Data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

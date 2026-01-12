import { useCallback, useEffect, useMemo, useState } from "react";
import { Settings, TrendingUp, Download, Play, Pause, Sliders } from "lucide-react";
import { Screen } from "../../App";
import { useAuth } from "../../hooks/useAuth";
import { useDailyLogSync } from "../../hooks/useDailyLogSync";
import { useDailyLogs } from "../../hooks/useDailyLogs";
import { useTodayLog } from "../../hooks/useTodayLog";
import { useBlePuffDevice } from "../../hooks/useBlePuffDevice";
import { useBlePuffEvents } from "../../hooks/useBlePuffEvents";
import type { PuffEvent } from "../../services/blePuffDevice";
import logo from "../../../aihdl_logo.png";

interface HomeDashboardProps {
  onNavigate: (screen: Screen) => void;
  onSessionSelect: (sessionId: string) => void;
}

export function HomeDashboard({
  onNavigate,
  onSessionSelect,
}: HomeDashboardProps) {
  const { user } = useAuth();
  const goalFromSettings = user?.settings?.goalPuffs;
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [lastPuffTime, setLastPuffTime] = useState("just now");
  const [pendingPuffs, setPendingPuffs] = useState(0);
  const { puffCount, setPuffCount, goalPuffs, isLoading, isReady } = useTodayLog(
    goalFromSettings
  );
  const { status: bleStatus } = useBlePuffDevice();
  const {
    logs: recentLogs,
    series: weeklySeries,
    isLoading: isLogsLoading,
    hasLoaded: hasLogsLoaded,
  } = useDailyLogs(7, goalFromSettings);
  const hasGoal = typeof goalPuffs === "number" && goalPuffs > 0;

  useDailyLogSync({
    enabled: Boolean(user) && !isLoading && isReady && hasGoal,
    puffCount,
    goalPuffs: goalPuffs ?? 0,
  });
  const progress = hasGoal ? Math.min((puffCount / goalPuffs) * 100, 100) : 0;
  const isConnected = bleStatus === "connected";
  const weeklyMax = useMemo(
    () =>
      Math.max(
        1,
        ...weeklySeries.map((log) => log.metrics?.puffCount ?? 0)
      ),
    [weeklySeries]
  );
  
  const registerPuff = useCallback(
    (delta: number) => {
      if (!isReady) {
        setPendingPuffs((prev) => prev + delta);
        setLastPuffTime("just now");
        return;
      }
      setPuffCount((prev) => prev + delta);
      setLastPuffTime("just now");
    },
    [isReady, setPuffCount]
  );

  useEffect(() => {
    if (!isReady || pendingPuffs <= 0) return;
    setPuffCount((prev) => prev + pendingPuffs);
    setPendingPuffs(0);
  }, [isReady, pendingPuffs, setPuffCount]);

  const handlePuffEvent = useCallback(
    (event: PuffEvent) => {
      if (event.delta > 0) {
        registerPuff(event.delta);
      }
    },
    [registerPuff]
  );

  useBlePuffEvents(handlePuffEvent);

  const dailyLogItems = useMemo(() => {
    const fallbackGoal = typeof goalFromSettings === "number" ? goalFromSettings : 0;
    return [...recentLogs]
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .map((log) => ({
        id: log.date,
        date: log.date,
        puffs: log.metrics?.puffCount ?? 0,
        goal: log.metrics?.goalPuffs ?? fallbackGoal,
      }));
  }, [recentLogs, goalFromSettings]);

  const formatDate = (dateKey: string) => {
    const date = new Date(`${dateKey}T00:00:00`);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const simulatePuff = () => {
    registerPuff(1);
  };

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      {/* Status Bar Space */}
      <div className="h-12" />

      {/* Header */}
      <div className="px-6 mb-6 grid grid-cols-[auto,1fr,auto] items-center gap-3">
        <h1 className="flex items-center">
          <img src={logo} alt="App logo" className="h-8 w-auto object-contain" />
          <span className="sr-only">AI-CQD</span>
        </h1>
        <div className="flex justify-center">
          <button
            onClick={() => onNavigate("onboarding-pairing")}
            aria-label="Connect device"
            className={`h-4 w-16 rounded-full border transition-all ${
              isConnected
                ? "border-[#00F0FF]/70 bg-[#00F0FF]/25 shadow-[0_0_16px_rgba(0,240,255,0.55)]"
                : "border-[#2C2C2E] bg-[#1C1C1E] text-[#6B6B6B]"
            }`}
          >
            {!isConnected && (
              <span className="block text-[9px] uppercase tracking-[0.25em] leading-4">
                Connect
              </span>
            )}
            <span className="sr-only">
              {isConnected ? "Device connected" : "Connect device"}
            </span>
          </button>
        </div>
        <button
          onClick={() => onNavigate("settings")}
          className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
        >
          <Settings className="w-5 h-5 text-[#A6A6A6]" />
        </button>
      </div>

      {/* Ring Progress */}
      <div className="px-6 mb-8 flex justify-center">
        <div className="relative w-64 h-64">
          {/* SVG Ring */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            {/* Background ring */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#1C1C1E"
              strokeWidth="12"
            />
            {/* Progress ring */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${progress * 5.34} 534`}
              className="transition-all duration-500 ease-out"
              style={{
                filter: "drop-shadow(0 0 10px rgba(0, 240, 255, 0.55)) drop-shadow(0 0 14px rgba(255, 58, 242, 0.4))"
              }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF3AF2" />
                <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.9" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-[#A6A6A6] text-sm mb-1">Today</p>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl text-white">
                {!isReady ? "--" : puffCount}
              </span>
              <span className="text-2xl text-[#A6A6A6]">
                / {hasGoal ? goalPuffs : "--"}
              </span>
            </div>
            <p className="text-[#A6A6A6] text-sm mt-1">puffs</p>
          </div>
        </div>
      </div>

      {/* Live Session Card */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white">Live Session</h3>
            <span className="text-xs text-[#00F0FF]">{lastPuffTime}</span>
          </div>

          <div className="bg-[#0B0B0D] rounded-[14px] p-3 text-sm text-[#A6A6A6] mb-3">
            Live session events appear once your device syncs puff activity.
          </div>

          <div className="flex items-center justify-between text-sm text-[#A6A6A6]">
            <span>Logged today: {!isReady ? "--" : puffCount}</span>
            <button
              onClick={simulatePuff}
              disabled={!hasGoal}
              className="text-[#00F0FF] text-xs disabled:text-[#3A3A3C]"
            >
              Log Puff
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setIsSessionActive(!isSessionActive)}
            className="bg-[#1C1C1E] rounded-[18px] p-4 flex flex-col items-center gap-2 hover:bg-[#2C2C2E] transition-colors"
          >
            {isSessionActive ? (
              <Pause className="w-5 h-5 text-[#00F0FF]" />
            ) : (
              <Play className="w-5 h-5 text-[#00F0FF]" />
            )}
            <span className="text-xs text-[#A6A6A6]">
              {isSessionActive ? "Stop" : "Start"}
            </span>
          </button>

          <button
            onClick={() => onNavigate("device-settings")}
            className="bg-[#1C1C1E] rounded-[18px] p-4 flex flex-col items-center gap-2 hover:bg-[#2C2C2E] transition-colors"
          >
            <Sliders className="w-5 h-5 text-[#00F0FF]" />
            <span className="text-xs text-[#A6A6A6]">Calibrate</span>
          </button>

          <button
            onClick={() => onNavigate("export")}
            className="bg-[#1C1C1E] rounded-[18px] p-4 flex flex-col items-center gap-2 hover:bg-[#2C2C2E] transition-colors"
          >
            <Download className="w-5 h-5 text-[#00F0FF]" />
            <span className="text-xs text-[#A6A6A6]">Export</span>
          </button>
        </div>
      </div>

      {/* 7-Day Trend */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">7-Day Trend</h3>
            <button onClick={() => onNavigate("analytics")} className="text-[#00F0FF] text-sm">
              View All
            </button>
          </div>

          {/* Mini chart */}
          <div className="h-24 flex items-end justify-between gap-2">
            {weeklySeries.map((log, i) => {
              const value = log.metrics?.puffCount ?? 0;
              const height = (value / weeklyMax) * 100;
              const isToday = i === weeklySeries.length - 1;
              const label = new Date(`${log.date}T00:00:00`).toLocaleDateString(
                "en-US",
                { weekday: "short" }
              );
              return (
                <div key={log.date} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isToday ? "bg-gradient-to-t from-[#FF3AF2] to-[#00F0FF]" : "bg-[#00F0FF]/30"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-[#A6A6A6]">{label.charAt(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Logs */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Daily Logs</h3>
          <TrendingUp className="w-4 h-4 text-[#A6A6A6]" />
        </div>

        <div className="space-y-3">
          {(!hasLogsLoaded || isLogsLoading) && (
            <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-sm text-[#A6A6A6]">
              Loading daily logs...
            </div>
          )}
          {hasLogsLoaded && !isLogsLoading && dailyLogItems.length === 0 && (
            <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-sm text-[#A6A6A6]">
              No daily logs yet. Your synced progress will appear here.
            </div>
          )}
          {hasLogsLoaded && !isLogsLoading && dailyLogItems.map((log) => {
            const progressValue = log.goal > 0 ? (log.puffs / log.goal) * 100 : 0;
            const goalLabel = log.goal > 0 ? log.goal : "--";
            return (
              <button
                key={log.id}
                onClick={() => onSessionSelect(log.id)}
                className="w-full bg-[#1C1C1E] rounded-[18px] p-4 text-left hover:bg-[#2C2C2E] transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm">{formatDate(log.date)}</span>
                  <span className="text-[#00F0FF] text-sm">
                    {log.puffs} / {goalLabel} puffs
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-[#00F0FF]/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] rounded-full"
                      style={{ width: `${Math.min(progressValue, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#A6A6A6]">
                    {Math.round(progressValue)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

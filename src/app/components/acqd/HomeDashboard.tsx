import { useState } from "react";
import { Battery, Settings, TrendingUp, Download, Play, Pause, Sliders } from "lucide-react";
import { ConnectionStatus, Screen } from "../../App";
import logo from "../../../aihdl_logo.png";

interface HomeDashboardProps {
  onNavigate: (screen: Screen) => void;
  onSessionSelect: (sessionId: string) => void;
  connectionStatus: ConnectionStatus;
  lastSeen: string;
  onReconnect: () => void;
}

export function HomeDashboard({
  onNavigate,
  onSessionSelect,
  connectionStatus,
  lastSeen,
  onReconnect
}: HomeDashboardProps) {
  const [puffCount, setPuffCount] = useState(18);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [lastPuffTime, setLastPuffTime] = useState("3m 12s ago");
  
  const goalPuffs = 30;
  const progress = (puffCount / goalPuffs) * 100;
  const isConnected = connectionStatus === "connected";
  const isReconnecting = connectionStatus === "reconnecting";
  const statusLabel = isConnected ? "Connected" : isReconnecting ? "Reconnecting..." : "Disconnected";
  const statusDotClass = isConnected
    ? "bg-[#00F0FF] animate-pulse"
    : isReconnecting
      ? "bg-[#F5C542] animate-pulse"
      : "bg-[#FF5A6E]";
  const statusBadgeClass = isConnected
    ? "text-[#00F0FF] bg-[#00F0FF]/10"
    : isReconnecting
      ? "text-[#F5C542] bg-[#F5C542]/10"
      : "text-[#FF5A6E] bg-[#FF5A6E]/10";
  const statusDetail = isConnected ? "Live" : isReconnecting ? "Trying now" : `Last seen ${lastSeen}`;
  
  const sessions = [
    { id: "1", time: "07:10 AM — 07:40 AM", puffs: 5, confidence: 94 },
    { id: "2", time: "12:45 PM — 12:50 PM", puffs: 8, confidence: 97 },
    { id: "3", time: "03:20 PM — 03:22 PM", puffs: 5, confidence: 92 },
  ];

  const simulatePuff = () => {
    setPuffCount(prev => Math.min(prev + 1, goalPuffs));
    setLastPuffTime("just now");
  };

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      {/* Status Bar Space */}
      <div className="h-12" />

      {/* Header */}
      <div className="px-6 mb-6 flex items-center justify-between">
        <h1 className="flex items-center">
          <img src={logo} alt="App logo" className="h-8 w-auto object-contain" />
          <span className="sr-only">AI-CQD</span>
        </h1>
        <button
          onClick={() => onNavigate("settings")}
          className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
        >
          <Settings className="w-5 h-5 text-[#A6A6A6]" />
        </button>
      </div>

      {/* Device Card */}
      <div className="px-6 mb-6">
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${statusDotClass}`} />
                <span className="text-white">Xiao-ACQD-01</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${statusBadgeClass}`}>
                  {statusLabel}
                </span>
                {connectionStatus === "disconnected" && (
                  <button
                    onClick={onReconnect}
                    className="text-xs text-[#0B0B0D] bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] px-2 py-1 rounded-full"
                  >
                    Reconnect
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-[#A6A6A6]">
                <Battery className="w-4 h-4" />
                <span>82%</span>
              </div>
              <span className="text-[#A6A6A6]">fw v1.02</span>
              <span className="text-[#A6A6A6]">{statusDetail}</span>
            </div>
          </div>
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
              <span className="text-5xl text-white">{puffCount}</span>
              <span className="text-2xl text-[#A6A6A6]">/ {goalPuffs}</span>
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

          {/* Mini sparkline */}
          <div className="h-12 mb-3 flex items-end gap-1">
            {[12, 8, 15, 20, 10, 5, 18, 25, 15, 8, 12, 22].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-[#00F0FF]/20 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-sm text-[#A6A6A6]">
            <span>Confidence: 97%</span>
            <button onClick={simulatePuff} className="text-[#00F0FF] text-xs">
              Simulate Puff
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
            onClick={() => onNavigate("settings")}
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
            {[18, 22, 15, 28, 12, 20, 18].map((value, i) => {
              const height = (value / 30) * 100;
              const isToday = i === 6;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      isToday ? "bg-gradient-to-t from-[#FF3AF2] to-[#00F0FF]" : "bg-[#00F0FF]/30"
                    }`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-[#A6A6A6]">
                    {["M", "T", "W", "T", "F", "S", "S"][i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Session Feed */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Session Feed</h3>
          <TrendingUp className="w-4 h-4 text-[#A6A6A6]" />
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session.id)}
              className="w-full bg-[#1C1C1E] rounded-[18px] p-4 text-left hover:bg-[#2C2C2E] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white text-sm">{session.time}</span>
                <span className="text-[#00F0FF] text-sm">{session.puffs} puffs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-[#00F0FF]/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] rounded-full"
                    style={{ width: `${session.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-[#A6A6A6]">{session.confidence}%</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

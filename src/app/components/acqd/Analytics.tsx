import { useState } from "react";
import { ChevronLeft } from "lucide-react";

interface AnalyticsProps {
  onBack: () => void;
}

export function Analytics({ onBack }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("7");
  
  const dailyData = {
    "7": [18, 22, 15, 28, 12, 20, 18],
    "30": Array.from({ length: 30 }, (_, i) => Math.floor(Math.random() * 30) + 10),
    "90": Array.from({ length: 90 }, (_, i) => Math.floor(Math.random() * 30) + 10),
  };

  const data = dailyData[timeRange];
  const maxValue = Math.max(...data);
  const avgValue = Math.round(data.reduce((a, b) => a + b, 0) / data.length);

  const hourlyData = [2, 5, 1, 0, 0, 0, 0, 3, 8, 4, 6, 12, 15, 8, 5, 10, 14, 18, 12, 8, 6, 4, 3, 2];
  const maxHourly = Math.max(...hourlyData);

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6">
      {/* Status Bar Space */}
      <div className="h-12" />
      
      {/* Header */}
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

      {/* Stats Overview */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-center">
            <p className="text-2xl text-white mb-1">{avgValue}</p>
            <p className="text-xs text-[#A6A6A6]">Daily Avg</p>
          </div>
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-center">
            <p className="text-2xl text-[#00F0FF] mb-1">7</p>
            <p className="text-xs text-[#A6A6A6]">Day Streak</p>
          </div>
          <div className="bg-[#1C1C1E] rounded-[18px] p-4 text-center">
            <p className="text-2xl text-white mb-1">60%</p>
            <p className="text-xs text-[#A6A6A6]">Goal Met</p>
          </div>
        </div>
      </div>

      {/* Daily Puffs Chart */}
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

          {/* Line chart */}
          <div className="h-48 relative">
            <svg className="w-full h-full" viewBox={`0 0 ${data.length * 10} 100`}>
              {/* Grid lines */}
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

              {/* Line path */}
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
                style={{ filter: "drop-shadow(0 0 6px rgba(0, 240, 255, 0.55)) drop-shadow(0 0 8px rgba(255, 58, 242, 0.35))" }}
              />

              {/* Gradient fill */}
              <path
                d={
                  data
                    .map((value, i) => {
                      const x = i * 10 + 5;
                      const y = 100 - (value / maxValue) * 90;
                      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                    })
                    .join(" ") +
                  ` L ${data.length * 10} 100 L 5 100 Z`
                }
                fill="url(#gradient)"
              />

              {/* Data points */}
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
                    className="cursor-pointer hover:r-3 transition-all"
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
        </div>
      </div>

      {/* Hour of Day Heatmap */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <h3 className="text-white mb-4">Hour of Day</h3>
          
          <div className="grid grid-cols-12 gap-1">
            {hourlyData.map((value, i) => {
              const intensity = value / maxHourly;
              return (
                <div
                  key={i}
                  className="aspect-square rounded relative group cursor-pointer"
                  style={{
                    backgroundColor: `rgba(0, 240, 255, ${intensity * 0.8 + 0.1})`,
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-[#2C2C2E] px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                      {i}:00 - {value} puffs
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between mt-3 text-xs text-[#A6A6A6]">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <h3 className="text-white mb-4">December 2024</h3>
          
          <div className="grid grid-cols-7 gap-2">
            {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
              <div key={day} className="text-center text-xs text-[#A6A6A6] mb-1">
                {day}
              </div>
            ))}
            
            {Array.from({ length: 31 }, (_, i) => {
              const value = Math.floor(Math.random() * 30) + 5;
              const isGoalMet = value <= 30;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs ${
                    isGoalMet
                      ? "bg-[#00F0FF]/20 text-[#00F0FF]"
                      : "bg-[#FFB84D]/20 text-[#FFB84D]"
                  }`}
                >
                  {i + 1}
                </div>
              );
            })}
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
          </div>
        </div>
      </div>
    </div>
  );
}

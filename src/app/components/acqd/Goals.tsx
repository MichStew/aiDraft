import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Bell, Target } from "lucide-react";
import { useUserSettings } from "../../hooks/useUserSettings";

interface GoalsProps {
  onBack: () => void;
}

export function Goals({ onBack }: GoalsProps) {
  const { settings, saveSettings, isSaving, error } = useUserSettings();
  const [dailyMax, setDailyMax] = useState<number | null>(null);
  const [reductionPlan, setReductionPlan] = useState<number | null>(null);
  const initialSync = useRef(true);
  const resolvedDailyMax = typeof dailyMax === "number" ? dailyMax : null;
  const resolvedReductionPlan =
    typeof reductionPlan === "number" ? reductionPlan : null;
  const isReady = resolvedDailyMax !== null && resolvedReductionPlan !== null;
  const notificationsEnabled = settings.notificationsEnabled;
  const canToggleNotifications = typeof notificationsEnabled === "boolean";

  useEffect(() => {
    if (typeof settings.goalPuffs === "number") {
      setDailyMax(settings.goalPuffs);
    }
    if (typeof settings.reductionPlan === "number") {
      setReductionPlan(settings.reductionPlan);
    }
  }, [settings.goalPuffs, settings.reductionPlan]);

  useEffect(() => {
    if (!isReady) return undefined;
    if (initialSync.current) {
      initialSync.current = false;
      return undefined;
    }

    const currentSettings = {
      goalPuffs: settings.goalPuffs,
      reductionPlan: settings.reductionPlan,
    };

    if (
      currentSettings.goalPuffs === resolvedDailyMax &&
      currentSettings.reductionPlan === resolvedReductionPlan
    ) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      saveSettings({
        goalPuffs: resolvedDailyMax,
        reductionPlan: resolvedReductionPlan,
      });
    }, 700);

    return () => clearTimeout(timeout);
  }, [
    resolvedDailyMax,
    resolvedReductionPlan,
    saveSettings,
    settings.goalPuffs,
    settings.reductionPlan,
    isReady,
  ]);

  const projectedSchedule = isReady
    ? [
        { week: 1, goal: resolvedDailyMax },
        {
          week: 2,
          goal: Math.round(
            resolvedDailyMax * (1 - resolvedReductionPlan / 100)
          ),
        },
        {
          week: 3,
          goal: Math.round(
            resolvedDailyMax * Math.pow(1 - resolvedReductionPlan / 100, 2)
          ),
        },
        {
          week: 4,
          goal: Math.round(
            resolvedDailyMax * Math.pow(1 - resolvedReductionPlan / 100, 3)
          ),
        },
      ]
    : [];

  const tips = [
    "Take deep breaths when you feel a craving",
    "Stay hydrated throughout the day",
    "Find a healthier alternative activity",
    "Track patterns to identify triggers",
  ];

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
          <div>
            <h1 className="text-2xl text-white tracking-tight">Goals & Coaching</h1>
            <p className="text-xs text-[#A6A6A6]">
              {isSaving ? "Saving your goals..." : "Auto-saved to your account"}
            </p>
          </div>
        </div>
      </div>

      {/* Current Goal */}
      <div className="px-6 mb-6">
        <div className="bg-gradient-to-br from-[#FF3AF2]/25 to-[#00F0FF]/15 rounded-[18px] p-6 border border-[#00F0FF]/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-[#A6A6A6] text-sm">Daily Goal</p>
              <p className="text-3xl text-white">
                {isReady ? resolvedDailyMax : "--"}
              </p>
            </div>
          </div>
          <p className="text-sm text-[#A6A6A6]">
            {isReady ? "You're on track! Keep it up." : "Loading your goal settings..."}
          </p>
          {error && <p className="text-xs text-[#FF5A6E] mt-2">{error}</p>}
        </div>
      </div>

      {/* Set Daily Max */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <h3 className="text-white mb-4">Set Daily Max</h3>

          {!isReady && (
            <div className="bg-[#0B0B0D] rounded-[14px] p-3 text-sm text-[#A6A6A6]">
              Loading your daily goal...
            </div>
          )}
          {isReady && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#A6A6A6] text-sm">Maximum puffs per day</span>
                <span className="text-[#00F0FF]">{resolvedDailyMax}</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={resolvedDailyMax}
                onChange={(e) => setDailyMax(parseInt(e.target.value))}
                className="w-full h-2 bg-[#2C2C2E] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[#00F0FF]
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-[#00F0FF]/50"
                style={{
                  background: `linear-gradient(to right, #FF3AF2 0%, #00F0FF ${
                  ((resolvedDailyMax - 10) / 50) * 100
                }%, #2C2C2E ${((resolvedDailyMax - 10) / 50) * 100}%, #2C2C2E 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[#A6A6A6] mt-1">
                <span>10</span>
                <span>60</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reduction Plan */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <h3 className="text-white mb-4">Weekly Reduction Plan</h3>

          {!isReady && (
            <div className="bg-[#0B0B0D] rounded-[14px] p-3 text-sm text-[#A6A6A6]">
              Loading your reduction plan...
            </div>
          )}
          {isReady && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#A6A6A6] text-sm">Reduce by</span>
                <span className="text-[#00F0FF]">
                  {resolvedReductionPlan}% / week
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="5"
                value={resolvedReductionPlan}
                onChange={(e) => setReductionPlan(parseInt(e.target.value))}
                className="w-full h-2 bg-[#2C2C2E] rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-6
                  [&::-webkit-slider-thumb]:h-6
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[#00F0FF]
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-[#00F0FF]/50"
                style={{
                  background: `linear-gradient(to right, #FF3AF2 0%, #00F0FF ${
                  ((resolvedReductionPlan - 5) / 20) * 100
                }%, #2C2C2E ${((resolvedReductionPlan - 5) / 20) * 100}%, #2C2C2E 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-[#A6A6A6] mt-1">
                <span>5%</span>
                <span>25%</span>
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#2C2C2E]">
            <p className="text-sm text-[#A6A6A6] mb-3">Projected Schedule</p>
            <div className="space-y-2">
              {projectedSchedule.map((item) => (
                <div key={item.week} className="flex items-center justify-between text-sm">
                  <span className="text-[#A6A6A6]">Week {item.week}</span>
                  <span className="text-white">{item.goal} puffs/day</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="px-6 mb-6">
        <div className="bg-[#1C1C1E] rounded-[18px] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-[#00F0FF]" />
              </div>
              <div>
                <p className="text-white">Push Notifications</p>
                <p className="text-sm text-[#A6A6A6]">Daily reminders & alerts</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (!canToggleNotifications) return;
                saveSettings({ notificationsEnabled: !notificationsEnabled });
              }}
              disabled={!canToggleNotifications}
              className={`w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
                notificationsEnabled
                  ? "bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF]"
                  : "bg-[#2C2C2E]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Coaching Tips */}
      <div className="px-6">
        <h3 className="text-white mb-4">Suggested Tips</h3>
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="bg-[#1C1C1E] rounded-[18px] p-4 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[#00F0FF] text-sm">{index + 1}</span>
              </div>
              <p className="text-white text-sm">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

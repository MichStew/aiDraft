import { useEffect, useMemo, useRef, useState } from "react";
import { PiggyBank, TrendingUp, Calendar } from "lucide-react";
import { useDailyLogs } from "../../hooks/useDailyLogs";
import { useSavingsCalculator } from "../../hooks/useSavingsCalculator";
import { useUserSettings } from "../../hooks/useUserSettings";
import { useAuth } from "../../hooks/useAuth";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);

export function SavingsTracker() {
  const { user } = useAuth();
  const { settings, saveSettings, isSaving } = useUserSettings();
  const [dailySpend, setDailySpend] = useState<number | null>(null);
  const [reductionPercent, setReductionPercent] = useState<number | null>(null);
  const [minimalUseThreshold, setMinimalUseThreshold] = useState<number | null>(null);
  const initialSync = useRef(true);

  const goalFromSettings = user?.settings?.goalPuffs;
  const { logs, hasLoaded } = useDailyLogs(180, goalFromSettings);
  const resolvedDailySpend = typeof dailySpend === "number" ? dailySpend : null;
  const resolvedReductionPercent =
    typeof reductionPercent === "number" ? reductionPercent : null;
  const resolvedMinimalUseThreshold =
    typeof minimalUseThreshold === "number" ? minimalUseThreshold : null;
  const isReady =
    resolvedDailySpend !== null &&
    resolvedReductionPercent !== null &&
    resolvedMinimalUseThreshold !== null;
  const displayDailySpend = resolvedDailySpend ?? 0;
  const displayReductionPercent = resolvedReductionPercent ?? 0;
  const displayMinimalUseThreshold = resolvedMinimalUseThreshold ?? 0;

  useEffect(() => {
    if (typeof settings.dailySpend === "number") {
      setDailySpend(settings.dailySpend);
    }
    if (typeof settings.reductionPercent === "number") {
      setReductionPercent(settings.reductionPercent);
    }
    if (typeof settings.minimalUseThreshold === "number") {
      setMinimalUseThreshold(settings.minimalUseThreshold);
    }
  }, [settings.dailySpend, settings.reductionPercent, settings.minimalUseThreshold]);

  useEffect(() => {
    if (!user) return undefined;
    if (!isReady) return undefined;
    if (initialSync.current) {
      initialSync.current = false;
      return undefined;
    }

    const currentSettings = {
      dailySpend: settings.dailySpend,
      reductionPercent: settings.reductionPercent,
      minimalUseThreshold: settings.minimalUseThreshold,
    };

    if (
      currentSettings.dailySpend === resolvedDailySpend &&
      currentSettings.reductionPercent === resolvedReductionPercent &&
      currentSettings.minimalUseThreshold === resolvedMinimalUseThreshold
    ) {
      return undefined;
    }

    const timeout = setTimeout(() => {
      saveSettings({
        dailySpend: resolvedDailySpend,
        reductionPercent: resolvedReductionPercent,
        minimalUseThreshold: resolvedMinimalUseThreshold,
      });
    }, 700);

    return () => clearTimeout(timeout);
  }, [
    resolvedDailySpend,
    resolvedReductionPercent,
    resolvedMinimalUseThreshold,
    saveSettings,
    settings.dailySpend,
    settings.reductionPercent,
    settings.minimalUseThreshold,
    user,
    isReady,
  ]);

  const { vapeFreeDays, minimalUseDays } = useMemo(() => {
    if (!isReady) {
      return { vapeFreeDays: 0, minimalUseDays: 0 };
    }

    const vapeFree = logs.filter((log) => (log.metrics?.puffCount ?? 0) === 0).length;
    const minimalUse = logs.filter((log) => {
      const count = log.metrics?.puffCount ?? 0;
      return count > 0 && count <= displayMinimalUseThreshold;
    }).length;

    return { vapeFreeDays: vapeFree, minimalUseDays: minimalUse };
  }, [logs, displayMinimalUseThreshold, isReady]);

  const totals = useSavingsCalculator({
    dailySpend: displayDailySpend,
    vapeFreeDays,
    minimalUseDays,
    reductionPercent: displayReductionPercent,
  });

  const streakBoostLabel =
    totals.streakMultiplier > 1
      ? `${Math.round((totals.streakMultiplier - 1) * 100)}% streak boost`
      : "No streak boost yet";

  return (
    <div className="bg-[#1C1C1E] rounded-[18px] p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-[#00F0FF]" />
            <h3 className="text-white">Money Saved</h3>
          </div>
          <p className="text-xs text-[#A6A6A6] mt-1">
            Based on your daily logs over the last 6 months.
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl text-white">
            {isReady ? formatCurrency(totals.totalSavings) : "--"}
          </p>
          <p className="text-xs text-[#00F0FF]">
            {isReady ? streakBoostLabel : "Loading settings..."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#0B0B0D] rounded-[14px] p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs text-[#A6A6A6]">Base</span>
          </div>
          <p className="text-sm text-white">
            {isReady ? formatCurrency(totals.baseSavings) : "--"}
          </p>
        </div>
        <div className="bg-[#0B0B0D] rounded-[14px] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs text-[#A6A6A6]">Streak</span>
          </div>
          <p className="text-sm text-white">
            {isReady ? formatCurrency(totals.streakBonus) : "--"}
          </p>
        </div>
        <div className="bg-[#0B0B0D] rounded-[14px] p-3">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-[#00F0FF]" />
            <span className="text-xs text-[#A6A6A6]">Monthly</span>
          </div>
          <p className="text-sm text-white">
            {isReady ? formatCurrency(totals.monthlyProjection) : "--"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#A6A6A6]">Baseline daily spend</span>
            <span className="text-sm text-white">
              {isReady ? formatCurrency(displayDailySpend) : "--"}
            </span>
          </div>
          {!isReady && (
            <div className="bg-[#0B0B0D] rounded-[12px] px-3 py-2 text-sm text-[#A6A6A6]">
              Loading baseline spend...
            </div>
          )}
          {isReady && (
            <input
              type="number"
              min={1}
              max={100}
              value={displayDailySpend}
              onChange={(e) => setDailySpend(Number(e.target.value))}
              className="w-full rounded-[12px] bg-[#2C2C2E] px-3 py-2 text-sm text-white outline-none"
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#A6A6A6]">Minimal-use threshold</span>
            <span className="text-sm text-[#00F0FF]">
              {isReady ? `${displayMinimalUseThreshold} puffs` : "--"}
            </span>
          </div>
          {!isReady && (
            <div className="bg-[#0B0B0D] rounded-[12px] px-3 py-2 text-sm text-[#A6A6A6]">
              Loading threshold...
            </div>
          )}
          {isReady && (
            <input
              type="range"
              min="1"
              max="15"
              value={displayMinimalUseThreshold}
              onChange={(e) => setMinimalUseThreshold(Number(e.target.value))}
              className="w-full h-2 bg-[#2C2C2E] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#00F0FF]
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-[#00F0FF]/40"
            />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#A6A6A6]">Reduction on minimal-use days</span>
            <span className="text-sm text-[#00F0FF]">
              {isReady ? `${displayReductionPercent}%` : "--"}
            </span>
          </div>
          {!isReady && (
            <div className="bg-[#0B0B0D] rounded-[12px] px-3 py-2 text-sm text-[#A6A6A6]">
              Loading reduction plan...
            </div>
          )}
          {isReady && (
            <input
              type="range"
              min="10"
              max="95"
              value={displayReductionPercent}
              onChange={(e) => setReductionPercent(Number(e.target.value))}
              className="w-full h-2 bg-[#2C2C2E] rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-5
                [&::-webkit-slider-thumb]:h-5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-[#00F0FF]
                [&::-webkit-slider-thumb]:shadow-lg
                [&::-webkit-slider-thumb]:shadow-[#00F0FF]/40"
            />
          )}
        </div>
      </div>

      <p className="text-xs text-[#A6A6A6] mt-4">
        Total tracked: {hasLoaded ? logs.length : "--"} days. Vape-free:{" "}
        {isReady ? vapeFreeDays : "--"}. Minimal-use:{" "}
        {isReady ? minimalUseDays : "--"}. {isSaving ? "Saving settings..." : ""}
      </p>
    </div>
  );
}

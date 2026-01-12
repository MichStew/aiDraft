import { useMemo } from "react";

interface SavingsOptions {
  dailySpend: number;
  vapeFreeDays: number;
  minimalUseDays: number;
  reductionPercent: number;
}

const getStreakMultiplier = (totalDays: number) => {
  if (totalDays >= 120) return 1.2;
  if (totalDays >= 90) return 1.15;
  if (totalDays >= 60) return 1.1;
  if (totalDays >= 30) return 1.05;
  return 1;
};

export function calculateSavings({
  dailySpend,
  vapeFreeDays,
  minimalUseDays,
  reductionPercent,
}: SavingsOptions) {
  const totalDays = vapeFreeDays + minimalUseDays;
  const baseSavings =
    dailySpend * vapeFreeDays +
    dailySpend * minimalUseDays * (reductionPercent / 100);
  const streakMultiplier = getStreakMultiplier(totalDays);
  const streakBonus = baseSavings * (streakMultiplier - 1);
  const totalSavings = baseSavings + streakBonus;
  const averagePerDay = totalDays > 0 ? totalSavings / totalDays : 0;
  const monthlyProjection = averagePerDay * 30;

  return {
    totalDays,
    baseSavings,
    streakMultiplier,
    streakBonus,
    totalSavings,
    monthlyProjection,
  };
}

export function useSavingsCalculator(options: SavingsOptions) {
  return useMemo(() => calculateSavings(options), [options]);
}

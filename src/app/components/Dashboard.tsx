import { Activity, TrendingUp, Wallet, Heart } from "lucide-react";
import { Card } from "./ui/card";

interface DashboardProps {
  quitDate: Date | null;
  vapingIncidents: number;
  costPerPod: number;
  podsPerWeek: number;
}

export function Dashboard({ quitDate, vapingIncidents, costPerPod, podsPerWeek }: DashboardProps) {
  const calculateStats = () => {
    if (!quitDate) return null;
    
    const now = new Date();
    const timeDiff = now.getTime() - quitDate.getTime();
    const daysClean = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursClean = Math.floor(timeDiff / (1000 * 60 * 60));
    
    const dailyCost = (costPerPod * podsPerWeek) / 7;
    const moneySaved = daysClean * dailyCost;
    
    return {
      daysClean,
      hoursClean,
      moneySaved,
    };
  };

  const stats = calculateStats();

  const getHealthMilestone = (hours: number) => {
    if (hours >= 8760) return "Your risk of heart disease has significantly decreased";
    if (hours >= 2160) return "Lung function has improved by up to 30%";
    if (hours >= 336) return "Carbon monoxide levels normalized";
    if (hours >= 72) return "Breathing has become easier";
    if (hours >= 24) return "Nicotine is eliminated from your body";
    if (hours >= 8) return "Oxygen levels are returning to normal";
    if (hours >= 2) return "Heart rate has normalized";
    return "Your body is beginning to heal";
  };

  return (
    <div className="space-y-4">
      {/* Main Stats Card */}
      {stats ? (
        <Card className="bg-gradient-to-br from-green-600 to-emerald-700 text-white p-6 border-0">
          <div className="space-y-4">
            <div>
              <p className="text-emerald-100 mb-1">Days Clean</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl">{stats.daysClean}</span>
                <span className="text-emerald-100">days</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-emerald-100">
              <Heart className="w-4 h-4" />
              <span className="text-sm">{getHealthMilestone(stats.hoursClean)}</span>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-white p-6 border-0">
          <div className="text-center py-4">
            <Activity className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
            <p className="text-zinc-300">Set your quit date to start tracking</p>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-xs">Money Saved</span>
          </div>
          <p className="text-2xl text-white">
            ${stats ? stats.moneySaved.toFixed(2) : "0.00"}
          </p>
        </Card>

        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Incidents</span>
          </div>
          <p className="text-2xl text-white">{vapingIncidents}</p>
        </Card>
      </div>
    </div>
  );
}

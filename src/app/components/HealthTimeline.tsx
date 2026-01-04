import { Card } from "./ui/card";
import { Heart, AirVent, Brain, DollarSign } from "lucide-react";
import { Progress } from "./ui/progress";

interface HealthTimelineProps {
  quitDate: Date | null;
}

export function HealthTimeline({ quitDate }: HealthTimelineProps) {
  const milestones = [
    {
      hours: 2,
      icon: Heart,
      title: "Heart rate normalizes",
      description: "Your heart rate and blood pressure begin to return to normal levels",
    },
    {
      hours: 8,
      icon: AirVent,
      title: "Oxygen levels improve",
      description: "Oxygen levels in your blood increase and carbon monoxide levels decrease",
    },
    {
      hours: 24,
      icon: Brain,
      title: "Nicotine eliminated",
      description: "All nicotine is eliminated from your body. Anxiety may peak but will improve",
    },
    {
      hours: 72,
      icon: AirVent,
      title: "Breathing improves",
      description: "Breathing becomes easier as your bronchial tubes begin to relax",
    },
    {
      hours: 336, // 2 weeks
      icon: Heart,
      title: "Circulation enhances",
      description: "Blood circulation improves and lung function increases",
    },
    {
      hours: 2160, // 3 months
      icon: AirVent,
      title: "Lung function boost",
      description: "Lung function improves by up to 30%, making physical activity easier",
    },
    {
      hours: 8760, // 1 year
      icon: DollarSign,
      title: "Major health milestone",
      description: "Your risk of heart disease is cut in half compared to when you vaped",
    },
  ];

  const getHoursClean = () => {
    if (!quitDate) return 0;
    const now = new Date();
    const timeDiff = now.getTime() - quitDate.getTime();
    return Math.floor(timeDiff / (1000 * 60 * 60));
  };

  const hoursClean = getHoursClean();

  const getProgressForMilestone = (milestoneHours: number) => {
    if (hoursClean >= milestoneHours) return 100;
    const previousMilestone = milestones
      .filter((m) => m.hours < milestoneHours)
      .sort((a, b) => b.hours - a.hours)[0];
    
    const startHours = previousMilestone ? previousMilestone.hours : 0;
    const progress = ((hoursClean - startHours) / (milestoneHours - startHours)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white">Health Recovery Timeline</h2>
      
      {!quitDate ? (
        <Card className="p-6 bg-zinc-900 border-zinc-800 text-center">
          <p className="text-zinc-400">Set your quit date to see your health recovery progress</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {milestones.map((milestone, idx) => {
            const Icon = milestone.icon;
            const isAchieved = hoursClean >= milestone.hours;
            const progress = getProgressForMilestone(milestone.hours);
            const isInProgress = progress > 0 && progress < 100;

            return (
              <Card
                key={idx}
                className={`p-4 border-zinc-800 transition-all ${
                  isAchieved
                    ? "bg-green-900/20 border-green-800/50"
                    : isInProgress
                    ? "bg-zinc-900 border-green-900/30"
                    : "bg-zinc-900/50"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isAchieved
                        ? "bg-green-600"
                        : isInProgress
                        ? "bg-green-900/50"
                        : "bg-zinc-800"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isAchieved
                          ? "text-white"
                          : isInProgress
                          ? "text-green-500"
                          : "text-zinc-600"
                      }`}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4
                        className={
                          isAchieved
                            ? "text-green-400"
                            : isInProgress
                            ? "text-white"
                            : "text-zinc-500"
                        }
                      >
                        {milestone.title}
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {milestone.hours < 24
                          ? `${milestone.hours}h`
                          : milestone.hours < 168
                          ? `${Math.floor(milestone.hours / 24)}d`
                          : milestone.hours < 720
                          ? `${Math.floor(milestone.hours / 168)}w`
                          : milestone.hours < 8760
                          ? `${Math.floor(milestone.hours / 720)}mo`
                          : `${Math.floor(milestone.hours / 8760)}yr`}
                      </span>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mb-3">{milestone.description}</p>
                    
                    {!isAchieved && (
                      <div>
                        <Progress
                          value={progress}
                          className="h-1.5 bg-zinc-800"
                        />
                        {isInProgress && (
                          <p className="text-xs text-green-500 mt-1">
                            {progress.toFixed(0)}% complete
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
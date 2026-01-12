export interface Insight {
  id: string;
  icon: "trend" | "time" | "zap";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export const aiCoachInsights: Insight[] = [
  {
    id: "1",
    icon: "trend",
    title: "Weekly Progress",
    description: "You've reduced usage by 15% this week compared to last week",
    priority: "high",
  },
  {
    id: "2",
    icon: "time",
    title: "Peak Time Alert",
    description:
      "Most activity occurs between 12-3 PM. Consider planning alternatives during lunch",
    priority: "medium",
  },
  {
    id: "3",
    icon: "zap",
    title: "Streak Building",
    description: "Keep going! You're 3 days away from your longest streak",
    priority: "medium",
  },
];

export const aiCoachQuickPrompts = [
  "How am I doing today?",
  "Give me a tip",
  "Why do I vape more at night?",
  "Show my progress",
];

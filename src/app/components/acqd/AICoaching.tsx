import { useState } from "react";
import { ChevronLeft, Sparkles, Send, TrendingDown, Clock, Zap, Brain } from "lucide-react";

interface AICoachingProps {
  onBack: () => void;
}

interface Message {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: string;
}

interface Insight {
  id: string;
  icon: "trend" | "time" | "zap";
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function AICoaching({ onBack }: AICoachingProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hi! I've been analyzing your patterns. You're doing great—18 puffs today is 25% below your goal! 🎉",
      timestamp: "Just now",
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  const insights: Insight[] = [
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
      description: "Most activity occurs between 12-3 PM. Consider planning alternatives during lunch",
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

  const quickPrompts = [
    "How am I doing today?",
    "Give me a tip",
    "Why do I vape more at night?",
    "Show my progress",
  ];

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "Based on your patterns, I notice you tend to use your device more during social situations. Have you considered bringing gum or mints as an alternative?",
        "You're making excellent progress! Your average daily usage has decreased by 22% over the past two weeks. Keep up the great work!",
        "I see evening usage is higher. This is common due to stress relief. Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, out for 8.",
        "Your morning sessions have the highest confidence scores. Consider starting your day with a brief meditation to reduce early cravings.",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputValue(prompt);
    handleSendMessage();
  };

  return (
    <div className="min-h-full bg-[#0B0B0D] bg-gradient-to-br from-[#1A0A24] via-[#0B0B0D] to-[#06141C] pb-6 flex flex-col">
      {/* Status Bar Space */}
      <div className="h-12" />

      {/* Header */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-[#1C1C1E] flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl text-white tracking-tight">AI Coach</h1>
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#FF3AF2]/20 to-[#00F0FF]/15 rounded-full">
                <Sparkles className="w-3 h-3 text-[#00F0FF]" />
                <span className="text-xs text-[#00F0FF]">Active</span>
              </div>
            </div>
            <p className="text-sm text-[#A6A6A6]">Personalized insights & support</p>
          </div>
        </div>
      </div>

      {/* Daily Summary Card */}
      <div className="px-6 mb-4 flex-shrink-0">
        <div className="bg-gradient-to-br from-[#FF3AF2]/25 to-[#00F0FF]/15 rounded-[18px] p-4 border border-[#00F0FF]/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF3AF2]/20 to-[#00F0FF]/20 flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#00F0FF]" />
            </div>
            <div>
              <p className="text-white">Today's AI Insight</p>
              <p className="text-xs text-[#A6A6A6]">Updated 2m ago</p>
            </div>
          </div>
          <p className="text-sm text-white leading-relaxed">
            Your consistency is improving! You've stayed under your goal for 5 consecutive days. This builds powerful habits.
          </p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="px-6 mb-4 flex-shrink-0">
        <h3 className="text-white mb-3">Key Insights</h3>
        <div className="space-y-3">
          {insights.map((insight) => (
            <div key={insight.id} className="bg-[#1C1C1E] rounded-[18px] p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    insight.priority === "high"
                      ? "bg-[#FF3AF2]/15"
                      : "bg-[#FFB84D]/10"
                  }`}
                >
                  {insight.icon === "trend" && (
                    <TrendingDown
                      className={`w-5 h-5 ${
                        insight.priority === "high" ? "text-[#FF3AF2]" : "text-[#FFB84D]"
                      }`}
                    />
                  )}
                  {insight.icon === "time" && (
                    <Clock
                      className={`w-5 h-5 ${
                        insight.priority === "high" ? "text-[#FF3AF2]" : "text-[#FFB84D]"
                      }`}
                    />
                  )}
                  {insight.icon === "zap" && (
                    <Zap
                      className={`w-5 h-5 ${
                        insight.priority === "high" ? "text-[#FF3AF2]" : "text-[#FFB84D]"
                      }`}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white mb-1">{insight.title}</p>
                  <p className="text-sm text-[#A6A6A6] leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Section */}
      <div className="px-6 mb-4 flex-1 min-h-0">
        <h3 className="text-white mb-3">Chat with AI Coach</h3>

        {/* Messages */}
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-[18px] p-4 ${
                  message.type === "user"
                    ? "bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] text-[#0B0B0D]"
                    : "bg-[#1C1C1E] text-white"
                }`}
              >
                {message.type === "ai" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                    <span className="text-xs text-[#00F0FF]">AI Coach</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.type === "user" ? "text-[#0B0B0D]/70" : "text-[#A6A6A6]"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Prompts */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className="text-xs text-[#A6A6A6] mb-2">Quick prompts:</p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="bg-[#1C1C1E] text-[#00F0FF] text-xs px-3 py-2 rounded-full hover:bg-[#2C2C2E] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 pb-6 flex-shrink-0">
        <div className="bg-[#1C1C1E] rounded-[18px] p-3 flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask me anything..."
            className="flex-1 bg-transparent text-white placeholder:text-[#A6A6A6] outline-none text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-[#FF3AF2] to-[#00F0FF] flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
          >
            <Send className="w-4 h-4 text-[#0B0B0D]" />
          </button>
        </div>
        <p className="text-xs text-[#A6A6A6] text-center mt-3">
          AI insights are based on your usage patterns
        </p>
      </div>
    </div>
  );
}

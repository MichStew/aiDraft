import { useState } from "react";
import { ChevronLeft, Sparkles, Send } from "lucide-react";
import { useAICoach } from "../../hooks/useAICoach";

interface AICoachingProps {
  onBack: () => void;
}

export function AICoaching({ onBack }: AICoachingProps) {
  const { messages, isThinking, lastModel, sendMessage } = useAICoach();
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    setInputValue("");
    await sendMessage(trimmed);
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
              <h1 className="text-2xl text-white tracking-tight">coach</h1>
              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#FF3AF2]/20 to-[#00F0FF]/15 rounded-full">
                <Sparkles className="w-3 h-3 text-[#00F0FF]" />
                <span className="text-xs text-[#00F0FF]">Active</span>
              </div>
            </div>
            <p className="text-sm text-[#A6A6A6]">Chat focus mode</p>
            <p className="text-xs text-[#A6A6A6] mt-1">Model: {lastModel}</p>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="px-6 mb-4 flex-1 min-h-0 flex flex-col">
        <h3 className="text-white mb-3">Chat</h3>

        {/* Messages */}
        <div className="space-y-3 flex-1 overflow-y-auto">
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
                    <span className="text-xs text-[#00F0FF]">coach</span>
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
          {isThinking && (
            <div className="flex justify-start">
              <div className="max-w-[70%] rounded-[18px] p-4 bg-[#1C1C1E] text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#00F0FF]" />
                  <span className="text-xs text-[#00F0FF]">coach</span>
                </div>
                <p className="text-sm text-[#A6A6A6]">Thinking...</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Input Area */}
      <div className="px-6 pb-6 flex-shrink-0">
        <div className="bg-[#1C1C1E] rounded-[18px] p-3 flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
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
      </div>
    </div>
  );
}

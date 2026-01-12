import { useCallback, useState } from "react";
import {
  AI_COACH_MODEL,
  AICoachMessage,
  requestAICoachResponse,
} from "../services/aiCoach";
import { useAuth } from "./useAuth";
import { aiCoachSystemPrompt } from "../data/aiGuidelines";

export interface CoachMessage {
  id: string;
  type: "ai" | "user";
  content: string;
  timestamp: string;
}

const systemPrompt: AICoachMessage = {
  role: "system",
  content: aiCoachSystemPrompt,
};

const initialMessages: CoachMessage[] = [
  {
    id: "1",
    type: "ai",
    content:
      "Hi! I'm here to support you. Share how you're feeling today and we'll plan a next step.",
    timestamp: "Just now",
  },
];

const toAICoachMessages = (messages: CoachMessage[]): AICoachMessage[] => [
  systemPrompt,
  ...messages.map((message) => ({
    role: message.type === "user" ? "user" : "assistant",
    content: message.content,
  })),
];

export function useAICoach() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CoachMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [lastModel, setLastModel] = useState(AI_COACH_MODEL);
  const allowPersonalization = user?.settings?.aiDataUse !== false;

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const userMessage: CoachMessage = {
        id: Date.now().toString(),
        type: "user",
        content: trimmed,
        timestamp: "Just now",
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsThinking(true);

      try {
        const response = await requestAICoachResponse(
          toAICoachMessages(nextMessages),
          allowPersonalization ? { userId: user?.id } : undefined
        );

        setLastModel(response.model);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            type: "ai",
            content: response.content,
            timestamp: "Just now",
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            type: "ai",
            content:
              "I'm having trouble reaching the coach service right now. Please try again in a moment.",
            timestamp: "Just now",
          },
        ]);
      } finally {
        setIsThinking(false);
      }
    },
    [messages, user, allowPersonalization]
  );

  return {
    messages,
    isThinking,
    lastModel,
    sendMessage,
  };
}

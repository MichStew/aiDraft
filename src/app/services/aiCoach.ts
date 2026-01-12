export const AI_COACH_ENDPOINT = import.meta.env.VITE_AI_COACH_ENDPOINT ?? "";
export const AI_COACH_MODEL = import.meta.env.VITE_AI_COACH_MODEL ?? "gpt-4o";

export type AICoachRole = "system" | "user" | "assistant";

export interface AICoachMessage {
  role: AICoachRole;
  content: string;
}

export interface AICoachResponse {
  content: string;
  model: string;
  provider: string;
}

const fallbackResponses = [
  "Based on your patterns, I notice you tend to use your device more during social situations. Consider gum or mints as a simple alternative.",
  "You're making strong progress. Your average daily usage has dropped over the past two weeks. Keep going.",
  "Evening usage is higher, which is common when stress builds. Try a 4-7-8 breathing cycle: in for 4, hold 7, out for 8.",
  "Your morning sessions look most consistent. A short meditation before work could reduce early cravings.",
];

const pickFallbackResponse = () =>
  fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

export async function requestAICoachResponse(
  messages: AICoachMessage[],
  metadata?: { userId?: string }
): Promise<AICoachResponse> {
  if (!AI_COACH_ENDPOINT) {
    return {
      content: pickFallbackResponse(),
      model: AI_COACH_MODEL,
      provider: "local-fallback",
    };
  }

  const response = await fetch(AI_COACH_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_COACH_MODEL,
      messages,
      userId: metadata?.userId,
    }),
  });

  if (!response.ok) {
    throw new Error("coach request failed");
  }

  const data = (await response.json()) as {
    content?: string;
    message?: string;
    model?: string;
    provider?: string;
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content =
    data.content ??
    data.message ??
    data.choices?.[0]?.message?.content ??
    pickFallbackResponse();

  return {
    content,
    model: data.model ?? AI_COACH_MODEL,
    provider: data.provider ?? "api",
  };
}

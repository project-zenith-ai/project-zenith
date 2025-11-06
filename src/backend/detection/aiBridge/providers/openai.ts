import OpenAI from "openai";
import { AIProvider, AIResponse } from "../types";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openAIProvider: AIProvider = {
  name: "OpenAI GPT-5 Nano (Flex)",
  async analyzeText(text: string): Promise<AIResponse> {
    try {
      const response = await client.chat.completions.create({
        model: "gpt-5-nano",
        service_tier: "flex",
        messages: [
          {
            role: "system",
            content:
              "You are an AI detector. Return a JSON object ONLY in the form { aiLikely: boolean, confidence: number, reasoning: string } based on whether the given text seems AI-written.",
          },
          {
            role: "user",
            content: `Text to analyze:\n\n${text}`,
          },
        ],
        temperature: 0.3,
      });

      const rawContent = response.choices?.[0]?.message?.content?.trim() ?? "";

      let aiLikely = false;
      let confidence = 0.5;
      let reasoning = rawContent;

      try {
        const parsed = JSON.parse(rawContent);
        aiLikely = parsed.aiLikely ?? false;
        confidence = parsed.confidence ?? confidence;
        reasoning = parsed.reasoning ?? reasoning;
      } catch {
        // Fallback for non-JSON replies
        if (/ai/i.test(rawContent) && !/human/i.test(rawContent)) aiLikely = true;
        if (/human/i.test(rawContent) && !/ai/i.test(rawContent)) aiLikely = false;
      }

      return {
        provider: "OpenAI GPT-5 Nano Flex",
        aiLikely,
        confidence,
        reasoning,
        rawOutput: response,
      };
    } catch (err) {
      console.error("[OpenAIProvider] Error:", err);
      return {
        provider: "OpenAI GPT-5 Nano Flex",
        aiLikely: false,
        confidence: 0.5,
        reasoning: "Error or unavailable — defaulting to neutral.",
        rawOutput: err,
      };
    }
  },
};
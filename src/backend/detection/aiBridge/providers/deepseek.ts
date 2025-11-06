import { AIProvider, AIResponse } from "../types";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" });

export const deepseekProvider: AIProvider = {
  name: "DeepSeek AI",
  async analyzeText(text: string): Promise<AIResponse> {
    try {
      const response = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: `Respond in JSON: { "aiLikely": boolean, "confidence": number, "reasoning": string }. Text: """${text}"""` }],
      });

      const rawOutput = response.choices?.[0]?.message?.content ?? "";

      let aiLikely = false;
      let confidence = 0.5;
      let reasoning = rawOutput;

      try {
        const parsed = JSON.parse(rawOutput);
        aiLikely = parsed.aiLikely ?? false;
        confidence = parsed.confidence ?? 0.5;
        reasoning = parsed.reasoning ?? reasoning;
      } catch {
        const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          aiLikely = parsed.aiLikely ?? false;
          confidence = parsed.confidence ?? 0.5;
          reasoning = parsed.reasoning ?? reasoning;
        } else {
          reasoning = rawOutput.slice(0, 300);
        }
      }

      const humanLikely = 1 - confidence;

      return { provider: "DeepSeek AI", aiLikely, humanLikely, confidence, reasoning, rawOutput };
    } catch (err: any) {
      console.error("[DeepSeekProvider] Error:", err);
      return { provider: "DeepSeek AI", aiLikely: false, humanLikely: 0.5, confidence: 0.5, reasoning: "Failed to get response.", rawOutput: err };
    }
  },
};
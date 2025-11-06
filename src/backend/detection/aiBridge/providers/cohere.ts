import { AIProvider, AIResponse } from "../types";
import { CohereClientV2 } from "cohere-ai";

const client = new CohereClientV2({ token: process.env.COHERE_API_KEY });

export const cohereProvider: AIProvider = {
  name: "Cohere Command-A-03",
  async analyzeText(text: string): Promise<AIResponse> {
    try {
      const response = await client.chat({
        model: "command-a-03-2025",
        messages: [{ role: "user", content: `You are an AI detector. Respond in JSON: { "aiLikely": boolean, "confidence": number, "reasoning": string }. Text: """${text}"""` }],
        maxTokens: 200,
      });

      let rawOutput = "";
      if (Array.isArray(response.message.content)) {
        rawOutput = response.message.content
          .map((c: any) => (typeof c.text === "string" ? c.text : ""))
          .join(" ");
      } else if (typeof response.message.content === "string") {
        rawOutput = response.message.content;
      }

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

      return { provider: "Cohere Command-A-03", aiLikely, humanLikely, confidence, reasoning, rawOutput };
    } catch (err: any) {
      console.error("[CohereProvider] Error:", err);
      return { provider: "Cohere Command-A-03", aiLikely: false, humanLikely: 0.5, confidence: 0.5, reasoning: "Failed to get response.", rawOutput: err };
    }
  },
};
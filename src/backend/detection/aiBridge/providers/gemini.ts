import { AIProvider, AIResponse } from "../types";
import { GoogleGenAI } from "@google/genai";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiProvider: AIProvider = {
  name: "Gemini 2.5 Flash (Google)",
  async analyzeText(text: string): Promise<AIResponse> {
    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `
You are an AI detection model. Respond ONLY in JSON:
{ "aiLikely": boolean, "confidence": number (0 to 1), "reasoning": string }
Text: """${text}"""
        `,
      });
      
      // Collect all text content from candidates
      const rawOutput = response.candidates
        ?.map(candidate => {
          const parts = candidate.content?.parts ?? [];
          return parts.map(p => p.text).join("\n");
        })
        .join("\n") ?? "";
      
      const cleanedOutput = rawOutput.trim();

      // Default values
      let aiLikely = false;
      let confidence = 0.5;
      let reasoning = cleanedOutput || "No response from Gemini";

      // Try JSON parsing
      try {
        const parsed = JSON.parse(cleanedOutput);
        aiLikely = !!parsed.aiLikely;
        confidence = Number(parsed.confidence ?? 0.5);
        reasoning = parsed.reasoning ?? reasoning;
      } catch {
        // Fallback: extract JSON from text if possible
        const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            aiLikely = !!parsed.aiLikely;
            confidence = Number(parsed.confidence ?? 0.5);
            reasoning = parsed.reasoning ?? reasoning;
          } catch {
            // keep default
          }
        }
      }

      const humanLikely = 1 - confidence;

      return { provider: "Gemini 2.5 Flash", aiLikely, humanLikely, confidence, reasoning, rawOutput };
    } catch (err: any) {
      console.error("[GeminiProvider] Error:", err);
      return { provider: "Gemini 2.5 Flash", aiLikely: false, humanLikely: 0.5, confidence: 0.5, reasoning: "Failed to get response.", rawOutput: err };
    }
  },
};
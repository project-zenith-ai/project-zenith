import { AIProvider, AIResponse } from "../types";

export const zephyrProvider: AIProvider = {
  name: "Zephyr 7B Beta (Hugging Face)",
  async analyzeText(text: string): Promise<AIResponse> {
    const Key = process.env.HUGGINGFACE_API_KEY;
    if (!Key) throw new Error("Missing HUGGINGFACE_API_KEY");

    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/HuggingFaceH4/zephyr-7b-beta",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `
You are an AI detection model. Analyze the following text and respond **only** in JSON format:

{
  "aiLikely": boolean,
  "confidence": number (0–1),
  "reasoning": string
}

Text:
"""${text}"""
          `,
          parameters: { max_new_tokens: 150, temperature: 0.3 },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Zephyr API error: ${response.statusText}`);
    }

    const data = await response.json();
    const rawOutput = data?.[0]?.generated_text ?? "";
    let aiLikely = false;
    let confidence = 0.5;
    let reasoning = rawOutput;

    try {
      const parsed = JSON.parse(rawOutput);
      aiLikely = parsed.aiLikely ?? false;
      confidence = parsed.confidence ?? 0.5;
      reasoning = parsed.reasoning ?? reasoning;
    } catch {
      // fallback heuristic if not clean JSON
      if (/ai/i.test(rawOutput) && !/human/i.test(rawOutput)) aiLikely = true;
      if (/human/i.test(rawOutput) && !/ai/i.test(rawOutput)) aiLikely = false;
      reasoning = rawOutput.slice(0, 300);
    }

    return {
      provider: "Zephyr 7B Beta",
      confidence,
      aiLikely,
      reasoning,
      rawOutput: data,
    };
  },
};
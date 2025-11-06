import { AIProvider, AIResponse } from "../types";

export const groqProvider: AIProvider = {
  name: "Groq",
  async analyzeText(text: string): Promise<AIResponse> {
    const Key = process.env.GROQ_API_KEY;
    if (!Key) throw new Error("Missing GROQ_API_KEY");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are an AI text analysis expert. Determine if a text was written by an AI or a human. Return JSON only in the form { aiLikely: boolean, confidence: number, reasoning: string }.",
          },
          { role: "user", content: `Analyze this text:\n\n${text}` },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    });

    if (!res.ok) throw new Error(`Groq API error: ${res.statusText}`);
    const data = await res.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() ?? "";

    let aiLikely = false;
    let confidence = 0.5;
    let reasoning = rawContent;

    try {
      const parsed = JSON.parse(rawContent);
      aiLikely = parsed.aiLikely ?? false;
      confidence = parsed.confidence ?? confidence;
      reasoning = parsed.reasoning ?? reasoning;
    } catch {
      if (/ai/i.test(rawContent) && !/human/i.test(rawContent)) {
        aiLikely = true;
        confidence = 0.8;
      } else if (/human/i.test(rawContent) && !/ai/i.test(rawContent)) {
        aiLikely = false;
        confidence = 0.2;
      }
    }

    const humanLikely = 1 - confidence;

    return {
      provider: "Groq",
      aiLikely,
      humanLikely,
      confidence,
      reasoning,
      rawOutput: data,
    };
  },
};
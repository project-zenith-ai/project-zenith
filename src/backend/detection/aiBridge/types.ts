export interface AIResponse {
  provider: string;               // e.g. "OpenAI", "Claude", "Groq"
  aiLikely: boolean;              // true if the model thinks it's AI-written
  confidence: number;             // 0–1 probability
  reasoning: string;              // explanation
  rawOutput?: unknown;            // full provider response
}

export interface AIProvider {
  name: string;
  model?: string;                 // optional: model name (e.g. "gpt-5-nano", "mixtral")
  analyzeText: (text: string) => Promise<AIResponse>;
}

export interface CouncilVerdict {
  consensusScore: number;         // averaged or weighted confidence
  unanimous: boolean;             // true if all agree strongly
  reasoning: string;              // summarized council reasoning
  individualVotes: AIResponse[];  // all model outputs
}
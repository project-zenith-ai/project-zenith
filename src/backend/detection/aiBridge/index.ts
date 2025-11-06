import { runCouncilAnalysis } from "./council";
import { CouncilVerdict } from "./types";

/**
 * Main entry point for the AI Bridge layer.
 * The Council runs all active models and returns a unified verdict.
 */
export async function analyzeTextWithCouncil(text: string): Promise<CouncilVerdict> {
  try {
    const verdict = await runCouncilAnalysis(text);

    return verdict;
  } catch (err) {
    console.error("[AI Bridge] Council analysis failed:", err);
    return {
      consensusScore: 0.5,
      unanimous: false,
      reasoning: "Council unavailable — fallback to neutral result.",
      individualVotes: [],
    };
  }
}
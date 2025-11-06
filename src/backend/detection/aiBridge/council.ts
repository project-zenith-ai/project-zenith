import { deepseekProvider } from "./providers/deepseek";
import { geminiProvider } from "./providers/gemini";
import { cohereProvider } from "./providers/cohere";
import { groqProvider } from "./providers/groq";
import { openAIProvider } from "./providers/openai";
import { CouncilVerdict, AIResponse } from "./types";

export async function runCouncilAnalysis(text: string): Promise<CouncilVerdict> {
  const councilMembers = [
    { codename: "The Diplomat", provider: deepseekProvider },
    { codename: "The Analyst", provider: geminiProvider },
    { codename: "The Orator", provider: cohereProvider },
    { codename: "The Strategist", provider: groqProvider },
    { codename: "The Visionary", provider: openAIProvider },
  ];

  const individualVotes: AIResponse[] = [];

  for (const member of councilMembers) {
    try {
      const res = await member.provider.analyzeText(text);
      individualVotes.push({
        provider: member.codename,
        aiLikely: res.aiLikely,
        humanLikely: 1 - res.confidence,
        confidence: res.confidence,
        reasoning: res.reasoning,
        rawOutput: res.rawOutput,
      });
    } catch (err) {
      console.warn(`[Council] ${member.codename} failed:`, err);
    }
  }

  // If no valid responses, fallback
  if (individualVotes.length === 0) {
    return {
      consensusScore: 0.5,
      unanimous: false,
      reasoning: "All council members are offline or failed to respond.",
      individualVotes: [],
    };
  }

  // Compute consensus
  const avgConfidence =
    individualVotes.reduce((sum, v) => sum + v.confidence, 0) / individualVotes.length;
  const aiVotes = individualVotes.filter(v => v.aiLikely).length;
  const humanVotes = individualVotes.length - aiVotes;

  const unanimous = aiVotes === individualVotes.length || humanVotes === individualVotes.length;

  const consensusScore = unanimous ? avgConfidence * (aiVotes / individualVotes.length) : 0;

  // Summarize council reasoning
  const reasoningSummary = summarizeCouncil(individualVotes);

  // If not unanimous, heuristics should activate (score 0.5 placeholder)
  return {
    consensusScore: unanimous ? consensusScore : 0.5,
    unanimous,
    reasoning: reasoningSummary,
    individualVotes,
  };
}

function summarizeCouncil(votes: AIResponse[]): string {
  const aiSide = votes.filter(v => v.aiLikely);
  const humanSide = votes.filter(v => !v.aiLikely);

  const aiNames = aiSide.map(v => v.provider).join(", ");
  const humanNames = humanSide.map(v => v.provider).join(", ");

  let summary = "";

  if (aiSide.length === 0) {
    summary = `All council members (${humanNames}) agree this text is human-written.`;
  } else if (humanSide.length === 0) {
    summary = `All council members (${aiNames}) agree this text is AI-generated.`;
  } else {
    summary = `${aiNames} suspect AI generation, while ${humanNames} lean toward human authorship.`;
  }

  const reasoningParagraph = votes
    .map(v => `(${v.provider}): ${v.reasoning}`)
    .join(" | ");

  return `${summary} Council reasoning — ${reasoningParagraph}`;
}
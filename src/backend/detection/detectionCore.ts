import { normalizeText, validateText } from './inputHandler';
import { extractTextFeatures, TextFeatures } from './featureExtractor';
import { analyzeTextWithCouncil } from './aiBridge';
import { CouncilVerdict, AIResponse } from './aiBridge/types';

export interface DetectionResult {
  isAI: boolean;
  probability: number;            // AI likelihood 0–1
  humanProbability: number;       // Human likelihood 0–1
  features: TextFeatures;
  explanation: string;            // heuristic or fallback explanation
  featureContributions: { [key in keyof TextFeatures]?: number };
  aiReasoning?: string;           // council reasoning (if available)
  councilConsensus?: string;      // council summary
  councilMembers?: AIResponse[];  // individual votes
}

export async function runDetection(rawText: string): Promise<DetectionResult> {
  if (!validateText(rawText)) throw new Error('Invalid input text.');

  const text = normalizeText(rawText);
  const features = extractTextFeatures(text);

  // --- Heuristic weights
  const weights: Partial<Record<keyof TextFeatures, number>> = {
    avgWordLength: 0.1,
    lexicalDiversity: -0.2,
    sentenceCount: 0.05,
    avgSentenceLength: 0.1,
    stopwordRatio: -0.15,
    burstiness: -0.4,
    perplexityProxy: -0.3,
  };

  let score = 0;
  const featureContributions: Partial<Record<keyof TextFeatures, number>> = {};

  for (const key in weights) {
    const k = key as keyof TextFeatures;
    const w = weights[k] ?? 0;
    const contribution = (features[k] as number) * w;
    featureContributions[k] = contribution;
    score += contribution;
  }

  let heuristicProbability = 1 / (1 + Math.exp(-score));
  heuristicProbability = Math.min(Math.max(heuristicProbability, 0), 1);

  // --- Call AI Council
  let councilVerdict: CouncilVerdict | null = null;
  try {
    councilVerdict = await analyzeTextWithCouncil(text);
  } catch (err) {
    console.warn('[DetectionCore] AI Council unavailable, using heuristic only:', err);
  }

  const councilAvailable = !!councilVerdict?.individualVotes?.length;

  // --- Compute final blended probabilities
  const aiWeight = 0.5;
  const councilScore = councilAvailable
    ? councilVerdict!.consensusScore
    : heuristicProbability;

  const blendedProbability = heuristicProbability * (1 - aiWeight) + councilScore * aiWeight;

  const aiConfidence = councilAvailable ? councilVerdict!.consensusScore : blendedProbability;
  const humanConfidence = 1 - aiConfidence;

  return {
    isAI: aiConfidence > 0.6,
    probability: aiConfidence,
    humanProbability: humanConfidence,
    features,
    featureContributions,
    aiReasoning: councilVerdict?.reasoning ?? undefined,
    councilConsensus: councilVerdict?.reasoning ?? undefined,
    councilMembers: councilVerdict?.individualVotes ?? [],
    explanation: councilAvailable
      ? '' // explanation handled in postProcessor if council exists
      : `Heuristic linguistic markers applied. Feature impacts — ${Object.entries(featureContributions)
          .map(([f, v]) => `${f}: ${v?.toFixed(3)}`)
          .join(', ')}.`,
  };
}
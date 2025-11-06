import { normalizeText, validateText } from './inputHandler';
import { extractTextFeatures, TextFeatures } from './featureExtractor';
import { runAICouncil } from './aiBridge/index';

export interface DetectionResult {
  isAI: boolean;
  probability: number; // 0–1
  features: TextFeatures;
  explanation: string;
  featureContributions: { [key in keyof TextFeatures]?: number };
  aiReasoning?: string; // optional AI explanation
}

export async function runDetection(rawText: string): Promise<DetectionResult> {
  if (!validateText(rawText)) throw new Error('Invalid input text.');

  const text = normalizeText(rawText);
  const features = extractTextFeatures(text);

  // Heuristic weights (v2 - tuned for balance)
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

  // Sigmoid normalization for heuristic probability
  let heuristicProbability = 1 / (1 + Math.exp(-score));
  heuristicProbability = Math.min(Math.max(heuristicProbability, 0), 1);

  // Call AI council
  let aiProbability = heuristicProbability;
  let aiReasoning = '';
  try {
    const aiResult = await runAICouncil(text, features);
    if (aiResult) {
      const aiWeight = 0.5; // blending factor, adjustable
      aiProbability = heuristicProbability * (1 - aiWeight) + aiResult.aiProbability * aiWeight;
      aiReasoning = aiResult.reasoning;
    }
  } catch (err) {
    console.warn('AI council call failed, falling back to heuristic only:', err);
  }

  // Construct explanation
  const explanationParts = Object.entries(featureContributions)
    .map(([feature, value]) => `${feature}: ${value?.toFixed(3)}`)
    .join(', ');

  return {
    isAI: aiProbability > 0.6,
    probability: aiProbability,
    features,
    featureContributions,
    explanation: `This text was analyzed using heuristic linguistic markers. Feature impacts — ${explanationParts}.`,
    aiReasoning,
  };
}
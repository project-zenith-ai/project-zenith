import { DetectionResult } from './detectionCore';

export function formatResult(result: DetectionResult) {
  // Format feature contributions for readability
  const formattedContributions = Object.entries(result.featureContributions).map(
    ([feature, value]) => ({
      feature,
      contribution: value?.toFixed(3),
    })
  );

  return {
    aiLikely: result.isAI,
    confidence: (result.probability * 100).toFixed(1) + '%',
    features: result.features,
    featureContributions: formattedContributions,
    explanation: result.explanation,
    aiReasoning: result.aiReasoning || 'No AI reasoning available.',
  };
}
import { DetectionResult } from './detectionCore';

export function formatResult(result: DetectionResult) {
  // Format feature contributions neatly
  const formattedContributions = Object.entries(result.featureContributions)
    .map(([feature, value]) => ({
      feature,
      contribution: value?.toFixed(3) ?? '0.000',
    }))
    .sort((a, b) => parseFloat(b.contribution) - parseFloat(a.contribution));

  const likelyAI = (result.probability * 100).toFixed(1);
  const likelyHuman = (result.humanProbability * 100).toFixed(1);

  // Format council members for frontend
  const councilMembers = (result.councilMembers || []).map(member => ({
    name: member.provider,
    aiLikely: member.aiLikely,
    confidence: `${(member.confidence * 100).toFixed(1)}%`,
    explanation: member.reasoning,
  }));

  // Compute main aiLikely based on majority council vote
  const aiVotes = councilMembers.filter(m => m.aiLikely).length;
  const humanVotes = councilMembers.length - aiVotes;
  const mainAiLikely = aiVotes > humanVotes;

  // Compute average council confidence for main confidence bar
  const averageCouncilConfidence = councilMembers.length
    ? councilMembers.reduce((sum, m) => sum + parseFloat(m.confidence), 0) / councilMembers.length
    : parseFloat((result.probability * 100).toFixed(1)); // fallback if council missing

  // Build overall explanation
  let finalExplanation = '';
  if (result.councilConsensus) {
    finalExplanation = `Council consensus: ${result.councilConsensus}`;
  } else if (formattedContributions.length > 0) {
    const topPositive = formattedContributions
      .filter(c => parseFloat(c.contribution) > 0)
      .slice(0, 3)
      .map(c => c.feature)
      .join(', ');
    const topNegative = formattedContributions
      .filter(c => parseFloat(c.contribution) < 0)
      .slice(0, 3)
      .map(c => c.feature)
      .join(', ');

    finalExplanation = `Top AI-like traits: ${topPositive || 'none'}. ` +
      `Top human-like traits: ${topNegative || 'none'}.`;
  }

  return {
    aiLikely: mainAiLikely,                        // majority-based flag
    confidence: `${averageCouncilConfidence.toFixed(1)}%`, // main confidence = avg council
    likelyAI: {
      label: 'Likely AI',
      confidence: `${likelyAI}%`,
      value: result.probability,
    },
    likelyHuman: {
      label: 'Likely Human',
      confidence: `${likelyHuman}%`,
      value: result.humanProbability,
    },
    features: {
      length: result.features.textLength,
      wordCount: result.features.wordCount,
      avgWordLength: result.features.avgWordLength,
    },
    featureContributions: formattedContributions,
    explanation: finalExplanation,
    councilConsensus: result.councilConsensus || null,
    councilMembers,
  };
}
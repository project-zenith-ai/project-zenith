export interface TextFeatures {
  textLength: number;
  wordCount: number;
  avgWordLength: number;
  lexicalDiversity: number;
  sentenceCount: number;
  avgSentenceLength: number;
  stopwordRatio: number;
  burstiness: number;
  perplexityProxy: number;
}

export function extractTextFeatures(text: string): TextFeatures {
  const words = text.split(/\s+/).filter(Boolean);
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;

  const avgWordLength =
    words.reduce((sum, w) => sum + w.length, 0) / wordCount || 0;

  const uniqueWords = new Set(words.map((w) => w.toLowerCase()));
  const lexicalDiversity = uniqueWords.size / wordCount || 0;

  const sentenceLengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const avgSentenceLength =
    sentenceLengths.reduce((sum, len) => sum + len, 0) / sentenceCount;

  const mean = avgSentenceLength;
  const variance =
    sentenceLengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) /
    sentenceCount;
  const burstiness = Math.sqrt(variance) / (mean || 1);

  const stopwords = ["the", "is", "in", "and", "to", "of", "a", "that", "it", "on"];
  const stopwordCount = words.filter((w) =>
    stopwords.includes(w.toLowerCase())
  ).length;
  const stopwordRatio = stopwordCount / wordCount || 0;

  const perplexityProxy =
    lexicalDiversity * (1 - stopwordRatio) * (burstiness + 0.5);

  return {
    textLength: text.length,
    wordCount,
    avgWordLength,
    lexicalDiversity,
    sentenceCount,
    avgSentenceLength,
    stopwordRatio,
    burstiness,
    perplexityProxy,
  };
}

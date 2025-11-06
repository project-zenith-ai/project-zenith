import { AIProvider } from './types';

// Import provider implementations (to be created)
import { openAIProvider } from './providers/openai';
import { groqProvider } from './providers/groq';
import { geminiProvider } from './providers/gemini';
import { cohereProvider } from './providers/cohere';
import { zephyrProvider } from './providers/zephyr';

export const providers: AIProvider[] = [
  openAIProvider,
  groqProvider,
  geminiProvider,
  cohereProvider,
  zephyrProvider,
];

// Helper to call all providers
export async function queryAllProviders(text: string) {
  const results = await Promise.allSettled(
    providers.map(p => p.analyzeText(text))
  );

  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<any>).value);
}
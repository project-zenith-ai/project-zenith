import type { NextApiRequest, NextApiResponse } from 'next';
import { runDetection } from '../../backend/detection/detectionCore';
import { formatResult } from '../../backend/detection/postProcessor';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing "text" in request body.' });

    // Run detection with AI council
    const result = await runDetection(text);

    // Format output (includes structured councilMembers array)
    const formatted = formatResult(result);

    return res.status(200).json(formatted);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during text analysis:', error.message);
      return res.status(500).json({ error: error.message });
    } else {
      console.error('Unknown error during text analysis:', error);
      return res.status(500).json({ error: 'Failed to analyze text' });
    }
  }
}
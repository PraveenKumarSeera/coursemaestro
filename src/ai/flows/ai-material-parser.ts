
'use server';
/**
 * @fileOverview This file defines the AI Material Parser flow.
 * It takes a file as input and extracts the text content.
 *
 * @exports parseMaterial - The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import {
  MaterialParserInputSchema,
  MaterialParserOutputSchema,
  type MaterialParserInput,
  type MaterialParserOutput,
} from '@/lib/ai-types';

export async function parseMaterial(
  input: MaterialParserInput
): Promise<MaterialParserOutput> {
  const { text } = await ai.generate({
    prompt: `Extract the text content from the following document.
  
  Document:
  {{media url=${input.fileDataUri}}}

  Generate the response in the specified JSON format.
  `,
    model: googleAI.model('gemini-1.5-flash-latest'),
  });

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error('Failed to parse AI response:', text);
    throw new Error('The AI returned an invalid response. Please try again.');
  }
}

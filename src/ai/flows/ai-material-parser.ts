
'use server';
/**
 * @fileOverview This file defines the AI Material Parser flow.
 * It takes a file as input and extracts the text content.
 *
 * @exports parseMaterial - The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { MaterialParserInputSchema, MaterialParserOutputSchema, type MaterialParserInput } from '@/lib/ai-types';

export const materialParserFlow = ai.defineFlow(
  {
    name: 'materialParserFlow',
    inputSchema: MaterialParserInputSchema,
    outputSchema: MaterialParserOutputSchema,
  },
  async (input: MaterialParserInput) => {
    const { text } = await ai.generate({
      prompt: `Extract the text content from the following document.
  
  Document:
  {{media url=${input.fileDataUri}}}

  Generate the response in the specified JSON format.
  `,
      model: googleAI.model('gemini-1.0-pro'),
    });
    
    return JSON.parse(text);
  }
);

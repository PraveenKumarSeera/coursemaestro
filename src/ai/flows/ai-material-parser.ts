
'use server';
/**
 * @fileOverview This file defines the AI Material Parser flow.
 * It takes a file as input and extracts the text content.
 *
 * @exports parseMaterial - The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { MaterialParserInputSchema, MaterialParserOutputSchema, type MaterialParserInput, type MaterialParserOutput } from '@/lib/ai-types';

export async function parseMaterial(
  input: MaterialParserInput
): Promise<MaterialParserOutput> {
  const result = await materialParserFlow(input);
  if (typeof result === 'string') {
    try {
      const parsed = JSON.parse(result);
      return { textContent: parsed.textContent };
    } catch (e) {
      throw new Error('Failed to parse document content from AI.');
    }
  }
  return result;
}


const materialParserFlow = ai.defineFlow(
  {
    name: 'materialParserFlow',
    inputSchema: MaterialParserInputSchema,
    outputSchema: MaterialParserOutputSchema,
  },
  async (input) => {
    const { text } = await ai.generate({
      prompt: `Extract the text content from the following document.
  
  Document:
  {{media url=${input.fileDataUri}}}

  Generate the response in the specified JSON format.
  `,
      model: googleAI.model('gemini-1.0-pro'),
    });
    
    return text;
  }
);

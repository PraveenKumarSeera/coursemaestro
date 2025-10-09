
'use server';
/**
 * @fileOverview This file defines the AI Material Parser flow.
 * It takes a file as input and extracts the text content.
 *
 * @exports parseMaterial - The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { MaterialParserInputSchema, MaterialParserOutputSchema, type MaterialParserInput, type MaterialParserOutput } from '@/lib/ai-types';

export async function parseMaterial(
  input: MaterialParserInput
): Promise<MaterialParserOutput> {
  return await materialParserFlow(input);
}


const materialParserFlow = ai.defineFlow(
  {
    name: 'materialParserFlow',
    inputSchema: MaterialParserInputSchema,
    outputSchema: MaterialParserOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `Extract the text content from the following document.
  
  Document:
  {{media url=${input.fileDataUri}}}
  `,
      model: 'gemini-1.5-flash-latest',
      output: {
        schema: MaterialParserOutputSchema,
      },
    });
    
    if (!output) {
      throw new Error("Failed to parse document content.");
    }
    return { textContent: output.textContent };
  }
);

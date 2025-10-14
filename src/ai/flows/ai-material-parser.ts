
'use server';
/**
 * @fileOverview This file defines the AI Material Parser flow.
 * It takes a file as input and extracts the text content.
 *
 * @exports parseMaterial - The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import {
  MaterialParserInputSchema,
  MaterialParserOutputSchema,
  type MaterialParserInput,
  type MaterialParserOutput,
} from '@/lib/ai-types';
import { z } from 'zod';

const prompt = ai.definePrompt(
    {
        name: 'materialParserPrompt',
        input: { schema: MaterialParserInputSchema },
        output: { schema: MaterialParserOutputSchema },
        model: 'gemini-1.5-flash-latest',
        prompt: `Extract the text content from the following document.
  
        Document:
        {{media url=fileDataUri}}

        Generate the response in the specified JSON format.
        `,
    },
);

const materialParserFlow = ai.defineFlow(
  {
    name: 'materialParserFlow',
    inputSchema: MaterialParserInputSchema,
    outputSchema: MaterialParserOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI returned an invalid response. Please try again.");
    }
    return output;
  }
);


export async function parseMaterial(
  input: MaterialParserInput
): Promise<MaterialParserOutput> {
  return materialParserFlow(input);
}

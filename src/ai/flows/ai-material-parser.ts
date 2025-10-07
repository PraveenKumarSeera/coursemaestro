
'use server';
/**
 * @fileOverview This file defines the AI Material Parser flow.
 * It takes a file as input and extracts the text content.
 *
 * @exports parseMaterial - The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MaterialParserInputSchema = z.object({
  fileDataUri: z.string().describe("A document file (PDF, DOCX, PPTX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const MaterialParserOutputSchema = z.object({
  textContent: z.string(),
});

export async function parseMaterial(
  input: z.infer<typeof MaterialParserInputSchema>
): Promise<z.infer<typeof MaterialParserOutputSchema>> {
  return materialParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'materialParserPrompt',
  input: { schema: MaterialParserInputSchema },
  output: { schema: MaterialParserOutputSchema },
  prompt: `Extract the text content from the following document.
  
  Document:
  {{media url=fileDataUri}}
  `,
});

export const materialParserFlow = ai.defineFlow(
  {
    name: 'materialParserFlow',
    inputSchema: MaterialParserInputSchema,
    outputSchema: MaterialParserOutputSchema,
  },
  async (input) => {
    // The Gemini model can handle text extraction from various formats directly.
    const { output } = await prompt(input);
    if (!output) {
      throw new Error("Failed to parse document content.");
    }
    return { textContent: output.textContent };
  }
);


'use server';
/**
 * @fileOverview This file defines the AI Material Parser flow.
 * It takes a file as input and extracts the text content.
 *
 * @exports parseMaterial - The main function to call the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import mammoth from 'mammoth';

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
    const { mimeType, data } = extractFromDataUri(input.fileDataUri);
    let textContent = '';

    if (mimeType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        const buffer = Buffer.from(data, 'base64');
        const result = await mammoth.extractRawText({ buffer });
        textContent = result.value;
    } else {
         const { output } = await prompt(input);
         if (!output) {
            throw new Error("Failed to parse document content.");
         }
         textContent = output.textContent;
    }
    
    return { textContent };
  }
);


function extractFromDataUri(dataUri: string): { mimeType: string, data: string } {
    const parts = dataUri.split(',');
    const meta = parts[0].split(';');
    const mimeType = meta[0].split(':')[1];
    const data = parts[1];
    return { mimeType, data };
}

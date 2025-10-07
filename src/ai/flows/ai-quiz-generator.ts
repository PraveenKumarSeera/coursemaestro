'use server';
/**
 * @fileOverview This file defines the AI Quiz Generator flow.
 * It takes course material as input and generates a quiz and a set of flashcards.
 *
 * @exports generateQuizAndFlashcards - The main function to call the flow.
 * @exports Quiz - The type definition for the generated quiz.
 * @exports Flashcard - The type definition for a single flashcard.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import mammoth from 'mammoth';

const QuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('An array of possible answers.'),
  answer: z.string().describe('The correct answer from the options.'),
  type: z.literal('multiple-choice').describe('The type of the question.'),
});

const FlashcardSchema = z.object({
  term: z.string().describe('The term or concept for the flashcard.'),
  definition: z.string().describe('The definition or explanation of the term.'),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;


const QuizSchema = z.object({
  title: z.string().describe('A suitable title for the quiz based on the material.'),
  questions: z.array(QuestionSchema).describe('An array of quiz questions.'),
});
export type Quiz = z.infer<typeof QuizSchema>;

const QuizGeneratorInputSchema = z.object({
    courseMaterial: z.string().min(50).optional().describe('The course notes or material to generate a quiz from.'),
    fileDataUri: z.string().optional().describe("A document file (PDF, DOCX, PPTX) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const QuizGeneratorOutputSchema = z.object({
  quiz: QuizSchema,
  flashcards: z.array(FlashcardSchema).describe('An array of flashcards with key terms.'),
});

export async function generateQuizAndFlashcards(
  input: z.infer<typeof QuizGeneratorInputSchema>
): Promise<z.infer<typeof QuizGeneratorOutputSchema>> {
  return quizGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'quizGeneratorPrompt',
  input: { schema: QuizGeneratorInputSchema },
  output: { schema: QuizGeneratorOutputSchema },
  prompt: `You are an AI assistant that creates educational materials for teachers.
  Based on the provided course material, generate a quiz and a set of flashcards.

  The quiz should contain 5-7 multiple-choice questions that test the key concepts from the material.
  For each question, provide 4 options and clearly indicate the correct answer.

  The flashcards should identify and define 6-8 important keywords or concepts from the material.

  Course Material:
  '''
  {{#if courseMaterial}}{{courseMaterial}}{{/if}}
  {{#if fileDataUri}}{{media url=fileDataUri}}{{/if}}
  '''

  Generate the quiz and flashcards in the specified JSON format.
  `,
});

const quizGeneratorFlow = ai.defineFlow(
  {
    name: 'quizGeneratorFlow',
    inputSchema: QuizGeneratorInputSchema,
    outputSchema: QuizGeneratorOutputSchema,
  },
  async (input) => {
    let processedInput = { ...input };

    if (input.fileDataUri) {
        const { mimeType, data } = extractFromDataUri(input.fileDataUri);
        
        if (mimeType.includes('vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            const buffer = Buffer.from(data, 'base64');
            const result = await mammoth.extractRawText({ buffer });
            processedInput.courseMaterial = result.value;
            delete processedInput.fileDataUri; // Use the extracted text instead
        }
    }

    const { output } = await prompt(processedInput);
    if (!output) {
        throw new Error("Failed to generate quiz content.");
    }
    return output;
  }
);


function extractFromDataUri(dataUri: string): { mimeType: string, data: string } {
    const parts = dataUri.split(',');
    const meta = parts[0].split(';');
    const mimeType = meta[0].split(':')[1];
    const data = parts[1];
    return { mimeType, data };
}

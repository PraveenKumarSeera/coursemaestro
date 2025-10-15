
'use server';
/**
 * @fileOverview A general-purpose AI chatbot using Groq.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { generate } from 'genkit/ai';

const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string(),
    })
  ).describe('The history of the conversation so far.'),
  courseContext: z.string().optional().describe('Optional context about the current course.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  content: z.string().describe('The AI\'s response.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
    return chatFlow(input);
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const { history, courseContext } = input;
    
    let systemPrompt = `You are "Maestro," an AI-powered study assistant for the CourseMaestro platform. You are helpful, encouraging, and an expert in all academic subjects.
    
    Your primary function is to help students understand their course material.
    - If the user provides course context, prioritize answering questions based on that context.
    - If the question is outside the provided context, you can use your general knowledge.
    - Always maintain a positive and supportive tone.
    - Keep your answers concise and easy to understand.
    - You can format your responses with Markdown.`;

    if(courseContext) {
        systemPrompt += `\n\n## Course Context\nThe user is currently viewing a page related to the following course material:\n\`\`\`\n${courseContext}\n\`\`\``
    }

    const response = await generate({
      model: 'groq/llama3-8b-8192',
      history,
      config: {
        temperature: 0.7,
      },
      system: systemPrompt,
    });

    return {
      content: response.text,
    };
  }
);


'use server';

import { aiStudyAssistant } from '@/ai/flows/ai-study-assistant';
import {z} from 'zod';

export const AiStudyAssistantInputSchema = z.object({
  courseMaterial: z
    .string()
    .describe('The course material to be used as context for answering questions.'),
  studentQuestion: z.string().describe('The question from the student about the course material.'),
});
export type AiStudyAssistantInput = z.infer<typeof AiStudyAssistantInputSchema>;

export const AiStudyAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question, based on the course material.'),
});
export type AiStudyAssistantOutput = z.infer<typeof AiStudyAssistantOutputSchema>;


type AiState = {
  answer: string;
  question: string;
};

export async function askAI(
  prevState: AiState,
  formData: FormData
): Promise<AiState> {
  const studentQuestion = formData.get('studentQuestion') as string;
  const courseMaterial = formData.get('courseMaterial') as string;

  if (!studentQuestion) {
    return {
      answer: 'Please enter a question.',
      question: '',
    };
  }
  
  if (!courseMaterial) {
    return {
        answer: 'Error: Course context is missing.',
        question: studentQuestion,
    }
  }

  try {
    const result = await aiStudyAssistant({
      courseMaterial,
      studentQuestion,
    });
    return {
      answer: result.answer,
      question: studentQuestion,
    };
  } catch (error) {
    console.error('AI assistant error:', error);
    return {
      answer: 'Sorry, I encountered an error. Please try again.',
      question: studentQuestion,
    };
  }
}

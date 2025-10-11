
'use server';

import { askStudyAssistant } from '@/ai/flows/ai-study-assistant';
import type { AiStudyAssistantInput, AiStudyAssistantOutput } from '@/lib/ai-types';

type AiState = {
  answer: string;
  question: string;
  error?: string;
};

export async function askAI(
  prevState: AiState,
  formData: FormData
): Promise<AiState> {
  const studentQuestion = formData.get('studentQuestion') as string;
  const courseMaterial = formData.get('courseMaterial') as string;

  if (!studentQuestion) {
    return {
      answer: '',
      question: '',
      error: 'Please enter a question.',
    };
  }
  
  if (!courseMaterial) {
    return {
        answer: '',
        question: studentQuestion,
        error: 'Error: Course context is missing.',
    }
  }

  // Bypass AI call and return demo data
  const demoAnswer = `This is a demo response based on the course material for "${courseMaterial.split(':')[0]}". For a real answer, this would use an AI model to analyze the course description and your question: "${studentQuestion}". The fundamental concepts of web development include HTML for structure, CSS for styling, and JavaScript for interactivity.`;

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            answer: demoAnswer,
            question: studentQuestion,
        });
    }, 1000);
  });
}

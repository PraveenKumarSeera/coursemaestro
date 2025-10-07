'use server';

import { appGuide, type AppGuideInput } from '@/ai/flows/ai-app-guide';

type AiState = {
  answer: string;
  question: string;
  history: AppGuideInput['chatHistory'];
};

export async function askAppGuide(
  prevState: AiState,
  formData: FormData
): Promise<AiState> {
  const question = formData.get('question') as string;

  if (!question) {
    return {
      ...prevState,
      answer: 'Please enter a question.',
      question: '',
    };
  }

  try {
    const result = await appGuide({
      question,
      chatHistory: prevState.history,
    });
    return {
      answer: result.answer,
      question: question,
      history: [
        ...(prevState.history || []),
        { role: 'user', content: question },
        { role: 'model', content: result.answer },
      ]
    };
  } catch (error) {
    console.error('App guide error:', error);
    return {
      answer: 'Sorry, I encountered an error. Please try again.',
      question: question,
      history: prevState.history,
    };
  }
}

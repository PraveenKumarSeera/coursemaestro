
'use server';

import { askStudyAssistant } from '@/ai/flows/ai-study-assistant';
import type { AiStudyAssistantInput, AiStudyAssistantOutput } from '@/lib/ai-types';

type AiState = {
  answer: string;
  question: string;
  error?: string;
};

const demoAnswers: { [key: string]: string } = {
  "default": "Based on the course material, a key concept is the use of 'state' to manage data that changes over time within a React component. For example, you would use state to handle user input in a form.",
  "html": "HTML stands for HyperText Markup Language. It's the standard language for creating web pages.",
  "css": "CSS (Cascading Style Sheets) is used to style and layout web pages — for example, to alter the font, color, size, and spacing of your content.",
  "javascript": "JavaScript is a programming language that enables you to create dynamically updating content, control multimedia, animate images, and much more."
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

  // Use demo data instead of calling AI
  let answer = demoAnswers.default;
  const lowerCaseQuestion = studentQuestion.toLowerCase();
  
  if (lowerCaseQuestion.includes('html')) {
    answer = demoAnswers.html;
  } else if (lowerCaseQuestion.includes('css')) {
    answer = demoAnswers.css;
  } else if (lowerCaseQuestion.includes('javascript') || lowerCaseQuestion.includes('js')) {
    answer = demoAnswers.javascript;
  }

  return new Promise(resolve => {
    setTimeout(() => {
        resolve({
            answer: answer,
            question: studentQuestion,
        });
    }, 1000);
  });
}

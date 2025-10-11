
'use server';

import type { Course } from '@/lib/types';
import type { BrainStretchPuzzle } from '@/lib/ai-types';
import { generateBrainStretches } from '@/ai/flows/ai-brain-stretch-generator';

type ActionState = {
  puzzles: BrainStretchPuzzle[] | null;
  message: string;
};

export async function generateBrainStretchesAction(
  course: Course
): Promise<ActionState> {
  if (!course) {
    return { puzzles: null, message: 'Please select a course first.' };
  }

  const courseMaterial = `${course.title}: ${course.description}`;

  // Bypass AI call and return demo data
  const demoPuzzles: BrainStretchPuzzle[] = [
    {
      type: 'analogy',
      question: 'HTML is to Structure as CSS is to ________.',
      options: ['Interactivity', 'Styling', 'Data', 'Logic'],
      answer: 'Styling',
      explanation: 'HTML provides the basic structure of a web page, while CSS is used to control the visual presentation and styling.',
    },
    {
      type: 'odd-one-out',
      question: 'Which of the following does not belong?',
      options: ['useState', 'useEffect', 'useContext', '<a>'],
      answer: '<a>',
      explanation: 'useState, useEffect, and useContext are all React Hooks used for managing state and side effects, whereas <a> is a standard HTML anchor tag for hyperlinks.',
    },
    {
      type: 'anagram',
      question: 'Unscramble this key web development term: "tcare"',
      options: ['React', 'Trace', 'Caret', 'Create'],
      answer: 'React',
      explanation: 'React is a popular JavaScript library for building user interfaces, which is a key part of modern web development.',
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        puzzles: demoPuzzles,
        message: 'Puzzles generated successfully.',
      });
    }, 1500);
  });
}

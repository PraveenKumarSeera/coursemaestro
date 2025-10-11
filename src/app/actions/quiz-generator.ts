
'use server';

import { generateQuizAndFlashcards } from "@/ai/flows/ai-quiz-generator";
import type { Quiz, Flashcard, QuizGeneratorOutput } from '@/lib/ai-types';

type FormState = {
  quiz: Quiz | null;
  flashcards: Flashcard[] | null;
  message: string;
};

export async function generateQuizAndFlashcardsAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const courseMaterial = formData.get('courseMaterial') as string;

  if (!courseMaterial) {
      return {
          quiz: null,
          flashcards: null,
          message: 'Please provide course material text.',
      };
  }
  
  if (courseMaterial.length < 50) {
    return {
      quiz: null,
      flashcards: null,
      message: 'Please provide at least 50 characters of course material.',
    };
  }

  // Bypass AI and return demo data
  const demoOutput: QuizGeneratorOutput = {
    quiz: {
      title: "Demo Quiz: Key Web Concepts",
      questions: [
        {
          question: "What does HTML stand for?",
          options: ["HyperText Markup Language", "High-level Textual Machine Learning", "Hyper Transferable Module Language", "Home Tool Markup Language"],
          answer: "HyperText Markup Language",
          type: "multiple-choice"
        },
        {
          question: "Which of the following is a CSS preprocessor?",
          options: ["React", "Sass", "Webpack", "Node.js"],
          answer: "Sass",
          type: "multiple-choice"
        },
        {
          question: "What is the primary function of JavaScript in web development?",
          options: ["To define the structure of a web page", "To style the visual presentation", "To add interactivity and dynamic behavior", "To manage server-side databases"],
          answer: "To add interactivity and dynamic behavior",
          type: "multiple-choice"
        }
      ]
    },
    flashcards: [
      { term: "DOM", definition: "Document Object Model. A programming interface for web documents that represents the page so that programs can change the document structure, style, and content." },
      { term: "API", definition: "Application Programming Interface. A set of rules and protocols for building and interacting with software applications." },
      { term: "Responsive Design", definition: "An approach to web design that makes web pages render well on a variety of devices and window or screen sizes." },
      { term: "Component", definition: "A reusable, self-contained piece of UI (User Interface) that can have its own state and logic." }
    ]
  };

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            ...demoOutput,
            message: 'Successfully generated demo quiz and flashcards.',
        });
    }, 1500);
  });
}

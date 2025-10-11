
'use server';

import { generateQuizAndFlashcards } from "@/ai/flows/ai-quiz-generator";
import type { Quiz, Flashcard, QuizGeneratorOutput } from '@/lib/ai-types';

type FormState = {
  quiz: Quiz | null;
  flashcards: Flashcard[] | null;
  message: string;
};

const demoQuiz: Quiz = {
  title: "Web Development Fundamentals Quiz",
  questions: [
    {
      question: "What does HTML stand for?",
      options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"],
      answer: "Hyper Text Markup Language",
      type: "multiple-choice"
    },
    {
      question: "Which CSS property is used to change the background color of an element?",
      options: ["color", "bgcolor", "background-color", "background"],
      answer: "background-color",
      type: "multiple-choice"
    },
    {
      question: "What is the correct syntax for referring to an external script called 'app.js'?",
      options: ["<script href='app.js'>", "<script name='app.js'>", "<script src='app.js'>", "<script file='app.js'>"],
      answer: "<script src='app.js'>",
      type: "multiple-choice"
    },
    {
      question: "In React, what is used to pass data to a component from outside?",
      options: ["state", "props", "render", "setState"],
      answer: "props",
      type: "multiple-choice"
    },
    {
        question: "Which tool is used to manage packages in a Node.js project?",
        options: ["Git", "Docker", "npm", "Webpack"],
        answer: "npm",
        type: "multiple-choice"
    }
  ]
};

const demoFlashcards: Flashcard[] = [
  { term: "DOM", definition: "Document Object Model. A programming interface for web documents that represents the page so that programs can change the document structure, style, and content." },
  { term: "CSS", definition: "Cascading Style Sheets. A style sheet language used for describing the presentation of a document written in a markup language like HTML." },
  { term: "API", definition: "Application Programming Interface. A set of rules and protocols that allows different software applications to communicate with each other." },
  { term: "Component", definition: "In React, a self-contained, reusable piece of code that renders a part of the user interface." },
  { term: "Git", definition: "A distributed version control system used for tracking changes in source code during software development." },
  { term: "State", definition: "In React, an object that represents the parts of the app that can change. Each component can maintain its own state." }
];

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

  // Return demo data
  return new Promise(resolve => {
    setTimeout(() => {
        resolve({
            quiz: demoQuiz,
            flashcards: demoFlashcards,
            message: 'Successfully generated quiz and flashcards.',
        });
    }, 1500);
  });
}

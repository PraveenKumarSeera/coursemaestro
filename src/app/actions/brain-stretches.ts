
'use server';

import type { BrainStretchPuzzle } from '@/lib/ai-types';

type ActionState = {
  puzzles: BrainStretchPuzzle[] | null;
  message: string;
};

// Pre-defined bank of CSE-related puzzles
const puzzleBank: BrainStretchPuzzle[] = [
    {
        type: 'analogy',
        question: 'Stack is to LIFO as Queue is to _______?',
        options: ['FIFO', 'LIFO', 'FILO', 'Random'],
        answer: 'FIFO',
        explanation: 'A Stack operates on a Last-In, First-Out (LIFO) basis, while a Queue operates on a First-In, First-Out (FIFO) basis.'
    },
    {
        type: 'odd-one-out',
        question: 'Which of these is not a sorting algorithm: Bubble Sort, Quick Sort, Merge Sort, Binary Search?',
        options: ['Bubble Sort', 'Quick Sort', 'Merge Sort', 'Binary Search'],
        answer: 'Binary Search',
        explanation: 'Binary Search is an algorithm for finding an item from a sorted list of items, whereas the others are algorithms for sorting a list.'
    },
    {
        type: 'anagram',
        question: 'Unscramble the letters to find a core programming concept: "ecursnior"',
        options: ['Recursion', 'Pointers', 'Variables', 'Classes'],
        answer: 'Recursion',
        explanation: 'The letters unscramble to "Recursion", a method of solving a problem where the solution depends on solutions to smaller instances of the same problem.'
    },
    {
        type: 'analogy',
        question: 'Array is to Index as Hash Map is to _______?',
        options: ['Value', 'Key', 'Pointer', 'Node'],
        answer: 'Key',
        explanation: 'Elements in an Array are accessed via a numerical index, while values in a Hash Map are accessed via a unique key.'
    },
    {
        type: 'odd-one-out',
        question: 'Which of these is not a database type: SQL, NoSQL, GraphQL, Document?',
        options: ['SQL', 'NoSQL', 'GraphQL', 'Document'],
        answer: 'GraphQL',
        explanation: 'GraphQL is a query language for APIs, whereas SQL, NoSQL, and Document databases are all types of databases or database models.'
    },
    {
        type: 'anagram',
        question: 'Unscramble the letters to find a version control system: "tig"',
        options: ['Svn', 'Git', 'Hg', 'Cvs'],
        answer: 'Git',
        explanation: 'The letters unscramble to "Git", the most widely used version control system.'
    },
    {
        type: 'analogy',
        question: 'Class is to Object as Blueprint is to _______?',
        options: ['House', 'Function', 'Variable', 'Data'],
        answer: 'House',
        explanation: 'A class is a blueprint for creating objects, much like a blueprint is a plan for building a house.'
    },
    {
        type: 'odd-one-out',
        question: 'Which of these is not a layer in the OSI model: Application, Transport, Network, Code?',
        options: ['Application', 'Transport', 'Network', 'Code'],
        answer: 'Code',
        explanation: '`Code` is not a layer in the 7-layer OSI model of computer networking. Application, Transport, and Network are all layers in the model.'
    }
];

// Function to shuffle array and pick N elements
function getRandomPuzzles(arr: BrainStretchPuzzle[], n: number): BrainStretchPuzzle[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
}


export async function generateBrainStretchesAction(): Promise<ActionState> {

  // System-generated puzzles instead of AI
  try {
    // Select 3 random puzzles from the bank
    const selectedPuzzles = getRandomPuzzles(puzzleBank, 3);
    return {
      puzzles: selectedPuzzles,
      message: 'Puzzles generated successfully.',
    };
  } catch (error: any) {
    return {
      puzzles: null,
      message: `Failed to generate puzzles: ${error.message || 'Please try again.'}`,
    };
  }
}

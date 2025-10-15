
'use server';

import type { BrainStretchPuzzle } from '@/lib/ai-types';

type ActionState = {
  puzzles: BrainStretchPuzzle[] | null;
  message: string;
};

// Pre-defined bank of puzzles
const puzzleBank: BrainStretchPuzzle[] = [
    {
        type: 'analogy',
        question: 'HTML is to Structure as CSS is to _______?',
        options: ['Logic', 'Styling', 'Data', 'Network'],
        answer: 'Styling',
        explanation: 'HTML provides the basic structure of a webpage, while CSS is used to control the visual presentation and styling.'
    },
    {
        type: 'odd-one-out',
        question: 'Which of these does not belong: JavaScript, Python, HTML, Ruby?',
        options: ['JavaScript', 'Python', 'HTML', 'Ruby'],
        answer: 'HTML',
        explanation: 'HTML is a markup language used for structuring content, whereas the others are programming languages used for writing logic.'
    },
    {
        type: 'anagram',
        question: 'Unscramble the letters to find a common data structure: "a hhs pma"',
        options: ['Hash Map', 'Stack', 'Queue', 'Tree'],
        answer: 'Hash Map',
        explanation: 'The letters unscramble to "Hash Map", a data structure that stores key-value pairs.'
    },
    {
        type: 'analogy',
        question: 'Function is to JavaScript as Method is to _______?',
        options: ['Variable', 'Object', 'String', 'Loop'],
        answer: 'Object',
        explanation: 'A function that is a property of an object is called a method in object-oriented programming.'
    },
    {
        type: 'odd-one-out',
        question: 'Which of these is not a primary color in the RGB model: Red, Green, Yellow, Blue?',
        options: ['Red', 'Green', 'Yellow', 'Blue'],
        answer: 'Yellow',
        explanation: 'The RGB color model uses Red, Green, and Blue as its primary additive colors. Yellow is a primary color in the CMYK model.'
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
        question: 'Array is to Ordered List as Object is to _______?',
        options: ['Key-Value Pairs', 'Number List', 'Function', 'Single Value'],
        answer: 'Key-Value Pairs',
        explanation: 'Arrays store ordered lists of items, while objects store collections of key-value pairs.'
    },
    {
        type: 'odd-one-out',
        question: 'Which of these is not a CSS property: color, font-size, background-color, variable?',
        options: ['color', 'font-size', 'background-color', 'variable'],
        answer: 'variable',
        explanation: '`variable` is a keyword used in programming languages like JavaScript to declare variables, whereas the others are valid CSS properties for styling.'
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

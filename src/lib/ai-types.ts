/**
 * @fileoverview This file contains all the Zod schemas and TypeScript types for the AI features.
 * This centralized location prevents circular dependencies between server actions and AI flow files.
 */
import { z } from 'zod';

// Graded Submission Schema (used by multiple AI features)
export const GradedSubmissionSchema = z.object({
  course: z.object({
    title: z.string(),
  }),
  assignment: z.object({
    title: z.string(),
  }),
  grade: z.number().nullable(),
});
export type GradedSubmissionForAI = z.infer<typeof GradedSubmissionSchema>;


// AI Study Assistant
export const AiStudyAssistantInputSchema = z.object({
  courseMaterial: z.string().describe('The course material to be used as context for answering questions.'),
  studentQuestion: z.string().describe('The question from the student about the course material.'),
});
export type AiStudyAssistantInput = z.infer<typeof AiStudyAssistantInputSchema>;

export const AiStudyAssistantOutputSchema = z.object({
  answer: z.string().describe('The answer to the student question, based on the course material.'),
});
export type AiStudyAssistantOutput = z.infer<typeof AiStudyAssistantOutputSchema>;


// Career Advisor
export const CareerAdvisorInputSchema = z.object({
  studentPerformanceData: z.string().describe("A string summarizing the student's graded assignments."),
});
export type CareerAdvisorInput = z.infer<typeof CareerAdvisorInputSchema>;

const CareerSuggestionSchema = z.object({
    title: z.string().describe("The job title or career path."),
    description: z.string().describe("A brief description of the career path and why it might be a good fit for the student."),
    keySkills: z.array(z.string()).describe("A list of key skills required for this career path.")
});

export const CareerAdvisorOutputSchema = z.object({
  suggestions: z.array(CareerSuggestionSchema).describe("An array of 3-5 career path suggestions."),
});
export type CareerAdvisorOutput = z.infer<typeof CareerAdvisorOutputSchema>;


// Performance Analyzer
export const PerformanceAnalyzerInputSchema = z.object({
  studentPerformanceData: z.string().describe("A string summarizing the student's graded assignments."),
});
export type PerformanceAnalyzerInput = z.infer<typeof PerformanceAnalyzerInputSchema>;

export const PerformanceAnalyzerOutputSchema = z.object({
    analysis: z.string().describe('A detailed analysis of the student\'s performance, formatted as a markdown string. Include headings, bullet points, and bold text.'),
});
export type PerformanceAnalyzerOutput = z.infer<typeof PerformanceAnalyzerOutputSchema>;


// Quiz Generator
const QuestionSchema = z.object({
  question: z.string().describe('The quiz question.'),
  options: z.array(z.string()).describe('An array of possible answers.'),
  answer: z.string().describe('The correct answer from the options.'),
  type: z.literal('multiple-choice').describe('The type of the question.'),
});

const FlashcardSchema = z.object({
  term: z.string().describe('The term or concept for the flashcard.'),
  definition: z.string().describe('The definition or explanation of the term.'),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

const QuizSchema = z.object({
  title: z.string().describe('A suitable title for the quiz based on the material.'),
  questions: z.array(QuestionSchema).describe('An array of quiz questions.'),
});
export type Quiz = z.infer<typeof QuizSchema>;

export const QuizGeneratorInputSchema = z.object({
    courseMaterial: z.string().min(50).describe('The course notes or material to generate a quiz from.'),
});
export type QuizGeneratorInput = z.infer<typeof QuizGeneratorInputSchema>;


export const QuizGeneratorOutputSchema = z.object({
  quiz: QuizSchema,
  flashcards: z.array(FlashcardSchema).describe('An array of flashcards with key terms.'),
});
export type QuizGeneratorOutput = z.infer<typeof QuizGeneratorOutputSchema>;


// Resume Builder
export const ResumeBuilderInputSchema = z.object({
  studentName: z.string(),
  studentEmail: z.string(),
  studentPerformanceData: z.string().describe("A string summarizing the student's graded assignments, especially high-performing ones."),
});
export type ResumeBuilderInput = z.infer<typeof ResumeBuilderInputSchema>;

export const ResumeBuilderOutputSchema = z.object({
  resumeMarkdown: z.string().describe("The full resume formatted as a Markdown string."),
});
export type ResumeBuilderOutput = z.infer<typeof ResumeBuilderOutputSchema>;


// Teaching Assistant
export const TeachingAssistantInputSchema = z.object({
  submissionText: z.string().describe('The text of the student submission to be analyzed.'),
  task: z.enum(['summarize', 'grammarCheck']).describe("The specific task to perform: 'summarize' or 'grammarCheck'."),
});
export type TeachingAssistantInput = z.infer<typeof TeachingAssistantInputSchema>;

export const TeachingAssistantOutputSchema = z.object({
  analysis: z.string().describe('The result of the AI analysis, formatted as a markdown string.'),
});
export type TeachingAssistantOutput = z.infer<typeof TeachingAssistantOutputSchema>;

// Motivation Bot
export const MotivationBotInputSchema = z.object({
  studentName: z.string().describe("The first name of the student."),
  courseTitle: z.string().describe("The title of the course."),
});
export type MotivationBotInput = z.infer<typeof MotivationBotInputSchema>;

export const MotivationBotOutputSchema = z.object({
  message: z.string().describe("A short, positive, and encouraging message for the student."),
});
export type MotivationBotOutput = z.infer<typeof MotivationBotOutputSchema>;

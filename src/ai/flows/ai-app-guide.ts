'use server';

/**
 * @fileOverview This file defines the AI App Guide flow, which acts as a greeter and feature explainer on the homepage.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AppGuideInputSchema = z.object({
  question: z.string().describe('The question from the user about the application.'),
  chatHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Previous conversation history.'),
});
export type AppGuideInput = z.infer<typeof AppGuideInputSchema>;

const AppGuideOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question, in a friendly and helpful tone.'),
});
export type AppGuideOutput = z.infer<typeof AppGuideOutputSchema>;

export async function appGuide(input: AppGuideInput): Promise<AppGuideOutput> {
  return appGuideFlow(input);
}

const featuresList = `
### For Students

*   **Course Management:** Browse, search, and enroll in courses. Access course materials, assignments, and discussions.
*   **My Grades:** View a detailed list of all graded assignments, including grades and teacher feedback.
*   **AI Performance Analyzer:** Get a personalized AI-generated analysis of academic strengths, weaknesses, and actionable suggestions for improvement.
*   **AI Study Assistant:** Ask questions about course content within a specific course and get instant answers from an AI tutor.
*   **AI Career Advisor:** Receive AI-powered career path suggestions based on academic performance and strengths.
*   **AI Resume Builder:** Automatically generate a professional resume in Markdown format, highlighting skills and projects from coursework.
*   **Certificate Generator:** Automatically generate and view official-looking certificates for successfully completed courses.
*   **Leaderboard:** See where they rank among their peers based on average grade.
*   **Daily Attendance:** Automatically get marked as "Present" for a course just by visiting the course page.
*   **In-App Notifications:** Receive real-time alerts for new assignments and when grades are posted.

### For Teachers

*   **Course & Assignment Management:** Create, edit, and delete courses and assignments.
*   **Student Management & Filtering:** View all enrolled students and filter them by performance.
*   **Grading Interface:** Review student submissions, provide grades and written feedback.
*   **AI Teaching Assistant:** Use AI to instantly summarize long student submissions or perform a grammar and style check.
*   **AI Quiz Generator:** Paste any text to automatically generate a quiz with multiple-choice questions and a set of flashcards.
*   **Centralized Attendance Log:** View a complete log of all student check-ins across all courses.
*   **In-App Notifications:** Get alerts when students submit work.
*   **Material Uploads:** Upload course documents (PDF, DOCX, etc.) for students to view.

### General Features

*   **Role-Based Access:** Secure login with distinct "Student" and "Teacher" roles.
*   **Automatic Dark Mode:** The UI automatically switches theme based on the user's system time.
`;

const prompt = ai.definePrompt({
  name: 'appGuidePrompt',
  input: { schema: AppGuideInputSchema },
  output: { schema: AppGuideOutputSchema },
  prompt: `You are "Maestro," a friendly and enthusiastic AI guide for the CourseMaestro application. Your goal is to welcome users, explain the features of the application, and answer their questions about it.

Keep your answers concise, friendly, and easy to understand. Use Markdown for formatting like lists and bold text.

Here is a list of the application's features:
${featuresList}

Use this information to answer the user's question. If the user asks something unrelated to CourseMaestro, politely steer the conversation back to the application's features.

Conversation History:
{{#if chatHistory}}
  {{#each chatHistory}}
    {{#if (eq role 'user')}}
      User: {{content}}
    {{else}}
      Maestro: {{content}}
    {{/if}}
  {{/each}}
{{/if}}

User's current question: {{question}}

Answer:
`,
});

const appGuideFlow = ai.defineFlow(
  {
    name: 'appGuideFlow',
    inputSchema: AppGuideInputSchema,
    outputSchema: AppGuideOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate an answer.');
    }
    return output;
  }
);

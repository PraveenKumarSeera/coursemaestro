
'use server';
/**
 * @fileOverview This file defines the AI Smart Timetable Generator flow.
 * It creates a personalized study schedule based on courses, deadlines, and student availability.
 */

import { ai } from '@/ai/genkit';
import {
  TimetableGeneratorInputSchema,
  TimetableGeneratorOutputSchema,
  type TimetableGeneratorInput,
  type TimetableGeneratorOutput,
} from '@/lib/ai-types';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

const prompt = ai.definePrompt({
  name: 'timetableGeneratorPrompt',
  input: { schema: TimetableGeneratorInputSchema },
  output: { schema: TimetableGeneratorOutputSchema },
  model: googleAI.model('gemini-1.5-flash'),
  prompt: `You are an expert academic planner AI. Your task is to create a personalized weekly study timetable for a student.

Analyze the student's enrolled courses, upcoming assignment deadlines, and their stated free hours.
Create a balanced schedule that allocates study blocks for each course, prioritizing tasks with nearer deadlines.

Student's Enrolled Courses:
{{{enrolledCourses}}}

Student's Upcoming Assignments:
{{{upcomingAssignments}}}

Student's Available Free Hours:
"{{{freeHours}}}"

Guidelines:
1.  Generate a schedule for the next 7 days, starting from Monday.
2.  Prioritize study blocks for assignments that are due soon.
3.  Spread out study sessions for different subjects to avoid burnout.
4.  For each study block, provide a clear time, a specific task (e.g., "Work on 'Advanced React Patterns' essay"), and a brief goal (e.g., "Complete the outline and research").
5.  If the student's free time seems insufficient, add a note of encouragement but still create the best possible schedule.
6.  Return the schedule in the specified JSON format.
`,
});

const timetableGeneratorFlow = ai.defineFlow(
  {
    name: 'timetableGeneratorFlow',
    inputSchema: TimetableGeneratorInputSchema,
    outputSchema: TimetableGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI returned an invalid response. Please try again.');
    }
    return output;
  }
);

export async function generateTimetable(
  input: TimetableGeneratorInput
): Promise<TimetableGeneratorOutput> {
  return timetableGeneratorFlow(input);
}

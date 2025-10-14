
'use server';

import { generateTargetedPractice } from '@/ai/flows/ai-targeted-practice-generator';
import type { TargetedPracticeOutput } from '@/lib/ai-types';

type ActionState = {
  microLesson: string | null;
  message: string | null;
};

export async function generateTargetedPracticeAction({
  courseTitle,
  assignmentTitle,
  grade,
}: {
  courseTitle: string;
  assignmentTitle: string;
  grade: number;
}): Promise<ActionState> {
  try {
    const result: TargetedPracticeOutput = await generateTargetedPractice({
      courseTitle,
      assignmentTitle,
      grade,
    });
    return {
      microLesson: result.microLesson,
      message: 'Practice session generated successfully.',
    };
  } catch (error: any) {
    return {
      microLesson: null,
      message: `Failed to generate practice session: ${error.message || 'Please try again.'}`,
    };
  }
}


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

  try {
    const result = await generateBrainStretches({ courseMaterial });
    return {
      puzzles: result.puzzles,
      message: 'Puzzles generated successfully.',
    };
  } catch (error: any) {
    return {
      puzzles: null,
      message: `Failed to generate puzzles: ${error.message || 'Please try again.'}`,
    };
  }
}

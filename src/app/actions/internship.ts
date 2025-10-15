
'use server';

import { gradeInternshipSubmission } from '@/ai/flows/ai-internship-grader';
import type { InternshipGrade } from '@/lib/types';

type GradeActionState = {
  grade: InternshipGrade | null;
  message: string | null;
};


export async function gradeInternshipSubmissionAction(
    { taskTitle, taskDescription, submissionText }: { taskTitle: string, taskDescription: string, submissionText: string }
): Promise<GradeActionState> {
    if (!submissionText) {
        return { grade: null, message: 'Submission cannot be empty.' };
    }

    try {
        const result = await gradeInternshipSubmission({
            taskTitle,
            taskDescription,
            submissionText,
        });
        return {
            grade: result,
            message: 'Submission graded successfully.',
        };
    } catch (error: any) {
        return {
            grade: null,
            message: `Failed to grade submission: ${error.message || 'Please try again.'}`,
        };
    }
}

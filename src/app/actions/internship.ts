
'use server';

import type { InternshipGrade } from '@/lib/types';

type GradeActionState = {
  grade: InternshipGrade | null;
  message: string | null;
};

// System-generated grading logic
function generateSystemGrade(submissionText: string): InternshipGrade {
    const textLength = submissionText.length;
    
    // Base scores
    let problemSolving = 60;
    let creativity = 55;

    // Add points based on length
    if (textLength > 100) problemSolving += 10;
    if (textLength > 250) problemSolving += 10;
    if (textLength > 500) problemSolving += 5;

    if (textLength > 150) creativity += 10;
    if (textLength > 400) creativity += 10;
    
    // Add some variability
    problemSolving += (textLength % 7);
    creativity += (textLength % 9);

    // Cap scores at 99
    problemSolving = Math.min(99, problemSolving);
    creativity = Math.min(99, creativity);

    const overall = Math.round((problemSolving + creativity) / 2);

    const feedback = "This is a solid first draft. Your key ideas are clear, and you've addressed the main points of the task. To improve, consider adding more specific details to support your solution and exploring at least one alternative approach. Highlighting potential risks and mitigation strategies would also strengthen your proposal. Keep up the great work!";

    return {
        problemSolving,
        creativity,
        overall,
        feedback,
    };
}


export async function gradeInternshipSubmissionAction(
    { taskTitle, taskDescription, submissionText }: { taskTitle: string, taskDescription: string, submissionText: string }
): Promise<GradeActionState> {
    if (!submissionText || submissionText.trim().length < 50) {
        return { grade: null, message: 'Submission must be at least 50 characters long.' };
    }

    try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const result = generateSystemGrade(submissionText);
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

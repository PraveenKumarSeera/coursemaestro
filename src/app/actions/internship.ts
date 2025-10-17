
'use server';

import type { InternshipGrade } from '@/lib/types';

type GradeActionState = {
  grade: InternshipGrade | null;
  message: string | null;
};


export async function gradeInternshipSubmissionAction(
    { taskTitle, taskDescription, submissionText }: { taskTitle: string, taskDescription: string, submissionText: string }
): Promise<GradeActionState> {
    if (!submissionText || submissionText.trim().length < 50) {
        return { grade: null, message: 'Submission must be at least 50 characters long.' };
    }

    // --- System-Generated Grading Logic ---
    const textLength = submissionText.trim().length;
    
    // Base scores
    let problemSolving = 50;
    let creativity = 45;

    // Add points for length (effort proxy)
    if (textLength > 500) {
        problemSolving += 25;
        creativity += 20;
    } else if (textLength > 200) {
        problemSolving += 15;
        creativity += 10;
    } else {
        problemSolving += 5;
        creativity += 5;
    }

    // Add a small random factor to make it feel less static
    problemSolving = Math.min(100, problemSolving + Math.floor(Math.random() * 10));
    creativity = Math.min(100, creativity + Math.floor(Math.random() * 10));

    const overall = Math.round((problemSolving * 0.6) + (creativity * 0.4));
    
    const feedback = "This is a great first attempt. You've clearly put thought into the problem and outlined a solid foundation for a solution. To improve, consider exploring alternative approaches and detailing the potential edge cases. Keep up the excellent work!";

    const grade: InternshipGrade = {
        problemSolving,
        creativity,
        overall,
        feedback,
    };
    // --- End System-Generated Grading Logic ---

    // Simulate a short delay to make it feel like it's processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        grade,
        message: 'Submission graded successfully.',
    };
}

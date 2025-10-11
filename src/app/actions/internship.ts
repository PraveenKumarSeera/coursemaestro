
'use server';

import { generateInternshipTask } from '@/ai/flows/ai-internship-task-generator';
import { gradeInternshipSubmission } from '@/ai/flows/ai-internship-grader';
import type { InternshipTask, InternshipDomain, InternshipGrade } from '@/lib/types';

type TaskActionState = {
  task: InternshipTask | null;
  message: string | null;
};

type GradeActionState = {
  grade: InternshipGrade | null;
  message: string | null;
};

export async function generateInternshipTaskAction(
  domain: InternshipDomain
): Promise<TaskActionState> {
  if (!domain) {
    return { task: null, message: 'Please select a domain.' };
  }

  // Bypass AI call and return demo data
  const demoTask: InternshipTask = {
    title: `Demo Task: Optimize ${domain.name}'s Search Indexing`,
    scenario: `The core search infrastructure team at ${domain.name} has noticed a 5% increase in query latency over the past quarter. Your task is to investigate the potential causes and propose a solution. The current system uses a distributed hash table for indexing, but it's struggling with the massive influx of new multi-modal data.`,
    task: 'Analyze the provided system description and propose a multi-faceted solution to reduce search latency. Your proposal should address data structures, potential algorithmic changes, and infrastructure considerations.',
    deliverables: [
      'A brief technical document (2-3 paragraphs) explaining your proposed solution.',
      'Pseudo-code for any new algorithm you are suggesting.',
      'A high-level diagram illustrating your proposed architecture.',
    ],
  };

  return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            task: demoTask,
            message: 'Task generated successfully.',
        });
    }, 1500);
  });
}

export async function gradeInternshipSubmissionAction(
    { taskTitle, taskDescription, submissionText }: { taskTitle: string, taskDescription: string, submissionText: string }
): Promise<GradeActionState> {
    if (!submissionText) {
        return { grade: null, message: 'Submission cannot be empty.' };
    }

    // Bypass AI call and return demo data
    const demoGrade: InternshipGrade = {
        problemSolving: 85,
        creativity: 78,
        overall: 82,
        feedback: "This is a strong proposal. Your analysis of using a hybrid Trie and inverted index is well-reasoned and shows a solid understanding of the trade-offs. The problem-solving approach is excellent. For creativity, you could have explored more novel, less conventional data structures or considered a machine learning-based approach for query pre-fetching to further reduce perceived latency. Overall, a fantastic effort that would be well-received in a real-world scenario."
    };

     return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                grade: demoGrade,
                message: 'Submission graded successfully.',
            });
        }, 2000);
    });
}

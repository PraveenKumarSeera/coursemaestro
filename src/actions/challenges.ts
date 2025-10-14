
'use server';

import { revalidatePath } from 'next/cache';
import { createChallengeSubmission, voteOnSubmission } from '@/lib/data';
import { getSession } from '@/lib/session';

type FormState = {
  message: string;
  success: boolean;
};

export async function submitChallengeAction(
  challengeId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    return { message: 'Only students can submit solutions.', success: false };
  }

  const content = formData.get('content') as string;
  if (!content || content.trim().length < 20) {
      return { message: 'Your submission must be at least 20 characters long.', success: false };
  }

  try {
    await createChallengeSubmission({
      challengeId,
      studentId: user.id,
      content,
    });
    revalidatePath(`/challenges/${challengeId}`);
    return { message: 'Your solution has been submitted!', success: true };
  } catch (error) {
    return { message: 'Failed to submit solution.', success: false };
  }
}

export async function voteOnSubmissionAction(submissionId: string, challengeId: string) {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        return { message: 'Only students can vote.', success: false };
    }

    try {
        const result = await voteOnSubmission(submissionId, user.id);
        if (!result) {
            return { message: 'You have already voted or cannot vote for your own submission.', success: false };
        }
        revalidatePath(`/challenges/${challengeId}`);
        return { message: 'Vote counted!', success: true };
    } catch (error) {
        return { message: 'Failed to cast vote.', success: false };
    }
}

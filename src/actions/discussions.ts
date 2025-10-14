

'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createThread, createPost } from '@/lib/data';
import { initializeFirebase } from '@/firebase';

const createThreadSchema = z.object({
  courseId: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(10, 'Your post must be at least 10 characters'),
});

const createPostSchema = z.object({
    threadId: z.string(),
    courseId: z.string(),
    content: z.string().min(1, 'Reply cannot be empty'),
});


type FormState = {
  message: string;
  success: boolean;
};

export async function createThreadAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { auth } = initializeFirebase();
  const user = auth.currentUser;
  if (!user) {
    return { message: 'Permission denied. You must be logged in.', success: false };
  }

  const validatedFields = createThreadSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      success: false,
    };
  }
  
  try {
    const { courseId, title, content } = validatedFields.data;
    const newThread = await createThread({ courseId, title, authorId: user.uid });
    await createPost({ threadId: newThread.id, content, authorId: user.uid });

    revalidatePath(`/courses/${courseId}`);
    return { message: 'Discussion started successfully.', success: true };
  } catch (error) {
    return { message: 'Failed to start discussion.', success: false };
  }
}


export async function createPostAction(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const { auth } = initializeFirebase();
    const user = auth.currentUser;
    if (!user) {
        return { message: 'Permission denied. You must be logged in.', success: false };
    }

    const validatedFields = createPostSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return { message: 'Invalid reply data.', success: false };
    }
    
    try {
        const { threadId, content, courseId } = validatedFields.data;
        await createPost({ threadId, content, authorId: user.uid });
        
        revalidatePath(`/courses/${courseId}/discussions/${threadId}`);
        return { message: 'Reply posted.', success: true };
    } catch (error) {
        return { message: 'Failed to post reply.', success: false };
    }
}

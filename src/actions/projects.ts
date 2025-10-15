
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createProject } from '@/lib/data';
import { getSession } from '@/lib/session';

const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  projectUrl: z.string().url('Please enter a valid URL'),
  tags: z.string().min(1, 'Please add at least one tag'),
});

type FormState = {
  message: string;
  success: boolean;
};

export async function createProjectAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    return { message: 'Permission denied. Only students can create projects.', success: false };
  }

  const validatedFields = projectSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    projectUrl: formData.get('projectUrl'),
    tags: formData.get('tags'),
  });
  

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.issues.map(issue => `${issue.path[0]}: ${issue.message}`).join(', ');
    return {
      message: `Invalid form data. ${errorMessages}`,
      success: false,
    };
  }
  
  try {
    const tagsArray = validatedFields.data.tags.split(',').map(tag => tag.trim()).filter(Boolean);

    await createProject({
        ...validatedFields.data,
        tags: tagsArray,
        studentId: user.id
    });

    revalidatePath('/my-projects');
    revalidatePath('/showcase');
    return { message: 'Project added successfully!', success: true };
  } catch (error) {
    console.error(error);
    return { message: 'Failed to create project.', success: false };
  }
}

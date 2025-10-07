'use server';

import { revalidatePath } from 'next/cache';
import { generateCertificate } from '@/lib/data';

type FormState = {
  message: string;
  success: boolean;
};

export async function generateCertificateAction(
  courseId: string,
  studentId: string,
): Promise<FormState> {
  
  try {
    const result = await generateCertificate(studentId, courseId);
    if (!result) {
      return { message: 'Certificate already exists or requirements not met.', success: false };
    }
    revalidatePath('/my-certificates');
    return { message: 'Certificate generated successfully!', success: true };
  } catch (error) {
    return { message: 'Failed to generate certificate.', success: false };
  }
}

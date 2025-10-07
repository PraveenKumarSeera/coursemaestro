'use server';

import { parseMaterial } from "@/ai/flows/ai-material-parser";
import { addMaterial } from "@/lib/data";

type FormState = {
  message: string;
  success: boolean;
};

export async function uploadMaterialAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const courseId = formData.get('courseId') as string;
  const title = formData.get('title') as string;
  const file = formData.get('file') as File | null;

  if (!courseId || !title || !file || file.size === 0) {
    return {
        message: 'Please select a course, provide a title, and choose a file.',
        success: false,
    };
  }

  let fileDataUri: string;
  try {
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    fileDataUri = `data:${file.type};base64,${base64}`;
  } catch(error) {
    console.error('Error processing file:', error);
    return { message: 'Failed to process file.', success: false };
  }
  
  try {
    const { textContent } = await parseMaterial({ fileDataUri });
    
    await addMaterial({
      courseId,
      title,
      fileName: file.name,
      fileType: file.type,
      content: textContent,
    });

    return {
      message: 'Successfully uploaded and parsed material.',
      success: true,
    };
  } catch (error) {
    console.error('Material upload error:', error);
    return {
      message: 'Sorry, I encountered an error. Please try again.',
      success: false
    };
  }
}

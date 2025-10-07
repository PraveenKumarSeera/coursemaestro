
import { getSession } from '@/lib/session';
import { getStudentGrades } from '@/lib/data';
import { notFound } from 'next/navigation';
import ResumeBuilderClient from '@/components/resume-builder-client';
import type { GradedSubmission } from '@/lib/types';

export default async function ResumeBuilderPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const gradedSubmissions: GradedSubmission[] = await getStudentGrades(user.id);

  return <ResumeBuilderClient user={user} gradedSubmissions={gradedSubmissions} />;
}

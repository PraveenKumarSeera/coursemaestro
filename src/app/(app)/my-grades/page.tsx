
import { getSession } from '@/lib/session';
import { getStudentGrades } from '@/lib/data';
import { notFound } from 'next/navigation';
import type { GradedSubmission } from '@/lib/types';
import GradesClient from '@/components/my-grades/grades-client';

export default async function MyGradesPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const gradedSubmissions: GradedSubmission[] = await getStudentGrades(user.id);

  return (
    <GradesClient user={user} gradedSubmissions={gradedSubmissions} />
  );
}

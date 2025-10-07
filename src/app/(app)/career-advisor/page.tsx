
import { getSession } from '@/lib/session';
import { getStudentGrades } from '@/lib/data';
import { notFound } from 'next/navigation';
import CareerAdvisorClient from '@/components/career-advisor-client';
import type { GradedSubmission } from '@/lib/types';

export default async function CareerAdvisorPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const gradedSubmissions: GradedSubmission[] = await getStudentGrades(user.id);

  return <CareerAdvisorClient gradedSubmissions={gradedSubmissions} />;
}

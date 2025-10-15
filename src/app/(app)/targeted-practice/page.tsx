
import { getSession } from '@/lib/session';
import { getStudentGrades } from '@/lib/data';
import { notFound } from 'next/navigation';
import TargetedPracticeClient from '@/components/practice/targeted-practice-client';
import type { GradedSubmission } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import Link from 'next/link';

export default async function TargetedPracticePage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const gradedSubmissions: GradedSubmission[] = await getStudentGrades(user.id);
  const lowScoringSubmissions = gradedSubmissions.filter(
    (sub) => sub.grade !== null && sub.grade < 80
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Targeted Practice</h1>
        <p className="text-muted-foreground">
          Generate personalized practice sessions for assignments where you can improve.
        </p>
      </div>

      {lowScoringSubmissions.length > 0 ? (
        <TargetedPracticeClient submissions={lowScoringSubmissions} />
      ) : (
        <Card className="flex flex-col items-center justify-center text-center p-10 flex-grow">
          <CardHeader>
            <div className="p-4 bg-muted rounded-full mx-auto">
              <Target className="h-8 w-8 text-accent" />
            </div>
            <CardTitle>Excellent Work!</CardTitle>
            <CardDescription>
              You don't have any assignments that need targeted practice right now.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Link href="/my-grades" className="text-primary hover:underline">
                View all my grades
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


import { getSession } from '@/lib/session';
import { getTeacherStudents } from '@/lib/data';
import { notFound } from 'next/navigation';
import InstantQuizLauncher from '@/components/live-progress/instant-quiz-launcher';
import type { User } from '@/lib/types';

export default async function InstantQuizPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'teacher') {
    notFound();
  }

  const students = await getTeacherStudents(user.id);

  if (students.length === 0) {
    return (
        <div className="flex items-center justify-center h-full text-center">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold">No Students Enrolled</h2>
                <p className="text-muted-foreground">The quiz tools will be available once students are enrolled in your courses.</p>
            </div>
        </div>
    )
  }

  return <InstantQuizLauncher studentCount={students.length} />;
}

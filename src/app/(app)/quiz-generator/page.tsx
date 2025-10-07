
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import QuizGeneratorClient from '@/components/quiz-generator-client';

export default async function QuizGeneratorPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'teacher') {
        notFound();
    }

    return <QuizGeneratorClient />;
}

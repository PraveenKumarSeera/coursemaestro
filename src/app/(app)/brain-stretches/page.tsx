
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import BrainStretchClient from '@/components/brain-stretches/brain-stretch-client';

export default async function BrainStretchesPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        notFound();
    }

    return <BrainStretchClient />;
}

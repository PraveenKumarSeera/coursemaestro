
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import StudyRoomClient from '@/components/study-rooms/study-room-client';

export default async function StudyRoomDetailPage({ params }: { params: { roomId: string } }) {
    const { user } = await getSession();
    if (!user) {
        notFound();
    }

    // Role check is now handled inside the client component to allow teachers access
    return <StudyRoomClient roomId={params.roomId} currentUser={user} />;
}

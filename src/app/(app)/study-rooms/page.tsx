
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import StudyRoomsLobby from '@/components/study-rooms/study-rooms-lobby';

export default async function StudyRoomsPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        notFound();
    }

    return <StudyRoomsLobby user={user} />;
}

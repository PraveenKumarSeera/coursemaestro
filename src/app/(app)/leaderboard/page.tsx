
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getStudentRankings } from '@/lib/data';
import LeaderboardClient from '@/components/leaderboard-client';

export default async function LeaderboardPage() {
    const { user } = await getSession();
    if (!user) {
        notFound();
    }

    const rankings = await getStudentRankings();

    return (
        <div className="space-y-6">
            <div className='space-y-1'>
                <h1 className="text-3xl font-bold font-headline">Leaderboard</h1>
                <p className="text-muted-foreground">
                    See how you rank against your peers based on average grade.
                </p>
            </div>
            <LeaderboardClient rankings={rankings} currentUser={user} />
        </div>
    );
}

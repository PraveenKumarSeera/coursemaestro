
'use client';
import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Ranking = {
    user: User;
    averageGrade: number;
    assignmentsCompleted: number;
    credibilityPoints: number;
};

type LeaderboardClientProps = {
  rankings: Ranking[];
  currentUser: User;
};

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500 fill-yellow-400" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400 fill-gray-300" />;
    if (rank === 3) return <Award className="h-6 w-6 text-yellow-700 fill-yellow-600" />;
    return <span className="text-sm font-medium w-6 text-center">{rank}</span>;
}

const AcademicLeaderboard = ({ rankings, currentUser }: { rankings: Ranking[], currentUser: User }) => {
    const sortedRankings = [...rankings].sort((a, b) => b.averageGrade - a.averageGrade);
    return (
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-center hidden md:table-cell">Assignments</TableHead>
                <TableHead className="text-right">Average Grade</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedRankings.map((entry, index) => (
                <TableRow key={entry.user.id} className={cn(entry.user.id === currentUser.id && 'bg-primary/10 hover:bg-primary/20')}>
                    <TableCell>
                    <div className="flex items-center justify-center h-full">
                        {getRankIcon(index + 1)}
                    </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.user.name}</span>
                    </div>
                    </TableCell>
                    <TableCell className="text-center hidden md:table-cell">{entry.assignmentsCompleted}</TableCell>
                    <TableCell className="text-right">
                        <span className="font-bold text-lg text-primary">{entry.averageGrade}%</span>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

const CredibilityLeaderboard = ({ rankings, currentUser }: { rankings: Ranking[], currentUser: User }) => {
    const sortedRankings = [...rankings].sort((a, b) => b.credibilityPoints - a.credibilityPoints);

    return (
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-right">Credibility Points</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {sortedRankings.map((entry, index) => (
                <TableRow key={entry.user.id} className={cn(entry.user.id === currentUser.id && 'bg-primary/10 hover:bg-primary/20')}>
                    <TableCell>
                    <div className="flex items-center justify-center h-full">
                        {getRankIcon(index + 1)}
                    </div>
                    </TableCell>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{entry.user.name}</span>
                    </div>
                    </TableCell>
                    <TableCell className="text-right">
                         <span className="font-bold text-lg text-accent flex items-center gap-1 justify-end">
                            <Star className="h-5 w-5" />
                            {entry.credibilityPoints}
                        </span>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default function LeaderboardClient({ rankings, currentUser }: LeaderboardClientProps) {
  return (
    <Tabs defaultValue="academics">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="academics">
                <Award className="mr-2 h-4 w-4" /> Academic Performance
            </TabsTrigger>
            <TabsTrigger value="challenges">
                <Star className="mr-2 h-4 w-4" /> Challenge Credibility
            </TabsTrigger>
        </TabsList>
        <TabsContent value="academics">
            <Card>
                <CardHeader>
                    <CardTitle>Top Students by Grade</CardTitle>
                    <CardDescription>
                    This leaderboard ranks students by their average grade across all courses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {rankings.length > 0 ? (
                        <AcademicLeaderboard rankings={rankings} currentUser={currentUser} />
                    ) : (
                    <p className="text-muted-foreground text-center py-8">
                        No graded assignments exist yet. The leaderboard will appear once grades are recorded.
                    </p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="challenges">
             <Card>
                <CardHeader>
                    <CardTitle>Top Innovators by Credibility</CardTitle>
                    <CardDescription>
                    This leaderboard ranks students by credibility points earned from real-world challenges.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {rankings.length > 0 ? (
                        <CredibilityLeaderboard rankings={rankings} currentUser={currentUser} />
                    ) : (
                    <p className="text-muted-foreground text-center py-8">
                        No challenges have been completed yet.
                    </p>
                    )}
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}

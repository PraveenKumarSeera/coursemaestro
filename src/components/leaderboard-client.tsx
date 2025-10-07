
'use client';
import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

type Ranking = {
    user: User;
    averageGrade: number;
    assignmentsCompleted: number;
};

type LeaderboardClientProps = {
  rankings: Ranking[];
  currentUser: User;
};

const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-yellow-700" />;
    return <span className="text-sm font-medium w-5 text-center">{rank}</span>;
}

export default function LeaderboardClient({ rankings, currentUser }: LeaderboardClientProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Students</CardTitle>
        <CardDescription>
          This leaderboard ranks students by their average grade. Keep up the great work!
        </CardDescription>
      </CardHeader>
      <CardContent>
        {rankings.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Student</TableHead>
                <TableHead className="text-center">Assignments Completed</TableHead>
                <TableHead className="text-right">Average Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((entry, index) => (
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
                  <TableCell className="text-center">{entry.assignmentsCompleted}</TableCell>
                  <TableCell className="text-right font-bold text-lg text-primary">{entry.averageGrade}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No graded assignments exist yet. The leaderboard will appear once grades are recorded.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

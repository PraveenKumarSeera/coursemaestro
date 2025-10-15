
import { getChallengeById, getSubmissionsForChallenge } from "@/lib/data";
import { getSession } from "@/lib/session";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Star } from "lucide-react";
import SubmitChallengeForm from "@/components/challenges/submit-challenge-form";
import VoteButton from "@/components/challenges/vote-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

export default async function ChallengeDetailPage({ params }: { params: { challengeId: string } }) {
    const { user } = await getSession();
    if (!user || user.role !== 'student') {
        notFound();
    }
    
    const challenge = await getChallengeById(params.challengeId);
    if (!challenge) {
        notFound();
    }
    
    const submissions = await getSubmissionsForChallenge(params.challengeId);
    submissions.sort((a, b) => b.votes - a.votes); // Sort by most votes

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold font-headline">
                    {challenge.title}
                </h1>
                <div className="flex items-center space-x-6 text-lg text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        <span>From {challenge.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span>{challenge.points} Credibility Points</span>
                    </div>
                </div>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle>Challenge Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{challenge.description}</p>
                </CardContent>
            </Card>

            <SubmitChallengeForm challengeId={challenge.id} />

            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline">Community Submissions</h2>
                {submissions.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {submissions.map(submission => (
                            <Card key={submission.id}>
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>{submission.student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{submission.student.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-4">{submission.content}</p>
                                </CardContent>
                                <CardFooter>
                                    <VoteButton
                                        submissionId={submission.id}
                                        challengeId={challenge.id}
                                        initialVotes={submission.votes}
                                        isOwner={submission.studentId === user.id}
                                    />
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="flex items-center justify-center p-10 text-center">
                        <p className="text-muted-foreground">No solutions have been submitted yet. Be the first!</p>
                    </Card>
                )}
            </div>
        </div>
    );
}

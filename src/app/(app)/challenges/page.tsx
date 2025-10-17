
import { getAllChallenges } from "@/lib/data";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Briefcase, ArrowRight, Star, ShoppingCart, Users, Code, MessageSquare, GitMerge, Database } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BrainStretchClient from "@/components/brain-stretches/brain-stretch-client";

const iconMap: { [key: string]: LucideIcon } = {
    ShoppingCart,
    Users,
    Code,
    MessageSquare,
    GitMerge,
    Database,
    Briefcase,
};

export default async function ChallengesPage() {
    const challenges = await getAllChallenges();

    return (
        <div className="space-y-8">
            <BrainStretchClient />
            
            <div className='space-y-1'>
                <h1 className="text-3xl font-bold font-headline">Real-World Challenge Board</h1>
                <p className="text-muted-foreground">
                    Apply your skills to industry problems, submit solutions, and earn credibility by getting votes from your peers.
                </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {challenges.map(challenge => {
                    const Icon = iconMap[challenge.icon] || Briefcase;
                    return (
                        <Card key={challenge.id} className="flex flex-col hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-3">
                                    <Icon className="h-6 w-6 text-primary" />
                                    <span className="font-headline">{challenge.title}</span>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 pt-2">
                                    <Briefcase className="h-4 w-4" /> 
                                    From {challenge.company}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-muted-foreground text-sm line-clamp-3">{challenge.description}</p>
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-4">
                                <div className="bg-muted/50 rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-2 self-start">
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                    {challenge.points} Credibility Points
                                </div>
                                <Button asChild className="w-full">
                                    <Link href={`/challenges/${challenge.id}`}>
                                        View Challenge <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div>
    );
}

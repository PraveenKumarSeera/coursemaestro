
import { getAllChallenges } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, ArrowRight, Star } from "lucide-react";

export default async function ChallengesPage() {
    const challenges = await getAllChallenges();

    return (
        <div className="space-y-6">
            <div className='space-y-1'>
                <h1 className="text-3xl font-bold font-headline">Real-World Challenge Board</h1>
                <p className="text-muted-foreground">
                    Apply your skills to industry problems and earn credibility.
                </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {challenges.map(challenge => (
                    <Card key={challenge.id} className="flex flex-col">
                        <div className="relative h-48 w-full">
                            <Image
                                src={challenge.imageUrl}
                                alt={challenge.title}
                                fill
                                className="object-cover rounded-t-lg"
                                data-ai-hint="project abstract"
                            />
                            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                {challenge.points} pts
                            </div>
                        </div>
                        <CardHeader>
                            <CardTitle className="font-headline">{challenge.title}</CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" /> 
                                From {challenge.company}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground text-sm line-clamp-3">{challenge.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full">
                                <Link href={`/challenges/${challenge.id}`}>
                                    View Challenge <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

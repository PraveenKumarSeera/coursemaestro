

import { getAllProjects } from '@/lib/data';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, ExternalLink, GraduationCap, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

// Self-contained public layout for the showcase page
function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-background min-h-screen text-foreground">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
                <div className="container flex h-14 items-center">
                    <Link href="/showcase" className="flex items-center gap-2 font-semibold">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        <span className="font-headline text-lg">CoursePilot</span>
                    </Link>
                    <nav className="flex items-center space-x-4 ml-auto">
                        <Button asChild variant="outline">
                            <Link href="/login">Student or Teacher Login</Link>
                        </Button>
                    </nav>
                </div>
            </header>
            <main>{children}</main>
            <footer className="border-t">
                <div className="container py-8 text-center text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} CoursePilot. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

export default async function ShowcasePage() {
  const projects = await getAllProjects();

  return (
    <PublicLayout>
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center bg-muted/20 overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-10">
                 <div className="absolute h-64 w-64 bg-primary/20 rounded-full -top-16 -left-16 animate-pulse"></div>
                 <div className="absolute h-48 w-48 bg-accent/20 rounded-full -bottom-24 right-10 animate-pulse delay-500"></div>
            </div>
            <div className="container relative z-10">
                <h1 className="text-4xl md:text-6xl font-bold font-headline flex items-center justify-center gap-4">
                    <Rocket className="h-10 w-10 text-accent"/>
                    Project Showcase
                </h1>
                <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    Explore the innovative projects, inspiring creations, and real-world solutions built by the talented students in the CoursePilot community.
                </p>
            </div>
        </section>

        {/* Projects Grid */}
        <section className="py-16 md:py-24">
            <div className="container">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map(project => (
                        <Card key={project.id} className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                            <CardHeader className="p-0">
                                <div className="relative h-56 w-full">
                                    <Image
                                        src={project.imageUrl}
                                        alt={project.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint="project screenshot"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                                <h3 className="font-headline text-xl font-semibold mb-2">{project.title}</h3>
                                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                                    <Avatar className='h-6 w-6'>
                                        <AvatarFallback>{project.student.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{project.student.name}</span>
                                    <span className="text-xs">&middot;</span>
                                    <span className="text-xs">{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
                                {Array.isArray(project.tags) && project.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {project.tags.map(tag => (
                                            <Badge key={tag} variant="secondary">{tag}</Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                <Button asChild className="w-full">
                                    <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        View Project
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {projects.length === 0 && (
                    <div className="text-center py-20 col-span-full">
                        <Rocket className="mx-auto h-16 w-16 text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-semibold">The Showcase is Currently Empty</h3>
                        <p className="mt-2 text-md text-muted-foreground">No projects have been added yet. Be the first to showcase your work!</p>
                    </div>
                )}
            </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-24 bg-muted/30">
            <div className="container text-center">
                 <Sparkles className="mx-auto h-10 w-10 text-accent mb-4" />
                 <h2 className="text-3xl font-bold font-headline">Ready to Showcase Your Own Work?</h2>
                 <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join the CoursePilot community to start learning, building, and sharing your projects with the world.
                </p>
                 <div className="mt-8 flex justify-center gap-4">
                     <Button asChild size="lg">
                        <Link href="/signup">Get Started</Link>
                    </Button>
                 </div>
            </div>
        </section>
    </PublicLayout>
  );
}

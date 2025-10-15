
import { getAllProjects } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';

export default async function ShowcasePage() {
  const projects = await getAllProjects();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Rocket className="h-8 w-8 text-accent"/>
            Project Showcase
        </h1>
        <p className="text-muted-foreground">
          Explore innovative projects built by students in our community.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {projects.map(project => (
          <Card key={project.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-56 w-full">
              <Image
                src={project.imageUrl}
                alt={project.title}
                fill
                className="object-cover rounded-t-lg"
                data-ai-hint="project screenshot"
              />
            </div>
            <CardHeader>
              <CardTitle className="font-headline text-xl">{project.title}</CardTitle>
              <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                <Avatar className='h-6 w-6'>
                  <AvatarFallback>{project.student.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{project.student.name}</span>
                <span className="text-xs">&middot;</span>
                <span className="text-xs">{formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}</span>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter>
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
         <div className="text-center py-20">
            <Rocket className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">The Showcase is Empty</h3>
            <p className="mt-2 text-md text-muted-foreground">No projects have been added yet. Be the first to showcase your work!</p>
        </div>
      )}
    </div>
  );
}


import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import { getProjectsByStudent } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import ProjectForm from '@/components/projects/project-form';

export default async function MyProjectsPage() {
  const { user } = await getSession();
  if (!user || user.role !== 'student') {
    notFound();
  }

  const projects = await getProjectsByStudent(user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">My Projects</h1>
          <p className="text-muted-foreground">Showcase your best work to the community.</p>
        </div>
      </div>

      <ProjectForm />

      <Card>
        <CardHeader>
          <CardTitle>Your Uploaded Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map(project => (
                <Card key={project.id} className="flex flex-col">
                  <div className="relative h-48 w-full">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      fill
                      className="object-cover rounded-t-lg"
                      data-ai-hint="project screenshot"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="font-headline">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                        {project.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                  </CardContent>
                  <CardContent>
                     <Button asChild variant="outline" className="w-full">
                        <Link href={project.projectUrl} target="_blank" rel="noopener noreferrer">
                            View Project
                        </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No Projects Yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Start by adding your first project above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    
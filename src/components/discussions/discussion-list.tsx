
'use client';
import type { User } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import CreateThreadForm from './create-thread-form';
import { useState } from 'react';


type ThreadWithAuthor = {
    id: string;
    courseId: string;
    title: string;
    authorId: string;
    createdAt: string;
    author: User;
    postCount: number;
};

type DiscussionListProps = {
  courseId: string;
  threads: ThreadWithAuthor[];
  isTeacher: boolean;
};

export default function DiscussionList({ courseId, threads, isTeacher }: DiscussionListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Discussions</CardTitle>
            <CardDescription>
            Ask questions, share ideas, and connect with your peers.
            </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Start Discussion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Start a New Discussion</DialogTitle>
              <DialogDescription>
                Post a new topic for discussion in this course.
              </DialogDescription>
            </DialogHeader>
            <CreateThreadForm courseId={courseId} setDialogOpen={setIsDialogOpen} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {threads.length > 0 ? (
          <div className="space-y-4">
            {threads.map((thread) => (
                <Link key={thread.id} href={`/courses/${courseId}/discussions/${thread.id}`} className="block hover:bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>{thread.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{thread.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    Started by {thread.author.name} &middot; {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <MessageSquare className="h-4 w-4" />
                            <span>{thread.postCount}</span>
                        </div>
                    </div>
                </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No discussions have been started yet. Be the first!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

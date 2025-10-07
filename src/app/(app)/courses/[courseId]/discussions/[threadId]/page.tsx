
import { getSession } from '@/lib/session';
import { getThreadById, getPostsByThread, getCourseById, isEnrolled } from '@/lib/data';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import ReplyForm from '@/components/discussions/reply-form';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function DiscussionThreadPage({ params }: { params: { courseId: string, threadId: string } }) {
    const { user } = await getSession();
    if (!user) notFound();

    const thread = await getThreadById(params.threadId);
    const course = await getCourseById(params.courseId);
    
    if (!thread || !course || thread.courseId !== course.id) {
        notFound();
    }
    
    const isTeacher = user.role === 'teacher' && user.id === course.teacherId;
    const isUserEnrolled = user.role === 'student' ? await isEnrolled(user.id, course.id) : false;
    
    if(!isTeacher && !isUserEnrolled) {
        redirect('/courses');
    }

    const posts = await getPostsByThread(params.threadId);
    
    return (
        <div className="space-y-6">
            <div>
                 <Button variant="ghost" asChild className="mb-4">
                    <Link href={`/courses/${params.courseId}?tab=discussions`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Discussions
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold font-headline">{thread.title}</h1>
                <p className="text-sm text-muted-foreground">
                    Started by {thread.author.name} on {format(new Date(thread.createdAt), 'PPP')}
                </p>
            </div>

            <div className="space-y-6">
                {posts.map(post => (
                    <Card key={post.id} className="bg-muted/20">
                        <CardHeader className="flex flex-row items-start justify-between">
                             <div className="flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://i.pravatar.cc/150?u=${post.author.id}`} />
                                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold">{post.author.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Posted on: {format(new Date(post.createdAt), 'PPP p')}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <p className="prose dark:prose-invert max-w-none">{post.content}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ReplyForm threadId={params.threadId} courseId={params.courseId} />
        </div>
    );
}


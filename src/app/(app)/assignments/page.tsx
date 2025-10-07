
import { getSession } from '@/lib/session';
import { getAssignmentsByTeacher } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default async function AssignmentsPage() {
    const { user } = await getSession();
    if (!user || user.role !== 'teacher') {
        notFound();
    }

    const assignments = await getAssignmentsByTeacher(user.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-headline">Assignments</h1>
                <Button asChild>
                    <Link href="/assignments/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Assignment
                    </Link>
                </Button>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>Manage Assignments</CardTitle>
                    <CardDescription>
                        View, create, and grade assignments for your courses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {assignments.length > 0 ? (
                         <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead className="text-center">Submissions</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {assignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">{assignment.title}</TableCell>
                                        <TableCell>{assignment.courseTitle}</TableCell>
                                        <TableCell>{format(new Date(assignment.dueDate), 'PPP')}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={assignment.submissions > 0 ? "secondary" : "outline"}>
                                                {assignment.submissions}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/assignments/${assignment.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" /> View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <p className="text-muted-foreground text-center py-8">You have not created any assignments yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

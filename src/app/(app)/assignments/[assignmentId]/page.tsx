
import { getSession } from "@/lib/session";
import { getAssignmentById } from "@/lib/data";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import GradeSubmissionForm from "@/components/assignments/grade-submission-form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function AssignmentSubmissionsPage({ params }: { params: { assignmentId: string }}) {
    const { user } = await getSession();
    const assignment = await getAssignmentById(params.assignmentId);

    if (!user || user.role !== 'teacher' || !assignment) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Submissions for</p>
                <h1 className="text-3xl font-bold font-headline">{assignment.title}</h1>
                <p className="text-muted-foreground">Due: {format(new Date(assignment.dueDate), 'PPP')}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Submissions</CardTitle>
                    <CardDescription>Review and grade the submissions for this assignment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {assignment.submissions.length > 0 ? (
                        assignment.submissions.map(submission => (
                            <Card key={submission.id} className="bg-muted/20">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar>
                                            <AvatarImage src={`https://i.pravatar.cc/150?u=${submission.student.id}`} />
                                            <AvatarFallback>{submission.student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{submission.student.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Submitted on: {format(new Date(submission.submittedAt), 'PPP p')}
                                            </p>
                                        </div>
                                    </div>
                                    {submission.grade !== null && (
                                        <Badge>Graded: {submission.grade}%</Badge>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <p className="mb-4 p-4 bg-background rounded-md ">{submission.content}</p>
                                    <GradeSubmissionForm submission={submission} assignmentId={assignment.id} />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-10">No submissions have been made for this assignment yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

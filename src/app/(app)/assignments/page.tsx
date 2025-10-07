import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AssignmentsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Assignments</h1>
      <Card>
        <CardHeader>
          <CardTitle>Manage Assignments</CardTitle>
          <CardDescription>
            View, create, and grade assignments for your courses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Assignment management feature is coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}

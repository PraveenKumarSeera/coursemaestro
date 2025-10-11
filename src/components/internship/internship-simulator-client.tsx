
'use client';

import { useState } from 'react';
import type { InternshipDomain, InternshipTask, InternshipGrade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Building, Bot, Rocket, Wind, ArrowLeft } from 'lucide-react';
import { generateInternshipTaskAction, gradeInternshipSubmissionAction } from '@/app/actions/internship';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';

const iconMap: { [key: string]: React.ElementType } = {
  google: Building,
  bot: Bot,
  rocket: Rocket,
  wind: Wind,
};

export default function InternshipSimulatorClient({ domains }: { domains: InternshipDomain[] }) {
  const [selectedDomain, setSelectedDomain] = useState<InternshipDomain | null>(null);
  const [task, setTask] = useState<InternshipTask | null>(null);
  const [submission, setSubmission] = useState<string>('');
  const [grade, setGrade] = useState<InternshipGrade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDomainSelect = async (domain: InternshipDomain) => {
    setIsLoading(true);
    setError(null);
    setTask(null);
    setSelectedDomain(domain);
    
    const result = await generateInternshipTaskAction(domain);
    if (result.task) {
      setTask(result.task);
    } else {
      setError(result.message || 'Failed to generate task.');
    }
    setIsLoading(false);
  };
  
  const handleGradeSubmission = async () => {
    if (!task) return;
    setIsGrading(true);
    setError(null);
    setGrade(null);

    const result = await gradeInternshipSubmissionAction({
        taskTitle: task.title,
        taskDescription: `${task.scenario}\n${task.task}`,
        submissionText: submission
    });

    if (result.grade) {
        setGrade(result.grade);
    } else {
        setError(result.message || 'Failed to grade submission.');
    }

    setIsGrading(false);
  }

  const resetSimulator = () => {
    setSelectedDomain(null);
    setTask(null);
    setSubmission('');
    setGrade(null);
    setError(null);
  };

  if (!selectedDomain) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-headline">Virtual Internship Simulator</h1>
          <p className="text-muted-foreground">Choose a company domain to receive a simulated real-world task.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {domains.map((domain) => {
            const Icon = iconMap[domain.icon] || Building;
            return (
              <Card key={domain.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-6 w-6 text-primary" />
                    <span className="font-headline">{domain.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{domain.description}</p>
                  <Button onClick={() => handleDomainSelect(domain)} className="w-full">
                    Start Task
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
         <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold">Generating Your Task...</h2>
            <p className="text-muted-foreground">The AI is creating a custom scenario for you from the {selectedDomain.name} domain.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={resetSimulator} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Domains
      </Button>

      {task && !grade && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">{task.title}</CardTitle>
                    <CardDescription>A simulated task from the {selectedDomain.name} domain.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold mb-2">Scenario:</h3>
                        <p className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">{task.scenario}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Your Task:</h3>
                        <p className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">{task.task}</p>
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Deliverables:</h3>
                        <ul className="list-disc pl-5 text-muted-foreground space-y-1">
                            {task.deliverables.map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Your Solution</CardTitle>
                    <CardDescription>Enter your solution, proposal, or code in the text area below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea
                        value={submission}
                        onChange={(e) => setSubmission(e.target.value)}
                        placeholder="Describe your solution, outline your plan, or paste your code here..."
                        className="min-h-[250px]"
                    />
                </CardContent>
                <CardContent>
                     <Button onClick={handleGradeSubmission} disabled={isGrading || submission.length < 50} size="lg">
                        {isGrading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Grading Submission...
                            </>
                        ) : (
                             <>
                                <Wand2 className="mr-2 h-4 w-4" />
                                Submit for AI Grading
                            </>
                        )}
                    </Button>
                    {submission.length < 50 && <p className="text-xs text-muted-foreground mt-2">Please provide a more detailed submission (at least 50 characters).</p>}
                </CardContent>
            </Card>
        </>
      )}

      {isGrading && (
         <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pt-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-2xl font-semibold">AI Grading in Progress...</h2>
            <p className="text-muted-foreground">Your submission is being analyzed for creativity and problem-solving.</p>
        </div>
      )}
      
      {grade && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Task Grade & Feedback</CardTitle>
                <CardDescription>AI-powered assessment of your solution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Problem-Solving</p>
                        <p className="text-3xl font-bold text-primary">{grade.problemSolving}%</p>
                        <Progress value={grade.problemSolving} />
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Creativity</p>
                        <p className="text-3xl font-bold text-primary">{grade.creativity}%</p>
                        <Progress value={grade.creativity} />
                    </div>
                     <div className="p-4 bg-background border-2 border-primary rounded-lg">
                        <p className="text-sm font-semibold">Overall Score</p>
                        <p className="text-4xl font-bold text-primary">{grade.overall}%</p>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Feedback:</h3>
                    <p className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none">{grade.feedback}</p>
                </div>

                <Button onClick={resetSimulator} className="w-full" size="lg">Try Another Task</Button>
            </CardContent>
        </Card>
      )}

      {error && <p className="text-destructive text-sm text-center mt-4">{error}</p>}
    </div>
  );
}

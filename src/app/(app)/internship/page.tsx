
'use client';

import { useState } from 'react';
import type { InternshipDomain, InternshipTask, InternshipGrade } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Wand2, Building, Bot, ArrowLeft, Tv, Cloud, Code } from 'lucide-react';
import { gradeInternshipSubmissionAction } from '@/app/actions/internship';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

const iconMap: { [key: string]: React.ElementType } = {
  google: Building,
  openai: Bot,
  netflix: Tv,
  microsoft: Cloud,
  innovate: Code,
};

const internshipDomains: InternshipDomain[] = [
    {
        id: 'google',
        name: 'Google',
        description: 'Solve a challenging problem in software engineering, focusing on scalability and performance, typical of a Google tech challenge.',
        icon: 'google',
        task: {
            title: 'Scalable URL Shortener Service',
            scenario: 'Your team at Google is tasked with creating a new, highly scalable URL shortening service (like goo.gl). The service needs to handle millions of requests per day and provide basic analytics.',
            task: 'Design the system architecture for the URL shortener. Consider the database schema, API endpoints, and how you would handle potential hash collisions. You do not need to write production code, but your design should be clear and well-reasoned.',
            deliverables: [
                'A high-level system architecture diagram.',
                'Pseudo-code for generating a unique short URL from a long URL.',
                'A brief explanation of your database schema choice (e.g., SQL vs. NoSQL).',
            ],
        },
    },
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'Design a novel application of a large language model to solve a common real-world problem in an innovative way.',
        icon: 'openai',
        task: {
            title: 'AI-Powered Email Assistant',
            scenario: 'At OpenAI, your team is exploring new ways to improve productivity using LLMs. The goal is to create an intelligent email assistant that goes beyond simple grammar checks.',
            task: 'Design a feature for an email client that uses an LLM to help users manage their inbox. The feature should be able to categorize incoming emails, summarize long threads, and suggest draft replies based on the user\'s intent.',
            deliverables: [
                'A description of the three main features (categorization, summarization, drafting).',
                'A high-level plan for how you would handle user privacy and data security.',
                'An example of a prompt you might use to ask the LLM to draft a reply to a meeting request.',
            ],
        },
    },
    {
        id: 'netflix',
        name: 'Netflix',
        description: 'Tackle a backend engineering challenge related to a core feature of the Netflix streaming service, focusing on data management and API design.',
        icon: 'netflix',
        task: {
            title: '"My List" Backend Service Design',
            scenario: 'The Netflix "My List" feature is crucial for user engagement. Your team needs to design the backend service that powers this feature, ensuring it is fast, reliable, and can handle tens of millions of users.',
            task: 'Design the API endpoints and database schema for the "My List" service. Your design should handle adding, removing, and reordering items in a user\'s list.',
            deliverables: [
                'A RESTful API specification for the service (endpoints, request/response formats).',
                'A proposed database schema (either SQL or NoSQL) with justification.',
                'An explanation of how you would handle caching to ensure a fast user experience.',
            ],
        },
    },
    {
        id: 'microsoft',
        name: 'Microsoft',
        description: 'Design a core feature for a large-scale cloud product, focusing on distributed systems and data consistency, as you might for a product like Azure or OneDrive.',
        icon: 'microsoft',
        task: {
            title: 'Cloud File Syncing Logic',
            scenario: 'You are an engineer on the Microsoft OneDrive team. A key challenge is ensuring that files are correctly synced across multiple devices (desktop, mobile, web) even when the user is temporarily offline.',
            task: 'Outline the logic for a client-side agent that handles file synchronization. How does it detect changes? How does it resolve conflicts when a file is edited on two devices simultaneously?',
            deliverables: [
                'A state diagram illustrating the lifecycle of a file (e.g., synced, modified, conflicted).',
                'Pseudo-code for the conflict resolution strategy (e.g., "last write wins", creating a duplicate).',
                'A brief explanation of how your system minimizes data transfer to save bandwidth.',
            ],
        },
    },
     {
        id: 'innovate_inc',
        name: 'Innovate Inc. (Startup)',
        description: 'As an early engineer at a fast-growing startup, you need to build foundational tools that will allow the team to ship new features quickly and safely.',
        icon: 'innovate',
        task: {
            title: 'Develop a Feature Flag System',
            scenario: 'Your startup, Innovate Inc., needs to be able to release new features to a subset of users before a full rollout. This practice, known as feature flagging or A/B testing, is critical for minimizing risk.',
            task: 'Design a simple but effective feature flag system. The system should allow developers to wrap new code in a flag and allow an admin to remotely enable or disable that feature for specific users or a percentage of users.',
            deliverables: [
                'An API design for checking if a feature is enabled for a given user.',
                'A database schema to store the flags and their rules (e.g., which users have access).',
                'An example of how a developer would use your system in their code.',
            ],
        },
    }
];

export default function InternshipSimulatorClient() {
  const [selectedDomain, setSelectedDomain] = useState<InternshipDomain | null>(null);
  const [task, setTask] = useState<InternshipTask | null>(null);
  const [submission, setSubmission] = useState<string>('');
  const [grade, setGrade] = useState<InternshipGrade | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDomainSelect = (domain: InternshipDomain) => {
    setIsLoading(true);
    setError(null);
    setTask(null);
    setSelectedDomain(domain);
    setTask(domain.task);
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
          {internshipDomains.map((domain) => {
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
            <h2 className="text-2xl font-semibold">Loading Your Task...</h2>
            <p className="text-muted-foreground">Please wait a moment.</p>
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
                                Submit for Grading
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
            <h2 className="text-2xl font-semibold">Grading in Progress...</h2>
            <p className="text-muted-foreground">Your submission is being analyzed for creativity and problem-solving.</p>
        </div>
      )}
      
      {grade && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Task Grade & Feedback</CardTitle>
                <CardDescription>Assessment of your solution.</CardDescription>
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

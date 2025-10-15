
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, Briefcase, Bot, Cpu, Database, Shield } from 'lucide-react';
import { suggestCareersAction } from '@/app/actions/career-advisor';
import type { GradedSubmission } from '@/lib/types';
import type { CareerAdvisorOutput } from '@/lib/ai-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

const trendingCareers = [
    {
        title: "AI/ML Engineer",
        description: "Build intelligent systems that can learn and make predictions. This role is at the forefront of innovation.",
        skills: ["Python", "TensorFlow", "PyTorch", "Data Modeling", "Algorithms"],
        icon: <Bot className="h-5 w-5 text-accent" />,
    },
    {
        title: "Data Scientist",
        description: "Analyze large datasets to extract meaningful insights and help drive business decisions.",
        skills: ["SQL", "R", "Python", "Statistics", "Machine Learning", "Data Visualization"],
        icon: <Database className="h-5 w-5 text-accent" />,
    },
    {
        title: "Full-Stack Developer",
        description: "Work on both the front-end and back-end of applications, creating a seamless user experience.",
        skills: ["JavaScript", "React", "Node.js", "APIs", "Databases", "HTML/CSS"],
        icon: <Cpu className="h-5 w-5 text-accent" />,
    },
    {
        title: "Cybersecurity Analyst",
        description: "Protect computer systems and networks from security breaches and cyber threats.",
        skills: ["Networking", "Penetration Testing", "Cryptography", "Incident Response"],
        icon: <Shield className="h-5 w-5 text-accent" />,
    },
];


export default function CareerAdvisorClient({ gradedSubmissions }: { gradedSubmissions: GradedSubmission[] }) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CareerAdvisorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    const actionResult = await suggestCareersAction({ gradedSubmissions });

    if (actionResult.suggestions) {
        setResult({ suggestions: actionResult.suggestions });
    } else {
        setError(actionResult.message || 'An unknown error occurred.');
    }

    setIsLoading(false);
  };

  const hasEnoughData = gradedSubmissions.length >= 3;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">AI Career Advisor</h1>
        <p className="text-muted-foreground">
          Discover potential career paths based on your academic performance.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get Your Personalized Suggestions</CardTitle>
          <CardDescription>
            Our AI advisor will analyze your grades to suggest careers where you're likely to excel.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {!hasEnoughData ? (
             <Alert>
                <Briefcase className="h-4 w-4" />
                <AlertTitle>More Data Needed</AlertTitle>
                <AlertDescription>
                    You need at least 3 graded assignments before we can provide career advice. Keep up the great work!
                </AlertDescription>
            </Alert>
          ) : (
            <Button onClick={handleAnalysis} disabled={isLoading} size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing Your Profile...
                    </>
                ) : (
                    <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Suggest Career Paths
                    </>
                )}
            </Button>
          )}
           {error && <p className="text-destructive text-sm text-center mt-4">{error}</p>}
        </CardContent>
      </Card>
      
      {result && result.suggestions && (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline">Your AI-Powered Suggestions</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {result.suggestions.map((suggestion, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline">
                                <Briefcase className="h-5 w-5 text-accent" />
                                {suggestion.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-4">
                            <p className="text-muted-foreground text-sm">{suggestion.description}</p>
                            <div>
                                <h4 className="font-semibold text-sm mb-2">Key Skills:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {suggestion.keySkills.map(skill => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold font-headline">Explore Trending Careers</h2>
        <div className="grid gap-6 md:grid-cols-2">
            {trendingCareers.map((career) => (
                <Card key={career.title} className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline">
                            {career.icon}
                            {career.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                        <p className="text-muted-foreground text-sm">{career.description}</p>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Key Skills:</h4>
                            <div className="flex flex-wrap gap-2">
                                {career.skills.map(skill => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>

    </div>
  );
}

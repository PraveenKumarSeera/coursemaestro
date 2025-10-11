
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Wand2, Zap, Target, CheckCircle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"


type EfficiencyData = {
  score: number;
  components: {
    attention: number;
    completion: number;
    accuracy: number;
  };
};

export default function LearningEfficiencyMeter({ efficiencyData }: { efficiencyData: EfficiencyData }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiTips, setAiTips] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score > 80) return 'bg-green-500';
    if (score > 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleGetTips = async () => {
    setIsLoading(true);
    // In a real app, this would be a server action calling an AI flow.
    // We are returning demo data for now.
    setTimeout(() => {
        const tips = `
### Personalized Tips to Boost Your Efficiency

Based on your scores, here are a few suggestions:

- **Boost Your Attention (Score: ${efficiencyData.components.attention}%):** Your attendance is solid, but you can make it even better. Try to check in to your course pages daily, even if it's just for a few minutes to review the material. Consistency is key!

- **Improve Completion Rate (Score: ${efficiencyData.components.completion}%):** You're completing most of your work, which is great. To get to 100%, try breaking down larger assignments into smaller, manageable tasks. Use the Smart Timetable to schedule blocks for each task.

- **Enhance Accuracy (Score: ${efficiencyData.components.accuracy}%):** Your grades are good! To push them even higher, make sure to review teacher feedback on past assignments. Use the AI Study Assistant to ask clarifying questions about topics you're less confident in.
`;
        setAiTips(tips);
        setIsLoading(false);
    }, 1500);
  };

  return (
    <>
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Learning Efficiency Meter
          </CardTitle>
          <CardDescription>An overview of your learning habits.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-full">
              <div className="flex justify-between items-center mb-1">
                <p className="text-sm font-medium">Overall Score</p>
                <p className="text-lg font-bold">{efficiencyData.score}%</p>
              </div>
              <Progress value={efficiencyData.score} indicatorClassName={getScoreColor(efficiencyData.score)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm pt-2">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <div className="flex flex-col items-center gap-1">
                            <CheckCircle className="h-5 w-5 text-muted-foreground" />
                            <p className="font-semibold">Completion</p>
                            <p className="text-primary font-bold">{efficiencyData.components.completion}%</p>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Assignment completion rate</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger>
                        <div className="flex flex-col items-center gap-1">
                            <Target className="h-5 w-5 text-muted-foreground" />
                            <p className="font-semibold">Accuracy</p>
                            <p className="text-primary font-bold">{efficiencyData.components.accuracy}%</p>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Average grade on assignments</p></TooltipContent>
                </Tooltip>
                 <Tooltip>
                    <TooltipTrigger>
                        <div className="flex flex-col items-center gap-1">
                            <Zap className="h-5 w-5 text-muted-foreground" />
                            <p className="font-semibold">Attention</p>
                            <p className="text-primary font-bold">{efficiencyData.components.attention}%</p>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent><p>Daily course check-in rate</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>
           <div className="pt-4 text-center">
                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Get AI Tips to Improve
                </Button>
            </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>AI-Powered Learning Tips</DialogTitle>
            <DialogDescription>
              Personalized suggestions to help you improve your learning efficiency.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4 min-h-[250px] flex items-center justify-center">
            {isLoading ? (
              <div className="text-center space-y-2">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating your tips...</p>
              </div>
            ) : aiTips ? (
              <div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: aiTips.replace(/\n/g, '<br />') }} />
            ) : (
              <Button onClick={handleGetTips}>Generate My Tips</Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

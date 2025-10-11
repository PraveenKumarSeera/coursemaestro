
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { voteOnSubmissionAction } from '@/app/actions/challenges';
import { useToast } from '@/hooks/use-toast';

type VoteButtonProps = {
  submissionId: string;
  challengeId: string;
  initialVotes: number;
  isOwner: boolean;
};

export default function VoteButton({ submissionId, challengeId, initialVotes, isOwner }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [votes, setVotes] = useState(initialVotes);
  const { toast } = useToast();

  const handleVote = () => {
    if (isOwner) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You cannot vote for your own submission."
        });
        return;
    }
    
    startTransition(async () => {
      const result = await voteOnSubmissionAction(submissionId, challengeId);
      if (result.success) {
        setVotes(v => v + 1);
        toast({
            title: "Success",
            description: "Your vote has been counted!",
        });
      } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.message
        });
      }
    });
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleVote}
      disabled={isPending || isOwner}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <ThumbsUp className="mr-2 h-4 w-4" />
      )}
      Vote ({votes})
    </Button>
  );
}

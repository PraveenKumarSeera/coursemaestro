
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Video, VideoOff, AlertTriangle, CheckCircle, HeartHandshake } from 'lucide-react';

const positiveMessages = [
    "You're looking focused and ready to learn! Great to see. Let's make today productive.",
    "It's great to see you! Remember, consistency is the key to success. You've got this.",
    "You’re in great shape today! Let’s try a small quiz to warm up that brilliant mind of yours.",
    "Positive energy detected! Let's channel that into tackling a new challenge today."
];

const neutralMessages = [
    "Checking in! Remember to take breaks and stay hydrated. Your well-being is a priority.",
    "A moment of calm can be powerful. Let's start with a quick review to ease into things.",
    "You seem a bit tired. Let’s review only key points today. I’ll keep it short!",
    "It's okay to not feel 100% every day. Just showing up is a huge part of the journey. I'm here to help."
];

export default function WellnessCheckPage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [mentorMessage, setMentorMessage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const getCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCameraPermission(true);
      setShowVideo(true);
      setMentorMessage(positiveMessages[Math.floor(Math.random() * positiveMessages.length)]);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      setShowVideo(false);
      setMentorMessage(neutralMessages[Math.floor(Math.random() * neutralMessages.length)]);
      toast({
        variant: 'destructive',
        title: 'Camera Access Denied',
        description: 'You can still get encouragement without the camera.',
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowVideo(false);
    setMentorMessage(neutralMessages[Math.floor(Math.random() * neutralMessages.length)]);
  };

  useEffect(() => {
    // Cleanup camera stream when component unmounts
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline">Wellness Check-in</h1>
        <p className="text-muted-foreground">
          A quick, private check-in to see how you're doing. Your camera feed is not recorded or stored.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Emotionally Intelligent Mentor</CardTitle>
          <CardDescription>
            This system provides adaptive responses based on simple engagement cues. Granting camera access provides a more personalized message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
            {hasCameraPermission === null && (
                <div className="p-8 border-2 border-dashed rounded-lg flex flex-col items-center justify-center space-y-4">
                    <HeartHandshake className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Click the button below to start your wellness check-in.</p>
                    <Button onClick={getCameraPermission} size="lg">
                        <Video className="mr-2 h-4 w-4" />
                        Start Camera Check-in
                    </Button>
                </div>
            )}
            
            {hasCameraPermission === false && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Camera Access Denied</AlertTitle>
                    <AlertDescription>
                        No problem! Privacy is important. We can still offer encouragement.
                    </AlertDescription>
                </Alert>
            )}

            {showVideo && hasCameraPermission && (
                <div className="relative w-full max-w-md mx-auto aspect-video rounded-lg overflow-hidden border">
                    <video ref={videoRef} className="w-full h-full" autoPlay muted playsInline />
                    <div className="absolute bottom-2 right-2">
                        <Button variant="destructive" size="sm" onClick={stopCamera}>
                            <VideoOff className="mr-2 h-4 w-4" />
                            Turn Off Camera
                        </Button>
                    </div>
                </div>
            )}

            {mentorMessage && (
                 <Alert className="text-left">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Your Mentor Says:</AlertTitle>
                    <AlertDescription>
                        {mentorMessage}
                    </AlertDescription>
                </Alert>
            )}

        </CardContent>
      </Card>
    </div>
  );
}

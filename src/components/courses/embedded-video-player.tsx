
'use client';

import { useEffect, useRef, useState } from 'react';
import { useStudentActivityBroadcaster } from '@/hooks/use-live-student-activity';

type VideoPlayerProps = {
  videoUrl: string;
};

// Helper to get video ID from YouTube URL
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper to get video ID from Vimeo URL
const getVimeoId = (url: string) => {
  const regExp = /vimeo.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export default function EmbeddedVideoPlayer({ videoUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { broadcastActivity } = useStudentActivityBroadcaster();

  useEffect(() => {
    setIsClient(true);
    // Load last watched time from local storage
    if (videoRef.current) {
      const lastTime = localStorage.getItem(`video-progress-${videoUrl}`);
      if (lastTime) {
        videoRef.current.currentTime = parseFloat(lastTime);
      }
    }
  }, [videoUrl]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      // Save current time to local storage
      localStorage.setItem(`video-progress-${videoUrl}`, videoRef.current.currentTime.toString());
    }
  };

  const handlePlay = () => {
    broadcastActivity('watching');
  }

  const handlePause = () => {
    broadcastActivity('idle');
  }
  
  if (!isClient) {
      return null;
  }

  const youTubeId = getYouTubeId(videoUrl);
  if (youTubeId) {
    // YouTube API doesn't easily support play/pause events across origins
    // For simplicity, we won't broadcast for YouTube
    return (
      <div className="aspect-video w-full">
        <iframe
          src={`https://www.youtube.com/embed/${youTubeId}?autoplay=0&rel=0`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full rounded-lg"
        ></iframe>
      </div>
    );
  }
  
  const vimeoId = getVimeoId(videoUrl);
  if(vimeoId) {
       // Vimeo API also has cross-origin restrictions for events
      return (
          <div className="aspect-video w-full">
               <iframe 
                    src={`https://player.vimeo.com/video/${vimeoId}`} 
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowFullScreen
                    className="w-full h-full rounded-lg"
                ></iframe>
          </div>
      )
  }

  // Fallback for direct video links (e.g., .mp4 from cloud storage)
  return (
    <div className="aspect-video w-full">
      <video
        ref={videoRef}
        controls
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        className="w-full h-full rounded-lg bg-black"
        // The controlsList attribute is not fully standard but works in Chrome/Edge
        // to provide more control over the player UI.
        // @ts-ignore
        controlsList="nodownload noremoteplayback"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle } from 'lucide-react';

interface WebcamOverlayProps {
  enabled: boolean;
  opacity: number;
  layout: 'backdrop' | 'pip';
  mirrorHorizontal: boolean;
}

export const WebcamOverlay: React.FC<WebcamOverlayProps> = ({
  enabled,
  opacity,
  layout,
  mirrorHorizontal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let active = true;

    async function startCamera() {
      try {
        setError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.log('Autoplay blocked:', e));
        }
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setError('Camera access denied or camera not found');
      }
    }

    startCamera();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [enabled]);

  if (!enabled) return null;

  if (error) {
    return (
      <div className="absolute top-4 right-4 z-30 bg-red-950/80 border border-red-500/40 text-red-200 text-xs px-3.5 py-2 rounded-2xl flex items-center gap-2 backdrop-blur-md shadow-lg">
        <AlertCircle className="w-4 h-4 text-red-400" />
        <span>{error}</span>
      </div>
    );
  }

  // Backdrop layout (behind prompter text) or PiP layout (floating corner preview)
  if (layout === 'pip') {
    return (
      <div className="absolute bottom-24 right-6 z-30 w-52 md:w-64 aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-500/40 bg-black/80 backdrop-blur-md">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: mirrorHorizontal ? 'none' : 'scaleX(-1)' }}
        />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] text-blue-300 font-medium flex items-center gap-1">
          <Camera className="w-3 h-3 text-blue-400" />
          <span>Studio Shadowing</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ opacity }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ transform: mirrorHorizontal ? 'none' : 'scaleX(-1)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/80" />
    </div>
  );
};

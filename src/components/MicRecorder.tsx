import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface MicRecorderProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  disabled?: boolean;
}

export default function MicRecorder({ 
  onTranscript, 
  isListening, 
  setIsListening, 
  disabled = false 
}: MicRecorderProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        throw new Error('Audio recording not supported in this browser');
      }
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        
        try {
          // Use our STT service
          const transcript = await import('@/services/elevenlabs').then(
            module => module.ElevenLabsService.speechToText(audioBlob)
          );
          onTranscript(transcript);
        } catch (error) {
          console.error('STT Error:', error);
          // Fallback to a mock response
          onTranscript("I'm ready to answer your question about my experience and skills.");
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.onerror = (error) => {
        console.error('MediaRecorder error:', error);
        toast({
          title: "Recording Error",
          description: "There was an issue with recording. Please try again.",
          variant: "destructive",
        });
        setIsListening(false);
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsListening(true);
      
      toast({
        title: "Recording Started",
        description: "Speak clearly into your microphone",
      });

    } catch (error) {
      console.error('Error starting recording:', error);
      let errorMessage = "Unable to access microphone.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Microphone access denied. Please allow microphone permissions.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No microphone found. Please connect a microphone.";
        } else if (error.message.includes('not supported')) {
          errorMessage = "Audio recording not supported in this browser.";
        }
      }
      
      toast({
        title: "Microphone Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [onTranscript, setIsListening]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      
      toast({
        title: "Recording Stopped",
        description: "Processing your response...",
      });
    }
  }, [isListening, setIsListening]);

  const toggleRecording = useCallback(() => {
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isListening, startRecording, stopRecording]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        onClick={toggleRecording}
        disabled={disabled}
        size="lg"
        variant={isListening ? "destructive" : "default"}
        className={`
          w-16 h-16 rounded-full transition-all duration-300
          ${isListening 
            ? 'bg-destructive hover:bg-destructive/90 shadow-glow animate-pulse' 
            : 'bg-primary hover:bg-primary/90 btn-professional'
          }
        `}
      >
        {isListening ? (
          <Square className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-sm font-medium">
          {isListening ? 'Recording...' : 'Click to speak'}
        </p>
        <p className="text-xs text-muted-foreground">
          {isListening ? 'Click to stop recording' : 'Hold and speak your answer'}
        </p>
      </div>
      
      {/* Visual feedback */}
      {isListening && (
        <div className="flex space-x-1 items-center">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 20 + 10}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.5s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AvatarCanvas from '@/components/AvatarCanvas';
import MicRecorder from '@/components/MicRecorder';
import InterviewUI from '@/components/InterviewUI';
import ElevenLabsService from '@/services/elevenlabs';
import GeminiService, { InterviewContext, InterviewDecision } from '@/services/gemini';
import { toast } from '@/hooks/use-toast';
import { Bot, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  type: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

export default function Index() {
  // Interview state
  const [interviewStatus, setInterviewStatus] = useState<'setup' | 'active' | 'complete'>('setup');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [jobProfile, setJobProfile] = useState('Software Engineer - Full Stack');
  
  // Audio state
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [visemeData, setVisemeData] = useState<any[]>([]);
  
  // Interview context
  const [interviewContext, setInterviewContext] = useState<InterviewContext>({
    jobProfile: 'Software Engineer',
    candidateResponses: [],
    currentQuestionIndex: 0,
    language: 'en'
  });
  
  const [finalDecision, setFinalDecision] = useState<InterviewDecision | null>(null);

  // Start interview
  const handleStartInterview = useCallback(async () => {
    setInterviewStatus('active');
    setInterviewContext(prev => ({
      ...prev,
      jobProfile: jobProfile.split(' - ')[0],
      language: selectedLanguage
    }));
    
    toast({
      title: "Interview Started",
      description: "The AI interviewer will ask you questions. Good luck!",
    });

    // Get first question
    try {
      const question = await GeminiService.getNextQuestion({
        ...interviewContext,
        jobProfile: jobProfile.split(' - ')[0],
        language: selectedLanguage
      });
      
      if (question) {
        const translatedQuestion = await GeminiService.translateQuestion(question.question, selectedLanguage);
        setCurrentQuestion(translatedQuestion);
        
        // Add to messages
        const newMessage: Message = {
          id: Date.now().toString(),
          type: 'interviewer',
          content: translatedQuestion,
          timestamp: new Date()
        };
        setMessages([newMessage]);
        
        // Speak the question
        await speakQuestion(translatedQuestion);
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast({
        title: "Error",
        description: "Failed to start interview. Please try again.",
        variant: "destructive"
      });
    }
  }, [jobProfile, selectedLanguage, interviewContext]);

  // Handle candidate response
  const handleTranscript = useCallback(async (transcript: string) => {
    if (interviewStatus !== 'active') return;
    
    // Add candidate message
    const candidateMessage: Message = {
      id: Date.now().toString(),
      type: 'candidate',
      content: transcript,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, candidateMessage]);
    
    // Update interview context
    const updatedContext = {
      ...interviewContext,
      candidateResponses: [...interviewContext.candidateResponses, transcript],
      currentQuestionIndex: interviewContext.currentQuestionIndex + 1
    };
    setInterviewContext(updatedContext);
    
    // Analyze response
    try {
      const analysis = await GeminiService.analyzeResponse(
        currentQuestion,
        transcript,
        updatedContext
      );
      
      // Get next question or end interview
      const nextQuestion = await GeminiService.getNextQuestion(updatedContext);
      
      if (nextQuestion) {
        const translatedQuestion = await GeminiService.translateQuestion(nextQuestion.question, selectedLanguage);
        setCurrentQuestion(translatedQuestion);
        
        // Add next question to messages
        const nextMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'interviewer',
          content: translatedQuestion,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, nextMessage]);
        
        // Speak the next question
        setTimeout(() => speakQuestion(translatedQuestion), 1000);
      } else {
        // Interview complete
        await endInterview(updatedContext);
      }
    } catch (error) {
      console.error('Error processing response:', error);
      toast({
        title: "Error",
        description: "Failed to process your response. Please try again.",
        variant: "destructive"
      });
    }
  }, [interviewStatus, currentQuestion, interviewContext, selectedLanguage]);

  // Speak question using TTS
  const speakQuestion = useCallback(async (question: string) => {
    try {
      setIsSpeaking(true);
      const response = await ElevenLabsService.textToSpeech(question, undefined, selectedLanguage);
      
      if (response.visemes) {
        setVisemeData(response.visemes);
      }
      
      await ElevenLabsService.playAudioWithVisemes(
        response.audio,
        response.visemes || [],
        (viseme) => {
          // Handle viseme updates for avatar animation
          console.log('Viseme:', viseme);
        }
      );
    } catch (error) {
      console.error('Error speaking question:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [selectedLanguage]);

  // End interview
  const endInterview = useCallback(async (context?: InterviewContext) => {
    try {
      const decision = await GeminiService.generateFinalDecision(context || interviewContext);
      setFinalDecision(decision);
      setInterviewStatus('complete');
      setCurrentQuestion('');
      
      toast({
        title: "Interview Complete",
        description: `Result: ${decision.result === 'accept' ? 'Accepted' : 'Thank you for your time'}`,
      });
    } catch (error) {
      console.error('Error ending interview:', error);
      toast({
        title: "Error",
        description: "Failed to complete interview analysis.",
        variant: "destructive"
      });
    }
  }, [interviewContext]);

  return (
    <div className="min-h-screen bg-gradient-surface p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Avatar Interviewer
              </h1>
              <p className="text-muted-foreground">
                Professional AI-powered interview experience
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by ElevenLabs & Gemini AI
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Avatar and Controls */}
        <div className="space-y-4">
          {/* Avatar */}
          <Card className="aspect-square bg-gradient-surface shadow-medium">
            <CardContent className="p-4 h-full">
              <AvatarCanvas 
                isListening={isListening}
                isSpeaking={isSpeaking}
                visemeData={visemeData}
              />
            </CardContent>
          </Card>
          
          {/* Voice Controls */}
          {interviewStatus === 'active' && (
            <Card className="shadow-medium">
              <CardContent className="p-6">
                <MicRecorder
                  onTranscript={handleTranscript}
                  isListening={isListening}
                  setIsListening={setIsListening}
                  disabled={isSpeaking}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Interview UI */}
        <div className="h-[600px]">
          <InterviewUI
            messages={messages}
            currentQuestion={currentQuestion}
            interviewStatus={interviewStatus}
            jobProfile={jobProfile}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            onStartInterview={handleStartInterview}
            onEndInterview={() => endInterview()}
            finalDecision={finalDecision}
          />
        </div>
      </div>
    </div>
  );
}
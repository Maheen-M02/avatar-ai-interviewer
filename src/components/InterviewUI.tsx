import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Bot, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Languages,
  Briefcase,
  MessageSquare
} from 'lucide-react';

interface Message {
  id: string;
  type: 'interviewer' | 'candidate';
  content: string;
  timestamp: Date;
}

interface InterviewUIProps {
  messages: Message[];
  currentQuestion: string;
  interviewStatus: 'setup' | 'active' | 'complete';
  jobProfile: string;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onStartInterview: () => void;
  onEndInterview: () => void;
  finalDecision?: {
    result: 'accept' | 'reject';
    reasoning: string;
    score: number;
  };
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
];

export default function InterviewUI({
  messages,
  currentQuestion,
  interviewStatus,
  jobProfile,
  selectedLanguage,
  onLanguageChange,
  onStartInterview,
  onEndInterview,
  finalDecision
}: InterviewUIProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (interviewStatus === 'active') {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [interviewStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = () => {
    switch (interviewStatus) {
      case 'setup':
        return <Badge variant="secondary">Setup</Badge>;
      case 'active':
        return <Badge className="bg-interview-active text-white">In Progress</Badge>;
      case 'complete':
        return <Badge className="bg-interview-complete text-white">Complete</Badge>;
      default:
        return null;
    }
  };

  if (interviewStatus === 'setup') {
    return (
      <Card className="w-full h-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Briefcase className="h-5 w-5" />
            Interview Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Profile */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Job Profile</label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{jobProfile || "Software Engineer - Full Stack"}</p>
            </div>
          </div>

          {/* Language Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Interview Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <Button
                  key={lang.code}
                  variant={selectedLanguage === lang.code ? "default" : "outline"}
                  onClick={() => onLanguageChange(lang.code)}
                  className="justify-start"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Start Interview */}
          <div className="text-center space-y-4">
            <div className="p-4 bg-interview-surface rounded-lg">
              <h3 className="font-semibold mb-2">Ready to begin?</h3>
              <p className="text-sm text-muted-foreground">
                The AI interviewer will ask you questions based on the job profile. 
                Speak clearly and provide detailed answers.
              </p>
            </div>
            
            <Button 
              onClick={onStartInterview}
              size="lg"
              className="w-full btn-professional"
            >
              Start Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (interviewStatus === 'complete' && finalDecision) {
    return (
      <Card className="w-full h-full">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {finalDecision.result === 'accept' ? (
              <CheckCircle className="h-5 w-5 text-interview-active" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
            Interview Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Result */}
          <div className="text-center space-y-4">
            <div className={`p-6 rounded-lg ${
              finalDecision.result === 'accept' 
                ? 'bg-interview-active/10 border border-interview-active/20' 
                : 'bg-destructive/10 border border-destructive/20'
            }`}>
              <h3 className={`text-xl font-bold mb-2 ${
                finalDecision.result === 'accept' ? 'text-interview-active' : 'text-destructive'
              }`}>
                {finalDecision.result === 'accept' ? 'Congratulations!' : 'Thank You'}
              </h3>
              <p className="text-sm">
                {finalDecision.result === 'accept' 
                  ? 'You have been selected for the next round!' 
                  : 'We appreciate your time and interest.'}
              </p>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{finalDecision.score}%</div>
                <div className="text-xs text-muted-foreground">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">{formatTime(elapsedTime)}</div>
                <div className="text-xs text-muted-foreground">Duration</div>
              </div>
            </div>

            {/* Reasoning */}
            <div className="p-4 bg-muted rounded-lg text-left">
              <h4 className="font-medium mb-2">Feedback</h4>
              <p className="text-sm text-muted-foreground">{finalDecision.reasoning}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Interview Chat
          </CardTitle>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {formatTime(elapsedTime)}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.type === 'candidate' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'interviewer' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.type === 'interviewer' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                
                <div className={`flex-1 max-w-[80%] ${
                  message.type === 'candidate' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'interviewer'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Current Question */}
            {currentQuestion && interviewStatus === 'active' && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                    <p className="text-sm font-medium">{currentQuestion}</p>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Waiting for your response...
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* End Interview Button */}
        {interviewStatus === 'active' && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={onEndInterview}
              variant="outline"
              size="sm"
              className="w-full"
            >
              End Interview
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
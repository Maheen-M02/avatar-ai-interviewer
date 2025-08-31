// Gemini AI service for interview logic
// Mock implementation for frontend demo

const GEMINI_API_KEY = 'AIzaSyA2OLm2A1OK3wuxgKPmnspU-ou4_HpincE';

export interface InterviewContext {
  jobProfile: string;
  candidateResponses: string[];
  currentQuestionIndex: number;
  language: string;
}

export interface InterviewQuestion {
  question: string;
  category: 'technical' | 'behavioral' | 'experience' | 'closing';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewDecision {
  result: 'accept' | 'reject';
  reasoning: string;
  score: number;
  strengths: string[];
  improvements: string[];
}

export class GeminiService {
  private static interviewQuestions: { [key: string]: InterviewQuestion[] } = {
    'Software Engineer': [
      {
        question: "Tell me about yourself and your experience in software development.",
        category: 'experience',
        difficulty: 'easy'
      },
      {
        question: "How do you approach debugging a complex issue in a production system?",
        category: 'technical',
        difficulty: 'medium'
      },
      {
        question: "Describe a challenging project you worked on and how you overcame the obstacles.",
        category: 'behavioral',
        difficulty: 'medium'
      },
      {
        question: "What's your experience with modern JavaScript frameworks like React or Vue?",
        category: 'technical',
        difficulty: 'medium'
      },
      {
        question: "How do you stay updated with the latest technology trends?",
        category: 'behavioral',
        difficulty: 'easy'
      },
      {
        question: "Do you have any questions about the role or our company?",
        category: 'closing',
        difficulty: 'easy'
      }
    ],
    'Sales Manager': [
      {
        question: "Tell me about your sales experience and biggest achievements.",
        category: 'experience',
        difficulty: 'easy'
      },
      {
        question: "How do you handle rejection and maintain motivation in sales?",
        category: 'behavioral',
        difficulty: 'medium'
      },
      {
        question: "Describe your approach to building and managing a sales pipeline.",
        category: 'technical',
        difficulty: 'medium'
      },
      {
        question: "How do you handle difficult customers or challenging negotiations?",
        category: 'behavioral',
        difficulty: 'hard'
      },
      {
        question: "What CRM tools have you used and how do you leverage data in sales?",
        category: 'technical',
        difficulty: 'medium'
      }
    ]
  };

  static async getNextQuestion(context: InterviewContext): Promise<InterviewQuestion | null> {
    // Mock implementation - in production, this would call Gemini API
    console.log('Getting next question for context:', context);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const questions = this.interviewQuestions[context.jobProfile] || this.interviewQuestions['Software Engineer'];
    
    if (context.currentQuestionIndex >= questions.length) {
      return null; // Interview complete
    }
    
    return questions[context.currentQuestionIndex];
  }

  static async analyzeResponse(
    question: string, 
    response: string, 
    context: InterviewContext
  ): Promise<{ score: number; feedback: string }> {
    // Mock analysis - in production, this would use Gemini API
    console.log('Analyzing response:', { question, response, context });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock scoring based on response length and keywords
    const responseLength = response.split(' ').length;
    const hasKeywords = this.checkKeywords(response, context.jobProfile);
    
    let score = Math.min(100, Math.max(20, responseLength * 2 + (hasKeywords ? 20 : 0)));
    
    const feedback = this.generateMockFeedback(score, responseLength);
    
    return { score, feedback };
  }

  static async generateFinalDecision(context: InterviewContext): Promise<InterviewDecision> {
    // Mock decision generation - in production, this would use Gemini API
    console.log('Generating final decision for context:', context);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock scoring based on number of responses and their quality
    const avgResponseLength = context.candidateResponses.reduce(
      (sum, response) => sum + response.split(' ').length, 0
    ) / context.candidateResponses.length;
    
    const score = Math.min(95, Math.max(35, avgResponseLength * 3 + Math.random() * 20));
    const result = score >= 70 ? 'accept' : 'reject';
    
    const decision: InterviewDecision = {
      result,
      score: Math.round(score),
      reasoning: this.generateDecisionReasoning(result, score, context),
      strengths: this.generateStrengths(context),
      improvements: this.generateImprovements(context)
    };
    
    return decision;
  }

  private static checkKeywords(response: string, jobProfile: string): boolean {
    const keywords = {
      'Software Engineer': ['javascript', 'react', 'node', 'typescript', 'api', 'database', 'code', 'development'],
      'Sales Manager': ['sales', 'customer', 'revenue', 'target', 'negotiation', 'pipeline', 'crm', 'client']
    };
    
    const profileKeywords = keywords[jobProfile] || keywords['Software Engineer'];
    const responseLower = response.toLowerCase();
    
    return profileKeywords.some(keyword => responseLower.includes(keyword));
  }

  private static generateMockFeedback(score: number, responseLength: number): string {
    if (score >= 80) {
      return "Excellent response! You demonstrated strong knowledge and provided specific examples.";
    } else if (score >= 60) {
      return "Good response with relevant information. Could benefit from more specific examples.";
    } else if (score >= 40) {
      return "Adequate response but could use more detail and specific examples to strengthen your answer.";
    } else {
      return "Response could be improved with more specific details and examples relevant to the role.";
    }
  }

  private static generateDecisionReasoning(result: string, score: number, context: InterviewContext): string {
    if (result === 'accept') {
      return `Strong candidate with good communication skills and relevant experience for the ${context.jobProfile} position. Demonstrated technical knowledge and provided thoughtful responses to behavioral questions.`;
    } else {
      return `While the candidate shows potential, responses lacked sufficient detail and specific examples required for the ${context.jobProfile} role. Would benefit from more hands-on experience.`;
    }
  }

  private static generateStrengths(context: InterviewContext): string[] {
    const commonStrengths = [
      "Clear communication skills",
      "Relevant technical background",
      "Professional demeanor",
      "Problem-solving approach"
    ];
    
    return commonStrengths.slice(0, 2 + Math.floor(Math.random() * 2));
  }

  private static generateImprovements(context: InterviewContext): string[] {
    const commonImprovements = [
      "Provide more specific examples",
      "Elaborate on technical implementations",
      "Discuss measurable outcomes",
      "Share more project details"
    ];
    
    return commonImprovements.slice(0, 1 + Math.floor(Math.random() * 2));
  }

  // Helper method to translate questions to different languages
  static async translateQuestion(question: string, targetLanguage: string): Promise<string> {
    // Mock translation - in production, use Gemini API for translation
    if (targetLanguage === 'en') return question;
    
    // Mock translations for demo
    const translations: { [key: string]: { [key: string]: string } } = {
      'hi': {
        "Tell me about yourself and your experience in software development.": "अपने बारे में और सॉफ्टवेयर डेवलपमेंट में अपने अनुभव के बारे में बताएं।",
        "How do you approach debugging a complex issue in a production system?": "आप प्रोडक्शन सिस्टम में एक जटिल समस्या को डिबग करने के लिए कैसे पहुंचते हैं?"
      }
    };
    
    return translations[targetLanguage]?.[question] || question;
  }
}

export default GeminiService;
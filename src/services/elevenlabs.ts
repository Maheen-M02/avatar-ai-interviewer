// ElevenLabs API integration service
// Note: This is a mock implementation for the frontend demo
// In production, these API calls should be made from the backend

const ELEVENLABS_API_KEY = 'sk_c1e5385a9b7d146bf10234412ac88fe8493f509cadacc748';
const VOICE_ID = 'jqcCZkN6Knx8BJ5TBdYR';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface TTSRequest {
  text: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

export interface TTSResponse {
  audio: Blob;
  visemes?: any[];
}

// Mock functions for demo - replace with actual API calls in production
export class ElevenLabsService {
  private static defaultVoiceSettings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.0,
    use_speaker_boost: true
  };

  static async textToSpeech(
    text: string, 
    voiceId: string = VOICE_ID,
    language: string = 'en'
  ): Promise<TTSResponse> {
    // Mock implementation - in production, call the actual ElevenLabs API
    console.log(`TTS Request: "${text}" in ${language} with voice ${voiceId}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock audio blob and visemes
    const mockAudio = new Blob(['mock audio data'], { type: 'audio/mpeg' });
    const mockVisemes = this.generateMockVisemes(text);
    
    return {
      audio: mockAudio,
      visemes: mockVisemes
    };
  }

  static async speechToText(audioBlob: Blob, language: string = 'en'): Promise<string> {
    // Mock implementation - in production, call the actual ElevenLabs STT API
    console.log(`STT Request: Audio blob of size ${audioBlob.size} bytes in ${language}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock transcript
    const mockTranscripts = [
      "I have 5 years of experience in full-stack development, primarily working with React and Node.js.",
      "Yes, I'm familiar with TypeScript and have used it in several production projects.",
      "I believe my problem-solving skills and ability to work in agile environments make me a good fit.",
      "I'm passionate about creating user-friendly applications and staying updated with the latest technologies.",
      "My greatest strength is my ability to break down complex problems into manageable solutions."
    ];
    
    return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
  }

  static async getVoices(): Promise<any[]> {
    // Mock voices list
    return [
      { voice_id: VOICE_ID, name: 'Professional Interview Voice', preview_url: null },
      { voice_id: 'another_voice_id', name: 'Alternative Voice', preview_url: null }
    ];
  }

  private static generateMockVisemes(text: string): any[] {
    // Generate mock viseme data for lip-sync animation
    const words = text.split(' ');
    const visemes = [];
    let timeOffset = 0;
    
    words.forEach((word, index) => {
      const duration = word.length * 100 + Math.random() * 200; // Mock duration
      visemes.push({
        time: timeOffset,
        value: Math.floor(Math.random() * 10), // Random viseme ID (0-9)
        duration: duration
      });
      timeOffset += duration;
    });
    
    return visemes;
  }

  // Helper method to play audio with viseme sync
  static async playAudioWithVisemes(
    audioBlob: Blob, 
    visemes: any[], 
    onViseme?: (viseme: any) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      audio.addEventListener('loadeddata', () => {
        if (visemes && onViseme) {
          // Sync visemes with audio playback
          let visemeIndex = 0;
          const startTime = Date.now();
          
          const visemeTimer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            
            if (visemeIndex < visemes.length && elapsed >= visemes[visemeIndex].time) {
              onViseme(visemes[visemeIndex]);
              visemeIndex++;
            }
            
            if (visemeIndex >= visemes.length || audio.ended) {
              clearInterval(visemeTimer);
            }
          }, 50);
        }
      });
      
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audio.src);
        resolve();
      });
      
      audio.play().catch(console.error);
    });
  }
}

export default ElevenLabsService;
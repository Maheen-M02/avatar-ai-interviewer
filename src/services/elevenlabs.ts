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
    try {
      console.log(`ElevenLabs TTS Request: "${text}" with voice ${voiceId} in ${language}`);
      
      // Prepare the request payload
      const requestBody = {
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      };

      // Make the API call to ElevenLabs
      const response = await fetch(`${ELEVENLABS_BASE_URL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      // Get the audio blob
      const audioBlob = await response.blob();
      console.log(`TTS Success: Generated ${audioBlob.size} bytes of audio`);
      
      // Generate mock visemes for lip-sync (real visemes require a separate API call)
      const mockVisemes = this.generateMockVisemes(text);
      
      return {
        audio: audioBlob,
        visemes: mockVisemes
      };
      
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error);
      
      // Fallback to Web Speech API if ElevenLabs fails
      console.log('Falling back to Web Speech API...');
      const fallbackAudio = await this.generateSpeechAudio(text, language);
      const mockVisemes = this.generateMockVisemes(text);
      
      return {
        audio: fallbackAudio,
        visemes: mockVisemes
      };
    }
  }

  static async speechToText(audioBlob: Blob, language: string = 'en'): Promise<string> {
    // Try using Web Speech API for demo, fallback to mock
    try {
      const transcript = await this.transcribeWithWebSpeechAPI(audioBlob);
      if (transcript) {
        console.log(`STT Success: "${transcript}"`);
        return transcript;
      }
    } catch (error) {
      console.log('Web Speech API not available, using mock transcript');
    }
    
    // Fallback to mock implementation
    console.log(`STT Request: Audio blob of size ${audioBlob.size} bytes in ${language}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    // Generate mock viseme data for lip-sync animation based on text
    const words = text.split(' ');
    const visemes = [];
    let timeOffset = 0;
    
    words.forEach((word) => {
      // Create visemes for each phoneme-like unit in the word
      const phonemes = word.toLowerCase().replace(/[^a-z]/g, '').split('');
      
      phonemes.forEach((char) => {
        // Map characters to viseme IDs (simplified phoneme mapping)
        let visemeId = 0;
        
        // Vowels
        if ('aeiou'.includes(char)) {
          visemeId = Math.floor(Math.random() * 3) + 1; // Visemes 1-3 for vowels
        }
        // Consonants
        else if ('bcdfghjklmnpqrstvwxyz'.includes(char)) {
          if ('bmp'.includes(char)) visemeId = 4; // Bilabial
          else if ('fv'.includes(char)) visemeId = 5; // Labiodental
          else if ('tdnl'.includes(char)) visemeId = 6; // Alveolar
          else if ('kg'.includes(char)) visemeId = 7; // Velar
          else visemeId = 8; // Other consonants
        }
        
        const duration = Math.random() * 150 + 100; // 100-250ms per phoneme
        
        visemes.push({
          time: timeOffset,
          value: visemeId,
          duration: duration
        });
        
        timeOffset += duration;
      });
      
      // Add a brief pause between words
      timeOffset += 50;
    });
    
    return visemes;
  }

  // Generate speech audio using Web Speech API for demo
  private static async generateSpeechAudio(text: string, language: string = 'en'): Promise<Blob> {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.mapLanguageCode(language);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Find a good voice for the language
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.lang.startsWith(utterance.lang) && !voice.localService
        ) || voices.find(voice => 
          voice.lang.startsWith(utterance.lang)
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        speechSynthesis.speak(utterance);
        
        utterance.onend = () => {
          // Create a minimal audio blob as a placeholder
          const buffer = new ArrayBuffer(1024);
          resolve(new Blob([buffer], { type: 'audio/wav' }));
        };

        utterance.onerror = () => {
          // Fallback to empty blob
          const buffer = new ArrayBuffer(1024);
          resolve(new Blob([buffer], { type: 'audio/wav' }));
        };
      } else {
        // Fallback to empty blob
        const buffer = new ArrayBuffer(1024);
        resolve(new Blob([buffer], { type: 'audio/wav' }));
      }
    });
  }

  // Try to transcribe using Web Speech API
  private static async transcribeWithWebSpeechAPI(audioBlob: Blob): Promise<string | null> {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return null;
    }

    return new Promise((resolve) => {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          resolve(transcript);
        };

        recognition.onerror = () => {
          resolve(null);
        };

        recognition.onend = () => {
          resolve(null);
        };

        // Note: We can't directly use the blob with Web Speech API
        // This is just a demo - in production use actual STT API
        setTimeout(() => resolve(null), 100);
      } catch (error) {
        resolve(null);
      }
    });
  }

  // Map language codes to Speech API format
  private static mapLanguageCode(language: string): string {
    const langMap: { [key: string]: string } = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE'
    };
    return langMap[language] || 'en-US';
  }

  // Helper method to play audio with viseme sync
  static async playAudioWithVisemes(
    audioBlob: Blob, 
    visemes: any[], 
    onViseme?: (viseme: any) => void
  ): Promise<void> {
    return new Promise((resolve) => {
      // Create audio element and play the actual ElevenLabs audio
      const audio = new Audio(URL.createObjectURL(audioBlob));
      
      audio.addEventListener('loadeddata', () => {
        console.log('Audio loaded, starting playback with visemes');
        
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
        console.log('Audio playback completed');
        URL.revokeObjectURL(audio.src);
        resolve();
      });
      
      audio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        URL.revokeObjectURL(audio.src);
        resolve();
      });
      
      // Start audio playback
      audio.play().catch((error) => {
        console.error('Failed to play audio:', error);
        resolve();
      });
    });
  }
}

export default ElevenLabsService;
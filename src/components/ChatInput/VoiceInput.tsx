import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  language?: string;
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
}

declare const webkitSpeechRecognition: {
  new(): SpeechRecognition;
};

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, language = 'en' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<Record<string, string>>({});
  const [voiceLanguage, setVoiceLanguage] = useState(language);

  // Language code mapping for speech recognition
  const languageMapping: Record<string, string> = {
    'en': 'en-IN',  // English (India)
    'hi': 'hi-IN',  // Hindi
    'ta': 'ta-IN',  // Tamil
    'te': 'te-IN',  // Telugu
    'bn': 'bn-IN',  // Bengali
    'mr': 'mr-IN',  // Marathi
    'gu': 'gu-IN',  // Gujarati
    'kn': 'kn-IN',  // Kannada
    'ml': 'ml-IN',  // Malayalam
    'pa': 'pa-IN'   // Punjabi
  };

  useEffect(() => {
    // Fetch supported languages
    fetch('http://localhost:5000/api/languages')
      .then(res => res.json())
      .then(setSupportedLanguages)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setVoiceLanguage(language);
  }, [language]);

  const handleVoiceInput = async () => {
    try {
      setIsLoading(true);
      const recognition = new webkitSpeechRecognition();
      recognition.continuous = false;
      
      // Set language based on current selection
      recognition.lang = languageMapping[voiceLanguage] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setIsLoading(false);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setIsLoading(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsLoading(false);
      };

      recognition.start();
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleVoiceInput}
        className={`p-2 rounded-full transition-colors ${
          isListening
            ? 'bg-red-500 text-white'
            : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
        }`}
        disabled={isLoading}
        title={`Voice input (${supportedLanguages[voiceLanguage] || 'English'})`}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : isListening ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </motion.button>
    </div>
  );
};

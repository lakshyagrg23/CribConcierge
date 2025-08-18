import { useState, useEffect, useRef, useCallback } from 'react';
import { SpeechRecognitionResult as VoiceResult } from '../../types/voice';

// Simple browser speech recognition hook
interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (result: VoiceResult) => void;
  onError?: (error: string) => void;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    continuous = true,
    interimResults = true,
    lang = 'en-US',
    onResult,
    onError
  } = options;

  // Check browser support
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognitionAPI();
    } else {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
    }
  }, []);

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [isListening]);

  // Setup speech recognition
  useEffect(() => {
    if (!recognitionRef.current) return;

    const recognition = recognitionRef.current;
    
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('Speech recognition started');
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('Speech recognition ended');
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let currentInterimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcriptText;
        } else {
          currentInterimTranscript += transcriptText;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        
        const result: VoiceResult = {
          transcript: finalTranscript.trim(),
          confidence: event.results[event.results.length - 1][0].confidence || 0.5,
          isFinal: true
        };

        onResult?.(result);
      }

      setInterimTranscript(currentInterimTranscript);

      // Auto-stop after 3 seconds of silence
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        if (isListening) {
          stopRecognition();
        }
      }, 3000);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      const errorMessage = `Speech recognition error: ${event.error}`;
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Speech recognition error:', event.error);
    };

    recognition.onnomatch = () => {
      setError('No speech was recognized');
      onError?.('No speech was recognized');
    };

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [continuous, interimResults, lang, onResult, onError, isListening, stopRecognition]);

  const start = useCallback(async () => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported');
      return false;
    }

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setTranscript('');
      setInterimTranscript('');
      setError(null);
      
      recognitionRef.current.start();
      return true;
    } catch (err) {
      const errorMessage = 'Microphone permission denied or not available';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    }
  }, [isSupported, onError]);

  const stop = useCallback(() => {
    stopRecognition();
  }, [stopRecognition]);

  const reset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const restart = useCallback(async () => {
    stop();
    // Small delay to ensure recognition is fully stopped
    setTimeout(() => {
      start();
    }, 100);
  }, [start, stop]);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
    restart
  };
};

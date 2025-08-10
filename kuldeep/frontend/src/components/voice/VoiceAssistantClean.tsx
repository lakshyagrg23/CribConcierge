import React, { useState, useCallback } from 'react';
import { Mic, MicOff, Volume2, VolumeX, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useSpeechRecognition } from '../../hooks/voice/useSpeechRecognition';
import { useVoiceCommands } from '../../hooks/voice/useVoiceCommands';
import { VoiceCommand } from '../../types/voice';

interface VoiceAssistantProps {
  onCommand: (command: VoiceCommand) => void;
  currentRoom?: string;
  propertyId?: string;
  isInTour?: boolean;
  className?: string;
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onCommand,
  currentRoom,
  className = ""
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const { processVoiceCommand, isProcessing, getCommandSuggestions } = useVoiceCommands();

  const speakResponse = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
      };
      
      speechSynthesis.speak(utterance);
    }
  }, []);

  const generateVoiceResponse = useCallback((command: VoiceCommand) => {
    let response = '';
    
    switch (command.action) {
      case 'navigate':
        if (command.target) {
          response = `Moving to the ${command.target.replace('_', ' ')}. You can look around using your mouse or touch.`;
        } else {
          response = 'I\'m not sure which room you want to visit. Try saying "go to kitchen" or "show me the bedroom".';
        }
        break;
      
      case 'describe':
        if (currentRoom) {
          const descriptions: Record<string, string> = {
            kitchen: 'This is a modern kitchen space. Look around to see the appliances, countertops, and overall layout.',
            bedroom: 'This bedroom offers a comfortable sleeping space. Notice the lighting and room dimensions.',
            bathroom: 'This is the bathroom area. You can see the fixtures, vanity, and overall design.',
            living_room: 'This is the main living area where you can relax and entertain guests.'
          };
          response = descriptions[currentRoom] || 'This is a nice room in the property. Take a moment to look around and explore the space.';
        } else {
          response = 'I can see you\'re viewing a property room. Look around to explore the space, or ask me to go to a specific room.';
        }
        break;
      
      case 'property_info':
        if (command.target === 'price') {
          response = 'Let me get the property price information for you.';
        } else if (command.target === 'size') {
          response = 'I\'ll find the square footage details for this property.';
        } else {
          response = 'I\'ll gather that property information for you.';
        }
        break;
      
      case 'help':
        response = 'I can help you navigate the property tour. Say "go to kitchen" to visit rooms, "describe this room" to learn more, or "what\'s the price" for property details.';
        break;
      
      case 'exit':
        response = 'Thank you for taking the virtual tour. Returning to the property dashboard.';
        break;
      
      default:
        response = 'I\'m here to help with your property tour. Try saying "help" to see what I can do.';
    }
    
    setVoiceResponse(response);
    speakResponse(response);
  }, [currentRoom, speakResponse]);

  const handleVoiceResult = useCallback((result: { transcript: string; confidence: number; isFinal: boolean }) => {
    if (result.isFinal && result.confidence > 0.5) {
      const command = processVoiceCommand(result.transcript);
      if (command) {
        onCommand(command);
        generateVoiceResponse(command);
      }
    }
  }, [processVoiceCommand, onCommand, generateVoiceResponse]);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    onResult: handleVoiceResult,
    onError: (error) => console.error('Speech recognition error:', error)
  });

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleVoiceAssistant = useCallback(async () => {
    if (!isEnabled) {
      setIsEnabled(true);
      const started = await start();
      if (!started) {
        setIsEnabled(false);
      } else {
        speakResponse('Voice assistant activated. How can I help with your property tour?');
      }
    } else {
      setIsEnabled(false);
      stop();
      stopSpeaking();
      reset();
    }
  }, [isEnabled, start, stop, reset, speakResponse, stopSpeaking]);

  const toggleTranscript = useCallback(() => {
    setShowTranscript(!showTranscript);
  }, [showTranscript]);

  if (!isSupported) {
    return (
      <Card className={`p-4 bg-gray-100 ${className}`}>
        <div className="text-center text-gray-600">
          <MicOff className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Voice assistant not supported in this browser</p>
        </div>
      </Card>
    );
  }

  const suggestions = getCommandSuggestions();

  return (
    <div className={`voice-assistant ${className}`}>
      {/* Main Voice Control */}
      <Card className="bg-black/80 backdrop-blur-sm text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Button
              onClick={toggleVoiceAssistant}
              size="lg"
              className={`rounded-full w-14 h-14 ${
                isEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isListening ? (
                <Mic className="w-6 h-6 animate-pulse" />
              ) : (
                <MicOff className="w-6 h-6" />
              )}
            </Button>
            
            <div>
              <p className="text-sm font-medium">
                {isListening ? 'Listening...' : isEnabled ? 'Voice Ready' : 'Voice Off'}
              </p>
              {isProcessing && (
                <p className="text-xs text-blue-400">Processing command...</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={stopSpeaking}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              disabled={!isSpeaking}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            
            <Button
              onClick={toggleTranscript}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Live Transcript */}
        {isListening && (interimTranscript || transcript) && (
          <div className="mb-3 p-2 bg-white/10 rounded text-sm">
            <span className="opacity-60">{transcript}</span>
            <span className="text-blue-400">{interimTranscript}</span>
          </div>
        )}

        {/* Voice Response */}
        {voiceResponse && (
          <div className="mb-3 p-2 bg-green-900/30 rounded text-sm">
            <span className="text-green-400">Assistant: </span>
            {voiceResponse}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mb-3 p-2 bg-red-900/30 rounded text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Command Suggestions */}
        {showTranscript && (
          <div className="border-t border-white/20 pt-3">
            <p className="text-xs text-gray-400 mb-2">Try saying:</p>
            <div className="grid grid-cols-1 gap-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const command = processVoiceCommand(suggestion);
                    if (command) {
                      onCommand(command);
                      generateVoiceResponse(command);
                    }
                  }}
                  className="text-xs text-left p-1 rounded hover:bg-white/10 text-blue-400"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

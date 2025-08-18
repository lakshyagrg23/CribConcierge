import { useState, useCallback, useRef } from 'react';
import { VoiceCommand, VoiceIntent, SpeechRecognitionResult, VOICE_COMMANDS } from '../../types/voice';

export const useVoiceCommands = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastRecognizedText, setLastRecognizedText] = useState<string>('');
  const [commandHistory, setCommandHistory] = useState<VoiceCommand[]>([]);

  // Simple intent classification using keyword matching
  const classifyIntent = useCallback((transcript: string): VoiceIntent => {
    const lowerTranscript = transcript.toLowerCase();
    
    // Check for navigation commands
    for (const navCommand of VOICE_COMMANDS.navigation) {
      if (lowerTranscript.includes(navCommand)) {
        const room = extractRoom(lowerTranscript);
        return {
          intent: 'room_navigation',
          entities: { room, action: 'go' },
          confidence: 0.8
        };
      }
    }

    // Check for description commands
    for (const descCommand of VOICE_COMMANDS.description) {
      if (lowerTranscript.includes(descCommand)) {
        return {
          intent: 'room_description',
          entities: { action: 'describe' },
          confidence: 0.8
        };
      }
    }

    // Check for property info commands
    for (const infoCommand of VOICE_COMMANDS.property_info) {
      if (lowerTranscript.includes(infoCommand)) {
        const feature = extractPropertyFeature(lowerTranscript);
        return {
          intent: 'property_info',
          entities: { property_feature: feature },
          confidence: 0.7
        };
      }
    }

    // Check for control commands
    for (const controlCommand of VOICE_COMMANDS.control) {
      if (lowerTranscript.includes(controlCommand)) {
        return {
          intent: 'tour_control',
          entities: { action: extractControlAction(lowerTranscript) },
          confidence: 0.9
        };
      }
    }

    // Default fallback
    return {
      intent: 'tour_control',
      entities: {},
      confidence: 0.1
    };
  }, []);

  const extractRoom = (transcript: string): 'kitchen' | 'bedroom' | 'bathroom' | 'living_room' | undefined => {
    if (transcript.includes('kitchen')) return 'kitchen';
    if (transcript.includes('bedroom') || transcript.includes('bed room')) return 'bedroom';
    if (transcript.includes('bathroom') || transcript.includes('bath room')) return 'bathroom';
    if (transcript.includes('living room') || transcript.includes('living') || transcript.includes('lounge')) return 'living_room';
    return undefined;
  };

  const extractPropertyFeature = (transcript: string): 'price' | 'size' | 'features' | 'location' | undefined => {
    if (transcript.includes('price') || transcript.includes('cost') || transcript.includes('much')) return 'price';
    if (transcript.includes('size') || transcript.includes('square') || transcript.includes('big')) return 'size';
    if (transcript.includes('features') || transcript.includes('amenities') || transcript.includes('included')) return 'features';
    if (transcript.includes('location') || transcript.includes('where') || transcript.includes('address')) return 'location';
    return undefined;
  };

  const extractControlAction = (transcript: string): 'go' | 'show' | 'describe' | 'tell' | undefined => {
    if (transcript.includes('help') || transcript.includes('commands')) return 'show';
    if (transcript.includes('exit') || transcript.includes('stop') || transcript.includes('end')) return 'go';
    if (transcript.includes('pause')) return 'go';
    if (transcript.includes('resume')) return 'go';
    return undefined;
  };

  const processVoiceCommand = useCallback((transcript: string): VoiceCommand | null => {
    setIsProcessing(true);
    setLastRecognizedText(transcript);

    try {
      const intent = classifyIntent(transcript);
      
      if (intent.confidence < 0.3) {
        setIsProcessing(false);
        return null; // Not confident enough in recognition
      }

      let command: VoiceCommand;

      switch (intent.intent) {
        case 'room_navigation':
          command = {
            action: 'navigate',
            target: intent.entities.room,
            confidence: intent.confidence
          };
          break;

        case 'room_description':
          command = {
            action: 'describe',
            confidence: intent.confidence
          };
          break;

        case 'property_info':
          command = {
            action: 'property_info',
            target: intent.entities.property_feature,
            confidence: intent.confidence
          };
          break;

        case 'tour_control':
          if (transcript.toLowerCase().includes('help')) {
            command = { action: 'help', confidence: intent.confidence };
          } else if (transcript.toLowerCase().includes('exit') || transcript.toLowerCase().includes('stop')) {
            command = { action: 'exit', confidence: intent.confidence };
          } else {
            command = { action: 'help', confidence: intent.confidence };
          }
          break;

        default:
          command = { action: 'help', confidence: 0.1 };
      }

      // Add to command history
      setCommandHistory(prev => [...prev.slice(-4), command]); // Keep last 5 commands
      
      setIsProcessing(false);
      return command;

    } catch (error) {
      console.error('Error processing voice command:', error);
      setIsProcessing(false);
      return null;
    }
  }, [classifyIntent]);

  const getCommandSuggestions = useCallback((): string[] => {
    return [
      "Go to kitchen",
      "Show me the bedroom", 
      "Describe this room",
      "What's the price?",
      "Help with commands",
      "Exit tour"
    ];
  }, []);

  const clearHistory = useCallback(() => {
    setCommandHistory([]);
    setLastRecognizedText('');
  }, []);

  return {
    processVoiceCommand,
    isProcessing,
    lastRecognizedText,
    commandHistory,
    getCommandSuggestions,
    clearHistory
  };
};

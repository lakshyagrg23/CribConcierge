// Voice Assistant Types for VR Tour Integration

export interface VoiceCommand {
  action: 'navigate' | 'describe' | 'help' | 'exit' | 'property_info';
  target?: string;
  parameters?: Record<string, string | number | boolean>;
  confidence?: number;
}

export interface VoiceIntent {
  intent: 'room_navigation' | 'room_description' | 'property_info' | 'tour_control';
  entities: {
    room?: 'kitchen' | 'bedroom' | 'bathroom' | 'living_room';
    action?: 'go' | 'show' | 'describe' | 'tell';
    property_feature?: 'price' | 'size' | 'features' | 'location';
  };
  confidence: number;
}

export interface VoiceAssistantConfig {
  agentId: string;
  apiKey: string;
  onCommand: (command: VoiceCommand) => void;
  onError?: (error: string) => void;
  onStateChange?: (state: VoiceState) => void;
}

export interface VoiceState {
  isListening: boolean;
  isConnected: boolean;
  isSpeaking: boolean;
  currentTranscript?: string;
  lastCommand?: VoiceCommand;
}

export interface RoomDescription {
  id: string;
  name: string;
  description: string;
  features: string[];
  dimensions?: string;
}

export interface VoiceResponse {
  text: string;
  audio_url?: string;
  action?: VoiceCommand;
  context?: Record<string, string | number | boolean>;
}

export interface SpeechRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

// Voice command patterns for natural language processing
export const VOICE_COMMANDS = {
  navigation: [
    "go to kitchen", "show me the kitchen", "navigate to kitchen", "kitchen tour",
    "go to bedroom", "show me the bedroom", "take me to bedroom", "bedroom tour", 
    "go to bathroom", "show me the bathroom", "navigate to bathroom", "bathroom tour",
    "go to living room", "show me the living room", "take me to living room", "living room tour"
  ],
  description: [
    "describe this room", "tell me about this space", "what am i looking at",
    "room details", "property information", "room features", "what's in this room"
  ],
  control: [
    "stop tour", "exit tour", "pause", "resume", "end session",
    "help", "what can you do", "voice commands", "how does this work"
  ],
  property_info: [
    "what's the price", "how much does this cost", "property price",
    "square footage", "property size", "how big is this",
    "property features", "amenities", "what's included"
  ]
} as const;

export const VOICE_RESPONSES = {
  room_navigation: {
    success: "Moving to the {room}. You can look around using your mouse or touch to explore.",
    error: "Sorry, the {room} is not available in this property tour.",
    unavailable: "This property doesn't have a {room} tour available right now."
  },
  room_description: {
    kitchen: "This is a modern kitchen space. Look around to see the appliances, countertops, and layout.",
    bedroom: "This bedroom offers a comfortable sleeping space. Notice the lighting and room dimensions.",
    bathroom: "This is the bathroom area. You can see the fixtures and overall design.",
    living_room: "This is the main living area where you can relax and entertain guests."
  },
  tour_control: {
    help: "I can help you navigate the property tour. Say 'go to kitchen' to visit rooms, or 'describe this room' to learn more about the current space.",
    exit: "Thank you for taking the virtual tour. Returning to the property dashboard.",
    pause: "Tour paused. Say 'resume' when you're ready to continue.",
    resume: "Resuming your virtual property tour."
  },
  property_info: {
    default: "Let me get that property information for you...",
    price: "This property is listed at {price}.",
    size: "The total square footage is {sqft} square feet.",
    features: "Key features include: {features}"
  }
} as const;

// Retell AI specific types
export interface RetellCallState {
  call_id: string;
  agent_id: string;
  call_status: 'registered' | 'ongoing' | 'ended';
  call_type: 'web' | 'phone';
  start_timestamp?: number;
  end_timestamp?: number;
}

export interface RetellWebhookEvent {
  event: 'call_started' | 'call_ended' | 'speech_recognized' | 'response_generated';
  call: RetellCallState;
  data?: {
    transcript?: string;
    response?: string;
    audio_url?: string;
  };
}

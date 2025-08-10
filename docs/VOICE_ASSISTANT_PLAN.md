# 🎤 Voice Assistant Integration Plan - Retell AI + VR Tour

## 📋 **Implementation Architecture**

### **1. Technology Stack**
```
Frontend: React + A-Frame + Retell SDK
Backend: Node.js + Express (existing) + Retell API
Voice: Retell AI + WebRTC + Speech Recognition
```

### **2. Component Structure**
```
src/components/voice/
├── VoiceAssistant.tsx           # Main voice interface
├── VoiceControls.tsx            # Voice control buttons
├── VoiceVisualizer.tsx          # Audio waveform display
├── VoiceCommands.tsx            # Command recognition
└── VoiceSettings.tsx            # Voice preferences

src/hooks/voice/
├── useRetellAI.ts               # Retell integration hook
├── useVoiceCommands.ts          # Command processing
├── useSpeechRecognition.ts      # Browser speech API
└── useVoiceNavigation.ts        # VR tour voice controls

src/types/voice.ts               # Voice assistant types
```

## 🚀 **Phase 1: Basic Voice Integration**

### **Step 1: Install Dependencies**
```bash
npm install @retellai/web-sdk
npm install @types/webrtc
```

### **Step 2: Voice Assistant Hook**
```typescript
// hooks/voice/useRetellAI.ts
interface VoiceAssistantConfig {
  agentId: string;
  apiKey: string;
  onCommand: (command: VoiceCommand) => void;
}

interface VoiceCommand {
  action: 'navigate' | 'describe' | 'help' | 'exit';
  target?: string;
  parameters?: Record<string, any>;
}
```

### **Step 3: VR Tour Voice Commands**
```typescript
// Voice commands for VR navigation
const VOICE_COMMANDS = {
  navigation: [
    "Go to kitchen", "Show me the kitchen", "Navigate to kitchen",
    "Go to bedroom", "Show me the bedroom", "Take me to bedroom",
    "Go to bathroom", "Show me the bathroom", "Navigate to bathroom",
    "Go to living room", "Show me the living room", "Take me to living room"
  ],
  description: [
    "Describe this room", "Tell me about this space", "What am I looking at",
    "Room details", "Property information", "Room features"
  ],
  control: [
    "Stop tour", "Exit tour", "Pause", "Resume",
    "Help", "What can you do", "Voice commands"
  ]
};
```

## 🎯 **Phase 2: Advanced Features**

### **Natural Language Processing**
```typescript
interface VoiceIntent {
  intent: 'room_navigation' | 'room_description' | 'property_info' | 'tour_control';
  entities: {
    room?: 'kitchen' | 'bedroom' | 'bathroom' | 'living_room';
    action?: 'go' | 'show' | 'describe' | 'tell';
  };
  confidence: number;
}
```

### **Contextual Responses**
```typescript
const VOICE_RESPONSES = {
  room_navigation: {
    success: "Moving to the {room}. You can look around using your mouse or touch.",
    error: "Sorry, the {room} is not available in this property.",
    unavailable: "This property doesn't have a {room} tour available."
  },
  room_description: {
    kitchen: "This is a modern kitchen with updated appliances...",
    bedroom: "This bedroom features natural lighting and spacious layout...",
    // ... property-specific descriptions
  }
};
```

## 🔧 **Integration Points**

### **1. VR Tour + Voice Assistant**
```typescript
// components/tour/VirtualTourViewer.tsx
const VirtualTourViewer = ({ property }) => {
  const { isListening, startListening, stopListening } = useRetellAI({
    agentId: process.env.VITE_RETELL_AGENT_ID,
    onCommand: handleVoiceCommand
  });

  const handleVoiceCommand = (command: VoiceCommand) => {
    switch (command.action) {
      case 'navigate':
        handleRoomSwitch(command.target);
        break;
      case 'describe':
        speakRoomDescription(currentRoom);
        break;
      // ... other commands
    }
  };
};
```

### **2. Voice Control UI**
```typescript
// components/voice/VoiceControls.tsx
const VoiceControls = ({ isListening, onToggle }) => (
  <div className="absolute bottom-20 right-4 bg-black/70 p-3 rounded-lg">
    <Button
      onClick={onToggle}
      className={`rounded-full w-12 h-12 ${isListening ? 'bg-red-500' : 'bg-blue-500'}`}
    >
      {isListening ? <MicOff /> : <Mic />}
    </Button>
    <div className="text-white text-xs mt-2 text-center">
      {isListening ? 'Listening...' : 'Voice OFF'}
    </div>
  </div>
);
```

## 🏗️ **Backend Integration**

### **1. Retell Webhook Handler**
```javascript
// src/routes/voice.js
app.post('/webhooks/retell', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'call_started':
      console.log('Voice session started');
      break;
    case 'call_ended':
      console.log('Voice session ended');
      break;
    case 'speech_recognized':
      const command = parseVoiceCommand(data.transcript);
      // Process command and send response
      break;
  }
});

function parseVoiceCommand(transcript) {
  // Parse natural language to structured commands
  const intent = detectIntent(transcript);
  const entities = extractEntities(transcript);
  
  return {
    action: intent,
    target: entities.room,
    confidence: calculateConfidence(transcript)
  };
}
```

### **2. Property Context Integration**
```javascript
// Integrate with existing AI backend
app.post('/voice/property-context', async (req, res) => {
  const { propertyId, roomId, question } = req.body;
  
  // Use existing LangChain setup to generate contextual responses
  const context = await getPropertyContext(propertyId, roomId);
  const response = await generateVoiceResponse(question, context);
  
  res.json({ response, audio_url: await textToSpeech(response) });
});
```

## 🎮 **User Experience Flow**

### **1. Voice Activation**
```
User clicks mic → Retell session starts → "How can I help with your tour?"
```

### **2. Room Navigation**
```
User: "Take me to the kitchen"
Assistant: "Moving to the kitchen now. This kitchen features..."
Action: handleRoomSwitch('kitchen')
```

### **3. Room Description**
```
User: "Tell me about this room"
Assistant: "This is the master bedroom. It has natural lighting..."
Action: Fetch room details from property data
```

### **4. Property Questions**
```
User: "What's the price of this property?"
Assistant: "This property is listed at $450,000..."
Action: Query property database
```

## 📱 **Mobile Considerations**

### **WebRTC Permissions**
```typescript
const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error('Microphone permission denied');
    return false;
  }
};
```

### **Touch-to-Talk Alternative**
```typescript
const VoiceTouchControls = () => {
  const [isRecording, setIsRecording] = useState(false);
  
  return (
    <Button
      onTouchStart={() => startRecording()}
      onTouchEnd={() => stopRecording()}
      className="touch-voice-button"
    >
      Hold to Speak
    </Button>
  );
};
```

## 🔐 **Security & Configuration**

### **Environment Variables**
```bash
# .env
VITE_RETELL_API_KEY=your_retell_api_key
VITE_RETELL_AGENT_ID=your_agent_id
RETELL_WEBHOOK_SECRET=your_webhook_secret
```

### **Retell Agent Configuration**
```json
{
  "agent_name": "VR Property Tour Assistant",
  "voice_model": "eleven_labs",
  "language": "en-US",
  "response_engine": "conversational",
  "interruption_sensitivity": 0.7,
  "enable_backchannel": true,
  "webhook_url": "https://yourapp.com/webhooks/retell"
}
```

## 🎯 **Implementation Phases**

### **Phase 1 (Week 1): Basic Voice**
- ✅ Retell SDK integration
- ✅ Basic voice commands (room navigation)
- ✅ Simple voice UI controls

### **Phase 2 (Week 2): Smart Commands**
- ✅ Natural language processing
- ✅ Contextual responses
- ✅ Property information queries

### **Phase 3 (Week 3): Advanced Features**
- ✅ Voice-guided tours
- ✅ Property comparison via voice
- ✅ Booking/inquiry via voice

## 💡 **Sample Voice Interactions**

### **Navigation**
- "Take me to the kitchen" → Switches to kitchen view
- "Show me the master bedroom" → Navigates to bedroom
- "Go back to the living room" → Returns to living room

### **Information**
- "Tell me about this property" → Reads property details
- "What's the square footage?" → Provides property metrics
- "How much is this house?" → States listing price

### **Tour Control**
- "Start the tour" → Begins guided tour
- "Pause" → Stops current narration
- "Exit tour" → Returns to dashboard

This voice assistant integration will create a truly immersive, hands-free property viewing experience that sets your platform apart from competitors!

# 🏠 CribConcierge

**CribConcierge** is an advanced AI-powered real estate platform that revolutionizes property exploration through immersive virtual reality tours, intelligent chat assistance, and seamless property management. Built with modern web technologies, it provides an unparalleled property browsing experience.

## ✨ Features

### 🏘 **Real Estate Property Management**

- **Comprehensive Property Listings**: Detailed property information with pricing, amenities, and descriptions
- **Advanced Image Storage**: MongoDB GridFS integration for efficient image handling and retrieval
- **Property Search & Filtering**: Advanced filtering capabilities for property discovery
- **Property Dashboard**: Clean, responsive interface for managing and viewing properties

### 🕶 **Immersive VR Tours**

- **360° Virtual Reality Tours**: Built with A-Frame for immersive property exploration
- **Room-by-Room Navigation**: Seamless transitions between Kitchen, Bedroom, Bathroom, and Living Room
- **Interactive Controls**: Click-based and keyboard navigation with smooth transitions
- **Real Photo Integration**: Supports both regular photos and 360° panoramic images
- **Accessible URLs**: Direct access via `/tour/:propertyId` for easy sharing

### 🤖 **AI-Powered Chat Assistant**

- **RAG (Retrieval-Augmented Generation)**: Powered by LangChain with FAISS vector store
- **Google Gemini 2.0 Flash**: Advanced natural language understanding and generation
- **Context-Aware Responses**: Conversational memory for intelligent follow-up questions
- **Interactive Property Cards**: AI responses include interactive property recommendations
- **Smart System Prompts**: Specialized for real estate domain expertise

### 🎤 **Voice Assistant Integration**

- **Speech Recognition**: Browser-based voice commands for hands-free navigation
- **VR Tour Voice Control**: Navigate rooms using natural language ("go to kitchen", "describe this room")
- **Text-to-Speech**: Voice responses for enhanced accessibility
- **Command Suggestions**: Built-in help system with voice command examples

## 🏗 **Technical Architecture**

### **Frontend Stack**

```
Framework:      React 18 + TypeScript + Vite
UI Library:     Radix UI + Tailwind CSS + shadcn/ui
VR Engine:      A-Frame for 360° immersive tours
State Mgmt:     React Query (TanStack Query) + React Hooks
Routing:        React Router v6
Voice:          Web Speech API + SpeechSynthesis
Icons:          Lucide React
```

### **Backend Stack**

```
Framework:      Flask (Python 3.8+)
Database:       MongoDB + GridFS (image storage)
AI/ML Stack:
  - LangChain (RAG pipeline)
  - Google Gemini 2.0 Flash (LLM)
  - HuggingFace Embeddings (sentence-transformers/all-MiniLM-L6-v2)
  - FAISS Vector Store (similarity search)
Image Service:  Pillow + GridFS integration
APIs:           RESTful endpoints with CORS support
```

### **Development Tools**

```
Package Mgmt:   npm (frontend) + pip (backend)
Development:    Vite dev server + Flask debug mode
Linting:        ESLint + TypeScript
Environment:    PowerShell automation scripts
```

## 🚀 **Quick Start**

### **Prerequisites**

- **Python 3.8+** with pip
- **Node.js 16+** with npm
- **MongoDB** (local installation or cloud)
- **Google API Key** (for Gemini AI)

### **1. Clone & Setup**

```bash
git clone <repository-url>
cd CribConcierge
```

### **2. Environment Configuration**

Create `.env` file in `backend/` directory:

```env
GEMINI_API_KEY="your-google-gemini-api-key"
MONGODB_URI="mongodb://localhost:27017/imageupload"
```

### **3. Automated Development Start**

**Windows (PowerShell):**

```powershell
cd scripts
.\start-dev.ps1
```

**Manual Start:**

```bash
# Backend (Terminal 1)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app_integrated.py

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

### **4. Access the Application**

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:5090
- **VR Tours**: http://localhost:8080/tour/:propertyId

## 🔧 **Implementation Highlights**

### **VR Tour System**

- **Room Mapping Architecture**:
  ```
  roomPhotoId        → Bedroom
  drawingRoomPhotoId → Living Room
  kitchenPhotoId     → Kitchen
  bathroomPhotoId    → Bathroom
  ```
- **A-Frame Integration**: Custom components for scene management and transitions
- **Image Loading**: Progressive loading with error handling and fallbacks
- **Voice Navigation**: Natural language commands integrated with VR controls

### **AI Chat System**

- **RAG Pipeline**: `Property Data → Embeddings → Vector Search → LLM Response`
- **Memory Management**: Conversation buffer for context-aware interactions
- **Enhanced Responses**: Includes interactive property cards and VR tour promotions
- **Fallback Handling**: Database-only responses when RAG system is unavailable

### **Property Database Schema**

```json
{
  "_id": "ObjectId",
  "propertyName": "string",
  "propertyAddress": "string",
  "propertyCostRange": "string",
  "bedrooms": "number",
  "bathrooms": "number",
  "area": "string",
  "features": ["array"],
  "description": "string",
  "roomPhotoId": "string",
  "bathroomPhotoId": "string",
  "drawingRoomPhotoId": "string",
  "kitchenPhotoId": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## 📁 **Project Structure**

```
CribConcierge/
├── 📂 backend/                 # Flask API server
│   ├── app_integrated.py       # Main application (AI + Image service)
│   ├── image_service.py        # GridFS image handling
│   ├── SYSTEM_PROMPT.PY       # AI system prompts
│   ├── requirements.txt        # Python dependencies
│   └── .env                   # Environment variables
├── 📂 frontend/               # React + TypeScript UI
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── tour/         # VR tour components
│   │   │   ├── voice/        # Voice assistant
│   │   │   └── ui/           # shadcn/ui components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── pages/            # Route components
│   │   ├── types/            # TypeScript definitions
│   │   └── utils/            # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── 📂 scripts/               # Development automation
│   └── start-dev.ps1         # Windows startup script
├── 📂 docs/                  # Documentation
├── 📂 archive/               # Legacy code archive
└── README.md                 # Project documentation
```

## 🌐 **API Endpoints**

### **Property Management**

```
POST /api/addListing          # Add new property
GET  /api/getListings         # Get all properties
GET  /api/getProperty/:id     # Get specific property
```

### **AI Chat Assistant**

```
GET  /api/askIt?question=...  # AI-powered Q&A with RAG
POST /api/rebuildRAG          # Rebuild vector knowledge base
GET  /api/ragStatus           # Check RAG system status
```

### **Image Service**

```
POST /api/upload              # Upload property images
POST /api/images/upload       # Alternative upload endpoint
GET  /api/images/:id          # Retrieve images by ID
```

## 🎮 **Usage Guide**

### **Adding Properties**

1. Navigate to **Add Listing** page
2. Fill property details (name, address, price, etc.)
3. Upload room photos (Kitchen, Bedroom, Bathroom, Living Room)
4. Submit to create property with VR tour capability

### **Exploring VR Tours**

1. Click **"3D Tour"** button on any property card
2. Use **mouse/touch** to look around 360°
3. Click **room buttons** to navigate between spaces
4. Use **voice commands**: _"go to kitchen"_, _"describe this room"_
5. **Keyboard navigation**: WASD keys for movement

### **AI Chat Assistant**

1. Type questions in the chat interface
2. Ask about properties: _"Show me 3-bedroom houses"_
3. Get recommendations: _"What properties have VR tours?"_
4. Property details: _"Tell me about the latest listing"_

## 🚀 **Development Status**

### ✅ **Completed Features**

- ✅ Complete property management system
- ✅ MongoDB integration with GridFS storage
- ✅ A-Frame VR tour implementation
- ✅ AI chat assistant with RAG (LangChain + Gemini)
- ✅ Voice assistant integration in VR tours
- ✅ Interactive property cards in AI responses
- ✅ Responsive UI with shadcn/ui components
- ✅ Development automation scripts

### 🔄 **In Progress**

- 🔄 Advanced voice navigation improvements
- 🔄 Enhanced VR tour features (hotspots, annotations)
- 🔄 Property comparison tools

## 💡 **Key Value Propositions**

- **🌟 Immersive Experience**: 360° VR tours provide realistic property viewing
- **🧠 AI Intelligence**: Smart recommendations and conversational property search
- **🎤 Voice Interaction**: Hands-free property exploration and navigation
- **📱 Modern UX**: Responsive design with smooth animations and transitions
- **⚡ Performance**: Optimized image loading and efficient data management
- **🔗 Integration Ready**: RESTful APIs for easy third-party integrations

## 🛠 **Contributing**

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

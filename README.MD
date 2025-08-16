# 🏠 CribConcierge

**CribConcierge** is an advanced real estate platform that combines modern web technologies with AI-powered features to deliver an immersive property browsing experience.  
From detailed property listings to **360° virtual tours** and an **AI-powered chat assistant**, CribConcierge redefines how users explore and interact with real estate.

---

## ✨ Features

### 🏘 Real Estate Property Management
- Detailed property listings with descriptions, pricing, and amenities.
- Image upload and storage using **MongoDB GridFS**.
- Advanced property search and filtering.

### 🕶 Immersive VR Tours
- **360° virtual tours** built with [A-Frame](https://aframe.io/).
- Room-by-room navigation (Bedroom, Living Room, Kitchen, Bathroom).
- Interactive hotspots and overlays.
- **Voice-assisted 3D tour navigation** using **Retell AI**.
- Accessible via `/tour/:propertyId`.

### 🤖 AI-Powered Chat Assistant
- **RAG** (Retrieval-Augmented Generation) powered by **LangChain**.
- Orchestrated via **n8n** for automated data pipelines.
- Integrated with **Google Gemini 2.0 Flash** for natural language understanding.
- Context-aware property recommendations.
- Smart system prompt specialized for the real estate domain.

### 🎙 Voice Assistant Integration *(In Progress)*
- **Retell AI** integration for:
  - Voice interactions inside VR tours.
  - Voice-controlled navigation between rooms.
  - Natural language property queries.

---

## 🏗 Technical Architecture

### **Frontend**
- **Framework:** React + TypeScript + Vite
- **UI:** Radix UI + Tailwind CSS + shadcn/ui
- **VR:** A-Frame for 360° tours
- **State Management:** React Query (TanStack Query)
- **Routing:** React Router

### **Backend**
- **Framework:** Flask (Python)
- **Database:** MongoDB + GridFS (for image storage)
- **AI/ML Stack:**
  - LangChain (RAG)
  - Orchestrated with **n8n**
  - Google Gemini 2.0 Flash LLM
  - HuggingFace embeddings
  - FAISS vector store
- **APIs:** RESTful endpoints for properties, chat, and images

### **Legacy Components (src/)**
- Original Node.js + Express image upload service
- React components for image handling
- Testing utilities

---

## 🔧 Implementation Highlights

### VR Tour System
- **Room Mapping:**
  - `roomPhotoId` → Bedroom
  - `drawingRoomPhotoId` → Living Room
  - `kitchenPhotoId` → Kitchen
  - `bathroomPhotoId` → Bathroom
- Click-based navigation with loading states.
- Voice-based navigation using **Retell AI**.

### AI Chat System
- **Pipeline:** Property data → embeddings → vector search → LLM response.
- **Automation:** RAG process orchestrated with **n8n**.
- **Memory:** Conversation buffer for context-awareness.
- **Capabilities:** Recommends properties, formats prices, promotes VR tours.

---

## 🚀 Development Status

✅ Completed:
- Property management system
- VR tour implementation with A-Frame
- AI chat assistant with RAG
- n8n pipeline for RAG orchestration
- Image upload/storage
- Dashboard and listings

🔄 In Progress:
- Voice assistant integration inside VR tours
- Advanced voice navigation in 3D
- Voice testing & optimization

---

## 💡 Value Propositions
- **Immersive Experience:** 360° VR tours of properties.
- **AI Intelligence:** Smart recommendations and conversational search.
- **Voice Interaction:** Hands-free property exploration via Retell AI.
- **Modern UX:** Responsive, clean interface with animations.

---

## 🛠 Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/CribConcierge.git
cd CribConcierge
```

### 2️⃣ Backend Setup (Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### 3️⃣ Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### 4️⃣ Environment Variables
```bash
# Backend
MONGO_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
N8N_WEBHOOK_URL=your_n8n_webhook

# Frontend
VITE_BACKEND_URL=http://localhost:5000
RETELL_API_KEY=your_retell_api_key
```

---

## 📜 License
This project is licensed under the MIT License.

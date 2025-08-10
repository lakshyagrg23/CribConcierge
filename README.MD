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

## 📂 Project Structure


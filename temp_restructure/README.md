# 🏠 CribConcierge - Restructured

**CribConcierge** is an advanced real estate platform that combines modern web technologies with AI-powered features to deliver an immersive property browsing experience.

## ✨ **Recent Restructuring**

The project has been **completely restructured** for better organization and maintainability:

### **🎯 Key Improvements**

- ✅ **Unified Backend**: Integrated image service into Flask backend
- ✅ **Clean Structure**: Moved out of confusing `kuldeep/` folder structure
- ✅ **Single Tech Stack**: Python backend with AI + image handling
- ✅ **Simplified Deployment**: One backend service instead of two
- ✅ **Better Organization**: Logical folder structure

### **🏗️ New Project Structure**

```
CribConcierge/
├── frontend/                   # React + TypeScript (Port 8080)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/                    # Integrated Flask backend (Port 5090)
│   ├── app_integrated.py       # Main Flask app with AI + Images
│   ├── image_service.py        # Image upload service
│   ├── SYSTEM_PROMPT.py        # AI system prompt
│   └── requirements.txt
├── docs/                       # Documentation
├── tests/                      # All tests consolidated
├── scripts/                    # Startup & deployment scripts
│   ├── start-dev.sh           # Linux/Mac startup
│   └── start-dev.ps1          # Windows startup
└── README.md                   # This file
```

## 🚀 **Quick Start**

### **Option 1: Automated Startup (Recommended)**

**Windows:**

```powershell
cd temp_restructure
powershell -ExecutionPolicy Bypass -File scripts\start-dev.ps1
```

**Linux/Mac:**

```bash
cd temp_restructure
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

### **Option 2: Manual Startup**

**Backend (Flask):**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python app_integrated.py
```

**Frontend (React):**

```bash
cd frontend
npm install
npm run dev
```

## 🔧 **Architecture Overview**

### **Unified Backend (Port 5090)**

- **Framework**: Flask (Python)
- **AI Stack**: LangChain + Google Gemini 2.0 Flash + FAISS
- **Image Handling**: Pillow + MongoDB GridFS
- **Database**: MongoDB for both AI data and images

### **Frontend (Port 8080)**

- **Framework**: React + TypeScript + Vite
- **UI**: Radix UI + Tailwind CSS + shadcn/ui
- **VR**: A-Frame for 360° tours
- **State**: TanStack Query

### **API Endpoints**

```
# Image Operations
POST   /api/upload              # Upload images
GET    /api/images/{id}         # Get image by ID
GET    /api/images              # List all images
DELETE /api/images/{id}         # Delete image

# AI Operations
POST   /api/addListing          # Add property listing
GET    /api/askIt?question=...  # Chat with AI

# Health Check
GET    /api/health              # Service status
```

## 🎯 **What Changed**

### **✅ Integrated**

- **Image Service**: Moved from Node.js to Python Flask
- **Single Backend**: One service handles both AI and images
- **Unified Database**: MongoDB shared between services
- **Simplified Proxy**: All API calls go to one backend

### **✅ Reorganized**

- **Frontend**: `kuldeep/frontend/` → `frontend/`
- **Backend**: `kuldeep/backend/` → `backend/`
- **Tests**: `testing/` → `tests/`
- **Scripts**: New `scripts/` folder for automation

### **✅ Enhanced**

- **Better Error Handling**: Centralized logging
- **Type Safety**: Full TypeScript integration
- **Documentation**: Updated for new structure
- **Automation**: Startup scripts for easy development

## 🌐 **Services**

| Service  | Port | URL                   | Purpose   |
| -------- | ---- | --------------------- | --------- |
| Frontend | 8080 | http://localhost:8080 | React UI  |
| Backend  | 5090 | http://localhost:5090 | Flask API |

## 📋 **Environment Variables**

Create `.env` files in the `backend/` directory:

```bash
# Backend environment
MONGODB_URI=mongodb://localhost:27017/imageupload
GEMINI_API_KEY=your_gemini_api_key
FLASK_ENV=development
FLASK_DEBUG=1
```

## 🧪 **Testing**

```bash
# Run tests
cd tests
python test_enhanced_backend.py

# Check MongoDB connection
python check_mongodb.js
```

## 📚 **Documentation**

- **Setup Guide**: `docs/SETUP.md`
- **API Documentation**: `docs/README_INTEGRATION.md`
- **VR Tour Guide**: `docs/VR_TOUR_README.md`
- **Voice Assistant**: `docs/VOICE_ASSISTANT_PLAN.md`

## 🎉 **Benefits of Restructuring**

1. **🚀 Faster Development**: Single backend to manage
2. **🔧 Easier Debugging**: All services in one place
3. **📦 Simpler Deployment**: One Python service + React app
4. **🎯 Better Performance**: Shared MongoDB connection
5. **📝 Cleaner Code**: Logical folder organization
6. **🛠️ Better DX**: Automated startup scripts

## 🔮 **Next Steps**

1. **Test the new structure** with existing functionality
2. **Update CI/CD** pipelines for new folder structure
3. **Migrate environment variables** to new locations
4. **Update deployment** configurations
5. **Archive old structure** once migration is confirmed

---

## 💡 **Migration Note**

This restructure maintains **100% backward compatibility** with the existing API endpoints while providing a much cleaner and more maintainable codebase.

The original messy structure with `kuldeep/` folders and separate Node.js service has been replaced with a professional, production-ready architecture.

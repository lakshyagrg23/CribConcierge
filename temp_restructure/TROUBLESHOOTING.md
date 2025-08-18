# 🚀 CribConcierge Startup Troubleshooting Guide

## 🔍 MongoDB Connection Issues

### **Quick Diagnosis**

1. **Check if MongoDB is running:**

```bash
# Windows
net start MongoDB
# or check services: services.msc

# Mac
brew services list | grep mongodb

# Linux
sudo systemctl status mongod
```

2. **Test MongoDB connection:**

```bash
# Try connecting with mongo shell
mongo mongodb://localhost:27017/imageupload
# or with mongosh (newer versions)
mongosh mongodb://localhost:27017/imageupload
```

3. **Check MongoDB logs:**

```bash
# Windows: Check Event Viewer or MongoDB log files
# Mac/Linux:
tail -f /var/log/mongodb/mongod.log
```

### **Common Fixes**

#### **1. MongoDB Not Installed**

```bash
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac:
brew install mongodb/brew/mongodb-community

# Linux (Ubuntu):
sudo apt install mongodb
```

#### **2. MongoDB Service Not Running**

```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### **3. Port 27017 Blocked**

```bash
# Check if port is open
netstat -an | findstr 27017
# or
telnet localhost 27017
```

#### **4. Authentication Issues**

If MongoDB has authentication enabled, update the URI:

```bash
# In .env file:
MONGODB_URI="mongodb://username:password@localhost:27017/imageupload"
```

### **Environment Setup**

1. **Verify .env file:**

```bash
cd temp_restructure/backend
cat .env
```

Should contain:

```
MONGODB_URI="mongodb://localhost:27017/imageupload"
GEMINI_API_KEY="your_key_here"
FLASK_ENV=development
FLASK_DEBUG=1
```

2. **Test environment loading:**

```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print('MongoDB URI:', os.getenv('MONGODB_URI'))"
```

### **Backend Startup**

1. **Install dependencies:**

```bash
cd temp_restructure/backend
pip install -r requirements.txt
```

2. **Test MongoDB connection:**

```bash
python test_mongodb_simple.py
```

3. **Start backend:**

```bash
python app_integrated.py
```

### **Frontend Startup**

1. **Install dependencies:**

```bash
cd temp_restructure/frontend
npm install
```

2. **Start frontend:**

```bash
npm run dev
```

### **Full Application Startup**

Use the automated scripts:

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

### **Verification**

1. **Backend health check:**

   - Visit: http://localhost:5090/api/health

2. **Frontend loading:**

   - Visit: http://localhost:8080

3. **Test image upload:**
   - Go to: http://localhost:8080/addlisting
   - Try uploading an image

### **Still Having Issues?**

1. **Check all services are running:**

```bash
# Check MongoDB
mongo --eval "print('MongoDB is running')"

# Check backend
curl http://localhost:5090/api/health

# Check frontend
curl http://localhost:8080
```

2. **Check logs:**

   - Backend: Look at the terminal where you started the Flask app
   - Frontend: Look at the terminal where you started `npm run dev`
   - MongoDB: Check MongoDB logs

3. **Reset everything:**

```bash
# Stop all services
# Kill backend and frontend processes

# Restart MongoDB
net stop MongoDB
net start MongoDB

# Restart backend
cd temp_restructure/backend
python app_integrated.py

# Restart frontend
cd temp_restructure/frontend
npm run dev
```

### **Alternative MongoDB Solutions**

If local MongoDB is problematic, you can use:

1. **MongoDB Atlas (Cloud):**

   - Sign up at: https://www.mongodb.com/atlas
   - Create a free cluster
   - Update MONGODB_URI with Atlas connection string

2. **Docker MongoDB:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

3. **MongoDB Compass (GUI):**
   - Download from: https://www.mongodb.com/products/compass
   - Use to visually verify your database

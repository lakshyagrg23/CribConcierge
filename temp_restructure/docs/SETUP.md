# 🚀 Setup Guide

## Quick Setup for Your System

### Current Status

- ✅ Node.js v22.14.0 installed
- ✅ Project dependencies installed
- ❌ MongoDB not installed (required)

## Step 1: Install MongoDB

You need MongoDB to store the images. Choose one option:

### Option A: MongoDB Community Server (Recommended)

**For Windows:**

1. Go to https://www.mongodb.com/try/download/community
2. Download "MongoDB Community Server" for Windows
3. Run the installer
4. ✅ Check "Install MongoDB as a Service"
5. ✅ Check "Install MongoDB Compass" (optional GUI)
6. Complete installation

**Start MongoDB:**

- It should start automatically as a Windows service
- Or manually: Search "Services" → Find "MongoDB Server" → Start

### Option B: MongoDB Atlas (Cloud - No Installation)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a free cluster
4. Get connection string
5. Update your `.env` file:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/imageupload
   ```

### Option C: Docker (If you have Docker)

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Step 2: Verify MongoDB is Running

After installation, test MongoDB connection:

```bash
# Test with Node.js
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/test').then(() => console.log('✅ MongoDB Connected!')).catch(err => console.log('❌ MongoDB Error:', err.message))"
```

## Step 3: Start Your Application

Once MongoDB is running:

```bash
# Start backend server
npm run dev
```

You should see:

```
✅ Image Upload Service running on port 3000
✅ Connected to MongoDB successfully
✅ Image Upload Component initialized successfully
```

## Step 4: Test the API

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/
```

## Step 5: Start React Frontend (Optional)

```bash
# In a new terminal
npm run dev:react
```

Visit: http://localhost:3001

## 🔧 Environment Configuration

Create `.env` file in project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/imageupload
DB_NAME=imageupload

# Server Configuration
PORT=3000
NODE_ENV=development

# Upload Configuration
MAX_FILE_SIZE=5242880
MAX_FILES_PER_UPLOAD=5
```

## 🚨 Troubleshooting

### Server exits immediately

- **Cause**: MongoDB not running
- **Fix**: Install and start MongoDB (Step 1)

### "Cannot connect to MongoDB"

- **Cause**: Wrong connection string or MongoDB not running
- **Fix**: Check MongoDB status and connection string

### "Port 3000 already in use"

- **Fix**: Change PORT in `.env` or kill existing process

### "Module not found" errors

- **Fix**: Run `npm install` again

## 📞 Quick Help

**MongoDB Installation Issues?**

- Windows: https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/
- macOS: `brew install mongodb-community`
- Linux: https://docs.mongodb.com/manual/administration/install-on-linux/

**Still stuck?** The issue is almost always MongoDB not being installed or not running.

Once MongoDB is working, your image upload component will work perfectly! 🎉

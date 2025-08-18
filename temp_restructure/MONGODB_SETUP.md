# MongoDB Setup Guide for Windows

## Quick Start (Recommended)

### Option 1: MongoDB Atlas (Cloud - Easiest)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Update `.env` file with your connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cribconcierge?retryWrites=true&w=majority
   ```

### Option 2: Local MongoDB Installation

#### Step 1: Download and Install MongoDB Community Server

1. Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Select:
   - Version: 7.0 (current)
   - Platform: Windows
   - Package: msi
3. Download and run the installer
4. During installation:
   - Check "Install MongoDB as a Service"
   - Check "Install MongoDB Compass" (GUI tool)

#### Step 2: Add MongoDB to PATH

1. Add MongoDB bin directory to your system PATH:
   ```
   C:\Program Files\MongoDB\Server\7.0\bin
   ```

#### Step 3: Start MongoDB Service

```powershell
# Start MongoDB service
net start MongoDB

# Check if MongoDB is running
tasklist | findstr mongod
```

#### Step 4: Test Connection

```powershell
# Test with mongo shell
mongosh

# Or test connection string
mongosh "mongodb://localhost:27017/cribconcierge"
```

#### Step 5: Update Environment Variables

Create/update `.env` file in backend directory:

```
MONGODB_URI=mongodb://localhost:27017/cribconcierge
GOOGLE_API_KEY=your_google_api_key_here
```

## Alternative: MongoDB Compass (GUI)

1. Open MongoDB Compass (installed with MongoDB)
2. Connect to: `mongodb://localhost:27017`
3. Create database: `cribconcierge`
4. Test connection before running the app

## Troubleshooting

### MongoDB Service Won't Start

```powershell
# Check Windows services
services.msc
# Look for "MongoDB Server" and start it

# Or via command line:
sc start MongoDB
```

### Connection Timeout Issues

1. Check Windows Firewall settings
2. Ensure MongoDB is listening on correct port:
   ```powershell
   netstat -an | findstr 27017
   ```

### Python Driver Issues

```powershell
# Reinstall pymongo
pip uninstall pymongo
pip install pymongo
```

## Testing Your Setup

### Test 1: Basic Connection

```python
from pymongo import MongoClient
client = MongoClient("mongodb://localhost:27017/")
print(client.admin.command('ping'))
```

### Test 2: Full Application Test

```powershell
# Navigate to backend directory
cd temp_restructure/backend

# Run the mock version first
python app_mock.py

# Then try the full version
python app_integrated.py
```

## Current Project Status

- ✅ **Mock Backend**: Working in `app_mock.py` (no MongoDB required)
- ⏳ **Full Backend**: Requires MongoDB setup for `app_integrated.py`
- ✅ **Frontend**: Ready to connect to either backend

## Next Steps

1. **Test Mock Version**: Run `app_mock.py` to verify everything else works
2. **Install MongoDB**: Follow guide above
3. **Test Full Version**: Switch to `app_integrated.py` once MongoDB is ready
4. **Production**: Use MongoDB Atlas for deployment

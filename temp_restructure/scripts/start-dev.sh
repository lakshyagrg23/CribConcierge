#!/bin/bash
# CribConcierge Development Startup Script

echo "🚀 Starting CribConcierge Development Environment..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "🔍 Checking dependencies..."

if ! command_exists python; then
    echo "❌ Python not found. Please install Python 3.8+"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install Node.js and npm"
    exit 1
fi

echo "✅ Dependencies found"

# Set environment variables
export FLASK_ENV=development
export FLASK_DEBUG=1

# Start backend
echo "🐍 Starting Flask Backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python -m venv venv
fi

source venv/bin/activate || . venv/Scripts/activate
pip install -r requirements.txt

echo "🌐 Starting backend on http://localhost:5090"
python app_integrated.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Start frontend
echo "⚛️ Starting React Frontend..."
cd ../frontend
npm install
echo "🌐 Starting frontend on http://localhost:8080"
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 5

echo "✅ CribConcierge is now running!"
echo "🌐 Frontend: http://localhost:8080"
echo "🔧 Backend API: http://localhost:5090"
echo "📖 API Docs: http://localhost:5090"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user input
wait

# CribConcierge Development Startup Script for Windows
# Run with: powershell -ExecutionPolicy Bypass -File start-dev.ps1

Write-Host "🚀 Starting CribConcierge Development Environment..." -ForegroundColor Green

# Function to check if a command exists
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Check dependencies
Write-Host "🔍 Checking dependencies..." -ForegroundColor Yellow

if (-not (Test-Command python)) {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

if (-not (Test-Command npm)) {
    Write-Host "❌ npm not found. Please install Node.js and npm" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies found" -ForegroundColor Green

# Set environment variables
$env:FLASK_ENV = "development"
$env:FLASK_DEBUG = "1"

# Start backend
Write-Host "🐍 Starting Flask Backend..." -ForegroundColor Yellow
Set-Location backend

if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv venv
}

# Activate virtual environment
if (Test-Path "venv\Scripts\Activate.ps1") {
    . .\venv\Scripts\Activate.ps1
}
else {
    .\venv\Scripts\activate.bat
}

pip install -r requirements.txt

Write-Host "🌐 Starting backend on http://localhost:5090 (MOCK MODE)" -ForegroundColor Green
Write-Host "📖 See MONGODB_SETUP.md to enable full functionality" -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock { python app_mock.py }

# Wait for backend to start
Start-Sleep 5

# Start frontend
Write-Host "⚛️ Starting React Frontend..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install

Write-Host "🌐 Starting frontend on http://localhost:8080" -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock { npm run dev }

# Wait for frontend to start
Start-Sleep 5

Write-Host "✅ CribConcierge is now running!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:5090" -ForegroundColor Cyan
Write-Host "📖 API Docs: http://localhost:5090" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow

# Function to cleanup on exit
function Stop-Services {
    Write-Host "🛑 Stopping services..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "✅ All services stopped" -ForegroundColor Green
}

# Set trap to cleanup on script exit
try {
    # Wait for user input
    Read-Host "Press Enter to stop all services"
}
finally {
    Stop-Services
}

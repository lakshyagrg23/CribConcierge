#!/usr/bin/env powershell

<#
.SYNOPSIS
    Startup script for Image Upload Component Integration
.DESCRIPTION
    Launches all required services for the real estate platform with image upload functionality
.EXAMPLE
    .\startup.ps1
#>

$ErrorActionPreference = "Stop"

# Colors for output
$colors = @{
    Green = "Green"
    Red = "Red"
    Yellow = "Yellow"
    Blue = "Blue"
    Cyan = "Cyan"
}

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Test-Port {
    param(
        [int]$Port
    )
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

function Start-Service {
    param(
        [string]$Name,
        [string]$Command,
        [string]$WorkingDirectory,
        [int]$Port,
        [string]$LogFile
    )
    
    Write-ColorOutput "🚀 Starting $Name..." $colors.Blue
    
    if (Test-Port -Port $Port) {
        Write-ColorOutput "⚠ $Name already running on port $Port" $colors.Yellow
        return
    }
    
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "powershell.exe"
    $processInfo.Arguments = "-Command `"cd '$WorkingDirectory'; $Command`""
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $false
    $processInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Normal
    
    try {
        $process = [System.Diagnostics.Process]::Start($processInfo)
        Write-ColorOutput "✅ $Name started successfully (PID: $($process.Id))" $colors.Green
        
        # Wait a moment for the service to initialize
        Start-Sleep -Seconds 2
        
        # Verify the service is running
        $retries = 0
        while ($retries -lt 10 -and !(Test-Port -Port $Port)) {
            Start-Sleep -Seconds 1
            $retries++
        }
        
        if (Test-Port -Port $Port) {
            Write-ColorOutput "🎯 $Name is responding on port $Port" $colors.Green
        } else {
            Write-ColorOutput "❌ $Name may not have started correctly" $colors.Red
        }
    }
    catch {
        Write-ColorOutput "❌ Failed to start $Name`: $($_.Exception.Message)" $colors.Red
    }
}

# Main startup sequence
Write-ColorOutput "=" * 80 $colors.Cyan
Write-ColorOutput "🏠 Real Estate Platform with Image Upload - Startup Script" $colors.Cyan
Write-ColorOutput "=" * 80 $colors.Cyan

# Check if MongoDB is running
Write-ColorOutput "🔍 Checking MongoDB..." $colors.Blue
if (!(Test-Port -Port 27017)) {
    Write-ColorOutput "❌ MongoDB is not running on port 27017" $colors.Red
    Write-ColorOutput "Please start MongoDB first:" $colors.Yellow
    Write-ColorOutput "  mongod --dbpath <your-db-path>" $colors.Yellow
    exit 1
} else {
    Write-ColorOutput "✅ MongoDB is running" $colors.Green
}

# Project root directory
$projectRoot = "d:\Code\Projects\AgenticAIHackathon"

# Service configurations
$services = @(
    @{
        Name = "Node.js Image Service"
        Command = "node src/ImageUploadComponent.js"
        WorkingDirectory = $projectRoot
        Port = 3000
        LogFile = "node-service.log"
    },
    @{
        Name = "Flask Backend"
        Command = "python app.py"
        WorkingDirectory = "$projectRoot\kuldeep\backend"
        Port = 5090
        LogFile = "flask-backend.log"
    },
    @{
        Name = "React Frontend"
        Command = "npm run dev"
        WorkingDirectory = "$projectRoot\kuldeep\frontend"
        Port = 8080
        LogFile = "react-frontend.log"
    }
)

# Start all services
foreach ($service in $services) {
    Start-Service @service
    Start-Sleep -Seconds 3  # Give each service time to start
}

Write-ColorOutput "`n" + "=" * 80 $colors.Cyan
Write-ColorOutput "🎉 All services started!" $colors.Green
Write-ColorOutput "=" * 80 $colors.Cyan

Write-ColorOutput "`n📋 Service URLs:" $colors.Blue
Write-ColorOutput "  🖼️  Node.js Image Service: http://localhost:3000" $colors.White
Write-ColorOutput "  🐍  Flask Backend: http://localhost:5090" $colors.White
Write-ColorOutput "  ⚛️  React Frontend: http://localhost:8080" $colors.White

Write-ColorOutput "`n🎯 Quick Access:" $colors.Blue
Write-ColorOutput "  🏠 Main Application: http://localhost:8080" $colors.White
Write-ColorOutput "  📝 Add Listing: http://localhost:8080/add-listing" $colors.White

Write-ColorOutput "`n🧪 Testing:" $colors.Blue
Write-ColorOutput "  Run integration tests: node test-integration.js" $colors.White

Write-ColorOutput "`n⚠️  To stop services:" $colors.Yellow
Write-ColorOutput "  Use Ctrl+C in each terminal window" $colors.White

Write-ColorOutput "`n🔍 Monitoring:" $colors.Blue
Write-ColorOutput "  Check logs in respective terminal windows" $colors.White
Write-ColorOutput "  MongoDB logs: Check MongoDB service" $colors.White

# Wait for user input
Write-ColorOutput "`nPress any key to exit..." $colors.Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

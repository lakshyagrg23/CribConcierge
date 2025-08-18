# Quick PowerShell test for the API
try {
    Write-Host "Testing Mock Backend API..." -ForegroundColor Yellow
    
    # Test root endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:5090/" -Method GET
    Write-Host "✅ Root endpoint working" -ForegroundColor Green
    Write-Host "   Name: $($response.name)" -ForegroundColor Cyan
    Write-Host "   Version: $($response.version)" -ForegroundColor Cyan
    Write-Host "   Description: $($response.description)" -ForegroundColor Cyan
    
    # Test health endpoint
    $health = Invoke-RestMethod -Uri "http://localhost:5090/api/health" -Method GET
    Write-Host "✅ Health endpoint working" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Cyan
    Write-Host "   Mode: $($health.mode)" -ForegroundColor Cyan
    
    # Test AI chat
    $chat = Invoke-RestMethod -Uri "http://localhost:5090/api/askIt?question=hello" -Method GET
    Write-Host "✅ AI Chat endpoint working" -ForegroundColor Green
    Write-Host "   Response: $($chat.answer.Substring(0, [Math]::Min(50, $chat.answer.Length)))..." -ForegroundColor Cyan
    
    Write-Host "`n🎉 All tests passed! Mock backend is working correctly." -ForegroundColor Green
    Write-Host "🌐 Frontend should be accessible at: http://localhost:8080" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ API test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the backend is running: python app_mock.py" -ForegroundColor Yellow
}

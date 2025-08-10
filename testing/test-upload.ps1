# PowerShell script to test image upload
$filePath = "kuldeep/frontend/src/assets/property-1.jpg"
$uri = "http://localhost:3000/upload"

if (Test-Path $filePath) {
    Write-Host "📤 Testing image upload: $filePath"
    
    $form = @{
        image = Get-Item -Path $filePath
    }
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method Post -Form $form -ContentType "multipart/form-data"
        Write-Host "✅ Upload successful!" -ForegroundColor Green
        Write-Host "📄 Response:" -ForegroundColor Blue
        $response | ConvertTo-Json -Depth 3
        
        if ($response.data.fileId) {
            $fileId = $response.data.fileId
            Write-Host "🆔 File ID: $fileId" -ForegroundColor Yellow
            
            # Test retrieval
            Write-Host "🔍 Testing image retrieval..." -ForegroundColor Blue
            $retrieveUri = "http://localhost:3000/images/$fileId"
            
            try {
                $retrieveResponse = Invoke-WebRequest -Uri $retrieveUri -Method Get
                if ($retrieveResponse.StatusCode -eq 200) {
                    Write-Host "✅ Image retrieval successful!" -ForegroundColor Green
                    Write-Host "📊 Retrieved $($retrieveResponse.Content.Length) bytes" -ForegroundColor Green
                } else {
                    Write-Host "❌ Image retrieval failed with status: $($retrieveResponse.StatusCode)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ Image retrieval error: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
    } catch {
        Write-Host "❌ Upload failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Test image not found: $filePath" -ForegroundColor Red
}

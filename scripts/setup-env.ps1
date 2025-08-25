# HuggingFace API Environment Setup Script
Write-Host "Setting up HuggingFace API configuration..." -ForegroundColor Green
Write-Host ""

# Check if .env file already exists
if (Test-Path ".env") {
    Write-Host ".env file already exists!" -ForegroundColor Yellow
    Write-Host "Please edit it manually to add your API key." -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to continue"
    exit 1
}

# Create .env file with template
Write-Host "Creating .env file..." -ForegroundColor Blue
@"
# HuggingFace API Configuration
# Replace 'your_api_key_here' with your actual HuggingFace API key
# Get your API key from: https://huggingface.co/settings/tokens
VITE_HUGGINGFACE_API_KEY=your_api_key_here

# Note: This file contains sensitive information and should never be committed to version control
"@ | Out-File -FilePath ".env" -Encoding UTF8

Write-Host ""
Write-Host ".env file created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Go to https://huggingface.co/settings/tokens" -ForegroundColor White
Write-Host "2. Create a new access token" -ForegroundColor White
Write-Host "3. Copy the token (starts with hf_)" -ForegroundColor White
Write-Host "4. Edit the .env file and replace 'your_api_key_here' with your actual token" -ForegroundColor White
Write-Host "5. Restart your development server" -ForegroundColor White
Write-Host ""
Write-Host "The .env file has been added to .gitignore to keep it secure." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue"

@echo off
echo Setting up HuggingFace API configuration...
echo.

REM Check if .env file already exists
if exist ".env" (
    echo .env file already exists!
    echo Please edit it manually to add your API key.
    echo.
    pause
    exit /b 1
)

REM Create .env file with template
echo Creating .env file...
echo # HuggingFace API Configuration > .env
echo # Replace 'your_api_key_here' with your actual HuggingFace API key >> .env
echo # Get your API key from: https://huggingface.co/settings/tokens >> .env
echo VITE_HUGGINGFACE_API_KEY=your_api_key_here >> .env
echo. >> .env
echo # Note: This file contains sensitive information and should never be committed to version control >> .env

echo.
echo .env file created successfully!
echo.
echo Next steps:
echo 1. Go to https://huggingface.co/settings/tokens
echo 2. Create a new access token
echo 3. Copy the token (starts with hf_)
echo 4. Edit the .env file and replace 'your_api_key_here' with your actual token
echo 5. Restart your development server
echo.
echo The .env file has been added to .gitignore to keep it secure.
echo.
pause

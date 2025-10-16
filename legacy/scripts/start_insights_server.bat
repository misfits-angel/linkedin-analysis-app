@echo off
echo ============================================================
echo Starting LinkedIn Analysis API Server
echo ============================================================
echo.

REM Navigate to project root
cd /d "%~dp0.."

REM Check if .env file exists
if not exist .env (
    echo [ERROR] .env file not found!
    echo.
    echo Please create a .env file with your Gemini API key:
    echo   1. Create a new file named ".env" in the project root
    echo   2. Add this line: GEMINI_API_KEY=your_api_key_here
    echo   3. Get your API key from: https://makersuite.google.com/app/apikey
    echo.
    pause
    exit /b 1
)

REM Check if requirements are installed
python -c "import flask" 2>nul
if errorlevel 1 (
    echo [INFO] Installing required packages...
    echo.
    pip install -r api\requirements.txt
    echo.
)

echo [INFO] Starting Flask server...
echo [INFO] Keep this window open while using the insights feature.
echo.
echo Press Ctrl+C to stop the server
echo.

python api\linkedin_analysis_api.py

pause


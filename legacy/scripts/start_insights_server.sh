#!/bin/bash

echo "============================================================"
echo "Starting LinkedIn Analysis API Server"
echo "============================================================"
echo ""

# Navigate to project root
cd "$(dirname "$0")/.."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "[ERROR] .env file not found!"
    echo ""
    echo "Please create a .env file with your Gemini API key:"
    echo "  1. Create a new file named '.env' in the project root"
    echo "  2. Add this line: GEMINI_API_KEY=your_api_key_here"
    echo "  3. Get your API key from: https://makersuite.google.com/app/apikey"
    echo ""
    exit 1
fi

# Check if requirements are installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "[INFO] Installing required packages..."
    echo ""
    pip3 install -r api/requirements.txt
    echo ""
fi

echo "[INFO] Starting Flask server..."
echo "[INFO] Keep this terminal open while using the insights feature."
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 api/linkedin_analysis_api.py


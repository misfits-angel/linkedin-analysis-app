@echo off
echo Starting PhantomBuster to CSV Workflow
echo =====================================

cd /d "%~dp0"

if "%1"=="" (
    echo Usage: %0 "https://phantombuster.com/123/phantoms/456/console" [output.csv]
    echo.
    echo Example: %0 "https://phantombuster.com/6707023177096457/phantoms/405868001478685/console"
    echo.
    pause
    exit /b 1
)

set CONSOLE_URL=%1
set OUTPUT_FILE=%2

echo Installing dependencies...
pip install -r requirements_phantombuster.txt

echo.
echo Running complete workflow...
echo Console URL: %CONSOLE_URL%
if defined OUTPUT_FILE (
    echo Output CSV: %OUTPUT_FILE%
    python complete_phantombuster_workflow.py --url "%CONSOLE_URL%" --output "%OUTPUT_FILE%"
) else (
    python complete_phantombuster_workflow.py --url "%CONSOLE_URL%"
)

echo.
echo Workflow completed!
pause

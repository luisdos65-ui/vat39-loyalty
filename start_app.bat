@echo off
echo ========================================
echo VAT39 Loyalty - Start App
echo ========================================

:: Ensure we are in the correct directory
cd /d "%~dp0"

echo Starting Next.js development server...
echo.
echo If the browser does not open automatically, visit:
echo http://localhost:3000
echo.

:: Use npm.cmd explicitly to bypass PowerShell execution policy issues
call npm.cmd run dev

if %errorlevel% neq 0 (
    echo.
    echo Error: Could not start the server.
    echo Please make sure you have installed dependencies using setup_web.bat
    pause
)

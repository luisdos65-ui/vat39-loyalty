@echo off
echo ========================================
echo Pushing to GitHub...
echo ========================================
echo.
echo We are pushing the local code to GitHub to ensure Vercel gets the latest version.
echo If asked for credentials, please enter them.
echo.
git branch -M main
git push -u origin main --force
echo.
pause

@echo off
echo ========================================
echo Deploying to Vercel (Production)
echo ========================================
echo.
echo This script will deploy your app directly to Vercel.
echo If this is your first time, it will ask you to log in via your browser.
echo.
echo When asked "Set up and deploy?", type: y
echo When asked "Which scope?", select your account.
echo When asked "Link to existing project?", type: n (unless you are sure)
echo When asked "Project Name", press Enter to use default.
echo When asked "In which directory is your code located?", press Enter.
echo.
echo Starting deployment...
call npx vercel --prod
echo.
pause

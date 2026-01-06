@echo off
echo ========================================
echo Starting Login Page Test
echo ========================================
echo.
echo Step 1: Starting Backend Server...
start "Backend Server" cmd /k "cd server && npm start"
timeout /t 10 /nobreak > nul

echo.
echo Step 2: Starting Frontend Client...
start "Frontend Client" cmd /k "cd client && npm start"
timeout /t 15 /nobreak > nul

echo.
echo Step 3: Running Playwright Login Tests...
timeout /t 5 /nobreak > nul
npm run test:login-page

echo.
echo ========================================
echo Test Complete! Check the HTML report.
echo ========================================
pause

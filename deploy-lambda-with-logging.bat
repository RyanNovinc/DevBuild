@echo off
echo Deploying Lambda function with DATE FORMAT FIX...

REM Create deployment package
if exist lambda-deployment-package.zip del lambda-deployment-package.zip
powershell -Command "Compress-Archive -Path 'websocket-message-handler-improved.js' -DestinationPath 'lambda-deployment-package.zip' -CompressionLevel Optimal -Force"

REM Deploy to AWS Lambda
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" lambda update-function-code --function-name LifeCompass-WebSocketHandler --zip-file fileb://lambda-deployment-package.zip --region ap-southeast-2

if %ERRORLEVEL% equ 0 (
    echo ✅ Lambda function deployed successfully with DATE FORMAT FIX!
    echo.
    echo 🔧 WHAT WAS FIXED:
    echo - Claude was generating "2025-0903 14:00" (missing dash)
    echo - Lambda now automatically fixes this to "2025-09-03 14:00"
    echo - This should resolve the timeblock prefilling issue
    echo.
    echo ✅ WHAT SHOULD WORK NOW:
    echo - Correct start/end times should prefill in the modal
    echo - Recurring settings should work (isRepeating: true was already working)
    echo.
) else (
    echo ❌ Failed to deploy Lambda function
    exit /b 1
)

echo.
echo 🧪 TEST IT NOW:
echo Create the timeblock again and verify:
echo 1. Start time shows 2:00 PM (not current time)
echo 2. End time shows 3:00 PM  
echo 3. Recurring toggle is ON in Additional Options tab
echo.

pause
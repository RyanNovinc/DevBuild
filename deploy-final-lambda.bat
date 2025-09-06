@echo off
echo Deploying Final Lambda function with Correct Domains + Smart Buffering...

REM Create deployment package
if exist lambda-deployment-final.zip del lambda-deployment-final.zip
powershell -Command "Compress-Archive -Path 'websocket-handler-final.js' -DestinationPath 'lambda-deployment-final.zip' -CompressionLevel Optimal -Force"

REM Deploy to AWS Lambda
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" lambda update-function-code --function-name LifeCompass-WebSocketHandler --zip-file fileb://lambda-deployment-final.zip --region ap-southeast-2

if %ERRORLEVEL% equ 0 (
    echo ✅ Lambda function deployed successfully with DOMAIN FIXES + SMART BUFFERING!
    echo.
    echo 🔧 WHAT WAS FIXED:
    echo - Updated domains to match ProfileScreen: Career ^& Work, Health ^& Wellness, etc.
    echo - Removed color and icon parameters (UI handles these automatically)
    echo - Removed priority parameter (not needed)
    echo - Smart buffering: function calls = buffer, conversation = stream
    echo - Modal data corruption issue should be resolved
    echo.
    echo ✅ WHAT SHOULD WORK NOW:
    echo - AI will suggest correct domain names that exist in your app
    echo - Modal forms will populate with complete data (no more empty fields)
    echo - Domain selection will automatically set colors and icons
    echo - Bulk creation context will be maintained
    echo - Conversational responses still stream smoothly
    echo.
) else (
    echo ❌ Failed to deploy Lambda function
    exit /b 1
)

echo.
echo 🧪 TEST IT NOW:
echo 1. Create individual goals/milestones/tasks - modal should have complete data
echo 2. Create comprehensive plans - context should be maintained
echo 3. Conversational responses should still stream smoothly
echo.

pause
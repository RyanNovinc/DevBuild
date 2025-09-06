@echo off
echo Deploying CORRECTED Lambda function - Original Working System + Smart Buffering Only...

REM Create deployment package
if exist lambda-deployment-corrected.zip del lambda-deployment-corrected.zip
powershell -Command "Compress-Archive -Path 'websocket-handler-corrected.js' -DestinationPath 'lambda-deployment-corrected.zip' -CompressionLevel Optimal -Force"

REM Deploy to AWS Lambda
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" lambda update-function-code --function-name LifeCompass-WebSocketHandler --zip-file fileb://lambda-deployment-corrected.zip --region ap-southeast-2

if %ERRORLEVEL% equ 0 (
    echo ✅ CORRECTED Lambda function deployed successfully!
    echo.
    echo 🔧 WHAT WAS DONE:
    echo - Used ORIGINAL working system prompt (preserves all context intelligence)
    echo - Used ORIGINAL function definitions (with color/icon parameters)
    echo - Used ORIGINAL domain mapping functions (getDomainColor/getDomainIcon)
    echo - Used ORIGINAL error recovery logic (comprehensive JSON repair)
    echo - Used ORIGINAL processActionData function (proper domain-to-color mapping)
    echo - ADDED ONLY: Smart buffering fix (function calls = buffer, conversation = stream)
    echo.
    echo ✅ WHAT SHOULD WORK NOW:
    echo - Modal forms should populate with complete data (no truncation)
    echo - Colors and icons will be correctly mapped from domains
    echo - All comprehensive planning features preserved
    echo - Context intelligence maintained for bulk creation
    echo - Conversational responses still stream smoothly
    echo - All error recovery mechanisms intact
    echo.
) else (
    echo ❌ Failed to deploy Lambda function
    exit /b 1
)

echo.
echo 🧪 TEST IT NOW:
echo 1. Create individual goals/milestones/tasks - modal should have complete data
echo 2. Ask for "comprehensive plan" - should maintain full context
echo 3. Colors and icons should match domains automatically
echo 4. Conversational responses should still stream smoothly
echo 5. All original functionality should be preserved
echo.

pause
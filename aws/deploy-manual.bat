@echo off
echo ======================================
echo   LifeCompass Referral System Deploy
echo ======================================
echo.

set AWS_CLI="C:\Program Files\Amazon\AWSCLIV2\aws.exe"

echo Step 1: Configure AWS CLI (if not already done)
echo Run this command manually in a new command prompt:
echo   aws configure
echo.
echo You'll need:
echo   - AWS Access Key ID
echo   - AWS Secret Access Key  
echo   - Default region (e.g., us-east-1)
echo   - Default output format (json)
echo.

pause

echo Step 2: Deploy CloudFormation Stack
echo.
%AWS_CLI% cloudformation deploy ^
  --template-file cloudformation-template.yaml ^
  --stack-name lifecompass-referral-system ^
  --capabilities CAPABILITY_IAM ^
  --parameter-overrides AppName=LifeCompass Environment=prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Stack deployed successfully!
    echo.
    echo Step 3: Get your API Gateway URL
    %AWS_CLI% cloudformation describe-stacks ^
      --stack-name lifecompass-referral-system ^
      --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" ^
      --output text
    echo.
    echo Step 4: Test your deployment
    echo Copy the URL above and test with: curl YOUR_URL/health
) else (
    echo.
    echo ❌ Deployment failed. Check the error above.
    echo Make sure you've configured AWS CLI with: aws configure
)

pause
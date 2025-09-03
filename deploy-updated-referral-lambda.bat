@echo off
echo Deploying updated LifeCompass-ReferralSyncHandler with validation endpoint...

:: Create deployment package
echo Creating deployment package...
copy "LifeCompass-ReferralSyncHandler.js" "lambda-deployment\index.js"
cd lambda-deployment
zip -r lambda-deployment.zip index.js package.json node_modules
cd ..

:: Deploy to AWS
echo Deploying to AWS Lambda...
"C:\Program Files\Amazon\AWSCLIV2\aws.exe" lambda update-function-code --function-name LifeCompass-ReferralSyncHandler --zip-file fileb://lambda-deployment/lambda-deployment.zip --region ap-southeast-2

echo Deployment complete!
echo New endpoint available: /validate-referral-availability

:: Clean up
del lambda-deployment\index.js
del lambda-deployment\lambda-deployment.zip

echo Done!
pause
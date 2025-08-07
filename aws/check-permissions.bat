@echo off
echo ======================================
echo   Checking AWS Permissions
echo ======================================
echo.

set AWS_CLI="C:\Program Files\Amazon\AWSCLIV2\aws.exe"

echo Testing current AWS user and permissions...
echo.

echo 1. Current AWS user:
%AWS_CLI% sts get-caller-identity

echo.
echo 2. Testing Lambda permissions:
%AWS_CLI% lambda list-functions --max-items 1 --output table

echo.
echo 3. Testing DynamoDB permissions:
%AWS_CLI% dynamodb list-tables --max-items 1 --output table

echo.
echo 4. Testing CloudFormation permissions:
%AWS_CLI% cloudformation list-stacks --max-items 1 --output table

echo.
echo If all commands above worked, your current user has sufficient permissions!
echo If any failed, you'll need to add permissions or create a new user.
echo.
pause
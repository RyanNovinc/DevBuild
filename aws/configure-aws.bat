@echo off
echo ======================================
echo      AWS CLI Configuration Setup
echo ======================================
echo.
echo This will configure AWS CLI with your credentials.
echo You'll need:
echo   1. AWS Access Key ID
echo   2. AWS Secret Access Key
echo   3. Default region (e.g., us-east-1)
echo   4. Default output format (leave as 'json')
echo.

"C:\Program Files\Amazon\AWSCLIV2\aws.exe" configure

echo.
echo Configuration complete! Now you can run:
echo   deploy.ps1 (PowerShell)
echo   or
echo   deploy-manual.bat (Command Prompt)
pause
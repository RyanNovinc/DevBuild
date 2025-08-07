# LifeCompass Referral System Deployment Script
# PowerShell version for better Windows compatibility

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   LifeCompass Referral System Deploy" -ForegroundColor Cyan  
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$AWS_CLI = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

# Check if AWS CLI is configured
Write-Host "Checking AWS CLI configuration..." -ForegroundColor Yellow
try {
    & $AWS_CLI sts get-caller-identity --output text 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ AWS CLI is configured and working!" -ForegroundColor Green
    } else {
        throw "Not configured"
    }
} catch {
    Write-Host "❌ AWS CLI not configured. Please run:" -ForegroundColor Red
    Write-Host "   aws configure" -ForegroundColor White
    Write-Host ""
    Write-Host "You'll need:" -ForegroundColor Yellow
    Write-Host "   - AWS Access Key ID" -ForegroundColor White
    Write-Host "   - AWS Secret Access Key" -ForegroundColor White
    Write-Host "   - Default region (e.g., us-east-1)" -ForegroundColor White
    Write-Host "   - Default output format (json)" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "Deploying CloudFormation stack..." -ForegroundColor Yellow

& $AWS_CLI cloudformation deploy `
  --template-file cloudformation-template.yaml `
  --stack-name lifecompass-referral-system `
  --capabilities CAPABILITY_IAM `
  --parameter-overrides AppName=LifeCompass Environment=prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Stack deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Getting your API Gateway URL..." -ForegroundColor Yellow
    
    $API_URL = & $AWS_CLI cloudformation describe-stacks `
      --stack-name lifecompass-referral-system `
      --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" `
      --output text
    
    Write-Host ""
    Write-Host "🎉 Your API Gateway URL is:" -ForegroundColor Green
    Write-Host $API_URL -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Add this to your React Native app environment:" -ForegroundColor White
    Write-Host "   REFERRAL_API_URL=$API_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Test your deployment:" -ForegroundColor White
    Write-Host "   curl $API_URL/health" -ForegroundColor Cyan
    Write-Host ""
    
    # Test the deployment
    Write-Host "Testing the deployment..." -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
        if ($response.success -eq $true) {
            Write-Host "✅ Health check passed!" -ForegroundColor Green
            Write-Host "Response: $($response.message)" -ForegroundColor White
        }
    } catch {
        Write-Host "⚠️  Health check failed, but deployment completed. API might need a moment to warm up." -ForegroundColor Yellow
    }
    
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error above." -ForegroundColor Red
    Write-Host "Make sure you've configured AWS CLI with: aws configure" -ForegroundColor Yellow
}
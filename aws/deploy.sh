#!/bin/bash

# LifeCompass Referral System AWS Deployment Script

set -e

echo "🚀 Deploying LifeCompass Referral System to AWS..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if SAM CLI is installed (optional, will fall back to AWS CLI)
if command -v sam &> /dev/null; then
    echo "✅ Using AWS SAM for deployment"
    
    # Build and deploy with SAM
    sam build
    sam deploy --guided
    
else
    echo "ℹ️  SAM CLI not found, using AWS CLI for deployment"
    
    # Deploy with AWS CLI
    aws cloudformation deploy \
        --template-file cloudformation-template.yaml \
        --stack-name lifecompass-referral-system \
        --capabilities CAPABILITY_IAM \
        --parameter-overrides AppName=LifeCompass Environment=prod
fi

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next steps:"
echo "1. Get your API Gateway URL:"
echo "   aws cloudformation describe-stacks --stack-name lifecompass-referral-system --query \"Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue\" --output text"
echo ""
echo "2. Update your React Native app environment:"
echo "   REFERRAL_API_URL=<your-api-gateway-url>"
echo ""
echo "3. Test your deployment with:"
echo "   curl <your-api-gateway-url>/health"
echo ""
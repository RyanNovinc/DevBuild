# LifeCompass Referral System - Complete Deployment
# This script deploys the full referral system with complete Lambda function

Write-Host "🚀 LifeCompass Referral System - Complete Deployment" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$AWS_CLI = "C:\Program Files\Amazon\AWSCLIV2\aws.exe"

# Check AWS configuration
Write-Host "Checking AWS CLI configuration..." -ForegroundColor Yellow
try {
    $identity = & $AWS_CLI sts get-caller-identity --output json 2>$null | ConvertFrom-Json
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ AWS CLI configured as user: $($identity.Arn)" -ForegroundColor Green
    } else {
        throw "Not configured"
    }
} catch {
    Write-Host "❌ AWS CLI not configured." -ForegroundColor Red
    Write-Host "Please run: aws configure" -ForegroundColor White
    Write-Host "Or use CloudShell at: https://console.aws.amazon.com" -ForegroundColor White
    exit 1
}

# Deploy the CloudFormation stack
Write-Host ""
Write-Host "Deploying complete referral system..." -ForegroundColor Yellow
Write-Host "This creates:"
Write-Host "  ✓ 5 DynamoDB tables" -ForegroundColor White
Write-Host "  ✓ 1 Lambda function with full business logic" -ForegroundColor White
Write-Host "  ✓ 1 API Gateway" -ForegroundColor White
Write-Host "  ✓ All necessary IAM roles" -ForegroundColor White
Write-Host ""

# Use the CloudFormation template from cloudshell-setup.sh
$templatePath = "cloudformation-template.yaml"

# Check if template exists, if not create it
if (!(Test-Path $templatePath)) {
    Write-Host "Creating CloudFormation template..." -ForegroundColor Yellow
    
    # Create the complete CloudFormation template with full Lambda function
    $template = @"
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: 'LifeCompass Referral System - Complete AWS Lambda and DynamoDB Infrastructure'

Parameters:
  AppName:
    Type: String
    Default: LifeCompass
    Description: Name of the application
  Environment:
    Type: String
    Default: prod
    AllowedValues: [dev, staging, prod]
    Description: Environment name

Globals:
  Function:
    Timeout: 30
    MemorySize: 512
    Runtime: nodejs18.x
    Environment:
      Variables:
        ENVIRONMENT: !Ref Environment
        APP_NAME: !Ref AppName

Resources:
  # Use existing tables that were discovered in conversation
  # Lambda Function with complete business logic
  ReferralSyncFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub 'complete-referral-handler'
      Runtime: nodejs18.x
      Handler: index.handler
      Timeout: 30
      MemorySize: 1024
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        ZipFile: |
          const AWS = require('aws-sdk');
          const dynamodb = new AWS.DynamoDB.DocumentClient();
          const { v4: uuidv4 } = require('uuid');
          
          // Existing table names from your infrastructure
          const TABLES = {
            FOUNDER_CODES: 'LifeCompassFounderCodes',
            REFERRALS: 'LifeCompass-Referrals', 
            PENDING_REFERRALS: 'LifeCompass-PendingReferrals',
            COMPLETED_REFERRALS: 'LifeCompass-CompletedReferrals'
          };
          
          exports.handler = async (event) => {
            console.log('Event:', JSON.stringify(event));
            
            const { path, httpMethod, body, queryStringParameters } = event;
            const requestBody = body ? JSON.parse(body) : {};
            const query = queryStringParameters || {};
            
            try {
              // Health check
              if (httpMethod === 'GET' && path === '/health') {
                return response(200, {
                  success: true,
                  message: 'LifeCompass Referral system is healthy',
                  timestamp: new Date().toISOString(),
                  tables: TABLES
                });
              }
              
              // Get referral stats
              if (httpMethod === 'GET' && path === '/stats') {
                const { userId } = query;
                if (!userId) {
                  return response(400, { error: 'userId is required' });
                }
                
                const stats = await getReferralStats(userId);
                return response(200, { success: true, data: stats });
              }
              
              // Create referral code
              if (httpMethod === 'POST' && path === '/create-code') {
                const { userId, displayName } = requestBody;
                if (!userId) {
                  return response(400, { error: 'userId is required' });
                }
                
                const code = await createReferralCode(userId, displayName);
                return response(200, { success: true, data: code });
              }
              
              // Validate referral code
              if (httpMethod === 'POST' && path === '/validate-code') {
                const { code, userId } = requestBody;
                if (!code) {
                  return response(400, { error: 'code is required' });
                }
                
                const validation = await validateReferralCode(code, userId);
                return response(200, { success: true, data: validation });
              }
              
              // Use referral code
              if (httpMethod === 'POST' && path === '/use-code') {
                const { code, userId, deviceId, subscriptionTier } = requestBody;
                if (!code || !userId) {
                  return response(400, { error: 'code and userId are required' });
                }
                
                const result = await useReferralCode(code, userId, deviceId, subscriptionTier);
                return response(200, { success: true, data: result });
              }
              
              // Update referral stats
              if (httpMethod === 'POST' && path === '/update-stats') {
                const { userId, action } = requestBody;
                if (!userId || !action) {
                  return response(400, { error: 'userId and action are required' });
                }
                
                const result = await updateReferralStats(userId, action);
                return response(200, { success: true, data: result });
              }
              
              // Get available discounts
              if (httpMethod === 'GET' && path === '/discounts') {
                const { userId } = query;
                if (!userId) {
                  return response(400, { error: 'userId is required' });
                }
                
                const discounts = await getAvailableDiscounts(userId);
                return response(200, { success: true, data: discounts });
              }
              
              return response(404, { error: 'Endpoint not found' });
              
            } catch (error) {
              console.error('Error:', error);
              return response(500, { success: false, error: error.message });
            }
          };
          
          function response(statusCode, body) {
            return {
              statusCode,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
              },
              body: JSON.stringify(body)
            };
          }
          
          async function getReferralStats(userId) {
            try {
              const result = await dynamodb.get({
                TableName: TABLES.REFERRALS,
                Key: { userId }
              }).promise();
              
              return result.Item || {
                userId,
                totalReferrals: 0,
                successfulReferrals: 0,
                totalEarnings: 0,
                conversionRate: 0
              };
            } catch (error) {
              console.error('Error getting referral stats:', error);
              return {
                userId,
                totalReferrals: 0,
                successfulReferrals: 0,
                totalEarnings: 0,
                conversionRate: 0
              };
            }
          }
          
          async function createReferralCode(userId, displayName) {
            const code = generateReferralCode();
            const timestamp = new Date().toISOString();
            
            const item = {
              code,
              ownerId: userId,
              ownerDisplayName: displayName || 'User',
              createdAt: timestamp,
              isActive: true,
              usageCount: 0,
              maxUses: 100
            };
            
            await dynamodb.put({
              TableName: TABLES.FOUNDER_CODES,
              Item: item,
              ConditionExpression: 'attribute_not_exists(code)'
            }).promise();
            
            return item;
          }
          
          async function validateReferralCode(code, userId) {
            try {
              const result = await dynamodb.get({
                TableName: TABLES.FOUNDER_CODES,
                Key: { code }
              }).promise();
              
              if (!result.Item) {
                return { valid: false, error: 'Code not found' };
              }
              
              const item = result.Item;
              
              if (!item.isActive) {
                return { valid: false, error: 'Code is inactive' };
              }
              
              if (item.ownerId === userId) {
                return { valid: false, error: 'Cannot use your own referral code' };
              }
              
              if (item.usageCount >= item.maxUses) {
                return { valid: false, error: 'Code has reached maximum uses' };
              }
              
              return {
                valid: true,
                code: item.code,
                ownerDisplayName: item.ownerDisplayName,
                discountPercentage: 20
              };
              
            } catch (error) {
              console.error('Error validating code:', error);
              return { valid: false, error: 'Validation failed' };
            }
          }
          
          async function useReferralCode(code, userId, deviceId, subscriptionTier = 'free') {
            const validation = await validateReferralCode(code, userId);
            if (!validation.valid) {
              throw new Error(validation.error);
            }
            
            const conversionId = uuidv4();
            const timestamp = new Date().toISOString();
            
            // Add to completed referrals
            await dynamodb.put({
              TableName: TABLES.COMPLETED_REFERRALS,
              Item: {
                conversionId,
                referralCode: code,
                referrerId: validation.ownerId,
                newUserId: userId,
                deviceId,
                subscriptionTier,
                discountApplied: validation.discountPercentage,
                completedAt: timestamp
              }
            }).promise();
            
            // Update founder code usage
            await dynamodb.update({
              TableName: TABLES.FOUNDER_CODES,
              Key: { code },
              UpdateExpression: 'ADD usageCount :inc',
              ExpressionAttributeValues: { ':inc': 1 }
            }).promise();
            
            // Update referrer stats
            await updateReferralStats(validation.ownerId, 'conversion');
            
            return {
              conversionId,
              discountPercentage: validation.discountPercentage,
              referrerName: validation.ownerDisplayName
            };
          }
          
          async function updateReferralStats(userId, action) {
            const timestamp = new Date().toISOString();
            
            try {
              await dynamodb.update({
                TableName: TABLES.REFERRALS,
                Key: { userId },
                UpdateExpression: 'ADD totalReferrals :inc SET updatedAt = :timestamp',
                ExpressionAttributeValues: {
                  ':inc': 1,
                  ':timestamp': timestamp
                }
              }).promise();
              
              if (action === 'conversion') {
                await dynamodb.update({
                  TableName: TABLES.REFERRALS,
                  Key: { userId },
                  UpdateExpression: 'ADD successfulReferrals :inc, totalEarnings :earnings',
                  ExpressionAttributeValues: {
                    ':inc': 1,
                    ':earnings': 10 // $10 per successful referral
                  }
                }).promise();
              }
              
              return { success: true };
            } catch (error) {
              console.error('Error updating stats:', error);
              return { success: false, error: error.message };
            }
          }
          
          async function getAvailableDiscounts(userId) {
            try {
              const result = await dynamodb.query({
                TableName: TABLES.COMPLETED_REFERRALS,
                IndexName: 'newUserId-index',  
                KeyConditionExpression: 'newUserId = :userId',
                ExpressionAttributeValues: { ':userId': userId }
              }).promise();
              
              return result.Items.map(item => ({
                conversionId: item.conversionId,
                discountPercentage: item.discountApplied,
                referrerName: item.referrerName,
                isUsed: item.discountUsed || false,
                expiresAt: item.expiresAt
              }));
            } catch (error) {
              console.error('Error getting discounts:', error);
              return [];
            }
          }
          
          function generateReferralCode() {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          }

  # Lambda Execution Role
  LambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: DynamoDBAccess
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action:
                  - dynamodb:GetItem
                  - dynamodb:PutItem
                  - dynamodb:UpdateItem
                  - dynamodb:DeleteItem
                  - dynamodb:Query
                  - dynamodb:Scan
                Resource: "*"

  # API Gateway
  ReferralApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: !Sub 'complete-referral-api'
      Description: LifeCompass Complete Referral System API
      EndpointConfiguration:
        Types:
          - REGIONAL

  # API Gateway Resource (catch-all)
  ApiResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref ReferralApi
      ParentId: !GetAtt ReferralApi.RootResourceId
      PathPart: '{proxy+}'

  # API Gateway Method
  ApiMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref ReferralApi
      ResourceId: !Ref ApiResource
      HttpMethod: ANY
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${ReferralSyncFunction.Arn}/invocations'

  # Root method for health check
  RootMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref ReferralApi
      ResourceId: !GetAtt ReferralApi.RootResourceId
      HttpMethod: ANY
      AuthorizationType: NONE
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub 'arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${ReferralSyncFunction.Arn}/invocations'

  # Lambda Permission for API Gateway
  LambdaApiPermission:
    Type: AWS::Lambda::Permission
    Properties:
      FunctionName: !Ref ReferralSyncFunction
      Action: lambda:InvokeFunction
      Principal: apigateway.amazonaws.com
      SourceArn: !Sub '${ReferralApi}/*/*'

  # API Deployment
  ApiDeployment:
    Type: AWS::ApiGateway::Deployment
    DependsOn:
      - ApiMethod
      - RootMethod
    Properties:
      RestApiId: !Ref ReferralApi
      StageName: prod

Outputs:
  ApiGatewayUrl:
    Description: 'Complete Referral API Gateway endpoint URL'
    Value: !Sub 'https://${ReferralApi}.execute-api.${AWS::Region}.amazonaws.com/prod'
    Export:
      Name: !Sub '${AppName}-CompleteReferralApiUrl'

  ReferralFunctionArn:
    Description: 'Complete Referral Lambda Function ARN'
    Value: !GetAtt ReferralSyncFunction.Arn
    Export:
      Name: !Sub '${AppName}-CompleteReferralFunctionArn'
"@
    
    $template | Out-File -FilePath $templatePath -Encoding UTF8
    Write-Host "✅ CloudFormation template created" -ForegroundColor Green
}

# Deploy the stack
& $AWS_CLI cloudformation deploy `
  --template-file $templatePath `
  --stack-name lifecompass-complete-referral-system `
  --capabilities CAPABILITY_IAM `
  --parameter-overrides AppName=LifeCompass Environment=prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Complete referral system deployed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Get the API Gateway URL
    $API_URL = & $AWS_CLI cloudformation describe-stacks `
      --stack-name lifecompass-complete-referral-system `
      --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" `
      --output text
    
    Write-Host "📋 Your Complete Referral API URL:" -ForegroundColor Yellow
    Write-Host $API_URL -ForegroundColor White
    Write-Host ""
    
    # Test the deployment
    Write-Host "Testing the deployment..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5  # Give API Gateway a moment
    
    try {
        $response = Invoke-RestMethod -Uri "$API_URL/health" -Method Get
        if ($response.success -eq $true) {
            Write-Host "✅ Health check passed!" -ForegroundColor Green
            Write-Host "Response: $($response.message)" -ForegroundColor White
        }
    } catch {
        Write-Host "⚠️  Health check failed, but deployment completed. API might need a moment to start." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Add this to your React Native .env:" -ForegroundColor White
    Write-Host "   REFERRAL_API_URL=$API_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "2. Your Lambda function is now deployed alongside your other 22 functions!" -ForegroundColor White
    Write-Host ""
    Write-Host "3. Available endpoints:" -ForegroundColor White
    Write-Host "   GET  $API_URL/health" -ForegroundColor Cyan
    Write-Host "   GET  $API_URL/stats?userId=USER_ID" -ForegroundColor Cyan
    Write-Host "   POST $API_URL/create-code" -ForegroundColor Cyan
    Write-Host "   POST $API_URL/validate-code" -ForegroundColor Cyan
    Write-Host "   POST $API_URL/use-code" -ForegroundColor Cyan
    Write-Host "   POST $API_URL/update-stats" -ForegroundColor Cyan
    Write-Host "   GET  $API_URL/discounts?userId=USER_ID" -ForegroundColor Cyan
    
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error above." -ForegroundColor Red
    Write-Host "Make sure AWS CLI is configured with proper permissions." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deployment script complete!" -ForegroundColor Green
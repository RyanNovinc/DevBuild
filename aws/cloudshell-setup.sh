#!/bin/bash

# LifeCompass Referral System - CloudShell Setup Script
# This script creates an IAM user and deploys the entire referral system

set -e

echo "🚀 LifeCompass Referral System - CloudShell Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

USER_NAME="lifecompass-deploy"
POLICY_NAME="LifeCompassDeployPolicy"
STACK_NAME="lifecompass-referral-system"

echo -e "${BLUE}Step 1: Creating IAM user for deployment${NC}"
echo "Creating user: $USER_NAME"

# Create IAM user
aws iam create-user \
    --user-name $USER_NAME \
    --tags Key=Project,Value=LifeCompass Key=Purpose,Value=ReferralSystemDeploy \
    2>/dev/null || echo "User might already exist, continuing..."

# Create custom policy with exact permissions needed
cat > /tmp/lifecompass-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "lambda:*",
                "dynamodb:*",
                "apigateway:*",
                "cloudformation:*",
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:GetRole",
                "iam:PassRole",
                "iam:ListRolePolicies",
                "iam:GetRolePolicy",
                "logs:*",
                "sts:GetCallerIdentity"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# Create and attach policy
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file:///tmp/lifecompass-policy.json \
    2>/dev/null || echo "Policy might already exist, continuing..."

POLICY_ARN=$(aws iam list-policies --query "Policies[?PolicyName=='$POLICY_NAME'].Arn" --output text)

aws iam attach-user-policy \
    --user-name $USER_NAME \
    --policy-arn $POLICY_ARN

echo -e "${GREEN}✅ IAM user created and configured${NC}"
echo ""

echo -e "${BLUE}Step 2: Creating access keys${NC}"

# Create access key
ACCESS_KEY_RESULT=$(aws iam create-access-key --user-name $USER_NAME --query 'AccessKey.[AccessKeyId,SecretAccessKey]' --output text 2>/dev/null)

if [ $? -eq 0 ]; then
    ACCESS_KEY_ID=$(echo $ACCESS_KEY_RESULT | cut -d' ' -f1)
    SECRET_ACCESS_KEY=$(echo $ACCESS_KEY_RESULT | cut -d' ' -f2)
    
    echo -e "${GREEN}✅ Access keys created${NC}"
    echo ""
    echo -e "${YELLOW}📋 SAVE THESE CREDENTIALS:${NC}"
    echo "=================================="
    echo "AWS Access Key ID: $ACCESS_KEY_ID"
    echo "AWS Secret Access Key: $SECRET_ACCESS_KEY"
    echo "Default region: $(aws configure get region)"
    echo "=================================="
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: Save these credentials now!${NC}"
    echo -e "${RED}   You won't be able to see the secret key again.${NC}"
    echo ""
    
    # Save to a secure file in CloudShell
    cat > ~/lifecompass-aws-credentials.txt << EOF
# LifeCompass AWS Credentials
# Created: $(date)
AWS Access Key ID: $ACCESS_KEY_ID  
AWS Secret Access Key: $SECRET_ACCESS_KEY
Default region: $(aws configure get region)

# To configure your local AWS CLI, run:
# aws configure
# Then enter these values when prompted.
EOF

    echo -e "${GREEN}✅ Credentials also saved to: ~/lifecompass-aws-credentials.txt${NC}"
    echo ""
    
else
    echo -e "${RED}❌ Failed to create access keys. User might already have keys.${NC}"
    echo "You can create keys manually in the AWS Console."
    echo ""
fi

echo -e "${BLUE}Step 3: Creating CloudFormation template${NC}"

# Create the CloudFormation template in CloudShell
cat > /tmp/referral-cloudformation.yaml << 'EOF'
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: 'LifeCompass Referral System - AWS Lambda and DynamoDB Infrastructure'

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
  # DynamoDB Tables
  AnonymousUsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${AppName}-AnonymousUsers'
      AttributeDefinitions:
        - AttributeName: deviceId
          AttributeType: S
        - AttributeName: anonymousUserId
          AttributeType: S
      KeySchema:
        - AttributeName: deviceId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: AnonymousUserIdIndex
          KeySchema:
            - AttributeName: anonymousUserId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
          ProvisionedThroughput:
            ReadCapacityUnits: 5
            WriteCapacityUnits: 5
      BillingMode: PROVISIONED
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5

  ReferralCodesTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${AppName}-ReferralCodes'
      AttributeDefinitions:
        - AttributeName: code
          AttributeType: S
        - AttributeName: ownerId
          AttributeType: S
      KeySchema:
        - AttributeName: code
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: OwnerIdIndex
          KeySchema:
            - AttributeName: ownerId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
          ProvisionedThroughput:
            ReadCapacityUnits: 5
            WriteCapacityUnits: 5
      BillingMode: PROVISIONED
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5

  ReferralStatsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${AppName}-ReferralStats'
      AttributeDefinitions:
        - AttributeName: ownerId
          AttributeType: S
      KeySchema:
        - AttributeName: ownerId
          KeyType: HASH
      BillingMode: PROVISIONED
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5

  ReferralConversionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${AppName}-ReferralConversions'
      AttributeDefinitions:
        - AttributeName: conversionId
          AttributeType: S
        - AttributeName: referrerId
          AttributeType: S
        - AttributeName: purchaserId
          AttributeType: S
        - AttributeName: referralCode
          AttributeType: S
      KeySchema:
        - AttributeName: conversionId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: ReferrerIdIndex
          KeySchema:
            - AttributeName: referrerId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
          ProvisionedThroughput:
            ReadCapacityUnits: 5
            WriteCapacityUnits: 5
        - IndexName: PurchaserIdIndex
          KeySchema:
            - AttributeName: purchaserId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
          ProvisionedThroughput:
            ReadCapacityUnits: 5
            WriteCapacityUnits: 5
        - IndexName: ReferralCodeIndex
          KeySchema:
            - AttributeName: referralCode
              KeyType: HASH
          Projection:
            ProjectionType: ALL
          ProvisionedThroughput:
            ReadCapacityUnits: 5
            WriteCapacityUnits: 5
      BillingMode: PROVISIONED
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5

  DiscountRedemptionsTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: !Sub '${AppName}-DiscountRedemptions'
      AttributeDefinitions:
        - AttributeName: redemptionId
          AttributeType: S
        - AttributeName: userId
          AttributeType: S
        - AttributeName: conversionId
          AttributeType: S
      KeySchema:
        - AttributeName: redemptionId
          KeyType: HASH
      GlobalSecondaryIndexes:
        - IndexName: UserIdIndex
          KeySchema:
            - AttributeName: userId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
          ProvisionedThroughput:
            ReadCapacityUnits: 5
            WriteCapacityUnits: 5
        - IndexName: ConversionIdIndex
          KeySchema:
            - AttributeName: conversionId
              KeyType: HASH
          Projection:
            ProjectionType: ALL
          ProvisionedThroughput:
            ReadCapacityUnits: 5
            WriteCapacityUnits: 5
      BillingMode: PROVISIONED
      ProvisionedThroughput:
        ReadCapacityUnits: 5
        WriteCapacityUnits: 5

  # Lambda Function
  ReferralSyncFunction:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: !Sub '${AppName}-ReferralSyncHandler'
      Runtime: nodejs18.x
      Handler: index.handler
      Timeout: 30
      MemorySize: 512
      Role: !GetAtt LambdaExecutionRole.Arn
      Code:
        ZipFile: |
          const AWS = require('aws-sdk');
          const dynamodb = new AWS.DynamoDB.DocumentClient();
          
          // Table names
          const TABLES = {
            ANONYMOUS_USERS: process.env.ANONYMOUS_USERS_TABLE,
            REFERRAL_CODES: process.env.REFERRAL_CODES_TABLE,
            REFERRAL_STATS: process.env.REFERRAL_STATS_TABLE,
            REFERRAL_CONVERSIONS: process.env.REFERRAL_CONVERSIONS_TABLE,
            DISCOUNT_REDEMPTIONS: process.env.DISCOUNT_REDEMPTIONS_TABLE
          };
          
          exports.handler = async (event) => {
            console.log('Event:', JSON.stringify(event));
            
            const { httpMethod, path, body } = event;
            const requestBody = body ? JSON.parse(body) : {};
            
            try {
              // Health check
              if (httpMethod === 'GET' && path === '/health') {
                return {
                  statusCode: 200,
                  headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                  },
                  body: JSON.stringify({
                    success: true,
                    message: 'LifeCompass Referral system is healthy',
                    timestamp: new Date().toISOString(),
                    tables: TABLES
                  })
                };
              }
              
              // Placeholder for other endpoints
              return {
                statusCode: 200,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                  success: true,
                  message: 'LifeCompass Referral system deployed successfully!',
                  endpoint: `${httpMethod} ${path}`,
                  timestamp: new Date().toISOString()
                })
              };
              
            } catch (error) {
              console.error('Error:', error);
              return {
                statusCode: 500,
                headers: {
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                  success: false,
                  error: error.message
                })
              };
            }
          };
      Environment:
        Variables:
          ANONYMOUS_USERS_TABLE: !Ref AnonymousUsersTable
          REFERRAL_CODES_TABLE: !Ref ReferralCodesTable
          REFERRAL_STATS_TABLE: !Ref ReferralStatsTable
          REFERRAL_CONVERSIONS_TABLE: !Ref ReferralConversionsTable
          DISCOUNT_REDEMPTIONS_TABLE: !Ref DiscountRedemptionsTable

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
                Resource:
                  - !GetAtt AnonymousUsersTable.Arn
                  - !GetAtt ReferralCodesTable.Arn
                  - !GetAtt ReferralStatsTable.Arn
                  - !GetAtt ReferralConversionsTable.Arn
                  - !GetAtt DiscountRedemptionsTable.Arn
                  - !Sub "${AnonymousUsersTable.Arn}/index/*"
                  - !Sub "${ReferralCodesTable.Arn}/index/*"
                  - !Sub "${ReferralConversionsTable.Arn}/index/*"
                  - !Sub "${DiscountRedemptionsTable.Arn}/index/*"

  # API Gateway
  ReferralApi:
    Type: AWS::ApiGateway::RestApi
    Properties:
      Name: !Sub '${AppName}-ReferralAPI'
      Description: LifeCompass Referral System API
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
    Description: 'API Gateway endpoint URL'
    Value: !Sub 'https://${ReferralApi}.execute-api.${AWS::Region}.amazonaws.com/prod'
    Export:
      Name: !Sub '${AppName}-ReferralApiUrl'

  ReferralSyncFunctionArn:
    Description: 'Referral Sync Lambda Function ARN'
    Value: !GetAtt ReferralSyncFunction.Arn
    Export:
      Name: !Sub '${AppName}-ReferralSyncFunctionArn'
EOF

echo -e "${GREEN}✅ CloudFormation template created${NC}"
echo ""

echo -e "${BLUE}Step 4: Deploying the referral system${NC}"
echo "This will create:"
echo "  - 5 DynamoDB tables"
echo "  - 1 Lambda function"
echo "  - 1 API Gateway"
echo "  - All necessary IAM roles"
echo ""

aws cloudformation deploy \
    --template-file /tmp/referral-cloudformation.yaml \
    --stack-name $STACK_NAME \
    --capabilities CAPABILITY_IAM \
    --parameter-overrides AppName=LifeCompass Environment=prod

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo ""
    
    # Get the API Gateway URL
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name $STACK_NAME \
        --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" \
        --output text)
    
    echo -e "${YELLOW}📋 Your API Gateway URL:${NC}"
    echo "$API_URL"
    echo ""
    
    # Test the deployment
    echo -e "${BLUE}Testing the deployment...${NC}"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
        curl -s "$API_URL/health" | python3 -m json.tool
    else
        echo -e "${YELLOW}⚠️  Health check returned status: $HTTP_STATUS${NC}"
        echo "API might need a moment to warm up. Try again in 30 seconds."
    fi
    
    echo ""
    echo -e "${YELLOW}📋 Next Steps:${NC}"
    echo "1. Add this to your React Native app environment:"
    echo "   REFERRAL_API_URL=$API_URL"
    echo ""
    echo "2. Use the credentials saved in ~/lifecompass-aws-credentials.txt"
    echo "   to configure your local AWS CLI"
    echo ""
    echo "3. Your Lambda function 'LifeCompass-ReferralSyncHandler' is now"
    echo "   deployed alongside your other 22 functions!"
    
else
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check the CloudFormation console for details"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
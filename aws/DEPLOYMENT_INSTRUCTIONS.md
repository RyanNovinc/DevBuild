# 🚀 Manual Lambda Deployment Instructions

Since you already have 22 Lambda functions, you likely have AWS CLI configured. Here's how to deploy the referral system:

## Option 1: Quick Manual Deployment (Recommended)

### Step 1: Create the Lambda function in AWS Console
1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click "Create function"
3. Choose "Author from scratch"
4. Function name: `LifeCompass-ReferralSyncHandler`
5. Runtime: `Node.js 18.x`
6. Architecture: `x86_64`
7. Execution role: Create a new role or use existing role with DynamoDB permissions

### Step 2: Upload the function code
1. Copy the entire contents of `aws/lambda/referral-sync-handler.js`
2. Paste it into the Lambda function code editor
3. Click "Deploy"

### Step 3: Create DynamoDB tables
Run these AWS CLI commands (or create through console):

```bash
# Create Anonymous Users table
aws dynamodb create-table \
  --table-name LifeCompass-AnonymousUsers \
  --attribute-definitions \
    AttributeName=deviceId,AttributeType=S \
    AttributeName=anonymousUserId,AttributeType=S \
  --key-schema AttributeName=deviceId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=AnonymousUserIdIndex,KeySchema=[{AttributeName=anonymousUserId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Create Referral Codes table
aws dynamodb create-table \
  --table-name LifeCompass-ReferralCodes \
  --attribute-definitions \
    AttributeName=code,AttributeType=S \
    AttributeName=ownerId,AttributeType=S \
  --key-schema AttributeName=code,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=OwnerIdIndex,KeySchema=[{AttributeName=ownerId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Create Referral Stats table
aws dynamodb create-table \
  --table-name LifeCompass-ReferralStats \
  --attribute-definitions AttributeName=ownerId,AttributeType=S \
  --key-schema AttributeName=ownerId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Create Referral Conversions table
aws dynamodb create-table \
  --table-name LifeCompass-ReferralConversions \
  --attribute-definitions \
    AttributeName=conversionId,AttributeType=S \
    AttributeName=referrerId,AttributeType=S \
    AttributeName=purchaserId,AttributeType=S \
    AttributeName=referralCode,AttributeType=S \
  --key-schema AttributeName=conversionId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=ReferrerIdIndex,KeySchema=[{AttributeName=referrerId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    IndexName=PurchaserIdIndex,KeySchema=[{AttributeName=purchaserId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    IndexName=ReferralCodeIndex,KeySchema=[{AttributeName=referralCode,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5

# Create Discount Redemptions table
aws dynamodb create-table \
  --table-name LifeCompass-DiscountRedemptions \
  --attribute-definitions \
    AttributeName=redemptionId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=conversionId,AttributeType=S \
  --key-schema AttributeName=redemptionId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=UserIdIndex,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
    IndexName=ConversionIdIndex,KeySchema=[{AttributeName=conversionId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

### Step 4: Create API Gateway
1. Go to [API Gateway Console](https://console.aws.amazon.com/apigateway/)
2. Create a new REST API
3. Create resources and methods for each endpoint:
   - `POST /sync-referral-code`
   - `POST /sync-referral-stats`
   - `POST /record-conversion`
   - `GET /get-discounts`
   - `POST /link-account`
   - `POST /redeem-discount`
   - `GET /health`
4. Set up Lambda proxy integration for each method
5. Enable CORS for all methods
6. Deploy the API

### Step 5: Update your app
Add your API Gateway URL to your environment:
```env
REFERRAL_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

## Option 2: CloudFormation Deployment

If you have AWS CLI configured, you can use the CloudFormation template:

```bash
cd aws/
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name lifecompass-referral-system \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides AppName=LifeCompass Environment=prod
```

Then get your API Gateway URL:
```bash
aws cloudformation describe-stacks \
  --stack-name lifecompass-referral-system \
  --query "Stacks[0].Outputs[?OutputKey=='ApiGatewayUrl'].OutputValue" \
  --output text
```

## Testing

Once deployed, test with:
```bash
curl https://your-api-gateway-url/health
```

You should get:
```json
{
  "success": true,
  "message": "Referral system is healthy",
  "timestamp": "2024-08-04T..."
}
```

## IAM Permissions

Make sure your Lambda execution role has these permissions:
- `dynamodb:GetItem`
- `dynamodb:PutItem`
- `dynamodb:UpdateItem`
- `dynamodb:Query`
- `dynamodb:Scan`
- `logs:CreateLogGroup`
- `logs:CreateLogStream`
- `logs:PutLogEvents`
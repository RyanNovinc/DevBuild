# Enhanced Lambda Function Deployment Guide

## Overview
The enhanced Lambda function (`lambda-function-enhanced.js`) contains the complete referral business logic including:
- Referral code validation
- Conversion tracking
- Discount management
- User referral statistics
- Automatic referral code generation for new Pro users

## Deployment Steps

### 1. Configure AWS Credentials
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region (ap-southeast-2)
```

### 2. Deploy Enhanced Lambda Function
```bash
# Create deployment package
cd "D:\Apps Productions Builds\LCiOS-2\DevBuild"
cp lambda-function-enhanced.js index.js
powershell "Compress-Archive -Path index.js -DestinationPath lambda-deployment.zip -Force"

# Update Lambda function
aws lambda update-function-code \
  --function-name LifeCompass-ReferralSyncHandler \
  --zip-file fileb://lambda-deployment.zip \
  --region ap-southeast-2
```

### 3. Create Required DynamoDB GSI (Global Secondary Indexes)

The enhanced function requires additional GSIs for efficient querying:

```bash
# Create DeviceIdIndex for LifeCompass-ReferralDiscounts table
aws dynamodb update-table \
  --table-name LifeCompass-ReferralDiscounts \
  --attribute-definitions AttributeName=deviceId,AttributeType=S \
  --global-secondary-index-updates \
    "Create={IndexName=DeviceIdIndex,KeySchema=[{AttributeName=deviceId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}}" \
  --region ap-southeast-2

# Create ConversionIdIndex for LifeCompass-ReferralDiscounts table  
aws dynamodb update-table \
  --table-name LifeCompass-ReferralDiscounts \
  --attribute-definitions AttributeName=conversionId,AttributeType=S \
  --global-secondary-index-updates \
    "Create={IndexName=ConversionIdIndex,KeySchema=[{AttributeName=conversionId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}}" \
  --region ap-southeast-2
```

## Enhanced Business Logic Features

### 1. Referral Code Validation (`/validate-referral-code`)
- Validates referral codes against DynamoDB
- Checks if code is active and unused
- Prevents self-referral
- Prevents already-purchased users from using codes

### 2. Referral Code Syncing (`/sync-referral-code`)
- Stores referral code input by user
- Associates code with device ID
- Prepares for conversion tracking

### 3. Conversion Recording (`/record-conversion`)
- Records when user buys the app
- Processes referral conversions
- Awards 50% discounts to both users
- Generates referral codes for new Pro users (3 initially)

### 4. Referral Statistics (`/get-referral-stats`)
- Returns user's referral codes
- Shows referral limits and usage
- Lists available discounts

### 5. Discount Management (`/get-discounts`, `/redeem-discount`)
- Manages 50% off AI plan discounts
- Single-use discounts per referral
- Automatic application during purchase

## Business Rules Implemented

### Referral Limits
- **Default**: 3 referral codes per user
- **90-day streak**: 4 referral codes 
- **180-day streak**: 5 referral codes

### Anti-Abuse Measures
- Users can't use their own referral codes
- Already-purchased users can't input referral codes
- Each referral code can only be used once
- Device fingerprinting for additional security

### Discount System
- **50% off first AI monthly plan** for both referrer and referee
- Discounts are single-use only
- Automatic generation when referral converts
- Stored in separate DynamoDB table for tracking

## Integration with React Native App

The enhanced backend service methods are already integrated:
- `validateReferralCode()` → `/validate-referral-code`
- `syncReferralCode()` → `/sync-referral-code` 
- `recordReferralConversion()` → `/record-conversion`
- `getUserReferralStats()` → `/get-referral-stats`
- `getEarnedDiscounts()` → `/get-discounts`
- `redeemDiscount()` → `/redeem-discount`

## Testing

After deployment, test each endpoint:

1. **Health Check**: `GET /health`
2. **Validate Code**: `POST /validate-referral-code` with mock code
3. **Sync Code**: `POST /sync-referral-code` with device ID
4. **Record Conversion**: `POST /record-conversion` with device ID
5. **Get Stats**: `GET /get-referral-stats?deviceId=test`

## Next Steps After Deployment

1. ✅ **Enhanced Lambda function deployed**
2. ✅ **DynamoDB GSIs created**
3. 🔄 **Test all endpoints with real data**
4. 🔄 **Update referral screen to show discount counts**
5. 🔄 **Add auto-discount application to AI purchase flow**

## Error Handling

The enhanced function includes comprehensive error handling:
- Validation errors return specific error messages
- Database errors are logged and return generic errors
- CORS headers included for web requests
- Proper HTTP status codes for all scenarios

## Performance Considerations

- Uses DynamoDB DocumentClient for optimal performance
- GSIs for efficient querying by deviceId and conversionId
- Batch operations where possible
- Proper error logging for debugging

## Security

- Device fingerprinting for additional verification
- Prevents self-referral abuse
- Validates user purchase status
- Secure discount redemption with unique IDs
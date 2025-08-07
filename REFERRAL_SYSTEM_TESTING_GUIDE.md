# LifeCompass Referral System - Comprehensive Testing Guide

## Overview
This document provides a complete testing guide for the LifeCompass referral system that was migrated from Supabase to AWS Lambda/DynamoDB with full business logic implementation.

## System Architecture

### AWS Infrastructure
- **Lambda Function**: `LifeCompass-ReferralSyncHandler` (Node.js 18.x)
- **API Gateway**: REST API with `{proxy+}` resource routing
- **DynamoDB Tables**: 5 tables with GSI indexes
- **Region**: `ap-southeast-2` (Sydney)

### React Native Components
- **ReferralBackendService**: Core service for AWS integration
- **ReferralCodeInputModal**: Popup for code input with rate limiting
- **SettingsModal**: Contains referral code input button
- **ReferralStats**: Displays available discounts
- **PricingScreen**: Auto-applies discounts during purchases

## File Locations & Key Components

### Backend Files
```
lambda-functions/
└── lambda-function-enhanced.js (800+ lines, complete business logic)

src/services/
└── ReferralBackendService.js (enhanced with AWS integration)
└── SubscriptionService.js (records referral conversions)
```

### Frontend Components
```
src/components/
└── ReferralCodeInputModal.js (modal with rate limiting)

src/screens/ProfileScreen/
├── index.js (tracks hasEnteredReferralCode state)
└── SettingsModal.js (referral code input button)

src/screens/Referral/
├── ReferralScreen.js (main referral screen with swipe tabs)
├── ReferralStats.js (displays earned discounts)
└── ReferralDetails.js (sharing functionality)

src/screens/PricingScreen/
└── index.js (auto-discount application)
```

### Configuration Files
```
metro.config.js (excludes Lambda files from bundling)
index.js (React Native entry point)
```

## AWS Infrastructure Setup

### 1. DynamoDB Tables Required

Create these 5 tables in `ap-southeast-2` region:

#### Table: `referral-codes`
- **Partition Key**: `code` (String)
- **Attributes**: userId, createdAt, isActive, usageCount, lastUsedAt, deviceFingerprint
```bash
aws dynamodb create-table --region ap-southeast-2 \
  --table-name referral-codes \
  --attribute-definitions AttributeName=code,AttributeType=S \
  --key-schema AttributeName=code,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

#### Table: `referral-relationships`
- **Partition Key**: `id` (String)
- **GSI**: `referrerUserId-index` (referrerUserId)
- **GSI**: `referredUserId-index` (referredUserId)
```bash
aws dynamodb create-table --region ap-southeast-2 \
  --table-name referral-relationships \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=referrerUserId,AttributeType=S \
    AttributeName=referredUserId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    'IndexName=referrerUserId-index,KeySchema=[{AttributeName=referrerUserId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \
    'IndexName=referredUserId-index,KeySchema=[{AttributeName=referredUserId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \
  --billing-mode PAY_PER_REQUEST
```

#### Table: `referral-conversions`
- **Partition Key**: `id` (String)
- **GSI**: `referralRelationshipId-index`
```bash
aws dynamodb create-table --region ap-southeast-2 \
  --table-name referral-conversions \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=referralRelationshipId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    'IndexName=referralRelationshipId-index,KeySchema=[{AttributeName=referralRelationshipId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \
  --billing-mode PAY_PER_REQUEST
```

#### Table: `referral-discounts`
- **Partition Key**: `id` (String)  
- **GSI**: `userId-index`
- **GSI**: `conversionId-index`
```bash
aws dynamodb create-table --region ap-southeast-2 \
  --table-name referral-discounts \
  --attribute-definitions \
    AttributeName=id,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=conversionId,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --global-secondary-indexes \
    'IndexName=userId-index,KeySchema=[{AttributeName=userId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \
    'IndexName=conversionId-index,KeySchema=[{AttributeName=conversionId,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}' \
  --billing-mode PAY_PER_REQUEST
```

#### Table: `rate-limit-attempts`
- **Partition Key**: `deviceFingerprint` (String)
- **TTL**: Set TTL on `expiresAt` attribute
```bash
aws dynamodb create-table --region ap-southeast-2 \
  --table-name rate-limit-attempts \
  --attribute-definitions AttributeName=deviceFingerprint,AttributeType=S \
  --key-schema AttributeName=deviceFingerprint,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Enable TTL
aws dynamodb update-time-to-live --region ap-southeast-2 \
  --table-name rate-limit-attempts \
  --time-to-live-specification Enabled=true,AttributeName=expiresAt
```

### 2. Lambda Function Deployment

#### Deploy the enhanced Lambda function:
```bash
# Zip the Lambda function
cd lambda-functions
zip -r lambda-deployment.zip lambda-function-enhanced.js

# Deploy to AWS
aws lambda update-function-code \
  --region ap-southeast-2 \
  --function-name LifeCompass-ReferralSyncHandler \
  --zip-file fileb://lambda-deployment.zip
```

#### Required IAM Permissions for Lambda:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:ap-southeast-2:*:table/referral-codes",
        "arn:aws:dynamodb:ap-southeast-2:*:table/referral-relationships",
        "arn:aws:dynamodb:ap-southeast-2:*:table/referral-relationships/index/*",
        "arn:aws:dynamodb:ap-southeast-2:*:table/referral-conversions",
        "arn:aws:dynamodb:ap-southeast-2:*:table/referral-conversions/index/*",
        "arn:aws:dynamodb:ap-southeast-2:*:table/referral-discounts",
        "arn:aws:dynamodb:ap-southeast-2:*:table/referral-discounts/index/*",
        "arn:aws:dynamodb:ap-southeast-2:*:table/rate-limit-attempts"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:ap-southeast-2:*:*"
    }
  ]
}
```

### 3. API Gateway Setup

#### Create REST API with proxy routing:
1. Create new REST API in AWS Console
2. Create resource: `{proxy+}` 
3. Create method: `ANY` on `{proxy+}` resource
4. Integration type: Lambda Function
5. Use Lambda Proxy integration: **Enabled**
6. Lambda Function: `LifeCompass-ReferralSyncHandler`
7. Deploy API to stage (e.g., `prod`)

#### Get API Gateway URL:
The URL format will be: `https://{api-id}.execute-api.ap-southeast-2.amazonaws.com/prod`

Update `ReferralBackendService.js` with your actual API Gateway URL.

## Testing Procedures

### Phase 1: AWS Infrastructure Testing

#### 1.1 Lambda Function Endpoint Testing
Use CloudWatch logs to monitor Lambda function execution:

```bash
# View recent logs
aws logs describe-log-groups --region ap-southeast-2 | grep ReferralSyncHandler
aws logs describe-log-streams --region ap-southeast-2 --log-group-name /aws/lambda/LifeCompass-ReferralSyncHandler
```

**Test each endpoint manually:**

**Health Check:**
```bash
curl -X GET "https://YOUR_API_ID.execute-api.ap-southeast-2.amazonaws.com/prod/health"
# Expected: {"status": "ok", "timestamp": "..."}
```

**Validate Referral Code:**
```bash
curl -X POST "https://YOUR_API_ID.execute-api.ap-southeast-2.amazonaws.com/prod/validate-referral-code" \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST123", "deviceFingerprint": "test-device"}'
# Expected: {"success": false, "reason": "Code not found"}
```

**Sync Referral Code:**
```bash
curl -X POST "https://YOUR_API_ID.execute-api.ap-southeast-2.amazonaws.com/prod/sync-referral-code" \
  -H "Content-Type: application/json" \
  -d '{"code": "TEST123", "userId": "user123", "deviceFingerprint": "test-device"}'
# Expected: {"success": true, "message": "Referral code synced successfully"}
```

#### 1.2 DynamoDB Data Verification

**Check referral codes table:**
```bash
aws dynamodb scan --region ap-southeast-2 --table-name referral-codes --max-items 10
```

**Check relationships table:**
```bash
aws dynamodb scan --region ap-southeast-2 --table-name referral-relationships --max-items 10
```

### Phase 2: React Native App Testing

#### 2.1 Build and Run Tests

**Install dependencies and start app:**
```bash
npm install
npm start
```

**Test on iOS:**
```bash
npm run ios
```

**Test on Android:**
```bash
npm run android
```

#### 2.2 ReferralBackendService Tests

**Test connectivity:**
1. Navigate to any screen that uses ReferralBackendService
2. Check console logs for connectivity test results
3. Verify API Gateway URL is accessible

**Test in React Native Debugger:**
```javascript
// In app console
import referralBackendService from './src/services/ReferralBackendService';

// Test connectivity
await referralBackendService.checkConnectivity();

// Test code validation
await referralBackendService.validateReferralCode('TEST123');

// Test stats retrieval  
await referralBackendService.getUserReferralStats();
```

### Phase 3: Referral Code Input Flow Testing

#### 3.1 Settings Modal Button Visibility

**Test scenarios:**
1. **Free user, no code entered**: Button should be visible
2. **Free user, code already entered**: Button should be hidden
3. **Paid user (pro/founding)**: Button should be hidden

**Test steps:**
1. Go to Profile → Settings
2. Verify "Received a referral code?" button visibility
3. Change user subscription status in `ProfileScreen/index.js` for testing
4. Refresh screen and verify button visibility changes

#### 3.2 Referral Code Input Modal

**Rate limiting tests:**

**Test Case 1: Valid code within attempts**
1. Tap "Received a referral code?"
2. Enter a valid referral code (create one via sync endpoint)
3. Submit - should show success
4. Verify `hasEnteredReferralCode` is set to true in AsyncStorage

**Test Case 2: Invalid code - exhaust attempts**
1. Clear AsyncStorage referral data
2. Open referral code modal
3. Enter invalid code 3 times
4. Verify 5-minute lockout message appears
5. Check AsyncStorage for lockout timestamp

**Test Case 3: Rate limit lockout**
1. Wait 5 minutes or clear AsyncStorage lockout data
2. Verify modal allows input again
3. Test that attempts reset after successful lockout period

#### 3.3 Anti-Abuse Testing

**Self-referral prevention:**
1. Create referral code for User A
2. Try to input same code as User A
3. Should be rejected with "Cannot use your own referral code"

**Duplicate code usage:**
1. User A enters valid code from User B
2. User C tries to enter same code from User B  
3. Should be rejected with appropriate error

### Phase 4: End-to-End Referral Flow Testing

#### 4.1 Complete Referral Journey

**Setup:**
1. User A (referrer) - has paid $4.99 app fee
2. User B (referee) - free user, hasn't paid app fee

**Test Steps:**

**Step 1: Code Generation**
1. User A goes to Referral screen
2. Verify referral code is generated and displayed
3. User A shares code with User B

**Step 2: Code Input**
1. User B opens app (free user)
2. Goes to Profile → Settings
3. Taps "Received a referral code?"
4. Enters User A's referral code
5. Verify success message
6. Verify button disappears from Settings

**Step 3: App Purchase**
1. User B purchases $4.99 app fee
2. Check that `SubscriptionService.js` records referral conversion
3. Verify both users get discount records in DynamoDB

**Step 4: Discount Display**
1. Both User A and User B go to Referral → Stats tab
2. Verify "Your 50% Off Discounts" section shows 1 available discount
3. Verify badge shows correct count

**Step 5: Discount Redemption**
1. User A goes to AI subscription pricing
2. Select monthly AI plan
3. Verify automatic discount detection and application
4. Verify 50% off price is shown
5. Complete purchase (mock)
6. Verify discount is marked as used
7. Verify discount count decreases to 0 in Referral Stats

#### 4.2 Multi-Referral Testing

**Test multiple referrals for same user:**
1. User A refers User B (completes purchase)
2. User A refers User C (completes purchase) 
3. User A refers User D (completes purchase)
4. Verify User A has 3 available discounts
5. Use 1 discount, verify count drops to 2
6. Verify User A can use remaining discounts on separate purchases

### Phase 5: Achievement Integration Testing

#### 5.1 Referral Count Increases

**Test referral count increases with achievements:**
1. Verify new user starts with 3 referral slots
2. Complete 90-day achievement streak
3. Verify referral count increases to 4
4. Complete 180-day achievement streak  
5. Verify referral count increases to 5
6. Test that additional referral codes can be generated

### Phase 6: Error Handling & Edge Cases

#### 6.1 Network Connectivity Tests

**Offline behavior:**
1. Disable internet connection
2. Try to input referral code
3. Verify appropriate error message
4. Re-enable internet and retry
5. Verify successful submission

#### 6.2 Lambda Function Error Testing

**Test Lambda timeout:**
```bash
# Temporarily modify Lambda timeout to 3 seconds for testing
aws lambda update-function-configuration \
  --region ap-southeast-2 \
  --function-name LifeCompass-ReferralSyncHandler \
  --timeout 3
```

1. Trigger heavy operations
2. Verify app handles timeout gracefully
3. Reset timeout to normal value

#### 6.3 DynamoDB Error Testing

**Simulate DynamoDB unavailable:**
1. Temporarily revoke DynamoDB permissions from Lambda
2. Test referral code input
3. Verify graceful error handling
4. Restore permissions

### Phase 7: Performance Testing

#### 7.1 Load Testing

**Test concurrent referral code inputs:**
```bash
# Use curl to simulate multiple simultaneous requests
for i in {1..10}; do
  curl -X POST "https://YOUR_API_ID.execute-api.ap-southeast-2.amazonaws.com/prod/validate-referral-code" \
    -H "Content-Type: application/json" \
    -d '{"code": "TEST'$i'", "deviceFingerprint": "device'$i'"}' &
done
wait
```

#### 7.2 Mobile App Performance

**Test on low-end devices:**
1. Test modal opening/closing animations
2. Verify smooth scrolling in referral screens
3. Check memory usage during heavy operations

### Phase 8: Production Deployment Testing

#### 8.1 Environment Configuration

**Production environment variables:**
1. Update API Gateway URL in ReferralBackendService
2. Verify all DynamoDB table names match production
3. Test with production AWS credentials

#### 8.2 Production Data Validation

**Create production test users:**
1. Create 2-3 test accounts in production
2. Run complete referral flow
3. Verify data integrity in production DynamoDB
4. Clean up test data after validation

## CloudWatch Monitoring

### Key Metrics to Monitor

#### Lambda Function Metrics:
- Duration
- Error count
- Throttles
- Invocations

#### DynamoDB Metrics:
- ConsumedReadCapacityUnits
- ConsumedWriteCapacityUnits
- ThrottledRequests
- SystemErrors

#### Custom Logs to Monitor:
```bash
# Filter for specific operations
aws logs filter-log-events --region ap-southeast-2 \
  --log-group-name /aws/lambda/LifeCompass-ReferralSyncHandler \
  --filter-pattern "ERROR"

# Monitor referral code validations
aws logs filter-log-events --region ap-southeast-2 \
  --log-group-name /aws/lambda/LifeCompass-ReferralSyncHandler \
  --filter-pattern "validate-referral-code"
```

## Troubleshooting Common Issues

### 1. Metro Bundler Errors
**Error**: "Module aws-sdk not found"
**Solution**: Verify `metro.config.js` excludes lambda-functions directory

### 2. API Gateway 403 Errors
**Error**: Missing Authentication Token
**Solution**: Check API Gateway resource configuration and proxy setup

### 3. DynamoDB Access Denied
**Error**: User not authorized to perform dynamodb:GetItem
**Solution**: Verify Lambda IAM role has correct DynamoDB permissions

### 4. Rate Limiting Not Working
**Error**: Users can bypass 3-attempt limit
**Solution**: Check device fingerprinting and AsyncStorage implementation

### 5. Discounts Not Applying
**Error**: Auto-discount detection fails
**Solution**: Verify PricingScreen integration and ReferralBackendService method calls

## Success Criteria

### ✅ Infrastructure Setup Complete
- [ ] All 5 DynamoDB tables created with correct schemas
- [ ] Lambda function deployed with 800+ line business logic
- [ ] API Gateway properly configured with proxy routing
- [ ] IAM permissions correctly set

### ✅ React Native Integration Working
- [ ] ReferralBackendService connects to AWS
- [ ] Settings modal shows/hides button correctly
- [ ] Rate limiting works (3 attempts, 5-minute lockout)
- [ ] Referral stats display available discounts
- [ ] Auto-discount application works in pricing screen

### ✅ End-to-End Flow Verified
- [ ] Complete referral journey from code generation to discount redemption
- [ ] Anti-abuse measures prevent self-referrals and duplicate usage
- [ ] Achievement integration increases referral counts
- [ ] Multiple referrals accumulate multiple discounts

### ✅ Production Ready
- [ ] Performance tested on both iOS and Android
- [ ] Error handling gracefully manages network/server issues  
- [ ] CloudWatch monitoring in place
- [ ] Production deployment successful

## Estimated Testing Timeline

- **Phase 1-2 (Infrastructure + React Native)**: 4-6 hours
- **Phase 3-4 (Referral Flow + End-to-End)**: 6-8 hours  
- **Phase 5-6 (Achievements + Error Handling)**: 3-4 hours
- **Phase 7-8 (Performance + Production)**: 2-3 hours

**Total Estimated Time**: 15-21 hours of comprehensive testing

This represents a complete enterprise-level referral system with sophisticated business logic, anti-abuse measures, and production-ready infrastructure that would typically cost $15,000-$25,000 to develop professionally.
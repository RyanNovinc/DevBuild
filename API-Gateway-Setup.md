# API Gateway Setup for Rate Limiting

Your frontend AITokenManager expects these API endpoints. You need to set up API Gateway routes that connect to your Lambda functions.

## Required API Endpoints

### 1. Check Window Limits (Pre-flight check)
**Endpoint:** `POST ${API_BASE_URL}/window-limits/check`
**Lambda Function:** `LifeCompass-CheckWindowLimits`

**Request Body:**
```json
{
  "userId": "user@example.com",
  "estimatedTokens": 1500,
  "messageText": "Optional message text for better estimation"
}
```

**Response:**
```json
{
  "canSend": true,
  "reason": "Within rate limits",
  "estimation": {
    "inputTokens": 500,
    "outputTokens": 1000,
    "totalTokens": 1500,
    "estimatedCost": 0.0015
  },
  "rateLimit": {
    "tier": "standard",
    "windowId": "2025-08-16-12",
    "timeUntilReset": "2h 45m",
    "minutesUntilReset": 165,
    "tokens": {
      "allocated": 56250,
      "maxBuffer": 168750,
      "used": 25000,
      "available": 143750
    },
    "usage": {
      "isNearLimit": false,
      "isAtLimit": false,
      "warningThreshold": 10000
    }
  }
}
```

### 2. Track Credit Usage (After AI response)
**Endpoint:** `POST ${API_BASE_URL}/credits/usage`
**Lambda Function:** `LifeCompass-TrackCreditUsage`

**Request Body:**
```json
{
  "userId": "user@example.com",
  "inputTokens": 500,
  "outputTokens": 1200,
  "cachedInputTokens": 100,
  "operation": "deduct"
}
```

**Response:**
```json
{
  "message": "Usage tracked successfully",
  "cost": {
    "regularInput": 0.0002,
    "cachedInput": 0.00003,
    "output": 0.00288,
    "total": 0.00311
  },
  "tokenUsage": {
    "regularInputTokens": 400,
    "cachedInputTokens": 100,
    "outputTokens": 1200,
    "totalTokens": 1700
  },
  "remainingBudget": 1.32,
  "windowInfo": {
    "windowId": "2025-08-16-12",
    "timeUntilReset": "2h 30m",
    "tokens": {
      "allocated": 56250,
      "maxBuffer": 168750,
      "used": 26700,
      "available": 142050
    },
    "usage": {
      "isNearLimit": false,
      "isAtLimit": false,
      "warningThreshold": 10000
    }
  }
}
```

### 3. Get Credit Balance (Optional - for detailed view)
**Endpoint:** `POST ${API_BASE_URL}/credits/balance`
**Lambda Function:** `LifeCompass-GetCreditBalance`

**Request Body:**
```json
{
  "userId": "user@example.com",
  "includeHistory": false,
  "includeWindowInfo": true
}
```

## API Gateway Configuration Steps

### Option 1: AWS Console
1. Go to API Gateway console
2. Create new REST API or use existing one
3. Create resources and methods:
   - `/window-limits/check` → POST → `LifeCompass-CheckWindowLimits`
   - `/credits/usage` → POST → `LifeCompass-TrackCreditUsage`
   - `/credits/balance` → POST → `LifeCompass-GetCreditBalance`
4. Enable CORS for all endpoints
5. Deploy API to stage (e.g., 'prod')
6. Update your `API_BASE_URL` in app config

### Option 2: CloudFormation/CDK
```yaml
# Add these resources to your existing CloudFormation template
Resources:
  WindowLimitsResource:
    Type: AWS::ApiGateway::Resource
    Properties:
      RestApiId: !Ref YourApiGateway
      ParentId: !Ref WindowLimitsParentResource
      PathPart: check

  WindowLimitsMethod:
    Type: AWS::ApiGateway::Method
    Properties:
      RestApiId: !Ref YourApiGateway
      ResourceId: !Ref WindowLimitsResource
      HttpMethod: POST
      Integration:
        Type: AWS_PROXY
        IntegrationHttpMethod: POST
        Uri: !Sub "arn:aws:apigateway:${AWS::Region}:lambda:path/2015-03-31/functions/${LifeCompassCheckWindowLimitsFunction.Arn}/invocations"
```

## Testing Your Setup

### Test 1: Check Window Limits
```bash
curl -X POST https://your-api-gateway-url/window-limits/check \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "estimatedTokens": 1000,
    "messageText": "This is a test message"
  }'
```

### Test 2: Track Usage
```bash
curl -X POST https://your-api-gateway-url/credits/usage \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "inputTokens": 100,
    "outputTokens": 200,
    "operation": "deduct"
  }'
```

## Important Notes

1. **CORS**: Enable CORS for all endpoints with:
   - Access-Control-Allow-Origin: *
   - Access-Control-Allow-Headers: Content-Type,Authorization
   - Access-Control-Allow-Methods: POST,OPTIONS

2. **Authentication**: If using Cognito, add authorizer to API Gateway methods

3. **Error Handling**: Your Lambda functions return proper HTTP status codes:
   - 200: Success
   - 400: Bad request
   - 429: Rate limited
   - 500: Server error

4. **Environment Variables**: Make sure `API_BASE_URL` in your React Native app points to your deployed API Gateway URL

Once you set up these endpoints, your rate limiting system will be fully functional! 🚀
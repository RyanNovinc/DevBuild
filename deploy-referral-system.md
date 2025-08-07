# Deploy LifeCompass Referral System

## Step 1: Deploy the API

In AWS CloudShell or your terminal:

```bash
aws cloudformation deploy --template-file referral-api-template.yaml --stack-name lifecompass-referral-api --capabilities CAPABILITY_IAM
```

Wait for the deployment to complete, then get the endpoints:

```bash
aws cloudformation describe-stacks --stack-name lifecompass-referral-api --query 'Stacks[0].Outputs'
```

## Step 2: Update the App Configuration

Copy the API endpoints from the output and update them in the referralService.js file:

```javascript
// Replace these URLs with your actual API Gateway endpoints
const API_ENDPOINTS = {
  CREATE_REFERRAL_CODE: 'https://YOUR-API-ID.execute-api.ap-southeast-2.amazonaws.com/prod/create-referral-code',
  GET_REFERRAL_STATS: 'https://YOUR-API-ID.execute-api.ap-southeast-2.amazonaws.com/prod/referral-stats',
  TRACK_REFERRAL: 'https://YOUR-API-ID.execute-api.ap-southeast-2.amazonaws.com/prod/track-referral',
};
```

## Step 3: Test the System

1. **Test in your app:**
   - Go to Community tab as a founder
   - The referral section should now show real data from DynamoDB
   - Try generating a referral code
   - Check the Developer tab for testing tools

2. **Test referral tracking:**
   - Use the "Mock Conversion" button in Developer tab
   - Check if stats update correctly

## What's Deployed:

### Lambda Functions:
- **LifeCompass-CreateReferralCode**: Creates unique referral codes for founders
- **LifeCompass-GetReferralStats**: Retrieves referral statistics and recent conversions
- **LifeCompass-TrackReferral**: Tracks referral visits, signups, and purchases

### API Endpoints:
- **POST /create-referral-code**: Generate referral code from founder code
- **POST /referral-stats**: Get referral statistics for a code
- **POST /track-referral**: Track referral events (visit/signup/purchase)

### Database Integration:
- Uses existing `LifeCompassFounderCodes` table to verify founder status
- Uses new `LifeCompass-ReferralCodes` table for referral data
- Uses `LifeCompass-ReferralConversions` for tracking successful referrals
- Uses `LifeCompass-AnonymousUsers` for tracking referral funnel

## Features Now Live:

✅ **Real referral code generation** based on founder codes
✅ **Live statistics** from DynamoDB
✅ **Referral tracking** for visits, signups, purchases
✅ **Reward calculation** (50 cents per successful referral)
✅ **Privacy-focused** with anonymized user names
✅ **CORS enabled** for React Native app access

## Next Steps (Optional):

1. **Add GSI indexes** to DynamoDB tables for better performance:
   - ReferralCodeIndex on ReferralConversions table
   - ReferralCodeIndex on AnonymousUsers table

2. **Integrate with payment processor** for reward redemption
3. **Add email notifications** for founders when they get referrals
4. **Add referral tracking pixel** for your website

## Security Notes:

- All Lambda functions have minimal DynamoDB permissions
- CORS is configured for your app domain
- No sensitive data is exposed in API responses
- User data is anonymized for privacy

Your referral system is now production-ready! 🚀
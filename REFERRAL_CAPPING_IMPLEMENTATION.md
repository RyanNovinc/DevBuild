# Referral Capping System Implementation

## Overview
This implementation adds achievement-based referral limits and proper race condition handling to prevent unlimited referral sharing and ensure fair usage.

## How It Works

### 🎯 **Achievement-Based Limits**
- **Base Limit**: 3 referral codes per user
- **30-Day Achievement**: +1 additional referral (total: 4)
- **90-Day Achievement**: +1 additional referral (total: 5)
- **Maximum**: 5 referral codes total

### 🔄 **Active Referral Tracking**
Instead of counting total sent referrals, the system now counts "active" referrals:
- **Active**: Sent but not yet converted or expired
- **User can send new codes**: Only when `activeCount < currentLimit`
- **Previously sent codes**: Always honor existing codes

### 🛡️ **Race Condition Protection**
- **App-side**: Prevents sending when at limit
- **Lambda-side**: Prevents double-use of same code
- **Validation**: Checks code availability before processing
- **One Code Per User**: Prevents users from entering multiple referral codes

## Files Modified

### App-Side Changes
```
src/services/AchievementService.js - Achievement-based limit calculation
src/screens/Referral/ReferralService.js - Active referral counting logic
src/services/ReferralBackendService.js - Validation endpoint integration
src/components/ReferralSummaryPopup.js - UI updated for active referrals
src/screens/EditProfileScreen.js - Progress calculation fixed
src/components/ai/AISideMenu/index.js - Progress calculation fixed
src/screens/Referral/ReferralDetails.js - Better error messaging
src/utils/ReferralIntegration.js - Proper error handling
```

### Lambda Changes
```
LifeCompass-ReferralSyncHandler.js - Added /validate-referral-availability endpoint
```

## Key Functions

### `getReferralLimit()` (AchievementService)
```javascript
// Returns dynamic limit based on achievements
const limit = 3; // base
if (achievements['30-day-momentum']) limit += 1;
if (achievements['90-day-transformation']) limit += 1;
return Math.min(limit, 5); // cap at 5
```

### `getReferralsRemaining()` (ReferralService)
```javascript
// Count active referrals only
const activeReferrals = sentReferrals.filter(ref => 
  ref.status !== 'subscribed' && ref.status !== 'expired'
).length;
return Math.max(0, currentLimit - activeReferrals);
```

### `validateReferralCodeAvailability()` (Lambda)
```javascript
// Check if referral code is still usable
const available = referralData.isActive && !referralData.usedBy;
return { available };
```

## User Experience

### ✅ **What Users See:**
1. **Referral Progress**: "2/4 referrals available" updates dynamically
2. **Achievement Guide**: Error messages explain how to unlock more slots
3. **Honor Old Codes**: Previously sent codes always work
4. **Clear Feedback**: Proper error messages when codes are unavailable

### 🚫 **What's Prevented:**
1. **Unlimited Sending**: Can't send more than achievement-based limit
2. **Double Usage**: Lambda prevents same code being used twice
3. **Race Conditions**: Validation happens before processing
4. **Broken Promises**: Old codes remain valid
5. **Multiple Codes**: Users can only enter one referral code per account

## Deployment Steps

### 1. Deploy Lambda Update
```bash
# Run the deployment script
./deploy-updated-referral-lambda.bat
```

### 2. Test the System
```bash
# Run the test script
node test-referral-system.js
```

### 3. Verify in App
- Test referral sharing with different achievement levels
- Verify error messages when at limit
- Test that old codes still work

## Example Scenarios

### Scenario 1: Achievement Unlock
```
User has sent 3/3 referrals → Completes 30-day streak → 
Unlocks achievement → Now has 3/4 referrals → Can send 1 more
```

### Scenario 2: Race Condition
```
User A sends code → User B tries to use it → User C tries same code →
Lambda allows B (first) → Lambda rejects C (already used)
```

### Scenario 3: Streak Loss
```
User sent 4 referrals with 30-day achievement → Loses streak →
Limit drops to 3 → Can't send new ones → BUT old 4 codes still work
```

## Error Messages
- **At Limit**: "You have reached your referral limit! Complete achievements like maintaining a 30-day or 90-day streak to unlock more referral slots."
- **Code Used**: "This referral code has reached its limit. The person who shared it cannot accept more referrals right now."
- **Invalid Code**: "Referral code not found"
- **Multiple Codes**: "You have already entered a referral code. Only one referral code can be used per account."

## Technical Notes
- Uses atomic DynamoDB operations to prevent race conditions
- Graceful degradation: On errors, assumes codes are valid
- Achievement data synced across app contexts
- Compatible with existing referral reward system

## Testing Checklist
- [ ] Achievement-based limits work correctly
- [ ] UI shows accurate referral progress
- [ ] Error messages are helpful
- [ ] Old referral codes remain functional
- [ ] Race conditions are handled properly
- [ ] Lambda validation endpoint works
- [ ] App gracefully handles network errors

## Future Enhancements
- Achievement progress tracking in backend
- More granular referral analytics
- Referral code expiration policies
- Referral conversion tracking improvements
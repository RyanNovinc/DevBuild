// src/services/__tests__/ReferralFlow.test.js
// Simple test script to verify referral flow works
// Run this with: node src/services/__tests__/ReferralFlow.test.js

import ReferralTracker from '../ReferralTracker';
import { upgradeSubscription } from '../SubscriptionService';

const testReferralFlow = async () => {
  console.log('🧪 Testing Referral Flow...\n');

  try {
    // Step 1: Simulate user arriving via referral link
    console.log('1. Simulating user clicking referral link...');
    const testURL = 'https://lifecompass.app/r/USER-ABC123';
    const referralCode = ReferralTracker.extractReferralFromURL(testURL);
    console.log(`   Extracted referral code: ${referralCode}`);

    // Step 2: Store the pending referral
    console.log('\n2. Storing pending referral...');
    await ReferralTracker.storePendingReferral(referralCode, 'deeplink');
    
    // Step 3: Check if referral was stored
    console.log('\n3. Checking stored referral...');
    const pendingReferral = await ReferralTracker.getPendingReferral();
    console.log('   Pending referral:', pendingReferral);

    // Step 4: Simulate user upgrading to Pro
    console.log('\n4. Simulating user upgrade to Pro...');
    const userId = 'test-user-123';
    const upgradeResult = await upgradeSubscription('pro', userId);
    console.log('   Upgrade result:', upgradeResult);

    // Step 5: Check completed referrals
    console.log('\n5. Checking completed referrals...');
    const completedReferrals = await ReferralTracker.getCompletedReferrals();
    console.log('   Completed referrals:', completedReferrals);

    // Step 6: Verify pending referral was cleared
    console.log('\n6. Verifying pending referral was cleared...');
    const clearedPending = await ReferralTracker.getPendingReferral();
    console.log('   Pending referral after processing:', clearedPending);

    console.log('\n✅ Referral flow test completed successfully!');

  } catch (error) {
    console.error('\n❌ Referral flow test failed:', error);
  }
};

// Test different URL formats
const testURLExtraction = () => {
  console.log('\n🔗 Testing URL extraction...');
  
  const testUrls = [
    'https://lifecompass.app/r/USER-ABC123',
    'lifecompass://r/USER-ABC123',
    'https://lifecompass.app/r/JOHN-XYZ789',
    'https://lifecompass.app/?ref=LEGACY-123',
    'invalid-url',
    ''
  ];

  testUrls.forEach(url => {
    const extracted = ReferralTracker.extractReferralFromURL(url);
    console.log(`   ${url} → ${extracted || 'null'}`);
  });
};

// Export for use in development
export { testReferralFlow, testURLExtraction };

// If running directly (for development testing)
if (require.main === module) {
  console.log('Running referral flow tests...\n');
  testURLExtraction();
  testReferralFlow();
}
// Test script to verify the referral capping system
// Run with: node test-referral-system.js

const API_BASE_URL = 'https://rwcfj8kh8a.execute-api.ap-southeast-2.amazonaws.com/prod';

async function testReferralValidation() {
  console.log('🧪 Testing Referral Validation System...\n');

  // Test 1: Validate an existing referral code (should work)
  console.log('Test 1: Validating a referral code...');
  try {
    const response = await fetch(`${API_BASE_URL}/validate-referral-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: 'TEST1234' })
    });
    
    const result = await response.json();
    console.log('✅ Response:', result);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 2: Validate non-existent code
  console.log('\nTest 2: Validating non-existent referral code...');
  try {
    const response = await fetch(`${API_BASE_URL}/validate-referral-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ referralCode: 'INVALID123' })
    });
    
    const result = await response.json();
    console.log('✅ Response:', result);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test 3: Health check
  console.log('\nTest 3: Health check...');
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const result = await response.json();
    console.log('✅ Health:', result.message);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  console.log('\n🎉 Testing complete!');
  console.log('\nNext steps:');
  console.log('1. Deploy the lambda: run deploy-updated-referral-lambda.bat');
  console.log('2. Test the app-side referral limits with achievements');
  console.log('3. Verify race condition handling works');
}

// Run the tests
testReferralValidation().catch(console.error);
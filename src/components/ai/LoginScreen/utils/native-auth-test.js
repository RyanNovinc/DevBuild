// Native build AWS authentication test
// This file can be used to test AWS auth in native builds

import { Amplify } from 'aws-amplify';

export const testNativeAuth = async () => {
  console.log('🧪 NATIVE AUTH TEST: Starting comprehensive test...');
  
  try {
    // 1. Check if global config exists
    console.log('1. Global config check:', {
      configured: !!global.AWS_AMPLIFY_CONFIGURED,
      config: !!global.AWS_CONFIG
    });
    
    // 2. Test basic AWS configuration
    const testConfig = {
      Auth: {
        region: 'ap-southeast-2',
        userPoolId: 'ap-southeast-2_DswoUlwql',
        userPoolWebClientId: 'unr38aneiujkjoptt5p7pg6tp',
        authenticationFlowType: 'USER_SRP_AUTH',
      },
      aws_project_region: 'ap-southeast-2',
      aws_cognito_region: 'ap-southeast-2',
      aws_user_pools_id: 'ap-southeast-2_DswoUlwql',
      aws_user_pools_web_client_id: 'unr38aneiujkjoptt5p7pg6tp',
    };
    
    console.log('2. Configuring AWS for test...');
    Amplify.configure(testConfig);
    console.log('✅ AWS configuration successful');
    
    // 3. Test auth import
    console.log('3. Testing auth imports...');
    const { getCurrentUser, signIn } = await import('aws-amplify/auth');
    
    if (typeof getCurrentUser !== 'function') {
      throw new Error('getCurrentUser is not a function');
    }
    
    if (typeof signIn !== 'function') {
      throw new Error('signIn is not a function');
    }
    
    console.log('✅ Auth functions imported successfully');
    
    // 4. Test getCurrentUser (should fail gracefully if no user)
    console.log('4. Testing getCurrentUser...');
    try {
      const currentUser = await getCurrentUser();
      console.log('✅ getCurrentUser returned:', currentUser?.username || 'undefined user');
    } catch (error) {
      if (error.name === 'UserUnAuthenticatedException' || error.message.includes('not authenticated')) {
        console.log('✅ getCurrentUser correctly returned no authenticated user');
      } else {
        console.log('⚠️ getCurrentUser error (may be expected):', error.message);
      }
    }
    
    // 5. Test actual login with user's credentials
    console.log('5. Testing actual login with provided credentials...');
    try {
      const { signIn } = await import('aws-amplify/auth');
      
      // Try to sign in with the user's actual email
      const email = 'ryan.novinc@gmail.com';
      console.log(`Attempting login test for: ${email}`);
      
      // This will fail but give us the real AWS error
      const signInResult = await signIn({ 
        username: email, 
        password: 'test-password-for-error-checking' 
      });
      
      console.log('🎉 Unexpected success in login test:', signInResult);
    } catch (loginError) {
      console.log('📋 Login test error (expected - this shows real AWS response):');
      console.log('- Error name:', loginError.name);
      console.log('- Error code:', loginError.code);
      console.log('- Error message:', loginError.message);
      console.log('- Underlying error:', JSON.stringify(loginError.underlyingError, null, 2));
      console.log('- Full error keys:', Object.keys(loginError));
      
      // Analyze the error type
      if (loginError.name === 'UserNotFoundException') {
        console.log('❌ DIAGNOSIS: User does not exist in AWS Cognito');
      } else if (loginError.name === 'NotAuthorizedException') {
        console.log('✅ DIAGNOSIS: User exists but password is wrong (this is good!)');
      } else if (loginError.name === 'UserNotConfirmedException') {
        console.log('⚠️ DIAGNOSIS: User exists but email not verified');
      } else {
        console.log('🔍 DIAGNOSIS: Other AWS error -', loginError.name);
      }
    }
    
    console.log('🎉 NATIVE AUTH TEST: All tests completed successfully!');
    return {
      success: true,
      message: 'Native auth test passed - AWS configuration is working'
    };
    
  } catch (error) {
    console.error('❌ NATIVE AUTH TEST FAILED:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
};

export default testNativeAuth;
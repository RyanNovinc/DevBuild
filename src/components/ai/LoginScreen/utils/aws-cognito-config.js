// src/components/ai/LoginScreen/utils/aws-cognito-config.js
// UPDATED: Added configureAmplify function for proper initialization

import { Amplify } from 'aws-amplify';

// Export Auth methods directly - these will be imported by auth-service.js
export const awsConfig = {
  Auth: {
    // Region where your Cognito User Pool is located
    region: 'ap-southeast-2',
    
    // User Pool ID from AWS Cognito Console
    userPoolId: 'ap-southeast-2_DswoUlwql',
    
    // App Client ID from AWS Cognito Console
    userPoolWebClientId: 'unr38aneiujkjoptt5p7pg6tp',
    
    // IMPORTANT: Explicitly disable OAuth/social login to prevent errors
    oauth: {
      domain: 'none',
      scope: ['email', 'profile', 'openid'],
      redirectSignIn: 'none',
      redirectSignOut: 'none',
      responseType: 'code',
      // Explicitly set social providers to empty to prevent "loginWith" errors
      socialProviders: []
    }
  }
};

/**
 * Configure AWS Amplify with proper error handling
 * @returns {Promise<boolean>} - Success status
 */
export const configureAmplify = async () => {
  try {
    console.log('Configuring AWS Amplify with auth config...');
    
    // Configure Amplify with our auth settings
    Amplify.configure(awsConfig);
    
    console.log('✅ AWS Amplify configuration successful');
    return true;
  } catch (error) {
    console.error('❌ AWS Amplify configuration error:', error);
    return false;
  }
};

console.log('AWS Cognito config loaded - configuration and functions available');

export default awsConfig;
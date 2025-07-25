// src/components/ai/LoginScreen/utils/aws-cognito-config.js
// UPDATED: Removed duplicate initialization, now only exports configuration

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

// No initialization here since it's done in App.js

console.log('AWS Cognito config loaded - configuration only, no initialization');

export default awsConfig;
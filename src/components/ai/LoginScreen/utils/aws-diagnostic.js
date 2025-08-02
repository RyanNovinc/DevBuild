// src/components/ai/LoginScreen/utils/aws-diagnostic.js
import { Amplify } from 'aws-amplify';
import NetInfo from '@react-native-community/netinfo';
import { awsConfig } from './aws-cognito-config';

// Try to import Auth methods to check availability
let authMethods = {};
try {
  // Import individual auth methods (Amplify v6 style)
  const { signUp, signIn, confirmSignUp } = require('aws-amplify/auth');
  authMethods = { signUp, signIn, confirmSignUp };
} catch (error) {
  console.error('Error importing Auth methods:', error);
}

/**
 * Utility to diagnose AWS Amplify issues
 */
export const diagnoseCognitoIssues = async () => {
  console.log('\n=== AWS AMPLIFY DIAGNOSTICS (v6) ===');
  
  // 1. Check network connectivity
  console.log('\n--- Network Status ---');
  const netInfo = await NetInfo.fetch();
  console.log('Internet Connected:', netInfo.isConnected);
  console.log('Internet Reachable:', netInfo.isInternetReachable);
  console.log('Connection Type:', netInfo.type);
  console.log('Network Details:', netInfo.details);
  
  if (!netInfo.isConnected || !netInfo.isInternetReachable) {
    console.log('⚠️ POTENTIAL ISSUE: No internet connectivity');
  }
  
  // 2. Check AWS Configuration
  console.log('\n--- AWS Configuration ---');
  console.log('Region:', awsConfig.Auth.region);
  console.log('User Pool ID:', awsConfig.Auth.userPoolId);
  console.log('App Client ID:', awsConfig.Auth.userPoolWebClientId);
  console.log('Auth Flow:', awsConfig.Auth.authenticationFlowType);
  
  const missingConfigItems = [];
  if (!awsConfig.Auth.region) missingConfigItems.push('region');
  if (!awsConfig.Auth.userPoolId) missingConfigItems.push('userPoolId');
  if (!awsConfig.Auth.userPoolWebClientId) missingConfigItems.push('userPoolWebClientId');
  
  if (missingConfigItems.length > 0) {
    console.log(`⚠️ POTENTIAL ISSUE: Missing config items: ${missingConfigItems.join(', ')}`);
  }
  
  // 3. Check AWS Amplify status
  console.log('\n--- AWS Amplify Status (v6) ---');
  
  // Check if Amplify is defined
  if (!Amplify) {
    console.log('❌ CRITICAL ISSUE: Amplify is not defined');
  } else {
    console.log('✓ Amplify is defined');
    
    // Check Amplify properties - different in v6
    console.log('Amplify methods:', Object.keys(Amplify).join(', '));
    
    // Check for Auth methods - in v6 these are imported separately
    console.log('\n--- Auth Methods (v6) ---');
    const authMethodsAvailable = Object.keys(authMethods).length > 0;
    
    if (!authMethodsAvailable) {
      console.log('❌ CRITICAL ISSUE: Auth methods are not available');
    } else {
      console.log('✓ Auth methods are imported');
      console.log('Available Auth methods:', Object.keys(authMethods).join(', '));
      
      // Check if the auth methods are functions
      const functionalMethods = Object.entries(authMethods)
        .filter(([_, method]) => typeof method === 'function')
        .map(([name]) => name);
      
      console.log('Functional Auth methods:', functionalMethods.join(', '));
      
      if (functionalMethods.length < Object.keys(authMethods).length) {
        console.log('⚠️ POTENTIAL ISSUE: Some Auth methods are not functions');
      }
    }
  }
  
  // 4. Check environment
  console.log('\n--- Environment ---');
  console.log('Platform:', Platform.OS);
  console.log('Dev Mode:', __DEV__ ? 'Yes' : 'No');
  
  // 5. Check AWS Amplify Version
  console.log('\n--- AWS Amplify Version ---');
  try {
    const { version } = require('aws-amplify/package.json');
    console.log('AWS Amplify Version:', version);
    
    // Detect major version
    const majorVersion = parseInt(version.split('.')[0], 10);
    if (majorVersion >= 6) {
      console.log('✓ Using AWS Amplify v6+ (modular structure)');
    } else {
      console.log('⚠️ POTENTIAL ISSUE: Using older AWS Amplify version. v6+ is recommended');
    }
  } catch (e) {
    console.log('Could not determine AWS Amplify version');
  }
  
  // 6. Provide recommendations
  console.log('\n--- Recommendations for Amplify v6 ---');
  
  if (!Amplify) {
    console.log('1. Ensure AWS Amplify is properly installed:');
    console.log('   - Check your package.json for aws-amplify');
    console.log('   - Try running: npm install aws-amplify@latest --save');
  } else if (!authMethodsAvailable) {
    console.log('1. For Amplify v6, import Auth methods correctly:');
    console.log('   - Use: import { signUp, signIn } from "aws-amplify/auth";');
    console.log('   - Do NOT use: import { Auth } from "aws-amplify";');
    console.log('2. Update all Auth references in your code to use the new modular imports');
    console.log('3. Ensure AWS configuration is called before any Auth operations');
  } else {
    console.log('1. Try manually re-initializing AWS Amplify:');
    console.log('   - Import configureAmplify from aws-cognito-config');
    console.log('   - Call configureAmplify() before any Auth operations');
    console.log('2. Check for errors in your AWS Cognito console');
    console.log('3. Verify network connectivity and try again');
  }
  
  console.log('\n=== END DIAGNOSTICS ===\n');
  
  // Return a summary of the issues
  return {
    networkConnected: netInfo.isConnected && netInfo.isInternetReachable,
    configValid: missingConfigItems.length === 0,
    amplifyDefined: !!Amplify,
    authMethodsAvailable: authMethodsAvailable,
    authMethodsFunctional: authMethodsAvailable && Object.values(authMethods).some(m => typeof m === 'function')
  };
};

export default diagnoseCognitoIssues;
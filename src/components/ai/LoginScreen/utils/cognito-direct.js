// Direct AWS Cognito implementation using amazon-cognito-identity-js
// This bypasses AWS Amplify v6 issues in native builds

// Import crypto polyfills first
import 'react-native-get-random-values';

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js';

// AWS Cognito User Pool configuration
const userPoolData = {
  UserPoolId: 'ap-southeast-2_DswoUlwql',
  ClientId: 'unr38aneiujkjoptt5p7pg6tp'
};

const userPool = new CognitoUserPool(userPoolData);

console.log('🔧 DIRECT COGNITO: Service loaded with direct amazon-cognito-identity-js');

/**
 * Direct AWS Cognito authentication service
 * Uses amazon-cognito-identity-js directly to bypass Amplify v6 issues
 */
export const cognitoDirectService = {
  /**
   * Sign in a user directly with Cognito
   */
  signIn: async (email, password) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔧 DIRECT COGNITO: Starting direct sign-in for:', email);
        
        const authenticationData = {
          Username: email,
          Password: password,
        };
        
        const authenticationDetails = new AuthenticationDetails(authenticationData);
        
        const userData = {
          Username: email,
          Pool: userPool,
        };
        
        const cognitoUser = new CognitoUser(userData);
        
        cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: (result) => {
            console.log('✅ DIRECT COGNITO: Sign-in successful');
            
            // Extract user info
            const accessToken = result.getAccessToken().getJwtToken();
            const idToken = result.getIdToken().getJwtToken();
            const refreshToken = result.getRefreshToken().getToken();
            
            // Get user attributes
            cognitoUser.getUserAttributes((err, attributes) => {
              if (err) {
                console.log('⚠️ DIRECT COGNITO: Could not get user attributes:', err);
                resolve({
                  id: email,
                  email: email,
                  displayName: email.split('@')[0],
                  accessToken,
                  idToken,
                  refreshToken
                });
              } else {
                const userAttributes = {};
                attributes.forEach(attr => {
                  userAttributes[attr.Name] = attr.Value;
                });
                
                resolve({
                  id: userAttributes.sub || email,
                  email: userAttributes.email || email,
                  displayName: userAttributes.name || email.split('@')[0],
                  phoneNumber: userAttributes.phone_number,
                  emailVerified: userAttributes.email_verified === 'true',
                  accessToken,
                  idToken,
                  refreshToken
                });
              }
            });
          },
          
          onFailure: (err) => {
            console.error('❌ DIRECT COGNITO: Sign-in error:', err);
            console.error('- Error code:', err.code);
            console.error('- Error message:', err.message);
            console.error('- Error name:', err.name);
            reject(err);
          },
          
          newPasswordRequired: (userAttributes, requiredAttributes) => {
            console.log('🔄 DIRECT COGNITO: New password required');
            reject(new Error('New password required'));
          },
          
          mfaRequired: (challengeName, challengeParameters) => {
            console.log('🔒 DIRECT COGNITO: MFA required');
            reject(new Error('MFA required'));
          },
          
          customChallenge: (challengeParameters) => {
            console.log('🎯 DIRECT COGNITO: Custom challenge');
            reject(new Error('Custom challenge required'));
          }
        });
        
      } catch (error) {
        console.error('❌ DIRECT COGNITO: Sign-in setup error:', error);
        reject(error);
      }
    });
  },
  
  /**
   * Forgot password with direct Cognito
   */
  forgotPassword: async (email) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔧 DIRECT COGNITO: Starting forgot password for:', email);
        
        const userData = {
          Username: email,
          Pool: userPool,
        };
        
        const cognitoUser = new CognitoUser(userData);
        
        cognitoUser.forgotPassword({
          onSuccess: (result) => {
            console.log('✅ DIRECT COGNITO: Forgot password successful:', result);
            resolve(true);
          },
          onFailure: (err) => {
            console.error('❌ DIRECT COGNITO: Forgot password error:', err);
            reject(err);
          },
          inputVerificationCode: (data) => {
            console.log('📧 DIRECT COGNITO: Verification code sent');
            resolve(true);
          }
        });
        
      } catch (error) {
        console.error('❌ DIRECT COGNITO: Forgot password setup error:', error);
        reject(error);
      }
    });
  },
  
  /**
   * Get current user
   */
  getCurrentUser: () => {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();
      
      if (!cognitoUser) {
        console.log('🔧 DIRECT COGNITO: No current user');
        resolve(null);
        return;
      }
      
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.log('🔧 DIRECT COGNITO: Session error:', err);
          resolve(null);
          return;
        }
        
        if (!session.isValid()) {
          console.log('🔧 DIRECT COGNITO: Session invalid');
          resolve(null);
          return;
        }
        
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            console.log('⚠️ DIRECT COGNITO: Could not get current user attributes:', err);
            resolve({
              id: cognitoUser.username,
              email: cognitoUser.username,
              displayName: cognitoUser.username.split('@')[0]
            });
          } else {
            const userAttributes = {};
            attributes.forEach(attr => {
              userAttributes[attr.Name] = attr.Value;
            });
            
            resolve({
              id: userAttributes.sub || cognitoUser.username,
              email: userAttributes.email || cognitoUser.username,
              displayName: userAttributes.name || cognitoUser.username.split('@')[0],
              phoneNumber: userAttributes.phone_number,
              emailVerified: userAttributes.email_verified === 'true'
            });
          }
        });
      });
    });
  },
  
  /**
   * Sign out current user
   */
  signOut: () => {
    return new Promise((resolve) => {
      const cognitoUser = userPool.getCurrentUser();
      if (cognitoUser) {
        cognitoUser.signOut();
        console.log('✅ DIRECT COGNITO: User signed out');
      }
      resolve(true);
    });
  }
};

export default cognitoDirectService;
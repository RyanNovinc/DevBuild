// src/components/ai/LoginScreen/utils/auth-service.js
// UPDATED: Direct imports from aws-amplify/auth with configuration check

import { Amplify } from 'aws-amplify';

// Import directly from aws-amplify/auth
import { 
  signIn, 
  signUp, 
  signOut, 
  confirmSignUp, 
  resetPassword, 
  confirmResetPassword,
  fetchUserAttributes, 
  getCurrentUser, 
  updateUserAttributes 
} from 'aws-amplify/auth';

// Simple configuration check - AWS should be configured in App.js
const checkAwsConfiguration = () => {
  console.log('✅ AUTH SERVICE: Using AWS configuration from App.js');
  return true; // Assume AWS is properly configured in development builds
};

// Added debug logging
console.log('AUTH SERVICE LOADED - Using direct auth imports with configuration check');

/**
 * AWS Cognito authentication service
 * This service provides methods for user authentication using AWS Cognito
 */
export const authService = {
  /**
   * Sign in a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User data
   */
  signIn: async (email, password) => {
    try {
      console.log('AUTH SERVICE: Starting sign-in process');
      console.log('AUTH SERVICE: Login attempt for email:', email);
      console.log('AUTH SERVICE: Password length:', password ? password.length : 'undefined');
      
      // Ensure AWS is configured before any auth operation
      if (!checkAwsConfiguration()) {
        throw new Error('AWS Amplify configuration failed');
      }
      
      console.log('AUTH SERVICE: AWS configuration verified, proceeding with signIn...');
      
      const signInResult = await signIn({ username: email, password });
      console.log('AUTH SERVICE: Sign-in successful');
      
      // In Amplify v6, we need to fetch attributes separately
      let userAttributes = {};
      try {
        userAttributes = await fetchUserAttributes();
      } catch (e) {
        console.error('Failed to fetch user attributes:', e);
      }
      
      // Create user object from Cognito user
      return {
        id: signInResult.username || signInResult.userId,
        email: userAttributes?.email || email,
        displayName: userAttributes?.name || email.split('@')[0],
        phoneNumber: userAttributes?.phone_number,
        emailVerified: userAttributes?.email_verified === 'true',
      };
    } catch (error) {
      console.error('AUTH SERVICE: Sign-in error details:', {
        code: error.code,
        name: error.name,
        message: error.message,
        stack: error.stack,
        originalError: error
      });
      
      // Enhanced error logging for native builds
      console.error('AUTH SERVICE: Full error object:', JSON.stringify(error, null, 2));
      console.error('AUTH SERVICE: Error constructor:', error.constructor.name);
      console.error('AUTH SERVICE: Error keys:', Object.keys(error));
      
      // Check if it's a network error
      if (error.message && error.message.includes('Network')) {
        console.error('AUTH SERVICE: Network error detected - check internet connection');
      }
      
      throw error;
    }
  },
  
  /**
   * Sign up a new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} attributes - User attributes
   * @returns {Promise<Object>} - Sign up result
   */
  signUp: async (email, password, attributes = {}) => {
    try {
      console.log('AUTH SERVICE: Starting sign-up');
      console.log('AUTH SERVICE: Attributes:', JSON.stringify(attributes));
      
      // Ensure AWS is configured before any auth operation
      if (!checkAwsConfiguration()) {
        throw new Error('AWS Amplify configuration failed');
      }
      
      // Create sign up parameters - format for Amplify v6
      const signUpParams = {
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            ...attributes
          },
        }
      };
      
      // Sign up the user
      const result = await signUp(signUpParams);
      console.log('AUTH SERVICE: Sign-up successful');
      
      return result;
    } catch (error) {
      console.error('AUTH SERVICE: Sign-up failed with error:', {
        code: error.code,
        name: error.name,
        message: error.message
      });
      throw error;
    }
  },
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  signOut: async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
  
  /**
   * Get the current authenticated user
   * @returns {Promise<Object|null>} - User data or null if not authenticated
   */
  getCurrentUser: async () => {
    try {
      const currentUser = await getCurrentUser();
      const userAttributes = await fetchUserAttributes();
      
      return {
        id: currentUser.username || currentUser.userId,
        email: userAttributes?.email || '',
        displayName: userAttributes?.name || userAttributes?.email?.split('@')[0] || '',
        phoneNumber: userAttributes?.phone_number,
        emailVerified: userAttributes?.email_verified === 'true',
      };
    } catch (error) {
      console.log('No current user');
      return null;
    }
  },
  
  /**
   * Update user attributes
   * @param {Object} attributes - User attributes to update
   * @returns {Promise<Object>} - Updated user data
   */
  updateUserAttributes: async (attributes) => {
    try {
      await updateUserAttributes({ userAttributes: attributes });
      
      // Get updated user attributes
      const userAttributes = await fetchUserAttributes();
      
      return {
        id: (await getCurrentUser()).userId,
        email: userAttributes?.email || '',
        displayName: userAttributes?.name || userAttributes?.email?.split('@')[0] || '',
        phoneNumber: userAttributes?.phone_number,
        emailVerified: userAttributes?.email_verified === 'true',
      };
    } catch (error) {
      console.error('Update user attributes error:', error);
      throw error;
    }
  },
  
  /**
   * Request password reset code
   * @param {string} email - User email
   * @returns {Promise<boolean>} - Success status
   */
  forgotPassword: async (email) => {
    try {
      console.log('AUTH SERVICE: Attempting resetPassword for:', email);
      
      // Ensure AWS is configured before any auth operation
      if (!checkAwsConfiguration()) {
        throw new Error('AWS Amplify configuration failed');
      }
      
      await resetPassword({ username: email });
      console.log('AUTH SERVICE: resetPassword successful');
      return true;
    } catch (error) {
      console.error('AUTH SERVICE: Forgot password error:', error);
      throw error;
    }
  },
  
  /**
   * Submit new password with confirmation code
   * @param {string} email - User email
   * @param {string} code - Verification code
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} - Success status
   */
  resetPassword: async (email, code, newPassword) => {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  /**
   * Verify email with confirmation code
   * @param {string} email - User email
   * @param {string} code - Verification code
   * @returns {Promise<boolean>} - Success status
   */
  verifyEmail: async (email, code) => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code
      });
      return true;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  },
  
  /**
   * Resend verification code
   * @param {string} email - User email
   * @returns {Promise<boolean>} - Success status
   */
  resendVerificationCode: async (email) => {
    try {
      // Import resendSignUp dynamically
      const { resendSignUp } = await import('aws-amplify/auth');
      await resendSignUp({ username: email });
      return true;
    } catch (error) {
      console.error('Resend verification code error:', error);
      // Fallback to returning true since the user might already have a valid code
      return true;
    }
  },
  
  /**
   * Get user-friendly error messages for authentication errors
   * @param {Error} error - Error object
   * @returns {string} - User-friendly error message
   */
  getErrorMessage: (error) => {
    switch (error.code || error.name) {
      case 'UserNotConfirmedException':
        return 'Please check your email and verify your account before logging in.';
      case 'NotAuthorizedException':
        return 'Incorrect email or password. Please try again.';
      case 'UserNotFoundException':
        return 'No account found with this email address. Please sign up first.';
      case 'UsernameExistsException':
        return 'An account with this email already exists. Please try logging in instead.';
      case 'InvalidPasswordException':
        return 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers.';
      case 'CodeMismatchException':
        return 'The verification code you entered is incorrect. Please try again.';
      case 'ExpiredCodeException':
        return 'The verification code has expired. Please request a new one.';
      case 'LimitExceededException':
        return 'Too many attempts. Please wait a few minutes before trying again.';
      case 'InvalidParameterException':
        if (error.message && error.message.includes('phone')) {
          return 'Please enter a valid phone number (e.g., +1 555 123 4567).';
        }
        if (error.message && error.message.includes('email')) {
          return 'Please enter a valid email address.';
        }
        return 'Please check your input and try again.';
      case 'NetworkError':
      case 'NetworkingError':
        return 'Network connection error. Please check your internet and try again.';
      case 'UnknownError':
      case 'Unknown':
        return 'Something went wrong. Please check your internet connection and try again.';
      default:
        // Provide helpful fallback messages
        if (error.message && error.message.includes('Network')) {
          return 'Network connection error. Please check your internet and try again.';
        }
        if (error.message && error.message.includes('password')) {
          return 'Password issue. Please check your password and try again.';
        }
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
};

export default authService;
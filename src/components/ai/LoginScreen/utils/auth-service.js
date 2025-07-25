// src/components/ai/LoginScreen/utils/auth-service.js
// UPDATED: Direct imports from aws-amplify/auth

// Import directly from aws-amplify/auth
import { 
  signIn, 
  signUp, 
  signOut, 
  confirmSignUp, 
  forgotPassword, 
  forgotPasswordSubmit,
  fetchUserAttributes, 
  getCurrentUser, 
  updateUserAttributes 
} from 'aws-amplify/auth';

// Added debug logging
console.log('AUTH SERVICE LOADED - Using direct auth imports');

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
        message: error.message
      });
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
      await forgotPassword({ username: email });
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
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
      await forgotPasswordSubmit({
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
   * Get the error message for a specific error code
   * @param {Error} error - Error object
   * @returns {string} - User-friendly error message
   */
  getErrorMessage: (error) => {
    switch (error.code) {
      case 'UserNotConfirmedException':
        return 'Please verify your email before logging in';
      case 'NotAuthorizedException':
        return 'Incorrect username or password';
      case 'UserNotFoundException':
        return 'No account found with this email';
      case 'UsernameExistsException':
        return 'An account with this email already exists';
      case 'InvalidPasswordException':
        return 'Password does not meet requirements';
      case 'CodeMismatchException':
        return 'Invalid verification code';
      case 'ExpiredCodeException':
        return 'Verification code has expired';
      case 'LimitExceededException':
        return 'Too many attempts. Please try again later';
      case 'InvalidParameterException':
        if (error.message.includes('phone')) {
          return 'Please enter a valid phone number with country code (e.g., +1234567890)';
        }
        return error.message || 'Invalid parameter. Please check your input.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }
};

export default authService;
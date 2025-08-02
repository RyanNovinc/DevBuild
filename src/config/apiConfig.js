// src/config/apiConfig.js

// Add your API key here
export const API_KEY = '8kfP8e5Xyl4vKEh2DXq8D9HvJTl3TVDA8JDxzdfy'; // Updated API key

// Base URL for API endpoints - UPDATED to the new Lambda API Gateway
export const API_BASE_URL = 'https://xcsa7nze89.execute-api.ap-southeast-2.amazonaws.com/dev';

// You can add more configuration values here
export const API_TIMEOUT = 30000; // 30 seconds
export const API_VERSION = 'v1';

// Add upload timeout for file operations
export const UPLOAD_TIMEOUT = 120000; // 2 minutes for file uploads

// Optional: Environment-specific configurations
const ENV = {
  development: {
    // Development-specific values
  },
  production: {
    // Production-specific values
  }
};

// Determine current environment (if __DEV__ is available in your React Native setup)
const currentEnv = typeof __DEV__ !== 'undefined' && __DEV__ ? 'development' : 'production';

// Export environment-specific config
export const ENV_CONFIG = ENV[currentEnv];

// Export other API-related constants as needed
export const MAX_RETRIES = 3;
export const RETRY_DELAY = 1000; // ms

// Add error messages for better error handling
export const ERROR_MESSAGES = {
  network: 'Network error. Please check your internet connection and try again.',
  timeout: 'Request timed out. Please try again later.',
  server: 'Server error occurred. Our team has been notified.',
  unauthorized: 'Your session has expired. Please log in again.',
  forbidden: 'You don\'t have permission to access this resource.',
  notFound: 'The requested resource was not found.',
  default: 'An error occurred. Please try again later.'
};

// Add utility functions for API operations
export const apiUtils = {
  /**
   * Format an API error response
   * @param {Error|Response} error - Error object
   * @returns {Object} Formatted error object
   */
  formatError: (error) => {
    // Network error
    if (!error.status && error.message?.includes('Network request failed')) {
      return {
        message: ERROR_MESSAGES.network,
        code: 'NETWORK_ERROR',
        original: error
      };
    }
    
    // Timeout error
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        message: ERROR_MESSAGES.timeout,
        code: 'TIMEOUT_ERROR',
        original: error
      };
    }
    
    // HTTP error with status
    const status = error.status || error.response?.status;
    if (status) {
      switch (status) {
        case 401:
          return {
            message: ERROR_MESSAGES.unauthorized,
            code: 'UNAUTHORIZED',
            status,
            original: error
          };
        case 403:
          return {
            message: ERROR_MESSAGES.forbidden,
            code: 'FORBIDDEN',
            status,
            original: error
          };
        case 404:
          return {
            message: ERROR_MESSAGES.notFound,
            code: 'NOT_FOUND',
            status,
            original: error
          };
        default:
          return {
            message: error.message || ERROR_MESSAGES.default,
            code: 'API_ERROR',
            status,
            original: error
          };
      }
    }
    
    // Default error
    return {
      message: error.message || ERROR_MESSAGES.default,
      code: 'UNKNOWN_ERROR',
      original: error
    };
  }
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  API_VERSION,
  UPLOAD_TIMEOUT,
  MAX_RETRIES,
  RETRY_DELAY,
  ERROR_MESSAGES,
  apiUtils,
  API_KEY // Make sure to export the API key here
};
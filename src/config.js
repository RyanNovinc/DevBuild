// src/config.js - Configuration settings for the LifeCompass App
// Contains all the environment-specific configuration

// Determine environment - you can adjust based on how you set this up
const ENV = {
  dev: {
    // Use your Lambda endpoint for development
    AI_API_URL: 'https://4dwonpal1a.execute-api.ap-southeast-2.amazonaws.com/prod/claude-proxy',
    
    // Other development configurations
    STORAGE_PREFIX: 'dev_lifecompass_',
    LOG_LEVEL: 'debug',
    
    // Default AI settings
    DEFAULT_AI_STYLE: 'default',
    DEFAULT_AI_VERBOSITY: 'medium',
    DEFAULT_DETECT_ACTIONS: true,
  },
  
  prod: {
    // Production Lambda endpoint 
    AI_API_URL: 'https://4dwonpal1a.execute-api.ap-southeast-2.amazonaws.com/prod/claude-proxy',
    
    // Other production configurations
    STORAGE_PREFIX: 'lifecompass_',
    LOG_LEVEL: 'error',
    
    // Default AI settings
    DEFAULT_AI_STYLE: 'default',
    DEFAULT_AI_VERBOSITY: 'low',
    DEFAULT_DETECT_ACTIONS: true,
  }
};

// Determine which environment to use
// You can implement a more sophisticated detection mechanism if needed
const determineEnvironment = () => {
  // In a real app, you might check for specific build flags or use process.env
  return __DEV__ ? 'dev' : 'prod';
};

// Export the appropriate configuration
const currentEnv = determineEnvironment();
const config = ENV[currentEnv];

// Add environment name to the config
config.ENV_NAME = currentEnv;

export default config;
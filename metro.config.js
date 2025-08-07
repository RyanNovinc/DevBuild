// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add .lottie extension to asset extensions
config.resolver.assetExts.push('lottie');

// Disable package.json:exports feature which is causing the issue with Supabase and Expo SDK 53
config.resolver.unstable_enablePackageExports = false;

// Exclude Lambda function files and AWS directory from Metro bundler
config.resolver.blockList = [
  /lambda-functions\/.*/, // Lambda functions directory  
  /aws\/.*/, // AWS directory
  /enhanced-.*\.js$/, // Any enhanced-*.js files in root
];

module.exports = config;
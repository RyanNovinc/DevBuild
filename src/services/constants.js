// src/services/constants.js
// Constants for DocumentProcessingService

// Storage keys
export const USER_KNOWLEDGE_KEY = 'userKnowledgeFiles';
export const USER_KNOWLEDGE_ENABLED_KEY = 'userKnowledgeEnabled';
export const SUBSCRIPTION_STATUS_KEY = 'subscriptionStatus';
export const AI_PLAN_KEY = 'aiPlan';  // For tracking which AI plan is selected

// File limits
export const MAX_FILE_SIZE_MB = 2; // Maximum file size in MB

// Storage quota - same for all tiers
export const STORAGE_QUOTAS = {
  'free': 3,        // Free tier: 3MB
  'starter': 3,     // Guide tier: 3MB
  'professional': 3, // Navigator tier: 3MB
  'business': 3,    // Compass tier: 3MB
  'founding': 3     // Founder's tier: 3MB
};

// Updated to include all OpenAI supported file types
// Source: https://platform.openai.com/docs/assistants/tools/file-search
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Additional OpenAI supported types
  'text/markdown',
  'text/x-markdown',
  'application/rtf',
  'application/vnd.oasis.opendocument.text'
];

// Helper function to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to calculate string size in bytes
export const calculateJsonSize = (obj) => {
  if (!obj) return 0;
  return new TextEncoder().encode(JSON.stringify(obj)).length;
};
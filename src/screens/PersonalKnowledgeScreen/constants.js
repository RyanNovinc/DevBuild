// src/screens/PersonalKnowledgeScreen/constants.js

// Storage keys
export const USER_KNOWLEDGE_KEY = 'userKnowledgeFiles';
export const USER_KNOWLEDGE_ENABLED_KEY = 'userKnowledgeEnabled';
export const SUBSCRIPTION_STATUS_KEY = 'subscriptionStatus';
export const AI_PLAN_KEY = 'aiPlan';

// File size limit for uploads
export const MAX_FILE_SIZE_MB = 5;

// STORAGE QUOTA SETTINGS
// Single source of truth for storage quota - 30KB
export const STORAGE_QUOTA_KB = 30;
export const STORAGE_QUOTA_BYTES = STORAGE_QUOTA_KB * 1024;

// Storage quotas in KB for all tiers (all use the same 30KB limit)
export const STORAGE_QUOTAS = {
  'free': STORAGE_QUOTA_KB,
  'starter': STORAGE_QUOTA_KB,
  'professional': STORAGE_QUOTA_KB,
  'business': STORAGE_QUOTA_KB,
  'founding': STORAGE_QUOTA_KB
};

// Supported file types
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'application/json',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
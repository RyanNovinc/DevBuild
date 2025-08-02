// src/services/DocumentService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { API_BASE_URL, API_KEY } from '../config/apiConfig';
import AppSummaryService, { APP_CONTEXT_DOCUMENT_ID, APP_CONTEXT_DOCUMENT_NAME } from './AppSummaryService';

// Import storage quota from constants - SINGLE SOURCE OF TRUTH
import { STORAGE_QUOTA_BYTES } from '../screens/PersonalKnowledgeScreen/constants';

// Storage keys
const DOCUMENTS_STORAGE_KEY = 'userKnowledgeFiles';
const USER_ID_KEY = 'userId';
const PROCESSED_DOCUMENTS_STORAGE_KEY = 'processedDocumentsContent';
const DOCUMENT_CONTENT_PREFIX = 'doc_content_';

/**
 * Service for managing document files and context
 */
class DocumentService {
  constructor() {
    this.lambdaEndpoint = API_BASE_URL;
    console.log('DocumentService initialized with endpoint:', this.lambdaEndpoint);
    console.log('Storage quota set to:', STORAGE_QUOTA_BYTES / 1024, 'KB');
  }

  /**
   * Get user ID from AsyncStorage
   * @returns {Promise<string>} The user ID
   */
  async getUserId() {
    try {
      let userId = await AsyncStorage.getItem(USER_ID_KEY);
      
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await AsyncStorage.setItem(USER_ID_KEY, userId);
      }
      
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return `temp_user_${Date.now()}`;
    }
  }

  /**
   * Get all documents
   * @returns {Promise<Array>} Array of document objects
   */
  async getDocuments() {
    try {
      const docsStr = await AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY);
      if (!docsStr) {
        console.log('[DocumentService] No documents found in storage');
        return [];
      }
      
      const docs = JSON.parse(docsStr);
      
      // Check for system document
      const hasSystemDoc = docs.some(doc => doc.id === APP_CONTEXT_DOCUMENT_ID);
      console.log(`[DocumentService] Documents loaded: ${docs.length}, system document present: ${hasSystemDoc}`);
      
      // Log completed documents count
      const completedDocs = docs.filter(doc => 
        !doc.isProcessing && 
        doc.status === 'completed' && 
        doc.openaiFileId
      );
      
      console.log(`Found ${completedDocs.length} completed documents out of ${docs.length} total`);
      
      return docs;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
    }
  }

  /**
   * Save documents list to storage
   * @param {Array} documents - Array of document objects
   * @returns {Promise<boolean>} Whether save was successful
   */
  async saveDocuments(documents) {
    try {
      // Check for system document
      const hasSystemDoc = documents.some(doc => doc.id === APP_CONTEXT_DOCUMENT_ID);
      console.log(`[DocumentService] Saving ${documents.length} documents, system document present: ${hasSystemDoc}`);
      
      const jsonStr = JSON.stringify(documents);
      await AsyncStorage.setItem(DOCUMENTS_STORAGE_KEY, jsonStr);
      return true;
    } catch (error) {
      console.error('Error saving documents:', error);
      return false;
    }
  }

  /**
   * Get a document by ID
   * @param {string} documentId - The document ID
   * @returns {Promise<Object|null>} The document object or null if not found
   */
  async getDocumentById(documentId) {
    try {
      if (!documentId) return null;
      
      const docsStr = await AsyncStorage.getItem(DOCUMENTS_STORAGE_KEY);
      if (!docsStr) return null;
      
      const docs = JSON.parse(docsStr);
      const doc = docs.find(doc => doc.id === documentId);
      
      if (doc && doc.id === APP_CONTEXT_DOCUMENT_ID) {
        console.log('[DocumentService] System document retrieved by ID');
      }
      
      return doc || null;
    } catch (error) {
      console.error('Error getting document by ID:', error);
      return null;
    }
  }

  /**
   * Get processed document content by document ID
   * @param {string} documentId - The document ID
   * @returns {Promise<string|null>} The processed document content or null if not found
   */
  async getProcessedDocumentContent(documentId) {
    try {
      if (!documentId) return null;
      
      // Special handling for system document
      if (documentId === APP_CONTEXT_DOCUMENT_ID) {
        console.log('[DocumentService] Getting system document content');
        const doc = await this.getDocumentById(APP_CONTEXT_DOCUMENT_ID);
        
        if (doc?.content) {
          console.log('[DocumentService] System document content found in document object');
          return doc.content;
        } else {
          console.log('[DocumentService] System document found but content missing');
        }
      }
      
      // Try getting from direct storage first (more reliable)
      const directKey = `${DOCUMENT_CONTENT_PREFIX}${documentId}`;
      const directContent = await AsyncStorage.getItem(directKey);
      
      if (directContent) {
        return directContent;
      }
      
      // Fall back to main storage approach
      const processedContentsStr = await AsyncStorage.getItem(PROCESSED_DOCUMENTS_STORAGE_KEY);
      if (processedContentsStr) {
        try {
          const processedContents = JSON.parse(processedContentsStr);
          return processedContents[documentId] || null;
        } catch (parseError) {
          console.error('Error parsing processed contents:', parseError);
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting processed document content:', error);
      return null;
    }
  }
  
  /**
   * Get the size of a specific document's processed content
   * @param {string} documentId - The document ID
   * @returns {Promise<number>} Size in bytes
   */
  async getDocumentContentSize(documentId) {
    try {
      const content = await this.getProcessedDocumentContent(documentId);
      return content ? content.length * 2 : 0; // 2 bytes per character in JavaScript
    } catch (error) {
      console.error('Error getting document content size:', error);
      return 0;
    }
  }

  /**
   * Save processed document content using multiple storage approaches for reliability
   * @param {string} documentId - The document ID
   * @param {string} content - The processed content
   * @returns {Promise<boolean>} Whether save was successful
   */
  async saveProcessedDocumentContent(documentId, content) {
    try {
      if (!documentId || content === undefined) {
        return false;
      }
      
      // Log for system document
      if (documentId === APP_CONTEXT_DOCUMENT_ID) {
        console.log(`[DocumentService] Saving system document content (${content.length} chars)`);
      }
      
      // Always save with direct key approach first (most reliable)
      const directKey = `${DOCUMENT_CONTENT_PREFIX}${documentId}`;
      await AsyncStorage.setItem(directKey, content);
      
      // Also update the combined storage for backwards compatibility
      try {
        // Get existing content object
        const processedContentsStr = await AsyncStorage.getItem(PROCESSED_DOCUMENTS_STORAGE_KEY);
        const processedContents = processedContentsStr ? JSON.parse(processedContentsStr) : {};
        
        // Add the new content
        processedContents[documentId] = content;
        
        // Save back to storage
        await AsyncStorage.setItem(PROCESSED_DOCUMENTS_STORAGE_KEY, JSON.stringify(processedContents));
      } catch (combinedError) {
        console.error('Error updating combined storage:', combinedError);
        // Direct storage already succeeded, so consider this a success
      }
      
      return true;
    } catch (error) {
      console.error('Error saving processed document content:', error);
      return false;
    }
  }

  /**
   * Get all processed document contents
   * @returns {Promise<Object>} Object mapping document IDs to processed contents
   */
  async getAllProcessedDocumentContents() {
    try {
      // Start with contents from combined storage
      const processedContentsStr = await AsyncStorage.getItem(PROCESSED_DOCUMENTS_STORAGE_KEY);
      let processedContents = {};
      
      if (processedContentsStr) {
        try {
          processedContents = JSON.parse(processedContentsStr);
        } catch (parseError) {
          console.error('Error parsing processed contents:', parseError);
        }
      }
      
      // Get completed documents to check for direct storage items
      const documents = await this.getDocuments();
      const completedDocs = documents.filter(doc => 
        !doc.isProcessing && 
        doc.status === 'completed' && 
        doc.openaiFileId
      );
      
      // Add any items from direct storage that aren't in combined storage
      for (const doc of completedDocs) {
        if (!processedContents[doc.id]) {
          const directKey = `${DOCUMENT_CONTENT_PREFIX}${doc.id}`;
          const directContent = await AsyncStorage.getItem(directKey);
          
          if (directContent) {
            processedContents[doc.id] = directContent;
          }
        }
      }
      
      return processedContents;
    } catch (error) {
      console.error('Error getting all processed document contents:', error);
      return {};
    }
  }

  /**
   * Remove processed document content
   * @param {string} documentId - The document ID
   * @returns {Promise<boolean>} Whether removal was successful
   */
  async removeProcessedDocumentContent(documentId) {
    try {
      if (!documentId) return false;
      
      // Prevent removing system document content
      if (documentId === APP_CONTEXT_DOCUMENT_ID) {
        console.warn('[DocumentService] Attempted to remove system document content, operation prevented');
        return false;
      }
      
      // Remove from direct storage
      const directKey = `${DOCUMENT_CONTENT_PREFIX}${documentId}`;
      await AsyncStorage.removeItem(directKey);
      
      // Also remove from combined storage
      const processedContentsStr = await AsyncStorage.getItem(PROCESSED_DOCUMENTS_STORAGE_KEY);
      if (processedContentsStr) {
        try {
          const processedContents = JSON.parse(processedContentsStr);
          delete processedContents[documentId];
          await AsyncStorage.setItem(PROCESSED_DOCUMENTS_STORAGE_KEY, JSON.stringify(processedContents));
        } catch (error) {
          console.error('Error updating combined storage during removal:', error);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error removing processed document content:', error);
      return false;
    }
  }

  /**
   * Calculate total storage used by processed documents
   * @returns {Promise<number>} Size in bytes
   */
  async getStorageUsage() {
    try {
      // Get completed documents
      const documents = await this.getDocuments();
      const completedDocs = documents.filter(doc => 
        !doc.isProcessing && 
        doc.status === 'completed' && 
        doc.openaiFileId
      );
      
      if (completedDocs.length === 0) {
        console.log('No completed documents found for storage calculation');
        return 0;
      }
      
      // Calculate total size by directly summing the document sizes
      let totalBytes = 0;
      
      // Debug each document's size properties
      for (const doc of completedDocs) {
        // Log each document to debug
        console.log(`Document ${doc.name}: `, {
          size: doc.size,
          processedSize: doc.processedSize,
          sizeKB: doc.size / 1024,
          processedSizeKB: doc.processedSize / 1024
        });
        
        // Add size to total (prioritize processedSize if available)
        if (doc.processedSize && typeof doc.processedSize === 'number') {
          totalBytes += doc.processedSize;
        } else if (doc.size && typeof doc.size === 'number') {
          totalBytes += doc.size;
        }
      }
      
      console.log(`Total storage calculated: ${totalBytes} bytes (${(totalBytes / 1024).toFixed(2)}KB)`);
      
      return totalBytes;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return 0;
    }
  }

  /**
   * Check if adding content would exceed storage quota
   * @param {string} content - Content to add
   * @returns {Promise<{wouldExceed: boolean, currentUsage: number, contentSize: number, availableSpace: number, quotaBytes: number}>} Quota check results
   */
  async wouldExceedQuota(content) {
    try {
      if (!content) {
        return { 
          wouldExceed: false, 
          currentUsage: 0, 
          contentSize: 0, 
          availableSpace: STORAGE_QUOTA_BYTES,
          quotaBytes: STORAGE_QUOTA_BYTES
        };
      }
      
      const currentUsage = await this.getStorageUsage();
      const contentSize = content.length * 2; // Size in bytes
      const availableSpace = STORAGE_QUOTA_BYTES - currentUsage;
      const wouldExceed = (currentUsage + contentSize) > STORAGE_QUOTA_BYTES;
      
      return { 
        wouldExceed, 
        currentUsage, 
        contentSize, 
        availableSpace,
        quotaBytes: STORAGE_QUOTA_BYTES
      };
    } catch (error) {
      console.error('Error checking storage quota:', error);
      // Assume it would exceed to be safe
      return { 
        wouldExceed: true, 
        currentUsage: 0, 
        contentSize: 0, 
        availableSpace: 0,
        quotaBytes: STORAGE_QUOTA_BYTES,
        error: error.message
      };
    }
  }

  /**
   * Get storage quota in bytes
   * @returns {number} Storage quota in bytes
   */
  getStorageQuotaBytes() {
    return STORAGE_QUOTA_BYTES;
  }

  /**
   * Create or update the app context system document
   * @param {string} appSummary - App summary text to store
   * @returns {Promise<Object>} - Created or updated document
   */
  async updateAppContextDocument(appSummary) {
    try {
      console.log('[DocumentService] Starting app context document update');
      
      // Get existing documents
      const documents = await this.getDocuments();
      
      // Check if system document already exists
      const existingDocIndex = documents.findIndex(doc => doc.id === APP_CONTEXT_DOCUMENT_ID);
      console.log(`[DocumentService] System document exists: ${existingDocIndex >= 0}`);
      
      // Create the system document object
      const systemDoc = AppSummaryService.createSystemDocument(appSummary);
      
      // Preserve original creation date if document already exists
      if (existingDocIndex >= 0) {
        systemDoc.dateAdded = documents[existingDocIndex].dateAdded;
      }
      
      let updatedDocuments;
      if (existingDocIndex >= 0) {
        // Update existing document
        updatedDocuments = [...documents];
        updatedDocuments[existingDocIndex] = systemDoc;
        console.log('[DocumentService] Updated existing system document');
      } else {
        // Add new document
        updatedDocuments = [...documents, systemDoc];
        console.log('[DocumentService] Created new system document');
      }
      
      // Log the system document content length
      console.log(`[DocumentService] System document content length: ${appSummary.length} chars`);
      
      // Save updated documents list
      await this.saveDocuments(updatedDocuments);
      
      // Also store the content separately using our existing method
      await this.saveProcessedDocumentContent(APP_CONTEXT_DOCUMENT_ID, appSummary);
      
      // Double-check document was saved properly
      const savedDocuments = await this.getDocuments();
      const systemDocExists = savedDocuments.some(doc => doc.id === APP_CONTEXT_DOCUMENT_ID);
      console.log(`[DocumentService] Verification: system document exists after save: ${systemDocExists}`);
      
      console.log('[DocumentService] App context document updated successfully');
      return systemDoc;
    } catch (error) {
      console.error('[DocumentService] Error updating app context document:', error);
      throw error;
    }
  }

  /**
   * Upload a document to the server and process it
   * @param {Object} file - The file object to upload
   * @returns {Promise<Object>} The upload result
   */
  async uploadDocument(file) {
    try {
      console.log('Uploading document:', file.name);
      
      // Get user ID for authentication
      const userId = await this.getUserId();
      
      // Read file as base64
      const base64Content = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Create request body
      const requestBody = {
        fileName: file.name,
        fileType: file.mimeType || this.inferMimeType(file.name),
        fileContent: base64Content
      };
      
      // Set timeout for fetch - 3 minutes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180000);
      
      try {
        // Call Lambda API for document processing
        const response = await fetch(`${this.lambdaEndpoint}/process-document`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': userId,
            'X-Api-Key': API_KEY
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            const errorText = await response.text();
            errorData = { error: errorText };
          }
          
          throw new Error(`Upload failed (${response.status}): ${errorData.error || 'Unknown error'}`);
        }
        
        const result = await response.json();
        
        // Check if there's enough space for the processed text
        const processedTextSize = result.processedText ? result.processedText.length * 2 : 0;
        const quotaCheck = await this.wouldExceedQuota(result.processedText);
        
        if (quotaCheck.wouldExceed) {
          throw new Error(`Adding this document would exceed your storage quota of ${(STORAGE_QUOTA_BYTES / 1024).toFixed(1)}KB.`);
        }
        
        // Create a new document object with a unique ID
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Save the processed text content
        await this.saveProcessedDocumentContent(documentId, result.processedText);
        
        // Create the document record
        const newDocument = {
          id: documentId,
          name: file.name,
          type: file.mimeType || this.inferMimeType(file.name),
          status: 'completed',
          openaiFileId: documentId,
          isProcessing: false,
          size: file.size,
          originalSize: result.originalSize,
          processedSize: result.processedText ? result.processedText.length * 2 : 0, // Store in bytes
          uri: file.uri,
          createdAt: new Date().toISOString()
        };

        // Add to documents list
        const documents = await this.getDocuments();
        documents.push(newDocument);
        await this.saveDocuments(documents);
        
        return {
          success: true,
          fileId: documentId,
          processedText: result.processedText,
          originalSize: result.originalSize,
          processedSize: processedTextSize
        };
      } catch (error) {
        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
        
        // Check if the error was caused by the timeout
        if (error.name === 'AbortError') {
          throw new Error('The request took too long to complete. Try a smaller document or try again later.');
        }
        
        throw error;
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Retry uploading a document
   * @param {Object} document - The document to retry
   * @returns {Promise<Object>} The retry result
   */
  async retryUpload(document) {
    try {
      console.log('Retrying upload for document:', document.name);
      
      // Check if the file exists
      const fileInfo = await FileSystem.getInfoAsync(document.uri);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at ${document.uri}`);
      }
      
      // Get user ID for authentication
      const userId = await this.getUserId();
      
      // Read file as base64
      const base64Content = await FileSystem.readAsStringAsync(document.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Call Lambda API for document processing
      const response = await fetch(`${this.lambdaEndpoint}/process-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
          'X-Api-Key': API_KEY
        },
        body: JSON.stringify({
          fileName: document.name,
          fileType: document.type,
          fileContent: base64Content
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Retry failed (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      
      // Check quota
      const existingContent = await this.getProcessedDocumentContent(document.id);
      const existingSize = existingContent ? existingContent.length * 2 : 0;
      const newSize = result.processedText ? result.processedText.length * 2 : 0;
      
      if (newSize > existingSize) {
        const currentUsage = await this.getStorageUsage();
        const adjustedUsage = currentUsage - existingSize;
        
        if ((adjustedUsage + newSize) > STORAGE_QUOTA_BYTES) {
          throw new Error(`Updated document would exceed your storage quota of ${(STORAGE_QUOTA_BYTES / 1024).toFixed(1)}KB.`);
        }
      }
      
      // Save the processed content
      await this.saveProcessedDocumentContent(document.id, result.processedText);
      
      // Update the document record
      const documents = await this.getDocuments();
      const updatedDocuments = documents.map(doc => {
        if (doc.id === document.id) {
          return {
            ...doc,
            status: 'completed',
            openaiFileId: document.id,
            isProcessing: false,
            openaiUploadError: false,
            openaiErrorMessage: null,
            originalSize: result.originalSize,
            processedSize: result.processedText ? result.processedText.length * 2 : 0, // Store in bytes
            updatedAt: new Date().toISOString()
          };
        }
        return doc;
      });
      
      await this.saveDocuments(updatedDocuments);
      
      return {
        success: true,
        fileId: document.id,
        processedText: result.processedText,
        originalSize: result.originalSize,
        processedSize: result.processedText ? result.processedText.length * 2 : 0
      };
    } catch (error) {
      console.error('Error retrying upload:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a document
   * @param {string} documentId - The document ID to delete
   * @returns {Promise<boolean>} Whether the deletion was successful
   */
  async deleteDocument(documentId) {
    try {
      console.log('Deleting document:', documentId);
      
      // Prevent deletion of system document
      if (documentId === APP_CONTEXT_DOCUMENT_ID) {
        console.warn('[DocumentService] Attempted to delete system document, operation prevented');
        return false;
      }
      
      // Get the document
      const document = await this.getDocumentById(documentId);
      if (!document) {
        return false;
      }
      
      // Remove the processed content
      await this.removeProcessedDocumentContent(documentId);
      
      // Remove from documents list
      const documents = await this.getDocuments();
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      await this.saveDocuments(updatedDocuments);
      
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Get document context for AI processing
   * @param {number} maxSize - Maximum size in characters (default: 100000)
   * @returns {Promise<string>} Combined document context
   */
  async getDocumentContextForAI(maxSize = 100000) {
    try {
      // Get all documents
      const documents = await this.getDocuments();
      
      // Only include completed documents that aren't processing
      const completedDocs = documents.filter(doc => 
        !doc.isProcessing && 
        doc.status === 'completed' && 
        doc.openaiFileId
      );
      
      console.log(`Found ${completedDocs.length} completed documents for context`);
      
      if (completedDocs.length === 0) {
        return '';
      }
      
      // Get all processed document contents
      const processedContents = await this.getAllProcessedDocumentContents();
      
      // Build context with document names and content
      let context = "User Document Context:\n\n";
      let totalSize = context.length;
      
      // Prioritize the app context summary document to always include it first
      const appContextDoc = completedDocs.find(doc => doc.id === APP_CONTEXT_DOCUMENT_ID);
      const otherDocs = completedDocs.filter(doc => doc.id !== APP_CONTEXT_DOCUMENT_ID);
      
      // Order documents with app context first, then other documents
      const orderedDocs = appContextDoc ? [appContextDoc, ...otherDocs] : otherDocs;
      
      for (const doc of orderedDocs) {
        const docContent = processedContents[doc.id];
        
        if (!docContent) {
          console.log(`No content found for document ${doc.id} (${doc.name})`);
          continue;
        }
        
        // Calculate size with this document
        const docHeader = `--- DOCUMENT: ${doc.name} ---\n`;
        const docFooter = "\n---END DOCUMENT---\n\n";
        const docFullSize = docHeader.length + docContent.length + docFooter.length;
        
        // Check if adding this document would exceed the max size
        if (totalSize + docFullSize > maxSize) {
          // If this is the first document, include a truncated version
          if (totalSize === context.length) {
            const availableSize = maxSize - context.length - docHeader.length - docFooter.length;
            const truncatedContent = docContent.substring(0, availableSize);
            context += docHeader + truncatedContent + docFooter;
            console.log(`Added truncated document ${doc.name}, size: ${truncatedContent.length} chars`);
          } else {
            console.log(`Skipping document ${doc.name} due to size limit`);
          }
          break;
        }
        
        // Add document to context
        context += docHeader + docContent + docFooter;
        totalSize += docFullSize;
        console.log(`Added document ${doc.name} to context, size: ${docContent.length} chars`);
      }
      
      console.log(`Total document context size: ${totalSize} chars`);
      
      // If context is empty or suspiciously small, use fallback
      if (totalSize < 50) {
        console.log('Context too small, using fallback');
        return "User Document Context:\n\n--- DOCUMENT: FALLBACK ---\nNo document content available.\n---END DOCUMENT---\n\n";
      }
      
      return context;
    } catch (error) {
      console.error('Error getting document context for AI:', error);
      
      // Return a minimal fallback context to prevent errors
      return "User Document Context:\n\n--- DOCUMENT: ERROR ---\nError retrieving document content.\n---END DOCUMENT---\n\n";
    }
  }

  /**
   * Infer the MIME type from a file name
   * @param {string} fileName - The file name
   * @returns {string} The inferred MIME type
   */
  inferMimeType(fileName) {
    if (!fileName) return 'application/octet-stream';
    
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      case 'md':
      case 'markdown':
        return 'text/markdown';
      case 'csv':
        return 'text/csv';
      case 'json':
        return 'application/json';
      case 'xls':
        return 'application/vnd.ms-excel';
      case 'xlsx':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default:
        return 'application/octet-stream';
    }
  }
}

// Create and export a singleton instance
export default new DocumentService();
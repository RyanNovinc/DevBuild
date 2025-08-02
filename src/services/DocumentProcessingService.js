// src/services/DocumentProcessingService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import assistantService from './AssistantService';
import { API_BASE_URL } from '../config/apiConfig';

// Storage keys
export const USER_KNOWLEDGE_KEY = 'userKnowledgeFiles';
const USER_ID_KEY = 'userId'; // Added for storing the user ID

/**
 * Service for processing and managing document files
 */
class DocumentProcessingService {
  constructor() {
    this.lambdaEndpoint = `${API_BASE_URL}/claude-proxy/process-document`;
    console.log('DocumentProcessingService initialized with endpoint:', this.lambdaEndpoint);
  }

  /**
   * Get user ID from AsyncStorage
   * @returns {Promise<string|null>} The user ID or null if not found
   */
  async getUserId() {
    try {
      // Try to get from AsyncStorage
      const userId = await AsyncStorage.getItem(USER_ID_KEY);
      
      // If no user ID found, generate a temporary one
      if (!userId) {
        const tempId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log(`No user ID found, using temporary ID: ${tempId}`);
        await AsyncStorage.setItem(USER_ID_KEY, tempId);
        return tempId;
      }
      
      return userId;
    } catch (error) {
      console.error('Error getting user ID:', error);
      // Return a temporary user ID in case of error
      return `temp_user_${Date.now()}`;
    }
  }

  /**
   * Helper method to determine if a file is a PDF
   * @param {Object} file - The file object
   * @returns {boolean} Whether the file is a PDF
   */
  isPdf(file) {
    if (!file) return false;
    const mimeType = file.mimeType || '';
    const name = file.name || '';
    return mimeType.includes('pdf') || name.toLowerCase().endsWith('.pdf');
  }

  /**
   * Helper method to determine if a file is a Word document
   * @param {Object} file - The file object
   * @returns {boolean} Whether the file is a Word document
   */
  isWordDocument(file) {
    if (!file) return false;
    const mimeType = file.mimeType || '';
    const name = file.name || '';
    return (
      mimeType.includes('msword') ||
      mimeType.includes('officedocument.wordprocessingml') ||
      name.toLowerCase().endsWith('.doc') ||
      name.toLowerCase().endsWith('.docx')
    );
  }

  /**
   * Helper method to determine if a file is a text document
   * @param {Object} file - The file object
   * @returns {boolean} Whether the file is a text document
   */
  isTextDocument(file) {
    if (!file) return false;
    const mimeType = file.mimeType || '';
    const name = file.name || '';
    return (
      mimeType.includes('text/plain') ||
      name.toLowerCase().endsWith('.txt') ||
      name.toLowerCase().endsWith('.md') ||
      name.toLowerCase().endsWith('.markdown')
    );
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

  /**
   * Process a document file locally when server processing fails
   * @param {Object} file - The file object to process
   * @returns {Promise<Object>} The processing result
   */
  async processDocumentLocally(file) {
    try {
      console.log('Processing document locally:', file.name);
      
      if (this.isTextDocument(file)) {
        // For text documents, read directly
        console.log('Processing text document directly');
        const content = await FileSystem.readAsStringAsync(file.uri, { encoding: 'utf8' });
        
        return {
          content,
          success: true
        };
      } else {
        // For non-text documents, extract what we can and provide a placeholder
        return {
          content: `This is a ${file.type || this.inferMimeType(file.name)} document named "${file.name}" that was added to provide context for AI interactions. The full content couldn't be extracted, but the AI can still use the document for reference.`,
          success: true
        };
      }
    } catch (error) {
      console.error('Error processing document locally:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process a document file and extract its content
   * @param {Object} file - The file object to process
   * @returns {Promise<Object>} The processing result
   */
  async processDocument(file) {
    try {
      console.log('Processing document:', file.name);
      
      if (this.isPdf(file) || this.isWordDocument(file)) {
        // For PDF and Word documents, try the Lambda function first
        console.log('Attempting to process PDF/Word document with Lambda function');
        
        try {
          // Read file as base64
          const base64Content = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64
          });
          
          // Get user ID for authentication
          const userId = await this.getUserId();
          
          // Call Lambda API for processing
          const response = await fetch(this.lambdaEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userId}`,
              'x-user-id': userId
            },
            body: JSON.stringify({
              fileType: file.mimeType || this.inferMimeType(file.name),
              fileName: file.name,
              fileContent: base64Content,
              userId: userId
            })
          });
          
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          
          const result = await response.json();
          
          if (!result.success) {
            throw new Error(result.error || 'Processing failed');
          }
          
          return {
            content: result.extractedText,
            success: true
          };
        } catch (serverError) {
          console.error('Server processing failed, falling back to local processing:', serverError);
          // Fall back to local processing
          return await this.processDocumentLocally(file);
        }
      } else if (this.isTextDocument(file)) {
        // For text documents, read directly
        console.log('Processing text document directly');
        
        const content = await FileSystem.readAsStringAsync(file.uri, { encoding: 'utf8' });
        
        return {
          content,
          success: true
        };
      } else {
        // For unsupported file types, try local processing
        console.log('Unsupported file type, attempting local processing');
        return await this.processDocumentLocally(file);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Upload a document to the OpenAI assistant
   * @param {Object} file - The file object to upload
   * @returns {Promise<Object>} The upload result
   */
  async uploadDocumentToAssistant(file) {
    try {
      console.log('Uploading document to assistant:', file.name);
      
      // Attempt to upload to OpenAI
      const uploadResult = await assistantService.uploadFile(file);
      
      console.log('Upload result:', uploadResult);
      
      if (!uploadResult.success || !uploadResult.fileId) {
        throw new Error('Failed to upload file to assistant');
      }
      
      return {
        fileId: uploadResult.fileId,
        success: true
      };
    } catch (error) {
      console.error('Error uploading document to assistant:', error);
      
      // Provide detailed error for debugging
      return {
        success: false,
        error: error.message,
        stack: error.stack,
        name: error.name
      };
    }
  }

  /**
   * Upload and process a document
   * @param {Object} file - The file object to upload and process
   * @returns {Promise<Object>} The upload and processing result
   */
  async uploadDocumentWithProcessing(file) {
    let newDoc = null;
    
    try {
      console.log('Starting document upload and processing for:', file.name);
      
      // Create document entry with processing status
      newDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        uri: file.uri,
        type: file.mimeType || this.inferMimeType(file.name),
        size: file.size,
        dateAdded: new Date().toISOString(),
        isProcessing: true,
        processingError: false,
        status: 'processing',
        content: null,
        openaiFileId: null,
        openaiUploadAttempted: false,
        openaiUploadError: false,
        openaiErrorMessage: null,
        openaiRetryCount: 0
      };
      
      // Add to documents list and save
      const savedDocsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
      const currentDocs = savedDocsStr ? JSON.parse(savedDocsStr) : [];
      const updatedDocuments = [...currentDocs, newDoc];
      await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocuments));
      console.log('Saved document with processing status:', newDoc.id);
      
      // Process document for content extraction (do this first, it's more reliable)
      console.log('Processing document for content extraction');
      const processingResult = await this.processDocument(file);
      
      // Update document with processing result
      const docsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
      const docs = JSON.parse(docsStr);
      const updatedDocs = docs.map(doc => {
        if (doc.id === newDoc.id) {
          return {
            ...doc,
            isProcessing: false,
            processingError: !processingResult.success,
            status: processingResult.success ? 'content_extracted' : 'failed',
            content: processingResult.success ? processingResult.content : null,
            error: processingResult.success ? null : processingResult.error
          };
        }
        return doc;
      });
      await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocs));
      
      // Try to upload to OpenAI Assistant
      console.log('Attempting upload to OpenAI Assistant');
      
      try {
        newDoc.openaiUploadAttempted = true;
        
        // Add diagnostic info to the document object
        const uploadDiagnostics = {
          timestamp: new Date().toISOString(),
          attempt: 1,
          sdkVersion: 'v4' // Indicate we're expecting OpenAI SDK v4
        };
        
        // Update the document with diagnostics
        const currentDocsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
        const currentDocs = JSON.parse(currentDocsStr);
        const docsWithDiagnostics = currentDocs.map(doc => {
          if (doc.id === newDoc.id) {
            return {
              ...doc,
              openaiUploadAttempted: true,
              openaiDiagnostics: uploadDiagnostics
            };
          }
          return doc;
        });
        await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(docsWithDiagnostics));
        
        // Attempt the upload
        const openaiUploadResult = await this.uploadDocumentToAssistant(file);
        
        // Update document with OpenAI file ID if successful
        if (openaiUploadResult.success && openaiUploadResult.fileId) {
          const latestDocsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
          const latestDocs = JSON.parse(latestDocsStr);
          const updatedDocs = latestDocs.map(doc => {
            if (doc.id === newDoc.id) {
              return {
                ...doc,
                openaiFileId: openaiUploadResult.fileId,
                openaiUploadError: false,
                openaiErrorMessage: null,
                status: 'completed'
              };
            }
            return doc;
          });
          await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocs));
          
          console.log('Successfully uploaded to OpenAI with file ID:', openaiUploadResult.fileId);
          
          return {
            success: true,
            documentId: newDoc.id,
            openaiSuccess: true,
            openaiFileId: openaiUploadResult.fileId,
            processingSuccess: processingResult.success
          };
        } else {
          throw new Error(openaiUploadResult.error || 'Unknown upload error');
        }
      } catch (uploadError) {
        console.error('Upload to assistant failed:', uploadError);
        
        // Update document with upload error
        const latestDocsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
        const latestDocs = JSON.parse(latestDocsStr);
        const docsWithUploadError = latestDocs.map(doc => {
          if (doc.id === newDoc.id) {
            return {
              ...doc,
              openaiUploadError: true,
              openaiErrorMessage: uploadError.message,
              status: 'content_only' // We have the content but OpenAI upload failed
            };
          }
          return doc;
        });
        await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(docsWithUploadError));
        
        // If we have content but OpenAI upload failed, still consider it a partial success
        if (processingResult.success) {
          return {
            success: true,
            documentId: newDoc.id,
            openaiSuccess: false,
            openaiError: uploadError.message,
            processingSuccess: true,
            partialSuccess: true
          };
        } else {
          throw new Error('Both content extraction and OpenAI upload failed');
        }
      }
    } catch (error) {
      console.error('Error in document processing:', error);
      
      // Update document with error if newDoc was created
      if (newDoc) {
        try {
          const docsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
          const docs = JSON.parse(docsStr);
          const updatedDocs = docs.map(doc => {
            if (doc.id === newDoc.id) {
              return {
                ...doc,
                isProcessing: false,
                processingError: true,
                status: 'failed',
                error: error.message
              };
            }
            return doc;
          });
          await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocs));
        } catch (updateError) {
          console.error('Error updating document status:', updateError);
        }
      }
      
      return {
        success: false,
        error: error.message,
        documentId: newDoc?.id
      };
    }
  }

  /**
   * Get all documents
   * @returns {Promise<Array>} Array of document objects
   */
  async getDocuments() {
    try {
      const docsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
      if (!docsStr) return [];
      
      const docs = JSON.parse(docsStr);
      return docs;
    } catch (error) {
      console.error('Error getting documents:', error);
      return [];
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
      
      const docsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
      if (!docsStr) return null;
      
      const docs = JSON.parse(docsStr);
      return docs.find(doc => doc.id === documentId) || null;
    } catch (error) {
      console.error('Error getting document by ID:', error);
      return null;
    }
  }

  /**
   * Delete a document
   * @param {string} documentId - The document ID to delete
   * @returns {Promise<boolean>} Whether the deletion was successful
   */
  async deleteDocument(documentId) {
    try {
      if (!documentId) return false;
      
      // Get the document first
      const document = await this.getDocumentById(documentId);
      if (!document) return false;
      
      // If the document was uploaded to OpenAI, delete it there first
      if (document.openaiFileId) {
        try {
          await assistantService.deleteFile(document.openaiFileId);
          console.log('Deleted document from OpenAI assistant:', document.openaiFileId);
        } catch (openaiError) {
          console.warn('Error deleting document from OpenAI (continuing anyway):', openaiError);
          // Continue with local deletion even if OpenAI deletion fails
        }
      }
      
      // Delete from local storage
      const docsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
      if (!docsStr) return false;
      
      const docs = JSON.parse(docsStr);
      const updatedDocs = docs.filter(doc => doc.id !== documentId);
      await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocs));
      
      console.log('Deleted document:', documentId);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }

  /**
   * Retry uploading a document to OpenAI
   * @param {string} documentId - The document ID to retry
   * @returns {Promise<Object>} The retry result
   */
  async retryOpenAIUpload(documentId) {
    try {
      if (!documentId) return { success: false, error: 'Invalid document ID' };
      
      // Get the document
      const document = await this.getDocumentById(documentId);
      if (!document) return { success: false, error: 'Document not found' };
      
      // If document is already uploaded, no need to retry
      if (document.openaiFileId && !document.openaiUploadError) {
        return { success: true, alreadyUploaded: true, fileId: document.openaiFileId };
      }
      
      // Increment retry count
      document.openaiRetryCount = (document.openaiRetryCount || 0) + 1;
      
      // Get file from URI
      try {
        // Check if the file exists at the URI
        const fileInfo = await FileSystem.getInfoAsync(document.uri);
        if (!fileInfo.exists) {
          throw new Error(`File does not exist at URI: ${document.uri}`);
        }
        
        // Create a file object for the assistant service
        const file = {
          uri: document.uri,
          name: document.name,
          mimeType: document.type,
          size: document.size
        };
        
        // Upload to OpenAI
        console.log('Retrying upload to OpenAI for document:', documentId);
        const uploadResult = await this.uploadDocumentToAssistant(file);
        
        if (!uploadResult.success || !uploadResult.fileId) {
          throw new Error('Failed to upload file to assistant');
        }
        
        // Update document with successful upload info
        const docsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
        const docs = JSON.parse(docsStr);
        const updatedDocs = docs.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              openaiFileId: uploadResult.fileId,
              openaiUploadError: false,
              openaiErrorMessage: null,
              openaiRetryCount: document.openaiRetryCount,
              status: 'completed'
            };
          }
          return doc;
        });
        await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocs));
        
        return {
          success: true,
          fileId: uploadResult.fileId,
          retryCount: document.openaiRetryCount
        };
      } catch (error) {
        console.error('Error retrying OpenAI upload:', error);
        
        // Update document with error info
        const docsStr = await AsyncStorage.getItem(USER_KNOWLEDGE_KEY);
        const docs = JSON.parse(docsStr);
        const updatedDocs = docs.map(doc => {
          if (doc.id === documentId) {
            return {
              ...doc,
              openaiUploadError: true,
              openaiErrorMessage: `Retry failed: ${error.message}`,
              openaiRetryCount: document.openaiRetryCount
            };
          }
          return doc;
        });
        await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocs));
        
        return {
          success: false,
          error: error.message,
          retryCount: document.openaiRetryCount
        };
      }
    } catch (error) {
      console.error('Error in retry process:', error);
      return {
        success: false,
        error: `Retry process error: ${error.message}`
      };
    }
  }

  /**
   * Synchronize all documents with OpenAI Assistant
   * @returns {Promise<Object>} The synchronization result
   */
  async synchronizeDocuments() {
    try {
      console.log('Starting document synchronization with OpenAI');
      
      // Get all documents
      const documents = await this.getDocuments();
      if (!documents.length) {
        return { success: true, message: 'No documents to synchronize', results: [] };
      }
      
      // Track synchronization results
      const results = [];
      
      // Synchronize each document
      for (const document of documents) {
        // Skip documents that are already synchronized
        if (document.openaiFileId && !document.openaiUploadError) {
          results.push({
            documentId: document.id,
            name: document.name,
            success: true,
            alreadyUploaded: true,
            fileId: document.openaiFileId
          });
          continue;
        }
        
        // Skip documents that are still processing or failed to process
        if (document.isProcessing || document.processingError) {
          results.push({
            documentId: document.id,
            name: document.name,
            success: false,
            error: document.isProcessing ? 'Document is still processing' : 'Document processing failed'
          });
          continue;
        }
        
        // Attempt to upload the document
        try {
          const retryResult = await this.retryOpenAIUpload(document.id);
          results.push({
            documentId: document.id,
            name: document.name,
            ...retryResult
          });
        } catch (error) {
          results.push({
            documentId: document.id,
            name: document.name,
            success: false,
            error: error.message
          });
        }
      }
      
      // Compute overall success rate
      const successCount = results.filter(r => r.success).length;
      const successRate = (successCount / results.length) * 100;
      
      return {
        success: successCount > 0,
        message: `Synchronized ${successCount} of ${results.length} documents (${successRate.toFixed(1)}%)`,
        results
      };
    } catch (error) {
      console.error('Error synchronizing documents:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clear all documents
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  async clearAllDocuments() {
    try {
      console.log('Clearing all documents');
      
      // Get all documents
      const documents = await this.getDocuments();
      
      // Delete each document from OpenAI if it was uploaded
      for (const document of documents) {
        if (document.openaiFileId) {
          try {
            await assistantService.deleteFile(document.openaiFileId);
            console.log('Deleted document from OpenAI assistant:', document.openaiFileId);
          } catch (openaiError) {
            console.warn('Error deleting document from OpenAI (continuing anyway):', openaiError);
            // Continue with other deletions even if one fails
          }
        }
      }
      
      // Clear all documents from local storage
      await AsyncStorage.removeItem(USER_KNOWLEDGE_KEY);
      
      return true;
    } catch (error) {
      console.error('Error clearing all documents:', error);
      return false;
    }
  }

  /**
   * Check document synchronization status
   * @returns {Promise<Object>} The synchronization status
   */
  async checkSynchronizationStatus() {
    try {
      // Get all documents
      const documents = await this.getDocuments();
      if (!documents.length) {
        return {
          totalDocuments: 0,
          syncedDocuments: 0,
          failedDocuments: 0,
          processingDocuments: 0,
          syncPercentage: 0,
          needsSync: false
        };
      }
      
      // Count documents by status
      const syncedDocuments = documents.filter(doc => doc.openaiFileId && !doc.openaiUploadError).length;
      const failedDocuments = documents.filter(doc => doc.openaiUploadError || doc.processingError).length;
      const processingDocuments = documents.filter(doc => doc.isProcessing).length;
      
      // Calculate sync percentage
      const syncPercentage = (syncedDocuments / documents.length) * 100;
      
      // Determine if synchronization is needed
      const needsSync = documents.some(doc => 
        !doc.isProcessing && // Not currently processing
        !doc.processingError && // Didn't fail processing
        (!doc.openaiFileId || doc.openaiUploadError) // Not uploaded to OpenAI or upload failed
      );
      
      return {
        totalDocuments: documents.length,
        syncedDocuments,
        failedDocuments,
        processingDocuments,
        syncPercentage,
        needsSync
      };
    } catch (error) {
      console.error('Error checking synchronization status:', error);
      return {
        error: error.message,
        needsSync: false
      };
    }
  }
}

// Create and export a singleton instance
const documentProcessingService = new DocumentProcessingService();
export default documentProcessingService;
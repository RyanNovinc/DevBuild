// src/screens/PersonalKnowledgeScreen/DocumentPreviewModal.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DocumentService from '../../services/DocumentService';
import { APP_CONTEXT_DOCUMENT_ID } from '../../services/AppSummaryService';

/**
 * DocumentPreviewModal component for viewing document details and content
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Object} props.theme - Theme object
 * @param {Object} props.document - Document data
 * @param {Function} props.onClose - Close modal callback
 * @param {Function} props.onDelete - Delete document callback
 */
const DocumentPreviewModal = ({ visible, theme, document, onClose, onDelete }) => {
  const [documentContent, setDocumentContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentError, setContentError] = useState(null);
  
  // Check if this is the system document
  const isSystemDocument = document?.isSystemDocument === true || document?.id === APP_CONTEXT_DOCUMENT_ID;
  
  // Load document content when document changes or modal becomes visible
  useEffect(() => {
    if (visible && document && document.openaiFileId) {
      loadDocumentContent();
    } else {
      // Reset state when modal is closed
      setDocumentContent(null);
      setContentError(null);
    }
  }, [visible, document]);
  
  // Load document content from service
  const loadDocumentContent = async () => {
    if (!document || !document.openaiFileId) return;
    
    try {
      setIsLoading(true);
      setContentError(null);
      
      const content = await DocumentService.getProcessedDocumentContent(document.openaiFileId);
      
      if (content) {
        setDocumentContent(content);
      } else {
        setContentError("Could not load document content. It may have been removed or is not available.");
      }
    } catch (error) {
      console.error('Error loading document content:', error);
      setContentError(`Error loading content: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!document) return null;
  
  /**
   * Format date string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  /**
   * Format file size
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return 'Unknown size';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Get document icon based on file type
   * @returns {string} Ionicons name for the document type
   */
  const getDocumentIcon = () => {
    // Special icon for system document
    if (isSystemDocument) {
      return 'analytics';
    }
    
    if (!document.type) return 'document';
    
    const type = document.type.toLowerCase();
    
    if (type.includes('pdf')) {
      return 'document-text';
    } else if (type.includes('word') || type.includes('doc')) {
      return 'document';
    } else if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) {
      return 'grid';
    } else if (type.includes('text') || type.includes('txt') || type.includes('md')) {
      return 'reader';
    } else if (type.includes('json')) {
      return 'code-slash';
    } else {
      return 'document';
    }
  };
  
  // Determine if we should show compression info
  const hasCompression = document.originalSize && 
                        document.processedSize && 
                        document.originalSize !== document.processedSize;
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.previewModalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.previewHeader, { 
          backgroundColor: theme.card,
          borderBottomColor: theme.border
        }]}>
          <TouchableOpacity
            style={styles.previewCloseButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.previewTitle, { color: theme.text }]} numberOfLines={1}>
            {document.name}
          </Text>
          
          {/* Only show delete button for non-system documents */}
          {!isSystemDocument && (
            <TouchableOpacity
              style={[styles.previewDeleteButton, { backgroundColor: theme.errorLight }]}
              onPress={() => {
                onClose();
                onDelete(document.id);
              }}
            >
              <Ionicons name="trash-outline" size={22} color={theme.danger} />
            </TouchableOpacity>
          )}
        </View>
        
        <ScrollView style={styles.previewContent}>
          <View style={[styles.documentDetails, { backgroundColor: theme.card }]}>
            <View style={styles.documentDetailRow}>
              <Text style={[styles.documentDetailLabel, { color: theme.textSecondary }]}>
                Name:
              </Text>
              <Text style={[styles.documentDetailValue, { color: theme.text }]}>
                {document.name}
              </Text>
            </View>
            <View style={styles.documentDetailRow}>
              <Text style={[styles.documentDetailLabel, { color: theme.textSecondary }]}>
                Type:
              </Text>
              <Text style={[styles.documentDetailValue, { color: theme.text }]}>
                {isSystemDocument ? 'System Document' : (document.type || 'Unknown')}
              </Text>
            </View>
            
            {!isSystemDocument && (
              <>
                <View style={styles.documentDetailRow}>
                  <Text style={[styles.documentDetailLabel, { color: theme.textSecondary }]}>
                    Original Size:
                  </Text>
                  <Text style={[styles.documentDetailValue, { color: theme.text }]}>
                    {formatFileSize(document.originalSize || document.size)}
                  </Text>
                </View>
                <View style={styles.documentDetailRow}>
                  <Text style={[styles.documentDetailLabel, { color: theme.textSecondary }]}>
                    Processed Size:
                  </Text>
                  <Text style={[styles.documentDetailValue, { color: theme.text }]}>
                    {formatFileSize(document.processedSize || document.size)}
                    {hasCompression && (
                      <Text style={[{ color: theme.success || '#4CD964' }]}>
                        {' '}({document.compressionRatio || 
                          ((document.originalSize - document.processedSize) / document.originalSize * 100).toFixed(0) + '% smaller'})
                      </Text>
                    )}
                  </Text>
                </View>
              </>
            )}
            
            <View style={styles.documentDetailRow}>
              <Text style={[styles.documentDetailLabel, { color: theme.textSecondary }]}>
                Added:
              </Text>
              <Text style={[styles.documentDetailValue, { color: theme.text }]}>
                {formatDate(document.dateAdded)}
              </Text>
            </View>
            
            {/* Only show AI status for non-system documents */}
            {!isSystemDocument && (
              <View style={styles.documentDetailRow}>
                <Text style={[styles.documentDetailLabel, { color: theme.textSecondary }]}>
                  AI Status:
                </Text>
                <View style={styles.statusIndicator}>
                  {document.isProcessing ? (
                    <>
                      <ActivityIndicator size="small" color={theme.primary} />
                      <Text style={[styles.statusText, { color: theme.text, marginLeft: 8 }]}>
                        Processing
                      </Text>
                    </>
                  ) : document.processingError ? (
                    <>
                      <Ionicons name="alert-circle" size={18} color="#FF6B6B" />
                      <Text style={[styles.statusText, { color: '#FF6B6B', marginLeft: 8 }]}>
                        Error
                      </Text>
                    </>
                  ) : document.openaiUploadError ? (
                    <>
                      <Ionicons name="cloud-offline" size={18} color="#FFA726" />
                      <Text style={[styles.statusText, { color: '#FFA726', marginLeft: 8 }]}>
                        AI Sync Error
                      </Text>
                    </>
                  ) : document.openaiFileId ? (
                    <>
                      <Ionicons name="cloud-done" size={18} color="#4CD964" />
                      <Text style={[styles.statusText, { color: '#4CD964', marginLeft: 8 }]}>
                        AI Ready
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={18} color="#4CD964" />
                      <Text style={[styles.statusText, { color: '#4CD964', marginLeft: 8 }]}>
                        Ready
                      </Text>
                    </>
                  )}
                </View>
              </View>
            )}
            
            {!isSystemDocument && document.openaiFileId && (
              <View style={styles.documentDetailRow}>
                <Text style={[styles.documentDetailLabel, { color: theme.textSecondary }]}>
                  AI File ID:
                </Text>
                <Text 
                  style={[
                    styles.documentDetailValue, 
                    { 
                      color: theme.text, 
                      fontSize: 12,
                      fontFamily: 'monospace'
                    }
                  ]}
                  numberOfLines={2}
                >
                  {document.openaiFileId}
                </Text>
              </View>
            )}
            
            {document.openaiErrorMessage && (
              <View style={styles.documentDetailRow}>
                <Text style={[styles.documentDetailLabel, { color: theme.textSecondary }]}>
                  Error:
                </Text>
                <Text 
                  style={[
                    styles.documentDetailValue, 
                    { 
                      color: theme.danger,
                      fontSize: 13
                    }
                  ]}
                >
                  {document.openaiErrorMessage}
                </Text>
              </View>
            )}
          </View>
          
          {/* Add special explanation for system document */}
          {isSystemDocument ? (
            <View style={[styles.previewNoteCard, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="information-circle" size={24} color={theme.primary} />
              <Text style={[styles.previewNoteText, { color: theme.text }]}>
                This is a system-generated summary of your app data. It provides your AI assistant with context about your goals, projects, and tasks. This document is automatically updated when you make changes in the app.
              </Text>
            </View>
          ) : (
            <View style={[styles.previewNoteCard, { backgroundColor: theme.cardElevated || theme.card }]}>
              <Ionicons name="information-circle" size={24} color={theme.primary} />
              <Text style={[styles.previewNoteText, { color: theme.text }]}>
                {document.processingError ? 
                  "There was an error processing this document. It won't be used for Personal Context. Please try removing and adding it again." :
                  document.openaiUploadError ?
                  "There was an error uploading this document to the AI service. You can try again by using the Retry button on the documents screen." :
                  hasCompression ?
                  `This document has been processed and compressed for AI use. The original size of ${formatFileSize(document.originalSize)} has been reduced by ${document.compressionRatio || ((document.originalSize - document.processedSize) / document.originalSize * 100).toFixed(0) + '%'} to save storage space. Your AI assistant can access and reference information from this document when responding to your queries.` :
                  document.openaiFileId ?
                  "This document is ready for AI use. Your AI assistant can access and reference information from this document when responding to your queries." :
                  "This document will be used to provide context for your AI assistant. They'll be able to reference information from this document when responding to your queries."}
              </Text>
            </View>
          )}
          
          {/* Document Content Preview */}
          <View style={[styles.contentPreviewContainer, { backgroundColor: theme.card }]}>
            <View style={styles.contentPreviewHeader}>
              <View style={styles.contentPreviewTitleContainer}>
                <Ionicons name={getDocumentIcon()} size={22} color={theme.primary} />
                <Text style={[styles.contentPreviewTitle, { color: theme.text }]}>
                  Document Content
                </Text>
              </View>
            </View>
            
            {isLoading ? (
              <View style={styles.contentPreviewLoading}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.contentPreviewLoadingText, { color: theme.text }]}>
                  Loading document content...
                </Text>
              </View>
            ) : contentError ? (
              <View style={[styles.contentPreviewError, { backgroundColor: theme.errorLight }]}>
                <Ionicons name="alert-circle" size={24} color={theme.danger} />
                <Text style={[styles.contentPreviewErrorText, { color: theme.danger }]}>
                  {contentError}
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: theme.primary }]}
                  onPress={loadDocumentContent}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : documentContent ? (
              <ScrollView style={styles.contentPreviewScroll}>
                <Text style={[styles.contentPreviewText, { color: theme.text }]}>
                  {documentContent}
                </Text>
              </ScrollView>
            ) : (
              <View style={styles.contentPreviewPlaceholder}>
                <Ionicons name={getDocumentIcon()} size={42} color={theme.primary} />
                <Text style={[styles.contentPreviewPlaceholderText, { color: theme.text }]}>
                  No content available
                </Text>
                <Text style={[styles.contentPreviewPlaceholderSubtext, { color: theme.textSecondary }]}>
                  The document content could not be loaded. It may be processing or unavailable.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  previewModalContainer: {
    flex: 1,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  previewCloseButton: {
    padding: 8,
  },
  previewTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  previewDeleteButton: {
    padding: 8,
    borderRadius: 20,
  },
  previewContent: {
    flex: 1,
    padding: 16,
  },
  documentDetails: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  documentDetailRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  documentDetailLabel: {
    width: 100,
    fontSize: 14,
  },
  documentDetailValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
  },
  previewNoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  previewNoteText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
    flex: 1,
  },
  contentPreviewContainer: {
    borderRadius: 12,
    marginBottom: 30,
    overflow: 'hidden',
  },
  contentPreviewHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  contentPreviewTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentPreviewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  contentPreviewScroll: {
    maxHeight: 500,  // Limit maximum height
    padding: 16,
  },
  contentPreviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  contentPreviewLoading: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentPreviewLoadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  contentPreviewError: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    margin: 16,
  },
  contentPreviewErrorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  contentPreviewPlaceholder: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentPreviewPlaceholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  contentPreviewPlaceholderSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default DocumentPreviewModal;
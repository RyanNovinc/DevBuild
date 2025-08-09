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
import SimpleMarkdownRenderer from '../../components/SimpleMarkdownRenderer';

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
              style={[styles.previewDeleteButton, { backgroundColor: '#FF3B30' }]}
              onPress={() => {
                onClose();
                onDelete(document.id);
              }}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Document Content Container */}
        <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.text }]}>
                Loading...
              </Text>
            </View>
          ) : contentError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color={theme.danger} />
              <Text style={[styles.errorText, { color: theme.danger }]}>
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
            <ScrollView 
              style={styles.contentScroll}
              contentContainerStyle={styles.contentScrollContainer}
            >
              {/* Always use markdown renderer if content contains markdown patterns */}
              {documentContent && (documentContent.includes('**') || isSystemDocument || document.type?.includes('markdown') || document.name?.endsWith('.md')) ? (
                <SimpleMarkdownRenderer content={documentContent} theme={theme} />
              ) : (
                <Text style={[styles.contentText, { color: theme.text }]}>
                  {documentContent}
                </Text>
              )}
            </ScrollView>
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name={getDocumentIcon()} size={42} color={theme.primary} />
              <Text style={[styles.placeholderText, { color: theme.text }]}>
                No content available
              </Text>
              <Text style={[styles.placeholderSubtext, { color: theme.textSecondary }]}>
                The document content could not be loaded.
              </Text>
            </View>
          )}
        </View>
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
  // Simplified content styles - only what's needed for document content
  contentContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
    fontWeight: '500',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
});

export default DocumentPreviewModal;
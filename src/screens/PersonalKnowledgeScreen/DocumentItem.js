// src/screens/PersonalKnowledgeScreen/DocumentItem.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONTEXT_DOCUMENT_ID } from '../../services/AppSummaryService';

/**
 * DocumentItem component for displaying a document in the list
 * @param {Object} props - Component props
 * @param {Object} props.item - Document item data
 * @param {Object} props.theme - Theme object
 * @param {Function} props.onView - View document callback
 * @param {Function} props.onDelete - Delete document callback
 * @param {Object} props.responsive - Responsive styling props
 */
const DocumentItem = ({ item, theme, onView, onDelete, responsive }) => {
  // Check if this is the system document
  const isSystemDocument = item.isSystemDocument === true || item.id === APP_CONTEXT_DOCUMENT_ID;
  
  // Add debugging log for system document
  if (isSystemDocument) {
    console.log(`[DocumentItem] Rendering system document: ${item.name}, ID: ${item.id}`);
  }
  
  /**
   * Format date string
   * @param {string} dateString - ISO date string
   * @returns {string} Formatted date string
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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
    if (bytes === 0 || !bytes) return '';
    
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
    
    if (!item.type) return 'document';
    
    const type = item.type.toLowerCase();
    
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

  /**
   * Get status indicator info based on document status
   * @returns {Object} Status indicator information
   */
  const getStatusIndicator = () => {
    // System document is always ready
    if (isSystemDocument) {
      return {
        icon: 'checkmark-circle',
        color: '#4CD964',
        text: 'System',
        backgroundColor: 'rgba(76, 217, 100, 0.1)'
      };
    }
    
    // First, check if we're processing
    if (item.isProcessing) {
      return {
        icon: 'sync',
        color: theme.warning,
        text: 'Processing',
        backgroundColor: theme.warningLight,
        spinning: true
      };
    }
    
    // Check for processing error
    if (item.processingError) {
      return {
        icon: 'alert-circle',
        color: theme.danger,
        text: 'Error',
        backgroundColor: theme.errorLight
      };
    }
    
    // If we have a fileId, the document is ready regardless of other flags
    if (item.openaiFileId) {
      return {
        icon: 'cloud-done',
        color: '#4CD964',
        text: 'AI Ready',
        backgroundColor: 'rgba(76, 217, 100, 0.1)'
      };
    }
    
    // Check for upload error only if we don't have a fileId
    if (item.openaiUploadError) {
      return {
        icon: 'cloud-offline',
        color: theme.warning,
        text: 'AI Sync Error',
        backgroundColor: theme.warningLight
      };
    }
    
    // Default state
    return {
      icon: 'checkmark-circle',
      color: '#4CD964',
      text: 'Ready',
      backgroundColor: 'rgba(76, 217, 100, 0.1)'
    };
  };

  // Get status indicator
  const statusIndicator = getStatusIndicator();

  // Determine if we should show compression info and size
  const hasCompression = !item.isProcessing && 
                        item.status === 'completed' && 
                        item.originalSize && 
                        item.processedSize && 
                        item.originalSize !== item.processedSize;

  // Only show size if document is completed and processed
  const showSize = !item.isProcessing && item.status === 'completed' && (item.processedSize || item.size);
  
  // Use processed size if available, otherwise fall back to size
  const displaySize = item.processedSize || item.size;
  
  // Responsive font sizes and spacing if provided
  const fontSize = responsive?.fontSize || {
    xs: 12,
    s: 14,
    m: 16,
    l: 18
  };
  
  const spacing = responsive?.spacing || {
    xs: 4,
    s: 8,
    m: 12,
    l: 16
  };

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        { 
          backgroundColor: theme.card,
          // Special styling for system document
          borderWidth: isSystemDocument ? 1 : 0,
          borderColor: isSystemDocument ? theme.primary : 'transparent',
          opacity: isSystemDocument ? 1 : 0.95
        }
      ]}
      onPress={onView}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${item.name} document, ${isSystemDocument ? 'system document' : 'tap to view'}`}
      accessibilityRole="button"
    >
      <View style={styles.content}>
        <View style={[
          styles.iconContainer,
          {
            backgroundColor: isSystemDocument ? theme.primaryLight : theme.card
          }
        ]}>
          <Ionicons 
            name={getDocumentIcon()} 
            size={28} 
            color={theme.primary} 
          />
        </View>
        
        <View style={styles.detailsContainer}>
          <Text 
            style={[
              styles.fileName, 
              { 
                color: theme.text,
                fontSize: responsive?.fontSize?.m || 16,
                fontWeight: isSystemDocument ? 'bold' : '500'
              }
            ]} 
            numberOfLines={1}
            accessible={true}
            accessibilityLabel={`Document name: ${item.name}`}
          >
            {item.name}
          </Text>
          
          <View style={styles.metadataContainer}>
            {/* Only show size if document is completed and processed */}
            {showSize && (
              <Text style={[
                styles.metadataText, 
                { 
                  color: theme.textSecondary,
                  fontSize: responsive?.fontSize?.xs || 12
                }
              ]}>
                {formatFileSize(displaySize)}
              </Text>
            )}
            
            {/* Show compression ratio if available */}
            {hasCompression && showSize && (
              <>
                <Text style={[
                  styles.metadataDot, 
                  { 
                    color: theme.textSecondary,
                    fontSize: responsive?.fontSize?.xs || 12
                  }
                ]}>•</Text>
                <Text style={[
                  styles.compressionText, 
                  { 
                    color: theme.success || '#4CD964',
                    fontSize: responsive?.fontSize?.xs || 12,
                    fontWeight: '500'
                  }
                ]}>
                  {item.compressionRatio || 
                   ((item.originalSize - item.processedSize) / item.originalSize * 100).toFixed(0) + '% smaller'}
                </Text>
              </>
            )}
            
            {/* Always show date with proper separator based on previous content */}
            {showSize ? (
              <Text style={[
                styles.metadataDot, 
                { 
                  color: theme.textSecondary,
                  fontSize: responsive?.fontSize?.xs || 12
                }
              ]}>•</Text>
            ) : null}
            
            <Text style={[
              styles.metadataText, 
              { 
                color: theme.textSecondary,
                fontSize: responsive?.fontSize?.xs || 12
              }
            ]}>
              {isSystemDocument ? 'Auto-updated' : formatDate(item.dateAdded)}
            </Text>
          </View>
          
          <View 
            style={[
              styles.statusContainer, 
              { backgroundColor: statusIndicator.backgroundColor }
            ]}
          >
            {statusIndicator.spinning ? (
              <View style={styles.spinnerContainer}>
                <Ionicons 
                  name={statusIndicator.icon} 
                  size={14} 
                  color={statusIndicator.color}
                  style={styles.spinningIcon}
                />
              </View>
            ) : (
              <Ionicons 
                name={statusIndicator.icon} 
                size={14} 
                color={statusIndicator.color} 
              />
            )}
            <Text 
              style={[
                styles.statusText, 
                { 
                  color: statusIndicator.color,
                  fontSize: responsive?.fontSize?.xs || 12,
                  fontWeight: '500'
                }
              ]}
            >
              {statusIndicator.text}
            </Text>
          </View>
        </View>
        
        {/* Only show delete button for non-system documents */}
        {!isSystemDocument && (
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: theme.errorLight }]}
            onPress={() => onDelete(item.id)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessible={true}
            accessibilityLabel={`Delete ${item.name}`}
            accessibilityRole="button"
            accessibilityHint="Deletes this document from your knowledge base"
          >
            <Ionicons name="trash-outline" size={18} color={theme.danger} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  metadataText: {
    fontSize: 12,
  },
  compressionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metadataDot: {
    marginHorizontal: 4,
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  spinnerContainer: {
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinningIcon: {
    transform: [{ rotate: '0deg' }],
    // Note: In a real app, you would use Animated API to animate this
  }
});

export default DocumentItem;
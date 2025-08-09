// src/screens/PersonalKnowledgeScreen/DocumentItem.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_CONTEXT_DOCUMENT_ID } from '../../services/AppSummaryService';
import { useProfile } from '../../context/ProfileContext';
import { useAuth } from '../../context/AuthContext';

/**
 * DocumentItem component for displaying a document in the list
 * @param {Object} props - Component props
 * @param {Object} props.item - Document item data
 * @param {Object} props.theme - Theme object
 * @param {Function} props.onView - View document callback
 * @param {Function} props.onDelete - Delete document callback
 * @param {Object} props.responsive - Responsive styling props
 * @param {boolean} props.appContextEnabled - Whether app context is enabled
 * @param {Function} props.onToggleAppContext - Callback for toggling app context
 * @param {Function} props.onToggleDocumentAccess - Callback for toggling individual document AI access
 */
const DocumentItem = ({ item, theme, onView, onDelete, responsive, appContextEnabled, onToggleAppContext, onToggleDocumentAccess, onShowAppContextInfo }) => {
  // Get user profile and auth context
  const { profile } = useProfile();
  const { user } = useAuth();
  
  // Animation for spinning icon
  const spinValue = useRef(new Animated.Value(0)).current;
  
  // Animation for success state
  const successScale = useRef(new Animated.Value(1)).current;
  const successOpacity = useRef(new Animated.Value(1)).current;
  
  // Handle spinning animation for processing state
  useEffect(() => {
    let spinAnimation;
    
    if (item.isProcessing) {
      // Start continuous spinning animation
      spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
    } else {
      // Stop animation and reset
      spinValue.setValue(0);
    }
    
    return () => {
      if (spinAnimation) {
        spinAnimation.stop();
      }
    };
  }, [item.isProcessing, spinValue]);
  
  // Handle success animation when document becomes AI ready
  const [previousProcessingState, setPreviousProcessingState] = useState(item.isProcessing);
  
  useEffect(() => {
    // Check if document just finished processing (was processing, now not processing and has fileId)
    if (previousProcessingState && !item.isProcessing && item.openaiFileId && !item.processingError) {
      // Trigger success animation - gentle bounce
      Animated.sequence([
        Animated.timing(successScale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(successScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
    
    // Update previous state
    setPreviousProcessingState(item.isProcessing);
  }, [item.isProcessing, item.openaiFileId, item.processingError, previousProcessingState, successScale]);
  
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
        color: '#FFFFFF',
        text: 'AI Ready',
        backgroundColor: theme.primary
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
        color: '#FFFFFF',
        text: 'AI Ready',
        backgroundColor: theme.primary
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
      color: '#FFFFFF',
      text: 'AI Ready',
      backgroundColor: theme.primary
    };
  };

  // Get status indicator
  const statusIndicator = getStatusIndicator();
  
  // Create rotation interpolation for spinning animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

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
    isSystemDocument ? (
      // Special layout for system document - more like a control card
      <View
        style={[
          styles.systemCard,
          {
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.primary,
          }
        ]}
      >
        {/* Header with icon, title, and info button */}
        <TouchableOpacity
          style={styles.systemCardHeader}
          onPress={onView}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={`${item.name} app context document`}
          accessibilityRole="button"
        >
          <View style={[styles.systemIconContainer, { backgroundColor: theme.primary }]}>
            <Ionicons name="phone-portrait" size={22} color="#FFFFFF" />
          </View>
          
          <View style={styles.systemHeaderText}>
            <Text style={[styles.systemTitle, { color: theme.text }]}>
              {`${(profile?.name || user?.displayName || 'Your')}${(profile?.name || user?.displayName) ? "'s" : ''} App Context`}
            </Text>
            <View style={[styles.systemStatusBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="checkmark-circle" size={12} color="#FFFFFF" />
              <Text style={styles.systemStatusText}>AI Ready</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.systemInfoButtonHeader}
            onPress={onShowAppContextInfo}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="App context information"
          >
            <Ionicons 
              name="information-circle" 
              size={22} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Control section */}
        <View style={styles.systemControlSection}>
          <TouchableOpacity
            style={[
              styles.systemToggleButtonExpanded,
              {
                backgroundColor: appContextEnabled ? theme.primary : 'rgba(255, 255, 255, 0.15)',
                borderColor: appContextEnabled ? theme.primary : 'rgba(255, 255, 255, 0.3)',
              }
            ]}
            onPress={onToggleAppContext}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="Enable app context"
            accessibilityState={{ checked: appContextEnabled }}
            activeOpacity={0.8}
          >
            <Ionicons 
              name={appContextEnabled ? "checkmark-circle" : "close-circle"} 
              size={22} 
              color="#FFFFFF" 
            />
            <Text style={styles.systemToggleText}>
              {appContextEnabled ? 'Enabled' : 'Disabled'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    ) : (
      // Regular document layout
      <TouchableOpacity
        style={[styles.container, { backgroundColor: theme.card }]}
        onPress={onView}
        activeOpacity={0.7}
        accessible={true}
        accessibilityLabel={`${item.name} document, tap to view`}
        accessibilityRole="button"
      >
        <View style={styles.regularDocumentContent}>
          <View style={[styles.regularIconContainer, { backgroundColor: theme.primary }]}>
            <Ionicons 
              name={getDocumentIcon()} 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          
          <View style={styles.regularDetailsContainer}>
            <Text 
              style={[
                styles.regularFileName, 
                { 
                  color: theme.text,
                  fontSize: responsive?.fontSize?.m || 16,
                  fontWeight: '600',
                  marginBottom: 6,
                }
              ]} 
              numberOfLines={2}
            >
              {item.name}
            </Text>
            
            {/* AI Ready Status under title */}
            <Animated.View 
              style={[
                styles.regularStatusBadge, 
                { 
                  backgroundColor: statusIndicator.backgroundColor, 
                  alignSelf: 'flex-start', 
                  marginBottom: 8,
                  transform: [{ scale: successScale }]
                }
              ]}
            >
              {statusIndicator.spinning ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons 
                    name={statusIndicator.icon} 
                    size={12} 
                    color="#FFFFFF" 
                  />
                </Animated.View>
              ) : (
                <Ionicons 
                  name={statusIndicator.icon} 
                  size={12} 
                  color="#FFFFFF" 
                />
              )}
              <Text 
                style={[
                  styles.regularStatusText, 
                  { 
                    color: "#FFFFFF",
                    fontSize: responsive?.fontSize?.xs || 11,
                    fontWeight: '600'
                  }
                ]}
              >
                {statusIndicator.text}
              </Text>
            </Animated.View>

            {/* Clean Toggle Row with Divider */}
            <View style={styles.regularToggleRow}>
              <View style={styles.toggleSpacer} />
              <TouchableOpacity
                style={[
                  styles.regularToggleButton,
                  {
                    backgroundColor: (item.aiAccessEnabled !== false) ? theme.primary : 'rgba(255, 255, 255, 0.15)',
                    borderColor: (item.aiAccessEnabled !== false) ? theme.primary : 'rgba(255, 255, 255, 0.3)',
                  }
                ]}
                onPress={() => {
                  console.log('Toggle pressed for document:', item.id, 'current state:', item.aiAccessEnabled);
                  if (onToggleDocumentAccess) {
                    onToggleDocumentAccess(item.id, !(item.aiAccessEnabled !== false));
                  }
                }}
                accessible={true}
                accessibilityRole="switch"
                accessibilityLabel="Toggle AI access for document"
                accessibilityState={{ checked: item.aiAccessEnabled !== false }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={(item.aiAccessEnabled !== false) ? "checkmark-circle" : "close-circle"} 
                  size={18} 
                  color="#FFFFFF" 
                />
                <Text style={styles.regularToggleText}>
                  {(item.aiAccessEnabled !== false) ? 'On' : 'Off'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  // Regular document styles - cleaner layout
  container: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  regularDocumentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  regularIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  regularDetailsContainer: {
    flex: 1,
  },
  regularFileName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  regularMetadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  regularMetadataText: {
    fontSize: 12,
    fontWeight: '500',
  },
  regularStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  regularStatusText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  regularToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  toggleSpacer: {
    flex: 1,
  },
  regularToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  regularToggleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
  },
  appContextToggleContainer: {
    marginTop: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  infoButton: {
    padding: 4,
  },
  // New system document card styles - more prominent
  systemCard: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  systemCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  systemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  systemHeaderText: {
    flex: 1,
  },
  systemTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  systemStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  systemStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  systemControlSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  systemControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  systemToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 2,
    flex: 1,
    marginRight: 16,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  systemToggleButtonExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 2,
    width: '100%',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  systemInfoButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 12,
  },
  systemToggleText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  systemInfoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  }
});

export default DocumentItem;
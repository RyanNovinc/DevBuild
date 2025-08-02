// src/screens/PersonalKnowledgeScreen/index.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Switch,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import DocumentItem from './DocumentItem';
import EmptyState from './EmptyState';
import DocumentPreviewModal from './DocumentPreviewModal';
import InfoModal from './InfoModal';
import DocumentProcessingAnimation from './DocumentProcessingAnimation';
import * as FeatureExplorerTracker from '../../services/FeatureExplorerTracker';
import { useNotification } from '../../context/NotificationContext';
import AppSummaryService, { APP_CONTEXT_DOCUMENT_ID } from '../../services/AppSummaryService';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  spacing,
  fontSizes,
  useScreenDimensions,
  useSafeSpacing,
  useIsLandscape,
  ensureAccessibleTouchTarget,
  getByDeviceSize,
  accessibility,
  meetsContrastRequirements
} from '../../utils/responsive';

// Import document picker utilities
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

// Import constants - Single source of truth
import { 
  USER_KNOWLEDGE_KEY, 
  USER_KNOWLEDGE_ENABLED_KEY,
  APP_CONTEXT_ENABLED_KEY,
  STORAGE_QUOTA_BYTES,
  STORAGE_QUOTA_KB,
  MAX_FILE_SIZE_MB,
  ALLOWED_FILE_TYPES,
  formatFileSize
} from './constants';

// Import document service
import DocumentService from '../../services/DocumentService';

const PersonalKnowledgeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const safeSpacing = useSafeSpacing(); // Get safe spacing with insets
  const { width, height } = useScreenDimensions(); // Get responsive dimensions
  const isLandscape = useIsLandscape(); // Check orientation
  
  // Get notification function for achievement notifications
  const { showSuccess, showError } = useNotification();
  
  // State
  const [documents, setDocuments] = useState([]);
  const [isEnabled, setIsEnabled] = useState(true);
  const [appContextEnabled, setAppContextEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPreviewVisible, setDocumentPreviewVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pendingFileName, setPendingFileName] = useState('');
  
  // Load documents and settings
  useEffect(() => {
    loadData();
    
    // Add a refresh listener to reload data when the screen gains focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen focused, reloading data');
      loadData();
    });
    
    return unsubscribe;
  }, [navigation, refreshKey]);
  
  // Auto-update app summary when app context data changes
  useEffect(() => {
    const updateAppSummaryIfNeeded = async () => {
      // Only update if app context is loaded and not currently loading
      if (!appContext.isLoading && appContext.goals && appContext.projects && appContext.tasks) {
        try {
          console.log('App context data changed, auto-updating app summary');
          
          const appData = {
            goals: appContext.goals || [],
            projects: appContext.projects || [],
            tasks: appContext.tasks || [],
            settings: appContext.settings || {}
          };
          
          // Generate summary
          const summary = AppSummaryService.generateAppSummary(appData);
          
          // Update system document
          await DocumentService.updateAppContextDocument(summary);
          console.log('App summary auto-updated successfully');
          
          // Reload documents to reflect the change
          const updatedDocuments = await DocumentService.getDocuments();
          setDocuments(updatedDocuments);
        } catch (error) {
          console.error('Error auto-updating app summary:', error);
          // Don't show error to user for automatic updates
        }
      }
    };
    
    // Debounce the update to avoid too frequent updates
    const timeoutId = setTimeout(updateAppSummaryIfNeeded, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [appContext.goals, appContext.projects, appContext.tasks, appContext.settings, appContext.isLoading]);
  
  // Calculate storage based on documents
  useEffect(() => {
    calculateStorageUsage();
  }, [documents]);
  
  // Recalculate storage when app context enabled state changes
  useEffect(() => {
    // This will trigger a re-render when appContextEnabled changes
    // which will recalculate the storage percentage
    console.log(`App context enabled changed to: ${appContextEnabled}`);
  }, [appContextEnabled]);
  
  // Recalculate storage when main Personal Knowledge toggle changes
  useEffect(() => {
    // This will trigger a re-render when isEnabled changes
    // which will recalculate the storage percentage
    console.log(`Personal Knowledge enabled changed to: ${isEnabled}`);
  }, [isEnabled]);
  
  // Load documents and settings
  const loadData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log('Loading Personal Knowledge data...');
      
      // Load documents
      const savedDocuments = await DocumentService.getDocuments();
      console.log(`Loaded ${savedDocuments.length} documents from storage`);
      
      // Check for system document
      const systemDoc = savedDocuments.find(doc => 
        doc.id === APP_CONTEXT_DOCUMENT_ID
      );
      
      if (systemDoc) {
        console.log('System document found:', systemDoc.name);
        
        // Always update the system document with latest app data when loading
        try {
          if (!appContext.isLoading) {
            console.log('Updating system document with latest app data');
            
            const appData = {
              goals: appContext.goals || [],
              projects: appContext.projects || [],
              tasks: appContext.tasks || [],
              settings: appContext.settings || {}
            };
            
            // Generate fresh summary
            const summary = AppSummaryService.generateAppSummary(appData);
            
            // Update system document
            await DocumentService.updateAppContextDocument(summary);
            console.log('Updated system document with latest data');
            
            // Reload documents after updating
            const updatedDocuments = await DocumentService.getDocuments();
            setDocuments(updatedDocuments);
          }
        } catch (err) {
          console.error('Failed to update system document:', err);
        }
      } else {
        console.log('System document not found in loaded documents');
        
        // Force creation of system document if not found
        try {
          // Only proceed if app context is loaded
          if (!appContext.isLoading) {
            console.log('Creating missing system document');
            
            const appData = {
              goals: appContext.goals || [],
              projects: appContext.projects || [],
              tasks: appContext.tasks || [],
              settings: appContext.settings || {}
            };
            
            // Generate summary
            const summary = AppSummaryService.generateAppSummary(appData);
            
            // Create system document
            await DocumentService.updateAppContextDocument(summary);
            console.log('Created missing system document');
            
            // Reload documents after creating
            const updatedDocuments = await DocumentService.getDocuments();
            setDocuments(updatedDocuments);
          } else {
            console.log('App context still loading, deferring system document creation');
          }
        } catch (err) {
          console.error('Failed to create missing system document:', err);
        }
      }
      
      setDocuments(savedDocuments);
      
      // Load enabled setting for user knowledge
      const enabledSetting = await AsyncStorage.getItem(USER_KNOWLEDGE_ENABLED_KEY);
      if (enabledSetting !== null) {
        const isEnabledValue = enabledSetting === 'true';
        console.log(`Loaded enabled setting: ${isEnabledValue}`);
        setIsEnabled(isEnabledValue);
      }
      
      // Load app context enabled setting
      const appContextSetting = await AsyncStorage.getItem(APP_CONTEXT_ENABLED_KEY);
      if (appContextSetting !== null) {
        const isAppContextEnabled = appContextSetting === 'true';
        console.log(`Loaded app context enabled setting: ${isAppContextEnabled}`);
        setAppContextEnabled(isAppContextEnabled);
      }
      
      // Calculate storage usage after loading documents
      await calculateStorageUsage();
      
    } catch (error) {
      console.error('Error loading Personal Knowledge data:', error);
      setErrorMessage('Failed to load your documents. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Force update of app summary
  const forceUpdateAppSummary = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Only proceed if app context is loaded
      if (appContext.isLoading) {
        console.log('App context still loading, cannot update summary');
        showError('App data still loading, please try again in a moment');
        return;
      }
      
      console.log('Forcing app summary update');
      
      const appData = {
        goals: appContext.goals || [],
        projects: appContext.projects || [],
        tasks: appContext.tasks || [],
        settings: appContext.settings || {}
      };
      
      // Generate summary
      const summary = AppSummaryService.generateAppSummary(appData);
      
      // Create/update system document
      await DocumentService.updateAppContextDocument(summary);
      console.log('Forced app summary update complete');
      
      // Reload documents
      const updatedDocuments = await DocumentService.getDocuments();
      setDocuments(updatedDocuments);
      
      showSuccess('App summary updated successfully');
    } catch (error) {
      console.error('Error forcing app summary update:', error);
      setErrorMessage('Failed to update app summary');
      showError('Failed to update app summary');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate total storage usage
  const calculateStorageUsage = async () => {
    try {
      // Get storage usage from DocumentService
      const usedBytes = await DocumentService.getStorageUsage();
      console.log(`Storage usage: ${usedBytes} bytes (${(usedBytes / 1024).toFixed(2)}KB of ${STORAGE_QUOTA_KB}KB)`);
      setStorageUsedBytes(usedBytes);
      return usedBytes;
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      
      // Fallback calculation based on document metadata
      const docsBytes = documents.reduce((total, doc) => {
        // Only include processed size for completed documents
        return total + (doc.processedSize || 0);
      }, 0);
      
      console.log(`Fallback storage calculation: ${docsBytes} bytes`);
      setStorageUsedBytes(docsBytes);
      return docsBytes;
    }
  };
  
  // Calculate storage percentage
  const calculateStoragePercentage = () => {
    // If Personal Knowledge is completely disabled, show 0% storage usage
    if (!isEnabled) {
      console.log('Personal Knowledge disabled: showing 0% storage usage');
      return 0;
    }
    
    // Use DocumentService's method to get the storage quota
    const storageQuotaBytes = DocumentService.getStorageQuotaBytes();
    
    // Verify we're using the correct storage quota (this should match STORAGE_QUOTA_BYTES)
    console.log(`Storage quota from service: ${storageQuotaBytes} bytes, constant: ${STORAGE_QUOTA_BYTES} bytes`);
    
    // Ensure we have valid values
    if (storageQuotaBytes <= 0) {
      console.error('Invalid storage quota:', storageQuotaBytes);
      return 0;
    }
    
    // Calculate storage used, excluding app context document if it's disabled
    let actualBytes = Math.max(0, storageUsedBytes);
    
    // If app context is disabled, subtract the app context document size from storage calculation
    if (!appContextEnabled) {
      const appContextDoc = documents.find(doc => doc.id === APP_CONTEXT_DOCUMENT_ID);
      if (appContextDoc && appContextDoc.processedSize) {
        actualBytes = Math.max(0, actualBytes - appContextDoc.processedSize);
        console.log(`App context disabled: excluding ${appContextDoc.processedSize} bytes from storage calculation`);
      }
    }
    
    const percentage = (actualBytes / storageQuotaBytes) * 100;
    
    // Log detailed information for debugging
    console.log(`Storage percentage calculation: ${actualBytes} / ${storageQuotaBytes} = ${percentage.toFixed(2)}% (Personal Knowledge enabled: ${isEnabled}, App context enabled: ${appContextEnabled})`);
    
    // Ensure percentage is between 0-100
    return Math.min(100, Math.max(0, percentage));
  };
  
  // No longer using storage status text
  
  // Save enabled setting for user knowledge
  const saveEnabledSetting = async (value) => {
    try {
      await AsyncStorage.setItem(USER_KNOWLEDGE_ENABLED_KEY, value.toString());
      setIsEnabled(value);
      
      // Save list of files with enabled setting
      if (value && documents.length > 0) {
        await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(documents));
        console.log(`Saved ${documents.length} files to ${USER_KNOWLEDGE_KEY}`);
      }
    } catch (error) {
      console.error('Error saving enabled setting:', error);
      Alert.alert('Error', 'Failed to save your settings. Please try again.');
    }
  };
  
  // Save app context enabled setting
  const saveAppContextEnabledSetting = async (value) => {
    try {
      await AsyncStorage.setItem(APP_CONTEXT_ENABLED_KEY, value.toString());
      setAppContextEnabled(value);
      console.log(`Saved app context enabled setting: ${value}`);
      
      // Recalculate storage usage after toggling app context to update the percentage
      await calculateStorageUsage();
    } catch (error) {
      console.error('Error saving app context enabled setting:', error);
      Alert.alert('Error', 'Failed to save your app context settings. Please try again.');
    }
  };

  // Handle toggle switches
  const toggleSwitch = () => {
    saveEnabledSetting(!isEnabled);
  };
  
  // Handle app context toggle
  const toggleAppContext = () => {
    saveAppContextEnabledSetting(!appContextEnabled);
  };
  
  // Document picker
  const pickDocument = async () => {
    try {
      console.log("Starting document picker...");
      setErrorMessage(null);
      
      // Open document picker
      const result = await DocumentPicker.getDocumentAsync({
        type: ALLOWED_FILE_TYPES,
        copyToCacheDirectory: true,
        multiple: false,
      });
      
      // Handle cancel
      if (result.canceled) {
        console.log('Document picker cancelled');
        return;
      }
      
      // Get the selected file
      const file = result.assets[0];
      console.log(`Selected file: ${file.name}, size: ${file.size} bytes, type: ${file.mimeType}`);
      
      // Set the pending file name for the animation
      setPendingFileName(file.name);
      
      // Check file size
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        Alert.alert(
          'File Too Large',
          `Maximum file size is ${MAX_FILE_SIZE_MB}MB. This file is ${fileSizeMB.toFixed(2)}MB.`,
          [{ text: 'OK' }]
        );
        setPendingFileName('');
        return;
      }
      
      // Start uploading/processing
      setIsUploading(true);
      setPendingFileName(file.name);

      // Track document upload achievement
      try {
        await FeatureExplorerTracker.trackDocumentUpload(
          {
            name: file.name,
            type: file.mimeType
          }, 
          showSuccess
        );
      } catch (error) {
        console.error('Error tracking document upload achievement:', error);
      }

      // Create a temporary document object
      const tempId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDoc = {
        id: tempId,
        name: file.name,
        uri: file.uri,
        type: file.mimeType || DocumentService.inferMimeType(file.name),
        size: file.size,  // Original size
        dateAdded: new Date().toISOString(),
        isProcessing: true,
        status: 'processing'
      };
      console.log("Created temporary document object:", newDoc);
      
      // Add to documents tracking list
      const updatedDocuments = [...documents, newDoc];
      console.log(`Added temp document to internal list, count: ${updatedDocuments.length}`);
      setDocuments(updatedDocuments);
      await DocumentService.saveDocuments(updatedDocuments);
      
      // Upload to server for processing
      try {
        console.log("Starting document upload for processing...");
        const result = await DocumentService.uploadDocument(file);
        console.log("Upload result:", result);
        
        if (result.success) {
          // Clear processing message
          setErrorMessage(null);
          
          // Update document with result
          const finalDoc = {
            ...newDoc,
            isProcessing: false,
            status: 'completed',
            size: result.processedSize,          // Use processed size as the primary size
            processedSize: result.processedSize,
            originalSize: result.originalSize,   // Keep original size for reference
            compressionRatio: result.originalSize > 0 ? 
              ((result.originalSize - result.processedSize) / result.originalSize * 100).toFixed(0) + '%' : 
              '0%',
            openaiFileId: result.fileId,
            openaiUploadError: false,
            openaiErrorMessage: null
          };
          console.log("Final document object:", finalDoc);
          
          // Update documents list
          const finalDocuments = updatedDocuments.map(doc => 
            doc.id === tempId ? finalDoc : doc
          );
          console.log(`Final documents count: ${finalDocuments.length}`);
          
          // Save updated documents to storage
          setDocuments(finalDocuments);
          await DocumentService.saveDocuments(finalDocuments);
          
          // Also update USER_KNOWLEDGE_KEY if enabled
          if (isEnabled) {
            await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(finalDocuments));
          }
          
          console.log('Document processed successfully:', result);
          
          // Force refresh to make sure UI updates
          setRefreshKey(prev => prev + 1);
          
          // Show success toast or alert
          Alert.alert(
            'Document Processed',
            `"${file.name}" was successfully processed and added to your knowledge base.`,
            [{ text: 'OK' }]
          );
        } else {
          // Handle error case
          const errorDoc = {
            ...newDoc,
            isProcessing: false,
            status: 'failed',
            openaiUploadError: true,
            openaiErrorMessage: result.error
          };
          console.log("Error document object:", errorDoc);
          
          // Update documents list
          const updatedDocsWithError = updatedDocuments.map(doc => 
            doc.id === tempId ? errorDoc : doc
          );
          
          // Save updated documents
          setDocuments(updatedDocsWithError);
          await DocumentService.saveDocuments(updatedDocsWithError);
          
          // Show error message
          setErrorMessage(result.error || 'Failed to process document. Please try again.');
        }
        
      } catch (error) {
        console.error('Error processing document:', error);
        
        // Update document with error
        const errorDoc = {
          ...newDoc,
          isProcessing: false,
          status: 'failed',
          openaiUploadError: true,
          openaiErrorMessage: error.message
        };
        console.log("Error document object:", errorDoc);
        
        // Update documents list
        const updatedDocsWithError = updatedDocuments.map(doc => 
          doc.id === tempId ? errorDoc : doc
        );
        console.log(`Updated documents count after error: ${updatedDocsWithError.length}`);
        
        // Save updated documents
        setDocuments(updatedDocsWithError);
        await DocumentService.saveDocuments(updatedDocsWithError);
        
        // Show error message
        setErrorMessage(error.message || 'Failed to process document. Please try again.');
      } finally {
        // Recalculate storage usage
        await calculateStorageUsage();
        setIsUploading(false);
        setPendingFileName(''); // Clear pending file name
      }
      
    } catch (error) {
      console.error('Error picking document:', error);
      setErrorMessage(error.message || 'Failed to add document. Please try again.');
      setIsUploading(false);
      setPendingFileName('');
    }
  };
  
  // Delete document
  const deleteDocument = (documentId) => {
    // Prevent deletion of system document
    if (documentId === APP_CONTEXT_DOCUMENT_ID) {
      showError('System documents cannot be deleted');
      return;
    }
    
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This will remove it from your knowledge base.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              setErrorMessage(null);
              
              console.log(`Starting deletion of document: ${documentId}`);
              
              // Capture storage before deletion for comparison
              const beforeSize = await DocumentService.getStorageUsage();
              console.log(`Storage before deletion: ${beforeSize} bytes`);
              
              // Use the DocumentService to delete the document
              const result = await DocumentService.deleteDocument(documentId);
              
              if (result) {
                // Update local state
                const updatedDocuments = documents.filter(d => d.id !== documentId);
                setDocuments(updatedDocuments);
                
                // Also update USER_KNOWLEDGE_KEY if enabled
                if (isEnabled) {
                  await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocuments));
                }
                
                // Close preview if open
                if (selectedDocument && selectedDocument.id === documentId) {
                  setDocumentPreviewVisible(false);
                  setSelectedDocument(null);
                }
                
                // Recalculate storage usage
                await calculateStorageUsage();
                
                console.log('Document deletion completed successfully');
              } else {
                console.error('Document deletion failed');
                setErrorMessage('Failed to delete document. Please try again.');
              }
            } catch (error) {
              console.error('Error deleting document:', error);
              setErrorMessage('Failed to delete document. Please try again.');
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };
  
  // View document details
  const viewDocument = (document) => {
    setSelectedDocument(document);
    setDocumentPreviewVisible(true);
  };

  // Calculate the storage percentage
  const storageUsedPercentage = calculateStoragePercentage();
  
  // Calculate responsive sizes based on device
  const iconSize = getByDeviceSize({
    small: 22,
    medium: 24,
    large: 26,
    tablet: 28
  });
  
  // Determine grid layout for document list on tablets
  const getDocumentGridLayout = () => {
    if (isTablet) {
      return {
        numColumns: isLandscape ? 3 : 2,
        columnWrapperStyle: { justifyContent: 'space-between' }
      };
    }
    return {
      numColumns: 1,
      columnWrapperStyle: undefined
    };
  };
  
  // Get adaptive document grid layout
  const documentGridLayout = getDocumentGridLayout();

  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.background,
          // Handle safe areas properly
          paddingTop: safeSpacing.hasDynamicIsland ? spacing.xs : 0,
        }
      ]}
      edges={['left', 'right']} // Let SafeAreaView handle left/right edges, we'll manually handle top/bottom
    >
      <View style={[
        styles.header,
        {
          paddingHorizontal: spacing.m,
          paddingTop: spacing.m,
          paddingBottom: spacing.s,
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.backButton,
            ensureAccessibleTouchTarget(scaleWidth(40), scaleWidth(40))
          ]}
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons 
            name="arrow-back" 
            size={scaleFontSize(24)} 
            color={theme.text} 
          />
        </TouchableOpacity>
        
        <Text 
          style={[
            styles.title, 
            { 
              color: theme.text,
              fontSize: fontSizes.xl,
              fontWeight: 'bold',
            }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          Personal Knowledge
        </Text>
        
        <View style={[
          styles.toggleContainer, 
          { 
            backgroundColor: isEnabled ? theme.primaryLight : theme.border,
            borderColor: isEnabled ? theme.primary : theme.textSecondary,
            borderRadius: scaleWidth(16),
            borderWidth: 1,
            paddingLeft: spacing.s,
            paddingRight: spacing.xxs,
            paddingVertical: spacing.xxs,
          }
        ]}>
          <Text 
            style={[
              styles.toggleText, 
              { 
                color: isEnabled ? theme.primary : theme.textSecondary,
                fontSize: isSmallDevice ? fontSizes.xs : fontSizes.s,
                fontWeight: '600',
                marginRight: spacing.xxs,
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            {isEnabled ? 'On' : 'Off'}
          </Text>
          
          <Switch
            trackColor={{ false: 'transparent', true: 'transparent' }}
            thumbColor={isEnabled ? theme.primary : theme.textSecondary}
            ios_backgroundColor="transparent"
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.toggle}
            accessible={true}
            accessibilityRole="switch"
            accessibilityLabel="Enable personal knowledge"
            accessibilityState={{ checked: isEnabled }}
            accessibilityHint={`Tap to turn ${isEnabled ? 'off' : 'on'} personal knowledge base`}
          />
        </View>
      </View>
      
      <View style={[
        styles.content,
        { 
          flex: 1,
          paddingHorizontal: spacing.m 
        }
      ]}>
        {isLoading ? (
          <View style={[
            styles.loadingContainer,
            {
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }
          ]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text 
              style={[
                styles.loadingText, 
                { 
                  color: theme.text,
                  marginTop: spacing.s,
                  fontSize: fontSizes.m,
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Loading your Personal Knowledge data...
            </Text>
          </View>
        ) : (
          <>
            {/* Storage Header */}
            <View style={[
              styles.storageContainer,
              { marginVertical: spacing.s }
            ]}>
              <View style={styles.storageTextContainer}>
                <View style={styles.titleContainer}>
                  <Text 
                    style={[
                      styles.storageText, 
                      { 
                        color: theme.text,
                        fontWeight: '500',
                        fontSize: fontSizes.m,
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Storage Usage
                  </Text>
                  <Text 
                    style={[
                      styles.percentageText, 
                      { 
                        color: theme.textSecondary,
                        fontSize: fontSizes.s,
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {" "}({storageUsedPercentage.toFixed(0)}%)
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.infoButton,
                    { padding: spacing.xxs }
                  ]}
                  onPress={() => setInfoModalVisible(true)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Storage information"
                  accessibilityHint="Shows information about storage limits"
                >
                  <Ionicons 
                    name="information-circle-outline" 
                    size={scaleFontSize(20)} 
                    color={theme.text} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Add console log to debug storage values */}
              {console.log(`Rendering progress bar with width: ${storageUsedPercentage}%, Bytes: ${storageUsedBytes}`)}
              
              <View style={[
                styles.progressBarContainer, 
                { 
                  backgroundColor: theme.border,
                  height: scaleHeight(12), // Slightly taller for better visibility
                  borderRadius: scaleWidth(6),
                  borderWidth: 1,
                  borderColor: 'rgba(0,0,0,0.1)',
                  marginTop: spacing.xxs,
                  overflow: 'hidden',
                }
              ]}>
                {/* Document storage section */}
                <View 
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.max(1, storageUsedPercentage)}%`, // Ensure at least 1% width for visibility
                    backgroundColor: theme.primary,
                  }}
                />
                
                {/* Warning overlay for high usage */}
                {storageUsedPercentage > 90 && (
                  <View
                    style={[
                      styles.progressBarWarning,
                      {
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: theme.danger,
                        borderRadius: scaleWidth(5),
                      }
                    ]}
                  />
                )}
              </View>
            </View>
            
            {/* Error Message */}
            {errorMessage && (
              <View style={[
                styles.errorContainer, 
                { 
                  backgroundColor: theme.errorLight,
                  padding: spacing.s,
                  borderRadius: scaleWidth(8),
                  marginVertical: spacing.xs,
                  flexDirection: 'row',
                  alignItems: 'center',
                }
              ]}>
                <Ionicons 
                  name="alert-circle" 
                  size={scaleFontSize(20)} 
                  color={theme.danger} 
                />
                <Text 
                  style={[
                    styles.errorText, 
                    { 
                      color: theme.danger,
                      marginLeft: spacing.xs,
                      flex: 1,
                      fontSize: fontSizes.s,
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {errorMessage}
                </Text>
              </View>
            )}
            
            {/* Documents Section Header */}
            <View style={[
              styles.sectionHeader,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: spacing.m,
                marginBottom: spacing.xs,
              }
            ]}>
              <Text 
                style={[
                  styles.sectionTitle, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.l,
                    fontWeight: '600',
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Documents {`(${documents.length})`}
              </Text>
              <View style={styles.buttonContainer}>
                {/* Optional manual refresh button (now that auto-update is enabled) */}
                <TouchableOpacity
                  style={[
                    styles.refreshButton,
                    {
                      backgroundColor: 'transparent',
                      borderWidth: 1,
                      borderColor: theme.border,
                      marginRight: spacing.s,
                      paddingHorizontal: spacing.xs,
                      paddingVertical: spacing.xxs,
                      borderRadius: scaleWidth(20),
                      flexDirection: 'row',
                      alignItems: 'center',
                    }
                  ]}
                  onPress={forceUpdateAppSummary}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Refresh app summary"
                  accessibilityHint="Manually refreshes the app context summary document"
                >
                  <Ionicons 
                    name="refresh" 
                    size={scaleFontSize(16)} 
                    color={theme.textSecondary} 
                  />
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontSize: isSmallDevice ? fontSizes.xxs : fontSizes.xs,
                      marginLeft: spacing.xxs,
                      fontWeight: '500',
                    }}
                  >
                    Refresh
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.addButton, 
                    { 
                      backgroundColor: theme.primary,
                      opacity: isEnabled && !isUploading ? 1 : 0.7,
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingHorizontal: spacing.s,
                      paddingVertical: spacing.xs,
                      borderRadius: scaleWidth(20),
                    }
                  ]}
                  onPress={pickDocument}
                  disabled={isUploading || !isEnabled}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Add document"
                  accessibilityHint="Opens the document picker to add a new document"
                  accessibilityState={{ 
                    disabled: isUploading || !isEnabled 
                  }}
                >
                  <Ionicons 
                    name="add" 
                    size={scaleFontSize(22)} 
                    color="#FFFFFF" 
                  />
                  <Text 
                    style={[
                      styles.addButtonText,
                      {
                        color: 'white',
                        fontWeight: '600',
                        fontSize: isSmallDevice ? fontSizes.xs : fontSizes.s,
                        marginLeft: spacing.xs,
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Add Document
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Document List */}
            {documents.length === 0 ? (
              <EmptyState 
                theme={theme}
                isLoading={isLoading}
                pickDocument={pickDocument}
              />
            ) : (
              <FlatList
                data={documents}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <DocumentItem 
                    item={item}
                    theme={theme}
                    onView={() => viewDocument(item)}
                    onDelete={() => deleteDocument(item.id)}
                    appContextEnabled={appContextEnabled}
                    onToggleAppContext={toggleAppContext}
                    // Pass responsive props to DocumentItem
                    responsive={{
                      fontSize: fontSizes,
                      spacing: spacing,
                      isSmallDevice: isSmallDevice,
                      isTablet: isTablet,
                      isLandscape: isLandscape,
                      width: isTablet ? 
                        (width - spacing.m * 2 - spacing.s * (documentGridLayout.numColumns - 1)) / documentGridLayout.numColumns : 
                        width - spacing.m * 2
                    }}
                  />
                )}
                contentContainerStyle={[
                  styles.documentsList,
                  { 
                    paddingBottom: safeSpacing.bottom + scaleHeight(20),
                  }
                ]}
                showsVerticalScrollIndicator={true}
                // Use adaptive grid layout for tablets
                numColumns={documentGridLayout.numColumns}
                columnWrapperStyle={documentGridLayout.columnWrapperStyle}
                // Add key to force re-render when layout changes
                key={`docs-${isLandscape ? 'landscape' : 'portrait'}-${documentGridLayout.numColumns}`}
              />
            )}
          </>
        )}
      </View>
      
      {/* Document Processing Animation */}
      <DocumentProcessingAnimation 
        visible={isUploading} 
        theme={theme}
        fileName={pendingFileName}
      />
      
      {/* Modals */}
      <InfoModal 
        visible={infoModalVisible}
        theme={theme}
        onClose={() => setInfoModalVisible(false)}
        storageLimit={`${STORAGE_QUOTA_KB}KB`}
        // Add responsive props for the modal
        responsive={{
          fontSize: fontSizes,
          spacing: spacing,
          scaleWidth: scaleWidth,
          scaleHeight: scaleHeight,
          isSmallDevice: isSmallDevice,
          isTablet: isTablet,
          safeSpacing: safeSpacing
        }}
      />
      
      <DocumentPreviewModal 
        visible={documentPreviewVisible}
        theme={theme}
        document={selectedDocument}
        onClose={() => setDocumentPreviewVisible(false)}
        onDelete={deleteDocument}
        // Add responsive props for the modal
        responsive={{
          fontSize: fontSizes,
          spacing: spacing,
          scaleWidth: scaleWidth,
          scaleHeight: scaleHeight,
          isSmallDevice: isSmallDevice,
          isTablet: isTablet,
          safeSpacing: safeSpacing
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggle: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  content: {
    flex: 1,
  },
  storageContainer: {
    borderRadius: 12,
  },
  storageTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  storageText: {
    fontWeight: '500',
  },
  percentageText: {
    fontSize: 14,
  },
  infoButton: {
    padding: 4,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBar: {
    height: '100%',
  },
  progressBarWarning: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  documentsList: {
    paddingBottom: 80,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
  }
});

export default PersonalKnowledgeScreen;
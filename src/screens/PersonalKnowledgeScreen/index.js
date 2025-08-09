// src/screens/PersonalKnowledgeScreen/index.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Platform,
  Modal,
  Animated
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
  const [isAppContextReady, setIsAppContextReady] = useState(false);
  const [storageUsedBytes, setStorageUsedBytes] = useState(0);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentPreviewVisible, setDocumentPreviewVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);
  const [pendingFileName, setPendingFileName] = useState('');
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [appContextInfoVisible, setAppContextInfoVisible] = useState(false);
  
  // Fade animations for smooth transitions
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const loadingOpacity = useRef(new Animated.Value(1)).current;
  
  // Track when app context is ready
  useEffect(() => {
    if (!appContext.isLoading && appContext.goals !== undefined && appContext.projects !== undefined && appContext.tasks !== undefined) {
      setIsAppContextReady(true);
    } else {
      setIsAppContextReady(false);
    }
  }, [appContext.isLoading, appContext.goals, appContext.projects, appContext.tasks]);
  
  // Handle smooth fade transition when loading completes
  useEffect(() => {
    if (!isLoading && isAppContextReady) {
      // Content is ready, fade from loading to content
      Animated.parallel([
        Animated.timing(loadingOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          delay: 100, // Slight delay for smoother transition
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Reset animations when loading starts
      contentOpacity.setValue(0);
      loadingOpacity.setValue(1);
    }
  }, [isLoading, isAppContextReady, contentOpacity, loadingOpacity]);
  
  // Load documents and settings
  useEffect(() => {
    // Use the enhanced refresh function for initial load
    refreshAppContextAndReload();
    
    // Add a refresh listener to reload data when the screen gains focus
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Screen focused, reloading data and refreshing app context');
      // Force a complete reload including app context refresh
      refreshAppContextAndReload();
    });
    
    return unsubscribe;
  }, [navigation, refreshKey]);
  
  // Auto-update app summary when app context data changes
  useEffect(() => {
    const updateAppSummaryIfNeeded = async () => {
      // Only update if app context is loaded and not currently loading
      if (!appContext.isLoading && appContext.goals && appContext.projects && appContext.tasks) {
        try {
          console.log('🔄 [APP CONTEXT DEBUG] App context data changed, auto-updating app summary');
          console.log('🔄 [APP CONTEXT DEBUG] Goals:', appData.goals.length, 'Projects:', appData.projects.length, 'Tasks:', appData.tasks.length);
          
          const appData = {
            goals: appContext.goals || [],
            projects: appContext.projects || [],
            tasks: appContext.tasks || [],
            settings: appContext.settings || {}
          };
          
          // Generate summary
          const summary = AppSummaryService.generateAppSummary(appData);
          console.log('🔄 [APP CONTEXT DEBUG] Generated summary length:', summary.length, 'chars');
          
          // Update system document
          await DocumentService.updateAppContextDocument(summary);
          console.log('✅ [APP CONTEXT DEBUG] App summary auto-updated successfully');
          
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
  
  // Force refresh app context and reload all data
  const refreshAppContextAndReload = async () => {
    try {
      console.log('🔄 Force refreshing app context and reloading data');
      setIsLoading(true);
      setErrorMessage(null);
      
      // Wait for app context to be ready if it's currently loading
      let retryCount = 0;
      const maxRetries = 10;
      
      while (appContext.isLoading && retryCount < maxRetries) {
        console.log(`Waiting for app context to load... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 500));
        retryCount++;
      }
      
      // If app context is still loading after retries, proceed anyway
      if (appContext.isLoading) {
        console.warn('App context still loading after retries, proceeding anyway');
      }
      
      // Force update the app summary with current data
      if (!appContext.isLoading) {
        console.log('🔄 Forcing app context update on screen focus');
        
        const appData = {
          goals: appContext.goals || [],
          projects: appContext.projects || [],
          tasks: appContext.tasks || [],
          settings: appContext.settings || {}
        };
        
        // Generate fresh summary
        const summary = AppSummaryService.generateAppSummary(appData);
        console.log('🔄 Generated fresh app summary:', summary.length, 'characters');
        
        // Update system document
        await DocumentService.updateAppContextDocument(summary);
        console.log('✅ App context document updated on screen focus');
      }
      
      // Now load all documents and settings
      await loadData();
      
    } catch (error) {
      console.error('Error in refreshAppContextAndReload:', error);
      // Fallback to regular loadData if refresh fails
      await loadData();
    }
  };

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
        status: 'processing',
        aiAccessEnabled: true  // Default to AI access enabled for new documents
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
          
          // Show success notification
          showSuccess(`"${file.name}" processed successfully!`);
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
    
    // Find the document to get its name for the confirmation
    const document = documents.find(doc => doc.id === documentId);
    setDocumentToDelete(document);
    setDeleteConfirmVisible(true);
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    
    setDeleteConfirmVisible(false);
    
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      console.log(`Starting deletion of document: ${documentToDelete.id}`);
      
      // Capture storage before deletion for comparison
      const beforeSize = await DocumentService.getStorageUsage();
      console.log(`Storage before deletion: ${beforeSize} bytes`);
      
      // Use the DocumentService to delete the document
      const result = await DocumentService.deleteDocument(documentToDelete.id);
      
      if (result) {
        // Update local state
        const updatedDocuments = documents.filter(d => d.id !== documentToDelete.id);
        setDocuments(updatedDocuments);
        
        // Also update USER_KNOWLEDGE_KEY if enabled
        if (isEnabled) {
          await AsyncStorage.setItem(USER_KNOWLEDGE_KEY, JSON.stringify(updatedDocuments));
        }
        
        // Close preview if open
        if (selectedDocument && selectedDocument.id === documentToDelete.id) {
          setDocumentPreviewVisible(false);
          setSelectedDocument(null);
        }
        
        // Recalculate storage usage
        await calculateStorageUsage();
        
        console.log('Document deletion completed successfully');
        showSuccess('Document deleted successfully');
      } else {
        console.error('Document deletion failed');
        setErrorMessage('Failed to delete document. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      setErrorMessage('Failed to delete document. Please try again.');
    } finally {
      setIsLoading(false);
      setDocumentToDelete(null);
    }
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
          backgroundColor: '#000000', // Match AI screen black background
        }
      ]}
      edges={['left', 'right']} 
    >
      {/* Floating Header Banner with Title */}
      <View style={[
        styles.floatingHeader,
        {
          paddingHorizontal: spacing.m,
          paddingTop: Platform.OS === 'ios' ? (safeSpacing.hasDynamicIsland ? 65 : 55) : 30,
          paddingBottom: spacing.m,
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.iconBubble,
            {
              width: isTablet ? 44 : isSmallDevice ? 36 : 38,
              height: isTablet ? 44 : isSmallDevice ? 36 : 38,
              borderRadius: (isTablet ? 44 : isSmallDevice ? 36 : 38) / 2
            }
          ]}
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons 
            name="arrow-back" 
            size={isTablet ? 24 : 22} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        
        {/* Title in Header */}
        <Text 
          style={[
            styles.headerTitle, 
            { 
              color: '#FFFFFF',
              fontSize: fontSizes.l,
              fontWeight: '700',
              textAlign: 'center',
              letterSpacing: 0.3,
              flex: 1,
            }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          Personal Knowledge
        </Text>
        
        {/* Info button in top right */}
        <TouchableOpacity
          style={[
            styles.iconBubble,
            {
              width: isTablet ? 44 : isSmallDevice ? 36 : 38,
              height: isTablet ? 44 : isSmallDevice ? 36 : 38,
              borderRadius: (isTablet ? 44 : isSmallDevice ? 36 : 38) / 2,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
            }
          ]}
          onPress={() => setInfoModalVisible(true)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Personal Knowledge information"
          accessibilityHint="Shows information about Personal Knowledge features"
        >
          <Ionicons 
            name="information-circle" 
            size={isTablet ? 24 : 22} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        
      </View>
      
      {/* Main Content - Maximum Height */}
      <View style={[
        styles.content,
        { 
          flex: 1,
          paddingHorizontal: spacing.s,
          marginTop: Platform.OS === 'ios' ? (safeSpacing.hasDynamicIsland ? 90 : 85) : 65, // Much smaller space for floating header
        }
      ]}>
        {/* Loading State - Animated */}
        <Animated.View 
          style={[
            styles.loadingContainer,
            {
              opacity: loadingOpacity,
              position: 'absolute',
              top: 0,
              left: spacing.s,
              right: spacing.s,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2,
            }
          ]}
          pointerEvents={(isLoading || appContext.isLoading || !isAppContextReady) ? 'auto' : 'none'}
        >
          <ActivityIndicator size="large" color={theme.primary} />
          <Text 
            style={[
              styles.loadingText, 
              { 
                marginTop: spacing.s,
                fontSize: fontSizes.m,
                fontWeight: '500',
                color: '#FFFFFF',
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            {appContext.isLoading 
              ? 'Loading app context...' 
              : !isAppContextReady 
                ? 'Preparing app context...'
                : 'Loading your Personal Knowledge data...'}
          </Text>
        </Animated.View>

        {/* Main Content - Animated */}
        <Animated.View 
          style={[
            { 
              opacity: contentOpacity,
              flex: 1,
            }
          ]}
          pointerEvents={(!isLoading && isAppContextReady) ? 'auto' : 'none'}
        >
          <>
            {/* Clean Storage Card - Much Higher Position */}
            <View style={[
              styles.storageCard,
              { 
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 16,
                padding: spacing.m,
                marginTop: 0, // No top margin - start immediately
                marginBottom: spacing.s, // Reduced bottom margin
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }
            ]}>
              <View style={styles.storageHeader}>
                <Text 
                  style={[
                    styles.storageTitle, 
                    { 
                      color: '#FFFFFF',
                      fontWeight: '600',
                      fontSize: fontSizes.m,
                      letterSpacing: 0.3,
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Storage Usage
                </Text>
                <Text 
                  style={[
                    styles.storagePercentage, 
                    { 
                      color: storageUsedPercentage > 90 ? '#FF6B6B' : '#FFFFFF',
                      fontWeight: '600',
                      fontSize: fontSizes.s,
                      opacity: 0.8
                    }
                  ]}
                  maxFontSizeMultiplier={1.2}
                >
                  {storageUsedPercentage.toFixed(1)}%
                </Text>
              </View>
              
              {/* Minimalist Progress Bar */}
              <View style={[
                styles.progressBar, 
                { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  height: 6,
                  borderRadius: 3,
                  marginTop: spacing.s,
                  overflow: 'hidden',
                }
              ]}>
                <View 
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${Math.max(2, storageUsedPercentage)}%`,
                    backgroundColor: storageUsedPercentage > 90 ? '#FF6B6B' : theme.primary,
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
            
            {/* Clean Error Message */}
            {errorMessage && (
              <View style={[
                styles.errorCard, 
                { 
                  backgroundColor: 'rgba(255, 107, 107, 0.1)',
                  borderColor: 'rgba(255, 107, 107, 0.3)',
                  borderWidth: 1,
                  padding: spacing.m,
                  borderRadius: 12,
                  marginVertical: spacing.s,
                  flexDirection: 'row',
                  alignItems: 'center',
                }
              ]}>
                <Ionicons 
                  name="alert-circle" 
                  size={20} 
                  color="#FF6B6B" 
                  style={{ marginRight: spacing.s }}
                />
                <Text 
                  style={[
                    styles.errorText, 
                    { 
                      color: '#FF6B6B',
                      flex: 1,
                      fontSize: fontSizes.s,
                      fontWeight: '500',
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {errorMessage}
                </Text>
              </View>
            )}
            
            {/* Clean Section Header - Much Higher Position */}
            <View style={[
              styles.sectionHeader,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 0, // No top margin - start immediately after storage
                marginBottom: spacing.s, // Reduced bottom margin
                paddingHorizontal: spacing.s,
              }
            ]}>
              <Text 
                style={[
                  styles.sectionTitle, 
                  { 
                    color: '#FFFFFF',
                    fontSize: fontSizes.l,
                    fontWeight: '700',
                    letterSpacing: 0.3,
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Documents
              </Text>
              
              <View style={styles.headerActions}>
                <Text 
                  style={[
                    styles.documentCount,
                    { 
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: fontSizes.s,
                      fontWeight: '500',
                      marginRight: spacing.m,
                    }
                  ]}
                >
                  {documents.length} {documents.length === 1 ? 'file' : 'files'}
                </Text>
                
                {/* Floating Action Button */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { 
                        backgroundColor: isEnabled && !isUploading ? theme.primary : 'rgba(255, 255, 255, 0.2)',
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        justifyContent: 'center',
                        alignItems: 'center',
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
                      size={18} 
                      color="#FFFFFF" 
                    />
                  </TouchableOpacity>
                </View>
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
                    onToggleDocumentAccess={async (docId, enabled) => {
                      console.log('Toggling document access:', docId, enabled);
                      try {
                        // Update the document's aiAccessEnabled property
                        const updatedDocs = documents.map(doc => 
                          doc.id === docId 
                            ? { ...doc, aiAccessEnabled: enabled }
                            : doc
                        );
                        
                        // Save to storage
                        const success = await DocumentService.saveDocuments(updatedDocs);
                        
                        if (success) {
                          // Update local state
                          setDocuments(updatedDocs);
                          
                          // Recalculate storage usage using DocumentService (which now filters by enabled documents)
                          await calculateStorageUsage();
                          
                          console.log(`Document access toggled: ${enabled ? 'enabled' : 'disabled'} for document ${docId}`);
                        } else {
                          console.error('Failed to save document access changes');
                        }
                      } catch (error) {
                        console.error('Error toggling document access:', error);
                      }
                    }}
                    onShowAppContextInfo={() => setAppContextInfoVisible(true)}
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
        </Animated.View>
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

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmVisible && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={deleteConfirmVisible}
          onRequestClose={() => setDeleteConfirmVisible(false)}
        >
          <View style={styles.deleteModalOverlay}>
            <View style={[styles.deleteModalContainer, { backgroundColor: '#000000' }]}>
              <Text style={[styles.deleteModalTitle, { color: theme.text }]}>
                Delete Document
              </Text>
              <Text style={[styles.deleteModalMessage, { color: theme.textSecondary }]}>
                Are you sure you want to delete "{documentToDelete?.name}"? This will remove it from your knowledge base permanently.
              </Text>
              
              <View style={styles.deleteModalButtons}>
                <TouchableOpacity
                  style={[styles.deleteModalButton, styles.deleteCancelButton, { backgroundColor: theme.background }]}
                  onPress={() => setDeleteConfirmVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.deleteButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.deleteModalButton, styles.deleteConfirmButton]}
                  onPress={handleConfirmDelete}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.deleteButtonText, styles.deleteConfirmText]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* App Context Info Modal - same style as top right info modal */}
      <InfoModal 
        visible={appContextInfoVisible}
        theme={theme}
        onClose={() => setAppContextInfoVisible(false)}
        title="App Context Information"
        content={{
          sections: [
            {
              title: "What is App Context?",
              text: "Turning this on gives the AI knowledge about your current app data, enabling personalized suggestions and seamless assistance with achieving your goals."
            },
            {
              title: "The AI can reference your:",
              bullets: [
                "Goals and their progress",
                "Projects and tasks",
                "Life direction and strategic planning"
              ]
            },
            {
              title: "The AI can also create and update:",
              bullets: [
                "New goals and projects",
                "Tasks and to-dos",
                "Time blocks in your schedule",
                "Your strategic life direction"
              ]
            },
            {
              title: "Privacy & Control",
              text: "You can toggle this off at any time to disable app context sharing. Your data remains secure and is only used to enhance your AI experience."
            }
          ]
        }}
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
  // Floating header like AI screen
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 100,
    backgroundColor: 'transparent',
  },
  iconBubble: {
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  toggleBubble: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  // Clean storage card
  storageCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  storageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storagePercentage: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoIconButton: {
    padding: 4,
  },
  progressBar: {
    position: 'relative',
  },
  // Clean error card
  errorCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Section header styles
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  documentsList: {
    paddingBottom: 80,
  },
  // Custom delete modal styles - matching logout modal
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  deleteModalContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  deleteModalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
    fontWeight: '400',
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  deleteConfirmButton: {
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  deleteConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default PersonalKnowledgeScreen;
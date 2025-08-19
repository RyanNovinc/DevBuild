// src/screens/ProfileScreen/FinancialTracker/DetailModal.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Import tab components
import SummaryTab from './SummaryTab';
import IncomeTab from './IncomeTab';
import ExpensesTab from './ExpensesTab.js';
import GoalsTab from './GoalsTab';

// Import React Navigation for swipe tabs
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Import currency components
import CurrencyModal from './SummaryTab/components/CurrencyModal';
import CurrencyInfoModal from './SummaryTab/components/CurrencyInfoModal';
import CurrencyService from './CurrencyService';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// Create tab navigator for swipe navigation
const Tab = createMaterialTopTabNavigator();

const DetailModal = ({ visible, theme, data, handlers, onClose, widgetName }) => {
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showCurrencyInfoModal, setShowCurrencyInfoModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [showSaveDataModal, setShowSaveDataModal] = useState(false);
  const [savedInstances, setSavedInstances] = useState([]);
  const [fileToDelete, setFileToDelete] = useState(null); // {id, name}
  const [showStorageLimitMsg, setShowStorageLimitMsg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showTitleEditModal, setShowTitleEditModal] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [currentTitle, setCurrentTitle] = useState(widgetName || 'Financial Tracker');
  
  // Access currency data from props
  const { financialData, formatCurrency } = data;
  const { setCurrency } = handlers || {};
  
  // Update current title when widgetName changes
  useEffect(() => {
    setCurrentTitle(widgetName || 'Financial Tracker');
  }, [widgetName]);
  
  // Initialize exchange rates when modal opens
  useEffect(() => {
    if (visible) {
      // We'll handle exchange rates in the main FinancialTracker component
      // after CurrencyService is properly implemented
    }
  }, [visible]);
  
  // Initialize exchange rates
  const initializeExchangeRates = async () => {
    try {
      // This will be implemented when CurrencyService is ready
      setLastUpdated(new Date().toLocaleDateString());
    } catch (error) {
      console.error('Error initializing exchange rates:', error);
    }
  };
  
  // Handle currency selection
  const handleCurrencySelect = (selectedCurrency) => {
    // Close the currency modal
    setShowCurrencyModal(false);
    
    // Call parent handler if available
    if (setCurrency) {
      setCurrency(selectedCurrency);
      // Removed the conditional that automatically shows the info modal
    } else {
      // Alert if handler not provided
      Alert.alert('Error', 'Unable to change currency. Please try again later.');
    }
  };

  // Handle title editing
  const handleTitlePress = () => {
    if (!handlers?.onUpdateTitle) return;
    
    setTempTitle(currentTitle);
    setShowTitleEditModal(true);
  };

  const handleTitleSave = async () => {
    // Dismiss keyboard immediately to prevent interference
    Keyboard.dismiss();
    
    if (!tempTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    
    if (handlers?.onUpdateTitle) {
      const newTitle = tempTitle.trim();
      // Update local state immediately
      setCurrentTitle(newTitle);
      // Update the backend and get the updated data
      const updatedData = await handlers.onUpdateTitle(newTitle);
      
      // Save the financial tracker data with the updated title
      if (handlers.saveCurrentFinancialData && updatedData) {
        await handlers.saveCurrentFinancialData(updatedData);
      }
      
      // Refresh saved instances to reflect the title change
      setTimeout(async () => {
        await loadSavedInstances();
      }, 100);
    }
    setShowTitleEditModal(false);
  };

  const handleTitleCancel = () => {
    setShowTitleEditModal(false);
    setTempTitle('');
  };

  // Load all saved financial tracker instances (limit to 3)
  // Load saved financial data instances  
  const loadSavedInstances = async () => {
    try {
      // First clean up any excess files
      await cleanupExcessFiles();
      
      const keys = await AsyncStorage.getAllKeys();
      const financialKeys = keys.filter(key => key.startsWith('widget_data_financial_'));
      
      const instances = [];

      for (const key of financialKeys) {
        const dataJson = await AsyncStorage.getItem(key);
        if (dataJson) {
          const parsedData = JSON.parse(dataJson);
          instances.push({
            id: key,
            name: parsedData.title || 'Financial Data',
            lastUpdated: parsedData.lastUpdated || 'Unknown',
            totalIncome: (parsedData.incomeSources || []).reduce((sum, item) => sum + item.amount, 0),
            totalExpenses: (parsedData.expenses || []).reduce((sum, item) => sum + item.amount, 0),
            currency: parsedData.currency || '$'
          });
        }
      }
      
      // Sort by last updated (newest first) and limit to 3
      const sortedInstances = instances
        .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
        .slice(0, 3);
        
      setSavedInstances(sortedInstances);
    } catch (error) {
      console.error('Error loading saved instances:', error);
    }
  };

  // Load a specific saved instance
  const loadSavedInstance = async (instance) => {
    try {
      const dataJson = await AsyncStorage.getItem(instance.id);
      if (dataJson && handlers.loadSavedFinancialData) {
        const parsedData = JSON.parse(dataJson);
        await handlers.loadSavedFinancialData(parsedData);
        setShowSaveDataModal(false);
      }
    } catch (error) {
      console.error('Error loading saved instance:', error);
    }
  };

  // Handle closing modal with automatic saving
  const handleClose = async () => {
    setIsSaving(true);
    try {
      // Automatically save current data when closing
      if (handlers.saveCurrentFinancialData) {
        await handlers.saveCurrentFinancialData();
      }
      
      // Add a minimum delay to ensure the user sees the saving indicator
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('Error auto-saving financial data:', error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  // Clean up excess files to maintain 3-file limit
  const cleanupExcessFiles = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const financialKeys = keys.filter(key => key.startsWith('widget_data_financial_'));
      
      if (financialKeys.length > 3) {
        // Get all files with timestamps
        const filesWithTime = [];
        for (const key of financialKeys) {
          const dataJson = await AsyncStorage.getItem(key);
          if (dataJson) {
            const parsedData = JSON.parse(dataJson);
            filesWithTime.push({
              id: key,
              lastUpdated: parsedData.lastUpdated || new Date(0).toISOString()
            });
          }
        }
        
        // Sort by last updated and keep only newest 3
        const sortedFiles = filesWithTime.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        const filesToDelete = sortedFiles.slice(3); // Everything after first 3
        
        // Delete excess files
        for (const file of filesToDelete) {
          await AsyncStorage.removeItem(file.id);
        }
      }
    } catch (error) {
      console.error('Error cleaning up excess files:', error);
    }
  };

  // Delete saved instance
  const deleteSavedInstance = async (instanceId, instanceName) => {
    try {
      await AsyncStorage.removeItem(instanceId);
      await loadSavedInstances(); // Refresh the list
    } catch (error) {
      console.error('Error deleting instance:', error);
    }
  };

  // Start fresh with new financial data
  const startFreshFinancialData = async () => {
    try {
      const savedInstancesCount = savedInstances.length;
      if (savedInstancesCount >= 3) {
        setShowStorageLimitMsg(true);
        return;
      }

      if (handlers.startFreshFinancialData) {
        await handlers.startFreshFinancialData();
        
        // Auto-save the fresh data so it appears in saved files
        if (handlers.saveCurrentFinancialData) {
          await handlers.saveCurrentFinancialData();
          // Small delay to ensure data is saved before refreshing
          setTimeout(async () => {
            await loadSavedInstances();
          }, 100);
        }
        
        setShowSaveDataModal(false);
      }
    } catch (error) {
      console.error('Error starting fresh:', error);
    }
  };
  

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.detailModalContainer, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.detailHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={handleClose}
            disabled={isSaving}
          >
            {isSaving ? (
              <Ionicons name="ellipsis-horizontal" size={24} color={theme.textSecondary} />
            ) : (
              <Ionicons name="arrow-back" size={24} color={theme.text} />
            )}
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <TouchableOpacity 
              style={styles.titlePressable}
              onPress={handleTitlePress}
              disabled={!handlers?.onUpdateTitle}
            >
              <Text style={[styles.detailTitle, { color: theme.text }]}>
                {currentTitle}
              </Text>
              {handlers?.onUpdateTitle && (
                <Ionicons name="pencil" size={16} color={theme.textSecondary} style={styles.titleEditIcon} />
              )}
            </TouchableOpacity>
            {isSaving && (
              <View style={styles.savingIndicator}>
                <Ionicons name="cloud-upload-outline" size={18} color={theme.primary} />
                <Text style={[styles.savingText, { color: theme.primary }]}>Saving...</Text>
              </View>
            )}
          </View>
          
          {/* Header actions */}
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.saveDataButton}
              onPress={() => {
                loadSavedInstances();
                setShowSaveDataModal(true);
              }}
            >
              <Ionicons name="folder-outline" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowCurrencyInfoModal(true)}
            >
              <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Tab Navigation with Swipe Support */}
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: { 
              backgroundColor: theme.cardElevated || '#1F1F1F',
              borderRadius: 25,
              marginHorizontal: 16,
              marginVertical: 8,
              height: 44,
            },
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: '600',
              marginTop: -4, // Move text higher
            },
            tabBarIconStyle: {
              marginRight: 2, // Reduce spacing between icon and text
              marginTop: 3, // Move icon down
            },
            tabBarIndicatorStyle: { 
              backgroundColor: theme.primary,
              height: 38,
              borderRadius: 20,
              marginBottom: 3,
              marginLeft: 3,
              width: Math.floor((width - 38) / 4) - 6,
              zIndex: 1,
            },
            tabBarItemStyle: {
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            },
            swipeEnabled: true,
          }}
        >
          <Tab.Screen 
            name="Summary" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: -4
                }}>
                  Summary
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'stats-chart' : 'stats-chart-outline'} 
                  size={16} 
                  color={focused ? '#FFFFFF' : theme.textSecondary} 
                />
              )
            }}
          >
            {() => (
              <View style={[styles.tabContent, { backgroundColor: theme.background }]}>
                <SummaryTab theme={theme} data={data} handlers={handlers} />
              </View>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Income" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: -4
                }}>
                  Income
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'cash' : 'cash-outline'} 
                  size={16} 
                  color={focused ? '#FFFFFF' : theme.textSecondary} 
                />
              )
            }}
          >
            {() => (
              <View style={[styles.tabContent, { backgroundColor: theme.background }]}>
                <IncomeTab theme={theme} data={data} handlers={handlers} />
              </View>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Expenses" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: -4
                }}>
                  Expenses
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'cart' : 'cart-outline'} 
                  size={16} 
                  color={focused ? '#FFFFFF' : theme.textSecondary} 
                />
              )
            }}
          >
            {() => (
              <View style={[styles.tabContent, { backgroundColor: theme.background }]}>
                <ExpensesTab theme={theme} data={data} handlers={handlers} />
              </View>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Goals" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : theme.textSecondary,
                  fontSize: 13,
                  fontWeight: '600',
                  marginTop: -4
                }}>
                  Goals
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'flag' : 'flag-outline'} 
                  size={16} 
                  color={focused ? '#FFFFFF' : theme.textSecondary} 
                />
              )
            }}
          >
            {() => (
              <View style={[styles.tabContent, { backgroundColor: theme.background }]}>
                <GoalsTab theme={theme} data={data} handlers={handlers} />
              </View>
            )}
          </Tab.Screen>
        </Tab.Navigator>
        
        {/* Currency Selection Modal */}
        <CurrencyModal 
          visible={showCurrencyModal}
          onClose={() => setShowCurrencyModal(false)}
          onSelect={handleCurrencySelect}
          theme={theme}
          currentCurrency={financialData.currency}
        />
        
        {/* Currency Info Modal */}
        <CurrencyInfoModal
          visible={showCurrencyInfoModal}
          onClose={() => setShowCurrencyInfoModal(false)}
          theme={theme}
          lastUpdated={lastUpdated}
        />
        
        {/* Title Edit Modal - EXACT copy from StreakDetailScreen.js */}
        {showTitleEditModal && (
          <Modal
            visible={showTitleEditModal}
            animationType="fade"
            transparent={true}
            onRequestClose={handleTitleCancel}
          >
            <KeyboardAvoidingView 
              style={styles.cleanModalOverlay} 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 20}
              enabled
            >
              <View style={styles.titleEditModalContainer}>
                {/* Header */}
                <View style={styles.titleEditModalHeader}>
                  <View style={styles.cleanModalIconContainer}>
                    <Ionicons name="create-outline" size={24} color="#3B82F6" />
                  </View>
                  <Text style={styles.cleanModalTitle}>Edit Financial Tracker Name</Text>
                  <Text style={styles.cleanModalSubtitle}>
                    Choose a memorable name for your financial tracker
                  </Text>
                </View>

                {/* Text Input */}
                <View style={styles.titleEditInputContainer}>
                  <TextInput
                    style={styles.titleEditInput}
                    value={tempTitle}
                    onChangeText={setTempTitle}
                    autoFocus
                    maxLength={40}
                    placeholder="Enter tracker name"
                    placeholderTextColor="#8E8E93"
                    multiline={false}
                    returnKeyType="done"
                    onSubmitEditing={handleTitleSave}
                    blurOnSubmit={false}
                  />
                </View>

                {/* Action Buttons */}
                <View style={styles.titleEditActions}>
                  <TouchableOpacity 
                    style={[styles.cleanActionButton, styles.cancelButton]}
                    onPress={handleTitleCancel}
                  >
                    <Text style={styles.cleanActionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.cleanActionButton, styles.titleSaveButton]}
                    onPress={handleTitleSave}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.cleanActionButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        )}
        
        {/* Save Data Modal - EXACT copy from StreakDetailScreen.js */}
        {showSaveDataModal && (
          <Modal
            visible={showSaveDataModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => {
              setFileToDelete(null);
              setShowStorageLimitMsg(false);
              setShowSaveDataModal(false);
            }}
          >
            <View style={styles.cleanModalOverlay}>
              <View style={styles.cleanModalContainer}>
                {/* Header */}
                <View style={styles.cleanModalHeader}>
                  <View style={styles.cleanModalIconContainer}>
                    <Ionicons 
                      name={
                        fileToDelete ? "trash-outline" : 
                        showStorageLimitMsg ? "archive" : 
                        "folder-outline"
                      } 
                      size={24} 
                      color={
                        fileToDelete ? "#EF4444" : 
                        showStorageLimitMsg ? "#F97316" : 
                        "#8E8E93"
                      } 
                    />
                  </View>
                  <Text style={styles.cleanModalTitle}>
                    {fileToDelete ? "Delete File?" : 
                     showStorageLimitMsg ? "Storage Limit Reached" : 
                     "Financial Files"}
                  </Text>
                  <Text style={styles.cleanModalSubtitle}>
                    {fileToDelete 
                      ? `Are you sure you want to delete "${fileToDelete.name}"? This cannot be undone.`
                      : showStorageLimitMsg 
                      ? "You've reached the maximum of 3 saved financial trackers. Please delete an existing tracker to continue."
                      : "Manage your saved financial data"}
                  </Text>
                </View>

                {/* Action buttons for delete/storage confirmation */}
                {fileToDelete ? (
                  <>
                    {/* Delete confirmation buttons */}
                    <View style={styles.cleanModalActions}>
                      <TouchableOpacity 
                        style={[styles.cleanActionButton, styles.cancelButton]}
                        onPress={() => setFileToDelete(null)}
                      >
                        <Text style={styles.cleanActionButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.cleanActionButton, styles.deleteButton]}
                        onPress={async () => {
                          await deleteSavedInstance(fileToDelete.id, fileToDelete.name);
                          setFileToDelete(null);
                        }}
                      >
                        <Text style={styles.cleanActionButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : showStorageLimitMsg ? (
                  // Storage limit message - single button
                  <View style={styles.cleanModalActions}>
                    <TouchableOpacity 
                      style={[styles.cleanActionButton, styles.storageOkButton]}
                      onPress={() => setShowStorageLimitMsg(false)}
                    >
                      <Text style={styles.cleanActionButtonText}>Got it</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  // Normal files view
                  <>
                    {/* Files container */}
                    <View style={styles.cleanFilesContainer}>
                      {savedInstances.length > 0 ? (
                        savedInstances.map((instance, index) => (
                          <TouchableOpacity
                            key={instance.id}
                            style={styles.cleanFileItem}
                            onPress={() => loadSavedInstance(instance)}
                          >
                            <View style={styles.cleanFileIconContainer}>
                              <Ionicons name="document-outline" size={20} color="#8E8E93" />
                            </View>
                            <View style={styles.cleanFileInfo}>
                              <Text style={styles.cleanFileName}>{instance.name}</Text>
                              <Text style={styles.cleanFileStats}>
                                Income: {instance.currency}{instance.totalIncome} • Expenses: {instance.currency}{instance.totalExpenses}
                              </Text>
                            </View>
                            <TouchableOpacity
                              style={styles.cleanDeleteButton}
                              onPress={(e) => {
                                e.stopPropagation();
                                setFileToDelete({ id: instance.id, name: instance.name });
                              }}
                            >
                              <Ionicons name="trash-outline" size={16} color="#EF4444" />
                            </TouchableOpacity>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <View style={styles.cleanEmptyState}>
                          <Ionicons name="folder-open-outline" size={32} color="#48484A" />
                          <Text style={styles.cleanEmptyText}>No saved files</Text>
                        </View>
                      )}
                    </View>

                    {/* Action buttons */}
                    <View style={styles.cleanModalActions}>
                      <TouchableOpacity 
                        style={[styles.cleanActionButton, styles.saveButton]}
                        onPress={startFreshFinancialData}
                      >
                        <Text style={styles.cleanActionButtonText}>Start Fresh</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.cleanCloseButton}
                  onPress={() => {
                    setFileToDelete(null); // Reset delete state
                    setShowStorageLimitMsg(false); // Reset storage limit state
                    setShowSaveDataModal(false);
                  }}
                >
                  <Text style={styles.cleanCloseButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  detailModalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 0 : 30,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeModalButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titlePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleEditIcon: {
    marginLeft: 8,
    opacity: 0.6,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  savingText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveDataButton: {
    padding: 4,
    marginRight: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  infoButton: {
    padding: 4,
  },
  tabContent: {
    flex: 1,
    paddingTop: 4,
  },
  // Save data modal styles
  saveDataModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  saveDataModalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    maxHeight: '80%',
  },
  saveDataModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveDataModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveDataDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  savedInstancesContainer: {
    maxHeight: 300,
    marginBottom: 20,
  },
  savedInstanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  savedInstanceInfo: {
    flex: 1,
  },
  savedInstanceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  savedInstanceStats: {
    fontSize: 14,
    marginBottom: 4,
  },
  savedInstanceDate: {
    fontSize: 12,
  },
  noSavedDataContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noSavedDataText: {
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  startFreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startFreshButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  // Clean modal styles - EXACT copy from StreakDetailScreen.js
  cleanModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  cleanModalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    maxWidth: 400,
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  cleanModalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  cleanModalIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cleanModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  cleanModalSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  cleanModalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  cleanActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#3B82F6',
  },
  cancelButton: {
    backgroundColor: '#6B7280',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  storageOkButton: {
    backgroundColor: '#F97316',
  },
  cleanActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cleanFilesContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    maxHeight: 240,
  },
  cleanFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    marginBottom: 8,
  },
  cleanFileIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cleanFileInfo: {
    flex: 1,
  },
  cleanFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  cleanFileStats: {
    fontSize: 12,
    color: '#8E8E93',
  },
  cleanDeleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF453A20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cleanEmptyState: {
    alignItems: 'center',
    padding: 40,
  },
  cleanEmptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 12,
  },
  cleanCloseButton: {
    margin: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#3A3A3C',
    backgroundColor: '#1C1C1E',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  cleanCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  // Title Edit Modal Styles - EXACT copy from StreakDetailScreen.js
  titleEditModalContainer: {
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    maxWidth: 340,
    width: '90%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  titleEditModalHeader: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  titleEditInputContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  titleEditInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  titleEditActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  titleSaveButton: {
    backgroundColor: '#3B82F6',
  },
});

export default DetailModal;
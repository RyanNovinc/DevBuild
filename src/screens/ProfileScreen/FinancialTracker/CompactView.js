// src/screens/ProfileScreen/FinancialTracker/CompactView.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { spacing, fontSizes, scaleWidth } from '../../../utils/responsive';

const CompactView = ({ theme, data, openDetailModal, widgetName, handlers }) => {
  const [showSaveDataModal, setShowSaveDataModal] = useState(false);
  const [savedInstances, setSavedInstances] = useState([]);
  const [fileToDelete, setFileToDelete] = useState(null); // {id, name}
  const [showStorageLimitMsg, setShowStorageLimitMsg] = useState(false);
  
  const { 
    totalIncome, 
    totalExpenses, 
    savingsPercentage, 
    highestBar,
    barAnim,
    formatCurrency
  } = data;


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

  // Load saved financial data instances
  const loadSavedInstances = async () => {
    try {
      // First clean up any excess files (same as DetailModal)
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

  // Delete saved instance
  const deleteSavedInstance = async (instanceId, instanceName) => {
    try {
      await AsyncStorage.removeItem(instanceId);
      await loadSavedInstances(); // Refresh the list
    } catch (error) {
      console.error('Error deleting instance:', error);
    }
  };

  // Load selected instance
  const loadSavedInstance = async (instance) => {
    try {
      const dataJson = await AsyncStorage.getItem(instance.id);
      if (dataJson && handlers?.loadSavedFinancialData) {
        const parsedData = JSON.parse(dataJson);
        await handlers.loadSavedFinancialData(parsedData);
        setShowSaveDataModal(false);
        Alert.alert('Success', `Loaded "${instance.name}"`);
      }
    } catch (error) {
      console.error('Error loading instance:', error);
      Alert.alert('Error', 'Failed to load financial data');
    }
  };

  // Save current data
  const saveCurrentFinancialData = async () => {
    try {
      if (handlers?.saveCurrentFinancialData) {
        await handlers.saveCurrentFinancialData();
        await loadSavedInstances(); // Refresh the list
        Alert.alert('Success', 'Financial data saved');
      }
    } catch (error) {
      console.error('Error saving current data:', error);
      Alert.alert('Error', 'Failed to save financial data');
    }
  };

  // Start fresh financial data
  const startFreshFinancialData = async () => {
    try {
      // Check actual storage count, not just displayed count
      const keys = await AsyncStorage.getAllKeys();
      const financialKeys = keys.filter(key => key.startsWith('widget_data_financial_'));
      
      if (financialKeys.length >= 3) {
        setShowStorageLimitMsg(true);
        return;
      }

      if (handlers?.startFreshFinancialData) {
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
    <>
      <TouchableOpacity 
        style={[styles.compactCard, { 
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border 
        }]}
        onPress={openDetailModal}
        activeOpacity={0.7}
      >
      <View style={styles.compactHeader}>
        <View style={styles.compactTitleContainer}>
          <Ionicons name="wallet-outline" size={20} color={theme.primary} style={styles.compactIcon} />
          <Text style={[styles.compactTitle, { color: theme.text }]}>
            {widgetName || 'Financial Tracker'}
          </Text>
        </View>
        
        {/* File Management Button */}
        <TouchableOpacity 
          style={[styles.fileButton, { backgroundColor: 'rgba(255,255,255,0.05)' }]}
          onPress={() => {
            loadSavedInstances();
            setShowSaveDataModal(true);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="folder-outline" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
        
        {/* "Tap for details" text removed as requested */}
      </View>
      
      {/* Key Metrics */}
      <View style={styles.compactMetrics}>
        <View style={styles.metricsContainer}>
          {/* Left Column - Labels */}
          <View style={styles.metricsColumn}>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Monthly Income:</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Monthly Expenses:</Text>
            <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Savings Rate:</Text>
          </View>
          
          {/* Middle Column - Values */}
          <View style={styles.metricsColumn}>
            <Text style={[styles.metricValue, { color: '#4CAF50' }]}>{formatCurrency(totalIncome)}</Text>
            <Text style={[styles.metricValue, { color: '#F44336' }]}>{formatCurrency(totalExpenses)}</Text>
            <Text style={[styles.metricValue, { color: savingsPercentage >= 0 ? '#4CAF50' : '#F44336' }]}>
              {savingsPercentage.toFixed(0)}%
            </Text>
          </View>
          
          {/* Right Column - Status */}
          <View style={styles.metricsColumn}>
            <Text style={[styles.metricStatus, { color: '#4CAF50' }]}>
              Monthly Income
            </Text>
            <Text style={[styles.metricStatus, { color: '#F44336' }]}>
              Monthly Expenses
            </Text>
            <Text style={[styles.metricStatus, { color: savingsPercentage >= 0 ? '#4CAF50' : '#F44336' }]}>
              {savingsPercentage >= 0 ? 'Surplus' : 'Deficit'}
            </Text>
          </View>
        </View>
        
        {/* Simple Bar Chart */}
        <View style={styles.compactChartContainer}>
          <View style={styles.compactBars}>
            <View style={styles.barLabelContainer}>
              <Text style={[styles.barLabel, { color: theme.textSecondary }]}>Income</Text>
              <Animated.View 
                style={[
                  styles.incomeBar, 
                  { 
                    backgroundColor: '#4CAF50', // Green for income
                    height: barAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, Math.round((totalIncome / highestBar) * 100)]
})
                  }
                ]} 
              />
            </View>
            
            <View style={styles.barLabelContainer}>
              <Text style={[styles.barLabel, { color: theme.textSecondary }]}>Expenses</Text>
              <Animated.View 
                style={[
                  styles.expenseBar, 
                  { 
                    backgroundColor: '#F44336', // Red for expenses
                    height: barAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, Math.round((totalExpenses / highestBar) * 100)]
})
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.savingsIndicator}>
            <View style={[styles.savingsLine, { borderColor: theme.border }]} />
            <Text style={[styles.savingsLabel, { color: '#4CAF50' }]}>
              Monthly Surplus: {formatCurrency(Math.max(0, totalIncome - totalExpenses))}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
    
    {/* Save Data Modal - EXACT copy from DetailModal.js clean modal */}
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
    </>
  );
};

const styles = StyleSheet.create({
  compactCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  compactTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Added flex to ensure it fills the space
  },
  compactIcon: {
    marginRight: 8,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // compactTapHint removed as it's no longer needed
  compactMetrics: {
    marginBottom: 8,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricsColumn: {
    justifyContent: 'space-between',
  },
  metricLabel: {
    fontSize: 13,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  metricStatus: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },
  compactChartContainer: {
    marginTop: 8,
  },
  compactBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 120,
    marginBottom: 8,
  },
  barLabelContainer: {
    alignItems: 'center',
    width: 80,
  },
  barLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  incomeBar: {
    width: 40,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  expenseBar: {
    width: 40,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    position: 'absolute',
    bottom: 0,
  },
  savingsIndicator: {
    alignItems: 'center',
  },
  savingsLine: {
    width: '80%',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  savingsLabel: {
    fontSize: 12,
  },
  // File management styles
  fileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Clean modal styles - EXACT copy from DetailModal.js
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
});

export default CompactView;
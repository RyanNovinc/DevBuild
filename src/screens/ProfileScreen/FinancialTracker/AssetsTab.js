// src/screens/ProfileScreen/FinancialTracker/AssetsTab.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const AssetsTab = ({ theme, data, handlers, onShowAllocation }) => {
  const { financialData, formatCurrency, isPremium } = data;
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  // Removed showMonthlyModal - no longer needed
  
  // Form state
  const [assetName, setAssetName] = useState('');
  const [assetAmount, setAssetAmount] = useState('');
  const [assetCategory, setAssetCategory] = useState('bank');
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Asset categories
  const assetCategories = {
    bank: { icon: 'card-outline', color: '#3b82f6', label: 'Bank Account' },
    investment: { icon: 'trending-up', color: '#10b981', label: 'Investment' },
    property: { icon: 'home-outline', color: '#f59e0b', label: 'Property' },
    emergency: { icon: 'shield-checkmark', color: '#ef4444', label: 'Emergency Fund' },
    payOffDebt: { icon: 'trending-down', color: '#dc2626', label: 'Pay Off Debt' },
    other: { icon: 'ellipsis-horizontal', color: '#6b7280', label: 'Other' }
  };


  const getAssetsByCategory = (category) => {
    return (financialData.assets || []).filter(asset => asset.category === category);
  };

  const calculateAssetMetrics = () => {
    const assets = financialData.assets || [];
    const totalAssets = assets
      .filter(asset => asset.category !== 'payOffDebt')
      .reduce((sum, asset) => sum + parseFloat(asset.amount), 0);
    
    const assetsByCategory = {};
    Object.keys(assetCategories).forEach(category => {
      if (category === 'payOffDebt') {
        const totalDebt = (financialData.debts || []).reduce((sum, debt) => sum + parseFloat(debt.amount), 0);
        assetsByCategory[category] = totalDebt;
      } else {
        assetsByCategory[category] = assets
          .filter(asset => asset.category === category)
          .reduce((sum, asset) => sum + parseFloat(asset.amount), 0);
      }
    });

    return {
      totalAssets,
      assetCount: assets.filter(asset => asset.category !== 'payOffDebt').length,
      assetsByCategory
    };
  };

  const metrics = calculateAssetMetrics();

  // Removed monthlyTrackingSummary - no longer needed for manual surplus system

  const clearForm = () => {
    setAssetName('');
    setAssetAmount('');
    setAssetCategory('bank');
    setEditingAsset(null);
  };

  const addAsset = () => {
    if (!assetName.trim() || !assetAmount.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const newAsset = {
      id: editingAsset ? editingAsset.id : Date.now().toString(),
      name: assetName.trim(),
      amount: parseFloat(assetAmount),
      category: assetCategory
    };

    if (editingAsset) {
      handlers.handleEditAsset(editingAsset.id, newAsset);
    } else {
      handlers.handleAddAsset(newAsset);
    }

    setShowAddAssetModal(false);
    clearForm();
  };

  const deleteAsset = (assetId) => {
    Alert.alert(
      'Delete Asset',
      'Are you sure you want to delete this asset?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => handlers.handleDeleteAsset(assetId)
        }
      ]
    );
  };


  const startEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetName(asset.name);
    setAssetAmount(asset.amount.toString());
    setAssetCategory(asset.category);
    setShowAddAssetModal(true);
  };


  return (
    <Animated.View style={[
      styles.container,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Assets & Net Worth
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Track your financial assets for complete net worth picture
          </Text>
        </View>

        <View style={[styles.totalAssetsCard, { backgroundColor: theme.card }]}>
          <LinearGradient
            colors={['rgba(16, 185, 129, 0.1)', 'transparent']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.totalAssetsContent}>
            <View style={styles.totalAssetsHeader}>
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text style={[styles.totalAssetsLabel, { color: theme.textSecondary }]}>
                Total Assets
              </Text>
            </View>
            <Text style={[styles.totalAssetsValue, { color: '#10b981' }]}>
              {formatCurrency(metrics.totalAssets)}
            </Text>
            <Text style={[styles.totalAssetsSubtext, { color: theme.textSecondary }]}>
              {metrics.assetCount} {metrics.assetCount === 1 ? 'asset' : 'assets'}
            </Text>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Asset Categories
          </Text>
          <View style={styles.categoriesGrid}>
            {Object.entries(assetCategories).map(([key, category]) => (
              <View key={key} style={[styles.categoryCard, { backgroundColor: theme.card }]}>
                <LinearGradient
                  colors={[`${category.color}20`, 'transparent']}
                  style={StyleSheet.absoluteFillObject}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Ionicons name={category.icon} size={20} color={category.color} />
                <Text style={[styles.categoryLabel, { color: theme.textSecondary }]}>
                  {category.label}
                </Text>
                <Text style={[styles.categoryValue, { 
                  color: key === 'payOffDebt' ? '#dc2626' : theme.text 
                }]}>
                  {key === 'payOffDebt' 
                    ? `-${formatCurrency(metrics.assetsByCategory[key] || 0)}`
                    : formatCurrency(metrics.assetsByCategory[key] || 0)
                  }
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.assetsList}>
          <View style={styles.listHeader}>
            <Text style={[styles.listTitle, { color: theme.text }]}>
              Your Assets
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddAssetModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#10b981" />
            </TouchableOpacity>
          </View>

          {(financialData.assets || []).map((asset) => {
            const categoryInfo = assetCategories[asset.category] || assetCategories.other;
            return (
              <View key={asset.id} style={[styles.assetItem, { backgroundColor: theme.card }]}>
                <View style={[styles.assetIcon, { backgroundColor: `${categoryInfo.color}20` }]}>
                  <Ionicons name={categoryInfo.icon} size={20} color={categoryInfo.color} />
                </View>
                <View style={styles.assetContent}>
                  <Text style={[styles.assetName, { color: theme.text }]}>
                    {asset.name}
                  </Text>
                  <Text style={[styles.assetCategory, { color: theme.textSecondary }]}>
                    {categoryInfo.label}
                  </Text>
                </View>
                <View style={styles.assetActions}>
                  <Text style={[styles.assetAmount, { 
                    color: asset.category === 'payOffDebt' ? '#dc2626' : theme.text 
                  }]}>
                    {asset.category === 'payOffDebt' 
                      ? `-${formatCurrency(asset.amount)}`
                      : formatCurrency(asset.amount)
                    }
                  </Text>
                  <TouchableOpacity 
                    onPress={() => startEditAsset(asset)}
                    style={styles.editButton}
                  >
                    <Ionicons name="create-outline" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => deleteAsset(asset.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {(!financialData.assets || financialData.assets.length === 0) && (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <Ionicons name="briefcase-outline" size={48} color="#6b7280" />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Assets Yet
              </Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Add your bank accounts, investments, and other assets to track your net worth
              </Text>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Add Asset Modal */}
      <Modal
        visible={showAddAssetModal}
        transparent
        animationType="slide"
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  {editingAsset ? 'Edit Asset' : 'Add Asset'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowAddAssetModal(false);
                  clearForm();
                }}>
                  <Ionicons name="close" size={24} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                  Asset Name
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  value={assetName}
                  onChangeText={setAssetName}
                  placeholder="e.g., Checking Account, 401k, House"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                  Amount
                </Text>
                <TextInput
                  style={[styles.formInput, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  value={assetAmount}
                  onChangeText={setAssetAmount}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {Object.entries(assetCategories).map(([key, category]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.categoryOption,
                        { backgroundColor: theme.surface },
                        assetCategory === key && { backgroundColor: category.color }
                      ]}
                      onPress={() => setAssetCategory(key)}
                    >
                      <Ionicons 
                        name={category.icon} 
                        size={16} 
                        color={assetCategory === key ? '#ffffff' : category.color} 
                      />
                      <Text style={[
                        styles.categoryOptionText,
                        { color: theme.textSecondary },
                        assetCategory === key && { color: '#ffffff' }
                      ]}>
                        {category.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.surface }]}
                  onPress={() => {
                    setShowAddAssetModal(false);
                    clearForm();
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.addButton]}
                  onPress={addAsset}
                >
                  <Text style={styles.addButtonText}>
                    {editingAsset ? 'Update' : 'Add'} Asset
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Removed Monthly Tracking Modal - users must manually add surplus via Tracking tab */}

    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  fullScreenContainer: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  
  totalAssetsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  totalAssetsContent: {
    zIndex: 1,
  },
  totalAssetsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalAssetsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  totalAssetsValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalAssetsSubtext: {
    fontSize: 14,
  },

  categoriesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  categoryCard: {
    width: (width - 44) / 2,
    marginHorizontal: 6,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },

  assetsList: {
    marginBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  addButton: {
    padding: 4,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  assetContent: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  assetCategory: {
    fontSize: 12,
  },
  assetActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assetAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  editButton: {
    padding: 8,
    marginRight: 4,
  },
  deleteButton: {
    padding: 8,
  },

  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },

  monthlyTrackingSection: {
    marginBottom: 24,
  },
  monthlyTrackingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  monthlyTrackingLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  monthlyTrackingValue: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },

  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  monthlyModalContent: {
    borderRadius: 16,
    padding: 20,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  summarySection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryDescription: {
    fontSize: 12,
    textAlign: 'center',
  },

  allocateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  allocateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  allocateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },

  modeToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  allocationSummary: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  availableAmount: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
  },
  remainingAmount: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 12,
  },
  allocationCategories: {
    flex: 1,
  },
  allocationCategory: {
    marginBottom: 12,
  },
  allocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  allocationLeftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  allocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  allocationInfo: {
    flex: 1,
  },
  allocationLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  allocationDescription: {
    fontSize: 12,
  },
  allocationInput: {
    width: 80,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  allocationActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  preferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 8,
  },
  preferencesText: {
    fontSize: 14,
    fontWeight: '500',
  },
  allocateSubmitButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  allocateSubmitDisabled: {
    backgroundColor: '#666666',
  },
  allocateSubmitText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  expandedAllocationList: {
    marginTop: 8,
    borderRadius: 8,
    padding: 12,
  },
  expandedAllocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  expandedAssetInfo: {
    flex: 1,
  },
  expandedAssetName: {
    fontSize: 14,
    fontWeight: '500',
  },
  expandedAssetValue: {
    fontSize: 12,
    marginTop: 2,
  },
  allocationRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandIndicator: {
    marginLeft: 4,
  },
  addNewAssetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  addNewAssetText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyExpandedCategory: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  emptyExpandedText: {
    fontSize: 13,
    marginBottom: 8,
  },
  addFirstAssetButton: {
    backgroundColor: '#10b981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addFirstAssetText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  
  fullScreenModalContainer: {
    flex: 1,
  },
  modalGradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 250,
  },
  fullScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  fullScreenTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  fullScreenContent: {
    flex: 1,
  },
  fullScreenScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  
  // Allocation button styles
  allocationButton: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  allocationButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  allocationButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AssetsTab;
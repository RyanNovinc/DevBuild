// src/screens/ProfileScreen/FinancialTracker/DetailModal.js
import React, { useState, useEffect, useRef } from 'react';
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
  Keyboard,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

// Import consolidated tab components
import TrackingTab from './TrackingTab';
import OverviewTab from './OverviewTab';
import PlanningTab from './PlanningTab';

// Import enhanced full-screen graph component
import EnhancedFullScreenGraph from './EnhancedFullScreenGraph';

// Legacy FullScreenGraphView wrapper for compatibility
const FullScreenGraphView = ({ graphData, onClose }) => {
  // Use the new enhanced component
  return <EnhancedFullScreenGraph graphData={graphData} onClose={onClose} />;
};


// Import React Navigation for swipe tabs
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Import currency components
import CurrencyModal from './SummaryTab/components/CurrencyModal';
import CurrencyInfoModal from './SummaryTab/components/CurrencyInfoModal';
import CurrencyService from './CurrencyService';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// Import necessary components for allocation
import { StatusBar } from 'react-native';

// Asset categories for allocation
const assetCategories = {
  bank: {
    label: 'Banking',
    icon: 'card-outline',
    color: '#3b82f6'
  },
  investment: {
    label: 'Investments',
    icon: 'trending-up-outline',
    color: '#10b981'
  },
  retirement: {
    label: 'Retirement',
    icon: 'hourglass-outline',
    color: '#f59e0b'
  },
  realEstate: {
    label: 'Real Estate',
    icon: 'home-outline',
    color: '#8b5cf6'
  },
  payOffDebt: {
    label: 'Pay Off Debt',
    icon: 'trending-down-outline',
    color: '#ef4444'
  },
  other: {
    label: 'Other Assets',
    icon: 'ellipsis-horizontal-outline',
    color: '#6b7280'
  }
};

// Allocation Screen Component
const AllocationScreen = ({ 
  theme, 
  data, 
  handlers, 
  onClose, 
  allocationMode, 
  setAllocationMode, 
  allocations, 
  setAllocations, 
  expandedCategories, 
  setExpandedCategories 
}) => {
  const { financialData, formatCurrency, monthlyTrackingSummary } = data;
  
  // Load preferences when component mounts
  useEffect(() => {
    loadAllocationPreferences();
  }, [allocationMode]); // Reload when mode changes
  
  const getAssetsByCategory = (category) => {
    if (category === 'payOffDebt') {
      // For payOffDebt category, return both existing assets and debts
      const assets = (financialData.assets || []).filter(asset => asset.category === category);
      const debts = (financialData.debts || []).map(debt => ({
        ...debt,
        category: 'payOffDebt',
        isDebt: true // Flag to identify this is a debt
      }));
      return [...assets, ...debts];
    }
    return (financialData.assets || []).filter(asset => asset.category === category);
  };

  const calculateRemainingAmount = () => {
    const totalAvailable = monthlyTrackingSummary.totalNetGain;
    const allocated = Object.entries(allocations).reduce((sum, [key, val]) => {
      const value = parseFloat(val || 0);
      if (value === 0) return sum;
      
      if (allocationMode === 'percentage') {
        return sum + (value / 100 * totalAvailable);
      } else {
        return sum + value;
      }
    }, 0);
    return totalAvailable - allocated;
  };

  const getTotalAllocatedPercentage = () => {
    const totalAvailable = monthlyTrackingSummary.totalNetGain;
    if (totalAvailable === 0) return 0;
    
    return Object.entries(allocations).reduce((total, [key, value]) => {
      const cleanValue = parseFloat(value.toString().replace(/[%$,]/g, '')) || 0;
      
      if (allocationMode === 'percentage') {
        return total + cleanValue;
      } else {
        return total + (cleanValue / totalAvailable * 100);
      }
    }, 0);
  };

  const isOverAllocated = () => {
    return getTotalAllocatedPercentage() > 100;
  };

  const formatInputValue = (value, showSymbol = true) => {
    if (!value) return '';
    const cleanValue = value.toString().replace(/[%$,]/g, '');
    if (!showSymbol) return cleanValue;
    return cleanValue; // Remove symbols for better editing experience
  };

  // Check if individual asset allocation is disabled due to parent category allocation
  const isAssetAllocationDisabled = (asset) => {
    return !!allocations[asset.category];
  };

  // Check if parent category allocation is disabled due to children being allocated
  const isCategoryAllocationDisabled = (categoryKey) => {
    const categoryAssets = getAssetsByCategory(categoryKey);
    return categoryAssets.some(asset => !!allocations[asset.id]);
  };

  // Get the total allocation for a category (sum of children if they're allocated)
  const getCategoryAllocationValue = (categoryKey) => {
    const directCategoryAllocation = allocations[categoryKey];
    if (directCategoryAllocation) {
      return parseFloat(directCategoryAllocation);
    }
    
    // Check if children are allocated, sum them up
    const categoryAssets = getAssetsByCategory(categoryKey);
    const childrenTotal = categoryAssets.reduce((sum, asset) => {
      const assetValue = allocations[asset.id];
      return sum + (assetValue ? parseFloat(assetValue) : 0);
    }, 0);
    
    return childrenTotal > 0 ? childrenTotal : 0;
  };

  // Get the allocated value for an individual asset (from parent category distribution)
  const getAssetAllocationValue = (asset) => {
    const categoryAllocation = allocations[asset.category];
    if (categoryAllocation) {
      const categoryAssets = getAssetsByCategory(asset.category);
      const numAssets = categoryAssets.length;
      if (numAssets > 0) {
        return (parseFloat(categoryAllocation) / numAssets).toFixed(1);
      }
    }
    return parseFloat(allocations[asset.id] || 0);
  };

  const handleAllocationChange = (key, value) => {
    const cleanValue = value.replace(/[%$,]/g, '');
    const totalAvailable = monthlyTrackingSummary.totalNetGain;
    
    // Validate based on allocation mode
    if (cleanValue) {
      const numericValue = parseFloat(cleanValue);
      
      if (allocationMode === 'percentage') {
        if (numericValue > 100) {
          // Don't allow individual allocations over 100%
          return;
        }
        
        // Check debt-specific limits for individual debts
        const debt = (financialData.debts || []).find(d => d.id === key);
        if (debt) {
          const dollarEquivalent = (numericValue / 100) * totalAvailable;
          if (dollarEquivalent > debt.amount) {
            // Don't allow percentage that would exceed debt amount
            return;
          }
        }
      } else {
        // Dollar mode - don't allow individual allocations over total available
        if (numericValue > totalAvailable) {
          return;
        }
        
        // Check debt-specific limits for individual debts
        const debt = (financialData.debts || []).find(d => d.id === key);
        if (debt && numericValue > debt.amount) {
          // Don't allow dollar amount greater than debt balance
          return;
        }
      }
    }
    
    setAllocations(prev => {
      const newAllocations = { ...prev };
      const isCategoryKey = Object.keys(assetCategories).includes(key);
      
      if (isCategoryKey && cleanValue) {
        const categoryAssets = getAssetsByCategory(key);
        const numAssets = categoryAssets.length;
        
        if (numAssets > 0) {
          categoryAssets.forEach(asset => {
            delete newAllocations[asset.id];
          });
          
          newAllocations[key] = cleanValue;
        }
      } else if (isCategoryKey && !cleanValue) {
        const categoryAssets = getAssetsByCategory(key);
        categoryAssets.forEach(asset => {
          delete newAllocations[asset.id];
        });
        delete newAllocations[key];
      } else {
        const asset = (financialData.assets || []).find(a => a.id === key);
        if (asset) {
          delete newAllocations[asset.category];
          
          if (cleanValue) {
            newAllocations[key] = cleanValue;
          } else {
            delete newAllocations[key];
          }
        }
      }
      
      // Validate total allocation doesn't exceed limits
      if (allocationMode === 'percentage') {
        const totalPercentage = Object.entries(newAllocations).reduce((total, [allocKey, allocValue]) => {
          const cleanAllocValue = parseFloat(allocValue.toString().replace(/[%$,]/g, '')) || 0;
          return total + cleanAllocValue;
        }, 0);
        
        if (totalPercentage > 100) {
          return prev; // Return previous state without changes
        }
        
        // Check individual debt limits in percentage mode
        for (const [allocKey, allocValue] of Object.entries(newAllocations)) {
          const debt = (financialData.debts || []).find(d => d.id === allocKey);
          if (debt) {
            const cleanAllocValue = parseFloat(allocValue.toString().replace(/[%$,]/g, '')) || 0;
            const dollarEquivalent = (cleanAllocValue / 100) * totalAvailable;
            if (dollarEquivalent > debt.amount) {
              return prev; // Return previous state without changes
            }
          }
        }
      } else {
        // Dollar mode - validate total doesn't exceed available amount
        const totalDollars = Object.entries(newAllocations).reduce((total, [allocKey, allocValue]) => {
          const cleanAllocValue = parseFloat(allocValue.toString().replace(/[%$,]/g, '')) || 0;
          return total + cleanAllocValue;
        }, 0);
        
        if (totalDollars > totalAvailable) {
          return prev; // Return previous state without changes
        }
        
        // Check individual debt limits in dollar mode
        for (const [allocKey, allocValue] of Object.entries(newAllocations)) {
          const debt = (financialData.debts || []).find(d => d.id === allocKey);
          if (debt) {
            const cleanAllocValue = parseFloat(allocValue.toString().replace(/[%$,]/g, '')) || 0;
            if (cleanAllocValue > debt.amount) {
              return prev; // Return previous state without changes
            }
          }
        }
      }
      
      return newAllocations;
    });
  };

  const toggleCategoryExpansion = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  // Save allocation preferences (only in percentage mode)
  const saveAllocationPreferences = async () => {
    if (allocationMode !== 'percentage') return;
    
    try {
      const preferences = {};
      Object.entries(allocations).forEach(([key, value]) => {
        if (value && parseFloat(value) > 0) {
          preferences[key] = parseFloat(value);
        }
      });
      
      await AsyncStorage.setItem('allocationPreferences', JSON.stringify(preferences));
      Alert.alert('Saved!', 'Your allocation preferences have been saved and will be applied automatically next time.');
    } catch (error) {
      console.error('Error saving allocation preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    }
  };

  // Load allocation preferences when modal opens
  const loadAllocationPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem('allocationPreferences');
      if (savedPreferences && allocationMode === 'percentage') {
        const preferences = JSON.parse(savedPreferences);
        const currentAssets = financialData.assets || [];
        const validPreferences = {};
        
        // Only apply preferences for existing assets/categories/debts
        Object.entries(preferences).forEach(([key, value]) => {
          const isCategory = Object.keys(assetCategories).includes(key);
          const isValidAsset = currentAssets.some(asset => asset.id === key);
          const isValidDebt = (financialData.debts || []).some(debt => debt.id === key);
          
          if (isCategory || isValidAsset || isValidDebt) {
            validPreferences[key] = value.toString();
          }
          // If asset/debt was deleted, the percentage just doesn't get allocated (more to allocate)
        });
        
        if (Object.keys(validPreferences).length > 0) {
          setAllocations(validPreferences);
        }
      }
    } catch (error) {
      console.error('Error loading allocation preferences:', error);
    }
  };

  const handleAllocationSubmit = () => {
    const totalAvailable = monthlyTrackingSummary.totalNetGain;
    
    Object.entries(allocations).forEach(([key, value]) => {
      if (value && parseFloat(value) > 0) {
        let amount;
        if (allocationMode === 'percentage') {
          amount = (parseFloat(value) / 100) * totalAvailable;
        } else {
          amount = parseFloat(value);
        }
        
        const isAssetId = key.length > 10 && !Object.keys(assetCategories).includes(key);
        
        if (isAssetId) {
          // Check if it's a debt first
          const existingDebt = (financialData.debts || []).find(debt => debt.id === key);
          if (existingDebt && handlers?.handleUpdateItem) {
            // For debts, subtract the payment amount
            const updatedDebt = {
              ...existingDebt,
              amount: Math.max(0, existingDebt.amount - amount) // Don't go below 0
            };
            handlers.handleUpdateItem('debt', updatedDebt);
          } else {
            // Handle regular assets
            const existingAsset = (financialData.assets || []).find(asset => asset.id === key);
            if (existingAsset && handlers?.handleEditAsset) {
              const updatedAsset = {
                ...existingAsset,
                amount: existingAsset.amount + amount
              };
              handlers.handleEditAsset(existingAsset.id, updatedAsset);
            }
          }
        } else {
          if (key === 'payOffDebt') {
            const newPayment = {
              id: Date.now().toString() + Math.random(),
              name: 'Debt Payment (Allocated)',
              amount: amount,
              category: 'payOffDebt'
            };
            if (handlers?.handleAddAsset) {
              handlers.handleAddAsset(newPayment);
            }
          } else {
            const newAsset = {
              id: Date.now().toString() + Math.random(),
              name: `${assetCategories[key].label} (Allocated)`,
              amount: amount,
              category: key
            };
            if (handlers?.handleAddAsset) {
              handlers.handleAddAsset(newAsset);
            }
          }
        }
      }
    });

    if (handlers?.saveCurrentMonth) {
      handlers.saveCurrentMonth();
    }

    // Close the allocation screen
    onClose();
  };

  return (
    <SafeAreaView style={[allocationStyles.screenContainer, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      
      {/* Enhanced Header */}
      <View style={[allocationStyles.header, { backgroundColor: theme.background }]}>
        <View style={allocationStyles.headerContent}>
          <TouchableOpacity 
            style={allocationStyles.backButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </TouchableOpacity>
          
          <View style={allocationStyles.headerTextContainer}>
            <Text style={[allocationStyles.headerTitle, { color: theme.text }]}>
              Allocate Surplus
            </Text>
            <Text style={[allocationStyles.headerSubtitle, { color: theme.textSecondary }]}>
              Distribute your monthly surplus across your financial goals
            </Text>
          </View>
        </View>
        
        {/* Header divider */}
        <View style={[allocationStyles.headerDivider, { backgroundColor: theme.border }]} />
      </View>

      <ScrollView 
        style={allocationStyles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={allocationStyles.scrollContent}
      >
        {/* Mode Toggle */}
        <View style={allocationStyles.modeToggle}>
          <TouchableOpacity
            style={[
              allocationStyles.modeButton,
              { backgroundColor: theme.surface },
              allocationMode === 'percentage' && { backgroundColor: '#10b981' }
            ]}
            onPress={() => {
              if (allocationMode !== 'percentage') {
                // Convert all current dollar amounts to percentages
                const convertedAllocations = {};
                const totalAvailable = monthlyTrackingSummary.totalNetGain;
                
                Object.entries(allocations).forEach(([key, value]) => {
                  if (value) {
                    const dollarAmount = parseFloat(value.toString().replace(/[%$,]/g, ''));
                    const percentage = totalAvailable > 0 ? ((dollarAmount / totalAvailable) * 100).toFixed(1) : '0';
                    convertedAllocations[key] = percentage;
                  }
                });
                
                setAllocations(convertedAllocations);
                setAllocationMode('percentage');
              }
            }}
          >
            <Text style={[
              allocationStyles.modeButtonText,
              { color: theme.text },
              allocationMode === 'percentage' && { color: '#ffffff' }
            ]}>
              Percentage (%)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              allocationStyles.modeButton,
              { backgroundColor: theme.surface },
              allocationMode === 'amount' && { backgroundColor: '#10b981' }
            ]}
            onPress={() => {
              if (allocationMode !== 'amount') {
                // Convert all current percentages to dollar amounts
                const convertedAllocations = {};
                const totalAvailable = monthlyTrackingSummary.totalNetGain;
                
                Object.entries(allocations).forEach(([key, value]) => {
                  if (value) {
                    const percentage = parseFloat(value.toString().replace(/[%$,]/g, ''));
                    const dollarAmount = ((percentage / 100) * totalAvailable).toFixed(0);
                    convertedAllocations[key] = dollarAmount;
                  }
                });
                
                setAllocations(convertedAllocations);
                setAllocationMode('amount');
              }
            }}
          >
            <Text style={[
              allocationStyles.modeButtonText,
              { color: theme.text },
              allocationMode === 'amount' && { color: '#ffffff' }
            ]}>
              Amount ($)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View style={allocationStyles.summary}>
          <View style={allocationStyles.summaryItem}>
            <Text style={[allocationStyles.summaryLabel, { color: theme.textSecondary }]}>
              Available
            </Text>
            <Text style={[allocationStyles.summaryValue, { color: '#10b981' }]}>
              {formatCurrency(monthlyTrackingSummary.totalNetGain)}
            </Text>
          </View>
          <View style={allocationStyles.summaryItem}>
            <Text style={[allocationStyles.summaryLabel, { color: theme.textSecondary }]}>
              Remaining
            </Text>
            <Text style={[
              allocationStyles.summaryValue,
              { color: calculateRemainingAmount() >= 0 ? '#10b981' : '#ef4444' }
            ]}>
              {allocationMode === 'amount' 
                ? formatCurrency(calculateRemainingAmount())
                : `${(100 - getTotalAllocatedPercentage()).toFixed(1)}%`
              }
            </Text>
          </View>
        </View>

        {/* Categories */}
        <View style={allocationStyles.categories}>
          {Object.entries(assetCategories).map(([key, category]) => {
            const categoryAssets = getAssetsByCategory(key);
            const isExpanded = expandedCategories[key];
            
            return (
              <View key={key} style={allocationStyles.category}>
                <TouchableOpacity 
                  style={[allocationStyles.categoryHeader, { backgroundColor: theme.surface }]}
                  onPress={() => toggleCategoryExpansion(key)}
                  activeOpacity={0.7}
                >
                  <View style={allocationStyles.categoryLeft}>
                    <View style={[allocationStyles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                      <Ionicons name={category.icon} size={18} color={category.color} />
                    </View>
                    <View style={allocationStyles.categoryInfo}>
                      <Text style={[allocationStyles.categoryLabel, { color: theme.text }]}>
                        {category.label}
                      </Text>
                      <Text style={[allocationStyles.categoryDescription, { color: theme.textSecondary }]}>
                        {isExpanded && allocations[key]
                          ? `${(parseFloat(allocations[key]) / Math.max(1, categoryAssets.length)).toFixed(1)}% per asset (${categoryAssets.length} ${categoryAssets.length === 1 ? 'asset' : 'assets'})`
                          : `${categoryAssets.length} ${categoryAssets.length === 1 ? 'asset' : 'assets'}`
                        }
                      </Text>
                    </View>
                  </View>
                  
                  <View style={allocationStyles.categoryRight}>
                    <View style={[allocationStyles.inputContainer, { opacity: isCategoryAllocationDisabled(key) ? 0.6 : 1 }]}>
                      <TextInput
                        style={[allocationStyles.allocationInput, { 
                          backgroundColor: isCategoryAllocationDisabled(key) ? theme.surface : theme.background,
                          color: isCategoryAllocationDisabled(key) ? theme.textSecondary : theme.text,
                          borderColor: theme.border 
                        }]}
                        placeholder={allocationMode === 'amount' ? '0' : '0'}
                        placeholderTextColor={theme.textSecondary}
                        value={formatInputValue(getCategoryAllocationValue(key).toString())}
                        onChangeText={isCategoryAllocationDisabled(key) ? undefined : (value) => handleAllocationChange(key, value)}
                        keyboardType="numeric"
                        editable={!isCategoryAllocationDisabled(key)}
                      />
                      <Text style={[allocationStyles.inputUnit, { color: theme.textSecondary }]}>
                        {allocationMode === 'amount' ? '$' : '%'}
                      </Text>
                    </View>
                    
                    <Ionicons 
                      name={isExpanded ? 'chevron-down' : 'chevron-forward'} 
                      size={20} 
                      color={theme.textSecondary}
                    />
                  </View>
                </TouchableOpacity>

                {/* Expanded Assets List */}
                {isExpanded && categoryAssets.length > 0 && (
                  <View style={[allocationStyles.expandedList, { backgroundColor: theme.background }]}>
                    {categoryAssets.map((asset) => (
                      <View key={asset.id} style={allocationStyles.expandedAssetItem}>
                        <View style={allocationStyles.expandedAssetInfo}>
                          <Text style={[allocationStyles.expandedAssetName, { color: theme.text }]}>
                            {asset.name}
                          </Text>
                          <Text style={[allocationStyles.expandedAssetValue, { color: theme.textSecondary }]}>
                            Current: {(asset.category === 'payOffDebt' && !asset.isDebt) 
                              ? `-${formatCurrency(asset.amount)}`
                              : asset.isDebt
                                ? `-${formatCurrency(asset.amount)}`
                                : formatCurrency(asset.amount)
                            }
                          </Text>
                        </View>
                        
                        <View style={[allocationStyles.inputContainer, { opacity: isAssetAllocationDisabled(asset) ? 0.6 : 1 }]}>
                          <TextInput
                            style={[allocationStyles.allocationInput, { 
                              backgroundColor: isAssetAllocationDisabled(asset) ? theme.surface : theme.background,
                              color: isAssetAllocationDisabled(asset) ? theme.textSecondary : theme.text,
                              borderColor: theme.border,
                              width: 60
                            }]}
                            placeholder="0"
                            placeholderTextColor={theme.textSecondary}
                            value={isAssetAllocationDisabled(asset) 
                              ? formatInputValue(getAssetAllocationValue(asset).toString())
                              : formatInputValue(allocations[asset.id] || '')
                            }
                            onChangeText={isAssetAllocationDisabled(asset) 
                              ? undefined 
                              : (value) => handleAllocationChange(asset.id, value)
                            }
                            editable={!isAssetAllocationDisabled(asset)}
                            keyboardType="numeric"
                          />
                          <Text style={[allocationStyles.inputUnit, { color: theme.textSecondary }]}>
                            {allocationMode === 'amount' ? '$' : '%'}
                          </Text>
                        </View>
                      </View>
                    ))}
                    
                    {/* Add new asset button */}
                    <TouchableOpacity
                      style={[allocationStyles.addAssetButton, { backgroundColor: theme.surface }]}
                      onPress={() => {
                        // Close allocation and navigate to add asset
                        onClose();
                        // Small delay to ensure allocation closes first
                        setTimeout(() => {
                          if (handlers?.onShowAddAsset) {
                            handlers.onShowAddAsset(key);
                          }
                        }, 100);
                      }}
                    >
                      <Ionicons name="add" size={16} color="#10b981" />
                      <Text style={[allocationStyles.addAssetText, { color: theme.textSecondary }]}>
                        Add new {category.label.toLowerCase()}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Empty state when expanded but no assets */}
                {isExpanded && categoryAssets.length === 0 && (
                  <View style={[allocationStyles.emptyExpandedCategory, { backgroundColor: theme.surface }]}>
                    <Text style={[allocationStyles.emptyText, { color: theme.textSecondary }]}>
                      No {category.label.toLowerCase()} assets yet
                    </Text>
                    <TouchableOpacity
                      style={allocationStyles.addFirstAssetButton}
                      onPress={() => {
                        // Close allocation and navigate to add asset
                        onClose();
                        setTimeout(() => {
                          if (handlers?.onShowAddAsset) {
                            handlers.onShowAddAsset(key);
                          }
                        }, 100);
                      }}
                    >
                      <Text style={[allocationStyles.addFirstAssetText, { color: '#10b981' }]}>
                        Add {category.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={allocationStyles.actions}>
          {/* Save Preferences Button - Only show in percentage mode */}
          {allocationMode === 'percentage' && (
            <TouchableOpacity
              style={[allocationStyles.savePreferencesButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
              onPress={saveAllocationPreferences}
            >
              <Ionicons name="bookmark-outline" size={16} color={theme.textSecondary} />
              <Text style={[allocationStyles.savePreferencesButtonText, { color: theme.textSecondary }]}>
                Save Preferences
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Submit Button */}
          <TouchableOpacity
            style={[
              allocationStyles.submitButton,
              (calculateRemainingAmount() < 0 || isOverAllocated()) && allocationStyles.submitButtonDisabled
            ]}
            onPress={handleAllocationSubmit}
            disabled={calculateRemainingAmount() < 0 || isOverAllocated()}
          >
            <Text style={allocationStyles.submitButtonText}>
              Allocate Funds
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Create tab navigator for swipe navigation
const Tab = createMaterialTopTabNavigator();

const DetailModal = ({ visible, theme, data, handlers, onClose, widgetName, showFullScreenGraph, fullScreenGraphData, onCloseFullScreenGraph }) => {
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
  const [pendingTrackingSection, setPendingTrackingSection] = useState(null);
  const [navigationKey, setNavigationKey] = useState(0);
  
  // Allocation state
  const [showAllocationView, setShowAllocationView] = useState(false);
  const [allocationData, setAllocationData] = useState(null);
  const [allocationMode, setAllocationMode] = useState('percentage');
  const [allocations, setAllocations] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  
  // Access currency data from props
  const { financialData, formatCurrency } = data;
  const { setCurrency } = handlers || {};
  
  // Update current title when widgetName changes
  useEffect(() => {
    setCurrentTitle(widgetName || 'Financial Tracker');
  }, [widgetName]);

  // Reset navigation state when modal opens/closes to prevent layout corruption
  useEffect(() => {
    if (visible) {
      // Generate a fresh navigation key to force complete remount of tab navigator
      setNavigationKey(Date.now());
      setPendingTrackingSection(null);
    }
  }, [visible]);

  // Clear pending section after navigation is complete
  useEffect(() => {
    if (pendingTrackingSection) {
      const timer = setTimeout(() => {
        setPendingTrackingSection(null);
      }, 1000); // Give time for navigation and section expansion
      return () => clearTimeout(timer);
    }
  }, [pendingTrackingSection]);
  
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

  // Handle allocation view
  const handleShowAllocation = (monthlyData) => {
    setAllocationData(monthlyData);
    setShowAllocationView(true);
  };

  const handleCloseAllocation = () => {
    setShowAllocationView(false);
    setAllocationData(null);
    setAllocations({});
    setExpandedCategories({});
    setAllocationMode('percentage');
  };

  // Handle title editing
  const handleTitlePress = () => {
    if (!handlers?.onUpdateTitle) return;
    
    setTempTitle(currentTitle);
    setShowTitleEditModal(true);
  };

  // Handle navigation to tracking tab with specific section expanded
  const handleNavigateToTracking = (section) => {
    console.log('handleNavigateToTracking called with:', section);
    setPendingTrackingSection(section);
    setNavigationKey(prev => prev + 1); // Force remount to go to Tracking tab
    console.log('Set pending section and incremented navigation key');
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

  // Handle closing modal with automatic saving and state cleanup
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
      
      // Reset navigation state to prevent layout corruption on next open
      setNavigationKey(0);
      setPendingTrackingSection(null);
      setShowCurrencyModal(false);
      setShowCurrencyInfoModal(false);
      setShowSaveDataModal(false);
      setShowTitleEditModal(false);
      
      // Reset allocation state
      setShowAllocationView(false);
      setAllocationData(null);
      setAllocations({});
      setExpandedCategories({});
      setAllocationMode('percentage');
      
      // Call parent close handler
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
      <SafeAreaView 
        key={`modal-${visible}-${navigationKey}`} 
        style={[styles.detailModalContainer, { backgroundColor: '#000000' }]}
      >
        {/* Header - Hidden in full-screen mode */}
        {!(showFullScreenGraph && fullScreenGraphData) && (
          <View style={[styles.detailHeader, { borderBottomColor: '#1A1A1A' }]}>
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={handleClose}
              disabled={isSaving}
            >
              {isSaving ? (
                <Ionicons name="ellipsis-horizontal" size={22} color="#666666" />
              ) : (
                <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
              )}
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <TouchableOpacity 
                style={styles.titlePressable}
                onPress={handleTitlePress}
                disabled={!handlers?.onUpdateTitle}
              >
                <Text style={[styles.detailTitle, { color: '#FFFFFF' }]}>
                  {currentTitle}
                </Text>
                {handlers?.onUpdateTitle && (
                  <Ionicons name="pencil" size={14} color="#666666" style={styles.titleEditIcon} />
                )}
              </TouchableOpacity>
              {isSaving && (
                <View style={styles.savingIndicator}>
                  <Ionicons name="cloud-upload-outline" size={16} color="#00D4AA" />
                  <Text style={[styles.savingText, { color: '#00D4AA' }]}>Saving...</Text>
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
                <Ionicons name="folder-outline" size={16} color="#666666" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => setShowCurrencyInfoModal(true)}
              >
                <Ionicons name="information-circle-outline" size={16} color="#666666" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Conditional rendering: Full-screen graph or normal tabs */}
        {showFullScreenGraph && fullScreenGraphData ? (
          <FullScreenGraphView
            graphData={fullScreenGraphData}
            onClose={onCloseFullScreenGraph}
          />
        ) : (
          <>
            {/* Tab Navigation with Swipe Support - Minimalistic Dark Theme */}
        <Tab.Navigator
          key={navigationKey}
          initialRouteName="Overview"
          screenOptions={{
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: '#666666',
            tabBarStyle: { 
              backgroundColor: '#0A0A0A',
              borderRadius: 14,
              marginHorizontal: 32,
              marginVertical: 12,
              height: 48,
              borderWidth: 1,
              borderColor: '#1A1A1A',
              elevation: 0,
              shadowOpacity: 0,
            },
            tabBarLabelStyle: {
              fontSize: 13,
              fontWeight: '500',
              marginTop: -2,
              letterSpacing: 0.1,
            },
            tabBarIconStyle: {
              marginRight: 4,
              marginTop: 2,
            },
            tabBarIndicatorStyle: { 
              backgroundColor: '#1A1A1A',
              height: 40,
              borderRadius: 10,
              marginBottom: 4,
              marginLeft: 4,
              width: Math.floor((width - 72) / 3) - 8,
              zIndex: 0,
              borderWidth: 1,
              borderColor: '#2A2A2A',
            },
            tabBarItemStyle: {
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1,
            },
            swipeEnabled: true,
            animationEnabled: true,
            lazy: false,
          }}
        >
          <Tab.Screen 
            name="Overview" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : '#666666',
                  fontSize: 13,
                  fontWeight: focused ? '600' : '500',
                  letterSpacing: 0.1
                }}>
                  Overview
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'pie-chart' : 'pie-chart-outline'} 
                  size={18} 
                  color={focused ? '#FFFFFF' : '#666666'} 
                />
              )
            }}
          >
            {() => (
              <View style={styles.tabContent}>
                <OverviewTab theme={theme} data={data} handlers={handlers} onNavigateToTracking={handleNavigateToTracking} />
              </View>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Tracking" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : '#666666',
                  fontSize: 13,
                  fontWeight: focused ? '600' : '500',
                  letterSpacing: 0.1
                }}>
                  Tracking
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'trending-up' : 'trending-up-outline'} 
                  size={18} 
                  color={focused ? '#FFFFFF' : '#666666'} 
                />
              )
            }}
          >
            {() => (
              <View style={styles.tabContent}>
                <TrackingTab 
                  theme={theme} 
                  data={data} 
                  handlers={handlers}
                  pendingExpandSection={pendingTrackingSection}
                />
              </View>
            )}
          </Tab.Screen>
          
          <Tab.Screen 
            name="Assets & Debt" 
            options={{
              tabBarLabel: ({ focused }) => (
                <Text style={{ 
                  color: focused ? '#FFFFFF' : '#666666',
                  fontSize: 13,
                  fontWeight: focused ? '600' : '500',
                  letterSpacing: 0.1
                }}>
                  Assets & Debt
                </Text>
              ),
              tabBarIcon: ({ focused }) => (
                <Ionicons 
                  name={focused ? 'rocket' : 'rocket-outline'} 
                  size={18} 
                  color={focused ? '#FFFFFF' : '#666666'} 
                />
              )
            }}
          >
            {() => (
              <View style={styles.tabContent}>
                <PlanningTab theme={theme} data={data} handlers={handlers} onShowAllocation={handleShowAllocation} />
              </View>
            )}
          </Tab.Screen>
        </Tab.Navigator>
          </>
        )}
        
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
        
        {/* Allocation View Overlay - renders over everything when active */}
        {showAllocationView && allocationData && (
          <View style={styles.allocationOverlay}>
            <AllocationScreen 
              theme={theme}
              data={{ ...data, monthlyTrackingSummary: allocationData }}
              handlers={handlers}
              onClose={handleCloseAllocation}
              allocationMode={allocationMode}
              setAllocationMode={setAllocationMode}
              allocations={allocations}
              setAllocations={setAllocations}
              expandedCategories={expandedCategories}
              setExpandedCategories={setExpandedCategories}
            />
          </View>
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
    paddingHorizontal: 32,
    paddingBottom: 20,
    paddingTop: 8,
    borderBottomWidth: 1,
  },
  closeModalButton: {
    padding: 8,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: '300',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  titlePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleEditIcon: {
    marginLeft: 6,
    opacity: 0.8,
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  savingText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
    letterSpacing: 0.2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 4,
  },
  saveDataButton: {
    padding: 8,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  infoButton: {
    padding: 8,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#000000',
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
  // Allocation overlay style
  allocationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
});

// Allocation Screen Styles
const allocationStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.8,
  },
  headerDivider: {
    height: 1,
    marginHorizontal: 20,
    opacity: 0.2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  categories: {
    marginBottom: 24,
  },
  category: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  allocationInput: {
    width: 80,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 12,
  },
  actions: {
    marginTop: 20,
    gap: 12,
  },
  savePreferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  savePreferencesButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#4B5563',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  // Expanded list styles
  expandedList: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  expandedAssetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  expandedAssetInfo: {
    flex: 1,
    marginRight: 12,
  },
  expandedAssetName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  expandedAssetValue: {
    fontSize: 13,
  },
  addAssetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  addAssetText: {
    fontSize: 14,
    marginLeft: 8,
  },
  emptyExpandedCategory: {
    alignItems: 'center',
    padding: 20,
    marginTop: 8,
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  addFirstAssetButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  addFirstAssetText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DetailModal;
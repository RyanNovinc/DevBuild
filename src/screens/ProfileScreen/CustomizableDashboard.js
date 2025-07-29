// src/screens/ProfileScreen/CustomizableDashboard.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  Animated,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext'; // Add this import
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  useScreenDimensions,
  useIsLandscape,
  ensureAccessibleTouchTarget,
  getContrastRatio,
  meetsContrastRequirements
} from '../../utils/responsive';

// Import dashboard components
import StreakCounter from './StreakCounter';
import ResearchStats from './ResearchStats';
import FocusTimer from './FocusTimer';
import FinancialTracker from './FinancialTracker';

// Component types
const COMPONENT_TYPES = {
  STREAK_COUNTER: 'streak_counter',
  RESEARCH_STATS: 'research_stats',
  FOCUS_TIMER: 'focus_timer',
  FINANCIAL_TRACKER: 'financial_tracker'
};

// Component definitions
const DASHBOARD_COMPONENTS = {
  [COMPONENT_TYPES.STREAK_COUNTER]: {
    id: COMPONENT_TYPES.STREAK_COUNTER,
    title: 'Momentum Streak',
    icon: 'flame-outline',
    component: StreakCounter
  },
  [COMPONENT_TYPES.RESEARCH_STATS]: {
    id: COMPONENT_TYPES.RESEARCH_STATS,
    title: 'Research Insights',
    icon: 'book-outline',
    component: ResearchStats
  },
  [COMPONENT_TYPES.FOCUS_TIMER]: {
    id: COMPONENT_TYPES.FOCUS_TIMER,
    title: 'Focus Timer',
    icon: 'timer-outline',
    component: FocusTimer
  },
  [COMPONENT_TYPES.FINANCIAL_TRACKER]: {
    id: COMPONENT_TYPES.FINANCIAL_TRACKER,
    title: 'Financial Freedom Tracker',
    icon: 'wallet-outline',
    component: FinancialTracker,
    isPremium: true // Mark this component as premium
  }
};

const CustomizableDashboard = ({ theme, navigation }) => {
  const [dashboardItems, setDashboardItems] = useState([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [removingMode, setRemovingMode] = useState(false);
  const isDarkMode = theme.background === '#000000';
  const insets = useSafeAreaInsets();
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Get subscription status from AppContext instead of managing it locally
  const { userSubscriptionStatus } = useAppContext();
  
  // Check if user is premium - now uses AppContext value directly
  const isPremiumUser = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  
  // Load dashboard configuration on component mount
  useEffect(() => {
    loadDashboardConfig();
  }, []);
  
  // Load dashboard configuration from storage
  const loadDashboardConfig = async () => {
    try {
      const dashboardConfig = await AsyncStorage.getItem('dashboardConfig');
      
      if (dashboardConfig) {
        // Parse stored config
        setDashboardItems(JSON.parse(dashboardConfig));
      } else {
        // Default configuration for first-time users
        const defaultConfig = [
          COMPONENT_TYPES.STREAK_COUNTER,
          COMPONENT_TYPES.RESEARCH_STATS,
          COMPONENT_TYPES.FOCUS_TIMER
        ];
        setDashboardItems(defaultConfig);
        await AsyncStorage.setItem('dashboardConfig', JSON.stringify(defaultConfig));
      }
    } catch (error) {
      console.error('Error loading dashboard configuration:', error);
      // Fall back to default configuration
      setDashboardItems([
        COMPONENT_TYPES.STREAK_COUNTER,
        COMPONENT_TYPES.RESEARCH_STATS,
        COMPONENT_TYPES.FOCUS_TIMER
      ]);
    }
  };
  
  // Save dashboard configuration to storage
  const saveDashboardConfig = async (config) => {
    try {
      await AsyncStorage.setItem('dashboardConfig', JSON.stringify(config));
    } catch (error) {
      console.error('Error saving dashboard configuration:', error);
    }
  };
  
  // Add a component to the dashboard
  const addComponent = (componentType) => {
    // Check if component is already on dashboard
    if (dashboardItems.includes(componentType)) {
      Alert.alert(
        'Already Added',
        `${DASHBOARD_COMPONENTS[componentType].title} is already on your dashboard.`
      );
      setIsAddModalVisible(false);
      return;
    }
    
    const updatedItems = [...dashboardItems, componentType];
    setDashboardItems(updatedItems);
    saveDashboardConfig(updatedItems);
    setIsAddModalVisible(false);
  };
  
  // Remove a component from the dashboard
  const removeComponent = (index) => {
    const updatedItems = dashboardItems.filter((_, i) => i !== index);
    setDashboardItems(updatedItems);
    saveDashboardConfig(updatedItems);
  };
  
  // Toggle removing mode
  const toggleRemovingMode = () => {
    setRemovingMode(!removingMode);
  };
  
  // Render a specific dashboard component
  const renderDashboardComponent = (componentType, index) => {
    const componentInfo = DASHBOARD_COMPONENTS[componentType];
    
    if (!componentInfo) return null;
    
    const Component = componentInfo.component;
    const requiresPremium = componentInfo.isPremium === true;
    const hasPremiumAccess = isPremiumUser || !requiresPremium;
    
    return (
      <View key={`${componentType}-${index}`} style={styles.componentContainer}>
        {removingMode && (
          <TouchableOpacity
            style={[
              styles.removeButton, 
              { 
                backgroundColor: 'rgba(255, 59, 48, 0.8)',
                zIndex: 20 // Increased z-index to ensure it appears on top
              }
            ]}
            onPress={() => removeComponent(index)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${componentInfo.title}`}
            accessibilityHint={`Removes ${componentInfo.title} from your dashboard`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        
        {/* Show lock icon for premium components when user is on free plan */}
        {requiresPremium && !hasPremiumAccess && (
          <View style={[styles.premiumLockBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
          </View>
        )}
        
        <Component 
          theme={theme} 
          navigation={navigation} 
          isPremium={hasPremiumAccess}
        />
      </View>
    );
  };
  
  // Render the "Add Component" modal
  const renderAddComponentModal = () => {
    // Get components that aren't already on the dashboard
    const availableComponents = Object.values(DASHBOARD_COMPONENTS).filter(
      component => !dashboardItems.includes(component.id)
    );
    
    // Adjust modal size based on device orientation and size
    const modalWidth = isLandscape 
      ? isTablet ? '50%' : '70%'
      : isTablet ? '60%' : '90%';
      
    const maxModalHeight = isLandscape
      ? height * 0.8
      : height * 0.7;
    
    return (
      <Modal
        visible={isAddModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsAddModalVisible(false)}
        supportedOrientations={['portrait', 'landscape']}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent, 
            {
              backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
              borderColor: theme.border,
              width: modalWidth,
              maxHeight: maxModalHeight,
            }
          ]}>
            <Text 
              style={[
                styles.modalTitle, 
                { 
                  color: theme.text,
                  fontSize: scaleFontSize(20)
                }
              ]}
              maxFontSizeMultiplier={1.3}
              accessibilityRole="header"
            >
              Add to Dashboard
            </Text>
            
            <ScrollView 
              style={[
                styles.componentsScrollView,
                { maxHeight: maxModalHeight - scaleHeight(120) }
              ]}
              contentContainerStyle={{ paddingBottom: scaleHeight(10) }}
              showsVerticalScrollIndicator={true}
            >
              {availableComponents.length > 0 ? (
                availableComponents.map((component) => (
                  <TouchableOpacity
                    key={component.id}
                    style={[
                      styles.componentOption, 
                      { 
                        backgroundColor: theme.card,
                        borderColor: theme.border,
                        padding: scaleWidth(12),
                        borderRadius: scaleWidth(12),
                      }
                    ]}
                    onPress={() => addComponent(component.id)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${component.title}`}
                    accessibilityHint={`Adds ${component.title} to your dashboard`}
                  >
                    <View style={[
                      styles.componentIconContainer, 
                      { 
                        backgroundColor: theme.primary + '20',
                        width: scaleWidth(40),
                        height: scaleWidth(40),
                        borderRadius: scaleWidth(20),
                      }
                    ]}>
                      <Ionicons 
                        name={component.icon} 
                        size={scaleWidth(22)} 
                        color={theme.primary} 
                      />
                    </View>
                    <View style={styles.componentTitleContainer}>
                      <Text 
                        style={[
                          styles.componentTitle, 
                          { 
                            color: theme.text,
                            fontSize: scaleFontSize(16),
                          }
                        ]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                      >
                        {component.title}
                      </Text>
                      
                      {/* Show "Lifetime Members only" for premium components */}
                      {component.isPremium && !isPremiumUser && (
                        <Text 
                          style={[
                            styles.premiumLabel, 
                            { 
                              color: theme.textSecondary,
                              fontSize: scaleFontSize(12),
                            }
                          ]}
                          maxFontSizeMultiplier={1.3}
                          numberOfLines={1}
                        >
                          Lifetime Members only
                        </Text>
                      )}
                    </View>
                    
                    {/* Changed this part to show lock icon for premium components when not premium */}
                    <Ionicons 
                      name={component.isPremium && !isPremiumUser ? "lock-closed" : "add-circle"} 
                      size={scaleWidth(22)} 
                      color={theme.primary} 
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noComponentsContainer}>
                  <Text 
                    style={[
                      styles.noComponentsText, 
                      { 
                        color: theme.textSecondary,
                        fontSize: scaleFontSize(14),
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    All components have been added to your dashboard.
                  </Text>
                </View>
              )}
              
              {/* Feature Request Button */}
              <View style={[
                styles.featureRequestContainer,
                {
                  marginTop: scaleHeight(20),
                  borderTopWidth: 1,
                  borderTopColor: 'rgba(0, 0, 0, 0.1)',
                  paddingTop: scaleHeight(20),
                }
              ]}>
                <Text 
                  style={[
                    styles.featureRequestText, 
                    { 
                      color: theme.textSecondary,
                      fontSize: scaleFontSize(14),
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Want something else on your dashboard?
                </Text>
                <TouchableOpacity
                  style={[
                    styles.featureRequestButton, 
                    { 
                      backgroundColor: theme.card,
                      borderColor: theme.border,
                      padding: scaleWidth(14),
                      borderRadius: scaleWidth(12),
                    }
                  ]}
                  onPress={() => {
                    setIsAddModalVisible(false);
                    navigation.navigate('FeedbackScreen', { feedbackType: 'feature' });
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Request a feature"
                  accessibilityHint="Opens the feedback form to request a new dashboard component"
                >
                  <Ionicons 
                    name="bulb-outline" 
                    size={scaleWidth(20)} 
                    color={theme.primary} 
                    style={styles.featureRequestIcon} 
                  />
                  <Text 
                    style={[
                      styles.featureRequestButtonText, 
                      { 
                        color: theme.text,
                        fontSize: scaleFontSize(16),
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Request a Feature
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={scaleWidth(18)} 
                    color={theme.primary} 
                  />
                </TouchableOpacity>
              </View>
            </ScrollView>
            
            <TouchableOpacity 
              style={[
                styles.closeModalButton, 
                { 
                  backgroundColor: theme.primary,
                  paddingVertical: scaleHeight(12),
                  borderRadius: scaleWidth(12),
                }
              ]}
              onPress={() => setIsAddModalVisible(false)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close"
              accessibilityHint="Closes the add component dialog"
            >
              <Text 
                style={[
                  styles.closeButtonText,
                  { fontSize: scaleFontSize(16) }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <View style={[
      styles.container, 
      { marginTop: scaleHeight(16) }
    ]}>
      <View style={[
        styles.dashboardHeader,
        { paddingHorizontal: scaleWidth(16) }
      ]}>
        <View style={styles.headerLeft}>
          <Text 
            style={[
              styles.dashboardTitle, 
              { 
                color: theme.text,
                fontSize: scaleFontSize(18),
              }
            ]}
            maxFontSizeMultiplier={1.3}
            accessibilityRole="header"
          >
            My Dashboard
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          {dashboardItems.length > 0 && (
            <TouchableOpacity
              style={[
                styles.editButton, 
                { 
                  backgroundColor: theme.primary + '20',
                  width: scaleWidth(32),
                  height: scaleWidth(32),
                  borderRadius: scaleWidth(16),
                }
              ]}
              onPress={toggleRemovingMode}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={removingMode ? "Finish editing" : "Edit dashboard"}
              accessibilityHint={removingMode ? "Exits edit mode" : "Enters edit mode to remove dashboard components"}
              // Ensure minimum touch target size
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name={removingMode ? "checkmark" : "pencil-outline"} 
                size={scaleWidth(18)} 
                color={theme.primary} 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[
              styles.addButton, 
              ensureAccessibleTouchTarget(scaleWidth(32), scaleWidth(32)),
              { 
                backgroundColor: theme.primary,
                borderRadius: scaleWidth(16),
              }
            ]}
            onPress={() => setIsAddModalVisible(true)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add dashboard component"
            accessibilityHint="Opens a dialog to add a new component to your dashboard"
          >
            <Ionicons 
              name="add" 
              size={scaleWidth(18)} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {dashboardItems.length === 0 ? (
        <View style={[
          styles.emptyDashboard, 
          { 
            backgroundColor: theme.card,
            borderColor: theme.border,
            marginHorizontal: scaleWidth(16),
            padding: scaleWidth(32),
            borderRadius: scaleWidth(12),
          }
        ]}>
          <Ionicons 
            name="apps-outline" 
            size={scaleWidth(40)} 
            color={theme.textSecondary} 
          />
          <Text 
            style={[
              styles.emptyDashboardText, 
              { 
                color: theme.textSecondary,
                fontSize: scaleFontSize(16),
                marginTop: scaleHeight(16),
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Your dashboard is empty.
          </Text>
          <Text 
            style={[
              styles.emptyDashboardSubtext, 
              { 
                color: theme.textSecondary,
                fontSize: scaleFontSize(14),
                marginTop: scaleHeight(8),
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Tap the + button to add components.
          </Text>
        </View>
      ) : (
        dashboardItems.map((componentType, index) => 
          renderDashboardComponent(componentType, index)
        )
      )}
      
      {renderAddComponentModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // marginTop set in component
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingHorizontal set in component
    marginBottom: scaleHeight(16),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardTitle: {
    // fontSize set in component
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    // width, height, borderRadius set in component
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleWidth(8),
  },
  addButton: {
    // width, height, borderRadius set in component
    justifyContent: 'center',
    alignItems: 'center',
  },
  componentContainer: {
    position: 'relative',
    marginBottom: scaleHeight(4),
  },
  removeButton: {
    position: 'absolute',
    top: scaleWidth(10),
    right: scaleWidth(10),
    width: scaleWidth(24),
    height: scaleWidth(24),
    borderRadius: scaleWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20, // Increased z-index to ensure it appears on top
  },
  // Premium lock badge
  premiumLockBadge: {
    position: 'absolute',
    top: scaleWidth(10),
    right: scaleWidth(10),
    width: scaleWidth(24),
    height: scaleWidth(24),
    borderRadius: scaleWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  emptyDashboard: {
    // marginHorizontal, padding, borderRadius set in component
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDashboardText: {
    // fontSize, marginTop set in component
    fontWeight: '500',
  },
  emptyDashboardSubtext: {
    // fontSize, marginTop set in component
  },
  componentTitleContainer: {
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleWidth(20),
  },
  modalContent: {
    // width set in component based on orientation
    maxWidth: 400,
    borderRadius: scaleWidth(20),
    padding: scaleWidth(20),
    borderWidth: 1,
  },
  modalTitle: {
    // fontSize set in component
    fontWeight: 'bold',
    marginBottom: scaleHeight(16),
    textAlign: 'center',
  },
  componentsScrollView: {
    // maxHeight set in component
    marginBottom: scaleHeight(16),
  },
  componentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding, borderRadius set in component
    borderWidth: 1,
    marginBottom: scaleHeight(8),
  },
  componentIconContainer: {
    // width, height, borderRadius set in component
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleWidth(12),
  },
  componentTitle: {
    // fontSize set in component
    fontWeight: '500',
  },
  premiumLabel: {
    // fontSize set in component
    marginTop: 2,
  },
  noComponentsContainer: {
    padding: scaleWidth(16),
    alignItems: 'center',
  },
  noComponentsText: {
    // fontSize set in component
    textAlign: 'center',
  },
  featureRequestContainer: {
    // marginTop, borderTopWidth, paddingTop set in component
    alignItems: 'center',
  },
  featureRequestText: {
    // fontSize set in component
    marginBottom: scaleHeight(10),
    textAlign: 'center',
  },
  featureRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // padding, borderRadius set in component
    borderWidth: 1,
    width: '100%',
  },
  featureRequestIcon: {
    marginRight: scaleWidth(8),
  },
  featureRequestButtonText: {
    flex: 1,
    // fontSize set in component
    fontWeight: '500',
  },
  closeModalButton: {
    // paddingVertical, borderRadius set in component
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    // fontSize set in component
    fontWeight: '600',
  },
});

export default CustomizableDashboard;
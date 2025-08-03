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
import { useAchievements } from '../../context/AchievementContext';
import { useNotification } from '../../context/NotificationContext';
import LevelService from '../../services/LevelService';
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
    component: FocusTimer,
    requiresLevel: 4 // Unlock at level 4
  },
  [COMPONENT_TYPES.FINANCIAL_TRACKER]: {
    id: COMPONENT_TYPES.FINANCIAL_TRACKER,
    title: 'Financial Tracker',
    icon: 'wallet-outline',
    component: FinancialTracker,
    isPremium: true // Mark this component as premium
  }
};

const CustomizableDashboard = ({ theme, navigation }) => {
  const [dashboardItems, setDashboardItems] = useState([]); // Now stores widget instances with unique IDs
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [removingMode, setRemovingMode] = useState(false);
  const [shakeAnimations, setShakeAnimations] = useState({});
  const [showFocusTimerCongrats, setShowFocusTimerCongrats] = useState(false);
  const [focusTimerUnlockState, setFocusTimerUnlockState] = useState('locked'); // 'locked', 'unlocked', 'seen'
  const [fallingClockAnimations, setFallingClockAnimations] = useState([]);
  
  // Add state for upgrade modal (like in GoalsScreen)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState('');
  const isDarkMode = theme.background === '#000000';
  const insets = useSafeAreaInsets();
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Get subscription status from AppContext instead of managing it locally
  const { userSubscriptionStatus } = useAppContext();
  
  // Get achievements context for level checking
  const { getTotalPoints } = useAchievements();
  
  // Get notification context for banner messages
  const { showSuccess } = useNotification() || { 
    showSuccess: (msg) => console.log(msg)
  };
  
  // Check if user is premium - now uses AppContext value directly
  const isPremiumUser = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  
  // Calculate current user level (check for test level first)
  const [calculatedLevel, setCalculatedLevel] = useState(1);
  
  // Load level (including test level if it exists)
  useEffect(() => {
    const loadUserLevel = async () => {
      try {
        // Check if we have a persisted test level
        const storedTestMode = await AsyncStorage.getItem('testMode');
        const storedTestLevel = await AsyncStorage.getItem('testLevel');
        
        if (storedTestMode === 'true' && storedTestLevel) {
          const testLevel = parseInt(storedTestLevel);
          console.log(`Dashboard using test level: ${testLevel}`);
          setCalculatedLevel(testLevel);
        } else {
          // Use real level from achievements
          const realLevel = LevelService.calculateLevel(getTotalPoints());
          console.log(`Dashboard using real level: ${realLevel}`);
          setCalculatedLevel(realLevel);
        }
      } catch (error) {
        console.error('Error loading user level:', error);
        // Fallback to real level
        setCalculatedLevel(LevelService.calculateLevel(getTotalPoints()));
      }
    };
    
    loadUserLevel();
  }, [getTotalPoints]);
  
  const userLevel = calculatedLevel;

  // Utility functions for widget instances
  const generateWidgetId = () => {
    return `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const createWidgetInstance = (componentType, customName = null) => {
    const component = DASHBOARD_COMPONENTS[componentType];
    return {
      id: generateWidgetId(),
      type: componentType,
      name: customName || component.title,
      createdAt: new Date().toISOString(),
      data: {} // This will store widget-specific data
    };
  };

  // Widget data utility functions (to be used by widget components)
  const saveWidgetData = async (widgetId, data) => {
    try {
      await AsyncStorage.setItem(`widget_data_${widgetId}`, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving data for widget ${widgetId}:`, error);
    }
  };

  const loadWidgetData = async (widgetId) => {
    try {
      const data = await AsyncStorage.getItem(`widget_data_${widgetId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error loading data for widget ${widgetId}:`, error);
      return null;
    }
  };

  // Check Focus Timer unlock state
  useEffect(() => {
    const checkFocusTimerUnlockState = async () => {
      if (userLevel >= 4) {
        const hasSeenCongrats = await AsyncStorage.getItem('focusTimerCongratsShown');
        if (!hasSeenCongrats) {
          setFocusTimerUnlockState('unlocked'); // Just unlocked, show "Unlock" state
        } else {
          setFocusTimerUnlockState('seen'); // Already seen congratulations
        }
      } else {
        setFocusTimerUnlockState('locked'); // Still locked
      }
    };
    
    checkFocusTimerUnlockState();
  }, [userLevel]);
  
  // Load dashboard configuration on component mount
  useEffect(() => {
    loadDashboardConfig();
  }, []);
  
  // Auto-add Focus Timer when user reaches level 4 (but only if not manually removed)
  useEffect(() => {
    const checkAutoAdd = async () => {
      // Check if user manually removed Focus Timer
      const manuallyRemoved = await AsyncStorage.getItem('focusTimerManuallyRemoved');
      
      // Check if any Focus Timer widgets exist on dashboard
      const hasFocusTimer = dashboardItems.some(widget => widget.type === COMPONENT_TYPES.FOCUS_TIMER);
      
      console.log('Auto-add check:', {
        userLevel,
        hasLevel4: userLevel >= 4,
        hasFocusTimer,
        manuallyRemoved
      });
      
      if (userLevel >= 4 && !hasFocusTimer && !manuallyRemoved) {
        console.log('Auto-adding Focus Timer');
        const focusTimerWidget = createWidgetInstance(COMPONENT_TYPES.FOCUS_TIMER);
        const updatedItems = [...dashboardItems, focusTimerWidget];
        setDashboardItems(updatedItems);
        saveDashboardConfig(updatedItems);
      }
    };
    
    checkAutoAdd();
  }, [userLevel, dashboardItems]);
  
  // Create shake animation for a component
  const createShakeAnimation = (componentId) => {
    if (!shakeAnimations[componentId]) {
      const newShakeAnim = new Animated.Value(0);
      setShakeAnimations(prev => ({
        ...prev,
        [componentId]: newShakeAnim
      }));
      return newShakeAnim;
    }
    return shakeAnimations[componentId];
  };
  
  // Trigger shake animation
  const triggerShake = (componentId) => {
    const shakeAnim = createShakeAnimation(componentId);
    
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  // Create falling clock animations
  const createFallingClockAnimations = () => {
    const numberOfClocks = 8;
    const animations = [];
    
    for (let i = 0; i < numberOfClocks; i++) {
      const animatedValue = new Animated.Value(-50); // Start above screen
      const horizontalPosition = Math.random() * (width - 40); // Random horizontal position
      const delay = Math.random() * 2000; // Random delay up to 2 seconds
      const duration = 3000 + Math.random() * 2000; // Duration between 3-5 seconds
      
      animations.push({
        id: i,
        animatedValue,
        horizontalPosition,
        delay,
        duration,
        rotation: new Animated.Value(0),
      });
    }
    
    setFallingClockAnimations(animations);
    
    // Start animations
    animations.forEach((clock) => {
      // Falling animation
      Animated.timing(clock.animatedValue, {
        toValue: height + 50, // Fall past bottom of screen
        duration: clock.duration,
        delay: clock.delay,
        useNativeDriver: true,
      }).start();
      
      // Rotation animation
      Animated.loop(
        Animated.timing(clock.rotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    });
  };
  
  // Load dashboard configuration from storage
  const loadDashboardConfig = async () => {
    try {
      const dashboardConfig = await AsyncStorage.getItem('dashboardConfig');
      
      if (dashboardConfig) {
        const parsedConfig = JSON.parse(dashboardConfig);
        
        // Check if it's old format (array of strings) and migrate to new format
        if (parsedConfig.length > 0 && typeof parsedConfig[0] === 'string') {
          console.log('Migrating old dashboard format to widget instances');
          const migratedWidgets = parsedConfig.map(componentType => 
            createWidgetInstance(componentType)
          );
          setDashboardItems(migratedWidgets);
          await AsyncStorage.setItem('dashboardConfig', JSON.stringify(migratedWidgets));
        } else {
          // New format with widget instances
          setDashboardItems(parsedConfig);
        }
      } else {
        // Default configuration for first-time users
        const defaultWidgets = [
          createWidgetInstance(COMPONENT_TYPES.STREAK_COUNTER),
          createWidgetInstance(COMPONENT_TYPES.RESEARCH_STATS)
          // Focus Timer will be added when user reaches level 4
        ];
        setDashboardItems(defaultWidgets);
        await AsyncStorage.setItem('dashboardConfig', JSON.stringify(defaultWidgets));
      }
    } catch (error) {
      console.error('Error loading dashboard configuration:', error);
      // Fall back to default configuration
      const defaultWidgets = [
        createWidgetInstance(COMPONENT_TYPES.STREAK_COUNTER),
        createWidgetInstance(COMPONENT_TYPES.RESEARCH_STATS)
      ];
      setDashboardItems(defaultWidgets);
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

  
  // Get widget instance limit based on subscription
  const getWidgetInstanceLimit = (componentType) => {
    return (userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited') ? 3 : 1;
  };

  // Show upgrade modal (like in GoalsScreen)
  const showUpgradePrompt = (message) => {
    setUpgradeMessage(message);
    setShowUpgradeModal(true);
  };

  // Navigate to pricing screen
  const goToPricingScreen = () => {
    setShowUpgradeModal(false);
    navigation.navigate('PricingScreen');
  };

  // Add a component to the dashboard
  const addComponent = async (componentType) => {
    console.log('=== AddComponent Debug ===');
    console.log('Component Type:', componentType);
    console.log('User Level:', userLevel);
    console.log('Component:', DASHBOARD_COMPONENTS[componentType]);
    
    // Check widget instance limit
    const currentInstanceCount = dashboardItems.filter(widget => widget.type === componentType).length;
    const instanceLimit = getWidgetInstanceLimit(componentType);
    
    if (currentInstanceCount >= instanceLimit) {
      if (instanceLimit === 1) {
        // Free user trying to add second widget - show upgrade modal
        showUpgradePrompt(
          `You've reached the limit of 1 ${DASHBOARD_COMPONENTS[componentType].title} widget in the free version. Upgrade to Pro for 3 instances per widget type.`
        );
      } else {
        // Pro user hitting their limit - show simple banner notification
        showSuccess(
          `You can only have ${instanceLimit} instances of ${DASHBOARD_COMPONENTS[componentType].title}.`,
          { type: 'warning' }
        );
      }
      setIsAddModalVisible(false);
      return;
    }
    
    // Check level requirement
    const component = DASHBOARD_COMPONENTS[componentType];
    console.log('Component requires level:', component.requiresLevel);
    console.log('User level check:', userLevel >= component.requiresLevel);
    
    if (component.requiresLevel && userLevel < component.requiresLevel) {
      console.log('User level too low, triggering shake');
      triggerShake(componentType);
      return;
    }
    
    // Check if this is the Focus Timer and user just unlocked it
    if (componentType === COMPONENT_TYPES.FOCUS_TIMER) {
      console.log('This is Focus Timer, checking conditions...');
      console.log('Has level requirement:', !!component.requiresLevel);
      console.log('User level meets requirement:', userLevel >= component.requiresLevel);
      
      if (component.requiresLevel && userLevel >= component.requiresLevel) {
        const hasSeenCongrats = await AsyncStorage.getItem('focusTimerCongratsShown');
        console.log('Has seen congrats before:', hasSeenCongrats);
        
        if (!hasSeenCongrats) {
          console.log('Showing congratulations popup!');
          // Show congratulations popup
          setIsAddModalVisible(false);
          setShowFocusTimerCongrats(true);
          // Start falling clock animation
          createFallingClockAnimations();
          // Mark as seen and update unlock state
          await AsyncStorage.setItem('focusTimerCongratsShown', 'true');
          setFocusTimerUnlockState('seen');
          // Add the component after showing congrats
          const newWidget = createWidgetInstance(componentType);
          const updatedItems = [...dashboardItems, newWidget];
          setDashboardItems(updatedItems);
          saveDashboardConfig(updatedItems);
          return;
        } else {
          console.log('User has already seen congrats, proceeding normally');
        }
      }
    }
    
    console.log('Adding component normally');
    // Create new widget instance
    const newWidget = createWidgetInstance(componentType);
    const updatedItems = [...dashboardItems, newWidget];
    setDashboardItems(updatedItems);
    saveDashboardConfig(updatedItems);
    setIsAddModalVisible(false);
  };
  
  // Remove a component from the dashboard (permanently delete)
  const removeComponent = async (index) => {
    console.log('=== Remove Component Debug ===');
    console.log('Removing index:', index);
    console.log('Current dashboard items:', dashboardItems);
    console.log('Item being removed:', dashboardItems[index]);
    
    const widgetToRemove = dashboardItems[index];
    
    // If removing Focus Timer, mark it as manually removed
    if (widgetToRemove.type === COMPONENT_TYPES.FOCUS_TIMER) {
      console.log('Marking Focus Timer as manually removed');
      await AsyncStorage.setItem('focusTimerManuallyRemoved', 'true');
    }
    
    // Remove widget's stored data
    try {
      await AsyncStorage.removeItem(`widget_data_${widgetToRemove.id}`);
      console.log('Removed widget data for:', widgetToRemove.id);
    } catch (error) {
      console.error('Error removing widget data:', error);
    }
    
    const updatedItems = dashboardItems.filter((_, i) => i !== index);
    console.log('Updated items after removal:', updatedItems);
    console.log('Widget permanently deleted:', widgetToRemove);
    
    setDashboardItems(updatedItems);
    saveDashboardConfig(updatedItems);
  };

  
  // Toggle removing mode
  const toggleRemovingMode = () => {
    setRemovingMode(!removingMode);
  };
  
  // Render a specific dashboard component
  const renderDashboardComponent = (widget, index) => {
    const componentInfo = DASHBOARD_COMPONENTS[widget.type];
    
    if (!componentInfo) return null;
    
    const Component = componentInfo.component;
    const requiresPremium = componentInfo.isPremium === true;
    const requiresLevel = componentInfo.requiresLevel;
    const hasPremiumAccess = isPremiumUser || !requiresPremium;
    const hasLevelAccess = !requiresLevel || userLevel >= requiresLevel;
    
    return (
      <View key={widget.id} style={styles.componentContainer}>
        {removingMode && (
          <TouchableOpacity
            style={[
              styles.removeButton, 
              { 
                backgroundColor: 'rgba(255, 59, 48, 0.8)',
                zIndex: 20,
                elevation: 5,
                borderWidth: 0,
                borderColor: 'transparent',
              }
            ]}
            onPress={() => {
              console.log(`Remove button clicked for ${widget.name} at index ${index}`);
              removeComponent(index);
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${widget.name}`}
            accessibilityHint={`Removes ${widget.name} from your dashboard`}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons 
              name="close" 
              size={16} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        )}
        
        {/* Show lock icon for premium components when user is on free plan */}
        {requiresPremium && !hasPremiumAccess && (
          <View style={[styles.premiumLockBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
          </View>
        )}
        
        {/* Show lock icon for level-locked components */}
        {requiresLevel && !hasLevelAccess && (
          <View style={[styles.levelLockBadge, { backgroundColor: '#FF9500' }]}>
            <Text style={styles.levelLockText}>{requiresLevel}</Text>
          </View>
        )}
        
        <Component 
          theme={theme} 
          navigation={navigation} 
          isPremium={hasPremiumAccess}
          isUnlocked={hasLevelAccess}
          widgetId={widget.id}
          widgetData={widget.data}
          widgetName={widget.name}
          saveWidgetData={saveWidgetData}
          loadWidgetData={loadWidgetData}
        />
      </View>
    );
  };
  
  // Render the "Add Component" modal
  const renderAddComponentModal = () => {
    // Show all components (allow multiple instances)
    const availableComponents = Object.values(DASHBOARD_COMPONENTS);
    
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
              {availableComponents.map((component) => {
                const shakeAnim = shakeAnimations[component.id] || new Animated.Value(0);
                
                return (
                  <Animated.View
                    key={`${component.id}-${Math.random()}`}
                    style={{
                      transform: [{ translateX: shakeAnim }]
                    }}
                  >
                    <TouchableOpacity
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
                    
                    {/* Show level requirement for level-locked components */}
                    {component.requiresLevel && userLevel < component.requiresLevel && (
                      <Text 
                        style={[
                          styles.levelLabel, 
                          { 
                            color: '#FF9500',
                            fontSize: scaleFontSize(12),
                          }
                        ]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                      >
                        Unlock at level {component.requiresLevel}
                      </Text>
                    )}
                    
                    {/* Show "Unlock" text for newly unlocked Focus Timer */}
                    {component.id === COMPONENT_TYPES.FOCUS_TIMER && focusTimerUnlockState === 'unlocked' && (
                      <Text 
                        style={[
                          styles.unlockLabel, 
                          { 
                            color: '#4CAF50',
                            fontSize: scaleFontSize(12),
                            fontWeight: '600'
                          }
                        ]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                      >
                        Unlock
                      </Text>
                    )}
                  </View>
                  
                  {/* Show appropriate icon based on requirements */}
                  <Ionicons 
                    name={
                      // Premium locked
                      (component.isPremium && !isPremiumUser) 
                        ? "lock-closed"
                      // Level locked
                      : (component.requiresLevel && userLevel < component.requiresLevel)
                        ? "lock-closed"
                      // Focus Timer newly unlocked
                      : (component.id === COMPONENT_TYPES.FOCUS_TIMER && focusTimerUnlockState === 'unlocked')
                        ? "lock-open"
                      // Default add icon
                      : "add-circle"
                    } 
                    size={scaleWidth(22)} 
                    color={
                      // Premium locked
                      (component.isPremium && !isPremiumUser) 
                        ? theme.primary
                      // Level locked  
                      : (component.requiresLevel && userLevel < component.requiresLevel)
                        ? '#FF9500'
                      // Focus Timer newly unlocked
                      : (component.id === COMPONENT_TYPES.FOCUS_TIMER && focusTimerUnlockState === 'unlocked')
                        ? '#4CAF50'
                      // Default add color
                      : theme.primary
                    } 
                  />
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
              
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


  // Render upgrade modal (like in GoalsScreen)
  const renderUpgradeModal = () => {
    return (
      <Modal
        visible={showUpgradeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowUpgradeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.upgradeModalContent,
            {
              backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
              borderColor: theme.border,
              borderRadius: scaleWidth(20),
              padding: scaleWidth(24),
              margin: scaleWidth(20),
              borderWidth: 1,
            }
          ]}>
            {/* Pro Icon */}
            <View style={[
              styles.upgradeIconContainer,
              {
                backgroundColor: '#3F51B5',
                width: scaleWidth(80),
                height: scaleWidth(80),
                borderRadius: scaleWidth(40),
                alignSelf: 'center',
                marginBottom: scaleHeight(20)
              }
            ]}>
              <Ionicons name="diamond" size={scaleWidth(40)} color="#FFFFFF" />
            </View>
            
            {/* Title */}
            <Text 
              style={[
                styles.upgradeTitle,
                {
                  color: theme.text,
                  fontSize: scaleFontSize(22),
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: scaleHeight(12)
                }
              ]}
            >
              Upgrade to Pro
            </Text>
            
            {/* Message */}
            <Text 
              style={[
                styles.upgradeMessage,
                {
                  color: theme.textSecondary,
                  fontSize: scaleFontSize(16),
                  lineHeight: scaleHeight(22),
                  textAlign: 'center',
                  marginBottom: scaleHeight(24)
                }
              ]}
            >
              {upgradeMessage}
            </Text>
            
            {/* Buttons */}
            <View style={styles.upgradeButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  {
                    backgroundColor: '#3F51B5',
                    paddingVertical: scaleHeight(14),
                    paddingHorizontal: scaleWidth(20),
                    borderRadius: scaleWidth(12),
                    marginBottom: scaleHeight(12),
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                ]}
                onPress={goToPricingScreen}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Pro"
              >
                <Text 
                  style={[
                    styles.upgradeButtonText,
                    {
                      color: '#FFFFFF',
                      fontSize: scaleFontSize(16),
                      fontWeight: 'bold',
                      textAlign: 'center'
                    }
                  ]}
                >
                  Upgrade Now
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {
                    paddingVertical: scaleHeight(14),
                    paddingHorizontal: scaleWidth(20),
                    borderRadius: scaleWidth(12),
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                ]}
                onPress={() => setShowUpgradeModal(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Maybe later"
              >
                <Text 
                  style={[
                    styles.cancelButtonText,
                    {
                      color: theme.textSecondary,
                      fontSize: scaleFontSize(16),
                      textAlign: 'center'
                    }
                  ]}
                >
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };
  
  // Render Focus Timer congratulations modal
  const renderFocusTimerCongratsModal = () => {
    return (
      <Modal
        visible={showFocusTimerCongrats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFocusTimerCongrats(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Falling Clock Icons */}
          {fallingClockAnimations.map((clock) => (
            <Animated.View
              key={clock.id}
              style={[
                styles.fallingClock,
                {
                  left: clock.horizontalPosition,
                  transform: [
                    {
                      translateY: clock.animatedValue
                    },
                    {
                      rotate: clock.rotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      })
                    }
                  ]
                }
              ]}
              pointerEvents="none"
            >
              <Ionicons 
                name="time-outline" 
                size={scaleWidth(24)} 
                color="#FF9500" 
                style={styles.fallingClockIcon}
              />
            </Animated.View>
          ))}
          
          <View style={[
            styles.congratsModalContent,
            {
              backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
              borderColor: theme.border,
              maxWidth: 400,
              width: isLandscape ? '60%' : '90%',
              borderRadius: scaleWidth(20),
              padding: scaleWidth(24),
              borderWidth: 1,
            }
          ]}>
            {/* Celebration Icon */}
            <View style={[
              styles.congratsIconContainer,
              {
                backgroundColor: '#FF9500',
                width: scaleWidth(80),
                height: scaleWidth(80),
                borderRadius: scaleWidth(40),
                alignSelf: 'center',
                marginBottom: scaleHeight(20)
              }
            ]}>
              <Ionicons name="timer" size={scaleWidth(40)} color="#FFFFFF" />
            </View>
            
            {/* Title */}
            <Text 
              style={[
                styles.congratsTitle,
                {
                  color: theme.text,
                  fontSize: scaleFontSize(22),
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: scaleHeight(12)
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              🎉 Congratulations!
            </Text>
            
            {/* Subtitle */}
            <Text 
              style={[
                styles.congratsSubtitle,
                {
                  color: '#FF9500',
                  fontSize: scaleFontSize(18),
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: scaleHeight(16)
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Focus Timer Unlocked!
            </Text>
            
            {/* Description */}
            <View style={styles.congratsDescriptionContainer}>
              <Text 
                style={[
                  styles.congratsDescription,
                  {
                    color: theme.text,
                    fontSize: scaleFontSize(16),
                    lineHeight: scaleHeight(22),
                    textAlign: 'center',
                    marginBottom: scaleHeight(16)
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                You've reached Level 4 and unlocked the Focus Timer! This powerful tool helps you maintain deep focus using scientifically-proven 90-minute work cycles.
              </Text>
              
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={scaleWidth(20)} color="#4CAF50" />
                  <Text style={[
                    styles.featureText,
                    {
                      color: theme.text,
                      fontSize: scaleFontSize(14),
                      marginLeft: scaleWidth(8),
                      flex: 1
                    }
                  ]}>
                    Track focus sessions and distractions
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={scaleWidth(20)} color="#4CAF50" />
                  <Text style={[
                    styles.featureText,
                    {
                      color: theme.text,
                      fontSize: scaleFontSize(14),
                      marginLeft: scaleWidth(8),
                      flex: 1
                    }
                  ]}>
                    Fullscreen mode for distraction-free work
                  </Text>
                </View>
                
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={scaleWidth(20)} color="#4CAF50" />
                  <Text style={[
                    styles.featureText,
                    {
                      color: theme.text,
                      fontSize: scaleFontSize(14),
                      marginLeft: scaleWidth(8),
                      flex: 1
                    }
                  ]}>
                    Built-in 90-minute optimal focus cycles
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Get Started Button */}
            <TouchableOpacity
              style={[
                styles.congratsButton,
                {
                  backgroundColor: '#FF9500',
                  paddingVertical: scaleHeight(14),
                  borderRadius: scaleWidth(12),
                  marginTop: scaleHeight(8)
                }
              ]}
              onPress={() => setShowFocusTimerCongrats(false)}
            >
              <Text 
                style={[
                  styles.congratsButtonText,
                  {
                    color: '#FFFFFF',
                    fontSize: scaleFontSize(16),
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                Start Focusing! 🚀
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
                  marginRight: scaleWidth(8),
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
        dashboardItems.map((widget, index) => 
          renderDashboardComponent(widget, index)
        )
      )}
      
      {renderAddComponentModal()}
      {renderUpgradeModal()}
      {renderFocusTimerCongratsModal()}
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
  // Level lock badge
  levelLockBadge: {
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
  levelLockText: {
    color: '#FFFFFF',
    fontSize: scaleWidth(10),
    fontWeight: 'bold',
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
  levelLabel: {
    // fontSize set in component
    marginTop: 2,
    fontWeight: '500',
  },
  unlockLabel: {
    // fontSize set in component
    marginTop: 2,
    fontWeight: '600',
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
  // Upgrade modal styles
  upgradeModalContent: {
    alignItems: 'center',
  },
  upgradeIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  upgradeTitle: {},
  upgradeMessage: {},
  upgradeButtonContainer: {
    width: '100%',
    flexDirection: 'column',
  },
  upgradeButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  upgradeButtonText: {},
  cancelButton: {},
  cancelButtonText: {},
  // Congratulations modal styles
  congratsModalContent: {
    alignItems: 'center',
  },
  congratsIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  congratsTitle: {},
  congratsSubtitle: {},
  congratsDescriptionContainer: {
    width: '100%',
  },
  congratsDescription: {},
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleHeight(8),
  },
  featureText: {},
  congratsButton: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  congratsButtonText: {},
  // Falling clock animation styles
  fallingClock: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  fallingClockIcon: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default CustomizableDashboard;
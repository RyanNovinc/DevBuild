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
import { PanGestureHandler, State } from 'react-native-gesture-handler';
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
    title: 'Custom Streak',
    icon: 'flame-outline',
    component: StreakCounter,
    requiresLevel: 2 // Unlock at stage 2
  },
  [COMPONENT_TYPES.RESEARCH_STATS]: {
    id: COMPONENT_TYPES.RESEARCH_STATS,
    title: 'Research Insights',
    icon: 'book-outline',
    component: ResearchStats,
    requiresLevel: 3 // Unlock at stage 3
  },
  [COMPONENT_TYPES.FOCUS_TIMER]: {
    id: COMPONENT_TYPES.FOCUS_TIMER,
    title: 'Focus Timer',
    icon: 'timer-outline',
    component: FocusTimer,
    requiresLevel: 4 // Unlock at stage 4
  },
  [COMPONENT_TYPES.FINANCIAL_TRACKER]: {
    id: COMPONENT_TYPES.FINANCIAL_TRACKER,
    title: 'Financial Tracker',
    icon: 'wallet-outline',
    component: FinancialTracker,
    requiresLevel: 5 // Unlock at stage 5
  }
};

const CustomizableDashboard = ({ theme, navigation }) => {
  const [dashboardItems, setDashboardItems] = useState([]); // Now stores widget instances with unique IDs
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [shakeAnimations, setShakeAnimations] = useState({});
  
  // Swipe-to-delete state
  const [swipeAnimations, setSwipeAnimations] = useState({});
  const [isSwipeActive, setIsSwipeActive] = useState({});
  // Custom Streak unlock state
  const [showCustomStreakCongrats, setShowCustomStreakCongrats] = useState(false);
  const [customStreakUnlockState, setCustomStreakUnlockState] = useState('locked'); // 'locked', 'unlocked', 'seen'
  const [fallingFlameAnimations, setFallingFlameAnimations] = useState([]);
  
  // Research Stats unlock state
  const [showResearchStatsCongrats, setShowResearchStatsCongrats] = useState(false);
  const [researchStatsUnlockState, setResearchStatsUnlockState] = useState('locked'); // 'locked', 'unlocked', 'seen'
  const [fallingBookAnimations, setFallingBookAnimations] = useState([]);
  
  const [showFocusTimerCongrats, setShowFocusTimerCongrats] = useState(false);
  const [focusTimerUnlockState, setFocusTimerUnlockState] = useState('locked'); // 'locked', 'unlocked', 'seen'
  const [fallingClockAnimations, setFallingClockAnimations] = useState([]);
  
  // Financial Tracker unlock state
  const [showFinancialTrackerCongrats, setShowFinancialTrackerCongrats] = useState(false);
  const [financialTrackerUnlockState, setFinancialTrackerUnlockState] = useState('locked'); // 'locked', 'unlocked', 'seen'
  const [fallingWalletAnimations, setFallingWalletAnimations] = useState([]);
  
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

  // Check Custom Streak unlock state
  useEffect(() => {
    const checkCustomStreakUnlockState = async () => {
      if (userLevel >= 2) {
        const hasSeenCongrats = await AsyncStorage.getItem('customStreakCongratsShown');
        if (!hasSeenCongrats) {
          setCustomStreakUnlockState('unlocked'); // Just unlocked, show "Unlock" state
        } else {
          setCustomStreakUnlockState('seen'); // Already seen congratulations
        }
      } else {
        setCustomStreakUnlockState('locked'); // Still locked
      }
    };
    
    checkCustomStreakUnlockState();
  }, [userLevel]);

  // Check Research Stats unlock state
  useEffect(() => {
    const checkResearchStatsUnlockState = async () => {
      if (userLevel >= 3) {
        const hasSeenCongrats = await AsyncStorage.getItem('researchStatsCongratsShown');
        if (!hasSeenCongrats) {
          setResearchStatsUnlockState('unlocked'); // Just unlocked, show "Unlock" state
        } else {
          setResearchStatsUnlockState('seen'); // Already seen congratulations
        }
      } else {
        setResearchStatsUnlockState('locked'); // Still locked
      }
    };
    
    checkResearchStatsUnlockState();
  }, [userLevel]);

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
  
  // Check Financial Tracker unlock state
  useEffect(() => {
    const checkFinancialTrackerUnlockState = async () => {
      if (userLevel >= 5) {
        const hasSeenCongrats = await AsyncStorage.getItem('financialTrackerCongratsShown');
        if (!hasSeenCongrats) {
          setFinancialTrackerUnlockState('unlocked'); // Just unlocked, show "Unlock" state
        } else {
          setFinancialTrackerUnlockState('seen'); // Already seen congratulations
        }
      } else {
        setFinancialTrackerUnlockState('locked'); // Still locked
      }
    };
    
    checkFinancialTrackerUnlockState();
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

  // Create falling flame animations (Custom Streak)
  const createFallingFlameAnimations = () => {
    const numberOfFlames = 8;
    const animations = [];
    
    for (let i = 0; i < numberOfFlames; i++) {
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
    
    setFallingFlameAnimations(animations);
    
    // Start animations with a slight delay to ensure modal is rendered
    setTimeout(() => {
      animations.forEach((flame) => {
        // Falling animation
        Animated.timing(flame.animatedValue, {
          toValue: height + 50, // Fall past bottom of screen
          duration: flame.duration,
          delay: flame.delay,
          useNativeDriver: true,
        }).start();
        
        // Rotation animation
        Animated.loop(
          Animated.timing(flame.rotation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      });
    }, 100);
  };

  // Create falling book animations (Research Insights)
  const createFallingBookAnimations = () => {
    const numberOfBooks = 8;
    const animations = [];
    
    for (let i = 0; i < numberOfBooks; i++) {
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
    
    setFallingBookAnimations(animations);
    
    // Start animations with a slight delay to ensure modal is rendered
    setTimeout(() => {
      animations.forEach((book) => {
        // Falling animation
        Animated.timing(book.animatedValue, {
          toValue: height + 50, // Fall past bottom of screen
          duration: book.duration,
          delay: book.delay,
          useNativeDriver: true,
        }).start();
        
        // Rotation animation
        Animated.loop(
          Animated.timing(book.rotation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      });
    }, 100);
  };

  // Create falling wallet animations (Financial Tracker)
  const createFallingWalletAnimations = () => {
    const numberOfWallets = 8;
    const animations = [];
    
    for (let i = 0; i < numberOfWallets; i++) {
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
    
    setFallingWalletAnimations(animations);
    
    // Start animations with a slight delay to ensure modal is rendered
    setTimeout(() => {
      animations.forEach((wallet) => {
        // Falling animation
        Animated.timing(wallet.animatedValue, {
          toValue: height + 50, // Fall past bottom of screen
          duration: wallet.duration,
          delay: wallet.delay,
          useNativeDriver: true,
        }).start();
        
        // Rotation animation
        Animated.loop(
          Animated.timing(wallet.rotation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      });
    }, 100);
  };

  // Create falling clock animations (Focus Timer)
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
    
    // Start animations with a slight delay to ensure modal is rendered
    setTimeout(() => {
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
    }, 100);
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
    
    // Check if this is a newly unlocked widget and show celebration
    if (component.requiresLevel && userLevel >= component.requiresLevel) {
      let congratsKey = '';
      let showCongratsFunc = null;
      let createAnimationFunc = null;
      let setUnlockStateFunc = null;
      
      // Determine which celebration to show based on component type
      switch (componentType) {
        case COMPONENT_TYPES.STREAK_COUNTER:
          congratsKey = 'customStreakCongratsShown';
          showCongratsFunc = setShowCustomStreakCongrats;
          createAnimationFunc = createFallingFlameAnimations;
          setUnlockStateFunc = setCustomStreakUnlockState;
          break;
        case COMPONENT_TYPES.RESEARCH_STATS:
          congratsKey = 'researchStatsCongratsShown';
          showCongratsFunc = setShowResearchStatsCongrats;
          createAnimationFunc = createFallingBookAnimations;
          setUnlockStateFunc = setResearchStatsUnlockState;
          break;
        case COMPONENT_TYPES.FOCUS_TIMER:
          congratsKey = 'focusTimerCongratsShown';
          showCongratsFunc = setShowFocusTimerCongrats;
          createAnimationFunc = createFallingClockAnimations;
          setUnlockStateFunc = setFocusTimerUnlockState;
          break;
        case COMPONENT_TYPES.FINANCIAL_TRACKER:
          congratsKey = 'financialTrackerCongratsShown';
          showCongratsFunc = setShowFinancialTrackerCongrats;
          createAnimationFunc = createFallingWalletAnimations;
          setUnlockStateFunc = setFinancialTrackerUnlockState;
          break;
      }
      
      if (congratsKey && showCongratsFunc && createAnimationFunc && setUnlockStateFunc) {
        const hasSeenCongrats = await AsyncStorage.getItem(congratsKey);
        
        if (!hasSeenCongrats) {
          console.log(`Showing congratulations popup for ${componentType}!`);
          // Show congratulations popup
          setIsAddModalVisible(false);
          showCongratsFunc(true);
          // Start falling animation
          createAnimationFunc();
          // Mark as seen and update unlock state
          await AsyncStorage.setItem(congratsKey, 'true');
          setUnlockStateFunc('seen');
          // Add the component after showing congrats
          const newWidget = createWidgetInstance(componentType);
          const updatedItems = [...dashboardItems, newWidget];
          setDashboardItems(updatedItems);
          saveDashboardConfig(updatedItems);
          return;
        } else {
          console.log(`User has already seen congrats for ${componentType}, proceeding normally`);
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
  
  // Create or get swipe animation for widget
  const getSwipeAnimation = (widgetId) => {
    if (!swipeAnimations[widgetId]) {
      const newSwipeAnim = new Animated.Value(0);
      setSwipeAnimations(prev => ({
        ...prev,
        [widgetId]: newSwipeAnim
      }));
      return newSwipeAnim;
    }
    return swipeAnimations[widgetId];
  };

  // Handle swipe gesture
  const handleSwipeGesture = (event, widgetId, index) => {
    const { translationX, state } = event.nativeEvent;
    const swipeAnim = getSwipeAnimation(widgetId);
    const SWIPE_THRESHOLD = -80; // Minimum swipe distance to trigger delete
    const SWIPE_DELETE_THRESHOLD = -120; // Distance to auto-delete

    if (state === State.ACTIVE) {
      // Only allow left swipes (negative translationX)
      if (translationX < 0) {
        setIsSwipeActive(prev => ({ ...prev, [widgetId]: true }));
        swipeAnim.setValue(Math.max(translationX, SWIPE_DELETE_THRESHOLD));
      }
    } else if (state === State.END) {
      const shouldDelete = translationX < SWIPE_DELETE_THRESHOLD;
      const shouldShowDelete = translationX < SWIPE_THRESHOLD;

      if (shouldDelete) {
        // Auto-delete if swiped far enough
        Animated.timing(swipeAnim, {
          toValue: -scaleWidth(400), // Animate off screen
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          removeComponent(index);
          // Reset animation state
          setIsSwipeActive(prev => {
            const newState = { ...prev };
            delete newState[widgetId];
            return newState;
          });
          setSwipeAnimations(prev => {
            const newState = { ...prev };
            delete newState[widgetId];
            return newState;
          });
        });
      } else if (shouldShowDelete) {
        // Show delete button
        Animated.spring(swipeAnim, {
          toValue: SWIPE_THRESHOLD,
          useNativeDriver: true,
        }).start();
      } else {
        // Snap back to original position
        Animated.spring(swipeAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          setIsSwipeActive(prev => ({ ...prev, [widgetId]: false }));
        });
      }
    }
  };

  // Handle delete button press from swipe
  const handleSwipeDelete = (widgetId, index) => {
    const swipeAnim = getSwipeAnimation(widgetId);
    
    Animated.timing(swipeAnim, {
      toValue: -scaleWidth(400), // Animate off screen
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      removeComponent(index);
      // Reset animation state
      setIsSwipeActive(prev => {
        const newState = { ...prev };
        delete newState[widgetId];
        return newState;
      });
      setSwipeAnimations(prev => {
        const newState = { ...prev };
        delete newState[widgetId];
        return newState;
      });
    });
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

  
  // Render a specific dashboard component
  const renderDashboardComponent = (widget, index) => {
    const componentInfo = DASHBOARD_COMPONENTS[widget.type];
    
    if (!componentInfo) return null;
    
    const Component = componentInfo.component;
    const requiresPremium = componentInfo.isPremium === true;
    const requiresLevel = componentInfo.requiresLevel;
    const hasPremiumAccess = isPremiumUser || !requiresPremium;
    const hasLevelAccess = !requiresLevel || userLevel >= requiresLevel;
    
    const swipeAnim = getSwipeAnimation(widget.id);
    const isWidgetSwipeActive = isSwipeActive[widget.id];
    
    return (
      <View key={widget.id} style={styles.componentContainer}>
        <PanGestureHandler
          onGestureEvent={(event) => handleSwipeGesture(event, widget.id, index)}
          onHandlerStateChange={(event) => handleSwipeGesture(event, widget.id, index)}
          activeOffsetX={[-10, 10000]} // Only trigger on left swipes
          failOffsetY={[-20, 20]} // Allow vertical scrolling
        >
          <Animated.View
            style={[
              styles.swipeableWidget,
              {
                transform: [{ translateX: swipeAnim }],
              }
            ]}
          >
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
          </Animated.View>
        </PanGestureHandler>
        
        {/* Red delete background shown during swipe */}
        {isWidgetSwipeActive && (
          <View style={[
            styles.deleteBackground,
            {
              backgroundColor: '#FF3B30',
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: 0,
              left: 0,
              justifyContent: 'center',
              alignItems: 'flex-end',
              paddingRight: scaleWidth(20),
            }
          ]}>
            <TouchableOpacity
              style={[
                styles.deleteButton,
                {
                  backgroundColor: 'transparent',
                  padding: scaleWidth(10),
                  borderRadius: scaleWidth(8),
                }
              ]}
              onPress={() => handleSwipeDelete(widget.id, index)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${widget.name}`}
              accessibilityHint={`Removes ${widget.name} from your dashboard`}
            >
              <Ionicons 
                name="trash" 
                size={scaleWidth(24)} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        )}
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
                        Unlock at stage {component.requiresLevel}
                      </Text>
                    )}
                    
                    {/* Show "Unlock" text for newly unlocked Custom Streak */}
                    {component.id === COMPONENT_TYPES.STREAK_COUNTER && customStreakUnlockState === 'unlocked' && (
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
                    
                    {/* Show "Unlock" text for newly unlocked Research Stats */}
                    {component.id === COMPONENT_TYPES.RESEARCH_STATS && researchStatsUnlockState === 'unlocked' && (
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
                    
                    {/* Show "Unlock" text for newly unlocked Financial Tracker */}
                    {component.id === COMPONENT_TYPES.FINANCIAL_TRACKER && financialTrackerUnlockState === 'unlocked' && (
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
                      // Custom Streak newly unlocked
                      : (component.id === COMPONENT_TYPES.STREAK_COUNTER && customStreakUnlockState === 'unlocked')
                        ? "lock-open"
                      // Research Stats newly unlocked
                      : (component.id === COMPONENT_TYPES.RESEARCH_STATS && researchStatsUnlockState === 'unlocked')
                        ? "lock-open"
                      // Focus Timer newly unlocked
                      : (component.id === COMPONENT_TYPES.FOCUS_TIMER && focusTimerUnlockState === 'unlocked')
                        ? "lock-open"
                      // Financial Tracker newly unlocked
                      : (component.id === COMPONENT_TYPES.FINANCIAL_TRACKER && financialTrackerUnlockState === 'unlocked')
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
                      // Custom Streak newly unlocked
                      : (component.id === COMPONENT_TYPES.STREAK_COUNTER && customStreakUnlockState === 'unlocked')
                        ? '#4CAF50'
                      // Research Stats newly unlocked
                      : (component.id === COMPONENT_TYPES.RESEARCH_STATS && researchStatsUnlockState === 'unlocked')
                        ? '#4CAF50'
                      // Focus Timer newly unlocked
                      : (component.id === COMPONENT_TYPES.FOCUS_TIMER && focusTimerUnlockState === 'unlocked')
                        ? '#4CAF50'
                      // Financial Tracker newly unlocked
                      : (component.id === COMPONENT_TYPES.FINANCIAL_TRACKER && financialTrackerUnlockState === 'unlocked')
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
  
  // Render Custom Streak congratulations modal
  const renderCustomStreakCongratsModal = () => {
    return (
      <Modal
        visible={showCustomStreakCongrats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCustomStreakCongrats(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Falling Flame Icons */}
          {fallingFlameAnimations.map((flame) => (
            <Animated.View
              key={flame.id}
              style={[
                styles.fallingClock,
                {
                  left: flame.horizontalPosition,
                  transform: [
                    {
                      translateY: flame.animatedValue
                    },
                    {
                      rotate: flame.rotation.interpolate({
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
                name="flame-outline" 
                size={scaleWidth(24)} 
                color="#FF4500" 
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
              borderWidth: 1,
              padding: scaleWidth(24),
            }
          ]}>
            {/* Celebration Icon */}
            <View style={[
              styles.congratsIconContainer,
              {
                backgroundColor: '#FF4500',
                width: scaleWidth(80),
                height: scaleWidth(80),
                borderRadius: scaleWidth(40),
                marginBottom: scaleHeight(16),
              }
            ]}>
              <Ionicons name="flame" size={scaleWidth(40)} color="#FFFFFF" />
            </View>
            
            <Text style={[
              styles.congratsTitle,
              {
                color: theme.text,
                fontSize: scaleFontSize(22),
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: scaleHeight(12)
              }
            ]}>
              🎉 Stage 2 Unlocked!
            </Text>
            
            <Text style={[
              styles.congratsSubtitle,
              {
                color: '#FF4500',
                fontSize: scaleFontSize(18),
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: scaleHeight(16)
              }
            ]}>
              Custom Streak Tracker
            </Text>
            
            <Text style={[
              styles.congratsDescription,
              {
                color: theme.text,
                fontSize: scaleFontSize(16),
                lineHeight: scaleFontSize(22),
                textAlign: 'center',
                marginBottom: scaleHeight(24)
              }
            ]}>
              Track any streak in your life! View your progress on a calendar, create checklists to complete each day, and watch your consistency grow.
            </Text>
            
            {/* Get Started Button */}
            <TouchableOpacity
              style={[
                styles.congratsButton,
                {
                  backgroundColor: '#FF4500',
                  paddingVertical: scaleHeight(14),
                  borderRadius: scaleWidth(12),
                  marginTop: scaleHeight(8)
                }
              ]}
              onPress={() => setShowCustomStreakCongrats(false)}
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
              >
                Start Tracking! 🔥
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Render Research Stats congratulations modal
  const renderResearchStatsCongratsModal = () => {
    return (
      <Modal
        visible={showResearchStatsCongrats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResearchStatsCongrats(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Falling Book Icons */}
          {fallingBookAnimations.map((book) => (
            <Animated.View
              key={book.id}
              style={[
                styles.fallingClock,
                {
                  left: book.horizontalPosition,
                  transform: [
                    {
                      translateY: book.animatedValue
                    },
                    {
                      rotate: book.rotation.interpolate({
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
                name="book-outline" 
                size={scaleWidth(24)} 
                color="#4CAF50" 
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
              borderWidth: 1,
              padding: scaleWidth(24),
            }
          ]}>
            {/* Celebration Icon */}
            <View style={[
              styles.congratsIconContainer,
              {
                backgroundColor: '#4CAF50',
                width: scaleWidth(80),
                height: scaleWidth(80),
                borderRadius: scaleWidth(40),
                marginBottom: scaleHeight(16),
              }
            ]}>
              <Ionicons name="book" size={scaleWidth(40)} color="#FFFFFF" />
            </View>
            
            <Text style={[
              styles.congratsTitle,
              {
                color: theme.text,
                fontSize: scaleFontSize(22),
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: scaleHeight(12)
              }
            ]}>
              🎉 Stage 3 Unlocked!
            </Text>
            
            <Text style={[
              styles.congratsSubtitle,
              {
                color: '#4CAF50',
                fontSize: scaleFontSize(18),
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: scaleHeight(16)
              }
            ]}>
              Research Insights
            </Text>
            
            <Text style={[
              styles.congratsDescription,
              {
                color: theme.text,
                fontSize: scaleFontSize(16),
                lineHeight: scaleFontSize(22),
                textAlign: 'center',
                marginBottom: scaleHeight(24)
              }
            ]}>
              Access inspiring research about goal setting and life domains! Read evidence-based insights that will motivate and guide your journey to success.
            </Text>
            
            {/* Get Started Button */}
            <TouchableOpacity
              style={[
                styles.congratsButton,
                {
                  backgroundColor: '#4CAF50',
                  paddingVertical: scaleHeight(14),
                  borderRadius: scaleWidth(12),
                  marginTop: scaleHeight(8)
                }
              ]}
              onPress={() => setShowResearchStatsCongrats(false)}
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
              >
                Get Inspired! 📚
              </Text>
            </TouchableOpacity>
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
                You've reached Stage 4 and unlocked the Focus Timer! This powerful tool helps you maintain deep focus using scientifically-proven 90-minute work cycles.
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

  // Render Financial Tracker congratulations modal
  const renderFinancialTrackerCongratsModal = () => {
    return (
      <Modal
        visible={showFinancialTrackerCongrats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFinancialTrackerCongrats(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Falling Wallet Icons */}
          {fallingWalletAnimations.map((wallet) => (
            <Animated.View
              key={wallet.id}
              style={[
                styles.fallingClock,
                {
                  left: wallet.horizontalPosition,
                  transform: [
                    {
                      translateY: wallet.animatedValue
                    },
                    {
                      rotate: wallet.rotation.interpolate({
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
                name="wallet-outline" 
                size={scaleWidth(24)} 
                color="#FFD700" 
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
              borderWidth: 1,
              padding: scaleWidth(24),
            }
          ]}>
            {/* Celebration Icon */}
            <View style={[
              styles.congratsIconContainer,
              {
                backgroundColor: '#FFD700',
                width: scaleWidth(80),
                height: scaleWidth(80),
                borderRadius: scaleWidth(40),
                marginBottom: scaleHeight(16),
              }
            ]}>
              <Ionicons name="wallet" size={scaleWidth(40)} color="#000000" />
            </View>
            
            <Text style={[
              styles.congratsTitle,
              {
                color: theme.text,
                fontSize: scaleFontSize(22),
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: scaleHeight(12)
              }
            ]}>
              🎉 Stage 5 Unlocked!
            </Text>
            
            <Text style={[
              styles.congratsSubtitle,
              {
                color: '#FFD700',
                fontSize: scaleFontSize(18),
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: scaleHeight(16)
              }
            ]}>
              Financial Tracker
            </Text>
            
            <Text style={[
              styles.congratsDescription,
              {
                color: theme.text,
                fontSize: scaleFontSize(16),
                lineHeight: scaleFontSize(22),
                textAlign: 'center',
                marginBottom: scaleHeight(24)
              }
            ]}>
              Master your financial future! Track income, expenses, savings, and debt. Set financial goals and monitor your progress towards financial freedom.
            </Text>
            
            {/* Get Started Button */}
            <TouchableOpacity
              style={[
                styles.congratsButton,
                {
                  backgroundColor: '#FFD700',
                  paddingVertical: scaleHeight(14),
                  borderRadius: scaleWidth(12),
                  marginTop: scaleHeight(8)
                }
              ]}
              onPress={() => setShowFinancialTrackerCongrats(false)}
            >
              <Text 
                style={[
                  styles.congratsButtonText,
                  {
                    color: '#000000',
                    fontSize: scaleFontSize(16),
                    fontWeight: 'bold',
                    textAlign: 'center'
                  }
                ]}
              >
                Build Wealth! 💰
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
          
          {/* Dev Tool - Reset Celebrations */}
          {__DEV__ && (
            <TouchableOpacity
              style={[
                styles.devButton, 
                { 
                  backgroundColor: 'rgba(255,0,0,0.15)',
                  width: scaleWidth(32),
                  height: scaleWidth(32),
                  borderRadius: scaleWidth(16),
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: scaleWidth(8)
                }
              ]}
              onPress={async () => {
                try {
                  // Clear all celebration flags
                  await AsyncStorage.removeItem('customStreakCongratsShown');
                  await AsyncStorage.removeItem('researchStatsCongratsShown');
                  await AsyncStorage.removeItem('focusTimerCongratsShown');
                  await AsyncStorage.removeItem('financialTrackerCongratsShown');
                  
                  // Reset all unlock states to allow celebrations again
                  setCustomStreakUnlockState('unlocked');
                  setResearchStatsUnlockState('unlocked');
                  setFocusTimerUnlockState('unlocked');
                  setFinancialTrackerUnlockState('unlocked');
                  
                  console.log('🎉 All celebration animations reset - ready to test again!');
                  // Optional: Show a quick feedback
                  if (showSuccess) {
                    showSuccess('Celebrations reset! 🎉');
                  }
                } catch (error) {
                  console.error('Error resetting celebrations:', error);
                }
              }}
              accessibilityLabel="Reset celebrations"
              accessibilityHint="Clear celebration flags for testing"
            >
              <Ionicons 
                name="refresh-circle" 
                size={scaleWidth(16)} 
                color="#FF0000" 
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
      {renderCustomStreakCongratsModal()}
      {renderResearchStatsCongratsModal()}
      {renderFocusTimerCongratsModal()}
      {renderFinancialTrackerCongratsModal()}
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
    overflow: 'hidden', // Ensure swipe doesn't show outside bounds
  },
  swipeableWidget: {
    position: 'relative',
    zIndex: 10,
  },
  deleteBackground: {
    borderRadius: scaleWidth(12), // Match widget border radius
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
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
  // Falling animation styles
  fallingIcon: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
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
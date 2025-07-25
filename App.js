// App.js
// Updated with tab bar using relative positioning and full-screen support
// Optimized for iOS responsiveness and accessibility

// Import PlatformFix at the very top before other imports to ensure Platform is available globally
import './PlatformFix';

import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { 
  View, 
  Text,
  TouchableOpacity,
  Platform, 
  TextInput, 
  LogBox,
  InteractionManager,
  Animated
} from 'react-native';
import { 
  SafeAreaProvider, 
  initialWindowMetrics
} from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import { runStartupDataCheck } from './src/utils/StartupDataCheck';
import * as FeatureExplorerTracker from './src/services/FeatureExplorerTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  getByDeviceSize
} from './src/utils/responsive';

// Add WebSocket initialization import
import { initializeWebSocket } from './src/services/AIService';

// Initialize AWS Amplify with minimal configuration
import { Amplify } from 'aws-amplify';

// Import GlobalAchievementToast for achievement notifications
import GlobalAchievementToast from './src/components/GlobalAchievementToast';

// Import the AppContextUpdater to handle automatic app summary updates
import AppContextUpdater from './src/context/AppContextUpdater';

// Import I18nProvider for translation support
import { I18nProvider } from './src/screens/Onboarding/context/I18nContext';

// Initialize AWS Amplify at the application root
const initializeAmplify = () => {
  try {
    console.log('Initializing AWS Amplify at app root with minimal config');
    
    // Minimal AWS Configuration - only what's needed for basic auth
    const awsConfig = {
      Auth: {
        region: 'ap-southeast-2',
        userPoolId: 'ap-southeast-2_DswoUlwql',
        userPoolWebClientId: 'unr38aneiujkjoptt5p7pg6tp',
      }
    };
    
    // Configure Amplify
    Amplify.configure(awsConfig);
    console.log('✅ AWS Amplify minimal config successful');
    return true;
  } catch (error) {
    console.error('❌ AWS Amplify initialization error:', error);
    return false;
  }
};

// Call initialization immediately
initializeAmplify();

// Global method to control AI button visibility
if (typeof window !== 'undefined' && !window.setAIButtonVisible) {
  window.aiButtonVisible = true;
  window.setAIButtonVisible = (visible) => {
    window.aiButtonVisible = visible;
  };
}

// Import notification helper functions
import { 
  configureNotifications, 
  setupNotificationListeners,
  verifyiOSNotificationSettings
} from './src/utils/NotificationHelper';

// Import LoggerUtility for global log filtering
import { setupGlobalLogFilter } from './src/utils/LoggerUtility';

// Import Custom Tab Bar for enhanced animations
import CustomTabBar from './src/components/CustomTabBar';

// Import ProfileProvider
import { ProfileProvider } from './src/context/ProfileContext';

// Prevent warnings from showing on screen during development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'useEffect must not return anything besides a function',
  'useInsertionEffect must not schedule updates',
  'RangeError: Maximum call stack size exceeded',
  "Property 'Platform' doesn't exist",
  "The 'navigation' object hasn't been initialized yet",
  "Cannot read property 'scrollTo' of null"  // Added to suppress the ScrollView error
]);

// Safely import keyboard manager for iOS
let KeyboardManager;
if (Platform && Platform.OS === 'ios') {
  try {
    // Set global TextInput defaults to disable predictions
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.autoCorrect = false;
    TextInput.defaultProps.spellCheck = false;
    TextInput.defaultProps.autoComplete = 'off';
    TextInput.defaultProps.textContentType = 'none';
    
    KeyboardManager = require('react-native-keyboard-manager').KeyboardManager;
    if (KeyboardManager) {
      // First completely disable keyboard manager
      if (typeof KeyboardManager.setEnable === 'function') {
        KeyboardManager.setEnable(false);
      }
      
      // Then re-enable with specific settings (after a brief delay)
      setTimeout(() => {
        if (typeof KeyboardManager.setEnable === 'function') {
          KeyboardManager.setEnable(true);
          
          // Disable auto toolbar
          if (typeof KeyboardManager.setEnableAutoToolbar === 'function') {
            KeyboardManager.setEnableAutoToolbar(false);
          }
          
          // Disable predictive text
          if (typeof KeyboardManager.setPredictiveText === 'function') {
            KeyboardManager.setPredictiveText(false);
          }
          
          // Additional settings that help with keyboard handling
          if (typeof KeyboardManager.setShouldResignOnTouchOutside === 'function') {
            KeyboardManager.setShouldResignOnTouchOutside(true);
          }
        }
      }, 300);
    }
  } catch (error) {
    console.error('Error initializing KeyboardManager:', error);
  }
}

// Import screens
import GoalsScreen from './src/screens/GoalsScreen';
import TimeScreen from './src/screens/TimeScreen';
import TasksScreen from './src/screens/TasksScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import TimeBlockScreen from './src/screens/TimeBlockScreen';
import ProjectDetailsScreen from './src/screens/ProjectDetailsScreen';
import GoalDetailsScreen from './src/screens/GoalDetailsScreen';
import TodoListScreen from './src/screens/TodoListScreen';
// UPDATED: Import LoginScreen from new location
import { LoginScreen } from './src/components/ai/LoginScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import AdminFeedbackScreen from './src/screens/AdminFeedbackScreen';
import NotificationTestScreen from './src/screens/NotificationTestScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import AIContextScreen from './src/screens/PersonalKnowledgeScreen';
import OnboardingScreen from './src/screens/Onboarding';
import StreamlinedOnboardingScreen from './src/screens/Onboarding/StreamlinedOnboardingScreen';
import EnhancedOnboardingScreen from './src/screens/Onboarding/EnhancedOnboardingScreen';
import PricingScreen from './src/screens/PricingScreen/index';
import GoalProgressScreen from './src/screens/GoalProgressScreen';
import LifePlanOverviewScreen from './src/screens/LifePlanOverviewScreen';
import ReferralScreen from './src/screens/Referral';
import DiagnosticsScreen from './src/screens/DiagnosticsScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import WatchAdsScreen from './src/screens/WatchAdsScreen'; // NEW: Import WatchAdsScreen
import CommunityScreen from './src/screens/CommunityScreen/CommunityScreen'; // NEW: Import CommunityScreen
import StreakDetailScreen from './src/screens/StreakDetailScreen'; // NEW: Import StreakDetailScreen

// Import AI components that are used as screens
import AILoginScreen from './src/components/ai/LoginScreen';

// Components
import LoadingScreen from './src/components/LoadingScreen';
import FloatingAIButton from './src/components/FloatingAIButton';
import ProfileStack from './src/components/ProfileStack';

// Context Providers
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AppProvider, useAppContext } from './src/context/AppContext';
import { NotificationProvider, useNotification } from './src/context/NotificationContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AchievementProvider } from './src/context/AchievementContext';

// Prevent native splash screen from autohiding
SplashScreen.preventAutoHideAsync().catch(console.warn);

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Define loading durations - 2 SECONDS as requested
const LOADING_DURATION = 2000;  // 2 seconds for loading

// Feature flags for onboarding
const USE_STREAMLINED_ONBOARDING = false; // Set to false to use the original onboarding
const USE_ENHANCED_ONBOARDING = true; // Set to true to use the new enhanced onboarding

// Deferred styles - only created when needed
let styles;
function getStyles() {
  if (!styles) {
    styles = {
      container: {
        flex: 1,
      },
      contentContainer: {
        flex: 1,
        paddingBottom: 0, // Remove padding to prevent spacing issues
      },
      errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: spacing.l,
      },
      errorText: {
        fontSize: fontSizes.l,
        color: '#333',
        marginBottom: spacing.l,
        textAlign: 'center',
      },
      errorButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.m,
        borderRadius: scaleWidth(8),
        minWidth: scaleWidth(160),
        alignItems: 'center',
      },
      errorButtonText: {
        color: '#fff',
        fontSize: fontSizes.m,
        fontWeight: '600',
      },
    };
  }
  return styles;
}

// Navigation Error Boundary Component
class NavigationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.recoveryAttempts = 0;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Navigation Error Caught:', error, errorInfo);
    
    // Check if it's a stack overflow error
    if (error.message && error.message.includes('Maximum call stack size exceeded')) {
      console.log('Stack overflow detected, attempting recovery...');
      
      // Get navigation ref from props
      const { navigationRef } = this.props;
      
      if (navigationRef && navigationRef.current) {
        // Reset to a safe state - wrap in setTimeout to break the call stack
        setTimeout(() => {
          try {
            navigationRef.current.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Main' }],
              })
            );
            
            // Clear error state after navigation
            this.setState({ hasError: false, error: null });
          } catch (navError) {
            console.log('Navigation recovery failed:', navError);
            // If we fail to navigate, just clear the error state anyway
            this.setState({ hasError: false, error: null });
          }
        }, 100);
      }
    } else if (error.message && error.message.includes("The 'navigation' object hasn't been initialized yet")) {
      console.log('Navigation not initialized error, attempting recovery...');
      
      // This type of error usually resolves itself after a moment
      this.recoveryAttempts++;
      
      // Use a longer delay for more recovery attempts
      const delay = Math.min(100 * this.recoveryAttempts, 1000);
      
      setTimeout(() => {
        // Just clear the error state and let React retry
        this.setState({ hasError: false, error: null });
      }, delay);
    } else if (error.message && error.message.includes("Cannot read property 'scrollTo' of null")) {
      console.log('ScrollTo error detected, attempting recovery...');
      
      // This is likely a timing issue, just clear the error
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 100);
    }
  }

  render() {
    const s = getStyles();
    
    if (this.state.hasError) {
      return (
        <View style={s.errorContainer}>
          <Text 
            style={[s.errorText, { fontSize: fontSizes.l }]}
            maxFontSizeMultiplier={1.3}
            accessible={true}
            accessibilityLabel="Navigation error message"
          >
            Something went wrong
          </Text>
          <TouchableOpacity 
            style={[
              s.errorButton,
              { minWidth: scaleWidth(160), minHeight: scaleHeight(50) }
            ]}
            onPress={() => {
              // Provide haptic feedback
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              
              this.setState({ hasError: false, error: null });
              // Try to navigate to main
              const { navigationRef } = this.props;
              if (navigationRef && navigationRef.current) {
                try {
                  navigationRef.current.dispatch(
                    CommonActions.reset({
                      index: 0,
                      routes: [{ name: 'Main' }],
                    })
                  );
                } catch (e) {
                  console.log('Error during navigation reset:', e);
                  // If navigation fails, at least clear error state
                  this.setState({ hasError: false, error: null });
                }
              }
            }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go to home screen"
            accessibilityHint="Returns to the main dashboard"
          >
            <Text 
              style={[
                s.errorButtonText,
                { fontSize: fontSizes.m }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Go to Home
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Stack navigators for each tab
const GoalsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        animation: 'default',
      }}
    >
      <Stack.Screen 
        name="Goals" 
        component={GoalsScreen} 
        options={{ unmountOnBlur: false }} 
      />
      <Stack.Screen name="GoalDetails" component={GoalDetailsScreen} />
    </Stack.Navigator>
  );
};

const ProjectsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Projects" 
        component={TasksScreen} 
        options={{ unmountOnBlur: false }} 
      />
      <Stack.Screen name="ProjectDetails" component={ProjectDetailsScreen} />
    </Stack.Navigator>
  );
};

const TimeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Time" 
        component={TimeScreen} 
        options={{ unmountOnBlur: false }} 
      />
      <Stack.Screen name="TimeBlock" component={TimeBlockScreen} />
      <Stack.Screen name="NotificationTest" component={NotificationTestScreen} />
    </Stack.Navigator>
  );
};

const TodoStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="TodoList" 
        component={TodoListScreen} 
        options={{ unmountOnBlur: false }} 
      />
    </Stack.Navigator>
  );
};

// Function to create tab bar icon with accessibility
const createTabBarIcon = (iconName, label, focused, color) => {
  const activeIconName = iconName;
  const inactiveIconName = `${iconName}-outline`;
  
  return (
    <Ionicons 
      name={focused ? activeIconName : inactiveIconName} 
      size={scaleFontSize(22)} 
      color={color}
      accessible={true}
      accessibilityLabel={`${label} tab ${focused ? 'selected' : ''}`}
    />
  );
};

// Main tab navigator with stacks and enhanced animations
function MainTabNavigator({ route }) {
  const s = getStyles();
  const { theme } = useTheme();
  const auth = useAuth();
  
  // Track if coming from onboarding to determine initial tab
  const [fromOnboarding, setFromOnboarding] = useState(false);
  
  // Get screen dimensions and safe area insets
  const { width, height } = useScreenDimensions();
  const safeSpacing = useSafeSpacing();
  const isLandscape = useIsLandscape();
  
  // Track full-screen state for the entire app
  const [isAnyScreenFullScreen, setIsAnyScreenFullScreen] = useState(false);
  
  // Navigation ref for notification navigation
  const tabNavigationRef = useRef(null);
  
  // Animation values for tab transitions
  const contentOpacity = useRef(new Animated.Value(1)).current;
  const prevTabIndex = useRef(0);

  // Calculate responsive tab bar height based on device
  const tabBarHeight = getByDeviceSize({
    small: 55,
    medium: 60,
    large: 65,
    tablet: 70
  });
  
  // Check if coming from onboarding on mount
  useEffect(() => {
    const checkFromOnboarding = async () => {
      try {
        const isDirectFromOnboarding = await AsyncStorage.getItem('directFromOnboarding');
        if (isDirectFromOnboarding === 'true') {
          console.log('MainTabNavigator: Coming from onboarding');
          setFromOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkFromOnboarding();
  }, []);

  // Listen for full-screen state changes from any screen
  useEffect(() => {
    const handleFullScreenChange = (event) => {
      if (event && event.detail) {
        const isFullScreen = event.detail.fullScreen || false;
        setIsAnyScreenFullScreen(isFullScreen);
      }
    };
    
    // Add event listener if in web environment
    if (typeof document !== 'undefined') {
      document.addEventListener('app-fullscreen-changed', handleFullScreenChange);
    }
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('app-fullscreen-changed', handleFullScreenChange);
      }
    };
  }, []);

  // Set up notification listeners for handling notification taps
  useEffect(() => {
    const cleanup = setupNotificationListeners(tabNavigationRef?.current?.navigate);
    return cleanup;
  }, [tabNavigationRef]);
  
  // Handle tab change transitions
  const handleTabChange = (prevState, newState) => {
    // Only animate when actually changing tabs (not on initial render)
    if (prevState && newState && prevState.index !== newState.index) {
      // Determine animation direction (left to right or right to left)
      const goingForward = newState.index > prevTabIndex.current;
      prevTabIndex.current = newState.index;
      
      // Simple opacity animation for the transition
      Animated.sequence([
        // Fade out slightly
        Animated.timing(contentOpacity, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        // Fade back in
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Provide haptic feedback on tab changes for better user experience
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  return (
    <View style={s.container}>
      <Animated.View style={[s.contentContainer, { opacity: contentOpacity }]}>
        <Tab.Navigator
          // Set initial route to ProfileTab when coming from onboarding
          initialRouteName="ProfileTab"
          screenOptions={{
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.textSecondary,
            headerShown: false,
            // Apply multiple hiding techniques for the tab bar with responsive values
            tabBarStyle: {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              position: 'absolute',
              height: isAnyScreenFullScreen ? 0 : tabBarHeight,
              paddingBottom: isAnyScreenFullScreen ? 0 : safeSpacing.bottom > 0 ? safeSpacing.bottom - scaleHeight(10) : 0,
              borderTopWidth: isAnyScreenFullScreen ? 0 : 0.5,
              elevation: 0,
              shadowOpacity: 0,
              opacity: isAnyScreenFullScreen ? 0 : 1,
              overflow: 'hidden',
              display: isAnyScreenFullScreen ? 'none' : 'flex',
            },
            tabBarItemStyle: {
              // Ensure minimum touch target size for accessibility (44pt is Apple's requirement)
              height: isAnyScreenFullScreen ? 0 : 44,
              paddingTop: isSmallDevice ? spacing.xs : spacing.s,
            },
            tabBarLabelStyle: {
              fontSize: isSmallDevice ? fontSizes.xs : fontSizes.s,
              paddingBottom: isSmallDevice ? spacing.xxs : spacing.xs,
            },
            unmountOnBlur: false,
            freezeOnBlur: true,
          }}
          // Conditionally render the custom tab bar
          tabBar={(props) => {
            // Don't render the tab bar at all when in full-screen mode
            if (isAnyScreenFullScreen) {
              return null;
            }
            
            // Otherwise render the custom tab bar with responsive props
            return (
              <CustomTabBar 
                {...props} 
                theme={theme} 
                responsive={{
                  tabBarHeight,
                  safeSpacing,
                  isSmallDevice,
                  isTablet,
                  fontSizes,
                  spacing
                }}
              />
            );
          }}
          // Track state changes for animations
          onStateChange={handleTabChange}
          lazy={false}
          detachInactiveScreens={false}
        >
          <Tab.Screen 
            name="ProfileTab" 
            component={ProfileStack}
            options={{ 
              tabBarLabel: 'Dashboard',
              tabBarIcon: ({ focused, color }) => 
                createTabBarIcon('grid', 'Dashboard', focused, color),
              tabBarAccessibilityLabel: "Dashboard tab"
            }} 
          />
          <Tab.Screen 
            name="GoalsTab" 
            component={GoalsStack} 
            options={{ 
              tabBarLabel: 'Goals',
              tabBarIcon: ({ focused, color }) => 
                createTabBarIcon('star', 'Goals', focused, color),
              tabBarAccessibilityLabel: "Goals tab"
            }} 
          />
          <Tab.Screen 
            name="ProjectsTab"
            component={ProjectsStack}
            options={({ route }) => {
              // Get the viewMode from route params, default to 'projects'
              const viewMode = route.params?.viewMode || 'projects';
              
              // Set the label based on viewMode
              const label = viewMode === 'projects' ? 'Projects' : 'Tasks';
              
              // Set the icon based on viewMode
              const iconName = viewMode === 'projects' ? 'folder' : 'list';
              
              return {
                tabBarLabel: label,
                tabBarIcon: ({ focused, color }) => 
                  createTabBarIcon(iconName, label, focused, color),
                tabBarAccessibilityLabel: `${label} tab`
              };
            }}
          />
          <Tab.Screen 
            name="TimeTab" 
            component={TimeStack} 
            options={{ 
              tabBarLabel: 'Time',
              tabBarIcon: ({ focused, color }) => 
                createTabBarIcon('time', 'Time', focused, color),
              tabBarAccessibilityLabel: "Time tab"
            }} 
          />
          <Tab.Screen 
            name="TodoTab" 
            component={TodoStack} 
            options={({ route }) => {
              const currentView = route.params?.currentView || 'todo';
              const label = currentView === 'notes' ? 'Notes' : 'To-Do';
              const iconName = currentView === 'todo' ? 'checkbox' : 'document-text';
              
              return {
                tabBarLabel: label,
                tabBarIcon: ({ focused, color }) => 
                  createTabBarIcon(iconName, label, focused, color),
                tabBarAccessibilityLabel: `${label} tab`
              };
            }}
          />
        </Tab.Navigator>
      </Animated.View>
      
      {/* Add Floating AI Button to the main tab navigator with responsive props */}
      <FloatingAIButton 
        theme={theme} 
        safeSpacing={safeSpacing}
        isTablet={isTablet}
        isLandscape={isLandscape}
      />
    </View>
  );
}

// App content with navigation structure
function AppContent({ navigationRef }) {
  const s = getStyles();
  const auth = useAuth();
  const appContext = useAppContext();
  const notification = useNotification();
  const showSuccess = notification?.showSuccess || (() => {});
  const [isReady, setIsReady] = useState(false);
  const [isStable, setIsStable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [directFromOnboarding, setDirectFromOnboarding] = useState(false);
  
  // Get safe area insets for proper spacing
  const safeSpacing = useSafeSpacing();
  
  // Check if onboarding is completed
  const { settings = {} } = appContext || {};
  const onboardingCompleted = settings?.onboardingCompleted || false;
  
  // Check if we're coming directly from onboarding
  useEffect(() => {
    // Check if we're coming directly from onboarding
    const checkDirectFromOnboarding = async () => {
      try {
        const isDirectFromOnboarding = await AsyncStorage.getItem('directFromOnboarding');
        if (isDirectFromOnboarding === 'true') {
          // Set the state to skip loading screen
          setDirectFromOnboarding(true);
          // Clear the flag so we don't skip loading next time
          await AsyncStorage.setItem('directFromOnboarding', 'false');
        }
      } catch (error) {
        console.error('Error checking direct from onboarding:', error);
      }
    };
    
    checkDirectFromOnboarding();
  }, []);
  
  // Initialize the app
  useEffect(() => {
    async function initialize() {
      try {
        // Hide splash screen
        await SplashScreen.hideAsync();
        
        // Run startup tasks in parallel
        await Promise.all([
          runStartupDataCheck().catch(err => console.error('Startup check error:', err)),
          configureNotifications().catch(err => console.error('Notification setup error:', err))
        ]);
        
        // Initialize WebSocket connection
        initializeWebSocket();
        
        // Track daily login for streak achievements
        await FeatureExplorerTracker.trackDailyLogin(showSuccess);
        console.log('Daily login tracked for streak achievements');
        
        // Mark as initialized
        setIsInitialized(true);
      } catch (error) {
        console.error('Error during initialization:', error);
        // Even if there's an error, continue to the app
        setIsInitialized(true);
      }
    }
    
    // Run initialization
    initialize();
    
    // Set a backup timeout just in case
    const timeout = setTimeout(() => {
      setIsInitialized(true);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Add a ready check to prevent render issues
  useEffect(() => {
    // First timer for basic readiness
    const readyTimer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    
    // Second timer for stability
    const stableTimer = setTimeout(() => {
      setIsStable(true);
    }, 200);
    
    return () => {
      clearTimeout(readyTimer);
      clearTimeout(stableTimer);
    };
  }, []);
  
  // Wait for interaction completion before rendering
  useEffect(() => {
    if (isReady && !isStable) {
      InteractionManager.runAfterInteractions(() => {
        setIsStable(true);
      });
    }
  }, [isReady, isStable]);
  
  if (!isReady || !isStable || !isInitialized) {
    return null; // Return null briefly to prevent render issues
  }
  
  // CONDITIONAL RENDERING FOR LOADING SCREEN
  // If onboarding is not completed, render navigation container without loading screen
  // If onboarding is completed, wrap the navigation container with loading screen
  
  // Content to be conditionally wrapped
  const navigationContent = (
    <NavigationContainer ref={navigationRef}>
      <NavigationErrorBoundary navigationRef={navigationRef}>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: false,
            // Use fade animation to prevent issues
            animation: 'fade',
            animationDuration: 200,
          }}
        >
          {/* Modified navigation structure based on onboarding status */}
          {!onboardingCompleted ? (
            <Stack.Screen
              name="Onboarding"
              component={
                USE_ENHANCED_ONBOARDING 
                  ? EnhancedOnboardingScreen 
                  : (USE_STREAMLINED_ONBOARDING ? StreamlinedOnboardingScreen : OnboardingScreen)
              }
              options={{
                gestureEnabled: false,
                animationEnabled: true,
                // Ensure proper unmounting
                unmountOnBlur: true,
              }}
            />
          ) : (
            // Main tabs when onboarding completed
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator} 
              options={{
                gestureEnabled: false,
                animationEnabled: false, // Disable animation to prevent flicker
                // Ensure proper mounting
                unmountOnBlur: false,
              }}
            />
          )}
          
          {/* Add additional screens at root level for global access */}
          <Stack.Screen name="FeedbackScreen" component={FeedbackScreen} />
          <Stack.Screen name="AdminFeedbackScreen" component={AdminFeedbackScreen} />
          <Stack.Screen name="NotificationTest" component={NotificationTestScreen} />
          <Stack.Screen name="TimeBlock" component={TimeBlockScreen} />
          <Stack.Screen name="AIAssistant" component={AIAssistantScreen} />
          <Stack.Screen name="Conversations" component={ConversationsScreen} />
          <Stack.Screen name="PersonalKnowledgeScreen" component={AIContextScreen} />
          <Stack.Screen name="GoalProgress" component={GoalProgressScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="PricingScreen" component={PricingScreen} />
          <Stack.Screen name="ReferralScreen" component={ReferralScreen} />
          <Stack.Screen name="LifePlanOverview" component={LifePlanOverviewScreen} />
          <Stack.Screen name="Diagnostics" component={DiagnosticsScreen} />
          <Stack.Screen name="AchievementsScreen" component={AchievementsScreen} />
          <Stack.Screen name="AILoginScreen" component={AILoginScreen} />
          <Stack.Screen name="WatchAdsScreen" component={WatchAdsScreen} />
          <Stack.Screen name="CommunityScreen" component={CommunityScreen} />
          <Stack.Screen name="StreakDetailScreen" component={StreakDetailScreen} />
          {/* Login screen is still available but not forced initially */}
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationErrorBoundary>
      
      {/* Add GlobalAchievementToast to show achievement notifications */}
      <GlobalAchievementToast />
    </NavigationContainer>
  );
  
  // Conditional rendering based on onboarding status
  return (onboardingCompleted && !directFromOnboarding) ? (
    // If onboarding is completed but NOT directly from onboarding, show the loading screen
    <LoadingScreen 
      duration={LOADING_DURATION}
      destination="Main"
      fromOnboarding={false}
      // Pass responsive props to LoadingScreen
      responsive={{
        safeSpacing,
        isSmallDevice,
        isTablet,
        fontSizes,
        spacing
      }}
    >
      {navigationContent}
    </LoadingScreen>
  ) : (
    // If onboarding is not completed OR we're coming directly from onboarding, skip loading
    navigationContent
  );
}

// Main App component with proper context providers
const App = () => {
  // Set up global log filtering
  setupGlobalLogFilter();
  const navigationRef = useRef();
  
  // Initialize haptic feedback on app start
  useEffect(() => {
    // Initialize haptic feedback
    if (Platform.OS === 'ios') {
      try {
        const initializeHaptic = require('./src/screens/Onboarding/utils/hapticUtils').initializeHaptic;
        initializeHaptic();
      } catch (e) {
        console.log('Haptic feedback initialization error:', e);
      }
    }
  }, []);

  // Add error boundary
  useEffect(() => {
    const handleError = (error, stackTrace) => {
      console.log('Global error handler:', error);
      
      // Check for stack overflow
      if (error && error.message && error.message.includes('Maximum call stack size exceeded')) {
        console.log('Global stack overflow detected');
        // The NavigationErrorBoundary will handle navigation recovery
      }
      
      // Check for Platform errors
      if (error && error.message && error.message.includes("Property 'Platform' doesn't exist")) {
        console.log('Platform initialization error detected');
        // This is a Hermes engine initialization issue, it usually resolves itself
        // after the component re-renders a few times
      }
      
      // Check for ScrollView errors
      if (error && error.message && error.message.includes("Cannot read property 'scrollTo' of null")) {
        console.log('ScrollTo error detected in global handler - suppressing');
        // This is a timing issue with ScrollView references, just suppress it
        return true; // Returning true prevents the error from propagating
      }
    };
    
    // Set up global error handler
    if (!global.ErrorUtils) {
      global.ErrorUtils = { setGlobalHandler: () => {} };
    }
    
    const originalHandler = global.ErrorUtils.getGlobalHandler ? 
      global.ErrorUtils.getGlobalHandler() : 
      null;
    
    global.ErrorUtils.setGlobalHandler((error, isFatal) => {
      // First try our handler
      const handled = handleError(error);
      
      // If not handled and there's an original handler, call it
      if (!handled && originalHandler && typeof originalHandler === 'function') {
        originalHandler(error, isFatal);
      }
    });
    
    return () => {
      if (originalHandler) {
        global.ErrorUtils.setGlobalHandler(originalHandler);
      } else {
        global.ErrorUtils.setGlobalHandler(() => {});
      }
    };
  }, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ThemeProvider>
        <I18nProvider>
          <NotificationProvider>
            <AppProvider>
              {/* Add AppContextUpdater to automatically update the app context summary */}
              <AppContextUpdater />
              <AuthProvider>
                <AchievementProvider>
                  {/* Add ProfileProvider here */}
                  <ProfileProvider>
                    <AppContent navigationRef={navigationRef} />
                  </ProfileProvider>
                </AchievementProvider>
              </AuthProvider>
            </AppProvider>
          </NotificationProvider>
        </I18nProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
};

export default App;
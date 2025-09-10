// App.js
// Updated with tab bar using relative positioning and full-screen support
// Optimized for iOS responsiveness and accessibility

// Import PlatformFix at the very top before other imports to ensure Platform is available globally
import './PlatformFix';

// Analytics setup will be added later - for now focus on console log cleanup and basic error handling
// TODO: Add analytics when switching to bare React Native or Expo SDK 54+

// Import gesture handler polyfill - must be at the top
import 'react-native-gesture-handler';

// Import URL polyfill for AWS (keep this - it's needed)
import 'react-native-url-polyfill/auto';

import React, { useEffect, useState, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions, useFocusEffect } from '@react-navigation/native';
import { CardStyleInterpolators } from '@react-navigation/stack';
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
import PagerView from 'react-native-pager-view';
import { TabView, TabBar } from 'react-native-tab-view';
import { 
  SafeAreaProvider, 
  initialWindowMetrics
} from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import * as Haptics from 'expo-haptics';
import { runStartupDataCheck } from './src/utils/StartupDataCheck';
import * as FeatureExplorerTracker from './src/services/FeatureExplorerTracker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReferralTracker from './src/services/ReferralTracker';
import ShakeService from './src/services/ShakeService';

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

// Import the new transition screen for stable onboarding completion
import OnboardingTransitionScreen from './src/components/OnboardingTransitionScreen';

// Initialize AWS Amplify at the application root - NATIVE BUILD COMPATIBLE
const initializeAmplify = () => {
  try {
    console.log('🚀 NATIVE BUILD: Initializing AWS Amplify at app root');
    
    // Comprehensive AWS Configuration for native builds
    const awsConfig = {
      Auth: {
        // Required: AWS Region
        region: 'ap-southeast-2',
        
        // Required: Cognito User Pool ID
        userPoolId: 'ap-southeast-2_DswoUlwql',
        
        // Required: Cognito App Client ID
        userPoolWebClientId: 'unr38aneiujkjoptt5p7pg6tp',
        
        // Add explicit configuration for native builds
        authenticationFlowType: 'USER_SRP_AUTH',
        
        // Disable OAuth for native builds to prevent issues
        oauth: {
          domain: '',
          scope: [],
          redirectSignIn: '',
          redirectSignOut: '',
          responseType: 'code',
          socialProviders: [],
        }
      },
      
      // Add AWS configuration root-level properties for native builds
      aws_project_region: 'ap-southeast-2',
      aws_cognito_region: 'ap-southeast-2',
      aws_user_pools_id: 'ap-southeast-2_DswoUlwql',
      aws_user_pools_web_client_id: 'unr38aneiujkjoptt5p7pg6tp',
    };
    
    // Configure Amplify with comprehensive config
    Amplify.configure(awsConfig);
    console.log('✅ NATIVE BUILD: AWS Amplify configuration successful');
    
    // Store configuration globally for reference
    global.AWS_AMPLIFY_CONFIGURED = true;
    global.AWS_CONFIG = awsConfig;
    
    return true;
  } catch (error) {
    console.error('❌ NATIVE BUILD: AWS Amplify initialization error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return false;
  }
};

// Don't initialize immediately - wait for app to be ready
let amplifyInitialized = false;
console.log('🔧 NATIVE BUILD: Amplify initialization deferred to app start');

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


// Import tour hook for navigation blocking
import { useAppTour } from './src/hooks/useAppTour';

// Import ProfileProvider
import { ProfileProvider } from './src/context/ProfileContext';

// Import Global Animation System
import { GlobalAnimationProvider } from './src/context/GlobalAnimationContext';
import GlobalAnimationRenderer from './src/components/GlobalAnimationRenderer';

// Prevent warnings from showing on screen during development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'useEffect must not return anything besides a function',
  'useInsertionEffect must not schedule updates',
  'RangeError: Maximum call stack size exceeded',
  "Property 'Platform' doesn't exist",
  "The 'navigation' object hasn't been initialized yet",
  "Cannot read property 'scrollTo' of null",  // Added to suppress the ScrollView error
  'A props object containing a "key" prop is being spread into JSX',  // React Navigation key spreading warning
  'Requiring unknown module "undefined"',  // Suppress undefined module warnings
  'ProfileScreen loading error: [Error: Operation aborted]',  // Expected during navigation transitions
  'Operation aborted'  // Expected during component unmount/navigation
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
    
    const KeyboardManagerModule = require('react-native-keyboard-manager');
    KeyboardManager = KeyboardManagerModule?.KeyboardManager;
    if (KeyboardManager) {
      // First completely disable keyboard manager
      if (typeof KeyboardManager.setEnable === 'function') {
        KeyboardManager.setEnable(false);
      }
      
      // Then re-enable with specific settings (after a brief delay)
      setTimeout(() => {
        if (typeof KeyboardManager.setEnable === 'function') {
          KeyboardManager.setEnable(false); // TEMPORARY: Disable entirely to test
          
          // Disable auto toolbar
          if (typeof KeyboardManager.setEnableAutoToolbar === 'function') {
            KeyboardManager.setEnableAutoToolbar(false);
          }
          
          // Disable predictive text
          if (typeof KeyboardManager.setPredictiveText === 'function') {
            KeyboardManager.setPredictiveText(false);
          }
          
          // DISABLE auto-resign to prevent keyboard dismissal issues  
          if (typeof KeyboardManager.setShouldResignOnTouchOutside === 'function') {
            KeyboardManager.setShouldResignOnTouchOutside(false);
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
import MilestoneDetailsScreen from './src/screens/MilestoneDetailsScreen';
import GoalDetailsScreen from './src/screens/GoalDetailsScreen';
import TaskDetailsScreen from './src/screens/TaskDetailsScreen';
import TodoListScreen from './src/screens/TodoListScreen';
import FullscreenCalendarScreen from './src/screens/TimeScreen/FullscreenCalendarScreen';
// UPDATED: Import both AuthNavigator and LoginScreen from LoginScreen module
import AuthNavigator, { LoginScreen } from './src/components/ai/LoginScreen';
import FeedbackScreen from './src/screens/FeedbackScreen';
import AdminFeedbackScreen from './src/screens/AdminFeedbackScreen';
import NotificationTestScreen from './src/screens/NotificationTestScreen';
import AIAssistantScreen from './src/screens/AIAssistantScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import AIContextScreen from './src/screens/PersonalKnowledgeScreen';
import OnboardingScreen from './src/screens/Onboarding';
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
// Removed duplicate: import AILoginScreen from './src/components/ai/LoginScreen';

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

// Custom Goals Screen with Built-in Tab Switching (No Material Top Tab Navigator)
// This eliminates the nested navigator issue completely

// Local override for goals limit to show 2 instead of 3
const LOCAL_MAX_GOALS = 2;

// Tab Badge Component - Optimized for smaller size and better spacing
const TabBadge = ({ count, maxCount, isPro }) => {
  if (count === 0) return null;
  
  return (
    <View style={{
      backgroundColor: 'rgba(255,255,255,0.25)',
      borderRadius: scaleWidth(8),
      paddingHorizontal: scaleWidth(6),
      paddingVertical: scaleHeight(2),
      marginLeft: scaleWidth(6),
      minWidth: scaleWidth(16),
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Text style={{
        color: '#FFFFFF',
        fontSize: scaleFontSize(10),
        fontWeight: '600',
        includeFontPadding: false,
        textAlignVertical: 'center'
      }}>
        {isPro ? count : `${count}/${maxCount}`}
      </Text>
    </View>
  );
};

// Goals Tab Navigator with Toggle (No Top Tabs)
const GoalsTabNavigator = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { width } = useScreenDimensions();
  const appContext = useAppContext();
  const goals = appContext?.goals || [];
  const isPro = appContext?.userSubscriptionStatus === 'pro' || appContext?.userSubscriptionStatus === 'unlimited' || false;
  
  // Get safe area insets to match TasksScreen positioning
  const safeSpacing = useSafeSpacing();
  
  // Calculate goal counts
  const activeGoals = goals.filter(goal => !goal.completed);
  const completedGoals = goals.filter(goal => goal.completed);
  
  // View mode state: 'overview' or 'completed'
  const [viewMode, setViewMode] = React.useState('overview');

  // Full-screen state for Overview tab
  const [isOverviewFullscreen, setIsOverviewFullscreen] = React.useState(false);
  
  // Edit mode state for drag and drop
  const [isEditMode, setIsEditMode] = React.useState(false);
  
  // Full-screen toggle handler
  const handleFullScreenToggle = React.useCallback(() => {
    setIsOverviewFullscreen(prev => !prev);
  }, []);
  
  // Edit mode toggle handler
  const handleEditModeToggle = React.useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  // Effect to set global fullscreen state
  React.useEffect(() => {
    if (isOverviewFullscreen) {
      // Only hide tabs/AI button when the Overview tab is in fullscreen and in overview mode
      const isOverviewActive = viewMode === 'overview';
      if (isOverviewActive) {
        // Hide AI button
        if (typeof window !== 'undefined' && window.setAIButtonVisible) {
          window.setAIButtonVisible(false);
        }
        
        // Set global state to hide bottom tabs
        if (typeof global !== 'undefined') {
          global.kanbanFullScreen = true;
        }
      }
    } else {
      // Restore normal state
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
      
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = false;
      }
    }
    
    // Cleanup function
    return () => {
      if (isOverviewFullscreen) {
        if (typeof window !== 'undefined' && window.setAIButtonVisible) {
          window.setAIButtonVisible(true);
        }
        if (typeof global !== 'undefined') {
          global.kanbanFullScreen = false;
        }
      }
    };
  }, [isOverviewFullscreen, viewMode]);
  
  // Handle navigation to specific view when parameters change
  React.useEffect(() => {
    if (route.params?.targetTabIndex !== undefined) {
      // targetTabIndex: 0 = overview, 1 = completed
      const newViewMode = route.params.targetTabIndex === 0 ? 'overview' : 'completed';
      setViewMode(newViewMode);
    }
  }, [route.params?.targetTabIndex]);

  // Debug viewMode changes
  React.useEffect(() => {
    console.log('GoalsScreen viewMode changed:', viewMode);
  }, [viewMode]);
  
  // No forced reset - let content match whatever view mode is selected
  
  // Expose toggle function to be called from bottom tab press
  React.useEffect(() => {
    // Store the toggle function globally so it can be accessed by the bottom tab
    global.toggleGoalsView = () => {
      // Add debouncing to prevent rapid toggles
      if (global.viewModeToggleInProgress) {
        return;
      }
      
      global.viewModeToggleInProgress = true;
      
      setViewMode(prev => {
        const newMode = prev === 'overview' ? 'completed' : 'overview';
        console.log('Toggling goals view mode from', prev, 'to', newMode);
        
        // Track achievement for navigating to completed goals view
        if (newMode === 'completed') {
          try {
            FeatureExplorerTracker.trackCompletedGoalsExplorer();
          } catch (error) {
            console.error('Error tracking completed goals explorer achievement:', error);
          }
        }
        
        return newMode;
      });
      
      // Clear the flag after state update is processed
      setTimeout(() => {
        global.viewModeToggleInProgress = false;
      }, 300);
    };
    
    // Store the current view mode globally for tab bar rendering
    global.goalsViewMode = viewMode;
    
    // Update tab bar options when view mode changes
    // The navigation object here is for the stack, we need the parent tab navigation
    // We'll store this globally so the tab press handler can update it
    global.updateGoalsTabOptions = () => {
      // This will be called from the tab press handler which has access to the tab navigation
    };
    
    // Cleanup
    return () => {
      if (global.toggleGoalsView) {
        delete global.toggleGoalsView;
      }
      if (global.goalsViewMode) {
        delete global.goalsViewMode;
      }
      if (global.viewModeToggleInProgress) {
        delete global.viewModeToggleInProgress;
      }
      if (global.tabUpdateInProgress) {
        delete global.tabUpdateInProgress;
      }
    };
  }, [viewMode, navigation]);

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.background,
      paddingTop: safeSpacing.top // Match TasksScreen safe area padding
    }}>
      
      {/* Conditional rendering based on viewMode */}
      {viewMode === 'overview' ? (
        <LifePlanOverviewScreen 
          navigation={navigation} 
          route={route}
          hideBackButton={true} 
          onFullScreenToggle={handleFullScreenToggle}
          isFullscreen={isOverviewFullscreen}
          isEditMode={isEditMode}
          onEditModeToggle={handleEditModeToggle}
        />
      ) : (
        <GoalsScreen navigation={navigation} tabMode="completed" />
      )}
    </View>
  );
};

// Stack navigators for each tab - Updated Goals Stack
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
        component={GoalsTabNavigator} 
        options={{ unmountOnBlur: false }} 
      />
      <Stack.Screen 
        name="GoalDetails" 
        component={GoalDetailsScreen}
        options={{
          gestureDirection: 'horizontal',
          transitionSpec: {
            open: {
              animation: 'timing',
              config: { duration: 300 }
            },
            close: {
              animation: 'timing', 
              config: { duration: 300 }
            }
          },
          cardStyleInterpolator: ({ current, next, layouts }) => {
            const progress = current.progress;
            
            // Goal/Project screens should enter from right and exit to right
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0]
                    })
                  }
                ]
              }
            };
          }
        }}
      />
      <Stack.Screen 
        name="ProjectDetails" 
        component={MilestoneDetailsScreen}
        options={{
          gestureDirection: 'horizontal',
          transitionSpec: {
            open: {
              animation: 'timing',
              config: { duration: 300 }
            },
            close: {
              animation: 'timing', 
              config: { duration: 300 }
            }
          },
          cardStyleInterpolator: ({ current, next, layouts }) => {
            const progress = current.progress;
            
            // Goal/Project screens should enter from right and exit to right
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0]
                    })
                  }
                ]
              }
            };
          }
        }}
      />
      <Stack.Screen 
        name="MilestoneDetails" 
        component={MilestoneDetailsScreen}
        options={{
          gestureDirection: 'horizontal',
          transitionSpec: {
            open: {
              animation: 'timing',
              config: { duration: 300 }
            },
            close: {
              animation: 'timing', 
              config: { duration: 300 }
            }
          },
          cardStyleInterpolator: ({ current, next, layouts }) => {
            const progress = current.progress;
            
            // Milestone screens should enter from right and exit to right
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              }
            };
          }
        }}
      />
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
      <Stack.Screen 
        name="ProjectDetails" 
        component={MilestoneDetailsScreen}
        options={{
          gestureDirection: 'horizontal',
          transitionSpec: {
            open: {
              animation: 'timing',
              config: { duration: 300 }
            },
            close: {
              animation: 'timing', 
              config: { duration: 300 }
            }
          },
          cardStyleInterpolator: ({ current, next, layouts }) => {
            const progress = current.progress;
            
            // Goal/Project screens should enter from right and exit to right
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0]
                    })
                  }
                ]
              }
            };
          }
        }}
      />
      <Stack.Screen 
        name="MilestoneDetails" 
        component={MilestoneDetailsScreen}
        options={{
          gestureDirection: 'horizontal',
          transitionSpec: {
            open: {
              animation: 'timing',
              config: { duration: 300 }
            },
            close: {
              animation: 'timing', 
              config: { duration: 300 }
            }
          },
          cardStyleInterpolator: ({ current, next, layouts }) => {
            const progress = current.progress;
            
            // Milestone screens should enter from right and exit to right
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0]
                    })
                  }
                ]
              }
            };
          }
        }}
      />
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
      <Stack.Screen 
        name="FullscreenCalendarScreen" 
        component={FullscreenCalendarScreen}
        options={{
          presentation: 'modal',
          gestureDirection: 'vertical',
          transitionSpec: {
            open: {
              animation: 'timing',
              config: { duration: 300 }
            },
            close: {
              animation: 'timing', 
              config: { duration: 300 }
            }
          },
          cardStyleInterpolator: ({ current, layouts }) => {
            const progress = current.progress;
            
            return {
              cardStyle: {
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.height, 0]
                    })
                  }
                ]
              }
            };
          }
        }}
      />
    </Stack.Navigator>
  );
};

// Wrapper component to pass tab route params to TodoListScreen
const TodoStackWrapper = ({ route, navigation }) => {
  return (
    <TodoListScreen 
      route={route} 
      navigation={navigation}
    />
  );
};

const TodoStack = ({ route, navigation }) => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="TodoList" 
        options={{ unmountOnBlur: false }}
      >
        {(props) => <TodoStackWrapper {...props} route={route} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

// Enhanced tab bar icon component with dual state hint
const ToggleableTabBarIcon = ({ primaryIcon, secondaryIcon, primaryLabel, secondaryLabel, focused, color }) => {
  return (
    <View style={{ width: scaleFontSize(26), height: scaleFontSize(22), alignItems: 'center', justifyContent: 'center' }}>
      {/* Primary icon */}
      <Ionicons 
        name={focused ? primaryIcon : `${primaryIcon}-outline`}
        size={scaleFontSize(22)} 
        color={color}
        style={{ position: 'absolute' }}
      />
      {/* Secondary icon hint - only show when focused to indicate toggle ability */}
      {focused && (
        <Ionicons 
          name={`${secondaryIcon}-outline`}
          size={scaleFontSize(16)} 
          color={color}
          style={{ 
            position: 'absolute', 
            top: -3, 
            right: -5,
            opacity: 0.7 
          }}
        />
      )}
      {/* Small toggle indicator */}
      {focused && (
        <View style={{
          position: 'absolute',
          bottom: -1,
          right: -1,
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
          opacity: 0.6
        }} />
      )}
    </View>
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

// React component for flashing tab bar icon for tour
const FlashingTabBarIcon = ({ iconName, label, focused, color }) => {
  const activeIconName = iconName;
  // Handle special case for document-text icon
  const inactiveIconName = iconName === 'document-text' ? 'document-outline' : `${iconName}-outline`;
  
  // Create animation value
  const flashAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Start flashing animation
    const flashAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ])
    );
    
    flashAnimation.start();
    
    return () => flashAnimation.stop();
  }, [flashAnim]);
  
  return (
    <Animated.View style={{ opacity: flashAnim }}>
      <Ionicons 
        name={focused ? activeIconName : inactiveIconName} 
        size={scaleFontSize(22)} 
        color={color}
        accessible={true}
        accessibilityLabel={`${label} tab ${focused ? 'selected' : ''} (flashing)`}
      />
    </Animated.View>
  );
};

// Main tab navigator with stacks and enhanced animations
function MainTabNavigator({ route }) {
  const s = getStyles();
  const { theme } = useTheme();
  const auth = useAuth();
  
  // Import and use tour hook to track tour state
  const { isTourActive } = useAppTour();
  
  // Track if coming from onboarding to determine initial tab
  const [fromOnboarding, setFromOnboarding] = useState(false);
  
  // Get screen dimensions and safe area insets
  const { width, height } = useScreenDimensions();
  const safeSpacing = useSafeSpacing();
  const isLandscape = useIsLandscape();
  
  // Track full-screen state for the entire app
  const [isAnyScreenFullScreen, setIsAnyScreenFullScreen] = useState(false);
  
  // Navigation ref for notification navigation and swipeable navigation
  const tabNavigationRef = useRef(null);
  const [navigationState, setNavigationState] = useState(null);
  
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
        console.log('App.js: Received full-screen event:', isFullScreen);
        setIsAnyScreenFullScreen(isFullScreen);
      }
    };
    
    // Check global state periodically as a fallback for React Native
    const checkGlobalState = () => {
      if (typeof global !== 'undefined' && typeof global.kanbanFullScreen === 'boolean') {
        const globalFullScreen = global.kanbanFullScreen;
        setIsAnyScreenFullScreen(globalFullScreen);
        // Removed annoying log
      }
    };
    
    // Add event listener if in web environment
    if (typeof document !== 'undefined') {
      document.addEventListener('app-fullscreen-changed', handleFullScreenChange);
    }
    
    // Set up periodic check for React Native
    const interval = setInterval(checkGlobalState, 100);
    
    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('app-fullscreen-changed', handleFullScreenChange);
      }
      clearInterval(interval);
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
          ref={tabNavigationRef}
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
          // Track state changes for animations and swipeable navigation
          onStateChange={(state) => {
            setNavigationState(state);
            handleTabChange(navigationState, state);
          }}
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
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                // Prevent navigation if tour is active (with safety check)
                if (isTourActive === true) {
                  e.preventDefault();
                  console.log('🚫 Tab navigation blocked during tour');
                  return;
                }
              },
            })}
          />
          <Tab.Screen 
            name="GoalsTab" 
            component={GoalsStack} 
            options={({ navigation }) => ({
              tabBarLabel: 'Life Plan', // Start with default, will be updated dynamically
              tabBarIcon: ({ focused, color }) => {
                const currentMode = global.goalsViewMode || 'overview';
                if (currentMode === 'overview') {
                  return (
                    <ToggleableTabBarIcon 
                      primaryIcon="compass"
                      secondaryIcon="checkmark-done-circle"
                      primaryLabel="Life Plan"
                      secondaryLabel="Done"
                      focused={focused}
                      color={color}
                    />
                  );
                } else {
                  return (
                    <ToggleableTabBarIcon 
                      primaryIcon="checkmark-done-circle"
                      secondaryIcon="compass"
                      primaryLabel="Done"
                      secondaryLabel="Life Plan"
                      focused={focused}
                      color={color}
                    />
                  );
                }
              },
              tabBarAccessibilityLabel: "Life Plan tab",
              unmountOnBlur: false
            })}
            listeners={({ navigation, route }) => ({
              tabPress: (e) => {
                try {
                  // Prevent navigation if tour is active
                  if (isTourActive) {
                    e.preventDefault();
                    console.log('🚫 Tab navigation blocked during tour');
                    return;
                  }
                  
                  // If we're already on the Goals tab, toggle the view
                  if (navigation.isFocused()) {
                    e.preventDefault();
                    if (global.toggleGoalsView && !global.viewModeToggleInProgress) {
                      global.toggleGoalsView();
                      // Use InteractionManager to prevent stack overflow during rapid navigation
                      InteractionManager.runAfterInteractions(() => {
                        // Add a debounce check to prevent rapid updates
                        if (!global.tabUpdateInProgress && navigation && navigation.setOptions) {
                          global.tabUpdateInProgress = true;
                          try {
                            navigation.setOptions({
                              tabBarLabel: global.goalsViewMode === 'overview' ? 'Life Plan' : 'Done',
                              tabBarIcon: ({ focused, color }) => {
                                const currentMode = global.goalsViewMode || 'overview';
                                if (currentMode === 'overview') {
                                  return (
                                    <ToggleableTabBarIcon 
                                      primaryIcon="compass"
                                      secondaryIcon="checkmark-done-circle"
                                      primaryLabel="Life Plan"
                                      secondaryLabel="Done"
                                      focused={focused}
                                      color={color}
                                    />
                                  );
                                } else {
                                  return (
                                    <ToggleableTabBarIcon 
                                      primaryIcon="checkmark-done-circle"
                                      secondaryIcon="compass"
                                      primaryLabel="Done"
                                      secondaryLabel="Life Plan"
                                      focused={focused}
                                      color={color}
                                    />
                                  );
                                }
                              },
                              tabBarAccessibilityLabel: global.goalsViewMode === 'overview' ? "Life Plan tab" : "Completed goals tab"
                            });
                          } catch (error) {
                            console.warn('Error updating tab options:', error);
                          } finally {
                            // Clear the flag after a brief delay
                            setTimeout(() => {
                              global.tabUpdateInProgress = false;
                            }, 200);
                          }
                        }
                      });
                    }
                  } else {
                    // If we're coming from another tab, navigate normally
                    if (navigation && navigation.navigate) {
                      navigation.navigate('GoalsTab');
                    }
                  }
                } catch (error) {
                  console.warn('Error in Goals tab press handler:', error);
                }
              },
            })} 
          />
          <Tab.Screen 
            name="ProjectsTab"
            component={ProjectsStack}
            options={{
              tabBarLabel: 'Kanban',
              tabBarIcon: ({ focused, color }) => 
                createTabBarIcon('reader', 'Kanban', focused, color),
              tabBarAccessibilityLabel: "Kanban tab"
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                // Prevent navigation if tour is active (with safety check)
                if (isTourActive === true) {
                  e.preventDefault();
                  console.log('🚫 Tab navigation blocked during tour');
                  return;
                }
              },
            })}
          />
          <Tab.Screen 
            name="TimeTab" 
            component={TimeStack} 
            options={{ 
              tabBarLabel: 'Time',
              tabBarIcon: ({ focused, color }) => 
                createTabBarIcon('calendar', 'Time', focused, color),
              tabBarAccessibilityLabel: "Time tab"
            }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                // Prevent navigation if tour is active (with safety check)
                if (isTourActive === true) {
                  e.preventDefault();
                  console.log('🚫 Tab navigation blocked during tour');
                  return;
                }
              },
            })}
          />
          <Tab.Screen 
            name="TodoTab" 
            component={TodoStack} 
            options={({ route }) => {
              let currentView = route.params?.currentView || 'todo';
              
              // Normal tab behavior - no tour interference
              
              const label = currentView === 'notes' ? 'Notes' : 'To-Do';
              const iconName = currentView === 'todo' ? 'checkbox' : 'document-text';
              
              console.log('📍 App.js TabBar Options - currentView:', currentView, 'iconName:', iconName, 'tourFlashing:', global.tourShouldFlashToDoTab);
              
              return {
                tabBarLabel: label,
                tabBarIcon: ({ focused, color }) => {
                  // Check global tour flag for flashing
                  if (global.tourShouldFlashToDoTab) {
                    return <FlashingTabBarIcon iconName={iconName} label={label} focused={focused} color={color} />;
                  } else {
                    // Use the new toggleable icon component
                    if (currentView === 'todo') {
                      return (
                        <ToggleableTabBarIcon 
                          primaryIcon="checkbox"
                          secondaryIcon="document-text"
                          primaryLabel="To-Do"
                          secondaryLabel="Notes"
                          focused={focused}
                          color={color}
                        />
                      );
                    } else {
                      return (
                        <ToggleableTabBarIcon 
                          primaryIcon="document-text"
                          secondaryIcon="checkbox"
                          primaryLabel="Notes"
                          secondaryLabel="To-Do"
                          focused={focused}
                          color={color}
                        />
                      );
                    }
                  }
                },
                tabBarAccessibilityLabel: `${label} tab`
              };
            }}
            listeners={({ navigation, route }) => ({
              tabPress: (e) => {
                try {
                  // Check if tour is expecting To-Do tab tap (special case - allow this during tour)
                  if (global.onToDoTabTapped && typeof global.onToDoTabTapped === 'function') {
                    console.log('🎯 TodoTab tapped during tour, calling tour callback');
                    global.onToDoTabTapped();
                    return; // Allow this navigation for tour
                  }

                  // Check if tour is expecting notes toggle tap (special case - allow this during tour)
                  if (global.onNotesToggleTapped && typeof global.onNotesToggleTapped === 'function') {
                    console.log('🎯 TodoTab tapped during NOTES tour step, toggling to notes view');
                    // Change the route params to trigger notes view, which will call the callback
                    const currentParams = route?.params || {};
                    const newView = currentParams.currentView === 'todo' ? 'notes' : 'todo';
                    navigation.setParams({ currentView: newView });
                    return; // Allow this navigation for tour
                  }
                  
                  // Prevent other navigation if tour is active (but not when tour expects this tap)
                  if (isTourActive) {
                    e.preventDefault();
                    console.log('🚫 Tab navigation blocked during tour');
                    return;
                  }
                  
                  // Allow normal navigation to proceed
                  console.log('🎯 TodoTab tapped, navigating normally');
                } catch (error) {
                  console.warn('Error in TodoTab press handler:', error);
                }
              },
            })}
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
  const [transitionState, setTransitionState] = useState('stable'); // 'stable', 'transitioning'
  
  // Get safe area insets for proper spacing
  const safeSpacing = useSafeSpacing();
  
  // Check if onboarding is completed
  const { settings = {} } = appContext || {};
  const onboardingCompleted = settings?.onboardingCompleted || false;
  
  // Track onboarding completion state changes for smooth transitions
  const prevOnboardingCompleted = useRef(null); // Initialize to null to track first load
  const [hasCheckedInitialTourState, setHasCheckedInitialTourState] = useState(false);
  
  useEffect(() => {
    // On first load, just set the previous state without triggering tour
    if (prevOnboardingCompleted.current === null) {
      prevOnboardingCompleted.current = onboardingCompleted;
      return;
    }
    
    // Detect when onboarding completion state changes from false to true
    if (prevOnboardingCompleted.current === false && onboardingCompleted === true) {
      console.log('🎯 Onboarding completion detected, starting transition');
      setTransitionState('transitioning');
      
      // Set the hasCompletedOnboarding flag for the tour system
      AsyncStorage.setItem('hasCompletedOnboarding', 'true').then(() => {
        console.log('🎯 Set hasCompletedOnboarding flag for app tour');
      }).catch(console.error);
      
      // Give the system time to process all state changes
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => {
          console.log('🎯 Transition complete, showing main app');
          setTransitionState('stable');
          
          // Check if user has already seen the app tour before starting it
          setTimeout(async () => {
            try {
              const hasSeenAppTour = await AsyncStorage.getItem('hasSeenAppTour');
              if (hasSeenAppTour !== 'true') {
                console.log('🎯 Starting app tour after onboarding completion - first time user');
                
                // Wait for pending achievement to be processed by ProfileScreen before starting tour
                const waitForAchievementProcessing = async (attempt = 1, maxAttempts = 20) => {
                  try {
                    const pendingAchievement = await AsyncStorage.getItem('pendingOnboardingAchievement');
                    console.log(`🏆 TRACE: App.js attempt ${attempt} - pendingOnboardingAchievement flag:`, pendingAchievement);
                    
                    if (pendingAchievement === 'true') {
                      // Achievement hasn't been processed yet, wait longer
                      if (attempt < maxAttempts) {
                        console.log(`🏆 TRACE: Attempt ${attempt}/${maxAttempts}: Still waiting for ProfileScreen to process Foundation Builder achievement...`);
                        setTimeout(() => waitForAchievementProcessing(attempt + 1, maxAttempts), 500);
                        return;
                      } else {
                        console.log('🏆 TRACE: Max attempts reached waiting for achievement processing, starting tour anyway');
                      }
                    } else {
                      console.log('🏆 TRACE: Achievement processing complete (or no pending achievement), proceeding with tour start');
                    }
                    
                    // Additional check - see what achievements are actually unlocked right now
                    try {
                      const achievementsData = await AsyncStorage.getItem('unlockedAchievements');
                      const achievements = achievementsData ? JSON.parse(achievementsData) : {};
                      console.log('🏆 TRACE: App.js - Foundation Builder status in AsyncStorage:', !!achievements['foundation-builder']);
                      console.log('🏆 TRACE: App.js - All unlocked achievements:', Object.keys(achievements));
                    } catch (achievementCheckError) {
                      console.error('🏆 TRACE: Error checking achievement status:', achievementCheckError);
                    }
                    
                    // Now start the tour
                    const attemptTourStart = (tourAttempt = 1, tourMaxAttempts = 10) => {
                      if (global.startTourDirectly && typeof global.startTourDirectly === 'function') {
                        console.log(`🎯 TRACE: App.js - Tour function available on attempt ${tourAttempt}, starting tour`);
                        global.startTourDirectly();
                      } else if (tourAttempt < tourMaxAttempts) {
                        console.log(`🎯 TRACE: App.js - Attempt ${tourAttempt}: startTourDirectly not available yet, retrying in 500ms`);
                        setTimeout(() => attemptTourStart(tourAttempt + 1, tourMaxAttempts), 500);
                      } else {
                        console.error('🎯 TRACE: App.js - Failed to start tour after 10 attempts - startTourDirectly never became available');
                      }
                    };
                    
                    attemptTourStart();
                    
                  } catch (error) {
                    console.error('🏆 Error checking pending achievement:', error);
                    // Fallback to original tour start logic
                    if (global.startTourDirectly && typeof global.startTourDirectly === 'function') {
                      global.startTourDirectly();
                    }
                  }
                };
                
                waitForAchievementProcessing();
              } else {
                console.log('🎯 User has already seen app tour, skipping');
              }
            } catch (error) {
              console.error('🎯 Error checking tour status:', error);
              // If there's an error, don't start the tour to be safe
            }
          }, 1500); // Extra delay to ensure smooth transition
        }, 1000); // Short transition period
      });
    }
    
    prevOnboardingCompleted.current = onboardingCompleted;
  }, [onboardingCompleted]);
  
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
        // Initialize Amplify first, safely
        if (!amplifyInitialized) {
          amplifyInitialized = initializeAmplify();
          console.log('🔧 Amplify initialized in app startup:', amplifyInitialized);
        }
        
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
            animationTypeForReplace: 'push',
            // Global configuration to ensure previous screens animate
            cardStyleInterpolator: ({ current, next, layouts }) => {
              const progress = current.progress;
              
              // If this screen is being pushed by another screen (underlying screen animation)
              if (next) {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: next.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -layouts.screen.width * 0.3]
                        })
                      }
                    ]
                  }
                };
              }
              
              // Default animation for incoming screens
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0]
                      })
                    }
                  ]
                }
              };
            }
          }}
        >
          {/* Modified navigation structure based on onboarding status */}
          {!onboardingCompleted ? (
            <Stack.Screen
              name="Onboarding"
              component={
                USE_ENHANCED_ONBOARDING 
                  ? EnhancedOnboardingScreen 
                  : OnboardingScreen
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
          <Stack.Screen 
            name="LifePlanOverview" 
            component={LifePlanOverviewScreen}
            options={{
              gestureDirection: 'horizontal',
              transitionSpec: {
                open: {
                  animation: 'timing',
                  config: { duration: 300 }
                },
                close: {
                  animation: 'timing', 
                  config: { duration: 300 }
                }
              },
              cardStyleInterpolator: ({ current, next, layouts, index }) => {
                const progress = current.progress;
                
                // LifePlan screen should enter from right and exit to right
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0]
                        })
                      }
                    ]
                  },
                  // Animate the screen behind when there is one
                  overlayStyle: {
                    opacity: next 
                      ? next.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.2]
                        })
                      : 0
                  }
                };
              }
            }}
          />
          <Stack.Screen name="Diagnostics" component={DiagnosticsScreen} />
          <Stack.Screen name="AchievementsScreen" component={AchievementsScreen} />
          <Stack.Screen name="AILoginScreen" component={AuthNavigator} />
          <Stack.Screen name="WatchAdsScreen" component={WatchAdsScreen} />
          <Stack.Screen name="CommunityScreen" component={CommunityScreen} />
          <Stack.Screen name="StreakDetailScreen" component={StreakDetailScreen} />
          <Stack.Screen name="TaskDetails" component={TaskDetailsScreen} />
          {/* Login screen is still available but not forced initially */}
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationErrorBoundary>
      
      {/* Add GlobalAchievementToast to show achievement notifications */}
      <GlobalAchievementToast />
    </NavigationContainer>
  );
  
  // Show transition screen during onboarding completion
  if (transitionState === 'transitioning') {
    return (
      <OnboardingTransitionScreen 
        state="preparing_app"
        progress={90}
      />
    );
  }
  
  // Always show navigation content directly - the transition screen handles the loading state
  return navigationContent;
}

// Main App component with proper context providers
const App = () => {
  // Set up global log filtering
  setupGlobalLogFilter();
  const navigationRef = useRef();
  
  // Initialize haptic feedback and referral tracking on app start
  useEffect(() => {
    // Initialize haptic feedback
    if (Platform.OS === 'ios') {
      try {
        const hapticUtils = require('./src/screens/Onboarding/utils/hapticUtils');
        const initializeHaptic = hapticUtils?.initializeHaptic;
        if (initializeHaptic && typeof initializeHaptic === 'function') {
          initializeHaptic();
        }
      } catch (e) {
        console.log('Haptic feedback initialization error:', e);
      }
    }

    // Initialize referral tracking
    const initializeReferralTracking = async () => {
      try {
        await ReferralTracker.initialize();
        console.log('Referral tracking initialized');
      } catch (error) {
        console.error('Error initializing referral tracking:', error);
      }
    };

    initializeReferralTracking();

    // Initialize shake-to-feedback service
    ShakeService.initialize(navigationRef);
    
    // Cleanup shake service on unmount
    return () => {
      ShakeService.cleanup();
    };
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
                    <GlobalAnimationProvider>
                      <AppContent navigationRef={navigationRef} />
                      {/* Global Animation Renderer - renders above all screens */}
                      <GlobalAnimationRenderer />
                    </GlobalAnimationProvider>
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
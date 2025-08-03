// src/screens/ProfileScreen/ThemeColorPickerModal.js
import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useAppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext'; // Added import for notifications
import FeatureExplorerTracker from '../../services/FeatureExplorerTracker'; // Import the tracker
import { log } from '../../utils/LoggerUtility'; // Import logger utility
import { FeatureLimitBanner } from '../../components/subscription/SubscriptionUI'; // Import the Pro modal
import { useAchievements } from '../../context/AchievementContext'; // Import achievements context
import LevelService from '../../services/LevelService'; // Import level service
import {
  useSafeSpacing,
  meetsContrastRequirements,
  useScreenDimensions
} from '../../utils/responsive';

// Original dimensions - we'll keep these for the standard look
const { width, height } = Dimensions.get('window');

// Evidence-based color palette tailored for entrepreneurial men aged 25-34
// These colors are optimized for productivity, focus, and professional appeal
const THEME_COLORS = [
  '#1e3a8a', // Deep Navy Blue
  '#3b82f6', // Slate Blue
  '#1f2937', // Charcoal
  '#059669', // Forest Green
  '#f59e0b', // Amber
  '#dc2626', // Crimson
  '#6b7280', // Cool Gray
  '#86efac', // Sage
  '#6366f1', // Indigo
  '#0c4a6e', // Dark Teal
];

// Level-based color unlocking system
// Level 1 (default): Deep Navy Blue (always available)
// Level 3: Unlocks Charcoal 
// Level 5: Unlocks Forest Green
// Pro: Unlocks all remaining colors
const LEVEL_COLOR_UNLOCKS = {
  1: ['#1e3a8a'], // Deep Navy Blue - always free
  3: ['#1e3a8a', '#1f2937'], // + Charcoal
  5: ['#1e3a8a', '#1f2937', '#059669'], // + Forest Green
};

// Simple color names for reference
const COLOR_NAMES = [
  'Navy Blue',
  'Slate Blue',
  'Charcoal',
  'Forest Green',
  'Amber',
  'Crimson',
  'Cool Gray',
  'Sage',
  'Indigo',
  'Dark Teal'
];

const ThemeColorPickerModal = ({ 
  visible, 
  theme, 
  isDarkMode, 
  themeColor, 
  onSelectColor, 
  onClose, 
  navigation
}) => {
  // Get notification context for success messages
  const { showSuccess } = useNotification() || { 
    showSuccess: (msg) => console.log(msg) 
  };

  // Get app context to check if user is a lifetime member
  const appContext = useAppContext();
  const isPro = appContext?.userSubscriptionStatus === 'pro' || 
                appContext?.userSubscriptionStatus === 'unlimited';
  
  // Get achievements context to check user level
  const { getTotalPoints, refreshTrigger, unlockedAchievements } = useAchievements();
  
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
          console.log(`Theme picker using test level: ${testLevel}`);
          setCalculatedLevel(testLevel);
        } else {
          // Use real level from achievements
          const realLevel = LevelService.calculateLevel(getTotalPoints());
          console.log(`Theme picker using real level: ${realLevel}`);
          setCalculatedLevel(realLevel);
        }
      } catch (error) {
        console.error('Error loading user level in theme picker:', error);
        // Fallback to real level
        setCalculatedLevel(LevelService.calculateLevel(getTotalPoints()));
      }
    };
    
    loadUserLevel();
  }, [getTotalPoints]);
  
  const userLevel = calculatedLevel;
  
  // Get safe area spacing
  const safeSpacing = useSafeSpacing();
  const { height: screenHeight } = useScreenDimensions();
  
  // Ensure text colors meet contrast requirements
  const textColor = meetsContrastRequirements(theme.text, theme.background) 
    ? theme.text 
    : isDarkMode ? '#FFFFFF' : '#000000';
  
  const secondaryTextColor = meetsContrastRequirements(theme.textSecondary, theme.background) 
    ? theme.textSecondary 
    : isDarkMode ? '#E0E0E0' : '#4A4A4A';

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const translateY = useRef(new Animated.Value(0)).current; // For swipe gesture
  
  // Track if we're dismissing via gesture
  const [isDismissing, setIsDismissing] = useState(false);
  
  // Create shake animations for each color
  const shakeAnims = useRef(
    THEME_COLORS.map((color, index) => {
      log('UI', 'THEME INIT: Creating shake animation for color', index, color);
      return new Animated.Value(0);
    })
  ).current;
  
  // Log initialization info and refresh when modal opens
  React.useEffect(() => {
    if (visible) {
      log('UI', 'THEME INIT: ThemeColorPickerModal opened/refreshed');
      log('UI', 'THEME INIT: isPro:', isPro);
      log('UI', 'THEME INIT: userSubscriptionStatus:', appContext?.userSubscriptionStatus);
      log('UI', 'THEME INIT: User Level:', userLevel);
      log('UI', 'THEME INIT: Available colors:', availableColors);
      log('UI', 'THEME INIT: Total theme colors:', THEME_COLORS.length);
      log('UI', 'THEME INIT: Shake animations created:', shakeAnims.length);
      log('UI', 'THEME INIT: Refresh trigger:', refreshTrigger);
    }
  }, [visible, isPro, appContext?.userSubscriptionStatus, availableColors, userLevel, refreshTrigger]);
  
  // Force component update when achievements change
  React.useEffect(() => {
    log('UI', 'THEME ACHIEVEMENTS: Achievement data changed, refreshing colors');
  }, [unlockedAchievements, refreshTrigger]);
  
  // Check color unlock states when level changes
  useEffect(() => {
    const checkColorUnlockStates = async () => {
      // Check Charcoal unlock (level 3)
      if (userLevel >= 3) {
        const hasSeenCharcoalCongrats = await AsyncStorage.getItem('charcoalColorCongratsShown');
        if (!hasSeenCharcoalCongrats) {
          setCharcoalUnlockState('unlocked'); // Just unlocked, show "Unlock" state
        } else {
          setCharcoalUnlockState('seen'); // Already seen congratulations
        }
      } else {
        setCharcoalUnlockState('locked'); // Still locked
      }
      
      // Check Forest Green unlock (level 5)
      if (userLevel >= 5) {
        const hasSeenForestGreenCongrats = await AsyncStorage.getItem('forestGreenColorCongratsShown');
        if (!hasSeenForestGreenCongrats) {
          setForestGreenUnlockState('unlocked'); // Just unlocked, show "Unlock" state
        } else {
          setForestGreenUnlockState('seen'); // Already seen congratulations
        }
      } else {
        setForestGreenUnlockState('locked'); // Still locked
      }
    };
    
    checkColorUnlockStates();
  }, [userLevel]);
  
  // Track actual modal visibility state for closing animations
  const [modalVisible, setModalVisible] = useState(visible);
  
  // Track whether animation system has been pre-warmed
  const hasPreWarmed = useRef(false);
  
  // Swipe gesture handlers
  const handleGesture = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const { translationY } = event.nativeEvent;
        // Only allow downward movement (dismissal)
        if (translationY > 0) {
          // Background opacity fades to 0 as modal approaches bottom
          const progress = Math.min(translationY / (screenHeight * 0.4), 1);
          const opacity = 1 - progress; // Fade completely from 1 to 0
          fadeAnim.setValue(opacity);
        }
      }
    }
  );

  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    // Dismissal logic: lower threshold + velocity consideration
    const dismissThreshold = screenHeight * 0.2; // 20% of screen height
    const fastSwipeVelocity = 1200; // High velocity threshold
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Set dismissing flag to prevent modal from reopening during animation
      setIsDismissing(true);
      
      // Animate dismissal
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: screenHeight,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start(({ finished }) => {
        if (finished) {
          setModalVisible(false);
          setIsDismissing(false);
          onClose();
        }
      });
    } else {
      // Snap back
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 150,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        })
      ]).start();
    }
  };
  
  // Function to get available colors based on user level and Pro status
  const getAvailableColors = useMemo(() => {
    log('UI', 'THEME AVAILABILITY: Recalculating available colors');
    log('UI', 'THEME AVAILABILITY: isPro:', isPro, 'userLevel:', userLevel);
    
    // Pro users get all colors
    if (isPro) {
      log('UI', 'THEME AVAILABILITY: Pro user - all colors available');
      return THEME_COLORS;
    }
    
    // For free users, determine colors based on level
    let availableColors = LEVEL_COLOR_UNLOCKS[1]; // Default level 1 colors
    
    // Check each level threshold and unlock colors
    Object.keys(LEVEL_COLOR_UNLOCKS).forEach(level => {
      const requiredLevel = parseInt(level);
      if (userLevel >= requiredLevel) {
        availableColors = LEVEL_COLOR_UNLOCKS[level];
        log('UI', 'THEME AVAILABILITY: Unlocked level', requiredLevel, 'colors:', availableColors);
      }
    });
    
    log('UI', 'THEME AVAILABILITY: Final available colors:', availableColors);
    return availableColors;
  }, [isPro, userLevel, refreshTrigger, unlockedAchievements]);
  
  // Determine which colors to show based on level/membership status
  const availableColors = getAvailableColors;
  
  // Add counter for locked color clicks
  const [lockedColorClicks, setLockedColorClicks] = useState(0);
  
  // Add state for showing the Pro upgrade modal
  const [showProModal, setShowProModal] = useState(false);
  
  // Color unlock congratulations states
  const [showCharcoalCongrats, setShowCharcoalCongrats] = useState(false);
  const [showForestGreenCongrats, setShowForestGreenCongrats] = useState(false);
  const [charcoalUnlockState, setCharcoalUnlockState] = useState('locked'); // 'locked', 'unlocked', 'seen'
  const [forestGreenUnlockState, setForestGreenUnlockState] = useState('locked'); // 'locked', 'unlocked', 'seen'
  
  // Falling animation states
  const [fallingCharcoalAnimations, setFallingCharcoalAnimations] = useState([]);
  const [fallingForestAnimations, setFallingForestAnimations] = useState([]);
  
  // Pre-warm animation system to prevent first-render glitch
  useEffect(() => {
    if (!hasPreWarmed.current) {
      // Pre-warm animation system
      const preWarm = () => {
        // Immediately set to final values without animation
        fadeAnim.setValue(0);
        slideAnim.setValue(screenHeight);
        
        // Use requestAnimationFrame to ensure native driver is initialized
        requestAnimationFrame(() => {
          fadeAnim.setValue(0);
          slideAnim.setValue(screenHeight);
        });
        
        // Mark as pre-warmed
        hasPreWarmed.current = true;
      };
      
      preWarm();
    }
  }, [fadeAnim, slideAnim, screenHeight]);
  
  // Handle opening and closing animations
  useEffect(() => {
    if (visible && !isDismissing) {
      // Set modal visible immediately when opening
      setModalVisible(true);
      
      // Reset animations to starting values
      fadeAnim.setValue(0);
      slideAnim.setValue(screenHeight);
      translateY.setValue(0); // Reset swipe position
      
      // Run animations when modal opens
      Animated.parallel([
        // Fade in the background overlay quickly
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200, // Fast fade in
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        // Slide up the content
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();
    } else if (modalVisible && !visible && !isDismissing) {
      // Run animations when modal closes (not via gesture)
      Animated.parallel([
        // Fade out the background
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        // Slide down the content PAST the bottom of the screen
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 280, // Slightly longer for smoother exit
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        // Reset translateY
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start(({ finished }) => {
        // Only hide the modal if the animation actually finished
        if (finished) {
          setModalVisible(false);
        }
      });
    }
  }, [visible, modalVisible, isDismissing, fadeAnim, slideAnim, translateY, screenHeight]);

  // Create falling palette/color animations
  const createFallingColorAnimations = (colorType) => {
    const numberOfIcons = 6;
    const animations = [];
    const iconName = colorType === 'charcoal' ? 'color-palette' : 'leaf'; // Charcoal gets palette, Forest Green gets leaf
    
    for (let i = 0; i < numberOfIcons; i++) {
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
        iconName,
      });
    }
    
    if (colorType === 'charcoal') {
      setFallingCharcoalAnimations(animations);
    } else {
      setFallingForestAnimations(animations);
    }
    
    // Start animations
    animations.forEach((icon) => {
      // Falling animation
      Animated.timing(icon.animatedValue, {
        toValue: height + 50, // Fall past bottom of screen
        duration: icon.duration,
        delay: icon.delay,
        useNativeDriver: true,
      }).start();
      
      // Rotation animation
      Animated.loop(
        Animated.timing(icon.rotation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ).start();
    });
  };

  // Function to shake a color
  const shakeColor = (index) => {
    log('UI', 'THEME SHAKE: shakeColor called with index:', index);
    log('UI', 'THEME SHAKE: shakeAnims array length:', shakeAnims.length);
    log('UI', 'THEME SHAKE: shakeAnims[index] exists:', !!shakeAnims[index]);
    
    if (!shakeAnims[index]) {
      log('Error', 'THEME SHAKE: Shake animation not found for index:', index);
      return;
    }
    
    // Reset the animation value
    shakeAnims[index].setValue(0);
    log('UI', 'THEME SHAKE: Starting shake animation for index:', index);
    
    // Create a shake sequence
    Animated.sequence([
      Animated.timing(shakeAnims[index], {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: 5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: -5,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnims[index], {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      })
    ]).start((finished) => {
      log('UI', 'THEME SHAKE: Shake animation finished for index:', index, 'finished:', finished);
    });
  };

  // Handle close request with animation
  const handleClose = () => {
    // Only trigger onClose if we're not already closing
    if (modalVisible && visible) {
      // Reset locked color clicks counter and close Pro modal when closing
      setLockedColorClicks(0);
      setShowProModal(false);
      onClose();
    }
  };
  
  // Enhanced color selection handler with achievement tracking and congratulations
  const handleColorSelect = async (color) => {
    // Check if this is a newly unlocked color
    const isCharcoal = color === '#1f2937';
    const isForestGreen = color === '#059669';
    
    // Check for congratulations before selecting
    if (isCharcoal && charcoalUnlockState === 'unlocked') {
      const hasSeenCongrats = await AsyncStorage.getItem('charcoalColorCongratsShown');
      if (!hasSeenCongrats) {
        // Show congratulations popup
        setShowCharcoalCongrats(true);
        createFallingColorAnimations('charcoal');
        await AsyncStorage.setItem('charcoalColorCongratsShown', 'true');
        setCharcoalUnlockState('seen');
        // Don't close the modal yet, let the congratulations show
        onSelectColor(color);
        return;
      }
    }
    
    if (isForestGreen && forestGreenUnlockState === 'unlocked') {
      const hasSeenCongrats = await AsyncStorage.getItem('forestGreenColorCongratsShown');
      if (!hasSeenCongrats) {
        // Show congratulations popup
        setShowForestGreenCongrats(true);
        createFallingColorAnimations('forest');
        await AsyncStorage.setItem('forestGreenColorCongratsShown', 'true');
        setForestGreenUnlockState('seen');
        // Don't close the modal yet, let the congratulations show
        onSelectColor(color);
        return;
      }
    }
    
    // Call the original onSelectColor prop function
    onSelectColor(color);
    
    // Track the theme color change for the achievement
    try {
      await FeatureExplorerTracker.trackThemeColorChange(color, showSuccess);
    } catch (error) {
      console.error('Error tracking theme color change:', error);
    }
  };
  
  // Function to get unlock requirement message for a color
  const getColorUnlockMessage = (color) => {
    // Find what level unlocks this color
    for (const [level, colors] of Object.entries(LEVEL_COLOR_UNLOCKS)) {
      if (colors.includes(color) && parseInt(level) > userLevel) {
        return `Unlocks at Level ${level}`;
      }
    }
    // If not in level unlocks, it requires Pro
    return 'Requires Pro';
  };

  // Function to get the unlock requirement for a color (level number or 'pro')
  const getColorUnlockRequirement = (color) => {
    // Find what level unlocks this color
    for (const [level, colors] of Object.entries(LEVEL_COLOR_UNLOCKS)) {
      if (colors.includes(color) && parseInt(level) > userLevel) {
        return parseInt(level);
      }
    }
    // If not in level unlocks, it requires Pro
    return 'pro';
  };

  // Handle locked color click
  const handleLockedColorClick = (index) => {
    const color = THEME_COLORS[index];
    const unlockMessage = getColorUnlockMessage(color);
    
    log('UI', 'THEME LOCKED: Locked color clicked at index:', index);
    log('UI', 'THEME LOCKED: Color:', color);
    log('UI', 'THEME LOCKED: Unlock message:', unlockMessage);
    log('UI', 'THEME LOCKED: User Level:', userLevel);
    
    // Shake the color
    log('UI', 'THEME LOCKED: Triggering shake for index:', index);
    shakeColor(index);
    
    // Increment the counter
    const newCount = lockedColorClicks + 1;
    setLockedColorClicks(newCount);
    log('UI', 'THEME LOCKED: Locked color clicks:', newCount);
    
    // Show upgrade modal after 3 clicks
    if (newCount >= 3) {
      log('UI', 'THEME LOCKED: Showing upgrade modal after 3 clicks');
      setShowProModal(true);
      
      // Reset the counter after showing the modal
      setLockedColorClicks(0);
    }
  };
  
  // Handle navigation to feedback screen for color request
  const handleRequestNewColor = () => {
    if (isPro) {
      handleClose();
      // Navigate to feedback screen with specific parameters
      navigation.navigate('FeedbackScreen', { 
        feedbackType: 'feature',
        feedbackTarget: 'app',
        fromThemePicker: true // Special flag for theme color requests
      });
    } else {
      // For free users, navigate to pricing screen
      handleClose();
      navigation.navigate('PricingScreen');
    }
  };

  // Helper to determine text color based on background
  const getContrastColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate perceived brightness (weighted RGB)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Return white for dark colors, black for light colors
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  if (!modalVisible) return null;

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none" // Using custom animations
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      accessible={true}
      accessibilityViewIsModal={true}
    >
      <View style={styles.modalOverlay}>
        {/* Animated backdrop */}
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close color picker"
            accessibilityHint="Dismisses the theme color picker"
          />
        </Animated.View>
        
        {/* Modal Content - animated sliding up from bottom */}
        <PanGestureHandler
          onGestureEvent={handleGesture}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleGestureEnd(event);
            }
          }}
        >
          <Animated.View 
            style={[
              styles.colorPickerContent, 
              { 
                backgroundColor: theme.background,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: theme.border,
                transform: [
                  { translateY: Animated.add(slideAnim, translateY) }
                ],
                paddingBottom: 32 + safeSpacing.bottom // Add safe area padding to bottom
              }
            ]}
            accessible={true}
            accessibilityRole="dialog"
            accessibilityLabel="Theme color picker"
          >
          <View style={styles.modalHeader}>
            <Text 
              style={[styles.modalTitle, { color: textColor }]}
              maxFontSizeMultiplier={1.3}
              accessible={true}
              accessibilityRole="header"
            >
              App Theme
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close theme picker"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-outline" size={28} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.colorPickerBody}>
            <View style={styles.colorGridContainer}>
              <Text 
                style={[styles.sectionLabel, { color: textColor }]}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityRole="text"
              >
                Select Theme Color
              </Text>
              
              {!isPro && (
                <View style={[styles.proMessageContainer, { borderColor: theme.border }]}>
                  <Ionicons name="information-circle-outline" size={18} color={theme.primary} />
                  <Text style={[styles.proMessageText, { color: textColor }]}>
                    Upgrade to Pro for all theme colors
                  </Text>
                </View>
              )}
              
              <View style={styles.colorGrid}>
                {THEME_COLORS.map((color, index) => {
                  const isAvailable = availableColors.includes(color);
                  
                  // Debug logging for Forest Green specifically
                  if (color === '#059669') {
                    log('UI', 'THEME DEBUG: Forest Green (#059669) - isAvailable:', isAvailable);
                    log('UI', 'THEME DEBUG: Available colors array:', availableColors);
                    log('UI', 'THEME DEBUG: User level:', userLevel);
                    log('UI', 'THEME DEBUG: Forest Green unlock state:', forestGreenUnlockState);
                  }
                  
                  return (
                    <Animated.View
                      key={index}
                      style={{
                        transform: [{ translateX: shakeAnims[index] }]
                      }}
                    >
                      <TouchableOpacity
                        style={[
                          styles.colorOption,
                          // Add selected style if this is the current theme color
                          color === themeColor && styles.selectedColorOption,
                          // Merged inline styles
                          {
                            width: width * 0.145,
                            height: width * 0.145,
                            borderRadius: 16,
                            margin: 5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            // Keep shadow effects consistent for all colors regardless of availability
                            shadowOpacity: 0.3,
                            shadowRadius: 4,
                            elevation: 5,
                            backgroundColor: color,
                            // Keep all colors at full brightness regardless of availability
                            opacity: 1,
                            // Apply white border to selected color
                            borderWidth: color === themeColor ? 3 : 0,
                            borderColor: '#FFFFFF',
                          }
                        ]}
                        onPress={() => {
                          const isCharcoal = color === '#1f2937';
                          const isForestGreen = color === '#059669';
                          const showUnlockOverlay = (isCharcoal && charcoalUnlockState === 'unlocked') || 
                                                   (isForestGreen && forestGreenUnlockState === 'unlocked');
                          
                          // ALWAYS log this first to see if ANY touch events are coming through
                          log('UI', 'THEME MAIN: TouchableOpacity pressed - Index:', index, 'isAvailable:', isAvailable, 'showUnlockOverlay:', showUnlockOverlay);
                          
                          if (isAvailable && !showUnlockOverlay) {
                            log('UI', 'THEME COLOR: Color is available and not in unlock state, selecting...');
                            handleColorSelect(color);
                          } else if (showUnlockOverlay) {
                            log('UI', 'THEME COLOR: Color is in unlock state, showing congratulations...');
                            handleColorSelect(color);
                          } else {
                            log('UI', 'THEME COLOR: Color is locked, triggering shake...');
                            handleLockedColorClick(index);
                          }
                        }}
                        activeOpacity={0.8}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`${COLOR_NAMES[index]} color option${color === themeColor ? ', selected' : ''}${!isAvailable ? ', requires Pro upgrade' : ''}`}
                        accessibilityState={{ 
                          selected: color === themeColor,
                          disabled: !isAvailable
                        }}
                        accessibilityHint={isAvailable ? 
                          `Tap to select ${COLOR_NAMES[index]} as your app theme color` : 
                          `This color requires a Pro upgrade`}
                      >
                        {color === themeColor && isAvailable ? (
                          <Ionicons 
                            name="checkmark-sharp" 
                            size={24} 
                            color={getContrastColor(color)} 
                          />
                        ) : (() => {
                          const isCharcoal = color === '#1f2937';
                          const isForestGreen = color === '#059669';
                          const showUnlockOverlay = (isCharcoal && charcoalUnlockState === 'unlocked') || 
                                                   (isForestGreen && forestGreenUnlockState === 'unlocked');
                          
                          return (!isAvailable || showUnlockOverlay) ? (
                          <>
                            <View 
                              style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: 16,
                                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                justifyContent: 'center',
                                alignItems: 'center'
                              }}
                              pointerEvents="none"
                            >
                              {(() => {
                                const requirement = getColorUnlockRequirement(color);
                                
                                // Show unlock icon for newly unlocked colors (this takes priority)
                                if (showUnlockOverlay) {
                                  return (
                                    <Ionicons 
                                      name="lock-open" 
                                      size={16} 
                                      color="#FFD700" 
                                    />
                                  );
                                } else if (requirement === 'pro') {
                                  return (
                                    <Ionicons 
                                      name="lock-closed" 
                                      size={16} 
                                      color="#FFFFFF" 
                                    />
                                  );
                                } else {
                                  return (
                                    <Text 
                                      style={{
                                        color: '#FFFFFF',
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                        textAlign: 'center'
                                      }}
                                    >
                                      LVL {requirement}
                                    </Text>
                                  );
                                }
                              })()}
                            </View>
                            {/* Debug: Add an invisible overlay that captures touches - only for truly locked colors */}
                            {!showUnlockOverlay && (
                              <TouchableOpacity
                                style={{
                                  position: 'absolute',
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: 'transparent'
                                }}
                                onPress={() => {
                                  log('UI', 'THEME OVERLAY: Invisible overlay pressed for locked color at index:', index);
                                  handleLockedColorClick(index);
                                }}
                                activeOpacity={1}
                              />
                            )}
                          </>
                          ) : null;
                        })()}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
              
              {/* Display name of selected color */}
              {themeColor && (
                <Text 
                  style={[styles.selectedColorName, { color: secondaryTextColor }]}
                  maxFontSizeMultiplier={1.3}
                  accessible={true}
                  accessibilityRole="text"
                  accessibilityLabel={`Selected color: ${COLOR_NAMES[THEME_COLORS.indexOf(themeColor)] || 'Custom Color'}`}
                >
                  Selected: {COLOR_NAMES[THEME_COLORS.indexOf(themeColor)] || 'Custom Color'}
                </Text>
              )}
              
              {/* Show unlock text for newly unlocked colors */}
              <View style={styles.unlockMessagesContainer}>
                {charcoalUnlockState === 'unlocked' && (
                  <Text style={[styles.unlockMessage, { color: '#4CAF50' }]}>
                    🎨 Charcoal - Unlock
                  </Text>
                )}
                {forestGreenUnlockState === 'unlocked' && (
                  <Text style={[styles.unlockMessage, { color: '#4CAF50' }]}>
                    🌱 Forest Green - Unlock
                  </Text>
                )}
              </View>
            </View>
            
            {/* "Request a Color" button - different versions for Pro vs Free users */}
            <TouchableOpacity 
              style={[
                styles.requestButton, 
                { 
                  backgroundColor: isPro ? theme.card : 'rgba(63, 81, 181, 0.08)',
                  borderColor: isPro ? theme.border : 'rgba(63, 81, 181, 0.3)',
                  borderWidth: 1
                }
              ]}
              onPress={handleRequestNewColor}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={isPro ? "Request a custom color" : "Custom colors limited to Lifetime Members"}
              accessibilityHint={isPro ? 
                "Navigate to the feedback form to request a custom theme color" : 
                "Upgrade to Pro to unlock custom color requests"}
            >
              <Ionicons 
                name={isPro ? "color-palette-outline" : "lock-closed-outline"} 
                size={20} 
                color={isPro ? theme.primary : '#3F51B5'} 
              />
              <Text 
                style={[
                  styles.requestButtonText, 
                  { 
                    color: isPro ? textColor : '#3F51B5',
                    fontWeight: isPro ? '400' : '500'
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {isPro ? 
                  "Request a custom color (#FFFFFF)" : 
                  "Custom colors (Lifetime Members only)"}
              </Text>
              <Ionicons 
                name={isPro ? "chevron-forward" : "star"} 
                size={18} 
                color={isPro ? theme.primary : '#3F51B5'} 
              />
            </TouchableOpacity>
            
            

            <TouchableOpacity
              style={[styles.applyButton, { 
                backgroundColor: themeColor || theme.primary,
              }]}
              onPress={handleClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Apply theme"
              accessibilityHint="Apply the selected theme color and close the picker"
            >
              <Text 
                style={[styles.applyButtonText, { 
                  color: getContrastColor(themeColor || theme.primary)
                }]}
                maxFontSizeMultiplier={1.3}
              >
                Apply Theme
              </Text>
            </TouchableOpacity>
            
            <Text 
              style={[styles.infoText, { color: secondaryTextColor }]}
              maxFontSizeMultiplier={1.3}
              accessible={true}
              accessibilityRole="text"
            >
              These colors are scientifically selected to enhance focus and productivity.
            </Text>
          </View>
        </Animated.View>
        </PanGestureHandler>
      </View>
      
      {/* Pro Upgrade Modal - Same style as GoalScreen */}
      <FeatureLimitBanner
        theme={theme}
        title="Premium Colors"
        message="Upgrade to Pro to unlock all theme colors."
        useModal={true}
        isVisible={showProModal}
        onUpgrade={() => {
          setShowProModal(false);
          handleClose();
          navigation.navigate('PricingScreen');
        }}
        onClose={() => setShowProModal(false)}
      />
      
      {/* Charcoal Color Congratulations Modal */}
      <Modal
        visible={showCharcoalCongrats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCharcoalCongrats(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Falling Color Palette Icons */}
          {fallingCharcoalAnimations.map((icon) => (
            <Animated.View
              key={icon.id}
              style={[
                styles.fallingIcon,
                {
                  left: icon.horizontalPosition,
                  transform: [
                    {
                      translateY: icon.animatedValue
                    },
                    {
                      rotate: icon.rotation.interpolate({
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
                name={icon.iconName} 
                size={24} 
                color='#1f2937'
                style={styles.fallingIconStyle}
              />
            </Animated.View>
          ))}
          
          <View style={[
            styles.congratsModalContent,
            {
              backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
              borderColor: theme.border,
            }
          ]}>
            {/* Celebration Icon */}
            <View style={[
              styles.congratsIconContainer,
              {
                backgroundColor: '#1f2937',
              }
            ]}>
              <Ionicons name="color-palette" size={40} color="#FFFFFF" />
            </View>
            
            <Text style={[styles.congratsTitle, { color: textColor }]}>
              🎉 Congratulations!
            </Text>
            
            <Text style={[styles.congratsSubtitle, { color: '#1f2937' }]}>
              Charcoal Color Unlocked!
            </Text>
            
            <Text style={[styles.congratsDescription, { color: textColor }]}>
              You've reached Level 3 and unlocked the sophisticated Charcoal theme color! This premium dark shade enhances focus and provides a professional, sleek appearance.
            </Text>
            
            <TouchableOpacity
              style={[styles.congratsButton, { backgroundColor: '#1f2937' }]}
              onPress={() => setShowCharcoalCongrats(false)}
            >
              <Text style={[styles.congratsButtonText, { color: '#FFFFFF' }]}>
                Try It Now! 🎨
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Forest Green Color Congratulations Modal */}
      <Modal
        visible={showForestGreenCongrats}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForestGreenCongrats(false)}
      >
        <View style={styles.modalOverlay}>
          {/* Falling Leaf Icons */}
          {fallingForestAnimations.map((icon) => (
            <Animated.View
              key={icon.id}
              style={[
                styles.fallingIcon,
                {
                  left: icon.horizontalPosition,
                  transform: [
                    {
                      translateY: icon.animatedValue
                    },
                    {
                      rotate: icon.rotation.interpolate({
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
                name={icon.iconName} 
                size={24} 
                color='#059669'
                style={styles.fallingIconStyle}
              />
            </Animated.View>
          ))}
          
          <View style={[
            styles.congratsModalContent,
            {
              backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
              borderColor: theme.border,
            }
          ]}>
            {/* Celebration Icon */}
            <View style={[
              styles.congratsIconContainer,
              {
                backgroundColor: '#059669',
              }
            ]}>
              <Ionicons name="leaf" size={40} color="#FFFFFF" />
            </View>
            
            <Text style={[styles.congratsTitle, { color: textColor }]}>
              🎉 Congratulations!
            </Text>
            
            <Text style={[styles.congratsSubtitle, { color: '#059669' }]}>
              Forest Green Unlocked!
            </Text>
            
            <Text style={[styles.congratsDescription, { color: textColor }]}>
              You've reached Level 5 and unlocked the natural Forest Green theme color! This color promotes balance, growth, and sustainable productivity while reducing eye strain.
            </Text>
            
            <TouchableOpacity
              style={[styles.congratsButton, { backgroundColor: '#059669' }]}
              onPress={() => setShowForestGreenCongrats(false)}
            >
              <Text style={[styles.congratsButtonText, { color: '#FFFFFF' }]}>
                Try It Now! 🌱
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end', // Align to bottom
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    width: '100%',
    height: '100%',
  },
  colorPickerContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 20, 
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  colorPickerBody: {
    paddingHorizontal: 4,
  },
  
  // Pro message
  proMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    borderStyle: 'dashed',
  },
  proMessageText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 8,
  },
  
  // Color grid section
  colorGridContainer: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    marginLeft: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  colorOption: {
    // Base styles for color options
  },
  unavailableColorOption: {
    // Define any additional styles for unavailable colors here
    // The opacity is handled inline, but any other specific styling for locked colors can go here
  },
  selectedColorOption: {
    // Styles for the selected color are handled inline with the white border
  },
  // Style for the selected color name
  selectedColorName: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  
  // Unlock messages styles
  unlockMessagesContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  unlockMessage: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  
  // Request a color button
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  requestButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 8,
  },
  
  // Apply button
  applyButton: {
    width: '100%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  
  // Congratulations modal styles
  congratsModalContent: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -200 }, { translateY: -200 }],
    width: 400,
    maxWidth: '90%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  congratsIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  congratsSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  congratsDescription: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  congratsButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  congratsButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Falling animation styles
  fallingIcon: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  fallingIconStyle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ThemeColorPickerModal;
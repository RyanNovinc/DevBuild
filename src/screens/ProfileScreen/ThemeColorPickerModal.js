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
import ColorWheel from '../../components/ColorWheel'; // Import our color wheel component
import CustomThemeService from '../../services/CustomThemeService'; // Import custom theme service
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
// Level 1 (default): Deep Navy Blue + Slate Blue (always available)
// Level 3: Unlocks Forest Green
// Pro: Unlocks all remaining colors including Charcoal
const LEVEL_COLOR_UNLOCKS = {
  1: ['#1e3a8a', '#3b82f6'], // Deep Navy Blue + Slate Blue - always free
  3: ['#1e3a8a', '#3b82f6', '#059669'], // + Forest Green
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
  const { showSuccess, showError } = useNotification() || { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.error(msg) 
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
  
  // Load custom themes when modal opens
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
      
      // Load custom themes for Pro users
      if (isPro) {
        loadCustomThemes();
      }
    }
  }, [visible, isPro, appContext?.userSubscriptionStatus, availableColors, userLevel, refreshTrigger]);
  
  // Force component update when achievements change
  React.useEffect(() => {
    log('UI', 'THEME ACHIEVEMENTS: Achievement data changed, refreshing colors');
  }, [unlockedAchievements, refreshTrigger]);
  
  // Check color unlock states when level changes
  useEffect(() => {
    const checkColorUnlockStates = async () => {
      // Charcoal now requires Pro subscription (no level unlock)
      setCharcoalUnlockState('locked'); // Always locked for free users
      
      // Check Forest Green unlock (level 3)
      if (userLevel >= 3) {
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
        
        // Disable swipe-to-dismiss when color wheel is open
        if (activeTab === 'custom' && isPro && showColorWheel) {
          return; // Don't allow dismissal when using color wheel
        }
        
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
    
    // Disable swipe-to-dismiss when color wheel is open
    if (activeTab === 'custom' && isPro && showColorWheel) {
      // Snap back to original position
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
      return;
    }
    
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
  
  // Tab state for switching between preset colors and custom color wheel
  const [activeTab, setActiveTab] = useState('preset'); // 'preset' or 'custom'
  
  // Custom themes state
  const [customThemes, setCustomThemes] = useState([]);
  const [customWheelColor, setCustomWheelColor] = useState(themeColor || '#3b82f6');
  const [savingCustomTheme, setSavingCustomTheme] = useState(false);
  const [showColorWheel, setShowColorWheel] = useState(false);
  const [editingTheme, setEditingTheme] = useState(null); // Track which theme is being edited
  const [lastSelectedCustomTheme, setLastSelectedCustomTheme] = useState(null); // Track last selected for edit detection
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null); // Track which slot user clicked for saving
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're in delete/edit mode
  
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
      // Reset all modal states when closing
      setLockedColorClicks(0);
      setShowProModal(false);
      setShowColorWheel(false);
      setEditingTheme(null);
      setLastSelectedCustomTheme(null);
      setSelectedSlotIndex(null);
      onClose();
    }
  };
  
  // Load custom themes from storage
  const loadCustomThemes = async () => {
    try {
      const themes = await CustomThemeService.getCustomThemesWithPositions();
      setCustomThemes(themes);
    } catch (error) {
      console.error('Error loading custom themes:', error);
    }
  };
  
  // Handle tab switch
  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    
    // Reset any modal states when switching tabs
    setShowProModal(false);
    setLockedColorClicks(0);
    setShowColorWheel(false); // Close color wheel when switching tabs
    setEditingTheme(null); // Clear edit mode when switching tabs
    setLastSelectedCustomTheme(null); // Reset selection tracking
    setSelectedSlotIndex(null); // Reset slot selection when switching tabs
  };
  
  // Handle tab swipe gesture
  const handleTabSwipeGesture = (event) => {
    const { state, translationX } = event.nativeEvent;
    
    // Only handle gesture end state
    if (state === State.END) {
      const swipeThreshold = 50; // Minimum distance to trigger tab switch
      
      if (Math.abs(translationX) > swipeThreshold) {
        if (translationX > 0) {
          // Swipe right - go to preset tab
          if (activeTab === 'custom') {
            handleTabSwitch('preset');
          }
        } else {
          // Swipe left - go to custom tab
          if (activeTab === 'preset') {
            handleTabSwitch('custom');
          }
        }
      }
    }
  };
  
  // Handle color wheel change
  const handleColorWheelChange = (color) => {
    setCustomWheelColor(color);
  };
  
  // Save custom theme from color wheel
  const handleSaveCustomTheme = async () => {
    if (!isPro) {
      setShowProModal(true);
      return;
    }
    
    setSavingCustomTheme(true);
    
    try {
      let result;
      
      // Debug logging
      console.log('handleSaveCustomTheme - editingTheme:', editingTheme);
      console.log('handleSaveCustomTheme - selectedSlotIndex:', selectedSlotIndex);
      
      // If selectedSlotIndex is set, force new theme creation (clicked empty slot)
      if (editingTheme && selectedSlotIndex === null) {
        // Editing existing theme - update with new color but keep the same name and position
        result = await CustomThemeService.saveCustomThemeAtPosition(editingTheme.name, customWheelColor, editingTheme.position);
        
        if (result.success) {
          showSuccess(`Theme "${editingTheme.name}" updated successfully!`);
        }
      } else {
        // Creating new theme - generate a unique name and save to selected slot
        const now = new Date();
        const timestamp = now.toLocaleString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit',
          second: '2-digit'
        });
        // Add milliseconds to ensure uniqueness even for rapid saves
        const themeName = `Custom ${timestamp}.${now.getMilliseconds()}`;
        
        // Use selectedSlotIndex if available, otherwise let service handle positioning
        console.log('Saving custom theme:', { themeName, customWheelColor, selectedSlotIndex });
        result = await CustomThemeService.saveCustomThemeAtPosition(themeName, customWheelColor, selectedSlotIndex);
        console.log('Save result:', result);
        
        if (result.success) {
          showSuccess(`Theme "${themeName}" saved successfully!`);
          
          // Track theme creation for achievements (only for new themes and if it's actually different)
          if (customWheelColor !== themeColor) {
            try {
              await FeatureExplorerTracker.trackThemeColorChange(customWheelColor, showSuccess);
            } catch (error) {
              console.error('Error tracking custom theme creation:', error);
            }
          }
        }
      }
      
      if (result.success) {
        // Clear all editing states immediately to prevent race conditions
        setEditingTheme(null);
        setSelectedSlotIndex(null);
        setLastSelectedCustomTheme(null);
        
        // Refresh custom themes list
        await loadCustomThemes();
        
        // Apply the theme
        onSelectColor(customWheelColor);
        
        // Close the color wheel and return to saved themes view
        setShowColorWheel(false);
      } else {
        showError(result.error || 'Failed to save custom theme');
      }
    } catch (error) {
      console.error('Error saving custom theme:', error);
      showError('Failed to save custom theme');
    } finally {
      setSavingCustomTheme(false);
      // Ensure editing states are fully cleared after any save attempt
      setEditingTheme(null);
      setSelectedSlotIndex(null);
    }
  };
  
  // Handle selecting a custom theme
  const handleSelectCustomTheme = (theme) => {
    // Check if this theme is currently the active theme color (already selected)
    if (theme.color === themeColor) {
      // User clicked on the currently selected theme - enter edit mode
      setEditingTheme(theme);
      setCustomWheelColor(theme.color);
      setShowColorWheel(true);
      setLastSelectedCustomTheme(null); // Reset selection tracking
    } else {
      // User clicked on a different theme - select it as the new color
      setCustomWheelColor(theme.color);
      onSelectColor(theme.color);
      setLastSelectedCustomTheme(theme); // Track this selection for potential future edit
    }
  };
  
  // Handle deleting a custom theme
  const handleDeleteCustomTheme = async (themeId, themeName) => {
    Alert.alert(
      'Delete Custom Theme',
      `Are you sure you want to delete "${themeName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await CustomThemeService.deleteCustomTheme(themeId);
              if (result.success) {
                await loadCustomThemes();
                showSuccess(`Theme "${themeName}" deleted`);
              } else {
                showError(result.error || 'Failed to delete theme');
              }
            } catch (error) {
              console.error('Error deleting custom theme:', error);
              showError('Failed to delete theme');
            }
          }
        }
      ]
    );
  };
  
  // Handle deleting a custom theme at a specific position
  const handleDeleteCustomThemeAtPosition = async (position, themeName) => {
    try {
      const result = await CustomThemeService.deleteCustomThemeAtPosition(position);
      if (result.success) {
        await loadCustomThemes();
        showSuccess(`Theme "${themeName}" deleted`);
      } else {
        showError(result.error || 'Failed to delete theme');
      }
    } catch (error) {
      console.error('Error deleting custom theme:', error);
      showError('Failed to delete theme');
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
    
    // Track the theme color change for the achievement ONLY if it's actually a different color
    if (color !== themeColor) {
      try {
        await FeatureExplorerTracker.trackThemeColorChange(color, showSuccess);
      } catch (error) {
        console.error('Error tracking theme color change:', error);
      }
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
          enabled={!(activeTab === 'custom' && isPro && showColorWheel)} // Disable when color wheel is open
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
            {/* Tab Navigation - Only show for Pro users */}
            {isPro && (
              <PanGestureHandler
                onHandlerStateChange={handleTabSwipeGesture}
                activeOffsetX={[-50, 50]} // Require 50px horizontal movement to trigger
                failOffsetY={[-20, 20]} // Fail if more than 20px vertical movement
              >
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === 'preset' && [styles.activeTab, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => handleTabSwitch('preset')}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeTab === 'preset' }}
                  >
                    <Text style={[
                      styles.tabText,
                      { color: activeTab === 'preset' ? '#fff' : theme.primary }
                    ]}>
                      Preset Colors
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === 'custom' && [styles.activeTab, { backgroundColor: theme.primary }]
                    ]}
                    onPress={() => handleTabSwitch('custom')}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeTab === 'custom' }}
                  >
                    <Text style={[
                      styles.tabText,
                      { color: activeTab === 'custom' ? '#fff' : theme.primary }
                    ]}>
                      Custom Colors
                    </Text>
                  </TouchableOpacity>
                </View>
              </PanGestureHandler>
            )}
            
            {/* Preset Colors Tab Content */}
            {activeTab === 'preset' && (
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
                                      STG {requirement}
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
              
              {/* Scientific info text - only for preset colors */}
              <Text 
                style={[styles.infoText, { color: secondaryTextColor }]}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityRole="text"
              >
                These colors are scientifically selected to enhance focus and productivity.
              </Text>
              </View>
            )}
            
            {/* Custom Colors Tab Content - Only for Pro users */}
            {activeTab === 'custom' && isPro && (
              <View style={styles.customColorContainer}>
                {showColorWheel ? (
                  // Color Wheel View
                  <View style={styles.colorWheelView}>
                    {/* Show edit mode header if editing */}
                    {editingTheme && (
                      <View style={styles.editModeHeader}>
                        <Ionicons name="create-outline" size={20} color={theme.primary} />
                        <Text style={[styles.editModeText, { color: theme.primary }]}>
                          Editing
                        </Text>
                      </View>
                    )}
                    
                    <ColorWheel
                      onColorChange={handleColorWheelChange}
                      selectedColor={customWheelColor}
                      theme={theme}
                    />
                    
                    {/* Save and Cancel Buttons */}
                    <View style={styles.colorWheelButtons}>
                      <TouchableOpacity
                        style={[styles.cancelButton, { borderColor: theme.border }]}
                        onPress={() => {
                          setShowColorWheel(false);
                          setEditingTheme(null); // Clear edit mode on cancel
                        }}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Cancel color selection"
                      >
                        <Text style={[styles.cancelButtonText, { color: textColor }]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.saveThemeButton, { backgroundColor: customWheelColor }]}
                        onPress={handleSaveCustomTheme}
                        disabled={savingCustomTheme}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={editingTheme ? "Update custom theme" : "Save custom theme"}
                      >
                        <Ionicons 
                          name={savingCustomTheme ? "hourglass-outline" : (editingTheme ? "checkmark-outline" : "bookmark-outline")} 
                          size={20} 
                          color="#fff" 
                        />
                        <Text style={[styles.saveThemeButtonText, { color: '#fff' }]}>
                          {savingCustomTheme ? 'Saving...' : (editingTheme ? 'Update' : 'Save')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // Saved Themes Grid View (like preset colors)
                  <View style={styles.customThemesGrid}>
                    {/* Header with title and edit button */}
                    <View style={styles.customColorsHeader}>
                      <Text 
                        style={[styles.sectionLabel, { color: textColor }]}
                        maxFontSizeMultiplier={1.3}
                        accessible={true}
                        accessibilityRole="text"
                      >
                        Custom Colors ({customThemes.filter(t => t !== null).length}/{CustomThemeService.MAX_CUSTOM_THEMES})
                      </Text>
                      
                      {/* Edit button - only show if there are custom themes */}
                      {customThemes.filter(t => t !== null).length > 0 && (
                        <TouchableOpacity
                          style={[styles.editIconButton, { 
                            backgroundColor: isEditMode ? '#ff4444' : 'transparent',
                          }]}
                          onPress={() => setIsEditMode(!isEditMode)}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons 
                            name={isEditMode ? 'checkmark-outline' : 'pencil-outline'} 
                            size={18} 
                            color={isEditMode ? '#fff' : theme.text} 
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    
                    {/* Hint text */}
                    {customThemes.filter(t => t !== null).length > 0 && (
                      <View style={styles.hintContainer}>
                        {!isEditMode && (
                          <Text style={[styles.editHintText, { color: secondaryTextColor }]}>
                            Tap selected color again to edit
                          </Text>
                        )}
                        
                        {isEditMode && (
                          <Text style={[styles.editHintText, { color: secondaryTextColor }]}>
                            Tap × to delete themes
                          </Text>
                        )}
                      </View>
                    )}
                    
                    {/* Custom Themes Grid */}
                    <View style={styles.customColorGrid}>
                      {/* Render all slots (saved themes + empty placeholders) */}
                      {Array.from({ length: CustomThemeService.MAX_CUSTOM_THEMES }, (_, index) => {
                        const customTheme = customThemes[index];
                        
                        if (customTheme) {
                          // Saved Custom Theme
                          return (
                            <View key={customTheme.id} style={styles.customThemeContainer}>
                              <TouchableOpacity
                                style={[
                                  styles.colorOption,
                                  {
                                    width: width * 0.145,
                                    height: width * 0.145,
                                    borderRadius: 16,
                                    margin: 5,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 4,
                                    elevation: 5,
                                    backgroundColor: customTheme.color,
                                    borderWidth: customTheme.color === themeColor ? 3 : 0,
                                    borderColor: '#FFFFFF',
                                  }
                                ]}
                                onPress={() => {
                                  if (isEditMode) {
                                    handleDeleteCustomThemeAtPosition(index, customTheme.name);
                                  } else {
                                    handleSelectCustomTheme({...customTheme, position: index});
                                  }
                                }}
                                accessible={true}
                                accessibilityRole="button"
                                accessibilityLabel={`Custom theme ${customTheme.name}${customTheme.color === themeColor ? ', selected' : ''}`}
                                accessibilityHint={isEditMode ? 'Tap to delete this custom theme' : 'Tap to select theme'}
                              >
                                {!isEditMode && customTheme.color === themeColor && (
                                  <Ionicons 
                                    name="checkmark-sharp" 
                                    size={24} 
                                    color={getContrastColor(customTheme.color)} 
                                  />
                                )}
                                
                                {isEditMode && (
                                  <View style={styles.deleteIndicator}>
                                    <Ionicons 
                                      name="close" 
                                      size={16} 
                                      color="#fff" 
                                    />
                                  </View>
                                )}
                              </TouchableOpacity>
                            </View>
                          );
                        } else {
                          // Empty Placeholder Slot
                          return (
                            <TouchableOpacity
                              key={`empty-${index}`}
                              style={[styles.emptyColorSlot, { 
                                borderColor: theme.border,
                                backgroundColor: theme.background 
                              }]}
                              onPress={() => {
                                console.log('Empty slot clicked - index:', index);
                                console.log('Before clearing - editingTheme:', editingTheme, 'lastSelectedCustomTheme:', lastSelectedCustomTheme);
                                
                                // Clear ALL editing states when creating new theme to prevent conflicts
                                setEditingTheme(null);
                                setLastSelectedCustomTheme(null);
                                setSelectedSlotIndex(index);
                                // Reset to default color for new theme creation
                                setCustomWheelColor('#3b82f6');
                                setShowColorWheel(true);
                                
                                console.log('After setting - selectedSlotIndex should be:', index);
                              }}
                              accessible={true}
                              accessibilityRole="button"
                              accessibilityLabel={`Empty custom color slot ${index + 1}`}
                              accessibilityHint="Tap to create a new custom theme"
                            >
                              <Ionicons 
                                name="add" 
                                size={24} 
                                color={theme.textSecondary} 
                                style={{ opacity: 0.5 }}
                              />
                            </TouchableOpacity>
                          );
                        }
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}
            
            
            

            <TouchableOpacity
              style={[styles.applyButton, { 
                backgroundColor: activeTab === 'custom' && isPro ? customWheelColor : (themeColor || theme.primary),
              }]}
              onPress={() => {
                // Apply the current color based on active tab
                if (activeTab === 'custom' && isPro) {
                  onSelectColor(customWheelColor);
                }
                handleClose();
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Apply theme"
              accessibilityHint="Apply the selected theme color and close the picker"
            >
              <Text 
                style={[styles.applyButtonText, { 
                  color: getContrastColor(activeTab === 'custom' && isPro ? customWheelColor : (themeColor || theme.primary))
                }]}
                maxFontSizeMultiplier={1.3}
              >
                Apply Theme
              </Text>
            </TouchableOpacity>
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
              You've upgraded to Pro and unlocked the sophisticated Charcoal theme color! This premium dark shade enhances focus and provides a professional, sleek appearance.
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
              You've reached Level 3 and unlocked the natural Forest Green theme color! This color promotes balance, growth, and sustainable productivity while reducing eye strain.
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
  customColorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
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
  
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Custom color wheel styles
  customColorContainer: {
    paddingVertical: 10,
  },
  colorWheelView: {
    alignItems: 'center',
  },
  editModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
  },
  editModeText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  editHintText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: -8,
    marginBottom: 12,
    opacity: 0.7,
  },
  colorWheelButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveThemeButton: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  saveThemeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Custom themes grid styles
  customThemesGrid: {
    paddingHorizontal: 4,
  },
  addColorButton: {
    width: width * 0.145,
    height: width * 0.145,
    borderRadius: 16,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyColorSlot: {
    width: width * 0.145,
    height: width * 0.145,
    borderRadius: 16,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  emptyStateText: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 20,
    paddingHorizontal: 20,
    lineHeight: 20,
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
  
  // Edit mode styles
  customColorsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  editIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  hintContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  customThemeContainer: {
    position: 'relative',
  },
  deleteIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    pointerEvents: 'none',
  },
});

export default ThemeColorPickerModal;
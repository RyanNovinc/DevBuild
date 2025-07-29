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
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../context/AppContext';
import { useNotification } from '../../context/NotificationContext'; // Added import for notifications
import FeatureExplorerTracker from '../../services/FeatureExplorerTracker'; // Import the tracker
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

// Free version colors - limited to Blue, Charcoal, Green
const FREE_COLORS = [
  '#1e3a8a', // Deep Navy Blue
  '#1f2937', // Charcoal
  '#059669', // Forest Green
];

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
  
  // Create shake animations for each color
  const shakeAnims = useRef(
    THEME_COLORS.map(() => new Animated.Value(0))
  ).current;
  
  // Track actual modal visibility state for closing animations
  const [modalVisible, setModalVisible] = useState(visible);
  
  // Track whether animation system has been pre-warmed
  const hasPreWarmed = useRef(false);
  
  // Determine which colors to show based on membership status
  const availableColors = useMemo(() => {
    return isPro ? THEME_COLORS : FREE_COLORS;
  }, [isPro]);
  
  // Add counter for locked color clicks
  const [lockedColorClicks, setLockedColorClicks] = useState(0);
  
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
    if (visible) {
      // Set modal visible immediately when opening
      setModalVisible(true);
      
      // Reset animations to starting values
      fadeAnim.setValue(0);
      slideAnim.setValue(screenHeight);
      
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
    } else if (modalVisible) {
      // Run animations when modal closes
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
        })
      ]).start(({ finished }) => {
        // Only hide the modal if the animation actually finished
        if (finished) {
          setModalVisible(false);
        }
      });
    }
  }, [visible, modalVisible, fadeAnim, slideAnim, screenHeight]);

  // Function to shake a color
  const shakeColor = (index) => {
    // Reset the animation value
    shakeAnims[index].setValue(0);
    
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
    ]).start();
  };

  // Handle close request with animation
  const handleClose = () => {
    // Only trigger onClose if we're not already closing
    if (modalVisible && visible) {
      // Reset locked color clicks counter when closing
      setLockedColorClicks(0);
      onClose();
    }
  };
  
  // Enhanced color selection handler with achievement tracking
  const handleColorSelect = async (color) => {
    // Call the original onSelectColor prop function
    onSelectColor(color);
    
    // Track the theme color change for the achievement
    try {
      await FeatureExplorerTracker.trackThemeColorChange(color, showSuccess);
    } catch (error) {
      console.error('Error tracking theme color change:', error);
    }
  };
  
  // Handle locked color click
  const handleLockedColorClick = (index) => {
    console.log('Locked color clicked at index:', index);
    
    // Shake the color
    shakeColor(index);
    
    // Increment the counter
    const newCount = lockedColorClicks + 1;
    setLockedColorClicks(newCount);
    console.log('Locked color clicks:', newCount);
    
    // Show upgrade modal after 3 clicks
    if (newCount >= 3) {
      console.log('Showing upgrade alert after 3 clicks');
      Alert.alert(
        'Premium Feature',
        'Upgrade to Pro to unlock all theme colors and customize your experience.',
        [
          {
            text: 'Upgrade to Pro',
            onPress: () => {
              handleClose();
              navigation.navigate('PricingScreen');
            }
          },
          {
            text: 'Maybe Later',
            style: 'cancel'
          }
        ]
      );
      
      // Reset the counter after showing the alert
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
        <Animated.View 
          style={[
            styles.colorPickerContent, 
            { 
              backgroundColor: theme.background,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: theme.border,
              transform: [{ translateY: slideAnim }],
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
                          if (isAvailable) {
                            handleColorSelect(color);
                          } else {
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
                        ) : !isAvailable ? (
                          <View style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: 16,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            justifyContent: 'center',
                            alignItems: 'center'
                          }}>
                            <Ionicons 
                              name="lock-closed" 
                              size={16} 
                              color="#FFFFFF" 
                            />
                          </View>
                        ) : null}
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
      </View>
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
  }
});

export default ThemeColorPickerModal;
// src/components/subscription/SubscriptionUI.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Animated,
  Easing,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import responsive utilities if available in your project
let spacing, fontSizes, scaleWidth, scaleHeight;
try {
  const responsive = require('../../utils/responsive');
  spacing = responsive.spacing;
  fontSizes = responsive.fontSizes;
  scaleWidth = responsive.scaleWidth;
  scaleHeight = responsive.scaleHeight;
} catch (error) {
  // Fallback values if import fails
  spacing = { xxs: 4, xs: 8, s: 12, m: 16, l: 20, xl: 24 };
  fontSizes = { xs: 12, s: 14, m: 16, l: 18, xl: 20 };
  scaleWidth = (size) => size;
  scaleHeight = (size) => size;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Create styles as a plain object to avoid StyleSheet initialization issues
const styles = {
  // Original Limit Banner (legacy)
  limitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginVertical: 10,
  },
  limitBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  limitBannerText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  
  // Limit Container
  limitContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  limitBarContainer: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    marginBottom: 16,
    overflow: 'hidden',
  },
  limitBarBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  limitBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  limitText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  upgradeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
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
  modalPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    paddingBottom: 24,
    maxHeight: '80%',
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  aiIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
  },
  closeTextButton: {
    paddingVertical: 10,
  },
  closeTextButtonText: {
    fontSize: 14,
  },
  
  // Pro badge styles
  proBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  proBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // NEW: Enhanced Feature Limit Banner Modal Styles
  featureLimitOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's above everything else
  },
  featureLimitBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker for better visibility
  },
  featureLimitPanel: {
    width: '100%',
    borderTopWidth: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1001, // Above the backdrop
  },
  featureLimitContent: {
    paddingHorizontal: 20,
  },
  featureLimitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureLimitIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureLimitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  featureLimitText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  featureLimitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  featureLimitCancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 12,
  },
  featureLimitCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  featureLimitUpgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLimitUpgradeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

/**
 * A component to display when a feature is locked behind the pro subscription
 * 
 * ENHANCED: Now has both a legacy mode (simple banner) and a new modal mode
 * Use `useModal={true}` prop to enable the new modal display
 */
export const FeatureLimitBanner = ({ 
  theme, 
  message = "Upgrade to Pro for unlimited access", 
  onUpgrade,
  onClose,
  style,
  useModal = false,
  isVisible = true
}) => {
  // Animation values for modal version
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const insets = useSafeAreaInsets();
  
  // State to track visibility for animated unmounting
  const [modalVisible, setModalVisible] = useState(isVisible);
  
  // Run animation when component mounts or visibility changes
  useEffect(() => {
    if (useModal) {
      if (isVisible) {
        // Make modal visible immediately
        setModalVisible(true);
        
        // Fade in and slide up animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          })
        ]).start();
      } else if (modalVisible) {
        // Fade out and slide down animation
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease)
          }),
          Animated.timing(slideAnim, {
            toValue: 50,
            duration: 250,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease)
          })
        ]).start(({ finished }) => {
          // Only hide modal if animation completed
          if (finished) setModalVisible(false);
        });
      }
    }
  }, [isVisible, useModal, modalVisible, fadeAnim, slideAnim]);
  
  // Handle close action
  const handleClose = () => {
    if (onClose) onClose();
  };
  
  // Handle upgrade action
  const handleUpgrade = () => {
    if (onClose) onClose();
    if (onUpgrade) onUpgrade();
  };
  
  // For modal mode, render a full-screen modal
  if (useModal) {
    if (!modalVisible) return null;
    
    return (
      <Modal
        visible={true}
        transparent={true}
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent={true}
      >
        <View style={styles.featureLimitOverlay}>
          {/* Animated backdrop */}
          <Animated.View 
            style={[
              styles.featureLimitBackdrop,
              { opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1]
                }) 
              }
            ]}
          >
            {onClose && (
              <TouchableOpacity 
                style={styles.backdropTouchable}
                activeOpacity={1}
                onPress={handleClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close limit notification"
              />
            )}
          </Animated.View>
          
          {/* Animated panel */}
          <Animated.View 
            style={[
              styles.featureLimitPanel,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
                paddingBottom: insets.bottom + 16,
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim
              },
              style
            ]}
          >
            <View style={styles.featureLimitContent}>
              <View style={styles.featureLimitHeader}>
                <View style={[
                  styles.featureLimitIconContainer,
                  { backgroundColor: theme.primary + '20' }
                ]}>
                  <Ionicons name="lock-closed" size={20} color={theme.primary} />
                </View>
                <Text 
                  style={[
                    styles.featureLimitTitle, 
                    { color: theme.text }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Limit Reached
                </Text>
              </View>
              
              <Text 
                style={[
                  styles.featureLimitText, 
                  { color: theme.text }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {message}
              </Text>
              
              <View style={styles.featureLimitActions}>
                {onClose && (
                  <TouchableOpacity
                    style={[
                      styles.featureLimitCancelButton,
                      { borderColor: theme.border }
                    ]}
                    onPress={handleClose}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Close"
                    accessibilityHint="Dismiss this notification"
                  >
                    <Text 
                      style={[
                        styles.featureLimitCancelText, 
                        { color: theme.textSecondary }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      Later
                    </Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.featureLimitUpgradeButton, 
                    { backgroundColor: theme.primary }
                  ]}
                  onPress={handleUpgrade}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Upgrade to Pro"
                  accessibilityHint="Opens the pricing screen to upgrade your subscription"
                >
                  <Text 
                    style={styles.featureLimitUpgradeText}
                    maxFontSizeMultiplier={1.3}
                  >
                    Upgrade to Pro
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  }
  
  // For legacy mode, render the original simple banner
  return (
    <TouchableOpacity 
      style={[
        styles.limitBanner, 
        { backgroundColor: theme.primary + '20', borderColor: theme.primary },
        style
      ]}
      onPress={onUpgrade}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel="Upgrade to Pro"
      accessibilityHint="Opens the pricing screen to upgrade your subscription"
    >
      <View style={styles.limitBannerContent}>
        <Ionicons name="lock-closed" size={18} color={theme.primary} />
        <Text 
          style={[styles.limitBannerText, { color: theme.text }]}
          numberOfLines={2}
          maxFontSizeMultiplier={1.3}
        >
          {message}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.primary} />
    </TouchableOpacity>
  );
};

/**
 * A component to display when a numerical limit is reached
 */
export const LimitReachedView = ({
  theme,
  limitType = "items",
  currentCount,
  maxCount,
  message,
  onUpgrade,
  children,
  showBar = true
}) => {
  const defaultMessage = `You've reached the maximum of ${maxCount} ${limitType} on the free plan.`;
  const displayMessage = message || defaultMessage;
  
  return (
    <View style={styles.limitContainer}>
      {showBar && (
        <View style={styles.limitBarContainer}>
          <View 
            style={[
              styles.limitBarBackground, 
              { backgroundColor: theme.border }
            ]} 
          />
          <View 
            style={[
              styles.limitBarFill, 
              { 
                backgroundColor: 
                  currentCount >= maxCount 
                    ? '#F44336' // Red when limit reached
                    : currentCount >= maxCount * 0.8 
                      ? '#FF9800' // Orange when near limit
                      : theme.primary, // Normal color otherwise
                width: `${Math.min(100, (currentCount / maxCount) * 100)}%`
              }
            ]} 
          />
        </View>
      )}
      
      <Text 
        style={[styles.limitText, { color: theme.text }]}
        maxFontSizeMultiplier={1.3}
      >
        {displayMessage}
      </Text>
      
      <TouchableOpacity
        style={[styles.upgradeButton, { backgroundColor: theme.primary }]}
        onPress={onUpgrade}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Upgrade to Pro"
        accessibilityHint="Opens the pricing screen to upgrade your subscription"
      >
        <Text 
          style={[styles.upgradeButtonText, { color: '#FFFFFF' }]}
          maxFontSizeMultiplier={1.3}
        >
          Upgrade to Pro
        </Text>
      </TouchableOpacity>
      
      {children}
    </View>
  );
};

/**
 * A component to display when AI usage limit is reached
 */
export const AILimitReachedModal = ({
  visible,
  theme,
  usageCount,
  maxCount,
  onClose,
  onUpgrade,
  onWatchAd
}) => {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(1000)).current;
  
  useEffect(() => {
    if (visible) {
      // Run animations when modal opens
      Animated.parallel([
        // Fade in the background overlay
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
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
    } else {
      // Run animations when modal closes
      Animated.parallel([
        // Fade out the background
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        // Slide down the content
        Animated.timing(slideAnim, {
          toValue: 1000,
          duration: 280,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={true}
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
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          />
        </Animated.View>
        
        {/* Modal Content */}
        <Animated.View 
          style={[
            styles.modalPanel, 
            { 
              backgroundColor: theme.background,
              borderColor: theme.border,
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom + 16
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text 
              style={[styles.modalTitle, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              AI Assistant Limit Reached
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={40} color={theme.primary} />
            </View>
            
            <Text 
              style={[styles.modalMessage, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              You've used {usageCount} of {maxCount} free AI Assistant uses today.
            </Text>
            
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                onPress={onUpgrade}
              >
                <Text 
                  style={styles.primaryButtonText}
                  maxFontSizeMultiplier={1.3}
                >
                  Upgrade to Pro
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.secondaryButton, { borderColor: theme.border }]}
                onPress={onWatchAd}
              >
                <Text 
                  style={[styles.secondaryButtonText, { color: theme.text }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Watch Ad for 1 Free Use
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeTextButton}
                onPress={onClose}
              >
                <Text 
                  style={[styles.closeTextButtonText, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Maybe Later
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

/**
 * A small badge to indicate pro features
 */
export const ProBadge = ({ theme, style }) => {
  return (
    <View style={[styles.proBadge, { backgroundColor: theme.primary }, style]}>
      <Text 
        style={styles.proBadgeText}
        maxFontSizeMultiplier={1.2}
      >
        PRO
      </Text>
    </View>
  );
};

// Export as default object with all components
export default {
  FeatureLimitBanner,
  LimitReachedView,
  AILimitReachedModal,
  ProBadge
};
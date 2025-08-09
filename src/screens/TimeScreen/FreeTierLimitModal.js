// src/screens/TimeScreen/FreeTierLimitModal.js
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Easing 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  ensureAccessibleTouchTarget
} from '../../utils/responsive';

/**
 * Modal component for displaying free tier limitations
 */
const FreeTierLimitModal = ({ 
  visible, 
  theme, 
  limitType,
  onClose, 
  onUpgrade,
  isDarkMode 
}) => {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(1000)).current;
  
  // Run animations when visibility changes
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

  // Get content based on limit type
  const getModalContent = () => {
    switch (limitType) {
      case 'weeklyLimit':
        return {
          icon: 'calendar',
          title: 'Weekly Time Block Limit',
          message: 'Free accounts are limited to 5 time blocks per week. Upgrade to Pro for unlimited time blocks and better planning.',
          upgradeText: 'Upgrade to Pro'
        };
        
      case 'horizon':
        return {
          icon: 'time',
          title: 'Planning Horizon Limit',
          message: 'Free accounts can only plan up to 2 weeks ahead. Upgrade to Pro for 12-month planning horizon.',
          upgradeText: 'Extend Your Planning'
        };
        
      case 'pdfExport':
        return {
          icon: 'document-text',
          title: 'Export Limitation',
          message: 'Free accounts can only export Day view to PDF. Upgrade to Pro for professional exports of all views.',
          upgradeText: 'Get Professional Exports'
        };
        
      case 'repeating':
        return {
          icon: 'repeat',
          title: 'Limited Repeating Options',
          message: 'Free accounts are limited to weekly repeating only. Upgrade to Pro for all repeating patterns (daily, weekly, monthly).',
          upgradeText: 'Unlock All Repeating Options'
        };
        
      default:
        return {
          icon: 'lock-closed',
          title: 'Pro Feature',
          message: 'This feature is only available in the Pro version. Upgrade now to unlock all Pro features.',
          upgradeText: 'Upgrade to Pro'
        };
    }
  };

  // Get content for current limit type
  const { icon, title, message, upgradeText } = getModalContent();

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
              borderTopWidth: 1,
              borderColor: theme.border,
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text 
              style={[
                styles.modalTitle, 
                { color: theme.text }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {title}
            </Text>
            <TouchableOpacity
              style={[
                styles.closeButton,
                ensureAccessibleTouchTarget(scaleWidth(44), scaleWidth(44))
              ]}
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close dialog"
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={[
              styles.iconContainer, 
              { backgroundColor: `${theme.primary}20` }
            ]}>
              <Ionicons name={icon} size={scaleWidth(40)} color={theme.primary} />
            </View>
            
            <Text 
              style={[
                styles.modalMessage, 
                { color: theme.text }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {message}
            </Text>
            
            <View style={styles.comparisonsContainer}>
              <View style={styles.comparisonRow}>
                <View style={styles.comparisonColumn}>
                  <Text style={[styles.comparisonTitle, { color: theme.textSecondary }]}>Free</Text>
                  {limitType === 'weeklyLimit' && (
                    <View style={styles.comparisonItem}>
                      <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
                      <Text style={[styles.comparisonText, { color: theme.text }]}>5 time blocks/week</Text>
                    </View>
                  )}
                  {limitType === 'horizon' && (
                    <View style={styles.comparisonItem}>
                      <Ionicons name="time-outline" size={18} color={theme.textSecondary} />
                      <Text style={[styles.comparisonText, { color: theme.text }]}>2 weeks planning</Text>
                    </View>
                  )}
                  {limitType === 'pdfExport' && (
                    <View style={styles.comparisonItem}>
                      <Ionicons name="document-outline" size={18} color={theme.textSecondary} />
                      <Text style={[styles.comparisonText, { color: theme.text }]}>Day view export only</Text>
                    </View>
                  )}
                  {limitType === 'repeating' && (
                    <View style={styles.comparisonItem}>
                      <Ionicons name="repeat-outline" size={18} color={theme.textSecondary} />
                      <Text style={[styles.comparisonText, { color: theme.text }]}>Weekly repeating only</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.comparisonColumn}>
                  <Text style={[styles.comparisonTitle, { color: theme.primary }]}>Pro</Text>
                  {limitType === 'weeklyLimit' && (
                    <View style={styles.comparisonItem}>
                      <Ionicons name="infinite-outline" size={18} color={theme.primary} />
                      <Text style={[styles.comparisonText, { color: theme.text }]}>Unlimited time blocks</Text>
                    </View>
                  )}
                  {limitType === 'horizon' && (
                    <View style={styles.comparisonItem}>
                      <Ionicons name="calendar-outline" size={18} color={theme.primary} />
                      <Text style={[styles.comparisonText, { color: theme.text }]}>12-month planning</Text>
                    </View>
                  )}
                  {limitType === 'pdfExport' && (
                    <View style={styles.comparisonItem}>
                      <Ionicons name="document-text-outline" size={18} color={theme.primary} />
                      <Text style={[styles.comparisonText, { color: theme.text }]}>All views, no watermark</Text>
                    </View>
                  )}
                  {limitType === 'repeating' && (
                    <View style={styles.comparisonItem}>
                      <Ionicons name="repeat-outline" size={18} color={theme.primary} />
                      <Text style={[styles.comparisonText, { color: theme.text }]}>Daily, weekly, monthly</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[
                  styles.upgradeButton,
                  ensureAccessibleTouchTarget(scaleWidth(200), scaleHeight(50)),
                  { backgroundColor: theme.primary }
                ]}
                onPress={onUpgrade}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Pro"
              >
                <Text 
                  style={[
                    styles.upgradeButtonText,
                    { color: isDarkMode ? '#000000' : '#FFFFFF' }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {upgradeText}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeTextButton}
                onPress={onClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Continue with free version"
              >
                <Text 
                  style={[
                    styles.closeTextButtonText, 
                    { color: theme.textSecondary }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Continue with Free Version
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    paddingBottom: 24,
    maxHeight: '80%',
    zIndex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(16),
    marginTop: scaleHeight(10),
  },
  modalTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    paddingHorizontal: scaleWidth(20),
    alignItems: 'center',
  },
  iconContainer: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleHeight(20),
  },
  modalMessage: {
    fontSize: scaleFontSize(16),
    textAlign: 'center',
    marginBottom: scaleHeight(24),
    lineHeight: 22,
  },
  comparisonsContainer: {
    width: '100%',
    marginBottom: scaleHeight(24),
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleHeight(16),
  },
  comparisonColumn: {
    flex: 1,
    padding: scaleWidth(10),
    alignItems: 'center',
  },
  comparisonTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    marginBottom: scaleHeight(10),
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleHeight(6),
  },
  comparisonText: {
    fontSize: scaleFontSize(14),
    marginLeft: scaleWidth(6),
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: scaleHeight(10),
  },
  upgradeButton: {
    width: '100%',
    paddingVertical: scaleHeight(14),
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    marginBottom: scaleHeight(12),
  },
  upgradeButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
  },
  closeTextButton: {
    paddingVertical: scaleHeight(10),
  },
  closeTextButtonText: {
    fontSize: scaleFontSize(14),
  }
});

export default FreeTierLimitModal;
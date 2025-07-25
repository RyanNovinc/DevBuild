// src/screens/Onboarding/components/modals/StatisticDetailsModal.js
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale } from '../../styles/onboardingStyles';
import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../../utils/deviceUtils';

// Get initial dimensions for static styles
const INITIAL_WINDOW = Dimensions.get('window');

/**
 * StatisticDetailsModal - Modal displaying details about a statistic
 * Enhanced with accessibility, responsive text, and performance optimizations
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {object} statistic - The statistic object to display
 * @param {function} onClose - Function to close the modal
 * @param {function} onSourcePress - Function to open source URL
 */
const StatisticDetailsModal = ({ 
  visible, 
  statistic, 
  onClose, 
  onSourcePress 
}) => {
  // Get orientation for responsive layout
  const { orientation, dimensions } = useOrientation();
  
  // Check if device is low-end
  const isLowEnd = isLowEndDevice();
  
  // Get current dimensions for responsive sizing
  const { width, height } = dimensions || INITIAL_WINDOW;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Dynamic styles based on current dimensions
  const dynamicStyles = {
    statDetailsContent: {
      backgroundColor: '#121214',
      borderRadius: 20,
      padding: 20,
      width: Math.min(width * 0.85, 400),
      maxHeight: height * 0.75,
      borderWidth: 2,
      borderColor: '#2563eb',
    },
    statDetailsContentLandscape: {
      width: Math.min(width * 0.65, 500),
      maxHeight: height * 0.85,
    }
  };
  
  // Run entrance animation when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset animations
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      
      // Optimize animations for low-end devices
      if (isLowEnd) {
        // Simplified animation for low-end devices
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
          })
        ]).start();
      } else {
        // Full animation for modern devices
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 65,
            friction: 7,
            useNativeDriver: true
          })
        ]).start();
      }
    }
  }, [visible, isLowEnd]);
  
  // Handle close animation
  const handleClose = () => {
    // Optimize animations for low-end devices
    if (isLowEnd) {
      // Simplified animation for low-end devices
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true
        })
      ]).start(() => {
        if (onClose) onClose();
      });
    } else {
      // Full animation for modern devices
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        if (onClose) onClose();
      });
    }
  };
  
  // Handle source link press with error handling
  const handleSourcePress = async (url) => {
    if (!url) return;
    
    // Provide haptic feedback (on iOS)
    if (Platform.OS === 'ios') {
      // In a real implementation, we would add haptic feedback here
    }
    
    try {
      // Check if the URL can be opened
      const canOpen = await Linking.canOpenURL(url);
      
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        console.warn(`Cannot open URL: ${url}`);
        
        // If URL can't be opened, still close the modal
        handleClose();
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      
      // If there's an error, still close the modal
      handleClose();
    }
  };
  
  // Process text to add OKR explanation
  const processText = (text) => {
    if (!text) return '';
    
    if (text.includes("OKRs")) {
      return text.replace("OKRs", "OKRs (Objectives and Key Results)");
    }
    return text;
  };
  
  if (!visible || !statistic) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
      accessibilityViewIsModal={true}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          { opacity: fadeAnim }
        ]}
        {...getAccessibilityProps({
          label: "Statistic Details Modal",
          role: "dialog"
        })}
      >
        <Animated.View 
          style={[
            dynamicStyles.statDetailsContent,
            orientation === 'landscape' && dynamicStyles.statDetailsContentLandscape,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(30, 58, 138, 0.6)', 'rgba(30, 64, 175, 0.8)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          />
          
          <ResponsiveText 
            style={styles.statDetailsTitle}
            accessibilityRole="header"
          >
            {processText(statistic.details.title)}
          </ResponsiveText>
          
          <ScrollView 
            style={styles.statDetailsScroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            accessibilityLabel="Statistic details content"
          >
            <View 
              style={styles.statDetailsSection}
              accessible={true}
              accessibilityLabel="Publication"
              accessibilityRole="text"
            >
              <ResponsiveText style={styles.statDetailsSectionTitle}>
                Publication
              </ResponsiveText>
              <ResponsiveText style={styles.statDetailsText}>
                {statistic.details.publication || 'Not specified'}
              </ResponsiveText>
            </View>
            
            <View 
              style={styles.statDetailsSection}
              accessible={true}
              accessibilityLabel="Authors"
              accessibilityRole="text"
            >
              <ResponsiveText style={styles.statDetailsSectionTitle}>
                Authors
              </ResponsiveText>
              <ResponsiveText style={styles.statDetailsText}>
                {statistic.details.authors || 'Not specified'}
              </ResponsiveText>
            </View>
            
            <View 
              style={styles.statDetailsSection}
              accessible={true}
              accessibilityLabel="Date"
              accessibilityRole="text"
            >
              <ResponsiveText style={styles.statDetailsSectionTitle}>
                Date
              </ResponsiveText>
              <ResponsiveText style={styles.statDetailsText}>
                {statistic.details.date || 'Not specified'}
              </ResponsiveText>
            </View>
            
            <View 
              style={styles.statDetailsSection}
              accessible={true}
              accessibilityLabel="Study Details"
              accessibilityRole="text"
            >
              <ResponsiveText style={styles.statDetailsSectionTitle}>
                Study Details
              </ResponsiveText>
              <ResponsiveText style={styles.statDetailsText}>
                {processText(statistic.details.description || 'No details available')}
              </ResponsiveText>
            </View>
            
            {/* Source button - only show if link exists */}
            {statistic.details.link && (
              <TouchableOpacity 
                style={styles.sourceButton}
                onPress={() => handleSourcePress(statistic.details.link)}
                {...getAccessibilityProps({
                  label: "Visit Source",
                  hint: "Opens the source website in your browser",
                  role: "link"
                })}
              >
                <ResponsiveText style={styles.sourceButtonText}>
                  Visit Source
                </ResponsiveText>
                <Ionicons name="open-outline" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
            {...getAccessibilityProps({
              label: "Close",
              hint: "Close this details view",
              role: "button"
            })}
          >
            <ResponsiveText style={styles.closeButtonText}>
              Close
            </ResponsiveText>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.4,
  },
  statDetailsTitle: {
    fontSize: scale(20, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  statDetailsScroll: {
    marginBottom: 20,
  },
  scrollContent: {
    paddingRight: 8,
  },
  statDetailsSection: {
    marginBottom: 16,
  },
  statDetailsSectionTitle: {
    fontSize: scale(16, 0.3),
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  statDetailsText: {
    fontSize: scale(14, 0.3),
    color: '#DDDDDD',
    lineHeight: 22,
  },
  sourceButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sourceButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14, 0.3),
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.3),
    fontWeight: '600',
  }
});

export default StatisticDetailsModal;
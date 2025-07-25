// src/screens/ProfileScreen/AIExplanationModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation hook
import {
  scaleWidth,
  scaleHeight,
  isSmallDevice,
  isTablet,
  spacing,
  fontSizes,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  accessibility,
  meetsContrastRequirements
} from '../../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const AIExplanationModal = ({ 
  visible, 
  theme, 
  isDarkMode, 
  showAIButton, 
  arrowAnimation, 
  onClose,
  navigation: propNavigation, // Receive navigation from props
  userSubscriptionStatus = 'free' // Default to free
}) => {
  // Use navigation hook as a fallback if prop navigation is not provided
  const hookNavigation = useNavigation();
  // Use prop navigation if available, otherwise use hook navigation
  const navigation = propNavigation || hookNavigation;
  
  // Get responsive measurements
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  const isPro = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconPulse = useRef(new Animated.Value(1)).current;
  
  // State for tracking current page
  const [currentPage, setCurrentPage] = useState(0);
  // Total number of pages
  const totalPages = 3;

  // Run animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Fade in and slide up animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Start pulse animation for the icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(iconPulse, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(iconPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animations when modal is hidden
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  // Ensure text colors meet contrast requirements
  const textColor = meetsContrastRequirements(theme.text, '#000000') 
    ? theme.text 
    : isDarkMode ? '#FFFFFF' : '#000000';
  
  const secondaryTextColor = meetsContrastRequirements(theme.textSecondary, '#000000') 
    ? theme.textSecondary 
    : isDarkMode ? '#CCCCCC' : '#666666';

  // Calculate modal dimensions based on device
  const modalWidth = isTablet ? 
    Math.min(scaleWidth(500), width * 0.7) : 
    width * (isLandscape ? 0.7 : 0.85);
    
  // Handle navigation to pricing screen - specifically to AI plans tab
  const handleUpgrade = () => {
    // First close the modal
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
    
    // Use setTimeout to ensure the modal is closed before navigation
    setTimeout(() => {
      // Debug - log navigation availability
      console.log('Navigation available:', !!navigation);
      
      // Check if navigation is available before attempting to use it
      if (navigation) {
        try {
          // Navigate directly to the PricingScreen with the AI plans tab active
          navigation.navigate('PricingScreen', { initialTab: 'subscription' });
          console.log('Navigation to PricingScreen triggered');
        } catch (error) {
          console.error('Navigation error:', error);
          
          // Fallback: Try to navigate without params if the first attempt fails
          try {
            navigation.navigate('PricingScreen');
            console.log('Fallback navigation triggered');
          } catch (fallbackError) {
            console.error('Fallback navigation error:', fallbackError);
          }
        }
      } else {
        console.error('Navigation object is not available');
      }
    }, 300);
  };
  
  // Handle navigation to AI screen
  const handleStartAI = () => {
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
    
    // Use setTimeout to ensure the modal is closed before navigation
    setTimeout(() => {
      if (navigation) {
        try {
          navigation.navigate('AIAssistant');
        } catch (error) {
          console.error('Navigation to AIAssistant error:', error);
        }
      }
    }, 300);
  };
  
  // Handle next page navigation
  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Handle previous page navigation
  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Get CTA button text based on user status and current page
  const getCtaButtonText = () => {
    if (currentPage < totalPages - 1) {
      return "Continue";
    }
    
    return isPro ? "Start Using LifeCompassAI" : "Upgrade to Pro";
  };
  
  // Handle CTA button press
  const handleCtaPress = () => {
    if (currentPage < totalPages - 1) {
      goToNextPage();
    } else {
      // On last page, perform upgrade or start AI
      if (isPro) {
        handleStartAI();
      } else {
        handleUpgrade();
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // We'll handle our own animations
      onRequestClose={onClose}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel="LifeCompassAI explanation"
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            paddingTop: safeSpacing.top,
            paddingBottom: safeSpacing.bottom
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.fullScreenTouchable}
          activeOpacity={1}
          onPress={onClose}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Close modal"
          accessibilityHint="Closes the AI explanation modal"
        >
          <Animated.View 
            style={[
              styles.modalContent, 
              { 
                width: modalWidth,
                transform: [{ translateY: slideAnim }]
              }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
            accessible={true}
            accessibilityRole="dialog"
          >
            {/* Close button - Positioned absolutely in top-right */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
            
            {/* Modal Header with Title */}
            <LinearGradient
              colors={['#3F51B5', '#1A237E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerGradient}
            >
              <Text 
                style={styles.headerTitle}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityRole="header"
              >
                Your Personal AI Strategist
              </Text>
            </LinearGradient>
            
            {/* AI Icon - Positioned correctly to avoid overlap */}
            <View style={styles.iconContainer}>
              <Animated.View 
                style={[
                  styles.iconCircle,
                  { transform: [{ scale: iconPulse }] }
                ]}
              >
                <Ionicons 
                  name="sparkles" 
                  size={scaleWidth(35)} 
                  color="#FFD700" 
                />
              </Animated.View>
            </View>
            
            {/* Content Section */}
            <View style={styles.contentContainer}>
              {/* Page Content - conditionally render based on currentPage */}
              {currentPage === 0 && (
                <View style={styles.pageContent}>
                  <Text style={styles.pageTitle}>
                    Achieve your goals with personalized AI guidance
                  </Text>
                  
                  <View style={styles.featuresContainer}>
                    {renderPremiumFeature(
                      "Smart Strategy", 
                      "Creates custom plans based on your unique goals and life direction",
                      "bulb-outline"
                    )}
                    
                    <View style={styles.infoBox}>
                      <Text style={styles.infoBoxText}>
                        LifeCompassAI helps ensure your daily actions align with your long-term vision
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              {currentPage === 1 && (
                <View style={styles.pageContent}>
                  <Text style={styles.pageTitle}>
                    Personalized to your unique context
                  </Text>
                  
                  <View style={styles.uploadContainer}>
                    <Text style={styles.uploadTitle}>
                      Upload personal context:
                    </Text>
                    
                    <View style={styles.uploadItemsContainer}>
                      {renderUploadItem("document-text", "Resumes & CVs")}
                      {renderUploadItem("person", "Personality assessments")}
                      {renderUploadItem("list", "Life goals & priorities")}
                      {renderUploadItem("document", "Any helpful documents")}
                    </View>
                    
                    <Text style={styles.uploadFootnote}>
                      The more context you provide, the more tailored your guidance will be
                    </Text>
                  </View>
                </View>
              )}
              
              {currentPage === 2 && (
                <View style={styles.pageContent}>
                  <Text style={styles.pageTitle}>
                    From strategy to action, instantly
                  </Text>
                  
                  <View style={styles.featuresContainer}>
                    {renderPremiumFeature(
                      "Implementation Power", 
                      "Creates goals, projects, and tasks directly in your app with one tap",
                      "rocket-outline"
                    )}
                    
                    {renderPremiumFeature(
                      "Strategic Planning", 
                      "Breaks down complex objectives into manageable steps",
                      "git-branch-outline"
                    )}
                    
                    <View style={styles.infoBox}>
                      <Text style={[styles.infoBoxText, styles.italicText]}>
                        Save hours of planning time while getting expert guidance
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              {/* Pagination Dots */}
              <View style={styles.paginationContainer}>
                {Array(totalPages).fill(0).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      currentPage === index ? styles.activeDot : null
                    ]}
                  />
                ))}
              </View>
              
              {/* Navigation and CTA Buttons */}
              <View style={styles.buttonsContainer}>
                {/* Back Button - Only show if not on first page */}
                {currentPage > 0 ? (
                  <TouchableOpacity
                    style={styles.backButton}
                    onPress={goToPrevPage}
                  >
                    <Text style={styles.backButtonText}>
                      Back
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.buttonSpacer} />
                )}
                
                {/* Primary CTA Button */}
                <TouchableOpacity
                  style={[
                    styles.ctaButton,
                    currentPage === totalPages - 1 && !isPro ? styles.upgradeButton : null
                  ]}
                  onPress={handleCtaPress}
                >
                  <Text style={styles.ctaButtonText}>
                    {getCtaButtonText()}
                  </Text>
                  <Ionicons 
                    name={currentPage < totalPages - 1 ? "arrow-forward" : (isPro ? "sparkles" : "rocket")} 
                    size={18} 
                    color="#FFFFFF" 
                    style={styles.ctaButtonIcon} 
                  />
                </TouchableOpacity>
                
                {/* Empty View instead of Skip button */}
                <View style={styles.buttonSpacer} />
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
        
        {/* Arrow pointing to the floating button - only show if AI button is visible, user is Pro, and on last page */}
        {showAIButton && isPro && currentPage === totalPages - 1 && (
          <Animated.View 
            style={[
              styles.arrowContainer,
              {
                transform: [
                  { translateY: arrowAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -15]
                    }) 
                  }
                ]
              }
            ]}
            accessible={true}
            accessibilityLabel="Click here to start prompt"
          >
            <Ionicons name="arrow-down" size={scaleWidth(40)} color={theme.primary} />
            <Text style={styles.arrowText}>
              Click here to start
            </Text>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );

  // Helper function to render premium features
  function renderPremiumFeature(title, description, iconName) {
    return (
      <View style={styles.featureRow}>
        <View style={styles.featureIconContainer}>
          <Ionicons 
            name={iconName} 
            size={scaleWidth(20)} 
            color={theme.primary} 
          />
        </View>
        
        <View style={styles.featureTextContainer}>
          <Text style={styles.featureTitle}>
            {title}
          </Text>
          <Text style={styles.featureDescription}>
            {description}
          </Text>
        </View>
      </View>
    );
  }
  
  // Helper function to render upload items
  function renderUploadItem(iconName, text) {
    return (
      <View style={styles.uploadItem}>
        <Ionicons name={iconName} size={16} color={theme.primary} style={styles.uploadItemIcon} />
        <Text style={styles.uploadItemText}>{text}</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
    maxHeight: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 5,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 60, // Extra padding for the icon
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  iconContainer: {
    position: 'absolute',
    top: 65, // Positioned to sit half in the header, half out
    left: '50%',
    marginLeft: -35, // Half of circle width
    zIndex: 5,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  contentContainer: {
    backgroundColor: '#000000',
    paddingTop: 40, // Space for the icon that overlaps
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  pageContent: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 20,
  },
  featureRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(63, 81, 181, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  featureDescription: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    width: '100%',
  },
  infoBoxText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 20,
  },
  italicText: {
    fontStyle: 'italic',
  },
  uploadContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    width: '100%',
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  uploadItemsContainer: {
    marginTop: 5,
  },
  uploadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  uploadItemIcon: {
    marginRight: 8,
  },
  uploadItemText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  uploadFootnote: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 15,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#3F51B5',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  backButton: {
    padding: 10,
    minWidth: 80,
    alignItems: 'flex-start',
  },
  backButtonText: {
    color: '#3F51B5',
    fontSize: 14,
    fontWeight: '600',
  },
  ctaButton: {
    backgroundColor: '#3F51B5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minWidth: 140,
  },
  upgradeButton: {
    backgroundColor: '#F9A826', // Orange for upgrade button
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ctaButtonIcon: {
    marginLeft: 8,
  },
  buttonSpacer: {
    width: 80, // Same width as back button for balance
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 150,
    right: 0,
    alignItems: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    width: 100,
  },
});

export default AIExplanationModal;
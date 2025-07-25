// src/screens/Onboarding/components/screens/WhyItWorksScreen.js
// Enhanced with accessibility, responsive text, and performance optimizations
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Animated,
  ScrollView,
  StyleSheet,
  Dimensions,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale } from '../../styles/onboardingStyles';
import ProgressIndicator from '../ui/ProgressIndicator';
import StatisticsCarousel from '../ui/StatisticsCarousel';
import StatisticDetailsModal from '../modals/StatisticDetailsModal';
import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../../utils/deviceUtils';
import { ensureContrast } from '../../utils/contrastUtils';

const { width } = Dimensions.get('window');

/**
 * WhyItWorksScreen - Shows research and statistics supporting the approach
 * Enhanced with accessibility, responsive text, and performance optimizations
 * 
 * @param {number} currentScreen - Current screen index
 * @param {function} onBack - Function to go back to previous screen
 * @param {function} onComplete - Function to complete onboarding
 * @param {array} statistics - Array of statistics to display
 */
const WhyItWorksScreen = ({ 
  currentScreen,
  onBack,
  onComplete,
  statistics
}) => {
  // Get orientation for responsive layout
  const { orientation } = useOrientation();
  
  // Detect if device is low-end for performance optimizations
  const isLowEnd = isLowEndDevice();
  
  // State for statistics
  const [currentStatIndex, setCurrentStatIndex] = useState(0);
  const [showStatDetails, setShowStatDetails] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Animation values
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const statSlideAnim = useRef(new Animated.Value(0)).current;
  
  // Ref to the ScrollView
  const scrollViewRef = useRef(null);
  
  // Animate entrance on mount - optimized for performance
  useEffect(() => {
    if (isLowEnd) {
      // Simplified animation for low-end devices
      titleOpacity.setValue(1);
      contentOpacity.setValue(1);
      cardScale.setValue(1);
      buttonOpacity.setValue(1);
    } else {
      // Full animation sequence for modern devices
      Animated.sequence([
        // Title fade in
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Content fade in
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Card scale up
        Animated.spring(cardScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        // Button fade in
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLowEnd]);
  
  // Go to next statistic with animation
  const advanceToNextStat = () => {
    // Skip animation on low-end devices
    if (isLowEnd) {
      setCurrentStatIndex((prevIndex) => (prevIndex + 1) % statistics.length);
      return;
    }
    
    // Animate transition on modern devices
    Animated.timing(statSlideAnim, {
      toValue: -width,
      duration: 300,
      useNativeDriver: true
    }).start(() => {
      setCurrentStatIndex((prevIndex) => (prevIndex + 1) % statistics.length);
      statSlideAnim.setValue(width);
      
      // Animate slide in
      Animated.timing(statSlideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start();
    });
  };
  
  // Open statistic source URL - with accessibility enhancements
  const openSourceUrl = async (url) => {
    if (url) {
      try {
        // Check if the URL can be opened
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          // Provide haptic feedback on iOS
          if (Platform.OS === 'ios') {
            // In a real implementation, we would add haptic feedback here
          }
          
          // Open the URL
          await Linking.openURL(url);
          
          // Provide accessibility feedback
          if (Platform.OS === 'ios') {
            // Announce URL opening to screen readers
            // This would use AccessibilityInfo.announceForAccessibility in a real implementation
          }
        } else {
          console.warn(`Cannot open URL: ${url}`);
          // Provide feedback to user
          if (Platform.OS === 'ios') {
            // Announce error to screen readers
            // This would use AccessibilityInfo.announceForAccessibility in a real implementation
          }
        }
      } catch (error) {
        console.error('Error opening URL:', error);
      }
    }
  };
  
  // Process text to add OKR explanation for accessibility
  const processStatText = (text) => {
    // Check if text contains "OKRs" and add explanation if needed
    if (text && text.includes("OKRs")) {
      return text.replace("OKRs", "OKRs (Objectives and Key Results)");
    }
    return text;
  };
  
  // Handle completion with animation and feedback
  const handleCompletion = () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    
    // Provide haptic feedback
    if (Platform.OS === 'ios') {
      // In a real implementation, we would add haptic feedback here
    }
    
    // Skip the Alert dialog and directly call onComplete after animation
    if (onComplete) {
      // Add a brief delay for visual feedback
      setTimeout(() => {
        onComplete();
      }, 300);
    }
  };
  
  return (
    <View 
      style={[
        styles.container,
        orientation === 'landscape' && styles.containerLandscape
      ]}
      accessible={true}
      accessibilityLabel="Why It Works Screen"
      accessibilityRole="none"
    >
      {/* Professional gradient background */}
      <LinearGradient
        colors={['#0c1425', '#000000']}
        style={styles.gradientBackground}
      />
      
      {/* Progress indicator */}
      <View style={styles.progressWrapper}>
        <ProgressIndicator currentScreen={currentScreen} totalScreens={5} />
      </View>
      
      {/* Page Title with animation */}
      <Animated.View 
        style={[
          styles.titleContainer, 
          { opacity: titleOpacity },
          orientation === 'landscape' && styles.titleContainerLandscape
        ]}
        accessible={true}
        accessibilityRole="header"
      >
        <ResponsiveText style={styles.pageTitle}>Why It Works</ResponsiveText>
        <ResponsiveText style={styles.pageSubtitle}>Research-backed methodologies</ResponsiveText>
      </Animated.View>
      
      {/* Main content ScrollView */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          orientation === 'landscape' && styles.scrollContentLandscape
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.contentContainer, 
            { opacity: contentOpacity },
            orientation === 'landscape' && styles.contentContainerLandscape
          ]}
        >
          <ResponsiveText 
            style={styles.sectionTitle}
            accessibilityRole="header"
          >
            Proven Results
          </ResponsiveText>
          <ResponsiveText 
            style={styles.sectionDescription}
            numberOfLines={4}
            ellipsizeMode="tail"
          >
            LifeCompass is built on scientific research and proven methodologies 
            that have consistently demonstrated positive outcomes:
          </ResponsiveText>
          
          {/* Statistics Carousel - Using the improved component */}
          <Animated.View 
            style={[
              styles.carouselWrapper,
              { transform: [{ scale: cardScale }] },
              orientation === 'landscape' && styles.carouselWrapperLandscape
            ]}
            accessible={true}
            accessibilityLabel="Research statistics carousel"
            accessibilityHint="Swipe or tap to view more research statistics"
            accessibilityRole="adjustable"
          >
            <StatisticsCarousel
              statistics={statistics.map(stat => ({
                ...stat,
                text: processStatText(stat.text) // Process text for accessibility
              }))}
              currentIndex={currentStatIndex}
              animValue={statSlideAnim}
              onAdvance={advanceToNextStat}
              onInfoPress={() => setShowStatDetails(true)}
            />
          </Animated.View>
          
          {/* Additional Benefits - With improved accessibility */}
          <View 
            style={[
              styles.benefitsContainer,
              orientation === 'landscape' && styles.benefitsContainerLandscape
            ]}
            accessible={true}
            accessibilityLabel="Key benefits"
            accessibilityRole="list"
          >
            <View 
              style={styles.benefitRow}
              accessibilityRole="listitem"
            >
              <View 
                style={styles.benefitItem}
                accessible={true}
                accessibilityLabel="42% Higher achievement rate"
              >
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="trending-up" size={24} color="#2563eb" />
                </View>
                <ResponsiveText style={styles.benefitTitle}>42%</ResponsiveText>
                <ResponsiveText style={styles.benefitText}>Higher achievement rate</ResponsiveText>
              </View>
              
              <View 
                style={styles.benefitItem}
                accessible={true}
                accessibilityLabel="3.6 hours saved weekly on average"
              >
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="time" size={24} color="#9333ea" />
                </View>
                <ResponsiveText style={styles.benefitTitle}>3.6 hrs</ResponsiveText>
                <ResponsiveText style={styles.benefitText}>Saved weekly on average</ResponsiveText>
              </View>
            </View>
            
            <View 
              style={styles.benefitRow}
              accessibilityRole="listitem"
            >
              <View 
                style={styles.benefitItem}
                accessible={true}
                accessibilityLabel="60 to 75% Project completion rate"
              >
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="ribbon" size={24} color="#16a34a" />
                </View>
                <ResponsiveText style={styles.benefitTitle}>60-75%</ResponsiveText>
                <ResponsiveText style={styles.benefitText}>Project completion rate</ResponsiveText>
              </View>
              
              <View 
                style={styles.benefitItem}
                accessible={true}
                accessibilityLabel="37% Productivity increase"
              >
                <View style={styles.benefitIconContainer}>
                  <Ionicons name="pulse" size={24} color="#db2777" />
                </View>
                <ResponsiveText style={styles.benefitTitle}>37%</ResponsiveText>
                <ResponsiveText style={styles.benefitText}>Productivity increase</ResponsiveText>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Action Buttons with animation */}
      <Animated.View 
        style={[
          styles.actionContainer, 
          { opacity: buttonOpacity },
          orientation === 'landscape' && styles.actionContainerLandscape
        ]}
      >
        {/* Back button on left */}
        <TouchableOpacity 
          style={[
            styles.backButton,
            isCompleting && styles.disabledButton
          ]}
          onPress={onBack}
          disabled={isCompleting}
          {...getAccessibilityProps({
            label: "Back",
            hint: "Return to the previous screen",
            role: "button",
            isDisabled: isCompleting
          })}
        >
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          <ResponsiveText style={styles.backButtonText}>Back</ResponsiveText>
        </TouchableOpacity>
        
        {/* Center container for primary button */}
        <View style={styles.centerButtonContainer}>
          <TouchableOpacity 
            style={[
              styles.primaryButton,
              isCompleting && styles.disabledButton
            ]}
            onPress={handleCompletion}
            disabled={isCompleting}
            {...getAccessibilityProps({
              label: isCompleting ? "Setting Up" : "Complete Setup",
              hint: "Finish onboarding and set up your system",
              role: "button",
              isDisabled: isCompleting,
              isBusy: isCompleting
            })}
          >
            <ResponsiveText style={styles.primaryButtonText}>
              {isCompleting ? 'Setting Up...' : 'Complete Setup'}
            </ResponsiveText>
            <Ionicons 
              name={isCompleting ? "hourglass-outline" : "checkmark-circle"} 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
        
        {/* Empty view for spacing */}
        <View style={styles.emptySpacerRight} />
      </Animated.View>
      
      {/* Statistic Details Modal - Enhanced with accessibility */}
      <StatisticDetailsModal 
        visible={showStatDetails}
        statistic={statistics[currentStatIndex]}
        onClose={() => setShowStatDetails(false)}
        onSourcePress={openSourceUrl}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLandscape: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  progressWrapper: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  titleContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  titleContainerLandscape: {
    width: '100%',
    marginTop: 20,
  },
  pageTitle: {
    fontSize: scale(28, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: scale(16, 0.3),
    color: '#AAAAAA',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  scrollContentLandscape: {
    paddingBottom: 80,
  },
  contentContainer: {
    paddingTop: 16,
  },
  contentContainerLandscape: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: scale(18, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: scale(14, 0.3),
    color: '#BBBBBB',
    marginBottom: 20,
    lineHeight: 22,
  },
  carouselWrapper: {
    marginBottom: 24,
  },
  carouselWrapperLandscape: {
    width: '90%',
  },
  benefitsContainer: {
    marginBottom: 16,
  },
  benefitsContainerLandscape: {
    width: '90%',
  },
  benefitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  benefitItem: {
    width: '48%',
    backgroundColor: 'rgba(20, 20, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  benefitIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitTitle: {
    fontSize: scale(20, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: scale(12, 0.3),
    color: '#AAAAAA',
    textAlign: 'center',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionContainerLandscape: {
    paddingHorizontal: 40,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.2),
    fontWeight: '600',
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    color: '#FFFFFF',
    marginLeft: 8,
    fontSize: scale(14, 0.3),
  },
  disabledButton: {
    opacity: 0.6,
  },
  emptySpacerRight: {
    width: 80, // Approximate width of back button to balance layout
  },
});

export default WhyItWorksScreen;
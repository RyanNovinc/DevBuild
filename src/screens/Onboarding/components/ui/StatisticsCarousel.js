// src/screens/Onboarding/components/ui/StatisticsCarousel.js
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  TouchableOpacity, 
  Animated, 
  StyleSheet,
  Dimensions,
  AccessibilityInfo,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { scale } from '../../styles/onboardingStyles';
import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../../utils/deviceUtils';

/**
 * StatisticsCarousel - Displays statistics in an accessible, responsive carousel
 * Enhanced with accessibility, responsive text, and performance optimizations
 * 
 * @param {array} statistics - Array of statistic objects
 * @param {number} currentIndex - Current statistic index
 * @param {object} animValue - Animated value for slide animation
 * @param {function} onAdvance - Function to advance to next statistic
 * @param {function} onInfoPress - Function to show statistic details
 */
const StatisticsCarousel = ({ 
  statistics, 
  currentIndex, 
  animValue,
  onAdvance, 
  onInfoPress 
}) => {
  // Get current statistic
  const currentStat = statistics[currentIndex];
  
  // Check if device is low-end
  const isLowEnd = isLowEndDevice();
  
  // Get orientation for responsive layout
  const { orientation, dimensions } = useOrientation();
  
  // Get screen dimensions
  const { width } = dimensions || Dimensions.get('window');
  
  // Animation reference for auto-advance
  const autoAdvanceTimer = useRef(null);
  
  // Reference for swipe detection
  const touchStartX = useRef(0);
  const isSwiping = useRef(false);
  
  // Set up accessibility announcement for screen readers
  useEffect(() => {
    if (Platform.OS === 'ios') {
      // In a real implementation, this would announce the new statistic
      // when it changes, using AccessibilityInfo.announceForAccessibility
    }
    
    // Clean up any existing auto-advance timer
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
    }
    
    // Auto-advance if not on a low-end device (to save resources on slower devices)
    if (!isLowEnd) {
      autoAdvanceTimer.current = setTimeout(() => {
        onAdvance();
      }, 8000); // Auto-advance after 8 seconds
    }
    
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, [currentIndex, isLowEnd, onAdvance]);
  
  // Process text to add OKR explanation for accessibility
  const processStatText = (text) => {
    if (!text) return '';
    
    // Check if text contains "OKRs" and add explanation if needed
    if (text.includes("OKRs")) {
      return text.replace("OKRs", "OKRs (Objectives and Key Results)");
    }
    return text;
  };
  
  // Swipe handlers for manual navigation
  const handleTouchStart = (event) => {
    touchStartX.current = event.nativeEvent.pageX;
    isSwiping.current = true;
  };
  
  const handleTouchMove = (event) => {
    if (!isSwiping.current) return;
    
    const currentX = event.nativeEvent.pageX;
    const diff = currentX - touchStartX.current;
    
    // If significant horizontal movement, consider it a swipe
    if (Math.abs(diff) > 50) {
      isSwiping.current = false;
      
      if (diff < 0) {
        // Swipe left - advance to next
        onAdvance();
      } else {
        // Swipe right - go to previous (if implemented)
        // For now, we'll just do nothing on right swipe
      }
    }
  };
  
  const handleTouchEnd = () => {
    isSwiping.current = false;
  };
  
  // Handle info button press with accessibility feedback
  const handleInfoPress = (e) => {
    e.stopPropagation(); // Prevent triggering the parent onPress
    
    // Provide haptic feedback (on iOS)
    if (Platform.OS === 'ios') {
      // In a real implementation, we would add haptic feedback here
    }
    
    onInfoPress();
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.carouselContainer,
        orientation === 'landscape' && styles.carouselContainerLandscape
      ]}
      activeOpacity={0.9}
      onPress={onAdvance}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...getAccessibilityProps({
        label: `Research statistic ${currentIndex + 1} of ${statistics.length}`,
        hint: "Tap to see the next statistic or swipe left",
        role: "button"
      })}
    >
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.15)', 'rgba(30, 64, 175, 0.25)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.carouselBackground}
      />
      
      {/* Main content */}
      <View style={styles.cardContent}>
        {/* Animated content */}
        <Animated.View 
          style={[
            styles.statisticContent,
            { transform: [{ translateX: animValue }] }
          ]}
        >
          <View 
            style={styles.statisticHeader}
            accessible={true}
            accessibilityLabel="Research statistic"
            accessibilityRole="header"
          >
            <View style={styles.statisticBadge}>
              <ResponsiveText style={styles.statisticBadgeText}>
                RESEARCH
              </ResponsiveText>
            </View>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={handleInfoPress}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
              {...getAccessibilityProps({
                label: "More information",
                hint: "View detailed information about this statistic",
                role: "button"
              })}
            >
              <Ionicons name="information-circle" size={22} color="#2563eb" />
            </TouchableOpacity>
          </View>
          
          <ResponsiveText 
            style={styles.statisticText}
            accessibilityRole="text"
          >
            {processStatText(currentStat.text)}
          </ResponsiveText>
          
          <View 
            style={styles.statisticFooter}
            accessible={true}
            accessibilityLabel={`Source: ${currentStat.source}`}
            accessibilityRole="text"
          >
            <ResponsiveText style={styles.statisticSource}>
              Source: {currentStat.source}
            </ResponsiveText>
          </View>
        </Animated.View>
      </View>
      
      {/* Navigation indicators */}
      <View 
        style={styles.navigationContainer}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {/* Page dots */}
        <View style={styles.dotsContainer}>
          {statistics.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot,
                currentIndex === index ? styles.activeDot : {}
              ]} 
            />
          ))}
        </View>
        
        {/* Navigation prompt */}
        <View style={styles.navPromptContainer}>
          <ResponsiveText style={styles.navPromptText}>
            Tap for more research
          </ResponsiveText>
          <Ionicons name="arrow-forward" size={16} color="#60A5FA" style={styles.navPromptIcon} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  carouselContainerLandscape: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  carouselBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  cardContent: {
    padding: 20,
  },
  statisticContent: {
    width: '100%',
  },
  statisticHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statisticBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.4)',
  },
  statisticBadgeText: {
    color: '#60A5FA',
    fontSize: scale(12, 0.3),
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  infoButton: {
    padding: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 14,
    height: 28,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statisticText: {
    fontSize: scale(16, 0.3),
    color: '#FFFFFF',
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 16,
  },
  statisticFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  statisticSource: {
    fontSize: scale(13, 0.3),
    color: '#AAAAAA',
    fontStyle: 'italic',
  },
  navigationContainer: {
    paddingBottom: 16,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#2563eb',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  navPromptContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  navPromptText: {
    fontSize: scale(13, 0.3),
    color: '#60A5FA',
    marginRight: 6,
  },
  navPromptIcon: {
    marginLeft: 2,
  }
});

export default StatisticsCarousel;
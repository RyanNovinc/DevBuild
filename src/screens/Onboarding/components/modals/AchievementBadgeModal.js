// src/screens/Onboarding/components/modals/AchievementBadgeModal.js
import React, { useRef, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  Platform,
  AccessibilityInfo
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Confetti from '../Confetti';
import { scale } from '../../styles/onboardingStyles';
import ResponsiveText from '../ResponsiveText';
import { getAccessibilityProps } from '../../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../../utils/deviceUtils';
import { t } from '../../utils/i18n';

// Get initial dimensions for static styles
const INITIAL_WINDOW = Dimensions.get('window');

/**
 * Enhanced AchievementBadgeModal - Professional achievement badge upon onboarding completion
 * Improved with accessibility, responsive text, and performance optimizations
 * 
 * @param {boolean} visible - Whether the modal is visible
 * @param {boolean} tokensClaimed - Whether tokens have been claimed
 * @param {function} onClaimTokens - Function to handle claiming tokens
 * @param {function} onContinue - Function to handle continuing
 */
const AchievementBadgeModal = ({ 
  visible, 
  tokensClaimed, 
  onClaimTokens, 
  onContinue 
}) => {
  // Use orientation hook for responsive layout
  const { orientation, dimensions } = useOrientation();
  
  // Check if device is low-end
  const isLowEnd = isLowEndDevice();
  
  // Get current dimensions for responsive sizing
  const { width, height } = dimensions || INITIAL_WINDOW;
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const badgeShineAnim = useRef(new Animated.Value(0)).current;
  const tokenCountAnim = useRef(new Animated.Value(0)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const buttonsOpacityAnim = useRef(new Animated.Value(0)).current;
  const systemCreatedAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Animation references for cleanup
  const glowAnimationRef = useRef(null);
  
  // State for the token count display
  const [displayedTokenCount, setDisplayedTokenCount] = useState("0");
  
  // Confetti state
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSystemCreated, setShowSystemCreated] = useState(false);
  
  // Dynamic styles based on current dimensions
  const dynamicStyles = {
    badgeCardContainer: {
      width: width * 0.85,
      maxWidth: 360,
      borderRadius: 24,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.5,
          shadowRadius: 16,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    badgeCardContainerLandscape: {
      maxWidth: 420,
    }
  };
  
  // Set up accessibility announcement for screen readers
  useEffect(() => {
    if (visible && Platform.OS === 'ios') {
      // Announce achievement to screen readers
      // In a real implementation, this would use:
      // AccessibilityInfo.announceForAccessibility("Achievement unlocked: Strategic Planner");
    }
  }, [visible]);
  
  // Run entrance animation when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      rotateAnim.setValue(0);
      badgeShineAnim.setValue(0);
      tokenCountAnim.setValue(0);
      textOpacityAnim.setValue(0);
      buttonsOpacityAnim.setValue(0);
      systemCreatedAnim.setValue(0);
      glowAnim.setValue(0);
      setDisplayedTokenCount("0");
      
      // Optimize animations for low-end devices
      if (isLowEnd) {
        // Simplified animation sequence for low-end devices
        Animated.parallel([
          // Fade in backdrop immediately
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          // Scale badge immediately
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start(() => {
          // Set all other animations to their end values
          rotateAnim.setValue(1);
          badgeShineAnim.setValue(1);
          glowAnim.setValue(1);
          systemCreatedAnim.setValue(1);
          textOpacityAnim.setValue(1);
          buttonsOpacityAnim.setValue(1);
          
          // Start glow animation
          startGlowAnimation();
          
          // Show confetti and system created message
          setShowConfetti(true);
          setShowSystemCreated(true);
        });
      } else {
        // Full animation sequence for modern devices
        Animated.sequence([
          // Fade in backdrop
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          
          // Scale and rotate badge
          Animated.parallel([
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 6,
              tension: 40,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 700,
              easing: Easing.elastic(1),
              useNativeDriver: true,
            })
          ]),
          
          // Shine effect
          Animated.timing(badgeShineAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          
          // Start subtle glow animation
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          
          // System created message fade in
          Animated.timing(systemCreatedAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          
          // Fade in text
          Animated.timing(textOpacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          
          // Fade in buttons
          Animated.timing(buttonsOpacityAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
        
        // Start confetti once (not using the key system to avoid rerenders)
        setShowConfetti(true);
        
        // Show system created message
        setShowSystemCreated(true);
        
        // Start subtle pulsing glow animation
        startGlowAnimation();
      }
    } else {
      setShowConfetti(false);
      setShowSystemCreated(false);
      setDisplayedTokenCount("0"); // Reset token count when modal closes
      
      // Clean up animations
      if (glowAnimationRef.current) {
        glowAnimationRef.current.stop();
        glowAnimationRef.current = null;
      }
    }
    
    // Clean up animations on unmount
    return () => {
      if (glowAnimationRef.current) {
        glowAnimationRef.current.stop();
        glowAnimationRef.current = null;
      }
    };
  }, [visible, isLowEnd]);
  
  // Animate token count when tokens are claimed
  useEffect(() => {
    if (tokensClaimed) {
      // Reset to 0 first
      tokenCountAnim.setValue(0);
      setDisplayedTokenCount("0");
      
      // Listen to animation value changes
      const listener = tokenCountAnim.addListener(({value}) => {
        // Round to nearest integer and update the displayed count
        const roundedValue = Math.round(value);
        setDisplayedTokenCount(roundedValue.toString());
      });
      
      // Start the animation - simplified for low-end devices
      if (isLowEnd) {
        // Faster animation for low-end devices
        Animated.timing(tokenCountAnim, {
          toValue: 100,
          duration: 1000, // 1 second for low-end devices
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      } else {
        // Full animation for modern devices
        Animated.timing(tokenCountAnim, {
          toValue: 100,
          duration: 1500, // 1.5 seconds for modern devices
          easing: Easing.linear,
          useNativeDriver: true,
        }).start();
      }
      
      // Clean up listener when component unmounts
      return () => {
        tokenCountAnim.removeListener(listener);
      };
    }
  }, [tokensClaimed, isLowEnd]);
  
  // Continuous pulsing glow animation - updated to be more subtle and performant
  const startGlowAnimation = () => {
    // Clean up any existing animation
    if (glowAnimationRef.current) {
      glowAnimationRef.current.stop();
    }
    
    // Optimize for low-end devices
    if (isLowEnd) {
      // Simpler animation with fewer cycles for low-end devices
      glowAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1.05, // Very subtle pulse for low-end devices
            duration: 3000, // Slower animation
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 3000, // Slower animation
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        { iterations: 3 } // Limit iterations on low-end devices
      );
    } else {
      // Full animation for modern devices
      glowAnimationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1.1, // Reduced from 1.2 to 1.1 for subtlety
            duration: 2500, // Slower animation
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 2500, // Slower animation
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    }
    
    // Start the animation
    glowAnimationRef.current.start();
  };
  
  // Badge rotation and shine transforms
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const shineInterpolation = badgeShineAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['-100%', '100%', '100%']
  });
  
  // Handle claiming tokens with accessibility feedback
  const handleClaimTokens = () => {
    if (onClaimTokens) {
      // Provide haptic feedback (on iOS)
      if (Platform.OS === 'ios') {
        // In a real implementation, we would add haptic feedback here
      }
      
      // Announce token claim to screen readers
      if (Platform.OS === 'ios') {
        // In a real implementation, this would use:
        // AccessibilityInfo.announceForAccessibility("100 AI tokens claimed");
      }
      
      onClaimTokens();
    }
  };
  
  // Handle continue with accessibility feedback
  const handleContinue = () => {
    if (onContinue) {
      // Provide haptic feedback (on iOS)
      if (Platform.OS === 'ios') {
        // In a real implementation, we would add haptic feedback here
      }
      
      onContinue();
    }
  };
  
  if (!visible) return null;
  
  // Define confetti colors explicitly to avoid undefined issue
  const confettiColors = ['#2563eb', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd', '#FFD700', '#FF9800'];
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      accessibilityViewIsModal={true}
    >
      <Animated.View 
        style={[
          styles.modalContainer,
          { opacity: opacityAnim }
        ]}
        {...getAccessibilityProps({
          label: "Achievement Badge Modal",
          role: "alert"
        })}
      >
        {/* Use the fixed Confetti component with explicit colors - no key */}
        <Confetti 
          active={showConfetti}
          colors={confettiColors}
          type="fireworks"
          count={isLowEnd ? 30 : 60} // Reduced count for low-end devices
          duration={3500}
        />
        
        {/* System Created Message */}
        {showSystemCreated && (
          <Animated.View 
            style={[
              styles.systemCreatedContainer,
              orientation === 'landscape' && styles.systemCreatedContainerLandscape,
              { opacity: systemCreatedAnim }
            ]}
            {...getAccessibilityProps({
              label: "Strategic Framework Created Successfully",
              role: "text"
            })}
          >
            <View style={styles.systemCreatedContent}>
              <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
              <ResponsiveText style={styles.systemCreatedText}>
                Strategic Framework Created Successfully
              </ResponsiveText>
            </View>
          </Animated.View>
        )}
        
        {/* Blurred background card */}
        <Animated.View
          style={[
            dynamicStyles.badgeCardContainer,
            orientation === 'landscape' && dynamicStyles.badgeCardContainerLandscape,
            { 
              transform: [
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <BlurView 
            intensity={40} 
            tint="dark" 
            style={styles.blurContainer}
            accessibilityLabel="Achievement Badge"
          >
            <LinearGradient
              colors={['rgba(37, 99, 235, 0.2)', 'rgba(30, 58, 138, 0.4)']}
              style={styles.gradientBackground}
            />
            
            {/* Badge with animations - IMPROVED DESIGN */}
            <View 
              style={styles.badgeSection}
              accessible={true}
              accessibilityLabel="Achievement Badge"
              accessibilityRole="image"
            >
              {/* Animated glow effect - reduced opacity for subtlety */}
              <Animated.View
                style={[
                  styles.badgeGlow,
                  {
                    opacity: Animated.multiply(glowAnim, 0.2), // Reduced opacity
                    transform: [{ scale: glowAnim }]
                  }
                ]}
              />
              
              {/* Badge content */}
              <Animated.View
                style={[
                  styles.badgeCircleOuter,
                  { 
                    transform: [
                      { rotate: rotateInterpolation }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#3b82f6', '#1e3a8a']}
                  style={styles.badgeGradient}
                >
                  <Ionicons name="shield-checkmark" size={76} color="#FFFFFF" />
                  
                  {/* Shine effect - more transparent */}
                  <Animated.View 
                    style={[
                      styles.badgeShine,
                      {
                        transform: [
                          { translateX: shineInterpolation }
                        ]
                      }
                    ]}
                  />
                </LinearGradient>
              </Animated.View>
            </View>
            
            {/* Badge title and description */}
            <Animated.View 
              style={[
                styles.badgeTextContainer,
                { opacity: textOpacityAnim }
              ]}
            >
              <ResponsiveText 
                style={styles.achievementLabel}
                accessibilityRole="text"
              >
                ACHIEVEMENT UNLOCKED
              </ResponsiveText>
              <ResponsiveText 
                style={styles.badgeTitle}
                accessibilityRole="header"
              >
                Strategic Planner
              </ResponsiveText>
              <ResponsiveText 
                style={styles.badgeDescription}
                accessibilityRole="text"
              >
                You've established your strategic framework to turn vision into achievable goals
              </ResponsiveText>
            </Animated.View>
            
            {/* Reward or Claim Button */}
            <Animated.View 
              style={[
                styles.rewardContainer,
                { opacity: buttonsOpacityAnim }
              ]}
            >
              {!tokensClaimed ? (
                <TouchableOpacity 
                  style={styles.claimButton}
                  onPress={handleClaimTokens}
                  activeOpacity={0.8}
                  {...getAccessibilityProps({
                    label: "Claim 100 AI Tokens",
                    hint: "Tap to claim your reward tokens",
                    role: "button"
                  })}
                >
                  <View style={styles.claimButtonInner}>
                    <LinearGradient
                      colors={['#2563eb', '#1e40af']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.claimButtonGradient}
                    />
                    <View style={styles.claimButtonContent}>
                      <Ionicons name="sparkles" size={22} color="#FFFFFF" style={styles.claimIcon} />
                      <ResponsiveText style={styles.claimButtonText}>
                        Claim 100 AI Tokens
                      </ResponsiveText>
                    </View>
                  </View>
                </TouchableOpacity>
              ) : (
                <View 
                  style={styles.tokensContainer}
                  accessible={true}
                  accessibilityLabel={`${displayedTokenCount} AI Tokens claimed for strategic planning`}
                  accessibilityRole="text"
                >
                  <View 
                    style={styles.tokenIconLarge}
                    accessibilityLabel="Tokens icon"
                    accessibilityRole="image"
                  >
                    <Ionicons name="sparkles" size={30} color="#FFD700" />
                  </View>
                  
                  <View style={styles.tokenTextContainer}>
                    <View style={styles.tokenCountRow}>
                      <ResponsiveText style={styles.tokenPrefix}>+</ResponsiveText>
                      {/* Use the state value directly instead of the animated interpolation */}
                      <ResponsiveText style={styles.tokenCount}>
                        {displayedTokenCount}
                      </ResponsiveText>
                      <ResponsiveText style={styles.tokenSuffix}>AI Tokens</ResponsiveText>
                    </View>
                    <ResponsiveText style={styles.tokenSubtext}>
                      For strategic planning
                    </ResponsiveText>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                    {...getAccessibilityProps({
                      label: "Continue",
                      hint: "Continue to the next step",
                      role: "button"
                    })}
                  >
                    <ResponsiveText style={styles.continueButtonText}>
                      Continue
                    </ResponsiveText>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemCreatedContainer: {
    position: 'absolute',
    top: 80,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  systemCreatedContainerLandscape: {
    top: 40,
  },
  systemCreatedContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  systemCreatedText: {
    color: '#FFFFFF',
    fontSize: scale(14, 0.3),
    marginLeft: 8,
    fontWeight: '500',
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  badgeSection: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    position: 'relative',
  },
  // Glow effect behind the badge - reduced size and opacity
  badgeGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(59, 130, 246, 0.3)', // Slightly increased opacity
    top: 30, // Adjusted to center with the badge
    zIndex: 0,
  },
  badgeCircleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  badgeGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  badgeShine: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Reduced from 0.2 to 0.15
    transform: [{ skewX: '-20deg' }],
  },
  badgeTextContainer: {
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  achievementLabel: {
    fontSize: scale(12, 0.3),
    fontWeight: '600',
    color: '#60A5FA',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  badgeTitle: {
    fontSize: scale(24, 0.2),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeDescription: {
    fontSize: scale(14, 0.3),
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
  },
  rewardContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  claimButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  claimButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  claimButtonGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  claimButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  claimIcon: {
    marginRight: 10,
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.2),
    fontWeight: '600',
  },
  tokensContainer: {
    width: '100%',
    alignItems: 'center',
  },
  tokenIconLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
  },
  tokenTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tokenCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenPrefix: {
    fontSize: scale(20, 0.2),
    fontWeight: 'bold',
    color: '#FFD700',
  },
  tokenCount: {
    fontSize: scale(28, 0.2),
    fontWeight: 'bold',
    color: '#FFD700',
  },
  tokenSuffix: {
    fontSize: scale(16, 0.2),
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 4,
  },
  tokenSubtext: {
    fontSize: scale(14, 0.3),
    color: '#CCCCCC',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    ...Platform.select({
      ios: {
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: scale(16, 0.2),
    fontWeight: '600',
    marginRight: 8,
  },
});

export default AchievementBadgeModal;
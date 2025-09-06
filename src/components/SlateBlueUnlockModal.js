import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  StyleSheet,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../context/ThemeContext';
import { scaleWidth, scaleHeight, scaleFontSize } from '../utils/responsive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SlateBlueUnlockModal = ({ 
  visible, 
  onContinue 
}) => {
  const { theme, updateTheme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  
  console.log('🎨 SlateBlueUnlockModal render:', { visible });
  
  // Animation values
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const colorSwatchScale = useRef(new Animated.Value(0)).current;
  const colorSwatchRotate = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;
  // Pulse animation - REMOVED
  
  // Color wave animations - REMOVED
  
  // Sparkle burst animations
  const sparkleBurst = useRef([]).current;

  // Initialize animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset animation values
      modalScale.setValue(0);
      modalOpacity.setValue(0);
      colorSwatchScale.setValue(0);
      colorSwatchRotate.setValue(0);
      titleOpacity.setValue(0);
      buttonScale.setValue(0);
      
      // Create animated elements
      createSparkleBurst();
      
      // Main entrance sequence
      Animated.sequence([
        // Modal entrance
        Animated.parallel([
          Animated.spring(modalScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        // Title fade in
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Color swatch entrance with rotation
        Animated.parallel([
          Animated.spring(colorSwatchScale, {
            toValue: 1,
            tension: 40,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(colorSwatchRotate, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        // Button appearance
        Animated.spring(buttonScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start continuous animations
        startShimmer();
      });
    }
  }, [visible]);

  // Create color wave effect - REMOVED

  // Create sparkle burst effect
  const createSparkleBurst = () => {
    sparkleBurst.length = 0;
    
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * (Math.PI / 180);
      const sparkle = new Animated.Value(0);
      
      sparkleBurst.push({
        id: i,
        animValue: sparkle,
        translateX: sparkle.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * 100]
        }),
        translateY: sparkle.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * 100]
        }),
        scale: sparkle.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 0]
        }),
        opacity: sparkle.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 1, 0]
        })
      });
      
      // Animate sparkles
      setTimeout(() => {
        Animated.timing(sparkle, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }).start();
      }, 300);
    }
  };

  // Shimmer effect on color swatch
  const startShimmer = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Pulse effect - REMOVED

  // Handle Apply Now button
  const handleApplyNow = async () => {
    if (isApplying) {
      console.log('🎨 Already applying theme, ignoring tap');
      return;
    }
    
    console.log('🎨 Applying Slate Blue theme');
    setIsApplying(true);
    
    // Apply the Slate Blue theme
    try {
      await updateTheme({ primary: '#3B82F6' });
      console.log('🎨 Slate Blue theme applied successfully');
      
      // Short delay to show the change, then continue
      setTimeout(() => {
        setIsApplying(false);
        console.log('🎨 SlateBlueUnlockModal: Slate Blue applied, continuing');
        onContinue();
      }, 500);
    } catch (error) {
      console.error('🎨 Error applying theme:', error);
      setIsApplying(false);
    }
  };

  // Handle continue with Navy Blue (keep current theme)
  const handleContinue = async () => {
    if (isProcessing) {
      console.log('🎨 Continue already processing, ignoring tap');
      return;
    }
    
    console.log('🎨 SlateBlueUnlockModal: Continue with Navy Blue button pressed - keeping current theme');
    setIsProcessing(true);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    
    setTimeout(async () => {
      try {
        // Ensure we're using the Navy Blue theme (reset if user applied Slate Blue earlier)
        console.log('🎨 SlateBlueUnlockModal: Ensuring Navy Blue theme is active before continuing');
        try {
          await updateTheme({ primary: '#1e3a8a' }); // Navy Blue
          console.log('🎨 SlateBlueUnlockModal: Navy Blue theme applied successfully');
        } catch (themeError) {
          console.error('🎨 SlateBlueUnlockModal: Error applying Navy Blue theme:', themeError);
        }
        
        console.log('🎨 SlateBlueUnlockModal: About to call onContinue() - this should trigger tour progression');
        await onContinue();
        console.log('🎨 SlateBlueUnlockModal: onContinue() completed successfully');
      } catch (error) {
        console.error('🎨 SlateBlueUnlockModal: Error in continue handler:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 300);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        {/* Blur Background for iOS */}
        {Platform.OS === 'ios' && (
          <BlurView 
            intensity={30} 
            style={StyleSheet.absoluteFillObject} 
            tint="dark"
          />
        )}

        <Animated.View 
          style={[
            styles.modalContainer,
            { 
              transform: [{ scale: modalScale }],
              opacity: modalOpacity
            }
          ]}
        >
          <LinearGradient
            colors={['#0a0a1f', '#1a1a3e']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Header */}
            <Animated.View 
              style={[
                styles.modalHeader,
                { opacity: titleOpacity }
              ]}
            >
              <View style={styles.headerBadge}>
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.headerBadgeGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="color-palette" size={24} color="#FFFFFF" />
                </LinearGradient>
              </View>
              <Text style={[
                styles.modalTitle,
                { color: '#FFFFFF' }
              ]}>
                Theme Unlocked!
              </Text>
            </Animated.View>
            
            {/* Slate Blue Color Display */}
            <View style={styles.colorDisplayContainer}>
              {/* Sparkle Burst */}
              {sparkleBurst.map(sparkle => (
                <Animated.View
                  key={sparkle.id}
                  style={[
                    styles.sparkle,
                    {
                      transform: [
                        { translateX: sparkle.translateX },
                        { translateY: sparkle.translateY },
                        { scale: sparkle.scale }
                      ],
                      opacity: sparkle.opacity
                    }
                  ]}
                >
                  <Ionicons name="sparkles" size={16} color="#FFD700" />
                </Animated.View>
              ))}
              
              {/* Main Color Swatch */}
              <Animated.View 
                style={[
                  styles.colorSwatchContainer,
                  {
                    transform: [
                      { scale: colorSwatchScale },
                      { 
                        rotate: colorSwatchRotate.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }
                    ]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#5B9EF7', '#3B82F6', '#2563EB']}
                  style={styles.colorCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {/* Shimmer Effect */}
                  <Animated.View
                    style={[
                      styles.shimmer,
                      {
                        opacity: shimmerAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 0.6]
                        })
                      }
                    ]}
                  />
                </LinearGradient>
              </Animated.View>
              
              {/* Color Name */}
              <Animated.Text 
                style={[
                  styles.colorName,
                  { 
                    opacity: colorSwatchScale,
                    transform: [{ scale: colorSwatchScale }]
                  }
                ]}
              >
                Slate Blue
              </Animated.Text>
              
              {/* Hex Code */}
              <Animated.Text 
                style={[
                  styles.hexCode,
                  { 
                    color: '#9CA3AF',
                    opacity: colorSwatchScale 
                  }
                ]}
              >
                #3B82F6
              </Animated.Text>
            </View>
            
            {/* Buttons */}
            <Animated.View
              style={[
                styles.buttonContainer,
                {
                  transform: [{ scale: buttonScale }]
                }
              ]}
            >
              {/* Apply Now Button */}
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleApplyNow}
                activeOpacity={0.9}
                disabled={isApplying || isProcessing}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB']}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons 
                    name="color-palette" 
                    size={20} 
                    color="#FFFFFF" 
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>
                    {isApplying ? 'Applying...' : 'Apply Now'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Continue with Navy Blue Button */}
              <TouchableOpacity 
                style={styles.skipButton}
                onPress={handleContinue}
                activeOpacity={0.9}
                disabled={isProcessing || isApplying}
              >
                <View style={styles.skipButtonContent}>
                  <View style={styles.navyColorPreview} />
                  <Text style={[
                    styles.skipText,
                    { color: '#9CA3AF' }
                  ]}>
                    {isProcessing ? 'Processing...' : 'Continue with Navy Blue'}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxWidth: scaleWidth(380),
    borderRadius: scaleWidth(24),
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  gradientBackground: {
    padding: scaleWidth(32),
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: scaleHeight(32),
  },
  headerBadge: {
    width: scaleWidth(56),
    height: scaleWidth(56),
    borderRadius: scaleWidth(28),
    overflow: 'hidden',
    marginBottom: scaleHeight(12),
  },
  headerBadgeGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: scaleFontSize(26),
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  colorDisplayContainer: {
    alignItems: 'center',
    marginBottom: scaleHeight(40),
    position: 'relative',
    width: scaleWidth(200),
    height: scaleWidth(200),
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
  },
  colorSwatchContainer: {
    width: scaleWidth(150),
    height: scaleWidth(150),
    borderRadius: scaleWidth(75),
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  colorCircle: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shimmer: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  colorName: {
    fontSize: scaleFontSize(24),
    fontWeight: 'bold',
    color: '#3B82F6',
    marginTop: scaleHeight(20),
    letterSpacing: 1,
  },
  hexCode: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    marginTop: scaleHeight(4),
    letterSpacing: 1,
    opacity: 0.7,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  applyButton: {
    width: '100%',
    height: scaleHeight(56),
    borderRadius: scaleHeight(28),
    overflow: 'hidden',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: scaleHeight(12),
  },
  skipButton: {
    width: '100%',
    height: scaleHeight(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navyColorPreview: {
    width: scaleWidth(16),
    height: scaleWidth(16),
    borderRadius: scaleWidth(8),
    backgroundColor: '#1e3a8a',
    marginRight: scaleWidth(8),
    borderWidth: 1,
    borderColor: '#374151',
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  skipText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginRight: scaleWidth(8),
  },
});

export default SlateBlueUnlockModal;
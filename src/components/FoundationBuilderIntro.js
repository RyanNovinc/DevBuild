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
import SlateBlueUnlockModal from './SlateBlueUnlockModal';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FoundationBuilderIntro = ({ 
  visible, 
  onContinue 
}) => {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSlateBlueModal, setShowSlateBlueModal] = useState(false);
  
  console.log('🏆 FoundationBuilderIntro render:', { visible });
  
  // Animation values
  const modalScale = useRef(new Animated.Value(0)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const giftButtonScale = useRef(new Animated.Value(0)).current;
  const giftButtonGlow = useRef(new Animated.Value(1)).current;
  const confettiOpacity = useRef(new Animated.Value(0)).current;
  
  // Floating particles for background
  const floatingParticles = useRef([]).current;
  
  // Initialize animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset animation values
      modalScale.setValue(0);
      modalOpacity.setValue(0);
      titleOpacity.setValue(0);
      badgeScale.setValue(0);
      giftButtonScale.setValue(0);
      confettiOpacity.setValue(0);
      
      // Create floating particles
      createFloatingParticles();
      
      // Sequence animations for dramatic reveal
      Animated.sequence([
        // Modal entrance
        Animated.parallel([
          Animated.spring(modalScale, {
            toValue: 1,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        // Badge scale in
        Animated.spring(badgeScale, {
          toValue: 1,
          tension: 100,
          friction: 7,
          useNativeDriver: true,
        }),
        // Title fade in
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        // Gift button appear with bounce
        Animated.spring(giftButtonScale, {
          toValue: 1,
          tension: 60,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Start gift button glow pulse
        startGiftPulse();
        // Show confetti
        Animated.timing(confettiOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [visible]);

  // Create floating background particles
  const createFloatingParticles = () => {
    floatingParticles.length = 0;
    
    for (let i = 0; i < 15; i++) {
      const particle = new Animated.Value(0);
      const x = Math.random() * screenWidth;
      const startY = screenHeight + 50;
      const endY = -50;
      
      floatingParticles.push({
        id: i,
        x: x,
        animValue: particle,
        translateY: particle.interpolate({
          inputRange: [0, 1],
          outputRange: [startY, endY]
        }),
        opacity: particle.interpolate({
          inputRange: [0, 0.1, 0.9, 1],
          outputRange: [0, 0.6, 0.6, 0]
        }),
        scale: particle.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0.8, 1.2, 0.8]
        })
      });
      
      // Animate with delay for staggered effect
      Animated.loop(
        Animated.timing(particle, {
          toValue: 1,
          duration: 8000 + Math.random() * 4000,
          delay: Math.random() * 2000,
          useNativeDriver: true,
        })
      ).start();
    }
  };

  // Pulse animation for gift button
  const startGiftPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(giftButtonGlow, {
          toValue: 1.15,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(giftButtonGlow, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  // Handle gift/present tap
  const handleGiftTap = async () => {
    if (isProcessing) {
      console.log('🏆 Gift already processing, ignoring tap');
      return;
    }
    
    console.log('🎁 Opening gift - showing Slate Blue unlock modal');
    
    // Animate gift button press
    Animated.sequence([
      Animated.timing(giftButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(giftButtonScale, {
        toValue: 1.2,
        tension: 100,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Show the dedicated Slate Blue unlock modal after animation
    setTimeout(() => {
      setShowSlateBlueModal(true);
    }, 300);
  };

  // Handle continue from Slate Blue modal
  const handleSlateBlueModalContinue = async () => {
    console.log('🎨 FoundationBuilderIntro: Slate Blue modal dismissed, continuing to tour');
    
    // Hide the Slate Blue modal first
    setShowSlateBlueModal(false);
    
    // Small delay to let modal dismiss, then continue to tour
    setTimeout(async () => {
      try {
        console.log('🏆 FoundationBuilderIntro: About to call onContinue() - should advance tour to GOAL_ACHIEVEMENT_VALIDATION');
        await onContinue();
        console.log('🏆 FoundationBuilderIntro: onContinue() completed - tour should now be on next step');
      } catch (error) {
        console.error('🏆 FoundationBuilderIntro: Error in continue handler:', error);
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
        {/* Floating Background Particles */}
        {floatingParticles.map(particle => (
          <Animated.View
            key={particle.id}
            style={[
              styles.floatingParticle,
              {
                left: particle.x,
                transform: [
                  { translateY: particle.translateY },
                  { scale: particle.scale }
                ],
                opacity: particle.opacity
              }
            ]}
          >
            <View style={styles.particleDot} />
          </Animated.View>
        ))}

        {/* Blur Background */}
        {Platform.OS === 'ios' && (
          <BlurView 
            intensity={20} 
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
            colors={['#1a1a2e', '#0f0f1e']}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Confetti Overlay */}
            <Animated.View 
              style={[
                styles.confettiContainer,
                { opacity: confettiOpacity }
              ]}
              pointerEvents="none"
            >
              <Text style={styles.confettiEmoji}>🎊</Text>
              <Text style={[styles.confettiEmoji, { left: '20%', top: '10%' }]}>✨</Text>
              <Text style={[styles.confettiEmoji, { right: '15%', top: '15%' }]}>🎉</Text>
              <Text style={[styles.confettiEmoji, { left: '10%', bottom: '20%' }]}>⭐</Text>
              <Text style={[styles.confettiEmoji, { right: '20%', bottom: '15%' }]}>🌟</Text>
            </Animated.View>

            {/* Achievement Badge */}
            <Animated.View 
              style={[
                styles.badgeContainer,
                {
                  transform: [{ scale: badgeScale }]
                }
              ]}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.badge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="trophy" size={40} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.badgeGlow} />
            </Animated.View>
            
            {/* Title Section */}
            <Animated.View 
              style={[
                styles.titleSection,
                { opacity: titleOpacity }
              ]}
            >
              <Text style={[
                styles.achievementLabel,
                { color: '#9CA3AF' }
              ]}>
                ACHIEVEMENT UNLOCKED
              </Text>
              <Text style={[
                styles.achievementTitle,
                { color: '#FFFFFF' }
              ]}>
                Foundation Builder
              </Text>
              <View style={styles.divider} />
              <Text style={[
                styles.rewardText,
                { color: '#FFD700' }
              ]}>
                Special Reward Available
              </Text>
            </Animated.View>
            
            {/* Gift Button */}
            <Animated.View
              style={[
                styles.giftButtonContainer,
                {
                  transform: [
                    { scale: Animated.multiply(giftButtonScale, giftButtonGlow) }
                  ]
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.giftButton}
                onPress={handleGiftTap}
                activeOpacity={0.9}
                disabled={isProcessing}
              >
                <LinearGradient
                  colors={['#FFD700', '#FFC700', '#FFB300']}
                  style={styles.giftButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons 
                    name="gift" 
                    size={36} 
                    color="#FFFFFF" 
                  />
                  <View style={styles.giftShine} />
                </LinearGradient>
              </TouchableOpacity>
              <Text style={[
                styles.tapHint,
                { color: '#9CA3AF' }
              ]}>
                Tap to reveal
              </Text>
            </Animated.View>
          </LinearGradient>
        </Animated.View>
      </View>
      
      {/* Slate Blue Unlock Modal */}
      <SlateBlueUnlockModal
        visible={showSlateBlueModal}
        onContinue={handleSlateBlueModalContinue}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingParticle: {
    position: 'absolute',
    zIndex: 1,
  },
  particleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFD700',
    opacity: 0.6,
  },
  modalContainer: {
    width: '85%',
    maxWidth: scaleWidth(380),
    borderRadius: scaleWidth(24),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
    zIndex: 2,
  },
  gradientBackground: {
    padding: scaleWidth(32),
    alignItems: 'center',
    position: 'relative',
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  confettiEmoji: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.8,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: scaleHeight(24),
    position: 'relative',
  },
  badge: {
    width: scaleWidth(90),
    height: scaleWidth(90),
    borderRadius: scaleWidth(45),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  badgeGlow: {
    position: 'absolute',
    width: scaleWidth(120),
    height: scaleWidth(120),
    borderRadius: scaleWidth(60),
    backgroundColor: '#FFD700',
    opacity: 0.2,
    top: -15,
    left: -15,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: scaleHeight(32),
  },
  achievementLabel: {
    fontSize: scaleFontSize(12),
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: scaleHeight(8),
  },
  achievementTitle: {
    fontSize: scaleFontSize(28),
    fontWeight: 'bold',
    marginBottom: scaleHeight(16),
  },
  divider: {
    width: scaleWidth(60),
    height: 2,
    backgroundColor: '#FFD700',
    marginBottom: scaleHeight(16),
  },
  rewardText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  giftButtonContainer: {
    alignItems: 'center',
  },
  giftButton: {
    width: scaleWidth(100),
    height: scaleWidth(100),
    borderRadius: scaleWidth(50),
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  giftButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  giftShine: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  tapHint: {
    marginTop: scaleHeight(12),
    fontSize: scaleFontSize(14),
    fontStyle: 'italic',
  },
});

export default FoundationBuilderIntro;
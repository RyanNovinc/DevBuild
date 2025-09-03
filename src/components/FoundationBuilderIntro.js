import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { scaleWidth, scaleHeight, scaleFontSize } from '../utils/responsive';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FoundationBuilderIntro = ({ 
  visible, 
  onContinue 
}) => {
  const { theme } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  
  console.log('🏆 FoundationBuilderIntro render:', { visible });
  
  // Animation values
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  
  // Falling trophy animation
  const fallingTrophies = useRef([]).current;
  
  // Fireworks animation
  const fireworks = useRef([]).current;

  // Initialize animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Reset animation values
      modalScale.setValue(0.8);
      modalOpacity.setValue(0);
      
      // Create falling trophies
      createFallingTrophies();
      
      // Create fireworks
      createFireworks();
      
      // Start entrance animation
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [visible]);

  const createFallingTrophies = () => {
    // Clear existing trophies
    fallingTrophies.length = 0;
    
    // Create 8 falling trophies
    for (let i = 0; i < 8; i++) {
      const trophy = {
        id: i,
        x: Math.random() * screenWidth,
        animValue: new Animated.Value(-50),
        rotation: new Animated.Value(0)
      };
      
      fallingTrophies.push(trophy);
      
      // Start falling animation with random delay
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(trophy.animValue, {
            toValue: screenHeight + 100,
            duration: 3000 + Math.random() * 1000,
            useNativeDriver: true
          }),
          Animated.timing(trophy.rotation, {
            toValue: 1,
            duration: 2000 + Math.random() * 1000,
            useNativeDriver: true
          })
        ]).start();
      }, Math.random() * 1000);
    }
  };

  const createFireworks = () => {
    // Clear existing fireworks
    fireworks.length = 0;
    
    // Create 15 firework particles
    for (let i = 0; i < 15; i++) {
      const firework = {
        id: i,
        x: Math.random() * screenWidth,
        y: Math.random() * screenHeight * 0.7 + 100,
        opacityAnim: new Animated.Value(0),
        scaleAnim: new Animated.Value(0)
      };
      
      fireworks.push(firework);
      
      // Start firework animation with random delay
      setTimeout(() => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(firework.opacityAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true
            }),
            Animated.spring(firework.scaleAnim, {
              toValue: 1.5,
              tension: 100,
              friction: 6,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(firework.opacityAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true
            }),
            Animated.timing(firework.scaleAnim, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true
            })
          ])
        ]).start();
      }, Math.random() * 2000 + 500);
    }
  };

  // Handle continue with debouncing to prevent double-tap issues
  const handleContinue = async () => {
    if (isProcessing) {
      console.log('🏆 Continue already processing, ignoring tap');
      return;
    }
    
    console.log('🏆 Continue button pressed');
    setIsProcessing(true);
    
    // Trigger extra celebration effects when continue is pressed
    createFallingTrophies();
    createFireworks();
    
    try {
      await onContinue();
    } catch (error) {
      console.error('🏆 Error in continue handler:', error);
    } finally {
      // Reset processing state after a short delay
      setTimeout(() => {
        setIsProcessing(false);
      }, 1000);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onContinue}
    >
      <View style={styles.modalOverlay}>
        {/* Falling Trophy Effects */}
        {fallingTrophies.map(trophy => (
          <Animated.View
            key={trophy.id}
            style={[
              styles.fallingTrophy,
              {
                left: trophy.x,
                top: 0,
                transform: [
                  { translateY: trophy.animValue },
                  { 
                    rotate: trophy.rotation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ]
              }
            ]}
          >
            <Ionicons name="trophy" size={32} color="#FFD700" />
          </Animated.View>
        ))}
        
        {/* Golden Fireworks Effects */}
        {fireworks.map(firework => (
          <Animated.View
            key={firework.id}
            style={[
              styles.firework,
              {
                left: firework.x,
                top: firework.y,
                opacity: firework.opacityAnim,
                transform: [
                  { scale: firework.scaleAnim }
                ]
              }
            ]}
          >
            <Text style={styles.fireworkText}>✨</Text>
          </Animated.View>
        ))}
        
        <Animated.View style={[
          styles.modalContainer,
          {
            backgroundColor: theme.background,
            borderColor: theme.primary,
            transform: [{ scale: modalScale }],
            opacity: modalOpacity
          }
        ]}>
          {/* Achievement Icon */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: theme.cardBackground }
          ]}>
            <Ionicons name="construct" size={48} color="#FFD700" />
          </View>
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              { color: theme.text }
            ]}>Achievement Unlocked!</Text>
            <Text style={[
              styles.achievementName,
              { color: '#FFD700' }
            ]}>Foundation Builder</Text>
          </View>
          
          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={[
              styles.description,
              { color: theme.textSecondary }
            ]}>
              Congratulations! You've unlocked your first achievement and earned points toward the next stage.
            </Text>
            <Text style={[
              styles.tourPrompt,
              { color: theme.text }
            ]}>
              Complete the optional tour to earn your next achievement.
            </Text>
          </View>
          
          {/* Continue Button */}
          <TouchableOpacity 
            style={[
              styles.continueButton,
              { 
                borderColor: theme.border,
                opacity: isProcessing ? 0.6 : 1
              }
            ]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={isProcessing}
          >
            <Text style={[
              styles.continueText,
              { color: theme.text }
            ]}>
              {isProcessing ? 'Processing...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: scaleWidth(20),
  },
  fallingTrophy: {
    position: 'absolute',
    zIndex: 1,
  },
  firework: {
    position: 'absolute',
    zIndex: 1,
  },
  fireworkText: {
    fontSize: 24,
    color: '#FFD700',
  },
  modalContainer: {
    width: '90%',
    maxWidth: scaleWidth(400),
    borderRadius: scaleWidth(20),
    padding: scaleWidth(24),
    alignItems: 'center',
    borderWidth: 2,
    zIndex: 2,
  },
  iconContainer: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleHeight(16),
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: scaleHeight(20),
  },
  modalTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    marginBottom: scaleHeight(4),
  },
  achievementName: {
    fontSize: scaleFontSize(24),
    fontWeight: 'bold',
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: scaleHeight(24),
  },
  description: {
    fontSize: scaleFontSize(16),
    textAlign: 'center',
    lineHeight: scaleHeight(24),
    marginBottom: scaleHeight(12),
  },
  tourPrompt: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: scaleHeight(24),
  },
  continueButton: {
    paddingVertical: scaleHeight(12),
    paddingHorizontal: scaleWidth(32),
    borderRadius: scaleWidth(25),
    borderWidth: 1,
  },
  continueText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
});

export default FoundationBuilderIntro;
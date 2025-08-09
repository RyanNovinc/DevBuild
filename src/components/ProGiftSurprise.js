// ProGiftSurprise.js - Completely redesigned Pro upgrade gift surprise
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Modal,
  Alert,
  Platform,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ProGiftSurprise = ({ 
  visible, 
  onClose, 
  theme, 
  onColorWheelUnlocked,
  showAppStoreRating = true 
}) => {
  const [giftOpened, setGiftOpened] = useState(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  
  // Animation values
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const giftScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  
  // Confetti animation values (multiple pieces)
  const confettiPieces = useRef([...Array(15)].map(() => ({
    translateY: new Animated.Value(-100),
    translateX: new Animated.Value(0),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(0)
  }))).current;

  useEffect(() => {
    if (visible) {
      // Reset state
      setGiftOpened(false);
      setShowRatingPrompt(false);
      
      // Reset all animations
      modalOpacity.setValue(0);
      giftScale.setValue(0);
      contentOpacity.setValue(0);
      contentTranslateY.setValue(50);
      
      confettiPieces.forEach(piece => {
        piece.translateY.setValue(-100);
        piece.translateX.setValue(0);
        piece.rotate.setValue(0);
        piece.opacity.setValue(0);
      });

      // Animate modal entrance
      Animated.sequence([
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(giftScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleGiftTap = async () => {
    if (giftOpened) return;
    
    setGiftOpened(true);

    // Save gift state
    try {
      await AsyncStorage.setItem('proGiftReceived', 'true');
      await AsyncStorage.setItem('colorWheelUnlocked', 'true');
    } catch (error) {
      console.error('Error saving gift state:', error);
    }

    // Trigger color wheel unlock
    if (onColorWheelUnlocked) {
      onColorWheelUnlocked();
    }

    // Start confetti animation
    startConfettiAnimation();
    
    // Fade in content after confetti starts
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();
    }, 500);

    // Show rating prompt after content is visible
    if (showAppStoreRating) {
      setTimeout(() => {
        setShowRatingPrompt(true);
      }, 3500);
    }
  };

  const startConfettiAnimation = () => {
    const animations = confettiPieces.map((piece, index) => {
      // Random starting position across the width
      const startX = Math.random() * width - width / 2;
      const endY = height + 100;
      const rotation = Math.random() * 720 - 360; // Random rotation
      
      piece.translateX.setValue(startX);
      
      return Animated.parallel([
        // Fall down
        Animated.timing(piece.translateY, {
          toValue: endY,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        // Rotate while falling
        Animated.timing(piece.rotate, {
          toValue: rotation,
          duration: 2000 + Math.random() * 1000,
          useNativeDriver: true,
        }),
        // Fade in then out
        Animated.sequence([
          Animated.timing(piece.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay(1500),
          Animated.timing(piece.opacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          })
        ])
      ]);
    });

    Animated.stagger(100, animations).start();
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/lifecompass-goal-planner',
      android: 'https://play.google.com/store/apps/details?id=com.lifecompass.app',
    });

    if (storeUrl) {
      Linking.openURL(storeUrl).catch(err => {
        console.error('Failed to open store URL:', err);
        Alert.alert('Error', 'Could not open app store');
      });
    }

    setShowRatingPrompt(false);
    setTimeout(() => onClose(), 500);
  };

  const handleNotNow = () => {
    setShowRatingPrompt(false);
    setTimeout(() => onClose(), 500);
  };

  const renderConfetti = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
    
    return confettiPieces.map((piece, index) => (
      <Animated.View
        key={index}
        style={[
          styles.confettiPiece,
          {
            backgroundColor: colors[index % colors.length],
            opacity: piece.opacity,
            transform: [
              { translateY: piece.translateY },
              { translateX: piece.translateX },
              { rotate: piece.rotate.interpolate({
                inputRange: [-360, 360],
                outputRange: ['-360deg', '360deg']
              })}
            ],
          },
        ]}
      />
    ));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.modalOverlay, 
          { opacity: modalOpacity }
        ]}
      >
        {/* Confetti */}
        {giftOpened && (
          <View style={styles.confettiContainer}>
            {renderConfetti()}
          </View>
        )}

        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
          {!giftOpened ? (
            // Gift Box (before opening)
            <View style={styles.giftContainer}>
              <Text style={[styles.surpriseTitle, { color: theme.text }]}>
                🎉 Surprise!
              </Text>
              <Text style={[styles.surpriseSubtitle, { color: theme.textSecondary }]}>
                You have a special gift waiting
              </Text>

              <TouchableOpacity
                onPress={handleGiftTap}
                style={styles.giftBox}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.giftBoxInner,
                    { transform: [{ scale: giftScale }] }
                  ]}
                >
                  {/* Modern gift box design */}
                  <View style={[styles.giftBase, { 
                    backgroundColor: theme.cardElevated,
                    borderColor: theme.border 
                  }]}>
                    {/* Ribbon vertical */}
                    <View style={[styles.ribbonVertical, { backgroundColor: '#DC2626' }]} />
                    {/* Ribbon horizontal */}
                    <View style={[styles.ribbonHorizontal, { backgroundColor: '#DC2626' }]} />
                    {/* Bow */}
                    <View style={styles.bowContainer}>
                      <View style={[styles.bowLeft, { backgroundColor: '#B91C1C' }]} />
                      <View style={[styles.bowRight, { backgroundColor: '#B91C1C' }]} />
                      <View style={[styles.bowKnot, { backgroundColor: '#991B1B' }]} />
                    </View>
                  </View>
                </Animated.View>
              </TouchableOpacity>

              <Text style={[styles.tapHint, { color: theme.textSecondary }]}>
                Tap to open
              </Text>
            </View>
          ) : (
            // Revealed Content (after opening)
            <Animated.View
              style={[
                styles.revealedContent,
                {
                  opacity: contentOpacity,
                  transform: [{ translateY: contentTranslateY }]
                }
              ]}
            >
              <View style={styles.unlockIcon}>
                <Ionicons name="color-palette" size={48} color={theme.primary} />
              </View>

              <Text style={[styles.unlockTitle, { color: theme.text }]}>
                Theme Colors Unlocked
              </Text>

              <Text style={[styles.unlockSubtitle, { color: theme.textSecondary }]}>
                Customize your app theme
              </Text>

              <View style={[styles.messageCard, { backgroundColor: theme.cardElevated }]}>
                <Text style={[styles.thankYouMessage, { color: theme.textSecondary }]}>
                  "Thank you for upgrading to Pro! Your support helps me continue improving LifeCompass."
                </Text>
                <Text style={[styles.signature, { color: theme.primary }]}>
                  — Ryan
                </Text>
              </View>

              {!showRatingPrompt && (
                <TouchableOpacity
                  style={[styles.continueButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowRatingPrompt(true)}
                >
                  <Text style={styles.continueButtonText}>Continue</Text>
                </TouchableOpacity>
              )}

              {showRatingPrompt && (
                <View style={styles.ratingSection}>
                  <Text style={[styles.ratingTitle, { color: theme.text }]}>
                    Enjoying LifeCompass?
                  </Text>
                  <Text style={[styles.ratingMessage, { color: theme.textSecondary }]}>
                    Your review helps others discover the app and supports continued development.
                  </Text>
                  
                  <View style={styles.ratingButtons}>
                    <TouchableOpacity
                      style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                      onPress={handleRateApp}
                    >
                      <Text style={styles.primaryButtonText}>Leave a Review</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.secondaryButton, { borderColor: theme.textSecondary }]}
                      onPress={handleNotNow}
                    >
                      <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                        Maybe Later
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 20,
  },
  
  // Gift Box Styles
  giftContainer: {
    alignItems: 'center',
  },
  surpriseTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  surpriseSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  giftBox: {
    marginBottom: 32,
  },
  giftBoxInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftBase: {
    width: 140,
    height: 140,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    position: 'relative',
  },
  ribbonVertical: {
    position: 'absolute',
    left: '50%',
    marginLeft: -8,
    top: 0,
    bottom: 0,
    width: 16,
  },
  ribbonHorizontal: {
    position: 'absolute',
    top: '50%',
    marginTop: -8,
    left: 0,
    right: 0,
    height: 16,
  },
  bowContainer: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -24,
    width: 48,
    height: 24,
  },
  bowLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 20,
    height: 20,
    borderRadius: 20,
    transform: [{ scaleX: 0.7 }],
  },
  bowRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 20,
    height: 20,
    borderRadius: 20,
    transform: [{ scaleX: 0.7 }],
  },
  bowKnot: {
    position: 'absolute',
    left: '50%',
    marginLeft: -6,
    top: 2,
    width: 12,
    height: 16,
    borderRadius: 6,
  },
  tapHint: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Confetti Styles
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  confettiPiece: {
    position: 'absolute',
    width: 10,
    height: 10,
    top: 0,
    left: width / 2,
    borderRadius: 2,
  },
  
  // Revealed Content Styles
  revealedContent: {
    alignItems: 'center',
    width: '100%',
  },
  unlockIcon: {
    marginBottom: 24,
  },
  unlockTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  unlockSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  messageCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    width: '100%',
  },
  thankYouMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  signature: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Rating Section Styles
  ratingSection: {
    alignItems: 'center',
    width: '100%',
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  ratingMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  ratingButtons: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ProGiftSurprise;
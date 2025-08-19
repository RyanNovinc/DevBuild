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
import ColorWheel from './ColorWheel';
import { useTheme } from '../context/ThemeContext';
import {
  PanResponder,
} from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

// Simplified ColorWheel component without toggles and hex input
const SimplifiedColorWheel = ({ onColorChange, selectedColor = '#3b82f6', theme }) => {
  const WHEEL_SIZE = Math.min(width * 0.7, 280); // Smaller for gift modal
  const WHEEL_RADIUS = WHEEL_SIZE / 2;
  const CENTER = WHEEL_RADIUS;
  const PICKER_RADIUS = 12;
  
  const [currentColor, setCurrentColor] = React.useState(selectedColor);
  const [pickerPosition, setPickerPosition] = React.useState({ x: CENTER, y: CENTER });
  const [isDragging, setIsDragging] = React.useState(false);

  // Convert HSV to RGB
  const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r, g, b;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return { r, g, b };
  };

  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  };

  // Convert position to HSV
  const positionToHsv = (x, y) => {
    const dx = x - CENTER;
    const dy = y - CENTER;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > WHEEL_RADIUS - 20) return null;
    
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    const normalizedAngle = angle < 0 ? angle + 360 : angle;
    const saturation = Math.min(distance / (WHEEL_RADIUS - 20), 1);
    const value = 0.9; // Fixed value for simplicity
    
    return { h: normalizedAngle, s: saturation, v: value };
  };

  // Pan responder for dragging
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const hsv = positionToHsv(locationX, locationY);
      if (hsv) {
        setIsDragging(true);
        setPickerPosition({ x: locationX, y: locationY });
        const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
        const newColor = rgbToHex(r, g, b);
        setCurrentColor(newColor);
        onColorChange(newColor);
      }
    },
    onPanResponderMove: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      const hsv = positionToHsv(locationX, locationY);
      if (hsv) {
        setPickerPosition({ x: locationX, y: locationY });
        const { r, g, b } = hsvToRgb(hsv.h, hsv.s, hsv.v);
        const newColor = rgbToHex(r, g, b);
        setCurrentColor(newColor);
        onColorChange(newColor);
      }
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  // Generate color rings
  const generateColorRings = () => {
    const rings = [];
    const numRings = 12;
    const numSegments = 36;
    
    for (let ring = 0; ring < numRings; ring++) {
      for (let segment = 0; segment < numSegments; segment++) {
        const hue = (segment / numSegments) * 360;
        const saturation = (ring + 1) / numRings;
        const value = 0.9; // Fixed bright value
        const { r, g, b } = hsvToRgb(hue, saturation, value);
        const color = rgbToHex(r, g, b);
        
        const innerRadius = 20 + (ring * (WHEEL_RADIUS - 40) / numRings);
        const outerRadius = 20 + ((ring + 1) * (WHEEL_RADIUS - 40) / numRings);
        const startAngle = (segment / numSegments) * 360;
        const endAngle = ((segment + 1) / numSegments) * 360;
        
        const startAngleRad = (startAngle * Math.PI) / 180;
        const endAngleRad = (endAngle * Math.PI) / 180;
        
        const x1 = CENTER + innerRadius * Math.cos(startAngleRad);
        const y1 = CENTER + innerRadius * Math.sin(startAngleRad);
        const x2 = CENTER + outerRadius * Math.cos(startAngleRad);
        const y2 = CENTER + outerRadius * Math.sin(startAngleRad);
        const x3 = CENTER + outerRadius * Math.cos(endAngleRad);
        const y3 = CENTER + outerRadius * Math.sin(endAngleRad);
        const x4 = CENTER + innerRadius * Math.cos(endAngleRad);
        const y4 = CENTER + innerRadius * Math.sin(endAngleRad);
        
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
        const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`;
        
        rings.push(
          <Path
            key={`${ring}-${segment}`}
            d={pathData}
            fill={color}
            stroke="none"
          />
        );
      }
    }
    
    return rings;
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: WHEEL_SIZE,
          height: WHEEL_SIZE,
          borderRadius: WHEEL_SIZE / 2,
        }}
        {...panResponder.panHandlers}
      >
        <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
          <Defs>
            <RadialGradient
              id="saturationGradient"
              cx="50%"
              cy="50%"
              r="50%"
            >
              <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          {generateColorRings()}
          
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={WHEEL_RADIUS - 20}
            fill="url(#saturationGradient)"
          />
          
          {/* Color picker dot */}
          <Circle
            cx={pickerPosition.x}
            cy={pickerPosition.y}
            r={PICKER_RADIUS}
            fill={currentColor}
            stroke="#FFFFFF"
            strokeWidth="3"
          />
        </Svg>
      </View>
    </View>
  );
};

const ProGiftSurprise = ({ 
  visible, 
  onClose, 
  theme, 
  onColorWheelUnlocked,
  showAppStoreRating = true,
  giftType = 'colorWheel' // 'colorWheel' or 'aiPlus'
}) => {
  const [giftOpened, setGiftOpened] = useState(false);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [selectedCustomColor, setSelectedCustomColor] = useState('#3b82f6');
  const [isClosing, setIsClosing] = useState(false);
  
  // Get theme context for real-time theme updates
  const { updateTheme, toggleColoredTheme, isColoredTheme } = useTheme();

  // For AI Plus gifts, automatically show rating prompt after gift is opened
  useEffect(() => {
    if (giftOpened && giftType === 'aiPlus') {
      // Small delay to let the gift opening animation finish
      setTimeout(() => {
        setShowRatingPrompt(true);
      }, 1000);
    }
  }, [giftOpened, giftType]);
  
  // Animation values
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const giftScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  const giftShake = useRef(new Animated.Value(0)).current;
  const shakeAnimationRef = useRef(null);
  
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
      setIsClosing(false);
      
      // Reset all animations
      modalOpacity.setValue(0);
      giftScale.setValue(0);
      contentOpacity.setValue(0);
      contentTranslateY.setValue(50);
      giftShake.setValue(0);
      
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
      ]).start(() => {
        // Start the shake animation after the gift appears
        startShakeAnimation();
      });
    }
  }, [visible]);

  const startShakeAnimation = () => {
    if (giftOpened) return;
    
    // Create a subtle shake animation that repeats every 2 seconds
    const shakeSequence = Animated.sequence([
      // Quick shake left-right
      Animated.timing(giftShake, {
        toValue: -3,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(giftShake, {
        toValue: 3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(giftShake, {
        toValue: -2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(giftShake, {
        toValue: 2,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(giftShake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
      // Wait 2 seconds before next shake
      Animated.delay(1700),
    ]);

    // Loop the shake animation
    const loopingShake = Animated.loop(shakeSequence);
    loopingShake.start();
    
    // Store reference to stop it when gift is opened
    shakeAnimationRef.current = loopingShake;
  };

  const handleGiftTap = async () => {
    if (giftOpened) return;
    
    // Stop the shake animation
    if (shakeAnimationRef.current) {
      shakeAnimationRef.current.stop();
    }
    
    setGiftOpened(true);

    // Save gift state
    try {
      await AsyncStorage.setItem('proGiftReceived', 'true');
      await AsyncStorage.setItem('colorWheelUnlocked', 'true');
    } catch (error) {
      console.error('Error saving gift state:', error);
    }

    // Trigger color wheel unlock - only for color wheel gifts
    if (giftType === 'colorWheel' && onColorWheelUnlocked) {
      onColorWheelUnlocked();
      
      // Enable colored theme mode to allow custom colors
      if (!isColoredTheme) {
        toggleColoredTheme(true);
      }
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

    // Remove automatic rating prompt - user must click Continue
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

    setIsClosing(true);
    setTimeout(() => onClose(), 500);
  };

  const handleNotNow = () => {
    setIsClosing(true);
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
                    { 
                      transform: [
                        { scale: giftScale },
                        { translateX: giftShake }
                      ] 
                    }
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
              {/* Only show upgrade details for color wheel, skip for AI Plus */}
              {giftType === 'colorWheel' && !showRatingPrompt && (
                <>
                  <View style={styles.unlockIcon}>
                    <Ionicons 
                      name="color-palette" 
                      size={48} 
                      color={selectedCustomColor} 
                    />
                  </View>

                  <Text style={[styles.unlockTitle, { color: theme.text }]}>
                    🎨 Custom Colours Unlocked!
                  </Text>

                  <Text style={[styles.unlockSubtitle, { color: theme.textSecondary }]}>
                    Choose any colour you want with the colour wheel
                  </Text>

                  <View style={styles.colorShowcase}>
                    {/* Simplified Color Wheel Component - hide after Continue is clicked or when closing */}
                    {!isClosing && (
                      <View style={styles.colorWheelContainer}>
                        <SimplifiedColorWheel
                          onColorChange={(color) => {
                            setSelectedCustomColor(color);
                            // Just update local color - will apply to modal elements
                          }}
                          selectedColor={selectedCustomColor}
                          theme={theme}
                        />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.continueButton, { 
                      backgroundColor: selectedCustomColor 
                    }]}
                    onPress={() => {
                      // Save the selected color to theme when user clicks Continue
                      updateTheme({ primary: selectedCustomColor });
                      setShowRatingPrompt(true);
                    }}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </>
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
                      style={[styles.primaryButton, { 
                        backgroundColor: giftType === 'colorWheel' ? selectedCustomColor : theme.primary 
                      }]}
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
        
        {/* Handwritten message overlay at bottom of screen */}
        {showRatingPrompt && (
          <View style={styles.handwrittenOverlay}>
            <Text style={[styles.handwrittenMessage, { color: 'rgba(255,255,255,0.8)' }]}>
              "Thank you for being one of my first 1000 users. Small touches like custom colours make the app feel truly yours. I hope this adds a bit of joy to your daily planning!"{'\n\n'}P.S. If you enjoy this app please consider leaving a review. It helps me out a lot.{'\n\n'}— Ryan ✍️
            </Text>
          </View>
        )}
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
  featureItem: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
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
  
  // Handwritten message overlay styles
  handwrittenOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  handwrittenMessage: {
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '300',
    fontFamily: Platform.select({
      ios: 'Bradley Hand',
      android: 'casual',
    }),
  },
  
  // Color showcase styles
  colorShowcase: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  colorShowcaseText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  colorShowcaseSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '400',
    opacity: 0.8,
    marginBottom: 20,
  },
  colorWheelContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
});

export default ProGiftSurprise;
// src/screens/ProfileScreen/SettingsModal.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Switch,
  Alert,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { useAuth } from '../../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import responsive from '../../utils/responsive';
import ReferralCodeInputModal from '../../components/ReferralCodeInputModal';

const { width } = Dimensions.get('window');

const SettingsModal = ({
  visible,
  theme,
  isDarkMode,
  isAdmin,
  screenState,
  onClose,
  onToggleAIButton,
  onToggleLifetimeMember,
  onShowAIExplanation,
  navigation,
  onLogout,
  updateAppSetting, // Added this prop to receive the function from parent
  isEdgeSwipeActive,
  edgeSwipeX,
  onScreenStateUpdate, // Add this prop to update parent state
  onTriggerGiftSurprise // Add this prop for testing the gift surprise
}) => {
  const { logout } = useAuth() || {};
  const insets = useSafeAreaInsets();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(width)).current; // Start from right edge
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const referralTextOpacity = useRef(new Animated.Value(1)).current;
  const proOnlyTextOpacity = useRef(new Animated.Value(0)).current;
  
  // Track actual modal visibility state for closing animations
  const [modalVisible, setModalVisible] = useState(visible);
  const [isDismissing, setIsDismissing] = useState(false);
  
  // Referral code input modal state
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  
  // Goal limit modal state
  const [goalLimitModalVisible, setGoalLimitModalVisible] = useState(false);
  
  // Restart onboarding modal state
  const [restartOnboardingModalVisible, setRestartOnboardingModalVisible] = useState(false);
  
  // Referral button text state
  const [showProOnlyText, setShowProOnlyText] = useState(false);
  
  // Function to trigger shake animation
  const triggerShake = () => {
    // Reset the animation value
    shakeAnim.setValue(0);
    
    // Create a sequence of small movements to create shake effect
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
    
    // Also trigger the text fade animation
    triggerTextFade();
  };
  
  // Function to fade text from original to "Pro Members Only" and back
  const triggerTextFade = () => {
    // Fade out original text
    Animated.timing(referralTextOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      // Switch text
      setShowProOnlyText(true);
      
      // Fade in "Pro Members Only" text
      Animated.timing(proOnlyTextOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        // Wait a moment
        setTimeout(() => {
          // Fade out "Pro Members Only"
          Animated.timing(proOnlyTextOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            // Switch back to original text
            setShowProOnlyText(false);
            
            // Fade in original text
            Animated.timing(referralTextOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true
            }).start();
          });
        }, 1500); // Show "Pro Members Only" for 1.5 seconds
      });
    });
  };
  
  // Native iOS-style gesture handler for swipe-to-dismiss
  const handleGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const { translationX } = event.nativeEvent;
        // Only allow rightward movement (dismissal)
        if (translationX > 0) {
          // More subtle background opacity change - like iOS
          const progress = Math.min(translationX / width, 1);
          const opacity = 1 - (progress * 0.3); // Only dim by 30% max
          fadeAnim.setValue(opacity);
        }
      }
    }
  );

  const handleGestureEnd = (event) => {
    const { translationX, velocityX } = event.nativeEvent;
    
    // iOS-style dismissal logic: lower threshold + velocity consideration
    const dismissThreshold = width * 0.35; // 35% instead of 50%
    const fastSwipeVelocity = 1200; // Higher velocity threshold
    
    const shouldDismiss = translationX > dismissThreshold || velocityX > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Set dismissing flag to prevent modal from reopening during animation
      setIsDismissing(true);
      
      // Always use consistent slide-out animation regardless of current position or velocity
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: width * 1.2, // Animate completely off-screen
          duration: 350, // Fixed duration for consistent feel
          useNativeDriver: true,
          easing: Easing.out(Easing.ease) // Smoother easing
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350, // Match the slide duration
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start(({ finished }) => {
        if (finished) {
          setModalVisible(false);
          setIsDismissing(false);
          onClose();
        }
      });
    } else {
      // Quick, bouncy snap back - like iOS
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          tension: 150, // iOS-like spring tension
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        })
      ]).start();
    }
  };
  
  // Track if this is a transition from edge swipe to normal modal
  const isTransitioningFromEdgeSwipe = useRef(false);

  // Handle opening and closing animations
  useEffect(() => {
    if (visible && !isDismissing) {
      setModalVisible(true);
      
      if (!isEdgeSwipeActive) {
        // Check if we're transitioning from edge swipe
        if (isTransitioningFromEdgeSwipe.current) {
          // Get the current position from edge swipe and sync it with translateX
          const currentEdgePosition = edgeSwipeX._value || 0;
          const currentModalPosition = Math.max(width + currentEdgePosition, 0);
          
          // Set translateX to match the current visual position
          translateX.setValue(currentModalPosition);
          
          // Then smoothly animate to fully open position
          Animated.timing(translateX, {
            toValue: 0,
            duration: 200, // Shorter duration for smooth transition
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }).start();
          isTransitioningFromEdgeSwipe.current = false;
        } else {
          // Normal button opening - start from completely off-screen right
          translateX.setValue(width * 1.2); // Further off-screen
          fadeAnim.setValue(0);
          
          // Small delay to ensure values are set before animation
          requestAnimationFrame(() => {
            Animated.parallel([
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease)
              }),
              Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
                easing: Easing.out(Easing.ease)
              })
            ]).start();
          });
        }
      } else {
        // Edge swipe - set background visible but let gesture control position
        fadeAnim.setValue(1);
        isTransitioningFromEdgeSwipe.current = true;
      }
    } else if (!visible && modalVisible && !isDismissing) {
      // Only animate out if we're not already dismissing via gesture
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        Animated.timing(translateX, {
          toValue: width * 1.2,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, isEdgeSwipeActive, modalVisible, isDismissing]);



  // Handle close request with animation
  const handleClose = (callback) => {
    // Only trigger onClose if we're not already closing
    if (modalVisible && visible) {
      onClose();
      
      // If a callback was provided, execute it after the modal closes
      if (callback && typeof callback === 'function') {
        setTimeout(() => {
          callback();
        }, 500); // Wait for modal to fully close
      }
    }
  };

  if (!modalVisible) return null;

  // Check for Dynamic Island
  const hasDynamicIsland = insets.top >= 59;

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none" // Using custom animations
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.settingsModalOverlay}>
        {/* Animated backdrop */}
        <Animated.View 
          style={[
            styles.backdrop, 
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close settings"
            accessibilityHint="Dismisses the settings modal"
          />
        </Animated.View>
        
        {/* Modal Content - animated sliding in from right with pan gesture */}
        <PanGestureHandler
          onGestureEvent={handleGesture}
          onHandlerStateChange={handleGestureEnd}
          activeOffsetX={[-1000, 5]} // Allow leftward but start responding after 5px rightward
          activeOffsetY={[-1000, 1000]} // Allow vertical scrolling
          shouldCancelWhenOutside={false}
          enableTrackpadTwoFingerGesture={false}
        >
          <Animated.View 
            style={[
              styles.settingsPanel, 
              { 
                backgroundColor: theme.background,
                borderLeftWidth: 1,
                borderColor: theme.border,
                transform: [{ 
                  translateX: isEdgeSwipeActive && edgeSwipeX
                    ? Animated.add(width, edgeSwipeX) // Follow finger from screen edge
                    : translateX 
                }],
                // Add padding for safe areas
                paddingTop: insets.top,
                paddingBottom: insets.bottom
              }
            ]}
          >
          {/* Removed the panel handle for cleaner look */}
          
          <View style={styles.settingsHeader}>
            <Text 
              style={[styles.settingsTitle, { color: theme.text }]}
              maxFontSizeMultiplier={1.3}
            >
              Settings & Support
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close settings"
              accessibilityHint="Closes the settings screen"
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.settingsContent}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              paddingBottom: responsive.spacing.l // Extra padding at bottom for better scrolling
            }}
          >
            {/* Upgrade to Pro Button - For Free Users */}
            {screenState.userSubscriptionStatus === 'free' && (
              <TouchableOpacity 
                style={[styles.upgradeButton, {
                  backgroundColor: '#3F51B5', // Deep blue for premium feel
                  marginBottom: 20,
                  borderWidth: 0,
                }]}
                onPress={() => {
                  handleClose();
                  navigation.navigate('PricingScreen');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Pro"
                accessibilityHint="Opens the pricing screen to upgrade your subscription"
              >
                <View style={styles.settingButtonContent}>
                  <View style={[styles.settingIconContainer, { 
                    backgroundColor: '#FFFFFF' 
                  }]}>
                    <Ionicons name="compass" size={28} color="#2196F3" />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text 
                      style={[styles.settingButtonText, { 
                        color: '#FFFFFF',
                        fontWeight: 'bold'
                      }]}
                      maxFontSizeMultiplier={1.3}
                      numberOfLines={1}
                    >
                      Upgrade to Pro
                    </Text>
                    <Text 
                      style={[styles.settingButtonSubtext, { 
                        color: 'rgba(255, 255, 255, 0.9)'
                      }]}
                      maxFontSizeMultiplier={1.5}
                      numberOfLines={1}
                    >
                      One-time investment, lifetime value
                    </Text>
                  </View>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            )}

            {/* Received a referral code? Button - For Free Users Only */}
            {screenState.userSubscriptionStatus === 'free' && !screenState.hasEnteredReferralCode && (
              <TouchableOpacity 
                style={[styles.settingButton, { 
                  backgroundColor: theme.card,
                  borderColor: '#4CAF50',
                  borderWidth: 1,
                  marginBottom: 16
                }]}
                onPress={() => {
                  setReferralModalVisible(true);
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Received a referral code?"
                accessibilityHint="Enter a referral code to get 500 AI credits"
              >
                <View style={styles.settingButtonContent}>
                  <View style={[styles.settingIconContainer, { 
                    backgroundColor: '#4CAF5020' 
                  }]}>
                    <Ionicons name="ticket-outline" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text 
                      style={[styles.settingButtonText, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                      numberOfLines={1}
                    >
                      Received a referral code?
                    </Text>
                    <Text 
                      style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                      maxFontSizeMultiplier={1.5}
                      numberOfLines={1}
                    >
                      Get 500 AI credits when you sign up
                    </Text>
                  </View>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            )}
            
            {/* Pro Badge for Pro Users */}
            {(screenState.userSubscriptionStatus === 'pro' || screenState.userSubscriptionStatus === 'unlimited') && (
              <View style={[styles.proBadgeContainer, {
                backgroundColor: 'rgba(63, 81, 181, 0.1)',
                borderColor: '#3F51B5',
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                flexDirection: 'row',
                alignItems: 'center'
              }]}>
                <View style={[styles.settingIconContainer, { 
                  backgroundColor: '#3F51B5',
                  marginRight: 12
                }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text 
                    style={[styles.settingButtonText, { 
                      color: theme.text,
                      fontWeight: 'bold'
                    }]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    Pro Member
                  </Text>
                  <Text 
                    style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={1}
                  >
                    {screenState.userSubscriptionStatus === 'pro' ? 'Lifetime Pro access unlocked' : 'Unlimited AI features enabled'}
                  </Text>
                </View>
                {screenState.userSubscriptionStatus === 'pro' && (
                  <TouchableOpacity 
                    style={[styles.upgradeButtonSmall, {
                      backgroundColor: '#3F51B5',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 20,
                      marginLeft: 'auto'
                    }]}
                    onPress={() => {
                      handleClose();
                      navigation.navigate('PricingScreen');
                    }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Go Unlimited"
                    accessibilityHint="Opens the pricing screen to upgrade to unlimited"
                  >
                    <Text 
                      style={{ color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' }}
                      maxFontSizeMultiplier={1.3}
                    >
                      Go Unlimited
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            
            {/* Refer a Friend Button - For Pro Members */}
            {(screenState.userSubscriptionStatus === 'pro' || screenState.userSubscriptionStatus === 'unlimited') ? (
              <TouchableOpacity 
                style={[styles.settingButton, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  marginBottom: 16
                }]}
                onPress={() => {
                  handleClose();
                  navigation.navigate('ReferralScreen');
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Give 500, Get 500"
                accessibilityHint="Share your referral code for mutual AI credits"
              >
                <View style={styles.settingButtonContent}>
                  <View style={[styles.settingIconContainer, { 
                    backgroundColor: '#4CAF5020' 
                  }]}>
                    <Ionicons name="gift-outline" size={20} color="#4CAF50" />
                  </View>
                  <View style={styles.settingTextContainer}>
                    <Text 
                      style={[styles.settingButtonText, { color: theme.text }]}
                      maxFontSizeMultiplier={1.3}
                      numberOfLines={1}
                    >
                      Give 500, Get 500
                    </Text>
                    <Text 
                      style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                      maxFontSizeMultiplier={1.5}
                      numberOfLines={2} // Allow 2 lines for this longer description
                    >
                      Share code for mutual 500 AI credits
                    </Text>
                  </View>
                </View>
                <View style={styles.referralCountBadge}>
                  <Text 
                    style={styles.referralCountText}
                    maxFontSizeMultiplier={1.3}
                  >
                    {screenState.referralsLeft || 3}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              /* Refer a Friend Button - For Free Users (locked version) */
              <Animated.View 
                style={{
                  transform: [{ translateX: shakeAnim }]
                }}
              >
                <TouchableOpacity 
                  style={[styles.settingButton, { 
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    marginBottom: 16,
                    opacity: 0.8 // Slightly dimmed to indicate it's locked
                  }]}
                  onPress={triggerShake}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Give 500, Get 500 - Pro feature"
                  accessibilityHint="This feature is only available to Pro members"
                >
                  <View style={styles.settingButtonContent}>
                    <View style={[styles.settingIconContainer, { 
                      backgroundColor: '#4CAF5020' 
                    }]}>
                      <Ionicons name="gift-outline" size={20} color="#4CAF50" />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <View style={{ position: 'relative' }}>
                        <Animated.Text 
                          style={[
                            styles.settingButtonText, 
                            { 
                              color: theme.text,
                              opacity: referralTextOpacity,
                              position: showProOnlyText ? 'absolute' : 'relative'
                            }
                          ]}
                          maxFontSizeMultiplier={1.3}
                          numberOfLines={1}
                        >
                          Give 500, Get 500
                        </Animated.Text>
                        {showProOnlyText && (
                          <Animated.Text 
                            style={[
                              styles.settingButtonText, 
                              { 
                                color: '#FF9800',
                                opacity: proOnlyTextOpacity,
                                fontWeight: 'bold'
                              }
                            ]}
                            maxFontSizeMultiplier={1.3}
                            numberOfLines={1}
                          >
                            Pro Members Only
                          </Animated.Text>
                        )}
                      </View>
                      <Text 
                        style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                        numberOfLines={2} // Allow 2 lines for this longer description
                      >
                        Share code for mutual 500 AI credits
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.lockIconContainer]}>
                    <Ionicons name="lock-closed" size={18} color={theme.textSecondary} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            )}
            
            {/* LifeCompassAI Button */}
            <TouchableOpacity 
              style={[styles.settingButton, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                marginBottom: 16
              }]}
              onPress={() => {
                // Close modal and show AI explanation when fully closed
                handleClose(() => {
                  onShowAIExplanation();
                });
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="LifeCompass AI"
              accessibilityHint="Get personalized AI guidance based on your goals and life direction"
            >
              <View style={styles.settingButtonContent}>
                <View style={[styles.settingIconContainer, { 
                  backgroundColor: '#FFD70020'
                }]}>
                  <Ionicons name="sparkles" size={20} color="#FFD700" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text 
                    style={[styles.settingButtonText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    LifeCompassAI
                  </Text>
                  <Text 
                    style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={2} // Allow 2 lines for longer description
                  >
                    AI strategist for personalized goal planning
                  </Text>
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
            
            {/* Achievements Button */}
            <TouchableOpacity 
              style={[styles.settingButton, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                marginBottom: 16
              }]}
              onPress={() => {
                handleClose();
                navigation.navigate('AchievementsScreen');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Achievements"
              accessibilityHint="View your LifeCompass journey achievements"
            >
              <View style={styles.settingButtonContent}>
                <View style={[styles.settingIconContainer, { 
                  backgroundColor: '#FFC10720' 
                }]}>
                  <Ionicons name="trophy-outline" size={20} color="#FFC107" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text 
                    style={[styles.settingButtonText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    Achievements
                  </Text>
                  <Text 
                    style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={1}
                  >
                    Track your LifeCompass journey
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            
            {/* Join Our Community Button */}
            <TouchableOpacity 
              style={[styles.settingButton, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                marginBottom: 16
              }]}
              onPress={() => {
                handleClose();
                navigation.navigate('CommunityScreen');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Join Our Community"
              accessibilityHint="Access your founder code and join our Discord community"
            >
              <View style={styles.settingButtonContent}>
                <View style={[styles.settingIconContainer, { 
                  backgroundColor: '#5865F220'
                }]}>
                  <Ionicons name="people" size={20} color="#5865F2" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text 
                    style={[styles.settingButtonText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    Join Our Community
                  </Text>
                  <Text 
                    style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={1}
                  >
                    Founder code & Discord access
                  </Text>
                </View>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={theme.textSecondary} 
              />
            </TouchableOpacity>
            
            {/* Feedback Button */}
            <TouchableOpacity 
              style={[styles.settingButton, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                marginBottom: 16
              }]}
              onPress={() => {
                handleClose();
                navigation.navigate('FeedbackScreen');
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Send Feedback"
              accessibilityHint="Help us improve the app by sending your feedback"
            >
              <View style={styles.settingButtonContent}>
                <View style={[styles.settingIconContainer, { 
                  backgroundColor: '#2196F320' 
                }]}>
                  <Ionicons name="chatbubble-outline" size={20} color="#2196F3" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text 
                    style={[styles.settingButtonText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    Send Feedback
                  </Text>
                  <Text 
                    style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={1}
                  >
                    Help us improve the app
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            
            {/* Restart Onboarding Option */}
            <TouchableOpacity 
              style={[styles.settingButton, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                marginBottom: 16
              }]}
              onPress={async () => {
                // Check if user is free and has 2 active goals BEFORE closing the modal
                if (screenState.userSubscriptionStatus === 'free') {
                  try {
                    // Get current goals from AsyncStorage
                    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                    const goalsData = await AsyncStorage.getItem('goals');
                    
                    if (goalsData) {
                      const goals = JSON.parse(goalsData);
                      const activeGoals = Array.isArray(goals) ? goals.filter(goal => !goal.completed).length : 0;
                      
                      // If user has 2 or more active goals, show restriction message immediately
                      if (activeGoals >= 2) {
                        setGoalLimitModalVisible(true);
                        return;
                      }
                    }
                  } catch (error) {
                    console.error('Error checking goals for restart onboarding:', error);
                    // Continue with onboarding if we can't check goals
                  }
                }
                
                // Show restart onboarding confirmation modal
                setRestartOnboardingModalVisible(true);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Restart Onboarding"
              accessibilityHint="Go through the app introduction again"
            >
              <View style={styles.settingButtonContent}>
                <View style={[styles.settingIconContainer, { 
                  backgroundColor: '#4CAF5020' 
                }]}>
                  <Ionicons name="help-buoy-outline" size={20} color="#4CAF50" />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text 
                    style={[styles.settingButtonText, { color: theme.text }]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={1}
                  >
                    Restart Onboarding
                  </Text>
                  <Text 
                    style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.5}
                    numberOfLines={1}
                  >
                    Redo app introduction
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            
            {/* Admin Feedback Button removed as requested */}
            
            {/* Data Loss Warning */}
            <View style={[styles.warningContainer, {
              backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
              borderColor: theme.warning,
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              marginTop: 20,
              marginBottom: 24
            }]}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning-outline" size={24} color={theme.warning} />
                <Text 
                  style={[styles.warningTitle, { 
                    color: theme.text,
                    fontWeight: 'bold',
                    marginLeft: 8
                  }]}
                  maxFontSizeMultiplier={1.3}
                >
                  WARNING
                </Text>
              </View>
              <Text 
                style={[styles.warningText, { color: theme.text }]}
                maxFontSizeMultiplier={1.5}
              >
                Deleting this app will permanently erase all your data. Everything is stored locally on your device.
              </Text>
            </View>
            
            {/* Test Mode Toggles - Only visible in dev mode - Moved to bottom */}
            {screenState.showTestModeToggles && (
              <View style={[styles.testModeContainer, {
                backgroundColor: 'rgba(255, 0, 0, 0.05)',
                borderColor: 'rgba(255, 0, 0, 0.2)',
                borderWidth: 1,
                borderRadius: 12,
                padding: 16,
                marginTop: 8,
                marginBottom: 20
              }]}>
                <Text 
                  style={[styles.testModeTitle, {
                    color: theme.text,
                    fontWeight: 'bold',
                    marginBottom: 10
                  }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Development Testing Options
                </Text>
                
                {/* Lifetime Member Toggle */}
                <View style={styles.settingToggleContainer}>
                  <View style={styles.settingToggleContent}>
                    <View style={[styles.settingIconContainer, { 
                      backgroundColor: '#3F51B520'
                    }]}>
                      <Ionicons name="infinite" size={20} color="#3F51B5" />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text 
                        style={[styles.settingButtonText, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                      >
                        Test as Lifetime Member
                      </Text>
                      <Text 
                        style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                        numberOfLines={1}
                      >
                        Test Pro member status
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={screenState.userSubscriptionStatus === 'pro'}
                    onValueChange={onToggleLifetimeMember}
                    trackColor={{ false: theme.border, true: `#3F51B580` }}
                    thumbColor={screenState.userSubscriptionStatus === 'pro' ? '#3F51B5' : '#f4f3f4'}
                    accessible={true}
                    accessibilityRole="switch"
                    accessibilityLabel="Test as lifetime member"
                    accessibilityState={{ checked: screenState.userSubscriptionStatus === 'pro' }}
                  />
                </View>
                
                {/* Test Gift Surprise Button */}
                <TouchableOpacity
                  style={[styles.settingButton, {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                    marginTop: 12
                  }]}
                  onPress={() => {
                    if (onTriggerGiftSurprise) {
                      onTriggerGiftSurprise();
                      onClose(); // Close the settings modal to see the gift
                    }
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Test Pro Gift Surprise"
                  accessibilityHint="Triggers the Pro member gift surprise for testing"
                >
                  <View style={styles.settingButtonContent}>
                    <View style={[styles.settingIconContainer, {
                      backgroundColor: '#FFD70020'
                    }]}>
                      <Ionicons name="gift" size={20} color="#FFD700" />
                    </View>
                    <View style={styles.settingTextContainer}>
                      <Text 
                        style={[styles.settingButtonText, { color: theme.text }]}
                        maxFontSizeMultiplier={1.3}
                        numberOfLines={1}
                      >
                        Test Gift Surprise
                      </Text>
                      <Text 
                        style={[styles.settingButtonSubtext, { color: theme.textSecondary }]}
                        maxFontSizeMultiplier={1.5}
                        numberOfLines={1}
                      >
                        Show Pro upgrade gift
                      </Text>
                    </View>
                  </View>
                  <Ionicons 
                    name="chevron-forward" 
                    size={18} 
                    color={theme.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
        </PanGestureHandler>
        
        {/* Referral Code Input Modal */}
        <ReferralCodeInputModal
          visible={referralModalVisible}
          onClose={() => setReferralModalVisible(false)}
          theme={theme}
          onSuccess={(referralCode) => {
            // Update parent state to hide the referral button
            if (onScreenStateUpdate) {
              onScreenStateUpdate({ hasEnteredReferralCode: true });
            }
            setReferralModalVisible(false);
          }}
        />

        {/* Goal Limit Modal */}
        <Modal
          visible={goalLimitModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setGoalLimitModalVisible(false)}
        >
          <View style={styles.goalLimitOverlay}>
            <Animated.View 
              style={[
                styles.goalLimitModal, 
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  shadowColor: isDarkMode ? '#FFFFFF' : '#000000'
                }
              ]}
            >
              {/* Icon */}
              <View style={[styles.goalLimitIcon, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name="flag-outline" size={28} color={theme.primary} />
              </View>
              
              {/* Title */}
              <Text 
                style={[styles.goalLimitTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.2}
              >
                Goal Limit Reached
              </Text>
              
              {/* Message */}
              <Text 
                style={[styles.goalLimitMessage, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                Complete or remove active goals before restarting onboarding.
              </Text>
              
              {/* Button */}
              <TouchableOpacity
                style={[styles.goalLimitButton, { backgroundColor: theme.primary }]}
                onPress={() => setGoalLimitModalVisible(false)}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Text 
                  style={styles.goalLimitButtonText}
                  maxFontSizeMultiplier={1.2}
                >
                  Got it
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        {/* Restart Onboarding Confirmation Modal */}
        <Modal
          visible={restartOnboardingModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRestartOnboardingModalVisible(false)}
        >
          <View style={styles.restartOverlay}>
            <Animated.View 
              style={[
                styles.restartModal, 
                { 
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  shadowColor: isDarkMode ? '#FFFFFF' : '#000000'
                }
              ]}
            >
              {/* Icon */}
              <View style={[styles.restartIcon, { backgroundColor: `${theme.primary}15` }]}>
                <Ionicons name="refresh-outline" size={28} color={theme.primary} />
              </View>
              
              {/* Title */}
              <Text 
                style={[styles.restartTitle, { color: theme.text }]}
                maxFontSizeMultiplier={1.2}
              >
                Start Fresh?
              </Text>
              
              {/* Message */}
              <Text 
                style={[styles.restartMessage, { color: theme.textSecondary }]}
                maxFontSizeMultiplier={1.3}
              >
                This will guide you through setting up your goals again.
              </Text>
              
              {/* Buttons */}
              <View style={styles.restartButtonContainer}>
                <TouchableOpacity
                  style={[styles.restartCancelButton, { borderColor: theme.border }]}
                  onPress={() => setRestartOnboardingModalVisible(false)}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Text 
                    style={[styles.restartCancelText, { color: theme.textSecondary }]}
                    maxFontSizeMultiplier={1.2}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.restartConfirmButton, { backgroundColor: theme.primary }]}
                  onPress={async () => {
                    setRestartOnboardingModalVisible(false);
                    handleClose();
                    
                    // Update the app setting to indicate onboarding should be shown again
                    if (typeof updateAppSetting === 'function') {
                      await updateAppSetting('onboardingCompleted', false);
                      // Navigate to the Onboarding screen
                      navigation.navigate('Onboarding');
                    } else {
                      alert("Unable to restart onboarding. Please try again later.");
                    }
                  }}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Start Fresh"
                >
                  <Text 
                    style={styles.restartConfirmText}
                    maxFontSizeMultiplier={1.2}
                  >
                    Start Fresh
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  settingsModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    width: '100%',
    height: '100%',
  },
  settingsPanel: {
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    paddingBottom: 24,
    width: '85%', // Control width of the panel
    height: '100%', // Full height
    zIndex: 1, // Ensure it's above the backdrop
  },
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 60, // Fixed height for predictable layout
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsContent: {
    paddingHorizontal: 20,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    minHeight: 80, // Fixed height for predictable layout
    width: '100%', // Ensure full width
    backgroundColor: 'transparent', // Default to transparent background
  },
  settingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Take up available space
    minWidth: 0, // Allow text to shrink properly
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0, // Don't allow icon to shrink
  },
  settingTextContainer: {
    flex: 1,
    minWidth: 0, // Important for text truncation
  },
  settingButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingButtonSubtext: {
    fontSize: 12,
    marginTop: 2,
  },

  // Settings toggle container
  settingToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0, // Allows text container to shrink
  },

  // Test Mode container
  testModeContainer: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  testModeTitle: {
    fontSize: 16,
    marginBottom: 10,
  },
  
  // Upgrade Button Styles
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    minHeight: 80, // Fixed height for predictable layout
    width: '100%', // Ensure full width
  },
  proBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    minHeight: 80, // Fixed height for predictable layout
    width: '100%', // Ensure full width
  },
  upgradeButtonSmall: {
    padding: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    flexShrink: 0, // Prevent shrinking
  },

  // Referral count badge for the "Give 500, Get 500" button
  referralCountBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    flexShrink: 0, // Prevent badge from squishing
  },
  referralCountText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12
  },
  
  // Lock icon container for locked features
  lockIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    flexShrink: 0,
  },
  
  // Warning container styles
  warningContainer: {
    marginVertical: 15,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTitle: {
    fontSize: 16,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Goal Limit Modal styles
  goalLimitOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  goalLimitModal: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  goalLimitIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  goalLimitTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  goalLimitMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  goalLimitButton: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  goalLimitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
  },

  // Restart Onboarding Modal styles
  restartOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  restartModal: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  restartIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  restartTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.2,
  },
  restartMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 4,
  },
  restartButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  restartCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restartCancelText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  restartConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restartConfirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.1,
  }
});

export default SettingsModal;
// src/components/ai/AISideMenu/index.js
import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  ScrollView, 
  Animated, 
  Easing,
  Platform,
  BackHandler
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

/**
 * AISideMenu - Side menu with smooth animations for both opening and closing
 * User can close by tapping outside the menu
 */
const AISideMenu = ({ 
  visible = false,
  menuState = 'closed', // 'closed', 'opening', 'open', 'closing'
  onClose,
  onNewConversation,
  onGoToConversations,
  onGoToPersonalKnowledge,
  aiModelTier = 'guide',
  userDocuments = [],
  userKnowledgeEnabled = true,
  subscriptionStatus = 'free',
  navigation
}) => {
  const { theme } = useTheme();
  const menuAnimX = useRef(new Animated.Value(300)).current;
  const gestureTranslateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  
  // Handle back button press (Android)
  useEffect(() => {
    const backAction = () => {
      if (modalVisible && menuState !== 'closed') {
        onClose();
        return true; // Prevent default behavior
      }
      return false; // Let default behavior happen
    };
    
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    
    return () => backHandler.remove(); // Clean up on unmount
  }, [modalVisible, menuState, onClose]);
  
  // Handle opening and closing animations (simplified without edge swipe)
  useEffect(() => {
    const visible = ['opening', 'open'].includes(menuState);
    
    if (visible && !isDismissing) {
      setModalVisible(true);
      
      // Normal opening - start from completely off-screen right
      menuAnimX.setValue(300);
      gestureTranslateX.setValue(0);
      fadeAnim.setValue(0);
      
      setIsAnimating(true);
      
      // Small delay to ensure values are set before animation
      requestAnimationFrame(() => {
        // Animate menu to visible position (slide in from right) with backdrop fade
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }),
          Animated.timing(menuAnimX, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.cubic)
          })
        ]).start(() => {
          setIsAnimating(false);
        });
      });
    } else if (!visible && modalVisible && !isDismissing) {
      // Only animate out if we're not already dismissing via gesture
      setIsAnimating(true);
      
      // Reset gesture translation and animate menu out to the right with backdrop fade
      gestureTranslateX.setValue(0);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(menuAnimX, {
          toValue: 300,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        })
      ]).start(() => {
        setIsAnimating(false);
        // Only hide the modal after animation completes
        setModalVisible(false);
      });
    }
  }, [menuState, modalVisible, isDismissing]);
  
  // Get subscription label
  const getSubscriptionLabel = () => {
    switch(subscriptionStatus) {
      case 'pro':
        return 'Navigator Plan';
      case 'unlimited':
        return 'Compass Plan';
      default:
        return 'Free';
    }
  };
  
  // Handle closing the menu safely - always allow closing
  const handleCloseMenu = () => {
    // Only trigger onClose if we're not already closing
    if (onClose && modalVisible && !isDismissing) {
      onClose();
    }
  };
  
  // Navigate to the pricing screen
  const goToPricingScreen = () => {
    if (navigation) {
      onClose(); // Close menu first
      setTimeout(() => {
        navigation.navigate('PricingScreen'); // Then navigate
      }, 300);
    }
  };

  // Navigate to the login screen
  const goToLoginScreen = () => {
    if (navigation) {
      onClose(); // Close menu first
      setTimeout(() => {
        navigation.navigate('AILoginScreen'); // Updated screen name
      }, 300);
    }
  };
  
  // Navigate to the watch ads screen
  const goToWatchAdsScreen = () => {
    if (navigation) {
      onClose(); // Close menu first
      setTimeout(() => {
        navigation.navigate('WatchAdsScreen');
      }, 300);
    }
  };

  // iOS-style gesture handler for swipe-to-dismiss (similar to SettingsModal)
  const handleGesture = Animated.event(
    [{ nativeEvent: { translationX: gestureTranslateX } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const { translationX } = event.nativeEvent;
        // Only allow rightward movement (dismissal)
        if (translationX > 0) {
          // More subtle background opacity change - like iOS
          const progress = Math.min(translationX / 300, 1);
          const opacity = 1 - (progress * 0.3); // Only dim by 30% max
          fadeAnim.setValue(opacity);
        }
      }
    }
  );

  const handleGestureEnd = (event) => {
    const { translationX, velocityX } = event.nativeEvent;
    
    // iOS-style dismissal logic: lower threshold + velocity consideration
    const dismissThreshold = 300 * 0.35; // 35% of menu width
    const fastSwipeVelocity = 1200; // Higher velocity threshold
    
    const shouldDismiss = translationX > dismissThreshold || velocityX > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Set dismissing flag to prevent modal from reopening during animation
      setIsDismissing(true);
      
      // Smooth dismissal animation
      Animated.parallel([
        Animated.timing(gestureTranslateX, {
          toValue: 300 * 1.2, // Animate completely off-screen
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
        Animated.spring(gestureTranslateX, {
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
  
  // Return null when menu shouldn't be rendered at all
  if (!modalVisible && menuState === 'closed') {
    return null;
  }
  
  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={handleCloseMenu}
      // Set a high hardwareAccelerated value for Android performance
      hardwareAccelerated={true}
    >
      <View style={styles.sideMenuContainer}>
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
            onPress={handleCloseMenu}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close menu"
            accessibilityHint="Dismisses the side menu"
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
            style={[styles.sideMenu, { 
              backgroundColor: theme.background,
              borderLeftColor: theme.border,
              borderLeftWidth: 1,
              transform: [{ 
                translateX: Animated.add(menuAnimX, gestureTranslateX)
              }]
            }]}
          >
          {/* Use a flex container for better structure */}
          <View style={{ flex: 1, flexDirection: 'column' }}>
            {/* Just empty space for status bar - no title or close button */}
            <View 
              style={[styles.statusBarSpacer, { 
                paddingTop: Platform.OS === 'ios' ? 50 : 25 
              }]}
            />
            
            {/* Main scrollable content */}
            <ScrollView style={{ flex: 1 }}>
              {/* New Chat Button */}
              <TouchableOpacity 
                style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  onClose(); // Close menu first
                  setTimeout(() => {
                    onNewConversation(); // Then execute the action
                  }, 300);
                }}
              >
                <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>New Conversation</Text>
              </TouchableOpacity>
              
              {/* Conversations List */}
              <TouchableOpacity 
                style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  onClose(); // Close menu first
                  setTimeout(() => {
                    onGoToConversations(); // Then execute the action
                  }, 300);
                }}
              >
                <Ionicons name="chatbubbles-outline" size={24} color={theme.primary} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>Conversations</Text>
              </TouchableOpacity>
              
              {/* Personal Knowledge Screen - FIXED */}
              <TouchableOpacity 
                style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                onPress={() => {
                  onClose(); // Close menu first
                  setTimeout(() => {
                    // Navigate to PersonalKnowledgeScreen instead of AIContextScreen
                    if (navigation) {
                      navigation.navigate('PersonalKnowledgeScreen');
                    } else if (onGoToPersonalKnowledge) {
                      onGoToPersonalKnowledge(); // Fallback to existing handler
                    }
                  }, 300);
                }}
              >
                <Ionicons name="document-outline" size={24} color={theme.primary} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>Personal Knowledge</Text>
                {userDocuments.length > 0 && (
                  <View style={styles.documentIndicator}>
                    <Text style={[styles.documentCount, { color: theme.textSecondary }]}>
                      {userDocuments.length} document{userDocuments.length !== 1 ? 's' : ''}
                    </Text>
                    {userKnowledgeEnabled && (
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    )}
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
            
            {/* Fixed Footer Section - NOT part of ScrollView */}
            <View style={{ 
              borderTopWidth: 1, 
              borderTopColor: theme.border,
              paddingBottom: 20, // Add padding at the bottom to shift up from the very bottom
              marginBottom: Platform.OS === 'ios' ? 30 : 10 // Add extra margin for iOS devices
            }}>
              {/* Login Button - New Addition */}
              <TouchableOpacity 
                style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                onPress={goToLoginScreen}
              >
                <Ionicons name="log-in-outline" size={24} color={theme.primary} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>
                  Login / Account
                </Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
              
              {/* FREE CREDITS Button - NEW */}
              <TouchableOpacity 
                style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                onPress={goToWatchAdsScreen}
              >
                <Ionicons name="gift-outline" size={24} color={theme.primary} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>
                  Get Free Credits
                </Text>
                <View style={[styles.creditsTag, { 
                  backgroundColor: '#4CAF50',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2
                }]}>
                  <Text style={styles.creditsTagText}>Free</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              
              {/* Subscription Info */}
              <TouchableOpacity 
                style={[styles.subscriptionInfo, { borderBottomColor: theme.border }]}
                onPress={goToPricingScreen}
              >
                <Ionicons name="ribbon-outline" size={24} color={theme.primary} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>
                  Current Plan
                </Text>
                <View style={[styles.subscriptionBadge, { 
                  backgroundColor: subscriptionStatus === 'free' ? '#9E9E9E' : 
                               subscriptionStatus === 'pro' ? '#3F51B5' : '#673AB7',
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 2
                }]}>
                  <Text style={styles.subscriptionBadgeText}>
                    {getSubscriptionLabel()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        </PanGestureHandler>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sideMenuContainer: {
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
  sideMenu: {
    width: '70%',
    maxWidth: 300,
    height: '100%',
    position: 'absolute',
    top: 0,
    right: 0, // Keep on right side
    bottom: 0,
  },
  statusBarSpacer: {
    width: '100%',
    // No content, just spacing for status bar
  },
  sideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  sideMenuItemText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  documentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentCount: {
    fontSize: 12,
    marginRight: 6,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  subscriptionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // New styles for credits tag
  creditsTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  creditsTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  }
});

export default AISideMenu;
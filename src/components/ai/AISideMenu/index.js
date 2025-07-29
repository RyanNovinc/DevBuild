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
  const [isAnimating, setIsAnimating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Make sure modal is dismissed when not needed
  useEffect(() => {
    // Only show modal when it should be visible based on menuState
    if (['opening', 'open'].includes(menuState)) {
      setModalVisible(true);
    }
    
    // Hide modal immediately if menuState is 'closed'
    if (menuState === 'closed') {
      setModalVisible(false);
    }
  }, [menuState]);
  
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
  
  // Effect to animate the side menu
  useEffect(() => {
    if (menuState === 'opening') {
      // Reset the animation value for consistent behavior
      menuAnimX.setValue(300);
      
      setIsAnimating(true);
      
      // Animate menu to visible position (slide in from right)
      Animated.timing(menuAnimX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }).start(() => {
        setIsAnimating(false);
      });
    } else if (menuState === 'closing') {
      setIsAnimating(true);
      
      // Animate menu out to the right
      Animated.timing(menuAnimX, {
        toValue: 300,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }).start(() => {
        setIsAnimating(false);
        // Only hide the modal after animation completes
        setModalVisible(false);
      });
    }
  }, [menuState]);
  
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
    if (onClose) {
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
        <TouchableOpacity 
          style={styles.sideMenuOverlay}
          activeOpacity={1}
          onPress={handleCloseMenu}
        />
        <Animated.View 
          style={[styles.sideMenu, { 
            backgroundColor: theme.background,
            borderLeftColor: theme.border,
            borderLeftWidth: 1,
            transform: [{ translateX: menuAnimX }]
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
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>AI Context</Text>
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  sideMenuContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sideMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
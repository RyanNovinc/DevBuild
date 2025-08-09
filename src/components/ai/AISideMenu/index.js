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
  BackHandler,
  Image
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../context/ProfileContext';
import { useAppContext } from '../../../context/AppContext';
import { DefaultAvatar } from '../../AvatarComponents';
import { getSubscriptionInfo } from '../../../services/SubscriptionService';

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
  const { user, isAuthenticated, logout } = useAuth();
  const { profile } = useProfile();
  const appContext = useAppContext() || {};
  const { 
    goals = [], 
    projects = [], 
    tasks = []
  } = appContext;
  const menuAnimX = useRef(new Animated.Value(300)).current;
  const gestureTranslateX = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isAnimating, setIsAnimating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [realSubscriptionInfo, setRealSubscriptionInfo] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Calculate stats from real data (exact same logic as ProfileScreen)
  const calculateStats = () => {
    // Create a map of completed goals for fast lookup
    const completedGoalsMap = {};
    if (Array.isArray(goals)) {
      goals.forEach(goal => {
        if (goal.completed === true) {
          completedGoalsMap[goal.id] = true;
        }
      });
    }

    // Create a set of valid goal IDs for checking deleted goals
    const validGoalIds = new Set();
    if (Array.isArray(goals)) {
      goals.forEach(goal => validGoalIds.add(goal.id));
    }

    // Count active goals (not completed)
    const activeGoalsCount = goals.filter(goal => !goal.completed).length;

    // Count active projects and create completedProjectsMap for task filtering
    const completedProjectsMap = {};
    const activeProjectsCount = projects.filter(project => {
      // Skip projects that belong to deleted goals
      if (project.goalId && !validGoalIds.has(project.goalId)) {
        completedProjectsMap[project.id] = true;
        return false;
      }

      // Skip projects that belong to completed goals
      if (project.goalId && completedGoalsMap[project.goalId]) {
        completedProjectsMap[project.id] = true;
        return false;
      }

      // Skip completed projects
      if (project.completed === true || project.status === 'done') {
        completedProjectsMap[project.id] = true;
        return false;
      }

      return true;
    }).length;

    // Count active tasks with hierarchical filtering
    const activeTasksCount = tasks.filter(task => {
      // Skip tasks that belong to completed projects
      if (task.projectId && completedProjectsMap[task.projectId]) {
        return false;
      }

      // Skip tasks directly linked to completed goals
      if (task.goalId && completedGoalsMap[task.goalId]) {
        return false;
      }

      // Skip tasks directly linked to deleted goals
      if (task.goalId && !validGoalIds.has(task.goalId)) {
        return false;
      }

      // Skip completed tasks
      return !task.completed && task.status !== 'done';
    }).length;

    return {
      goalsCount: activeGoalsCount,
      projectsCount: activeProjectsCount,
      tasksCount: activeTasksCount
    };
  };
  
  const stats = calculateStats();
  
  // Load real subscription info when user is authenticated
  useEffect(() => {
    const loadSubscriptionInfo = async () => {
      if (isAuthenticated && user?.idToken) {
        try {
          const subscriptionInfo = await getSubscriptionInfo(user.idToken);
          setRealSubscriptionInfo(subscriptionInfo);
        } catch (error) {
          console.warn('Failed to load subscription info in side menu:', error);
          // Keep realSubscriptionInfo as null to use fallback
        }
      }
    };

    loadSubscriptionInfo();
  }, [isAuthenticated, user?.idToken]);
  
  // Get user initials for placeholder
  const getInitials = () => {
    const displayName = profile?.name || user?.displayName || 'User';
    if (!displayName || displayName.trim() === '') return '?';
    
    return displayName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Render the profile image based on priority: custom photo > legacy avatar > initials
  const renderProfileImage = () => {
    const profileImageSize = 72;
    const borderRadius = profileImageSize / 2;
    
    if (profile?.profileImage) {
      // Priority 1: Render actual profile image (custom photo)
      return (
        <Image 
          source={{ uri: profile.profileImage }} 
          style={{
            width: profileImageSize,
            height: profileImageSize,
            borderRadius: borderRadius,
            borderWidth: 2,
            borderColor: theme.border
          }} 
        />
      );
    } else if (profile?.defaultAvatar) {
      // Priority 2: Render legacy default avatar
      return (
        <View style={{
          width: profileImageSize,
          height: profileImageSize,
          borderRadius: borderRadius,
          borderWidth: 2,
          borderColor: theme.border,
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <DefaultAvatar
            size={profileImageSize - 4} // Account for border
            colorIndex={profile.defaultAvatar.colorIndex}
            iconName={profile.defaultAvatar.iconName}
            initials={getInitials()}
          />
        </View>
      );
    } else {
      // Priority 3: Default placeholder with initials
      return (
        <View style={{
          width: profileImageSize,
          height: profileImageSize,
          borderRadius: borderRadius,
          backgroundColor: theme.surface,
          borderWidth: 2,
          borderColor: theme.border,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{
            color: theme.textSecondary,
            fontWeight: '700',
            fontSize: profileImageSize * 0.35
          }}>
            {getInitials()}
          </Text>
        </View>
      );
    }
  };
  
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

  // Handle login/logout action
  const handleLoginLogoutAction = () => {
    if (isAuthenticated) {
      // Show custom confirmation dialog for logout
      setShowLogoutConfirm(true);
    } else {
      // Navigate to login screen
      if (navigation) {
        onClose(); // Close menu first
        setTimeout(() => {
          navigation.navigate('AILoginScreen');
        }, 300);
      }
    }
  };

  // Handle logout confirmation
  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onClose(); // Close menu first
    setTimeout(() => {
      logout(); // Then logout
    }, 300);
  };

  // Handle cancel logout
  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
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
                activeOpacity={0.7}
              >
                <Ionicons name="add-circle-outline" size={22} color={theme.textSecondary} style={{ opacity: 0.8 }} />
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
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubbles-outline" size={22} color={theme.textSecondary} style={{ opacity: 0.8 }} />
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
                activeOpacity={0.7}
              >
                <Ionicons name="document-outline" size={22} color={theme.textSecondary} style={{ opacity: 0.8 }} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>Personal Knowledge</Text>
                {userDocuments.length > 0 && (
                  <View style={styles.documentIndicator}>
                    <Text style={[styles.documentCount, { color: theme.textSecondary }]}>
                      {userDocuments.length} document{userDocuments.length !== 1 ? 's' : ''}
                    </Text>
                    {userKnowledgeEnabled && (
                      <Ionicons name="checkmark-circle" size={14} color="#4CAF50" style={{ opacity: 0.9 }} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Subtle Section Divider */}
              <View style={styles.sectionDivider} />
              
              {/* Enhanced User Info Section - Display comprehensive info in the middle space */}
              {isAuthenticated && user && (
                <View style={styles.userInfoSection}>
                  <View style={styles.userInfoCard}>
                    {/* User Avatar */}
                    <View style={styles.avatarContainer}>
                      {renderProfileImage()}
                    </View>
                    
                    {/* User Info */}
                    <View style={styles.userDetails}>
                      <Text style={[styles.userInfoName, { color: theme.text }]}>
                        {profile?.name || user?.displayName || 'User'}
                      </Text>
                      <Text style={[styles.userInfoEmail, { color: theme.textSecondary }]}>
                        {user?.email || ''}
                      </Text>
                    </View>
                    
                    {/* Subscription Status - Real Data */}
                    <View style={styles.planContainer}>
                      <Text style={[styles.planLabel, { color: theme.textSecondary }]}>
                        Current Plan
                      </Text>
                      <Text style={[styles.planName, { color: theme.text }]}>
                        {realSubscriptionInfo?.formattedTierName || 
                         (subscriptionStatus === 'pro' ? 'Navigator' : 
                          subscriptionStatus === 'unlimited' ? 'Compass' : 'Free')}
                      </Text>
                    </View>
                    
                    {/* Renewal Info - Real Data */}
                    <View style={styles.renewalContainer}>
                      <Text style={[styles.renewalLabel, { color: theme.textSecondary }]}>
                        {(realSubscriptionInfo?.isFreeTier ?? (subscriptionStatus === 'free')) ? 'Credits reset' : 'Renews'}
                      </Text>
                      <Text style={[styles.renewalValue, { color: theme.text }]}>
                        {realSubscriptionInfo?.formattedRefreshDate || 
                         (subscriptionStatus === 'free' ? '18h' : 'Mar 15')}
                      </Text>
                    </View>
                    
                    {/* Stats - Minimal Grid with Real Data */}
                    <View style={styles.statsGrid}>
                      <View style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>
                          {stats.goalsCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                          {stats.goalsCount === 1 ? 'Goal' : 'Goals'}
                        </Text>
                      </View>
                      <View style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>
                          {stats.projectsCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                          {stats.projectsCount === 1 ? 'Project' : 'Projects'}
                        </Text>
                      </View>
                      <View style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: theme.text }]}>
                          {stats.tasksCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                          {stats.tasksCount === 1 ? 'Task' : 'Tasks'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
            
            {/* Fixed Footer Section - NOT part of ScrollView */}
            <View style={{ 
              borderTopWidth: 0.5, 
              borderTopColor: theme.border,
              paddingTop: 8,
              paddingBottom: 20,
              marginBottom: Platform.OS === 'ios' ? 30 : 10,
              opacity: 0.95
            }}>
              {/* Login/Logout Button */}
              <TouchableOpacity 
                style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                onPress={handleLoginLogoutAction}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isAuthenticated ? "log-out-outline" : "log-in-outline"} 
                  size={22} 
                  color={isAuthenticated ? "#FF3B30" : theme.textSecondary}
                  style={{ opacity: isAuthenticated ? 1 : 0.8 }}
                />
                <Text style={[styles.sideMenuItemText, { color: isAuthenticated ? "#FF3B30" : theme.text }]}>
                  {isAuthenticated ? "Log Out" : "Login"}
                </Text>
              </TouchableOpacity>
              
              {/* FREE CREDITS Button - NEW */}
              <TouchableOpacity 
                style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                onPress={goToWatchAdsScreen}
                activeOpacity={0.7}
              >
                <Ionicons name="gift-outline" size={22} color={theme.textSecondary} style={{ opacity: 0.8 }} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>
                  Get Free Credits
                </Text>
                <View style={styles.creditsTag}>
                  <Text style={styles.creditsTagText}>Free</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} style={{ marginLeft: 6, opacity: 0.6 }} />
              </TouchableOpacity>
              
              {/* Pricing/Plans Button */}
              <TouchableOpacity 
                style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                onPress={goToPricingScreen}
                activeOpacity={0.7}
              >
                <Ionicons name="star-outline" size={22} color={theme.textSecondary} style={{ opacity: 0.8 }} />
                <Text style={[styles.sideMenuItemText, { color: theme.text }]}>
                  Plans & Pricing
                </Text>
                <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} style={{ opacity: 0.6 }} />
              </TouchableOpacity>
              
            </View>
          </View>
        </Animated.View>
        </PanGestureHandler>
      </View>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showLogoutConfirm}
          onRequestClose={handleCancelLogout}
        >
          <View style={styles.logoutModalOverlay}>
            <View style={[styles.logoutModalContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.logoutModalTitle, { color: theme.text }]}>
                Log Out
              </Text>
              <Text style={[styles.logoutModalMessage, { color: theme.textSecondary }]}>
                Are you sure you want to log out?
              </Text>
              
              <View style={styles.logoutModalButtons}>
                <TouchableOpacity
                  style={[styles.logoutModalButton, styles.logoutCancelButton, { backgroundColor: theme.background }]}
                  onPress={handleCancelLogout}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.logoutButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.logoutModalButton, styles.logoutConfirmButton]}
                  onPress={handleConfirmLogout}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.logoutButtonText, styles.logoutConfirmText]}>
                    Log Out
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 0.5,
    opacity: 0.95,
  },
  sideMenuItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 18,
    flex: 1,
    letterSpacing: 0.3,
  },
  documentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentCount: {
    fontSize: 11,
    fontWeight: '500',
    marginRight: 8,
    opacity: 0.7,
    letterSpacing: 0.2,
  },
  // Enhanced styles for credits tag with minimalist design
  creditsTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  creditsTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  // Section divider for visual separation
  sectionDivider: {
    height: 1,
    backgroundColor: 'transparent',
    marginVertical: 12,
    marginHorizontal: 24,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.3,
  },
  // Professional minimalist user info styles
  userInfoSection: {
    padding: 24,
    marginVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  userInfoCard: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  userDetails: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfoName: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  userInfoEmail: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
    fontWeight: '400',
  },
  planContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  planLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    opacity: 0.6,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  renewalContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  renewalLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    opacity: 0.6,
  },
  renewalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.6,
  },
  logoutButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  // Custom logout modal styles - professional minimalist
  logoutModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoutModalContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  logoutModalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
    fontWeight: '400',
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  logoutModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutCancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  logoutConfirmButton: {
    backgroundColor: '#FF3B30',
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  }
});

export default AISideMenu;
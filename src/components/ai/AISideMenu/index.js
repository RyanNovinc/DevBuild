// src/components/ai/AISideMenu/index.js
import React, { useEffect, useState, useRef } from 'react';
import AchievementService from '../../../services/AchievementService';
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
  Image,
  Alert
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../context/ProfileContext';
import { useAppContext } from '../../../context/AppContext';
import { DefaultAvatar } from '../../AvatarComponents';
import { getSubscriptionInfo } from '../../../services/SubscriptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../../config/apiConfig';
import ProGiftSurprise from '../../ProGiftSurprise';
import ReferralSummaryPopup from '../../ReferralSummaryPopup';
import ReferralService from '../../../screens/Referral/ReferralService';
import * as FeatureExplorerTracker from '../../../services/FeatureExplorerTracker';

/**
 * ClaimAIAccessButton - Button to claim AI access for founders
 */
const ClaimAIAccessButton = ({ theme, onClose, subscriptionStatus, realSubscriptionInfo, user }) => {
  const [aiAccessInfo, setAiAccessInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [claimedTier, setClaimedTier] = useState(null);

  // Check if user has unclaimed AI access
  useEffect(() => {
    checkAIAccessEligibility();
  }, [subscriptionStatus, realSubscriptionInfo]);

  const checkAIAccessEligibility = async () => {
    try {
      console.log('[ClaimAIAccess] Checking eligibility...');
      console.log('[ClaimAIAccess] Subscription status:', subscriptionStatus);
      console.log('[ClaimAIAccess] Real subscription info:', realSubscriptionInfo);
      
      // Check local receipt for Pro Access purchase
      const hasProAccess = await checkLocalProAccessReceipt();
      console.log('[ClaimAIAccess] Has Pro Access:', hasProAccess);
      if (!hasProAccess) return;

      // Check if already claimed
      const alreadyClaimed = await AsyncStorage.getItem('aiAccessClaimed');
      console.log('[ClaimAIAccess] Already claimed:', alreadyClaimed);
      if (alreadyClaimed) return;

      // Show claim button
      console.log('[ClaimAIAccess] Showing claim button!');
      setAiAccessInfo({ hasAccess: true });
    } catch (error) {
      console.error('Error checking AI access eligibility:', error);
    }
  };

  const checkLocalProAccessReceipt = async () => {
    try {
      // MOCK: For testing, check if user has premium/pro status
      // This simulates them being one of the first 1000 founders
      
      // Check if they have pro access (you can set this in login screen)
      const proAccessPurchased = await AsyncStorage.getItem('proAccessPurchased');
      if (proAccessPurchased === 'true') {
        return true;
      }
      
      // MOCK: Also check subscription status for testing
      if (realSubscriptionInfo?.isProTier || subscriptionStatus === 'pro' || subscriptionStatus === 'unlimited') {
        // Set mock founder status for testing
        await AsyncStorage.setItem('proAccessPurchased', 'true');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking local receipt:', error);
      return false;
    }
  };

  const handleClaimAIAccess = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // For production, uncomment this to use real Lambda:
      /*
      const response = await fetch(`${API_BASE_URL}/ai/claim-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.email || user?.username,
          action: 'claimAIAccess'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const { aiTier, purchaseRank, message } = result;
      */
      
      // MOCK for testing (remove in production):
      await new Promise(resolve => setTimeout(resolve, 1500));
      const result = {
        aiTier: 'MAX',
        purchaseRank: 47,
        message: 'Congratulations! You\'re founder #47 and have been granted AI Max access!'
      };
      
      // Mark as claimed locally
      await AsyncStorage.setItem('aiAccessClaimed', 'true');
      await AsyncStorage.setItem('userAITier', result.aiTier);
      await AsyncStorage.setItem('userPurchaseRank', result.purchaseRank.toString());
      
      // Show success
      setClaimedTier(result.aiTier);
      setShowSuccessModal(true);
      setAiAccessInfo(null); // Hide claim button
      
    } catch (error) {
      console.error('Error claiming AI access:', error);
      alert('Error claiming AI access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!aiAccessInfo?.hasAccess) {
    return null;
  }

  return (
    <>
      <TouchableOpacity
        style={[styles.claimButton, { 
          backgroundColor: theme.surface,
          borderWidth: 1,
          borderColor: theme.border
        }]}
        onPress={handleClaimAIAccess}
        disabled={loading}
        activeOpacity={0.7}
      >
        <View style={styles.claimButtonContent}>
          <Ionicons name="sparkles" size={16} color={theme.text} style={{ opacity: 0.8 }} />
          <Text style={[styles.claimButtonText, { color: theme.text }]}>
            {loading ? 'Processing...' : 'Claim AI Access'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Success Modal */}
      {showSuccessModal && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showSuccessModal}
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.successModalOverlay}>
            <View style={[styles.successModalContainer, { backgroundColor: theme.surface }]}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
              <Text style={[styles.successModalTitle, { color: theme.text }]}>
                Congratulations!
              </Text>
              <Text style={[styles.successModalMessage, { color: theme.textSecondary }]}>
                You've successfully claimed your AI {claimedTier} access!
              </Text>
              
              <TouchableOpacity
                style={[styles.successModalButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => {
                  setShowSuccessModal(false);
                  onClose();
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.successModalButtonText}>
                  Start Using AI
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

/**
 * ClaimAILightButton - Button to claim 1 month AI Light for premium mock users
 */
const ClaimAILightButton = ({ theme, subscriptionStatus, realSubscriptionInfo }) => {
  const { isAuthenticated } = useAuth(); // Add auth context
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);

  // Check if user should see the AI Light claim button
  useEffect(() => {
    checkShouldShowAILightButton();
  }, [subscriptionStatus, realSubscriptionInfo, isAuthenticated]);

  const checkShouldShowAILightButton = async () => {
    try {
      console.log('ClaimAILightButton DEBUG:', {
        subscriptionStatus,
        realSubscriptionInfo,
        isProTier: realSubscriptionInfo?.isProTier,
        isAuthenticated
      });
      
      // Only show if user is authenticated (logged in)
      if (!isAuthenticated) {
        setShouldShowButton(false);
        console.log('ClaimAILightButton: NOT showing - user not authenticated');
        return;
      }
      
      // Check if user is a founder (first 1000 users who bought the app)
      const proAccessPurchased = await AsyncStorage.getItem('proAccessPurchased');
      const isFounder = proAccessPurchased === 'true';
      
      // Check if user has premium/pro status (real subscription)
      const isPremiumMock = subscriptionStatus === 'pro' || 
                           subscriptionStatus === 'unlimited' ||
                           realSubscriptionInfo?.isProTier;
      
      // Only show for founders or premium users
      const shouldShow = isFounder || isPremiumMock;
      
      console.log('ClaimAILightButton isFounder:', isFounder);
      console.log('ClaimAILightButton isPremiumMock:', isPremiumMock);
      console.log('ClaimAILightButton shouldShow:', shouldShow);
      
      if (shouldShow) {
        // Check if already claimed
        const alreadyClaimedAILight = await AsyncStorage.getItem('aiLightGiftClaimed');
        
        if (!alreadyClaimedAILight) {
          // Only show if not yet claimed
          setShouldShowButton(true);
          console.log('ClaimAILightButton: SHOWING - founder/premium user, not yet claimed');
        } else {
          // Already claimed, don't show
          setShouldShowButton(false);
          console.log('ClaimAILightButton: NOT showing - already claimed');
        }
      } else {
        // For non-founder/non-premium: don't show
        setShouldShowButton(false);
        console.log('ClaimAILightButton: NOT showing - not founder/premium');
      }
    } catch (error) {
      console.error('Error checking AI Light eligibility:', error);
    }
  };

  const handleClaimAILight = () => {
    setShowGiftModal(true);
  };

  const handleGiftClose = async () => {
    setShowGiftModal(false);
    // Mark as claimed
    await AsyncStorage.setItem('aiLightGiftClaimed', 'true');
    setShouldShowButton(false);
  };

  console.log('ClaimAILightButton render check:', { shouldShowButton });
  
  if (!shouldShowButton) {
    console.log('ClaimAILightButton: returning null - shouldShowButton is false');
    return null;
  }
  
  console.log('ClaimAILightButton: RENDERING BUTTON');

  return (
    <>
      <TouchableOpacity
        style={[styles.claimButton, { 
          backgroundColor: 'rgba(102, 102, 255, 0.1)',
          borderColor: '#6666FF',
          marginTop: 10
        }]}
        onPress={handleClaimAILight}
        activeOpacity={0.7}
      >
        <View style={styles.claimButtonContent}>
          <Ionicons name="sparkles" size={20} color="#6666FF" />
          <Text style={[styles.claimButtonText, { color: '#6666FF' }]}>
            Claim AI Light
          </Text>
        </View>
      </TouchableOpacity>

      <ProGiftSurprise
        visible={showGiftModal}
        onClose={handleGiftClose}
        theme={theme}
        giftType="aiPlus"
        showAppStoreRating={false}
      />
    </>
  );
};

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
  const { user, isAuthenticated, logout, changePassword, deleteUser } = useAuth();
  const { profile } = useProfile();
  const appContext = useAppContext() || {};
  
  // Helper function to count only enabled documents
  const getEnabledDocumentsCount = () => {
    return userDocuments.filter(doc => doc.enabled === true).length;
  };
  const { 
    goals = [], 
    milestones = [], 
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
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [referralStats, setReferralStats] = useState(null);
  const [streakData, setStreakData] = useState({ currentStreak: 0 });
  const [hasAppPurchase, setHasAppPurchase] = useState(false);
  
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

    // Count active milestones and create completedMilestonesMap for task filtering
    const completedMilestonesMap = {};
    const activeMilestonesCount = milestones.filter(milestone => {
      // Skip milestones that belong to deleted goals
      if (milestone.goalId && !validGoalIds.has(milestone.goalId)) {
        completedMilestonesMap[milestone.id] = true;
        return false;
      }

      // Skip milestones that belong to completed goals
      if (milestone.goalId && completedGoalsMap[milestone.goalId]) {
        completedMilestonesMap[milestone.id] = true;
        return false;
      }

      // Skip completed milestones
      if (milestone.completed === true || milestone.status === 'done') {
        completedMilestonesMap[milestone.id] = true;
        return false;
      }

      return true;
    }).length;

    // Count active tasks with hierarchical filtering
    const activeTasksCount = tasks.filter(task => {
      // Skip tasks that belong to completed milestones
      if (task.projectId && completedMilestonesMap[task.projectId]) {
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
      milestonesCount: activeMilestonesCount,
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

  // Load referral and streak data when authenticated
  useEffect(() => {
    const loadReferralData = async () => {
      if (isAuthenticated) {
        try {
          // Initialize referral system if needed
          await ReferralService.setupReferralCode(user?.email || user?.username);
          
          const stats = await ReferralService.getReferralStats();
          setReferralStats(stats);
          
          const currentStreak = await FeatureExplorerTracker.getCurrentStreak();
          setStreakData({ currentStreak });
        } catch (error) {
          console.error('Error loading referral data:', error);
          // Set default values if loading fails
          setReferralStats({ sent: 0, clicked: 0, converted: 0, plansEarned: 0, plansGifted: 0 });
          setStreakData({ currentStreak: 0 });
        }
      }
    };

    loadReferralData();
  }, [isAuthenticated, user?.email, user?.username]);

  // Check if user has purchased the app (first 1000 or subscription)
  useEffect(() => {
    const checkAppPurchase = async () => {
      if (isAuthenticated) {
        try {
          // Check if user is part of first 1000 (founder status)
          const proAccessPurchased = await AsyncStorage.getItem('proAccessPurchased');
          if (proAccessPurchased === 'true') {
            setHasAppPurchase(true);
            return;
          }
          
          // For now, assume free users haven't purchased
          // In production, this would check actual purchase receipts
          setHasAppPurchase(false);
        } catch (error) {
          console.error('Error checking app purchase status:', error);
          setHasAppPurchase(false);
        }
      } else {
        setHasAppPurchase(false);
      }
    };

    checkAppPurchase();
  }, [isAuthenticated, subscriptionStatus, realSubscriptionInfo]);
  
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

  // Handle change password
  const handleChangePassword = () => {
    setShowAccountSettings(false);
    onClose(); // Close menu first
    
    // Option 1: Navigate to ForgotPassword screen (easier for users)
    setTimeout(() => {
      Alert.alert(
        'Change Password',
        'Choose how you would like to change your password:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset via Email',
            onPress: () => {
              if (navigation) {
                navigation.navigate('ForgotPassword');
              }
            }
          },
          {
            text: 'Change Now',
            onPress: () => handleDirectPasswordChange()
          }
        ]
      );
    }, 300);
  };

  // Handle direct password change (requires current password)
  const handleDirectPasswordChange = () => {
    // Note: Alert.prompt is iOS-only, so for Android/cross-platform,
    // we should navigate to a proper password change screen or use the email reset
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'Current Password',
        'Enter your current password:',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Next',
            onPress: (currentPassword) => {
              if (!currentPassword) {
                Alert.alert('Error', 'Please enter your current password');
                return;
              }
              
              Alert.prompt(
                'New Password',
                'Enter your new password (min 8 characters):',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Change Password',
                    onPress: (newPassword) => handleConfirmPasswordChange(currentPassword, newPassword)
                  }
                ],
                'secure-text'
              );
            }
          }
        ],
        'secure-text'
      );
    } else {
      // For Android, direct users to email reset since Alert.prompt isn't available
      Alert.alert(
        'Change Password',
        'Password change via app is only available on iOS. We\'ll redirect you to reset your password via email instead.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset via Email',
            onPress: () => {
              if (navigation) {
                navigation.navigate('ForgotPassword');
              }
            }
          }
        ]
      );
    }
  };

  // Handle confirmed password change
  const handleConfirmPasswordChange = async (currentPassword, newPassword) => {
    if (!newPassword || newPassword.length < 8) {
      Alert.alert('Error', 'New password must be at least 8 characters long');
      return;
    }

    try {
      const success = await changePassword(currentPassword, newPassword);
      
      if (success) {
        Alert.alert(
          'Success',
          'Your password has been changed successfully.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Password Change Failed',
        'There was an error changing your password. Please check your current password and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    setShowAccountSettings(false);
    // Show confirmation dialog
    setTimeout(() => {
      Alert.alert(
        'Delete Account',
        'This will permanently delete your AI account and all associated data. This action cannot be undone.\n\nYour local app data will remain unchanged.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete Account', 
            style: 'destructive',
            onPress: handleConfirmDeleteAccount
          }
        ]
      );
    }, 300);
  };

  // Handle confirmed account deletion
  const handleConfirmDeleteAccount = async () => {
    try {
      onClose(); // Close menu first
      
      // Show loading state - need to dismiss manually as we can't wait for deletion
      const loadingAlert = Alert.alert('Deleting Account', 'Please wait...');
      
      // Call AuthContext deleteUser which handles AWS Cognito deletion
      const success = await deleteUser();
      
      if (success) {
        // Show success message
        setTimeout(() => {
          Alert.alert(
            'Account Deleted',
            'Your AI account has been successfully deleted. Your local app data remains unchanged.',
            [{ text: 'OK' }]
          );
        }, 500);
      } else {
        Alert.alert(
          'Delete Failed',
          'There was an error deleting your account. Please try again or contact support.',
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Error deleting account:', error);
      Alert.alert(
        'Delete Failed',
        'There was an error deleting your account. Please try again or contact support.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle referral popup
  const handleReferralClick = () => {
    setShowReferralPopup(true);
  };

  const handleReferralPopupClose = () => {
    setShowReferralPopup(false);
  };

  const handleNavigateToReferrals = () => {
    if (navigation) {
      onClose(); // Close menu first
      setTimeout(() => {
        navigation.navigate('ReferralScreen');
      }, 300);
    }
  };

  // Get streak emoji based on streak length (same logic as ProfileScreen)
  const getStreakEmoji = (days) => {
    if (days >= 365) return '👑'; // Crown (365+ days)
    if (days >= 180) return '🏆'; // Trophy (180-364 days)
    if (days >= 90) return '⭐'; // Star (90-179 days)
    if (days >= 30) return '⚡'; // Lightning (30-89 days)
    if (days >= 7) return '🚀'; // Rocket (7-29 days)
    return '🔥'; // Flame (1-6 days)
  };

  // Calculate total referral limit based on achievements
  const [referralLimit, setReferralLimit] = React.useState(2); // Default base limit
  
  // Load referral limit from achievements
  React.useEffect(() => {
    if (visible) {
      const loadReferralLimit = async () => {
        try {
          const limit = await AchievementService.getReferralLimit();
          setReferralLimit(limit);
        } catch (error) {
          console.error('Error loading referral limit:', error);
        }
      };
      
      loadReferralLimit();
    }
  }, [visible]);
  
  const getTotalReferralLimit = () => {
    return referralLimit;
  };

  // Calculate referrals remaining vs total limit (0/X format)
  const getReferralProgress = () => {
    const total = getTotalReferralLimit();
    const used = referralStats?.sent || 0; // Changed from converted to sent
    const remaining = Math.max(0, total - used);
    
    console.log('getReferralProgress DEBUG:', {
      total,
      used,
      remaining,
      referralStats,
      streakData
    });
    
    return { 
      remaining: remaining, 
      total: total 
    };
  };

  // FOR TESTING: Uncomment this to add test referral data
  // const addTestReferralData = async () => {
  //   try {
  //     await ReferralService.addTestData();
  //     const stats = await ReferralService.getReferralStats();
  //     setReferralStats(stats);
  //     console.log('[TEST] Added test referral data:', stats);
  //   } catch (error) {
  //     console.error('Error adding test data:', error);
  //   }
  // };
  
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
            
            {/* Top Menu Items - Fixed */}
            <View style={styles.topMenuSection}>
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
                {getEnabledDocumentsCount() > 0 && (
                  <View style={styles.documentIndicator}>
                    <Text style={[styles.documentCount, { color: theme.textSecondary }]}>
                      {getEnabledDocumentsCount()} document{getEnabledDocumentsCount() !== 1 ? 's' : ''}
                    </Text>
                    {userKnowledgeEnabled && (
                      <Ionicons name="checkmark-circle" size={14} color="#4CAF50" style={{ opacity: 0.9 }} />
                    )}
                  </View>
                )}
              </TouchableOpacity>
              
              {/* Subtle Section Divider */}
              <View style={styles.sectionDivider} />
            </View>

            {/* Middle Content Area - Flexible */}
            <View style={styles.middleContentArea}>
              {/* Enhanced User Info Section - Display comprehensive info in the middle space */}
              {isAuthenticated && user ? (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
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
                           (subscriptionStatus === 'pro' ? 'Pro' : 
                            subscriptionStatus === 'unlimited' ? 'Premium' : 'Free')}
                        </Text>
                      </View>
                      
                      
                      {/* Stats Grid - Back to 3 columns for core app data */}
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
                            {stats.milestonesCount}
                          </Text>
                          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                            {stats.milestonesCount === 1 ? 'Milestone' : 'Milestones'}
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

                      {/* Streak Section - Bottom of middle section */}
                      <View style={styles.streakSection}>
                        <Text style={[styles.streakEmoji]}>
                          {getStreakEmoji(streakData.currentStreak)}
                        </Text>
                        <Text style={[styles.streakText, { color: theme.textSecondary }]}>
                          {streakData.currentStreak} day streak
                        </Text>
                      </View>
                      
                      {/* AI Light Claim Button */}
                      <ClaimAILightButton 
                        theme={theme}
                        subscriptionStatus={subscriptionStatus}
                        realSubscriptionInfo={realSubscriptionInfo}
                      />
                      
                      {/* AI Access Claim Button */}
                      <ClaimAIAccessButton 
                        theme={theme}
                        onClose={onClose}
                        subscriptionStatus={subscriptionStatus}
                        realSubscriptionInfo={realSubscriptionInfo}
                        user={user}
                      />

                    </View>

                    {/* NEW Referral Section - Only for users who purchased app */}
                    {(realSubscriptionInfo?.isProTier || 
                      subscriptionStatus === 'pro' || 
                      subscriptionStatus === 'unlimited' || 
                      hasAppPurchase) && (
                      <TouchableOpacity 
                        style={[styles.newReferralButton, { 
                          backgroundColor: theme.surface, 
                          borderColor: theme.border
                        }]}
                        onPress={handleReferralClick}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="people" size={20} color={theme.primary} />
                        <Text style={[styles.newReferralText, { color: theme.text }]}>
                          Referrals (0/3)
                        </Text>
                        <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
                      </TouchableOpacity>
                    )}

                  </View>
                </ScrollView>
              ) : (
                /* Logged Out Section - When user is not authenticated - NOW TRULY CENTERED */
                <View style={styles.loggedOutSection}>
                  {/* Centered Status Content */}
                  <View style={styles.centeredStatusContainer}>
                    <View style={[styles.statusIndicator, { backgroundColor: '#FF9800' }]} />
                    <Text style={[styles.centeredStatusText, { color: theme.text }]}>Not Connected</Text>
                    <Text style={[styles.centeredStatusDescription, { color: theme.textSecondary }]}>
                      Sign in to access AI features
                    </Text>
                  </View>

                  {/* ClaimAILightButton - for eligible users */}
                  <ClaimAILightButton 
                    theme={theme}
                    subscriptionStatus={subscriptionStatus}
                    realSubscriptionInfo={realSubscriptionInfo}
                  />
                </View>
              )}
            </View>
            

            {/* Fixed Footer Section - NOT part of ScrollView */}
            <View style={{ 
              borderTopWidth: 0.5, 
              borderTopColor: theme.border,
              paddingTop: 6,
              paddingBottom: 16,
              marginBottom: Platform.OS === 'ios' ? 25 : 8,
              opacity: 0.95
            }}>
              {/* Login/Logout Button - Split when authenticated */}
              {isAuthenticated ? (
                <View style={[styles.sideMenuItem, { borderBottomColor: theme.border, paddingHorizontal: 0 }]}>
                  {/* Logout Button - Left Half */}
                  <TouchableOpacity 
                    style={[styles.splitButtonLeft]}
                    onPress={handleLoginLogoutAction}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="log-out-outline" 
                      size={22} 
                      color="#FF3B30"
                    />
                    <Text style={[styles.splitButtonText, { color: "#FF3B30" }]}>
                      Log Out
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Account Settings Button - Right Half */}
                  <TouchableOpacity 
                    style={[styles.splitButtonRight, { borderLeftColor: theme.border }]}
                    onPress={() => setShowAccountSettings(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name="settings-outline" 
                      size={22} 
                      color={theme.textSecondary}
                      style={{ opacity: 0.8 }}
                    />
                    <Text style={[styles.splitButtonText, { color: theme.text }]}>
                      Account Settings
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.sideMenuItem, { borderBottomColor: theme.border }]}
                  onPress={handleLoginLogoutAction}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="log-in-outline" 
                    size={22} 
                    color={theme.textSecondary}
                    style={{ opacity: 0.8 }}
                  />
                  <Text style={[styles.sideMenuItemText, { color: theme.text }]}>
                    Login
                  </Text>
                </TouchableOpacity>
              )}
              
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

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showAccountSettings}
          onRequestClose={() => setShowAccountSettings(false)}
        >
          <View style={styles.logoutModalOverlay}>
            <View style={[styles.logoutModalContainer, { backgroundColor: theme.surface }]}>
              <Text style={[styles.logoutModalTitle, { color: theme.text }]}>
                Account Settings
              </Text>
              <Text style={[styles.logoutModalMessage, { color: theme.textSecondary }]}>
                Manage your AI account settings
              </Text>
              
              <View style={styles.accountSettingsButtons}>
                <TouchableOpacity
                  style={[styles.accountSettingsButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={handleChangePassword}
                  activeOpacity={0.7}
                >
                  <Ionicons name="key-outline" size={18} color={theme.primary} />
                  <Text style={[styles.accountSettingsButtonText, { color: theme.text }]}>
                    Change Password
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.accountSettingsButton, styles.deleteAccountButton]}
                  onPress={handleDeleteAccount}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  <Text style={[styles.accountSettingsButtonText, { color: "#FF3B30" }]}>
                    Delete Account
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.accountSettingsButton, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => setShowAccountSettings(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.accountSettingsButtonText, { color: theme.text }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Referral Summary Popup */}
      <ReferralSummaryPopup
        visible={showReferralPopup}
        onClose={handleReferralPopupClose}
        onNavigateToReferrals={handleNavigateToReferrals}
      />
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
  topMenuSection: {
    // Fixed top section with menu items
  },
  middleContentArea: {
    flex: 1,
    // This takes up all available space between top and bottom
  },
  sideMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
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
  // Professional minimalist user info styles - OPTIMIZED for vertical space
  userInfoSection: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCard: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userDetails: {
    alignItems: 'center',
    marginBottom: 16,
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
    marginBottom: 12,
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
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.6,
    textAlign: 'center',
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
  },
  // Claim AI Access Button styles - minimal and professional (COMPACT)
  claimButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  claimButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  claimButtonSubtext: {
    fontSize: 11,
    fontWeight: '400',
    marginTop: 4,
    opacity: 0.7,
  },
  // Success Modal styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successModalContainer: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 16,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  successModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.8,
    fontWeight: '400',
  },
  successModalButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successModalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  // Streak section styles
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 8,
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Referral section styles
  referralSection: {
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 20,
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    minHeight: 60,
  },
  referralContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'center',
  },
  referralTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  referralProgress: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Logged Out Section Styles - NOW TRULY CENTERED IN MIDDLE AREA
  loggedOutSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  centeredStatusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  centeredStatusText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  centeredStatusDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
  },
  loggedOutHeader: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  loggedOutStatus: {
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loggedOutDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  loggedOutActions: {
    gap: 10,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // NEW Simple Referral Button Styles
  newReferralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  newReferralText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  // Split button styles
  splitButtonLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  splitButtonRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderLeftWidth: 0.5,
  },
  splitButtonText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 18,
    letterSpacing: 0.3,
  },
  // Account settings modal styles
  accountSettingsButtons: {
    width: '100%',
    gap: 12,
  },
  accountSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  deleteAccountButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  accountSettingsButtonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});

export default AISideMenu;
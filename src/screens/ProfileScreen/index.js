// src/screens/ProfileScreen/ProfileScreenNew.js - Streamlined ProfileScreen with reliable loading
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
  StatusBar,
  Alert,  
  TouchableOpacity,
  Dimensions,
  Animated,
  Modal
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Import the new loading orchestrator
import useProfileScreenData from '../../hooks/useProfileScreenData';

// Import app tour hook
import useAppTour from '../../hooks/useAppTour';

// Import profile screen components
import ProfileHeader from './ProfileHeader';
import StatsRow from './StatsRow';
import DomainBalanceWheel from './DomainBalanceWheel';
import CustomizableDashboard from './CustomizableDashboard';
import SettingsModal from './SettingsModal';
import AIExplanationModal from './AIExplanationModal';
import DomainColorPickerModal from './DomainColorPickerModal';
import ThemeColorPickerModal from './ThemeColorPickerModal';
import ProGiftSurprise from '../../components/ProGiftSurprise';
import AppTourOverlay from '../../components/AppTourOverlay';

const { width: screenWidth } = Dimensions.get('window');

const ProfileScreen = ({ navigation, route }) => {
  const { theme, isColoredTheme, toggleColoredTheme, updateTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useNotification() || { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.error(msg)
  };
  
  // Get auth context with error handling
  let auth = null;
  try {
    auth = useAuth();
  } catch (error) {
    console.error('Error accessing auth context:', error);
  }
  
  // Get app context for domain updates
  const appContext = useAppContext();
  const { updateDomain, updateAppSetting } = appContext || {};
  
  // Use the new loading orchestrator
  const {
    isLoading,
    isError,
    error,
    loadingState,
    profileData,
    retry,
    appContextReady
  } = useProfileScreenData(navigation, route);
  
  // App Tour Hook - MUST be called before any early returns
  const { 
    isTourActive,
    currentStep,
    spotlightTarget,
    startTour,
    nextStep,
    skipTour
  } = useAppTour(navigation);
  
  // Refs
  const scrollViewRef = useRef(null);
  
  // Tour animation refs
  const tourStatsOpacity = useRef(new Animated.Value(1)).current;
  const tourDomainWheelOpacity = useRef(new Animated.Value(0)).current;
  
  // Handle tour step transitions
  useEffect(() => {
    if (isTourActive) {
      if (currentStep === 'GOAL_ACHIEVEMENT_VALIDATION') {
        // Show stats for the new tour's first step
        tourStatsOpacity.setValue(1);
        tourDomainWheelOpacity.setValue(0);
      }
    } else {
      // Reset when tour is not active
      tourStatsOpacity.setValue(1);
      tourDomainWheelOpacity.setValue(0);
    }
  }, [isTourActive, currentStep]);
  
  // Celebration animations state
  const [fallingTrophies, setFallingTrophies] = useState([]);
  const [fireworks, setFireworks] = useState([]);
  
  // Modal animation values
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  
  // Create celebration effects
  const createCelebrationEffects = () => {
    // Create falling trophies
    const newTrophies = [];
    for (let i = 0; i < 8; i++) {
      newTrophies.push({
        id: Date.now() + i,
        x: Math.random() * width,
        animValue: new Animated.Value(-100), // Start higher above screen
        rotation: new Animated.Value(0),
        delay: Math.random() * 800
      });
    }
    
    // Create golden fireworks
    const newFireworks = [];
    for (let i = 0; i < 6; i++) {
      newFireworks.push({
        id: Date.now() + 100 + i,
        x: Math.random() * width * 0.8 + width * 0.1,
        y: Math.random() * 300 + 150,
        scaleAnim: new Animated.Value(0),
        opacityAnim: new Animated.Value(1),
        delay: Math.random() * 400
      });
    }
    
    setFallingTrophies(newTrophies);
    setFireworks(newFireworks);
    
    // Animate falling trophies
    newTrophies.forEach(trophy => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(trophy.animValue, {
            toValue: height + 100,
            duration: 2500,
            useNativeDriver: true
          }),
          Animated.loop(
            Animated.timing(trophy.rotation, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true
            })
          )
        ]).start();
      }, trophy.delay);
    });
    
    // Animate golden fireworks
    newFireworks.forEach(firework => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(firework.scaleAnim, {
            toValue: 2,
            duration: 400,
            useNativeDriver: true
          }),
          Animated.timing(firework.opacityAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true
          })
        ]).start();
      }, firework.delay);
    });
    
    // Clear effects after animation
    setTimeout(() => {
      setFallingTrophies([]);
      setFireworks([]);
    }, 4000);
  };
  
  // Check for tour completion achievement trigger
  useEffect(() => {
    const checkForAchievementTrigger = () => {
      if (global.showTourCompletionAchievement) {
        console.log('🏆 ProfileScreen: Showing tour completion achievement');
        setUiState(prev => ({ ...prev, showTourAchievement: true }));
        global.showTourCompletionAchievement = false; // Clear flag
        
        // Animate modal entrance with faster timing
        Animated.parallel([
          Animated.spring(modalScale, {
            toValue: 1,
            tension: 80,
            friction: 6,
            useNativeDriver: true
          }),
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 200, // Faster than default
            useNativeDriver: true
          })
        ]).start(() => {
          // Start celebration effects after modal is visible
          createCelebrationEffects();
        });
      }
    };
    
    // Check immediately
    checkForAchievementTrigger();
    
    // Also check periodically in case of timing issues
    const interval = setInterval(checkForAchievementTrigger, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // UI state that's separate from data loading
  const [uiState, setUiState] = useState({
    showAIExplanation: false,
    showSettings: false,
    showDomainColorPicker: false,
    showThemeColorPicker: false,
    showTourAchievement: false,
    selectedDomain: null,
    // Local overrides for profileData
    userSubscriptionStatusOverride: null,
  });
  
  // Combine profileData with UI state and any local overrides
  const screenState = {
    ...profileData,
    ...uiState,
    useColoredTheme: isColoredTheme,
    showTestModeToggles: true, // Force to true for debugging
    // Apply any local overrides
    userSubscriptionStatus: uiState.userSubscriptionStatusOverride || profileData.userSubscriptionStatus,
  };
  
  // Debug log for troubleshooting
  if (__DEV__) {
    console.log('ProfileScreen Debug:', {
      showTestModeToggles: screenState.showTestModeToggles,
      __DEV__: __DEV__,
      isAdmin: isAdmin,
      userSubscriptionStatus: screenState.userSubscriptionStatus
    });
  }
  
  // Loading screen
  if (isLoading) {
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor={theme.primary} barStyle={theme.dark ? 'light-content' : 'dark-content'} translucent={true} />
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} style={styles.loadingSpinner} />
          
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading your profile...
          </Text>
          
          <Text style={[styles.loadingSubtext, { color: theme.textSecondary }]}>
            {loadingState === 'waiting_for_context' && 'Preparing app data...'}
            {loadingState === 'loading_profile' && 'Loading profile information...'}
            {loadingState === 'calculating_stats' && 'Calculating your progress...'}
          </Text>
          
          {/* Debug info in dev mode */}
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={[styles.debugText, { color: theme.textSecondary }]}>
                Loading State: {loadingState}
              </Text>
              <Text style={[styles.debugText, { color: theme.textSecondary }]}>
                AppContext Ready: {appContextReady ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
  
  // Error screen
  if (isError) {
    return (
      <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar backgroundColor={theme.primary} barStyle={theme.dark ? 'light-content' : 'dark-content'} translucent={true} />
        
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color={theme.error || '#FF6B6B'} />
          
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Loading Failed
          </Text>
          
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
            {error || 'Unable to load your profile data'}
          </Text>
          
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={retry}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          {/* Debug info in dev mode */}
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={[styles.debugText, { color: theme.textSecondary }]}>
                Error State: {loadingState}
              </Text>
              <Text style={[styles.debugText, { color: theme.textSecondary }]}>
                AppContext Ready: {appContextReady ? 'Yes' : 'No'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }
  
  // Event handlers
  const handleDomainColorUpdate = async (domainId, newColor) => {
    try {
      if (updateDomain) {
        await updateDomain({ id: domainId, color: newColor });
        showSuccess('Domain color updated');
      }
    } catch (error) {
      console.error('Error updating domain color:', error);
      showError('Failed to update domain color');
    }
  };
  
  const handleThemeColorUpdate = async (color) => {
    try {
      // Enable colored theme if not already enabled
      if (!isColoredTheme) {
        toggleColoredTheme(true);
      }
      
      if (updateTheme) {
        updateTheme({ primary: color });
      }
      
      showSuccess('App theme updated successfully');
    } catch (error) {
      console.error('Error setting theme color:', error);
      showError('Failed to update theme color');
    }
  };
  
  const handleToggleColoredTheme = async (value) => {
    if (toggleColoredTheme) {
      toggleColoredTheme(value);
    }
  };
  
  const handleShowAIExplanation = () => {
    setUiState(prev => ({ ...prev, showAIExplanation: true }));
  };
  
  const toggleSettings = () => {
    setUiState(prev => ({ ...prev, showSettings: !prev.showSettings }));
  };
  
  const handleDomainPress = (domain) => {
    setUiState(prev => ({
      ...prev,
      selectedDomain: domain,
      showDomainColorPicker: true
    }));
  };
  
  const handleThemeColorPress = async () => {
    try {
      // Check if user has Pro access
      const hasPro = screenState.userSubscriptionStatus === 'pro' || 
                     screenState.userSubscriptionStatus === 'unlimited';
      
      if (hasPro) {
        // Check if user has already seen the color gift
        const hasSeenColorGift = await AsyncStorage.getItem('proColorGiftShown');
        
        if (!hasSeenColorGift) {
          // First time Pro user clicking theme color - show gift
          setUiState(prev => ({ ...prev, showProGiftSurprise: true }));
          return;
        }
      }
      
      // Normal behavior - show theme picker
      setUiState(prev => ({ ...prev, showThemeColorPicker: true }));
    } catch (error) {
      console.error('Error checking color gift eligibility:', error);
      // Fallback to normal theme picker
      setUiState(prev => ({ ...prev, showThemeColorPicker: true }));
    }
  };
  
  // Gift handlers
  const handleCloseGiftSurprise = async () => {
    setUiState(prev => ({ ...prev, showProGiftSurprise: false }));
    
    try {
      await AsyncStorage.setItem('proColorGiftShown', 'true');
    } catch (error) {
      console.error('Error marking color gift as shown:', error);
    }
  };
  
  const handleColorWheelUnlocked = async () => {
    try {
      await AsyncStorage.setItem('colorWheelUnlocked', 'true');
      console.log('Color wheel unlocked for Pro member');
    } catch (error) {
      console.error('Error marking color wheel as unlocked:', error);
    }
  };
  
  const handleScreenStateUpdate = (updates) => {
    setUiState(prev => ({ ...prev, ...updates }));
  };
  
  // Generate referral code helper
  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Check if user is admin
  const ADMIN_EMAIL = 'ryan.novinc@gmail.com';
  const isAdmin = auth?.user?.email === ADMIN_EMAIL;
  
  // Helper function for testing the gift surprise (only in dev mode)
  const triggerGiftSurpriseForTesting = async () => {
    console.log('🎁 Gift surprise button clicked');
    if (__DEV__) {
      try {
        // Reset gift state for testing
        await AsyncStorage.removeItem('proGiftReceived');
        await AsyncStorage.removeItem('colorWheelUnlocked');
        await AsyncStorage.removeItem('proColorGiftShown');
        
        // Trigger the gift surprise
        setUiState(prev => ({ ...prev, showProGiftSurprise: true }));
        console.log('🎁 MANUAL TRIGGER: Gift surprise triggered for testing');
      } catch (error) {
        console.error('Error triggering gift surprise for testing:', error);
      }
    } else {
      console.log('🎁 Gift surprise only works in development mode');
    }
  };

  // Helper function for showing AI Plus upgrade notification
  const triggerAIPlusUpgrade = async () => {
    try {
      console.log('🚀 AI Plus upgrade button clicked');
      setUiState(prev => ({ ...prev, showAIPlusUpgrade: true }));
      console.log('🚀 Showing AI Plus upgrade notification');
    } catch (error) {
      console.error('Error showing AI Plus upgrade:', error);
    }
  };

  // Handle AI button toggle
  const handleToggleAIButton = async (value) => {
    try {
      if (updateAppSetting) {
        await updateAppSetting('showAIButton', value);
        showSuccess('AI Button setting updated');
      }
    } catch (error) {
      console.error('Error updating AI button setting:', error);
      showError('Failed to update AI button setting');
    }
  };

  // Handle lifetime member toggle
  const handleToggleLifetimeMember = async (value) => {
    try {
      const newStatus = value ? 'founding' : 'free'; // Changed from 'pro' to 'founding'
      console.log('Toggle Lifetime Member:', { value, newStatus });
      
      // Update local state immediately for UI responsiveness
      setUiState(prev => ({
        ...prev,
        userSubscriptionStatusOverride: newStatus
      }));
      
      // Update AsyncStorage
      await AsyncStorage.setItem('subscriptionStatus', newStatus);
      
      // If enabling founding status, also set up founder number and referral code
      if (value) {
        // Set a test founder number for development
        const testFounderNumber = Math.floor(Math.random() * 1000) + 1;
        await AsyncStorage.setItem('founderNumber', testFounderNumber.toString());
        
        // Set up referral code if not exists
        const existingCode = await AsyncStorage.getItem('referralCode');
        if (!existingCode) {
          // Simple referral code generation for testing
          const code = 'TEST' + Math.random().toString(36).substr(2, 6).toUpperCase();
          await AsyncStorage.setItem('referralCode', code);
        }
        
        // Set referrals remaining
        await AsyncStorage.setItem('referralsRemaining', '3');
      } else {
        // Clean up founder-specific data when disabling
        await AsyncStorage.removeItem('founderNumber');
        await AsyncStorage.removeItem('referralCode');
        await AsyncStorage.removeItem('referralsRemaining');
      }
      
      // Update AppContext if available
      if (updateAppSetting) {
        await updateAppSetting('userSubscriptionStatus', newStatus);
      }
      
      showSuccess(`Subscription status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating subscription status:', error);
      showError('Failed to update subscription status');
      
      // Reset local override on error
      setUiState(prev => ({
        ...prev,
        userSubscriptionStatusOverride: null
      }));
    }
  };

  // Handle monthly subscriber toggle
  const handleToggleMonthlySubscriber = async (value) => {
    try {
      const newStatus = value ? 'pro' : 'free'; // Monthly subscribers use 'pro' status
      console.log('Toggle Monthly Subscriber:', { value, newStatus });
      
      // Update local state immediately for UI responsiveness
      setUiState(prev => ({
        ...prev,
        userSubscriptionStatusOverride: newStatus
      }));
      
      // Update AsyncStorage
      await AsyncStorage.setItem('subscriptionStatus', newStatus);
      
      // If enabling monthly subscription, clean up founder-specific data
      if (value) {
        // Remove founder-specific data since monthly subscribers aren't founders
        await AsyncStorage.removeItem('founderNumber');
        await AsyncStorage.removeItem('referralCode');
        await AsyncStorage.removeItem('referralsRemaining');
      } else {
        // Clean up when disabling
        await AsyncStorage.removeItem('founderNumber');
        await AsyncStorage.removeItem('referralCode');
        await AsyncStorage.removeItem('referralsRemaining');
      }
      
      // Update AppContext if available
      if (updateAppSetting) {
        await updateAppSetting('userSubscriptionStatus', newStatus);
      }
      
      showSuccess(`Subscription status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating monthly subscription status:', error);
      showError('Failed to update subscription status');
      
      // Reset local override on error
      setUiState(prev => ({
        ...prev,
        userSubscriptionStatusOverride: null
      }));
    }
  };
  
  // Handle test second onboarding
  const handleTestSecondOnboarding = () => {
    console.log('Starting app tour...');
    startTour();
  };

  // Handle test new tour
  const handleTestNewTour = () => {
    console.log('Starting new streamlined tour...');
    startTour('GOAL_ACHIEVEMENT_VALIDATION');
  };
  
  // Main render
  const isDarkMode = theme.dark;
  
  return (
    <View style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor={theme.primary} barStyle={isDarkMode ? 'light-content' : 'dark-content'} translucent={true} />
      
      <ScrollView
        ref={scrollViewRef}
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Profile Banner */}
        <ProfileHeader.Banner 
          theme={theme}
          isDarkMode={isDarkMode}
          profile={screenState.profile}
          user={auth?.user}
          navigation={navigation}
          toggleSettings={toggleSettings}
          onThemeColorPress={handleThemeColorPress}
        />
        
        {/* Stats Row - always rendered in background */}
        <StatsRow
          theme={theme}
          totalDomains={screenState.localDomains ? screenState.localDomains.length : 0}
          totalActiveGoals={screenState.totalActiveGoals}
          completedGoals={screenState.completedGoals}
          activeMilestones={screenState.activeMilestones}
          totalActiveTasks={screenState.totalActiveTasks}
          navigation={navigation}
          isTourActive={false}
        />
        
        {/* Domain Balance Wheel - always rendered in background */}
        <View style={[styles.sectionContainer, { marginTop: 16 }]}>
          <DomainBalanceWheel 
            theme={theme}
            navigation={navigation}
            isTourActive={false}
            currentStep={null}
          />
        </View>
        
        {/* Customizable Dashboard */}
        <CustomizableDashboard 
          theme={theme}
          navigation={navigation}
        />
      </ScrollView>
      
      {/* Modals */}
      <SettingsModal
        visible={uiState.showSettings}
        theme={theme}
        isDarkMode={isDarkMode}
        isAdmin={isAdmin}
        screenState={screenState}
        onClose={() => setUiState(prev => ({ ...prev, showSettings: false }))}
        onToggleAIButton={handleToggleAIButton}
        onToggleLifetimeMember={handleToggleLifetimeMember}
        onToggleMonthlySubscriber={handleToggleMonthlySubscriber}
        onShowAIExplanation={handleShowAIExplanation}
        navigation={navigation}
        onLogout={toggleSettings}
        updateAppSetting={updateAppSetting}
        isEdgeSwipeActive={false}
        edgeSwipeX={null}
        onScreenStateUpdate={handleScreenStateUpdate}
        onTriggerGiftSurprise={triggerGiftSurpriseForTesting}
        onTriggerAIPlusUpgrade={triggerAIPlusUpgrade}
        onTestSecondOnboarding={handleTestSecondOnboarding}
        onTestNewTour={handleTestNewTour}
      />
      
      <AIExplanationModal
        visible={uiState.showAIExplanation}
        onClose={() => setUiState(prev => ({ ...prev, showAIExplanation: false }))}
        theme={theme}
        navigation={navigation}
      />
      
      <DomainColorPickerModal
        visible={uiState.showDomainColorPicker}
        onClose={() => setUiState(prev => ({ ...prev, showDomainColorPicker: false }))}
        domain={uiState.selectedDomain}
        theme={theme}
        onColorUpdate={handleDomainColorUpdate}
      />
      
      <ThemeColorPickerModal
        visible={uiState.showThemeColorPicker}
        onClose={() => setUiState(prev => ({ ...prev, showThemeColorPicker: false }))}
        theme={theme}
        isDarkMode={isDarkMode}
        themeColor={theme.primary}
        onSelectColor={handleThemeColorUpdate}
        navigation={navigation}
      />
      
      {/* Tour Achievement Modal */}
      <Modal
        visible={uiState.showTourAchievement}
        transparent={true}
        animationType="none"
        onRequestClose={() => setUiState(prev => ({ ...prev, showTourAchievement: false }))}
      >
        <View style={achievementStyles.modalOverlay}>
          {/* Falling Trophy Effects */}
          {fallingTrophies.map(trophy => (
            <Animated.View
              key={trophy.id}
              style={[
                achievementStyles.fallingTrophy,
                {
                  left: trophy.x,
                  top: 0, // Position at very top of screen
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
                achievementStyles.firework,
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
              <Text style={achievementStyles.fireworkText}>✨</Text>
            </Animated.View>
          ))}
          
          <Animated.View style={[
            achievementStyles.modalContainer,
            {
              backgroundColor: theme.background,
              borderColor: theme.primary,
              transform: [{ scale: modalScale }],
              opacity: modalOpacity
            }
          ]}>
            {/* Achievement Icon */}
            <View style={[
              achievementStyles.iconContainer,
              { backgroundColor: theme.cardBackground }
            ]}>
              <Ionicons name="trophy" size={48} color="#FFD700" />
            </View>
            
            {/* Header */}
            <View style={achievementStyles.modalHeader}>
              <Text style={[
                achievementStyles.modalTitle,
                { color: theme.text }
              ]}>Achievement Unlocked!</Text>
              <Text style={[
                achievementStyles.achievementName,
                { color: '#FFD700' }
              ]}>Quick Learner</Text>
            </View>
            
            {/* Theme Color Unlock */}
            <View style={achievementStyles.themeUnlock}>
              <Text style={[
                achievementStyles.themeUnlockTitle,
                { color: theme.textSecondary }
              ]}>You unlocked a new theme color!</Text>
              
              <View style={achievementStyles.colorPreview}>
                <View style={[
                  achievementStyles.colorCircle,
                  { backgroundColor: theme.cardElevated }
                ]}>
                  <View style={[achievementStyles.colorSwatch, { backgroundColor: '#3B82F6' }]} />
                </View>
                <Text style={[
                  achievementStyles.colorName,
                  { color: theme.textSecondary }
                ]}>Slate Blue</Text>
              </View>
            </View>
            
            {/* Buttons */}
            <View style={achievementStyles.buttons}>
              <TouchableOpacity 
                style={[
                  achievementStyles.secondaryButton,
                  { borderColor: theme.border }
                ]}
                onPress={() => {
                  // Reset animation values
                  modalScale.setValue(0.8);
                  modalOpacity.setValue(0);
                  setUiState(prev => ({ ...prev, showTourAchievement: false }));
                  navigation.navigate('AchievementsScreen');
                }}
                activeOpacity={0.8}
              >
                <Text style={[
                  achievementStyles.secondaryText,
                  { color: theme.textSecondary }
                ]}>View All Achievements</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  achievementStyles.continueButton,
                  { backgroundColor: '#FFD700' }
                ]}
                onPress={() => {
                  // Reset animation values
                  modalScale.setValue(0.8);
                  modalOpacity.setValue(0);
                  setUiState(prev => ({ ...prev, showTourAchievement: false }));
                }}
                activeOpacity={0.8}
              >
                <Text style={achievementStyles.continueText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      
      {/* Pro Gift Surprise Modal */}
      <ProGiftSurprise
        visible={screenState.showProGiftSurprise}
        onClose={handleCloseGiftSurprise}
        theme={theme}
        onColorWheelUnlocked={handleColorWheelUnlocked}
        showAppStoreRating={true}
        giftType="colorWheel"
      />
      
      {/* AI Plus Upgrade Modal */}
      <ProGiftSurprise
        visible={screenState.showAIPlusUpgrade}
        onClose={() => setUiState(prev => ({ ...prev, showAIPlusUpgrade: false }))}
        theme={theme}
        giftType="aiPlus"
        showAppStoreRating={false}
      />
      
      {/* App Tour Overlay */}
      <AppTourOverlay
        isVisible={isTourActive && currentStep === 'GOAL_ACHIEVEMENT_VALIDATION'}
        currentStep={currentStep}
        onComplete={nextStep}
        onSkip={skipTour}
        spotlightTarget={spotlightTarget}
        navigation={navigation}
      />
      
      {/* Stats Row - rendered AFTER overlay during tour so it appears on top */}
      {isTourActive && currentStep === 'GOAL_ACHIEVEMENT_VALIDATION' && (
        <Animated.View style={[styles.tourStatsContainer, { opacity: tourStatsOpacity }]}>
          <StatsRow
            theme={theme}
            totalDomains={screenState.localDomains ? screenState.localDomains.length : 0}
            totalActiveGoals={screenState.totalActiveGoals}
            completedGoals={screenState.completedGoals}
            activeMilestones={screenState.activeMilestones}
            totalActiveTasks={screenState.totalActiveTasks}
            navigation={navigation}
            isTourActive={true}
            useDramaticEntrance={true}
          />
        </Animated.View>
      )}
      
      {/* Domain Wheel - rendered AFTER overlay during tour so it appears on top */}
      {isTourActive && currentStep === 'PROFILE_DOMAIN_WHEEL' && (
        <Animated.View style={[styles.tourDomainWheelContainer, { opacity: tourDomainWheelOpacity }]}>
          <DomainBalanceWheel 
            theme={theme}
            navigation={navigation}
            isTourActive={true}
            currentStep={currentStep}
          />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  tourStatsContainer: {
    position: 'absolute',
    top: 220, // Position where StatsRow normally appears
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tourDomainWheelContainer: {
    position: 'absolute',
    top: 320, // Position where DomainWheel normally appears
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingHorizontal: 16, // Match normal section container
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    width: '100%',
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  sectionContainer: {
    paddingHorizontal: 0,
  },
});

// Achievement Modal Styles
const achievementStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fallingTrophy: {
    position: 'absolute',
    zIndex: 5,
    pointerEvents: 'none',
  },
  firework: {
    position: 'absolute',
    zIndex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  fireworkText: {
    fontSize: 28,
    color: '#FFD700',
  },
  modalContainer: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 360,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  achievementName: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(255, 215, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  themeUnlock: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  themeUnlockTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  colorPreview: {
    alignItems: 'center',
  },
  colorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  colorName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  buttons: {
    width: '100%',
    gap: 12,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  continueButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});

export default ProfileScreen;
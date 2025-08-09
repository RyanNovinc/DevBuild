// src/screens/EditProfileScreen_Simple.js - Clean, professional profile editor
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
  Modal,
  Dimensions
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useProfile } from '../context/ProfileContext';
import FeatureExplorerTracker from '../services/FeatureExplorerTracker';

// Import AI login components
import { LoginScreen } from '../components/ai/LoginScreen';
import { getSubscriptionInfo } from '../services/SubscriptionService';
import { useAppContext } from '../context/AppContext';

// Import responsive utilities
import responsive from '../utils/responsive';

// Import avatar components
import { DefaultAvatar, COLOR_PALETTE } from '../components/AvatarComponents';

const {
  spacing,
  fontSizes,
  isSmallDevice,
  scaleWidth,
  scaleHeight,
  scaleFontSize
} = responsive;

const { width, height } = Dimensions.get('window');

const EditProfileScreen = ({ navigation, route }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const notificationContext = useNotification();
  const showNotification = notificationContext?.showNotification;
  const { profile: contextProfile, updateProfile } = useProfile();
  const appContext = useAppContext() || {};
  
  // Local state
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);
  
  // AI login modal state
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  
  // Subscription and credits state
  const [realSubscriptionInfo, setRealSubscriptionInfo] = useState(null);
  
  // Animation for fade out
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // State for streak data
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0
  });

  // Get profile from route params or context
  const routeProfile = route?.params?.profile;
  const profile = routeProfile || contextProfile || {};

  // Initialize form with existing data
  useEffect(() => {
    if (profile) {
      setProfileName(profile.name || user?.displayName || '');
      setProfileImage(profile.profileImage || null);
    }
  }, [profile, user]);

  // Load streak data on component mount
  useEffect(() => {
    const loadStreakData = async () => {
      try {
        const currentStreak = await FeatureExplorerTracker.getCurrentStreak();
        const highestStreak = await FeatureExplorerTracker.getHighestStreak();
        
        setStreakData({
          currentStreak,
          longestStreak: highestStreak
        });
      } catch (error) {
        console.error('Error loading streak data:', error);
      }
    };
    
    loadStreakData();
  }, []);

  // Load subscription info when user is authenticated
  useEffect(() => {
    const loadSubscriptionInfo = async () => {
      if (isAuthenticated && user?.idToken) {
        try {
          const subscriptionInfo = await getSubscriptionInfo(user.idToken);
          setRealSubscriptionInfo(subscriptionInfo);
        } catch (error) {
          console.warn('Failed to load subscription info in profile:', error);
          setRealSubscriptionInfo(null);
        }
      } else {
        setRealSubscriptionInfo(null);
      }
    };

    loadSubscriptionInfo();
  }, [isAuthenticated, user?.idToken]);

  // Hide bottom navigation and AI button when this screen is active
  useEffect(() => {
    // Set full-screen mode on mount
    if (typeof window !== 'undefined' && window.setAIButtonVisible) {
      window.setAIButtonVisible(false);
    }
    
    if (typeof global !== 'undefined') {
      global.kanbanFullScreen = true;
    }

    // Cleanup function - restore normal state when leaving
    return () => {
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
      
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = false;
      }
    };
  }, []);

  // Photo selection modal state
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  // Animation refs for photo modal
  const photoFadeAnim = useRef(new Animated.Value(0)).current;
  const photoSlideAnim = useRef(new Animated.Value(height)).current;
  const photoTranslateY = useRef(new Animated.Value(0)).current;
  const [isPhotoDismissing, setIsPhotoDismissing] = useState(false);

  // Show image selection options
  const showImageOptions = () => {
    setShowPhotoModal(true);
  };

  // Handle photo selection option
  const handlePhotoOption = (option) => {
    switch (option) {
      case 'camera':
        handleTakePhoto();
        break;
      case 'library':
        handlePickImage();
        break;
      case 'remove':
        handlePhotoModalClose();
        deleteProfilePicture();
        break;
      default:
        handlePhotoModalClose();
        break;
    }
  };

  // Wrapper for camera with proper modal handling
  const handleTakePhoto = () => {
    handlePhotoModalClose(); // Close modal first
    setTimeout(() => {
      takePhoto(); // Call after modal closes
    }, 350); // Slightly longer delay to ensure modal is fully closed
  };

  // Wrapper for gallery with proper modal handling
  const handlePickImage = () => {
    handlePhotoModalClose(); // Close modal first
    setTimeout(() => {
      pickImage(); // Call after modal closes
    }, 350); // Slightly longer delay to ensure modal is fully closed
  };

  // Handle photo modal close with animation
  const handlePhotoModalClose = () => {
    if (!isPhotoDismissing) {
      setIsPhotoDismissing(true);
      Animated.parallel([
        Animated.timing(photoFadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(photoSlideAnim, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(photoTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowPhotoModal(false);
        setIsPhotoDismissing(false);
      });
    }
  };

  // Swipe gesture handlers
  const handleGesture = Animated.event(
    [{ nativeEvent: { translationY: photoTranslateY } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const { translationY } = event.nativeEvent;
        
        // Only allow downward movement (dismissal)
        if (translationY > 0) {
          // Background opacity fades to 0 as modal approaches bottom
          const progress = Math.min(translationY / (height * 0.4), 1);
          const opacity = 1 - progress;
          photoFadeAnim.setValue(opacity);
        }
      }
    }
  );

  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    // Dismissal logic: lower threshold + velocity consideration
    const dismissThreshold = height * 0.2; // 20% of screen height
    const fastSwipeVelocity = 1200; // High velocity threshold
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      handlePhotoModalClose();
    } else {
      // Snap back
      Animated.parallel([
        Animated.spring(photoTranslateY, {
          toValue: 0,
          tension: 150,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(photoFadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  // Handle photo modal opening/closing animations
  useEffect(() => {
    if (showPhotoModal && !isPhotoDismissing) {
      // Reset animations to starting values
      photoFadeAnim.setValue(0);
      photoSlideAnim.setValue(height);
      photoTranslateY.setValue(0);
      
      // Run animations when modal opens
      Animated.parallel([
        // Fade in the background overlay
        Animated.timing(photoFadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        // Slide up the content
        Animated.timing(photoSlideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [showPhotoModal, isPhotoDismissing]);

  // Request permissions and pick an image
  const pickImage = async () => {
    try {
      console.log('Starting image picker process...');
      
      // First check current permission status
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
      console.log('Current permission status:', status);
      
      let permissionResult;
      if (status !== 'granted') {
        console.log('Requesting media library permissions...');
        permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log('Permission result:', permissionResult);
        
        if (!permissionResult.granted) {
          Alert.alert(
            'Permission Required',
            'You need to grant permission to access your photos to change your profile picture.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        exif: false, // Don't include EXIF data to reduce size
        base64: false, // Don't include base64 to improve performance
      });
      
      console.log('Image picker result:', { canceled: result.canceled, assetsLength: result.assets?.length });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Setting profile image:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      } else if (result.canceled) {
        console.log('User canceled image selection');
      } else {
        console.log('No image was selected');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      showMessage('Failed to select image. Please try again.', 'error');
    }
  };
  
  // Take a photo with the camera
  const takePhoto = async () => {
    try {
      console.log('Starting camera process...');
      
      // First check current permission status
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      console.log('Current camera permission status:', status);
      
      let permissionResult;
      if (status !== 'granted') {
        console.log('Requesting camera permissions...');
        permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        console.log('Camera permission result:', permissionResult);
        
        if (!permissionResult.granted) {
          Alert.alert(
            'Permission Required',
            'You need to grant camera permission to take a new profile picture.',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        exif: false, // Don't include EXIF data to reduce size
        base64: false, // Don't include base64 to improve performance
      });
      
      console.log('Camera result:', { canceled: result.canceled, assetsLength: result.assets?.length });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        console.log('Setting profile image from camera:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      } else if (result.canceled) {
        console.log('User canceled camera');
      } else {
        console.log('No photo was taken');
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code
      });
      showMessage('Failed to take photo. Please try again.', 'error');
    }
  };

  // Delete profile picture
  const deleteProfilePicture = () => {
    setProfileImage(null);
  };


  // Get user initials for placeholder
  const getInitials = () => {
    if (!profileName || profileName.trim() === '') return '?';
    
    return profileName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Get streak emoji based on streak length
  const getStreakEmoji = (days) => {
    if (days >= 365) return '👑'; // Crown (365+ days)
    if (days >= 180) return '🏆'; // Trophy (180-364 days)
    if (days >= 90) return '⭐'; // Star (90-179 days)
    if (days >= 30) return '⚡'; // Lightning (30-89 days)
    if (days >= 7) return '🚀'; // Rocket (7-29 days)
    return '🔥'; // Flame (1-6 days)
  };

  // Helper function for showing notifications with fallback
  const showMessage = (message, type = 'info') => {
    if (showNotification) {
      showNotification(message, type);
    } else {
      // Fallback to Alert
      Alert.alert(type === 'error' ? 'Error' : 'Success', message);
    }
  };

  // AI login/logout functions
  const handleAILogin = () => {
    setIsLoginModalVisible(true);
  };

  const handleAILoginSuccess = () => {
    setIsLoginModalVisible(false);
    setShowLoginSuccess(true);
    
    // Auto-dismiss login success modal after 2 seconds
    setTimeout(() => {
      setShowLoginSuccess(false);
    }, 2000);
  };

  const handleAILogout = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    setIsLoggingOut(true);
    setShowLogoutSuccess(true);
    
    try {
      const success = await logout();
      if (success) {
        // Show custom success modal instead of notification
        setTimeout(() => {
          setShowLogoutSuccess(false);
        }, 2000); // Auto-dismiss after 2 seconds
      }
    } catch (error) {
      console.error('Error logging out:', error);
      setShowLogoutSuccess(false);
      showMessage('Failed to sign out. Please try again.', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Save profile changes
  const handleSave = async () => {
    if (!profileName.trim()) {
      showMessage('Please enter a name', 'error');
      return;
    }

    setIsSaving(true);
    
    try {
      const updatedProfile = {
        ...profile,
        name: profileName.trim(),
        profileImage: profileImage
      };
      
      console.log('EditProfile: Attempting to save profile:', updatedProfile);
      await updateProfile(updatedProfile);
      console.log('EditProfile: Profile saved successfully, starting fade out');
      
      // Start fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Close the screen after fade completes
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          // Fallback if goBack doesn't work
          navigation.navigate('Profile');
        }
      });
    } catch (error) {
      console.error('EditProfile: Error saving profile:', error);
      showMessage('Failed to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle back button
  const handleBack = async () => {
    setIsGoingBack(true);
    
    try {
      // Small delay to ensure state updates are visible
      await new Promise(resolve => setTimeout(resolve, 100));
      navigation.goBack();
    } catch (error) {
      console.error('Error going back:', error);
      setIsGoingBack(false); // Reset if navigation fails
    }
  };

  const profileImageSize = 150;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.animatedContainer, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBack} 
          disabled={isGoingBack || isSaving}
          style={[styles.backButton, { opacity: (isGoingBack || isSaving) ? 0.6 : 1 }]}
        >
          {isGoingBack ? (
            <ActivityIndicator size="small" color={theme.text} />
          ) : (
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          )}
        </TouchableOpacity>
        <View style={styles.headerSpacer} />
        <TouchableOpacity 
          onPress={handleSave}
          disabled={isSaving || isGoingBack}
          style={[styles.saveButton, { opacity: (isSaving || isGoingBack) ? 0.6 : 1 }]}
        >
          {isSaving ? (
            <View style={styles.saveButtonContent}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.saveButtonText, { color: theme.primary, marginLeft: 8 }]}>
                Saving...
              </Text>
            </View>
          ) : (
            <Text style={[styles.saveButtonText, { color: theme.primary }]}>
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <TouchableOpacity 
            onPress={showImageOptions}
            style={styles.profileImageWrapper}
          >
            <View style={styles.profileImageContainer}>
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={[
                    styles.profileImage,
                    { 
                      width: profileImageSize,
                      height: profileImageSize,
                      borderColor: theme.border
                    }
                  ]} 
                />
              ) : (
                <View style={[
                  styles.profileImagePlaceholder,
                  { 
                    width: profileImageSize,
                    height: profileImageSize,
                    backgroundColor: theme.surfaceLight,
                    borderColor: theme.border
                  }
                ]}>
                  <Text style={[
                    styles.profileInitials,
                    { 
                      color: theme.textSecondary,
                      fontSize: scaleFontSize(profileImageSize * 0.35)
                    }
                  ]}>
                    {getInitials()}
                  </Text>
                </View>
              )}
              
              
              {/* Camera overlay */}
              <View style={[styles.cameraOverlay, { backgroundColor: theme.primary }]}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>Name</Text>
          <TextInput
            style={[
              styles.nameInput,
              { 
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            value={profileName}
            onChangeText={setProfileName}
            placeholder="Enter your name"
            placeholderTextColor={theme.textSecondary}
            maxLength={50}
          />
        </View>

        {/* AI Account Section */}
        <View style={styles.aiAccountSection}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>AI Account</Text>
          {!isAuthenticated && (
            <Text style={[styles.aiAccountDescription, { color: theme.textSecondary }]}>
              Connect to your AI account to access AI features and assistant
            </Text>
          )}
          
          {isAuthenticated ? (
            <View style={styles.aiAccountConnected}>
              {/* User Info Header */}
              <View style={[styles.aiAccountCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.aiAccountInfo}>
                  <View style={styles.aiAccountStatus}>
                    <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
                    <Text style={[styles.statusText, { color: theme.text }]}>Connected</Text>
                  </View>
                  <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email}</Text>
                </View>
                <TouchableOpacity 
                  onPress={handleAILogout}
                  disabled={isLoggingOut}
                  style={[styles.aiActionButton, styles.logoutButton]}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color="#FF5722" />
                  ) : (
                    <>
                      <Ionicons name="log-out-outline" size={16} color="#FF5722" />
                      <Text style={[styles.aiActionButtonText, { color: '#FF5722' }]}>Sign Out</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              {/* Subscription Details */}
              <View style={[styles.subscriptionDetails, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {/* Plan Information */}
                <View style={styles.planInfo}>
                  <Text style={[styles.planLabel, { color: theme.textSecondary }]}>
                    Current Plan
                  </Text>
                  <Text style={[styles.planName, { color: theme.text }]}>
                    {realSubscriptionInfo?.formattedTierName || 'Free'}
                  </Text>
                </View>

                {/* Credits Information */}
                <View style={styles.creditsInfo}>
                  <Text style={[styles.creditsLabel, { color: theme.textSecondary }]}>
                    Available Credits
                  </Text>
                  <Text style={[styles.creditsValue, { color: theme.primary }]}>
                    {(() => {
                      const state = appContext;
                      const baseCredits = state.credits?.baseCredits || 0;
                      const rolledOverCredits = state.credits?.rolledOverCredits || 0;
                      const creditsUsed = state.credits?.creditsUsed || 0;
                      const totalAvailable = baseCredits + rolledOverCredits - creditsUsed;
                      return Math.max(0, totalAvailable);
                    })()}
                  </Text>
                </View>

                {/* Renewal Information */}
                <View style={styles.renewalInfo}>
                  <Text style={[styles.renewalLabel, { color: theme.textSecondary }]}>
                    {(realSubscriptionInfo?.isFreeTier ?? true) ? 'Credits reset' : 'Renews'}
                  </Text>
                  <Text style={[styles.renewalValue, { color: theme.text }]}>
                    {realSubscriptionInfo?.formattedRefreshDate || 'Daily'}
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={handleAILogin}
              style={[styles.aiAccountCard, styles.loginCard, { backgroundColor: theme.surface, borderColor: theme.primary }]}
            >
              <View style={styles.aiAccountInfo}>
                <View style={styles.aiAccountStatus}>
                  <View style={[styles.statusIndicator, { backgroundColor: '#FF9800' }]} />
                  <Text style={[styles.statusText, { color: theme.text }]}>Not Connected</Text>
                </View>
                <Text style={[styles.loginPrompt, { color: theme.textSecondary }]}>
                  Sign in to access AI features
                </Text>
              </View>
              <View style={[styles.aiActionButton, styles.loginButton, { backgroundColor: theme.primary }]}>
                <Ionicons name="log-in-outline" size={16} color="white" />
                <Text style={[styles.aiActionButtonText, { color: 'white' }]}>Sign In</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

      </ScrollView>

      {/* AI Login Modal */}
      <Modal
        visible={isLoginModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsLoginModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>AI Account Sign In</Text>
            <TouchableOpacity 
              onPress={() => setIsLoginModalVisible(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          <LoginScreen 
            onLoginSuccess={handleAILoginSuccess}
            onClose={() => setIsLoginModalVisible(false)}
            embedded={true}
          />
        </SafeAreaView>
      </Modal>

      {/* Logout Confirmation Modal */}
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

      {/* Logout Success Modal */}
      {showLogoutSuccess && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showLogoutSuccess}
          onRequestClose={() => setShowLogoutSuccess(false)}
        >
          <View style={styles.logoutSuccessOverlay}>
            <View style={[styles.logoutSuccessContainer, { backgroundColor: theme.surface }]}>
              <View style={styles.logoutSuccessIconContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              </View>
              <Text style={[styles.logoutSuccessTitle, { color: theme.text }]}>
                Signed Out
              </Text>
              <Text style={[styles.logoutSuccessMessage, { color: theme.textSecondary }]}>
                Your AI account has been disconnected
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Login Success Modal */}
      {showLoginSuccess && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showLoginSuccess}
          onRequestClose={() => setShowLoginSuccess(false)}
        >
          <View style={styles.loginSuccessOverlay}>
            <View style={[styles.loginSuccessContainer, { backgroundColor: theme.surface }]}>
              <View style={styles.loginSuccessIconContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              </View>
              <Text style={[styles.loginSuccessTitle, { color: theme.text }]}>
                Connected
              </Text>
              <Text style={[styles.loginSuccessMessage, { color: theme.textSecondary }]}>
                Your AI account has been connected successfully
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Photo Selection Modal */}
      {showPhotoModal && (
        <Modal
          transparent={true}
          animationType="none"
          visible={showPhotoModal}
          onRequestClose={handlePhotoModalClose}
        >
          <View style={styles.photoModalOverlay}>
            {/* Animated backdrop */}
            <Animated.View 
              style={[
                styles.photoModalBackdrop, 
                { opacity: photoFadeAnim }
              ]}
            >
              <TouchableOpacity 
                style={styles.backdropTouchable}
                activeOpacity={1}
                onPress={handlePhotoModalClose}
              />
            </Animated.View>
            
            {/* Modal Content with gesture handling */}
            <PanGestureHandler
              onGestureEvent={handleGesture}
              onHandlerStateChange={(event) => {
                if (event.nativeEvent.state === State.END) {
                  handleGestureEnd(event);
                }
              }}
            >
              <Animated.View 
                style={[
                  styles.photoModalContainer,
                  { 
                    transform: [
                      { translateY: Animated.add(photoSlideAnim, photoTranslateY) }
                    ]
                  }
                ]}
              >
                {/* Handle bar */}
                <View style={styles.photoModalHandle} />
                
                <Text style={styles.photoModalTitle}>
                  Profile Picture
                </Text>
                
                <View style={styles.photoModalOptions}>
                  <TouchableOpacity
                    style={styles.photoModalOption}
                    onPress={() => handlePhotoOption('camera')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.photoOptionIconContainer}>
                      <Ionicons name="camera" size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.photoOptionText}>
                      Take Photo
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.photoModalOption}
                    onPress={() => handlePhotoOption('library')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.photoOptionIconContainer}>
                      <Ionicons name="images" size={22} color="#FFFFFF" />
                    </View>
                    <Text style={styles.photoOptionText}>
                      Choose from Library
                    </Text>
                  </TouchableOpacity>
                  
                  {profileImage && (
                    <TouchableOpacity
                      style={styles.photoModalOption}
                      onPress={() => handlePhotoOption('remove')}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.photoOptionIconContainer, { backgroundColor: '#FF3B30' }]}>
                        <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                      </View>
                      <Text style={[styles.photoOptionText, { color: '#FF3B30' }]}>
                        Remove Photo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                <TouchableOpacity
                  style={styles.photoModalCancel}
                  onPress={handlePhotoModalClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.photoCancelText}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </PanGestureHandler>
          </View>
        </Modal>
      )}

      {/* Bottom Streak Display */}
      <View style={[styles.streakDisplaySection, { backgroundColor: '#000000', borderTopColor: theme.border }]}>
        <View style={styles.streakItem}>
          <Text style={styles.streakLabel}>Current Streak</Text>
          <View style={styles.streakValueContainer}>
            <Text style={styles.streakEmojiLarge}>
              {streakData.currentStreak > 0 ? getStreakEmoji(streakData.currentStreak) : '🔥'}
            </Text>
            <Text style={styles.streakValue}>
              {streakData.currentStreak} {streakData.currentStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
        
        <View style={styles.streakDivider} />
        
        <View style={styles.streakItem}>
          <Text style={styles.streakLabel}>Best Streak</Text>
          <View style={styles.streakValueContainer}>
            <Text style={styles.streakEmojiLarge}>
              {streakData.longestStreak > 0 ? getStreakEmoji(streakData.longestStreak) : '🏆'}
            </Text>
            <Text style={styles.streakValue}>
              {streakData.longestStreak} {streakData.longestStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
      </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
  },
  backButton: {
    padding: spacing.s,
    marginRight: spacing.s,
  },
  headerSpacer: {
    flex: 1,
  },
  saveButton: {
    padding: spacing.s,
  },
  saveButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.m,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  profileImageWrapper: {
    position: 'relative',
    marginBottom: spacing.s,
  },
  profileImageContainer: {
    position: 'relative', // Added for streak badge positioning
  },
  profileImage: {
    borderRadius: 50,
    borderWidth: 2,
  },
  defaultAvatarContainer: {
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImagePlaceholder: {
    borderRadius: 50,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    fontWeight: 'bold',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  inputSection: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: fontSizes.md,
    textAlignVertical: 'center',
    minHeight: 48, // Ensures consistent height across platforms
  },
  // AI Account Section Styles
  aiAccountSection: {
    marginBottom: spacing.xl,
  },
  aiAccountConnected: {
    // Container for connected account with subscription details
  },
  aiAccountDescription: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.m,
    lineHeight: 20,
  },
  aiAccountCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loginCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  aiAccountInfo: {
    flex: 1,
  },
  aiAccountStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: fontSizes.sm,
  },
  loginPrompt: {
    fontSize: fontSizes.sm,
  },
  aiActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: 8,
    marginLeft: spacing.m,
  },
  loginButton: {
    // backgroundColor will be set dynamically
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  aiActionButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  // Subscription Details Styles
  subscriptionDetails: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.m,
    marginTop: spacing.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  planInfo: {
    alignItems: 'center',
    flex: 1,
  },
  planLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    opacity: 0.7,
  },
  planName: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  creditsInfo: {
    alignItems: 'center',
    flex: 1,
  },
  creditsLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    opacity: 0.7,
  },
  creditsValue: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  renewalInfo: {
    alignItems: 'center',
    flex: 1,
  },
  renewalLabel: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    opacity: 0.7,
  },
  renewalValue: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    padding: spacing.s,
  },
  // Logout modal styles
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
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  logoutConfirmText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Logout Success Modal Styles
  logoutSuccessOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoutSuccessContainer: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  logoutSuccessIconContainer: {
    marginBottom: 20,
  },
  logoutSuccessTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  logoutSuccessMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    fontWeight: '400',
  },
  // Login Success Modal Styles (reuse logout styles)
  loginSuccessOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loginSuccessContainer: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  loginSuccessIconContainer: {
    marginBottom: 20,
  },
  loginSuccessTitle: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  loginSuccessMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    fontWeight: '400',
  },
  // Bottom streak display section
  streakDisplaySection: {
    flexDirection: 'row',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.l,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  streakItem: {
    flex: 1,
    alignItems: 'center',
  },
  streakDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: spacing.m,
  },
  streakLabel: {
    color: '#FFFFFF',
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
    opacity: 0.8,
  },
  streakValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakValue: {
    color: '#FFFFFF',
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  streakEmojiLarge: {
    fontSize: fontSizes.lg,
  },
  // Photo Selection Modal Styles
  photoModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  photoModalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  backdropTouchable: {
    width: '100%',
    height: '100%',
  },
  photoModalContainer: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 15,
  },
  photoModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.l,
  },
  photoModalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xl,
    letterSpacing: 0.3,
    color: '#FFFFFF',
  },
  photoModalOptions: {
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  photoModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.m,
    marginBottom: spacing.s,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  photoOptionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  photoOptionText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  photoModalCancel: {
    marginHorizontal: spacing.l,
    marginTop: spacing.s,
    paddingVertical: spacing.l,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  photoCancelText: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.2,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default EditProfileScreen;
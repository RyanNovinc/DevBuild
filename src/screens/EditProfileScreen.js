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
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useProfile } from '../context/ProfileContext';
import FeatureExplorerTracker from '../services/FeatureExplorerTracker';

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

const EditProfileScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const notificationContext = useNotification();
  const showNotification = notificationContext?.showNotification;
  const { profile: contextProfile, updateProfile } = useProfile();
  
  // Local state
  const [profileName, setProfileName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGoingBack, setIsGoingBack] = useState(false);
  
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

  // Show image selection options
  const showImageOptions = () => {
    const options = [
      {
        text: 'Camera',
        onPress: takePhoto,
      },
      {
        text: 'Photo Library',
        onPress: pickImage,
      }
    ];
    
    // Add remove option if there's a current photo
    if (profileImage) {
      options.push({
        text: 'Remove Photo',
        onPress: deleteProfilePicture,
        style: 'destructive',
      });
    }
    
    options.push({
      text: 'Cancel',
      style: 'cancel',
    });
    
    Alert.alert(
      'Change Profile Picture',
      'Choose how you want to update your profile picture:',
      options
    );
  };

  // Request permissions and pick an image
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant permission to access your photos to change your profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showMessage('Failed to select image. Please try again.', 'error');
    }
  };
  
  // Take a photo with the camera
  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant camera permission to take a new profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      
      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
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

  const profileImageSize = 100;

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

      </ScrollView>

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
});

export default EditProfileScreen;
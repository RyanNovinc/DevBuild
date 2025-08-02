// src/context/ProfileContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

// Create the context
const ProfileContext = createContext();

// Profile provider component
export const ProfileProvider = ({ children }) => {
  const auth = useAuth();
  const { showSuccess, showError } = useNotification() || { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.error(msg)
  };

  // Profile state
  const [profile, setProfile] = useState({
    name: auth?.user?.displayName || 'User',
    email: auth?.user?.email || '',
    bio: '',
    profileImage: null,
    defaultAvatar: null,
    levelProfilePicture: null
  });

  // Load profile on mount and when auth changes
  useEffect(() => {
    loadProfile();
  }, [auth?.user]);

  // Load profile from storage
  const loadProfile = async () => {
    try {
      console.log('ProfileContext: Loading profile from storage');
      const storedProfileJson = await AsyncStorage.getItem('userProfile');
      
      if (storedProfileJson) {
        const storedProfile = JSON.parse(storedProfileJson);
        console.log('ProfileContext: Loaded profile from AsyncStorage:', storedProfile);
        
        // Update state with the loaded profile
        setProfile({
          name: storedProfile.name || auth?.user?.displayName || 'User',
          email: storedProfile.email || auth?.user?.email || '',
          bio: storedProfile.bio || '',
          profileImage: storedProfile.profileImage,
          defaultAvatar: storedProfile.defaultAvatar,
          levelProfilePicture: storedProfile.levelProfilePicture
        });
      } else if (auth?.user) {
        // If no stored profile but we have auth, use auth data
        setProfile({
          name: auth.user.displayName || 'User',
          email: auth.user.email || '',
          bio: '',
          profileImage: null,
          defaultAvatar: null,
          levelProfilePicture: null
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      showError('Failed to load profile data');
    }
  };

  // Update profile
  const updateProfile = async (updatedProfile) => {
    try {
      console.log('ProfileContext: Updating profile:', updatedProfile);
      console.log('ProfileContext: Level profile picture:', updatedProfile.levelProfilePicture);
      console.log('ProfileContext: Profile image:', updatedProfile.profileImage);
      console.log('ProfileContext: Default avatar:', updatedProfile.defaultAvatar);
      
      // Ensure we preserve existing profile structure while updating
      const newProfile = {
        ...profile, // Keep existing profile data
        ...updatedProfile, // Override with new data
      };
      
      console.log('ProfileContext: Final merged profile:', newProfile);
      
      // Update state
      setProfile(newProfile);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
      console.log('ProfileContext: Profile saved to AsyncStorage');
      
      // Verify what was saved
      const savedProfile = await AsyncStorage.getItem('userProfile');
      console.log('ProfileContext: Verified saved profile:', JSON.parse(savedProfile));
      
      // If successful, show success message
      showSuccess('Profile updated successfully');
      
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile');
      return false;
    }
  };

  // Force refresh profile (useful for debugging)
  const refreshProfile = async () => {
    await loadProfile();
  };

  // Context value
  const value = {
    profile,
    updateProfile,
    loadProfile,
    refreshProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

// Custom hook to use the profile context
export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

// Export the context for consumers
export default ProfileContext;
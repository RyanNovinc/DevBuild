// src/screens/ProfileScreen/ProfileHeader.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  isSmallDevice,
  ensureAccessibleTouchTarget
} from '../../utils/responsive';
import FeatureExplorerTracker from '../../services/FeatureExplorerTracker';
// Import the shared avatar components
import { DefaultAvatar, COLOR_PALETTE } from '../../components/AvatarComponents';

// Main header component - completely removed
const ProfileHeader = ({ theme, toggleSettings }) => {
  // Header is now empty as we've moved the settings button into the banner
  return null;
};

// Banner subcomponent - settings button aligned with name
ProfileHeader.Banner = ({ theme, isDarkMode, profile, user, navigation, onThemePickerOpen, toggleSettings }) => {
  // Get safe area insets to properly position elements
  const insets = useSafeAreaInsets();
  
  // State for streak data
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0
  });
  
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
  
  // Calculate proper status bar height (minimum 20 for older devices)
  const statusBarHeight = Math.max(insets.top, 20);
  
  // Detect Dynamic Island
  const hasDynamicIsland = insets.top >= 59;
  
  // Determine specific colors for profile UI elements based on theme
  const profileBannerStyles = {
    backgroundColor: theme.primary,
    paddingTop: statusBarHeight + 15, // Increased top padding
    height: isSmallDevice ? 190 : 220, // Increased height to make banner taller
    paddingBottom: scaleHeight(30), // Added more bottom padding
  };
  
  // IMPROVED: Overscroll extension style
  // This view extends far above the banner to handle overscroll
  const bannerExtensionStyle = {
    position: 'absolute',
    top: -2000, // Extended even higher above the visible area
    left: 0,
    right: 0,
    height: 2000, // Much taller for any overscroll amount
    backgroundColor: theme.primary, // Same color as the banner
    zIndex: 0, // Changed from -1 to ensure visibility
  };

  // IMPROVED CONTRAST: Ensure text is always readable on primary color background
  const profileTextStyles = {
    color: theme.primaryContrast || (isDarkMode ? '#000000' : '#FFFFFF'),
  };

  // Get user initials for placeholder
  const getInitials = () => {
    if (!profile.name || profile.name.trim() === '') return '?';
    
    return profile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Calculate image size based on device size - increased size for better visibility
  const profileImageSize = isSmallDevice ? 80 : 90;
  const borderRadius = profileImageSize / 2;
  
  // Get streak emoji based on streak length
  const getStreakEmoji = (days) => {
    if (days >= 365) return '👑'; // Crown (365+ days)
    if (days >= 180) return '🏆'; // Trophy (180-364 days)
    if (days >= 90) return '⭐'; // Star (90-179 days)
    if (days >= 30) return '⚡'; // Lightning (30-89 days)
    if (days >= 7) return '🚀'; // Rocket (7-29 days)
    return '🔥'; // Flame (1-6 days)
  };

  // Render the default avatar if one is selected and no profile image is set
  const renderProfileImage = () => {
    if (profile.profileImage) {
      // Render actual profile image
      return (
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: profile.profileImage }} 
            style={[
              styles.profileImage, 
              { 
                width: profileImageSize,
                height: profileImageSize,
                borderRadius: borderRadius,
                borderColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)' 
              }
            ]} 
            accessible={true}
            accessibilityLabel="Profile picture"
            accessibilityRole="image"
          />
          
          {/* Streak Badge - only show if streak > 0 */}
          {streakData.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>
                {getStreakEmoji(streakData.currentStreak)}
              </Text>
              <Text style={styles.streakCount}>
                {streakData.currentStreak}
              </Text>
            </View>
          )}
        </View>
      );
    } else if (profile.defaultAvatar) {
      // Render default avatar with the shared component
      return (
        <View style={styles.profileImageContainer}>
          <View style={[
            styles.defaultAvatarContainer,
            { 
              width: profileImageSize,
              height: profileImageSize,
              borderRadius: borderRadius,
              borderColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.8)',
              borderWidth: 2,
              overflow: 'hidden'
            }
          ]}>
            <DefaultAvatar
              size={profileImageSize - 4} // Account for border
              colorIndex={profile.defaultAvatar.colorIndex}
              iconName={profile.defaultAvatar.iconName}
              initials={getInitials()}
            />
          </View>
          
          {/* Streak Badge - only show if streak > 0 */}
          {streakData.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>
                {getStreakEmoji(streakData.currentStreak)}
              </Text>
              <Text style={styles.streakCount}>
                {streakData.currentStreak}
              </Text>
            </View>
          )}
        </View>
      );
    } else {
      // Default placeholder with initials
      return (
        <View style={styles.profileImageContainer}>
          <View style={[
            styles.profileImagePlaceholder, 
            { 
              width: profileImageSize,
              height: profileImageSize,
              borderRadius: borderRadius,
              backgroundColor: isDarkMode ? '#000000' : '#FFFFFF',
              borderColor: isDarkMode ? '#FFFFFF' : '#000000',
              borderWidth: 2
            }
          ]}>
            <Text style={[
              styles.profileInitials, 
              { 
                color: isDarkMode ? '#FFFFFF' : '#000000',
                fontWeight: '700',
                fontSize: scaleFontSize(profileImageSize * 0.35)
              }
            ]}>
              {getInitials()}
            </Text>
          </View>
          
          {/* Streak Badge - only show if streak > 0 */}
          {streakData.currentStreak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakEmoji}>
                {getStreakEmoji(streakData.currentStreak)}
              </Text>
              <Text style={styles.streakCount}>
                {streakData.currentStreak}
              </Text>
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <TouchableOpacity 
        activeOpacity={0.6}
        onPress={onThemePickerOpen}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Change app theme"
        accessibilityHint="Opens the theme color picker to customize app appearance"
        style={[styles.profileBanner, profileBannerStyles]}
      >
      {/* Banner extension for overscroll - positioned OUTSIDE normal flow */}
      <View style={bannerExtensionStyle} />
      
      {/* Banner content with original spacing */}
      <View style={styles.profileContent}>
        <View style={styles.profileHeader}>
          {/* Profile image on the left - with centering container */}
          <View style={styles.profileImageWrapper}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('EditProfile', { profile })}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              accessibilityHint="Opens the profile editor to change your name and picture"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.profileImageTouchable}
            >
              {renderProfileImage()}
            </TouchableOpacity>
          </View>
          
          {/* Profile info in the middle - REMOVED onPress from here */}
          <View style={styles.profileInfo}>
            <Text 
              style={[
                styles.profileName, 
                profileTextStyles,
                { fontSize: scaleFontSize(20) } // Increased font size
              ]}
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {profile.name || user?.displayName || "User"}
            </Text>
          </View>
          
          {/* Settings button aligned with name */}
          <TouchableOpacity 
            style={[
              styles.settingsButton,
              ensureAccessibleTouchTarget(scaleWidth(36), scaleWidth(36))
            ]}
            onPress={toggleSettings}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Settings"
            accessibilityHint="Opens the settings menu"
          >
            <Ionicons 
              name="settings-outline" 
              size={scaleWidth(20)} 
              color={theme.primaryContrast || (isDarkMode ? '#000000' : '#FFFFFF')} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Profile Banner - significantly reduced height
  profileBanner: {
    padding: scaleWidth(16),
    paddingTop: 40, // Default padding, will be overridden by dynamic calculation
    paddingBottom: scaleHeight(20),
    borderBottomLeftRadius: scaleWidth(20),
    borderBottomRightRadius: scaleWidth(20),
    // height set in component style
    position: 'relative', // This ensures the absolute positioning works
    overflow: 'visible', // IMPORTANT: Changed from 'hidden' to 'visible' to allow extension to show
  },
  // NEW: Theme touchable area - covers the entire banner
  themeTouchableArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1, // Above the background but below the content
  },
  // Settings button - now inline with profile name
  settingsButton: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(18),
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
    marginLeft: 'auto', // Push to the right side
    zIndex: 3, // Ensure it's above the theme touchable area
  },
  // Content wrapper for banner that responds to touch
  profileContent: {
    flex: 1,
    marginTop: scaleHeight(15), // Increased space at the top for better vertical centering
    zIndex: 2, // Above the theme touchable area
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleHeight(15), // Increased bottom margin for more spacing
  },
  // New wrapper for profile image to improve positioning
  profileImageWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scaleWidth(4), // Added left margin for better centering
    marginRight: scaleWidth(4), // Added right margin for spacing
    zIndex: 3, // Ensure it's above the theme touchable area
  },
  profileImageTouchable: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3, // Ensure it's above the theme touchable area
  },
  profileImageContainer: {
    // width and height set dynamically
    zIndex: 3, // Ensure it's above the theme touchable area
    position: 'relative', // Added for streak badge positioning
  },
  profileImage: {
    // width, height, and borderRadius set dynamically
    borderWidth: 2,
  },
  profileImagePlaceholder: {
    // width, height, and borderRadius set dynamically
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    // fontSize set dynamically
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    marginLeft: scaleWidth(8), // Added left margin for better spacing from avatar
  },
  profileName: {
    // fontSize set in component
    fontWeight: 'bold',
    marginBottom: scaleHeight(2),
  },
  // Added for DefaultAvatar wrapper
  defaultAvatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Streak Badge Styles
  streakBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent background
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakEmoji: {
    fontSize: 10,
    marginRight: 1,
  },
  streakCount: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  }
});

export default ProfileHeader;
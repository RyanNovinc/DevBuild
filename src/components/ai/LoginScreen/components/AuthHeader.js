// src/components/ai/LoginScreen/components/AuthHeader.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { useProfile } from '../../../../context/ProfileContext';
import { DefaultAvatar } from '../../../../components/AvatarComponents';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  fontSizes,
  getByDeviceSize,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  meetsContrastRequirements
} from '../../../../utils/responsive';

const AuthHeader = ({ title, subtitle, icon = "star" }) => {
  const { theme } = useTheme();
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // Get profile from profile context with defensive checks
  const { profile: contextProfile } = useProfile();
  const profile = contextProfile || {};
  
  // Debug logging to see what profile data we're getting
  console.log('AuthHeader - ProfileContext profile:', contextProfile);
  console.log('AuthHeader - Profile data:', profile);
  console.log('AuthHeader - Profile name:', profile?.name);
  console.log('AuthHeader - Profile image:', profile?.profileImage);
  console.log('AuthHeader - Default avatar:', profile?.defaultAvatar);
  
  // Get the user's name for welcome message
  const userName = profile?.name || 'User';
  
  // Get responsive logo size based on device
  const logoSize = getByDeviceSize({
    small: 80,
    medium: 100,
    large: 120,
    tablet: 140
  });
  
  // Get user initials for placeholder (matching profile screen logic)
  const getInitials = () => {
    if (!profile.name || profile.name.trim() === '') return 'LC'; // LifeCompass initials as default
    
    const initials = profile.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
    
    // Limit to first 2 characters max (same as profile screen)
    return initials.substring(0, 2);
  };
  
  // Render the profile image using same logic as ProfileHeader
  const renderProfileImage = () => {
    if (profile.profileImage) {
      // Priority 1: Render actual profile image (custom photo)
      return (
        <Image 
          source={{ uri: profile.profileImage }} 
          style={[
            styles.logoCircle, 
            { 
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize / 2,
            }
          ]} 
          accessible={true}
          accessibilityLabel="Profile picture"
          accessibilityRole="image"
        />
      );
    } else if (profile.defaultAvatar) {
      // Priority 2: Render default avatar
      return (
        <View style={[
          styles.logoCircle,
          { 
            width: logoSize,
            height: logoSize,
            borderRadius: logoSize / 2,
            backgroundColor: 'transparent',
            overflow: 'hidden'
          }
        ]}>
          <DefaultAvatar
            size={logoSize}
            colorIndex={profile.defaultAvatar.colorIndex}
            iconName={profile.defaultAvatar.iconName}
            initials={getInitials()}
          />
        </View>
      );
    } else {
      // Priority 3: Default initials placeholder - black minimal style
      return (
        <View 
          style={[
            styles.logoCircle, 
            { 
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize / 2,
              backgroundColor: 'rgba(255,255,255,0.05)', // Subtle white background
              borderColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              justifyContent: 'center',
              alignItems: 'center'
            }
          ]}
        >
          <Text 
            style={{
              color: '#FFFFFF',
              fontWeight: '300', // Lighter weight
              fontSize: logoSize * 0.3,
              textAlign: 'center',
              letterSpacing: 1
            }}
            accessible={true}
            accessibilityLabel={`Profile initials: ${getInitials()}`}
          >
            {getInitials()}
          </Text>
        </View>
      );
    }
  };
  
  // Ensure contrast requirements are met
  const textColor = meetsContrastRequirements(theme.text, theme.background) 
    ? theme.text 
    : '#000000'; // Fallback to black if contrast is insufficient
  
  const secondaryTextColor = meetsContrastRequirements(theme.textSecondary, theme.background) 
    ? theme.textSecondary 
    : '#555555'; // Fallback to dark gray if contrast is insufficient
  
  // Adjust spacing based on orientation and device
  const marginBottom = isLandscape 
    ? scaleHeight(15) 
    : scaleHeight(30);
  
  return (
    <View 
      style={[
        styles.container, 
        { 
          marginBottom: marginBottom,
          // Adjust for Dynamic Island or notches in landscape
          paddingTop: isLandscape ? safeSpacing.top : 0
        }
      ]}
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel={`${title || "LifeCompass"} app`}
    >
      <View style={{ marginBottom: spacing.l }}>
        {renderProfileImage()}
      </View>
      <Text 
        style={[
          styles.appName, 
          { 
            color: '#FFFFFF',
            fontSize: getByDeviceSize({
              small: 18,
              medium: 20,
              large: 22,
              tablet: 24
            }),
            fontWeight: '300',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: spacing.xs
          }
        ]}
        accessible={true}
        accessibilityRole="text"
        maxFontSizeMultiplier={1.8}
      >
        {profile?.name ? `Welcome back, ${profile.name.split(' ')[0]}` : (title || "LifeCompass")}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  logoCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontWeight: 'bold',
  },
  appTagline: {
    textAlign: 'center',
  },
});

export default AuthHeader;
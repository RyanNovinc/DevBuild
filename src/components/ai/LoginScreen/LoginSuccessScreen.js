// src/components/ai/LoginScreen/LoginSuccessScreen.js
import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useProfile } from '../../../context/ProfileContext';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  fontSizes,
  spacing,
  isSmallDevice,
  useSafeSpacing
} from '../../../utils/responsive';

const LoginSuccessScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { profile } = useProfile();
  const safeSpacing = useSafeSpacing();
  
  // Get user's name with priority: Profile name > Route params > User displayName > Email > 'User'
  const userName = profile?.name || 
                  route?.params?.userName || 
                  user?.displayName || 
                  user?.email?.split('@')[0] || 
                  'User';
  
  const handleContinue = () => {
    // Navigate to AI Assistant screen
    navigation.navigate('AIAssistant');
  };

  const getStyles = () => ({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: safeSpacing.top,
      paddingBottom: safeSpacing.bottom,
      paddingLeft: safeSpacing.left,
      paddingRight: safeSpacing.right,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    successIcon: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: isSmallDevice ? fontSizes.xl : fontSizes.xxl,
      fontWeight: 'bold',
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.m,
    },
    subtitle: {
      fontSize: fontSizes.l,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.s,
    },
    welcomeText: {
      fontSize: fontSizes.m,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xxl,
      lineHeight: scaleFontSize(22),
    },
    continueButton: {
      backgroundColor: theme.primary,
      paddingVertical: spacing.m,
      paddingHorizontal: spacing.xxl,
      borderRadius: scaleWidth(12),
      minWidth: scaleWidth(200),
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    continueButtonText: {
      fontSize: fontSizes.l,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  const styles = getStyles();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={theme.background} barStyle={theme.statusBarStyle} />
      
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.successIcon}>
          <Ionicons 
            name="checkmark-circle" 
            size={scaleWidth(120)} 
            color={theme.success || '#4CAF50'} 
          />
        </View>
        
        {/* Success Title */}
        <Text style={styles.title}>
          Welcome Back!
        </Text>
        
        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Successfully signed in
        </Text>
        
        {/* Welcome Message */}
        <Text style={styles.welcomeText}>
          Hi {userName}! You're now logged in and ready to use LifeCompass AI to help achieve your goals.
        </Text>
        
        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
          activeOpacity={0.8}
          accessibilityLabel="Continue to AI Assistant"
          accessibilityHint="Navigate to the main AI assistant screen"
        >
          <Text style={styles.continueButtonText}>
            Continue to AI Assistant
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default LoginSuccessScreen;
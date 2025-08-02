// src/components/ai/LoginScreen/components/AuthHeader.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
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
  
  // Get responsive logo size based on device
  const logoSize = getByDeviceSize({
    small: 80,
    medium: 100,
    large: 120,
    tablet: 140
  });
  
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
      accessibilityLabel={`${title || "Life Balance"} app`}
    >
      <View 
        style={[
          styles.logoCircle, 
          { 
            backgroundColor: theme.primary,
            width: logoSize,
            height: logoSize,
            borderRadius: logoSize / 2,
            marginBottom: spacing.l
          }
        ]}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={`${icon} icon`}
      >
        <Ionicons 
          name={icon} 
          size={logoSize * 0.6} 
          color="#fff" 
        />
      </View>
      <Text 
        style={[
          styles.appName, 
          { 
            color: textColor,
            fontSize: getByDeviceSize({
              small: fontSizes.xl,
              medium: fontSizes.xxl,
              large: fontSizes.xxl,
              tablet: fontSizes.xxxl
            }),
            marginBottom: spacing.xs
          }
        ]}
        accessible={true}
        accessibilityRole="text"
        maxFontSizeMultiplier={1.8} // Support for Dynamic Type
      >
        {title || "Life Balance"}
      </Text>
      <Text 
        style={[
          styles.appTagline, 
          { 
            color: secondaryTextColor,
            fontSize: getByDeviceSize({
              small: fontSizes.s,
              medium: fontSizes.m,
              large: fontSizes.m,
              tablet: fontSizes.l
            }),
            paddingHorizontal: isLandscape ? spacing.xl : spacing.m
          }
        ]}
        accessible={true}
        accessibilityRole="text"
        maxFontSizeMultiplier={2.0} // Support for Dynamic Type
      >
        {subtitle || "Achieve balance across all areas of your life"}
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
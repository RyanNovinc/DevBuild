// src/components/ai/LoginScreen/components/AuthInput.js
import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
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
  accessibility,
  meetsContrastRequirements,
  ensureAccessibleTouchTarget
} from '../../../../utils/responsive';

const AuthInput = ({ 
  icon, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightIcon,
  onRightIconPress,
  maxLength,
  error,
  accessibilityLabel,
  testID
}) => {
  const { theme } = useTheme();
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Get responsive sizes based on device
  const iconSize = getByDeviceSize({
    small: 18,
    medium: 20,
    large: 22,
    tablet: 24
  });
  
  const inputFontSize = getByDeviceSize({
    small: fontSizes.s,
    medium: fontSizes.m,
    large: fontSizes.m,
    tablet: fontSizes.l
  });
  
  // Ensure theme values exist and provide defaults to prevent "replace" errors
  const textColor = theme.text || '#000000';
  const placeholderColor = theme.textSecondary || '#777777';
  
  // Use theme text color, falling back to white for better visibility
  const useTextColor = theme.text || '#FFFFFF';
  
  // Set border color based on error state (with fallbacks)
  const borderColor = error ? (theme.error || '#ff0000') : (theme.border || '#cccccc');
  
  // Ensure minimum touch target size
  const touchableSize = ensureAccessibleTouchTarget(
    scaleWidth(44), 
    scaleHeight(44)
  );
  
  return (
    <View 
      style={[
        styles.inputContainer, 
        { 
          backgroundColor: 'rgba(255,255,255,0.03)', // Very subtle white background
          borderColor: error ? '#FF6B6B' : 'rgba(255,255,255,0.1)',
          borderRadius: 12,
          borderWidth: 1,
          height: 52,
          paddingHorizontal: 0,
        }
      ]}
      accessible={true}
      accessibilityLabel={accessibilityLabel || placeholder}
      accessibilityHint={error ? `Error: ${error}` : undefined}
      accessibilityRole="none"
      accessibilityState={{ disabled: false, error: !!error }}
      testID={testID}
    >
      <TouchableOpacity
        style={[
          styles.inputIcon,
          {
            width: touchableSize.width,
            height: touchableSize.height,
            paddingHorizontal: spacing.s
          }
        ]}
        accessible={false} // Hide from accessibility since it's decorative
      >
        <Ionicons 
          name={icon} 
          size={18} 
          color={error ? '#FF6B6B' : 'rgba(255,255,255,0.5)'}
        />
      </TouchableOpacity>
      
      <TextInput
        style={[
          styles.input, 
          { 
            color: '#FFFFFF',
            fontSize: 14,
            paddingRight: rightIcon ? 8 : 16
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.4)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        accessibilityLabel={placeholder}
        maxFontSizeMultiplier={1.8} // Support for Dynamic Type
      />
      
      {rightIcon && (
        <View style={styles.rightIconContainer}>
          <TouchableOpacity
            style={styles.rightIconButton}
            onPress={onRightIconPress}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${rightIcon} button`}
            accessibilityHint={secureTextEntry ? "Toggle password visibility" : undefined}
            hitSlop={{ top: 10, bottom: 10, left: 15, right: 15 }}
          >
            <Ionicons
              name={rightIcon}
              size={18}
              color="rgba(255,255,255,0.5)"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
    overflow: 'visible', // Changed from 'hidden' to prevent icon clipping
  },
  inputIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  rightIconContainer: {
    minWidth: 44, // Ensure minimum touch target
    paddingHorizontal: 12, // Give proper spacing around the icon
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
});

export default AuthInput;
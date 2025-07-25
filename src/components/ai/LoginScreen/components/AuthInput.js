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
  
  // Only check contrast if both colors are defined
  const useTextColor = (theme.text && theme.inputBackground && 
    meetsContrastRequirements(theme.text, theme.inputBackground)) 
    ? theme.text 
    : '#000000';
  
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
          backgroundColor: theme.inputBackground, 
          borderColor: borderColor,
          borderRadius: spacing.s,
          borderWidth: error ? 2 : 1,
          height: getByDeviceSize({
            small: scaleHeight(48),
            medium: scaleHeight(52),
            large: scaleHeight(56),
            tablet: scaleHeight(60)
          }),
          // Add more horizontal padding in landscape mode on tablets
          paddingHorizontal: isLandscape && width >= 768 ? spacing.m : 0,
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
          size={iconSize} 
          color={error ? (theme.error || '#ff0000') : placeholderColor}
        />
      </TouchableOpacity>
      
      <TextInput
        style={[
          styles.input, 
          { 
            color: useTextColor,
            fontSize: inputFontSize,
            paddingRight: rightIcon ? spacing.xs : spacing.s
          }
        ]}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
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
        <TouchableOpacity
          style={[
            styles.rightIcon,
            {
              width: touchableSize.width,
              height: touchableSize.height,
              paddingHorizontal: spacing.s
            }
          ]}
          onPress={onRightIconPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${rightIcon} button`}
          accessibilityHint={secureTextEntry ? "Toggle password visibility" : undefined}
          // Add hit slop to increase touch target without changing visual size
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={rightIcon}
            size={iconSize}
            color={placeholderColor}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xs,
    overflow: 'hidden',
  },
  inputIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  rightIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AuthInput;
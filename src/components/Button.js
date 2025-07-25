// src/components/Button.js
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

/**
 * Accessible Button component with responsive sizing and VoiceOver support
 * 
 * @param {string} title - Button label text
 * @param {function} onPress - Callback function when button is pressed
 * @param {string} type - Button type (primary, secondary, success, danger, warning, info)
 * @param {string} size - Button size (small, medium, large)
 * @param {string} icon - Optional Ionicons icon name
 * @param {string} iconPosition - Position of icon (left, right)
 * @param {boolean} disabled - Whether button is disabled
 * @param {boolean} loading - Whether button is in loading state
 * @param {object} style - Additional styles for button
 * @param {object} textStyle - Additional styles for button text
 * @param {boolean} fullWidth - Whether button should take full width
 * @param {boolean} rounded - Whether button should have rounded corners
 * @param {boolean} outline - Whether button should have outline style
 * @param {string} accessibilityLabel - Accessibility label for screen readers (falls back to title)
 * @param {string} accessibilityHint - Additional context for screen readers
 */
const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  rounded = false,
  outline = false,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const { theme } = useTheme();
  
  // Get button color based on type
  const getButtonColor = () => {
    if (outline) return 'transparent';
    
    switch (type) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.secondary;
      case 'success':
        return theme.success;
      case 'danger':
        return theme.error;
      case 'warning':
        return theme.warning;
      case 'info':
        return theme.info;
      default:
        return theme.primary;
    }
  };
  
  // Get text color based on type and outline
  const getTextColor = () => {
    if (outline) {
      switch (type) {
        case 'primary':
          return theme.primary;
        case 'secondary':
          return theme.secondary;
        case 'success':
          return theme.success;
        case 'danger':
          return theme.error;
        case 'warning':
          return theme.warning;
        case 'info':
          return theme.info;
        default:
          return theme.primary;
      }
    }
    
    // For non-outline buttons, check for contrast compliance
    const bgColor = getButtonColor();
    
    // Use the a11y utility to get accessible text color
    if (theme.a11y && typeof theme.a11y.getTextColor === 'function') {
      return theme.a11y.getTextColor(bgColor);
    }
    
    // Fallback to white if a11y utilities are not available
    return '#FFFFFF';
  };
  
  // Get border color for outline buttons
  const getBorderColor = () => {
    if (!outline) return 'transparent';
    
    switch (type) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.secondary;
      case 'success':
        return theme.success;
      case 'danger':
        return theme.error;
      case 'warning':
        return theme.warning;
      case 'info':
        return theme.info;
      default:
        return theme.primary;
    }
  };
  
  // Get button size - USING RESPONSIVE VALUES
  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.s,
          height: theme.metrics.component.buttonHeight.small,
          minWidth: theme.metrics.component.buttonMinWidth.small,
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.m,
          paddingHorizontal: theme.spacing.l,
          height: theme.metrics.component.buttonHeight.large,
          minWidth: theme.metrics.component.buttonMinWidth.large,
        };
      case 'medium':
      default:
        return {
          paddingVertical: theme.spacing.s,
          paddingHorizontal: theme.spacing.m,
          height: theme.metrics.component.buttonHeight.medium,
          minWidth: theme.metrics.component.buttonMinWidth.medium,
        };
    }
  };
  
  // Get text size - USING RESPONSIVE VALUES
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return theme.fontSize.button.small;
      case 'large':
        return theme.fontSize.button.large;
      case 'medium':
      default:
        return theme.fontSize.button.medium;
    }
  };
  
  // Get icon size - USING RESPONSIVE VALUES
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return theme.metrics.iconSize.xs;
      case 'large':
        return theme.metrics.iconSize.m;
      case 'medium':
      default:
        return theme.metrics.iconSize.s;
    }
  };
  
  // Get border radius - USING RESPONSIVE VALUES
  const getBorderRadius = () => {
    if (rounded) {
      return theme.metrics.borderRadius.circular;
    }
    
    switch (size) {
      case 'small':
        return theme.metrics.borderRadius.s;
      case 'large':
        return theme.metrics.borderRadius.l;
      case 'medium':
      default:
        return theme.metrics.borderRadius.m;
    }
  };
  
  // Button opacity based on disabled state
  const buttonOpacity = disabled ? 0.6 : 1;
  
  // Generate accessible state
  const getAccessibilityState = () => {
    return {
      disabled: disabled || loading,
      busy: loading
    };
  };
  
  // Determine role
  const accessibilityRole = 'button';

  // Generate a helpful accessibility label if not provided
  const finalAccessibilityLabel = accessibilityLabel || title;
  
  // Compute a helpful accessibility hint if not provided
  const finalAccessibilityHint = accessibilityHint || 
    (disabled ? 'This button is currently disabled' : null);
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonSize(),
        {
          backgroundColor: getButtonColor(),
          borderRadius: getBorderRadius(),
          opacity: buttonOpacity,
          borderWidth: outline ? 1 : 0,
          borderColor: getBorderColor(),
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      // Accessibility props
      accessible={true}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={finalAccessibilityLabel}
      accessibilityHint={finalAccessibilityHint}
      accessibilityState={getAccessibilityState()}
      // Minimum touch target size for accessibility
      hitSlop={
        // Add hit slop if needed to reach minimum touch target size
        (getButtonSize().height < theme.metrics.component.minTouchTarget ||
         (style?.height && style.height < theme.metrics.component.minTouchTarget)) ? 
        {
          top: Math.max(0, (theme.metrics.component.minTouchTarget - (getButtonSize().height || 0)) / 2),
          bottom: Math.max(0, (theme.metrics.component.minTouchTarget - (getButtonSize().height || 0)) / 2),
          left: Math.max(0, (theme.metrics.component.minTouchTarget - (getButtonSize().width || 0)) / 2),
          right: Math.max(0, (theme.metrics.component.minTouchTarget - (getButtonSize().width || 0)) / 2)
        } : undefined
      }
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
          accessibilityLabel="Loading"
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={getIconSize()} 
              color={getTextColor()} 
              style={[styles.leftIcon, { marginRight: theme.spacing.xs }]}
              // Hide icon from screen readers since it's decorative
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants"
            />
          )}
          
          <Text 
            style={[
              styles.text,
              {
                fontSize: getTextSize(),
                color: getTextColor(),
                fontWeight: '600',
                textAlign: 'center',
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={getIconSize()} 
              color={getTextColor()} 
              style={[styles.rightIcon, { marginLeft: theme.spacing.xs }]}
              // Hide icon from screen readers since it's decorative
              accessibilityElementsHidden={true}
              importantForAccessibility="no-hide-descendants" 
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  leftIcon: {
    // marginRight now set dynamically
  },
  rightIcon: {
    // marginLeft now set dynamically
  },
});

export default Button;
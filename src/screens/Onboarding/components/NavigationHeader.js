// src/screens/Onboarding/components/NavigationHeader.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveText from './ResponsiveText';

const NavigationHeader = ({ 
  title, 
  onBack, 
  iconName, 
  iconColor = '#3b82f6',
  rightComponent,
  titleOffset = 0
}) => {
  // No offset needed - title should be centered regardless of icon presence
  
  return (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="#0c1425" />
      
      {/* Left side - Back button or spacer */}
      <View style={styles.leftContainer}>
        {onBack && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Text centered on screen with icon flowing to its left */}
      <View style={styles.absoluteCenter}>
        <View style={[
          styles.titleWithIcon,
          // Only apply the left shift when there's an icon
          iconName ? { transform: [{ translateX: -24 + titleOffset }] } : { transform: [{ translateX: titleOffset }] }
        ]}>
          {iconName && (
            <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
              <Ionicons name={iconName} size={20} color="#FFFFFF" />
            </View>
          )}
          <Text 
            style={styles.title} 
            numberOfLines={2} 
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        </View>
      </View>
      
      {/* Right side - component or spacer */}
      <View style={styles.rightContainer}>
        {rightComponent && rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 35 : 15,
    paddingBottom: 15,
    backgroundColor: '#0c1425',
    zIndex: 20,
    position: 'relative',
  },
  leftContainer: {
    width: 40,
    alignItems: 'flex-start',
    zIndex: 20, // Higher z-index to be above center container
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25, // Highest z-index for clickability
  },
  absoluteCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: Platform.OS === 'ios' ? 35 : 15,
    bottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    // Transform is now applied conditionally in the JSX based on icon presence
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  }
});

export default NavigationHeader;
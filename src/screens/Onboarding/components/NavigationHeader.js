// src/screens/Onboarding/components/NavigationHeader.js
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveText from './ResponsiveText';

const NavigationHeader = ({ 
  title, 
  onBack, 
  iconName, 
  iconColor = '#3b82f6',
  rightComponent
}) => {
  // Calculate the offset needed to center the text with the icon
  const iconOffset = iconName ? -18 : 0; // Half the width of the icon container
  
  return (
    <View style={styles.header}>
      <StatusBar barStyle="light-content" backgroundColor="#0c1425" />
      
      {/* Back button */}
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
      
      {/* Absolutely positioned title container for true centering */}
      <View style={styles.absoluteTitleContainer}>
        <View style={[
          styles.titleInnerContainer,
          { marginLeft: iconOffset } // Offset to center based on the text
        ]}>
          {iconName && (
            <View style={[styles.iconContainer, { backgroundColor: iconColor }]}>
              <Ionicons name={iconName} size={20} color="#FFFFFF" />
            </View>
          )}
          <ResponsiveText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {title}
          </ResponsiveText>
        </View>
      </View>
      
      {/* Right component or placeholder */}
      <View style={styles.rightContainer}>
        {rightComponent && rightComponent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 35 : 15, // Reduced to move header higher
    paddingBottom: 10,
    backgroundColor: '#0c1425',
    zIndex: 20,
    position: 'relative',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 25,
  },
  absoluteTitleContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 35 : 15,
    left: 0,
    right: 0,
    bottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15,
  },
  titleInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  rightContainer: {
    width: 40,
    alignItems: 'flex-end',
  }
});

export default NavigationHeader;
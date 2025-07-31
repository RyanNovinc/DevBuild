// src/components/illustrations/EmptyTasksIllustration.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

const EmptyTasksIllustration = ({ theme, viewMode = 'projects' }) => {
  const primaryColor = theme?.primary || '#4CAF50';
  const accentColor = theme?.accent || '#2196F3';
  
  return (
    <View style={styles.container}>
      {/* Background decorative elements */}
      <Svg width="200" height="160" viewBox="0 0 200 160" style={[StyleSheet.absoluteFill, { zIndex: 1 }]}>
        <Defs>
          <LinearGradient id="gradSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`${accentColor}CC`} />
            <Stop offset="100%" stopColor={`${accentColor}88`} />
          </LinearGradient>
        </Defs>
        
        {/* Background decorative circle */}
        <Circle cx="40" cy="130" r="25" fill={`${primaryColor}15`} />
      </Svg>
      
      {/* Main Icon - Use actual Ionicons */}
      <View style={styles.iconContainer}>
        <Ionicons 
          name={viewMode === 'projects' ? 'folder-open' : 'list-outline'} 
          size={80} 
          color={primaryColor}
        />
      </View>
      
      {/* Plus sign - positioned on top */}
      <Svg width="40" height="40" viewBox="0 0 40 40" style={styles.plusIcon}>
        <Defs>
          <LinearGradient id="gradSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`${accentColor}CC`} />
            <Stop offset="100%" stopColor={`${accentColor}88`} />
          </LinearGradient>
        </Defs>
        <Circle cx="20" cy="20" r="20" fill="url(#gradSecondary)" />
        <Rect x="12" y="18" width="16" height="4" rx="2" fill="white" />
        <Rect x="18" y="12" width="4" height="16" rx="2" fill="white" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    height: 120,
    width: 200,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    zIndex: 10,
  },
  plusIcon: {
    position: 'absolute',
    bottom: 15,
    right: 30,
    zIndex: 20,
  }
});

export default EmptyTasksIllustration;
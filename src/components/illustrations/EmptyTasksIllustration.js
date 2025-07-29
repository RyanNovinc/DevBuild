// src/components/illustrations/EmptyTasksIllustration.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const EmptyTasksIllustration = ({ theme }) => {
  const primaryColor = theme?.primary || '#4CAF50';
  const secondaryColor = theme?.card || '#F5F5F5';
  const accentColor = theme?.accent || '#2196F3';
  
  return (
    <View style={styles.container}>
      <Svg width="200" height="160" viewBox="0 0 200 160">
        <Defs>
          <LinearGradient id="gradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`${primaryColor}CC`} />
            <Stop offset="100%" stopColor={`${primaryColor}88`} />
          </LinearGradient>
          <LinearGradient id="gradSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`${accentColor}CC`} />
            <Stop offset="100%" stopColor={`${accentColor}88`} />
          </LinearGradient>
        </Defs>
        
        {/* Background elements */}
        <Circle cx="40" cy="130" r="25" fill={`${primaryColor}15`} />
        <Circle cx="160" cy="30" r="20" fill={`${accentColor}15`} />
        
        {/* Folder */}
        <G transform="translate(45, 40)">
          <Path
            d="M10,0 H50 L60,10 H100 C105.523,10 110,14.477 110,20 V90 C110,95.523 105.523,100 100,100 H10 C4.477,100 0,95.523 0,90 V10 C0,4.477 4.477,0 10,0 Z"
            fill="url(#gradPrimary)"
          />
          
          {/* Document inside folder */}
          <Rect x="30" y="40" width="50" height="8" rx="2" fill={secondaryColor} />
          <Rect x="30" y="55" width="50" height="8" rx="2" fill={secondaryColor} />
          <Rect x="30" y="70" width="30" height="8" rx="2" fill={secondaryColor} />
        </G>
        
        {/* Plus sign */}
        <Circle cx="140" cy="110" r="20" fill="url(#gradSecondary)" />
        <Rect x="132" y="108" width="16" height="4" rx="2" fill="white" />
        <Rect x="138" y="102" width="4" height="16" rx="2" fill="white" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  }
});

export default EmptyTasksIllustration;
// src/components/illustrations/EmptyTimeIllustration.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, G, Defs, LinearGradient, Stop, Line } from 'react-native-svg';

const EmptyTimeIllustration = ({ theme }) => {
  const primaryColor = theme?.primary || '#4CAF50';
  const secondaryColor = theme?.card || '#F5F5F5';
  const accentColor = theme?.accent || '#2196F3';
  
  return (
    <View style={styles.container}>
      <Svg width="200" height="160" viewBox="0 0 200 160">
        <Defs>
          <LinearGradient id="gradPrimaryTime" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`${primaryColor}CC`} />
            <Stop offset="100%" stopColor={`${primaryColor}88`} />
          </LinearGradient>
          <LinearGradient id="gradSecondaryTime" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`${accentColor}CC`} />
            <Stop offset="100%" stopColor={`${accentColor}88`} />
          </LinearGradient>
        </Defs>
        
        {/* Background elements */}
        <Circle cx="40" cy="130" r="15" fill={`${primaryColor}15`} />
        <Circle cx="170" cy="40" r="20" fill={`${accentColor}15`} />
        
        {/* Calendar background */}
        <Rect x="40" y="30" width="120" height="100" rx="10" fill={secondaryColor} />
        
        {/* Calendar header */}
        <Rect x="40" y="30" width="120" height="25" rx="10" fill="url(#gradPrimaryTime)" />
        
        {/* Calendar grid */}
        <Line x1="60" y1="55" x2="60" y2="130" stroke={`${primaryColor}20`} strokeWidth="1" />
        <Line x1="80" y1="55" x2="80" y2="130" stroke={`${primaryColor}20`} strokeWidth="1" />
        <Line x1="100" y1="55" x2="100" y2="130" stroke={`${primaryColor}20`} strokeWidth="1" />
        <Line x1="120" y1="55" x2="120" y2="130" stroke={`${primaryColor}20`} strokeWidth="1" />
        <Line x1="140" y1="55" x2="140" y2="130" stroke={`${primaryColor}20`} strokeWidth="1" />
        
        <Line x1="40" y1="75" x2="160" y2="75" stroke={`${primaryColor}20`} strokeWidth="1" />
        <Line x1="40" y1="95" x2="160" y2="95" stroke={`${primaryColor}20`} strokeWidth="1" />
        <Line x1="40" y1="115" x2="160" y2="115" stroke={`${primaryColor}20`} strokeWidth="1" />
        
        {/* Clock */}
        <G transform="translate(100, 80)">
          <Circle cx="0" cy="0" r="30" fill="url(#gradSecondaryTime)" />
          <Circle cx="0" cy="0" r="25" fill={`${secondaryColor}AA`} />
          
          {/* Clock hands */}
          <Line x1="0" y1="0" x2="0" y2="-15" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <Line x1="0" y1="0" x2="10" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" />
          
          {/* Clock center */}
          <Circle cx="0" cy="0" r="3" fill="white" />
        </G>
        
        {/* Time block */}
        <Rect x="60" y="80" width="20" height="30" rx="4" fill={`${primaryColor}40`} />
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

export default EmptyTimeIllustration;
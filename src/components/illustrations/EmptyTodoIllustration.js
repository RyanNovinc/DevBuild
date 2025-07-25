// src/components/illustrations/EmptyTodoIllustration.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Rect, G, Defs, LinearGradient, Stop } from 'react-native-svg';

const EmptyTodoIllustration = ({ theme }) => {
  const primaryColor = theme?.primary || '#4CAF50';
  const secondaryColor = theme?.card || '#F5F5F5';
  const accentColor = theme?.accent || '#2196F3';
  
  return (
    <View style={styles.container}>
      <Svg width="200" height="160" viewBox="0 0 200 160">
        <Defs>
          <LinearGradient id="gradPrimaryTodo" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`${primaryColor}CC`} />
            <Stop offset="100%" stopColor={`${primaryColor}88`} />
          </LinearGradient>
          <LinearGradient id="gradSecondaryTodo" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={`${secondaryColor}FF`} />
            <Stop offset="100%" stopColor={`${secondaryColor}CC`} />
          </LinearGradient>
        </Defs>
        
        {/* Background elements */}
        <Circle cx="50" cy="40" r="15" fill={`${primaryColor}15`} />
        <Circle cx="170" cy="110" r="25" fill={`${accentColor}15`} />
        
        {/* Notepad */}
        <G transform="translate(45, 25)">
          <Rect x="0" y="0" width="110" height="135" rx="8" fill="url(#gradSecondaryTodo)" />
          <Rect x="0" y="0" width="110" height="20" rx="8" fill="url(#gradPrimaryTodo)" />
          
          {/* Lines */}
          <Rect x="20" y="40" width="70" height="3" rx="1.5" fill={`${primaryColor}40`} />
          <Rect x="20" y="60" width="70" height="3" rx="1.5" fill={`${primaryColor}40`} />
          <Rect x="20" y="80" width="70" height="3" rx="1.5" fill={`${primaryColor}40`} />
          <Rect x="20" y="100" width="40" height="3" rx="1.5" fill={`${primaryColor}40`} />
          
          {/* Checkboxes */}
          <Rect x="15" y="36" width="10" height="10" rx="2" strokeWidth="2" stroke={`${primaryColor}AA`} fill="none" />
          <Rect x="15" y="56" width="10" height="10" rx="2" strokeWidth="2" stroke={`${primaryColor}AA`} fill="none" />
          <Rect x="15" y="76" width="10" height="10" rx="2" strokeWidth="2" stroke={`${primaryColor}AA`} fill="none" />
          <Rect x="15" y="96" width="10" height="10" rx="2" strokeWidth="2" stroke={`${primaryColor}AA`} fill="none" />
          
          {/* Pencil */}
          <G transform="translate(75, 115) rotate(-45)">
            <Rect x="0" y="0" width="25" height="6" rx="1" fill={accentColor} />
            <Path d="M0,0 L6,3 L0,6 Z" fill="#FFC107" />
            <Path d="M25,0 L30,3 L25,6 Z" fill="#E0E0E0" />
          </G>
        </G>
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

export default EmptyTodoIllustration;
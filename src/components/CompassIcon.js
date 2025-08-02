// src/components/CompassIcon.js
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText, G } from 'react-native-svg';

/**
 * A compass icon component that adapts to the current theme.
 * @param {Object} props Component props
 * @param {number} props.size Size of the compass icon
 * @param {string} props.color Primary color for the compass (will follow theme)
 * @param {boolean} props.isColoredTheme Whether the app is using a colored theme
 * @param {boolean} props.isDarkMode Whether the app is in dark mode
 * @param {boolean} props.animated Whether the compass needle should animate
 */
const CompassIcon = ({ 
  size = 80, 
  color, 
  isColoredTheme, 
  isDarkMode, 
  animated = true 
}) => {
  // State for animation
  const [rotation, setRotation] = useState(0);
  
  // Animation effect for gentle compass needle rotation
  useEffect(() => {
    if (!animated) return;
    
    const interval = setInterval(() => {
      // Create a gentle wobble effect like a compass finding north
      setRotation(prev => {
        const wobble = Math.sin(Date.now() / 500) * 5;
        return wobble;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [animated]);
  
  // Determine colors based on theme
  const primaryColor = color || (isDarkMode ? '#FFFFFF' : '#000000');
  const secondaryColor = isDarkMode ? '#333333' : '#DDDDDD';
  const accentColor = isColoredTheme ? primaryColor : (isDarkMode ? '#FFFFFF' : '#000000');
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg 
        width={size} 
        height={size} 
        viewBox="0 0 100 100" 
        fill="none"
      >
        {/* Outer circle */}
        <Circle cx="50" cy="50" r="45" fill="none" stroke={primaryColor} strokeWidth="2" />
        
        {/* Tick marks for directions */}
        {[...Array(24)].map((_, i) => {
          const angle = (i * 15) * Math.PI / 180;
          const isMajor = i % 6 === 0;
          const length = isMajor ? 10 : 5;
          const outerRadius = 45;
          const innerRadius = outerRadius - length;
          
          return (
            <Line 
              key={i}
              x1={50 + Math.sin(angle) * innerRadius}
              y1={50 - Math.cos(angle) * innerRadius}
              x2={50 + Math.sin(angle) * outerRadius}
              y2={50 - Math.cos(angle) * outerRadius}
              stroke={isMajor ? primaryColor : secondaryColor}
              strokeWidth={isMajor ? 2 : 1}
            />
          );
        })}
        
        {/* Cardinal directions */}
        <SvgText x="50" y="15" fill={primaryColor} textAnchor="middle" fontSize="12" fontWeight="bold">N</SvgText>
        <SvgText x="85" y="53" fill={primaryColor} textAnchor="middle" fontSize="12" fontWeight="bold">E</SvgText>
        <SvgText x="50" y="90" fill={primaryColor} textAnchor="middle" fontSize="12" fontWeight="bold">S</SvgText>
        <SvgText x="15" y="53" fill={primaryColor} textAnchor="middle" fontSize="12" fontWeight="bold">W</SvgText>
        
        {/* Inner circle */}
        <Circle cx="50" cy="50" r="35" fill="none" stroke={secondaryColor} strokeWidth="1" />
        
        {/* Needle group - rotates based on state */}
        <G rotation={rotation} origin="50, 50">
          {/* North pointer */}
          <Path 
            d="M50,50 L45,20 L50,15 L55,20 Z" 
            fill={accentColor} 
            stroke={primaryColor} 
            strokeWidth="1"
          />
          
          {/* South pointer */}
          <Path 
            d="M50,50 L45,80 L50,85 L55,80 Z" 
            fill={secondaryColor} 
            stroke={primaryColor} 
            strokeWidth="1"
          />
          
          {/* Center circle */}
          <Circle cx="50" cy="50" r="5" fill={accentColor} stroke={primaryColor} strokeWidth="1" />
        </G>
      </Svg>
    </View>
  );
};

export default CompassIcon;
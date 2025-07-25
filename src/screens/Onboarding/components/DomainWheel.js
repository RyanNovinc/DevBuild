// src/screens/Onboarding/components/DomainWheel.js
import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import ResponsiveText from './ResponsiveText';
import { useI18n } from '../context/I18nContext';
import { getTranslatedDomainName } from '../data/domainTranslations';

const { width } = Dimensions.get('window');

const DomainWheel = ({ domains, onDomainSelected, selectedDomain, onCenterButtonPress }) => {
  // Get translation function and current language
  const { t, currentLanguage } = useI18n();
  
  // Calculate wheel dimensions
  const WHEEL_SIZE = Math.min(width * 0.85, 340);
  const SVG_CONTAINER_SIZE = WHEEL_SIZE * 1.2;
  const CENTER_RADIUS = WHEEL_SIZE * 0.12;
  const DOMAIN_LABEL_RADIUS = WHEEL_SIZE * 0.5 + 25;
  
  // Icon configuration 
  const ICON_SIZE = 24;
  
  // Create a path for a slice
  const createSlicePath = (startAngle, endAngle) => {
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const outerRadius = WHEEL_SIZE / 2 - 1;
    const innerRadius = CENTER_RADIUS;
    
    const startOuterX = outerRadius * Math.cos(startAngleRad);
    const startOuterY = outerRadius * Math.sin(startAngleRad);
    const endOuterX = outerRadius * Math.cos(endAngleRad);
    const endOuterY = outerRadius * Math.sin(endAngleRad);
    
    const startInnerX = innerRadius * Math.cos(startAngleRad);
    const startInnerY = innerRadius * Math.sin(startAngleRad);
    const endInnerX = innerRadius * Math.cos(endAngleRad);
    const endInnerY = innerRadius * Math.sin(endAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
      M ${startOuterX} ${startOuterY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
      L ${endInnerX} ${endInnerY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}
      Z
    `;
  };
  
  // Calculate centroid position
  const calculateCentroid = (angle, radius) => {
    const angleRad = (angle - 90) * Math.PI / 180;
    const x = radius * Math.cos(angleRad);
    const y = radius * Math.sin(angleRad);
    return [x, y];
  };
  
  // Use useMemo to calculate wheel slices only when domains change
  const wheelSlices = useMemo(() => {
    if (!domains || domains.length === 0) return [];
    
    // Create equal slices for all domains
    const sliceAngle = 360 / domains.length;
    let startAngle = 0;
    
    return domains.map((domain, index) => {
      const endAngle = startAngle + sliceAngle;
      const path = createSlicePath(startAngle, endAngle);
      const midAngle = startAngle + sliceAngle / 2;
      const centroid = calculateCentroid(midAngle, DOMAIN_LABEL_RADIUS);
      
      // Calculate icon position (closer to outer edge)
      const iconRadius = WHEEL_SIZE * 0.35; // 35% from center to edge
      const iconX = iconRadius * Math.cos((midAngle - 90) * Math.PI / 180);
      const iconY = iconRadius * Math.sin((midAngle - 90) * Math.PI / 180);
      
      const result = {
        domain,
        path,
        centroid,
        angle: sliceAngle,
        startAngle,
        endAngle,
        midAngle,
        iconX,
        iconY
      };
      
      startAngle = endAngle;
      return result;
    });
  }, [domains, WHEEL_SIZE, CENTER_RADIUS, DOMAIN_LABEL_RADIUS]);
  
  // Handle center button press
  const handleCenterPress = () => {
    if (onCenterButtonPress) {
      onCenterButtonPress();
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.wheelContainer}>
        {/* Main SVG Wheel */}
        <Svg
          width={SVG_CONTAINER_SIZE}
          height={SVG_CONTAINER_SIZE}
          viewBox={`${-SVG_CONTAINER_SIZE/2} ${-SVG_CONTAINER_SIZE/2} ${SVG_CONTAINER_SIZE} ${SVG_CONTAINER_SIZE}`}
        >
          {/* Domain slices */}
          {wheelSlices.map((slice, index) => {
            // Determine if this is on the bottom half of the wheel
            const isBottomHalf = slice.midAngle > 90 && slice.midAngle < 270;
            
            // Calculate label position
            const labelRadius = WHEEL_SIZE / 2 + (isBottomHalf ? 30 : 25);
            const labelX = labelRadius * Math.cos((slice.midAngle - 90) * Math.PI / 180);
            const labelY = labelRadius * Math.sin((slice.midAngle - 90) * Math.PI / 180);
            
            // Determine if this domain is selected
            const isSelected = selectedDomain?.name === slice.domain.name;
            
            // Calculate circle size for icon background
            const circleRadius = isSelected ? 26 : 24;
            
            // Get translated domain name
            const translatedDomainName = getTranslatedDomainName(slice.domain.name, currentLanguage);
            
            // Get first word for the label - handle Japanese labels differently
            const labelText = currentLanguage === 'ja' 
              ? translatedDomainName.slice(0, 2) // Take first two characters for Japanese 
              : translatedDomainName.split(' ')[0]; // First word for English
            
            return (
              <G key={`slice-${index}`}>
                {/* Main slice with solid color fill */}
                <Path
                  d={slice.path}
                  fill={slice.domain.color}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={0.5}
                  opacity={isSelected ? 1 : 0.7}
                  onPress={() => onDomainSelected(slice.domain)}
                />
                
                {/* Domain label outside wheel */}
                <G>
                  {/* Add a small line from segment to label */}
                  <Path
                    d={`M ${(WHEEL_SIZE/2 - 5) * Math.cos((slice.midAngle - 90) * Math.PI / 180)} ${(WHEEL_SIZE/2 - 5) * Math.sin((slice.midAngle - 90) * Math.PI / 180)} 
                        L ${(WHEEL_SIZE/2 + 10) * Math.cos((slice.midAngle - 90) * Math.PI / 180)} ${(WHEEL_SIZE/2 + 10) * Math.sin((slice.midAngle - 90) * Math.PI / 180)}`}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth={1}
                  />
                  
                  {/* Position text radially outward - but adjust rotation for bottom labels */}
                  <SvgText
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fill={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.8)'}
                    rotation={isBottomHalf ? slice.midAngle + 180 : slice.midAngle}
                    origin={`${labelX},${labelY}`}
                  >
                    {labelText}
                  </SvgText>
                </G>
                
                {/* Circle background for icon */}
                <Circle
                  cx={slice.iconX}
                  cy={slice.iconY}
                  r={circleRadius}
                  fill={isSelected ? slice.domain.color : 'rgba(255,255,255,0.15)'}
                  stroke={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.3)'}
                  strokeWidth={isSelected ? 2 : 1}
                  onPress={() => onDomainSelected(slice.domain)}
                />
              </G>
            );
          })}
          
          {/* Center circle - Now a touchable button */}
          <Circle
            cx="0"
            cy="0"
            r={CENTER_RADIUS}
            fill="#1e3a8a"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={1}
            onPress={handleCenterPress}
            // Add pressed state visual feedback
            opacity={0.9}
            // Add shadow or glow effect
            filter="url(#glow)"
          />
          
          {/* Center content */}
          <SvgText
            x="0"
            y="-4"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#FFFFFF"
            onPress={handleCenterPress}
          >
            8
          </SvgText>
          <SvgText
            x="0"
            y="14"
            textAnchor="middle"
            fontSize="10"
            fill="rgba(255,255,255,0.8)"
            onPress={handleCenterPress}
          >
            {currentLanguage === 'ja' ? 'ドメイン' : 'Domains'}
          </SvgText>
        </Svg>
        
        {/* Position icons using manual calculation */}
        <View style={styles.iconsOverlay} pointerEvents="none">
          {wheelSlices.map((slice, index) => {
            const isSelected = selectedDomain?.name === slice.domain.name;
            
            // Calculate the absolute position based on the SVG viewBox and center
            const centerX = SVG_CONTAINER_SIZE / 2;
            const centerY = SVG_CONTAINER_SIZE / 2;
            
            // Adjust icon position to be centered exactly in the middle of the slice
            const iconX = centerX + slice.iconX - ICON_SIZE / 2;
            const iconY = centerY + slice.iconY - ICON_SIZE / 2;
            
            return (
              <TouchableOpacity
                key={`icon-${index}`}
                style={[
                  styles.iconButton,
                  {
                    left: iconX,
                    top: iconY,
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    zIndex: 10
                  }
                ]}
                onPress={() => onDomainSelected(slice.domain)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={slice.domain.icon} 
                  size={ICON_SIZE} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            );
          })}
        </View>
        
        {/* Add overlay circles that respond to touch */}
        <View style={styles.touchOverlay}>
          {wheelSlices.map((slice, index) => {
            // Calculate the absolute position based on the SVG viewBox and center
            const centerX = SVG_CONTAINER_SIZE / 2;
            const centerY = SVG_CONTAINER_SIZE / 2;
            
            // Position and size for the touch area
            const touchRadius = 32; // Bigger than the visible circle for easier touch
            const touchX = centerX + slice.iconX - touchRadius / 2;
            const touchY = centerY + slice.iconY - touchRadius / 2;
            
            return (
              <TouchableOpacity
                key={`touch-${index}`}
                style={[
                  styles.touchCircle,
                  {
                    left: touchX,
                    top: touchY,
                    width: touchRadius,
                    height: touchRadius,
                  }
                ]}
                onPress={() => onDomainSelected(slice.domain)}
              />
            );
          })}
          
          {/* Center button touch area - larger for easier tapping */}
          <TouchableOpacity
            style={[
              styles.centerButton,
              {
                left: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS - 10,
                top: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS - 10,
                width: CENTER_RADIUS * 2 + 20,
                height: CENTER_RADIUS * 2 + 20,
              }
            ]}
            onPress={handleCenterPress}
            activeOpacity={0.7}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  iconsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  touchCircle: {
    position: 'absolute',
    borderRadius: 32, // Make it circular
    backgroundColor: 'transparent', // Invisible but touchable
  },
  centerButton: {
    position: 'absolute',
    borderRadius: 50, // Make it circular
    backgroundColor: 'transparent', // Invisible but touchable
    zIndex: 20,
  }
});

export default DomainWheel;
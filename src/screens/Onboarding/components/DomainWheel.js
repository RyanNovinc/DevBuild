// src/screens/Onboarding/components/DomainWheel.js
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import ResponsiveText from './ResponsiveText';
import { useI18n } from '../context/I18nContext';
import { getTranslatedDomainName } from '../data/domainTranslations';

const { width } = Dimensions.get('window');

// Simple pulsing icon component
const PulsingIcon = ({ iconName, iconX, iconY, shouldPulse }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const ICON_SIZE = 24;

  useEffect(() => {
    if (shouldPulse) {
      // Reset and start pulse animation
      scale.setValue(1);
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.3,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [shouldPulse]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: iconX,
        top: iconY,
        width: ICON_SIZE,
        height: ICON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        zIndex: 5,
        transform: [{ scale }]
      }}
    >
      <Ionicons 
        name={iconName} 
        size={ICON_SIZE} 
        color="#FFFFFF" 
      />
    </Animated.View>
  );
};

const DomainWheel = ({ domains, onDomainSelected, selectedDomain, onCenterButtonPress }) => {
  // Get translation function and current language
  const { t, currentLanguage } = useI18n();
  
  // Animations for center circle breathing and ripple effect
  const centerScale = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  
  // Simple state for triggering pulse animation
  const [shouldPulse, setShouldPulse] = useState(false);
  
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
  
  // Subtle bounce animation that triggers ripple on completion
  useEffect(() => {
    let bounceTimeout;
    
    // Ripple effect that triggers after bounce - stronger visibility
    const createRipple = () => {
      rippleScale.setValue(1);
      rippleOpacity.setValue(0.7);
      
      Animated.parallel([
        Animated.timing(rippleScale, {
          toValue: 2.2,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(rippleOpacity, {
          toValue: 0,
          duration: 1500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        })
      ]).start();
      
      // Trigger domain pulse when ripple reaches the domains (after ~800ms)
      setTimeout(() => {
        pulseAllDomains();
      }, 800);
    };

    // Bounce animation that triggers ripple during bounce-back
    const createBounce = () => {
      Animated.sequence([
        // Quick drop (like settling onto a soft surface)
        Animated.timing(centerScale, {
          toValue: 0.97,
          duration: 100,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        // Gentle bounce back with spring
        Animated.spring(centerScale, {
          toValue: 1.0,
          friction: 6,
          tension: 100,
          useNativeDriver: true
        })
      ]).start(() => {
        // Next bounce in 1.5-2.5 seconds (more frequent)
        const nextDelay = 1500 + Math.random() * 1000;
        bounceTimeout = setTimeout(createBounce, nextDelay);
      });
      
      // Trigger ripple slightly earlier - during the bounce-back
      setTimeout(() => {
        createRipple();
      }, 120); // Start ripple 120ms after bounce begins (20ms after drop completes)
    };


    // Start first bounce after 2 seconds
    bounceTimeout = setTimeout(createBounce, 2000);

    // Cleanup
    return () => {
      if (bounceTimeout) {
        clearTimeout(bounceTimeout);
      }
    };
  }, []);

  // All domains pulse once when hit by ripple
  const pulseAllDomains = () => {
    setShouldPulse(true);
    setTimeout(() => setShouldPulse(false), 600); // Reset after animation
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
            let labelText;
            if (currentLanguage === 'ja') {
              labelText = translatedDomainName.slice(0, 2); // Take first two characters for Japanese
            } else {
              // For English, use "Growth" for Personal Growth, otherwise first word
              labelText = slice.domain.name === 'Personal Growth' ? 'Growth' : translatedDomainName.split(' ')[0];
            }
            
            return (
              <G key={`slice-${index}`}>
                {/* Main slice with solid color fill - now touchable */}
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
                
                {/* Circle background for icon - also clickable */}
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
          
          {/* Center circle placeholder - hidden, replaced by animated overlay */}
          <Circle
            cx="0"
            cy="0"
            r={CENTER_RADIUS}
            fill="transparent"
            stroke="none"
            strokeWidth={0}
            opacity={0}
          />
        </Svg>
        
        {/* Animated center circle overlay with float */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS,
              top: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS,
              width: CENTER_RADIUS * 2,
              height: CENTER_RADIUS * 2,
              borderRadius: CENTER_RADIUS,
              backgroundColor: '#1e3a8a',
              borderWidth: 2,
              borderColor: '#3b82f6',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 21,
              transform: [{ scale: centerScale }],
              shadowColor: '#3b82f6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 4,
            }
          ]}
          pointerEvents="none"
        >
          <ResponsiveText style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginTop: -2
          }}>
            8
          </ResponsiveText>
          <ResponsiveText style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.8)',
            marginTop: -2
          }}>
            {currentLanguage === 'ja' ? 'ドメイン' : 'Domains'}
          </ResponsiveText>
          <ResponsiveText style={{
            fontSize: 8,
            color: 'rgba(255,255,255,0.6)',
            marginTop: 2
          }}>
            {currentLanguage === 'ja' ? 'タップ' : 'TAP'}
          </ResponsiveText>
        </Animated.View>
        
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
              <PulsingIcon
                key={`icon-${index}`}
                iconName={slice.domain.icon}
                iconX={iconX}
                iconY={iconY}
                shouldPulse={shouldPulse}
              />
            );
          })}
        </View>
        
        {/* Simplified approach - just center button touch area */}
        <View style={styles.touchableOverlays}>
          
          {/* Ripple effect for center button - starts from edge */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS,
                top: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS,
                width: CENTER_RADIUS * 2,
                height: CENTER_RADIUS * 2,
                borderRadius: CENTER_RADIUS,
                borderWidth: 2,
                borderColor: 'rgba(59, 130, 246, 0.9)',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                zIndex: 19,
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity
              }
            ]}
            pointerEvents="none"
          />
          
          {/* Center button touch area */}
          <TouchableOpacity
            style={[
              styles.centerButton,
              {
                left: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS - 15,
                top: SVG_CONTAINER_SIZE / 2 - CENTER_RADIUS - 15,
                width: CENTER_RADIUS * 2 + 30,
                height: CENTER_RADIUS * 2 + 30,
                borderRadius: CENTER_RADIUS + 15,
                backgroundColor: 'transparent',
                zIndex: 20,
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
  iconView: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  touchableOverlays: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    // Uncomment to see all touchable areas
    // backgroundColor: 'rgba(255,255,255,0.1)',
  },
  segmentTouch: {
    backgroundColor: 'transparent',
    zIndex: 15,
  },
  centerButton: {
    position: 'absolute',
    backgroundColor: 'transparent',
    zIndex: 20,
  }
});

export default DomainWheel;
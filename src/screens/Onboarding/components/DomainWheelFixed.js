// src/screens/Onboarding/components/DomainWheelFixed.js
// Completely rebuilt wheel with FIXED centre button position
import React, { useMemo, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, G, Circle, Text as SvgText } from 'react-native-svg';
import ResponsiveText from './ResponsiveText';
import { useI18n } from '../context/I18nContext';
import { getTranslatedDomainName } from '../data/domainTranslations';

const { width, height } = Dimensions.get('window');

// FIXED DIMENSIONS - These never change
const WHEEL_SIZE = Math.min(width * 0.85, 340);
const CENTER_RADIUS = WHEEL_SIZE * 0.12;
const CONTAINER_HEIGHT = height * 0.7; // Fixed container height
const CENTER_Y = CONTAINER_HEIGHT * 0.4; // Fixed centre Y position

const DomainWheelFixed = ({ 
  domains, 
  onDomainSelected, 
  selectedDomain, 
  onCenterButtonPress, 
  guidedMode = false,
  segmentsRevealed = false,
  revealedSegments = [],
  textRevealed = false,
  onWelcomeStateChange
}) => {
  // Get translation function and current language
  const { t, currentLanguage } = useI18n();
  
  // Welcome state - true initially, false after first tap
  const [isWelcomeState, setIsWelcomeState] = useState(true);
  
  // Notify parent of welcome state changes
  useEffect(() => {
    if (onWelcomeStateChange) {
      onWelcomeStateChange(isWelcomeState);
    }
  }, [isWelcomeState, onWelcomeStateChange]);
  
  // Animations for centre circle breathing and ripple effect
  const centerScale = useRef(new Animated.Value(1)).current;
  const rippleScale = useRef(new Animated.Value(1)).current;
  const rippleOpacity = useRef(new Animated.Value(0)).current;
  
  // Animation for text transition
  const centerTextOpacity = useRef(new Animated.Value(1)).current;
  const centerTextScale = useRef(new Animated.Value(1)).current;
  
  // Simple state for triggering pulse animation
  const [shouldPulse, setShouldPulse] = useState(false);
  
  // Animation values for segment reveal - create refs for each domain
  const segmentAnimations = useRef(
    domains.map(() => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0.3)
    }))
  ).current;
  
  // Animation value for text layer fade-in
  const textLayerOpacity = useRef(new Animated.Value(0)).current;
  
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
      
      // Calculate icon position (closer to outer edge)
      const iconRadius = WHEEL_SIZE * 0.35; // 35% from centre to edge
      const iconX = iconRadius * Math.cos((midAngle - 90) * Math.PI / 180);
      const iconY = iconRadius * Math.sin((midAngle - 90) * Math.PI / 180);
      
      const result = {
        domain,
        path,
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
  }, [domains]);
  
  // Handle centre button press
  const handleCenterPress = () => {
    if (isWelcomeState) {
      // First tap - transition from welcome to domains view
      setIsWelcomeState(false);
      
      // Animate text transition
      Animated.sequence([
        // Fade out welcome text
        Animated.parallel([
          Animated.timing(centerTextOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(centerTextScale, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: true,
          })
        ]),
        // Fade in domain text
        Animated.parallel([
          Animated.timing(centerTextOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(centerTextScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ])
      ]).start();
    }
    
    if (onCenterButtonPress) {
      onCenterButtonPress();
    }
  };
  
  // Animate segment reveals
  useEffect(() => {
    revealedSegments.forEach(segmentIndex => {
      if (segmentIndex < segmentAnimations.length) {
        // Animate segment pop-in
        Animated.parallel([
          Animated.spring(segmentAnimations[segmentIndex].opacity, {
            toValue: 1,
            friction: 8,
            tension: 100,
            useNativeDriver: true,
          }),
          Animated.spring(segmentAnimations[segmentIndex].scale, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          })
        ]).start();
      }
    });
  }, [revealedSegments]);
  
  // Animate text layer fade-in
  useEffect(() => {
    if (textRevealed) {
      Animated.timing(textLayerOpacity, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      textLayerOpacity.setValue(0);
    }
  }, [textRevealed]);
  
  // Breathing animation for centre button
  useEffect(() => {
    if (isWelcomeState) {
      const breathingAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(centerScale, {
            toValue: 1.05,
            duration: 2000,
            easing: Easing.ease,
            useNativeDriver: true
          }),
          Animated.timing(centerScale, {
            toValue: 1,
            duration: 2000,
            easing: Easing.ease,
            useNativeDriver: true
          })
        ])
      );
      breathingAnimation.start();
      
      return () => breathingAnimation.stop();
    }
  }, [isWelcomeState]);
  
  return (
    <View style={[styles.container, { height: CONTAINER_HEIGHT }]}>
      {/* FIXED CENTER BUTTON - Never moves */}
      <TouchableOpacity
        style={[styles.centerButton, {
          top: CENTER_Y - CENTER_RADIUS,
          left: width / 2 - CENTER_RADIUS,
        }]}
        onPress={handleCenterPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.centerCircle,
            {
              width: CENTER_RADIUS * 2,
              height: CENTER_RADIUS * 2,
              borderRadius: CENTER_RADIUS,
              transform: [{ scale: centerScale }],
            }
          ]}
        >
          <Animated.View 
            style={[
              {
                justifyContent: 'center',
                alignItems: 'center',
                opacity: centerTextOpacity,
                transform: [{ scale: centerTextScale }]
              }
            ]}
          >
            <Ionicons name="compass" size={32} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* WHEEL SEGMENTS - Positioned around the fixed centre */}
      {!isWelcomeState && (
        <View style={[styles.wheelContainer, {
          top: CENTER_Y - WHEEL_SIZE / 2,
          left: width / 2 - WHEEL_SIZE / 2,
        }]}>
          <Svg
            width={WHEEL_SIZE}
            height={WHEEL_SIZE}
            viewBox={`${-WHEEL_SIZE/2} ${-WHEEL_SIZE/2} ${WHEEL_SIZE} ${WHEEL_SIZE}`}
          >
            {wheelSlices.map((slice, index) => {
              // Check if this segment should be visible
              const isSegmentRevealed = segmentsRevealed || revealedSegments.includes(index);
              if (!isSegmentRevealed) return null;
              
              const isSelected = selectedDomain?.name === slice.domain.name;
              const circleRadius = isSelected ? 26 : 24;
              
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
          </Svg>
          
          {/* Icons positioned over SVG */}
          {wheelSlices.map((slice, index) => {
            const isSegmentRevealed = segmentsRevealed || revealedSegments.includes(index);
            if (!isSegmentRevealed) return null;
            
            const iconX = WHEEL_SIZE / 2 + slice.iconX - 12;
            const iconY = WHEEL_SIZE / 2 + slice.iconY - 12;
            
            return (
              <View 
                key={`icon-${index}`}
                style={[styles.iconContainer, {
                  left: iconX,
                  top: iconY,
                }]}
                pointerEvents="none"
              >
                <Ionicons 
                  name={slice.domain.icon} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </View>
            );
          })}
        </View>
      )}
      
      {/* BOTTOM TEXT - Fixed position */}
      <View style={[styles.bottomTextContainer, {
        top: CENTER_Y + CENTER_RADIUS + 60,
      }]}>
        <Animated.View 
          style={[
            {
              opacity: centerTextOpacity,
              transform: [{ scale: centerTextScale }]
            }
          ]}
        >
          <ResponsiveText style={styles.bottomText}>
            {isWelcomeState ? 'Welcome to LifeCompass' : 'Choose a life domain to focus on'}
          </ResponsiveText>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  centerButton: {
    position: 'absolute',
    zIndex: 100,
  },
  centerCircle: {
    backgroundColor: '#1e3a8a',
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  wheelContainer: {
    position: 'absolute',
    zIndex: 50,
  },
  iconContainer: {
    position: 'absolute',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  bottomText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default DomainWheelFixed;
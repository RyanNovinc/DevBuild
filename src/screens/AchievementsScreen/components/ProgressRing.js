// src/screens/AchievementsScreen/components/ProgressRing.js
import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

const ProgressRing = ({ 
  progress = 0, 
  level = 1,
  currentLevelPoints = 0,
  nextLevelThreshold = 100,
  size = 200, 
  strokeWidth = 20, 
  theme, 
  duration = 1000,
  delay = 300,
  animate = true,
  onAnimationComplete = () => {}
}) => {
  // Animation value for progress
  const progressAnim = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  
  // State to track if animation has completed
  const [animationCompleted, setAnimationCompleted] = useState(false);
  
  // Calculate dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;
  
  // Calculate points needed for next level
  const pointsNeeded = nextLevelThreshold - currentLevelPoints;
  const progressValue = pointsNeeded > 0 ? 
    ((nextLevelThreshold - currentLevelPoints) / (nextLevelThreshold - (level > 1 ? getLevelThreshold(level - 1) : 0))) * 100 : 
    100;
  
  // Invert progress (we want to show progress towards next level, not remaining)
  const displayProgress = 100 - progressValue;
  
  // Animate progress on mount and when progress changes
  useEffect(() => {
    if (animate) {
      // Reset animation completion state
      setAnimationCompleted(false);
      
      Animated.sequence([
        // Start with text fade out if it was visible
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        // Then animate progress
        Animated.timing(progressAnim, {
          toValue: displayProgress,
          duration,
          delay,
          useNativeDriver: true,
        }),
        // Then fade text back in
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        })
      ]).start(({ finished }) => {
        if (finished) {
          setAnimationCompleted(true);
          onAnimationComplete();
        }
      });
    } else {
      // If not animating, just set the value directly
      progressAnim.setValue(displayProgress);
      textOpacity.setValue(1);
    }
  }, [displayProgress, duration, delay, animate]);
  
  // Calculate stroke dash offset based on progress
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });
  
  // Define gradient colors based on level
  const getProgressColor = () => {
    // Color progression by level
    if (level <= 2) return '#CD7F32'; // Bronze
    if (level <= 4) return '#C0C0C0'; // Silver
    if (level <= 7) return '#FFD700'; // Gold
    if (level <= 9) return '#9370DB'; // Purple
    if (level === 10) return '#FF4500'; // Red
    if (level === 11) return '#9932CC'; // Deep purple
    return '#00BFFF'; // Blue for max level
  };
  
  // Helper function to get level threshold
  function getLevelThreshold(level) {
    const thresholds = [
      0,      // Level 1 starts at 0
      50,     // Level 2 starts at 50
      100,    // Level 3
      175,    // Level 4
      250,    // Level 5
      350,    // Level 6
      450,    // Level 7
      550,    // Level 8
      650,    // Level 9
      730,    // Level 10
      830,    // Level 11
      1030    // Level 12
    ];
    
    return thresholds[level - 1] || 0;
  }
  
  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={`${getProgressColor()}20`}
            fill="transparent"
          />
          
          {/* Progress Circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={getProgressColor()}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
        
        {/* Points Text in Center */}
        <AnimatedSvgText
          x={center}
          y={center - 10}
          fontSize={size / 10}
          fontWeight="bold"
          fill={theme.text}
          textAnchor="middle"
          opacity={textOpacity}
        >
          {currentLevelPoints}
        </AnimatedSvgText>
        
        {/* Points Label */}
        <AnimatedSvgText
          x={center}
          y={center + 15}
          fontSize={size / 20}
          fill={theme.textSecondary}
          textAnchor="middle"
          opacity={textOpacity}
        >
          POINTS
        </AnimatedSvgText>
        
        {/* Next Level Text */}
        <AnimatedSvgText
          x={center}
          y={center + 40}
          fontSize={size / 25}
          fill={theme.textSecondary}
          textAnchor="middle"
          opacity={textOpacity}
        >
          {pointsNeeded > 0 ? `${pointsNeeded} to Level ${level + 1}` : "MAX LEVEL"}
        </AnimatedSvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressRing;
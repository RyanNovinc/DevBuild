// src/components/DraggableProgressBar.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Vibration,
  Pressable
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const DraggableProgressBar = ({ 
  progress, 
  onProgressChange, 
  width = '100%', 
  height = 12, 
  color = '#4CAF50',
  showLabel = true,
  barBgColor,
  disabled = false,
  vibrationEnabled = true,
  useKnob = false, // Set to false to make the entire bar draggable
  knobSize = 24
}) => {
  const { theme } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);
  const [initialProgress] = useState(progress);
  const barHeight = height;
  
  // Animated value for progress
  const progressAnim = useRef(new Animated.Value(0)).current;
  const knobTranslateX = useRef(new Animated.Value(0)).current;
  
  // Set initial position when progress or containerWidth changes
  useEffect(() => {
    if (containerWidth > 0) {
      const progressPosition = (containerWidth - (useKnob ? knobSize : 0)) * (progress / 100);
      progressAnim.setValue(progress);
      knobTranslateX.setValue(progressPosition);
    }
  }, [progress, containerWidth]);
  
  // Common handler for progress update
  const updateProgress = (locationX) => {
    if (containerWidth <= 0 || disabled) return;
    
    // Calculate the new position within bounds based on touch position
    const effectiveWidth = containerWidth - (useKnob ? knobSize : 0);
    const newPosition = Math.max(0, Math.min(locationX, effectiveWidth));
    
    // Calculate percentage (0-100)
    const newProgressPercent = Math.round((newPosition / effectiveWidth) * 100);
    
    // Provide haptic feedback
    if (vibrationEnabled && newProgressPercent % 5 === 0) {
      Vibration.vibrate(1);
    }
    
    // Update animated values
    if (useKnob) {
      knobTranslateX.setValue(newPosition);
    }
    progressAnim.setValue(newProgressPercent);
    
    // Inform parent of change
    if (onProgressChange) {
      onProgressChange(newProgressPercent);
    }
    
    return newProgressPercent;
  };
  
  // PanResponder for drag gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      
      onPanResponderGrant: (evt) => {
        // Initial placement should be exactly where the user touched
        const { locationX } = evt.nativeEvent;
        
        // Haptic feedback when starting drag
        if (vibrationEnabled) {
          Vibration.vibrate(5);
        }
        
        // Update progress based on initial touch
        updateProgress(locationX);
        
        // Store current progress value
        progressAnim.extractOffset();
        if (useKnob) {
          knobTranslateX.extractOffset();
        }
      },
      
      onPanResponderMove: (evt, gestureState) => {
        if (containerWidth <= 0 || disabled) return;
        
        // For knob mode, use gesture dx, for bar mode use absolute position
        let newPosition;
        if (useKnob) {
          // When using knob, move relative to start position
          newPosition = Math.max(0, Math.min(gestureState.dx + knobTranslateX._offset, containerWidth - knobSize));
        } else {
          // When dragging the bar directly, use absolute X position
          newPosition = Math.max(0, Math.min(evt.nativeEvent.locationX, containerWidth));
        }
        
        // Calculate percentage (0-100)
        const effectiveWidth = containerWidth - (useKnob ? knobSize : 0);
        const newProgressPercent = Math.round((newPosition / effectiveWidth) * 100);
        
        // Only vibrate and update on 5% increments for better feedback
        if (vibrationEnabled && newProgressPercent % 5 === 0) {
          Vibration.vibrate(2);
        }
        
        // Update animated values
        if (useKnob) {
          knobTranslateX.setValue(newPosition);
        }
        progressAnim.setValue(newProgressPercent);
        
        // Inform parent of change
        if (onProgressChange) {
          onProgressChange(newProgressPercent);
        }
      },
      
      onPanResponderRelease: () => {
        // Finalize the position
        progressAnim.flattenOffset();
        if (useKnob) {
          knobTranslateX.flattenOffset();
        }
        
        // Final haptic feedback when releasing 
        if (vibrationEnabled) {
          Vibration.vibrate(10);
        }
      }
    })
  ).current;
  
  // Handle tap on progress bar
  const handleBarPress = (evt) => {
    if (disabled) return;
    
    const { locationX } = evt.nativeEvent;
    updateProgress(locationX);
    
    // Haptic feedback
    if (vibrationEnabled) {
      Vibration.vibrate(10);
    }
  };
  
  // Interpolate progress for fill width
  const fillWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });
  
  return (
    <View style={[styles.container, { width, opacity: disabled ? 0.6 : 1 }]}>
      <TouchableWithoutFeedback onPress={handleBarPress}>
        <View 
          style={[
            styles.progressBarContainer, 
            { 
              height: barHeight,
              backgroundColor: barBgColor || `${color}20`, 
              borderRadius: barHeight / 2 
            }
          ]}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
          {...(useKnob ? {} : panResponder.panHandlers)}
        >
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: fillWidth,
                backgroundColor: color,
                borderRadius: barHeight / 2,
                height: barHeight,
              }
            ]} 
          />
          
          {useKnob && (
            <Animated.View 
              style={[
                styles.dragKnob,
                {
                  transform: [{ translateX: knobTranslateX }],
                  width: knobSize,
                  height: knobSize,
                  borderRadius: knobSize / 2,
                  backgroundColor: color,
                  marginTop: -(knobSize - barHeight) / 2
                }
              ]}
              {...panResponder.panHandlers}
            >
              {showLabel && (
                <Animated.View style={styles.labelContainer}>
                  <Animated.Text style={styles.progressLabel}>
                    {progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%']
                    })}
                  </Animated.Text>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
      
      {showLabel && (
        <View style={styles.labelsRow}>
          <Text style={[styles.minLabel, { color: theme.textSecondary }]}>0%</Text>
          <Animated.Text style={[styles.currentLabel, { color: color }]}>
            {progressAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%']
            })}
          </Animated.Text>
          <Text style={[styles.maxLabel, { color: theme.textSecondary }]}>100%</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  progressBarContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  dragKnob: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  labelContainer: {
    position: 'absolute',
    top: -25,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  progressLabel: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    marginTop: 8,
  },
  minLabel: {
    fontSize: 12,
  },
  currentLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  maxLabel: {
    fontSize: 12,
  },
});

export default DraggableProgressBar;
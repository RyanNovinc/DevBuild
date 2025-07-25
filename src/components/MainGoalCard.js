// src/components/MainGoalCard.js - OPTIMIZED VERSION
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Easing,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  ensureAccessibleTouchTarget,
  getContrastRatio,
  meetsContrastRequirements
} from '../utils/responsive';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Function to determine if a color is dark
const isDarkColor = (hexColor) => {
  // Handle invalid hex colors
  if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
    return false;
  }

  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate brightness
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Return true if color is dark (brightness < 128)
  return brightness < 128;
};

// Get appropriate text color for a background color (WCAG compliant)
const getTextColorForBackground = (bgColor) => {
  const whiteContrast = getContrastRatio(bgColor, '#FFFFFF');
  const blackContrast = getContrastRatio(bgColor, '#000000');
  
  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
};

const MainGoalCard = ({ goal, onPress, onProgressUpdate, onComplete, showCompleteButton }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(goal.progress || 0);
  const [contentHeight, setContentHeight] = useState(0);
  
  // Check if using dark mode for better contrast
  const isDarkMode = theme.background === '#000000';
  
  // Update local progress when goal prop changes
  useEffect(() => {
    setProgress(goal.progress || 0);
    
    // Animate to new progress
    Animated.timing(progressAnimation, {
      toValue: goal.progress || 0,
      duration: 800,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false
    }).start();
  }, [goal.progress]);
  
  // Animation values
  const expandAnimation = useRef(new Animated.Value(0)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(progress)).current;
  
  // Toggle expanded state with animation
  const toggleExpanded = () => {
    // Set the target value based on current state
    const finalValue = expanded ? 0 : 1;
    
    // Start the rotation animation
    Animated.timing(rotateAnimation, {
      toValue: finalValue,
      duration: 300,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true
    }).start();
    
    // Start the expand/collapse animation
    Animated.timing(expandAnimation, {
      toValue: finalValue,
      duration: 300,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: false  // Height animations can't use native driver
    }).start();
    
    // Toggle the expanded state
    setExpanded(!expanded);
  };
  
  // Measure the content for height animation
  const onContentLayout = (event) => {
    if (!contentHeight) {
      setContentHeight(event.nativeEvent.layout.height);
    }
  };
  
  // Format target date in relative terms
  const getTimeExpression = () => {
    if (!goal.targetDate) return 'No due date';
    
    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays < 7) {
      return `Due in ${diffDays} days`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Due in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Due in ${months} ${months === 1 ? 'month' : 'months'}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Due in ${years} ${years === 1 ? 'year' : 'years'}`;
    }
  };
  
  // Extract top metrics (max 2)
  const topMetrics = goal.metrics ? goal.metrics.slice(0, 2) : [];
  
  // Animated values for rotation and height
  const rotateArrow = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  const progressWidth = progressAnimation.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%']
  });
  
  // Calculate animated height value
  const animatedHeight = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight || scaleHeight(200)] // Use measured height or responsive fallback
  });
  
  // Increment progress by step (for manual progress)
  const incrementProgress = (step) => {
    // Don't allow increments for completed goals
    if (goal.completed) return;
    
    // Only proceed if onProgressUpdate is provided
    if (!onProgressUpdate) return;
    
    const newProgress = Math.max(0, Math.min(100, progress + step));
    
    if (newProgress !== progress) {
      // Update local state
      setProgress(newProgress);
      
      // Animate to new value
      Animated.timing(progressAnimation, {
        toValue: newProgress,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false
      }).start();
      
      // Notify parent component
      onProgressUpdate(goal.id, newProgress);
    }
  };
  
  // Handle progress bar drag - will only be used if onProgressUpdate is provided
  const handleProgressChange = (newProgress) => {
    // Don't allow changes for completed goals
    if (goal.completed) return;
    
    // Only proceed if onProgressUpdate is provided
    if (!onProgressUpdate) return;
    
    // Update local state
    setProgress(newProgress);
    
    // Notify parent component
    onProgressUpdate(goal.id, newProgress);
  };
  
  // Get gradient colors based on goal color
  const getGradientColors = () => {
    const baseColor = goal.color || '#4CAF50';
    return [
      `${baseColor}05`,
      `${baseColor}15`
    ];
  };
  
  // Handle complete button press
  const handleComplete = () => {
    if (typeof onComplete === 'function') {
      console.log("Completing goal:", goal.title);
      onComplete(goal.id, !goal.completed); // Pass the opposite of current completed state
    } else {
      console.warn("onComplete function not provided to MainGoalCard");
    }
  };
  
  // Extract goal properties safely
  const completed = goal.completed || false;
  
  // Progress color based on value and completion status
  const getProgressColor = (progressValue) => {
    if (completed) return theme.success || '#43A047';
    if (progressValue < 25) return theme.error || '#E53935';
    if (progressValue < 50) return theme.warning || '#FB8C00';
    if (progressValue < 75) return '#039BE5';
    return theme.success || '#43A047';
  };
  
  // Progress text based on value and completion status
  const getProgressText = (progressValue) => {
    if (completed) return 'Completed';
    if (progressValue === 100) return 'Ready to complete!';
    return `${progressValue}%`; // Just show percentage without "not started"
  };
  
  // Determine appropriate icon color based on goal color - ensure WCAG compliance
  const getIconColor = () => {
    // Special case for white background
    if (goal.color === '#FFFFFF') {
      return '#000000'; // Use black icon on white background
    }
    
    // Use getTextColorForBackground for WCAG compliant text contrast
    return getTextColorForBackground(goal.color);
  };
  
  // Render a non-draggable progress bar
  const renderProgressBar = () => {
    return (
      <View 
        style={[styles.staticProgressBar, { backgroundColor: `${goal.color}20` }]}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: progress
        }}
        accessibilityLabel={`Goal progress ${progress} percent${completed ? ', completed' : ''}`}
      >
        <Animated.View 
          style={[
            styles.staticProgressFill, 
            { 
              width: progressWidth,
              backgroundColor: getProgressColor(progress)
            }
          ]} 
        />
      </View>
    );
  };
  
  // Get accessible touch target dimensions for buttons
  const touchTargetSize = accessibility.touchTarget.medium;
  
  return (
    <Pressable 
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${goal.title} goal, ${getProgressText(progress)}`}
      accessibilityHint="Double tap to view goal details"
      style={({ pressed }) => [
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <Animated.View 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.card,
            borderLeftColor: goal.color,
            opacity: completed ? 0.85 : 1, // Slightly dimmed if completed
            marginHorizontal: spacing.m, // Use predefined responsive spacing
            marginBottom: spacing.m,
            borderLeftWidth: scaleWidth(5)
          }
        ]}
      >
        {/* Completed Badge (only shown for completed goals) */}
        {completed && (
          <View style={[styles.completedBadge, { 
            backgroundColor: theme.success || '#43A047',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
            top: spacing.s,
            right: spacing.s,
            paddingHorizontal: spacing.xs,
            paddingVertical: scaleHeight(4),
            borderRadius: scaleWidth(12)
          }]}>
            <Ionicons 
              name="checkmark-circle" 
              size={scaleWidth(14)} 
              color={isDarkMode ? '#000000' : '#FFFFFF'} 
            />
            <Text style={[styles.completedBadgeText, {
              color: isDarkMode ? '#000000' : '#FFFFFF',
              fontSize: fontSizes.xs,
              marginLeft: spacing.xxxs
            }]}>
              Completed
            </Text>
          </View>
        )}
        
        {/* Card Header */}
        <View style={[styles.header, { padding: spacing.m }]}>
          <View style={[
            styles.iconContainer, 
            { 
              backgroundColor: goal.color,
              // Add border for white color to ensure visibility
              borderWidth: goal.color === '#FFFFFF' ? 1 : 0,
              borderColor: '#000000',
              ...ensureAccessibleTouchTarget(scaleWidth(48), scaleWidth(48)),
              borderRadius: scaleWidth(24)
            }
          ]}>
            <Ionicons 
              name={goal.icon || 'star'} 
              size={scaleWidth(28)} 
              color={getIconColor()} // Use our function to determine icon color
            />
          </View>
          
          <View style={styles.titleContainer}>
            <Text 
              style={[
                styles.title, 
                { 
                  color: theme.text,
                  textDecorationLine: completed ? 'line-through' : 'none',
                  fontSize: fontSizes.l,
                  marginBottom: scaleHeight(3)
                }
              ]} 
              numberOfLines={expanded ? undefined : 1}
              maxFontSizeMultiplier={1.3} // Limit maximum text scaling for UI integrity
            >
              {goal.title}
            </Text>
            <Text 
              style={[
                styles.dueDate, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.xs
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              {getTimeExpression()}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.expandButton, 
              ensureAccessibleTouchTarget(scaleWidth(36), scaleWidth(36))
            ]} 
            onPress={toggleExpanded}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={expanded ? "Collapse goal details" : "Expand goal details"}
            accessibilityState={{ expanded }}
          >
            <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
              <Ionicons 
                name="chevron-down" 
                size={scaleWidth(20)} 
                color={theme.textSecondary} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar - Using a simple non-draggable progress bar */}
        <View style={[
          styles.progressContainer, 
          { 
            paddingHorizontal: spacing.m,
            paddingBottom: spacing.m
          }
        ]}>
          {/* Render static non-interactive progress bar */}
          {renderProgressBar()}
          
          <View style={[styles.progressLabels, { marginTop: spacing.xxxs }]}>
            <Text 
              style={[
                styles.progressPercent, 
                { 
                  color: getProgressColor(progress),
                  fontSize: fontSizes.s
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {getProgressText(progress)}
            </Text>
            
            {/* Only show +/- buttons if onProgressUpdate is provided */}
            {!goal.useMetricsForProgress && !completed && onProgressUpdate && (
              <View style={styles.progressControls}>
                <TouchableOpacity 
                  style={[
                    styles.progressButton, 
                    { 
                      borderColor: theme.border,
                      ...ensureAccessibleTouchTarget(scaleWidth(28), scaleWidth(28)),
                      marginLeft: spacing.xs
                    }
                  ]} 
                  onPress={() => incrementProgress(-5)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Decrease progress by 5 percent"
                >
                  <Ionicons name="remove" size={scaleWidth(14)} color={theme.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.progressButton, 
                    { 
                      borderColor: theme.border,
                      ...ensureAccessibleTouchTarget(scaleWidth(28), scaleWidth(28)),
                      marginLeft: spacing.xs
                    }
                  ]} 
                  onPress={() => incrementProgress(5)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Increase progress by 5 percent"
                >
                  <Ionicons name="add" size={scaleWidth(14)} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        
        {/* Complete/Reactivate Goal Button */}
        {(progress === 100 && !completed) ? (
          <TouchableOpacity
            style={[
              styles.completeButton, 
              { 
                backgroundColor: theme.success || '#43A047',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)',
                marginHorizontal: spacing.m,
                marginBottom: spacing.m,
                paddingVertical: scaleHeight(10),
                paddingHorizontal: spacing.m,
                borderRadius: scaleWidth(8),
                minHeight: accessibility.minTouchTarget // Ensure minimum touch target height
              }
            ]}
            onPress={handleComplete}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Complete this goal"
            accessibilityHint="Marks the goal as completed"
          >
            <Ionicons 
              name="checkmark-circle" 
              size={scaleWidth(18)} 
              color={isDarkMode ? '#000000' : '#FFFFFF'} 
              style={[styles.completeButtonIcon, { marginRight: spacing.xxxs }]}
            />
            <Text 
              style={[
                styles.completeButtonText, 
                {
                  color: isDarkMode ? '#000000' : '#FFFFFF',
                  fontSize: fontSizes.s
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Complete Goal
            </Text>
          </TouchableOpacity>
        ) : completed ? (
          <TouchableOpacity
            style={[
              styles.uncompleteButton, 
              { 
                borderColor: theme.border,
                borderWidth: 1,
                marginHorizontal: spacing.m,
                marginBottom: spacing.m,
                paddingVertical: scaleHeight(10),
                paddingHorizontal: spacing.m,
                borderRadius: scaleWidth(8),
                minHeight: accessibility.minTouchTarget // Ensure minimum touch target height
              }
            ]}
            onPress={handleComplete}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Reactivate this goal"
            accessibilityHint="Changes the goal status back to active"
          >
            <Ionicons 
              name="refresh-circle" 
              size={scaleWidth(18)} 
              color={theme.text} 
              style={[styles.completeButtonIcon, { marginRight: spacing.xxxs }]}
            />
            <Text 
              style={[
                styles.uncompleteButtonText, 
                {
                  color: theme.text,
                  fontSize: fontSizes.s
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Reactivate Goal
            </Text>
          </TouchableOpacity>
        ) : null}
        
        {/* Expandable Content with smooth animation */}
        <Animated.View 
          style={[
            styles.expandContent, 
            { 
              height: animatedHeight,
              opacity: expandAnimation
            }
          ]}
        >
          {/* We need this wrapper View to measure the content height properly */}
          <View style={styles.measureContent} onLayout={onContentLayout}>
            <LinearGradient
              colors={getGradientColors()}
              style={[
                styles.expandContentInner,
                {
                  padding: spacing.m,
                  paddingTop: 0
                }
              ]}
            >
              {/* Description */}
              {goal.description ? (
                <Text 
                  style={[
                    styles.description, 
                    { 
                      color: theme.text,
                      textDecorationLine: completed ? 'line-through' : 'none',
                      fontSize: fontSizes.s,
                      lineHeight: scaleHeight(20),
                      marginBottom: spacing.m
                    }
                  ]} 
                  numberOfLines={2}
                  maxFontSizeMultiplier={1.5}
                >
                  {goal.description}
                </Text>
              ) : (
                <Text 
                  style={[
                    styles.emptyDescription, 
                    { 
                      color: theme.textSecondary,
                      fontSize: fontSizes.s,
                      marginBottom: spacing.m
                    }
                  ]}
                  maxFontSizeMultiplier={1.5}
                >
                  No description provided
                </Text>
              )}
              
              {/* Metrics */}
              {topMetrics.length > 0 && (
                <View style={[styles.metricsContainer, { marginBottom: spacing.m }]}>
                  {topMetrics.map((metric) => {
                    // Calculate progress percentage
                    const metricProgress = metric.target > 0 
                      ? (metric.current / metric.target) * 100 
                      : 0;
                    
                    return (
                      <View key={metric.id} style={[styles.metricItem, { marginBottom: spacing.s }]}>
                        <View style={[styles.metricHeader, { marginBottom: spacing.xxxs }]}>
                          <Text 
                            style={[
                              styles.metricName, 
                              { 
                                color: theme.text,
                                textDecorationLine: completed ? 'line-through' : 'none',
                                fontSize: fontSizes.s
                              }
                            ]}
                            maxFontSizeMultiplier={1.3}
                          >
                            {metric.name}
                          </Text>
                          <Text 
                            style={[
                              styles.metricValue, 
                              { 
                                color: theme.text,
                                textDecorationLine: completed ? 'line-through' : 'none',
                                fontSize: fontSizes.s
                              }
                            ]}
                            maxFontSizeMultiplier={1.3}
                          >
                            {metric.current} / {metric.target} {metric.unit || ''}
                          </Text>
                        </View>
                        <View 
                          style={[
                            styles.metricProgress, 
                            { 
                              backgroundColor: theme.background,
                              height: scaleHeight(6),
                              borderRadius: scaleWidth(3)
                            }
                          ]}
                          accessible={true}
                          accessibilityRole="progressbar"
                          accessibilityLabel={`${metric.name} progress, ${metric.current} of ${metric.target} ${metric.unit || ''}`}
                          accessibilityValue={{
                            min: 0,
                            max: metric.target,
                            now: metric.current
                          }}
                        >
                          <View 
                            style={[
                              styles.metricProgressFill, 
                              { 
                                width: `${Math.min(Math.max(metricProgress, 0), 100)}%`, 
                                backgroundColor: completed ? theme.success : goal.color,
                                height: '100%',
                                borderRadius: scaleWidth(3)
                              }
                            ]} 
                          />
                        </View>
                      </View>
                    );
                  })}
                  
                  {/* Show metrics count if there are more than displayed */}
                  {goal.metrics && goal.metrics.length > 2 && (
                    <Text 
                      style={[
                        styles.moreMetricsText, 
                        { 
                          color: theme.textSecondary,
                          fontSize: fontSizes.xs,
                          marginTop: spacing.xxxs
                        }
                      ]}
                      maxFontSizeMultiplier={1.5}
                    >
                      +{goal.metrics.length - 2} more metrics
                    </Text>
                  )}
                </View>
              )}
              
              {/* Complete Goal Button (only shown for incomplete goals) */}
              {!goal.completed && (
                <TouchableOpacity 
                  style={[
                    styles.completeButton, 
                    { 
                      backgroundColor: goal.color || theme.primary,
                      borderRadius: scaleWidth(20),
                      paddingVertical: scaleHeight(12),
                      paddingHorizontal: spacing.m,
                      minHeight: accessibility.minTouchTarget,
                      width: '100%',
                      marginTop: spacing.m
                    }
                  ]} 
                  onPress={handleComplete}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Complete this goal"
                  accessibilityHint="Marks the goal as completed"
                >
                  <Ionicons 
                    name="checkmark-circle" 
                    size={scaleWidth(18)} 
                    color={getTextColorForBackground(goal.color || theme.primary)} 
                    style={{marginRight: spacing.xs}} 
                  />
                  <Text 
                    style={[
                      styles.completeButtonText, 
                      { 
                        color: getTextColorForBackground(goal.color || theme.primary),
                        fontSize: fontSizes.s,
                        fontWeight: '600'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    Complete Goal
                  </Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
};

// Simplified styles with no hard-coded values
const styles = StyleSheet.create({
  container: {
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(2) },
    shadowOpacity: 0.1,
    shadowRadius: scaleWidth(4),
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleWidth(12),
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  dueDate: {
    // Font size set inline with dynamic scaling
  },
  expandButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    // Padding set inline with scaling
  },
  staticProgressBar: {
    height: scaleHeight(8),
    borderRadius: scaleWidth(4),
    overflow: 'hidden',
  },
  staticProgressFill: {
    height: '100%',
    borderRadius: scaleWidth(4),
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercent: {
    fontWeight: 'bold',
    // Font size set inline with dynamic scaling
  },
  progressControls: {
    flexDirection: 'row',
  },
  progressButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    // Size and border radius set inline
  },
  expandContent: {
    width: '100%',
    overflow: 'hidden',
  },
  measureContent: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  expandContentInner: {
    // Padding set inline with scaling
  },
  description: {
    // Font size and line height set inline with dynamic scaling
  },
  emptyDescription: {
    fontStyle: 'italic',
    // Font size set inline with dynamic scaling
  },
  metricsContainer: {
    // Margin set inline with scaling
  },
  metricItem: {
    // Margin set inline with scaling
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // Margin set inline with scaling
  },
  metricName: {
    fontWeight: '500',
    // Font size set inline with dynamic scaling
  },
  metricValue: {
    // Font size set inline with dynamic scaling
  },
  metricProgress: {
    // Height and border radius set inline with scaling
  },
  metricProgressFill: {
    // Height and border radius set inline with scaling
  },
  moreMetricsText: {
    fontStyle: 'italic',
    textAlign: 'center',
    // Font size set inline with dynamic scaling
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    // Other properties set inline with scaling
  },
  detailsButtonText: {
    fontWeight: '500',
    // Font size set inline with dynamic scaling
  },
  detailsButtonIcon: {
    // Margin set inline
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Other properties set inline with scaling
  },
  completeButtonIcon: {
    // Margin set inline
  },
  completeButtonText: {
    fontWeight: '600',
    // Font size set inline with dynamic scaling
  },
  uncompleteButtonText: {
    fontWeight: '500',
    // Font size set inline with dynamic scaling
  },
  completedBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
    // Other properties set inline with scaling
  },
  completedBadgeText: {
    fontWeight: '600',
    // Font size and margin set inline with dynamic scaling
  }
});

export default MainGoalCard;
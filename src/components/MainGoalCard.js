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

const MainGoalCard = ({ goal, onPress, onProgressUpdate, onComplete, showCompleteButton, isTourMode = false }) => {
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
    const newHeight = event.nativeEvent.layout.height;
    // Always update content height to account for dynamic content
    setContentHeight(newHeight);
  };
  
  // Format target date in relative terms with overdue styling
  const getTimeExpression = () => {
    if (!goal.targetDate) return { text: 'No due date', isOverdue: false };
    
    const targetDate = new Date(goal.targetDate);
    const now = new Date();
    const diffTime = targetDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `Overdue by ${Math.abs(diffDays)} days`, isOverdue: true };
    } else if (diffDays === 0) {
      return { text: 'Due today', isOverdue: false, isUrgent: true };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', isOverdue: false, isUrgent: true };
    } else if (diffDays < 7) {
      return { text: `Due in ${diffDays} days`, isOverdue: false };
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return { text: `Due in ${weeks} ${weeks === 1 ? 'week' : 'weeks'}`, isOverdue: false };
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return { text: `Due in ${months} ${months === 1 ? 'month' : 'months'}`, isOverdue: false };
    } else {
      const years = Math.floor(diffDays / 365);
      return { text: `Due in ${years} ${years === 1 ? 'year' : 'years'}`, isOverdue: false };
    }
  };
  
  // Format creation or completion date
  const getFormattedDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Get domain icon based on goal domain
  const getDomainIcon = () => {
    const domainIcons = {
      'Business': 'briefcase',
      'Finance': 'card',
      'Health': 'fitness',
      'Relationships': 'people',
      'Education': 'school',
      'Knowledge': 'library',
      'Wellbeing': 'heart',
      'Joy': 'happy',
      'Home': 'home',
      'Travel': 'airplane',
      'Achievement': 'trophy',
      'General': 'star'
    };
    
    return domainIcons[goal.domain || goal.domainName] || goal.icon || 'star';
  };
  
  // Get milestone count for this goal
  const getMilestoneCount = () => {
    return goal.milestoneCount || 0;
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
    outputRange: [0, contentHeight || scaleHeight(300)] // Use measured height or larger responsive fallback
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
  
  // Handle complete/reactivate button press
  const handleComplete = () => {
    if (typeof onComplete === 'function') {
      console.log(goal.completed ? "Reactivating goal:" : "Completing goal:", goal.title);
      onComplete(goal.id, !goal.completed); // Pass the opposite of current completed state
    } else {
      console.warn("onComplete function not provided to MainGoalCard");
    }
  };
  
  // Extract goal properties safely
  const completed = goal.completed || false;
  
  // Progress color based on goal domain color
  const getProgressColor = (progressValue) => {
    if (completed) return theme.success || '#43A047';
    // Use the goal's domain color for all progress states
    return goal.color || theme.primary;
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
  const timeInfo = getTimeExpression();
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.card,
          borderColor: timeInfo.isOverdue ? '#FF5252' : theme.border,
          borderWidth: timeInfo.isOverdue ? 2 : 1,
          opacity: completed ? 0.85 : 1,
          marginHorizontal: spacing.m,
          marginBottom: spacing.m,
          shadowColor: timeInfo.isOverdue ? '#FF5252' : '#000',
          shadowOpacity: timeInfo.isOverdue ? 0.15 : 0.1
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
        
        {/* Ultra-Clean Goal Header */}
        <TouchableOpacity 
          style={[styles.header, { 
            paddingHorizontal: spacing.l, 
            paddingVertical: spacing.l,
            flexDirection: 'column',
            alignItems: 'stretch'
          }]}
          onPress={onPress}
          activeOpacity={0.7}
        >
          {/* Top Row: Domain Icon, Title and Progress */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: scaleHeight(16) }}>
            {/* Domain Icon */}
            <View style={[
              styles.domainIconContainer, 
              { 
                backgroundColor: `${goal.color}15`,
                borderWidth: 1,
                borderColor: `${goal.color}30`,
                width: scaleWidth(32),
                height: scaleWidth(32),
                borderRadius: scaleWidth(16),
                marginRight: spacing.s
              }
            ]}>
              <Ionicons 
                name={getDomainIcon()} 
                size={scaleWidth(16)} 
                color={goal.color || theme.primary}
              />
            </View>
            
            <Text 
              style={[
                styles.title, 
                { 
                  color: completed ? theme.textSecondary : theme.text,
                  textDecorationLine: completed ? 'line-through' : 'none',
                  fontSize: fontSizes.xl,
                  fontWeight: '700',
                  flex: 1,
                  lineHeight: scaleHeight(28),
                  marginRight: spacing.m
                }
              ]} 
              numberOfLines={3}
              maxFontSizeMultiplier={1.3}
            >
              {goal.title}
            </Text>
            
            {!completed && (
              <View style={{
                backgroundColor: `${goal.color}20`,
                paddingHorizontal: spacing.s,
                paddingVertical: scaleHeight(6),
                borderRadius: scaleWidth(20),
                borderWidth: 1,
                borderColor: `${goal.color}40`
              }}>
                <Text style={{
                  color: goal.color,
                  fontSize: fontSizes.xs,
                  fontWeight: '600'
                }}>
                  {getProgressText(progress)}
                </Text>
              </View>
            )}
          </View>
          
          {/* Progress Bar */}
          <View style={[styles.modernProgressBar, { 
            backgroundColor: `${goal.color}10`,
            marginBottom: scaleHeight(16)
          }]}>
            <Animated.View 
              style={[
                styles.modernProgressFill, 
                { 
                  width: progressWidth,
                  backgroundColor: completed ? theme.success : getProgressColor(progress)
                }
              ]} 
            />
          </View>
          
          {/* Bottom Row: Details and Actions */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              {/* Milestone and Task Info */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                {getMilestoneCount() > 0 && (
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: fontSizes.s,
                    fontWeight: '500',
                    marginRight: spacing.s
                  }}>
                    {goal.completedMilestoneCount || 0}/{getMilestoneCount()} milestone{getMilestoneCount() !== 1 ? 's' : ''}
                  </Text>
                )}
                
                {/* Add task count - always show, even if 0 */}
                <Text style={{
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  fontWeight: '500'
                }}>
                  {getMilestoneCount() > 0 ? '• ' : ''}{goal.completedTaskCount || 0}/{goal.taskCount || 0} task{(goal.taskCount || 0) !== 1 ? 's' : ''}
                </Text>
              </View>
              
              {/* Due Date */}
              {timeInfo.text !== 'No due date' && (
                <Text style={{
                  color: timeInfo.isOverdue ? '#FF5252' : 
                         timeInfo.isUrgent ? '#FF9800' : theme.textSecondary,
                  fontSize: fontSizes.xs,
                  fontWeight: timeInfo.isOverdue || timeInfo.isUrgent ? '600' : '500'
                }}>
                  {timeInfo.text}
                </Text>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {completed ? (
                <TouchableOpacity 
                  style={{
                    backgroundColor: theme.primary,
                    paddingHorizontal: spacing.m,
                    paddingVertical: scaleHeight(10),
                    borderRadius: scaleWidth(24)
                  }}
                  onPress={isTourMode ? null : handleComplete}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Reactivate this goal"
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: fontSizes.s,
                    fontWeight: '600'
                  }}>
                    Reactivate
                  </Text>
                </TouchableOpacity>
              ) : progress === 100 ? (
                <TouchableOpacity 
                  style={{
                    backgroundColor: goal.color,
                    paddingHorizontal: spacing.m,
                    paddingVertical: scaleHeight(10),
                    borderRadius: scaleWidth(24)
                  }}
                  onPress={isTourMode ? null : handleComplete}
                >
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: fontSizes.s,
                    fontWeight: '600'
                  }}>
                    {getMilestoneCount() > 0 && (goal.completedMilestoneCount || 0) === getMilestoneCount() ? '🎉 Complete' : 'Complete'}
                  </Text>
                </TouchableOpacity>
              ) : null}
              
              <TouchableOpacity 
                style={{
                  padding: scaleWidth(8),
                  marginLeft: spacing.xs
                }}
                onPress={toggleExpanded}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={expanded ? "Collapse goal details" : "Expand goal details"}
              >
                <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
                  <Ionicons 
                    name="chevron-down" 
                    size={scaleWidth(22)} 
                    color={theme.textSecondary} 
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        
        
        
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
                  numberOfLines={undefined}
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
            </LinearGradient>
          </View>
        </Animated.View>
    </Animated.View>
  );
};

// Simplified styles with no hard-coded values
const styles = StyleSheet.create({
  container: {
    borderRadius: scaleWidth(16),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: scaleHeight(3) },
    shadowOpacity: 0.08,
    shadowRadius: scaleWidth(8),
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  goalIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  simpleGoalStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStatus: {
    // Style set inline
  },
  milestoneInfo: {
    // Style set inline
  },
  goalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  domainTag: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.s,
    paddingVertical: scaleHeight(4),
  },
  domainText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  progressSection: {
    // Padding and border set inline
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: scaleHeight(4),
  },
  statValue: {
    textAlign: 'center',
  },
  modernProgressBar: {
    height: scaleHeight(4),
    borderRadius: scaleWidth(2),
    overflow: 'hidden',
  },
  modernProgressFill: {
    height: '100%',
    borderRadius: scaleWidth(2),
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
  reactivateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reactivateButtonText: {
    // Font styling is set inline
  },
  completedBadgeText: {
    fontWeight: '600',
    // Font size and margin set inline with dynamic scaling
  }
});

export default MainGoalCard;
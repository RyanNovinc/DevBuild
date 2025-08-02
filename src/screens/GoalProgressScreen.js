// src/screens/GoalProgressScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

const GoalProgressScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { projects, goals } = useAppContext();
  
  // Extract parameters from route
  const { goalId, goalColor = '#4CAF50', goalTitle = 'Goal' } = route.params || {};
  
  const [isLoading, setIsLoading] = useState(true);
  const [progressData, setProgressData] = useState([]);
  const [goalCreatedDate, setGoalCreatedDate] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('chart');
  
  // Animation values
  const chartOpacity = useRef(new Animated.Value(1)).current;
  const listOpacity = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const headerHeight = useRef(new Animated.Value(200)).current;
  
  // For ripple effect on point selection
  const [selectedPointCoords, setSelectedPointCoords] = useState(null);
  const rippleAnim = useRef(new Animated.Value(0)).current;
  
  // Colors based on theme and goal
  const getSecondaryColor = () => {
    // Create a lighter version of the goal color
    const lightenColor = (color, percent) => {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return '#' + (
        0x1000000 + 
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
        (B < 255 ? B < 1 ? 0 : B : 255)
      ).toString(16).slice(1);
    };
    
    return lightenColor(goalColor, 20);
  };
  
  useEffect(() => {
    if (!goalId) {
      setError('Goal not found');
      setIsLoading(false);
      return;
    }
    
    try {
      // Find goal data to get created date
      const goalData = goals?.find(g => g.id === goalId);
      if (goalData && goalData.createdAt) {
        setGoalCreatedDate(new Date(goalData.createdAt));
      }
      
      // Get ALL projects for this goal (not just completed ones)
      const allGoalProjects = projects.filter(project => project.goalId === goalId);
      
      // Get only completed projects and sort by completion date
      const completedProjects = allGoalProjects
        .filter(project => project.progress === 100 || project.completed)
        .sort((a, b) => {
          // Use completedAt if available, otherwise updatedAt
          const dateA = a.completedAt ? new Date(a.completedAt) : new Date(a.updatedAt);
          const dateB = b.completedAt ? new Date(b.completedAt) : new Date(b.updatedAt);
          return dateA - dateB;
        });
        
      // Calculate progress points with CORRECT progress calculation
      let progressPoints = [];
      
      // Always add starting point at 0% if we have goal created date
      // FIX: Moved this outside the conditions to ensure it's always included when goalData exists
      if (goalData && goalData.createdAt) {
        const createdDate = new Date(goalData.createdAt);
        progressPoints.push({
          date: createdDate,
          progress: 0,
          formattedDate: formatDate(createdDate),
          projectTitle: 'Goal Created',
          isCreationPoint: true,
          totalProjects: allGoalProjects.length,
          completedProjects: 0
        });
      }
      
      // Calculate ACTUAL progress for each completed project milestone
      const totalProjects = allGoalProjects.length;
      
      completedProjects.forEach((project, index) => {
        // Progress = (number of completed projects / total projects) * 100
        const completedCount = index + 1; // This project is now completed
        const actualProgress = Math.round((completedCount / totalProjects) * 100);
        
        const date = project.completedAt ? new Date(project.completedAt) : new Date(project.updatedAt);
        progressPoints.push({
          date,
          progress: actualProgress,
          formattedDate: formatDate(date),
          projectTitle: project.title,
          isCreationPoint: false,
          totalProjects: totalProjects,
          completedProjects: completedCount
        });
      });
      
      // FIX: Removed the redundant check here, as we already added the starting point above if it exists
      
      setProgressData(progressPoints);
      setIsLoading(false);
      
      // Animate progress line after data loaded
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: false
      }).start();
      
    } catch (error) {
      console.error('Error generating progress data:', error);
      setError('Error loading progress data');
      setIsLoading(false);
    }
  }, [goalId, projects, goals]);
  
  // Format date for display
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Toggle fullscreen chart mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      // Collapse the header when entering fullscreen
      Animated.timing(headerHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      }).start();
    } else {
      // Expand the header when exiting fullscreen
      Animated.timing(headerHeight, {
        toValue: 200,
        duration: 300,
        useNativeDriver: false
      }).start();
    }
  };
  
  // Handle tab switching
  const switchTab = (tab) => {
    if (tab === activeTab) return;
    
    setActiveTab(tab);
    
    // Animate tab transition
    if (tab === 'chart') {
      Animated.parallel([
        Animated.timing(chartOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(listOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(chartOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true
        }),
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true
        })
      ]).start();
    }
  };
  
  // Handle point selection with animation
  const handlePointSelection = (point, coords) => {
    if (point === selectedPoint) {
      setSelectedPoint(null);
      return;
    }
    
    setSelectedPoint(point);
    
    // Animate ripple effect
    if (coords) {
      setSelectedPointCoords(coords);
      rippleAnim.setValue(0);
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true
      }).start();
    }
  };
  
  // Render modern progress chart
  const renderProgressChart = () => {
    if (progressData.length === 0) return null;
    
    // Adjust chart dimensions
    const chartPadding = 30;
    const chartWidth = isFullscreen ? width - (chartPadding * 2) : width - 70; // Reduce width in non-fullscreen mode
    // Add bottom padding for date labels
    const chartHeight = isFullscreen ? height * 0.6 : 220;
    
    // Ensure the chart stays within bounds with proper margins
    const chartMargin = {
      top: 10,
      right: 20, // Increased right margin to prevent overflow
      bottom: 40, // Extra space for date labels
      left: 5
    };
    
    // Calculate usable chart area
    const usableWidth = chartWidth - chartMargin.left - chartMargin.right;
    const usableHeight = chartHeight - chartMargin.top - chartMargin.bottom;
    
    // Interpolate progress line for animation
    const animatedLineProgress = progressAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1]
    });
    
    return (
      <View style={[styles.chartWrapper, { height: chartHeight + 60 }]}>
        {/* Y-axis labels */}
        <View style={[styles.yAxisLabels, { height: usableHeight, marginTop: chartMargin.top }]}>
          <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>100%</Text>
          <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>75%</Text>
          <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>50%</Text>
          <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>25%</Text>
          <Text style={[styles.axisLabel, { color: theme.textSecondary }]}>0%</Text>
        </View>
        
        {/* Chart area with proper margins */}
        <View style={[
          styles.chartArea, 
          { 
            height: chartHeight,
            paddingLeft: chartMargin.left,
            paddingRight: chartMargin.right,
            paddingTop: chartMargin.top,
            paddingBottom: chartMargin.bottom,
            width: chartWidth, // Explicitly set width to ensure containment
          }
        ]}>
          {/* Background for the chart */}
          <View style={[
            styles.chartBackground, 
            { 
              width: usableWidth,
              height: usableHeight,
              backgroundColor: `${theme.border}15`,
              borderRadius: 6
            }
          ]} />
          
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((position, index) => (
            <View 
              key={`grid-${index}`}
              style={[
                styles.gridLine, 
                { 
                  top: chartMargin.top + (usableHeight * position), 
                  left: chartMargin.left,
                  width: usableWidth,
                  borderTopColor: index === 0 || index === 4 
                    ? theme.border 
                    : `${theme.border}50` 
                }
              ]} 
            />
          ))}
          
          {/* Background gradient for chart area */}
          <LinearGradient
            colors={[`${goalColor}10`, 'transparent']}
            style={[
              styles.chartGradient, 
              { 
                height: usableHeight,
                width: usableWidth,
                top: chartMargin.top,
                left: chartMargin.left,
                borderRadius: 6
              }
            ]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
          />
          
          {/* Animated Progress Area - contained within chart bounds */}
          <Animated.View 
            style={[
              styles.progressArea,
              {
                height: usableHeight,
                width: usableWidth * animatedLineProgress,
                top: chartMargin.top,
                left: chartMargin.left
              }
            ]}
          >
            {/* Filled area under the line */}
            <View style={styles.progressAreaFill}>
              {progressData.map((point, index) => {
                // Skip if this is the last point
                if (index === progressData.length - 1) return null;
                
                const nextPoint = progressData[index + 1];
                const startX = (index / (progressData.length - 1)) * usableWidth;
                const endX = ((index + 1) / (progressData.length - 1)) * usableWidth;
                const startY = usableHeight - (point.progress / 100 * usableHeight);
                const endY = usableHeight - (nextPoint.progress / 100 * usableHeight);
                
                return (
                  <View 
                    key={`area-${index}`}
                    style={[
                      styles.progressAreaSegment,
                      {
                        left: startX,
                        width: endX - startX,
                        height: usableHeight
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[`${goalColor}20`, `${goalColor}05`]}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                    />
                  </View>
                );
              })}
            </View>
            
            {/* Progress line */}
            <View style={styles.progressLinePath}>
              {progressData.map((point, index) => {
                // Skip if this is the last point
                if (index === progressData.length - 1) return null;
                
                const nextPoint = progressData[index + 1];
                const startX = (index / (progressData.length - 1)) * usableWidth;
                const endX = ((index + 1) / (progressData.length - 1)) * usableWidth;
                const startY = usableHeight - (point.progress / 100 * usableHeight);
                const endY = usableHeight - (nextPoint.progress / 100 * usableHeight);
                
                // Calculate angle and length for the line
                const dx = endX - startX;
                const dy = endY - startY;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                return (
                  <View 
                    key={`line-${index}`}
                    style={[
                      styles.progressLineSegment,
                      {
                        left: startX,
                        top: startY,
                        width: length,
                        transform: [{ rotate: `${angle}deg` }],
                        backgroundColor: goalColor,
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={[goalColor, getSecondaryColor()]}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    />
                  </View>
                );
              })}
            </View>
            
            {/* Ripple animation for selected point */}
            {selectedPointCoords && (
              <Animated.View
                style={[
                  styles.ripple,
                  {
                    left: selectedPointCoords.x,
                    top: selectedPointCoords.y,
                    transform: [{
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 3]
                      })
                    }],
                    opacity: rippleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.6, 0]
                    }),
                    backgroundColor: goalColor
                  }
                ]}
              />
            )}
            
            {/* Data points */}
            {progressData.map((point, index) => {
              const pointX = (index / (progressData.length - 1)) * usableWidth;
              const pointY = usableHeight - (point.progress / 100 * usableHeight);
              
              return (
                <TouchableOpacity 
                  key={`point-${index}`}
                  style={[
                    styles.dataPointTouchable,
                    {
                      left: pointX,
                      top: pointY,
                    }
                  ]}
                  onPress={() => handlePointSelection(point, { x: pointX, y: pointY })}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.dataPoint,
                      {
                        backgroundColor: selectedPoint === point ? goalColor : theme.background,
                        borderColor: point.isCreationPoint ? theme.textSecondary : goalColor,
                        width: selectedPoint === point ? 16 : 10,
                        height: selectedPoint === point ? 16 : 10,
                        borderWidth: selectedPoint === point ? 3 : 2,
                      }
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </Animated.View>
          
          {/* X-axis labels (dates) with fixed positioning to prevent overlap */}
          <View style={[
            styles.xAxisLabels, 
            { 
              top: chartMargin.top + usableHeight + 5, 
              left: chartMargin.left,
              width: usableWidth
            }
          ]}>
            {/* Create a background for date labels for better readability */}
            <View style={styles.dateLabelsContainer}>
              {progressData.map((point, index) => {
                // Only show first and last date in normal mode to prevent overflow
                const shouldShowLabel = isFullscreen
                  ? (index === 0 || index === progressData.length - 1 || index % Math.floor(progressData.length / 3) === 0)
                  : (index === 0 || index === progressData.length - 1);
                
                if (!shouldShowLabel) return null;
                
                const position = (index / (progressData.length - 1)) * usableWidth;
                
                // Adjust position for first and last labels to ensure they stay within bounds
                let adjustedPosition = position;
                if (index === 0) {
                  adjustedPosition = Math.max(30, position); // Prevent leftmost label from going off-screen
                } else if (index === progressData.length - 1) {
                  adjustedPosition = Math.min(usableWidth - 30, position); // Prevent rightmost label from going off-screen
                }
                
                return (
                  <View 
                    key={`date-bg-${index}`}
                    style={[
                      styles.dateLabelBackground,
                      {
                        left: adjustedPosition,
                        backgroundColor: `${theme.background}90`,
                        borderColor: `${theme.border}30`,
                      }
                    ]}
                  >
                    <Text 
                      style={[
                        styles.dateLabel,
                        {
                          color: theme.textSecondary,
                          fontSize: isFullscreen ? 10 : 9,
                        }
                      ]}
                      numberOfLines={1}
                    >
                      {point.formattedDate}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    );
  };
  
  // Calculate goal duration in days
  const getGoalDuration = () => {
    if (!goalCreatedDate || progressData.length < 2) return null;
    
    const lastPoint = progressData[progressData.length - 1];
    if (!lastPoint) return null;
    
    const endDate = new Date(lastPoint.date);
    
    const durationMs = endDate.getTime() - goalCreatedDate.getTime();
    const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
    
    return durationDays;
  };
  
  // Render point detail card when a point is selected
  const renderPointDetailCard = () => {
    if (!selectedPoint) return null;
    
    return (
      <Animated.View 
        style={[
          styles.pointDetailCard,
          {
            backgroundColor: theme.card,
            borderColor: theme.border,
            shadowColor: theme.text,
            transform: [
              { 
                translateY: rippleAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [20, 0, 0]
                })
              }
            ],
            opacity: rippleAnim.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [0, 1, 1]
            })
          }
        ]}
      >
        <View style={styles.pointDetailHeader}>
          <Text style={[styles.pointDetailTitle, { color: theme.text }]}>
            {selectedPoint.projectTitle}
          </Text>
          <View 
            style={[
              styles.pointDetailProgress, 
              { backgroundColor: goalColor }
            ]}
          >
            <Text style={styles.pointDetailProgressText}>
              {selectedPoint.progress}%
            </Text>
          </View>
        </View>
        
        <Text style={[styles.pointDetailDate, { color: theme.textSecondary }]}>
          {selectedPoint.formattedDate}
        </Text>
        
        {selectedPoint.isCreationPoint ? (
          <Text style={[styles.pointDetailDescription, { color: theme.textSecondary }]}>
            This marks the beginning of your goal journey.
          </Text>
        ) : (
          <View>
            <Text style={[styles.pointDetailDescription, { color: theme.textSecondary }]}>
              Project completed successfully! 
            </Text>
            <Text style={[styles.pointDetailDescription, { color: theme.textSecondary, marginTop: 4 }]}>
              Progress: {selectedPoint.completedProjects} of {selectedPoint.totalProjects} projects completed ({selectedPoint.progress}%)
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={[
            styles.pointDetailCloseBtn,
            { backgroundColor: `${theme.border}50` }
          ]}
          onPress={() => setSelectedPoint(null)}
        >
          <Ionicons name="close" size={16} color={theme.text} />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.headerContainer,
          { 
            height: headerHeight,
            backgroundColor: isFullscreen ? 'transparent' : theme.card 
          }
        ]}
      >
        {/* Navigation header */}
        <View style={styles.navHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Goal Progress
          </Text>
          
          <TouchableOpacity 
            style={[
              styles.fullscreenButton,
              { backgroundColor: `${theme.border}30` }
            ]}
            onPress={toggleFullscreen}
          >
            <Ionicons 
              name={isFullscreen ? "contract" : "expand"} 
              size={22} 
              color={theme.text} 
            />
          </TouchableOpacity>
        </View>
        
        {/* Goal info - visible only when not in fullscreen */}
        {!isFullscreen && (
          <View style={styles.goalInfoContainer}>
            <View 
              style={[
                styles.goalIconContainer, 
                { backgroundColor: `${goalColor}20` }
              ]}
            >
              <Ionicons name="trending-up" size={28} color={goalColor} />
            </View>
            
            <View style={styles.goalTextContainer}>
              <Text 
                style={[styles.goalTitle, { color: theme.text }]}
                numberOfLines={1}
              >
                {goalTitle}
              </Text>
              
              {goalCreatedDate && (
                <Text 
                  style={[styles.goalCreatedText, { color: theme.textSecondary }]}
                  numberOfLines={1}
                >
                  Created {formatDate(goalCreatedDate)}
                </Text>
              )}
            </View>
            
            {getGoalDuration() !== null && (
              <View 
                style={[
                  styles.durationBadge,
                  { backgroundColor: `${goalColor}15` }
                ]}
              >
                <Ionicons name="time-outline" size={14} color={goalColor} />
                <Text style={[styles.durationText, { color: goalColor }]}>
                  {getGoalDuration()} days
                </Text>
              </View>
            )}
          </View>
        )}
        
        {/* Tab switcher - visible only when not in fullscreen */}
        {!isFullscreen && (
          <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === 'chart' && [
                  styles.activeTab,
                  { borderBottomColor: goalColor }
                ]
              ]}
              onPress={() => switchTab('chart')}
            >
              <Ionicons 
                name="analytics" 
                size={18} 
                color={activeTab === 'chart' ? goalColor : theme.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabText,
                  { 
                    color: activeTab === 'chart' 
                      ? goalColor 
                      : theme.textSecondary 
                  }
                ]}
              >
                Chart
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.tab,
                activeTab === 'timeline' && [
                  styles.activeTab,
                  { borderBottomColor: goalColor }
                ]
              ]}
              onPress={() => switchTab('timeline')}
            >
              <Ionicons 
                name="list" 
                size={18} 
                color={activeTab === 'timeline' ? goalColor : theme.textSecondary} 
              />
              <Text 
                style={[
                  styles.tabText,
                  { 
                    color: activeTab === 'timeline' 
                      ? goalColor 
                      : theme.textSecondary 
                  }
                ]}
              >
                Timeline
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
      
      {/* Main content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={[
          styles.scrollContent,
          isFullscreen && styles.fullscreenScrollContent
        ]}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={goalColor} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading your progress data...
            </Text>
          </View>
        ) : error ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.card }]}>
            <Ionicons name="analytics-outline" size={60} color={theme.textSecondary} />
            <Text style={[styles.errorText, { color: theme.text }]}>
              {error}
            </Text>
            <Text style={[styles.errorSubText, { color: theme.textSecondary }]}>
              Complete projects to see your progress over time.
            </Text>
          </View>
        ) : (
          <>
            {/* Chart View (animated) */}
            <Animated.View 
              style={[
                styles.chartContainer, 
                { 
                  backgroundColor: theme.card,
                  opacity: chartOpacity,
                  display: activeTab === 'chart' ? 'flex' : 'none',
                  ...(isFullscreen && {
                    flex: 1,
                    justifyContent: 'center',
                    paddingVertical: 60,
                    borderRadius: 0,
                    marginHorizontal: 0,
                  })
                }
              ]}
            >
              {!isFullscreen && (
                <View style={styles.chartHeaderContainer}>
                  <Text style={[styles.chartTitle, { color: theme.text }]}>
                    Progress Timeline
                  </Text>
                  
                  <View style={styles.chartLegend}>
                    <View style={styles.legendItem}>
                      <View 
                        style={[
                          styles.legendMarker, 
                          { backgroundColor: goalColor }
                        ]} 
                      />
                      <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                        Progress
                      </Text>
                    </View>
                    
                    <View style={styles.legendItem}>
                      <View 
                        style={[
                          styles.legendMarker, 
                          { 
                            backgroundColor: 'transparent',
                            borderColor: theme.textSecondary,
                            borderWidth: 2
                          }
                        ]} 
                      />
                      <Text style={[styles.legendText, { color: theme.textSecondary }]}>
                        Start Point
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              
              {renderProgressChart()}
              
              {!isFullscreen && !selectedPoint && (
                <View style={[styles.infoBox, { backgroundColor: `${goalColor}10` }]}>
                  <Ionicons name="information-circle-outline" size={20} color={goalColor} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    Tap on data points to see milestone details
                  </Text>
                </View>
              )}
              
              {renderPointDetailCard()}
            </Animated.View>
            
            {/* Timeline View (animated) */}
            <Animated.View 
              style={[
                styles.timelineContainer,
                {
                  backgroundColor: theme.card,
                  opacity: listOpacity,
                  display: activeTab === 'timeline' ? 'flex' : 'none'
                }
              ]}
            >
              <Text style={[styles.timelineTitle, { color: theme.text }]}>
                Progress Timeline
              </Text>
              
              <View style={styles.timeline}>
                {progressData.map((item, index) => (
                  <TouchableOpacity 
                    key={`timeline-${index}`}
                    style={[
                      styles.timelineItem,
                      { 
                        borderLeftColor: goalColor,
                        backgroundColor: selectedPoint === item 
                          ? `${goalColor}15` 
                          : 'transparent',
                      }
                    ]}
                    onPress={() => handlePointSelection(item)}
                    activeOpacity={0.7}
                  >
                    <View 
                      style={[
                        styles.timelineDot,
                        { 
                          backgroundColor: item.isCreationPoint 
                            ? theme.textSecondary 
                            : goalColor 
                        }
                      ]}
                    />
                    
                    <View style={styles.timelineContent}>
                      <Text style={[styles.timelineItemTitle, { color: theme.text }]}>
                        {item.projectTitle}
                      </Text>
                      
                      <Text style={[styles.timelineItemDate, { color: theme.textSecondary }]}>
                        {item.formattedDate}
                      </Text>
                      
                      <View style={styles.timelineItemFooter}>
                        <View 
                          style={[
                            styles.progressBadge,
                            {
                              backgroundColor: item.isCreationPoint 
                                ? theme.textSecondary 
                                : goalColor
                            }
                          ]}
                        >
                          <Text style={styles.progressValue}>
                            {item.progress}%
                          </Text>
                        </View>
                        
                        {item.completedProjects !== undefined && item.totalProjects !== undefined && (
                          <Text style={[styles.progressDetails, { color: theme.textSecondary }]}>
                            {item.completedProjects}/{item.totalProjects} projects
                          </Text>
                        )}
                        
                        {index < progressData.length - 1 && (
                          <Text style={[styles.progressGain, { color: theme.textSecondary }]}>
                            +{progressData[index + 1].progress - item.progress}%
                          </Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
      
      {/* Fullscreen close button - only in fullscreen mode */}
      {isFullscreen && (
        <TouchableOpacity 
          style={[
            styles.fullscreenCloseButton, 
            { 
              backgroundColor: theme.card,
              shadowColor: theme.text
            }
          ]}
          onPress={toggleFullscreen}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    overflow: 'hidden',
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fullscreenButton: {
    padding: 8,
    borderRadius: 20,
  },
  goalInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  goalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  goalCreatedText: {
    fontSize: 14,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    marginLeft: 8,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  fullscreenScrollContent: {
    padding: 0,
    paddingTop: 16,
    paddingBottom: 0,
    flexGrow: 1,
  },
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  errorContainer: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  chartContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden', // Ensure content doesn't overflow
  },
  chartHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartLegend: {
    flexDirection: 'row',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  legendMarker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  chartWrapper: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  yAxisLabels: {
    width: 35,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  axisLabel: {
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  chartBackground: {
    position: 'absolute',
  },
  chartGradient: {
    position: 'absolute',
    width: '100%',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
  },
  progressArea: {
    position: 'absolute',
    height: '100%',
  },
  progressAreaFill: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  progressAreaSegment: {
    position: 'absolute',
    top: 0,
  },
  progressLinePath: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  progressLineSegment: {
    position: 'absolute',
    height: 3,
    transformOrigin: 'left',
    borderRadius: 1.5,
    zIndex: 5,
  },
  ripple: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    marginTop: -10,
  },
  dataPointTouchable: {
    position: 'absolute',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  dataPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    zIndex: 15,
  },
  pointDetailCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pointDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  pointDetailProgress: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  pointDetailProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  pointDetailDate: {
    fontSize: 13,
    marginBottom: 10,
  },
  pointDetailDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  pointDetailCloseBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  xAxisLabels: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    height: 40,
  },
  dateLabelsContainer: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  dateLabelBackground: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  dateLabel: {
    textAlign: 'center',
    width: 60,
    marginLeft: -30,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    marginLeft: 8,
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  timelineContainer: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeline: {
    marginLeft: 8,
  },
  timelineItem: {
    position: 'relative',
    paddingVertical: 14,
    paddingLeft: 30,
    paddingRight: 16,
    borderLeftWidth: 2,
    marginBottom: 4,
    borderRadius: 8,
  },
  timelineDot: {
    position: 'absolute',
    left: -8,
    top: 16,
    width: 14,
    height: 14,
    borderRadius: 7,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineItemDate: {
    fontSize: 13,
    marginBottom: 8,
  },
  timelineItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  progressBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
    marginRight: 8,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressDetails: {
    fontSize: 12,
    marginRight: 8,
  },
  progressGain: {
    fontSize: 12,
  },
});

export default GoalProgressScreen;
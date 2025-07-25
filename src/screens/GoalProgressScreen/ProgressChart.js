// src/screens/GoalProgressScreen/ProgressChart.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProgressChart = ({ 
  theme,
  goalColor,
  progressData,
  isFullscreen,
  progressAnimation,
  selectedPoint,
  rippleAnim,
  selectedPointCoords,
  handlePointSelection,
  getSecondaryColor
}) => {
  if (progressData.length === 0) return null;
  
  // Adjust chart dimensions
  const chartPadding = 30;
  const { width } = Dimensions.get('window');
  const { height } = Dimensions.get('window');
  
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

const styles = StyleSheet.create({
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
});

export default ProgressChart;
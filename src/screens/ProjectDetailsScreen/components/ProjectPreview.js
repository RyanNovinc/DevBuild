// src/screens/ProjectDetailsScreen/components/ProjectPreview.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTextColorForBackground } from '../../GoalDetailsScreen/utils/colorUtils';

const ProjectPreview = ({ 
  scrollY, 
  title, 
  color, 
  calculateProgress, 
  theme,
  isCreating,
  getGoalName,
  goalColor,
  hasGoal,
  taskCount
}) => {
  // Calculate progress for display
  const progress = calculateProgress();
  const displayTitle = title.trim() || 'Give your project a title';
  
  // Animation for progress bar
  const progressWidth = scrollY.interpolate({
    inputRange: [-50, 0, 50],
    outputRange: [progress + 5, progress, progress - 5 > 0 ? progress - 5 : 0],
    extrapolate: 'clamp'
  });
  
  // Get appropriate text color based on background
  const getIconColor = (bgColor) => {
    if (bgColor === '#FFFFFF') return '#000000';
    return getTextColorForBackground(bgColor);
  };

  return (
    <View style={styles.previewSection}>
      <Animated.View 
        style={[
          styles.projectPreview, 
          { 
            backgroundColor: theme.backgroundSecondary || '#1A1A1A',
            borderColor: theme.border || '#333333',
            transform: [{
              scale: scrollY.interpolate({
                inputRange: [-100, 0, 100],
                outputRange: [1.05, 1, 0.98],
                extrapolate: 'clamp'
              })
            }]
          }
        ]}
      >
        {/* Project Icon and Title */}
        <View style={styles.projectHeader}>
          <View style={[
            styles.iconPreview, 
            { 
              backgroundColor: color,
              // Add white border for black colors and black border for white colors
              borderWidth: color === '#000000' || color === '#FFFFFF' ? 2 : 0,
              borderColor: color === '#000000' ? 'rgba(255,255,255,0.5)' : 
                          color === '#FFFFFF' ? 'rgba(0,0,0,0.2)' : 'transparent'
            }
          ]}>
            <Ionicons 
              name="folder-open" 
              size={34} 
              color={getIconColor(color)} 
            />
          </View>
          
          <Text style={[styles.previewTitle, { color: theme.text || '#FFFFFF' }]}>
            {displayTitle}
          </Text>
          
          {/* Goal Association Badge (if any) */}
          {hasGoal && (
            <View style={styles.goalBadgeContainer}>
              <View style={[
                styles.goalColorDot,
                { backgroundColor: goalColor || color }
              ]} />
              <Text style={[styles.goalBadgeText, { color: theme.textSecondary }]}>
                Goal: {getGoalName()}
              </Text>
            </View>
          )}
        </View>
        
        {/* Project Status */}
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={16} color={color} />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {progress}% Complete
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons name="list" size={16} color={color} />
            <Text style={[styles.statusText, { color: theme.textSecondary }]}>
              {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
            </Text>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressPreview}>
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundTertiary || '#333333' }]}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progressWidth}%`,
                  backgroundColor: color
                }
              ]} 
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  previewSection: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  projectPreview: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  projectHeader: {
    alignItems: 'center',
  },
  iconPreview: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  goalBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15,
  },
  goalColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  goalBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    width: '100%',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginLeft: 6,
  },
  progressPreview: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
});

export default ProjectPreview;
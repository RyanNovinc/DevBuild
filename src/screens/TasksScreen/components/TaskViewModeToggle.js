// src/screens/TasksScreen/components/TaskViewModeToggle.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { scaleWidth, fontSizes, spacing } from '../../../utils/responsive';

const TaskViewModeToggle = ({ 
  viewMode, 
  setViewMode, 
  theme, 
  isDarkMode 
}) => {
  // Define consistent colors that won't change
  const ACTIVE_COLOR = theme.primary || '#FFA500';
  
  // Local state for active colors to ensure they don't change
  const projectBgColor = useRef(new Animated.Value(viewMode === 'projects' ? 1 : 0)).current;
  const taskBgColor = useRef(new Animated.Value(viewMode === 'tasks' ? 1 : 0)).current;
  
  // Update animation when view mode changes
  useEffect(() => {
    if (viewMode === 'projects') {
      Animated.timing(projectBgColor, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
      Animated.timing(taskBgColor, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(projectBgColor, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      Animated.timing(taskBgColor, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [viewMode]);

  // Interpolate background colors
  const projectBackgroundColor = projectBgColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', ACTIVE_COLOR]
  });
  
  const taskBackgroundColor = taskBgColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', ACTIVE_COLOR]
  });

  // Function to get text/icon color based on active tab
  const getTextColor = (tabName) => {
    return viewMode === tabName 
      ? (isDarkMode ? '#000000' : '#FFFFFF') // Text on active tab
      : theme.textSecondary; // Text on inactive tab
  };

  return (
    <View style={[styles.viewToggleContainer, { 
      backgroundColor: theme.cardElevated,
      marginTop: spacing.xs,
      marginBottom: spacing.s
    }]}>
      <View style={styles.viewToggle}>
        {/* Projects Tab */}
        <Animated.View
          style={[
            styles.viewToggleButton,
            { 
              backgroundColor: projectBackgroundColor,
              borderTopLeftRadius: 20,
              borderBottomLeftRadius: 20,
            }
          ]}
        >
          <TouchableOpacity
            style={{ 
              flex: 1, 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%' 
            }}
            onPress={() => setViewMode('projects')}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Project view"
            accessibilityState={{ selected: viewMode === 'projects' }}
            accessibilityHint="Shows projects grouped by goals"
          >
            <Ionicons
              name="folder"
              size={scaleWidth(18)}
              color={getTextColor('projects')}
            />
            <Text
              style={[
                styles.viewToggleText,
                { 
                  color: getTextColor('projects'),
                  fontSize: fontSizes.s,
                  marginLeft: spacing.xs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Projects
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Tasks Tab */}
        <Animated.View
          style={[
            styles.viewToggleButton,
            { 
              backgroundColor: taskBackgroundColor,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
            }
          ]}
        >
          <TouchableOpacity
            style={{
              flex: 1, 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
            onPress={() => setViewMode('tasks')}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Task view"
            accessibilityState={{ selected: viewMode === 'tasks' }}
            accessibilityHint="Shows tasks grouped by goals"
          >
            <Ionicons
              name="checkbox"
              size={scaleWidth(18)}
              color={getTextColor('tasks')}
            />
            <Text
              style={[
                styles.viewToggleText,
                { 
                  color: getTextColor('tasks'),
                  fontSize: fontSizes.s,
                  marginLeft: spacing.xs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Tasks
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default TaskViewModeToggle;
// src/screens/TasksScreen/components/SectionHeader.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';
import { scaleWidth, fontSizes, spacing } from '../../../utils/responsive';

// Import constants for free plan limits
import { FREE_PLAN_LIMITS } from '../../../services/SubscriptionService';

const SectionHeader = ({ 
  section, 
  theme, 
  toggleSection, 
  navigation,
  isSectionCollapsed,
  isPro, // Add this prop to determine display format
  viewMode = 'projects', // Default to projects view
  onLimitReached // Rename to make the purpose clearer
}) => {
  // Animation values - keep separate values for native and JS animations
  const rotateAnim = useRef(new Animated.Value(isSectionCollapsed ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Update animation when collapse state changes
  useEffect(() => {
    // Just use single animation for chevron rotation - native driver
    Animated.timing(rotateAnim, {
      toValue: isSectionCollapsed ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.bezier(0.175, 0.885, 0.32, 1.275) // Custom easing for a "spring-like" feel
    }).start();
  }, [isSectionCollapsed]);

  // Create interpolated rotation value for the chevron
  const rotateInterpolation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  // Handle toggling section with animations
  const handleToggleSection = () => {
    // Create pulse animation on section header when clicked
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 150,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic)
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.back())
      })
    ]).start();
    
    // Toggle the section
    toggleSection(section.id);
  };

  // Count the items for display
  const getItemCount = () => {
    // In tasks view, if projectCount is provided, use that instead
    if (viewMode === 'tasks' && section.projectCount !== undefined) {
      return section.projectCount;
    }
    
    return section.data.length;
  };

  // Get the limit message based on view mode
  const getLimitMessage = () => {
    const projectLimit = FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2;
    const taskLimit = FREE_PLAN_LIMITS?.MAX_TASKS_PER_PROJECT || 5;
    
    if (viewMode === 'projects') {
      return `Free version limited to ${projectLimit} projects per goal. Upgrade to Pro for unlimited projects.`;
    } else {
      return `Free version limited to ${projectLimit} projects per goal. Upgrade to Pro for unlimited projects.`;
    }
  };

  // Get the appropriate limit based on view mode
  const getItemLimit = () => {
    // For tasks view, we want to show the project limit per goal (2)
    if (viewMode === 'tasks') {
      return section.projectLimit || FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2;
    } else {
      // For projects view, use the normal project limit per goal (2)
      return FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2;
    }
  };

  // Handle create project/task button
  const handleCreateButtonPress = () => {
    // Get the appropriate limits with fallbacks
    const projectLimit = FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2;
    const taskLimit = FREE_PLAN_LIMITS?.MAX_TASKS_PER_PROJECT || 5;
    
    // Check if free user has reached the limit
    if (!isPro && ((viewMode === 'projects' && section.data.length >= projectLimit) || 
                   (viewMode === 'tasks' && section.projectCount >= projectLimit))) {
      // Show limit banner instead of navigating
      if (typeof onLimitReached === 'function') {
        onLimitReached(getLimitMessage());
      }
      return;
    }
    
    // If not at limit or Pro user, navigate to project creation screen
    navigation.navigate('ProjectDetails', { 
      mode: 'create',
      preselectedGoalId: section.id
    });
  };

  // Use a static background color based on the expanded state
  const backgroundColor = isSectionCollapsed 
    ? 'transparent' 
    : section.color ? `${section.color}15` : theme.background;

  // Determine if we should show the create button
  // Only show in projects view, not in tasks view
  const shouldShowCreateButton = viewMode === 'projects' && !isSectionCollapsed;

  return (
    <View>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          backgroundColor: backgroundColor,
          borderRadius: 10,
          marginVertical: 4,
          shadowColor: section.color,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isSectionCollapsed ? 0 : 0.2,
          shadowRadius: 2,
          elevation: isSectionCollapsed ? 0 : 1,
        }}
      >
        <TouchableOpacity 
          style={[styles.sectionHeader]}
          onPress={handleToggleSection}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`${section.title} section, ${isSectionCollapsed ? 'collapsed' : 'expanded'}`}
          accessibilityHint={`${isSectionCollapsed ? 'Expand' : 'Collapse'} the ${section.title} section`}
        >
          <View style={styles.sectionTitleContainer}>
            <Animated.View
              style={{
                // Add subtle bounce to the icon when expanding/collapsing
                transform: [
                  { scale: rotateAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.15, 1]
                  })}
                ]
              }}
            >
              <Ionicons 
                name={section.icon || 'star'} 
                size={scaleWidth(20)} 
                color={section.color}
              />
            </Animated.View>
            
            <Text 
              style={[
                styles.sectionTitle, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.m
                }
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
              maxFontSizeMultiplier={1.3}
            >
              {section.title}
            </Text>
            
            <View style={[
              styles.projectCountBadge, 
              { backgroundColor: `${section.color}30` }
            ]}>
              <Text 
                style={[
                  styles.projectCountText, 
                  { 
                    color: section.color,
                    fontSize: fontSizes.xs
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {isPro 
                  ? getItemCount() 
                  : `${getItemCount()}/${getItemLimit()}`}
              </Text>
            </View>
          </View>
          
          <View style={styles.sectionHeaderRight}>
            <Text 
              style={[
                styles.sectionProgress, 
                { 
                  color: section.color,
                  fontSize: fontSizes.m 
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {section.progress || 0}%
            </Text>
            
            {/* Animated chevron icon */}
            <Animated.View
              style={{
                marginLeft: spacing.xs,
                transform: [{ rotate: rotateInterpolation }]
              }}
              accessibilityElementsHidden={true}
              importantForAccessibility="no"
            >
              <Ionicons 
                name="chevron-down" 
                size={scaleWidth(20)} 
                color={section.color}
              />
            </Animated.View>
          </View>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Create Button - shown only when expanded and in projects view */}
      {shouldShowCreateButton && (
        <TouchableOpacity 
          style={[
            styles.createProjectForGoalButton, 
            { 
              backgroundColor: `${section.color}15`, 
              borderColor: section.color,
              marginTop: spacing.xs
            }
          ]}
          onPress={handleCreateButtonPress} 
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Create project for this goal"
          accessibilityHint="Navigates to project creation screen"
        >
          <Ionicons 
            name="add" 
            size={scaleWidth(16)} 
            color={section.color} 
          />
          <Text 
            style={[
              styles.createProjectForGoalText, 
              { 
                color: section.color,
                fontSize: fontSizes.s,
                marginLeft: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Create Project for this Goal
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SectionHeader;
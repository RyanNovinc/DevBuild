// src/screens/TasksScreen/components/GoalFilters.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const GoalFilters = ({ selectedGoalId, onGoalSelect, goalsToShow, theme, viewMode = 'projects' }) => {
  // Reference for the ScrollView
  const scrollViewRef = useRef(null);
  
  // Single animated scale value for the selected goal
  const selectedScale = useRef(new Animated.Value(1.05)).current;
  
  // Auto-scroll to selected filter
  useEffect(() => {
    if (scrollViewRef.current && selectedGoalId) {
      // Delay slightly to let the UI render
      setTimeout(() => {
        scrollViewRef.current.scrollTo({ 
          x: selectedGoalId === 'all' ? 0 : selectedGoalId.charCodeAt(0) * 20,
          animated: true 
        });
      }, 100);
    }
  }, [selectedGoalId]);

  // Handle goal selection 
  const handleGoalSelect = (goalId) => {
    // Don't do anything if it's already selected
    if (goalId === selectedGoalId) return;
    
    // Notify parent component
    if (onGoalSelect) {
      onGoalSelect(goalId);
    }
  };

  // Render goal filter button
  const renderGoalFilterButton = (goal) => {
    if (!goal || !goal.id) return null; // Skip invalid goals
    // Skip completed goals
    if (goal.completed) return null;
    
    // Determine if this goal is selected
    const isSelected = selectedGoalId === goal.id;
    
    return (
      <View 
        key={goal.id}
        style={{
          shadowColor: goal.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.3 : 0,
          shadowRadius: 3,
          elevation: isSelected ? 2 : 0,
          marginRight: 8,
          transform: [{ scale: isSelected ? 1.05 : 1 }]
        }}
      >
        <TouchableOpacity 
          style={[
            styles.goalFilterButton,
            isSelected && { 
              backgroundColor: `${goal.color}20`, 
              borderColor: goal.color,
              borderWidth: isSelected ? 1.5 : 1
            },
            { borderColor: theme.border }
          ]}
          onPress={() => handleGoalSelect(goal.id)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={goal.icon || 'star'} 
            size={16} 
            color={isSelected ? goal.color : theme.textSecondary} 
          />
          <Text 
            style={[
              styles.goalFilterText,
              { color: isSelected ? goal.color : theme.textSecondary }
            ]}
          >
            {goal.title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const isAllSelected = selectedGoalId === 'all';

  // Determine the label text based on the current view mode
  const allItemsLabel = viewMode === 'projects' ? 'All Projects' : 'All Tasks';

  return (
    <View style={styles.goalFiltersContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.goalFiltersContent}
        ref={scrollViewRef}
        decelerationRate="fast"
      >
        {/* All Projects/Tasks Filter Button */}
        <View
          style={{
            shadowColor: theme.primary,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isAllSelected ? 0.3 : 0,
            shadowRadius: 3,
            elevation: isAllSelected ? 2 : 0,
            marginRight: 8,
            transform: [{ scale: isAllSelected ? 1.05 : 1 }]
          }}
        >
          <TouchableOpacity 
            key="all"
            style={[
              styles.goalFilterButton,
              isAllSelected && { 
                backgroundColor: `${theme.primary}20`, 
                borderColor: theme.primary,
                borderWidth: isAllSelected ? 1.5 : 1
              },
              { borderColor: theme.border }
            ]}
            onPress={() => handleGoalSelect('all')}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${allItemsLabel}, filter`}
            accessibilityHint={`Shows all ${viewMode}`}
          >
            <Ionicons 
              name="apps" 
              size={16} 
              color={isAllSelected ? theme.primary : theme.textSecondary} 
            />
            <Text 
              style={[
                styles.goalFilterText,
                { color: isAllSelected ? theme.primary : theme.textSecondary }
              ]}
            >
              {allItemsLabel}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Map through goals with key prop */}
        {Array.isArray(goalsToShow) && goalsToShow.map((goal, index) => {
          // Skip goals with duplicate IDs (only show the first occurrence)
          const isDuplicate = goalsToShow.findIndex(g => g.id === goal.id) !== index;
          if (isDuplicate) {
            console.warn(`Duplicate goal ID detected: ${goal.id}. Skipping render.`);
            return null;
          }
          
          return renderGoalFilterButton(goal);
        })}
      </ScrollView>
    </View>
  );
};

export default GoalFilters;
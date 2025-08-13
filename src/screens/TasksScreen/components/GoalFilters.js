// src/screens/TasksScreen/components/GoalFilters.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const GoalFilters = ({ 
  selectedGoalId, 
  onGoalSelect, 
  goalsToShow, 
  theme, 
  viewMode = 'projects', 
  onViewModeChange,
  // New props for milestone filtering
  selectedMilestoneId,
  onMilestoneSelect,
  milestonesForGoal = []
}) => {
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
      {/* Projects/Tasks Toggle Button */}
      {onViewModeChange && (
        <View style={{
          paddingHorizontal: 16,
          paddingBottom: 8,
          alignItems: 'center',
        }}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              backgroundColor: theme.cardElevated || '#1F1F1F',
              borderRadius: 20,
              padding: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
            onPress={onViewModeChange}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Currently viewing ${viewMode}`}
            accessibilityHint={`Switch to ${viewMode === 'projects' ? 'tasks' : 'projects'} view`}
          >
            {/* Projects Button */}
            <View style={{
              backgroundColor: viewMode === 'projects' ? theme.primary : 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons 
                name="folder-outline" 
                size={16} 
                color={viewMode === 'projects' ? '#FFFFFF' : theme.textSecondary} 
              />
              <Text style={{
                color: viewMode === 'projects' ? '#FFFFFF' : theme.textSecondary,
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 6,
              }}>
                Projects
              </Text>
            </View>
            
            {/* Tasks Button */}
            <View style={{
              backgroundColor: viewMode === 'tasks' ? theme.primary : 'transparent',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons 
                name="list-outline" 
                size={16} 
                color={viewMode === 'tasks' ? '#FFFFFF' : theme.textSecondary} 
              />
              <Text style={{
                color: viewMode === 'tasks' ? '#FFFFFF' : theme.textSecondary,
                fontSize: 14,
                fontWeight: '600',
                marginLeft: 6,
              }}>
                Tasks
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
      
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
      
      {/* Milestone Filters - Show when a specific goal is selected */}
      {selectedGoalId && selectedGoalId !== 'all' && (
        <View style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: theme.border + '40', // Semi-transparent border
          backgroundColor: theme.card + '80', // More visible background
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.textSecondary,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Milestones
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {/* All Milestones Button */}
            <View style={{
              marginRight: 8,
              transform: [{ scale: !selectedMilestoneId ? 1.02 : 1 }]
            }}>
              <TouchableOpacity
                style={[
                  {
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: !selectedMilestoneId ? theme.primary + '20' : 'transparent',
                    borderWidth: 1,
                    borderColor: !selectedMilestoneId ? theme.primary : theme.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }
                ]}
                onPress={() => onMilestoneSelect && onMilestoneSelect(null)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Show all milestones"
                accessibilityHint="Shows tasks from all milestones in this goal"
              >
                <Ionicons 
                  name="apps" 
                  size={14} 
                  color={!selectedMilestoneId ? theme.primary : theme.textSecondary}
                  style={{ marginRight: 4 }}
                />
                <Text style={{
                  fontSize: 13,
                  fontWeight: '500',
                  color: !selectedMilestoneId ? theme.primary : theme.textSecondary,
                }}>
                  All
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Individual Milestone Buttons */}
            {Array.isArray(milestonesForGoal) && milestonesForGoal.length > 0 ? milestonesForGoal.map((milestone) => {
              const isMilestoneSelected = selectedMilestoneId === milestone.id;
              
              return (
                <View 
                  key={milestone.id}
                  style={{
                    marginRight: 8,
                    transform: [{ scale: isMilestoneSelected ? 1.02 : 1 }]
                  }}
                >
                  <TouchableOpacity
                    style={[
                      {
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 16,
                        backgroundColor: isMilestoneSelected ? milestone.color + '20' : 'transparent',
                        borderWidth: 1,
                        borderColor: isMilestoneSelected ? milestone.color : theme.border,
                        flexDirection: 'row',
                        alignItems: 'center',
                        maxWidth: 120, // Prevent overly long milestone names
                      }
                    ]}
                    onPress={() => onMilestoneSelect && onMilestoneSelect(milestone.id)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter by ${milestone.title} milestone`}
                    accessibilityHint={`Shows only tasks from the ${milestone.title} milestone`}
                  >
                    <Ionicons 
                      name="flag" 
                      size={12} 
                      color={isMilestoneSelected ? milestone.color : theme.textSecondary}
                      style={{ marginRight: 4 }}
                    />
                    <Text 
                      style={{
                        fontSize: 13,
                        fontWeight: '500',
                        color: isMilestoneSelected ? milestone.color : theme.textSecondary,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {milestone.title}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            }) : (
              <Text style={{
                color: theme.textSecondary,
                fontSize: 13,
                fontStyle: 'italic',
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}>
                No milestones in this goal
              </Text>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default GoalFilters;
// src/components/BulkCreate/TaskFormStep.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  fontSizes
} from '../../utils/responsive';

const TaskFormStep = ({ 
  initialData, 
  onComplete, 
  onBack, 
  theme, 
  appContext,
  createdGoals = [],
  createdMilestones = []
}) => {
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  
  // Initialize milestone/goal selection
  useEffect(() => {
    // Try to link to most recent created milestone first
    if (createdMilestones.length > 0) {
      const recentMilestone = createdMilestones[createdMilestones.length - 1];
      setSelectedMilestone(recentMilestone);
      
      // Also set the goal if milestone is linked to one
      if (recentMilestone.goalId && createdGoals.length > 0) {
        const linkedGoal = createdGoals.find(g => g.id === recentMilestone.goalId);
        if (linkedGoal) {
          setSelectedGoal(linkedGoal);
        }
      }
    } else if (initialData?.milestoneId && appContext?.milestones) {
      const existingMilestone = appContext.milestones.find(m => m.id === initialData.milestoneId);
      if (existingMilestone) {
        setSelectedMilestone(existingMilestone);
      }
    } else if (createdGoals.length > 0) {
      // No milestone, but link to recent goal
      setSelectedGoal(createdGoals[createdGoals.length - 1]);
    }
  }, [createdMilestones, createdGoals, initialData, appContext?.milestones]);

  // Handle milestone selection
  const handleMilestoneSelect = (milestone) => {
    setSelectedMilestone(milestone);
    setIsStandalone(false);
    
    // Auto-select the goal if milestone is linked to one
    if (milestone.goalId) {
      const linkedGoal = [...createdGoals, ...(appContext?.goals || [])].find(g => g.id === milestone.goalId);
      if (linkedGoal) {
        setSelectedGoal(linkedGoal);
      }
    }
  };

  // Handle goal selection
  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    setSelectedMilestone(null);
    setIsStandalone(false);
  };

  // Handle standalone toggle
  const handleStandaloneToggle = () => {
    setIsStandalone(true);
    setSelectedMilestone(null);
    setSelectedGoal(null);
  };

  // Handle form completion
  const handleComplete = () => {
    if (!title.trim()) {
      return;
    }

    const taskData = {
      title: title.trim(),
      description: description.trim(),
      status: 'todo',
      completed: false,
      goalId: selectedGoal?.id || null,
      goalTitle: selectedGoal?.title || null,
      milestoneId: selectedMilestone?.id || null,
      milestoneTitle: selectedMilestone?.title || null
    };

    onComplete(taskData);
  };

  // Check if form is valid
  const isValid = title.trim().length > 0;

  // Combine created items with existing ones
  const availableMilestones = [
    ...createdMilestones,
    ...(appContext?.milestones || [])
  ];
  
  const availableGoals = [
    ...createdGoals,
    ...(appContext?.goals || [])
  ];

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          Create Task
        </Text>
        <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Define a specific action item
        </Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Task Title *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border
              }
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter task title..."
            placeholderTextColor={theme.textSecondary}
            maxLength={100}
            autoFocus={true}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Description (Optional)
          </Text>
          <TextInput
            style={[
              styles.textInput,
              styles.multilineInput,
              { 
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe this task..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={2}
            maxLength={300}
          />
        </View>

        {/* Organization Options */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Organization
          </Text>
          
          {/* Current Selection Display */}
          {selectedMilestone ? (
            <View style={[
              styles.selectionContainer,
              { 
                backgroundColor: selectedMilestone.color + '20',
                borderColor: selectedMilestone.color
              }
            ]}>
              <View style={styles.selectionInfo}>
                <Ionicons name="flag" size={16} color={selectedMilestone.color} />
                <View style={styles.selectionText}>
                  <Text style={[styles.selectionTitle, { color: theme.text }]}>
                    {selectedMilestone.title}
                  </Text>
                  <Text style={[styles.selectionSubtitle, { color: theme.textSecondary }]}>
                    Milestone
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedMilestone(null)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : selectedGoal ? (
            <View style={[
              styles.selectionContainer,
              { 
                backgroundColor: selectedGoal.color + '20',
                borderColor: selectedGoal.color
              }
            ]}>
              <View style={styles.selectionInfo}>
                <Ionicons name={selectedGoal.icon || 'target'} size={16} color={selectedGoal.color} />
                <View style={styles.selectionText}>
                  <Text style={[styles.selectionTitle, { color: theme.text }]}>
                    {selectedGoal.title}
                  </Text>
                  <Text style={[styles.selectionSubtitle, { color: theme.textSecondary }]}>
                    Goal
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedGoal(null)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : isStandalone ? (
            <View style={[
              styles.selectionContainer,
              { 
                backgroundColor: theme.card,
                borderColor: theme.border
              }
            ]}>
              <View style={styles.selectionInfo}>
                <Ionicons name="checkmark-circle" size={16} color={theme.textSecondary} />
                <View style={styles.selectionText}>
                  <Text style={[styles.selectionTitle, { color: theme.text }]}>
                    Standalone Task
                  </Text>
                  <Text style={[styles.selectionSubtitle, { color: theme.textSecondary }]}>
                    Not linked to any goal or milestone
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsStandalone(false)}
                style={styles.removeButton}
              >
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.organizationOptions}>
              {/* Milestone Options */}
              {availableMilestones.length > 0 && (
                <View style={styles.optionSection}>
                  <Text style={[styles.optionLabel, { color: theme.textSecondary }]}>
                    Link to Milestone
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.optionsContainer}
                  >
                    {availableMilestones.slice(0, 3).map((milestone) => (
                      <TouchableOpacity
                        key={milestone.id}
                        style={[
                          styles.optionButton,
                          { 
                            backgroundColor: milestone.color + '10',
                            borderColor: milestone.color
                          }
                        ]}
                        onPress={() => handleMilestoneSelect(milestone)}
                      >
                        <Ionicons name="flag" size={14} color={milestone.color} />
                        <Text style={[styles.optionText, { color: theme.text }]} numberOfLines={1}>
                          {milestone.title}
                        </Text>
                        {createdMilestones.includes(milestone) && (
                          <View style={[styles.newBadge, { backgroundColor: milestone.color }]}>
                            <Text style={styles.newBadgeText}>New</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Goal Options */}
              {availableGoals.length > 0 && (
                <View style={styles.optionSection}>
                  <Text style={[styles.optionLabel, { color: theme.textSecondary }]}>
                    Link to Goal
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.optionsContainer}
                  >
                    {availableGoals.slice(0, 3).map((goal) => (
                      <TouchableOpacity
                        key={goal.id}
                        style={[
                          styles.optionButton,
                          { 
                            backgroundColor: goal.color + '10',
                            borderColor: goal.color
                          }
                        ]}
                        onPress={() => handleGoalSelect(goal)}
                      >
                        <Ionicons name={goal.icon || 'target'} size={14} color={goal.color} />
                        <Text style={[styles.optionText, { color: theme.text }]} numberOfLines={1}>
                          {goal.title}
                        </Text>
                        {createdGoals.includes(goal) && (
                          <View style={[styles.newBadge, { backgroundColor: goal.color }]}>
                            <Text style={styles.newBadgeText}>New</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Standalone Option */}
              <TouchableOpacity
                style={[
                  styles.standaloneButton,
                  { 
                    backgroundColor: theme.card,
                    borderColor: theme.border
                  }
                ]}
                onPress={handleStandaloneToggle}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.standaloneText, { color: theme.textSecondary }]}>
                  Make this a standalone task
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {onBack && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.card }]}
            onPress={onBack}
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
            <Text style={[styles.backButtonText, { color: theme.text }]}>
              Back
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            { 
              backgroundColor: isValid ? (theme.primary || '#007AFF') : theme.border,
              opacity: isValid ? 1 : 0.6
            }
          ]}
          onPress={handleComplete}
          disabled={!isValid}
          accessible={true}
          accessibilityLabel={isValid ? "Continue to next step" : "Complete the required fields"}
          accessibilityRole="button"
        >
          <Text style={[styles.nextButtonText, { color: '#FFFFFF' }]}>
            Continue
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
  },
  stepHeader: {
    paddingBottom: spacing.l,
  },
  stepTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: fontSizes.m,
    lineHeight: fontSizes.m * 1.4,
  },
  form: {
    flex: 1,
  },
  inputSection: {
    marginBottom: spacing.l,
  },
  label: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: fontSizes.m,
    minHeight: scaleHeight(48),
  },
  multilineInput: {
    minHeight: scaleHeight(60),
    textAlignVertical: 'top',
  },
  selectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
  },
  selectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectionText: {
    marginLeft: spacing.s,
    flex: 1,
  },
  selectionTitle: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  selectionSubtitle: {
    fontSize: fontSizes.s,
    marginTop: 2,
  },
  removeButton: {
    padding: spacing.xs,
  },
  organizationOptions: {
    gap: spacing.m,
  },
  optionSection: {
    marginBottom: spacing.s,
  },
  optionLabel: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  optionsContainer: {
    paddingRight: spacing.m,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    borderRadius: scaleWidth(16),
    borderWidth: 1,
    marginRight: spacing.xs,
    maxWidth: scaleWidth(120),
  },
  optionText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginLeft: spacing.xxs,
    flex: 1,
  },
  newBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: spacing.xxs,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
  },
  standaloneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
  },
  standaloneText: {
    fontSize: fontSizes.m,
    marginLeft: spacing.s,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.l,
    gap: spacing.m,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(48),
    flex: 1,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(48),
    flex: 2,
  },
  nextButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
});

export default TaskFormStep;
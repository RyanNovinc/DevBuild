// src/components/BulkCreate/MilestoneFormStep.js
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

const MilestoneFormStep = ({ 
  initialData, 
  onComplete, 
  onBack, 
  theme, 
  appContext,
  createdGoals = []
}) => {
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedGoal, setSelectedGoal] = useState(null);
  
  // Initialize goal selection
  useEffect(() => {
    // Try to link to a created goal first, then existing goals, then initialData
    if (createdGoals.length > 0) {
      setSelectedGoal(createdGoals[createdGoals.length - 1]); // Link to most recent created goal
    } else if (initialData?.goalId && appContext?.goals) {
      const existingGoal = appContext.goals.find(g => g.id === initialData.goalId);
      if (existingGoal) {
        setSelectedGoal(existingGoal);
      }
    }
  }, [createdGoals, initialData, appContext?.goals]);

  // Handle goal selection
  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  // Handle form completion
  const handleComplete = () => {
    if (!title.trim()) {
      return;
    }

    const milestoneData = {
      title: title.trim(),
      description: description.trim(),
      goalId: selectedGoal?.id || null,
      goalTitle: selectedGoal?.title || null,
      domain: selectedGoal?.domain || 'Other',
      color: selectedGoal?.color || '#007AFF',
      tasks: initialData?.tasks || []
    };

    onComplete(milestoneData);
  };

  // Check if form is valid
  const isValid = title.trim().length > 0;

  // Combine created goals with existing goals for selection
  const availableGoals = [
    ...createdGoals,
    ...(appContext?.goals || [])
  ];

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          Create Milestone
        </Text>
        <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Define a significant project or achievement
        </Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Milestone Title *
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
            placeholder="Enter milestone title..."
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
            placeholder="Describe this milestone..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Goal Selection */}
        {availableGoals.length > 0 && (
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>
              Link to Goal (Optional)
            </Text>
            
            {/* Selected Goal Display */}
            {selectedGoal ? (
              <View style={[
                styles.selectedGoalContainer,
                { 
                  backgroundColor: selectedGoal.color + '20',
                  borderColor: selectedGoal.color
                }
              ]}>
                <View style={styles.goalInfo}>
                  <Ionicons 
                    name={selectedGoal.icon || 'flag'} 
                    size={20} 
                    color={selectedGoal.color} 
                  />
                  <Text style={[styles.goalTitle, { color: theme.text }]}>
                    {selectedGoal.title}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedGoal(null)}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.selectGoalButton,
                  { 
                    backgroundColor: theme.card,
                    borderColor: theme.border
                  }
                ]}
                onPress={() => {}} // Could open goal picker
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.textSecondary} />
                <Text style={[styles.selectGoalText, { color: theme.textSecondary }]}>
                  Select a goal to link to
                </Text>
              </TouchableOpacity>
            )}

            {/* Available Goals List (if no goal selected) */}
            {!selectedGoal && availableGoals.length > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.goalScroll}
                contentContainerStyle={styles.goalContainer}
              >
                {availableGoals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalOption,
                      { 
                        backgroundColor: goal.color + '10',
                        borderColor: goal.color
                      }
                    ]}
                    onPress={() => handleGoalSelect(goal)}
                  >
                    <Ionicons 
                      name={goal.icon || 'flag'} 
                      size={16} 
                      color={goal.color} 
                    />
                    <Text 
                      style={[styles.goalOptionText, { color: theme.text }]}
                      numberOfLines={1}
                    >
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
            )}
          </View>
        )}
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
    minHeight: scaleHeight(80),
    textAlignVertical: 'top',
  },
  selectedGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
  },
  goalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalTitle: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginLeft: spacing.s,
    flex: 1,
  },
  removeButton: {
    padding: spacing.xs,
  },
  selectGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
  },
  selectGoalText: {
    fontSize: fontSizes.m,
    marginLeft: spacing.s,
  },
  goalScroll: {
    marginTop: spacing.s,
  },
  goalContainer: {
    paddingRight: spacing.m,
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(20),
    borderWidth: 1,
    marginRight: spacing.s,
    maxWidth: scaleWidth(140),
  },
  goalOptionText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginLeft: spacing.xs,
    flex: 1,
  },
  newBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: scaleWidth(8),
    marginLeft: spacing.xs,
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
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

export default MilestoneFormStep;
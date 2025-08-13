// src/screens/MilestoneDetailsScreen.js - Simple, minimalistic milestone details screen
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import contexts
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useNotification } from '../context/NotificationContext';

// Import utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  accessibility
} from '../utils/responsive';

const MilestoneDetailsScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { showSuccess, showError } = useNotification();
  
  // Get app context
  const { 
    projects, 
    goals, 
    addProject, 
    updateProject, 
    deleteProject 
  } = useAppContext();

  // Extract parameters from route
  const { 
    mode = 'create', 
    projectId = null, 
    project: initialProject = null,
    goalId = null 
  } = route.params || {};
  
  const isCreating = mode === 'create';
  const isMounted = useRef(true);

  // Milestone state
  const [milestoneState, setMilestoneState] = useState({
    title: '',
    description: '',
    color: '#FFFFFF', // Default black and white theme
    goalId: goalId || null
  });

  // UI state
  const [uiState, setUiState] = useState({
    isLoading: false,
    hasUnsavedChanges: false,
    saveAttempted: false
  });
  
  // Goal picker state
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  // Animation values
  const saveButtonScale = useRef(new Animated.Value(1)).current;

  // Initialize milestone data if editing
  useEffect(() => {
    if (!isCreating && initialProject) {
      setMilestoneState({
        title: initialProject.title || '',
        description: initialProject.description || '',
        color: initialProject.color || '#FFFFFF',
        goalId: initialProject.goalId || null
      });
    }
  }, [isCreating, initialProject]);

  // Determine milestone color based on parent goal
  useEffect(() => {
    if (milestoneState.goalId) {
      const parentGoal = goals.find(g => g.id === milestoneState.goalId);
      if (parentGoal && parentGoal.color) {
        setMilestoneState(prev => ({
          ...prev,
          color: parentGoal.color
        }));
      }
    } else {
      // Standalone milestone - use default white
      setMilestoneState(prev => ({
        ...prev,
        color: '#FFFFFF'
      }));
    }
  }, [milestoneState.goalId, goals]);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = milestoneState.title.trim() !== (initialProject?.title || '') ||
                      milestoneState.description.trim() !== (initialProject?.description || '');
    
    setUiState(prev => ({
      ...prev,
      hasUnsavedChanges: hasChanges
    }));
  }, [milestoneState, initialProject]);

  // Handle back press with unsaved changes
  const handleBackPress = () => {
    if (uiState.hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Handle save milestone
  const handleSave = async () => {
    if (!milestoneState.title.trim()) {
      showError('Please enter a milestone title');
      return;
    }

    setUiState(prev => ({ ...prev, isLoading: true, saveAttempted: true }));

    // Animate save button
    Animated.sequence([
      Animated.timing(saveButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(saveButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    try {
      const milestoneData = {
        title: milestoneState.title.trim(),
        description: milestoneState.description.trim(),
        color: milestoneState.color,
        goalId: milestoneState.goalId,
        status: 'active',
        completed: false,
        progress: 0,
        isMilestone: true, // Flag to identify this as a milestone
        icon: 'diamond', // Ensure diamond icon is used
        createdAt: isCreating ? new Date().toISOString() : (initialProject?.createdAt || new Date().toISOString()),
        updatedAt: new Date().toISOString()
      };

      if (isCreating) {
        await addProject(milestoneData);
        showSuccess('Milestone created successfully');
      } else {
        await updateProject({ ...milestoneData, id: projectId });
        showSuccess('Milestone updated successfully');
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving milestone:', error);
      showError('Failed to save milestone');
    } finally {
      if (isMounted.current) {
        setUiState(prev => ({ ...prev, isLoading: false }));
      }
    }
  };

  // Handle delete milestone
  const handleDelete = () => {
    Alert.alert(
      'Delete Milestone',
      'Are you sure you want to delete this milestone? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProject(projectId);
              showSuccess('Milestone deleted successfully');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting milestone:', error);
              showError('Failed to delete milestone');
            }
          }
        }
      ]
    );
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Determine icon color based on milestone color
  const iconColor = milestoneState.color === '#FFFFFF' ? theme.text : milestoneState.color;

  // Loading overlay
  if (uiState.isLoading) {
    return (
      <View style={[styles.loadingOverlay, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="large" color={milestoneState.color} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            {isCreating ? 'Creating Milestone...' : 'Updating Milestone...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header with Back and Save buttons */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={scaleWidth(24)} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter} />
        
        <Animated.View style={{ transform: [{ scale: saveButtonScale }] }}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { 
                backgroundColor: milestoneState.color,
                opacity: !milestoneState.title.trim() ? 0.6 : 1.0
              }
            ]}
            onPress={handleSave}
            disabled={!milestoneState.title.trim()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Save milestone"
          >
            <Ionicons name="save-outline" size={scaleWidth(18)} color="#000000" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Milestone Icon and Preview */}
        <View style={[styles.previewSection, { backgroundColor: theme.card }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.text + '10' }]}>
            <Ionicons 
              name="diamond" 
              size={scaleWidth(32)} 
              color={iconColor} 
            />
          </View>
          <Text style={[styles.previewTitle, { color: theme.text }]}>
            {milestoneState.title || 'New Milestone'}
          </Text>
          <Text style={[styles.previewSubtitle, { color: theme.textSecondary }]}>
            {milestoneState.goalId 
              ? goals.find(g => g.id === milestoneState.goalId)?.title || 'Unknown Goal'
              : 'Standalone Milestone'
            }
          </Text>
        </View>

        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Title *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            value={milestoneState.title}
            onChangeText={(text) => setMilestoneState(prev => ({ ...prev, title: text }))}
            placeholder="Enter milestone title..."
            placeholderTextColor={theme.textSecondary}
            maxLength={100}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Description
          </Text>
          <TextInput
            style={[
              styles.textInput,
              styles.textArea,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                color: theme.text
              }
            ]}
            value={milestoneState.description}
            onChangeText={(text) => setMilestoneState(prev => ({ ...prev, description: text }))}
            placeholder="Add description..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        {/* Goal Assignment */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { color: theme.text }]}>
            Goal Assignment
          </Text>
          
          {/* Goal Selector Dropdown */}
          <TouchableOpacity
            style={[
              styles.goalSelector,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                borderWidth: 1
              }
            ]}
            onPress={() => setShowGoalPicker(!showGoalPicker)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Select goal"
          >
            <View style={styles.goalSelectorContent}>
              <Ionicons 
                name={milestoneState.goalId ? "flag" : "apps"} 
                size={scaleWidth(20)} 
                color={milestoneState.goalId ? (goals.find(g => g.id === milestoneState.goalId)?.color || theme.primary) : theme.textSecondary} 
              />
              <Text style={[styles.goalSelectorText, { color: theme.text, flex: 1 }]}>
                {milestoneState.goalId 
                  ? goals.find(g => g.id === milestoneState.goalId)?.title || 'Unknown Goal'
                  : 'Standalone Milestone'
                }
              </Text>
              <Ionicons 
                name={showGoalPicker ? "chevron-up" : "chevron-down"} 
                size={scaleWidth(18)} 
                color={theme.textSecondary} 
              />
            </View>
          </TouchableOpacity>
          
          {/* Goal Picker List */}
          {showGoalPicker && (
            <ScrollView 
              style={[
                styles.goalPickerList,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  borderWidth: 1
                }
              ]}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {/* Standalone Option */}
              <TouchableOpacity
                style={[
                  styles.goalOption,
                  milestoneState.goalId === null && { backgroundColor: theme.backgroundSecondary }
                ]}
                onPress={() => {
                  setMilestoneState(prev => ({ ...prev, goalId: null }));
                  setShowGoalPicker(false);
                }}
              >
                <Ionicons name="apps" size={scaleWidth(18)} color={theme.textSecondary} />
                <Text style={[styles.goalOptionText, { color: theme.text }]}>
                  Standalone Milestone
                </Text>
                {milestoneState.goalId === null && (
                  <Ionicons name="checkmark" size={scaleWidth(18)} color={theme.primary} />
                )}
              </TouchableOpacity>
              
              {/* Goal Options */}
              {goals.length > 0 ? goals.map(goal => (
                <TouchableOpacity
                  key={goal.id}
                  style={[
                    styles.goalOption,
                    milestoneState.goalId === goal.id && { backgroundColor: theme.backgroundSecondary }
                  ]}
                  onPress={() => {
                    setMilestoneState(prev => ({ ...prev, goalId: goal.id }));
                    setShowGoalPicker(false);
                  }}
                >
                  <Ionicons name={goal.icon || "flag"} size={scaleWidth(18)} color={goal.color || theme.primary} />
                  <Text style={[styles.goalOptionText, { color: theme.text }]} numberOfLines={1}>
                    {goal.title}
                  </Text>
                  {milestoneState.goalId === goal.id && (
                    <Ionicons name="checkmark" size={scaleWidth(18)} color={theme.primary} />
                  )}
                </TouchableOpacity>
              )) : (
                <View style={styles.noGoalsMessage}>
                  <Text style={[styles.noGoalsText, { color: theme.textSecondary }]}>
                    No goals available. Create a goal first.
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
          
          <Text style={[styles.goalInfoNote, { color: theme.textSecondary, marginTop: spacing.xs }]}>
            {milestoneState.goalId 
              ? 'This milestone inherits the goal\'s color'
              : 'Standalone milestones use default styling'
            }
          </Text>
        </View>

        {/* Delete Button (only for editing) */}
        {!isCreating && (
          <View style={styles.deleteSection}>
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: theme.error + '15' }]}
              onPress={handleDelete}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete milestone"
            >
              <Ionicons name="trash-outline" size={scaleWidth(20)} color={theme.error} />
              <Text style={[styles.deleteButtonText, { color: theme.error }]}>
                Delete Milestone
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: spacing.xl,
    borderRadius: scaleWidth(12),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: fontSizes.m,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    backgroundColor: '#000000',
    height: scaleHeight(60),
  },
  backButton: {
    padding: spacing.s,
    minHeight: accessibility.minTouchTarget,
    minWidth: accessibility.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(8),
    minHeight: accessibility.minTouchTarget,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.m,
    paddingBottom: spacing.xxl,
  },
  previewSection: {
    padding: spacing.xl,
    borderRadius: scaleWidth(16),
    alignItems: 'center',
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  previewTitle: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  previewSubtitle: {
    fontSize: fontSizes.s,
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: spacing.l,
  },
  inputLabel: {
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
    minHeight: accessibility.minTouchTarget,
  },
  textArea: {
    minHeight: scaleHeight(100),
    textAlignVertical: 'top',
  },
  goalInfo: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    padding: spacing.m,
  },
  goalInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  goalInfoText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginLeft: spacing.s,
    flex: 1,
  },
  goalInfoNote: {
    fontSize: fontSizes.s,
    fontStyle: 'italic',
  },
  deleteSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
    borderRadius: scaleWidth(12),
    minHeight: accessibility.minTouchTarget,
  },
  deleteButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  goalSelector: {
    borderRadius: scaleWidth(12),
    padding: spacing.m,
  },
  goalSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalSelectorText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginLeft: spacing.m,
  },
  goalPickerList: {
    marginTop: spacing.s,
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    maxHeight: scaleHeight(300),
  },
  goalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  goalOptionText: {
    flex: 1,
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginLeft: spacing.m,
  },
  noGoalsMessage: {
    padding: spacing.l,
    alignItems: 'center',
  },
  noGoalsText: {
    fontSize: fontSizes.m,
    textAlign: 'center',
  },
});

export default MilestoneDetailsScreen;
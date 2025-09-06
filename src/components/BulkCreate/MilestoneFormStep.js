// src/components/BulkCreate/MilestoneFormStep.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  fontSizes,
  accessibility
} from '../../utils/responsive';

const MilestoneFormStep = ({ 
  initialData, 
  onComplete, 
  onBack, 
  theme, 
  appContext,
  createdGoals = []
}) => {
  // Debug: Track what data we're working with
  console.log('🔍 MilestoneFormStep render with initialData:', {
    title: initialData?.title,
    description: initialData?.description,
    tasksLength: initialData?.tasks?.length,
    modalDataId: initialData?.modalDataId
  });
  
  // Form state  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [tasks, setTasks] = useState(() => {
    // Debug: Log what we're receiving
    console.log('🔍 MilestoneFormStep initialData:', JSON.stringify(initialData, null, 2));
    console.log('🔍 MilestoneFormStep milestone title:', initialData?.title);
    console.log('🔍 MilestoneFormStep tasks:', JSON.stringify(initialData?.tasks, null, 2));
    
    // Ensure tasks have proper structure and unique IDs
    if (!initialData?.tasks || !Array.isArray(initialData.tasks)) return [];
    
    return initialData.tasks.map((task, index) => {
      // Handle different task formats
      let taskTitle = '';
      if (typeof task === 'string') {
        taskTitle = task;
      } else if (typeof task?.title === 'string') {
        taskTitle = task.title;
      } else if (typeof task?.title === 'object' && typeof task.title.title === 'string') {
        // Handle nested structure: task.title.title
        taskTitle = task.title.title;
      } else if (task && typeof task === 'object') {
        // Try to extract title from object, even if structure is different
        taskTitle = task.name || task.description || `Task ${index + 1}`;
      } else {
        taskTitle = `Task ${index + 1}`;
      }

      return {
        id: task?.id || `task_${Date.now()}_${index}`,
        title: taskTitle,
        status: task?.status || 'todo',
        completed: task?.completed || false,
        createdAt: task?.createdAt || new Date().toISOString()
      };
    });
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [hasDueDate, setHasDueDate] = useState(initialData?.dueDate ? true : false);
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? new Date(initialData.dueDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
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

  // Debug: Track when initialData changes and update tasks state
  useEffect(() => {
    console.log('🔍 MilestoneFormStep initialData changed:', {
      newTitle: initialData?.title,
      newDescription: initialData?.description,
      newTasksCount: initialData?.tasks?.length,
      currentTasksCount: tasks.length,
      shouldUpdateState: initialData?.title !== title || initialData?.description !== description
    });
    
    // Update state when initialData changes
    if (initialData?.title && initialData.title !== title) {
      console.log('🔍 Updating title from', title, 'to', initialData.title);
      setTitle(initialData.title);
    }
    if (initialData?.description && initialData.description !== description) {
      console.log('🔍 Updating description from', description, 'to', initialData.description);
      setDescription(initialData.description);
    }
    
    // Update due date state
    if (initialData?.dueDate) {
      const newDate = new Date(initialData.dueDate);
      if (!hasDueDate || dueDate.getTime() !== newDate.getTime()) {
        console.log('🔍 Updating milestone dueDate from', dueDate, 'to', newDate);
        setHasDueDate(true);
        setDueDate(newDate);
      }
    }
    
    // CRITICAL: Update tasks when initialData.tasks changes
    if (initialData?.tasks && Array.isArray(initialData.tasks)) {
      const newTasks = initialData.tasks.map((task, index) => {
        let taskTitle = '';
        if (typeof task === 'string') {
          taskTitle = task;
        } else if (typeof task?.title === 'string') {
          taskTitle = task.title;
        } else if (typeof task?.title === 'object' && typeof task.title.title === 'string') {
          taskTitle = task.title.title;
        } else {
          taskTitle = `Task ${index + 1}`;
        }

        return {
          id: task.id || `task_${Date.now()}_${index}`,
          title: taskTitle,
          status: task?.status || 'todo',
          completed: task?.completed || false,
          createdAt: task?.createdAt || new Date().toISOString()
        };
      });
      
      // Only update if tasks actually changed
      const taskTitlesChanged = newTasks.length !== tasks.length || 
        newTasks.some((newTask, index) => tasks[index]?.title !== newTask.title);
        
      if (taskTitlesChanged) {
        console.log('🔍 Updating tasks:', {
          oldTasks: tasks.map(t => t.title),
          newTasks: newTasks.map(t => t.title)
        });
        setTasks(newTasks);
      }
    }
  }, [initialData]);

  // Handle goal selection
  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
  };

  // Add a new task
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newTaskTitle.trim(),
      status: 'todo',
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
  };

  // Remove a task
  const handleRemoveTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
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
      tasks: tasks,
      dueDate: hasDueDate ? dueDate.toISOString() : null
    };

    onComplete(milestoneData);
  };

  // Check if form is valid
  const isValid = title.trim().length > 0;

  // Calculate minimum touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);

  // Combine created goals with existing goals for selection
  const availableGoals = [
    ...createdGoals,
    ...(appContext?.goals || [])
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.form} 
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEnabled={true}
        bounces={true}
        nestedScrollEnabled={true}
      >
        {/* Header moved inside ScrollView */}
        <View style={styles.stepHeader}>
          <Text style={[styles.stepTitle, { color: theme.text }]}>
            Create Milestone
          </Text>
          <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
            Define a significant moment or achievement
          </Text>
        </View>

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

        {/* Due Date Section */}
        <View style={styles.inputSection}>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Due Date
              </Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Set a deadline for this milestone
              </Text>
            </View>
            <Switch
              value={hasDueDate}
              onValueChange={setHasDueDate}
              trackColor={{ 
                false: theme.border, 
                true: (selectedGoal?.color || '#007AFF') + '40' 
              }}
              thumbColor={hasDueDate ? (selectedGoal?.color || '#007AFF') : theme.textSecondary}
            />
          </View>
          
          {hasDueDate && (
            <TouchableOpacity
              style={[
                styles.dateButton,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={selectedGoal?.color || '#007AFF'} />
              <Text style={[styles.dateButtonText, { color: theme.text }]}>
                {dueDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Tasks Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Tasks ({tasks.length})
          </Text>
          
          {/* Task list */}
          <View style={styles.taskList}>
            {tasks.map((item, index) => (
              <View
                key={`task-${item.id || index}`}
                style={[
                  styles.taskItem,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border
                  }
                ]}
              >
                <View style={styles.taskCheckbox}>
                  <Ionicons 
                    name="ellipse-outline" 
                    size={scaleWidth(20)} 
                    color={selectedGoal?.color || '#007AFF'}
                  />
                </View>
                <Text 
                  style={[
                    styles.taskText,
                    { color: theme.text }
                  ]}
                  numberOfLines={2}
                >
                  {typeof item.title === 'string' ? item.title : 'Untitled Task'}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRemoveTask(item.id)}
                  style={styles.removeTaskButton}
                >
                  <Ionicons name="close-circle" size={scaleWidth(20)} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
          
          {/* Add new task input */}
          <View 
            style={[
              styles.addTaskContainer,
              {
                marginTop: spacing.m,
                marginBottom: spacing.m,
              }
            ]}
          >
            <View style={styles.taskCheckbox}>
              <Ionicons 
                name="add-circle-outline" 
                size={scaleWidth(22)} 
                color={selectedGoal?.color || '#007AFF'}
              />
            </View>
            <TextInput
              style={[
                styles.taskInput, 
                { 
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.border,
                  borderRadius: scaleWidth(8),
                  flex: 1,
                  borderWidth: 1,
                }
              ]}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              placeholder="Add a new task"
              placeholderTextColor={theme.textSecondary}
              onSubmitEditing={handleAddTask}
              returnKeyType="done"
              autoFocus={false}
            />
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.floatingButtonContainer}>
        {onBack && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.card || '#FFFFFF',
              borderRadius: scaleWidth(12),
              paddingVertical: spacing.m,
              paddingHorizontal: spacing.l,
              flex: 1,
              minHeight: minTouchSize,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
              marginRight: spacing.m,
              borderWidth: 1,
              borderColor: theme.border,
            }}
            onPress={onBack}
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={{
              color: theme.text,
              fontSize: fontSizes.m,
              fontWeight: '600',
            }}>
              Back
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={{
            backgroundColor: isValid ? (theme.primary || '#007AFF') : theme.border,
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.l,
            borderRadius: scaleWidth(12),
            flex: onBack ? 2 : 1,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: minTouchSize,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
            opacity: isValid ? 1 : 0.6,
          }}
          onPress={handleComplete}
          disabled={!isValid}
          accessible={true}
          accessibilityLabel={isValid ? "Continue to next step" : "Complete the required fields"}
          accessibilityRole="button"
        >
          <Ionicons 
            name="checkmark-circle" 
            size={scaleWidth(20)} 
            color="#FFFFFF" 
            style={{ marginRight: spacing.s }}
          />
          <Text style={{
            fontSize: fontSizes.m,
            fontWeight: '600',
            color: '#FFFFFF',
          }}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  switchDescription: {
    fontSize: fontSizes.s,
    marginTop: spacing.xs,
    lineHeight: fontSizes.s * 1.3,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    minHeight: scaleHeight(48),
  },
  dateButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginLeft: spacing.s,
  },
  // Floating Buttons
  floatingButtonContainer: {
    position: 'absolute',
    bottom: spacing.l,
    left: spacing.l,
    right: spacing.l,
    flexDirection: 'row',
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
  // Task styles
  taskList: {
    marginTop: spacing.s,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(8),
    marginBottom: spacing.s,
    borderWidth: 1,
  },
  taskCheckbox: {
    marginRight: spacing.s,
    width: scaleWidth(24),
    alignItems: 'center',
  },
  taskText: {
    flex: 1,
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  removeTaskButton: {
    padding: spacing.xs,
    marginLeft: spacing.s,
  },
  addTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskInput: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: fontSizes.m,
    minHeight: scaleHeight(40),
  },
});

export default MilestoneFormStep;
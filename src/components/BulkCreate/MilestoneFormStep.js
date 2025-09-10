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
import TextInputModal from '../TextInputModal';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  fontSizes,
  accessibility
} from '../../utils/responsive';

// Import date formatting helper
import { formatDate } from '../../screens/GoalDetailsScreen/utils/helpers';

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
        id: task?.id || `task_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
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
  const [datePickerMode, setDatePickerMode] = useState(Platform.OS === 'ios' ? 'spinner' : 'default');
  
  // Modal states for tappable editing
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTaskIndex, setEditingTaskIndex] = useState(-1);
  
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
          id: task.id || `task_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
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
      id: `task_${Date.now()}_${tasks.length}_${Math.random().toString(36).substr(2, 9)}`,
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

  // Toggle date picker mode between spinner and calendar
  const toggleDatePickerMode = () => {
    if (Platform.OS === 'ios') {
      setDatePickerMode(datePickerMode === 'spinner' ? 'inline' : 'spinner');
    } else {
      setDatePickerMode(datePickerMode === 'default' ? 'calendar' : 'default');
    }
  };

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  };

  // Check if form is valid
  const isValid = title.trim().length > 0;

  // Get theme-aware button color
  const buttonColor = selectedGoal?.color || '#007AFF';

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
          <TouchableOpacity
            style={[
              styles.textInput,
              { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between'
              }
            ]}
            onPress={() => setShowTitleModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[
              { 
                color: title ? theme.text : theme.textSecondary,
                fontSize: fontSizes.m,
                flex: 1
              }
            ]}>
              {title || 'Enter milestone title...'}
            </Text>
            <Ionicons name="pencil" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Description (Optional)
          </Text>
          <TouchableOpacity
            style={[
              styles.textInput,
              styles.multilineInput,
              { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }
            ]}
            onPress={() => setShowDescriptionModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[
              { 
                color: description ? theme.text : theme.textSecondary,
                fontSize: fontSizes.m,
                flex: 1,
                paddingTop: spacing.xs
              }
            ]} numberOfLines={3}>
              {description || 'Describe this milestone...'}
            </Text>
            <Ionicons name="pencil" size={16} color={theme.textSecondary} style={{ marginTop: spacing.xs }} />
          </TouchableOpacity>
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
                {availableGoals.map((goal, index) => (
                  <TouchableOpacity
                    key={`goal-${goal.id}-${index}`}
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

        {/* Due Date Toggle */}
        <View style={[
          styles.inputSection,
          {
            backgroundColor: theme.card,
            padding: spacing.m,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
            shadowRadius: 6,
            elevation: 3,
          }
        ]}>
          <View style={[
            styles.switchContainer,
            {
              paddingVertical: 0,
              minHeight: scaleWidth(44)
            }
          ]}>
            <View style={styles.switchInfo}>
              <Text style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  marginBottom: 0,
                  fontSize: fontSizes.m,
                  fontWeight: '600'
                }
              ]}>
                Set Due Date
              </Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Set a deadline for this milestone
              </Text>
            </View>
            <Switch
              value={hasDueDate}
              onValueChange={(value) => {
                setHasDueDate(value);
                if (value) {
                  setShowDatePicker(true);
                } else {
                  setShowDatePicker(false);
                }
              }}
              trackColor={{ 
                false: theme.border, 
                true: (selectedGoal?.color || buttonColor) + '80'
              }}
              thumbColor={hasDueDate ? (selectedGoal?.color || buttonColor) : '#f4f3f4'}
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Set due date"
              accessibilityState={{ checked: hasDueDate }}
              accessibilityHint={hasDueDate ? "Toggle off to remove due date" : "Toggle on to set a due date"}
            />
          </View>
        </View>
        
        {/* Date Picker Section - Only show when hasDueDate is true */}
        {hasDueDate && (
          <View style={[
            styles.inputSection,
            {
              backgroundColor: theme.card,
              padding: spacing.m,
              borderRadius: scaleWidth(12),
              marginBottom: spacing.m,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
              shadowRadius: 6,
              elevation: 3,
            }
          ]}>
            <Text 
              style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  fontWeight: '600',
                  marginBottom: spacing.s
                }
              ]}
            >
              Due Date
            </Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: selectedGoal?.color || theme.border,
                  borderWidth: 1,
                  paddingHorizontal: spacing.m,
                  paddingVertical: spacing.s,
                  borderRadius: scaleWidth(12),
                  minHeight: scaleWidth(44),
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
                }
              ]}
              onPress={() => setShowDatePicker(true)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Selected date: ${formatDate(dueDate)}`}
              accessibilityHint="Opens date picker to select a due date"
            >
              <Ionicons name="calendar-outline" size={scaleWidth(20)} color={theme.textSecondary} />
              <Text style={[
                styles.dateButtonText, 
                { 
                  color: theme.text,
                  fontSize: fontSizes.m,
                  marginLeft: spacing.s
                }
              ]}>
                {formatDate(dueDate)}
              </Text>
            </TouchableOpacity>
            
            {/* Date Picker Mode Selector and Picker - Only show when showDatePicker is true */}
            {showDatePicker && (
            <View style={[
              styles.datePickerContainer,
              { 
                backgroundColor: theme.dark ? '#000000' : '#111111',
                borderColor: theme.border,
                borderWidth: 1
              }
            ]}>
              {/* Date Picker Mode Selector */}
              <View style={styles.datePickerModeContainer}>
                <TouchableOpacity 
                  style={[
                    styles.datePickerModeButton,
                    {
                      borderColor: theme.border,
                      backgroundColor: datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') ? buttonColor + '20' : 'transparent'
                    },
                    datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') && {
                      borderColor: buttonColor
                    }
                  ]}
                  onPress={() => toggleDatePickerMode()}
                >
                  <Ionicons 
                    name="options-outline" 
                    size={scaleWidth(16)} 
                    color={datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') ? buttonColor : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.datePickerModeText,
                    { 
                      color: datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') ? buttonColor : theme.textSecondary
                    }
                  ]}>
                    Wheel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.datePickerModeButton,
                    {
                      borderColor: theme.border,
                      backgroundColor: datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') ? buttonColor + '20' : 'transparent'
                    },
                    datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') && {
                      borderColor: buttonColor
                    }
                  ]}
                  onPress={() => toggleDatePickerMode()}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={scaleWidth(16)} 
                    color={datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') ? buttonColor : theme.textSecondary} 
                  />
                  <Text style={[
                    styles.datePickerModeText,
                    { 
                      color: datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') ? buttonColor : theme.textSecondary
                    }
                  ]}>
                    Calendar
                  </Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={datePickerMode}
                onChange={handleDateChange}
                minimumDate={new Date()}
                themeVariant="dark"
                accessibilityLabel="Date picker"
                style={{ height: datePickerMode === 'inline' ? 300 : 200 }}
                textColor="#FFFFFF"
              />
              
              {/* Done button for iOS */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity 
                  style={[
                    styles.doneButton, 
                    { 
                      backgroundColor: buttonColor,
                      paddingVertical: spacing.m
                    }
                  ]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[
                    styles.doneButtonText, 
                    { 
                      color: '#FFFFFF',
                      fontSize: fontSizes.m
                    }
                  ]}>
                    Done
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            )}
          </View>
        )}

        {/* Tasks Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Tasks ({tasks.length})
          </Text>
          
          {/* Task list */}
          <View style={styles.taskList}>
            {tasks.map((item, index) => (
              <View
                key={`task-${item.id}-${index}`}
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
                <TouchableOpacity 
                  style={styles.taskTextContainer}
                  onPress={() => {
                    setEditingTaskIndex(index);
                    setShowTaskModal(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text 
                    style={[
                      styles.taskText,
                      { color: theme.text }
                    ]}
                    numberOfLines={2}
                  >
                    {typeof item.title === 'string' ? item.title : 'Untitled Task'}
                  </Text>
                  <Ionicons name="pencil" size={14} color={theme.textSecondary} style={{ marginLeft: spacing.xs }} />
                </TouchableOpacity>
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

      {/* Floating Action Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={{
            backgroundColor: isValid ? (theme.primary || '#007AFF') : theme.border,
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.l,
            borderRadius: scaleWidth(12),
            flex: 1,
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
            Create Milestone
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Title Edit Modal */}
      <TextInputModal
        visible={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        onSave={(newTitle) => {
          setTitle(newTitle);
          setShowTitleModal(false);
        }}
        title="Edit Milestone Title"
        placeholder="Enter milestone title..."
        value={title}
        maxLength={100}
        primaryColor={buttonColor}
      />
      
      {/* Description Edit Modal */}
      <TextInputModal
        visible={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        onSave={(newDescription) => {
          setDescription(newDescription);
          setShowDescriptionModal(false);
        }}
        title="Edit Milestone Description"
        placeholder="Describe this milestone..."
        value={description}
        multiline={true}
        maxLength={500}
        primaryColor={buttonColor}
      />
      
      {/* Task Edit Modal */}
      <TextInputModal
        visible={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTaskIndex(-1);
        }}
        onSave={(newTaskTitle) => {
          if (editingTaskIndex >= 0 && editingTaskIndex < tasks.length) {
            const updatedTasks = [...tasks];
            updatedTasks[editingTaskIndex] = {
              ...updatedTasks[editingTaskIndex],
              title: newTaskTitle
            };
            setTasks(updatedTasks);
          }
          setShowTaskModal(false);
          setEditingTaskIndex(-1);
        }}
        title="Edit Task"
        placeholder="Enter task title..."
        value={editingTaskIndex >= 0 ? tasks[editingTaskIndex]?.title || '' : ''}
        maxLength={200}
        primaryColor={buttonColor}
      />
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
  },
  dateButtonText: {
    flex: 1,
    fontSize: fontSizes.m,
    fontWeight: '500',
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
  taskTextContainer: {
    flex: 1,
    flexDirection: 'row',
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
  
  // Date Picker Styles
  datePickerContainer: {
    marginTop: spacing.s,
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  datePickerModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  datePickerModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(20),
    marginHorizontal: spacing.xs,
    borderWidth: 1,
  },
  datePickerModeText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  doneButton: {
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontWeight: '600',
  },
});

export default MilestoneFormStep;
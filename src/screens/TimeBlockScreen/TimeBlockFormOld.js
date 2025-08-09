// src/screens/TimeBlockScreen/TimeBlockFormSliding.js
import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: screenWidth } = Dimensions.get('window');

// Goal Selector Component (same as original)
const GoalSelector = ({ 
  visible, 
  onClose, 
  onSelectGoal, 
  selectedGoal,
  goals,
  customColor,
  theme,
  isDarkMode
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[
        styles.modalOverlay, 
        { backgroundColor: 'rgba(0,0,0,0.5)' }
      ]}>
        <View style={[
          styles.modalContainer, 
          { 
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border
          }
        ]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Select Goal
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* No specific goal option */}
            <TouchableOpacity 
              style={[
                styles.modalItem,
                { 
                  backgroundColor: selectedGoal === null 
                    ? `${customColor}15` 
                    : theme.card,
                  borderWidth: 1,
                  borderColor: selectedGoal === null
                    ? customColor
                    : theme.border
                }
              ]}
              onPress={() => {
                onSelectGoal(null);
                onClose();
              }}
            >
              <Ionicons 
                name="close-circle-outline" 
                size={20} 
                color={selectedGoal === null ? customColor : theme.textSecondary} 
              />
              <Text style={[
                styles.modalItemText, 
                { 
                  color: selectedGoal === null 
                    ? customColor 
                    : theme.text,
                  fontWeight: selectedGoal === null ? 'bold' : 'normal'
                }
              ]}>
                No Specific Goal
              </Text>
            </TouchableOpacity>
            
            {/* Goals list */}
            {goals.length > 0 ? (
              goals.map(goal => (
                <TouchableOpacity 
                  key={goal.id}
                  style={[
                    styles.modalItem,
                    { 
                      backgroundColor: selectedGoal?.id === goal.id 
                        ? `${goal.color}15` 
                        : theme.card,
                      borderWidth: 1,
                      borderColor: selectedGoal?.id === goal.id
                        ? goal.color
                        : theme.border
                    }
                  ]}
                  onPress={() => {
                    onSelectGoal(goal);
                    onClose();
                  }}
                >
                  <View style={[
                    styles.goalColorIndicator, 
                    { backgroundColor: goal.color }
                  ]} />
                  <View style={styles.goalDetails}>
                    <Text style={[
                      styles.modalItemText, 
                      { 
                        color: selectedGoal?.id === goal.id 
                          ? goal.color 
                          : theme.text,
                        fontWeight: selectedGoal?.id === goal.id ? 'bold' : 'normal'
                      }
                    ]}>
                      {goal.title}
                    </Text>
                    {goal.progress !== undefined && (
                      <View style={styles.progressRow}>
                        <View style={[
                          styles.progressBar, 
                          { backgroundColor: `${goal.color}30` }
                        ]}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { 
                                backgroundColor: goal.color,
                                width: `${goal.progress || 0}%` 
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                          {goal.progress || 0}%
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={[styles.noItemsMessage, { borderColor: theme.border }]}>
                <Text style={[styles.noItemsText, { color: theme.textSecondary }]}>
                  No active goals available. You can create goals in the Goals tab.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const TimeBlockForm = ({
  title,
  setTitle,
  domain,
  setDomain,
  domainColor,
  setDomainColor,
  selectedProject,
  selectedTask,
  openProjectModal,
  openTaskModal,
  customColor,
  setCustomColor,
  openColorModal,
  openDatePicker,
  openStartTimePicker,
  openEndTimePicker,
  startTime,
  endTime,
  timeError,
  location,
  setLocation,
  notes,
  setNotes,
  isCompleted,
  setIsCompleted,
  isRepeating,
  setIsRepeating,
  repeatFrequency,
  setRepeatFrequency,
  repeatIndefinitely,
  setRepeatIndefinitely,
  repeatUntil,
  openRepeatUntilDatePicker,
  enableNotification,
  setEnableNotification,
  notificationTime,
  setNotificationTime,
  showCustomTimeInput,
  setShowCustomTimeInput,
  customMinutes,
  setCustomMinutes,
  formatCustomMinutes,
  navigateToGoalSettings,
  formatTime,
  formatDate,
  availableGoals,
  goalProjects,
  projectTasks,
  handleDelete,
  isCreating,
  theme,
  isDarkMode,
  scrollToInput,
  validateCustomMinutes,
}) => {
  
  // Define tabs for the form
  const TABS = {
    BASIC: 'basic',
    ADDITIONAL: 'additional'
  };
  
  // State for active tab
  const [activeTab, setActiveTab] = useState(TABS.BASIC);
  
  // State for showing goal selector modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Duration state for displaying time block length
  const [duration, setDuration] = useState('');
  
  // Tab navigation state
  const [navigationState, setNavigationState] = useState({
    index: activeTab === TABS.BASIC ? 0 : 1,
    routes: [
      { key: TABS.BASIC, title: 'Basic Details' },
      { key: TABS.ADDITIONAL, title: 'Additional Options' }
    ]
  });
  
  // Find selected goal
  const selectedGoal = Array.isArray(availableGoals) ? 
    availableGoals.find(goal => goal.title === domain) : null;
  
  // Calculate time block duration whenever start or end time changes
  useEffect(() => {
    if (startTime && endTime) {
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationMins = Math.round(durationMs / (1000 * 60));
      
      if (durationMins < 60) {
        setDuration(`${durationMins} minutes`);
      } else {
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        setDuration(mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`);
      }
    }
  }, [startTime, endTime]);
  
  // Helper function to format custom minutes
  const getFormattedCustomMinutes = () => {
    if (notificationTime === 'custom' && customMinutes) {
      return formatCustomMinutes(customMinutes);
    }
    return 'Custom time before';
  };
  
  // Handle tab change
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
  };
  
  // Function to handle quick duration selection
  const handleQuickDuration = (minutes) => {
    const newEndTime = new Date(startTime.getTime());
    newEndTime.setMinutes(startTime.getMinutes() + minutes);
    setEndTime(newEndTime);
  };
  
  // Function to open goal selection modal
  const openGoalModal = () => {
    setShowGoalModal(true);
  };
  
  // Function to handle goal selection
  const handleGoalSelect = (goal) => {
    if (goal === null) {
      // Selected "No Specific Goal"
      setDomain('');
      setDomainColor(customColor);
    } else {
      // Selected a specific goal
      setDomain(goal.title);
      setDomainColor(goal.color);
    }
    
    // Clear project and task when goal changes
    if ((!selectedGoal && goal) || (selectedGoal && goal && selectedGoal.id !== goal.id)) {
      // If selecting a different goal, clear the project selection
      //setSelectedProject(null);
      //setSelectedTask(null);
    }
  };


  const renderBasicTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View style={[styles.form, { backgroundColor: theme.card, borderRadius: 16, margin: 16 }]}>
        {/* Title */}
      <View style={styles.formGroup}>
        <View style={styles.labelContainer}>
          <Ionicons name="create-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Title
          </Text>
        </View>
        <TextInput
          style={[styles.input, { 
            color: theme.text, 
            backgroundColor: theme.background, 
            borderColor: theme.border
          }]}
          value={title}
          onChangeText={setTitle}
          placeholder="What are you planning to do?"
          placeholderTextColor={theme.textSecondary}
        />
      </View>
      
      {/* Goal Selection */}
      <View style={styles.formGroup}>
        <View style={styles.labelContainer}>
          <Ionicons name="flag-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Goal
          </Text>
        </View>
        <TouchableOpacity 
          style={[
            styles.selector, 
            { 
              backgroundColor: theme.background, 
              borderColor: domain ? domainColor : theme.border
            }
          ]}
          onPress={openGoalModal}
          activeOpacity={0.7}
        >
          {domain ? (
            <View style={styles.selectedItem}>
              <View style={[styles.itemColorBar, { backgroundColor: domainColor }]} />
              <Text style={[styles.selectedItemText, { color: theme.text }]}>
                {domain}
              </Text>
              {selectedGoal && selectedGoal.progress !== undefined && (
                <View style={styles.progressBadge}>
                  <Text style={[styles.progressText, { color: domainColor }]}>
                    {selectedGoal.progress}%
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
              No Specific Goal (Optional)
            </Text>
          )}
          <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
      
      {/* Color selection for when no goal is selected */}
      {!domain && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            <Ionicons name="color-palette-outline" size={16} color={theme.textSecondary} style={{ marginRight: 10 }} />
            Block Color
          </Text>
          <TouchableOpacity 
            style={[
              styles.colorSelector, 
              { 
                backgroundColor: theme.background, 
                borderColor: theme.border
              }
            ]}
            onPress={openColorModal}
            activeOpacity={0.7}
          >
            <View style={[styles.colorPreview, { backgroundColor: customColor }]} />
            <Text style={[styles.colorText, { color: theme.text }]}>
              {customColor.toUpperCase()}
            </Text>
            <View style={styles.colorIconContainer}>
              <Ionicons name="color-palette" size={18} color={customColor} />
            </View>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Project Selection */}
      {domain && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            <Ionicons name="folder-outline" size={16} color={theme.textSecondary} style={{ marginRight: 10 }} />
            Project
          </Text>
          <TouchableOpacity 
            style={[
              styles.selector, 
              { 
                backgroundColor: theme.background, 
                borderColor: selectedProject ? domainColor : theme.border
              }
            ]}
            onPress={openProjectModal}
            activeOpacity={0.7}
          >
            {selectedProject ? (
              <View style={styles.selectedItem}>
                <View style={[
                  styles.itemColorBar, 
                  { backgroundColor: selectedProject.color || domainColor }
                ]} />
                <Text style={[styles.selectedItemText, { color: theme.text }]}>
                  {selectedProject.title}
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                {goalProjects.length > 0 
                  ? 'Select a project (optional)' 
                  : 'No projects available for this goal'}
              </Text>
            )}
            {goalProjects.length > 0 && (
              <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {/* Task Selection */}
      {domain && selectedProject && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            <Ionicons name="checkbox-outline" size={16} color={theme.textSecondary} style={{ marginRight: 10 }} />
            Task
          </Text>
          <TouchableOpacity 
            style={[
              styles.selector, 
              { 
                backgroundColor: theme.background, 
                borderColor: selectedTask ? domainColor : theme.border
              }
            ]}
            onPress={openTaskModal}
            activeOpacity={0.7}
          >
            {selectedTask ? (
              <View style={styles.selectedItem}>
                <Ionicons 
                  name="checkbox" 
                  size={18} 
                  color={selectedTask.color || domainColor}
                  style={styles.taskIcon} 
                />
                <Text style={[styles.selectedItemText, { color: theme.text }]}>
                  {selectedTask.title}
                </Text>
              </View>
            ) : (
              <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                {projectTasks.length > 0 
                  ? 'Select a task (optional)' 
                  : 'No tasks available for this project'}
              </Text>
            )}
            {projectTasks.length > 0 && (
              <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {/* Date & Time */}
      <View style={styles.formGroup}>
        <View style={styles.labelContainer}>
          <Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Date & Time
          </Text>
        </View>
        
        {/* Date selector */}
        <TouchableOpacity 
          style={[styles.dateSelector, { 
            backgroundColor: theme.background, 
            borderColor: theme.border
          }]}
          onPress={openDatePicker}
          activeOpacity={0.7}
        >
          <View style={styles.calendarIcon}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarMonth}>
                {startTime.toLocaleString('default', { month: 'short' })}
              </Text>
            </View>
            <Text style={styles.calendarDay}>
              {startTime.getDate()}
            </Text>
          </View>
          <View style={styles.dateInfo}>
            <Text style={[styles.dateText, { color: theme.text }]}>
              {formatDate(startTime)}
            </Text>
            <Text style={[styles.dayText, { color: theme.textSecondary }]}>
              {startTime.toLocaleDateString(undefined, { weekday: 'long' })}
            </Text>
          </View>
          <Ionicons name="calendar" size={20} color={domain ? domainColor : customColor} />
        </TouchableOpacity>
        
        {/* Time Range */}
        <View style={[styles.timeContainer, { 
          backgroundColor: theme.background, 
          borderColor: theme.border
        }]}>
          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Start</Text>
              <TouchableOpacity 
                style={styles.timeButton} 
                onPress={openStartTimePicker}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeValue, { color: theme.text }]}>
                  {formatTime(startTime)}
                </Text>
                <Ionicons name="time-outline" size={18} color={domain ? domainColor : customColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.timeArrow}>
              <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.timeColumn}>
              <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>End</Text>
              <TouchableOpacity 
                style={styles.timeButton} 
                onPress={openEndTimePicker}
                activeOpacity={0.7}
              >
                <Text style={[styles.timeValue, { color: theme.text }]}>
                  {formatTime(endTime)}
                </Text>
                <Ionicons name="time-outline" size={18} color={domain ? domainColor : customColor} />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.durationContainer, { borderTopColor: theme.border }]}>
            <View style={styles.durationInfo}>
              <Ionicons name="time" size={16} color={theme.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[styles.durationText, { color: theme.textSecondary }]}>Duration: </Text>
              <Text style={[styles.durationValue, { color: theme.text }]}>
                {duration}
              </Text>
            </View>
            <View style={styles.quickDurationButtons}>
              <TouchableOpacity 
                style={[styles.quickButton, { 
                  borderColor: domain ? domainColor : customColor,
                  backgroundColor: `${domain ? domainColor : customColor}15`
                }]}
                onPress={() => handleQuickDuration(30)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickButtonText, { color: domain ? domainColor : customColor }]}>
                  30m
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickButton, { 
                  borderColor: domain ? domainColor : customColor,
                  backgroundColor: `${domain ? domainColor : customColor}15`
                }]}
                onPress={() => handleQuickDuration(60)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickButtonText, { color: domain ? domainColor : customColor }]}>
                  1h
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.quickButton, { 
                  borderColor: domain ? domainColor : customColor,
                  backgroundColor: `${domain ? domainColor : customColor}15`
                }]}
                onPress={() => handleQuickDuration(120)}
                activeOpacity={0.7}
              >
                <Text style={[styles.quickButtonText, { color: domain ? domainColor : customColor }]}>
                  2h
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Time Error Message */}
        {timeError ? (
          <View style={[styles.errorContainer, { backgroundColor: `${theme.error}10` }]}>
            <Ionicons name="alert-circle" size={18} color={theme.error} style={styles.errorIcon} />
            <Text style={[styles.errorText, { color: theme.error }]}>{timeError}</Text>
          </View>
        ) : null}
      </View>
      </View>
    </ScrollView>
  );

  const renderAdditionalTab = () => (
    <ScrollView 
      style={styles.tabContent}
      showsVerticalScrollIndicator={true}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View style={[styles.form, { backgroundColor: theme.card, borderRadius: 16, margin: 16 }]}>
        {/* Repeating Options */}
      <View style={styles.formGroup}>
        <View style={styles.optionHeader}>
          <View style={styles.optionTitleContainer}>
            <Ionicons name="repeat" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <Text style={[styles.optionTitle, { color: theme.text }]}>Repeat</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.toggle,
              { 
                backgroundColor: isRepeating ? domain ? domainColor : customColor : theme.border
              }
            ]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setIsRepeating(!isRepeating);
            }}
          >
            <View style={[
              styles.toggleHandle,
              { 
                backgroundColor: isDarkMode ? '#000000' : '#fff',
                transform: [{ translateX: isRepeating ? 20 : 0 }] 
              }
            ]} />
          </TouchableOpacity>
        </View>
        
        {isRepeating && (
          <View style={[styles.optionContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.sublabel, { color: theme.textSecondary }]}>Frequency</Text>
            <View style={styles.frequencyButtons}>
              <TouchableOpacity 
                style={[
                  styles.frequencyButton, 
                  { 
                    backgroundColor: repeatFrequency === 'daily' ? 
                      `${domain ? domainColor : customColor}15` : theme.background,
                    borderColor: repeatFrequency === 'daily' ? 
                      (domain ? domainColor : customColor) : theme.border
                  }
                ]}
                onPress={() => setRepeatFrequency('daily')}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={repeatFrequency === 'daily' ? 
                    (domain ? domainColor : customColor) : theme.textSecondary} 
                  style={{ marginRight: 10 }}
                />
                <Text style={[
                  styles.frequencyButtonText, 
                  { color: repeatFrequency === 'daily' ? 
                    (domain ? domainColor : customColor) : theme.textSecondary }
                ]}>
                  Daily
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.frequencyButton, 
                  { 
                    backgroundColor: repeatFrequency === 'weekly' ? 
                      `${domain ? domainColor : customColor}15` : theme.background,
                    borderColor: repeatFrequency === 'weekly' ? 
                      (domain ? domainColor : customColor) : theme.border
                  }
                ]}
                onPress={() => setRepeatFrequency('weekly')}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={repeatFrequency === 'weekly' ? 
                    (domain ? domainColor : customColor) : theme.textSecondary} 
                  style={{ marginRight: 10 }}
                />
                <Text style={[
                  styles.frequencyButtonText, 
                  { color: repeatFrequency === 'weekly' ? 
                    (domain ? domainColor : customColor) : theme.textSecondary }
                ]}>
                  Weekly
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.frequencyButton, 
                  { 
                    backgroundColor: repeatFrequency === 'monthly' ? 
                      `${domain ? domainColor : customColor}15` : theme.background,
                    borderColor: repeatFrequency === 'monthly' ? 
                      (domain ? domainColor : customColor) : theme.border
                  }
                ]}
                onPress={() => setRepeatFrequency('monthly')}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={repeatFrequency === 'monthly' ? 
                    (domain ? domainColor : customColor) : theme.textSecondary} 
                  style={{ marginRight: 10 }}
                />
                <Text style={[
                  styles.frequencyButtonText, 
                  { color: repeatFrequency === 'monthly' ? 
                    (domain ? domainColor : customColor) : theme.textSecondary }
                ]}>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.sublabel, { color: theme.textSecondary, marginTop: 15 }]}>
              End Repeat
            </Text>
            <View style={styles.repeatEndOptions}>
              <TouchableOpacity 
                style={[
                  styles.repeatEndOption, 
                  { 
                    backgroundColor: repeatIndefinitely ? 
                      `${domain ? domainColor : customColor}15` : theme.background,
                    borderColor: repeatIndefinitely ? 
                      (domain ? domainColor : customColor) : theme.border
                  }
                ]}
                onPress={() => setRepeatIndefinitely(true)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="infinite" 
                  size={16} 
                  color={repeatIndefinitely ? 
                    (domain ? domainColor : customColor) : theme.textSecondary} 
                  style={{ marginRight: 10 }}
                />
                <Text style={[
                  styles.repeatEndOptionText, 
                  { color: repeatIndefinitely ? 
                    (domain ? domainColor : customColor) : theme.textSecondary }
                ]}>
                  Never
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.repeatEndOption, 
                  { 
                    backgroundColor: !repeatIndefinitely ? 
                      `${domain ? domainColor : customColor}15` : theme.background,
                    borderColor: !repeatIndefinitely ? 
                      (domain ? domainColor : customColor) : theme.border
                  }
                ]}
                onPress={() => setRepeatIndefinitely(false)}
                activeOpacity={0.7}
              >
                <View style={styles.repeatUntilContainer}>
                  <Ionicons 
                    name="calendar" 
                    size={16} 
                    color={!repeatIndefinitely ? 
                      (domain ? domainColor : customColor) : theme.textSecondary} 
                    style={{ marginRight: 10 }}
                  />
                  <Text style={[
                    styles.repeatEndOptionText, 
                    { color: !repeatIndefinitely ? 
                      (domain ? domainColor : customColor) : theme.textSecondary }
                  ]}>
                    Until
                  </Text>
                  {!repeatIndefinitely && (
                    <TouchableOpacity 
                      style={styles.repeatUntilDateButton}
                      onPress={openRepeatUntilDatePicker}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.repeatUntilDateText, { 
                        color: domain ? domainColor : customColor 
                      }]}>
                        {repeatUntil ? formatDate(repeatUntil) : 'Select date'}
                      </Text>
                      <Ionicons 
                        name="calendar-outline" 
                        size={14} 
                        color={domain ? domainColor : customColor} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Notification Options */}
      <View style={styles.formGroup}>
        <View style={styles.optionHeader}>
          <View style={styles.optionTitleContainer}>
            <Ionicons name="notifications-outline" size={20} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <Text style={[styles.optionTitle, { color: theme.text }]}>Get notified</Text>
          </View>
          <TouchableOpacity 
            style={[
              styles.toggle,
              { 
                backgroundColor: enableNotification ? domain ? domainColor : customColor : theme.border
              }
            ]}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setEnableNotification(!enableNotification);
            }}
          >
            <View style={[
              styles.toggleHandle,
              { 
                backgroundColor: isDarkMode ? '#000000' : '#fff',
                transform: [{ translateX: enableNotification ? 20 : 0 }] 
              }
            ]} />
          </TouchableOpacity>
        </View>
        
        {enableNotification && (
          <View style={[styles.optionContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.sublabel, { color: theme.textSecondary }]}>When to notify</Text>
            
            <View style={styles.notificationOptions}>
              {/* At start time option */}
              <TouchableOpacity 
                style={[
                  styles.notificationOption, 
                  { 
                    backgroundColor: notificationTime === 'exact' ? 
                      `${domain ? domainColor : customColor}15` : theme.background,
                    borderColor: notificationTime === 'exact' ? 
                      (domain ? domainColor : customColor) : theme.border
                  }
                ]}
                onPress={() => {
                  setNotificationTime('exact');
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowCustomTimeInput(false);
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="alarm-outline" 
                  size={18} 
                  color={notificationTime === 'exact' ? 
                    (domain ? domainColor : customColor) : theme.textSecondary} 
                  style={{ marginRight: 12 }}
                />
                <View style={styles.notificationTextContainer}>
                  <Text style={[
                    styles.notificationText, 
                    { color: notificationTime === 'exact' ? 
                      (domain ? domainColor : customColor) : theme.text }
                  ]}>
                    At start time
                  </Text>
                  <Text style={[styles.notificationDescription, { color: theme.textSecondary }]}>
                    Notify when the block starts
                  </Text>
                </View>
              </TouchableOpacity>
              
              {/* Custom time before option */}
              <TouchableOpacity 
                style={[
                  styles.notificationOption, 
                  { 
                    backgroundColor: notificationTime === 'custom' ? 
                      `${domain ? domainColor : customColor}15` : theme.background,
                    borderColor: notificationTime === 'custom' ? 
                      (domain ? domainColor : customColor) : theme.border,
                    marginTop: 10
                  }
                ]}
                onPress={() => {
                  setNotificationTime('custom');
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setShowCustomTimeInput(true);
                }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="time-outline" 
                  size={18} 
                  color={notificationTime === 'custom' ? 
                    (domain ? domainColor : customColor) : theme.textSecondary} 
                  style={{ marginRight: 12 }}
                />
                <View style={styles.notificationTextContainer}>
                  <Text style={[
                    styles.notificationText, 
                    { color: notificationTime === 'custom' ? 
                      (domain ? domainColor : customColor) : theme.text }
                  ]}>
                    {notificationTime === 'custom' && customMinutes 
                      ? getFormattedCustomMinutes()
                      : 'Custom time before'}
                  </Text>
                  <Text style={[styles.notificationDescription, { color: theme.textSecondary }]}>
                    Get a reminder before the block starts
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Custom time input */}
            {notificationTime === 'custom' && showCustomTimeInput && (
              <View style={[styles.customTimeInputContainer, { 
                backgroundColor: `${domain ? domainColor : customColor}10`
              }]}>
                <View style={styles.customTimeInputRow}>
                  <TextInput
                    style={[
                      styles.customTimeInput,
                      { 
                        color: theme.text, 
                        backgroundColor: theme.background, 
                        borderColor: domain ? domainColor : customColor
                      }
                    ]}
                    value={customMinutes}
                    onChangeText={(value) => setCustomMinutes(validateCustomMinutes(value))}
                    keyboardType="number-pad"
                    maxLength={4}
                    selectTextOnFocus={true}
                    onFocus={(event) => scrollToInput(event.target)}
                  />
                  <Text style={[styles.customTimeLabel, { color: theme.text }]}>
                    minutes before
                  </Text>
                </View>
                <View style={styles.timePresetContainer}>
                  {[5, 15, 30, 60].map(mins => (
                    <TouchableOpacity 
                      key={mins}
                      style={[styles.timePresetButton, { 
                        backgroundColor: customMinutes === mins.toString() ? 
                          (domain ? domainColor : customColor) : 
                          `${domain ? domainColor : customColor}30`,
                      }]}
                      onPress={() => setCustomMinutes(mins.toString())}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.timePresetText, { 
                        color: customMinutes === mins.toString() ? '#FFFFFF' : theme.text
                      }]}>
                        {mins < 60 ? `${mins}m` : `1h`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            {/* Goal notification settings link */}
            {domain && selectedGoal && (
              <TouchableOpacity 
                style={[styles.goalNotificationsButton, { 
                  borderColor: domainColor,
                  backgroundColor: `${domainColor}10`
                }]}
                onPress={navigateToGoalSettings}
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle-outline" size={18} color={domainColor} style={{ marginRight: 12 }} />
                <Text style={[styles.goalNotificationsText, { color: theme.text }]}>
                  Configure notifications for all "{domain}" time blocks
                </Text>
                <Ionicons name="chevron-forward" size={16} color={domainColor} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Location */}
      <View style={styles.formGroup}>
        <View style={styles.labelContainer}>
          <Ionicons name="location-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Location (Optional)
          </Text>
        </View>
        <View style={[styles.locationInputContainer, { 
          backgroundColor: theme.background,
          borderColor: theme.border
        }]}>
          <Ionicons 
            name="location" 
            size={18} 
            color={domain ? domainColor : customColor} 
            style={styles.locationIcon}
          />
          <TextInput
            style={[styles.locationInput, { color: theme.text }]}
            value={location}
            onChangeText={setLocation}
            placeholder="Where will this activity take place?"
            placeholderTextColor={theme.textSecondary}
            onFocus={(event) => scrollToInput(event.target)}
          />
        </View>
      </View>

      {/* Notes */}
      <View style={styles.formGroup}>
        <View style={styles.labelContainer}>
          <Ionicons name="document-text-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Notes (Optional)
          </Text>
        </View>
        <TextInput
          style={[
            styles.notesInput, 
            { 
              color: theme.text, 
              backgroundColor: theme.background, 
              borderColor: theme.border
            }
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any details or notes"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
          onFocus={(event) => scrollToInput(event.target)}
        />
      </View>

      {/* Delete Button (only when editing) */}
      {!isCreating && (
        <TouchableOpacity 
          style={[styles.deleteButton, { backgroundColor: theme.error }]} 
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={{ marginRight: 12 }} />
          <Text style={styles.deleteButtonText}>
            Delete Time Block
          </Text>
        </TouchableOpacity>
      )}
      </View>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={navigationState}
        renderScene={SceneMap({
          [TABS.BASIC]: renderBasicTab,
          [TABS.ADDITIONAL]: renderAdditionalTab
        })}
        onIndexChange={(index) => {
          const newTab = index === 0 ? TABS.BASIC : TABS.ADDITIONAL;
          setActiveTab(newTab);
          setNavigationState(prev => ({ ...prev, index }));
        }}
        initialLayout={{ width: screenWidth }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: theme.primary, height: 3 }}
            style={{ 
              backgroundColor: theme.card,
              shadowColor: 'transparent',
              elevation: 0,
              marginHorizontal: 16,
              marginTop: 16,
              borderRadius: 12
            }}
            labelStyle={{ 
              color: theme.text, 
              fontSize: 14,
              fontWeight: '600',
              textTransform: 'none'
            }}
            activeColor={theme.primary}
            inactiveColor={theme.textSecondary}
            renderIcon={({ route, focused, color }) => (
              <Ionicons
                name={route.key === TABS.BASIC ? 'document-text-outline' : 'options-outline'}
                size={18}
                color={color}
                style={{ marginRight: 8 }}
              />
            )}
            tabStyle={{
              flexDirection: 'row',
              alignItems: 'center'
            }}
          />
        )}
        swipeEnabled={true}
        style={{ flex: 1 }}
      />

      {/* Goal Selector Modal */}
      <GoalSelector
        visible={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        onSelectGoal={handleGoalSelect}
        selectedGoal={selectedGoal}
        goals={availableGoals}
        customColor={customColor}
        theme={theme}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container styles
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginLeft: 12,
  },
  sublabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#888888',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E2E3',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#222222',
  },
  
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    marginBottom: 20,
    padding: 4,
    backgroundColor: '#F0F2F5',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    zIndex: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    height: 'auto',
    width: '46%',
    borderRadius: 8,
    zIndex: 0,
  },
  
  // Tab content styles
  tabContent: {
    flex: 1,
  },
  
  // Selectors (Goal, Project, Task)
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E2E3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemColorBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  selectedItemText: {
    fontSize: 15,
    color: '#333333',
  },
  placeholderText: {
    flex: 1,
    fontSize: 15,
    color: '#888888',
  },
  taskIcon: {
    marginRight: 12,
  },
  progressBadge: {
    backgroundColor: '#4CAF5020',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  
  // Color selector
  colorSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E2E3',
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  colorText: {
    flex: 1,
    fontSize: 15,
    color: '#333333',
  },
  colorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Date styles
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E2E3',
    marginBottom: 10,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#DDD',
    marginRight: 12,
  },
  calendarHeader: {
    backgroundColor: '#F44336',
    padding: 2,
    alignItems: 'center',
  },
  calendarMonth: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  calendarDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    lineHeight: 24,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 15,
    color: '#333333',
    fontWeight: '500',
  },
  dayText: {
    fontSize: 13,
    color: '#888888',
  },
  
  // Time styles
  timeContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E1E2E3',
    backgroundColor: '#F8F9FA',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 13,
    color: '#888888',
    marginBottom: 6,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  timeArrow: {
    marginHorizontal: 12,
  },
  durationContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E1E2E3',
    padding: 12,
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  durationText: {
    fontSize: 14,
    color: '#888888',
  },
  durationValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  quickDurationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  
  // Error styles
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#EA4335',
  },
  
  // Option styles
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  optionContent: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    padding: 4,
  },
  toggleHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  
  // Repeat styles
  frequencyButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  frequencyButton: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  frequencyButtonText: {
    fontSize: 13,
  },
  repeatEndOptions: {
    flexDirection: 'row',
  },
  repeatEndOption: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 4,
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  repeatEndOptionText: {
    fontSize: 13,
  },
  repeatUntilContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repeatUntilDateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  repeatUntilDateText: {
    fontSize: 12,
    marginRight: 4,
  },
  
  // Notification styles
  notificationOptions: {
    marginBottom: 12,
  },
  notificationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 12,
  },
  customTimeInputContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 15,
  },
  customTimeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  customTimeInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    marginRight: 8,
  },
  customTimeLabel: {
    fontSize: 14,
  },
  timePresetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePresetButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 40,
  },
  timePresetText: {
    fontSize: 12,
    fontWeight: '500',
  },
  goalNotificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 10,
  },
  goalNotificationsText: {
    flex: 1,
    fontSize: 13,
  },
  
  // Location styles
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  
  // Notes styles
  notesInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 100,
    backgroundColor: '#F8F9FA',
  },
  
  // Delete button
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EA4335',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Modal styles for GoalSelector
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E2E3',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E2E3',
    backgroundColor: '#F8F9FA',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  goalColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  goalDetails: {
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0F2F1',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  noItemsMessage: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E2E3',
    borderRadius: 8,
    marginBottom: 16,
  },
  noItemsText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
});

export default TimeBlockForm;
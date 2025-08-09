// src/screens/TimeBlockScreen/TimeBlockFormNew.js
import React, { useState, useEffect, useRef } from 'react';
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

const { width } = Dimensions.get('window');

// Goal Selector Component
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
  
  // State for showing goal selector modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Duration state for displaying time block length
  const [duration, setDuration] = useState('');
  
  // Tab navigation state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'basic', title: 'Basic Details' },
    { key: 'additional', title: 'Additional Options' }
  ]);
  
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
  
  // Function to handle quick duration selection
  const handleQuickDuration = (minutes) => {
    const newEndTime = new Date(startTime.getTime());
    newEndTime.setMinutes(startTime.getMinutes() + minutes);
    setEndTime(newEndTime);
  };
  
  // Function to handle goal selection
  const handleGoalSelect = (goal) => {
    if (goal === null) {
      setDomain('');
      setDomainColor(customColor);
    } else {
      setDomain(goal.title);
      setDomainColor(goal.color);
    }
  };

  const renderBasicDetails = () => (
    <ScrollView 
      style={[styles.tabContent, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.formContainer}>
        {/* Title */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Activity Details
          </Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="create-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Title</Text>
            </View>
            <TextInput
              style={[styles.modernInput, { 
                color: theme.text, 
                backgroundColor: theme.card, 
                borderColor: theme.border
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder="What are you planning to do?"
              placeholderTextColor={theme.textSecondary}
            />
          </View>
        </View>
        
        {/* Goal & Project Section */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Link to Goals & Projects
          </Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="flag-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Goal</Text>
              <Text style={[styles.optionalTag, { color: theme.textSecondary }]}>Optional</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.modernSelector, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: domain ? domainColor : theme.border
                }
              ]}
              onPress={() => setShowGoalModal(true)}
              activeOpacity={0.8}
            >
              {domain ? (
                <View style={styles.selectedContent}>
                  <View style={[styles.colorDot, { backgroundColor: domainColor }]} />
                  <Text style={[styles.selectedText, { color: theme.text }]}>
                    {domain}
                  </Text>
                  {selectedGoal && selectedGoal.progress !== undefined && (
                    <View style={[styles.progressChip, { backgroundColor: `${domainColor}15` }]}>
                      <Text style={[styles.progressChipText, { color: domainColor }]}>
                        {selectedGoal.progress}%
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.placeholderContent}>
                  <Ionicons name="add-circle-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                    Select a goal
                  </Text>
                </View>
              )}
              <Ionicons name="chevron-forward-outline" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Color selection for when no goal is selected */}
        {!domain && (
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="color-palette-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Color</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.modernSelector, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border
                }
              ]}
              onPress={openColorModal}
              activeOpacity={0.8}
            >
              <View style={styles.selectedContent}>
                <View style={[styles.colorDot, { backgroundColor: customColor }]} />
                <Text style={[styles.selectedText, { color: theme.text }]}>
                  {customColor.toUpperCase()}
                </Text>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        
        {/* Project Selection */}
        {domain && (
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="folder-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Project</Text>
              <Text style={[styles.optionalTag, { color: theme.textSecondary }]}>Optional</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.modernSelector, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: selectedProject ? domainColor : theme.border,
                  opacity: goalProjects.length > 0 ? 1 : 0.6
                }
              ]}
              onPress={goalProjects.length > 0 ? openProjectModal : null}
              activeOpacity={goalProjects.length > 0 ? 0.8 : 1}
            >
              {selectedProject ? (
                <View style={styles.selectedContent}>
                  <View style={[styles.colorDot, { backgroundColor: selectedProject.color || domainColor }]} />
                  <Text style={[styles.selectedText, { color: theme.text }]}>
                    {selectedProject.title}
                  </Text>
                </View>
              ) : (
                <View style={styles.placeholderContent}>
                  <Ionicons 
                    name={goalProjects.length > 0 ? "add-circle-outline" : "close-circle-outline"} 
                    size={16} 
                    color={theme.textSecondary} 
                  />
                  <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                    {goalProjects.length > 0 ? 'Select a project' : 'No projects available'}
                  </Text>
                </View>
              )}
              {goalProjects.length > 0 && (
                <Ionicons name="chevron-forward-outline" size={16} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Task Selection */}
        {domain && selectedProject && (
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="checkbox-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Task</Text>
              <Text style={[styles.optionalTag, { color: theme.textSecondary }]}>Optional</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.modernSelector, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: selectedTask ? domainColor : theme.border,
                  opacity: projectTasks.length > 0 ? 1 : 0.6
                }
              ]}
              onPress={projectTasks.length > 0 ? openTaskModal : null}
              activeOpacity={projectTasks.length > 0 ? 0.8 : 1}
            >
              {selectedTask ? (
                <View style={styles.selectedContent}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={16} 
                    color={selectedTask.color || domainColor}
                  />
                  <Text style={[styles.selectedText, { color: theme.text }]}>
                    {selectedTask.title}
                  </Text>
                </View>
              ) : (
                <View style={styles.placeholderContent}>
                  <Ionicons 
                    name={projectTasks.length > 0 ? "add-circle-outline" : "close-circle-outline"} 
                    size={16} 
                    color={theme.textSecondary} 
                  />
                  <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>
                    {projectTasks.length > 0 ? 'Select a task' : 'No tasks available'}
                  </Text>
                </View>
              )}
              {projectTasks.length > 0 && (
                <Ionicons name="chevron-forward-outline" size={16} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Date & Time */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Schedule
          </Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="calendar-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Date</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.modernDateSelector, 
                { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border
                }
              ]}
              onPress={openDatePicker}
              activeOpacity={0.8}
            >
              <View style={styles.dateContent}>
                <View style={[styles.miniCalendar, { borderColor: domain ? domainColor : customColor }]}>
                  <View style={[styles.miniCalendarHeader, { backgroundColor: domain ? domainColor : customColor }]}>
                    <Text style={styles.miniCalendarMonth}>
                      {startTime.toLocaleString('default', { month: 'short' })}
                    </Text>
                  </View>
                  <Text style={[styles.miniCalendarDay, { color: theme.text }]}>
                    {startTime.getDate()}
                  </Text>
                </View>
                <View style={styles.dateDetails}>
                  <Text style={[styles.dateMainText, { color: theme.text }]}>
                    {formatDate(startTime)}
                  </Text>
                  <Text style={[styles.dateSubText, { color: theme.textSecondary }]}>
                    {startTime.toLocaleDateString(undefined, { weekday: 'long' })}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="time-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Time</Text>
            </View>
            <View style={[styles.timeCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.timeSelectors}>
                <TouchableOpacity 
                  style={styles.timeSelector} 
                  onPress={openStartTimePicker}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Start</Text>
                  <View style={styles.timeDisplay}>
                    <Text style={[styles.timeText, { color: theme.text }]}>
                      {formatTime(startTime)}
                    </Text>
                  </View>
                </TouchableOpacity>
                
                <View style={styles.timeSeparator}>
                  <Ionicons name="arrow-forward" size={16} color={theme.textSecondary} />
                </View>
                
                <TouchableOpacity 
                  style={styles.timeSelector} 
                  onPress={openEndTimePicker}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>End</Text>
                  <View style={styles.timeDisplay}>
                    <Text style={[styles.timeText, { color: theme.text }]}>
                      {formatTime(endTime)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              <View style={[styles.durationSection, { borderTopColor: theme.border }]}>
                <View style={styles.durationDisplay}>
                  <Ionicons name="hourglass-outline" size={14} color={theme.textSecondary} />
                  <Text style={[styles.durationLabel, { color: theme.textSecondary }]}>Duration</Text>
                  <Text style={[styles.durationValue, { color: theme.text }]}>
                    {duration}
                  </Text>
                </View>
                
                <View style={styles.quickActions}>
                  {[30, 60, 120].map((minutes) => (
                    <TouchableOpacity 
                      key={minutes}
                      style={[styles.quickActionButton, { 
                        backgroundColor: `${domain ? domainColor : customColor}10`,
                        borderColor: `${domain ? domainColor : customColor}30`
                      }]}
                      onPress={() => handleQuickDuration(minutes)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.quickActionText, { color: domain ? domainColor : customColor }]}>
                        {minutes < 60 ? `${minutes}m` : `${minutes/60}h`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
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

  const renderAdditionalOptions = () => (
    <ScrollView 
      style={[styles.tabContent, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.formContainer}>
        {/* Recurring Options */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recurring Options
          </Text>
          
          <View style={styles.toggleGroup}>
            <View style={styles.toggleHeader}>
              <View style={styles.toggleInfo}>
                <Ionicons name="repeat" size={18} color={theme.primary} />
                <Text style={[styles.toggleTitle, { color: theme.text }]}>Repeat Event</Text>
              </View>
              <TouchableOpacity 
                style={[
                  styles.modernToggle,
                  { 
                    backgroundColor: isRepeating ? (domain ? domainColor : customColor) : theme.border
                  }
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsRepeating(!isRepeating);
                }}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.modernToggleHandle,
                  { 
                    backgroundColor: theme.background,
                    transform: [{ translateX: isRepeating ? 22 : 2 }] 
                  }
                ]} />
              </TouchableOpacity>
            </View>
            
            {isRepeating && (
              <View style={[styles.expandedContent, { backgroundColor: theme.card }]}>
                <Text style={[styles.expandedLabel, { color: theme.textSecondary }]}>Frequency</Text>
                <View style={styles.frequencyGrid}>
                  {[
                    { key: 'daily', label: 'Daily', icon: 'calendar' },
                    { key: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
                    { key: 'monthly', label: 'Monthly', icon: 'calendar-clear-outline' }
                  ].map((freq) => (
                    <TouchableOpacity 
                      key={freq.key}
                      style={[
                        styles.frequencyCard, 
                        { 
                          backgroundColor: repeatFrequency === freq.key ? 
                            `${domain ? domainColor : customColor}15` : theme.background,
                          borderColor: repeatFrequency === freq.key ? 
                            (domain ? domainColor : customColor) : theme.border
                        }
                      ]}
                      onPress={() => setRepeatFrequency(freq.key)}
                      activeOpacity={0.8}
                    >
                      <Ionicons 
                        name={freq.icon} 
                        size={18} 
                        color={repeatFrequency === freq.key ? 
                          (domain ? domainColor : customColor) : theme.textSecondary} 
                      />
                      <Text style={[
                        styles.frequencyText, 
                        { color: repeatFrequency === freq.key ? 
                          (domain ? domainColor : customColor) : theme.text }
                      ]}>
                        {freq.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Notifications
          </Text>
          
          <View style={styles.toggleGroup}>
            <View style={styles.toggleHeader}>
              <View style={styles.toggleInfo}>
                <Ionicons name="notifications-outline" size={18} color={theme.primary} />
                <View>
                  <Text style={[styles.toggleTitle, { color: theme.text }]}>Get Reminded</Text>
                  <Text style={[styles.toggleSubtitle, { color: theme.textSecondary }]}>Notify before event starts</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[
                  styles.modernToggle,
                  { 
                    backgroundColor: enableNotification ? (domain ? domainColor : customColor) : theme.border
                  }
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setEnableNotification(!enableNotification);
                }}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.modernToggleHandle,
                  { 
                    backgroundColor: theme.background,
                    transform: [{ translateX: enableNotification ? 22 : 2 }] 
                  }
                ]} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.sectionGroup}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Additional Details
          </Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="location-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Location</Text>
              <Text style={[styles.optionalTag, { color: theme.textSecondary }]}>Optional</Text>
            </View>
            <View style={[styles.modernInputContainer, { 
              backgroundColor: theme.card,
              borderColor: theme.border
            }]}>
              <TextInput
                style={[styles.modernTextInput, { color: theme.text }]}
                value={location}
                onChangeText={setLocation}
                placeholder="Where will this take place?"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Ionicons name="document-text-outline" size={18} color={theme.primary} />
              <Text style={[styles.inputLabel, { color: theme.text }]}>Notes</Text>
              <Text style={[styles.optionalTag, { color: theme.textSecondary }]}>Optional</Text>
            </View>
            <View style={[styles.modernInputContainer, { 
              backgroundColor: theme.card,
              borderColor: theme.border,
              minHeight: 80
            }]}>
              <TextInput
                style={[styles.modernTextArea, { color: theme.text }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any details or notes about this time block"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Danger Zone - Delete (only when editing) */}
        {!isCreating && (
          <View style={styles.sectionGroup}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Danger Zone
            </Text>
            
            <TouchableOpacity 
              style={[styles.modernDeleteButton, { 
                backgroundColor: `${theme.error}15`,
                borderColor: `${theme.error}30`
              }]} 
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={theme.error} />
              <Text style={[styles.modernDeleteText, { color: theme.error }]}>
                Delete Time Block
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );


  return (
    <View style={[styles.container, { backgroundColor: theme.background, overflow: 'hidden' }]}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={SceneMap({
          basic: () => (
            <View style={{ flex: 1, backgroundColor: theme.background }}>
              {renderBasicDetails()}
            </View>
          ),
          additional: () => (
            <View style={{ flex: 1, backgroundColor: theme.background }}>
              {renderAdditionalOptions()}
            </View>
          )
        })}
        onIndexChange={setIndex}
        initialLayout={{ width }}
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
              borderRadius: 12,
              overflow: 'hidden'
            }}
            contentContainerStyle={{
              backgroundColor: 'transparent'
            }}
            tabStyle={{
              backgroundColor: 'transparent'
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
                name={route.key === 'basic' ? 'document-text-outline' : 'options-outline'}
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
        style={{ 
          flex: 1, 
          backgroundColor: 'transparent'
        }}
        sceneContainerStyle={{ 
          backgroundColor: 'transparent'
        }}
      />

      {/* Goal Selector Modal - Only render when visible */}
      {showGoalModal && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  tabContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
    backgroundColor: 'transparent',
  },
  formContainer: {
    backgroundColor: 'transparent',
    padding: 20,
    flex: 1,
  },
  
  // Modern Section Styles
  sectionGroup: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  
  // Modern Input Styles
  inputGroup: {
    marginBottom: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    letterSpacing: 0.2,
  },
  optionalTag: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  modernInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Modern Selector Styles
  modernSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  selectedContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeholderContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  selectedText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.2,
  },
  placeholderText: {
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  progressChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  progressChipText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Modern Date Selector
  modernDateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 56,
  },
  dateContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniCalendar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    marginRight: 12,
  },
  miniCalendarHeader: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 12,
  },
  miniCalendarMonth: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  miniCalendarDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
  },
  dateDetails: {
    flex: 1,
  },
  dateMainText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  dateSubText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    opacity: 0.7,
  },
  
  // Modern Time Card
  timeCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  timeSelectors: {
    flexDirection: 'row',
    padding: 16,
  },
  timeSelector: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    opacity: 0.7,
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timeSeparator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  durationSection: {
    borderTopWidth: 1,
    padding: 16,
    paddingTop: 12,
  },
  durationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  durationLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  durationValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Modern Toggle Styles
  toggleGroup: {
    borderRadius: 12,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    letterSpacing: 0.2,
  },
  toggleSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 12,
    marginTop: 2,
    opacity: 0.7,
  },
  modernToggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
  },
  modernToggleHandle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // Expanded Content
  expandedContent: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  expandedLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    opacity: 0.7,
  },
  frequencyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 64,
    justifyContent: 'center',
  },
  frequencyText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.2,
  },
  
  // Modern Input Container
  modernInputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  modernTextInput: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  modernTextArea: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
    minHeight: 60,
  },
  
  // Modern Delete Button
  modernDeleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  modernDeleteText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.2,
  },
  
  // Modal styles (keeping existing)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  },
  modalItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  goalColorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
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
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  noItemsMessage: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
  },
  noItemsText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TimeBlockForm;
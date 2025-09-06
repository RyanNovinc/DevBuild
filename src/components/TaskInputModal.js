// src/components/TaskInputModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  fontSizes,
  spacing,
  accessibility
} from '../utils/responsive';

const TaskInputModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  onAddToList,
  taskData = {},
  initialValue = '' 
}) => {
  const { theme } = useTheme();
  const { goals, projects } = useAppContext();
  const [taskName, setTaskName] = useState(initialValue);
  const inputRef = useRef(null);
  
  // Enhanced animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const inputFocusAnim = useRef(new Animated.Value(0)).current;

  // Get domain colors for visual indicators
  const selectedGoal = taskData.selectedGoalId === 'standalone' 
    ? { id: 'standalone', title: 'Standalone Task', color: null }
    : goals?.find(g => g.id === taskData.selectedGoalId);
  const selectedProject = taskData.selectedProjectId === 'standalone'
    ? { id: 'standalone', title: 'No Milestone', color: null }
    : projects?.find(p => p.id === taskData.selectedProjectId);

  useEffect(() => {
    if (visible) {
      setTaskName(initialValue);
      // Reset animation values
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      scaleAnim.setValue(0.9);
      
      // Staggered entrance animation
      Animated.sequence([
        // First darken the background
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        // Then slide and scale in the modal
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.bezier(0.4, 0.0, 0.2, 1))
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            useNativeDriver: true,
          })
        ])
      ]).start(() => {
        // Focus input after animation
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      });
    }
  }, [visible]);

  const handleConfirm = () => {
    if (taskName.trim()) {
      if (onAddToList) {
        // Create full task object and add to list directly
        const newTask = {
          id: Date.now().toString(),
          title: taskName.trim(),
          goalId: taskData.selectedGoalId || null,
          goalTitle: taskData.selectedGoalTitle || null,
          projectId: taskData.selectedProjectId || null,
          projectTitle: taskData.selectedProjectTitle || null,
          status: 'todo',
          completed: false
        };
        onAddToList(newTask);
      } else if (onConfirm) {
        // Legacy behavior - just return the task name
        onConfirm(taskName.trim());
      }
      handleClose();
    }
  };

  // Enhanced close with exit animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.sequence([
      // First slide out the content
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]),
      // Then fade out the background
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]).start(() => {
      Keyboard.dismiss();
      setTaskName('');
      inputFocusAnim.setValue(0);
      onClose();
    });
  };

  // Handle input focus animations
  const handleInputFocus = () => {
    Animated.timing(inputFocusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease)
    }).start();
  };

  const handleInputBlur = () => {
    Animated.timing(inputFocusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
      easing: Easing.out(Easing.ease)
    }).start();
  };

  // Calculate focus border color
  const focusBorderColor = inputFocusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.border, selectedGoal?.color || theme.primary]
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacityAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView 
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -50 : 20}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.card,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: theme.background === '#000000' ? 0.3 : 0.15,
                shadowRadius: 20,
                elevation: 12,
              }
            ]}
          >
            {/* Enhanced Header */}
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Ionicons 
                  name="create-outline" 
                  size={scaleWidth(24)} 
                  color={selectedGoal?.color || theme.primary}
                  style={styles.titleIcon}
                />
                <Text style={[
                  styles.title, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.l,
                    fontWeight: '700'
                  }
                ]}>
                  Task Name
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleClose} 
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: theme.inputBackground,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }
                ]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Ionicons name="close" size={scaleWidth(20)} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Domain Color Indicators - Always show when goal is selected */}
            {selectedGoal && (
              <View style={styles.contextContainer}>
                <View style={styles.contextIndicators}>
                  {selectedGoal && (
                    <View style={styles.contextItem}>
                      <View style={[
                        styles.goalDot, 
                        { 
                          backgroundColor: selectedGoal.color || theme.textSecondary,
                          shadowColor: selectedGoal.color || theme.textSecondary,
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.3,
                          shadowRadius: 4,
                          elevation: 3,
                        }
                      ]} />
                      <Text style={[
                        styles.contextText, 
                        { 
                          color: theme.text,
                          fontSize: fontSizes.s,
                          fontWeight: '600',
                          fontStyle: selectedGoal.id === 'standalone' ? 'italic' : 'normal'
                        }
                      ]}>
                        {selectedGoal.title}
                      </Text>
                    </View>
                  )}
                  {selectedProject && (
                    <View style={styles.contextItem}>
                      <View style={[
                        styles.projectDot, 
                        { 
                          backgroundColor: selectedProject.color || selectedGoal?.color || theme.primary,
                          shadowColor: selectedProject.color || selectedGoal?.color || theme.primary,
                          shadowOffset: { width: 0, height: 1 },
                          shadowOpacity: 0.3,
                          shadowRadius: 2,
                          elevation: 2,
                        }
                      ]} />
                      <Text style={[
                        styles.contextText, 
                        { 
                          color: theme.textSecondary,
                          fontSize: fontSizes.xs,
                          fontWeight: '500',
                          fontStyle: selectedProject.id === 'standalone' ? 'italic' : 'normal'
                        }
                      ]}>
                        {selectedProject.title}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Enhanced Input Field */}
            <View style={styles.inputContainer}>
              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    backgroundColor: theme.inputBackground,
                    borderColor: focusBorderColor,
                    shadowColor: selectedGoal?.color || theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: theme.background === '#000000' ? 0.2 : 0.08,
                    shadowRadius: 8,
                    elevation: 4,
                  }
                ]}
              >
                <TextInput
                  ref={inputRef}
                  style={[
                    styles.input,
                    {
                      color: theme.text,
                      fontSize: fontSizes.m,
                      fontWeight: '500'
                    }
                  ]}
                  value={taskName}
                  onChangeText={setTaskName}
                  placeholder="Enter task name"
                  placeholderTextColor={theme.textSecondary + '80'}
                  autoCapitalize="sentences"
                  autoCorrect={true}
                  autoFocus={false}
                  maxLength={200}
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit={true}
                  onSubmitEditing={handleConfirm}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  accessible={true}
                  accessibilityLabel="Task name input"
                  accessibilityHint="Enter the name for your task"
                />
              </Animated.View>
            </View>

            {/* Enhanced Button Container */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.cancelButton, 
                  { 
                    borderColor: theme.border,
                    backgroundColor: theme.inputBackground,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }
                ]}
                onPress={handleClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={[
                  styles.buttonText, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.m,
                    fontWeight: '600'
                  }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  { 
                    opacity: taskName.trim() ? 1 : 0.5,
                    shadowColor: selectedGoal?.color || theme.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 6,
                    overflow: 'hidden'
                  }
                ]}
                onPress={handleConfirm}
                disabled={!taskName.trim()}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={onAddToList ? 'Add to List' : 'Add task'}
              >
                <LinearGradient
                  colors={[
                    selectedGoal?.color || theme.primary,
                    (selectedGoal?.color || theme.primary) + 'DD'
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientButton}
                >
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.buttonHighlight}
                  />
                  <Ionicons 
                    name="add-circle" 
                    size={scaleWidth(20)} 
                    color="#FFFFFF" 
                    style={styles.buttonIcon}
                  />
                  <Text style={[
                    styles.buttonText, 
                    styles.confirmButtonText,
                    {
                      fontSize: fontSizes.m,
                      fontWeight: '700'
                    }
                  ]}>
                    {onAddToList ? 'Add to List' : 'Add'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.m,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    width: '100%',
    minWidth: '100%',
    borderRadius: scaleWidth(16),
    padding: spacing.xl,
    paddingTop: spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
    paddingBottom: spacing.s,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIcon: {
    marginRight: spacing.s,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(8),
    justifyContent: 'center',
    alignItems: 'center',
  },
  contextContainer: {
    marginBottom: spacing.m,
    minHeight: scaleHeight(40),
  },
  contextIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.m,
    marginBottom: spacing.xs,
  },
  contextText: {
    marginLeft: spacing.xs,
  },
  goalDot: {
    width: scaleWidth(12),
    height: scaleWidth(12),
    borderRadius: scaleWidth(6),
  },
  projectDot: {
    width: scaleWidth(8),
    height: scaleWidth(8),
    borderRadius: scaleWidth(4),
  },
  inputContainer: {
    marginBottom: spacing.l,
  },
  inputWrapper: {
    borderWidth: scaleWidth(1.5),
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    minHeight: scaleHeight(64),
    maxHeight: scaleHeight(120),
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.m,
    marginTop: spacing.s,
  },
  button: {
    flex: 1,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: scaleWidth(1.5),
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
  },
  confirmButton: {
    overflow: 'hidden',
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    position: 'relative',
  },
  buttonHighlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '50%',
  },
  buttonIcon: {
    marginRight: spacing.xs,
  },
  buttonText: {
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});

export default TaskInputModal;
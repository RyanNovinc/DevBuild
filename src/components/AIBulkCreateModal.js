// src/components/AIBulkCreateModal.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility
} from '../utils/responsive';

// Import individual form components 
import GoalFormStep from './BulkCreate/GoalFormStep';
import MilestoneFormStep from './BulkCreate/MilestoneFormStep';
import CompletionStep from './BulkCreate/CompletionStep';

const AIBulkCreateModal = ({ 
  visible, 
  onClose, 
  onComplete,
  actions, // Array of actions from AI: [goal, milestone, task, ...]
  color
}) => {
  const { theme } = useTheme();
  const appContext = useAppContext();
  const insets = useSafeAreaInsets();
  
  // Modal animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  
  // Step management
  const [currentStep, setCurrentStep] = useState(0);
  const [completedData, setCompletedData] = useState({});
  const [createdItems, setCreatedItems] = useState({
    goals: [],
    milestones: []
  });
  
  // Calculate total steps based on actions
  const totalSteps = (actions || []).length + 1; // +1 for completion step
  
  // Get current action being processed
  const currentAction = actions && actions[currentStep] ? actions[currentStep] : null;
  
  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Reset to first step when modal opens
      setCurrentStep(0);
      setCompletedData({});
      setCreatedItems({ goals: [], milestones: [] });
      
      // Start animation
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      
      Animated.parallel([
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);
  
  // Close modal with animation
  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };
  
  // Handle step completion
  const handleStepComplete = async (stepData) => {
    console.log(`Step ${currentStep + 1} completed with data:`, stepData);
    
    // Store the data for this step
    const newCompletedData = {
      ...completedData,
      [currentStep]: stepData
    };
    setCompletedData(newCompletedData);
    
    // Create the item for this step
    if (currentAction) {
      try {
        let createdItem = null;
        
        switch (currentAction.type) {
          case 'createGoal':
            createdItem = await createGoal(stepData);
            setCreatedItems(prev => ({
              ...prev,
              goals: [...prev.goals, createdItem]
            }));
            break;
            
          case 'createMilestone':
          case 'createProject':
            createdItem = await createMilestone(stepData);
            setCreatedItems(prev => ({
              ...prev,
              milestones: [...prev.milestones, createdItem]
            }));
            break;
        }
        
        console.log(`Created ${currentAction.type}:`, createdItem);
      } catch (error) {
        console.error(`Error creating ${currentAction.type}:`, error);
        // Could show error message to user here
      }
    }
    
    // Move to next step
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // All steps completed
      handleComplete();
    }
  };
  
  // Handle going back to previous step
  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Create individual items using AppContext
  const createGoal = async (goalData) => {
    const { addGoal } = appContext;
    const newGoal = {
      ...goalData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (typeof addGoal === 'function') {
      await addGoal(newGoal);
      return newGoal;
    }
    throw new Error('addGoal function not available');
  };
  
  const createMilestone = async (milestoneData) => {
    const { addProject, addTasksBulk } = appContext;
    
    // Extract tasks to create separately
    const tasksToCreate = milestoneData.tasks || [];
    
    // Create milestone first (with tasks still in data structure)
    const newMilestone = {
      ...milestoneData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (typeof addProject === 'function') {
      await addProject(newMilestone);
      
      // Add a small delay to allow state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now create separate task entities if we have tasks and addTasksBulk is available
      if (tasksToCreate.length > 0 && typeof addTasksBulk === 'function') {
        const tasksForAppContext = tasksToCreate.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status || 'todo',
          completed: task.completed || false,
          milestoneId: newMilestone.id,
          projectId: newMilestone.id,  // For backward compatibility
          createdAt: task.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        console.log('🔍 Creating separate task entities for milestone:', tasksForAppContext.length);
        console.log('🔍 Tasks to create:', tasksForAppContext);
        console.log('🔍 Milestone being passed as known:', { id: newMilestone.id, title: newMilestone.title });
        
        // Log current context state before creating tasks
        console.log('🔍 AppContext state before task creation:', {
          milestonesCount: appContext.projects?.length || 0,
          tasksCount: appContext.tasks?.length || 0,
          milestoneExists: appContext.projects?.some(m => m.id === newMilestone.id)
        });
        
        // Pass the newly created milestone as a known milestone to bypass state validation
        const taskResult = await addTasksBulk(tasksForAppContext, [newMilestone]);
        
        console.log('🔍 Task creation result:', taskResult?.length || 0, 'tasks created');
        console.log('🔍 AppContext state after task creation:', {
          milestonesCount: appContext.projects?.length || 0,
          tasksCount: appContext.tasks?.length || 0,
          milestoneExists: appContext.projects?.some(m => m.id === newMilestone.id)
        });
        
        // Add another small delay to allow task state to propagate
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      return newMilestone;
    }
    throw new Error('addProject function not available');
  };
  
  
  // Handle completion of entire workflow
  const handleComplete = () => {
    console.log('Bulk creation completed:', createdItems);
    onComplete(createdItems);
    handleClose();
  };
  
  // Render current step component
  const renderCurrentStep = () => {
    if (currentStep >= actions.length) {
      // Completion step
      return (
        <CompletionStep
          createdItems={createdItems}
          onComplete={handleComplete}
          theme={theme}
        />
      );
    }
    
    if (!currentAction) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.error }]}>
            No action data available
          </Text>
        </View>
      );
    }
    
    const existingData = completedData[currentStep] || currentAction.data || {};
    
    switch (currentAction.type) {
      case 'createGoal':
        return (
          <GoalFormStep
            initialData={existingData}
            onComplete={handleStepComplete}
            onBack={currentStep > 0 ? handleStepBack : null}
            theme={theme}
            appContext={appContext}
          />
        );
        
      case 'createMilestone':
      case 'createProject':
        return (
          <MilestoneFormStep
            initialData={existingData}
            onComplete={handleStepComplete}
            onBack={handleStepBack}
            theme={theme}
            appContext={appContext}
            createdGoals={createdItems.goals}
          />
        );
        
      default:
        return (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.error }]}>
              Unknown action type: {currentAction.type}
            </Text>
          </View>
        );
    }
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: backgroundOpacityAnim }
        ]}
      >
        {/* Backdrop areas that close modal */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdropTop} />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <Animated.View 
            style={[
              styles.modalContent,
              { 
                backgroundColor: theme.background,
                transform: [{ translateY: slideAnim }],
                paddingTop: spacing.xl
              }
            ]}
          >
            {/* Header with progress */}
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={handleClose}
                style={styles.closeButton}
                accessible={true}
                accessibilityLabel="Close bulk creation"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
              
              <View style={styles.headerContent}>
                <Text style={[styles.title, { color: theme.text }]}>
                  Create Items
                </Text>
                <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                  Step {currentStep + 1} of {totalSteps}
                </Text>
              </View>
              
              <View style={styles.closeButtonPlaceholder} />
            </View>
            
            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressTrack, { backgroundColor: theme.border }]}>
                <View 
                  style={[
                    styles.progressBar,
                    { 
                      backgroundColor: color || theme.primary,
                      width: `${((currentStep + 1) / totalSteps) * 100}%`
                    }
                  ]}
                />
              </View>
            </View>
            
            {/* Current step content - Remove ScrollView wrapper */}
            <View style={styles.content}>
              {renderCurrentStep()}
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTop: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    minHeight: '85%',
    borderTopLeftRadius: scaleWidth(20),
    borderTopRightRadius: scaleWidth(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: scaleWidth(20),
    minWidth: accessibility.minTouchTarget,
    minHeight: accessibility.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPlaceholder: {
    width: accessibility.minTouchTarget,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing.xxs,
  },
  progressText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
  },
  progressContainer: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.l,
  },
  progressTrack: {
    height: scaleHeight(4),
    borderRadius: scaleHeight(2),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: scaleHeight(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xl,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSizes.m,
    textAlign: 'center',
  },
});

export default AIBulkCreateModal;
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
import { FREE_PLAN_LIMITS } from '../services/SubscriptionConstants';
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
  color,
  showUpgradePrompt // Function to show upgrade modal
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
  
  // Validate subscription limits before starting bulk creation
  const validateSubscriptionLimits = () => {
    const { 
      canAddMoreGoals,
      canAddMoreMilestonesToGoal, 
      userSubscriptionStatus,
      goals = [],
      milestones = [],
      tasks = []
    } = appContext;
    
    if (userSubscriptionStatus !== 'free') {
      return { isValid: true }; // Pro users have no limits
    }
    
    const validationErrors = [];
    
    // Count items to be created
    const goalsToCreate = actions.filter(action => action.type === 'createGoal');
    const milestonesToCreate = actions.filter(action => action.type === 'createMilestone' || action.type === 'createProject');
    const tasksToCreate = actions.filter(action => action.type === 'createTask');
    
    // Check goals limit
    if (goalsToCreate.length > 0) {
      const activeGoals = goals.filter(g => !g.completed);
      const totalGoalsAfter = activeGoals.length + goalsToCreate.length;
      
      if (totalGoalsAfter > FREE_PLAN_LIMITS.MAX_GOALS) {
        validationErrors.push(`Goals: Would exceed limit of ${FREE_PLAN_LIMITS.MAX_GOALS} active goals`);
      }
    }
    
    // Check milestones limit
    if (milestonesToCreate.length > 0) {
      // Group milestones by goalId to check per-goal limits
      const milestonesByGoal = milestonesToCreate.reduce((acc, action) => {
        const goalId = action.data?.goalId || 'standalone';
        acc[goalId] = (acc[goalId] || 0) + 1;
        return acc;
      }, {});
      
      for (const [goalId, count] of Object.entries(milestonesByGoal)) {
        if (goalId === 'standalone') {
          const standaloneMilestones = milestones.filter(m => !m.goalId);
          const totalAfter = standaloneMilestones.length + count;
          
          if (totalAfter > FREE_PLAN_LIMITS.MAX_STANDALONE_MILESTONES) {
            validationErrors.push(`Milestones: Would exceed limit of ${FREE_PLAN_LIMITS.MAX_STANDALONE_MILESTONES} standalone milestones`);
          }
        } else {
          const goalMilestones = milestones.filter(m => m.goalId === goalId);
          const totalAfter = goalMilestones.length + count;
          
          if (totalAfter > FREE_PLAN_LIMITS.MAX_MILESTONES_PER_GOAL) {
            validationErrors.push(`Milestones: Would exceed limit of ${FREE_PLAN_LIMITS.MAX_MILESTONES_PER_GOAL} milestones for goal`);
          }
        }
      }
    }
    
    // Check tasks limit (this is complex for bulk operations, simplified for now)
    if (tasksToCreate.length > 0) {
      // For simplicity, check if creating any tasks would exceed standalone task limits
      const standaloneTasks = tasks.filter(t => !t.milestoneId && !t.goalId);
      if ((standaloneTasks.length + tasksToCreate.length) > FREE_PLAN_LIMITS.MAX_STANDALONE_TASKS) {
        validationErrors.push(`Tasks: Would exceed standalone task limits`);
      }
    }
    
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors
    };
  };
  
  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Validate subscription limits before starting
      const validation = validateSubscriptionLimits();
      if (!validation.isValid && showUpgradePrompt) {
        const errorMessage = `Cannot create all items due to free plan limits:\n\n${validation.errors.join('\n')}\n\nUpgrade to Pro for unlimited items.`;
        showUpgradePrompt(errorMessage);
        onClose(); // Close modal immediately
        return;
      }
      
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
  
  // Handle navigation without creating (preview only)
  const handleStepPreview = (direction) => {
    if (direction === 'next' && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else if (direction === 'prev' && currentStep > 0) {
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
      // Remove pre-generated ID - let AppContext generate it with proper format
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (typeof addProject === 'function') {
      const milestoneResult = await addProject(newMilestone);
      
      // Add a small delay to allow state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now create separate task entities if we have tasks and addTasksBulk is available
      if (tasksToCreate.length > 0 && typeof addTasksBulk === 'function') {
        const tasksForAppContext = tasksToCreate.map(task => ({
          id: task.id,
          title: task.title,
          status: task.status || 'todo',
          completed: task.completed || false,
          milestoneId: milestoneResult.id,  // Use the actual ID generated by AppContext
          projectId: milestoneResult.id,   // For backward compatibility
          createdAt: task.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        
        console.log('🔍 Creating separate task entities for milestone:', tasksForAppContext.length);
        console.log('🔍 Tasks to create:', tasksForAppContext);
        console.log('🔍 Milestone being passed as known:', { id: milestoneResult.id, title: milestoneResult.title });
        
        // Log current context state before creating tasks
        console.log('🔍 AppContext state before task creation:', {
          milestonesCount: appContext.projects?.length || 0,
          tasksCount: appContext.tasks?.length || 0,
          milestoneExists: appContext.projects?.some(m => m.id === milestoneResult.id)
        });
        
        // Pass the newly created milestone as a known milestone to bypass state validation
        const taskResult = await addTasksBulk(tasksForAppContext, [milestoneResult]);
        
        console.log('🔍 Task creation result:', taskResult?.length || 0, 'tasks created');
        console.log('🔍 AppContext state after task creation:', {
          milestonesCount: appContext.projects?.length || 0,
          tasksCount: appContext.tasks?.length || 0,
          milestoneExists: appContext.projects?.some(m => m.id === milestoneResult.id)
        });
        
        // Add another small delay to allow task state to propagate
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      return milestoneResult;
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
                <View style={styles.titleRow}>
                  <TouchableOpacity
                    onPress={() => handleStepPreview('prev')}
                    style={[
                      styles.navArrow,
                      currentStep === 0 && styles.navArrowDisabled
                    ]}
                    disabled={currentStep === 0}
                    accessible={true}
                    accessibilityLabel="Preview previous step"
                    accessibilityRole="button"
                  >
                    <Ionicons 
                      name="chevron-back" 
                      size={20} 
                      color={currentStep === 0 ? theme.textSecondary : theme.text} 
                    />
                  </TouchableOpacity>
                  
                  <Text style={[styles.title, { color: theme.text }]}>
                    Create Items
                  </Text>
                  
                  <TouchableOpacity
                    onPress={() => handleStepPreview('next')}
                    style={[
                      styles.navArrow,
                      currentStep >= totalSteps - 1 && styles.navArrowDisabled
                    ]}
                    disabled={currentStep >= totalSteps - 1}
                    accessible={true}
                    accessibilityLabel="Preview next step"
                    accessibilityRole="button"
                  >
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={currentStep >= totalSteps - 1 ? theme.textSecondary : theme.text} 
                    />
                  </TouchableOpacity>
                </View>
                
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
  },
  navArrow: {
    padding: spacing.xs,
    borderRadius: scaleWidth(16),
    minWidth: accessibility.minTouchTarget / 2,
    minHeight: accessibility.minTouchTarget / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowDisabled: {
    opacity: 0.3,
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
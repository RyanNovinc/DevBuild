// src/screens/TasksScreen/components/KanbanView.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StatusBar, 
  Animated, 
  Platform,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styles } from '../styles';
import KanbanBoard from '../../../components/KanbanBoard';
import CustomEmptyState from './CustomEmptyState';
import EmptyTasksIllustration from '../../../components/illustrations/EmptyTasksIllustration';
import WipEducationModal from '../../../components/WipEducationModal';
import { 
  scaleWidth, 
  scaleHeight, 
  isSmallDevice, 
  isTablet, 
  fontSizes, 
  spacing 
} from '../../../utils/responsive';

const KanbanView = ({ taskScreenProps }) => {
  const {
    theme,
    navigation,
    isDarkMode,
    handleAddProject,
    handleAddTask,
    verifyMilestoneDataConsistency,
    isVerifying,
    getFilteredMilestones,
    getFilteredTasks,
    handleKanbanMilestonePress,
    handleKanbanTaskPress,
    handleUpdateMilestoneProgress,
    handleUpdateTaskStatus,
    kanbanFilter,
    selectedGoalId,
    totalProjectCount,
    totalTaskCount,
    visibleItemCount,
    // Props for full-screen mode
    kanbanFullScreen,
    // Tour props
    isTourMode = false,
    tourScrollPosition = 0,
    setKanbanFullScreen,
    // NEW: View mode state
    viewMode,
    // App settings for WIP limit
    settings,
    // Function to update app settings
    updateAppSetting
  } = taskScreenProps;

  // Get safe area insets for proper positioning
  const insets = useSafeAreaInsets();
  
  // Animation for transitions
  const [fadeAnim] = useState(new Animated.Value(1));
  
  // State for showing/hiding task meta labels
  const [showTaskLabels, setShowTaskLabels] = useState(false);
  
  // State for WIP education modal
  const [showWipEducation, setShowWipEducation] = useState(false);

  // Handle WIP limit changes
  const handleWipLimitChange = (newLimit) => {
    if (updateAppSetting) {
      updateAppSetting('kanbanWipLimit', newLimit);
    }
  };

  // Handle showing WIP education modal
  const handleShowWipEducation = () => {
    setShowWipEducation(true);
  };

  // Set up global toggle function for KanbanBoard to call
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.toggleTaskLabels = () => setShowTaskLabels(!showTaskLabels);
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.toggleTaskLabels;
      }
    };
  }, [showTaskLabels]);

  // Handle animation when toggling full screen
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: kanbanFullScreen ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide/show AI button
    if (typeof window !== 'undefined' && window.setAIButtonVisible) {
      window.setAIButtonVisible(!kanbanFullScreen);
    }
    
    // Dispatch event to notify app about full-screen state
    // For React Native, we'll use a more reliable approach
    if (typeof global !== 'undefined') {
      try {
        // Store the full-screen state globally for React Native
        global.kanbanFullScreen = kanbanFullScreen;
        console.log('KanbanView: Set global.kanbanFullScreen =', kanbanFullScreen);
        
        // Also try the document approach for web environments
        if (typeof document !== 'undefined') {
          const event = new CustomEvent('app-fullscreen-changed', { 
            detail: { fullScreen: kanbanFullScreen } 
          });
          document.dispatchEvent(event);
        }
      } catch (error) {
        console.log('Error dispatching full-screen event:', error);
      }
    }
    
    // Handle status bar
    if (kanbanFullScreen) {
      StatusBar.setHidden(true);
    } else {
      StatusBar.setHidden(false);
      StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
    }

    return () => {
      // Reset when component unmounts
      StatusBar.setHidden(false);
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
      
      // Reset app-wide full-screen state
      if (typeof global !== 'undefined') {
        try {
          global.kanbanFullScreen = false;
          console.log('KanbanView cleanup: Set global.kanbanFullScreen = false');
          
          // Also try the document approach for web environments
          if (typeof document !== 'undefined') {
            const event = new CustomEvent('app-fullscreen-changed', { 
              detail: { fullScreen: false } 
            });
            document.dispatchEvent(event);
          }
        } catch (error) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [kanbanFullScreen]);

  // Custom styles for the kanban columns - enhanced with responsive values
  const kanbanCustomStyles = {
    container: {
      backgroundColor: kanbanFullScreen ? '#1E1E1E' : (isDarkMode ? '#1E1E1E' : '#FFFFFF'),
      borderWidth: 1,
      borderColor: kanbanFullScreen ? '#333333' : (isDarkMode ? '#333333' : '#E0E0E0'),
      borderRadius: 12,
      margin: kanbanFullScreen ? scaleWidth(6) : scaleWidth(4),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: kanbanFullScreen ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: kanbanFullScreen ? 5 : 2,
    },
    header: {
      borderTopLeftRadius: 12,
      borderTopRightRadius: 12,
      borderBottomWidth: 1,
      borderBottomColor: kanbanFullScreen ? '#333333' : (isDarkMode ? '#333333' : '#E0E0E0'),
      backgroundColor: kanbanFullScreen ? '#282828' : (isDarkMode ? '#282828' : '#F5F5F5'),
      padding: spacing.s,
    },
    title: {
      color: kanbanFullScreen ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#333333'),
      fontWeight: '600',
      fontSize: fontSizes.m,
    },
    content: {
      paddingVertical: kanbanFullScreen ? scaleHeight(12) : scaleHeight(8),
      paddingHorizontal: scaleWidth(8),
    },
    // Add styles to hide the add button in columns
    addButton: {
      display: 'none',  // Hide with CSS
      opacity: 0,       // Make it invisible
      height: 0,        // Take up no space
      width: 0,         // Take up no space
      margin: 0,        // No margin
      padding: 0,       // No padding
    }
  };

  // Configure board options to hide add buttons
  const kanbanOptions = {
    hideAddButton: true,           // Global add button
    hideColumnAddButtons: true,    // Column specific add buttons
    disableAddProject: true,       // Disable any add project functionality
    renderAddButton: () => null,   // Return null for any add button render function
    showAddButtons: false          // Turn off any add button flags
  };

  // Determine the right empty state message based on view mode
  const getEmptyStateMessage = () => {
    if (viewMode === 'projects') {
      return selectedGoalId !== 'all'
        ? "No projects linked to this goal yet"
        : "Add projects to visualize your workflow with Kanban";
    } else {
      return selectedGoalId !== 'all'
        ? "No tasks linked to this goal yet"
        : "Add tasks to visualize your workflow with Kanban";
    }
  };

  const getEmptyStateButtonConfig = () => {
    if (viewMode === 'projects') {
      return {
        text: "Create Project",
        handler: () => {
          if (selectedGoalId === 'all') {
            // Show a prompt to select a goal
            if (Array.isArray(taskScreenProps.goalsToShow) && taskScreenProps.goalsToShow.length > 0) {
              const goalOptions = taskScreenProps.goalsToShow.map(goal => ({
                text: goal.title,
                onPress: () => navigation.navigate('ProjectDetails', { 
                  mode: 'create',
                  preselectedGoalId: goal.id
                })
              }));
              
              Alert.alert(
                "Select a Goal",
                "Choose which goal to add this project to:",
                [
                  ...goalOptions,
                  { text: "Cancel", style: "cancel" }
                ]
              );
            } else {
              // No goals available
              Alert.alert(
                "No Goals Available",
                "You need to create a goal before adding projects.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Create Goal", 
                    onPress: () => navigation.navigate('GoalsTab')
                  }
                ]
              );
            }
            return;
          }
          
          // For specific goal view, check if we can add more projects
          if (taskScreenProps.projectLimitReached) {
            // Use upgrade prompt
            if (typeof taskScreenProps.showUpgradePrompt === 'function') {
              taskScreenProps.showUpgradePrompt(
                `You've reached the limit of projects per goal. Upgrade to Pro to create unlimited projects for each goal.`
              );
            }
            return;
          }
          
          // If allowed, navigate to project creation screen
          navigation.navigate('ProjectDetails', { 
            mode: 'create',
            preselectedGoalId: selectedGoalId
          });
        }
      };
    } else {
      return {
        text: "Create Task",
        handler: () => {
          // For "all" view, ask user to select a goal first
          if (selectedGoalId === 'all') {
            // Show a prompt to select a goal
            if (Array.isArray(taskScreenProps.goalsToShow) && taskScreenProps.goalsToShow.length > 0) {
              const goalOptions = taskScreenProps.goalsToShow.map(goal => ({
                text: goal.title,
                onPress: () => {
                  // Check if there are projects for this goal
                  const milestonesForGoal = getFilteredMilestones().filter(m => m.goalId === goal.id);
                    
                  if (milestonesForGoal.length === 0) {
                    Alert.alert(
                      "Task Organization Options",
                      "Add tasks directly to this goal, create a milestone, or add standalone tasks.",
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Create Project", 
                          onPress: () => navigation.navigate('ProjectDetails', { 
                            mode: 'create',
                            preselectedGoalId: goal.id
                          })
                        }
                      ]
                    );
                    return;
                  }
                  
                  // If there's only one project, use it directly
                  if (projectsForGoal.length === 1) {
                    navigation.navigate('ProjectDetails', { 
                      projectId: projectsForGoal[0].id, 
                      mode: 'edit',
                      initialAction: 'addTask'
                    });
                    return;
                  }
                  
                  // Otherwise, let the user select which project
                  const projectOptions = projectsForGoal.map(project => ({
                    text: project.title,
                    onPress: () => {
                      navigation.navigate('ProjectDetails', { 
                        projectId: project.id, 
                        mode: 'edit',
                        initialAction: 'addTask'
                      });
                    }
                  }));
                  
                  Alert.alert(
                    "Select a Project",
                    "Choose which project to add this task to:",
                    [
                      ...projectOptions,
                      { text: "Cancel", style: "cancel" }
                    ]
                  );
                }
              }));
              
              Alert.alert(
                "Select a Goal",
                "Choose which goal to add a task to:",
                [
                  ...goalOptions,
                  { text: "Cancel", style: "cancel" }
                ]
              );
            } else {
              // No goals available
              Alert.alert(
                "Task Organization Options",
                "Create a goal to organize tasks, create milestones, or add standalone tasks.",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Create Goal", 
                    onPress: () => navigation.navigate('GoalsTab')
                  }
                ]
              );
            }
            return;
          }
          
          // For specific goal view, check projects for the goal
          const milestonesForGoal = getFilteredMilestones().filter(milestone => milestone.goalId === selectedGoalId);
          
          if (milestonesForGoal.length === 0) {
            Alert.alert(
              "Task Organization Options",
              "Add tasks directly to this goal, create a milestone, or add standalone tasks.",
              [
                { text: "Cancel", style: "cancel" },
                { 
                  text: "Create Project", 
                  onPress: () => navigation.navigate('ProjectDetails', { 
                    mode: 'create',
                    preselectedGoalId: selectedGoalId
                  })
                }
              ]
            );
            return;
          }
          
          // If there's only one project, use it directly
          if (projectsForGoal.length === 1) {
            navigation.navigate('ProjectDetails', { 
              projectId: projectsForGoal[0].id, 
              mode: 'edit',
              initialAction: 'addTask'
            });
            return;
          }
          
          // Otherwise, let the user select which project
          const projectOptions = projectsForGoal.map(project => ({
            text: project.title,
            onPress: () => {
              navigation.navigate('ProjectDetails', { 
                projectId: project.id, 
                mode: 'edit',
                initialAction: 'addTask'
              });
            }
          }));
          
          Alert.alert(
            "Select a Project",
            "Choose which project to add this task to:",
            [
              ...projectOptions,
              { text: "Cancel", style: "cancel" }
            ]
          );
        }
      };
    }
  };

  const buttonConfig = getEmptyStateButtonConfig();

  // If in full-screen mode, render an absolute positioned view that covers everything
  if (kanbanFullScreen) {
    return (
      <View style={fullScreenStyles.fullScreenContainer}>
        <View style={[
          fullScreenStyles.kanbanContainer, 
          { backgroundColor: '#000000' }
        ]}>
          {/* Exit Full Screen Toggle Button - Bottom Left */}
          <TouchableOpacity
                style={{
                  position: 'absolute', 
                  bottom: 15, 
                  left: 20, 
                  zIndex: 100,
                  backgroundColor: '#333333',
                  borderRadius: 20,
                  padding: 8,
                  minWidth: 44,
                  minHeight: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
                onPress={() => setKanbanFullScreen(false)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Exit full screen"
                accessibilityHint="Returns to normal view"
              >
                <Ionicons 
                  name="contract" 
                  size={scaleWidth(20)} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>

          {/* Full-screen Kanban Board - Always show */}
          <View style={[
            fullScreenStyles.boardContainer,
            { 
              paddingTop: scaleHeight(40),
              paddingBottom: insets.bottom
            }
          ]}>
                {(() => {
                  console.log('🎯 KanbanView (fullscreen): Current viewMode is:', viewMode);
                  return viewMode === 'projects';
                })() ? (
                  <KanbanBoard
                    projects={getFilteredMilestones()}
                    theme={theme}
                    onPressMilestone={handleKanbanMilestonePress}
                    onUpdateMilestoneProgress={handleUpdateMilestoneProgress}
                    filterBy={kanbanFilter}
                    isMilestoneLevel={true}
                    darkMode={isDarkMode}
                    customStyles={kanbanCustomStyles}
                    containerStyle={{ 
                      backgroundColor: '#000000',
                      paddingTop: 0,
                      paddingBottom: insets.bottom
                    }}
                    hideAddButton={true}
                    hideColumnAddButtons={true}
                    options={kanbanOptions}
                        // Pass the selected goal's color if applicable
                    color={selectedGoalId !== 'all' ? 
                      taskScreenProps.goalsToShow.find(g => g.id === selectedGoalId)?.color || theme.primary 
                      : theme.primary}
                    // Pass all projects and goals for color inheritance
                    allMilestones={getFilteredMilestones()}
                    allGoals={taskScreenProps.goalsToShow || []}
                    // Pass WIP limit from settings
                    wipLimit={settings?.kanbanWipLimit || 3}
                    onWipLimitChange={handleWipLimitChange}
                    onShowWipEducation={handleShowWipEducation}
                    // Tour props
                    isTourMode={isTourMode}
                    tourScrollPosition={tourScrollPosition}
                  />
                ) : (
                  (() => {
                    const filteredTasks = getFilteredTasks();
                    console.log('🎯 KanbanView: Passing tasks to KanbanBoard:', filteredTasks.length, 'tasks');
                    console.log('🎯 Sample tasks:', filteredTasks.slice(0, 3).map(t => ({ id: t.id, title: t.title, status: t.status })));
                    return (
                      <KanbanBoard
                        tasks={filteredTasks}
                        theme={theme}
                        onPressTask={handleKanbanTaskPress}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                        onPressAddTask={handleAddTask}
                        filterBy={kanbanFilter}
                        isMilestoneLevel={false}
                        darkMode={isDarkMode}
                        customStyles={kanbanCustomStyles}
                        containerStyle={{ 
                      backgroundColor: '#000000',
                      paddingTop: 0,
                      paddingBottom: insets.bottom
                    }}
                    hideAddButton={false}
                    hideColumnAddButtons={false}
                    options={{...kanbanOptions, hideAddButton: false, hideColumnAddButtons: false}}
                        // Pass the selected goal's color if applicable
                    color={selectedGoalId !== 'all' ? 
                      taskScreenProps.goalsToShow.find(g => g.id === selectedGoalId)?.color || theme.primary 
                      : theme.primary}
                        // Pass all projects and goals for color inheritance
                        allMilestones={getFilteredMilestones()}
                        allGoals={taskScreenProps.goalsToShow || []}
                        showTaskLabels={showTaskLabels}
                        isFullScreen={true}
                        // Pass WIP limit from settings
                        wipLimit={settings?.kanbanWipLimit || 3}
                        onWipLimitChange={handleWipLimitChange}
                        onShowWipEducation={handleShowWipEducation}
                        // Pass navigation for redirecting to LifePlan
                        navigation={navigation}
                        // Tour props
                        isTourMode={isTourMode}
                        tourScrollPosition={tourScrollPosition}
                      />
                    );
                  })()
                )}
          </View>
        </View>

        {/* WIP Education Modal - Include in fullscreen mode */}
        <WipEducationModal
          visible={showWipEducation}
          onClose={() => setShowWipEducation(false)}
          theme={theme}
          isDarkMode={isDarkMode}
        />
      </View>
    );
  }

  // Regular non-full-screen view
  return (
    <View style={[
      styles.kanbanContainer, 
      { backgroundColor: '#000000' } // Explicitly set to black
    ]}>
      {/* Always show Kanban Board for better UX */}
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
            {(() => {
              console.log('🎯 KanbanView: Current viewMode is:', viewMode);
              return viewMode === 'projects';
            })() ? (
              <KanbanBoard
                projects={getFilteredMilestones()}
                theme={theme}
                onPressMilestone={handleKanbanMilestonePress}
                onUpdateMilestoneProgress={handleUpdateMilestoneProgress}
                filterBy={kanbanFilter}
                isMilestoneLevel={true}
                darkMode={isDarkMode}
                customStyles={kanbanCustomStyles}
                containerStyle={{ 
                  backgroundColor: '#000000',
                  paddingBottom: insets.bottom,
                  paddingTop: 0  // Remove extra top padding for more space
                }}
                hideAddButton={true}
                hideColumnAddButtons={true}
                options={kanbanOptions}
                // Pass the selected goal's color if applicable
                color={selectedGoalId !== 'all' ? 
                  taskScreenProps.goalsToShow.find(g => g.id === selectedGoalId)?.color || theme.primary 
                  : theme.primary}
                // Pass all projects and goals for color inheritance
                allMilestones={getFilteredMilestones()}
                allGoals={taskScreenProps.goalsToShow || []}
                // Pass WIP limit from settings
                wipLimit={settings?.kanbanWipLimit || 3}
                onWipLimitChange={handleWipLimitChange}
                onShowWipEducation={handleShowWipEducation}
                // Tour props
                isTourMode={isTourMode}
                tourScrollPosition={tourScrollPosition}
              />
            ) : (
              (() => {
                const filteredTasks = getFilteredTasks();
                console.log('🎯 KanbanView (regular): Passing tasks to KanbanBoard:', filteredTasks.length, 'tasks');
                console.log('🎯 Sample tasks (regular):', filteredTasks.slice(0, 3).map(t => ({ id: t.id, title: t.title, status: t.status })));
                return (
                  <KanbanBoard
                    tasks={filteredTasks}
                    theme={theme}
                onPressTask={handleKanbanTaskPress}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onPressAddTask={handleAddTask}
                filterBy={kanbanFilter}
                isMilestoneLevel={false}
                darkMode={isDarkMode}
                customStyles={kanbanCustomStyles}
                containerStyle={{ 
                  backgroundColor: '#000000',
                  paddingBottom: insets.bottom,
                  paddingTop: 0  // Remove extra top padding for more space
                }}
                hideAddButton={false}
                hideColumnAddButtons={false}
                options={{...kanbanOptions, hideAddButton: false, hideColumnAddButtons: false}}
                // Pass the selected goal's color if applicable
                color={selectedGoalId !== 'all' ? 
                  taskScreenProps.goalsToShow.find(g => g.id === selectedGoalId)?.color || theme.primary 
                  : theme.primary}
                    // Pass all projects and goals for color inheritance
                    allMilestones={getFilteredMilestones()}
                    allGoals={taskScreenProps.goalsToShow || []}
                    showTaskLabels={showTaskLabels}
                    isFullScreen={false}
                    // Pass WIP limit from settings
                    wipLimit={settings?.kanbanWipLimit || 3}
                    onWipLimitChange={handleWipLimitChange}
                    onShowWipEducation={handleShowWipEducation}
                    // Pass navigation for redirecting to LifePlan
                    navigation={navigation}
                    // Tour props
                    isTourMode={isTourMode}
                    tourScrollPosition={tourScrollPosition}
                  />
                );
              })()
            )}
          </View>

          {/* Full Screen Toggle Button - Bottom Left */}
          <TouchableOpacity
            style={{
              position: 'absolute', 
              bottom: insets.bottom - 20, 
              left: 20, 
              zIndex: 100,
              backgroundColor: isDarkMode ? '#333333' : '#FFFFFF',
              borderRadius: 20,
              padding: 8,
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
            }}
            onPress={() => setKanbanFullScreen(true)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Enter full screen"
            accessibilityHint="Expands kanban board to full screen"
          >
            <Ionicons 
              name="expand" 
              size={scaleWidth(20)} 
              color={isDarkMode ? '#FFFFFF' : '#333333'} 
            />
          </TouchableOpacity>
      
      {/* Data Fix Option - Only show in projects view and when there's a data inconsistency */}
      {viewMode === 'projects' && totalProjectCount !== visibleItemCount && getFilteredMilestones().length === 0 && (
        <View style={{ position: 'absolute', bottom: 80, right: 20 }}>
          <TouchableOpacity 
            style={[
              styles.fixDataButton, 
              { backgroundColor: theme.warning || '#ff9800' }
            ]}
            onPress={verifyMilestoneDataConsistency}
            disabled={isVerifying}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Fix project count"
            accessibilityHint="Fixes inconsistencies in project data"
            accessibilityState={{ disabled: isVerifying }}
          >
            <Ionicons 
              name="refresh-circle" 
              size={scaleWidth(18)} 
              color={isDarkMode ? '#000000' : '#FFFFFF'} 
            />
            <Text 
              style={[
                styles.fixDataButtonText, 
                { 
                  color: isDarkMode ? '#000000' : '#FFFFFF',
                  fontSize: fontSizes.s,
                  marginLeft: spacing.xs
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {isVerifying ? 'Checking Data...' : 'Fix Project Count'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WIP Education Modal */}
      <WipEducationModal
        visible={showWipEducation}
        onClose={() => setShowWipEducation(false)}
        theme={theme}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

// Styles specific for full-screen mode
const fullScreenStyles = StyleSheet.create({
  fullScreenContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: '#000000',
    width: '100%',
    height: '100%',
  },
  kanbanContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  toggleButton: {
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 50 : 20, 
    right: 20, 
    zIndex: 100,
    backgroundColor: '#333333',
    borderRadius: 20,
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  boardContainer: {
    flex: 1,
    paddingTop: 0, // Will be set dynamically
    paddingBottom: 0, // Will be set dynamically
  }
});

export default KanbanView;
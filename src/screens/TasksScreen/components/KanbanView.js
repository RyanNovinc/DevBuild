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
    verifyProjectDataConsistency,
    isVerifying,
    getFilteredProjects,
    getFilteredTasks,
    handleKanbanProjectPress,
    handleKanbanTaskPress,
    handleUpdateProjectProgress,
    handleUpdateTaskStatus,
    kanbanFilter,
    selectedGoalId,
    totalProjectCount,
    totalTaskCount,
    visibleItemCount,
    // Props for full-screen mode
    kanbanFullScreen,
    setKanbanFullScreen,
    // NEW: View mode state
    viewMode
  } = taskScreenProps;

  // Get safe area insets for proper positioning
  const insets = useSafeAreaInsets();
  
  // Animation for transitions
  const [fadeAnim] = useState(new Animated.Value(1));

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
                  const projectsForGoal = getFilteredProjects().filter(p => p.goalId === goal.id);
                    
                  if (projectsForGoal.length === 0) {
                    Alert.alert(
                      "No Projects Available",
                      "You need to create a project for this goal before adding tasks.",
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
                "No Goals Available",
                "You need to create a goal before adding tasks.",
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
          const projectsForGoal = getFilteredProjects().filter(project => project.goalId === selectedGoalId);
          
          if (projectsForGoal.length === 0) {
            Alert.alert(
              "No Projects Available",
              "You need to create a project for this goal before adding tasks.",
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
          { backgroundColor: '#121212' }
        ]}>
          {((viewMode === 'projects' && getFilteredProjects().length > 0) || 
            (viewMode === 'tasks' && getFilteredTasks().length > 0)) ? (
            <>
              {/* Full Screen Toggle Button */}
              <TouchableOpacity
                style={[
                  fullScreenStyles.toggleButton,
                  { top: insets.top + scaleHeight(10) }
                ]}
                onPress={() => setKanbanFullScreen(false)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Exit full screen"
                accessibilityHint="Returns to normal view"
              >
                <Ionicons 
                  name="contract" 
                  size={scaleWidth(24)} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>

              {/* Full-screen Kanban Board */}
              <View style={[
                fullScreenStyles.boardContainer,
                { paddingTop: insets.top + scaleHeight(20) }
              ]}>
                {viewMode === 'projects' ? (
                  <KanbanBoard
                    projects={getFilteredProjects()}
                    theme={theme}
                    onPressProject={handleKanbanProjectPress}
                    onUpdateProjectProgress={handleUpdateProjectProgress}
                    filterBy={kanbanFilter}
                    isProjectLevel={true}
                    darkMode={isDarkMode}
                    customStyles={kanbanCustomStyles}
                    containerStyle={{ 
                      backgroundColor: '#121212',
                      paddingTop: scaleHeight(16),
                      paddingBottom: insets.bottom + (Platform.OS === 'ios' ? scaleHeight(20) : scaleHeight(10))
                    }}
                    hideAddButton={true}
                    hideColumnAddButtons={true}
                    options={kanbanOptions}
                        // Pass the selected goal's color if applicable
                    color={selectedGoalId !== 'all' ? 
                      taskScreenProps.goalsToShow.find(g => g.id === selectedGoalId)?.color || theme.primary 
                      : theme.primary}
                    // Pass all projects and goals for color inheritance
                    allProjects={getFilteredProjects()}
                    allGoals={taskScreenProps.goalsToShow || []}
                  />
                ) : (
                  <KanbanBoard
                    tasks={getFilteredTasks()}
                    theme={theme}
                    onPressTask={handleKanbanTaskPress}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    filterBy={kanbanFilter}
                    isProjectLevel={false}
                    darkMode={isDarkMode}
                    customStyles={kanbanCustomStyles}
                    containerStyle={{ 
                      backgroundColor: '#121212',
                      paddingTop: scaleHeight(16),
                      paddingBottom: insets.bottom + (Platform.OS === 'ios' ? scaleHeight(20) : scaleHeight(10))
                    }}
                    hideAddButton={true}
                    hideColumnAddButtons={true}
                    options={kanbanOptions}
                        // Pass the selected goal's color if applicable
                    color={selectedGoalId !== 'all' ? 
                      taskScreenProps.goalsToShow.find(g => g.id === selectedGoalId)?.color || theme.primary 
                      : theme.primary}
                    // Pass all projects and goals for color inheritance
                    allProjects={getFilteredProjects()}
                    allGoals={taskScreenProps.goalsToShow || []}
                  />
                )}
              </View>
            </>
          ) : (
            <View style={[
              styles.kanbanEmptyContainer, 
              { 
                backgroundColor: '#000000'
              }
            ]}>
              <CustomEmptyState
                title={viewMode === 'projects' ? "No Projects Found" : "No Tasks Found"}
                message={getEmptyStateMessage()}
                icon={viewMode === 'projects' ? "folder-open" : "list-outline"}
                iconColor={theme.primary}
                buttonText={buttonConfig.text}
                onButtonPress={buttonConfig.handler}
                theme={theme}
                illustration={<EmptyTasksIllustration theme={theme} viewMode={taskScreenProps.viewMode} />}
                isDarkMode={true}
              />
            </View>
          )}
        </View>
      </View>
    );
  }

  // Regular non-full-screen view
  return (
    <View style={[
      styles.kanbanContainer, 
      { backgroundColor: '#000000' } // Explicitly set to black
    ]}>
      {((viewMode === 'projects' && getFilteredProjects().length > 0) || 
        (viewMode === 'tasks' && getFilteredTasks().length > 0)) ? (
        <>
          {/* Full Screen Toggle Button */}
          <TouchableOpacity
            style={{
              position: 'absolute', 
              top: 10, 
              right: 10, 
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
              size={scaleWidth(24)} 
              color={isDarkMode ? '#FFFFFF' : '#333333'} 
            />
          </TouchableOpacity>

          {/* Regular Kanban Board */}
          <View style={{ flex: 1, backgroundColor: '#000000' }}>
            {viewMode === 'projects' ? (
              <KanbanBoard
                projects={getFilteredProjects()}
                theme={theme}
                onPressProject={handleKanbanProjectPress}
                onUpdateProjectProgress={handleUpdateProjectProgress}
                filterBy={kanbanFilter}
                isProjectLevel={true}
                darkMode={isDarkMode}
                customStyles={kanbanCustomStyles}
                containerStyle={{ 
                  backgroundColor: '#000000',
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
                allProjects={getFilteredProjects()}
                allGoals={taskScreenProps.goalsToShow || []}
              />
            ) : (
              <KanbanBoard
                tasks={getFilteredTasks()}
                theme={theme}
                onPressTask={handleKanbanTaskPress}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                filterBy={kanbanFilter}
                isProjectLevel={false}
                darkMode={isDarkMode}
                customStyles={kanbanCustomStyles}
                containerStyle={{ 
                  backgroundColor: '#000000',
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
                allProjects={getFilteredProjects()}
                allGoals={taskScreenProps.goalsToShow || []}
              />
            )}
          </View>
        </>
      ) : (
        <View style={[styles.kanbanEmptyContainer, { backgroundColor: '#000000' }]}>
          <CustomEmptyState
            title={viewMode === 'projects' ? "No Projects Found" : "No Tasks Found"}
            message={getEmptyStateMessage()}
            icon={viewMode === 'projects' ? "folder-open" : "list-outline"}
            iconColor={theme.primary}
            buttonText={buttonConfig.text}
            onButtonPress={buttonConfig.handler}
            theme={theme}
            illustration={<EmptyTasksIllustration theme={theme} viewMode={taskScreenProps.viewMode} />}
            isDarkMode={isDarkMode}
          />
          
          {/* Data Fix Option - Only show in projects view */}
          {viewMode === 'projects' && totalProjectCount !== visibleItemCount && (
            <TouchableOpacity 
              style={[
                styles.fixDataButton, 
                { backgroundColor: theme.warning || '#ff9800' }
              ]}
              onPress={verifyProjectDataConsistency}
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
          )}
        </View>
      )}
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
    backgroundColor: '#121212',
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
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 0,
  }
});

export default KanbanView;
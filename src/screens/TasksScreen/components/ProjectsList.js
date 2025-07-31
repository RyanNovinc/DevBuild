// src/screens/TasksScreen/components/ProjectsList.js
import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SectionList, Animated, PanResponder, LayoutAnimation, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { styles } from '../styles';
import SectionHeader from './SectionHeader';
import ProjectItem from './ProjectItem';
import TaskItem from '../../../components/TaskItem';
import CustomEmptyState from './CustomEmptyState';
import EmptyTasksIllustration from '../../../components/illustrations/EmptyTasksIllustration';
import { scaleHeight, scaleWidth, fontSizes, spacing, isSmallDevice } from '../../../utils/responsive';

const { height } = Dimensions.get('window');

// Store animation values for project items
const projectAnimations = {};

const ProjectsList = ({ taskScreenProps }) => {
  const {
    theme,
    navigation,
    isDarkMode,
    handleAddProject,
    handleAddTask,
    verifyProjectDataConsistency,
    isVerifying,
    sectionData,
    getCurrentCollapsedSections,
    getTasksForProject,
    toggleSection,
    showProjectActionsMenu,
    showTaskActionsMenu,
    handleChangeProjectStatus,
    selectedGoalId,
    setDraggingProject,
    setActiveProjectSection,
    setIsDragging,
    draggingProject,
    projectLayout,
    setProjectLayout,
    isDragging,
    activeProjectSection,
    totalProjectCount,
    totalTaskCount,
    visibleItemCount,
    isPro,
    showFeatureLimitBanner,
    viewMode, // Current view mode ('projects' or 'tasks')
    projects, // Need access to the projects array
    handleUpdateTaskStatus // For updating task status
  } = taskScreenProps;

  const sectionListRef = useRef(null);
  const panY = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isFirstRender, setIsFirstRender] = useState(true);
  const lastSection = useRef(null);
  const goalsToShow = taskScreenProps.goalsToShow || [];

  // Track sections that were expanded
  const [expandedSections, setExpandedSections] = useState({});
  
  // Initialize animation once on first render
  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    }
  }, []);

  // Set up pan responder for drag and drop
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        panY.setOffset(0);
        panY.setValue(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        // Move the dragged item with the gesture
        panY.setValue(gestureState.dy);
        
        // Don't do anything if we're not in reordering mode
        if (!draggingProject || !activeProjectSection) return;
        
        // Find the section projects
        const sectionProjects = sectionData
          .find(section => section.id === activeProjectSection)?.data || [];
        
        // Get layout for all projects in this section
        const layoutsForSection = Object.values(projectLayout)
          .filter(layout => layout.sectionId === activeProjectSection)
          .sort((a, b) => a.y - b.y);
        
        // Find current position
        const draggedPosition = gestureState.dy + projectLayout[draggingProject.id]?.originalY || 0;
        
        // Determine target position
        let closestIdx = null;
        let minDistance = Infinity;
        
        layoutsForSection.forEach((layout, idx) => {
          if (layout.id === draggingProject.id) return;
          
          const distance = Math.abs(draggedPosition - layout.y);
          if (distance < minDistance) {
            minDistance = distance;
            closestIdx = idx;
          }
        });
        
        // Move other items out of the way
        Object.values(layoutsForSection).forEach(layout => {
          if (layout.id === draggingProject.id) return;
          
          // If this item is below where we want to drop, move it down
          if (closestIdx !== null) {
            const targetY = layoutsForSection[closestIdx].y;
            
            // If this item is below where we want to drop, move it down
            if (layout.y >= targetY && draggedPosition < layout.y) {
              layout.ref?.setNativeProps({
                style: { transform: [{ translateY: scaleHeight(10) }] }
              });
            }
            // If this item is above where we want to drop, move it up
            else if (layout.y <= targetY && draggedPosition > layout.y) {
              layout.ref?.setNativeProps({
                style: { transform: [{ translateY: scaleHeight(-10) }] }
              });
            }
            // Reset position for items not affected
            else {
              layout.ref?.setNativeProps({
                style: { transform: [{ translateY: 0 }] }
              });
            }
          }
        });
        
        // Auto-scroll if near top or bottom of the list
        if (sectionListRef.current) {
          const scrollPosition = scrollY._value;
          const SCROLL_THRESHOLD = scaleHeight(150);
          const SCROLL_SPEED = 5;
          
          if (gestureState.moveY < SCROLL_THRESHOLD) {
            // Auto-scroll up
            sectionListRef.current.scrollToOffset({
              offset: Math.max(0, scrollPosition - SCROLL_SPEED),
              animated: false
            });
          } else if (gestureState.moveY > height - SCROLL_THRESHOLD) {
            // Auto-scroll down
            sectionListRef.current.scrollToOffset({
              offset: scrollPosition + SCROLL_SPEED,
              animated: false
            });
          }
        }
      },
      onPanResponderRelease: () => {
        // Reset all dragging state
        setIsDragging(false);
        setDraggingProject(null);
        setActiveProjectSection(null);
        
        // Reset all items to original position
        Object.values(projectLayout).forEach(layout => {
          layout.ref?.setNativeProps({
            style: { transform: [{ translateY: 0 }] }
          });
        });
      }
    })
  ).current;

  // Handle custom section change with layout animation
  const handleSectionChange = (sectionId) => {
    // Configure a simple layout animation for when sections expand/collapse
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    // Track which sections are expanded
    const currentCollapsedSections = getCurrentCollapsedSections();
    const isCurrentlyCollapsed = currentCollapsedSections[sectionId];
    
    // If we're expanding, add to expanded sections
    if (isCurrentlyCollapsed) {
      setExpandedSections(prev => ({
        ...prev,
        [sectionId]: true
      }));
    }
    
    // Call the original toggle function
    toggleSection(sectionId);
    
    // Remember this section
    lastSection.current = sectionId;
  };

  // Import limits constants
  const { FREE_PLAN_LIMITS } = taskScreenProps;
  const [collapsedProjects, setCollapsedProjects] = useState({});
  
  // Toggle project expand/collapse
  const toggleProjectCollapse = (projectId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Get task limit display text
  const getTaskLimitText = (taskCount) => {
    const taskLimit = FREE_PLAN_LIMITS?.MAX_TASKS_PER_PROJECT || 5;
    return isPro ? `${taskCount}` : `${taskCount}/${taskLimit}`;
  };

  // Render item based on view mode
  const renderItem = ({ item, section, index }) => {
    // Get the current collapsed sections based on selected view
    const currentCollapsedSections = getCurrentCollapsedSections();
    
    // If section is collapsed, don't render
    if (currentCollapsedSections[section.id]) {
      return null;
    }
    
    // If in projects view, render project item
    if (viewMode === 'projects') {
      // Determine if this is the dragged item
      const isBeingDragged = draggingProject && draggingProject.id === item.id;
      
      return (
        <ProjectItem
          item={item}
          section={section}
          navigation={navigation}
          theme={theme}
          getTasksForProject={getTasksForProject}
          showProjectActionsMenu={showProjectActionsMenu}
          handleChangeProjectStatus={handleChangeProjectStatus}
          isBeingDragged={isBeingDragged}
          panY={panY}
          projectLayout={projectLayout}
          setProjectLayout={setProjectLayout}
          panHandlers={isBeingDragged ? panResponder.panHandlers : {}}
        />
      );
    } 
    // If in tasks view and this is a project section within a goal section
    else if (viewMode === 'tasks' && section.isGoal && item.isProject) {
      // If project section has no tasks, don't render it
      if (!item.data || item.data.length === 0) return null;
      
      // Check if this project is collapsed
      const isProjectCollapsed = collapsedProjects[item.id] === true;
      
      // Get task count limit text
      const taskCountText = getTaskLimitText(item.data.length);
      
      // Render project header with tasks beneath it
      return (
        <View style={{
          marginHorizontal: spacing.m,
          marginBottom: spacing.s,
          backgroundColor: '#121212', // Very dark background for true dark theme
          borderRadius: 10,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 3,
        }}>
          {/* Project Header - Made collapsible with vibrant gradient background */}
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: spacing.s,
              borderLeftWidth: 6,
              borderLeftColor: item.color,
              backgroundColor: '#151515', // Slightly lighter than the container for contrast
            }}
            onPress={() => toggleProjectCollapse(item.id)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${item.title} project, ${isProjectCollapsed ? 'collapsed' : 'expanded'}`}
            accessibilityHint={`${isProjectCollapsed ? 'Expand' : 'Collapse'} to ${isProjectCollapsed ? 'show' : 'hide'} ${item.data.length} tasks`}
          >
            {/* Icon with glow effect */}
            <View style={{
              marginRight: spacing.xs,
              borderRadius: 20,
              padding: 4,
              backgroundColor: `${item.color}20`, // Very subtle background glow
            }}>
              <Ionicons 
                name="folder-outline" 
                size={scaleWidth(18)} 
                color={item.color} 
              />
            </View>

            <Text style={{
              fontSize: fontSizes.m,
              fontWeight: '600',
              color: '#FFFFFF', // Pure white for text
              flex: 1
            }} numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>
            
            {/* Task count badge - Updated with limit display */}
            <View style={{
              backgroundColor: `${item.color}20`, // Semi-transparent background based on project color
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 12,
              marginRight: spacing.s,
              borderWidth: 1,
              borderColor: `${item.color}50`, // Slightly more opaque border
            }}>
              <Text style={{
                fontSize: fontSizes.xs,
                fontWeight: 'bold',
                color: item.color
              }}>
                {taskCountText}
              </Text>
            </View>
            
            {/* Progress and chevron indicator */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: fontSizes.s,
                color: item.color,
                marginRight: spacing.xs,
                fontWeight: '500',
              }}>
                {item.progress}%
              </Text>
              <Animated.View style={{
                transform: [{
                  rotate: isProjectCollapsed ? '0deg' : '180deg'
                }]
              }}>
                <Ionicons 
                  name="chevron-down" 
                  size={scaleWidth(16)} 
                  color={item.color} 
                />
              </Animated.View>
            </View>
          </TouchableOpacity>
          
          {/* Tasks for this project - only show if not collapsed */}
          {!isProjectCollapsed && (
            <View style={{
              backgroundColor: '#0A0A0A', // Even darker background for tasks container
              paddingVertical: spacing.xs,
            }}>
              {item.data.map(task => {
                // Compute if task is completed
                const isCompleted = task.completed || task.status === 'done';
                
                return (
                <View key={task.id} style={{ 
                  paddingHorizontal: spacing.s, 
                  paddingVertical: spacing.xs,
                  marginVertical: 4,
                  marginHorizontal: spacing.s,
                  backgroundColor: '#191919', // Slightly lighter than container but darker than header
                  borderRadius: 6,
                  borderLeftWidth: 3,
                  borderLeftColor: item.color,
                  flexDirection: 'row', // Keep row layout for main container
                  alignItems: 'center',
                }}>
                  {/* Custom Task Item implementation to avoid duplicate delete buttons */}
                  <View style={{ 
                    flex: 1, 
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    {/* Checkbox for task completion */}
                    <TouchableOpacity
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        borderWidth: 2,
                        borderColor: item.color,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: isCompleted ? item.color : 'transparent',
                        marginRight: 10,
                      }}
                      onPress={() => {
                        console.log('Task checkbox clicked:', task.id);
                        
                        // Update task status via direct App Context method
                        if (taskScreenProps && taskScreenProps.handleUpdateTaskStatus) {
                          const newStatus = isCompleted ? 'todo' : 'done';
                          console.log(`Setting task ${task.id} to ${newStatus}`);
                          taskScreenProps.handleUpdateTaskStatus(task.id, newStatus);
                        } else {
                          console.error('No update task handler available!', {
                            taskScreenProps: !!taskScreenProps,
                            handleUpdateTaskStatus: !!(taskScreenProps && taskScreenProps.handleUpdateTaskStatus)
                          });
                        }
                      }}
                    >
                      {isCompleted && (
                        <Ionicons name="checkmark" size={16} color="#000000" />
                      )}
                    </TouchableOpacity>
                    
                    {/* Task title */}
                    <Text 
                      style={{
                        color: '#FFFFFF',
                        fontSize: fontSizes.m,
                        flex: 1,
                        textDecorationLine: isCompleted ? 'line-through' : 'none',
                        opacity: isCompleted ? 0.7 : 1,
                      }}
                      numberOfLines={2}
                      onPress={() => {
                        console.log('Task text clicked:', task.id);
                        
                        // Update task status via direct App Context method
                        if (taskScreenProps && taskScreenProps.handleUpdateTaskStatus) {
                          const newStatus = isCompleted ? 'todo' : 'done';
                          console.log(`Setting task ${task.id} to ${newStatus}`);
                          taskScreenProps.handleUpdateTaskStatus(task.id, newStatus);
                        } else {
                          console.error('No update task handler available!', {
                            taskScreenProps: !!taskScreenProps,
                            handleUpdateTaskStatus: !!(taskScreenProps && taskScreenProps.handleUpdateTaskStatus)
                          });
                        }
                      }}
                    >
                      {task.title}
                    </Text>
                  </View>
                  
                  {/* Stacked buttons container */}
                  <View style={{
                    flexDirection: 'column',
                    justifyContent: 'center',
                    marginLeft: 4,
                  }}>
                    {/* Delete button (top) */}
                    <TouchableOpacity
                      style={{ 
                        padding: 6,
                        borderRadius: 14,
                        marginBottom: 2,
                      }}
                      onPress={() => {
                        // Show confirmation dialog
                        Alert.alert(
                          "Delete Task",
                          "Are you sure you want to delete this task?",
                          [
                            { text: "Cancel", style: "cancel" },
                            { 
                              text: "Delete", 
                              style: "destructive",
                              onPress: () => {
                                // If we have a delete task handler, call it
                                if (taskScreenProps.handleDeleteTask) {
                                  taskScreenProps.handleDeleteTask(task.id);
                                } else {
                                  // Otherwise show a notification that deletion isn't available
                                  if (notification && notification.showError) {
                                    notification.showError("Delete functionality not available");
                                  }
                                }
                              }
                            }
                          ]
                        );
                      }}
                      accessibilityLabel="Delete task"
                      accessibilityHint="Permanently remove this task"
                    >
                      <Ionicons
                        name="trash"
                        size={scaleWidth(16)}
                        color="#FF453A" // Red color for delete
                      />
                    </TouchableOpacity>
                    
                    {/* Edit button (bottom) */}
                    <TouchableOpacity
                      style={{ 
                        padding: 6,
                        borderRadius: 14,
                        marginTop: 2,
                      }}
                      onPress={() => navigation.navigate('ProjectDetails', {
                        projectId: item.id, // Navigate to the parent project
                        mode: 'edit',
                        initialTask: task.id // Focus on this specific task
                      })}
                      accessibilityLabel="Edit task"
                      accessibilityHint="Navigate to task details in project"
                    >
                      <Ionicons
                        name="pencil"
                        size={scaleWidth(16)}
                        color={item.color} // Use project color for consistency
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )})}

            </View>
          )}
        </View>
      );
    }
    // This is no longer needed in tasks view as we're using a different rendering structure
    else {
      return null;
    }
  };

  const renderSectionHeader = ({ section }) => {
    // Get the current collapsed sections based on selected view
    const currentCollapsedSections = getCurrentCollapsedSections();
    
    // Only render goal section headers (not project sections)
    if (viewMode === 'tasks' && !section.isGoal) {
      return null;
    }
    
    // Get project count for this goal section if we're in tasks view
    if (viewMode === 'tasks' && section.isGoal) {
      // Count projects for this goal that are actually in the current data
      // This ensures we're counting the actual visible projects in the section
      const projectsForGoal = section.data.length;
      
      // For task view, modify the section to show project count with limit
      const projectLimit = FREE_PLAN_LIMITS?.MAX_PROJECTS_PER_GOAL || 2;
      
      // Create a modified section with updated project count
      const modifiedSection = {
        ...section,
        projectCount: projectsForGoal,
        projectLimit: projectLimit
      };
      
      return (
        <SectionHeader
          section={modifiedSection}
          theme={theme}
          toggleSection={handleSectionChange}
          navigation={navigation}
          isSectionCollapsed={currentCollapsedSections[section.id]}
          isPro={isPro}
          viewMode={viewMode} // Pass current view mode
          onLimitReached={(message) => {
            // This explicit function call makes sure the message gets passed up
            if (typeof showFeatureLimitBanner === 'function') {
              showFeatureLimitBanner(message);
            }
          }}
        />
      );
    }
    
    // Default rendering for projects view
    return (
      <SectionHeader
        section={section}
        theme={theme}
        toggleSection={handleSectionChange}
        navigation={navigation}
        isSectionCollapsed={currentCollapsedSections[section.id]}
        isPro={isPro}
        viewMode={viewMode} // Pass current view mode
        onLimitReached={(message) => {
          // This explicit function call makes sure the message gets passed up
          if (typeof showFeatureLimitBanner === 'function') {
            showFeatureLimitBanner(message);
          }
        }}
      />
    );
  };

  // Prepare accessibility label for the empty state
  const getEmptyStateAccessibilityLabel = () => {
    if (viewMode === 'projects') {
      if (selectedGoalId !== 'all') {
        return "No projects linked to this goal yet. Create a project to get started.";
      }
      return "No projects yet. Projects help you organize your tasks and track progress towards your goals.";
    } else {
      if (selectedGoalId !== 'all') {
        return "No tasks linked to this goal yet. Create a task to get started.";
      }
      return "No tasks yet. Tasks help you track specific items you need to complete.";
    }
  };

  // Get appropriate empty state message based on view mode
  const getEmptyStateMessage = () => {
    if (viewMode === 'projects') {
      return selectedGoalId !== 'all'
        ? "No projects linked to this goal yet"
        : "Projects help you organize your tasks and track progress towards your goals";
    } else {
      return selectedGoalId !== 'all'
        ? "No tasks linked to this goal yet"
        : "Tasks help you track specific items you need to complete";
    }
  };

  // Get appropriate button text and handler based on view mode
  const getEmptyStateButtonConfig = () => {
    if (viewMode === 'projects') {
      return {
        text: "Create Project",
        handler: handleAddProject
      };
    } else {
      return {
        text: "Create Task",
        handler: handleAddTask
      };
    }
  };

  const buttonConfig = getEmptyStateButtonConfig();

  return (
    <SectionList
      ref={sectionListRef}
      sections={sectionData}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={item => item.id}
      stickySectionHeadersEnabled={true}
      contentContainerStyle={[
        styles.projectsList,
        sectionData.length === 0 ? { flex: 1 } : { paddingBottom: scaleHeight(100) }
      ]}
      ListEmptyComponent={
        <View style={[styles.emptyContainer]}>
          <CustomEmptyState
            title={viewMode === 'projects' ? "No Projects Yet" : "No Tasks Yet"}
            message={getEmptyStateMessage()}
            icon={viewMode === 'projects' ? "folder-open" : "list-outline"}
            iconColor={theme.primary}
            buttonText={buttonConfig.text}
            onButtonPress={buttonConfig.handler}
            theme={theme}
            illustration={<EmptyTasksIllustration theme={theme} viewMode={viewMode} />}
            isDarkMode={isDarkMode}
            accessibilityLabel={getEmptyStateAccessibilityLabel()}
          />
          
          {/* Data Fix Option - Only show in projects view */}
          {viewMode === 'projects' && totalProjectCount !== visibleItemCount && (
            <TouchableOpacity 
              style={[
                styles.fixDataButton, 
                { 
                  backgroundColor: theme.warning || '#ff9800',
                  marginTop: spacing.m
                }
              ]}
              onPress={verifyProjectDataConsistency}
              disabled={isVerifying}
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
      }
      // Track scroll position for auto-scrolling during drag
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      // Disable scrolling while dragging
      scrollEnabled={!isDragging}
      // Accessibility props
      accessible={true}
      accessibilityLabel={viewMode === 'projects' ? "Projects list" : "Tasks list"}
      accessibilityHint={viewMode === 'projects' ? "Shows your projects grouped by goals" : "Shows your tasks grouped by goals and projects"}
    />
  );
};

export default ProjectsList;
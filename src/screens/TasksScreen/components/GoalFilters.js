// src/screens/TasksScreen/components/GoalFilters.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Easing, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { styles } from '../styles';

const { width, height } = Dimensions.get('window');

const GoalFilters = ({ 
  selectedGoalId, 
  onGoalSelect, 
  goalsToShow, 
  theme, 
  // New props for milestone filtering
  selectedMilestoneId,
  onMilestoneSelect,
  milestonesForGoal = []
}) => {
  // Reference for the ScrollView
  const scrollViewRef = useRef(null);
  
  // State for dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(height)).current; // Start from bottom
  
  // Track actual modal visibility state for closing animations
  const [modalVisible, setModalVisible] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  
  // iOS-style gesture handler for swipe-to-dismiss
  const handleGesture = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { 
      useNativeDriver: true,
      listener: (event) => {
        const { translationY } = event.nativeEvent;
        // Only allow downward movement (dismissal)
        if (translationY > 0) {
          // More subtle background opacity change - like iOS
          const progress = Math.min(translationY / height, 1);
          const opacity = 1 - (progress * 0.3); // Only dim by 30% max
          fadeAnim.setValue(opacity);
        }
      }
    }
  );

  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    
    // iOS-style dismissal logic: lower threshold + velocity consideration
    const dismissThreshold = height * 0.25; // 25% for bottom sheet
    const fastSwipeVelocity = 1200;
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Set dismissing flag to prevent modal from reopening during animation
      setIsDismissing(true);
      
      // Always use consistent slide-out animation
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height * 1.2, // Animate completely off-screen
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start(({ finished }) => {
        if (finished) {
          setModalVisible(false);
          setIsDismissing(false);
          setShowDropdown(false);
        }
      });
    } else {
      // Quick, bouncy snap back - like iOS
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 150,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic)
        })
      ]).start();
    }
  };
  
  // Single animated scale value for the selected goal
  const selectedScale = useRef(new Animated.Value(1.05)).current;
  
  // Auto-scroll to selected filter
  useEffect(() => {
    if (scrollViewRef.current && selectedGoalId) {
      // Delay slightly to let the UI render
      setTimeout(() => {
        scrollViewRef.current.scrollTo({ 
          x: selectedGoalId === 'all' ? 0 : selectedGoalId.charCodeAt(0) * 20,
          animated: true 
        });
      }, 100);
    }
  }, [selectedGoalId]);

  // Handle opening and closing animations
  useEffect(() => {
    if (showDropdown && !isDismissing) {
      setModalVisible(true);
      
      // Start from completely off-screen bottom
      translateY.setValue(height * 1.2);
      fadeAnim.setValue(0);
      
      // Small delay to ensure values are set before animation
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
            easing: Easing.out(Easing.ease)
          })
        ]).start();
      });
    } else if (!showDropdown && modalVisible && !isDismissing) {
      // Only animate out if we're not already dismissing via gesture
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        Animated.timing(translateY, {
          toValue: height * 1.2,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [showDropdown, modalVisible, isDismissing]);

  // Handle close request with animation
  const closeModal = () => {
    if (modalVisible && showDropdown) {
      setShowDropdown(false);
    }
  };

  // Handle goal selection 
  const handleGoalSelect = (goalId) => {
    // Close dropdown
    closeModal();
    
    // Don't do anything if it's already selected
    if (goalId === selectedGoalId) return;
    
    // Notify parent component
    if (onGoalSelect) {
      onGoalSelect(goalId);
    }
  };

  // Get current goal info for display
  const getCurrentGoalInfo = () => {
    if (selectedGoalId === 'all') {
      return {
        title: 'All Tasks',
        icon: 'apps',
        color: theme.primary
      };
    }
    if (selectedGoalId === 'standalone') {
      return {
        title: 'Standalone',
        icon: 'checkmark-circle-outline',
        color: '#9E9E9E'
      };
    }
    
    const goal = goalsToShow.find(g => g.id === selectedGoalId);
    if (goal) {
      return {
        title: goal.title,
        icon: goal.icon || 'star',
        color: goal.color
      };
    }
    
    return {
      title: 'Filter Tasks by Goal',
      icon: 'chevron-down',
      color: theme.textSecondary
    };
  };

  const currentGoal = getCurrentGoalInfo();

  // Render goal filter button
  const renderGoalFilterButton = (goal) => {
    if (!goal || !goal.id) return null; // Skip invalid goals
    // Skip completed goals
    if (goal.completed) return null;
    
    // Determine if this goal is selected
    const isSelected = selectedGoalId === goal.id;
    
    return (
      <View 
        key={goal.id}
        style={{
          shadowColor: goal.color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isSelected ? 0.3 : 0,
          shadowRadius: 3,
          elevation: isSelected ? 2 : 0,
          marginRight: 8,
          transform: [{ scale: isSelected ? 1.05 : 1 }]
        }}
      >
        <TouchableOpacity 
          style={[
            styles.goalFilterButton,
            isSelected && { 
              backgroundColor: `${goal.color}20`, 
              borderColor: goal.color,
              borderWidth: isSelected ? 1.5 : 1
            },
            { borderColor: theme.border }
          ]}
          onPress={() => handleGoalSelect(goal.id)}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={goal.icon || 'star'} 
            size={16} 
            color={isSelected ? goal.color : theme.textSecondary} 
          />
          <Text 
            style={[
              styles.goalFilterText,
              { color: isSelected ? goal.color : theme.textSecondary }
            ]}
          >
            {goal.title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const isAllSelected = selectedGoalId === 'all';

  return (
    <View style={styles.goalFiltersContainer}>
      {/* Clean Minimalist Filter Button */}
      <View style={{
        paddingHorizontal: 20,
        paddingVertical: 12,
      }}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderRadius: 8,
            paddingHorizontal: 20,
            paddingVertical: 16,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: theme.background === '#000000' ? '#FFFFFF' : '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 3,
            elevation: 1,
          }}
          onPress={() => setShowDropdown(true)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Filter: ${currentGoal.title}`}
          accessibilityHint="Tap to change filter"
        >
          <View style={{
            width: 32,
            height: 32,
            borderRadius: 6,
            backgroundColor: currentGoal.color + '15',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}>
            <Ionicons 
              name={currentGoal.icon} 
              size={16} 
              color={currentGoal.color} 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 15,
              fontWeight: '500',
              color: theme.text,
              lineHeight: 20,
            }}>
              {currentGoal.title}
            </Text>
            <Text style={{
              fontSize: 13,
              color: theme.textSecondary,
              marginTop: 2,
              lineHeight: 16,
            }}>
              Goal Filter Active
            </Text>
          </View>
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 4,
            backgroundColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Ionicons 
              name="options-outline" 
              size={14} 
              color={theme.textSecondary} 
            />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Milestone Filters - Only show when a specific goal is selected */}
      {selectedGoalId && selectedGoalId !== 'all' && selectedGoalId !== 'standalone' && (
        <View style={{
          paddingHorizontal: 16,
          paddingBottom: 8,
          borderTopWidth: 1,
          borderTopColor: theme.border + '30',
          backgroundColor: theme.card + '30',
        }}>
          <Text style={{
            fontSize: 12,
            fontWeight: '600',
            color: theme.textSecondary,
            marginBottom: 8,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Milestones in '{currentGoal.title}'
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {/* All Milestones Button */}
            <TouchableOpacity
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 16,
                backgroundColor: selectedMilestoneId === null ? theme.primary + '20' : theme.card,
                borderWidth: 1,
                borderColor: selectedMilestoneId === null ? theme.primary : theme.border,
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 8,
              }}
              onPress={() => onMilestoneSelect && onMilestoneSelect(null)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Show all milestones"
              accessibilityHint="Shows all items from this goal"
            >
              <Ionicons 
                name="apps" 
                size={14} 
                color={selectedMilestoneId === null ? theme.primary : theme.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={{
                fontSize: 13,
                fontWeight: '500',
                color: selectedMilestoneId === null ? theme.primary : theme.textSecondary,
              }}>
                All Milestones
              </Text>
            </TouchableOpacity>
            
            {/* Individual Milestone Buttons */}
            {Array.isArray(milestonesForGoal) && milestonesForGoal.length > 0 ? milestonesForGoal.map((milestone) => {
              const isMilestoneSelected = selectedMilestoneId === milestone.id;
              
              return (
                <TouchableOpacity
                  key={milestone.id}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: isMilestoneSelected ? milestone.color + '20' : theme.card,
                    borderWidth: 1,
                    borderColor: isMilestoneSelected ? milestone.color : theme.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 8,
                  }}
                  onPress={() => {
                    // Toggle milestone selection - if same milestone clicked, deselect it
                    if (selectedMilestoneId === milestone.id) {
                      onMilestoneSelect && onMilestoneSelect(null);
                    } else {
                      onMilestoneSelect && onMilestoneSelect(milestone.id);
                    }
                  }}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Filter by ${milestone.title} milestone`}
                  accessibilityHint={`Shows only items from the ${milestone.title} milestone`}
                >
                  <Ionicons 
                    name="flag" 
                    size={12} 
                    color={isMilestoneSelected ? milestone.color : theme.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text 
                    style={{
                      fontSize: 13,
                      fontWeight: '500',
                      color: isMilestoneSelected ? milestone.color : theme.textSecondary,
                    }}
                  >
                    {milestone.title}
                  </Text>
                </TouchableOpacity>
              );
            }) : (
              <Text style={{
                color: theme.textSecondary,
                fontSize: 13,
                fontStyle: 'italic',
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}>
                No milestones in this goal
              </Text>
            )}
          </ScrollView>
        </View>
      )}

      {/* Clean Professional Modal */}
      {modalVisible && (
        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="none"
          onRequestClose={closeModal}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            {/* Animated backdrop */}
            <Animated.View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                opacity: fadeAnim
              }}
            >
              <TouchableOpacity 
                style={{ width: '100%', height: '100%' }}
                activeOpacity={1}
                onPress={closeModal}
              />
            </Animated.View>
            
            {/* Modal Content - animated sliding in from bottom with pan gesture */}
            <PanGestureHandler
              onGestureEvent={handleGesture}
              onHandlerStateChange={handleGestureEnd}
              activeOffsetY={[-1000, 5]} // Allow upward but start responding after 5px downward
              activeOffsetX={[-1000, 1000]} // Allow horizontal scrolling
              shouldCancelWhenOutside={false}
              enableTrackpadTwoFingerGesture={false}
            >
              <Animated.View 
                style={{
                  backgroundColor: theme.card,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  paddingTop: 8,
                  paddingBottom: 34,
                  maxHeight: '75%',
                  shadowColor: theme.background === '#000000' ? '#FFFFFF' : '#000000',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 20,
                  transform: [{ translateY: translateY }],
                }}
              >
            {/* Handle Bar */}
            <View style={{
              width: 40,
              height: 4,
              backgroundColor: theme.border,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }} />

            {/* Header */}
            <View style={{
              paddingHorizontal: 24,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}>
              <Text style={{
                fontSize: 20,
                fontWeight: '600',
                color: theme.text,
                textAlign: 'center',
                lineHeight: 28,
              }}>
                Filter Tasks by Goal
              </Text>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={{ paddingHorizontal: 24, paddingTop: 16 }}
            >
              {/* All Tasks Option */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 0,
                  marginBottom: 4,
                }}
                onPress={() => handleGoalSelect('all')}
                activeOpacity={0.6}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: theme.primary + '15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="apps" size={18} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    color: theme.text,
                    fontWeight: '500',
                    lineHeight: 20,
                  }}>
                    All Tasks
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: theme.textSecondary,
                    lineHeight: 18,
                    marginTop: 2,
                  }}>
                    Show all tasks across goals
                  </Text>
                </View>
                {selectedGoalId === 'all' && (
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: theme.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Ionicons name="checkmark" size={12} color={theme.background === '#000000' ? '#000000' : '#FFFFFF'} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Standalone Option */}
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 0,
                  marginBottom: 4,
                }}
                onPress={() => handleGoalSelect('standalone')}
                activeOpacity={0.6}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  backgroundColor: '#9CA3AF15',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#9CA3AF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 16,
                    color: theme.text,
                    fontWeight: '500',
                    lineHeight: 20,
                  }}>
                    Standalone
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: theme.textSecondary,
                    lineHeight: 18,
                    marginTop: 2,
                  }}>
                    Tasks not assigned to any goal
                  </Text>
                </View>
                {selectedGoalId === 'standalone' && (
                  <View style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: '#9CA3AF',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Ionicons name="checkmark" size={12} color={theme.background === '#000000' ? '#000000' : '#FFFFFF'} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Separator */}
              {Array.isArray(goalsToShow) && goalsToShow.length > 0 && (
                <View style={{
                  height: 1,
                  backgroundColor: theme.border,
                  marginVertical: 16,
                }} />
              )}

              {/* Goals */}
              {Array.isArray(goalsToShow) && goalsToShow.map((goal) => {
                const isSelected = selectedGoalId === goal.id;
                return (
                  <TouchableOpacity
                    key={goal.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 16,
                      paddingHorizontal: 0,
                      marginBottom: 4,
                    }}
                    onPress={() => handleGoalSelect(goal.id)}
                    activeOpacity={0.6}
                  >
                    <View style={{
                      width: 40,
                      height: 40,
                      borderRadius: 8,
                      backgroundColor: goal.color + '15',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}>
                      <Ionicons name={goal.icon || 'star'} size={18} color={goal.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        color: theme.text,
                        fontWeight: '500',
                        lineHeight: 20,
                      }}>
                        {goal.title}
                      </Text>
                      <Text style={{
                        fontSize: 14,
                        color: theme.textSecondary,
                        lineHeight: 18,
                        marginTop: 2,
                      }}>
                        Goal-specific tasks
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: goal.color,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Ionicons name="checkmark" size={12} color={theme.background === '#000000' ? '#000000' : '#FFFFFF'} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
              </Animated.View>
            </PanGestureHandler>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default GoalFilters;
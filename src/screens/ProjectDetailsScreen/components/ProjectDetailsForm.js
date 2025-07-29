// src/screens/ProjectDetailsScreen/components/ProjectDetailsForm.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Platform,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { scaleWidth, scaleHeight, fontSizes, spacing } from '../../../utils/responsive';

const ProjectDetailsForm = ({ 
  title,
  setTitle,
  description,
  setDescription,
  color,
  setColor,
  hasDueDate,
  setHasDueDate,
  dueDate,
  showDatePicker,
  setShowDatePicker,
  handleDateChange,
  selectedGoalId,
  setShowGoalSelector,
  getGoalName,
  availableGoals,
  formatDate,
  isCreating,
  handleDelete,
  isLoading,
  theme
}) => {
  // Animation values
  const toggleAnimation = useRef(new Animated.Value(hasDueDate ? 1 : 0)).current;
  const datePickerAnimation = useRef(new Animated.Value(0)).current;
  const toggleScale = useRef(new Animated.Value(1)).current;
  const dateContainerOpacity = useRef(new Animated.Value(hasDueDate ? 1 : 0)).current;
  const dateContainerHeight = useRef(new Animated.Value(hasDueDate ? 1 : 0)).current;
  
  // Date picker mode (calendar or spinner)
  const [datePickerMode, setDatePickerMode] = useState('spinner');

  // Update toggle animation when hasDueDate changes
  useEffect(() => {
    // Animate toggle position
    Animated.timing(toggleAnimation, {
      toValue: hasDueDate ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
      easing: Easing.bezier(0.4, 0.0, 0.2, 1)
    }).start();
    
    // Animate date container separately with JS driver for both
    Animated.parallel([
      Animated.timing(dateContainerOpacity, {
        toValue: hasDueDate ? 1 : 0,
        duration: 200,
        useNativeDriver: false, // Use JS driver for consistency
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(dateContainerHeight, {
        toValue: hasDueDate ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
        easing: Easing.out(Easing.ease)
      })
    ]).start();
    
    // Automatically show date picker when toggling on
    if (hasDueDate) {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
  }, [hasDueDate]);

  // Update date picker animation when showDatePicker changes
  useEffect(() => {
    Animated.timing(datePickerAnimation, {
      toValue: showDatePicker ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // Use JS driver for consistency
      easing: Easing.bezier(0.4, 0.0, 0.2, 1)
    }).start();
  }, [showDatePicker]);

  // Calculate interpolated values for animations
  const toggleTranslateX = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scaleWidth(18)]
  });

  const toggleBackgroundColor = toggleAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.border, color]
  });

  const dateContainerMaxHeight = dateContainerHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scaleHeight(100)]
  });

  // Toggle function with animation
  const toggleDueDate = () => {
    // Animate the toggle scale (use JS driver for all animations on this component)
    Animated.sequence([
      Animated.timing(toggleScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      }),
      Animated.timing(toggleScale, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      }),
      Animated.timing(toggleScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1)
      })
    ]).start();

    // Toggle the due date state
    setHasDueDate(!hasDueDate);
  };

  return (
    <ScrollView 
      style={styles.content}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      accessible={true}
      accessibilityLabel="Project details form"
    >
      {/* Project Details */}
      <View 
        style={[
          styles.card, 
          { 
            backgroundColor: theme.card,
            padding: spacing.m,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: theme.background === '#000000' ? 0.15 : 0.1,
            shadowRadius: 8,
            elevation: 4,
          }
        ]}
      >
        <Text 
          style={[
            styles.sectionTitle, 
            { 
              color: theme.text,
              fontSize: fontSizes.l,
              marginBottom: spacing.m,
              fontWeight: '700'
            }
          ]}
          maxFontSizeMultiplier={1.3}
          accessible={true}
          accessibilityRole="header"
        >
          Project Details
        </Text>
        
        {/* Title */}
        <View style={styles.formGroup}>
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                marginBottom: spacing.xs,
                fontWeight: '500'
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Title
          </Text>
          <TextInput
            style={[
              styles.input, 
              { 
                color: theme.text, 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                fontSize: fontSizes.m,
                padding: spacing.m,
                borderRadius: 12,
              }
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter project title"
            placeholderTextColor={theme.textSecondary}
            maxFontSizeMultiplier={1.3}
            accessible={true}
            accessibilityLabel="Project title"
            accessibilityHint="Enter the title for your project"
          />
        </View>
        
        {/* Goal Association */}
        <View style={styles.formGroup}>
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                marginBottom: spacing.xs,
                fontWeight: '500'
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Associated Goal
          </Text>
          <TouchableOpacity 
            style={[
              styles.goalSelector, 
              { 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                padding: spacing.m,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }
            ]} 
            onPress={() => setShowGoalSelector(true)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={selectedGoalId ? `Selected goal: ${getGoalName()}` : "Select a goal"}
            accessibilityHint="Opens goal selection screen"
          >
            <View style={styles.selectedGoalContainer}>
              {selectedGoalId ? (
                <>
                  <View 
                    style={[
                      styles.goalColorDot, 
                      { 
                        backgroundColor: availableGoals.find(g => g.id === selectedGoalId)?.color || '#4CAF50',
                        width: scaleWidth(14),
                        height: scaleWidth(14),
                        borderRadius: scaleWidth(7),
                        marginRight: spacing.xs
                      }
                    ]} 
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no"
                  />
                  <Text 
                    style={[
                      styles.selectedGoalText, 
                      { 
                        color: theme.text,
                        fontSize: fontSizes.m,
                        fontWeight: '500'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {getGoalName()}
                  </Text>
                </>
              ) : (
                <Text 
                  style={[
                    styles.placeholderText, 
                    { 
                      color: theme.textSecondary,
                      fontSize: fontSizes.m
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Select a goal (optional)
                </Text>
              )}
            </View>
            <Ionicons 
              name="chevron-down" 
              size={scaleWidth(20)} 
              color={theme.textSecondary} 
              accessibilityElementsHidden={true}
              importantForAccessibility="no"
            />
          </TouchableOpacity>
        </View>
        
        {/* Description */}
        <View style={styles.formGroup}>
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                marginBottom: spacing.xs,
                fontWeight: '500'
              }
            ]}
            maxFontSizeMultiplier={1.3}
          >
            Description (Optional)
          </Text>
          <TextInput
            style={[
              styles.input, 
              styles.textArea,
              { 
                color: theme.text, 
                backgroundColor: theme.inputBackground, 
                borderColor: theme.border,
                fontSize: fontSizes.m,
                padding: spacing.m,
                borderRadius: 12,
                minHeight: scaleHeight(100),
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter project description"
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            maxFontSizeMultiplier={1.3}
            accessible={true}
            accessibilityLabel="Project description"
            accessibilityHint="Enter an optional description for your project"
          />
        </View>
        
        {/* Date Toggle */}
        <View style={styles.formGroup}>
          <View style={styles.dateHeaderRow}>
            <Text 
              style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  fontWeight: '500'
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Due Date (Optional)
            </Text>
            <Animated.View
              style={{
                transform: [{ scale: toggleScale }]
              }}
            >
              <TouchableOpacity
                style={styles.dateToggle}
                onPress={toggleDueDate}
                accessible={true}
                accessibilityRole="switch"
                accessibilityLabel="Enable due date"
                accessibilityState={{ checked: hasDueDate }}
                accessibilityHint={hasDueDate ? "Disable due date" : "Enable due date"}
              >
                <Animated.View 
                  style={[
                    styles.toggleTrack, 
                    {
                      width: scaleWidth(44),
                      height: scaleHeight(24),
                      borderRadius: scaleHeight(12),
                      backgroundColor: toggleBackgroundColor
                    }
                  ]}
                >
                  {hasDueDate && (
                    <LinearGradient
                      colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: '50%',
                        borderTopLeftRadius: scaleHeight(12),
                        borderTopRightRadius: scaleHeight(12)
                      }}
                    />
                  )}
                  <Animated.View 
                    style={[
                      styles.toggleHandle, 
                      {
                        width: scaleWidth(20),
                        height: scaleHeight(20),
                        borderRadius: scaleHeight(10),
                        backgroundColor: theme.card,
                        transform: [
                          { translateX: toggleTranslateX }
                        ],
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        elevation: 4
                      }
                    ]} 
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no"
                  />
                </Animated.View>
              </TouchableOpacity>
            </Animated.View>
          </View>
          
          <Animated.View 
            style={{
              opacity: dateContainerOpacity,
              maxHeight: dateContainerMaxHeight,
              overflow: 'hidden',
              marginTop: spacing.s,
              marginBottom: hasDueDate ? spacing.m : 0
            }}
          >
            {hasDueDate && (
              <TouchableOpacity 
                style={[
                  styles.dateInput, 
                  { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: theme.border,
                    padding: spacing.m,
                    borderRadius: 12,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Selected due date: ${formatDate(dueDate)}`}
                accessibilityHint="Opens date picker to change due date"
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons 
                    name="calendar" 
                    size={scaleWidth(20)} 
                    color={color}
                    style={{ marginRight: spacing.s }}
                    accessibilityElementsHidden={true}
                    importantForAccessibility="no"
                  />
                  <Text 
                    style={[
                      styles.dateText, 
                      { 
                        color: theme.text,
                        fontSize: fontSizes.m,
                        fontWeight: '500'
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {formatDate(dueDate)}
                  </Text>
                </View>
                <Ionicons 
                  name="chevron-down" 
                  size={scaleWidth(18)} 
                  color={theme.textSecondary} 
                  accessibilityElementsHidden={true}
                  importantForAccessibility="no"
                />
              </TouchableOpacity>
            )}
          </Animated.View>
          
          {/* Date Picker (iOS) */}
          {Platform.OS === 'ios' && showDatePicker && hasDueDate && (
            <Animated.View 
              style={[
                styles.datePickerContainer,
                {
                  marginTop: spacing.s,
                  borderRadius: 12,
                  backgroundColor: theme.card,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 5,
                  opacity: datePickerAnimation,
                  transform: [
                    { 
                      translateY: datePickerAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }
                  ]
                }
              ]}
              accessible={true}
              accessibilityLabel="Date picker"
              accessibilityHint="Select a due date for your project"
            >
              {/* Picker Mode Selector */}
              <View style={styles.datePickerModeSelector}>
                <TouchableOpacity
                  style={[
                    styles.datePickerModeButton,
                    datePickerMode === 'spinner' && {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderColor: color
                    }
                  ]}
                  onPress={() => setDatePickerMode('spinner')}
                >
                  <Ionicons
                    name="options-outline"
                    size={scaleWidth(18)}
                    color={datePickerMode === 'spinner' ? color : theme.textSecondary}
                  />
                  <Text style={[
                    styles.datePickerModeButtonText,
                    {
                      color: datePickerMode === 'spinner' ? theme.text : theme.textSecondary,
                      marginLeft: spacing.xs
                    }
                  ]}>
                    Wheel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.datePickerModeButton,
                    datePickerMode === 'calendar' && {
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      borderColor: color
                    }
                  ]}
                  onPress={() => setDatePickerMode('calendar')}
                >
                  <Ionicons
                    name="calendar"
                    size={scaleWidth(18)}
                    color={datePickerMode === 'calendar' ? color : theme.textSecondary}
                  />
                  <Text style={[
                    styles.datePickerModeButtonText,
                    {
                      color: datePickerMode === 'calendar' ? theme.text : theme.textSecondary,
                      marginLeft: spacing.xs
                    }
                  ]}>
                    Calendar
                  </Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={dueDate}
                mode="date"
                display={datePickerMode === 'calendar' ? 'inline' : 'spinner'}
                onChange={handleDateChange}
                minimumDate={new Date()}
                themeVariant={theme.background === '#000000' ? 'dark' : 'light'}
              />
              
              <TouchableOpacity
                style={[
                  styles.datePickerDoneButton, 
                  { 
                    backgroundColor: color,
                    padding: spacing.m,
                    borderRadius: 8,
                    marginHorizontal: spacing.m,
                    marginBottom: spacing.m,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 2,
                    elevation: 2
                  }
                ]}
                onPress={() => setShowDatePicker(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Done"
                accessibilityHint="Confirms date selection"
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: 0,
                    height: '50%',
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8
                  }}
                />
                <Text 
                  style={[
                    styles.datePickerDoneText,
                    {
                      fontSize: fontSizes.m,
                      fontWeight: '600',
                      color: '#FFFFFF',
                      textAlign: 'center'
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Date Picker (Android) - opens as modal */}
          {Platform.OS === 'android' && showDatePicker && hasDueDate && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display={datePickerMode === 'calendar' ? 'calendar' : 'spinner'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>
        
        {/* Delete Button (only if editing) */}
        {!isCreating && (
          <TouchableOpacity 
            style={[
              styles.deleteButton, 
              { 
                backgroundColor: theme.errorLight,
                padding: spacing.m,
                borderRadius: 12,
                marginTop: spacing.l,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2
              }
            ]}
            onPress={handleDelete}
            disabled={isLoading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Delete project"
            accessibilityHint="Permanently deletes this project"
            accessibilityState={{ disabled: isLoading }}
          >
            <Ionicons 
              name="trash" 
              size={scaleWidth(20)} 
              color={theme.error} 
              style={{ marginRight: spacing.xs }}
            />
            <Text 
              style={[
                styles.deleteButtonText, 
                { 
                  color: theme.error,
                  fontSize: fontSizes.m,
                  fontWeight: '600',
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Delete Project
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.m,
    paddingBottom: scaleHeight(30),
  },
  card: {
    borderRadius: 16,
    marginBottom: spacing.m,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: spacing.m,
  },
  label: {
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  selectedGoalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  goalSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  goalColorDot: {
    borderRadius: 50,
  },
  selectedGoalText: {
    fontWeight: '500',
  },
  placeholderText: {
    opacity: 0.7,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  dateToggle: {
    padding: spacing.xs,
  },
  toggleTrack: {
    justifyContent: 'center',
    padding: 2,
  },
  toggleHandle: {
    position: 'absolute',
  },
  dateInput: {
    borderWidth: 1,
  },
  datePickerContainer: {
    overflow: 'hidden',
  },
  datePickerModeSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.s,
    gap: spacing.m,
  },
  datePickerModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.m,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  datePickerModeButtonText: {
    fontWeight: '500',
    fontSize: fontSizes.s,
  },
  datePickerDoneButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerDoneText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deleteButtonText: {
    fontWeight: 'bold',
  }
});

export default ProjectDetailsForm;
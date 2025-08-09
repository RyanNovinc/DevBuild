// src/components/AddGoalModal.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Switch,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  meetsContrastRequirements
} from '../utils/responsive';

// Import centralized domain constants
import { STANDARD_DOMAINS, getDomainByName, getDomainByIcon, getUniqueDomainNames } from '../constants/domains';

// Import domain utilities
import { normalizeDomain } from '../utils/domainUtils';

// Import color utils for domain icons
import { getTextColorForBackground } from '../screens/GoalDetailsScreen/utils/colorUtils';
import { formatDate } from '../screens/GoalDetailsScreen/utils/helpers';

const AddGoalModal = ({ 
  visible, 
  onClose, 
  onAdd, 
  goalData,
  color
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Modal animation values
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  
  // Goal state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [selectedColor, setSelectedColor] = useState('#14b8a6');
  const [domain, setDomain] = useState('Other');
  const [hasTargetDate, setHasTargetDate] = useState(false);
  const [targetDate, setTargetDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState(Platform.OS === 'ios' ? 'spinner' : 'default');
  
  // Get unique domain names for display
  const uniqueDomains = getUniqueDomainNames();
  
  // Function to find the best matching domain from STANDARD_DOMAINS with enhanced keyword matching
  const findMatchingDomain = (domainString, goalTitle = '', goalDescription = '') => {
    // Common keywords for each domain
    const domainKeywords = {
      'Career & Work': ['work', 'career', 'job', 'business', 'professional', 'office', 'project', 'presentation', 
              'meeting', 'interview', 'resume', 'promotion', 'skill', 'productivity', 'leadership', 
              'management', 'workplace', 'colleague', 'networking', 'client', 'mentor'],
      'Health & Wellness': ['health', 'fitness', 'exercise', 'workout', 'run', 'marathon', 'gym', 'weight', 'diet', 
                'nutrition', 'sleep', 'wellness', 'meditation', 'yoga', 'training', 'strength', 'cardio',
                'walking', 'cycling', 'swimming', 'jogging', 'sports', 'active', 'athletic', 'energy'],
      'Relationships': ['relationship', 'family', 'friend', 'partner', 'spouse', 'dating', 'marriage', 
                      'parent', 'child', 'sibling', 'relative', 'social', 'connect', 'community', 
                      'communication', 'love', 'trust', 'support', 'bond'],
      'Personal Growth': ['education', 'learn', 'study', 'course', 'class', 'degree', 'school', 'college', 
                  'university', 'knowledge', 'academic', 'student', 'teacher', 'professor', 'lecture', 
                  'book', 'reading', 'certification', 'training', 'skill', 'language', 'personal', 'growth'],
      'Financial Security': ['finance', 'money', 'budget', 'saving', 'invest', 'expense', 'income', 'debt', 'loan', 
                  'mortgage', 'financial', 'bank', 'credit', 'retirement', 'tax', 'fund', 'stock', 'bond', 
                  'payment', 'salary', 'wealth', 'earn'],
      'Recreation & Leisure': ['hobby', 'recreation', 'leisure', 'creative', 'creativity', 'art', 'music', 
                  'instrument', 'paint', 'draw', 'photography', 'craft', 'writing', 'journal', 'travel',
                  'adventure', 'fun', 'entertainment', 'play', 'vacation', 'relax', 'leisure'],
      'Purpose & Meaning': ['purpose', 'meaning', 'spiritual', 'spirituality', 'volunteer', 'cause', 'mission',
                      'values', 'belief', 'faith', 'contribution', 'impact', 'legacy', 'mindfulness',
                      'passion', 'philosophy', 'religion', 'charity', 'community', 'service'],
      'Community & Environment': ['environment', 'organization', 'home', 'clean', 'declutter', 'organize', 'community',
                         'system', 'structure', 'routine', 'space', 'living', 'decor', 'furniture',
                         'renovation', 'maintenance', 'efficiency', 'productivity'],
      'Other': ['general', 'misc', 'other', 'goal', 'plan', 'project', 'task', 'life', 'direction', 
                'vision', 'objective', 'priority', 'progress', 'custom', 'miscellaneous']
    };
    
    console.log(`Trying to match domain with input: "${domainString}", title: "${goalTitle}", desc: "${goalDescription?.substring(0, 30)}..."`);
    
    // If domain string is provided, try direct matching first
    if (domainString) {
      // 1. Try exact match using getDomainByName utility
      const exactMatch = getDomainByName(domainString);
      if (exactMatch) {
        console.log(`Found exact match for domain: ${exactMatch.name}`);
        return exactMatch;
      }
      
      // 2. Try to normalize the domain
      const normalizedInput = domainString.trim().toLowerCase();
      
      // Try partial match with standard domains
      for (const domain of STANDARD_DOMAINS) {
        if (domain.name.toLowerCase().includes(normalizedInput) || 
            normalizedInput.includes(domain.name.toLowerCase())) {
          console.log(`Found partial match for domain: ${domain.name}`);
          return domain;
        }
      }
    }
    
    // 3. Try matching by icon if provided in goalData
    if (goalData && goalData.icon) {
      const domainFromIcon = getDomainByIcon(goalData.icon);
      if (domainFromIcon) {
        const matchedDomain = getDomainByName(domainFromIcon);
        if (matchedDomain) {
          console.log(`Found domain by icon: ${matchedDomain.name}`);
          return matchedDomain;
        }
      }
    }
    
    // 4. Try keyword matching with goal title and description
    if (goalTitle || goalDescription) {
      const combinedText = `${goalTitle} ${goalDescription}`.toLowerCase();
      
      // Check each domain's keywords against the goal text
      let bestDomain = null;
      let bestMatchCount = 0;
      
      for (const domainName in domainKeywords) {
        const keywords = domainKeywords[domainName];
        let matchCount = 0;
        
        for (const keyword of keywords) {
          if (combinedText.includes(keyword.toLowerCase())) {
            matchCount++;
          }
        }
        
        // If this domain has more keyword matches, it becomes the best match
        if (matchCount > bestMatchCount) {
          bestMatchCount = matchCount;
          bestDomain = getDomainByName(domainName);
        }
      }
      
      if (bestDomain && bestMatchCount > 0) {
        console.log(`Found domain ${bestDomain.name} by keyword matching with ${bestMatchCount} keyword matches`);
        return bestDomain;
      }
    }
    
    // 5. Fall back to "Other" domain
    const otherDomain = STANDARD_DOMAINS.find(d => d.name === "Other");
    if (otherDomain) {
      console.log('No match found, defaulting to Other domain');
      return otherDomain;
    }
    
    // 6. Last resort: return first domain as fallback
    console.log(`No Other domain found, using first available domain: ${STANDARD_DOMAINS[0]?.name || 'Unknown'}`);
    return STANDARD_DOMAINS[0];
  };
  
  // Get the current selected domain based on icon
  const getSelectedDomain = () => {
    // If no icon is selected, return null
    if (!selectedIcon) {
      return null;
    }
    // Find domain by matching icon
    const domainName = getDomainByIcon(selectedIcon);
    return domainName;
  };
  
  const selectedDomain = getSelectedDomain();
  
  // Handle domain selection - set both icon and color
  const handleDomainSelect = (domainName) => {
    // Find the domain with this name
    const domainData = getDomainByName(domainName);
    
    if (domainData) {
      setSelectedIcon(domainData.icon);
      setSelectedColor(domainData.color);
      setDomain(domainName);
      console.log(`Domain selected: ${domainName}, icon: ${domainData.icon}, color: ${domainData.color}`);
    }
  };
  
  // Get domain data for display
  const getDomainDisplayData = () => {
    return STANDARD_DOMAINS.map(domain => ({
      name: domain.name,
      originalName: domain.name, // Keep original name for functionality
      icon: domain.icon,
      color: domain.color,
      description: domain.description || ''
    }));
  };
  
  const domainDisplayData = getDomainDisplayData();
  
  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Reset animation values
      backgroundOpacityAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      translateY.setValue(0);
      
      // Animate in with staggered timing for better effect
      Animated.sequence([
        // First darken the background gradually
        Animated.timing(backgroundOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        // Then slide in the content
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();
    }
  }, [visible]);
  
  // Update form when editing an existing goal
  useEffect(() => {
    if (visible && goalData) {
      setTitle(goalData.title || '');
      setDescription(goalData.description || '');
      
      console.log('Goal data received:', JSON.stringify(goalData, null, 2));
      
      // Normalize the goal data to ensure consistent domain representation
      const normalizedGoal = normalizeDomain(goalData);
      
      // Enhanced domain matching logic using both domain string and title/description
      const matchedDomain = findMatchingDomain(
        normalizedGoal.domain, 
        normalizedGoal.title, 
        normalizedGoal.description
      );
      
      if (matchedDomain) {
        // Found a match, use its values
        setDomain(matchedDomain.name);
        setSelectedIcon(matchedDomain.icon);
        setSelectedColor(matchedDomain.color || color || '#4CAF50');
        console.log(`Matched domain for "${normalizedGoal.title}" to "${matchedDomain.name}"`);
      } else {
        // No match found, use normalized values
        setDomain(normalizedGoal.domain || 'Other');
        setSelectedIcon(normalizedGoal.icon || 'star');
        setSelectedColor(normalizedGoal.color || '#14b8a6');
        console.log(`Using normalized domain info: ${normalizedGoal.domain}, icon: ${normalizedGoal.icon}`);
      }
      
      // Set target date if available, else default to false
      setHasTargetDate(normalizedGoal.targetDate ? true : false);
      
      // Initialize the targetDate
      if (normalizedGoal.targetDate) {
        setTargetDate(new Date(normalizedGoal.targetDate));
      } else {
        // Set default target date to 3 months from now
        const defaultDate = new Date();
        defaultDate.setMonth(defaultDate.getMonth() + 3);
        setTargetDate(defaultDate);
      }
    } else if (!visible) {
      // Reset form when closing
      setTitle('');
      setDescription('');
      setSelectedIcon('star');
      setSelectedColor('#14b8a6');
      setDomain('Other');
      setHasTargetDate(false);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      setTargetDate(defaultDate);
    } else if (visible && !goalData) {
      // Creating a new goal - start with Other domain
      setTitle('');
      setDescription('');
      setSelectedIcon('star');
      setSelectedColor('#14b8a6');
      setDomain('Other');
      setHasTargetDate(false);
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      setTargetDate(defaultDate);
    }
  }, [goalData, visible, color]);
  
  // Handle add goal
  const handleAddGoal = () => {
    if (!title.trim()) {
      return; // Don't add empty goals
    }
    
    // Get domain name from icon if no domain is explicitly set
    let domainValue = domain;
    if (!domainValue) {
      domainValue = getDomainByIcon(selectedIcon);
    }
    
    // Create goal object with normalized domain info
    const goalToAdd = {
      ...goalData,
      title: title.trim(),
      description: description.trim(),
      domain: domainValue,
      domainName: domainValue, // Set both for backward compatibility
      icon: selectedIcon,
      color: selectedColor,
      targetDate: hasTargetDate ? targetDate.toISOString() : null,
    };
    
    // Normalize the domain information before sending
    const normalizedGoal = normalizeDomain(goalToAdd);
    
    console.log(`Adding goal with domain: ${normalizedGoal.domain}, icon: ${normalizedGoal.icon}, color: ${normalizedGoal.color}`);
    
    // Call parent handler with the normalized goal data
    onAdd(normalizedGoal);
    
    // Reset form
    setTitle('');
    setDescription('');
    setSelectedIcon('star');
    setSelectedColor('#14b8a6');
    setDomain('Other');
    setHasTargetDate(false);
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep showing on iOS, auto-close on Android
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };
  
  // Handle swipe gesture
  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    const dismissThreshold = screenHeight * 0.2;
    const fastSwipeVelocity = 1200;
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Animate dismiss with reverse order
      Animated.sequence([
        // First slide out the content
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        // Then fade out the background
        Animated.timing(backgroundOpacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start(() => {
        onClose();
      });
    } else {
      // Bounce back
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
    }
  };
  
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );
  
  // Dismiss keyboard when user taps outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Handle close with animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.sequence([
      // First slide out the content
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      // Then fade out the background
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]).start(() => {
      onClose();
    });
  };
  
  // Toggle date picker mode between spinner and calendar
  const toggleDatePickerMode = () => {
    if (Platform.OS === 'ios') {
      setDatePickerMode(datePickerMode === 'spinner' ? 'inline' : 'spinner');
    } else {
      setDatePickerMode(datePickerMode === 'default' ? 'calendar' : 'default');
    }
  };
  
  // Get theme-aware button color
  const buttonColor = selectedColor || color || theme.primary;

  // Calculate minimum touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
      accessibilityViewIsModal={true}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacityAnim
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleGestureEnd(event);
            }
          }}
        >
          <Animated.View
            style={[
              styles.gestureContainer,
              {
                transform: [
                  { translateY: Animated.add(slideAnim, translateY) }
                ]
              }
            ]}
          >
            <KeyboardAvoidingView 
              style={styles.keyboardContainer} 
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
              <View style={[
                styles.modalContent, 
                { 
                  backgroundColor: theme.card,
                  paddingBottom: Math.max(insets.bottom, spacing.m),
                  borderTopLeftRadius: scaleWidth(16),
                  borderTopRightRadius: scaleWidth(16),
                }
              ]}>
                {/* Swipe indicator */}
                <View style={[
                  styles.swipeIndicator,
                  { backgroundColor: theme.textSecondary + '40' }
                ]} />
            <View style={styles.modalHeader}>
              <Text 
                style={[
                  styles.modalTitle, 
                  { 
                    color: theme.text,
                    fontSize: fontSizes.xl
                  }
                ]}
                maxFontSizeMultiplier={1.5}
                accessibilityRole="header"
              >
                {goalData ? 'Edit Goal' : 'Create Goal'}
              </Text>
              <TouchableOpacity 
                style={[
                  styles.closeButton, 
                  { 
                    minWidth: minTouchSize, 
                    minHeight: minTouchSize,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }
                ]} 
                onPress={handleClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                accessibilityHint="Dismisses the goal creation form"
              >
                <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView 
              style={styles.formContainer}
              contentContainerStyle={{ paddingBottom: spacing.l }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
            >
              {/* Goal Title */}
              <Text 
                style={[
                  styles.label, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Goal Title *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                    fontSize: fontSizes.m,
                    paddingHorizontal: spacing.m,
                    paddingVertical: spacing.s,
                    borderRadius: scaleWidth(8)
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter goal title"
                placeholderTextColor={theme.textSecondary}
                autoFocus={false}
                accessible={true}
                accessibilityLabel="Goal title"
                accessibilityHint="Enter the title of your goal"
                maxFontSizeMultiplier={1.8}
              />
              
              {/* Description */}
              <Text 
                style={[
                  styles.label, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Description (Optional)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { 
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                    fontSize: fontSizes.m,
                    paddingHorizontal: spacing.m,
                    paddingVertical: spacing.s,
                    borderRadius: scaleWidth(8),
                    minHeight: scaleHeight(100)
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter goal description"
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                accessible={true}
                accessibilityLabel="Goal description"
                accessibilityHint="Enter a detailed description of your goal"
                maxFontSizeMultiplier={2.0}
              />
              
              {/* Domain Selection - Horizontal Cards */}
              <Text 
                style={[
                  styles.label, 
                  { 
                    color: theme.textSecondary,
                    fontSize: fontSizes.m
                  }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                Choose a Domain
              </Text>
              
              {/* Horizontal Scrolling Domain Layout */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ 
                  height: scaleHeight(140),
                  marginBottom: spacing.m 
                }}
                contentContainerStyle={{ 
                  paddingRight: spacing.xl,
                  alignItems: 'center',
                  paddingVertical: spacing.s
                }}
                accessible={true}
                accessibilityLabel="Domain selection"
                accessibilityHint="Scroll horizontally to select a domain"
                accessibilityRole="scrollbar"
                nestedScrollEnabled={true}
              >
                {domainDisplayData.map((domain) => {
                  // Match the selected domain with the current domain
                  const isSelected = selectedDomain === domain.originalName;
                  
                  return (
                    <TouchableOpacity 
                      key={domain.originalName} 
                      style={[
                        styles.domainCard,
                        {
                          width: scaleWidth(180),
                          height: scaleWidth(120),
                          marginRight: spacing.m, 
                          backgroundColor: isSelected
                            ? `${domain.color}15` 
                            : theme.backgroundSecondary,
                          borderRadius: scaleWidth(10),
                          padding: spacing.s,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: isSelected ? domain.color : 'transparent'
                        }
                      ]}
                      onPress={() => {
                        console.log(`Domain selected: ${domain.originalName}`);
                        handleDomainSelect(domain.originalName);
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${domain.name} domain${isSelected ? ', selected' : ''}`}
                      accessibilityState={{ selected: isSelected }}
                    >
                      {/* Domain icon */}
                      <View style={[
                        styles.domainIcon,
                        { 
                          backgroundColor: domain.color,
                          width: scaleWidth(50),
                          height: scaleWidth(50),
                          borderRadius: scaleWidth(25),
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: spacing.s
                        }
                      ]}>
                        <Ionicons 
                          name={domain.icon} 
                          size={scaleWidth(26)} 
                          color={domain.color === '#FFFFFF' ? '#000000' : getTextColorForBackground(domain.color)} 
                        />
                      </View>
                      
                      {/* Domain name */}
                      <Text 
                        style={[
                          styles.domainName,
                          { 
                            color: isSelected ? domain.color : theme.text,
                            fontSize: fontSizes.s,
                            fontWeight: isSelected ? '600' : '400',
                            textAlign: 'center',
                            height: scaleHeight(44),
                            paddingHorizontal: spacing.s
                          }
                        ]}
                        numberOfLines={2}
                        maxFontSizeMultiplier={1.3}
                      >
                        {domain.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              
              {/* Target Date Toggle */}
              <View style={[
                styles.toggleRow,
                {
                  paddingVertical: spacing.s,
                  minHeight: minTouchSize
                }
              ]}>
                <Text 
                  style={[
                    styles.label, 
                    { 
                      color: theme.textSecondary, 
                      marginBottom: 0,
                      fontSize: fontSizes.m
                    }
                  ]}
                  maxFontSizeMultiplier={1.5}
                >
                  Set Target Date
                </Text>
                <Switch
                  value={hasTargetDate}
                  onValueChange={(value) => {
                    setHasTargetDate(value);
                    if (value) {
                      setShowDatePicker(true);
                    } else {
                      setShowDatePicker(false);
                    }
                  }}
                  trackColor={{ false: theme.border, true: buttonColor + '80' }}
                  thumbColor={hasTargetDate ? buttonColor : '#f4f3f4'}
                  accessible={true}
                  accessibilityRole="switch"
                  accessibilityLabel="Set target date"
                  accessibilityState={{ checked: hasTargetDate }}
                  accessibilityHint={hasTargetDate ? "Toggle off to remove target date" : "Toggle on to set a target date"}
                />
              </View>
              
              {/* Date Picker Section */}
              {hasTargetDate && (
                <View style={styles.dateSection}>
                  <TouchableOpacity
                    style={[
                      styles.dateButton,
                      { 
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.border,
                        paddingHorizontal: spacing.m,
                        paddingVertical: spacing.s,
                        borderRadius: scaleWidth(8),
                        minHeight: minTouchSize
                      }
                    ]}
                    onPress={() => setShowDatePicker(true)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Selected date: ${formatDate(targetDate)}`}
                    accessibilityHint="Opens date picker to select a target date"
                  >
                    <Ionicons name="calendar-outline" size={scaleWidth(20)} color={theme.textSecondary} />
                    <Text 
                      style={[
                        styles.dateButtonText, 
                        { 
                          color: theme.text,
                          fontSize: fontSizes.m,
                          marginLeft: spacing.s
                        }
                      ]}
                      maxFontSizeMultiplier={1.5}
                    >
                      {formatDate(targetDate)}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* Date Picker Mode Selector */}
                  {showDatePicker && (
                    <View style={styles.datePickerModeContainer}>
                      <TouchableOpacity 
                        style={[
                          styles.datePickerModeButton,
                          datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') && {
                            backgroundColor: buttonColor + '20',
                            borderColor: buttonColor
                          }
                        ]}
                        onPress={() => toggleDatePickerMode()}
                      >
                        <Ionicons 
                          name="options-outline" 
                          size={scaleWidth(16)} 
                          color={datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') ? buttonColor : theme.textSecondary} 
                        />
                        <Text style={[
                          styles.datePickerModeText,
                          { 
                            color: datePickerMode === (Platform.OS === 'ios' ? 'spinner' : 'default') ? buttonColor : theme.textSecondary
                          }
                        ]}>
                          Wheel
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[
                          styles.datePickerModeButton,
                          datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') && {
                            backgroundColor: buttonColor + '20',
                            borderColor: buttonColor
                          }
                        ]}
                        onPress={() => toggleDatePickerMode()}
                      >
                        <Ionicons 
                          name="calendar-outline" 
                          size={scaleWidth(16)} 
                          color={datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') ? buttonColor : theme.textSecondary} 
                        />
                        <Text style={[
                          styles.datePickerModeText,
                          { 
                            color: datePickerMode === (Platform.OS === 'ios' ? 'inline' : 'calendar') ? buttonColor : theme.textSecondary
                          }
                        ]}>
                          Calendar
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  
                  {/* Date Picker */}
                  {showDatePicker && (
                    <View style={[
                      styles.datePickerContainer,
                      { 
                        backgroundColor: theme.dark ? '#000000' : '#111111',
                        borderColor: theme.border,
                        borderWidth: 1
                      }
                    ]}>
                      <DateTimePicker
                        value={targetDate}
                        mode="date"
                        display={datePickerMode}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                        themeVariant="dark"
                        accessibilityLabel="Date picker"
                        style={{ height: datePickerMode === 'inline' ? 300 : 200 }}
                        textColor="#FFFFFF"
                      />
                      
                      {/* Done button for iOS */}
                      {Platform.OS === 'ios' && (
                        <TouchableOpacity 
                          style={[
                            styles.doneButton, 
                            { 
                              backgroundColor: buttonColor,
                              paddingVertical: spacing.m
                            }
                          ]}
                          onPress={() => setShowDatePicker(false)}
                        >
                          <Text style={[
                            styles.doneButtonText, 
                            { 
                              color: buttonColor === '#FFFFFF' ? '#000000' : getTextColorForBackground(buttonColor),
                              fontSize: fontSizes.m
                            }
                          ]}>
                            Done
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}
              
              <TouchableOpacity
                style={[
                  styles.addButton, 
                  { 
                    backgroundColor: buttonColor,
                    paddingVertical: spacing.m,
                    borderRadius: scaleWidth(8),
                    marginTop: spacing.l,
                    marginBottom: spacing.l,
                    minHeight: minTouchSize
                  }
                ]}
                onPress={handleAddGoal}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={goalData ? "Update Goal" : "Create Goal"}
                accessibilityHint={goalData ? "Updates the goal with your changes" : "Creates a new goal with your information"}
              >
                <Text 
                  style={[
                    styles.addButtonText,
                    {
                      fontSize: fontSizes.m,
                      color: buttonColor === '#FFFFFF' ? '#000000' : getTextColorForBackground(buttonColor)
                    }
                  ]}
                  maxFontSizeMultiplier={1.5}
                >
                  {goalData ? 'Update Goal' : 'Add Goal'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  overlayTouchable: {
    flex: 1
  },
  gestureContainer: {
    justifyContent: 'flex-end'
  },
  keyboardContainer: {
    justifyContent: 'flex-end'
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  modalContent: {
    padding: spacing.m,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m
  },
  modalTitle: {
    fontWeight: 'bold'
  },
  closeButton: {
    padding: spacing.xxs
  },
  formContainer: {
    marginBottom: Platform.OS === 'ios' ? 0 : spacing.m
  },
  label: {
    marginBottom: spacing.s
  },
  input: {
    borderWidth: 1,
    marginBottom: spacing.m
  },
  textArea: {
    paddingTop: spacing.s
  },
  
  // Domain Selection
  domainCard: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  domainIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  domainName: {
    width: '100%',
    textAlign: 'center',
  },
  
  // Date Section
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  dateSection: {
    marginBottom: spacing.m
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  dateButtonText: {
    flex: 1
  },
  datePickerModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  datePickerModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(20),
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  datePickerModeText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  datePickerContainer: {
    marginTop: spacing.s,
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  doneButton: {
    width: '100%',
    alignItems: 'center',
  },
  doneButtonText: {
    fontWeight: '600',
  },
  
  // Create Button
  addButton: {
    alignItems: 'center',
    marginBottom: spacing.m
  },
  addButtonText: {
    fontWeight: '600'
  }
});

export default AddGoalModal;
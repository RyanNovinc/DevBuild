// src/components/BulkCreate/GoalFormStep.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  ScrollView,
  Switch,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TextInputModal from '../TextInputModal';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  fontSizes,
  accessibility
} from '../../utils/responsive';

// Import centralized domain constants
import { STANDARD_DOMAINS, getDomainByName, getDomainByIcon, getUniqueDomainNames } from '../../constants/domains';

// Import domain utilities
import { normalizeDomain } from '../../utils/domainUtils';

// Import color utils for domain icons
import { getTextColorForBackground } from '../../screens/GoalDetailsScreen/utils/colorUtils';
import { formatDate } from '../../screens/GoalDetailsScreen/utils/helpers';

const GoalFormStep = ({ 
  initialData = {}, 
  onComplete, 
  onBack, 
  theme 
}) => {
  // Goal state
  const [title, setTitle] = useState(initialData.title || '');
  const [description, setDescription] = useState(initialData.description || '');
  const [selectedIcon, setSelectedIcon] = useState(initialData.icon || 'star');
  const [selectedColor, setSelectedColor] = useState(initialData.color || '#14b8a6');
  const [domain, setDomain] = useState(initialData.domain || 'Other');
  const [hasTargetDate, setHasTargetDate] = useState(Boolean(initialData.targetDate));
  const [targetDate, setTargetDate] = useState(
    initialData.targetDate ? new Date(initialData.targetDate) : (() => {
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      return defaultDate;
    })()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Modal states for tappable editing
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showDescriptionModal, setShowDescriptionModal] = useState(false);

  // Debug and sync state when initialData changes
  useEffect(() => {
    console.log('🔍 GoalFormStep initialData changed:', {
      newTitle: initialData?.title,
      newTargetDate: initialData?.targetDate,
      currentHasTargetDate: hasTargetDate,
      currentTargetDate: targetDate
    });
    
    // Update state when initialData changes
    if (initialData?.title && initialData.title !== title) {
      setTitle(initialData.title);
    }
    if (initialData?.description && initialData.description !== description) {
      setDescription(initialData.description);
    }
    
    // Update target date state
    if (initialData?.targetDate) {
      const newDate = new Date(initialData.targetDate);
      if (!hasTargetDate || targetDate.getTime() !== newDate.getTime()) {
        console.log('🔍 Updating goal targetDate from', targetDate, 'to', newDate);
        setHasTargetDate(true);
        setTargetDate(newDate);
      }
    }
  }, [initialData]);
  const [datePickerMode, setDatePickerMode] = useState(Platform.OS === 'ios' ? 'spinner' : 'default');

  // Get unique domain names for display
  const uniqueDomains = getUniqueDomainNames();

  // Function to find the best matching domain from STANDARD_DOMAINS
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
    
    // Try enhanced domain matching logic
    if (domainString) {
      const exactMatch = getDomainByName(domainString);
      if (exactMatch) {
        return exactMatch;
      }
      
      const normalizedInput = domainString.trim().toLowerCase();
      
      // Try partial match with standard domains
      for (const domain of STANDARD_DOMAINS) {
        if (domain.name.toLowerCase().includes(normalizedInput) || 
            normalizedInput.includes(domain.name.toLowerCase())) {
          return domain;
        }
      }
    }
    
    // Try keyword matching with goal title and description
    if (goalTitle || goalDescription) {
      const combinedText = `${goalTitle} ${goalDescription}`.toLowerCase();
      
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
        
        if (matchCount > bestMatchCount) {
          bestMatchCount = matchCount;
          bestDomain = getDomainByName(domainName);
        }
      }
      
      if (bestDomain && bestMatchCount > 0) {
        return bestDomain;
      }
    }
    
    // Fall back to "Other" domain
    const otherDomain = STANDARD_DOMAINS.find(d => d.name === "Other");
    if (otherDomain) {
      return otherDomain;
    }
    
    // Last resort: return first domain as fallback
    return STANDARD_DOMAINS[0];
  };

  // Initialize form with initial data
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      
      // Enhanced domain matching logic using both domain string and title/description
      const matchedDomain = findMatchingDomain(
        initialData.domain, 
        initialData.title, 
        initialData.description
      );
      
      if (matchedDomain) {
        setDomain(matchedDomain.name);
        setSelectedIcon(matchedDomain.icon);
        setSelectedColor(matchedDomain.color);
      } else {
        setDomain(initialData.domain || 'Other');
        setSelectedIcon(initialData.icon || 'star');
        setSelectedColor(initialData.color || '#14b8a6');
      }
      
      setHasTargetDate(initialData.targetDate ? true : false);
      
      if (initialData.targetDate) {
        setTargetDate(new Date(initialData.targetDate));
      }
    }
  }, [initialData]);

  // Get the current selected domain based on icon
  const getSelectedDomain = () => {
    if (!selectedIcon) {
      return null;
    }
    return getDomainByIcon(selectedIcon);
  };

  const selectedDomain = getSelectedDomain();

  // Handle domain selection - set both icon and color
  const handleDomainSelect = (domainName) => {
    const domainData = getDomainByName(domainName);
    
    if (domainData) {
      setSelectedIcon(domainData.icon);
      setSelectedColor(domainData.color);
      setDomain(domainName);
    }
  };

  // Get domain data for display
  const getDomainDisplayData = () => {
    return STANDARD_DOMAINS.map(domain => ({
      name: domain.name,
      originalName: domain.name,
      icon: domain.icon,
      color: domain.color,
      description: domain.description || ''
    }));
  };

  const domainDisplayData = getDomainDisplayData();

  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  // Toggle date picker mode between spinner and calendar
  const toggleDatePickerMode = () => {
    if (Platform.OS === 'ios') {
      setDatePickerMode(datePickerMode === 'spinner' ? 'inline' : 'spinner');
    } else {
      setDatePickerMode(datePickerMode === 'default' ? 'calendar' : 'default');
    }
  };

  // Handle form completion
  const handleComplete = () => {
    if (!title.trim()) {
      return;
    }
    
    // Get domain name from icon if no domain is explicitly set
    let domainValue = domain;
    if (!domainValue) {
      domainValue = getDomainByIcon(selectedIcon);
    }
    
    const goalData = {
      title: title.trim(),
      description: description.trim(),
      domain: domainValue,
      domainName: domainValue,
      icon: selectedIcon,
      color: selectedColor,
      targetDate: hasTargetDate ? targetDate.toISOString() : null,
    };
    
    // Normalize the domain information before sending
    const normalizedGoal = normalizeDomain(goalData);
    
    onComplete(normalizedGoal);
  };

  // Calculate minimum touch target size
  const minTouchSize = Math.max(scaleWidth(44), accessibility.minTouchTarget);
  
  // Get theme-aware button color
  const buttonColor = selectedColor || theme.primary;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.formContainer}
        contentContainerStyle={{ paddingBottom: spacing.xxl * 2 }}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEnabled={true}
        bounces={true}
        nestedScrollEnabled={true}
      >
        {/* Header moved inside ScrollView */}
        <View style={styles.stepHeader}>
          <Text style={[styles.stepTitle, { color: theme.text }]}>
            Create Goal
          </Text>
          <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
            Set up your high-level objective
          </Text>
        </View>
        {/* Goal Title */}
        <View style={[
          styles.inputSection,
          {
            backgroundColor: theme.card,
            padding: spacing.m,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
            shadowRadius: 6,
            elevation: 3,
          }
        ]}>
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                fontWeight: '600',
                marginBottom: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Goal Title *
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              { 
                backgroundColor: theme.inputBackground,
                borderColor: selectedDomain ? 
                  (STANDARD_DOMAINS.find(d => d.name === selectedDomain)?.color || theme.border) : 
                  theme.border,
                borderWidth: 1,
                fontSize: fontSizes.m,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                borderRadius: scaleWidth(12),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: scaleHeight(48)
              }
            ]}
            onPress={() => setShowTitleModal(true)}
            accessible={true}
            accessibilityLabel="Goal title"
            accessibilityHint="Tap to edit the goal title"
            activeOpacity={0.7}
          >
            <Text style={[
              { 
                color: title ? theme.text : theme.textSecondary,
                fontSize: fontSizes.m,
                flex: 1
              }
            ]}>
              {title || 'Enter goal title'}
            </Text>
            <Ionicons name="pencil" size={16} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        
        {/* Description */}
        <View style={[
          styles.inputSection,
          {
            backgroundColor: theme.card,
            padding: spacing.m,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
            shadowRadius: 6,
            elevation: 3,
          }
        ]}>
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                fontWeight: '600',
                marginBottom: spacing.xs
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            Description (Optional)
          </Text>
          <TouchableOpacity
            style={[
              styles.input,
              styles.textArea,
              { 
                backgroundColor: theme.inputBackground,
                borderColor: selectedDomain ? 
                  (STANDARD_DOMAINS.find(d => d.name === selectedDomain)?.color || theme.border) : 
                  theme.border,
                borderWidth: 1,
                fontSize: fontSizes.m,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.s,
                borderRadius: scaleWidth(12),
                minHeight: scaleHeight(100),
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }
            ]}
            onPress={() => setShowDescriptionModal(true)}
            accessible={true}
            accessibilityLabel="Goal description"
            accessibilityHint="Tap to edit the goal description"
            activeOpacity={0.7}
          >
            <Text style={[
              { 
                color: description ? theme.text : theme.textSecondary,
                fontSize: fontSizes.m,
                flex: 1,
                paddingTop: spacing.xs
              }
            ]} numberOfLines={4}>
              {description || 'Enter goal description'}
            </Text>
            <Ionicons name="pencil" size={16} color={theme.textSecondary} style={{ marginTop: spacing.xs }} />
          </TouchableOpacity>
        </View>
        
        {/* Domain Selection - Horizontal Cards */}
        <View style={[
          styles.inputSection,
          {
            backgroundColor: theme.card,
            padding: spacing.m,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
            shadowRadius: 6,
            elevation: 3,
          }
        ]}>
          <Text 
            style={[
              styles.label, 
              { 
                color: theme.textSecondary,
                fontSize: fontSizes.m,
                fontWeight: '600',
                marginBottom: spacing.s
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
                      borderRadius: scaleWidth(12),
                      padding: spacing.s,
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: isSelected ? 0.2 : (theme.background === '#000000' ? 0.15 : 0.08),
                      shadowRadius: isSelected ? 8 : 6,
                      elevation: isSelected ? 6 : 3,
                      borderWidth: isSelected ? 2 : 0,
                      borderColor: isSelected ? domain.color : 'transparent',
                      overflow: 'hidden'
                    }
                  ]}
                  onPress={() => {
                    handleDomainSelect(domain.originalName);
                  }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${domain.name} domain${isSelected ? ', selected' : ''}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  {isSelected && (
                    <LinearGradient
                      colors={[domain.color + '20', domain.color + '10', domain.color + '05']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                      }}
                    />
                  )}
                  <LinearGradient
                    colors={isSelected ? 
                      ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)'] : 
                      [theme.backgroundSecondary, theme.backgroundSecondary]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                    }}
                  />
                  
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
                      marginBottom: spacing.s,
                      shadowColor: domain.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isSelected ? 0.3 : 0.2,
                      shadowRadius: 4,
                      elevation: 2,
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
                        fontWeight: isSelected ? '600' : '500',
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
        </View>
        
        {/* Target Date Toggle */}
        <View style={[
          styles.inputSection,
          {
            backgroundColor: theme.card,
            padding: spacing.m,
            borderRadius: scaleWidth(12),
            marginBottom: spacing.m,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
            shadowRadius: 6,
            elevation: 3,
          }
        ]}>
          <View style={[
            styles.toggleRow,
            {
              paddingVertical: 0,
              minHeight: minTouchSize
            }
          ]}>
            <Text 
              style={[
                styles.label, 
                { 
                  color: theme.textSecondary, 
                  marginBottom: 0,
                  fontSize: fontSizes.m,
                  fontWeight: '600'
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
              trackColor={{ 
                false: theme.border, 
                true: selectedDomain ? 
                  (STANDARD_DOMAINS.find(d => d.name === selectedDomain)?.color + '80' || buttonColor + '80') : 
                  buttonColor + '80'
              }}
              thumbColor={hasTargetDate ? 
                (selectedDomain ? 
                  (STANDARD_DOMAINS.find(d => d.name === selectedDomain)?.color || buttonColor) : 
                  buttonColor
                ) : 
                '#f4f3f4'
              }
              accessible={true}
              accessibilityRole="switch"
              accessibilityLabel="Set target date"
              accessibilityState={{ checked: hasTargetDate }}
              accessibilityHint={hasTargetDate ? "Toggle off to remove target date" : "Toggle on to set a target date"}
            />
          </View>
        </View>
        
        {/* Date Picker Section */}
        {hasTargetDate && (
          <View style={[
            styles.dateSection,
            styles.inputSection,
            {
              backgroundColor: theme.card,
              padding: spacing.m,
              borderRadius: scaleWidth(12),
              marginBottom: spacing.m,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme.background === '#000000' ? 0.15 : 0.08,
              shadowRadius: 6,
              elevation: 3,
            }
          ]}>
            <Text 
              style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.m,
                  fontWeight: '600',
                  marginBottom: spacing.s
                }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              Target Date
            </Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: selectedDomain ? 
                    (STANDARD_DOMAINS.find(d => d.name === selectedDomain)?.color || theme.border) : 
                    theme.border,
                  borderWidth: 1,
                  paddingHorizontal: spacing.m,
                  paddingVertical: spacing.s,
                  borderRadius: scaleWidth(12),
                  minHeight: minTouchSize,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 1,
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
      </ScrollView>
      
      {/* Floating Action Buttons */}
      <View style={styles.floatingButtonContainer}>
        {onBack && (
          <TouchableOpacity
            style={{
              backgroundColor: theme.card || '#FFFFFF',
              borderRadius: scaleWidth(12),
              paddingVertical: spacing.m,
              paddingHorizontal: spacing.l,
              flex: 1,
              minHeight: minTouchSize,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 6,
              marginRight: spacing.m,
              borderWidth: 1,
              borderColor: theme.border,
            }}
            onPress={onBack}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={{
              color: theme.text,
              fontSize: fontSizes.m,
              fontWeight: '600',
            }}>
              Back
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={{
            backgroundColor: selectedDomain ? 
              (STANDARD_DOMAINS.find(d => d.name === selectedDomain)?.color || buttonColor) : 
              buttonColor,
            paddingVertical: spacing.m,
            paddingHorizontal: spacing.l,
            borderRadius: scaleWidth(12),
            flex: onBack ? 2 : 1,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: minTouchSize,
            flexDirection: 'row',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={handleComplete}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Complete goal creation"
        >
          <Ionicons 
            name="checkmark-circle" 
            size={scaleWidth(20)} 
            color="#FFFFFF" 
            style={{ marginRight: spacing.s }}
          />
          <Text 
            style={{
              fontSize: fontSizes.m,
              fontWeight: '600',
              color: '#FFFFFF',
            }}
          >
            Continue
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Title Edit Modal */}
      <TextInputModal
        visible={showTitleModal}
        onClose={() => setShowTitleModal(false)}
        onSave={(newTitle) => {
          setTitle(newTitle);
          setShowTitleModal(false);
        }}
        title="Edit Goal Title"
        placeholder="Enter goal title..."
        value={title}
        maxLength={100}
        primaryColor={selectedColor}
      />
      
      {/* Description Edit Modal */}
      <TextInputModal
        visible={showDescriptionModal}
        onClose={() => setShowDescriptionModal(false)}
        onSave={(newDescription) => {
          setDescription(newDescription);
          setShowDescriptionModal(false);
        }}
        title="Edit Goal Description"
        placeholder="Describe your goal in detail..."
        value={description}
        multiline={true}
        maxLength={500}
        primaryColor={selectedColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepHeader: {
    paddingBottom: spacing.l,
  },
  stepTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  stepDescription: {
    fontSize: fontSizes.m,
    lineHeight: fontSizes.m * 1.4,
  },
  formContainer: {
    flex: 1,
    flexGrow: 1,
  },
  inputSection: {
    // Enhanced styling applied inline
  },
  label: {
    marginBottom: spacing.s
  },
  input: {
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
  
  // Floating Buttons
  floatingButtonContainer: {
    position: 'absolute',
    bottom: spacing.l,
    left: spacing.l,
    right: spacing.l,
    flexDirection: 'row',
  },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontWeight: '600'
  },
  nextButton: {
    alignItems: 'center',
  },
  nextButtonText: {
    fontWeight: '600'
  }
});

export default GoalFormStep;
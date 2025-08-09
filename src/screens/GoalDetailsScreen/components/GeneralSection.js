// src/screens/GoalDetailsScreen/components/GeneralSection.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableWithoutFeedback,
  TouchableOpacity, 
  Platform, 
  Keyboard,
  StyleSheet,
  Animated,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTextColorForBackground, isDarkColor } from '../utils/colorUtils';
import CustomDatePicker from './CustomDatePicker';
import { STANDARD_DOMAINS, getDomainByIcon } from '../../../constants/domains';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  accessibility,
  meetsContrastRequirements
} from '../../../utils/responsive';

const GeneralSection = ({
  theme,
  title,
  setTitle,
  description,
  setDescription,
  selectedIcon,
  setSelectedIcon,
  selectedColor,
  setSelectedColor,
  hasTargetDate,
  setHasTargetDate,
  targetDate,
  setTargetDate,
  showDatePicker,
  setShowDatePicker,
  handleDateChange,
  titleInputRef,
  descriptionInputRef,
  handleInputFocus,
  datePickerMode,
  toggleDatePickerMode
}) => {
  // Animation for focused inputs
  const titleFocusAnim = useRef(new Animated.Value(0)).current;
  const descFocusAnim = useRef(new Animated.Value(0)).current;
  
  const [titleFocused, setTitleFocused] = useState(false);
  const [descFocused, setDescFocused] = useState(false);
  const [domainSectionExpanded, setDomainSectionExpanded] = useState(true);

  // Get the current selected domain based on icon
  const getSelectedDomain = () => {
    const foundDomain = STANDARD_DOMAINS.find(domain => domain.icon === selectedIcon);
    return foundDomain ? foundDomain.name : 'Other';
  };
  
  const selectedDomain = getSelectedDomain();
  
  // Handle domain selection
  const handleDomainSelect = (domainName) => {
    const domainData = STANDARD_DOMAINS.find(domain => domain.name === domainName);
    if (domainData) {
      setSelectedIcon(domainData.icon);
      setSelectedColor(domainData.color);
    }
  };

  // Handle input focus animations
  const handleTitleFocus = () => {
    setTitleFocused(true);
    handleInputFocus(0);
    Animated.spring(titleFocusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8
    }).start();
  };

  const handleTitleBlur = () => {
    setTitleFocused(false);
    Animated.spring(titleFocusAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8
    }).start();
  };

  const handleDescFocus = () => {
    setDescFocused(true);
    handleInputFocus(100);
    Animated.spring(descFocusAnim, {
      toValue: 1,
      useNativeDriver: false,
      tension: 100,
      friction: 8
    }).start();
  };

  const handleDescBlur = () => {
    setDescFocused(false);
    Animated.spring(descFocusAnim, {
      toValue: 0,
      useNativeDriver: false,
      tension: 100,
      friction: 8
    }).start();
  };

  // Modern Input Component
  const ModernInput = ({ 
    label, 
    value, 
    onChangeText, 
    placeholder, 
    multiline = false, 
    maxLength, 
    inputRef, 
    onFocus, 
    onBlur, 
    focused,
    focusAnim,
    onSubmitEditing,
    returnKeyType = "done"
  }) => (
    <View style={styles.modernInputContainer}>
      <Animated.View style={[
        styles.modernInputWrapper,
        {
          borderColor: focused ? selectedColor : theme.border,
          borderWidth: focused ? 2 : 1,
          backgroundColor: theme.backgroundSecondary,
        }
      ]}>
        <View style={styles.labelContainer}>
          <Text style={[
            styles.modernLabel,
            {
              color: focused ? selectedColor : theme.textSecondary,
              fontSize: fontSizes.xs,
              fontWeight: focused ? '600' : '500'
            }
          ]}>
            {label}
          </Text>
          {maxLength && (
            <Text style={[
              styles.characterCount,
              { color: theme.textTertiary }
            ]}>
              {value.length}/{maxLength}
            </Text>
          )}
        </View>
        
        <TextInput
          ref={inputRef}
          style={[
            styles.modernTextInput,
            {
              color: theme.text,
              fontSize: fontSizes.m,
              minHeight: multiline ? scaleHeight(80) : scaleHeight(24),
              textAlignVertical: multiline ? 'top' : 'center',
              fontWeight: multiline ? '400' : '600'
            }
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textTertiary}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          maxLength={maxLength}
          onFocus={onFocus}
          onBlur={onBlur}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={!multiline}
          autoCorrect={false}
          spellCheck={false}
          keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'default'}
          maxFontSizeMultiplier={1.6}
          accessible={true}
          accessibilityLabel={label}
        />
      </Animated.View>
    </View>
  );

  // Domain Card Component
  const DomainCard = ({ domain, isSelected, onSelect }) => (
    <TouchableOpacity 
      style={[
        styles.domainCard,
        {
          backgroundColor: isSelected ? `${domain.color}08` : theme.backgroundSecondary,
          borderColor: isSelected ? domain.color : 'transparent',
          borderWidth: isSelected ? 2 : 0,
        }
      ]}
      onPress={() => onSelect(domain.name)}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${domain.name} domain${isSelected ? ', selected' : ''}`}
      accessibilityState={{ selected: isSelected }}
    >
      <View style={styles.domainIconSection}>
        <View style={[
          styles.domainIconContainer,
          { backgroundColor: domain.color }
        ]}>
          <Ionicons 
            name={domain.icon} 
            size={scaleWidth(18)} 
            color={domain.color === '#FFFFFF' ? '#000000' : getTextColorForBackground(domain.color)} 
            style={styles.domainIconStyle}
          />
        </View>
      </View>
      
      <View style={styles.domainTextSection}>
        <Text style={[
          styles.domainTitle,
          { 
            color: isSelected ? domain.color : theme.text,
            fontWeight: isSelected ? '600' : '500'
          }
        ]}>
          {domain.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.card }
    ]}>

      {/* Title Input */}
      <ModernInput
        label="Goal Title"
        value={title}
        onChangeText={setTitle}
        placeholder="What do you want to achieve?"
        inputRef={titleInputRef}
        onFocus={handleTitleFocus}
        onBlur={handleTitleBlur}
        focused={titleFocused}
        focusAnim={titleFocusAnim}
        onSubmitEditing={() => descriptionInputRef.current?.focus()}
        returnKeyType="next"
      />

      {/* Description Input */}
      <ModernInput
        label="Description (Optional)"
        value={description}
        onChangeText={setDescription}
        placeholder="Add more context to your goal"
        multiline={true}
        inputRef={descriptionInputRef}
        onFocus={handleDescFocus}
        onBlur={handleDescBlur}
        focused={descFocused}
        focusAnim={descFocusAnim}
      />

      {/* Domain Selection */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.domainSection}>
          <TouchableOpacity 
            style={styles.domainHeader}
            onPress={() => setDomainSectionExpanded(!domainSectionExpanded)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Toggle domain selection"
            accessibilityState={{ expanded: domainSectionExpanded }}
          >
            <View style={styles.domainHeaderContent}>
              <Text style={[
                styles.sectionLabel,
                { color: theme.text }
              ]}>
                Choose Domain
              </Text>
              <Ionicons 
                name={domainSectionExpanded ? 'chevron-up' : 'chevron-down'} 
                size={scaleWidth(20)} 
                color={theme.textSecondary}
              />
            </View>
            {domainSectionExpanded && null}
          </TouchableOpacity>
          
          {domainSectionExpanded && (
            <View style={styles.domainGrid}>
              {STANDARD_DOMAINS.reduce((rows, item, index) => {
                if (index % 2 === 0) {
                  const nextItem = STANDARD_DOMAINS[index + 1];
                  
                  if (nextItem) {
                    // Two items in row
                    rows.push(
                      <View key={`row-${index}`} style={styles.domainRow}>
                        <DomainCard
                          domain={item}
                          isSelected={selectedDomain === item.name}
                          onSelect={handleDomainSelect}
                        />
                        <DomainCard
                          domain={nextItem}
                          isSelected={selectedDomain === nextItem.name}
                          onSelect={handleDomainSelect}
                        />
                      </View>
                    );
                  } else {
                    // Single item in last row - center it
                    rows.push(
                      <View key={`row-${index}`} style={styles.domainRowCentered}>
                        <DomainCard
                          domain={item}
                          isSelected={selectedDomain === item.name}
                          onSelect={handleDomainSelect}
                        />
                      </View>
                    );
                  }
                }
                return rows;
              }, [])}
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Date Section */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.dateSection}>
          <CustomDatePicker
            theme={theme}
            selectedColor={selectedColor}
            hasTargetDate={hasTargetDate}
            toggleTargetDate={setHasTargetDate}
            targetDate={targetDate}
            setTargetDate={setTargetDate}
            showDatePicker={showDatePicker}
            setShowDatePicker={setShowDatePicker}
          />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scaleWidth(15),
    marginHorizontal: spacing.m,
    marginBottom: spacing.m,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },


  // Modern Input Styles
  modernInputContainer: {
    marginBottom: spacing.xl,
  },
  modernInputWrapper: {
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.m,
    paddingTop: spacing.m,
    paddingBottom: spacing.s,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  modernLabel: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
    textTransform: 'none',
    letterSpacing: 0,
  },
  characterCount: {
    fontSize: fontSizes.xxs,
    fontWeight: '500',
  },
  modernTextInput: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    paddingVertical: 0,
    lineHeight: scaleHeight(24),
  },

  // Domain Section
  domainSection: {
    marginBottom: spacing.xl,
  },
  domainHeader: {
    marginBottom: spacing.l,
  },
  domainHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: fontSizes.m,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: fontSizes.s,
    lineHeight: scaleHeight(20),
  },
  domainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.m,
  },
  domainGrid: {
    // Container for all domain rows
  },
  domainRowCentered: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  domainCard: {
    flex: 0.48,
    borderRadius: scaleWidth(12),
    padding: spacing.m,
    alignItems: 'center',
    minHeight: scaleHeight(100),
    justifyContent: 'flex-start',
  },
  domainIconSection: {
    height: scaleHeight(50),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  domainIconContainer: {
    width: scaleWidth(36),
    height: scaleWidth(36),
    borderRadius: scaleWidth(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainIconStyle: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  domainTextSection: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  domainTitle: {
    fontSize: fontSizes.s,
    textAlign: 'center',
    lineHeight: scaleHeight(18),
    paddingHorizontal: spacing.xs,
  },

  // Date Section
  dateSection: {
    marginTop: spacing.m,
  },
});

export default GeneralSection;
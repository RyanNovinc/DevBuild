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
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  accessibility
} from '../../utils/responsive';

// Import domain constants
import { STANDARD_DOMAINS, getDomainByName } from '../../constants/domains';
import { normalizeDomain } from '../../utils/domainUtils';

const GoalFormStep = ({ 
  initialData, 
  onComplete, 
  onBack, 
  theme, 
  appContext 
}) => {
  // Form state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedDomain, setSelectedDomain] = useState(
    initialData?.domain ? getDomainByName(initialData.domain) || STANDARD_DOMAINS[0] : STANDARD_DOMAINS[0]
  );
  const [hasTargetDate, setHasTargetDate] = useState(initialData?.targetDate ? true : false);
  const [targetDate, setTargetDate] = useState(initialData?.targetDate ? new Date(initialData.targetDate) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Handle domain selection
  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
  };

  // Handle form completion
  const handleComplete = () => {
    if (!title.trim()) {
      // Could show validation error
      return;
    }

    const goalData = {
      title: title.trim(),
      description: description.trim(),
      domain: selectedDomain.name,
      color: selectedDomain.color,
      icon: selectedDomain.icon,
      targetDate: hasTargetDate ? targetDate.toISOString() : null
    };

    onComplete(goalData);
  };

  // Check if form is valid
  const isValid = title.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.stepHeader}>
        <Text style={[styles.stepTitle, { color: theme.text }]}>
          Create Goal
        </Text>
        <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
          Set up your high-level objective
        </Text>
      </View>

      <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Goal Title *
          </Text>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border
              }
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter goal title..."
            placeholderTextColor={theme.textSecondary}
            maxLength={100}
            autoFocus={true}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Description (Optional)
          </Text>
          <TextInput
            style={[
              styles.textInput,
              styles.multilineInput,
              { 
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: theme.border
              }
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your goal..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
            maxLength={500}
          />
        </View>

        {/* Domain Selection */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Life Domain
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.domainScroll}
            contentContainerStyle={styles.domainContainer}
          >
            {STANDARD_DOMAINS.map((domain) => (
              <TouchableOpacity
                key={domain.name}
                style={[
                  styles.domainOption,
                  { 
                    backgroundColor: selectedDomain.name === domain.name 
                      ? domain.color + '20' 
                      : theme.card,
                    borderColor: selectedDomain.name === domain.name 
                      ? domain.color 
                      : theme.border
                  }
                ]}
                onPress={() => handleDomainSelect(domain)}
                accessible={true}
                accessibilityLabel={`Select ${domain.name} domain`}
                accessibilityRole="button"
              >
                <Ionicons 
                  name={domain.icon} 
                  size={20} 
                  color={selectedDomain.name === domain.name ? domain.color : theme.textSecondary} 
                />
                <Text 
                  style={[
                    styles.domainText,
                    { 
                      color: selectedDomain.name === domain.name 
                        ? domain.color 
                        : theme.textSecondary 
                    }
                  ]}
                >
                  {domain.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Target Date Section */}
        <View style={styles.inputSection}>
          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Target Date
              </Text>
              <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                Set a target completion date for this goal
              </Text>
            </View>
            <Switch
              value={hasTargetDate}
              onValueChange={setHasTargetDate}
              trackColor={{ 
                false: theme.border, 
                true: selectedDomain.color + '40' 
              }}
              thumbColor={hasTargetDate ? selectedDomain.color : theme.textSecondary}
            />
          </View>
          
          {hasTargetDate && (
            <TouchableOpacity
              style={[
                styles.dateButton,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border
                }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={selectedDomain.color} />
              <Text style={[styles.dateButtonText, { color: theme.text }]}>
                {targetDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          
          {showDatePicker && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setTargetDate(selectedDate);
                }
              }}
            />
          )}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.buttonContainer}>
        {onBack && (
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.card }]}
            onPress={onBack}
            accessible={true}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
            <Text style={[styles.backButtonText, { color: theme.text }]}>
              Back
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.nextButton,
            { 
              backgroundColor: isValid ? (theme.primary || '#007AFF') : theme.border,
              opacity: isValid ? 1 : 0.6
            }
          ]}
          onPress={handleComplete}
          disabled={!isValid}
          accessible={true}
          accessibilityLabel={isValid ? "Continue to next step" : "Complete the required fields"}
          accessibilityRole="button"
        >
          <Text style={[styles.nextButtonText, { color: '#FFFFFF' }]}>
            Continue
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.m,
    paddingBottom: spacing.xl,
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
  form: {
    flex: 1,
  },
  inputSection: {
    marginBottom: spacing.l,
  },
  label: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: fontSizes.m,
    minHeight: scaleHeight(48),
  },
  multilineInput: {
    minHeight: scaleHeight(80),
    textAlignVertical: 'top',
  },
  domainScroll: {
    marginTop: spacing.xs,
  },
  domainContainer: {
    paddingRight: spacing.m,
  },
  domainOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderRadius: scaleWidth(20),
    borderWidth: 1,
    marginRight: spacing.s,
    minHeight: scaleHeight(40),
  },
  domainText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  switchInfo: {
    flex: 1,
    marginRight: spacing.m,
  },
  switchDescription: {
    fontSize: fontSizes.s,
    marginTop: spacing.xs,
    lineHeight: fontSizes.s * 1.3,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    minHeight: scaleHeight(48),
  },
  dateButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
    marginLeft: spacing.s,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.l,
    gap: spacing.m,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(48),
    flex: 1,
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(12),
    minHeight: scaleHeight(48),
    flex: 2,
  },
  nextButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
});

export default GoalFormStep;
// src/components/TimeBlock.js - Enhanced with project and task information display
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatTime } from '../utils/helpers';
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

const TimeBlock = ({ timeBlock, onPress, compact = false }) => {
  const { theme } = useTheme();
  
  // Check if block is recurring
  const isRecurring = timeBlock.isRepeating || timeBlock.isRepeatingInstance || false;

  // Check if project and task information is available
  const hasProject = timeBlock.projectTitle && !timeBlock.isGeneralActivity;
  const hasTask = timeBlock.taskTitle && !timeBlock.isGeneralActivity;

  // Ensure text contrast is sufficient on domain indicator
  const domainColor = timeBlock.isGeneralActivity ? timeBlock.customColor : timeBlock.domainColor;
  const hasGoodTextContrast = domainColor ? meetsContrastRequirements('#FFFFFF', domainColor, true) : true;
  
  // Accessibility labels
  const timeRangeLabel = `${formatTime(timeBlock.startTime)} to ${formatTime(timeBlock.endTime)}`;
  const domainLabel = timeBlock.isGeneralActivity ? timeBlock.category : timeBlock.domain;
  const projectLabel = hasProject ? `Project: ${timeBlock.projectTitle}` : '';
  const taskLabel = hasTask ? `Task: ${timeBlock.taskTitle}` : '';
  const locationLabel = timeBlock.location ? `Location: ${timeBlock.location}` : '';
  const recurringLabel = isRecurring ? `Recurring ${timeBlock.repeatFrequency || 'event'}` : '';
  
  // Combine for full accessibility label
  const accessibilityLabel = `Time block: ${timeBlock.title}, ${timeRangeLabel}, ${domainLabel}${projectLabel ? ', ' + projectLabel : ''}${taskLabel ? ', ' + taskLabel : ''}${locationLabel ? ', ' + locationLabel : ''}${recurringLabel ? ', ' + recurringLabel : ''}${timeBlock.isCompleted ? ', Completed' : ''}`;
  
  // Calculate touch target size
  const minTouchHeight = Math.max(scaleHeight(44), accessibility.minTouchTarget);

  // Compact view for week/month views
  if (compact) {
    return (
      <TouchableOpacity 
        style={[
          styles.compactContainer, 
          { 
            borderLeftColor: domainColor,
            backgroundColor: theme.card,
            borderLeftWidth: scaleWidth(4),
            minHeight: minTouchHeight,
          },
          timeBlock.isCompleted && styles.completedBlock,
          // Add dashed border for recurring blocks
          isRecurring && styles.recurringBlock
        ]}
        onPress={onPress}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Double tap to view details"
      >
        <View style={styles.compactTimeColumn}>
          <Text 
            style={[styles.compactTime, { color: theme.textSecondary }]}
            maxFontSizeMultiplier={1.5}
          >
            {formatTime(timeBlock.startTime)}
          </Text>
          <View style={[styles.compactTimeDivider, { backgroundColor: theme.border }]} />
          <Text 
            style={[styles.compactTime, { color: theme.textSecondary }]}
            maxFontSizeMultiplier={1.5}
          >
            {formatTime(timeBlock.endTime)}
          </Text>
        </View>
        
        <View style={styles.compactContent}>
          <View style={styles.compactTitleRow}>
            <Text 
              style={[styles.compactTitle, { color: theme.text }]} 
              numberOfLines={1}
              maxFontSizeMultiplier={1.5}
            >
              {timeBlock.title}
            </Text>
            {isRecurring && (
              <Ionicons name="repeat" size={scaleWidth(14)} color={theme.textSecondary} style={styles.compactRecurringIcon} />
            )}
          </View>
          
          <View style={styles.compactFooter}>
            <View style={styles.compactCategory}>
              <Text 
                style={[styles.compactDomainText, { 
                  color: domainColor
                }]}
                maxFontSizeMultiplier={1.5}
              >
                {domainLabel}
              </Text>
            </View>
            
            {/* Show project and task if available in compact mode */}
            {(hasProject || hasTask) && (
              <View style={styles.compactProjectTaskContainer}>
                {hasProject && (
                  <View style={styles.compactProjectContainer}>
                    <Ionicons name="folder-outline" size={scaleWidth(11)} color={theme.textSecondary} />
                    <Text 
                      style={[styles.compactProjectTaskText, { color: theme.textSecondary }]} 
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.8}
                    >
                      {timeBlock.projectTitle}
                    </Text>
                  </View>
                )}
                
                {hasTask && (
                  <View style={styles.compactTaskContainer}>
                    <Ionicons name="checkbox-outline" size={scaleWidth(11)} color={theme.textSecondary} />
                    <Text 
                      style={[styles.compactProjectTaskText, { color: theme.textSecondary }]} 
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.8}
                    >
                      {timeBlock.taskTitle}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            {timeBlock.location && (
              <View style={styles.compactLocation}>
                <Ionicons name="location-outline" size={scaleWidth(11)} color={theme.textSecondary} style={styles.compactLocationIcon} />
                <Text 
                  style={[styles.compactLocationText, { color: theme.textSecondary }]} 
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.8}
                >
                  {timeBlock.location}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Regular view for day view (and potentially other areas)
  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          borderLeftColor: domainColor,
          backgroundColor: `${domainColor}15`, // 15% opacity
          borderLeftWidth: scaleWidth(4),
          borderColor: `${domainColor}40`, // 40% opacity for border
          borderWidth: 1,
          minHeight: minTouchHeight,
        },
        timeBlock.isCompleted && styles.completedBlock,
        // Add dashed border for recurring blocks
        isRecurring && styles.recurringBlock
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Double tap to view details"
    >
      <View style={styles.header}>
        <Text 
          style={[styles.time, { color: theme.text }]}
          maxFontSizeMultiplier={1.5}
        >
          {formatTime(timeBlock.startTime)} - {formatTime(timeBlock.endTime)}
        </Text>
        {isRecurring && (
          <View style={styles.recurringContainer}>
            <Ionicons name="repeat" size={scaleWidth(16)} color={theme.text} />
            <Text 
              style={[styles.recurringText, { color: theme.text }]}
              maxFontSizeMultiplier={1.5}
            >
              {timeBlock.repeatFrequency === 'daily' ? 'Daily' : 
               timeBlock.repeatFrequency === 'weekly' ? 'Weekly' : 
               timeBlock.repeatFrequency === 'monthly' ? 'Monthly' : 'Recurring'}
            </Text>
          </View>
        )}
      </View>
      
      <Text 
        style={[styles.title, { color: theme.text }]} 
        numberOfLines={2}
        maxFontSizeMultiplier={1.8}
      >
        {timeBlock.title}
      </Text>
      
      {/* Project and Task Information Section */}
      {(hasProject || hasTask) && (
        <View style={styles.projectTaskSection}>
          {hasProject && (
            <View style={styles.projectContainer}>
              <Ionicons 
                name="folder-outline" 
                size={scaleWidth(14)} 
                color={domainColor} 
                style={styles.projectTaskIcon} 
              />
              <Text 
                style={[styles.projectTaskText, { color: theme.text }]}
                maxFontSizeMultiplier={1.8}
              >
                {timeBlock.projectTitle}
              </Text>
            </View>
          )}
          
          {hasTask && (
            <View style={styles.taskContainer}>
              <Ionicons 
                name="checkbox-outline" 
                size={scaleWidth(14)} 
                color={domainColor} 
                style={styles.projectTaskIcon} 
              />
              <Text 
                style={[styles.projectTaskText, { color: theme.text }]}
                maxFontSizeMultiplier={1.8}
              >
                {timeBlock.taskTitle}
              </Text>
            </View>
          )}
        </View>
      )}
      
      <View style={styles.footer}>
        <View style={styles.infoContainer}>
          {/* Domain/Category label */}
          <View 
            style={[
              styles.domainIndicator, 
              { backgroundColor: domainColor }
            ]}
          >
            <Text 
              style={[
                styles.domainText,
                // Use dark text if contrast is poor
                !hasGoodTextContrast && { color: '#000' }
              ]}
              maxFontSizeMultiplier={1.5}
            >
              {domainLabel}
            </Text>
          </View>
          
          {/* Location info if available */}
          {timeBlock.location && (
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={scaleWidth(14)} color={theme.textSecondary} />
              <Text 
                style={[styles.locationText, { color: theme.textSecondary }]} 
                numberOfLines={1}
                maxFontSizeMultiplier={1.8}
              >
                {timeBlock.location}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: scaleWidth(10),
    padding: spacing.m,
    marginBottom: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: 'space-between',
  },
  completedBlock: {
    opacity: 0.7,
  },
  recurringBlock: {
    borderStyle: 'dashed',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  recurringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recurringText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xxs,
    fontWeight: '500',
  },
  title: {
    fontSize: fontSizes.m,
    fontWeight: 'bold',
    marginBottom: spacing.s,
  },
  // Project and Task styles
  projectTaskSection: {
    marginBottom: spacing.s,
  },
  projectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectTaskIcon: {
    marginRight: spacing.xs,
  },
  projectTaskText: {
    fontSize: fontSizes.s,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  domainIndicator: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xxxs,
    borderRadius: scaleWidth(10),
    marginBottom: spacing.xs,
  },
  domainText: {
    fontSize: fontSizes.xs,
    color: '#fff',
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xxs,
  },
  
  // Compact styles for week/month views
  compactContainer: {
    flexDirection: 'row',
    borderRadius: scaleWidth(8),
    padding: spacing.s,
    marginHorizontal: spacing.m,
    marginBottom: spacing.s,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  compactTimeColumn: {
    width: scaleWidth(45),
    alignItems: 'center',
    marginRight: spacing.s,
  },
  compactTime: {
    fontSize: fontSizes.xs,
  },
  compactTimeDivider: {
    width: 1,
    height: scaleHeight(15),
    marginVertical: spacing.xxs,
  },
  compactContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  compactTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactTitle: {
    fontSize: fontSizes.s,
    fontWeight: '500',
    marginBottom: spacing.xs,
    flex: 1,
  },
  compactRecurringIcon: {
    marginLeft: spacing.xs,
  },
  compactFooter: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  compactCategory: {
    marginRight: spacing.s,
    marginBottom: spacing.xxs,
  },
  compactDomainText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  // Project and Task compact styles
  compactProjectTaskContainer: {
    marginBottom: spacing.xxs,
  },
  compactProjectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxxs,
  },
  compactTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactProjectTaskText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xxxs,
  },
  compactLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  compactLocationIcon: {
    marginRight: spacing.xxxs,
  },
  compactLocationText: {
    fontSize: fontSizes.xs,
    flex: 1,
  },
});

export default TimeBlock;
// src/screens/TimeScreen/WeekView.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import TimeBlock from '../../components/TimeBlock';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Week view component that displays time blocks organized by days of the week
 */
const WeekView = ({
  weekDates,
  selectedWeekDay,
  isToday,
  getDayName,
  getTimeBlocksForDate,
  handleWeekDaySelect,
  handleTimeBlockPress,
  styles,
  theme
}) => {
  // Get safe area insets
  const insets = useSafeAreaInsets();
  
  // Safety check - weekDates should be an array with 7 days
  if (!Array.isArray(weekDates) || weekDates.length !== 7) return null;
  
  // Render day header
  const renderDayHeader = (date, index) => {
    const isTodayDate = isToday(date);
    const isSelected = selectedWeekDay === index;
    
    // Create accessibility label for the day
    const blocksForDay = getTimeBlocksForDate(date);
    const dayAccessibilityLabel = `${getDayName(date.getDay(), false)}, ${date.getDate()}${isTodayDate ? ', Today' : ''}${blocksForDay.length > 0 ? `, ${blocksForDay.length} events` : ', No events'}`;
    
    return (
      <TouchableOpacity
        key={`day-${index}`}
        style={[
          styles.weekDay,
          isSelected && [
            styles.selectedWeekDay,
            { backgroundColor: `${theme.primary}15` }
          ],
          // Highlight today's date - always show outline
          isTodayDate && [
            styles.todayWeekDay,
            { 
              borderWidth: 2,
              borderColor: theme.primary,
              backgroundColor: isSelected ? `${theme.primary}15` : `${theme.primary}10`
            }
          ]
        ]}
        onPress={() => handleWeekDaySelect(index)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="tab"
        accessibilityLabel={dayAccessibilityLabel}
        accessibilityState={{ 
          selected: isSelected,
          busy: blocksForDay.length > 0
        }}
        accessibilityHint="Double tap to view this day's events"
      >
        <Text style={[
          styles.weekDayName, 
          { color: theme.textSecondary },
          isTodayDate && { color: theme.primary, fontWeight: 'bold' }
        ]}
        maxFontSizeMultiplier={1.3}
        >
          {getDayName(date.getDay(), true)}
        </Text>
        <Text 
          style={[
            styles.weekDayNumber, 
            { color: theme.text },
            isSelected && { color: theme.primary, fontWeight: 'bold' },
            isTodayDate && !isSelected && { color: theme.primary, fontWeight: 'bold' }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render day blocks
  const renderDayBlocks = (date, index) => {
    const blocksForDay = getTimeBlocksForDate(date);
    const isSelected = selectedWeekDay === index;
    const isTodayDate = isToday(date);
    
    // Create an accessibility label for screen readers
    const blockCountLabel = blocksForDay.length === 0 ? 
      'No time blocks' : 
      `${blocksForDay.length} time block${blocksForDay.length === 1 ? '' : 's'}`;
    
    const accessibilityLabel = 
      `${getDayName(date.getDay(), false)}${isTodayDate ? ', Today' : ''}, ${date.getDate()}. ${blockCountLabel}.`;
    
    return (
      <TouchableOpacity 
        key={`day-blocks-${index}`}
        style={[
          styles.weekDayBlocks,
          { 
            backgroundColor: isSelected ? `${theme.primary}10` : 
                           isTodayDate ? `${theme.primary}08` : theme.background,
          },
          isTodayDate && { borderLeftWidth: 3, borderLeftColor: theme.primary }
        ]}
        onPress={() => handleWeekDaySelect(index)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ selected: isSelected }}
        accessibilityHint="Double tap to view details for this day"
      >
        <Text style={[
          styles.weekDayLabel, 
          { color: theme.textSecondary },
          isTodayDate && { color: theme.primary, fontWeight: 'bold' }
        ]}
        maxFontSizeMultiplier={1.3}
        >
          {getDayName(date.getDay(), false)}
          {isTodayDate && ' (Today)'}
        </Text>
        
        <View style={styles.weekDayBlocksContainer}>
          {blocksForDay.length > 0 ? (
            blocksForDay
              .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
              .map((block) => (
                <TimeBlock 
                  key={block.id} 
                  timeBlock={block} 
                  onPress={() => handleTimeBlockPress(block)}
                  compact={true}
                />
              ))
          ) : (
            <View style={[
              styles.emptyWeekDay,
              { backgroundColor: 'rgba(0,0,0,0.03)' }
            ]}>
              <Text 
                style={[
                  styles.emptyWeekDayText, 
                  { color: theme.textSecondary }
                ]}
                maxFontSizeMultiplier={1.5}
              >
                No time blocks
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[
      styles.weekView,
      // Only add bottom padding for the home indicator if needed
      insets.bottom > 0 && { paddingBottom: insets.bottom }
    ]}>
      {/* Week days header - Monday first */}
      <View style={styles.weekDaysHeader}>
        {weekDates.map(renderDayHeader)}
      </View>
      
      {/* Week view content showing blocks for each day */}
      <ScrollView 
        style={[
          styles.weekViewContent,
          { backgroundColor: theme.card }
        ]}
        contentContainerStyle={{
          paddingBottom: 20 // Extra bottom padding for scrolling
        }}
        showsVerticalScrollIndicator={true}
        // Accessibility properties for screen readers
        accessible={true}
        accessibilityRole="list"
        accessibilityLabel="Weekly schedule"
      >
        {weekDates.map(renderDayBlocks)}
      </ScrollView>
    </View>
  );
};

export default WeekView;
// src/screens/TimeScreen/WeekView.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import TimeBlock from '../../components/TimeBlock';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ensureAccessibleTouchTarget } from '../../utils/responsive';

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
  
  // Internal selection state to avoid parent re-renders
  const [internalSelectedDay, setInternalSelectedDay] = React.useState(selectedWeekDay);
  
  // Update internal state when prop changes (but don't cause re-render if the same)
  React.useEffect(() => {
    setInternalSelectedDay(selectedWeekDay);
  }, [selectedWeekDay]);
  
  // Internal handler that ONLY changes visual state - no parent calls
  const handleInternalDaySelect = (index) => {
    setInternalSelectedDay(index);
    // DO NOT call parent handler to avoid any state changes that could cause scroll reset
  };
  
  // Safety check - weekDates should be an array with 7 days
  if (!Array.isArray(weekDates) || weekDates.length !== 7) return null;
  
  // Render day header
  const renderDayHeader = React.useCallback((date, index) => {
    const isTodayDate = isToday(date);
    const isSelected = internalSelectedDay === index;
    
    // Create accessibility label for the day
    const blocksForDay = getTimeBlocksForDate(date);
    const dayAccessibilityLabel = `${getDayName(date.getDay(), false)}, ${date.getDate()}${isTodayDate ? ', Today' : ''}${blocksForDay.length > 0 ? `, ${blocksForDay.length} events` : ', No events'}`;
    
    return (
      <TouchableOpacity
        key={`day-${index}`}
        style={[
          styles.weekDay,
          { minWidth: 44, minHeight: 44 }, // Ensure accessible touch target without overriding flex
          isSelected && [
            styles.selectedWeekDay,
            { 
              backgroundColor: theme.background === '#000000' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              borderRadius: 10,
              overflow: 'visible'
            }
          ],
          // Highlight today's date - always show outline
          isTodayDate && [
            styles.todayWeekDay,
            { 
              borderWidth: 2,
              borderColor: theme.primary,
              borderRadius: 10,
              backgroundColor: isSelected ? 
                (theme.background === '#000000' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)') : 
                (theme.background === '#000000' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
            }
          ]
        ]}
        onPress={() => handleInternalDaySelect(index)}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
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
  }, [internalSelectedDay, isToday, getDayName, getTimeBlocksForDate, handleInternalDaySelect, theme]);
  
  // Render day blocks
  const renderDayBlocks = React.useCallback((date, index) => {
    const blocksForDay = getTimeBlocksForDate(date);
    const isSelected = internalSelectedDay === index;
    const isTodayDate = isToday(date);
    
    // Create an accessibility label for screen readers
    const blockCountLabel = blocksForDay.length === 0 ? 
      'No time blocks' : 
      `${blocksForDay.length} time block${blocksForDay.length === 1 ? '' : 's'}`;
    
    const accessibilityLabel = 
      `${getDayName(date.getDay(), false)}${isTodayDate ? ', Today' : ''}, ${date.getDate()}. ${blockCountLabel}.`;
    
    return (
      <TouchableOpacity 
        key={`day-blocks-${date.toDateString()}`} // Use date string for stable key
        style={[
          styles.weekDayBlocks,
          { 
            backgroundColor: isSelected ? (theme.background === '#000000' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)') : theme.card,
          },
          isSelected && { 
            borderLeftWidth: 4, 
            borderLeftColor: theme.background === '#000000' ? '#FFFFFF' : '#000000',
            borderRightWidth: 2,
            borderRightColor: theme.background === '#000000' ? '#FFFFFF' : '#000000',
          },
          isTodayDate && !isSelected && { borderLeftWidth: 3, borderLeftColor: theme.primary }
        ]}
        onPress={() => handleInternalDaySelect(index)}
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
          isSelected && { color: theme.text, fontWeight: 'bold' },
          isTodayDate && !isSelected && { color: theme.primary, fontWeight: 'bold' }
        ]}
        maxFontSizeMultiplier={1.3}
        >
          {getDayName(date.getDay(), false)}
          {isTodayDate && ' (Today)'}
          {isSelected && !isTodayDate && ' (Selected)'}
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
              { backgroundColor: theme.background }
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
  }, [internalSelectedDay, isToday, getDayName, getTimeBlocksForDate, handleInternalDaySelect, handleTimeBlockPress, theme, styles]);
  
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
          { backgroundColor: theme.background, flex: 1 }
        ]}
        contentContainerStyle={{
          paddingBottom: 100 // Extra bottom padding for scrolling
        }}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
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

export default React.memo(WeekView, (prevProps, nextProps) => {
  // Only re-render if weekDates, theme, or time blocks change - ignore selectedWeekDay changes
  return (
    prevProps.weekDates === nextProps.weekDates &&
    prevProps.theme === nextProps.theme &&
    prevProps.getTimeBlocksForDate === nextProps.getTimeBlocksForDate
  );
});
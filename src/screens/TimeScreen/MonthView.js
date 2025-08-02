// src/screens/TimeScreen/MonthView.js
import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TimeBlock from '../../components/TimeBlock';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import responsive from '../../utils/responsive';

/**
 * Month view component that displays a calendar grid and selected day details
 */
const MonthView = ({
  monthDates,
  selectedMonthDay,
  isToday,
  formatDate,
  getTimeBlocksForDate,
  handleMonthDaySelect,
  handleTimeBlockPress,
  handleAddTimeBlock,
  styles,
  theme,
  isDarkMode
}) => {
  // Get screen dimensions and insets
  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;
  const insets = useSafeAreaInsets();
  
  // Check for Dynamic Island
  const hasDynamicIsland = insets.top >= 59;
  
  // Calculate responsive dimensions
  const calendarWidth = responsive.isTablet ? width * 0.9 : width - 32;
  const daySize = responsive.isSmallDevice ? 
    responsive.scaleWidth(38) : 
    responsive.isTablet ? 
      responsive.scaleWidth(70) : 
      responsive.scaleWidth(45);
  
  // Safety check for empty monthDates
  if (!Array.isArray(monthDates) || monthDates.length === 0) return null;
  
  // Create week arrays for the calendar grid - memoized for performance
  const weeks = useMemo(() => {
    const result = [];
    let week = [];
    
    // Set the day order for the week - Starting with Monday (1, 2, 3, 4, 5, 6, 0)
    const mondayFirstOrder = [1, 2, 3, 4, 5, 6, 0];
    
    // Add empty slots for days before the first day of the month
    const firstDay = monthDates[0].getDay();
    const firstDayIndex = mondayFirstOrder.indexOf(firstDay);
    for (let i = 0; i < firstDayIndex; i++) {
      week.push(null);
    }
    
    // Add days to the weeks
    monthDates.forEach((date) => {
      week.push(date);
      
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    });
    
    // Add empty slots for days after the last day of the month
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      result.push(week);
    }
    
    return result;
  }, [monthDates]);
  
  // Get blocks for the selected day
  const selectedDayBlocks = useMemo(() => {
    if (!monthDates[selectedMonthDay]) return [];
    
    return getTimeBlocksForDate(monthDates[selectedMonthDay])
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [monthDates, selectedMonthDay, getTimeBlocksForDate]);
  
  // Render a day cell in the calendar
  const renderDay = (date, dayIndex, weekIndex) => {
    if (!date) {
      return (
        <View 
          key={`empty-${weekIndex}-${dayIndex}`} 
          style={[
            styles.monthDay,
            { 
              width: daySize, 
              height: daySize 
            }
          ]} 
        />
      );
    }
    
    const dayNumber = date.getDate();
    const isSelected = dayNumber - 1 === selectedMonthDay;
    const isTodayDate = isToday(date);
    const blocksForDay = getTimeBlocksForDate(date);
    const hasEvents = blocksForDay.length > 0;
    
    // Get unique colors for the day (up to 6)
    // Properly handling both domain and custom colors
    const blockColors = blocksForDay
      .map(block => block.isGeneralActivity ? block.customColor : block.domainColor)
      .filter((color, index, self) => self.indexOf(color) === index)
      .slice(0, 6); // Increased to 6 colors maximum
    
    // Split colors into two rows
    const topRowColors = blockColors.slice(0, 3);
    const bottomRowColors = blockColors.slice(3, 6);
    
    // Create accessibility label
    const accessibilityLabel = `${formatDate(date, 'long')}${isTodayDate ? ', Today' : ''}${hasEvents ? `, ${blocksForDay.length} event${blocksForDay.length === 1 ? '' : 's'}` : ', no events'}`;
    
    return (
      <TouchableOpacity
        key={`day-${dayNumber}`}
        style={[
          styles.monthDay,
          { 
            width: daySize, 
            height: daySize,
            padding: responsive.scaleWidth(2),
            margin: responsive.scaleWidth(1),
          },
          isSelected && [
            styles.selectedMonthDay,
            { backgroundColor: `${theme.primary}15` }
          ],
          // Highlight today's date - always show outline
          isTodayDate && [
            styles.todayMonthDay,
            { 
              borderWidth: 2,
              borderColor: theme.primary,
              borderRadius: 8,
              backgroundColor: isSelected ? `${theme.primary}15` : `${theme.primary}10`
            }
          ]
        ]}
        onPress={() => handleMonthDaySelect(dayNumber - 1)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ 
          selected: isSelected,
          busy: hasEvents
        }}
        accessibilityHint="Double tap to view this day's schedule"
      >
        <Text 
          style={[
            styles.monthDayNumber, 
            {
              color: theme.text,
              height: 20, // Fixed height for consistent alignment
              textAlign: 'center',
              textAlignVertical: 'center', // For Android
              includeFontPadding: false, // Remove extra padding
              lineHeight: 20, // Fixed line height
              fontSize: responsive.isSmallDevice ? responsive.fontSizes.xs : responsive.fontSizes.s, // Responsive font size
            },
            isSelected && { color: theme.primary, fontWeight: 'bold' },
            isTodayDate && !isSelected && { color: theme.primary, fontWeight: 'bold' }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          {dayNumber}
        </Text>
        
        {/* Show colored dots for each domain with events - in two rows if needed */}
        {hasEvents && (
          <View style={[
            styles.eventIndicatorsWrapper || { 
              marginTop: 2,
              alignItems: 'center',
            }
          ]}>
            {/* First row of indicators (up to 3) */}
            <View style={styles.eventIndicatorsContainer}>
              {topRowColors.map((color, index) => (
                <View 
                  key={`indicator-top-${index}`}
                  style={[
                    styles.eventIndicator, 
                    { 
                      backgroundColor: color,
                      width: responsive.scaleWidth(5),
                      height: responsive.scaleWidth(5),
                      borderRadius: responsive.scaleWidth(3),
                      marginHorizontal: responsive.scaleWidth(1),
                    }
                  ]} 
                />
              ))}
            </View>
            
            {/* Second row of indicators (up to 3 more) if needed */}
            {bottomRowColors.length > 0 && (
              <View style={[
                styles.eventIndicatorsContainer,
                { marginTop: 1 } // Small space between rows
              ]}>
                {bottomRowColors.map((color, index) => (
                  <View 
                    key={`indicator-bottom-${index}`}
                    style={[
                      styles.eventIndicator, 
                      { 
                        backgroundColor: color,
                        width: responsive.scaleWidth(5),
                        height: responsive.scaleWidth(5),
                        borderRadius: responsive.scaleWidth(3),
                        marginHorizontal: responsive.scaleWidth(1),
                      }
                    ]} 
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };
  
  // Render the empty state for selected day
  const renderEmptyDay = () => {
    return (
      <View style={[
        styles.emptyDay,
        { 
          padding: responsive.spacing.m,
          borderRadius: 12,
          marginVertical: responsive.spacing.s,
          backgroundColor: theme.card
        }
      ]}>
        <View style={styles.emptyDayContent}>
          <Ionicons 
            name="calendar-outline" 
            size={28} 
            color={theme.textSecondary} 
            style={styles.emptyDayIcon} 
          />
          <Text 
            style={[
              styles.emptyDayText, 
              { 
                color: theme.textSecondary,
                fontSize: responsive.fontSizes.m,
                marginVertical: responsive.spacing.s,
              }
            ]}
            maxFontSizeMultiplier={1.5}
          >
            No time blocks for this day
          </Text>
          <TouchableOpacity 
            style={[
              styles.emptyDayButton, 
              { 
                backgroundColor: theme.primary,
                paddingVertical: responsive.spacing.s,
                paddingHorizontal: responsive.spacing.m,
                borderRadius: 20,
                minHeight: 44, // Minimum touch target height
                minWidth: 44, // Minimum touch target width
              }
            ]}
            onPress={handleAddTimeBlock}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Add time block"
            accessibilityHint="Creates a new time block for this day"
          >
            <Ionicons 
              name="add" 
              size={16} 
              color={isDarkMode ? '#000000' : '#FFFFFF'} 
              style={{ marginRight: 4 }} 
            />
            <Text 
              style={[
                styles.emptyDayButtonText,
                { 
                  color: isDarkMode ? '#000000' : '#FFFFFF',
                  fontSize: responsive.fontSizes.s,
                  fontWeight: '600',
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Add Block
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Adjust layout for landscape orientation
  const landscapeLayout = isLandscape && {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  };
  
  // Adjust calendar and selected day content sizes for landscape
  const calendarContainerStyle = isLandscape ? {
    width: responsive.isTablet ? '60%' : '55%',
  } : {};
  
  const selectedDayContainerStyle = isLandscape ? {
    width: responsive.isTablet ? '38%' : '43%',
    marginTop: 0,
    marginLeft: responsive.spacing.m,
    maxHeight: height - insets.top - insets.bottom - 50,
  } : {};
  
  return (
    <View style={[
      styles.monthView,
      {
        padding: responsive.spacing.m,
        paddingBottom: insets.bottom > 0 ? insets.bottom : responsive.spacing.m,
      },
      landscapeLayout
    ]}>
      {/* Month calendar */}
      <View style={[
        styles.monthCalendar, 
        { 
          backgroundColor: theme.card, 
          borderRadius: 15,
          padding: responsive.spacing.m,
          // Add shadow for depth
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        calendarContainerStyle
      ]}>
        {/* Day names - Monday first */}
        <View style={[
          styles.monthDaysHeader,
          {
            marginBottom: responsive.spacing.s,
            paddingBottom: responsive.spacing.xs,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }
        ]}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
            <Text 
              key={`day-name-${index}`} 
              style={[
                styles.monthDayName, 
                { 
                  color: theme.textSecondary,
                  fontSize: responsive.isSmallDevice ? responsive.fontSizes.xs : responsive.fontSizes.s,
                  width: daySize,
                  textAlign: 'center',
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              {day}
            </Text>
          ))}
        </View>
        
        {/* Calendar grid */}
        <View style={styles.monthGrid}>
          {weeks.map((week, weekIndex) => (
            <View key={`week-${weekIndex}`} style={[
              styles.monthWeek,
              {
                flexDirection: 'row',
                justifyContent: 'space-around',
                height: responsive.isSmallDevice ? responsive.scaleHeight(45) : responsive.scaleHeight(52),
                marginBottom: responsive.spacing.s,
              }
            ]}>
              {week.map((date, dayIndex) => renderDay(date, dayIndex, weekIndex))}
            </View>
          ))}
        </View>
      </View>
      
      {/* Selected day blocks */}
      <View style={[
        styles.selectedDayBlocks, 
        { 
          backgroundColor: theme.card, 
          borderRadius: 15, 
          marginTop: isLandscape ? 0 : responsive.spacing.m,
          padding: responsive.spacing.m,
          // Add shadow for depth
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        },
        selectedDayContainerStyle
      ]}>
        <Text 
          style={[
            styles.selectedDayTitle, 
            { 
              color: theme.text,
              fontSize: responsive.fontSizes.l,
              fontWeight: '600',
              marginBottom: responsive.spacing.s,
            }
          ]}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {formatDate(monthDates[selectedMonthDay], 'long')}
          {isToday(monthDates[selectedMonthDay]) && ' (Today)'}
        </Text>
        
        <ScrollView 
          style={[
            styles.selectedDayContent,
            {
              maxHeight: isLandscape ? 
                height - insets.top - insets.bottom - 120 : 
                responsive.isTablet ? 
                  responsive.scaleHeight(300) : 
                  responsive.scaleHeight(200)
            }
          ]}
          contentContainerStyle={{
            paddingBottom: responsive.spacing.m, // Extra padding for scrolling
          }}
          accessible={true}
          accessibilityRole="list"
          accessibilityLabel={`Events for ${formatDate(monthDates[selectedMonthDay], 'long')}`}
        >
          {selectedDayBlocks.length > 0 ? (
            selectedDayBlocks.map((block) => (
              <TimeBlock 
                key={block.id} 
                timeBlock={block} 
                onPress={() => handleTimeBlockPress(block)}
                compact={true} // Use compact view for month view
              />
            ))
          ) : (
            renderEmptyDay()
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default MonthView;
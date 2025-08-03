// src/screens/TimeScreen/DayView.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmptyTimeIllustration from '../../components/illustrations/EmptyTimeIllustration';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  isSmallDevice,
  meetsContrastRequirements,
  ensureAccessibleTouchTarget
} from '../../utils/responsive';

/**
 * Day view component that displays time blocks in a day view
 */
const DayView = ({ 
  timeBlocks, 
  getTimeBlocksForDate, 
  currentDate, 
  handleTimeBlockPress, 
  handleAddTimeBlock, 
  handleAddTimeBlockWithTime,
  getHourHeight, 
  calculateTimeBlockStyle, 
  getDarkerShade,
  formatTime,
  styles,
  timeSlots,
  theme,
  isDarkMode,
  scale
}) => {
  // Custom empty state component with improved contrast
  const EmptyState = () => {
    return (
      <View style={styles.customEmptyStateContainer}>
        <EmptyTimeIllustration theme={theme} />
        <Text 
          style={[
            styles.customEmptyStateTitle, 
            { color: theme.text }
          ]}
          maxFontSizeMultiplier={1.5}
          accessibilityRole="header"
        >
          No Time Blocks
        </Text>
        <Text 
          style={[
            styles.customEmptyStateMessage, 
            { color: theme.textSecondary }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          Schedule your day by creating time blocks. Visualize how you'll spend your time for better productivity.
        </Text>
        <TouchableOpacity
          style={[
            styles.customEmptyStateButton,
            ensureAccessibleTouchTarget(scaleWidth(180), scaleHeight(50)),
            { backgroundColor: theme.primary }
          ]}
          onPress={handleAddTimeBlock}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Add time block"
          accessibilityHint="Creates a new time block for scheduling"
        >
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Ionicons 
              name="time" 
              size={scaleWidth(20)} 
              color={isDarkMode ? '#000000' : '#FFFFFF'} 
            />
            <Text 
              style={[
                styles.customEmptyStateButtonText, 
                { 
                  color: isDarkMode ? '#000000' : '#FFFFFF',
                  marginLeft: scaleWidth(8),
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Add Time Block
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  // Get blocks for current day
  const blocksForDay = getTimeBlocksForDate(currentDate);
  
  // Show empty state if no blocks
  if (blocksForDay.length === 0) {
    return <EmptyState />;
  }
  
  // Get current hour height based on zoom level
  const hourHeight = getHourHeight();
  
  // Render time block
  const renderTimeBlock = (block) => {
    const { height, top } = calculateTimeBlockStyle(block);
    
    // Check if this is a calendar event
    const isCalendarEvent = block.isCalendarEvent === true;
    
    // Check if this is a repeating instance or repeating block
    const isRepeatingInstance = block.isRepeatingInstance === true;
    const isRepeatingBlock = block.isRepeating === true;
    
    // Get darker shade of domain color for border
    const blockColor = isCalendarEvent 
      ? block.color || '#2196F3' 
      : (block.isGeneralActivity ? block.customColor : block.domainColor);
    const borderColor = getDarkerShade(blockColor);
    
    // Calculate text color for optimal contrast against the background
    const backgroundWithOpacity = `${blockColor}30`; // 30% opacity
    const textColor = theme.text; // Default to theme text color
    
    // Determine text color for domain badge based on its background
    const domainBadgeTextColor = meetsContrastRequirements('#FFFFFF', blockColor) 
      ? '#FFFFFF' 
      : '#000000';
    
    // Check if project and task information is available
    const hasProject = block.projectTitle && !block.isGeneralActivity;
    const hasTask = block.taskTitle && !block.isGeneralActivity;
    
    // Check if we should use inline layout (when zoomed out below 70%)
    const useInlineLayout = scale < 0.7;
    
    // Create accessibility label with all relevant information
    const accessibilityLabel = `${block.title} from ${formatTime(block.startTime)} to ${formatTime(block.endTime)}` + 
      `${isCalendarEvent ? `, Calendar Event from ${block.source}` : 
        (block.isGeneralActivity ? `, Category: ${block.category}` : `, Domain: ${block.domain}`)}` +
      `${!isCalendarEvent && hasProject ? `, Project: ${block.projectTitle}` : ''}` +
      `${!isCalendarEvent && hasTask ? `, Task: ${block.taskTitle}` : ''}` +
      `${block.location ? `, Location: ${block.location}` : ''}` +
      `${!isCalendarEvent && (isRepeatingBlock || isRepeatingInstance) ? ', Repeating' : ''}`;
    return (
      <TouchableOpacity
        key={block.id}
        style={[
          styles.timeBlock,
          {
            height,
            top,
            backgroundColor: backgroundWithOpacity,
            borderLeftColor: blockColor,
            borderColor: borderColor,
          },
          // Add dashed border for repeating instances
          (isRepeatingInstance || isRepeatingBlock) && styles.repeatingTimeBlock,
          // Add distinct styling for calendar events
          isCalendarEvent && {
            borderStyle: 'dotted',
            borderWidth: 2,
            borderRightWidth: 2,
            borderTopWidth: 2,
            borderBottomWidth: 2,
            opacity: 0.9
          }
        ]}
        onPress={() => handleTimeBlockPress(block)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={isCalendarEvent ? "Shows details of this calendar event" : "Opens details to edit this time block"}
      >
        {useInlineLayout ? (
          // Inline layout: time and title on same row when zoomed out
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: scaleWidth(3),
            flex: 1,
            height: '100%',
            justifyContent: 'flex-start',
          }}>
            <Text 
              style={[
                styles.timeBlockTime, 
                { 
                  color: textColor,
                  fontSize: scaleFontSize(9),
                  lineHeight: scaleFontSize(12),
                  marginRight: scaleWidth(4),
                  textAlignVertical: 'center',
                }
              ]}
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
            >
              {formatTime(block.startTime)}-{formatTime(block.endTime)}
            </Text>
            
            <Text 
              style={[
                styles.timeBlockTitle, 
                { 
                  color: textColor,
                  fontSize: scaleFontSize(10),
                  lineHeight: scaleFontSize(13),
                  fontWeight: '600',
                  flex: 1,
                  marginRight: scaleWidth(4),
                  textAlignVertical: 'center',
                }
              ]} 
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
              ellipsizeMode="tail"
            >
              {block.title}
            </Text>

            {/* Show calendar/repeat indicators on the very right */}
            {isCalendarEvent && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 0,
              }}>
                <Ionicons 
                  name="calendar" 
                  size={scaleWidth(12)} 
                  color={textColor} 
                />
                <Text 
                  style={[
                    styles.repeatingText, 
                    { 
                      color: textColor,
                      fontSize: scaleFontSize(9),
                      marginLeft: scaleWidth(2),
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {block.source === 'device_calendar' ? 'Cal' : 'Sync'}
                </Text>
              </View>
            )}
            
            {!isCalendarEvent && (isRepeatingBlock || isRepeatingInstance) && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 0,
              }}>
                <Ionicons 
                  name="repeat" 
                  size={scaleWidth(12)} 
                  color={textColor} 
                />
                {block.repeatFrequency && (
                  <Text 
                    style={[
                      styles.repeatingText, 
                      { 
                        color: textColor,
                        fontSize: scaleFontSize(9),
                        marginLeft: scaleWidth(2),
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {block.repeatFrequency === 'daily' ? 'Daily' : 
                    block.repeatFrequency === 'weekly' ? 'Weekly' : 'Monthly'}
                  </Text>
                )}
              </View>
            )}
          </View>
        ) : (
          // Normal stacked layout
          <>
            <View style={styles.timeBlockHeader}>
              <Text 
                style={[
                  styles.timeBlockTime, 
                  { color: textColor }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {formatTime(block.startTime)} - {formatTime(block.endTime)}
              </Text>
              
              {/* Show calendar indicator for calendar events */}
              {isCalendarEvent && (
                <View style={styles.repeatingIndicator}>
                  <Ionicons 
                    name="calendar" 
                    size={scaleWidth(14)} 
                    color={textColor} 
                  />
                  <Text 
                    style={[
                      styles.repeatingText, 
                      { color: textColor }
                    ]}
                    maxFontSizeMultiplier={1.3}
                  >
                    {block.source === 'device_calendar' ? 'Cal' : 'Sync'}
                  </Text>
                </View>
              )}
              
              {/* Show repeat indicator with frequency text */}
              {!isCalendarEvent && (isRepeatingBlock || isRepeatingInstance) && (
                <View style={styles.repeatingIndicator}>
                  <Ionicons 
                    name="repeat" 
                    size={scaleWidth(14)} 
                    color={textColor} 
                  />
                  {block.repeatFrequency && (
                    <Text 
                      style={[
                        styles.repeatingText, 
                        { color: textColor }
                      ]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {block.repeatFrequency === 'daily' ? 'Daily' : 
                      block.repeatFrequency === 'weekly' ? 'Weekly' : 'Monthly'}
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            <Text 
              style={[
                styles.timeBlockTitle, 
                { color: textColor }
              ]} 
              numberOfLines={height < scaleHeight(60) ? 1 : 2}
              maxFontSizeMultiplier={1.3}
            >
              {block.title}
            </Text>
          </>
        )}
        
        {/* Display project and task information if available and enough height */}
        {height >= scaleHeight(80) && (hasProject || hasTask) && (
          <View style={styles.timeBlockProjectTask}>
            {hasProject && height >= scaleHeight(80) && (
              <View style={styles.projectContainer}>
                <Ionicons 
                  name="folder-outline" 
                  size={scaleWidth(12)} 
                  color={textColor} 
                />
                <Text 
                  style={[
                    styles.projectTaskText, 
                    { color: textColor }
                  ]} 
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  {block.projectTitle}
                </Text>
              </View>
            )}
            
            {hasTask && height >= scaleHeight(90) && (
              <View style={styles.taskContainer}>
                <Ionicons 
                  name="checkbox-outline" 
                  size={scaleWidth(12)} 
                  color={textColor} 
                />
                <Text 
                  style={[
                    styles.projectTaskText, 
                    { color: textColor }
                  ]} 
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  {block.taskTitle}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {height >= scaleHeight(60) && (
          <View style={styles.timeBlockFooter}>
            <View 
              style={[
                styles.domainBadge, 
                { backgroundColor: blockColor }
              ]}
            >
              <Text 
                style={[
                  styles.domainText,
                  { color: domainBadgeTextColor }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {isCalendarEvent 
                  ? (block.source === 'device_calendar' ? 'Calendar' : block.source)
                  : (block.isGeneralActivity ? block.category : block.domain)
                }
              </Text>
            </View>
            
            {block.location && height >= scaleHeight(100) && (
              <View style={styles.locationContainer}>
                <Ionicons 
                  name="location-outline" 
                  size={scaleWidth(12)} 
                  color={textColor} 
                />
                <Text 
                  style={[
                    styles.locationText, 
                    { color: textColor }
                  ]} 
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                >
                  {block.location}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.dayViewContainer}>
      <View style={styles.dayViewContent}>
        {/* Time indicators */}
        <View style={styles.timeIndicatorsColumn}>
          {timeSlots.map((hour) => (
            <View 
              key={`hour-${hour}`} 
              style={[
                styles.timeIndicator, 
                { height: hourHeight }
              ]}
            >
              <Text 
                style={[
                  styles.timeText, 
                  { color: theme.textSecondary }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Time grid with horizontal lines */}
        <TouchableOpacity 
          style={styles.timeGridContainer}
          activeOpacity={1}
          onPress={(event) => {
            const { locationY } = event.nativeEvent;
            
            // Calculate which hour was tapped based on position
            const tappedHour = Math.floor(locationY / hourHeight);
            const hourFraction = (locationY % hourHeight) / hourHeight;
            const exactMinutes = hourFraction * 60;
            
            // Round to nearest 30-minute increment (0 or 30)
            const roundedMinutes = Math.round(exactMinutes / 30) * 30;
            
            // Handle case where rounding gives us 60 minutes (next hour)
            let finalHour = tappedHour;
            let finalMinutes = roundedMinutes;
            
            if (roundedMinutes >= 60) {
              finalHour = tappedHour + 1;
              finalMinutes = 0;
            }
            
            // Ensure we stay within valid bounds (0-23 hours)
            finalHour = Math.max(0, Math.min(23, finalHour));
            finalMinutes = Math.max(0, Math.min(30, finalMinutes)); // 0 or 30 only
            
            // Create start time for the tapped position
            const startTime = new Date(currentDate);
            startTime.setHours(finalHour, finalMinutes, 0, 0);
            
            // Create end time (30 minutes later by default)
            const endTime = new Date(startTime);
            endTime.setMinutes(startTime.getMinutes() + 30);
            
            // Create a time block with pre-filled times
            if (typeof handleAddTimeBlockWithTime === 'function') {
              handleAddTimeBlockWithTime(startTime.toISOString(), endTime.toISOString());
            } else {
              // Fallback to regular function if the new one isn't available
              handleAddTimeBlock();
            }
          }}
        >
          {timeSlots.map((hour) => (
            <View 
              key={`grid-${hour}`} 
              style={[
                styles.timeGridRow, 
                { height: hourHeight }
              ]}
            >
              <View 
                style={[
                  styles.timeGridLine, 
                  { backgroundColor: theme.border }
                ]} 
              />
            </View>
          ))}
          
          {/* Time blocks positioned absolutely over the grid */}
          {blocksForDay
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .map(renderTimeBlock)}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DayView;
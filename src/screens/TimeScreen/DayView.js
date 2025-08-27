// src/screens/TimeScreen/DayView.js
import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
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
  onTimeBlockPress, 
  onTimeBlockLongPress,
  editTimeBlock,
  deleteTimeBlock,
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
  scale,
  isTourActive
}) => {
  // Local state for expanded time block to prevent parent re-renders
  const [expandedTimeBlockId, setExpandedTimeBlockId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Local handler for time block long press
  const handleLocalTimeBlockLongPress = useCallback((timeBlock) => {
    // Disable during tour
    if (isTourActive) {
      console.log('🎯 DayView: Local timeblock long press disabled during tour');
      return;
    }
    
    // Call original handler first
    onTimeBlockLongPress(timeBlock);
    // Then toggle expanded state locally
    setExpandedTimeBlockId(expandedTimeBlockId === timeBlock.id ? null : timeBlock.id);
  }, [onTimeBlockLongPress, expandedTimeBlockId, isTourActive]);

  // Function to collapse expanded time block
  const handleCollapseTimeBlock = useCallback(() => {
    setExpandedTimeBlockId(null);
    setConfirmDeleteId(null);
  }, []);


  // Function to handle initial delete press - show confirmation
  const handleDeleteTimeBlock = useCallback((timeBlock) => {
    setConfirmDeleteId(timeBlock.id);
  }, []);

  // Function to handle confirmed deletion
  const handleConfirmDelete = useCallback((timeBlock, deleteType = null) => {
    setExpandedTimeBlockId(null);
    setConfirmDeleteId(null);
    
    if (deleteType) {
      // For recurring blocks with specific delete type
      if (deleteType === 'single') {
        deleteTimeBlock(timeBlock.id, 'single');
      } else if (deleteType === 'series') {
        deleteTimeBlock(timeBlock.seriesId || timeBlock.id, 'series');
      }
    } else {
      // For regular blocks
      deleteTimeBlock(timeBlock.id);
    }
  }, [deleteTimeBlock]);

  // Function to cancel deletion
  const handleCancelDelete = useCallback(() => {
    setConfirmDeleteId(null);
  }, []);
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
  
  // Get current hour height based on zoom level
  const hourHeight = getHourHeight();
  
  // Render time block
  const renderTimeBlock = (block) => {
    // Safety check: ensure block is valid
    if (!block || typeof block !== 'object') {
      console.warn('DayView: renderTimeBlock received invalid block:', block);
      return null;
    }
    
    const { height, top } = calculateTimeBlockStyle(block);
    
    // Check if this is a calendar event
    const isCalendarEvent = block.isCalendarEvent === true;
    
    // Check if this is a repeating instance or repeating block
    const isRepeatingInstance = block.isRepeatingInstance === true;
    const isRepeatingBlock = block.isRepeating === true;
    
    // Get darker shade of domain color for border - ensure always valid
    const blockColor = isCalendarEvent 
      ? block.color || '#2196F3' 
      : (block.isGeneralActivity ? (block.customColor || '#6366f1') : (block.domainColor || '#6366f1'));
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
    
    // Check if we should use inline layout based on actual rendered height
    // Switch to inline when either:
    // 1. Zoomed out significantly (scale < 0.7), OR  
    // 2. The time block's rendered height is too small to display stacked content properly
    // Scale the threshold based on current scale for consistency
    const baseMinHeight = 50;
    const scaledMinHeight = baseMinHeight * Math.max(scale, 0.4); // Don't go below 40% of base
    const useInlineLayout = scale < 0.7 || height < scaledMinHeight;
    
    // ==========================================
    // CONTENT FITTING ENGINE - Research-Based Approach  
    // ==========================================
    
    // Content priority queue (most important first)
    const CONTENT_PRIORITY = [
      { type: 'title', essential: true, minHeight: 16, baseSize: 14 },
      { type: 'time', essential: false, minHeight: 14, baseSize: 12 },
      { type: 'milestone', essential: false, minHeight: 20, baseSize: 10 },
      { type: 'details', essential: false, minHeight: 32, baseSize: 11 },
      { type: 'location', essential: false, minHeight: 18, baseSize: 9 }
    ];
    
    // Calculate available content area (exclude padding)
    const verticalPadding = scaleWidth(6) * 2; // Top + bottom padding
    const availableHeight = height - verticalPadding;
    
    // Dynamic font calculation based on zoom and available space
    const calculateContentFontSize = (baseSize, zoomScale, availableSpace) => {
      // Base responsive scaling
      const responsive = scaleFontSize(baseSize, 0.3);
      // Apply zoom influence (gentler than before)
      const zoomAdjusted = responsive * Math.pow(zoomScale, 0.35);
      // Constrain based on available space (prevent overflow)
      const spaceConstrained = Math.min(zoomAdjusted, availableSpace * 0.6);
      // Ensure minimum readability
      return Math.max(8, Math.round(spaceConstrained));
    };
    
    // Content Fitting Algorithm - Determines what can fit
    const fitContent = (containerHeight, zoomScale) => {
      let remainingHeight = containerHeight;
      let fittedContent = [];
      
      // Always try to show at least clean block
      if (remainingHeight < 27.5) {
        return { mode: 'clean', content: [] };
      }
      
      // Try to fit content in priority order
      for (const item of CONTENT_PRIORITY) {
        const fontSize = calculateContentFontSize(item.baseSize, zoomScale, remainingHeight);
        const itemHeight = Math.max(fontSize * 1.2, item.minHeight); // Line height + minimum touch
        
        // For essential content, try to fit even if tight
        if (item.essential) {
          fittedContent.push({
            ...item,
            fontSize,
            allocatedHeight: itemHeight
          });
          remainingHeight -= itemHeight;
        } 
        // For non-essential content, only add if we have enough space
        else if (remainingHeight >= itemHeight) {
          fittedContent.push({
            ...item,
            fontSize,
            allocatedHeight: itemHeight
          });
          remainingHeight -= itemHeight;
        }
        // If non-essential item doesn't fit, continue to try other items
      }
      
      // If we have no content fitted, show clean block
      if (fittedContent.length === 0) {
        return { mode: 'clean', content: [] };
      }
      
      // Determine display mode based on what fit
      let mode = 'minimal';
      if (fittedContent.find(c => c.type === 'details')) mode = 'full';
      else if (fittedContent.find(c => c.type === 'milestone')) mode = 'standard';
      else if (fittedContent.find(c => c.type === 'time')) mode = 'compact';
      
      return { mode, content: fittedContent };
    };
    
    // Get fitted content for this time block
    const fittingResult = fitContent(availableHeight, scale);
    const showContent = fittingResult.mode !== 'clean';
    
    // Create font size lookup for easy access
    const dynamicFontSizes = {};
    fittingResult.content.forEach(item => {
      dynamicFontSizes[item.type] = item.fontSize;
    });
    
    // Helper functions to check what content is included
    const hasTitle = fittingResult.content.some(c => c.type === 'title');
    const hasTime = fittingResult.content.some(c => c.type === 'time');
    const hasMilestone = fittingResult.content.some(c => c.type === 'milestone');
    const hasDetails = fittingResult.content.some(c => c.type === 'details');
    const hasLocationContent = fittingResult.content.some(c => c.type === 'location');
    
    // Create accessibility label with all relevant information - with safe string handling
    const safeTitle = block.title || 'Untitled';
    const safeSource = block.source || 'Unknown';
    const safeCategory = block.category || 'General';
    const safeDomain = block.domain || 'Personal';
    const safeProjectTitle = block.projectTitle || '';
    const safeTaskTitle = block.taskTitle || '';
    const safeLocation = block.location || '';
    
    const accessibilityLabel = `${safeTitle}${(block.startTime && block.endTime) ? ` from ${formatTime(block.startTime)} to ${formatTime(block.endTime)}` : ' (time not set)'}` + 
      `${isCalendarEvent ? `, Calendar Event from ${safeSource}` : 
        (block.isGeneralActivity ? `, Category: ${safeCategory}` : `, Domain: ${safeDomain}`)}` +
      `${!isCalendarEvent && hasProject ? `, Project: ${safeProjectTitle}` : ''}` +
      `${!isCalendarEvent && hasTask ? `, Task: ${safeTaskTitle}` : ''}` +
      `${safeLocation ? `, Location: ${safeLocation}` : ''}` +
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
            // Ensure text is not clipped
            overflow: 'visible',
            justifyContent: 'flex-start', // Override space-between to prevent text clipping
            paddingVertical: scaleWidth(6), // Slightly reduce padding to give more text space
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
        onPress={() => onTimeBlockPress(block)}
        onLongPress={(event) => handleLocalTimeBlockLongPress && handleLocalTimeBlockLongPress(block, event)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={isCalendarEvent ? "Shows details of this calendar event" : "Opens details to edit this time block"}
      >
        {/* Delete overlay when expanded */}
        {expandedTimeBlockId === block.id && !isCalendarEvent && (
          <View style={[
            styles.deleteOverlay,
            { 
              backgroundColor: confirmDeleteId === block.id ? '#FF3B30' : '#FF3B30',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: scaleWidth(8),
              padding: scaleWidth(8)
            }
          ]}>
            {confirmDeleteId === block.id ? (
              // Show confirmation message
              <>
                {(block.isRepeating || block.isRepeatingInstance) ? (
                  // Recurring block options
                  <>
                    <Text style={[styles.confirmText, { color: '#FFFFFF', textAlign: 'center', marginBottom: scaleHeight(8) }]}>
                      Delete instance or series?
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                      <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: 'rgba(255,255,255,0.2)', marginRight: scaleWidth(4) }]}
                        onPress={() => handleConfirmDelete(block, 'single')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>Instance</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: 'rgba(255,255,255,0.2)', marginRight: scaleWidth(4) }]}
                        onPress={() => handleConfirmDelete(block, 'series')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>Series</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        onPress={handleCancelDelete}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  // Regular block confirmation
                  <>
                    <Text style={[styles.confirmText, { color: '#FFFFFF', textAlign: 'center', marginBottom: scaleHeight(8) }]}>
                      Are you sure?
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%' }}>
                      <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: 'rgba(255,255,255,0.2)', marginRight: scaleWidth(8) }]}
                        onPress={() => handleConfirmDelete(block)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>Delete</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.confirmButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        onPress={handleCancelDelete}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            ) : (
              // Show initial delete button
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteTimeBlock(block)}
                activeOpacity={0.8}
              >
                <Ionicons name="trash" size={scaleWidth(24)} color="#FFFFFF" />
                <Text style={[styles.deleteButtonText, { color: '#FFFFFF' }]}>
                  Tap to Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Content Fitting Engine - Smart Content Display */}
        {showContent && (() => {
          const layout = useInlineLayout ? 'inline' : 'stacked';
          
          return layout === 'inline' ? (
            // INLINE LAYOUT - Compact horizontal arrangement
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: scaleWidth(4),
              flex: 1,
              height: '100%',
            }}>
              {/* Time (Priority 2 - Essential) */}
              {hasTime && (
                <Text 
                  style={[
                    styles.timeBlockTime, 
                    { 
                      color: textColor,
                      fontSize: dynamicFontSizes.time || 12,
                      lineHeight: (dynamicFontSizes.time || 12) * 1.2,
                      marginRight: scaleWidth(6),
                      fontWeight: '500',
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                  numberOfLines={1}
                >
                  {(block.startTime && block.endTime) ? 
                    `${formatTime(block.startTime)}-${formatTime(block.endTime)}` : 
                    'Time not set'}
                </Text>
              )}
              
              {/* Title (Priority 1 - Essential) */}
              {hasTitle && (
                <Text 
                  style={[
                    styles.timeBlockTitle, 
                    { 
                      color: textColor,
                      fontSize: dynamicFontSizes.title || 14,
                      lineHeight: (dynamicFontSizes.title || 14) * 1.2,
                      fontWeight: '600',
                      flex: 1,
                      marginRight: scaleWidth(4),
                    }
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  maxFontSizeMultiplier={1.3}
                >
                  {safeTitle}
                </Text>
              )}

              {/* Milestone Badge (Priority 3 - Visual Context) */}
              {hasMilestone && (
                <View 
                  style={{
                    backgroundColor: blockColor,
                    paddingHorizontal: scaleWidth(3),
                    paddingVertical: scaleWidth(1),
                    borderRadius: scaleWidth(8),
                    opacity: 0.9,
                    alignSelf: 'center',
                  }}
                >
                  <Text 
                    style={[
                      styles.inlineBadgeText, 
                      { 
                        color: '#FFFFFF',
                        fontSize: dynamicFontSizes.milestone || 10,
                        lineHeight: (dynamicFontSizes.milestone || 10) * 1.1,
                        fontWeight: '600',
                      }
                    ]} 
                    numberOfLines={1}
                  >
                    {isCalendarEvent ? safeSource : (block.isGeneralActivity ? safeCategory : safeDomain)}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // STACKED LAYOUT - Vertical arrangement for larger blocks
            <View style={{
              paddingHorizontal: scaleWidth(8),
              paddingTop: scaleWidth(4),
              flex: 1,
              justifyContent: 'flex-start',
            }}>
              {/* Title (Priority 1 - Essential) */}
              {hasTitle && (
                <Text 
                  style={[
                    styles.timeBlockTitle, 
                    { 
                      color: textColor,
                      fontSize: dynamicFontSizes.title || 14,
                      lineHeight: (dynamicFontSizes.title || 14) * 1.2,
                      fontWeight: '600',
                      marginBottom: scaleWidth(2),
                    }
                  ]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                  maxFontSizeMultiplier={1.3}
                >
                  {safeTitle}
                </Text>
              )}

              {/* Time (Priority 2 - Essential) */}
              {hasTime && (
                <Text 
                  style={[
                    styles.timeBlockTime, 
                    { 
                      color: textColor,
                      fontSize: dynamicFontSizes.time || 12,
                      lineHeight: (dynamicFontSizes.time || 12) * 1.2,
                      fontWeight: '500',
                      marginBottom: scaleWidth(2),
                    }
                  ]}
                  maxFontSizeMultiplier={1.3}
                  numberOfLines={1}
                >
                  {(block.startTime && block.endTime) ? 
                    `${formatTime(block.startTime)} - ${formatTime(block.endTime)}` : 
                    'Time not set'}
                </Text>
              )}

              {/* Milestone Badge (Priority 3 - Visual Context) */}
              {hasMilestone && (
                <View 
                  style={{
                    backgroundColor: blockColor,
                    paddingHorizontal: scaleWidth(4),
                    paddingVertical: scaleWidth(2),
                    borderRadius: scaleWidth(8),
                    opacity: 0.9,
                    alignSelf: 'flex-start',
                    marginBottom: scaleWidth(2),
                  }}
                >
                  <Text 
                    style={[
                      styles.badgeText, 
                      { 
                        color: '#FFFFFF',
                        fontSize: dynamicFontSizes.milestone || 10,
                        lineHeight: (dynamicFontSizes.milestone || 10) * 1.1,
                        fontWeight: '600',
                      }
                    ]} 
                    numberOfLines={1}
                  >
                    {isCalendarEvent ? safeSource : (block.isGeneralActivity ? safeCategory : safeDomain)}
                  </Text>
                </View>
              )}

              {/* Details (Priority 4 - Project/Task Info) */}
              {hasDetails && (hasProject || hasTask) && (
                <View style={styles.timeBlockProjectTask}>
                  {hasProject && (
                    <View style={styles.projectContainer}>
                      <Ionicons 
                        name="folder-outline" 
                        size={(dynamicFontSizes.details || 11) * 1.1} 
                        color={textColor} 
                      />
                      <Text 
                        style={[
                          styles.projectTaskText, 
                          { 
                            color: textColor,
                            fontSize: dynamicFontSizes.details || 11,
                            lineHeight: (dynamicFontSizes.details || 11) * 1.2,
                          }
                        ]} 
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        {safeProjectTitle}
                      </Text>
                    </View>
                  )}
                  
                  {hasTask && (
                    <View style={styles.taskContainer}>
                      <Ionicons 
                        name="checkbox-outline" 
                        size={(dynamicFontSizes.details || 11) * 1.1} 
                        color={textColor} 
                      />
                      <Text 
                        style={[
                          styles.projectTaskText, 
                          { 
                            color: textColor,
                            fontSize: dynamicFontSizes.details || 11,
                            lineHeight: (dynamicFontSizes.details || 11) * 1.2,
                          }
                        ]} 
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.3}
                      >
                        {safeTaskTitle}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Location (Priority 5 - Nice to Have) */}
              {hasLocationContent && safeLocation && (
                <View style={{
                  position: 'absolute',
                  bottom: scaleWidth(6),
                  left: scaleWidth(8),
                  right: scaleWidth(8),
                }}>
                  <View style={styles.locationContainer}>
                    <Ionicons 
                      name="location-outline" 
                      size={(dynamicFontSizes.location || 9) * 1.1} 
                      color={textColor} 
                    />
                    <Text 
                      style={[
                        styles.locationText, 
                        { 
                          color: textColor,
                          fontSize: dynamicFontSizes.location || 9,
                          lineHeight: (dynamicFontSizes.location || 9) * 1.2,
                        }
                      ]} 
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.3}
                    >
                      {safeLocation}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        })()}
      </TouchableOpacity>
    );
  };

  // Emergency try-catch wrapper to isolate the error
  try {
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
              // Collapse expanded time block and confirmation when tapping away
              if ((expandedTimeBlockId || confirmDeleteId) && handleCollapseTimeBlock) {
                handleCollapseTimeBlock();
                return;
              }
              
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
              .filter(block => block && block.startTime) // Filter out invalid blocks
              .sort((a, b) => {
                try {
                  const dateA = new Date(a.startTime);
                  const dateB = new Date(b.startTime);
                  if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                  return dateA - dateB;
                } catch (error) {
                  console.warn('Error sorting time blocks:', error);
                  return 0;
                }
              })
              .map(renderTimeBlock)
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  } catch (error) {
    console.error('🚨 DayView Error:', error);
    console.error('🚨 DayView Error Stack:', error.stack);
    console.error('🚨 Props causing issue:', { 
      timeBlocks: Array.isArray(timeBlocks) ? timeBlocks.length : 'not array', 
      currentDate,
      timeSlots: Array.isArray(timeSlots) ? timeSlots.length : 'not array',
      blocksForDay: Array.isArray(blocksForDay) ? blocksForDay.length : 'not array'
    });
    
    // Return a safe fallback
    return (
      <View style={styles.dayViewContainer}>
        <View style={styles.dayViewContent}>
          <Text style={{ color: theme.text, padding: 20, textAlign: 'center' }}>
            DayView Error: {error.message}
          </Text>
        </View>
      </View>
    );
  }
};

export default React.memo(DayView, (prevProps, nextProps) => {
  // Only re-render if relevant props change
  return (
    prevProps.currentDate === nextProps.currentDate &&
    prevProps.timeBlocks === nextProps.timeBlocks &&
    prevProps.scale === nextProps.scale &&
    prevProps.theme === nextProps.theme &&
    prevProps.onTimeBlockPress === nextProps.onTimeBlockPress &&
    prevProps.onTimeBlockLongPress === nextProps.onTimeBlockLongPress
  );
});

// src/screens/TimeScreen/DayView.js
import React, { useState, useCallback, useEffect } from 'react';
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for real-time indicator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

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
    
    // Use more subtle background with professional opacity
    const backgroundColor = blockColor + (isDarkMode ? 'CC' : 'E6'); // More visible: CC=20%, E6=10% opacity
    const solidBackgroundColor = blockColor;
    
    // High contrast text colors for readability against colored backgrounds
    const primaryTextColor = isDarkMode ? '#FFFFFF' : '#1A1A1A'; // Very dark text for light backgrounds
    const secondaryTextColor = isDarkMode ? '#E0E0E0' : '#404040'; // Medium contrast secondary text
    const timeTextColor = isDarkMode ? '#E0E0E0' : '#505050'; // Readable time text
    
    // Use the block color for accents
    const accentColor = blockColor;
    
    // Create safe string variables with proper defaults
    const safeTitle = block.title || 'Untitled';
    const safeSource = block.source || 'Unknown';
    const safeCategory = block.category || 'General';
    const safeDomain = block.domain || 'Personal';
    // In this system, milestones ARE the projects
    const safeProjectTitle = block.milestoneTitle || '';
    const safeTaskTitle = block.taskTitle || '';
    const safeLocation = block.location || '';

    // Check if project and task information is available
    const hasProject = block.milestoneTitle && !block.isGeneralActivity;
    const hasTask = block.taskTitle && !block.isGeneralActivity;
    
    // Calculate space requirements for badges to prevent overflow
    const goalBadgeHeight = scaleHeight(6) * 2 + scaleFontSize(12) * 1.3 + scaleHeight(4); // padding + text + margin
    const milestoneBadgeHeight = scaleHeight(5) * 2 + scaleFontSize(11) * 1.3 + scaleHeight(4); // padding + text + margin  
    const taskBadgeHeight = scaleHeight(5) * 2 + scaleFontSize(11) * 1.3 + scaleHeight(4); // padding + text + margin
    
    // Check what can fit based on remaining space after title and time
    const titleHeight = scaleFontSize(15) * 1.3 + scaleHeight(2); // title line height + margin
    const timeHeight = scaleFontSize(12) * 1.2; // time line height
    const leftSideUsedHeight = titleHeight + timeHeight + scaleHeight(10); // extra padding
    const availableRightSideHeight = height - leftSideUsedHeight;
    
    // Determine what badges can fit without overflowing
    let canShowGoal = (safeDomain || safeCategory || safeSource) && availableRightSideHeight >= goalBadgeHeight;
    let canShowMilestone = hasProject && availableRightSideHeight >= (goalBadgeHeight + milestoneBadgeHeight) && canShowGoal;
    let canShowTask = hasTask && availableRightSideHeight >= (goalBadgeHeight + milestoneBadgeHeight + taskBadgeHeight) && canShowGoal && canShowMilestone;
    
    // If goal can't fit, nothing else can fit
    if (!canShowGoal) {
      canShowMilestone = false;
      canShowTask = false;
    }
    
    // If milestone can't fit, task can't fit either
    if (!canShowMilestone) {
      canShowTask = false;
    }
    
    // Additional height-based restrictions (original logic)
    canShowMilestone = canShowMilestone && height > 35;
    canShowTask = canShowTask && height > 50;
    
    
    // Simple content display logic
    const showContent = height > 20; // Show content if timeblock is taller than 20px
    
    // Check if we should use inline layout for very small or wide blocks
    const useInlineLayout = height < 50 || (height / scaleWidth(280)) > 3;
    
    // Create accessibility label with all relevant information
    
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
            // Professional colored background
            backgroundColor: backgroundColor,
            // Professional look without borders
            borderRadius: 6, // Less rounded for more professional look
            // Professional shadow - subtle but defined
            shadowColor: isDarkMode ? '#000000' : '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDarkMode ? 0.3 : 0.1,
            shadowRadius: 2,
            elevation: 2,
            // Professional padding
            paddingVertical: scaleHeight(10),
            paddingHorizontal: scaleWidth(14),
            // Layout
            overflow: 'visible',
            justifyContent: 'flex-start',
          },
          // Add distinct styling for calendar events
          isCalendarEvent && {
            opacity: 0.95
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
        
        {/* Simple Content Display */}
        {showContent && (
          useInlineLayout ? (
            // INLINE LAYOUT for small/wide blocks
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              flex: 1,
              paddingHorizontal: scaleWidth(2),
            }}>
              {/* Title */}
              <Text 
                style={[
                  styles.timeBlockTitle, 
                  { 
                    color: primaryTextColor,
                    fontSize: scaleFontSize(14),
                    fontWeight: '600',
                    flex: 1,
                    marginRight: scaleWidth(6),
                  }
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
                maxFontSizeMultiplier={1.3}
              >
                {safeTitle}
              </Text>
              
              {/* Recurring symbol (instead of time in inline layout) */}
              {(block.isRepeating || block.isRepeatingInstance) && (
                <View style={{
                  backgroundColor: isDarkMode ? '#444444' : '#F0F0F0',
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#666666' : '#CCCCCC',
                  paddingHorizontal: scaleWidth(6),
                  paddingVertical: scaleHeight(2),
                  borderRadius: 6,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}>
                  <Ionicons 
                    name="refresh-outline" 
                    size={scaleFontSize(10)} 
                    color={isDarkMode ? '#CCCCCC' : '#555555'}
                    style={{ marginRight: scaleWidth(2) }}
                  />
                  <Text style={{
                    color: isDarkMode ? '#CCCCCC' : '#555555',
                    fontSize: scaleFontSize(8),
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    {block.repeatFrequency === 'daily' ? 'D' : 
                     block.repeatFrequency === 'weekly' ? 'W' : 
                     block.repeatFrequency === 'monthly' ? 'M' : 'R'}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // TRADITIONAL TWO-COLUMN LAYOUT: Left side = Title/Time, Right side = Badges OR Icon
            <View style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
                alignItems: 'flex-start',
                paddingHorizontal: scaleWidth(2),
              }}>
                {/* LEFT SIDE - Title and Time Stacked */}
                <View style={{
                  flex: 1,
                  justifyContent: 'flex-start',
                  marginRight: scaleWidth(8),
                }}>
                  {/* Title */}
                  <Text 
                    style={[
                      styles.timeBlockTitle, 
                      { 
                        color: primaryTextColor,
                        fontSize: scaleFontSize(15),
                        fontWeight: '600',
                        marginBottom: scaleHeight(2),
                      }
                    ]}
                    numberOfLines={useInlineLayout ? 1 : 2}
                    ellipsizeMode="tail"
                    maxFontSizeMultiplier={1.3}
                  >
                    {safeTitle}
                  </Text>

                  {/* Time below title */}
                  {block.startTime && block.endTime && (
                    <Text 
                      style={[
                        styles.timeBlockTime, 
                        { 
                          color: timeTextColor,
                          fontSize: scaleFontSize(12),
                          fontWeight: '500',
                        }
                      ]}
                      maxFontSizeMultiplier={1.2}
                      numberOfLines={1}
                    >
                      {formatTime(block.startTime)} - {formatTime(block.endTime)}
                    </Text>
                  )}
                </View>

                {/* RIGHT SIDE - Hierarchy Badges: Goal → Milestone → Task */}
                <View style={{
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  minWidth: scaleWidth(80),
                }}>
                  {/* Custom Icon OR Traditional Badge System with Recurring */}
                  {!(block.isGeneralActivity && block.customIcon) && (block.isRepeating || block.isRepeatingInstance) && (
                    /* Recurring symbol for traditional badge layout only */
                    <View style={{
                      backgroundColor: isDarkMode ? '#444444' : '#F0F0F0',
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#666666' : '#CCCCCC',
                      paddingHorizontal: scaleWidth(8),
                      paddingVertical: scaleHeight(3),
                      borderRadius: 8,
                      marginBottom: scaleHeight(3),
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row',
                    }}>
                      <Ionicons 
                        name="refresh-outline" 
                        size={scaleFontSize(12)} 
                        color={isDarkMode ? '#CCCCCC' : '#555555'}
                        style={{ marginRight: scaleWidth(4) }}
                      />
                      <Text style={{
                        color: isDarkMode ? '#CCCCCC' : '#555555',
                        fontSize: scaleFontSize(10),
                        fontWeight: '600',
                        textAlign: 'center',
                      }}>
                        {block.repeatFrequency === 'daily' ? 'D' : 
                         block.repeatFrequency === 'weekly' ? 'W' : 
                         block.repeatFrequency === 'monthly' ? 'M' : 'R'}
                      </Text>
                    </View>
                  )}
                  
                  {/* Custom Icon OR Traditional Badge System */}
                  {block.isGeneralActivity && block.customIcon ? (
                    /* Vertically centered custom icon with optional recurring symbol */
                    <View style={{
                      flex: 1,
                      justifyContent: 'center', // Vertical centering
                      alignItems: 'center',     // Horizontal centering
                      minHeight: height - 20,   // Full available height
                      flexDirection: 'row',     // Horizontal layout for icon + recurring
                      gap: 8                    // Space between icon and recurring symbol
                    }}>
                      <Ionicons 
                        name={block.customIcon} 
                        size={(() => {
                          // Scale with timeblock height but constrained by sidebar width
                          const maxSize = Math.min(height * 0.6, 60); // 60% of height, max 60px
                          return Math.min(Math.max(maxSize, 16), 60);
                        })()}
                        color="#FFFFFF"
                        style={{ 
                          paddingTop: 2, // Fix Ionicons vertical alignment issue
                        }}
                      />
                      
                      {/* Recurring symbol next to icon */}
                      {(block.isRepeating || block.isRepeatingInstance) && height > 40 && (
                        <View style={{
                          backgroundColor: isDarkMode ? '#444444' : '#F0F0F0',
                          borderWidth: 1,
                          borderColor: isDarkMode ? '#666666' : '#CCCCCC',
                          paddingHorizontal: scaleWidth(6),
                          paddingVertical: scaleHeight(3),
                          borderRadius: 6,
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                          <Ionicons 
                            name="refresh-outline" 
                            size={scaleFontSize(12)} 
                            color={isDarkMode ? '#CCCCCC' : '#555555'}
                            style={{ marginRight: scaleWidth(2) }}
                          />
                          <Text style={{
                            color: isDarkMode ? '#CCCCCC' : '#555555',
                            fontSize: scaleFontSize(10),
                            fontWeight: '600',
                            textAlign: 'center',
                          }}>
                            {block.repeatFrequency === 'daily' ? 'D' : 
                             block.repeatFrequency === 'weekly' ? 'W' : 
                             block.repeatFrequency === 'monthly' ? 'M' : 'R'}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    /* Traditional Badge System */
                    <>
                      {/* 1. GOAL Badge (highest level) */}
                    {canShowGoal && (
                      <View style={{ 
                        backgroundColor: isDarkMode ? '#333333' : '#F8F8F8',
                        borderWidth: 1.5,
                        borderColor: isDarkMode ? '#555555' : '#E0E0E0',
                        paddingHorizontal: scaleWidth(12),
                        paddingVertical: scaleHeight(6),
                        borderRadius: 12,
                        marginBottom: scaleHeight(4),
                        maxWidth: scaleWidth(140),
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Ionicons 
                          name="flag-outline" 
                          size={scaleFontSize(14)} 
                          color={isDarkMode ? '#FFFFFF' : '#333333'}
                          style={{ marginRight: scaleWidth(6) }}
                        />
                        <Text 
                          style={{
                            color: isDarkMode ? '#FFFFFF' : '#333333',
                            fontSize: scaleFontSize(12),
                            fontWeight: '700', // Bold for goal
                            textAlign: 'center',
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {isCalendarEvent ? safeSource : (block.isGeneralActivity ? safeCategory : safeDomain)}
                        </Text>
                      </View>
                    )}

                    {/* 2. MILESTONE Badge (project level) */}
                    {canShowMilestone && (
                      <View style={{ 
                        backgroundColor: isDarkMode ? '#2A2A2A' : '#FFFFFF',
                        borderWidth: 1.5,
                        borderColor: isDarkMode ? '#444444' : '#CCCCCC',
                        paddingHorizontal: scaleWidth(10),
                        paddingVertical: scaleHeight(5),
                        borderRadius: 10,
                        marginBottom: scaleHeight(4),
                        maxWidth: scaleWidth(140),
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Ionicons 
                          name="diamond-outline" 
                          size={scaleFontSize(12)} 
                          color={isDarkMode ? '#CCCCCC' : '#666666'}
                          style={{ marginRight: scaleWidth(5) }}
                        />
                        <Text 
                          style={{
                            color: isDarkMode ? '#CCCCCC' : '#666666',
                            fontSize: scaleFontSize(11),
                            fontWeight: '600',
                            textAlign: 'center',
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {safeProjectTitle}
                        </Text>
                      </View>
                    )}

                    {/* 3. TASK Badge (lowest level) */}
                    {canShowTask && (
                      <View style={{ 
                        backgroundColor: isDarkMode ? '#1F1F1F' : '#FAFAFA',
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#333333' : '#DDDDDD',
                        paddingHorizontal: scaleWidth(10),
                        paddingVertical: scaleHeight(5),
                        borderRadius: 10,
                        marginBottom: scaleHeight(4),
                        maxWidth: scaleWidth(140),
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Ionicons 
                          name="checkmark-done-outline" 
                          size={scaleFontSize(12)} 
                          color={isDarkMode ? '#AAAAAA' : '#777777'}
                          style={{ marginRight: scaleWidth(5) }}
                        />
                        <Text 
                          style={{
                            color: isDarkMode ? '#AAAAAA' : '#777777',
                            fontSize: scaleFontSize(11),
                            fontWeight: '500',
                            textAlign: 'center',
                          }}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {safeTaskTitle}
                        </Text>
                      </View>
                    )}
                  </>
                  )}
                </View>
              </View>
            )
        )}
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
            
            {/* Current time indicator line */}
            {(() => {
              const currentHour = currentTime.getHours();
              const currentMinutes = currentTime.getMinutes();
              const totalMinutes = currentHour * 60 + currentMinutes;
              const dayMinutes = 24 * 60; // Total minutes in a day
              const position = (totalMinutes / dayMinutes) * (hourHeight * timeSlots.length);
              
              return (
                <View
                  style={{
                    position: 'absolute',
                    top: position,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: '#FFFFFF',
                    zIndex: 999,
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                    elevation: 3,
                  }}
                />
              );
            })()}
            
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

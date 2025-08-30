// src/screens/TimeScreen/MonthView.js
import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TimeBlock from '../../components/TimeBlock';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import responsive from '../../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';
import IconPicker from '../../components/IconPicker';

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
  onTimeBlockPress,
  onTimeBlockLongPress,
  handleAddTimeBlock,
  deleteTimeBlock,
  styles,
  theme,
  isDarkMode,
  navigation
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
  
  // Expansion state for delete functionality (similar to DayView and WeekView)
  const [expandedTimeBlockId, setExpandedTimeBlockId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Toggle state for view mode: 'dots', 'addIcons'
  const [viewMode, setViewMode] = useState('dots');
  
  // Calendar icons state
  const [calendarIcons, setCalendarIcons] = useState({});
  
  // Icon picker state
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedDateForIcon, setSelectedDateForIcon] = useState(null);
  
  // Info modal state
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  
  // Load calendar icons and view mode on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load calendar icons
        const storedIcons = await AsyncStorage.getItem('calendarIcons');
        if (storedIcons) {
          const parsedIcons = JSON.parse(storedIcons);
          
          // Normalize all icon data to arrays (fix mixed string/array format)
          const normalizedIcons = {};
          Object.keys(parsedIcons).forEach(dateKey => {
            const iconData = parsedIcons[dateKey];
            // Ensure all icon data is stored as arrays
            normalizedIcons[dateKey] = Array.isArray(iconData) ? iconData : [iconData];
          });
          
          console.log('📅 MonthView: Loaded and normalized icons:', normalizedIcons);
          setCalendarIcons(normalizedIcons);
          
          // Save normalized data back to AsyncStorage to fix any corrupted data
          await AsyncStorage.setItem('calendarIcons', JSON.stringify(normalizedIcons));
        }
        
        // Load saved view mode
        const storedViewMode = await AsyncStorage.getItem('monthViewMode');
        if (storedViewMode) {
          setViewMode(storedViewMode);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);


  // Get date key for storage
  const getDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Toggle view mode - now only cycles between dots and addIcons
  const handleToggleView = async () => {
    console.log('🚨 handleToggleView called! Current mode:', viewMode);
    const newMode = viewMode === 'dots' ? 'addIcons' : 'dots';
    
    console.log('🔄 MonthView: Switching to mode:', newMode);
    setViewMode(newMode);
    
    // Save to AsyncStorage for PDF generation
    try {
      await AsyncStorage.setItem('monthViewMode', newMode);
    } catch (error) {
      console.error('Failed to save view mode:', error);
    }
  };


  // Handle icon selection - copied from FullscreenCalendarScreen
  const handleIconSelect = async (icons) => {
    if (!selectedDateForIcon) return;
    
    try {
      const dateKey = getDateKey(selectedDateForIcon);
      // Ensure icons is always an array
      const iconsArray = Array.isArray(icons) ? icons : [icons];
      
      const newCalendarIcons = {
        ...calendarIcons,
        [dateKey]: iconsArray
      };
      
      setCalendarIcons(newCalendarIcons);
      await AsyncStorage.setItem('calendarIcons', JSON.stringify(newCalendarIcons));
      
      setShowIconPicker(false);
      setSelectedDateForIcon(null);
    } catch (error) {
      console.error('Error saving calendar icons:', error);
    }
  };
  
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
  
  // Local handler for time block long press (similar to DayView and WeekView)
  const handleLocalTimeBlockLongPress = React.useCallback((timeBlock) => {
    // Call original handler first (for parent state management)
    if (onTimeBlockLongPress) {
      onTimeBlockLongPress(timeBlock);
    }
    // Then toggle expanded state locally
    setExpandedTimeBlockId(expandedTimeBlockId === timeBlock.id ? null : timeBlock.id);
    setConfirmDeleteId(null); // Reset confirmation state
  }, [onTimeBlockLongPress, expandedTimeBlockId]);
  
  // Function to handle delete button press
  const handleDeleteTimeBlock = React.useCallback((timeBlock) => {
    setConfirmDeleteId(timeBlock.id);
  }, []);
  
  // Function to handle confirmed deletion
  const handleConfirmDelete = React.useCallback((timeBlock, deleteType = null) => {
    setExpandedTimeBlockId(null);
    setConfirmDeleteId(null);
    
    // Call parent's delete handler
    if (deleteTimeBlock) {
      if (deleteType) {
        deleteTimeBlock(deleteType === 'single' ? timeBlock.id : timeBlock.seriesId || timeBlock.id, deleteType);
      } else {
        deleteTimeBlock(timeBlock.id);
      }
    }
  }, [deleteTimeBlock]);
  
  // Function to cancel deletion
  const handleCancelDelete = React.useCallback(() => {
    setConfirmDeleteId(null);
  }, []);
  
  // Function to collapse expanded time block (similar to DayView)
  const handleCollapseTimeBlock = React.useCallback(() => {
    setExpandedTimeBlockId(null);
    setConfirmDeleteId(null);
  }, []);
  
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
    
    // Note: Removed blockIcons since we're no longer using the 'icons' view mode
    
    // Get calendar icons for this date (custom user-added icons)
    const dateKey = getDateKey(date);
    const rawIcons = calendarIcons[dateKey] || [];
    // Ensure calendarIconsForDate is always an array (handle legacy string data)
    const calendarIconsForDate = Array.isArray(rawIcons) ? rawIcons : [rawIcons].filter(Boolean);
    
    // Determine what to display based on view mode
    let displayItems = [];
    if (viewMode === 'addIcons') {
      displayItems = calendarIconsForDate.slice(0, 6);
    } else {
      displayItems = blockColors;
    }
    const topRowItems = displayItems.slice(0, 3);
    const bottomRowItems = displayItems.slice(3, 6);
    
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
        onLongPress={() => {
          if (viewMode === 'addIcons') {
            setSelectedDateForIcon(date);
            setShowIconPicker(true);
          }
        }}
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
        
        {/* Show indicators (dots or icons) for each domain/timeblock - in two rows if needed */}
        {hasEvents && (
          <View style={[
            styles.eventIndicatorsWrapper || { 
              marginTop: 2,
              alignItems: 'center',
            }
          ]}>
            {/* First row of indicators (up to 3) */}
            <View style={styles.eventIndicatorsContainer}>
              {topRowItems.map((item, index) => {
                if (viewMode === 'addIcons') {
                  // Custom icons mode - item is always a string (icon name or emoji)
                  const iconToDisplay = item;
                  
                  // Check if icon is an emoji (contains non-ASCII characters)
                  const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconToDisplay);
                  
                  if (isEmoji) {
                    // Show emoji as text
                    return (
                      <Text
                        key={`emoji-top-${index}`}
                        style={{
                          fontSize: responsive.scaleWidth(8),
                          marginHorizontal: responsive.scaleWidth(1),
                          textAlign: 'center',
                        }}
                      >
                        {iconToDisplay}
                      </Text>
                    );
                  } else {
                    // Show Ionicon
                    return (
                      <Ionicons
                        key={`icon-top-${index}`}
                        name={iconToDisplay}
                        size={responsive.scaleWidth(8)}
                        color={theme.text}
                        style={{
                          marginHorizontal: responsive.scaleWidth(1),
                        }}
                      />
                    );
                  }
                } else {
                  // Dots mode - item is a color string
                  return (
                    <View 
                      key={`dot-top-${index}`}
                      style={[
                        styles.eventIndicator, 
                        { 
                          backgroundColor: item,
                          width: responsive.scaleWidth(5),
                          height: responsive.scaleWidth(5),
                          borderRadius: responsive.scaleWidth(3),
                          marginHorizontal: responsive.scaleWidth(1),
                        }
                      ]} 
                    />
                  );
                }
              })}
            </View>
            
            {/* Second row of indicators (up to 3 more) if needed */}
            {bottomRowItems.length > 0 && (
              <View style={[
                styles.eventIndicatorsContainer,
                { marginTop: 1 } // Small space between rows
              ]}>
                {bottomRowItems.map((item, index) => {
                  if (viewMode === 'addIcons') {
                    // Custom icons mode - item is always a string (icon name or emoji)
                    const iconToDisplay = item;
                    
                    // Check if icon is an emoji (contains non-ASCII characters)
                    const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconToDisplay);
                    
                    if (isEmoji) {
                      // Show emoji as text
                      return (
                        <Text
                          key={`emoji-bottom-${index}`}
                          style={{
                            fontSize: responsive.scaleWidth(8),
                            marginHorizontal: responsive.scaleWidth(1),
                            textAlign: 'center',
                          }}
                        >
                          {iconToDisplay}
                        </Text>
                      );
                    } else {
                      // Show Ionicon
                      return (
                        <Ionicons
                          key={`icon-bottom-${index}`}
                          name={iconToDisplay}
                          size={responsive.scaleWidth(8)}
                          color={theme.text}
                          style={{
                            marginHorizontal: responsive.scaleWidth(1),
                          }}
                        />
                      );
                    }
                  } else {
                    // Dots mode - item is a color string
                    return (
                      <View 
                        key={`dot-bottom-${index}`}
                        style={[
                          styles.eventIndicator, 
                          { 
                            backgroundColor: item,
                            width: responsive.scaleWidth(5),
                            height: responsive.scaleWidth(5),
                            borderRadius: responsive.scaleWidth(3),
                            marginHorizontal: responsive.scaleWidth(1),
                          }
                        ]} 
                      />
                    );
                  }
                })}
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
    <ScrollView 
      style={[
        styles.monthView,
        { flex: 1 }
      ]}
      contentContainerStyle={[
        {
          padding: responsive.spacing.m,
          paddingBottom: insets.bottom > 0 ? insets.bottom : responsive.spacing.m,
        },
        landscapeLayout
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Unified Calendar Container */}
      <View style={[
        {
          backgroundColor: theme.card,
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        calendarContainerStyle
      ]}>
        
        {/* Calendar Header with integrated controls */}
        <View style={{
          backgroundColor: theme.primary,
          paddingHorizontal: responsive.spacing.m,
          paddingVertical: responsive.spacing.m,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {/* Selected Date Title */}
          <Text style={{
            color: '#FFFFFF',
            fontSize: responsive.fontSizes.xl,
            fontWeight: 'bold',
            flex: 1,
          }}>
            {(() => {
              const date = monthDates[selectedMonthDay] || new Date();
              return date.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
            })()}
          </Text>
          
          {/* Control Buttons Group */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: responsive.spacing.s,
          }}>
            {/* View Mode Toggle */}
            <TouchableOpacity
              onPress={handleToggleView}
              style={{
                backgroundColor: theme.card,
                borderRadius: 25,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons 
                name={viewMode === 'dots' ? 'ellipse' : 'add-circle-outline'} 
                size={24} 
                color={theme.text} 
              />
            </TouchableOpacity>

            {/* Info Button */}
            <TouchableOpacity
              onPress={() => setShowInfoModal(true)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 18,
                padding: responsive.spacing.s,
                minHeight: 36,
                minWidth: 36,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="View information about calendar modes"
              accessibilityHint="Shows explanation of calendar view modes"
            >
              <Ionicons 
                name="information-circle-outline" 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>

            {/* Fullscreen Button */}
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('FullscreenCalendarScreen', {
                  monthDates,
                  selectedMonthDay,
                  isToday,
                  formatDate,
                  getTimeBlocksForDate,
                  handleMonthDaySelect,
                  theme,
                  viewMode,
                  onToggleView: (newViewMode) => {
                    setViewMode(newViewMode);
                  },
                  returnToMonthTab: true
                });
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 18,
                padding: responsive.spacing.s,
                minHeight: 36,
                minWidth: 36,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Open fullscreen calendar"
              accessibilityHint="View calendar in fullscreen mode"
            >
              <Ionicons 
                name="expand-outline" 
                size={20} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Content */}
        <View style={{
          backgroundColor: theme.card,
          padding: responsive.spacing.m,
        }}>
          {/* Day names - Monday first */}
          <View style={[
            styles.monthDaysHeader,
            {
              marginBottom: responsive.spacing.m,
              paddingBottom: responsive.spacing.s,
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
                    fontSize: responsive.fontSizes.s,
                    fontWeight: '600',
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
        
        {/* Selected Day Section - Integrated */}
        <View style={{
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          padding: responsive.spacing.m,
        }}>
          {/* Selected Day Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: responsive.spacing.s,
          }}>
            <Text style={{
              color: theme.text,
              fontSize: responsive.fontSizes.l,
              fontWeight: '700',
              flex: 1,
            }}>
              {(() => {
                const date = monthDates[selectedMonthDay] || new Date();
                return date.toLocaleDateString('en-US', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                });
              })()}
            </Text>
            
            {/* Event count badge */}
            {selectedDayBlocks.length > 0 && (
              <View style={{
                backgroundColor: theme.primary,
                borderRadius: 12,
                paddingHorizontal: responsive.spacing.s,
                paddingVertical: responsive.spacing.xs,
                minWidth: 24,
                alignItems: 'center',
              }}>
                <Text style={{
                  color: '#FFFFFF',
                  fontSize: responsive.fontSizes.xs,
                  fontWeight: '600',
                }}>
                  {selectedDayBlocks.length}
                </Text>
              </View>
            )}
          </View>
          
          {/* Selected Day Content */}
          <View 
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel={`Events for ${formatDate(monthDates[selectedMonthDay], 'long')}`}
          >
            <TouchableOpacity 
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => {
                if (expandedTimeBlockId || confirmDeleteId) {
                  handleCollapseTimeBlock();
                }
              }}
            >
              {selectedDayBlocks.length > 0 ? (
                <View style={{
                  backgroundColor: theme.card,
                  borderRadius: 12,
                  padding: responsive.spacing.s,
                }}>
                  {selectedDayBlocks.map((block, index) => (
                    <View key={block.id}>
                      <TimeBlock 
                        timeBlock={block} 
                        onPress={() => onTimeBlockPress(block)}
                        onLongPress={() => handleLocalTimeBlockLongPress(block)}
                        compact={true}
                        isExpanded={expandedTimeBlockId === block.id}
                        isConfirmDelete={confirmDeleteId === block.id}
                        onDelete={() => handleDeleteTimeBlock(block)}
                        onConfirmDelete={(deleteType) => handleConfirmDelete(block, deleteType)}
                        onCancelDelete={handleCollapseTimeBlock}
                      />
                      {index < selectedDayBlocks.length - 1 && (
                        <View style={{
                          height: 1,
                          backgroundColor: theme.border,
                          marginVertical: responsive.spacing.xs,
                        }} />
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                renderEmptyDay()
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Icon Picker Modal */}
      <IconPicker
        visible={showIconPicker}
        multiSelect={true}
        maxSelection={5}
        selectedIcon={selectedDateForIcon ? calendarIcons[getDateKey(selectedDateForIcon)] || [] : []}
        onSelectIcon={handleIconSelect}
        onClose={() => {
          setShowIconPicker(false);
          setSelectedDateForIcon(null);
        }}
      />

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: responsive.spacing.l,
        }}>
          <View style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: responsive.spacing.l,
            maxWidth: responsive.isTablet ? 500 : '100%',
            width: '100%',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          }}>
            {/* Header */}
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: responsive.spacing.l,
            }}>
              <Text style={{
                fontSize: responsive.fontSizes.xl,
                fontWeight: 'bold',
                color: theme.text,
                flex: 1,
              }}>
                Calendar View Modes
              </Text>
              <TouchableOpacity
                onPress={() => setShowInfoModal(false)}
                style={{
                  padding: responsive.spacing.s,
                  marginRight: -responsive.spacing.s,
                }}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close info modal"
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={theme.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Domain Dots Mode */}
            <View style={{
              marginBottom: responsive.spacing.l,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: responsive.spacing.s,
              }}>
                <View style={{
                  backgroundColor: theme.background,
                  borderRadius: 12,
                  padding: responsive.spacing.s,
                  marginRight: responsive.spacing.s,
                }}>
                  <Ionicons 
                    name="ellipse" 
                    size={20} 
                    color={theme.primary} 
                  />
                </View>
                <Text style={{
                  fontSize: responsive.fontSizes.l,
                  fontWeight: '600',
                  color: theme.text,
                }}>
                  Domain Dots
                </Text>
              </View>
              <Text style={{
                fontSize: responsive.fontSizes.m,
                color: theme.textSecondary,
                lineHeight: 22,
              }}>
                View colored dots representing your 8 life domains. Each dot shows which domain you worked on that day, helping you visualize your life balance at a glance.
              </Text>
            </View>

            {/* Custom Icons Mode */}
            <View style={{
              marginBottom: responsive.spacing.l,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: responsive.spacing.s,
              }}>
                <View style={{
                  backgroundColor: theme.background,
                  borderRadius: 12,
                  padding: responsive.spacing.s,
                  marginRight: responsive.spacing.s,
                }}>
                  <Ionicons 
                    name="add-circle-outline" 
                    size={20} 
                    color={theme.primary} 
                  />
                </View>
                <Text style={{
                  fontSize: responsive.fontSizes.l,
                  fontWeight: '600',
                  color: theme.text,
                }}>
                  Custom Icons
                </Text>
              </View>
              <Text style={{
                fontSize: responsive.fontSizes.m,
                color: theme.textSecondary,
                lineHeight: 22,
                marginBottom: responsive.spacing.s,
              }}>
                Add your own icons to track personal activities, moods, or events. 
              </Text>
              <View style={{
                backgroundColor: theme.background,
                borderRadius: 12,
                padding: responsive.spacing.m,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons 
                  name="hand-right-outline" 
                  size={16} 
                  color={theme.primary} 
                  style={{ marginRight: responsive.spacing.s }}
                />
                <Text style={{
                  fontSize: responsive.fontSizes.s,
                  color: theme.text,
                  fontStyle: 'italic',
                  flex: 1,
                }}>
                  Long-press any day to add custom icons
                </Text>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowInfoModal(false)}
              style={{
                backgroundColor: theme.primary,
                borderRadius: 12,
                paddingVertical: responsive.spacing.m,
                alignItems: 'center',
                marginTop: responsive.spacing.s,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close and return to calendar"
            >
              <Text style={{
                color: isDarkMode ? '#000000' : '#FFFFFF',
                fontSize: responsive.fontSizes.m,
                fontWeight: '600',
              }}>
                Got it!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
    </ScrollView>
  );
};

export default MonthView;
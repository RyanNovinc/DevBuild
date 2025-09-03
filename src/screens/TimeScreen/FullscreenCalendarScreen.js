// src/screens/TimeScreen/FullscreenCalendarScreen.js
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions,
  SafeAreaView,
  ScrollView,
  Modal,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import responsive from '../../utils/responsive';
import IconPicker from '../../components/IconPicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarStorage } from '../../utils/storage';
import { useProfile } from '../../context/ProfileContext';
import { generateFullscreenCalendarHTML } from './TimeScreenHelpers';
import { generateAndSharePDF } from './PDFGenerator';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const FullscreenCalendarScreen = ({ route }) => {
  // Get navigation hook
  const navigation = useNavigation();
  
  // Get screen dimensions
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  
  // Get profile for personalized PDF title
  const { profile } = useProfile();
  
  // Hide AI button and bottom navigation on mount, restore on unmount
  React.useEffect(() => {
    // Hide AI button
    if (typeof window !== 'undefined' && window.setAIButtonVisible) {
      window.setAIButtonVisible(false);
    }
    
    // Hide bottom tabs
    if (typeof global !== 'undefined') {
      global.kanbanFullScreen = true;
    }
    
    // Cleanup function to restore UI when leaving this screen
    return () => {
      // Restore AI button
      if (typeof window !== 'undefined' && window.setAIButtonVisible) {
        window.setAIButtonVisible(true);
      }
      
      // Restore bottom tabs
      if (typeof global !== 'undefined') {
        global.kanbanFullScreen = false;
      }
      
      // If we came from Month tab, ensure we return to Month tab
      if (route.params?.returnToMonthTab) {
        // Set a global flag to indicate we should return to Month tab
        if (typeof global !== 'undefined') {
          global.returnToMonthTab = true;
        }
      }
    };
  }, [route.params]);
  
  // Get props from route params
  const {
    monthDates: initialMonthDates,
    selectedMonthDay,
    isToday,
    formatDate,
    getTimeBlocksForDate,
    handleMonthDaySelect,
    theme,
    viewMode = 'dots',
    onToggleView,
    calendarIcons: initialCalendarIcons = {}
  } = route.params;

  // State for current month dates (starts with initial, but can be changed)
  const [currentMonthDates, setCurrentMonthDates] = useState(initialMonthDates);
  
  // Helper function to generate month dates for any given month/year
  const generateMonthDates = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dates = [];
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      dates.push(new Date(year, month, day));
    }
    
    return dates;
  };
  
  // Calculate large day size for fullscreen
  const daySize = responsive.isTablet ? 100 : 80;
  const calendarWidth = daySize * 7 + 60; // 7 days + margins
  
  // State
  const [internalSelectedDay, setInternalSelectedDay] = useState(selectedMonthDay);
  const [internalViewMode, setInternalViewMode] = useState(viewMode);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [selectedDateForIcon, setSelectedDateForIcon] = useState(null);
  const [calendarIcons, setCalendarIcons] = useState(initialCalendarIcons);
  const [iconLibrary, setIconLibrary] = useState([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(initialMonthDates.length > 0 ? initialMonthDates[0].getFullYear() : new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialMonthDates.length > 0 ? initialMonthDates[0].getMonth() : new Date().getMonth());
  
  // Animation values for modal
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  
  // Safety check
  if (!Array.isArray(currentMonthDates) || currentMonthDates.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: theme.text }}>No calendar data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Load icon library on mount (this doesn't change as often)
  React.useEffect(() => {
    const loadIconLibrary = async () => {
      try {
        const library = await AsyncStorage.getItem('iconLibrary');
        if (library) {
          setIconLibrary(JSON.parse(library));
        }
      } catch (error) {
        console.error('Error loading icon library:', error);
      }
    };
    
    loadIconLibrary();
  }, []);

  // Listen for navigation focus to reload icons when coming from minimized view
  useFocusEffect(
    React.useCallback(() => {
      // Always reload icons when this screen gains focus (in case MonthView added icons)
      const loadIcons = async () => {
        const storedIcons = await calendarStorage.getCalendarIcons();
        console.log('📅 FullscreenCalendarScreen: Reloaded icons on focus:', Object.keys(storedIcons).length, 'dates');
        setCalendarIcons(storedIcons);
      };
      loadIcons();
    }, [])
  );

  // No need for separate mount loading - useFocusEffect handles icon loading

  // Create week arrays for the calendar grid
  const weeks = useMemo(() => {
    const result = [];
    let week = [];
    
    // Monday first order
    const mondayFirstOrder = [1, 2, 3, 4, 5, 6, 0];
    
    // Add empty slots for days before the first day of the month
    const firstDay = currentMonthDates[0].getDay();
    const firstDayIndex = mondayFirstOrder.indexOf(firstDay);
    for (let i = 0; i < firstDayIndex; i++) {
      week.push(null);
    }
    
    // Add days to the weeks
    currentMonthDates.forEach((date) => {
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
  }, [currentMonthDates]);

  // Get date key for storage
  const getDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Handle PDF export
  const handlePDFExport = async () => {
    if (isGeneratingPDF) return;
    
    setIsGeneratingPDF(true);
    try {
      const monthDate = new Date(currentMonthDates[0].getFullYear(), currentMonthDates[0].getMonth(), 1);
      const userName = profile?.name || 'User';
      const htmlContent = generateFullscreenCalendarHTML(monthDate, calendarIcons, iconLibrary, userName, internalViewMode, getTimeBlocksForDate);
      
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Share Calendar PDF'
        });
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Toggle view mode - now only cycles between dots and addIcons
  const handleToggleView = () => {
    const newMode = internalViewMode === 'dots' ? 'addIcons' : 'dots';
    
    setInternalViewMode(newMode);
    if (onToggleView) {
      onToggleView(newMode);
    }
  };

  // Handle icon selection - back to AsyncStorage
  const handleIconSelect = async (icons) => {
    if (!selectedDateForIcon) return;
    
    const dateKey = getDateKey(selectedDateForIcon);
    const newCalendarIcons = {
      ...calendarIcons,
      [dateKey]: icons
    };
    
    setCalendarIcons(newCalendarIcons);
    await calendarStorage.setCalendarIcons(newCalendarIcons);
    
    // Set global flag to indicate MonthView should reload icons when we return
    global.shouldReloadMonthViewIcons = true;
    console.log('📅 FullscreenCalendarScreen: Set reload flag for MonthView');
    
    setShowIconPicker(false);
    setSelectedDateForIcon(null);
  };

  // Handle date picker confirm
  const handleDatePickerConfirm = () => {
    // Generate new month dates for the selected month/year
    const newMonthDates = generateMonthDates(selectedYear, selectedMonth);
    setCurrentMonthDates(newMonthDates);
    
    console.log(`Navigated to: ${months[selectedMonth]} ${selectedYear}`);
    hideModal();
  };

  // Handle previous month navigation
  const handlePreviousMonth = () => {
    const currentDate = currentMonthDates[0];
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const newMonthDates = generateMonthDates(prevMonth.getFullYear(), prevMonth.getMonth());
    setCurrentMonthDates(newMonthDates);
    
    // Update the date picker state too
    setSelectedYear(prevMonth.getFullYear());
    setSelectedMonth(prevMonth.getMonth());
  };

  // Handle next month navigation
  const handleNextMonth = () => {
    const currentDate = currentMonthDates[0];
    const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const newMonthDates = generateMonthDates(nextMonth.getFullYear(), nextMonth.getMonth());
    setCurrentMonthDates(newMonthDates);
    
    // Update the date picker state too
    setSelectedYear(nextMonth.getFullYear());
    setSelectedMonth(nextMonth.getMonth());
  };

  // Generate years (from 2025 onwards to current year + 10)
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const endYear = Math.max(currentYear + 10, 2035); // Ensure we go at least to 2035
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  
  // Handle modal show/hide animations
  const showModal = () => {
    setShowDatePicker(true);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const hideModal = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(modalScale, {
        toValue: 0.8,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDatePicker(false);
    });
  };
  
  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Render a day cell
  const renderDay = (date, dayIndex, weekIndex) => {
    if (!date) {
      return (
        <View 
          key={`empty-${weekIndex}-${dayIndex}`} 
          style={{
            width: daySize,
            height: daySize,
            margin: 4,
          }} 
        />
      );
    }
    
    const dayNumber = date.getDate();
    const isTodayDate = isToday(date);
    const isSelected = internalSelectedDay === currentMonthDates.indexOf(date);
    
    // Get blocks for this day
    const blocksForDay = getTimeBlocksForDate(date);
    const hasEvents = blocksForDay.length > 0;
    
    // Get calendar icons for this date
    const dateKey = getDateKey(date);
    const calendarIconsForDate = calendarIcons[dateKey] || [];
    
    // Get unique colors for the day
    const blockColors = blocksForDay
      .map(block => block.isGeneralActivity ? block.customColor : block.domainColor)
      .filter((color, index, self) => self.indexOf(color) === index)
      .slice(0, 6);
    
    // Note: Removed blockIcons since we're no longer using the 'icons' view mode

    // Determine what to display based on view mode
    let displayItems = [];
    if (internalViewMode === 'addIcons') {
      displayItems = calendarIconsForDate.slice(0, 6) || [];
    } else {
      displayItems = blockColors || [];
    }

    // Ensure displayItems is always an array
    if (!Array.isArray(displayItems)) {
      displayItems = [];
    }

    const topRowItems = displayItems.slice(0, 3);
    const bottomRowItems = displayItems.slice(3, 6);
    
    return (
      <TouchableOpacity
        key={`day-${dayNumber}`}
        style={{
          width: daySize,
          height: daySize,
          margin: 4,
          padding: 8,
          borderRadius: 12,
          backgroundColor: theme.card,
          borderWidth: isTodayDate ? 3 : (isSelected ? 2 : 1),
          borderColor: isTodayDate ? theme.primary : (isSelected ? theme.primary : theme.border),
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 2,
          justifyContent: 'space-between',
        }}
        onPress={() => {
          setInternalSelectedDay(currentMonthDates.indexOf(date));
          if (handleMonthDaySelect) {
            handleMonthDaySelect(currentMonthDates.indexOf(date));
          }
        }}
        onLongPress={() => {
          if (internalViewMode === 'addIcons') {
            setSelectedDateForIcon(date);
            setShowIconPicker(true);
          }
        }}
      >
        <Text 
          style={{
            color: theme.text,
            fontSize: 18,
            fontWeight: isTodayDate || isSelected ? 'bold' : '500',
            textAlign: 'center',
          }}
        >
          {dayNumber}
        </Text>
        
        {/* Show indicators */}
        {displayItems.length > 0 && (
          <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
            {/* Top row */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 2 }}>
              {topRowItems.map((item, index) => {
                if (internalViewMode === 'addIcons') {
                  // Check if item (or item.icon) is an emoji
                  const iconToDisplay = typeof item === 'string' ? item : item?.icon;
                  const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconToDisplay);
                  
                  if (isEmoji) {
                    return (
                      <Text
                        key={`emoji-top-${index}`}
                        style={{
                          fontSize: 16,
                          marginHorizontal: 2,
                        }}
                      >
                        {iconToDisplay}
                      </Text>
                    );
                  } else {
                    return (
                      <Ionicons
                        key={`icon-top-${index}`}
                        name={iconToDisplay}
                        size={16}
                        color={typeof item === 'string' ? theme.text : item?.color || theme.text}
                        style={{ marginHorizontal: 2 }}
                      />
                    );
                  }
                } else {
                  // Show colored dot
                  return (
                    <View 
                      key={`dot-top-${index}`}
                      style={{
                        backgroundColor: item,
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        marginHorizontal: 2,
                      }} 
                    />
                  );
                }
              })}
            </View>
            
            {/* Bottom row */}
            {bottomRowItems.length > 0 && (
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                {bottomRowItems.map((item, index) => {
                  if (internalViewMode === 'addIcons') {
                    const iconToDisplay = typeof item === 'string' ? item : item?.icon;
                    const isEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconToDisplay);
                    
                    if (isEmoji) {
                      return (
                        <Text
                          key={`emoji-bottom-${index}`}
                          style={{
                            fontSize: 16,
                            marginHorizontal: 2,
                          }}
                        >
                          {iconToDisplay}
                        </Text>
                      );
                    } else {
                      return (
                        <Ionicons
                          key={`icon-bottom-${index}`}
                          name={iconToDisplay}
                          size={16}
                          color={typeof item === 'string' ? theme.text : item?.color || theme.text}
                          style={{ marginHorizontal: 2 }}
                        />
                      );
                    }
                  } else {
                    return (
                      <View 
                        key={`dot-bottom-${index}`}
                        style={{
                          backgroundColor: item,
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          marginHorizontal: 2,
                        }} 
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
  
  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: theme.background,
    }}>
      <View style={{
        flex: 1,
        backgroundColor: theme.background,
      }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          paddingBottom: 8,
        }}>
          {/* Left - Exit button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              backgroundColor: theme.card,
              borderRadius: 25,
              padding: 12,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          
          {/* Center - Today's date */}
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.text,
            textAlign: 'center',
            flex: 1,
            marginHorizontal: 16,
          }}>
            {(() => {
              const selectedDate = currentMonthDates[internalSelectedDay] || new Date();
              return selectedDate.toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
            })()}
          </Text>

          {/* Right controls */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
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
                name={internalViewMode === 'dots' ? 'ellipse' : 'add-circle-outline'} 
                size={24} 
                color={theme.text} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowInfoModal(true)}
              style={{
                backgroundColor: theme.card,
                borderRadius: 25,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="View information about calendar modes"
              accessibilityHint="Shows explanation of calendar view modes"
            >
              <Ionicons 
                name="information-circle-outline" 
                size={24} 
                color={theme.text} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handlePDFExport}
              disabled={isGeneratingPDF}
              style={{
                backgroundColor: theme.card,
                borderRadius: 25,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.border,
              }}
            >
              <Ionicons 
                name={isGeneratingPDF ? "hourglass-outline" : "document-text-outline"} 
                size={24} 
                color={isGeneratingPDF ? theme.accent : theme.text} 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Container */}
        <ScrollView 
          horizontal={true}
          vertical={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
          style={{ flex: 1 }}
        >
          <ScrollView 
            horizontal={false}
            vertical={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={{
              paddingVertical: 16,
            }}
            style={{ 
              width: calendarWidth,
            }}
          >
            {/* Day names header */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'center',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <Text 
                  key={day} 
                  style={{
                    color: theme.textSecondary,
                    fontSize: 16,
                    fontWeight: '600',
                    width: daySize,
                    textAlign: 'center',
                    marginHorizontal: 4,
                  }}
                >
                  {day}
                </Text>
              ))}
            </View>

            {/* Calendar weeks */}
            {weeks.map((week, weekIndex) => (
              <View 
                key={`week-${weekIndex}`} 
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                {week.map((date, dayIndex) => renderDay(date, dayIndex, weekIndex))}
              </View>
            ))}
          </ScrollView>
        </ScrollView>

        {/* Month Navigation Footer */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          paddingTop: 8,
          backgroundColor: theme.background,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}>
          {/* Previous Month */}
          <TouchableOpacity
            onPress={handlePreviousMonth}
            style={{
              backgroundColor: theme.card,
              borderRadius: 25,
              padding: 12,
              borderWidth: 1,
              borderColor: theme.border,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}
          >
            <Ionicons name="chevron-back" size={20} color={theme.text} />
            <Text style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: '600',
              marginLeft: 4,
            }}>
              Previous
            </Text>
          </TouchableOpacity>

          {/* Current Month Display - Tappable */}
          <TouchableOpacity onPress={showModal}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: theme.primary,
              textAlign: 'center',
              textDecorationLine: 'underline',
            }}>
              {currentMonthDates.length > 0 
                ? `${new Date(currentMonthDates[0].getFullYear(), currentMonthDates[0].getMonth(), 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                : 'Calendar'
              }
            </Text>
          </TouchableOpacity>

          {/* Next Month */}
          <TouchableOpacity
            onPress={handleNextMonth}
            style={{
              backgroundColor: theme.card,
              borderRadius: 25,
              padding: 12,
              borderWidth: 1,
              borderColor: theme.border,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
            }}
          >
            <Text style={{
              color: theme.text,
              fontSize: 16,
              fontWeight: '600',
              marginRight: 4,
            }}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="none"
          onRequestClose={hideModal}
        >
          <Animated.View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
            opacity: overlayOpacity,
          }}>
            <Animated.View style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 20,
              width: width * 0.8,
              maxWidth: 350,
              transform: [{ scale: modalScale }],
            }}>
              {/* Header */}
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.text,
                textAlign: 'center',
                marginBottom: 20,
              }}>
                Select Month & Year
              </Text>

              {/* Picker Container */}
              <View style={{
                flexDirection: 'row',
                height: 200,
                marginBottom: 20,
              }}>
                {/* Month Picker */}
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: 10,
                  }}>
                    Month
                  </Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 80 }}
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.y / 40);
                      setSelectedMonth(index);
                    }}
                  >
                    {months.map((month, index) => (
                      <TouchableOpacity
                        key={index}
                        style={{
                          height: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: index === selectedMonth ? theme.primary + '20' : 'transparent',
                          borderRadius: 8,
                          marginVertical: 2,
                        }}
                        onPress={() => setSelectedMonth(index)}
                      >
                        <Text style={{
                          color: index === selectedMonth ? theme.primary : theme.text,
                          fontSize: 16,
                          fontWeight: index === selectedMonth ? 'bold' : 'normal',
                        }}>
                          {month}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Year Picker */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: 16,
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: 10,
                  }}>
                    Year
                  </Text>
                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 80 }}
                    onMomentumScrollEnd={(event) => {
                      const index = Math.round(event.nativeEvent.contentOffset.y / 40);
                      setSelectedYear(years[index]);
                    }}
                  >
                    {years.map((year, index) => (
                      <TouchableOpacity
                        key={year}
                        style={{
                          height: 40,
                          justifyContent: 'center',
                          alignItems: 'center',
                          backgroundColor: year === selectedYear ? theme.primary + '20' : 'transparent',
                          borderRadius: 8,
                          marginVertical: 2,
                        }}
                        onPress={() => setSelectedYear(year)}
                      >
                        <Text style={{
                          color: year === selectedYear ? theme.primary : theme.text,
                          fontSize: 16,
                          fontWeight: year === selectedYear ? 'bold' : 'normal',
                        }}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              {/* Buttons */}
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                gap: 15,
              }}>
                <TouchableOpacity
                  onPress={hideModal}
                  style={{
                    flex: 1,
                    backgroundColor: theme.border,
                    borderRadius: 12,
                    padding: 15,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: theme.text,
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDatePickerConfirm}
                  style={{
                    flex: 1,
                    backgroundColor: theme.primary,
                    borderRadius: 12,
                    padding: 15,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: theme.background,
                    fontSize: 16,
                    fontWeight: '600',
                  }}>
                    Go To Date
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Animated.View>
        </Modal>

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
                  color: theme.background,
                  fontSize: responsive.fontSizes.m,
                  fontWeight: '600',
                }}>
                  Got it!
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default FullscreenCalendarScreen;
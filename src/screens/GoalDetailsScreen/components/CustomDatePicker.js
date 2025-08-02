// src/screens/GoalDetailsScreen/components/CustomDatePicker.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDate } from '../utils/helpers';
import { getTextColorForBackground } from '../utils/colorUtils';

const CustomDatePicker = ({
  theme,
  selectedColor,
  hasTargetDate,
  toggleTargetDate,
  targetDate,
  setTargetDate,
  showDatePicker,
  setShowDatePicker
}) => {
  // State to track if we should use calendar view
  const [useCalendarView, setUseCalendarView] = useState(false);
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    // For Android, the picker will close automatically
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setTargetDate(selectedDate);
      }
      return;
    }
    
    // For iOS, we need to handle the date change and not close the picker
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  // Choose the appropriate display mode based on platform
  const getDisplayMode = () => {
    if (Platform.OS === 'ios') {
      // On iOS, spinner is more stable
      return useCalendarView ? 'inline' : 'spinner';
    } else {
      // On Android, provide both options
      return useCalendarView ? 'calendar' : 'spinner';
    }
  };

  // Toggle between calendar and spinner views
  const toggleViewMode = () => {
    try {
      setUseCalendarView(!useCalendarView);
    } catch (error) {
      console.error('Error changing date picker mode:', error);
      // Fall back to spinner mode if there's an error
      setUseCalendarView(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header row with toggle */}
      <View style={styles.dateHeaderRow}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          Target Date (Optional)
        </Text>
        <TouchableOpacity
          style={styles.dateToggle}
          onPress={toggleTargetDate}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View 
            style={[
              styles.toggleTrack, 
              hasTargetDate ? 
                { backgroundColor: selectedColor } : 
                { backgroundColor: theme.border }
            ]}
          >
            <View 
              style={[
                styles.toggleHandle, 
                hasTargetDate ? styles.toggleHandleActive : styles.toggleHandleInactive,
                { backgroundColor: theme.card }
              ]} 
            />
          </View>
        </TouchableOpacity>
      </View>
      
      {/* Date input field (only shown when toggle is on) */}
      {hasTargetDate && (
        <View>
          <TouchableOpacity 
            style={[
              styles.dateInput, 
              { 
                backgroundColor: theme.background, 
                borderColor: theme.border 
              }
            ]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateText, { color: theme.text }]}>
              {formatDate(targetDate)}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
          
          {/* View mode selector (shown when date picker is visible) */}
          {showDatePicker && (
            <View style={styles.viewModeContainer}>
              <TouchableOpacity 
                style={[
                  styles.viewModeButton,
                  !useCalendarView && { 
                    backgroundColor: `${selectedColor}20`, 
                    borderColor: selectedColor 
                  }
                ]}
                onPress={() => setUseCalendarView(false)}
              >
                <Ionicons 
                  name="options-outline" 
                  size={16} 
                  color={!useCalendarView ? selectedColor : theme.textSecondary} 
                />
                <Text style={[
                  styles.viewModeText,
                  { color: !useCalendarView ? selectedColor : theme.textSecondary }
                ]}>
                  Wheel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.viewModeButton,
                  useCalendarView && { 
                    backgroundColor: `${selectedColor}20`, 
                    borderColor: selectedColor 
                  }
                ]}
                onPress={() => setUseCalendarView(true)}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={useCalendarView ? selectedColor : theme.textSecondary} 
                />
                <Text style={[
                  styles.viewModeText,
                  { color: useCalendarView ? selectedColor : theme.textSecondary }
                ]}>
                  Calendar
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Date picker (only shown when showDatePicker is true) */}
          {showDatePicker && (
            <View style={[
              styles.datePickerContainer, 
              { backgroundColor: theme.cardElevated }
            ]}>
              <View style={styles.pickerWrapper}>
                {Platform.OS === 'ios' ? (
                  // iOS DateTimePicker
                  <DateTimePicker
                    value={targetDate}
                    mode="date"
                    display={getDisplayMode()}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                    textColor={theme.text}
                    style={{ height: useCalendarView ? 320 : 200 }}
                    accentColor={selectedColor}
                  />
                ) : (
                  // Android DateTimePicker
                  <DateTimePicker
                    value={targetDate}
                    mode="date"
                    display={getDisplayMode()}
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </View>
              
              {/* Done button for iOS (Android automatically closes the picker) */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[
                    styles.doneButton, 
                    { 
                      backgroundColor: selectedColor,
                      borderWidth: (selectedColor === '#000000' && theme.dark) ? 1 : 0,
                      borderColor: 'rgba(255,255,255,0.3)'
                    }
                  ]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[
                    styles.doneButtonText, 
                    { color: selectedColor === '#FFFFFF' ? '#000000' : getTextColorForBackground(selectedColor) }
                  ]}>
                    Done
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  dateToggle: {
    marginLeft: 10,
  },
  toggleTrack: {
    width: 40,
    height: 22,
    borderRadius: 11,
    padding: 2,
  },
  toggleHandle: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  toggleHandleActive: {
    transform: [{ translateX: 18 }],
  },
  toggleHandleInactive: {
    transform: [{ translateX: 0 }],
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    height: 48,
  },
  dateText: {
    fontSize: 16,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  viewModeText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  datePickerContainer: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pickerWrapper: {
    alignItems: 'center',
    paddingTop: 10,
  },
  doneButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomDatePicker;
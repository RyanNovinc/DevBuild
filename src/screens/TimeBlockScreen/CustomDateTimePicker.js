// src/screens/TimeBlockScreen/CustomDateTimePicker.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomDateTimePicker = ({ 
  visible, 
  onClose, 
  onChange,
  mode,
  value,
  title,
  theme,
  minimumDate,
  datePickerMode = 'spinner',
  onDatePickerModeChange
}) => {
  // Local state for calendar view toggle (when no external state provided)
  const [useCalendarView, setUseCalendarView] = useState(false);
  
  // Determine if we're using external or local state
  const isCalendarView = onDatePickerModeChange ? datePickerMode === 'calendar' : useCalendarView;
  
  // Handle mode toggle
  const handleModeToggle = (newMode) => {
    if (onDatePickerModeChange) {
      onDatePickerModeChange(newMode);
    } else {
      setUseCalendarView(newMode === 'calendar');
    }
  };

  // Choose the appropriate display mode based on platform and selection
  const getDisplayMode = () => {
    if (Platform.OS === 'ios') {
      // On iOS, use inline for calendar view, spinner for wheel
      return isCalendarView ? 'inline' : 'spinner';
    } else {
      // On Android, provide both options
      return isCalendarView ? 'calendar' : 'spinner';
    }
  };
  // Android directly renders the native picker
  if (Platform.OS === 'android') {
    if (!visible) return null;
    
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display={getDisplayMode()}
        onChange={onChange}
        minimumDate={minimumDate}
        minuteInterval={mode === 'time' ? 5 : undefined}
      />
    );
  }
  
  // iOS uses a modal with the picker
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.pickerModalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.pickerModalContent, { backgroundColor: theme.background }]}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.pickerCancelText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.pickerTitle, { color: theme.text }]}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.pickerDoneText, { color: theme.primary }]}>
                Done
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* View mode toggle buttons (only for date mode) */}
          {mode === 'date' && (
            <View style={styles.viewModeContainer}>
              <TouchableOpacity 
                style={[
                  styles.viewModeButton,
                  !isCalendarView && { 
                    backgroundColor: `${theme.primary}20`, 
                    borderColor: theme.primary 
                  }
                ]}
                onPress={() => handleModeToggle('spinner')}
              >
                <Ionicons 
                  name="options-outline" 
                  size={16} 
                  color={!isCalendarView ? theme.primary : theme.textSecondary} 
                />
                <Text style={[
                  styles.viewModeText,
                  { color: !isCalendarView ? theme.primary : theme.textSecondary }
                ]}>
                  Wheel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.viewModeButton,
                  isCalendarView && { 
                    backgroundColor: `${theme.primary}20`, 
                    borderColor: theme.primary 
                  }
                ]}
                onPress={() => handleModeToggle('calendar')}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={16} 
                  color={isCalendarView ? theme.primary : theme.textSecondary} 
                />
                <Text style={[
                  styles.viewModeText,
                  { color: isCalendarView ? theme.primary : theme.textSecondary }
                ]}>
                  Calendar
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.pickerWrapper}>
            <DateTimePicker
              value={value}
              mode={mode}
              display={getDisplayMode()}
              onChange={onChange}
              style={[styles.picker, { height: isCalendarView ? 320 : 200 }]}
              minimumDate={minimumDate}
              minuteInterval={mode === 'time' ? 5 : undefined}
              textColor={theme.text}
              accentColor={theme.primary}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  pickerModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E2E3',
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  pickerCancelText: {
    fontSize: 16,
    color: '#888888',
  },
  pickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4285F4',
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  picker: {
    height: 200,
    alignSelf: 'center',
    width: '100%',
  },
  // View mode toggle styles
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CustomDateTimePicker;
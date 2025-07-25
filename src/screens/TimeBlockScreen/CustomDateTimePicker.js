// src/screens/TimeBlockScreen/CustomDateTimePicker.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CustomDateTimePicker = ({ 
  visible, 
  onClose, 
  onChange,
  mode,
  value,
  title,
  theme,
  minimumDate
}) => {
  // Android directly renders the native picker
  if (Platform.OS === 'android') {
    if (!visible) return null;
    
    return (
      <DateTimePicker
        value={value}
        mode={mode}
        display="default"
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
          
          <DateTimePicker
            value={value}
            mode={mode}
            display="spinner"
            onChange={onChange}
            style={styles.picker}
            minimumDate={minimumDate}
            minuteInterval={mode === 'time' ? 5 : undefined}
          />
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
  picker: {
    height: 200,
  },
});

export default CustomDateTimePicker;
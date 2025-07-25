// src/screens/TimeBlockScreen/ColorPicker.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ColorPicker = ({ 
  visible, 
  onClose, 
  onColorSelect, 
  selectedColor,
  colorOptions,
  theme,
  isDarkMode 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[
        styles.modalOverlay, 
        { backgroundColor: 'rgba(0,0,0,0.5)' }
      ]}>
        <View style={[
          styles.colorModalContainer, 
          { 
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border
          }
        ]}>
          <View style={styles.colorModalHeader}>
            <Text style={[styles.colorModalTitle, { color: theme.text }]}>
              Select Color
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.colorGrid}>
            {colorOptions.map((color) => (
              <TouchableOpacity 
                key={color}
                style={[
                  styles.colorOption,
                  { 
                    backgroundColor: color,
                    borderWidth: selectedColor === color ? 2 : 0,
                    borderColor: isDarkMode ? '#FFFFFF' : '#000000'
                  }
                ]}
                onPress={() => onColorSelect(color)}
              >
                {selectedColor === color && (
                  <Ionicons 
                    name="checkmark" 
                    size={24} 
                    color={isDarkMode ? '#000000' : '#FFFFFF'} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={[
              styles.modalDoneButton, 
              { 
                backgroundColor: theme.primary,
                borderWidth: isDarkMode ? 1 : 0,
                borderColor: isDarkMode ? '#FFFFFF' : 'transparent'
              }
            ]}
            onPress={onClose}
          >
            <Text style={[
              styles.modalDoneButtonText, 
              { color: isDarkMode ? '#000000' : '#FFFFFF' }
            ]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  colorModalContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  colorModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E2E3',
  },
  colorModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  closeButton: {
    padding: 4,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  colorOption: {
    width: '18%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDoneButton: {
    backgroundColor: '#4285F4',
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  modalDoneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ColorPicker;
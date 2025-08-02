// src/screens/ProfileScreen/DomainColorPickerModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native';
import { DOMAIN_COLORS } from './constants';

const { width } = Dimensions.get('window');

const DomainColorPickerModal = ({ 
  visible, 
  theme, 
  isDarkMode, 
  selectedDomain, 
  onClose, 
  onSelectColor 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          style={[styles.colorPickerContent, { 
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border 
          }]}
          onStartShouldSetResponder={() => true}
          onTouchEnd={e => e.stopPropagation()}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {selectedDomain ? `${selectedDomain.name} Color` : 'Select Color'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.colorPickerBody}>
            <Text style={[styles.colorPickerDescription, { color: theme.textSecondary }]}>
              Choose a color for this domain:
            </Text>
            
            <View style={styles.colorGrid}>
              {DOMAIN_COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { 
                      backgroundColor: color,
                      // Special handling for black and white to ensure visibility
                      borderColor: color === '#FFFFFF' ? '#000000' : (color === '#000000' ? '#FFFFFF' : color),
                      borderWidth: (color === '#FFFFFF' || color === '#000000') ? 2 : 0
                    },
                    selectedDomain && selectedDomain.color === color && {
                      borderWidth: 3,
                      borderColor: isDarkMode ? '#FFFFFF' : '#000000'
                    }
                  ]}
                  onPress={() => onSelectColor(color)}
                />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Color Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorPickerContent: {
    width: width * 0.85,
    borderRadius: 20,
    padding: 20,
    alignSelf: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    height: 40, // Fixed height for predictable layout
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  colorPickerBody: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  colorPickerDescription: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    height: 160, // Fixed height for predictable layout (for 2 rows of colors)
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default DomainColorPickerModal;
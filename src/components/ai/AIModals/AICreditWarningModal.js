// src/components/ai/AIModals/AICreditWarningModal.js
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

/**
 * AICreditWarningModal - Modal shown before using credits on expensive operations
 */
const AICreditWarningModal = ({ 
  visible = false, 
  creditCost = 1,
  operationType = 'standard', // standard, high-quality, etc.
  onConfirm,
  onCancel
}) => {
  const { theme } = useTheme();
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.creditWarningModal, { 
          backgroundColor: theme.cardElevated || theme.card,
          borderColor: theme.border
        }]}>
          <View style={styles.creditWarningIconContainer}>
            <Ionicons name="information-circle" size={40} color="#2196F3" />
          </View>
          <Text style={[styles.creditWarningTitle, { color: theme.text }]}>
            Confirm Credit Usage
          </Text>
          <Text style={[styles.creditWarningDescription, { color: theme.text }]}>
            This {operationType} operation will use {creditCost} AI credit{creditCost !== 1 ? 's' : ''}. 
            Do you want to continue?
          </Text>
          <View style={styles.creditWarningButtons}>
            <TouchableOpacity
              style={[styles.creditWarningCancelButton, { 
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1
              }]}
              onPress={onCancel}
            >
              <Text style={[styles.creditWarningCancelText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.creditWarningConfirmButton, { backgroundColor: theme.primary }]}
              onPress={onConfirm}
            >
              <Text style={styles.creditWarningConfirmText}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  creditWarningModal: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  creditWarningIconContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditWarningTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  creditWarningDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  creditWarningButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  creditWarningCancelButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  creditWarningCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  creditWarningConfirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  creditWarningConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AICreditWarningModal;
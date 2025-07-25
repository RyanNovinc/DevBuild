// src/screens/TimeBlockScreen/UnsavedChangesModal.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UnsavedChangesModal = ({ 
  visible, 
  onKeepEditing, 
  onDiscard,
  theme
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onKeepEditing}
    >
      <View style={[
        styles.modalOverlay, 
        { backgroundColor: 'rgba(0,0,0,0.5)' }
      ]}>
        <View style={[
          styles.confirmModalContainer, 
          { 
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border
          }
        ]}>
          <View style={styles.confirmModalContent}>
            <Ionicons 
              name="warning" 
              size={40} 
              color={theme.warning} 
              style={styles.confirmModalIcon}
            />
            <Text style={[styles.confirmModalTitle, { color: theme.text }]}>
              Unsaved Changes
            </Text>
            <Text style={[styles.confirmModalMessage, { color: theme.textSecondary }]}>
              You have unsaved changes. Are you sure you want to go back?
            </Text>
          </View>
          
          <View style={styles.confirmModalButtons}>
            <TouchableOpacity 
              style={[
                styles.confirmModalButton,
                styles.confirmModalCancelButton,
                { 
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: theme.primary
                }
              ]}
              onPress={onKeepEditing}
            >
              <Text style={[
                styles.confirmModalButtonText,
                { color: theme.primary }
              ]}>
                Keep Editing
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmModalButton,
                styles.confirmModalConfirmButton,
                { backgroundColor: theme.error }
              ]}
              onPress={onDiscard}
            >
              <Text style={[
                styles.confirmModalButtonText,
                { color: '#FFFFFF' }
              ]}>
                Discard Changes
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  confirmModalContainer: {
    width: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  confirmModalContent: {
    padding: 24,
    alignItems: 'center',
  },
  confirmModalIcon: {
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  confirmModalMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  confirmModalButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E1E2E3',
  },
  confirmModalButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalCancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#E1E2E3',
  },
  confirmModalConfirmButton: {
    backgroundColor: '#EA4335',
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  }
});

export default UnsavedChangesModal;
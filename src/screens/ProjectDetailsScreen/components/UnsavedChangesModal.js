// src/screens/ProjectDetailsScreen/components/UnsavedChangesModal.js
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
  setVisible, 
  handleSave, 
  discardChangesAndGoBack, 
  theme, 
  color 
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.confirmModalContainer, { backgroundColor: theme.card }]}>
          <View style={styles.confirmModalContent}>
            <Ionicons name="warning-outline" size={40} color={theme.warning} style={styles.confirmModalIcon} />
            
            <Text style={[styles.confirmModalTitle, { color: theme.text }]}>
              Unsaved Changes
            </Text>
            
            <Text style={[styles.confirmModalMessage, { color: theme.textSecondary }]}>
              You have unsaved changes. Would you like to save your changes or discard them?
            </Text>
            
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.confirmModalButtonSecondary, { borderColor: theme.border }]} 
                onPress={() => setVisible(false)}
              >
                <Text style={[styles.confirmModalButtonText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.confirmModalButtonDanger, { backgroundColor: theme.errorLight }]} 
                onPress={discardChangesAndGoBack}
              >
                <Text style={[styles.confirmModalButtonText, { color: theme.error }]}>
                  Discard
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.confirmModalButton, styles.confirmModalButtonPrimary, { backgroundColor: color }]} 
                onPress={() => {
                  setVisible(false);
                  handleSave();
                }}
              >
                <Text style={[styles.confirmModalButtonText, { color: '#fff' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
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
  },
  confirmModalContainer: {
    margin: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
  },
  confirmModalContent: {
    alignItems: 'center',
  },
  confirmModalIcon: {
    marginBottom: 15,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmModalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  confirmModalButtonDanger: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  confirmModalButtonPrimary: {
    backgroundColor: '#4CAF50',
  },
  confirmModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UnsavedChangesModal;
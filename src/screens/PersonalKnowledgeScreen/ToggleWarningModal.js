// src/screens/PersonalKnowledgeScreen/ToggleWarningModal.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ToggleWarningModal = ({ visible, theme, onClose, onConfirm }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.warningModalContent, { 
          backgroundColor: theme.cardElevated || theme.card,
          borderColor: theme.border
        }]}>
          <View style={styles.warningModalHeader}>
            <Ionicons name="information-circle" size={40} color={theme.primary} />
            <Text style={[styles.warningModalTitle, { color: theme.text }]}>
              AI Usage Notice
            </Text>
            <TouchableOpacity 
              style={styles.warningModalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.warningModalDescription, { color: theme.text }]}>
            Enabling Personal Context will cause your AI assistant to process additional document data, which may result in faster usage of your AI quota. However, this will provide more personalized and insightful responses.
          </Text>
          
          <View style={styles.dontShowAgainContainer}>
            <Switch
              value={dontShowAgain}
              onValueChange={setDontShowAgain}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={dontShowAgain ? theme.primary : theme.textSecondary}
            />
            <Text style={[styles.dontShowAgainText, { color: theme.text }]}>
              Don't show this message again
            </Text>
          </View>
          
          <View style={styles.warningModalButtons}>
            <TouchableOpacity
              style={[styles.warningModalButtonCancel, { borderColor: theme.border }]}
              onPress={onClose}
            >
              <Text style={[styles.warningModalButtonCancelText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.warningModalButtonConfirm, { backgroundColor: theme.primary }]}
              onPress={() => onConfirm(dontShowAgain)}
            >
              <Text style={styles.warningModalButtonConfirmText}>Enable Anyway</Text>
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
    padding: 20,
  },
  warningModalContent: {
    width: '90%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  warningModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  warningModalCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
  },
  warningModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  warningModalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  dontShowAgainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dontShowAgainText: {
    marginLeft: 10,
    fontSize: 14,
  },
  warningModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  warningModalButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  warningModalButtonCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  warningModalButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  warningModalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ToggleWarningModal;
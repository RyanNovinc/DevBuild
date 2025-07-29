// src/components/ai/AIModals/AILowCreditModal.js
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
 * AILowCreditModal - Modal shown when user has low AI credits
 */
const AILowCreditModal = ({ 
  visible = false, 
  credits = 0,
  onDismiss,
  onUpgrade
}) => {
  const { theme } = useTheme();
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.creditWarningModal, { 
          backgroundColor: theme.cardElevated || theme.card,
          borderColor: theme.border
        }]}>
          <View style={styles.creditWarningIconContainer}>
            <Ionicons name="warning" size={40} color="#FF9800" />
          </View>
          <Text style={[styles.creditWarningTitle, { color: theme.text }]}>
            Low AI Credits
          </Text>
          <Text style={[styles.creditWarningDescription, { color: theme.text }]}>
            You have only {credits} AI credit{credits !== 1 ? 's' : ''} remaining. Upgrade to a subscription plan for uninterrupted AI assistance and additional benefits.
          </Text>
          <View style={styles.creditWarningButtons}>
            <TouchableOpacity
              style={[styles.creditWarningCancelButton, { 
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1
              }]}
              onPress={onDismiss}
            >
              <Text style={[styles.creditWarningCancelText, { color: theme.text }]}>
                Dismiss
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.creditWarningUpgradeButton, { backgroundColor: '#3F51B5' }]}
              onPress={onUpgrade}
            >
              <Text style={styles.creditWarningUpgradeText}>
                View Plans
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
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
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
  creditWarningUpgradeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  creditWarningUpgradeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AILowCreditModal;
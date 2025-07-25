// src/components/ai/AIModals/AIZeroCreditModal.js
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
 * AIZeroCreditModal - Modal shown when user has zero AI credits
 */
const AIZeroCreditModal = ({ 
  visible = false, 
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
        <View style={[styles.creditLimitModal, { 
          backgroundColor: theme.cardElevated || theme.card,
          borderColor: theme.border
        }]}>
          <View style={styles.creditLimitIconContainer}>
            <Ionicons name="alert-circle" size={40} color="#F44336" />
          </View>
          <Text style={[styles.creditLimitTitle, { color: theme.text }]}>
            You're out of AI credits
          </Text>
          <Text style={[styles.creditLimitDescription, { color: theme.text }]}>
            You've used all your available AI credits. Upgrade to a subscription plan for uninterrupted AI assistance and many more benefits.
          </Text>
          <View style={styles.creditLimitButtons}>
            <TouchableOpacity
              style={[styles.creditLimitCancelButton, { 
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1
              }]}
              onPress={onDismiss}
            >
              <Text style={[styles.creditLimitCancelText, { color: theme.text }]}>
                Later
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.creditLimitUpgradeButton, { backgroundColor: '#3F51B5' }]}
              onPress={onUpgrade}
            >
              <Text style={styles.creditLimitUpgradeText}>
                View Subscription Plans
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
  creditLimitModal: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  creditLimitIconContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditLimitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  creditLimitDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  creditLimitButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  creditLimitCancelButton: {
    flex: 1,
    paddingVertical: 14,
    marginRight: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  creditLimitCancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
  creditLimitUpgradeButton: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  creditLimitUpgradeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default AIZeroCreditModal;
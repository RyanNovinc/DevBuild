// src/components/ai/AIModals/AIConversationLimitModal.js
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
 * AIConversationLimitModal - Modal shown when conversation reaches maximum size
 */
const AIConversationLimitModal = ({ 
  visible = false, 
  onDismiss,
  onNewConversation,
  onTruncateConversation
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
        <View style={[styles.limitModal, { 
          backgroundColor: theme.cardElevated || theme.card,
          borderColor: theme.border
        }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="warning" size={40} color="#FFC107" />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            Conversation Size Limit
          </Text>
          <Text style={[styles.description, { color: theme.text }]}>
            This conversation has reached the maximum size limit. To continue, you can either:
          </Text>
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={[styles.optionButton, { 
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderWidth: 1
              }]}
              onPress={onTruncateConversation}
            >
              <Ionicons name="cut-outline" size={20} color={theme.primary} style={{ marginRight: 8 }} />
              <View>
                <Text style={[styles.optionTitle, { color: theme.text }]}>
                  Trim Conversation
                </Text>
                <Text style={[styles.optionDescription, { color: theme.textSecondary }]}>
                  Remove older messages
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.optionButton, { 
                backgroundColor: theme.primary,
                marginTop: 12
              }]}
              onPress={onNewConversation}
            >
              <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.optionTitleWhite}>
                  Start New Conversation
                </Text>
                <Text style={styles.optionDescriptionWhite}>
                  Begin fresh (saves current chat)
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={onDismiss}
          >
            <Text style={[styles.dismissText, { color: theme.textSecondary }]}>
              Dismiss
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  limitModal: {
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  optionsContainer: {
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  optionTitleWhite: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionDescriptionWhite: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  dismissButton: {
    marginTop: 20,
    padding: 10,
  },
  dismissText: {
    fontSize: 14,
  }
});

export default AIConversationLimitModal;
// src/screens/PersonalKnowledgeScreen/InfoModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import storage quota from constants
import { STORAGE_QUOTA_KB } from './constants';

/**
 * InfoModal component for explaining personal context
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Object} props.theme - Theme object
 * @param {Function} props.onClose - Close modal callback
 * @param {string} props.storageLimit - Storage limit to display (defaults to dynamic value from constants)
 */
const InfoModal = ({ visible, theme, onClose, storageLimit = `${STORAGE_QUOTA_KB}KB` }) => {
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
        <View style={[styles.infoModalContent, { 
          backgroundColor: theme.cardElevated || theme.card,
          borderColor: theme.border
        }]}>
          <TouchableOpacity 
            style={styles.infoModalCloseButton}
            onPress={onClose}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          
          <Text style={[styles.infoModalTitle, { color: theme.text }]}>
            About Personal Knowledge
          </Text>
          
          <ScrollView style={styles.infoModalScroll}>
            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: theme.text }]}>
                What is Personal Knowledge?
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                Personal Knowledge lets your AI assistant use information from your documents to provide 
                more relevant and personalized responses. When enabled, the AI can reference your 
                uploaded documents when responding to your queries.
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: theme.text }]}>
                How It Works
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                1. Upload documents you want your AI to access
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                2. The AI processes your documents securely
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                3. When you chat with your AI, it can now reference these documents
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                4. Toggle the switch to enable/disable this feature at any time
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: theme.text }]}>
                Supported File Types
              </Text>
              <View style={styles.fileTypeRow}>
                <View style={[styles.fileTypeTag, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="document-text" size={14} color={theme.primary} />
                  <Text style={[styles.fileTypeText, { color: theme.primary }]}>PDF</Text>
                </View>
                <View style={[styles.fileTypeTag, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="document" size={14} color={theme.primary} />
                  <Text style={[styles.fileTypeText, { color: theme.primary }]}>Word</Text>
                </View>
                <View style={[styles.fileTypeTag, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="reader" size={14} color={theme.primary} />
                  <Text style={[styles.fileTypeText, { color: theme.primary }]}>Text</Text>
                </View>
              </View>
              <View style={styles.fileTypeRow}>
                <View style={[styles.fileTypeTag, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="grid" size={14} color={theme.primary} />
                  <Text style={[styles.fileTypeText, { color: theme.primary }]}>CSV</Text>
                </View>
                <View style={[styles.fileTypeTag, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="grid" size={14} color={theme.primary} />
                  <Text style={[styles.fileTypeText, { color: theme.primary }]}>Excel</Text>
                </View>
                <View style={[styles.fileTypeTag, { backgroundColor: theme.primaryLight }]}>
                  <Ionicons name="code-slash" size={14} color={theme.primary} />
                  <Text style={[styles.fileTypeText, { color: theme.primary }]}>JSON</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: theme.text }]}>
                Storage Limit
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                You have a total of {storageLimit} of storage for your personal knowledge documents.
                This limit applies to the processed text content that the AI can access, not the original
                document size. Documents are processed to extract and optimize their text content.
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                If you need more storage, you can delete older documents to make room for new ones.
              </Text>
              <Text style={[styles.infoText, { color: theme.text, fontStyle: 'italic' }]}>
                Note: Most documents like resumes, short articles, and notes typically use only 2-10KB of 
                storage after processing, so the {storageLimit} limit should be sufficient for most users.
              </Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: theme.text }]}>
                Data Security
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                Your documents are processed securely and are only used to enhance your experience. 
                Document content is not shared with other users or used to train AI models. 
                You can delete your documents at any time.
              </Text>
            </View>
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.infoModalButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.infoModalButtonText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
  infoModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
  },
  infoModalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
  },
  infoModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 10,
  },
  infoModalScroll: {
    maxHeight: '70%',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
  fileTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 4,
  },
  fileTypeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  fileTypeText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  infoModalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  infoModalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default InfoModal;
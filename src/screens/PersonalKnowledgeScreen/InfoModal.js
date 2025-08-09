// src/screens/PersonalKnowledgeScreen/InfoModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import storage quota from constants
import { STORAGE_QUOTA_KB } from './constants';

/**
 * InfoModal component for explaining personal context or app context
 * @param {Object} props - Component props
 * @param {boolean} props.visible - Whether the modal is visible
 * @param {Object} props.theme - Theme object
 * @param {Function} props.onClose - Close modal callback
 * @param {string} props.storageLimit - Storage limit to display (defaults to dynamic value from constants)
 * @param {string} props.title - Custom title for the modal
 * @param {Object} props.content - Custom content object with sections
 */
const InfoModal = ({ visible, theme, onClose, storageLimit = `${STORAGE_QUOTA_KB}KB`, title, content }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View 
        style={styles.modalOverlay}
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
            {title || "About Personal Knowledge"}
          </Text>
          
          <ScrollView style={styles.infoModalScroll}>
            {content ? (
              // Render custom content
              content.sections?.map((section, index) => (
                <View key={index} style={styles.infoSection}>
                  <Text style={[styles.infoSectionTitle, { color: theme.text }]}>
                    {section.title}
                  </Text>
                  {section.text && (
                    <Text style={[styles.infoText, { color: theme.text }]}>
                      {section.text}
                    </Text>
                  )}
                  {section.bullets && section.bullets.map((bullet, bulletIndex) => (
                    <Text key={bulletIndex} style={[styles.infoText, { color: theme.text }]}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              ))
            ) : (
              // Default Personal Knowledge content
              <>
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
                <View style={[styles.fileTypeTag, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Ionicons name="document-text" size={16} color="#FFFFFF" />
                  <Text style={[styles.fileTypeText, { color: '#FFFFFF' }]}>PDF</Text>
                </View>
                <View style={[styles.fileTypeTag, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Ionicons name="document" size={16} color="#FFFFFF" />
                  <Text style={[styles.fileTypeText, { color: '#FFFFFF' }]}>Word</Text>
                </View>
                <View style={[styles.fileTypeTag, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Ionicons name="reader" size={16} color="#FFFFFF" />
                  <Text style={[styles.fileTypeText, { color: '#FFFFFF' }]}>Text</Text>
                </View>
              </View>
              <View style={styles.fileTypeRow}>
                <View style={[styles.fileTypeTag, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Ionicons name="grid" size={16} color="#FFFFFF" />
                  <Text style={[styles.fileTypeText, { color: '#FFFFFF' }]}>CSV</Text>
                </View>
                <View style={[styles.fileTypeTag, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Ionicons name="grid" size={16} color="#FFFFFF" />
                  <Text style={[styles.fileTypeText, { color: '#FFFFFF' }]}>Excel</Text>
                </View>
                <View style={[styles.fileTypeTag, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                  <Ionicons name="code-slash" size={16} color="#FFFFFF" />
                  <Text style={[styles.fileTypeText, { color: '#FFFFFF' }]}>JSON</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={[styles.infoSectionTitle, { color: theme.text }]}>
                Document Management
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                Your documents are processed and optimized for AI access. You can manage your document 
                collection by uploading new files or removing documents you no longer need.
              </Text>
              <Text style={[styles.infoText, { color: theme.text }]}>
                Each document can be individually toggled on or off for AI access, giving you full 
                control over what information the AI can reference.
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
              </>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={[styles.infoModalButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.infoModalButtonText}>Got It</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  infoModalContent: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    borderRadius: 16,
    overflow: 'hidden',
    paddingVertical: 32,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  infoModalCloseButton: {
    position: 'absolute',
    right: 20,
    top: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.3,
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
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  infoModalButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  infoModalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.2,
  },
});

export default InfoModal;
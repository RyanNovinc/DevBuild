// src/screens/PersonalKnowledgeScreen/AIModelExplanationModal.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AIModelExplanationModal = ({ visible, theme, onClose }) => {
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
        <View style={[styles.aiModelModalContent, { 
          backgroundColor: theme.cardElevated || theme.card,
          borderColor: theme.border
        }]}>
          <View style={styles.aiModelModalHeader}>
            <Ionicons name="flash" size={40} color={theme.primary} />
            <Text style={[styles.aiModelModalTitle, { color: theme.text }]}>
              AI Models & Capabilities
            </Text>
            <TouchableOpacity 
              style={styles.aiModelModalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.aiModelModalDescription, { color: theme.text }]}>
            All AI models are available to use regardless of your subscription tier. 
            Choose the one that best suits your current task requirements.
          </Text>
          
          <View style={styles.aiModelDetailContainer}>
            <View style={styles.aiModelDetailItem}>
              <View style={[styles.aiModelIcon, { backgroundColor: '#03A9F4' }]}>
                <Ionicons name="flash-outline" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.aiModelDetailContent}>
                <Text style={[styles.aiModelDetailTitle, { color: theme.text }]}>
                  Guide AI
                </Text>
                <Text style={[styles.aiModelDetailDesc, { color: theme.textSecondary }]}>
                  Our fastest model, ideal for simple tasks and everyday assistance. Best for quick questions and basic organization.
                </Text>
                <Text style={[styles.aiModelDetailTech, { color: '#03A9F4' }]}>
                  Powered by gpt-4o-mini
                </Text>
              </View>
            </View>
            
            <View style={styles.aiModelDetailItem}>
              <View style={[styles.aiModelIcon, { backgroundColor: '#3F51B5' }]}>
                <Ionicons name="flash" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.aiModelDetailContent}>
                <Text style={[styles.aiModelDetailTitle, { color: theme.text }]}>
                  Navigator AI
                </Text>
                <Text style={[styles.aiModelDetailDesc, { color: theme.textSecondary }]}>
                  Balanced power and efficiency for daily planning and project analysis. Good for most personal and professional tasks.
                </Text>
                <Text style={[styles.aiModelDetailTech, { color: '#3F51B5' }]}>
                  Powered by gpt-4o
                </Text>
              </View>
            </View>
            
            <View style={styles.aiModelDetailItem}>
              <View style={[styles.aiModelIcon, { backgroundColor: '#673AB7' }]}>
                <Ionicons name="flash-sharp" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.aiModelDetailContent}>
                <Text style={[styles.aiModelDetailTitle, { color: theme.text }]}>
                  Compass AI
                </Text>
                <Text style={[styles.aiModelDetailDesc, { color: theme.textSecondary }]}>
                  Our most powerful model for complex analysis and strategic planning. Best for sophisticated reasoning and big-picture thinking.
                </Text>
                <Text style={[styles.aiModelDetailTech, { color: '#673AB7' }]}>
                  Powered by gpt-4.1
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.aiModelModalNote, { color: theme.textSecondary }]}>
            All models can access your documents and app data. They differ in reasoning complexity, response quality, and creative capabilities.
          </Text>
          
          <TouchableOpacity
            style={[styles.aiModelModalButton, { backgroundColor: theme.primary }]}
            onPress={onClose}
          >
            <Text style={styles.aiModelModalButtonText}>Got It</Text>
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
  aiModelModalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 20,
  },
  aiModelModalHeader: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  aiModelModalCloseButton: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  aiModelModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  aiModelModalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  aiModelDetailContainer: {
    marginVertical: 10,
  },
  aiModelDetailItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  aiModelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  aiModelDetailContent: {
    flex: 1,
  },
  aiModelDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aiModelDetailDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  aiModelDetailTech: {
    fontSize: 12,
    fontWeight: '500',
  },
  aiModelModalNote: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 16,
  },
  aiModelModalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  aiModelModalButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AIModelExplanationModal;
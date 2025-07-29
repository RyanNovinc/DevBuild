// src/components/UpdateLifeDirectionModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UpdateLifeDirectionModal = ({
  visible,
  onClose,
  onSave,
  currentLifeDirection
}) => {
  const { theme } = useTheme();
  const [lifeDirection, setLifeDirection] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const MAX_CHARS = 250; // Maximum character limit

  // Initialize with current life direction when modal opens
  useEffect(() => {
    if (visible && currentLifeDirection) {
      setLifeDirection(currentLifeDirection);
      setCharacterCount(currentLifeDirection.length);
    } else if (visible && !currentLifeDirection) {
      // If no life direction is set, try to get it from AsyncStorage
      const getStoredLifeDirection = async () => {
        try {
          const storedDirection = await AsyncStorage.getItem('lifeDirection');
          if (storedDirection) {
            setLifeDirection(storedDirection);
            setCharacterCount(storedDirection.length);
          }
        } catch (error) {
          console.error('Error getting stored life direction:', error);
        }
      };
      
      getStoredLifeDirection();
    }
  }, [visible, currentLifeDirection]);

  // Update character count when text changes
  const handleTextChange = (text) => {
    if (text.length <= MAX_CHARS) {
      setLifeDirection(text);
      setCharacterCount(text.length);
    }
  };

  // Handle save
  const handleSave = () => {
    if (!lifeDirection.trim()) {
      Alert.alert(
        "Cannot Save Empty Direction",
        "Please enter your life direction statement.",
        [{ text: "OK" }]
      );
      return;
    }

    onSave(lifeDirection.trim());
  };

  // Dismiss keyboard when clicking outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Reset when closing
  const handleClose = () => {
    setLifeDirection(currentLifeDirection || '');
    setCharacterCount(currentLifeDirection ? currentLifeDirection.length : 0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Update Life Direction
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.infoCard}>
                <Ionicons name="compass" size={24} color={theme.primary} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: theme.text }]}>
                  Your life direction statement guides your goals and priorities. What's your purpose? What matters most to you?
                </Text>
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Your Life Direction Statement:
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border
                  }
                ]}
                value={lifeDirection}
                onChangeText={handleTextChange}
                placeholder="e.g., To live with purpose and create positive impact..."
                placeholderTextColor={theme.textSecondary}
                multiline={true}
                numberOfLines={5}
                maxLength={MAX_CHARS}
              />
              
              <Text style={[styles.characterCount, { 
                color: characterCount >= MAX_CHARS * 0.9 ? theme.error : theme.textSecondary 
              }]}>
                {characterCount}/{MAX_CHARS} characters
              </Text>

              {/* Examples */}
              <Text style={[styles.examplesTitle, { color: theme.textSecondary }]}>
                Examples:
              </Text>
              
              <View style={[styles.exampleCard, { 
                backgroundColor: `${theme.primary}20`,
                borderColor: theme.border
              }]}>
                <Text style={[styles.exampleText, { color: theme.text }]}>
                  "To live authentically and mindfully while creating a positive impact on others through my creativity and compassion."
                </Text>
              </View>
              
              <View style={[styles.exampleCard, { 
                backgroundColor: `${theme.primary}20`,
                borderColor: theme.border
              }]}>
                <Text style={[styles.exampleText, { color: theme.text }]}>
                  "To grow into my fullest potential by pursuing meaningful work, nurturing close relationships, and maintaining balance in my physical and mental wellbeing."
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  Save Life Direction
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  closeButton: {
    padding: 4
  },
  formContainer: {
    marginBottom: Platform.OS === 'ios' ? 0 : 16
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  infoIcon: {
    marginRight: 12
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
    minHeight: 120,
    textAlignVertical: 'top'
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 16
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8
  },
  exampleCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic'
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default UpdateLifeDirectionModal;
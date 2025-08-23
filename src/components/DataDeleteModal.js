// src/components/DataDeleteModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const DataDeleteModal = ({ visible, theme, onCancel, onConfirm }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [shakeAnim] = useState(new Animated.Value(0));
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmInput, setShowConfirmInput] = useState(false);

  const isDarkMode = theme.background === '#000000';
  const isConfirmValid = confirmText.toLowerCase() === 'delete';

  useEffect(() => {
    if (visible) {
      setConfirmText('');
      setShowConfirmInput(false);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleInitialDelete = () => {
    setShowConfirmInput(true);
  };

  const handleFinalDelete = () => {
    if (!isConfirmValid) {
      shakeInput();
      return;
    }
    onConfirm();
  };

  const handleCancel = () => {
    setShowConfirmInput(false);
    setConfirmText('');
    onCancel();
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      statusBarTranslucent={true}
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.7)" barStyle="light-content" />
      
      {/* Backdrop with blur effect */}
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: fadeAnim }
        ]}
      >
        <BlurView
          intensity={25}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.backdropOverlay} />
      </Animated.View>

      {/* Modal Container */}
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.centeredView}>
          <Animated.View
            style={[
              styles.modalView,
              {
                backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}>
                <Ionicons name="warning-outline" size={32} color="#FF3B30" />
              </View>
              <Text style={[styles.title, { color: '#FF3B30' }]}>
                Delete All Data
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                This action cannot be undone
              </Text>
            </View>

            {/* Content */}
            <ScrollView 
              style={styles.content} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={[styles.description, { color: theme.text }]}>
                ⚠️ This will permanently delete ALL your personal data from LifeCompass, including:
              </Text>

              <View style={styles.dataList}>
                {[
                  { icon: 'flag-outline', text: 'Goals, milestones, and tasks' },
                  { icon: 'wallet-outline', text: 'Financial tracker data' },
                  { icon: 'flame-outline', text: 'Streak tracker data' },
                  { icon: 'chatbubbles-outline', text: 'AI conversation history' },
                  { icon: 'person-outline', text: 'Profile and preferences' },
                  { icon: 'document-outline', text: 'Uploaded documents' },
                  { icon: 'calendar-outline', text: 'Calendar events and settings' },
                  { icon: 'list-outline', text: 'Todo lists and task notes' },
                  { icon: 'create-outline', text: 'All saved notes and entries' },
                  { icon: 'trophy-outline', text: 'All achievements and progress' },
                ].map((item, index) => (
                  <View key={index} style={styles.dataItem}>
                    <View style={[styles.dataIconContainer, { backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}>
                      <Ionicons name={item.icon} size={16} color="#FF3B30" />
                    </View>
                    <Text style={[styles.dataItemText, { color: theme.text }]}>
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Warning */}
              <View style={[styles.warningContainer, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                <Ionicons name="alert-circle-outline" size={20} color="#FF3B30" />
                <View style={styles.warningTextContainer}>
                  <Text style={[styles.warningTitle, { color: '#FF3B30' }]}>
                    Important
                  </Text>
                  <Text style={[styles.warningText, { color: theme.text }]}>
                    This action cannot be undone. Consider exporting your data first.
                  </Text>
                </View>
              </View>

              {/* Confirmation Input */}
              {showConfirmInput && (
                <View style={styles.confirmSection}>
                  <Text style={[styles.confirmLabel, { color: theme.text }]}>
                    Type <Text style={styles.confirmKeyword}>delete</Text> to confirm:
                  </Text>
                  <Animated.View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
                        borderColor: isConfirmValid ? '#34C759' : confirmText ? '#FF3B30' : 'transparent',
                        transform: [{ translateX: shakeAnim }],
                      },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.confirmInput,
                        { color: theme.text }
                      ]}
                      value={confirmText}
                      onChangeText={setConfirmText}
                      placeholder="Type 'delete' here"
                      placeholderTextColor={theme.textSecondary}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect={false}
                      autoFocus={true}
                    />
                    {isConfirmValid && (
                      <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                    )}
                  </Animated.View>
                </View>
              )}
            </ScrollView>

            {/* Actions - Fixed at bottom */}
            <View style={styles.actionsContainer}>
              <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton, { backgroundColor: theme.card }]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              {!showConfirmInput ? (
                <TouchableOpacity
                  style={[styles.button, styles.deleteButton]}
                  onPress={handleInitialDelete}
                >
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    Delete All Data
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.confirmDeleteButton,
                    { opacity: isConfirmValid ? 1 : 0.5 }
                  ]}
                  onPress={handleFinalDelete}
                  disabled={!isConfirmValid}
                >
                  <Ionicons name="warning-outline" size={18} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                    Confirm Delete
                  </Text>
                </TouchableOpacity>
              )}
              </View>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20, // Add vertical padding to prevent keyboard overlap
  },
  modalView: {
    width: Math.min(width - 40, 420),
    maxHeight: height * 0.75, // Reduced from 0.85 to give more space for keyboard
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 24,
    maxHeight: height * 0.35, // Reduced from 0.45 to ensure buttons stay visible
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  dataList: {
    marginBottom: 20,
  },
  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dataIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dataItemText: {
    fontSize: 15,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  warningTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  confirmSection: {
    marginBottom: 8,
  },
  confirmLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmKeyword: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  confirmInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 'auto', // Push to bottom
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  confirmDeleteButton: {
    backgroundColor: '#D70015',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default DataDeleteModal;
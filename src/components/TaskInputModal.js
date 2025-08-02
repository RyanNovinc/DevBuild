// src/components/TaskInputModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  accessibility
} from '../utils/responsive';

const TaskInputModal = ({ visible, onClose, onConfirm, initialValue = '' }) => {
  const { theme } = useTheme();
  const [taskName, setTaskName] = useState(initialValue);
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      setTaskName(initialValue);
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start(() => {
        // Focus input after animation
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      });
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    if (taskName.trim()) {
      onConfirm(taskName.trim());
      handleClose();
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    setTaskName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.card,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Task Name</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <TextInput
            ref={inputRef}
            style={[
              styles.input,
              {
                backgroundColor: theme.inputBackground,
                borderColor: theme.border,
                color: theme.text,
              }
            ]}
            value={taskName}
            onChangeText={setTaskName}
            placeholder="Enter task name"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="sentences"
            autoCorrect={true}
            autoFocus={false}
            maxLength={200}
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
            returnKeyType="default"
            blurOnSubmit={true}
            onSubmitEditing={handleConfirm}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: theme.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { 
                  backgroundColor: theme.primary,
                  opacity: taskName.trim() ? 1 : 0.5
                }
              ]}
              onPress={handleConfirm}
              disabled={!taskName.trim()}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>Add</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: scaleWidth(12),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  title: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: scaleWidth(8),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    fontSize: scaleFontSize(16),
    minHeight: scaleHeight(50),
    maxHeight: scaleHeight(100),
    marginBottom: spacing.l,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor set inline
  },
  buttonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
  },
  confirmButtonText: {
    color: '#FFFFFF',
  },
});

export default TaskInputModal;
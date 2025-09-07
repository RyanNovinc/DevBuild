// src/components/TextInputModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const TextInputModal = ({
  visible,
  onClose,
  onSave,
  title,
  placeholder,
  value,
  multiline = false,
  maxLength,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [inputValue, setInputValue] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backgroundOpacityAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  useEffect(() => {
    console.log('🔍 TextInputModal visibility changed:', visible, 'title:', title);
    if (visible) {
      setInputValue(value || '');
      showModal();
    } else {
      hideModal();
    }
  }, [visible]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  const showModal = () => {
    Animated.parallel([
      Animated.timing(backgroundOpacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Focus the input after the animation completes
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    });
  };

  const hideModal = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(backgroundOpacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = () => {
    onSave(inputValue);
    hideModal();
    setTimeout(onClose, 250);
  };

  const handleCancel = () => {
    hideModal();
    setTimeout(onClose, 250);
  };

  if (!visible) return null;

  // Calculate modal positioning to avoid keyboard
  const modalHeight = multiline ? 320 : (maxLength ? 240 : 200);
  const availableHeight = height - insets.top - insets.bottom - keyboardHeight;
  const modalTop = Math.max(
    insets.top + 50,
    (availableHeight - modalHeight) / 2 + insets.top
  );

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleCancel}
      presentationStyle="overFullScreen"
    >
      <Animated.View
        style={[
          styles.backdrop,
          { opacity: backgroundOpacityAnim }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleCancel}>
          <View style={styles.backdropTouchable} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.surface || theme.background || '#FFFFFF',
              borderColor: theme.border,
              transform: [{ translateY: slideAnim }],
              top: modalTop,
              height: modalHeight,
            }
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {title}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCancel}
            >
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Input Section */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                multiline && styles.textInputMultiline,
                {
                  color: theme.text,
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                }
              ]}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder={placeholder}
              placeholderTextColor={theme.textSecondary}
              multiline={multiline}
              maxLength={maxLength}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              textAlignVertical={multiline ? 'top' : 'center'}
              returnKeyType={multiline ? 'default' : 'done'}
              onSubmitEditing={multiline ? undefined : handleSave}
            />
          </View>
          
          {/* Character Count Section */}
          {maxLength && (
            <View style={styles.characterCountContainer}>
              <Text style={[styles.characterCount, { color: theme.textSecondary }]}>
                {inputValue.length}/{maxLength}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 9999,
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 20,
    zIndex: 10000,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 44,
  },
  textInputMultiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCountContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 8,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TextInputModal;
// src/components/TextInputPopup.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  isTablet,
  accessibility,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing
} from '../utils/responsive';

const TextInputPopup = ({
  visible,
  onClose,
  onSave,
  title,
  value,
  placeholder,
  multiline = false,
  maxLength = null
}) => {
  const { theme } = useTheme();
  const safeSpacing = useSafeSpacing();
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  const [inputValue, setInputValue] = useState('');
  const [inputHeight, setInputHeight] = useState(multiline ? scaleHeight(120) : scaleHeight(48));
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Min and max heights for multiline input
  const MIN_HEIGHT = scaleHeight(48);
  const MAX_HEIGHT = scaleHeight(200);
  
  // Update internal value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);
  
  // Auto-focus when modal opens
  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      // Focus input after a short delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    } else {
      // Reset animation
      fadeAnim.setValue(0);
      setInputHeight(multiline ? scaleHeight(120) : scaleHeight(48));
    }
  }, [visible]);
  
  // Handle content size change for multiline inputs
  const handleContentSizeChange = (event) => {
    if (multiline && event?.nativeEvent?.contentSize) {
      const { height } = event.nativeEvent.contentSize;
      const newHeight = Math.min(Math.max(MIN_HEIGHT, height + scaleHeight(20)), MAX_HEIGHT);
      setInputHeight(newHeight);
    }
  };
  
  // Handle save
  const handleSave = () => {
    onSave(inputValue);
    onClose();
  };
  
  // Handle cancel
  const handleCancel = () => {
    setInputValue(value || ''); // Reset to original value
    onClose();
  };
  
  // Get container height based on orientation and device
  const getContainerHeight = () => {
    if (isTablet) {
      return isLandscape ? '70%' : '50%';
    } else if (isLandscape) {
      return '80%';
    } else {
      return '60%';
    }
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none" // We'll handle animation ourselves
      onRequestClose={handleCancel}
      accessible={true}
      accessibilityViewIsModal={true}
      accessibilityLabel={`Edit ${title.toLowerCase()}`}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? scaleHeight(20) : 0}
        >
          <Animated.View
            style={[
              styles.popup,
              {
                backgroundColor: theme.card,
                maxHeight: getContainerHeight(),
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text
                style={[styles.title, { color: theme.text }]}
                maxFontSizeMultiplier={1.3}
                accessibilityRole="header"
              >
                {title}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Closes without saving changes"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={scaleWidth(24)} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {/* Input */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border,
                    height: inputHeight,
                    textAlignVertical: multiline ? 'top' : 'center',
                  },
                ]}
                value={inputValue}
                onChangeText={setInputValue}
                onContentSizeChange={handleContentSizeChange}
                placeholder={placeholder}
                placeholderTextColor={theme.textSecondary}
                multiline={multiline}
                scrollEnabled={multiline && inputHeight >= MAX_HEIGHT}
                maxLength={maxLength}
                returnKeyType={multiline ? 'default' : 'done'}
                onSubmitEditing={multiline ? undefined : handleSave}
                blurOnSubmit={!multiline}
                maxFontSizeMultiplier={1.3}
                accessible={true}
                accessibilityLabel={title}
                accessibilityHint={`Enter ${title.toLowerCase()}`}
                accessibilityRole="text"
              />
              
              {/* Character count for maxLength */}
              {maxLength && (
                <Text
                  style={[
                    styles.characterCount,
                    {
                      color: inputValue.length > maxLength * 0.9 ? theme.error : theme.textSecondary,
                    },
                  ]}
                  maxFontSizeMultiplier={1.3}
                >
                  {inputValue.length}/{maxLength}
                </Text>
              )}
            </View>
            
            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { borderColor: theme.border },
                ]}
                onPress={handleCancel}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                accessibilityHint="Discards changes and closes"
              >
                <Text
                  style={[styles.cancelButtonText, { color: theme.textSecondary }]}
                  maxFontSizeMultiplier={1.3}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  { backgroundColor: theme.primary },
                ]}
                onPress={handleSave}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Save"
                accessibilityHint="Saves the changes and closes"
              >
                <Text
                  style={styles.saveButtonText}
                  maxFontSizeMultiplier={1.3}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  popup: {
    width: '100%',
    maxWidth: scaleWidth(400),
    borderRadius: scaleWidth(16),
    padding: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  title: {
    fontSize: fontSizes.l,
    fontWeight: 'bold',
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.m,
  },
  inputContainer: {
    marginBottom: spacing.l,
  },
  input: {
    borderWidth: 1,
    borderRadius: scaleWidth(12),
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    fontSize: fontSizes.m,
    includeFontPadding: false,
  },
  characterCount: {
    fontSize: fontSizes.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.m,
    borderRadius: scaleWidth(8),
    alignItems: 'center',
    minHeight: scaleHeight(44),
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '500',
  },
  saveButton: {
    // backgroundColor set inline
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
});

export default TextInputPopup;
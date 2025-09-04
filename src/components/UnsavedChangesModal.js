// src/components/UnsavedChangesModal.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Animated,
  TouchableWithoutFeedback,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { scaleWidth, scaleHeight, fontSizes, spacing } from '../utils/responsive';

const UnsavedChangesModal = ({ 
  visible, 
  onKeepEditing, 
  onDiscard, 
  onSave, // Optional save button
  showSaveOption = false, // Whether to show the save button
  selectedColor // Optional color for save button (used in goals)
}) => {
  const { theme } = useTheme();
  
  // Animation values
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.8)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Animation sequence when modal opens
  useEffect(() => {
    if (visible) {
      // Reset animations
      backgroundOpacity.setValue(0);
      modalScale.setValue(0.8);
      modalOpacity.setValue(0);

      // Start animation sequence
      Animated.parallel([
        // Fade in background overlay
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        // Scale and fade in modal
        Animated.timing(modalScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.back(1.2))
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();
    }
  }, [visible]);

  // Handle close with animation
  const handleClose = (callback) => {
    Animated.parallel([
      Animated.timing(backgroundOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(modalScale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      callback && callback();
    });
  };

  const handleKeepEditing = () => {
    handleClose(onKeepEditing);
  };

  const handleDiscard = () => {
    handleClose(onDiscard);
  };

  const handleSave = () => {
    handleClose(onSave);
  };

  // Get appropriate text color for save button
  const getSaveButtonTextColor = () => {
    if (!selectedColor) return '#FFFFFF';
    if (selectedColor === '#FFFFFF') return '#000000';
    // Simple contrast check - you could use a more sophisticated method
    const hex = selectedColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return brightness > 128 ? '#000000' : '#FFFFFF';
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleKeepEditing}
      statusBarTranslucent={true}
    >
      {/* Background overlay with fade-in animation */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: backgroundOpacity
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleKeepEditing}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>

        {/* Modal content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              transform: [{ scale: modalScale }],
              opacity: modalOpacity
            }
          ]}
        >
          {/* Icon */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: theme.warningLight || 'rgba(255, 193, 7, 0.1)' }
          ]}>
            <Ionicons 
              name="warning-outline" 
              size={scaleWidth(32)} 
              color={theme.warning || '#FFC107'} 
            />
          </View>

          {/* Title */}
          <Text style={[
            styles.title,
            { color: theme.text }
          ]}>
            Discard Changes?
          </Text>

          {/* Message */}
          <Text style={[
            styles.message,
            { color: theme.textSecondary }
          ]}>
            You have unsaved changes. Are you sure you want to go back?
          </Text>

          {/* Buttons */}
          <View style={[
            styles.buttonContainer,
            showSaveOption && styles.threeButtonContainer
          ]}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.secondaryButton,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border
                },
                showSaveOption && styles.smallerButton
              ]}
              onPress={handleKeepEditing}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText,
                { color: theme.textSecondary },
                showSaveOption && styles.smallerButtonText
              ]}>
                {showSaveOption ? 'Cancel' : 'Keep Editing'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.destructiveButton,
                {
                  backgroundColor: theme.error || '#EA4335'
                },
                showSaveOption && styles.smallerButton
              ]}
              onPress={handleDiscard}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText,
                styles.destructiveButtonText,
                showSaveOption && styles.smallerButtonText
              ]}>
                Discard
              </Text>
            </TouchableOpacity>

            {showSaveOption && (
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  styles.smallerButton,
                  {
                    backgroundColor: selectedColor || theme.primary
                  }
                ]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.buttonText,
                  styles.smallerButtonText,
                  { color: getSaveButtonTextColor() }
                ]}>
                  Save
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l
  },
  overlayTouchable: {
    ...require('react-native').StyleSheet.absoluteFillObject
  },
  modalContainer: {
    width: '100%',
    maxWidth: scaleWidth(400),
    borderRadius: 20,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    alignItems: 'center'
  },
  iconContainer: {
    width: scaleWidth(64),
    height: scaleWidth(64),
    borderRadius: scaleWidth(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  message: {
    fontSize: fontSizes.m,
    lineHeight: fontSizes.m * 1.4,
    textAlign: 'center',
    marginBottom: spacing.xl
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.m
  },
  threeButtonContainer: {
    gap: spacing.s
  },
  button: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scaleHeight(48)
  },
  secondaryButton: {
    borderWidth: 1
  },
  destructiveButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  primaryButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  smallerButton: {
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    minHeight: scaleHeight(42)
  },
  buttonText: {
    fontSize: fontSizes.m,
    fontWeight: '600'
  },
  smallerButtonText: {
    fontSize: fontSizes.s
  },
  destructiveButtonText: {
    color: '#FFFFFF'
  }
};

export default UnsavedChangesModal;
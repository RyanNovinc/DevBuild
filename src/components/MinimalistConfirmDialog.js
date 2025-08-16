// src/components/MinimalistConfirmDialog.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
} from '../utils/responsive';

const MinimalistConfirmDialog = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  destructive = false,
  icon = null,
}) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
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
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleConfirm = () => {
    onClose();
    setTimeout(() => {
      onConfirm();
    }, 100);
  };

  const handleCancel = () => {
    onClose();
    if (onCancel) {
      setTimeout(() => {
        onCancel();
      }, 100);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: fadeAnim,
              },
            ]}
          />
          
          <Animated.View
            style={[
              styles.dialogContainer,
              {
                backgroundColor: theme.card || theme.background,
                borderColor: theme.border,
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Icon */}
            {(icon || destructive) && (
              <View style={styles.iconContainer}>
                <View style={[
                  styles.iconCircle,
                  { 
                    backgroundColor: destructive ? '#FFF5F5' : `${theme.primary}15`,
                    borderColor: destructive ? '#FEE2E2' : `${theme.primary}30`,
                  }
                ]}>
                  <Ionicons
                    name={icon || (destructive ? 'warning-outline' : 'help-circle-outline')}
                    size={scaleWidth(32)}
                    color={destructive ? '#EF4444' : theme.primary}
                  />
                </View>
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>
              <Text 
                style={[
                  styles.title, 
                  { color: theme.text }
                ]}
              >
                {title}
              </Text>
              
              {message && (
                <Text 
                  style={[
                    styles.message, 
                    { color: theme.textSecondary }
                  ]}
                >
                  {message}
                </Text>
              )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.cancelButton,
                  { 
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  }
                ]}
                onPress={handleCancel}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.confirmButton,
                  { 
                    backgroundColor: destructive ? '#EF4444' : theme.primary,
                  }
                ]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dialogContainer: {
    width: '100%',
    maxWidth: scaleWidth(340),
    borderRadius: scaleWidth(20),
    borderWidth: 1,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  iconCircle: {
    width: scaleWidth(80),
    height: scaleWidth(80),
    borderRadius: scaleWidth(40),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  message: {
    fontSize: fontSizes.m,
    textAlign: 'center',
    lineHeight: scaleHeight(22),
    paddingHorizontal: spacing.s,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: scaleWidth(12),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: scaleHeight(48),
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '600',
  },
  confirmButtonText: {
    fontSize: fontSizes.m,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MinimalistConfirmDialog;
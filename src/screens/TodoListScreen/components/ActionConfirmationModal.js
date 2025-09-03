import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

/**
 * Clean, minimalistic action confirmation modal with fade-in dark overlay
 * Replaces system Alert.alert with a custom, professional design
 */
const ActionConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "#FF3B30",
  icon = "warning-outline",
  iconColor = "#FF9500",
  theme 
}) => {
  // Track internal visibility to manage complete unmounting
  const [internalVisible, setInternalVisible] = React.useState(false);
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.95)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show the modal immediately
      setInternalVisible(true);
      
      // Fade in animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalScale, {
          toValue: 1,
          friction: 8,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (internalVisible) {
      // Fade out animation
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(modalOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(modalScale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Hide the modal completely after animation
        setInternalVisible(false);
      });
    }
  }, [visible, internalVisible]);

  const handleConfirm = () => {
    onConfirm();
    // Small delay to ensure action completes before modal closes
    setTimeout(() => {
      onClose();
    }, 50);
  };

  const handleBackdropPress = () => {
    onClose();
  };

  // Don't render the modal at all when not internally visible to prevent touch interference
  if (!internalVisible) return null;

  return (
    <Modal
      transparent
      visible={internalVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          { 
            opacity: overlayOpacity,
            backgroundColor: theme.dark ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.6)'
          }
        ]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFillObject} 
          activeOpacity={1} 
          onPress={handleBackdropPress}
        />
        
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.cardElevated || (theme.dark ? '#1C1C1E' : '#FFFFFF'),
              opacity: modalOpacity,
              transform: [{ scale: modalScale }]
            }
          ]}
        >
          {/* Icon */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: `${iconColor}20` }
          ]}>
            <Ionicons 
              name={icon} 
              size={28} 
              color={iconColor} 
            />
          </View>

          {/* Title */}
          <Text style={[
            styles.title, 
            { color: theme.text || (theme.dark ? '#FFFFFF' : '#000000') }
          ]}>
            {title}
          </Text>

          {/* Message */}
          <Text style={[
            styles.message, 
            { color: theme.textSecondary || (theme.dark ? '#ACACAC' : '#6B6B6B') }
          ]}>
            {message}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[
                styles.button,
                styles.cancelButton,
                { 
                  backgroundColor: 'transparent',
                  borderColor: theme.border || (theme.dark ? '#3A3A3C' : '#E5E5EA')
                }
              ]} 
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.buttonText, 
                { color: theme.textSecondary || (theme.dark ? '#ACACAC' : '#6B6B6B') }
              ]}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: confirmColor }
              ]} 
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, styles.confirmButtonText]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 320,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  message: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.1,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default ActionConfirmationModal;
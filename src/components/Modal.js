// src/components/Modal.js - OPTIMIZED VERSION
import React from 'react';
import { 
  View, 
  Text, 
  Modal as RNModal, 
  TouchableOpacity, 
  StyleSheet, 
  TouchableWithoutFeedback,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  scaleWidth,
  scaleHeight,
  fontSizes,
  spacing,
  useScreenDimensions,
  accessibility,
  isSmallDevice,
  isTablet
} from '../utils/responsive';

const Modal = ({ 
  visible, 
  onClose, 
  title, 
  children, 
  theme,
  showCloseButton = true,
  closeOnBackdropPress = true,
  fullScreen = false
}) => {
  // Get safe area insets for proper spacing around notches and home indicator
  const insets = useSafeAreaInsets();
  const { width, height } = useScreenDimensions();
  
  // Handle backdrop press
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      onClose();
    }
  };

  // Calculate modal dimensions based on screen size
  const modalWidth = isTablet ? 
    Math.min(scaleWidth(600), width * 0.7) : // Tablet size
    width * 0.9; // Phone size
  
  const modalMaxHeight = height * 0.8;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      accessibilityViewIsModal={true}
    >
      <TouchableWithoutFeedback 
        onPress={handleBackdropPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
        accessibilityHint="Closes the current dialog"
      >
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View 
              style={[
                styles.modalContainer,
                fullScreen ? 
                  [
                    styles.modalFullScreen,
                    {
                      // Apply safe area insets for full-screen modals
                      paddingTop: insets.top,
                      paddingBottom: insets.bottom,
                      paddingLeft: insets.left,
                      paddingRight: insets.right
                    }
                  ] : 
                  [
                    styles.modalCentered,
                    {
                      width: modalWidth,
                      maxHeight: modalMaxHeight
                    }
                  ],
                { backgroundColor: theme?.card || '#fff' }
              ]}
              accessible={true}
              accessibilityRole="dialog"
              accessibilityLabel={title || "Dialog"}
            >
              {title && (
                <View 
                  style={[
                    styles.header,
                    {
                      paddingVertical: spacing.m,
                      paddingHorizontal: spacing.l,
                      borderBottomColor: theme?.border || '#e0e0e0'
                    }
                  ]}
                >
                  <Text 
                    style={[
                      styles.title, 
                      { 
                        color: theme?.text || '#000',
                        fontSize: fontSizes.l,
                      }
                    ]}
                    maxFontSizeMultiplier={1.3}
                    numberOfLines={2}
                  >
                    {title}
                  </Text>
                  
                  {showCloseButton && (
                    <TouchableOpacity
                      style={[
                        styles.closeButton,
                        {
                          padding: spacing.xs,
                          minWidth: accessibility.minTouchTarget,
                          minHeight: accessibility.minTouchTarget
                        }
                      ]}
                      onPress={onClose}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Close"
                      accessibilityHint="Closes this dialog"
                    >
                      <Ionicons 
                        name="close" 
                        size={scaleWidth(24)} 
                        color={theme?.textSecondary || '#757575'} 
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
              
              <View 
                style={[
                  styles.content,
                  { padding: spacing.l }
                ]}
              >
                {children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    borderRadius: scaleWidth(12),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: scaleHeight(2) },
        shadowOpacity: 0.25,
        shadowRadius: scaleWidth(3.84),
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalCentered: {
    // Width and maxHeight set dynamically
  },
  modalFullScreen: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flex: 1,
    fontWeight: '600',
  },
  closeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    // Padding set dynamically
  },
});

export default Modal;
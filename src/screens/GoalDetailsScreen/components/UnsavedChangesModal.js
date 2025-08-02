// src/screens/GoalDetailsScreen/components/UnsavedChangesModal.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTextColorForBackground } from '../utils/colorUtils';

const UnsavedChangesModal = ({
  visible,
  theme,
  selectedColor,
  onCancel,
  onDiscard,
  onSave
}) => {
  // Animation for modal entrance
  const [scaleAnim] = React.useState(new Animated.Value(0.8));
  const [opacityAnim] = React.useState(new Animated.Value(0));
  
  // Update animation when visibility changes
  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      opacityAnim.setValue(0);
    }
  }, [visible, scaleAnim, opacityAnim]);
  
  // Get appropriate text color based on background
  const getSaveButtonTextColor = () => {
    if (selectedColor === '#FFFFFF') return '#000000';
    return getTextColorForBackground(selectedColor);
  };
  
  if (!visible) return null;
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <Animated.View 
          style={[
            styles.confirmModalContainer, 
            { 
              backgroundColor: theme.card,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim
            }
          ]}
        >
          <View style={styles.confirmModalContent}>
            <View style={[
              styles.iconCircle, 
              { backgroundColor: theme.warningLight }
            ]}>
              <Ionicons 
                name="warning-outline" 
                size={40} 
                color={theme.warning} 
                style={styles.confirmModalIcon} 
              />
            </View>
            
            <Text style={[styles.confirmModalTitle, { color: theme.text }]}>
              Unsaved Changes
            </Text>
            
            <Text style={[styles.confirmModalMessage, { color: theme.textSecondary }]}>
              You have unsaved changes. Would you like to save your changes or discard them?
            </Text>
            
            <View style={styles.confirmModalButtons}>
              <TouchableOpacity 
                style={[
                  styles.confirmModalButton, 
                  styles.confirmModalButtonSecondary, 
                  { 
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundSecondary
                  }
                ]} 
                onPress={onCancel}
              >
                <Text style={[
                  styles.confirmModalButtonText, 
                  { color: theme.textSecondary }
                ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.confirmModalButton, 
                  styles.confirmModalButtonDanger, 
                  { 
                    backgroundColor: theme.errorLight,
                    borderColor: theme.error
                  }
                ]} 
                onPress={onDiscard}
              >
                <Text style={[
                  styles.confirmModalButtonText, 
                  { color: theme.error }
                ]}>
                  Discard
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.confirmModalButton, 
                  styles.confirmModalButtonPrimary, 
                  { 
                    backgroundColor: selectedColor,
                    // Special handling for black color on dark theme
                    borderWidth: (selectedColor === '#000000' && theme.dark) ? 1 : 0,
                    borderColor: 'rgba(255,255,255,0.3)'
                  }
                ]} 
                onPress={onSave}
              >
                <Text style={[
                  styles.confirmModalButtonText, 
                  { color: getSaveButtonTextColor() }
                ]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmModalContainer: {
    margin: 20,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
    width: '90%',
    maxWidth: 400,
  },
  confirmModalContent: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  confirmModalIcon: {
    
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  confirmModalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 24,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    height: 45, // Fixed height for layout stability
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  confirmModalButtonSecondary: {
    borderWidth: 1,
  },
  confirmModalButtonDanger: {
    borderWidth: 1,
  },
  confirmModalButtonPrimary: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  confirmModalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
};

export default UnsavedChangesModal;
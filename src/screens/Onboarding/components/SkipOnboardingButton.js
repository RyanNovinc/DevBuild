// src/screens/Onboarding/components/SkipOnboardingButton.js
import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Alert,
  View,
  Modal,
  Pressable,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { scale } from '../styles/onboardingStyles';
import ResponsiveText from './ResponsiveText';
import { getAccessibilityProps } from '../utils/accessibility';

/**
 * SkipOnboardingButton - A subtle button to skip the onboarding process
 * 
 * @param {function} onSkip - Function to handle skipping onboarding
 * @param {object} style - Additional styles for the button container
 */
const SkipOnboardingButton = ({ onSkip, style }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Show the confirmation modal
  const handlePress = () => {
    setShowConfirmation(true);
    
    // Animate the modal in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  // Hide the confirmation modal
  const handleCancel = () => {
    // Animate the modal out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowConfirmation(false);
    });
  };
  
  // Handle skip confirmation
  const handleConfirmSkip = () => {
    // Hide the modal first
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowConfirmation(false);
      // Then call the skip function
      if (onSkip) onSkip();
    });
  };
  
  return (
    <>
      <TouchableOpacity
        style={[styles.skipButton, style]}
        onPress={handlePress}
        {...getAccessibilityProps({
          label: "Skip onboarding",
          hint: "Skip the onboarding process and go directly to the app",
          role: "button"
        })}
      >
        <ResponsiveText style={styles.skipText}>Skip</ResponsiveText>
      </TouchableOpacity>
      
      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: fadeAnim }
          ]}
        >
          <Pressable 
            style={styles.modalBackground}
            onPress={handleCancel}
          />
          
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                opacity: fadeAnim,
                transform: [{
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1]
                  })
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="alert-circle" size={28} color="#f59e0b" />
              <ResponsiveText style={styles.modalTitle}>
                Skip Onboarding?
              </ResponsiveText>
            </View>
            
            <ResponsiveText style={styles.modalText}>
              The onboarding process helps you set up your strategic framework. Are you sure you want to skip it?
            </ResponsiveText>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <ResponsiveText style={styles.cancelButtonText}>
                  Continue Onboarding
                </ResponsiveText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.skipConfirmButton}
                onPress={handleConfirmSkip}
              >
                <ResponsiveText style={styles.skipConfirmText}>
                  Skip
                </ResponsiveText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  skipButton: {
    position: 'absolute',
    top: 10,
    right: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
  skipText: {
    color: '#AAAAAA',
    fontSize: scale(14),
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  modalText: {
    fontSize: scale(15),
    color: '#DDDDDD',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: scale(14),
    fontWeight: '500',
  },
  skipConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f59e0b',
    alignItems: 'center',
  },
  skipConfirmText: {
    color: '#000000',
    fontSize: scale(14),
    fontWeight: '600',
  },
});

export default SkipOnboardingButton;
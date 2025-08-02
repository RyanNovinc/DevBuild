// src/components/UpdateLifeDirectionModal.js
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
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const UpdateLifeDirectionModal = ({
  visible,
  onClose,
  onSave,
  currentLifeDirection
}) => {
  const { theme } = useTheme();
  const [lifeDirection, setLifeDirection] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  const MAX_CHARS = 250; // Maximum character limit
  
  // Modal animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Handle modal animation
  useEffect(() => {
    if (visible) {
      // Reset animation values
      fadeAnim.setValue(0);
      slideAnim.setValue(Dimensions.get('window').height);
      translateY.setValue(0);
      
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)
        })
      ]).start();
    }
  }, [visible]);
  
  // Initialize with current life direction when modal opens
  useEffect(() => {
    if (visible) {
      if (currentLifeDirection) {
        setLifeDirection(currentLifeDirection);
        setCharacterCount(currentLifeDirection.length);
      } else {
        // Reset to empty if no current life direction is provided
        setLifeDirection('');
        setCharacterCount(0);
      }
    }
  }, [visible, currentLifeDirection]);

  // Update character count when text changes
  const handleTextChange = (text) => {
    if (text.length <= MAX_CHARS) {
      setLifeDirection(text);
      setCharacterCount(text.length);
    }
  };

  // Handle save
  const handleSave = () => {
    if (!lifeDirection.trim()) {
      Alert.alert(
        "Cannot Save Empty Direction",
        "Please enter your strategic direction statement.",
        [{ text: "OK" }]
      );
      return;
    }

    onSave(lifeDirection.trim());
  };

  // Handle swipe gesture
  const handleGestureEnd = (event) => {
    const { translationY, velocityY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    const dismissThreshold = screenHeight * 0.2;
    const fastSwipeVelocity = 1200;
    
    const shouldDismiss = translationY > dismissThreshold || velocityY > fastSwipeVelocity;
    
    if (shouldDismiss) {
      // Animate dismiss
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: 250,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease)
        })
      ]).start(() => {
        setLifeDirection(currentLifeDirection || '');
        setCharacterCount(currentLifeDirection ? currentLifeDirection.length : 0);
        onClose();
      });
    } else {
      // Bounce back
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8
      }).start();
    }
  };
  
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: translateY } }],
    { useNativeDriver: true }
  );
  
  // Dismiss keyboard when clicking outside inputs
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  // Reset when closing with animation
  const handleClose = () => {
    const screenHeight = Dimensions.get('window').height;
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      }),
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease)
      })
    ]).start(() => {
      setLifeDirection(currentLifeDirection || '');
      setCharacterCount(currentLifeDirection ? currentLifeDirection.length : 0);
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[
          styles.overlay,
          {
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlayTouchable} />
        </TouchableWithoutFeedback>
        
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) {
              handleGestureEnd(event);
            }
          }}
        >
          <Animated.View
            style={[
              styles.gestureContainer,
              {
                transform: [
                  { translateY: Animated.add(slideAnim, translateY) }
                ]
              }
            ]}
          >
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
              >
                <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                  {/* Swipe indicator */}
                  <View style={[
                    styles.swipeIndicator,
                    { backgroundColor: theme.textSecondary + '40' }
                  ]} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Update Strategic Direction
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <View style={styles.infoCard}>
                <Ionicons name="compass" size={24} color={theme.primary} style={styles.infoIcon} />
                <Text style={[styles.infoText, { color: theme.text }]}>
                  Your strategic direction statement guides your goals and priorities. What's your purpose? What matters most to you?
                </Text>
              </View>

              <Text style={[styles.label, { color: theme.textSecondary }]}>
                Your Strategic Direction Statement:
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.border
                  }
                ]}
                value={lifeDirection}
                onChangeText={handleTextChange}
                placeholder="e.g., To live with purpose and create positive impact..."
                placeholderTextColor={theme.textSecondary}
                multiline={true}
                numberOfLines={5}
                maxLength={MAX_CHARS}
              />
              
              <Text style={[styles.characterCount, { 
                color: characterCount >= MAX_CHARS * 0.9 ? theme.error : theme.textSecondary 
              }]}>
                {characterCount}/{MAX_CHARS} characters
              </Text>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  Save Strategic Direction
                </Text>
              </TouchableOpacity>
            </ScrollView>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </Animated.View>
        </PanGestureHandler>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  overlayTouchable: {
    flex: 1
  },
  gestureContainer: {
    justifyContent: 'flex-end'
  },
  keyboardContainer: {
    justifyContent: 'flex-end'
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    height: '78%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  closeButton: {
    padding: 4
  },
  formContainer: {
    marginBottom: 0
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16
  },
  infoIcon: {
    marginRight: 12
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
    minHeight: 100,
    textAlignVertical: 'top'
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 16
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default UpdateLifeDirectionModal;
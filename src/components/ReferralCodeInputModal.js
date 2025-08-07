// src/components/ReferralCodeInputModal.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import referralBackendService from '../services/ReferralBackendService';

const ReferralCodeInputModal = ({ visible, onClose, theme, onSuccess }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const lockTimer = useRef(null);

  useEffect(() => {
    if (visible) {
      loadAttemptData();
      showModal();
    } else {
      hideModal();
    }

    return () => {
      if (lockTimer.current) {
        clearInterval(lockTimer.current);
      }
    };
  }, [visible]);

  const showModal = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 120,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
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
  };

  const loadAttemptData = async () => {
    try {
      const attemptDataStr = await AsyncStorage.getItem('referralCodeAttempts');
      if (attemptDataStr) {
        const attemptData = JSON.parse(attemptDataStr);
        const currentTime = Date.now();
        
        if (attemptData.lockedUntil && currentTime < attemptData.lockedUntil) {
          // Still locked
          setIsLocked(true);
          setAttempts(3);
          setLockTimeRemaining(Math.ceil((attemptData.lockedUntil - currentTime) / 1000));
          startLockTimer(attemptData.lockedUntil);
        } else if (attemptData.lockedUntil && currentTime >= attemptData.lockedUntil) {
          // Lock expired, reset attempts
          setAttempts(0);
          setIsLocked(false);
          await AsyncStorage.removeItem('referralCodeAttempts');
        } else {
          // No lock, just set attempts
          setAttempts(attemptData.count || 0);
        }
      }
    } catch (error) {
      console.error('Error loading attempt data:', error);
    }
  };

  const startLockTimer = (lockedUntil) => {
    if (lockTimer.current) {
      clearInterval(lockTimer.current);
    }

    lockTimer.current = setInterval(() => {
      const currentTime = Date.now();
      const remaining = Math.ceil((lockedUntil - currentTime) / 1000);
      
      if (remaining <= 0) {
        setIsLocked(false);
        setAttempts(0);
        setLockTimeRemaining(0);
        AsyncStorage.removeItem('referralCodeAttempts');
        clearInterval(lockTimer.current);
      } else {
        setLockTimeRemaining(remaining);
      }
    }, 1000);
  };

  const validateCodeFormat = (inputCode) => {
    // Basic validation: 4-12 characters, alphanumeric + dashes
    const codePattern = /^[A-Za-z0-9-]{4,12}$/;
    return codePattern.test(inputCode);
  };

  const handleSubmit = async () => {
    if (isLocked) return;
    
    const trimmedCode = code.trim().toUpperCase();
    setError('');

    // Client-side validation first
    if (!trimmedCode) {
      setError('Please enter a referral code');
      return;
    }

    if (!validateCodeFormat(trimmedCode)) {
      setError('Code must be 4-12 characters (letters, numbers, dashes only)');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // Check connectivity first
      const connectivity = await referralBackendService.checkConnectivity();
      if (!connectivity) {
        setError('Please check your internet connection');
        setIsLoading(false);
        return;
      }

      // Validate code with backend
      const validation = await referralBackendService.validateReferralCode(trimmedCode);
      const isValidCode = validation.isValid;
      
      if (isValidCode) {
        // Success! Store the code and sync with backend
        await AsyncStorage.setItem('enteredReferralCode', trimmedCode);
        await AsyncStorage.setItem('hasEnteredReferralCode', 'true');
        await AsyncStorage.removeItem('referralCodeAttempts'); // Clear attempts on success
        
        // Sync the referral code with backend
        try {
          await referralBackendService.syncReferralCode(trimmedCode);
        } catch (syncError) {
          console.error('Error syncing referral code to backend:', syncError);
          // Don't fail the process if sync fails - it can be retried later
        }
        
        setIsLoading(false);
        onSuccess?.(trimmedCode);
        onClose();
        
        Alert.alert(
          'Success! 🎉',
          'Referral code saved! You\'ll get 50% off your first AI plan after upgrading to Pro. The person who referred you will also get 50% off!',
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        // Invalid code - use error message from backend or generic message
        const errorMessage = validation.error || 'Invalid referral code';
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= 3) {
          // Lock for 5 minutes
          const lockUntil = Date.now() + (5 * 60 * 1000);
          await AsyncStorage.setItem('referralCodeAttempts', JSON.stringify({
            count: newAttempts,
            lockedUntil: lockUntil
          }));
          
          setIsLocked(true);
          setLockTimeRemaining(300); // 5 minutes
          startLockTimer(lockUntil);
          setError('Too many failed attempts. Try again in 5 minutes.');
        } else {
          await AsyncStorage.setItem('referralCodeAttempts', JSON.stringify({
            count: newAttempts
          }));
          setError(`${errorMessage}. ${3 - newAttempts} attempts remaining.`);
        }
      }
      
    } catch (error) {
      console.error('Error validating referral code:', error);
      setError('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  const formatLockTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View 
        style={[styles.overlay, { opacity: fadeAnim }]}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleClose}
        />
        
        <Animated.View 
          style={[
            styles.modal, 
            { 
              backgroundColor: theme.card,
              borderColor: theme.border,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: '#4CAF5020' }]}>
              <Ionicons name="ticket-outline" size={24} color="#4CAF50" />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              Enter Referral Code
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Get 50% off your first AI plan after upgrading to Pro
            </Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.background,
                  borderColor: error ? '#FF5252' : theme.border,
                  color: theme.text
                }
              ]}
              value={code}
              onChangeText={setCode}
              placeholder="Enter referral code"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={12}
              editable={!isLocked && !isLoading}
            />
            
            {error ? (
              <Text style={[styles.errorText, { color: '#FF5252' }]}>
                {error}
              </Text>
            ) : null}

            {isLocked && (
              <Text style={[styles.lockText, { color: '#FF9800' }]}>
                🔒 Try again in {formatLockTime(lockTimeRemaining)}
              </Text>
            )}

            {!isLocked && attempts > 0 && (
              <Text style={[styles.attemptText, { color: theme.textSecondary }]}>
                Attempts: {attempts}/3
              </Text>
            )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonSection}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button, 
                styles.submitButton,
                { 
                  backgroundColor: isLocked || isLoading ? '#CCCCCC' : '#4CAF50',
                  opacity: isLocked || isLoading ? 0.5 : 1
                }
              ]}
              onPress={handleSubmit}
              disabled={isLocked || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>
                  Submit
                </Text>
              )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modal: {
    width: '85%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  lockText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  attemptText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReferralCodeInputModal;
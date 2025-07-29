// src/screens/Onboarding/components/AISignupScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../styles/onboardingStyles';
import ResponsiveText from './ResponsiveText';
import { getAccessibilityProps } from '../utils/accessibility';
import { isLowEndDevice, useOrientation } from '../utils/deviceUtils';
import { ensureContrast } from '../utils/contrastUtils';
import { t } from '../utils/i18n';

/**
 * AISignupScreen - Presented after the founder badge to incentivize AI account creation
 * Enhanced with accessibility, responsive text, and performance optimizations
 * 
 * @param {boolean} isNavigating - Whether navigation is in progress
 * @param {function} onContinue - Function to call when continuing to the tutorial
 * @param {function} onSkip - Function to call when skipping signup
 */
const AISignupScreen = ({ isNavigating, onContinue, onSkip }) => {
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [currentFocus, setCurrentFocus] = useState(null);
  
  // Get orientation for responsive layout
  const { orientation } = useOrientation();
  
  // Detect if device is low-end for performance optimizations
  const isLowEnd = isLowEndDevice();
  
  // Refs for inputs
  const nameInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // Benefits animation values
  const benefitsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Entrance animation
  useEffect(() => {
    if (isLowEnd) {
      // Simple animation for low-end devices
      fadeAnim.setValue(1);
      slideAnim.setValue(0);
      
      // Set benefits visible immediately
      benefitsAnim.forEach(anim => anim.setValue(1));
    } else {
      // Full animation sequence for modern devices
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true
        })
      ]).start();
      
      // Staggered animation for benefits
      Animated.stagger(200, [
        Animated.timing(benefitsAnim[0], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(benefitsAnim[1], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.timing(benefitsAnim[2], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        })
      ]).start();
    }
  }, [isLowEnd]);
  
  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Validate password strength
  const isStrongPassword = (password) => {
    return password.length >= 8;
  };
  
  // Check if form is valid for submission
  const isFormValid = () => {
    return isValidEmail(email) && isStrongPassword(password);
  };
  
  // This is a placeholder function since this is just for show
  const handleSignup = () => {
    if (!isFormValid()) return;
    
    // Provide haptic feedback (on iOS)
    if (Platform.OS === 'ios') {
      // In a real implementation, we would add haptic feedback here
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      if (onContinue) onContinue();
      
      // Announce success to screen readers
      if (Platform.OS === 'ios') {
        // This would use AccessibilityInfo.announceForAccessibility in a real implementation
      }
    }, 1500);
  };
  
  // Handle keyboard "next" button
  const handleInputSubmit = (currentInput) => {
    if (currentInput === 'name' && emailInputRef.current) {
      emailInputRef.current.focus();
    } else if (currentInput === 'email' && passwordInputRef.current) {
      passwordInputRef.current.focus();
    } else if (currentInput === 'password') {
      Keyboard.dismiss();
      if (isFormValid()) {
        handleSignup();
      }
    }
  };
  
  // Handle skip button press
  const handleSkip = () => {
    // Provide haptic feedback (on iOS)
    if (Platform.OS === 'ios') {
      // In a real implementation, we would add haptic feedback here
    }
    
    if (onSkip) onSkip();
  };
  
  return (
    <SafeAreaView 
      style={styles.container}
      accessible={true}
      accessibilityLabel="AI Premium Account Signup Screen"
      accessibilityRole="none"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Animated.View 
          style={[
            styles.contentContainer, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          <ScrollView 
            contentContainerStyle={[
              styles.scrollContent,
              orientation === 'landscape' && styles.scrollContentLandscape,
              keyboardVisible && styles.scrollContentKeyboardOpen
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View 
              style={[
                styles.headerContainer,
                orientation === 'landscape' && styles.headerContainerLandscape
              ]}
              accessible={true}
              accessibilityRole="header"
            >
              <View 
                style={styles.iconCircle}
                accessible={true}
                accessibilityLabel="AI Premium icon"
                accessibilityRole="image"
              >
                <Ionicons name="sparkles" size={40} color="#FFD700" />
              </View>
              <View style={styles.titleContainer}>
                <ResponsiveText style={styles.title}>
                  Unlock Premium AI
                </ResponsiveText>
                <View 
                  style={styles.freeBadgeContainer}
                  accessible={true}
                  accessibilityLabel="Free badge"
                  accessibilityRole="text"
                >
                  <ResponsiveText style={styles.freeBadgeText}>
                    FREE
                  </ResponsiveText>
                </View>
              </View>
              <ResponsiveText style={styles.subtitle}>
                Sign up now and receive an additional 200 AI tokens to help you achieve your goals
              </ResponsiveText>
            </View>
            
            {/* Token Bonus Banner */}
            <View 
              style={styles.tokenBonusContainer}
              accessible={true}
              accessibilityLabel="Bonus: 200 AI Tokens when you create an account"
              accessibilityRole="text"
            >
              <View style={styles.tokenIconContainer}>
                <Ionicons name="gift-outline" size={24} color="#FFD700" />
              </View>
              <View style={styles.tokenTextContainer}>
                <ResponsiveText style={styles.tokenBonusText}>
                  <ResponsiveText style={styles.tokenHighlight}>+200 AI Tokens</ResponsiveText>
                </ResponsiveText>
                <ResponsiveText style={styles.tokenBonusSubtext}>
                  When you create an account
                </ResponsiveText>
              </View>
            </View>
            
            {/* Form Container */}
            <View 
              style={styles.formContainer}
              accessible={true}
              accessibilityLabel="Account signup form"
              accessibilityRole="form"
            >
              {/* Name Input */}
              <View style={styles.inputGroup}>
                <ResponsiveText 
                  style={styles.inputLabel}
                  accessibilityRole="text"
                >
                  Name (Optional)
                </ResponsiveText>
                <View 
                  style={[
                    styles.inputContainer,
                    currentFocus === 'name' && styles.inputContainerFocused
                  ]}
                >
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color="#AAAAAA" 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    ref={nameInputRef}
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor="#777777"
                    value={displayName}
                    onChangeText={setDisplayName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    onSubmitEditing={() => handleInputSubmit('name')}
                    onFocus={() => setCurrentFocus('name')}
                    onBlur={() => setCurrentFocus(null)}
                    accessibilityLabel="Name input field, optional"
                    accessibilityHint="Enter your name if you wish"
                  />
                </View>
              </View>
              
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <ResponsiveText 
                  style={styles.inputLabel}
                  accessibilityRole="text"
                >
                  Email
                </ResponsiveText>
                <View 
                  style={[
                    styles.inputContainer,
                    currentFocus === 'email' && styles.inputContainerFocused
                  ]}
                >
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color="#AAAAAA" 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    ref={emailInputRef}
                    style={styles.input}
                    placeholder="Your email"
                    placeholderTextColor="#777777"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => handleInputSubmit('email')}
                    onFocus={() => setCurrentFocus('email')}
                    onBlur={() => setCurrentFocus(null)}
                    accessibilityLabel="Email input field, required"
                    accessibilityHint="Enter your email address"
                  />
                </View>
                {email.length > 0 && !isValidEmail(email) && (
                  <ResponsiveText 
                    style={styles.validationError}
                    accessibilityRole="text"
                  >
                    Please enter a valid email address
                  </ResponsiveText>
                )}
              </View>
              
              {/* Password Input */}
              <View style={styles.inputGroup}>
                <ResponsiveText 
                  style={styles.inputLabel}
                  accessibilityRole="text"
                >
                  Password
                </ResponsiveText>
                <View 
                  style={[
                    styles.inputContainer,
                    currentFocus === 'password' && styles.inputContainerFocused
                  ]}
                >
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color="#AAAAAA" 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    ref={passwordInputRef}
                    style={styles.input}
                    placeholder="Choose a password"
                    placeholderTextColor="#777777"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={() => handleInputSubmit('password')}
                    onFocus={() => setCurrentFocus('password')}
                    onBlur={() => setCurrentFocus(null)}
                    accessibilityLabel="Password input field, required"
                    accessibilityHint="Enter a password with at least 8 characters"
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                    {...getAccessibilityProps({
                      label: showPassword ? "Hide password" : "Show password",
                      hint: showPassword ? "Tap to hide password" : "Tap to show password",
                      role: "button"
                    })}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#AAAAAA"
                    />
                  </TouchableOpacity>
                </View>
                {password.length > 0 && !isStrongPassword(password) && (
                  <ResponsiveText 
                    style={styles.validationError}
                    accessibilityRole="text"
                  >
                    Password should be at least 8 characters
                  </ResponsiveText>
                )}
              </View>
              
              {/* Signup Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton, 
                  !isFormValid() && styles.disabledSignupButton,
                  (loading || isNavigating) && styles.disabledButton
                ]}
                onPress={handleSignup}
                disabled={!isFormValid() || loading || isNavigating}
                {...getAccessibilityProps({
                  label: loading ? "Creating account..." : "Create AI Account",
                  hint: !isFormValid() ? "Form is incomplete or has errors" : "Create your AI premium account",
                  role: "button",
                  isDisabled: !isFormValid() || loading || isNavigating,
                  isBusy: loading
                })}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="rocket-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                    <ResponsiveText style={styles.signupButtonText}>
                      Create AI Account
                    </ResponsiveText>
                  </>
                )}
              </TouchableOpacity>
              
              {/* OR Divider */}
              <View 
                style={styles.orDivider}
                accessible={true}
                accessibilityLabel="Or divider"
                accessibilityRole="text"
              >
                <View style={styles.dividerLine} />
                <ResponsiveText style={styles.orText}>OR</ResponsiveText>
                <View style={styles.dividerLine} />
              </View>
              
              {/* Skip Button */}
              <TouchableOpacity
                style={[
                  styles.skipButton,
                  (loading || isNavigating) ? styles.disabledButton : null
                ]}
                onPress={handleSkip}
                disabled={loading || isNavigating}
                {...getAccessibilityProps({
                  label: "Continue Without Account",
                  hint: "Skip account creation and continue to the app",
                  role: "button",
                  isDisabled: loading || isNavigating
                })}
              >
                <Ionicons name="arrow-forward" size={20} color="#FFD700" style={styles.buttonIcon} />
                <ResponsiveText style={styles.skipButtonText}>
                  Continue Without Account
                </ResponsiveText>
              </TouchableOpacity>
            </View>
            
            {/* Benefits Section */}
            <View 
              style={styles.benefitsContainer}
              accessible={true}
              accessibilityLabel="AI Benefits"
              accessibilityRole="list"
            >
              <ResponsiveText 
                style={styles.benefitsTitle}
                accessibilityRole="header"
              >
                AI Benefits
              </ResponsiveText>
              
              {/* Benefit Item 1 */}
              <Animated.View 
                style={[
                  styles.benefitItem,
                  { 
                    opacity: benefitsAnim[0],
                    transform: [
                      { 
                        translateX: benefitsAnim[0].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }
                    ]
                  }
                ]}
                accessibilityRole="listitem"
              >
                <Ionicons name="bulb-outline" size={24} color="#007AFF" />
                <View style={styles.benefitTextContainer}>
                  <ResponsiveText style={styles.benefitTitle}>
                    Smart Suggestions
                  </ResponsiveText>
                  <ResponsiveText 
                    style={styles.benefitDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    Get personalized recommendations for achieving your goals
                  </ResponsiveText>
                </View>
              </Animated.View>
              
              {/* Benefit Item 2 */}
              <Animated.View 
                style={[
                  styles.benefitItem,
                  { 
                    opacity: benefitsAnim[1],
                    transform: [
                      { 
                        translateX: benefitsAnim[1].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }
                    ]
                  }
                ]}
                accessibilityRole="listitem"
              >
                <Ionicons name="time-outline" size={24} color="#007AFF" />
                <View style={styles.benefitTextContainer}>
                  <ResponsiveText style={styles.benefitTitle}>
                    Time Management
                  </ResponsiveText>
                  <ResponsiveText 
                    style={styles.benefitDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    AI-powered scheduling to optimize your productivity
                  </ResponsiveText>
                </View>
              </Animated.View>
              
              {/* Benefit Item 3 */}
              <Animated.View 
                style={[
                  styles.benefitItem,
                  { 
                    opacity: benefitsAnim[2],
                    transform: [
                      { 
                        translateX: benefitsAnim[2].interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0]
                        })
                      }
                    ]
                  }
                ]}
                accessibilityRole="listitem"
              >
                <Ionicons name="analytics-outline" size={24} color="#007AFF" />
                <View style={styles.benefitTextContainer}>
                  <ResponsiveText style={styles.benefitTitle}>
                    Progress Insights
                  </ResponsiveText>
                  <ResponsiveText 
                    style={styles.benefitDescription}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    Track your improvement with advanced analytics
                  </ResponsiveText>
                </View>
              </Animated.View>
            </View>
            
            {/* Privacy Policy */}
            <View 
              style={styles.privacyContainer}
              accessible={true}
              accessibilityLabel="Terms and privacy information"
              accessibilityRole="text"
            >
              <ResponsiveText style={styles.privacyText}>
                By signing up, you agree to our{' '}
                <ResponsiveText 
                  style={styles.privacyLink}
                  accessibilityRole="link"
                >
                  Terms of Service
                </ResponsiveText> and{' '}
                <ResponsiveText 
                  style={styles.privacyLink}
                  accessibilityRole="link"
                >
                  Privacy Policy
                </ResponsiveText>
              </ResponsiveText>
            </View>
            
            {/* Extra space for keyboard */}
            {keyboardVisible && <View style={styles.keyboardSpacer} />}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  scrollContentLandscape: {
    paddingHorizontal: 40,
  },
  scrollContentKeyboardOpen: {
    paddingBottom: 100, // Extra padding when keyboard is open
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerContainerLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: scale(28),
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  freeBadgeContainer: {
    backgroundColor: 'rgba(22, 163, 74, 0.2)',
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 8,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeBadgeText: {
    color: '#16a34a',
    fontSize: scale(12),
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 22,
  },
  tokenBonusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tokenIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  tokenTextContainer: {
    flex: 1,
  },
  tokenBonusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tokenBonusSubtext: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 4,
  },
  tokenHighlight: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  formContainer: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  inputContainerFocused: {
    borderColor: '#2563eb',
    borderWidth: 1,
    backgroundColor: '#1A1A1A',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    paddingVertical: 14,
    paddingRight: 12,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 12,
  },
  validationError: {
    color: '#f87171',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  signupButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledSignupButton: {
    backgroundColor: 'rgba(0, 122, 255, 0.5)', // Lighter blue when disabled
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  orText: {
    color: '#777777',
    marginHorizontal: 10,
    fontSize: 14,
  },
  skipButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  skipButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsContainer: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  benefitTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
  },
  privacyContainer: {
    marginBottom: 24,
  },
  privacyText: {
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  privacyLink: {
    color: '#007AFF',
  },
  keyboardSpacer: {
    height: 100,
  },
});

export default AISignupScreen;
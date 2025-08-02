// src/components/ai/LoginScreen/LoginScreen.js - Fully optimized for responsive design and accessibility
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  AccessibilityInfo
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize,
  fontSizes,
  spacing,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  useIsLandscape,
  useSafeSpacing,
  accessibility,
  ensureAccessibleTouchTarget
} from '../../../utils/responsive';
import { AuthHeader, AuthInput, AuthButton, AuthFooter } from './components';

const LoginScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { login, register, loading } = useAuth();
  const { showSuccess, showError } = useNotification ? useNotification() : {
    showError: (msg) => Alert.alert('Error', msg),
    showSuccess: (msg) => Alert.alert('Success', msg)
  };
  
  // Get landscape orientation
  const isLandscape = useIsLandscape();
  
  // Get safe area insets
  const safeSpacing = useSafeSpacing();
  
  // Track if screen reader is enabled
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  
  // Check screen reader status on mount
  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setScreenReaderEnabled(isEnabled);
    };
    
    checkScreenReader();
    
    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );
    
    return () => {
      // Clean up subscription on unmount
      subscription.remove();
    };
  }, []);
  
  // Debug state to show/hide debug info
  const [showDebug, setShowDebug] = useState(__DEV__);
  
  // Check if we should show registration form directly
  const showRegistrationParam = route?.params?.showRegistration;
  
  // State for form fields and view mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLogin, setIsLogin] = useState(!showRegistrationParam);
  const [showPassword, setShowPassword] = useState(false);
  
  // Local loading state for better UX
  const [localLoading, setLocalLoading] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  
  // Error state for form validation
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [phoneNumberError, setPhoneNumberError] = useState('');
  
  // Watch for navigation params changes
  useEffect(() => {
    if (showRegistrationParam) {
      setIsLogin(false);
    }
  }, [showRegistrationParam]);
  
  // Handle login with simplified flow
  const handleLogin = async () => {
    // Validate login fields
    if (!validateLoginForm()) {
      return;
    }
    
    try {
      console.log(`Attempting to sign in with email: ${email}`);
      setLocalLoading(true);
      
      const success = await login(email, password);
      
      if (!success) {
        showError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError('Login failed. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Validate login form
  const validateLoginForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      } else {
        setEmailError('');
      }
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    return isValid;
  };
  
  // Validate registration form
  const validateRegistrationForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setEmailError('Please enter a valid email address');
        isValid = false;
      } else {
        setEmailError('');
      }
    }
    
    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    // Phone number validation
    if (!phoneNumber) {
      setPhoneNumberError('Phone number is required');
      isValid = false;
    } else {
      setPhoneNumberError('');
    }
    
    return isValid;
  };
  
  // Format phone number to E.164 format (required by AWS Cognito)
  const formatPhoneNumber = (phone) => {
    // Clean the phone number of any non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle different formatting scenarios
    if (cleaned.startsWith('1') && cleaned.length === 11) {
      // Already has US country code
      cleaned = '+' + cleaned;
    } else if (cleaned.length === 10) {
      // Assume US/Canada for 10-digit numbers
      cleaned = '+1' + cleaned;
    } else if (!cleaned.startsWith('+')) {
      // Add + prefix if not present
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  };
  
  // Handle register with simplified flow
  const handleRegister = async () => {
    try {
      // Validate all form fields
      if (!validateRegistrationForm()) {
        return;
      }
      
      // Format phone number for AWS Cognito
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Validate phone number is in proper format
      if (!formattedPhone || !formattedPhone.startsWith('+')) {
        showError('Please enter a valid phone number with country code');
        setPhoneNumberError('Please enter a valid phone number with country code');
        return;
      }
      
      // Show local loading
      setLocalLoading(true);
      
      // Create attributes object
      const attributes = {
        phone_number: formattedPhone,
        name: displayName || email.split('@')[0]
      };
      
      const success = await register(email, password, attributes);
      
      if (success) {
        showSuccess('Registration successful! Please check your email for verification code.');
        setRegistrationSuccess(true);
        
        // Navigate to verification screen
        navigation.navigate('Verification', { email });
      } else {
        showError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      showError(`Registration failed: ${error.message || 'Please try again.'}`);
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Toggle between login and register
  const toggleMode = () => {
    // Clear sensitive fields and errors when switching modes
    setPassword('');
    setConfirmPassword('');
    setPhoneNumber('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setPhoneNumberError('');
    
    // Toggle the mode
    setIsLogin(!isLogin);
  };
  
  // Handle forgot password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };
  
  // Handle back (only if we came from another screen)
  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };
  
  // Create responsive styles based on device size and orientation
  const getStyles = () => {
    // Basic container styles with safe area handling
    const containerStyle = {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: safeSpacing.top,
      paddingBottom: safeSpacing.bottom,
      paddingLeft: safeSpacing.left,
      paddingRight: safeSpacing.right
    };
    
    // Adjust layout for landscape orientation
    const scrollContentStyle = {
      flexGrow: 1,
      paddingHorizontal: isLandscape ? spacing.xl : spacing.m,
      paddingBottom: spacing.xl,
      // In landscape, we want to adjust the content for better layout
      ...(isLandscape && {
        flexDirection: isTablet ? 'row' : 'column',
        justifyContent: 'center',
        alignItems: 'center'
      })
    };
    
    // Form container with adaptive width based on device size and orientation
    const formContainerStyle = {
      backgroundColor: theme.card,
      borderRadius: scaleWidth(16),
      padding: isSmallDevice ? spacing.m : spacing.l,
      marginTop: isLandscape ? spacing.s : spacing.l,
      width: isLandscape ? 
        (isTablet ? '45%' : isSmallDevice ? '95%' : '70%') : 
        '100%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3
    };
    
    // Title styles
    const titleStyle = {
      fontSize: isTablet ? fontSizes.xxl : fontSizes.xl,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: spacing.m,
      textAlign: 'center'
    };
    
    // Input group styles
    const inputGroupStyle = {
      marginBottom: spacing.m
    };
    
    // Input label styles
    const inputLabelStyle = {
      fontSize: fontSizes.s,
      color: theme.textSecondary,
      marginBottom: spacing.xs,
      fontWeight: '500'
    };
    
    // Error text styles
    const errorTextStyle = {
      color: theme.error || '#FF3B30',
      fontSize: fontSizes.xs,
      marginTop: spacing.xxs,
      marginLeft: spacing.xs
    };
    
    // Helper text styles
    const helperTextStyle = {
      fontSize: fontSizes.xs,
      color: theme.textSecondary,
      marginTop: spacing.xxs,
      marginLeft: spacing.xs
    };
    
    // Forgot password container
    const forgotPasswordStyle = {
      alignSelf: 'flex-end',
      marginBottom: spacing.m,
      minHeight: accessibility.minTouchTarget,
      justifyContent: 'center',
      paddingHorizontal: spacing.xs
    };
    
    // Forgot password text
    const forgotPasswordTextStyle = {
      fontSize: fontSizes.s,
      color: theme.primary,
      fontWeight: '500'
    };
    
    // Mode toggle container
    const modeToggleContainerStyle = {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.m
    };
    
    // Mode toggle text
    const modeToggleTextStyle = {
      fontSize: fontSizes.s,
      color: theme.textSecondary
    };
    
    // Mode toggle button
    const modeToggleButtonStyle = {
      fontSize: fontSizes.s,
      color: theme.primary,
      fontWeight: '600',
      marginLeft: spacing.xs,
      padding: spacing.xs
    };
    
    // Debug toggle button
    const debugToggleStyle = {
      alignSelf: 'center',
      padding: spacing.xs,
      marginTop: spacing.l,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: scaleWidth(8)
    };
    
    // Debug container
    const debugContainerStyle = {
      backgroundColor: theme.card,
      padding: spacing.m,
      borderRadius: scaleWidth(12),
      marginBottom: spacing.m
    };
    
    // Debug title
    const debugTitleStyle = {
      fontSize: fontSizes.m,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: spacing.xs
    };
    
    // Debug text
    const debugTextStyle = {
      fontSize: fontSizes.xs,
      color: theme.textSecondary,
      marginBottom: spacing.xs
    };
    
    // Debug button
    const debugButtonStyle = {
      backgroundColor: theme.primary + '50',
      padding: spacing.s,
      borderRadius: scaleWidth(8),
      alignItems: 'center',
      marginTop: spacing.s
    };
    
    // Success container styles
    const successContainerStyle = {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl
    };
    
    // Success icon styles
    const successIconStyle = {
      marginBottom: spacing.l
    };
    
    // Success title styles
    const successTitleStyle = {
      fontSize: fontSizes.xl,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: spacing.m
    };
    
    // Success message styles
    const successMessageStyle = {
      fontSize: fontSizes.m,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: scaleFontSize(22)
    };
    
    // Back button container
    const backButtonContainerStyle = {
      position: 'absolute',
      top: spacing.m,
      left: spacing.m,
      zIndex: 10
    };
    
    // Back button
    const backButtonStyle = {
      ...ensureAccessibleTouchTarget({
        width: scaleWidth(40),
        height: scaleWidth(40)
      }),
      justifyContent: 'center',
      alignItems: 'center'
    };
    
    return {
      container: containerStyle,
      scrollContent: scrollContentStyle,
      formContainer: formContainerStyle,
      title: titleStyle,
      inputGroup: inputGroupStyle,
      inputLabel: inputLabelStyle,
      errorText: errorTextStyle,
      helperText: helperTextStyle,
      forgotPassword: forgotPasswordStyle,
      forgotPasswordText: forgotPasswordTextStyle,
      modeToggleContainer: modeToggleContainerStyle,
      modeToggleText: modeToggleTextStyle,
      modeToggleButton: modeToggleButtonStyle,
      debugToggle: debugToggleStyle,
      debugContainer: debugContainerStyle,
      debugTitle: debugTitleStyle,
      debugText: debugTextStyle,
      debugButton: debugButtonStyle,
      successContainer: successContainerStyle,
      successIcon: successIconStyle,
      successTitle: successTitleStyle,
      successMessage: successMessageStyle,
      backButtonContainer: backButtonContainerStyle,
      backButton: backButtonStyle,
      keyboardAvoidingView: {
        flex: 1
      }
    };
  };
  
  // Get the styles
  const styles = getStyles();
  
  // Create accessibility props for buttons and interactive elements
  const getAccessibilityProps = (role, label, hint) => {
    return {
      accessible: true,
      accessibilityRole: role,
      accessibilityLabel: label,
      accessibilityHint: hint
    };
  };
  
  // Render success screen
  if (registrationSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <Ionicons 
              name="checkmark-circle" 
              size={scaleWidth(80)} 
              color={theme.primary} 
              style={styles.successIcon} 
            />
            <Text 
              style={styles.successTitle}
              maxFontSizeMultiplier={1.8}
              {...getAccessibilityProps('header', 'Registration Successful', null)}
            >
              Registration Successful!
            </Text>
            <Text 
              style={styles.successMessage}
              maxFontSizeMultiplier={1.8}
              {...getAccessibilityProps('text', 'Verification instructions', null)}
            >
              We've sent a verification code to your email. You'll need to verify your account before logging in.
            </Text>
            <AuthButton
              title="Continue to Verification"
              onPress={() => {
                navigation.navigate('Verification', { email });
                setRegistrationSuccess(false);
              }}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={isSmallDevice ? scaleHeight(40) : scaleHeight(80)}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Add back button if we navigated here from another screen */}
          {route?.params && (
            <View style={styles.backButtonContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                {...getAccessibilityProps('button', 'Go back', 'Returns to previous screen')}
              >
                <Ionicons name="arrow-back" size={scaleWidth(24)} color={theme.text} />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Debug Info */}
          {showDebug && (
            <View style={styles.debugContainer}>
              <Text 
                style={styles.debugTitle}
                maxFontSizeMultiplier={1.5}
              >
                Debug Info
              </Text>
              <Text 
                style={styles.debugText}
                maxFontSizeMultiplier={1.5}
              >
                Auth Mode: {isLogin ? 'Login' : 'Register'}
              </Text>
              <Text 
                style={styles.debugText}
                maxFontSizeMultiplier={1.5}
              >
                Loading State: {loading || localLoading ? 'Loading' : 'Ready'}
              </Text>
              {registrationResult && (
                <View>
                  <Text 
                    style={styles.debugTitle}
                    maxFontSizeMultiplier={1.5}
                  >
                    Last Registration Result:
                  </Text>
                  <Text 
                    style={[styles.debugText, { color: registrationResult.success ? 'green' : 'red' }]}
                    maxFontSizeMultiplier={1.5}
                  >
                    {JSON.stringify(registrationResult, null, 2)}
                  </Text>
                </View>
              )}
              
              <TouchableOpacity
                style={styles.debugButton}
                onPress={() => setShowDebug(false)}
                {...getAccessibilityProps('button', 'Hide debug information', null)}
              >
                <Text 
                  style={{ color: theme.text, fontSize: fontSizes.xs }}
                  maxFontSizeMultiplier={1.5}
                >
                  Hide Debug Info
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* App Logo and Header */}
          {(!isLandscape || isTablet) && (
            <AuthHeader 
              title={isLogin ? 'Welcome Back' : 'Create Account'}
              subtitle="Achieve balance across all areas of your life"
            />
          )}
          
          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* Form Title - only show in landscape on tablet */}
            {(isLandscape && isTablet) && (
              <Text 
                style={styles.title}
                maxFontSizeMultiplier={1.5}
                {...getAccessibilityProps('header', isLogin ? 'Welcome Back' : 'Create Account', null)}
              >
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </Text>
            )}
            
            {/* Display Name (Registration only) */}
            {!isLogin && (
              <View 
                style={styles.inputGroup}
                {...getAccessibilityProps('none', null, null)}
              >
                <Text 
                  style={styles.inputLabel}
                  maxFontSizeMultiplier={1.8}
                >
                  Name (Optional)
                </Text>
                <AuthInput
                  icon="person-outline"
                  placeholder="Your name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  autoCapitalize="words"
                  accessibilityLabel="Name field, optional"
                  accessibilityHint="Enter your name"
                />
              </View>
            )}
            
            {/* Email Field */}
            <View 
              style={styles.inputGroup}
              {...getAccessibilityProps('none', null, null)}
            >
              <Text 
                style={styles.inputLabel}
                maxFontSizeMultiplier={1.8}
              >
                Email
              </Text>
              <AuthInput
                icon="mail-outline"
                placeholder="Your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) {
                    // Clear error when typing
                    if (isLogin) {
                      validateLoginForm();
                    } else {
                      validateRegistrationForm();
                    }
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                accessibilityLabel="Email field"
                accessibilityHint="Enter your email address"
              />
              {emailError ? (
                <Text 
                  style={styles.errorText}
                  maxFontSizeMultiplier={1.8}
                  {...getAccessibilityProps('text', `Email error: ${emailError}`, null)}
                >
                  {emailError}
                </Text>
              ) : null}
            </View>
            
            {/* Phone Number (Registration only) */}
            {!isLogin && (
              <View 
                style={styles.inputGroup}
                {...getAccessibilityProps('none', null, null)}
              >
                <Text 
                  style={styles.inputLabel}
                  maxFontSizeMultiplier={1.8}
                >
                  Phone Number
                </Text>
                <AuthInput
                  icon="call-outline"
                  placeholder="Your phone number"
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(text);
                    if (phoneNumberError) validateRegistrationForm();
                  }}
                  keyboardType="phone-pad"
                  accessibilityLabel="Phone number field"
                  accessibilityHint="Enter your phone number"
                />
                {phoneNumberError ? (
                  <Text 
                    style={styles.errorText}
                    maxFontSizeMultiplier={1.8}
                    {...getAccessibilityProps('text', `Phone number error: ${phoneNumberError}`, null)}
                  >
                    {phoneNumberError}
                  </Text>
                ) : null}
                <Text 
                  style={styles.helperText}
                  maxFontSizeMultiplier={1.8}
                >
                  Format: (123) 456-7890 or +1234567890
                </Text>
              </View>
            )}
            
            {/* Password Field */}
            <View 
              style={styles.inputGroup}
              {...getAccessibilityProps('none', null, null)}
            >
              <Text 
                style={styles.inputLabel}
                maxFontSizeMultiplier={1.8}
              >
                Password
              </Text>
              <AuthInput
                icon="lock-closed-outline"
                placeholder="Your password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) {
                    // Clear error when typing
                    if (isLogin) {
                      validateLoginForm();
                    } else {
                      validateRegistrationForm();
                    }
                  }
                }}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                accessibilityLabel="Password field"
                accessibilityHint="Enter your password"
              />
              {passwordError ? (
                <Text 
                  style={styles.errorText}
                  maxFontSizeMultiplier={1.8}
                  {...getAccessibilityProps('text', `Password error: ${passwordError}`, null)}
                >
                  {passwordError}
                </Text>
              ) : null}
              {!isLogin && !passwordError && (
                <Text 
                  style={styles.helperText}
                  maxFontSizeMultiplier={1.8}
                >
                  Password must be at least 8 characters
                </Text>
              )}
            </View>
            
            {/* Confirm Password (Registration only) */}
            {!isLogin && (
              <View 
                style={styles.inputGroup}
                {...getAccessibilityProps('none', null, null)}
              >
                <Text 
                  style={styles.inputLabel}
                  maxFontSizeMultiplier={1.8}
                >
                  Confirm Password
                </Text>
                <AuthInput
                  icon="lock-closed-outline"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (confirmPasswordError) validateRegistrationForm();
                  }}
                  secureTextEntry={!showPassword}
                  accessibilityLabel="Confirm password field"
                  accessibilityHint="Enter your password again"
                />
                {confirmPasswordError ? (
                  <Text 
                    style={styles.errorText}
                    maxFontSizeMultiplier={1.8}
                    {...getAccessibilityProps('text', `Confirm password error: ${confirmPasswordError}`, null)}
                  >
                    {confirmPasswordError}
                  </Text>
                ) : null}
              </View>
            )}
            
            {/* Forgot Password (Login only) */}
            {isLogin && (
              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                {...getAccessibilityProps('button', 'Forgot Password', 'Navigate to password reset')}
              >
                <Text 
                  style={styles.forgotPasswordText}
                  maxFontSizeMultiplier={1.8}
                >
                  Forgot Password?
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Submit Button */}
            <AuthButton
              title={isLogin ? 'Sign In' : 'Create Account'}
              onPress={isLogin ? handleLogin : handleRegister}
              loading={loading || localLoading}
            />
            
            {/* Toggle Auth Mode */}
            <View 
              style={styles.modeToggleContainer}
              {...getAccessibilityProps('none', null, null)}
            >
              <Text 
                style={styles.modeToggleText}
                maxFontSizeMultiplier={1.8}
              >
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity 
                onPress={toggleMode}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                {...getAccessibilityProps('button', isLogin ? 'Sign Up' : 'Sign In', isLogin ? 'Switch to registration form' : 'Switch to login form')}
              >
                <Text 
                  style={styles.modeToggleButton}
                  maxFontSizeMultiplier={1.8}
                >
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Show Debug Button (Dev only) */}
            {__DEV__ && !showDebug && (
              <TouchableOpacity
                style={styles.debugToggle}
                onPress={() => setShowDebug(true)}
                {...getAccessibilityProps('button', 'Show Debug Info', 'Shows developer debugging information')}
              >
                <Text 
                  style={{ color: theme.textSecondary, fontSize: fontSizes.xs }}
                  maxFontSizeMultiplier={1.5}
                >
                  Show Debug Info
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Footer */}
          <AuthFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
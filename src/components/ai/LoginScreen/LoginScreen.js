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
import TermsOfServiceModal from './components/TermsOfServiceModal';
import PrivacyPolicyModal from './components/PrivacyPolicyModal';
import { cognitoDirectService } from './utils/cognito-direct';

const LoginScreen = ({ navigation, route, onLoginSuccess, onClose, embedded = false }) => {
  const { theme } = useTheme();
  const { login, register, loading, mockLogin } = useAuth();
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
  const [showDebug, setShowDebug] = useState(false);
  
  // Check if we should show registration form directly
  const showRegistrationParam = route?.params?.showRegistration;
  
  // State for form fields and view mode
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLogin, setIsLogin] = useState(!showRegistrationParam);
  const [showPassword, setShowPassword] = useState(true); // true = password hidden (secure)
  
  // Terms and Privacy Policy acceptance
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  
  // Modal visibility states
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  
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
  
  // Handle login with comprehensive error handling
  const handleLogin = async () => {
    // Validate login fields
    if (!validateLoginForm()) {
      return;
    }
    
    try {
      console.log(`Attempting to sign in with email: ${email}`);
      setLocalLoading(true);
      
      const success = await login(email, password);
      
      if (success) {
        // Show success message and navigate to success screen
        showSuccess('Login successful! Welcome back.');
        
        if (embedded && onLoginSuccess) {
          // Call the embedded success callback
          onLoginSuccess();
        } else if (navigation && navigation.navigate) {
          // Navigate to login success screen
          navigation.navigate('LoginSuccess', { 
            userName: user?.displayName || email.split('@')[0] 
          });
        }
      } else {
        // This should not happen as login throws errors, but just in case
        showError('Login failed. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Use the auth service to get user-friendly error messages
      const { authService } = require('./utils/auth-service');
      const userFriendlyMessage = authService.getErrorMessage(error);
      showError(userFriendlyMessage);
      
      // Special handling for specific errors
      if (error.code === 'UserNotFoundException') {
        // Suggest they sign up instead
        setTimeout(() => {
          Alert.alert(
            'Account Not Found',
            'Would you like to create a new account with this email?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Sign Up', 
                onPress: () => setIsLogin(false) // Switch to registration mode
              }
            ]
          );
        }, 1000);
      } else if (error.code === 'UserNotConfirmedException') {
        // Navigate to verification screen
        setTimeout(() => {
          navigation.navigate('Verification', { email });
        }, 1000);
      }
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
    
    // Phone number validation (optional now)
    if (phoneNumber && !formatPhoneNumber(phoneNumber)) {
      setPhoneNumberError('Please enter a valid phone number (e.g., 04XX XXX XXX or +1 555 123 4567)');
      isValid = false;
    } else {
      setPhoneNumberError('');
    }
    
    // Terms and Privacy Policy validation
    if (!acceptedTerms) {
      showError('Please accept the Terms of Service to continue');
      isValid = false;
    }
    
    if (!acceptedPrivacy) {
      showError('Please accept the Privacy Policy to continue');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Smart phone number formatting with auto-detection
  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    
    // Clean the phone number of any non-digit characters except +
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    // If it already starts with +, assume it's correctly formatted
    if (cleaned.startsWith('+')) {
      return cleaned;
    }
    
    // Remove any leading zeros or ones
    cleaned = cleaned.replace(/^0+/, '');
    
    // Auto-detect common patterns
    if (cleaned.length === 9 && phone.startsWith('04')) {
      // Australian mobile (04 -> +614)
      return '+614' + cleaned.substring(1);
    } else if (cleaned.length === 10 && phone.startsWith('04')) {
      // Australian mobile with leading 0 (0412345678 -> +61412345678)
      return '+61' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
      // US/Canada 10-digit number
      return '+1' + cleaned;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      // US/Canada with country code
      return '+' + cleaned;
    } else if (cleaned.length >= 8 && cleaned.length <= 15) {
      // International format - just add + if not present
      return '+' + cleaned;
    }
    
    // Return empty string if format not recognized
    return '';
  };
  
  // Handle register with comprehensive error handling
  const handleRegister = async () => {
    try {
      // Validate all form fields
      if (!validateRegistrationForm()) {
        return;
      }
      
      // Format phone number for AWS Cognito
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Validate phone number is in proper format
      if (phoneNumber && (!formattedPhone || !formattedPhone.startsWith('+'))) {
        showError('Please enter a valid phone number (e.g., 04XX XXX XXX or +1 555 123 4567)');
        setPhoneNumberError('Please enter a valid phone number (e.g., 04XX XXX XXX or +1 555 123 4567)');
        return;
      }
      
      // Show local loading
      setLocalLoading(true);
      
      // Create attributes object (only include if provided)
      const attributes = {};
      if (phoneNumber && formattedPhone) {
        attributes.phone_number = formattedPhone;
      }
      
      const success = await register(email, password, attributes);
      
      if (success) {
        showSuccess('Account created successfully! Please check your email for a verification code.');
        setRegistrationSuccess(true);
        
        // Navigate to verification screen after a brief delay
        setTimeout(() => {
          navigation.navigate('Verification', { email });
        }, 1500);
      } else {
        showError('Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Use the auth service to get user-friendly error messages
      const { authService } = require('./utils/auth-service');
      const userFriendlyMessage = authService.getErrorMessage(error);
      showError(userFriendlyMessage);
      
      // Special handling for specific errors
      if (error.code === 'UsernameExistsException') {
        // Suggest they log in instead
        setTimeout(() => {
          Alert.alert(
            'Account Already Exists',
            'An account with this email already exists. Would you like to log in instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Log In', 
                onPress: () => setIsLogin(true) // Switch to login mode
              }
            ]
          );
        }, 1000);
      } else if (error.code === 'InvalidPasswordException') {
        // Focus on password field
        setPasswordError('Password must be at least 8 characters with uppercase, lowercase, and numbers');
      }
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
    
    // Reset terms and privacy acceptance
    setAcceptedTerms(false);
    setAcceptedPrivacy(false);
    
    // Toggle the mode
    setIsLogin(!isLogin);
  };
  
  // Handle forgot password
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  // DEVELOPER TESTING: Mock login handler
  const handleMockLogin = async (userType) => {
    try {
      setLocalLoading(true);
      showSuccess(`Logging in as mock ${userType} user...`);
      
      const success = await mockLogin(userType);
      
      if (success) {
        showSuccess(`Successfully logged in as ${userType} user!`);
        
        if (embedded && onLoginSuccess) {
          // Call the embedded success callback after a short delay
          setTimeout(() => {
            onLoginSuccess();
          }, 1000);
        } else if (navigation && navigation.navigate) {
          // Navigate to login success screen with mock user info
          setTimeout(() => {
            navigation.navigate('LoginSuccess', { 
              userName: userType === 'free' ? 'Test User' : 
                       userType === 'pro' ? 'Pro User' : 'Premium User'
            });
          }, 1000);
        }
      } else {
        showError('Mock login failed');
      }
    } catch (error) {
      showError(`Mock login error: ${error.message}`);
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Handle back - go back if possible, otherwise navigate to main app
  const handleBack = () => {
    if (embedded) {
      // In embedded mode, call the close callback if provided
      if (onClose) {
        onClose();
      }
      return;
    }
    
    if (navigation && navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      // If no previous screen, you might want to navigate to a specific screen
      // For now, we'll just log this case
      console.log('No previous screen to go back to from login');
    }
  };
  
  // Create responsive styles based on device size and orientation
  const getStyles = () => {
    // Basic container styles with reduced top padding for better centering
    const containerStyle = {
      flex: 1,
      backgroundColor: theme.background,
      paddingTop: Math.max(safeSpacing.top * 0.5, 20), // Reduce top padding by half
      paddingBottom: safeSpacing.bottom,
      paddingLeft: safeSpacing.left,
      paddingRight: safeSpacing.right
    };
    
    // Adjust layout for landscape orientation
    const scrollContentStyle = {
      flexGrow: 1,
      paddingHorizontal: isLandscape ? spacing.xl : spacing.m,
      paddingBottom: spacing.xl,
      // Add vertical centering for better positioning
      justifyContent: 'center',
      minHeight: '100%',
      // In landscape, we want to adjust the content for better layout
      ...(isLandscape && {
        flexDirection: isTablet ? 'row' : 'column',
        alignItems: 'center'
      })
    };
    
    // Form container with adaptive width based on device size and orientation
    const formContainerStyle = {
      backgroundColor: theme.card,
      borderRadius: scaleWidth(16),
      padding: isSmallDevice ? spacing.m : spacing.l,
      marginTop: isLandscape ? spacing.xs : spacing.m, // Reduced top margin
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

    // Mock login button styles
    const mockButtonStyle = {
      flex: 1,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xs,
      marginHorizontal: 2,
      borderRadius: scaleWidth(6),
      alignItems: 'center',
      justifyContent: 'center',
    };

    const mockButtonTextStyle = {
      fontSize: fontSizes.xs,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
    };

    // Terms and Privacy Policy styles
    const termsContainerStyle = {
      marginTop: spacing.m,
      marginBottom: spacing.m,
    };

    const checkboxContainerStyle = {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: spacing.s,
    };

    const checkboxStyle = {
      width: 18,
      height: 18,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      marginTop: 2,
    };

    const checkmarkStyle = {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: 'bold',
    };

    const termsTextContainerStyle = {
      flex: 1,
    };

    const termsTextStyle = {
      fontSize: fontSizes.s,
      lineHeight: scaleFontSize(18),
    };

    const termsLinkStyle = {
      textDecorationLine: 'underline',
      fontWeight: '600',
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
      termsContainer: termsContainerStyle,
      checkboxContainer: checkboxContainerStyle,
      checkbox: checkboxStyle,
      checkmark: checkmarkStyle,
      termsTextContainer: termsTextContainerStyle,
      termsText: termsTextStyle,
      termsLink: termsLinkStyle,
      mockButton: mockButtonStyle,
      mockButtonText: mockButtonTextStyle,
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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Add back button to exit login screen */}
          <View style={styles.backButtonContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleBack}
              {...getAccessibilityProps('button', 'Go back', 'Returns to previous screen')}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
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
                  Phone Number (Optional)
                </Text>
                <AuthInput
                  icon="call-outline"
                  placeholder="04 1234 5678 or +1 555 123 4567"
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
                  Australian: 04XX XXX XXX • International: +country code
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
                secureTextEntry={showPassword}
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
                  secureTextEntry={showPassword}
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
            
            {/* Terms and Privacy Policy (Registration only) */}
            {!isLogin && (
              <View style={styles.termsContainer}>
                {/* Terms of Service */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      { 
                        backgroundColor: acceptedTerms ? 'rgba(255,255,255,0.1)' : 'transparent' 
                      }
                    ]}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    accessible={true}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: acceptedTerms }}
                    accessibilityLabel="Accept Terms of Service"
                  >
                    {acceptedTerms && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text 
                        style={styles.termsLink}
                        onPress={() => setShowTermsModal(true)}
                      >
                        Terms of Service
                      </Text>
                    </Text>
                  </View>
                </View>

                {/* Privacy Policy */}
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      { 
                        backgroundColor: acceptedPrivacy ? 'rgba(255,255,255,0.1)' : 'transparent' 
                      }
                    ]}
                    onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                    accessible={true}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: acceptedPrivacy }}
                    accessibilityLabel="Accept Privacy Policy"
                  >
                    {acceptedPrivacy && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text 
                        style={styles.termsLink}
                        onPress={() => setShowPrivacyModal(true)}
                      >
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Submit Button */}
            <AuthButton
              title={isLogin ? 'Sign In' : 'Create Account'}
              onPress={isLogin ? handleLogin : handleRegister}
              loading={loading || localLoading}
            />
            
            {/* Mock Login Buttons - Only for development */}
            {__DEV__ && (
              <View style={{ marginTop: spacing.m }}>
                <Text style={[{ fontSize: fontSizes.s, fontWeight: '600' }, { color: theme.textSecondary, textAlign: 'center', marginBottom: spacing.s }]}>
                  🧪 Mock Login
                </Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.s }}>
                  <TouchableOpacity
                    style={[styles.mockButton, { backgroundColor: '#9E9E9E' }]}
                    onPress={() => handleMockLogin('free')}
                    disabled={loading || localLoading}
                  >
                    <Text style={styles.mockButtonText}>Free User</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.mockButton, { backgroundColor: '#3F51B5' }]}
                    onPress={() => handleMockLogin('pro')}
                    disabled={loading || localLoading}
                  >
                    <Text style={styles.mockButtonText}>Pro User</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.mockButton, { backgroundColor: '#673AB7' }]}
                    onPress={() => handleMockLogin('unlimited')}
                    disabled={loading || localLoading}
                  >
                    <Text style={styles.mockButtonText}>Premium</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
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
            
          </View>
          
          {/* Footer */}
          <AuthFooter 
            onOpenTerms={() => setShowTermsModal(true)}
            onOpenPrivacy={() => setShowPrivacyModal(true)}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      
      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
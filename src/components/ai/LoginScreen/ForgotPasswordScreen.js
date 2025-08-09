// src/components/ai/LoginScreen/ForgotPasswordScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import * as styles from './styles';
import { AuthHeader, AuthInput, AuthButton } from './components';

const ForgotPasswordScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { forgotPassword, loading } = useAuth();
  
  // Import auth service directly to bypass potential context issues
  const { authService } = require('./utils/auth-service');
  const { showSuccess, showError } = useNotification ? useNotification() : {
    showError: (msg) => Alert.alert('Error', msg),
    showSuccess: (msg) => Alert.alert('Success', msg)
  };
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  // AWS should already be configured in App.js - no need to reconfigure
  useEffect(() => {
    console.log('ForgotPasswordScreen mounted - AWS should already be configured');
  }, []);
  
  // Get styles
  const style = styles.createStyles(theme);
  
  // Validate email
  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };
  
  // Handle request password reset
  const handleForgotPassword = async () => {
    if (!validateEmail()) {
      return;
    }
    
    try {
      setLocalLoading(true);
      console.log('Attempting to reset password for:', email);
      
      // Try using auth service directly first, then fallback to context
      let success = false;
      try {
        console.log('Trying direct authService.forgotPassword...');
        success = await authService.forgotPassword(email);
        console.log('Direct authService result:', success);
      } catch (directError) {
        console.log('Direct authService failed, trying context method...', directError.message);
        success = await forgotPassword(email);
        console.log('Context forgotPassword result:', success);
      }
      
      if (success) {
        showSuccess('✅ Password reset email sent! Please check your inbox and spam folder.');
        
        // Navigate to reset password screen after a brief delay
        setTimeout(() => {
          navigation.navigate('ResetPassword', { email });
        }, 2000);
      } else {
        showError('Failed to send reset code. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error details:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code || error.name);
      
      // Use the auth service to get user-friendly error messages
      const { authService } = require('./utils/auth-service');
      const userFriendlyMessage = authService.getErrorMessage(error);
      showError(userFriendlyMessage);
      
      // Special handling for user not found
      if (error.code === 'UserNotFoundException') {
        setTimeout(() => {
          Alert.alert(
            'Account Not Found',
            'No account exists with this email address. Would you like to create a new account?',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Sign Up', 
                onPress: () => navigation.navigate('Login', { showRegistration: true })
              }
            ]
          );
        }, 1000);
      }
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Go back to login screen
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };
  
  return (
    <SafeAreaView style={[style.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={style.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={style.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AuthHeader 
            title="Forgot Password"
            subtitle="We'll send a password reset code to your email"
            icon="mail-outline"
          />
          
          <View style={[style.formContainer, { backgroundColor: theme.card }]}>
            <View style={style.inputGroup}>
              <Text style={[style.inputLabel, { color: theme.textSecondary }]}>Email</Text>
              <AuthInput
                icon="mail-outline"
                placeholder="Your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {emailError ? <Text style={style.errorText}>{emailError}</Text> : null}
            </View>
            
            <AuthButton
              title="Send Reset Code"
              onPress={handleForgotPassword}
              loading={loading || localLoading}
            />
            
            <TouchableOpacity 
              style={style.backLink}
              onPress={navigateToLogin}
            >
              <Ionicons 
                name="arrow-back-outline" 
                size={16} 
                color={theme.primary} 
                style={{ marginRight: 8 }}
              />
              <Text style={[style.backLinkText, { color: theme.primary }]}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
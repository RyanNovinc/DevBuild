// src/components/ai/LoginScreen/ForgotPasswordScreen.js
import React, { useState } from 'react';
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
  const { showSuccess, showError } = useNotification ? useNotification() : {
    showError: (msg) => Alert.alert('Error', msg),
    showSuccess: (msg) => Alert.alert('Success', msg)
  };
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
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
      // Use AWS Cognito to send a reset code
      const success = await forgotPassword(email);
      
      if (success) {
        showSuccess('Password reset code sent to your email');
        // Navigate to reset password screen
        navigation.navigate('ResetPassword', { email });
      } else {
        showError('Failed to send reset code. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showError('Failed to send reset code. Please try again.');
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
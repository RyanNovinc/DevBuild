// src/components/ai/LoginScreen/ResetPasswordScreen.js
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

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email } = route?.params || {};
  const { theme } = useTheme();
  const { resetPassword, loading } = useAuth();
  const { showSuccess, showError } = useNotification ? useNotification() : {
    showError: (msg) => Alert.alert('Error', msg),
    showSuccess: (msg) => Alert.alert('Success', msg)
  };
  
  // State for verification code
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Errors
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // Get styles
  const style = styles.createStyles(theme);
  
  // Validate code
  const validateCode = () => {
    if (!verificationCode) {
      setCodeError('Please enter the verification code');
      return false;
    }
    if (verificationCode.length < 6) {
      setCodeError('Please enter the complete verification code');
      return false;
    }
    setCodeError('');
    return true;
  };
  
  // Validate password
  const validatePassword = () => {
    if (!newPassword) {
      setPasswordError('Password is required');
      return false;
    } else if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };
  
  // Validate confirm password
  const validateConfirmPassword = () => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };
  
  // Handle reset password
  const handleResetPassword = async () => {
    // Validate all fields
    const isCodeValid = validateCode();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();
    
    if (!isCodeValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }
    
    try {
      setLocalLoading(true);
      const success = await resetPassword(email, verificationCode, newPassword);
      
      if (success) {
        showSuccess('Password reset successful');
        setSuccess(true);
      } else {
        showError('Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      showError('Failed to reset password. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Navigate back to login
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };
  
  // Render success screen
  if (success) {
    return (
      <SafeAreaView style={[style.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={style.scrollContent}>
          <View style={style.successContainer}>
            <Ionicons 
              name="checkmark-circle" 
              size={80} 
              color={theme.primary} 
              style={style.successIcon} 
            />
            <Text style={[style.successTitle, { color: theme.text }]}>Password Reset Successful</Text>
            <Text style={[style.successMessage, { color: theme.textSecondary }]}>
              Your password has been reset successfully. You can now log in with your new password.
            </Text>
            <AuthButton
              title="Back to Login"
              onPress={navigateToLogin}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
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
            title="Reset Password"
            subtitle="Enter the verification code sent to your email"
            icon="lock-open-outline"
          />
          
          <View style={[style.formContainer, { backgroundColor: theme.card }]}>
            <Text style={[style.emailText, { color: theme.textSecondary }]}>
              Code sent to: {email}
            </Text>
            
            <View style={style.inputGroup}>
              <Text style={[style.inputLabel, { color: theme.textSecondary }]}>Verification Code</Text>
              <AuthInput
                icon="key-outline"
                placeholder="Enter verification code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              {codeError ? <Text style={style.errorText}>{codeError}</Text> : null}
            </View>
            
            <View style={style.inputGroup}>
              <Text style={[style.inputLabel, { color: theme.textSecondary }]}>New Password</Text>
              <AuthInput
                icon="lock-closed-outline"
                placeholder="New password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />
              {passwordError ? <Text style={style.errorText}>{passwordError}</Text> : null}
            </View>
            
            <View style={style.inputGroup}>
              <Text style={[style.inputLabel, { color: theme.textSecondary }]}>Confirm New Password</Text>
              <AuthInput
                icon="lock-closed-outline"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
              {confirmPasswordError ? <Text style={style.errorText}>{confirmPasswordError}</Text> : null}
            </View>
            
            <AuthButton
              title="Reset Password"
              onPress={handleResetPassword}
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

export default ResetPasswordScreen;
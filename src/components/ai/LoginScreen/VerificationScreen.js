// src/components/ai/LoginScreen/VerificationScreen.js
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

const VerificationScreen = ({ navigation, route }) => {
  const { email } = route?.params || {};
  const { theme } = useTheme();
  const { verifyEmail, resendVerificationCode, login, loading } = useAuth();
  const { showSuccess, showError } = useNotification ? useNotification() : {
    showError: (msg) => Alert.alert('Error', msg),
    showSuccess: (msg) => Alert.alert('Success', msg)
  };
  
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [password, setPassword] = useState(''); // For direct login after verification
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(__DEV__);
  const [verificationResult, setVerificationResult] = useState(null);
  
  // Get styles
  const style = styles.createStyles(theme);
  
  // Validate verification code
  const validateCode = () => {
    if (!code) {
      setCodeError('Verification code is required');
      return false;
    }
    setCodeError('');
    return true;
  };
  
  // Handle verification with simplified flow
  const handleVerification = async () => {
    if (!validateCode()) {
      return;
    }
    
    try {
      setLocalLoading(true);
      
      const success = await verifyEmail(email, code);
      
      setVerificationResult({
        success,
        timestamp: new Date().toISOString()
      });
      
      if (success) {
        showSuccess('Email verified successfully!');
        setVerificationSuccess(true);
        
        // If password is provided, attempt login automatically
        if (password) {
          handleLoginAfterVerification();
        }
      } else {
        showError('Verification failed. Please check your code and try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationResult({
        error: error.message,
        timestamp: new Date().toISOString()
      });
      showError('Verification failed. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Handle login after verification
  const handleLoginAfterVerification = async () => {
    if (!password) {
      return;
    }
    
    try {
      setLocalLoading(true);
      
      const success = await login(email, password);
      
      if (success) {
        showSuccess('Logged in successfully!');
        // Navigation will be handled by AuthContext
      } else {
        showError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error after verification:', error);
      showError('Login failed. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Handle resend verification code
  const handleResendCode = async () => {
    if (!email) {
      showError('Email is required');
      return;
    }
    
    try {
      setLocalLoading(true);
      
      const success = await resendVerificationCode(email);
      
      if (success) {
        showSuccess('Verification code resent successfully!');
      } else {
        showError('Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      console.error('Resend verification code error:', error);
      showError('Failed to resend verification code. Please try again.');
    } finally {
      setLocalLoading(false);
    }
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
            title="Verify Your Account"
            subtitle="Enter the verification code sent to your email"
            icon="shield-checkmark-outline"
          />
          
          {/* Debug Info */}
          {showDebug && (
            <View style={[style.debugContainer, { backgroundColor: theme.card }]}>
              <Text style={[style.debugTitle, { color: theme.text }]}>Debug Info</Text>
              <Text style={[style.debugText, { color: theme.textSecondary }]}>
                Email: {email || 'Not provided'}
              </Text>
              <Text style={[style.debugText, { color: theme.textSecondary }]}>
                Verification Success: {verificationSuccess ? 'Yes' : 'No'}
              </Text>
              <Text style={[style.debugText, { color: theme.textSecondary }]}>
                Loading State: {loading || localLoading ? 'Loading' : 'Ready'}
              </Text>
              {verificationResult && (
                <View>
                  <Text style={[style.debugTitle, { color: theme.text }]}>Last Verification Result:</Text>
                  <Text style={[style.debugText, { color: verificationResult.success ? 'green' : 'red' }]}>
                    {JSON.stringify(verificationResult, null, 2)}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={[style.debugButton, { backgroundColor: theme.primary + '50' }]}
                onPress={() => setShowDebug(false)}
              >
                <Text style={{ color: theme.text }}>Hide Debug Info</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={[style.formContainer, { backgroundColor: theme.card }]}>
            {email && (
              <Text style={[style.emailText, { color: theme.textSecondary }]}>
                Code sent to: {email}
              </Text>
            )}
            
            <View style={style.inputGroup}>
              <Text style={[style.inputLabel, { color: theme.textSecondary }]}>Verification Code</Text>
              <AuthInput
                icon="key-outline"
                placeholder="Enter verification code"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
              />
              {codeError ? <Text style={style.errorText}>{codeError}</Text> : null}
            </View>
            
            {!verificationSuccess && (
              <View style={style.inputGroup}>
                <Text style={[style.inputLabel, { color: theme.textSecondary }]}>
                  Password (to login after verification)
                </Text>
                <AuthInput
                  icon="lock-closed-outline"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={true}
                />
              </View>
            )}
            
            <AuthButton
              title={verificationSuccess ? 'Login Now' : 'Verify Account'}
              onPress={verificationSuccess ? handleLoginAfterVerification : handleVerification}
              loading={loading || localLoading}
            />
            
            {!verificationSuccess && (
              <TouchableOpacity 
                style={style.resendLink}
                onPress={handleResendCode}
                disabled={loading || localLoading}
              >
                <Text style={[style.resendLinkText, { color: theme.primary }]}>
                  Didn't receive a code? Resend
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={style.backLink}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons 
                name="arrow-back-outline" 
                size={16} 
                color={theme.primary} 
                style={{ marginRight: 8 }}
              />
              <Text style={[style.backLinkText, { color: theme.primary }]}>Back to Login</Text>
            </TouchableOpacity>
            
            {/* Show Debug Button (Dev only) */}
            {__DEV__ && !showDebug && (
              <TouchableOpacity
                style={[style.debugToggle, { borderColor: theme.border }]}
                onPress={() => setShowDebug(true)}
              >
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  Show Debug Info
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerificationScreen;
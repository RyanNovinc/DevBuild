// src/components/ai/LoginScreen/index.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import VerificationScreen from './VerificationScreen';
import LoginSuccessScreen from './LoginSuccessScreen';
import { authService } from './utils/auth-service';
import { awsConfig, configureAmplify } from './utils/aws-cognito-config';

// Create a stack navigator for auth screens
const Stack = createStackNavigator();

// Main component that wraps all auth screens with a navigator
const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyle: { backgroundColor: 'transparent' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
      <Stack.Screen name="LoginSuccess" component={LoginSuccessScreen} />
    </Stack.Navigator>
  );
};

// Export all components and services
export {
  LoginScreen,
  ForgotPasswordScreen,
  ResetPasswordScreen,
  VerificationScreen,
  LoginSuccessScreen,
  authService,
  awsConfig,
  configureAmplify
};

// Default export for navigation integration
export default AuthNavigator;
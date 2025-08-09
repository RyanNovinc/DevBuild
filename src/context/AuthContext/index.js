// src/context/AuthContext/index.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// Import auth service - AWS Amplify is already configured in App.js
import { authService } from '../../components/ai/LoginScreen/utils/auth-service';

// Context setup
const AuthContext = createContext({});

// Custom hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Loading timeout ref
  const loadingTimeoutRef = useRef(null);
  
  // AWS Amplify is already initialized in App.js - no need to re-initialize
  
  // Safety mechanism to prevent stuck loading state
  useEffect(() => {
    if (loading) {
      // Clear any existing timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      
      // Set a new timeout to automatically clear loading state after 10 seconds
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Auth loading timeout reached, force resetting loading state');
        setLoading(false);
      }, 10000);
    } else {
      // Clear timeout when loading is false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [loading]);
  
  // Check for existing user session on startup
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        setLoading(true);
        
        // Add a small delay to ensure AWS Amplify is fully initialized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          console.log('User session found:', currentUser.email);
          setUser(currentUser);
          setIsAuthenticated(true);
          
          // Save device token for push notifications if user is authenticated
          saveDeviceToken(currentUser.id);
        } else {
          console.log('No user session found');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    // Start checking user session immediately since AWS is configured in App.js
    checkUserSession();
  }, []);
  
  // Save device token for push notifications
  const saveDeviceToken = async (userId) => {
    try {
      const token = await Notifications.getExpoPushTokenAsync();
      if (token && userId) {
        // Save token to AsyncStorage
        await AsyncStorage.setItem('pushToken', token.data);
        console.log('Device token saved:', token.data);
        
        // TODO: Send token to backend
        // await api.saveDeviceToken(userId, token.data);
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  };
  
  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate input before attempting login
      if (!email || !password) {
        setError('Email and password are required');
        setLoading(false);
        return false;
      }
      
      console.log('Attempting login for:', email);
      const userData = await authService.signIn(email, password);
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        
        // Save device token
        saveDeviceToken(userData.id);
        
        return true;
      } else {
        setError('Login failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(authService.getErrorMessage(error));
      return false;
    } finally {
      console.log('Login attempt completed, resetting loading state');
      setLoading(false);
    }
  };
  
  // Register function
  const register = async (email, password, attributes = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting to register:', email);
      const result = await authService.signUp(email, password, attributes);
      
      if (result && result.userSub) {
        console.log('User registered successfully:', result.userSub);
        
        // Don't log in yet - user needs to verify email first
        // setUser({ id: result.userSub, email, ...attributes });
        // setIsAuthenticated(false);
        
        return true;
      } else {
        setError('Registration failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Register error:', error);
      setError(authService.getErrorMessage(error));
      return false;
    } finally {
      console.log('Registration attempt completed, resetting loading state');
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      await authService.signOut();
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear auth-related items from AsyncStorage
      await AsyncStorage.removeItem('pushToken');
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      setError('Logout failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.forgotPassword(email);
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      setError(authService.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password function
  const resetPassword = async (email, code, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resetPassword(email, code, newPassword);
      return true;
    } catch (error) {
      console.error('Reset password error:', error);
      setError(authService.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Verify email function
  const verifyEmail = async (email, code) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.verifyEmail(email, code);
      return true;
    } catch (error) {
      console.error('Verify email error:', error);
      setError(authService.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Resend verification code function
  const resendVerificationCode = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.resendVerificationCode(email);
      return true;
    } catch (error) {
      console.error('Resend verification code error:', error);
      setError(authService.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Update user attributes
  const updateUserAttributes = async (attributes) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedUser = await authService.updateUserAttributes(attributes);
      
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      } else {
        setError('Failed to update user attributes. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Update user attributes error:', error);
      setError(authService.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      await authService.changePassword(oldPassword, newPassword);
      return true;
    } catch (error) {
      console.error('Change password error:', error);
      setError(authService.getErrorMessage(error));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // DEVELOPER TESTING: Mock login function
  const mockLogin = async (userType = 'free') => {
    try {
      setLoading(true);
      
      // Create mock user data based on user type
      const mockUsers = {
        free: {
          id: 'mock-user-free-123',
          email: 'test.user@example.com',
          displayName: 'Test User',
          phoneNumber: '+1234567890',
          emailVerified: true,
          mockUser: true,
          subscription: 'free'
        },
        pro: {
          id: 'mock-user-pro-456', 
          email: 'pro.user@example.com',
          displayName: 'Pro User',
          phoneNumber: '+1234567890',
          emailVerified: true,
          mockUser: true,
          subscription: 'pro'
        },
        unlimited: {
          id: 'mock-user-unlimited-789',
          email: 'premium.user@example.com', 
          displayName: 'Premium User',
          phoneNumber: '+1234567890',
          emailVerified: true,
          mockUser: true,
          subscription: 'unlimited'
        }
      };

      const mockUser = mockUsers[userType] || mockUsers.free;
      
      console.log('🧪 MOCK LOGIN: Logging in as', userType, 'user');
      
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(mockUser);
      setIsAuthenticated(true);
      setError(null);
      
      return true;
    } catch (error) {
      console.error('Mock login error:', error);
      setError('Mock login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Create the auth context value object
  const authContextValue = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerificationCode,
    updateUserAttributes,
    changePassword,
    mockLogin, // DEVELOPER TESTING: Mock login function
  };
  
  // Provide the auth context to children
  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
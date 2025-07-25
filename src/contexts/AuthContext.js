// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNotification } from '../context/NotificationContext';

// Create context
const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useNotification();

  // Load user data from storage when the component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Simulate a short delay to avoid flash of login screen
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demonstration, accept any email/password
      // In a real app, you would verify credentials with a backend
      const userData = {
        id: '1',
        email,
        displayName: email.split('@')[0], // Use part of email as display name
      };
      
      // Save user to storage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      showSuccess('Login successful');
      
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      showError('Login failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (email, password, displayName) => {
    try {
      setLoading(true);
      
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create user object
      const userData = {
        id: Date.now().toString(),
        email,
        displayName: displayName || email.split('@')[0],
      };
      
      // Save user to storage
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      showSuccess('Account created successfully');
      
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      showError('Registration failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      
      // Remove user from storage
      await AsyncStorage.removeItem('user');
      
      // Clear user state
      setUser(null);
      showSuccess('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      showError('Logout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      // Get current user data
      const userData = await AsyncStorage.getItem('user');
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Update user object
      const currentUser = JSON.parse(userData);
      const updatedUser = { ...currentUser, ...updates };
      
      // Save updated user to storage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      showSuccess('Profile updated successfully');
      
      return true;
    } catch (error) {
      console.error('Profile update failed:', error);
      showError('Profile update failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Create a user object with a mock user for testing if needed
  const createMockUser = async () => {
    if (!user) {
      const mockUser = {
        id: 'mock-user-1',
        email: 'user@example.com',
        displayName: 'Test User',
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  };

  // For development/testing, create a mock user automatically
  useEffect(() => {
    if (!loading && !user) {
      // Uncomment this line to auto-create a mock user for testing
      // createMockUser();
    }
  }, [loading, user]);

  // Context value
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    createMockUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
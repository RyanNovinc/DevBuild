// src/components/AuthWrapper.js
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// CRITICAL FIX: DO NOT re-create an AuthProvider here since we already have one at the root level

/**
 * A wrapper component that passes through children without re-creating AuthProvider
 * Since we have AuthProvider at the root level in App.js, we don't need to create
 * another instance here - this solves the nested context issue.
 */
const AuthWrapper = ({ children }) => {
  // Simply pass through the children without wrapping in AuthProvider
  return children;
};

/**
 * A component that shows a loading indicator while auth is initializing
 */
export const AuthLoadingPlaceholder = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#000" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
  },
});

export default AuthWrapper;
// src/components/ai/AIChat/AILoadingPlaceholder.js - Updated to match ChatGPT's style
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

/**
 * AILoadingPlaceholder - Displays when chat is initializing
 * Styled to match ChatGPT's dark theme
 */
const AILoadingPlaceholder = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#19C37D" />
      <Text style={styles.loadingText}>
        Loading conversation...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#CCCCCC',
  },
});

export default AILoadingPlaceholder;
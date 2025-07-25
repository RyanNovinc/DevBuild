// src/components/ai/AIStatusIndicators/ProgressIndicator.js - Updated to match ChatGPT's style
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * ProgressIndicator - Shows progress when processing multiple actions
 * Styled to match ChatGPT's dark theme
 */
const ProgressIndicator = ({ 
  currentAction = 0, 
  totalActions = 0 
}) => {
  // Only show if there are multiple actions
  if (totalActions <= 1) return null;
  
  const progress = ((currentAction) / totalActions) * 100;
  
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>
        Processing {currentAction + 1} of {totalActions} actions
      </Text>
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progress}%` }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#101010',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#CCCCCC',
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#19C37D', // ChatGPT's green color
  },
});

export default ProgressIndicator;
// src/components/ai/AIStatusIndicators/KnowledgeIndicator.js - Updated to match ChatGPT's style
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * KnowledgeIndicator - Shows when user knowledge files are being used
 * Styled to match ChatGPT's dark theme
 */
const KnowledgeIndicator = ({ count = 0 }) => {
  return (
    <View style={styles.knowledgeIndicator}>
      <Ionicons name="document-text-outline" size={16} color="#19C37D" />
      <Text style={styles.knowledgeIndicatorText}>
        Using {count} document{count !== 1 ? 's' : ''} for personalized responses
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  knowledgeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#101010',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  knowledgeIndicatorText: {
    fontSize: 12,
    marginLeft: 6,
    color: '#CCCCCC',
  },
});

export default KnowledgeIndicator;
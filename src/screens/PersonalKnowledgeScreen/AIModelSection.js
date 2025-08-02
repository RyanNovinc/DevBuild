// src/screens/PersonalKnowledgeScreen/AIModelSection.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AIModelSection = ({ theme, setAiModelExplanationVisible }) => {
  return (
    <View style={styles.aiModelExplanation}>
      <View style={styles.aiModelHeader}>
        <Ionicons name="flash" size={24} color={theme.primary} />
        <Text style={[styles.aiModelTitle, { color: theme.text }]}>
          AI Model Capabilities
        </Text>
        <TouchableOpacity
          style={styles.aiModelInfoButton}
          onPress={() => setAiModelExplanationVisible(true)}
        >
          <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.aiModelDescription, { color: theme.textSecondary }]}>
        Choose the right AI model based on your needs:
      </Text>
      
      <View style={styles.modelUsageTable}>
        <View style={[styles.modelUsageRow, styles.modelUsageHeaderRow]}>
          <Text style={[styles.modelUsageCell, { color: theme.text, fontWeight: 'bold' }]}>Model</Text>
          <Text style={[styles.modelUsageCell, { color: theme.text, fontWeight: 'bold' }]}>Power</Text>
          <Text style={[styles.modelUsageCell, { color: theme.text, fontWeight: 'bold' }]}>Best For</Text>
        </View>
        
        <View style={styles.modelUsageRow}>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Guide AI</Text>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Basic</Text>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Quick tasks</Text>
        </View>
        
        <View style={styles.modelUsageRow}>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Navigator AI</Text>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Enhanced</Text>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Daily planning</Text>
        </View>
        
        <View style={styles.modelUsageRow}>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Compass AI</Text>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Advanced</Text>
          <Text style={[styles.modelUsageCell, { color: theme.text }]}>Complex analysis</Text>
        </View>
      </View>
      
      <Text style={[styles.aiModelNote, { color: theme.textSecondary }]}>
        All AI models can process your documents and app data equally well, but they differ in their reasoning capabilities.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  aiModelExplanation: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  aiModelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  aiModelInfoButton: {
    marginLeft: 'auto',
    padding: 4,
  },
  aiModelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  aiModelDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  modelUsageTable: {
    marginVertical: 8,
  },
  modelUsageRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modelUsageHeaderRow: {
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  modelUsageCell: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  aiModelNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default AIModelSection;
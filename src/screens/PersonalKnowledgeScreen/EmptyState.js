// src/screens/PersonalKnowledgeScreen/EmptyState.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * EmptyState component for when no documents are available
 * @param {Object} props - Component props
 * @param {Object} props.theme - Theme object
 * @param {boolean} props.isLoading - Whether data is loading
 * @param {Function} props.pickDocument - Function to pick a document
 */
const EmptyState = ({ theme, isLoading, pickDocument }) => {
  if (isLoading) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.cardElevated || theme.card }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="document" size={64} color={theme.primary} />
        <View 
          style={[
            styles.plusIconContainer, 
            { backgroundColor: theme.primary }
          ]}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </View>
      </View>
      
      <Text style={[styles.title, { color: theme.text }]}>
        No Documents Yet
      </Text>
      
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        Add documents to provide context to your AI assistant. Your documents will be used to improve the assistant's responses.
      </Text>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={pickDocument}
      >
        <Text style={styles.buttonText}>Add Your First Document</Text>
        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
      </TouchableOpacity>
      
      <View style={[styles.infoContainer, { backgroundColor: theme.primaryLight }]}>
        <Ionicons name="information-circle" size={20} color={theme.primary} />
        <Text style={[styles.infoText, { color: theme.primary }]}>
          Supported formats: PDF, Word, Text, CSV, Excel, and more
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  plusIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default EmptyState;
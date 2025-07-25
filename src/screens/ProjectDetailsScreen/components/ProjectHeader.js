// src/screens/ProjectDetailsScreen/components/ProjectHeader.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProjectHeader = ({ 
  isCreating, 
  handleBackPress, 
  handleSave, 
  isLoading, 
  saveAttempted, 
  theme 
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={handleBackPress}
        disabled={isLoading}
      >
        <Ionicons name="arrow-back" size={24} color={theme.text} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: theme.text }]}>
        {isCreating ? 'New Project' : 'Edit Project'}
      </Text>
      
      <TouchableOpacity 
        style={[styles.saveButton, (isLoading || saveAttempted) && styles.disabledButton]} 
        onPress={handleSave}
        disabled={isLoading || saveAttempted}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Text style={[styles.saveButtonText, { color: theme.primary }]}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProjectHeader;
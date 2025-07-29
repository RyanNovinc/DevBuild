// src/components/SuggestionChip.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const SuggestionChip = ({ suggestion, onPress, theme }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.suggestionChip, 
        { 
          backgroundColor: `${theme.primary}15`,
          borderColor: theme.primary
        }
      ]}
      onPress={() => onPress(suggestion)}
    >
      <Text style={[styles.suggestionText, { color: theme.primary }]}>
        {suggestion.text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SuggestionChip;
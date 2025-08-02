// src/components/ai/AIChat/AISuggestionChips.js - More compact layout to shift up
import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList 
} from 'react-native';

/**
 * AISuggestionChips - Displays suggestion chips for common questions
 * Styled to look like ChatGPT's suggestion chips with more compact layout
 * Reduced vertical padding to shift input up
 */
const AISuggestionChips = ({ 
  suggestions = [],
  onPress
}) => {
  // Render a suggestion chip
  const renderSuggestion = ({ item }) => (
    <TouchableOpacity 
      style={styles.suggestionChip}
      onPress={() => onPress(item)}
    >
      <Text style={styles.suggestionText} numberOfLines={1}>
        {item.text}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.suggestionsContainer}>
      <FlatList
        data={suggestions}
        keyExtractor={item => item.id}
        renderItem={renderSuggestion}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  suggestionsContainer: {
    paddingVertical: 6, // Reduced from 8 to 6
    borderTopWidth: 0, // Removed border
    borderTopColor: 'transparent',
    backgroundColor: '#000000',
    height: '100%', // Fill available height
  },
  suggestionsList: {
    paddingHorizontal: 16,
    alignItems: 'center', // Center chips vertically
  },
  suggestionChip: {
    paddingHorizontal: 16,
    paddingVertical: 7, // Reduced from 8 to 7
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    height: 34, // Reduced from 36 to 34
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default AISuggestionChips;
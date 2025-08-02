// src/screens/TodoListScreen/components/notes/NotesTagFilterBar.js
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../../../context/AppContext';

/**
 * Component for displaying a horizontal scrollable list of tags for filtering
 */
const NotesTagFilterBar = ({
  activeTag,
  onTagPress,
  theme,
  showSuccess
}) => {
  // Get all tags from context
  const { tags: allTags } = useAppContext();
  
  // Animation value for the clear filter button
  const clearButtonOpacity = useRef(new Animated.Value(activeTag ? 1 : 0)).current;
  
  // Sort tags by name for consistent display
  const sortedTags = [...allTags].sort((a, b) => a.name.localeCompare(b.name));
  
  // Handler for tag press
  const handleTagPress = (tagName) => {
    // If this tag is already active, clear the filter
    const newActiveTag = activeTag === tagName ? null : tagName;
    
    // Animate clear button visibility
    Animated.timing(clearButtonOpacity, {
      toValue: newActiveTag ? 1 : 0,
      duration: 200,
      useNativeDriver: true
    }).start();
    
    // Call the parent handler
    if (onTagPress) {
      onTagPress(newActiveTag);
    }
  };
  
  // Clear all filters
  const clearFilter = () => {
    // Animate clear button visibility
    Animated.timing(clearButtonOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start();
    
    // Call the parent handler with null to clear filter
    if (onTagPress) {
      onTagPress(null);
      
      if (showSuccess) {
        showSuccess('Filter cleared');
      }
    }
  };
  
  // If there are no tags, don't render anything
  if (sortedTags.length === 0) {
    return null;
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleContainer}>
          <Ionicons name="pricetags-outline" size={18} color={theme.primary} style={styles.titleIcon} />
          <Text style={[styles.title, { color: theme.text }]}>Filter by tag:</Text>
        </View>
        
        {/* Clear button - animated opacity based on filter state */}
        <Animated.View style={[styles.clearButtonContainer, { opacity: clearButtonOpacity }]}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: theme.border }]}
            onPress={clearFilter}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color={theme.textSecondary} />
            <Text style={[styles.clearButtonText, { color: theme.textSecondary }]}>Clear</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tagsScrollView}
        contentContainerStyle={styles.tagsContentContainer}
      >
        {sortedTags.map(tag => {
          const isActive = activeTag === tag.name;
          
          return (
            <TouchableOpacity
              key={tag.id}
              style={[
                styles.tagChip,
                { 
                  backgroundColor: isActive ? tag.color + '40' : tag.color + '20',
                  borderColor: tag.color,
                  borderWidth: isActive ? 1.5 : 1
                }
              ]}
              onPress={() => handleTagPress(tag.name)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tagText, { color: theme.text }]}>
                {tag.name}
              </Text>
              
              {isActive && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={16} 
                  color={tag.color} 
                  style={styles.activeIcon} 
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleIcon: {
    marginRight: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonContainer: {
    alignItems: 'flex-end',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  clearButtonText: {
    fontSize: 12,
    marginLeft: 4,
  },
  tagsScrollView: {
    maxHeight: 36,
  },
  tagsContentContainer: {
    paddingRight: 20,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeIcon: {
    marginLeft: 6,
  }
});

export default NotesTagFilterBar;
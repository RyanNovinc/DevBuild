// src/screens/TodoListScreen/components/notes/TagsDisplay.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../../../context/AppContext';

/**
 * Component for displaying tags on a note card
 * Can be used in read-only mode for displaying or interactive mode for filtering
 * Updated with inline display support for folder row integration
 */
const TagsDisplay = ({
  noteTags = [],
  theme,
  onTagPress = null,
  activeFilterTag = null,
  maxTags = 3, // Maximum number of tags to display before showing a +X more indicator
  small = false, // Use smaller styling for compact display
  inline = false, // New prop for inline display in folder row
  readOnly = true // If true, tags are not interactive
}) => {
  // Get all tags from context to get color information
  const { tags: allTags } = useAppContext();
  
  // If no tags, don't render anything
  if (!noteTags || noteTags.length === 0) {
    return null;
  }
  
  // Get tag information (including color) from global tags
  const getTagInfo = (tagName) => {
    const tag = allTags.find(t => t.name === tagName);
    
    return {
      name: tagName,
      color: tag?.color || theme.primary
    };
  };
  
  // Handle tag press
  const handleTagPress = (tagName) => {
    if (onTagPress && !readOnly) {
      onTagPress(tagName);
    }
  };
  
  // Whether to show truncated view (some tags hidden)
  const shouldTruncate = noteTags.length > maxTags;
  
  // Visible tags vs hidden count
  const visibleTags = shouldTruncate ? noteTags.slice(0, maxTags) : noteTags;
  const hiddenCount = shouldTruncate ? noteTags.length - maxTags : 0;
  
  return (
    <View style={[
      styles.container,
      small && styles.containerSmall,
      inline && styles.containerInline
    ]}>
      {visibleTags.map(tag => {
        const tagInfo = getTagInfo(tag);
        const isActive = activeFilterTag === tag;
        
        return (
          <TouchableOpacity
            key={tag}
            style={[
              styles.tagChip,
              small && styles.tagChipSmall,
              inline && styles.tagChipInline,
              { 
                backgroundColor: isActive 
                  ? tagInfo.color + '40' // 25% opacity if active filter
                  : tagInfo.color + '20', // 12.5% opacity normally
                borderColor: tagInfo.color,
                borderWidth: isActive ? 1.5 : 1
              }
            ]}
            onPress={() => handleTagPress(tag)}
            activeOpacity={readOnly ? 1 : 0.7}
            disabled={readOnly}
          >
            <Text 
              style={[
                styles.tagText,
                small && styles.tagTextSmall,
                inline && styles.tagTextInline,
                { color: theme.text }
              ]}
              numberOfLines={1}
            >
              {tag}
            </Text>
            
            {/* Show checkmark if this is the active filter */}
            {isActive && !readOnly && (
              <Ionicons 
                name="checkmark-circle" 
                size={small || inline ? 12 : 16} 
                color={tagInfo.color}
                style={styles.activeIcon} 
              />
            )}
          </TouchableOpacity>
        );
      })}
      
      {/* Show +X more indicator if tags are truncated */}
      {shouldTruncate && (
        <View
          style={[
            styles.moreChip,
            small && styles.moreChipSmall,
            inline && styles.moreChipInline,
            { backgroundColor: theme.cardElevated, borderColor: theme.border }
          ]}
        >
          <Text 
            style={[
              styles.moreText,
              small && styles.moreTextSmall,
              { color: theme.textSecondary }
            ]}
          >
            +{hiddenCount}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
    marginBottom: 2,
  },
  containerSmall: {
    marginTop: 4,
    marginBottom: 0,
  },
  containerInline: {
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 5,
    flex: 1,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    borderWidth: 1,
    maxWidth: 120,
  },
  tagChipSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 2,
    maxWidth: 80,
  },
  tagChipInline: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 0,
    maxWidth: 100,
    height: 24,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagTextSmall: {
    fontSize: 10,
  },
  tagTextInline: {
    fontSize: 10,
    fontWeight: '600',
  },
  activeIcon: {
    marginLeft: 4,
  },
  moreChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginBottom: 4,
    borderWidth: 1,
  },
  moreChipSmall: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginBottom: 2,
  },
  moreChipInline: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginBottom: 0,
    height: 24,
  },
  moreText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTextSmall: {
    fontSize: 10,
  }
});

export default TagsDisplay;
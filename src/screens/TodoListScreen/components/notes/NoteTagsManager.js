// src/screens/TodoListScreen/components/notes/NoteTagsManager.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../../../../context/AppContext';

/**
 * Simplified NoteTagsManager component with direct approach to tag creation
 */
const NoteTagsManager = ({
  noteTags = [],
  onTagsChange,
  onTagAdded, // Callback for immediate updates
  theme,
  maxHeight = 200,
  showSuccess
}) => {
  // Get all tags from context
  const { tags: allTags, updateAppSetting } = useAppContext();
  
  // Local state
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState(noteTags || []);
  
  // Ref for text input
  const inputRef = useRef(null);
  
  // Update local selected tags when noteTags prop changes
  useEffect(() => {
    setSelectedTags(noteTags || []);
  }, [noteTags]);
  
  // Update parent component when selected tags change
  useEffect(() => {
    if (onTagsChange) {
      onTagsChange(selectedTags);
    }
  }, [selectedTags, onTagsChange]);
  
  // Generate a random pastel color for new tags
  const generateRandomPastelColor = () => {
    // Generate pastel colors by using higher base values
    const r = Math.floor(Math.random() * 127) + 128;
    const g = Math.floor(Math.random() * 127) + 128;
    const b = Math.floor(Math.random() * 127) + 128;
    
    // Convert to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };
  
  // Direct approach to add a tag - simplified to minimize potential issues
  const addTag = () => {
    // Get the trimmed tag name
    const tagName = inputValue.trim();
    
    // Validation
    if (!tagName) return;
    
    // Check if tag already selected
    if (selectedTags.includes(tagName)) {
      setInputValue('');
      return;
    }
    
    try {
      // Check if tag exists in global tags
      const existingTag = allTags.find(tag => 
        tag.name.toLowerCase() === tagName.toLowerCase()
      );
      
      // If tag doesn't exist, create it
      if (!existingTag) {
        const newTag = {
          id: `tag_${Date.now()}`,
          name: tagName,
          color: generateRandomPastelColor(),
          createdAt: new Date().toISOString(),
          count: 1
        };
        
        // Add to global tags
        updateAppSetting('tags', [...allTags, newTag]);
        
        // Show success message
        if (showSuccess) {
          showSuccess(`Tag "${tagName}" created`);
        }
      }
      
      // Update selected tags
      const updatedTags = [...selectedTags, tagName];
      setSelectedTags(updatedTags);
      
      // Clear input
      setInputValue('');
      
      // Call the callback
      if (onTagAdded) {
        onTagAdded(tagName, updatedTags);
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      Alert.alert('Error', 'Failed to add tag');
    }
  };
  
  // Remove a tag
  const removeTag = (tagToRemove) => {
    try {
      const updatedTags = selectedTags.filter(tag => tag !== tagToRemove);
      setSelectedTags(updatedTags);
      
      if (onTagAdded) {
        onTagAdded(tagToRemove, updatedTags, true);
      }
    } catch (error) {
      console.error('Error removing tag:', error);
    }
  };
  
  // Get tag color from global tags
  const getTagColor = (tagName) => {
    const tag = allTags.find(t => t.name === tagName);
    return tag?.color || theme.primary;
  };

  return (
    <View style={styles.container}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={[styles.selectedTagsContainer, { maxHeight: 44 }]}
          contentContainerStyle={styles.selectedTagsContent}
        >
          {selectedTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tagChip,
                { backgroundColor: getTagColor(tag) + '20', borderColor: getTagColor(tag) }
              ]}
              onPress={() => removeTag(tag)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tagText, { color: theme.text }]}>
                {tag}
              </Text>
              <Ionicons name="close-circle" size={16} color={theme.text} style={styles.tagRemoveIcon} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
      
      {/* SIMPLIFIED TAG INPUT AND ADD BUTTON */}
      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { 
          backgroundColor: theme.card, 
          borderColor: theme.border,
          flex: 1
        }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: theme.text }]}
            placeholder="Add tag..."
            placeholderTextColor={theme.textSecondary}
            value={inputValue}
            onChangeText={setInputValue}
            returnKeyType="done"
            onSubmitEditing={addTag}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.directAddButton, { 
            backgroundColor: theme.primary,
            opacity: inputValue.trim() ? 1 : 0.5
          }]}
          onPress={addTag}
          disabled={!inputValue.trim()}
        >
          <Text style={styles.directAddButtonText}>Add Tag</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  selectedTagsContainer: {
    marginBottom: 10,
  },
  selectedTagsContent: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagRemoveIcon: {
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 40,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  directAddButton: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directAddButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  }
});

export default NoteTagsManager;
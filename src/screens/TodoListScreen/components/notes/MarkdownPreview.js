// src/screens/TodoListScreen/components/notes/MarkdownPreview.js
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Markdown from 'react-native-markdown-display';

/**
 * Component for rendering markdown in read-only mode
 * Used in note list previews
 */
const MarkdownPreview = ({
  content,
  theme,
  numberOfLines = 3,
  style
}) => {
  // If no content, don't render anything
  if (!content || !content.trim()) {
    return null;
  }
  
  // For note previews, we need to truncate content
  let displayContent = content;
  if (numberOfLines > 0) {
    // Simple approach to limit preview to specified number of lines
    const lines = content.split('\n');
    if (lines.length > numberOfLines) {
      displayContent = lines.slice(0, numberOfLines).join('\n') + '...';
    }
  }
  
  // Define simplified markdown styles for preview mode
  const markdownStyles = {
    body: {
      color: theme.textSecondary,
      fontSize: 14,
    },
    paragraph: {
      marginVertical: 2,
    },
    heading1: {
      color: theme.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginVertical: 2,
    },
    heading2: {
      color: theme.text,
      fontSize: 15,
      fontWeight: 'bold',
      marginVertical: 2,
    },
    heading3: {
      color: theme.text,
      fontSize: 14,
      fontWeight: 'bold',
      marginVertical: 2,
    },
    link: {
      color: theme.primary,
    },
    blockquote: {
      backgroundColor: theme.cardElevated,
      borderLeftColor: theme.primary,
      borderLeftWidth: 2,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginVertical: 2,
    },
    code_inline: {
      backgroundColor: theme.cardElevated,
      color: theme.text,
      borderRadius: 3,
      paddingHorizontal: 4,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: 13,
    },
    bullet_list: {
      marginVertical: 2,
    },
    ordered_list: {
      marginVertical: 2,
    },
    bullet_list_icon: {
      fontSize: 12,
    },
    // Disable certain elements that don't work well in previews
    image: {
      display: 'none',
    },
    table: {
      display: 'none',
    },
    hr: {
      height: 1,
      backgroundColor: theme.border,
      marginVertical: 2,
    },
  };
  
  return (
    <View style={[styles.container, style]}>
      <Markdown style={markdownStyles}>
        {displayContent}
      </Markdown>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MarkdownPreview;
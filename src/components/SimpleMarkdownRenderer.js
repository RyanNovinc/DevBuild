// src/components/SimpleMarkdownRenderer.js
import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { scaleFontSize } from '../utils/responsive';

const SimpleMarkdownRenderer = ({ content, theme }) => {
  if (!content) return null;

  // Split content into lines
  const lines = content.split('\n');
  const elements = [];
  
  lines.forEach((line, index) => {
    // Skip empty lines
    if (!line.trim()) {
      elements.push(<View key={index} style={styles.emptyLine} />);
      return;
    }
    
    // Check for headers
    if (line.startsWith('###')) {
      const text = line.substring(3).trim();
      elements.push(
        <Text key={index} style={[styles.h3, { color: theme.text }]}>
          {parseInlineMarkdown(text, theme)}
        </Text>
      );
    } else if (line.startsWith('##')) {
      const text = line.substring(2).trim();
      elements.push(
        <Text key={index} style={[styles.h2, { color: theme.text }]}>
          {parseInlineMarkdown(text, theme)}
        </Text>
      );
    } else if (line.startsWith('#')) {
      const text = line.substring(1).trim();
      elements.push(
        <Text key={index} style={[styles.h1, { color: theme.text }]}>
          {parseInlineMarkdown(text, theme)}
        </Text>
      );
    } else if (line.startsWith('- ')) {
      // Handle list items
      const text = line.substring(2);
      elements.push(
        <View key={index} style={styles.listItem}>
          <Text style={[styles.listBullet, { color: theme.text }]}>•</Text>
          <Text style={[styles.listText, { color: theme.text }]}>
            {parseInlineMarkdown(text, theme)}
          </Text>
        </View>
      );
    } else {
      // Regular paragraph
      elements.push(
        <Text key={index} style={[styles.paragraph, { color: theme.text }]}>
          {parseInlineMarkdown(line, theme)}
        </Text>
      );
    }
  });
  
  return <View>{elements}</View>;
};

// Parse inline markdown like **bold**, *italic*, and `code`
const parseInlineMarkdown = (text, theme) => {
  // Debug log to see what text we're processing
  console.log('Parsing markdown for text:', text.substring(0, 100));
  
  // If no markdown patterns, return plain text
  if (!text.includes('**') && !text.includes('*') && !text.includes('`')) {
    return text;
  }
  
  const parts = [];
  // Simpler, more robust regex for bold text
  const boldRegex = /\*\*([^*\n]+?)\*\*/g;
  let lastIndex = 0;
  let match;
  
  // First handle bold text
  while ((match = boldRegex.exec(text)) !== null) {
    console.log('Found bold match:', match[0], 'content:', match[1]);
    
    // Add text before the bold part
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        parts.push(
          <Text key={`text-${lastIndex}`} style={{ color: theme.text }}>
            {beforeText}
          </Text>
        );
      }
    }
    
    // Add the bold text
    parts.push(
      <Text key={`bold-${match.index}`} style={[styles.bold, { color: theme.text }]}>
        {match[1]}
      </Text>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(
        <Text key={`text-${lastIndex}`} style={{ color: theme.text }}>
          {remainingText}
        </Text>
      );
    }
  }
  
  // If we found matches, return the formatted parts, otherwise return original text
  return parts.length > 0 ? parts : text;
};

const styles = StyleSheet.create({
  h1: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  h2: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 16,
  },
  h3: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  paragraph: {
    fontSize: scaleFontSize(14),
    lineHeight: 20,
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: 'monospace',
    fontSize: scaleFontSize(13),
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  listBullet: {
    fontSize: scaleFontSize(14),
    marginRight: 8,
  },
  listText: {
    flex: 1,
    fontSize: scaleFontSize(14),
    lineHeight: 20,
  },
  emptyLine: {
    height: 8,
  },
});

export default SimpleMarkdownRenderer;
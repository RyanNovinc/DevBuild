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

// Parse inline markdown like **bold**
const parseInlineMarkdown = (text, theme) => {
  if (!text.includes('**')) {
    return text;
  }
  
  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > lastIndex) {
      parts.push(
        <Text key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </Text>
      );
    }
    
    // Add the bold text
    parts.push(
      <Text key={`bold-${match.index}`} style={styles.bold}>
        {match[1]}
      </Text>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(
      <Text key={`text-${lastIndex}`}>
        {text.substring(lastIndex)}
      </Text>
    );
  }
  
  return parts;
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
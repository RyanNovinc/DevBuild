// src/components/ai/AIChat/AIMessageItem.js - Fully optimized for responsive design and accessibility
import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Platform, 
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useAIAssistant } from '../../../context/AIAssistantContext';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  useIsLandscape,
  getByDeviceSize,
  ensureAccessibleTouchTarget,
  accessibility,
  getContrastRatio,
  meetsContrastRequirements
} from '../../../utils/responsive';

/**
 * Helper function to check if a message is asking for markdown examples
 */
const isMarkdownExampleRequest = (text) => {
  if (!text) return false;
  
  const lowerText = text.toLowerCase();
  return (
    lowerText.includes('markdown') && 
    (lowerText.includes('example') || lowerText.includes('style') || lowerText.includes('format'))
  );
};

/**
 * Render text with action links processed as TouchableOpacity buttons
 * This is the reliable solution that avoids text-splitting issues
 */
const renderTextWithActionLinks = (text, baseStyle, onActionLink, themeColor) => {
  console.log('🔗 renderTextWithActionLinks processing:', text);
  console.log('🎨 Theme color received:', themeColor);
  
  const parts = [];
  let currentIndex = 0;
  
  // Regex to find action links: [text](action://type/data)
  const actionLinkRegex = /\[([^\]]+)\]\(action:\/\/(\w+)\/(.*?)\)/g;
  let match;
  
  while ((match = actionLinkRegex.exec(text)) !== null) {
    // Add text before the action link (with markdown formatting)
    if (match.index > currentIndex) {
      const beforeText = text.substring(currentIndex, match.index);
      if (beforeText.trim()) {
        parts.push(
          <Text key={`text-${currentIndex}`} style={baseStyle}>
            {parseInlineMarkdown(beforeText, baseStyle)}
          </Text>
        );
      }
    }
    
    // Add the action link as TouchableOpacity
    const [fullMatch, linkText, actionType, encodedData] = match;
    console.log('🔗 Found action link:', { linkText, actionType, encodedData });
    
    parts.push(
      <TouchableOpacity
        key={`action-link-${match.index}`}
        onPress={() => {
          console.log('🔗 Action link pressed:', { actionType, encodedData });
          onActionLink(actionType, encodedData);
        }}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${linkText} button`}
        accessibilityHint={`Reopens the ${actionType} creation form`}
        style={[styles.actionLinkButton, {
          backgroundColor: `${themeColor}20`, // 20 = 0.125 opacity
          borderColor: `${themeColor}50`, // 50 = 0.3 opacity
        }]}
      >
        <Text style={[baseStyle, styles.actionLink, { color: themeColor }]}>
          {linkText}
        </Text>
      </TouchableOpacity>
    );
    
    currentIndex = match.index + fullMatch.length;
  }
  
  // Add any remaining text (with markdown formatting)
  if (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);
    if (remainingText.trim()) {
      parts.push(
        <Text key={`text-${currentIndex}`} style={baseStyle}>
          {parseInlineMarkdown(remainingText, baseStyle)}
        </Text>
      );
    }
  }
  
  return <View style={styles.actionLinkContainer}>{parts}</View>;
};

/**
 * Parse text for comprehensive markdown-style formatting
 * Optimized with responsive text sizing and accessibility
 */
const parseMarkdown = (text, baseStyle, isUserMessage = false, onActionLink = null, themeColor = '#19C37D') => {
  if (!text) return null;
  
  console.log('📝 parseMarkdown called with text type:', typeof text, 'isArray:', Array.isArray(text));
  if (typeof text === 'string' && text.includes('action://')) {
    console.log('📝 parseMarkdown received action link text:', text);
  }
  
  // Join the text if it's an array to handle split text issues
  const fullText = Array.isArray(text) ? text.join('') : text;
  
  // CRITICAL FIX: If this text contains action links, handle them specially
  // to avoid the text-splitting issue that breaks the regex matching
  if (fullText.includes('action://') && onActionLink) {
    console.log('🔗 Special processing for action links detected');
    return renderTextWithActionLinks(fullText, baseStyle, onActionLink, themeColor);
  }
  
  // If this looks like a markdown example demonstration, skip formatting
  // But only for AI messages, not user messages
  if (!isUserMessage && fullText.includes('```markdown') && fullText.includes('```')) {
    // This is a markdown demonstration, render it as is in a code block
    const codeContent = text.split('```markdown')[1].split('```')[0].trim();
    
    return (
      <View>
        <Text 
          style={baseStyle}
          maxFontSizeMultiplier={1.8} // Support Dynamic Type but limit scaling
        >
          {text.split('```markdown')[0]}
        </Text>
        <View style={styles.codeBlock}>
          <Text 
            style={styles.codeBlockLanguage}
            maxFontSizeMultiplier={1.5}
          >
            markdown
          </Text>
          <Text 
            style={styles.codeBlockText}
            maxFontSizeMultiplier={1.5}
          >
            {codeContent}
          </Text>
        </View>
        {text.split('```').length > 2 && (
          <Text 
            style={baseStyle}
            maxFontSizeMultiplier={1.8}
          >
            {text.split('```').slice(2).join('```')}
          </Text>
        )}
      </View>
    );
  }
  
  // Split text into lines to handle block-level elements
  const lines = fullText.split('\n');
  const elements = [];
  
  let inCodeBlock = false;
  let codeContent = [];
  let codeLanguage = '';
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Handle code blocks (multi-line)
    if (line.trim().match(/^```(.*)$/)) {
      if (!inCodeBlock) {
        // Start of code block
        inCodeBlock = true;
        // Try to extract language from ```language
        const match = line.trim().match(/^```(.*)$/);
        codeLanguage = match && match[1] ? match[1].trim() : '';
        continue;
      } else {
        // End of code block
        inCodeBlock = false;
        elements.push(
          <View 
            key={`code-block-${i}`} 
            style={styles.codeBlock}
            accessible={true}
            accessibilityRole="code"
            accessibilityLabel={`Code block ${codeLanguage ? `in ${codeLanguage}` : ''}`}
          >
            {codeLanguage ? (
              <Text 
                style={styles.codeBlockLanguage}
                maxFontSizeMultiplier={1.5}
              >
                {codeLanguage}
              </Text>
            ) : null}
            <Text 
              style={styles.codeBlockText}
              maxFontSizeMultiplier={1.5}
            >
              {codeContent.join('\n')}
            </Text>
            {/* Add copy button for code blocks */}
            <CopyButton code={codeContent.join('\n')} />
          </View>
        );
        codeContent = [];
        codeLanguage = '';
        continue;
      }
    }
    
    // Collect content inside code block
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }
    
    // Handle horizontal rule
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___') {
      elements.push(
        <View 
          key={`hr-${i}`} 
          style={styles.horizontalRule} 
          accessible={true}
          accessibilityRole="none"
          accessibilityLabel="Horizontal separator"
        />
      );
      continue;
    }
    
    // Handle headings (# Heading, ## Subheading, etc.)
    if (line.startsWith('# ')) {
      elements.push(
        <Text 
          key={`h1-${i}`} 
          style={styles.h1}
          maxFontSizeMultiplier={2.0}
          accessible={true}
          accessibilityRole="header"
        >
          {parseInlineMarkdown(line.substring(2), styles.h1, onActionLink)}
        </Text>
      );
      continue;
    } else if (line.startsWith('## ')) {
      elements.push(
        <Text 
          key={`h2-${i}`} 
          style={styles.h2}
          maxFontSizeMultiplier={2.0}
          accessible={true}
          accessibilityRole="header"
        >
          {parseInlineMarkdown(line.substring(3), styles.h2, onActionLink)}
        </Text>
      );
      continue;
    } else if (line.startsWith('### ')) {
      elements.push(
        <Text 
          key={`h3-${i}`} 
          style={styles.h3}
          maxFontSizeMultiplier={2.0}
          accessible={true}
          accessibilityRole="header"
        >
          {parseInlineMarkdown(line.substring(4), styles.h3, onActionLink)}
        </Text>
      );
      continue;
    }
    
    // Handle blockquotes (> text)
    if (line.trim().startsWith('> ')) {
      elements.push(
        <View 
          key={`blockquote-${i}`} 
          style={styles.blockquote}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel="Blockquote"
        >
          <Text 
            style={styles.blockquoteText}
            maxFontSizeMultiplier={1.8}
          >
            {parseInlineMarkdown(line.substring(line.indexOf('>') + 1).trim(), styles.blockquoteText, onActionLink)}
          </Text>
        </View>
      );
      continue;
    }
    
    // Let bullet points from AI display as-is (no special processing needed)
    
    // Handle numbered lists (1. item, 2. item)
    const numberedListMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
    if (numberedListMatch) {
      const [, number, content] = numberedListMatch;
      elements.push(
        <View 
          key={`numbered-list-${i}`} 
          style={styles.listItem}
          accessible={true}
          accessibilityRole="text"
        >
          <Text 
            style={[baseStyle, styles.listNumber]}
            maxFontSizeMultiplier={1.8}
          >
            {number}.
          </Text>
          <Text 
            style={[baseStyle, styles.listItemText]}
            maxFontSizeMultiplier={1.8}
          >
            {parseInlineMarkdown(content, baseStyle, onActionLink)}
          </Text>
        </View>
      );
      continue;
    }
    
    // Regular paragraph or empty line
    if (line.trim() === '') {
      elements.push(<View key={`empty-${i}`} style={styles.emptyLine} />);
    } else {
      elements.push(
        <Text 
          key={`paragraph-${i}`} 
          style={baseStyle}
          maxFontSizeMultiplier={1.8}
          accessible={true}
          accessibilityRole="text"
        >
          {parseInlineMarkdown(line, baseStyle, onActionLink)}
        </Text>
      );
    }
  }
  
  return <View>{elements}</View>;
};

/**
 * Parse inline markdown elements like bold, italic, inline code, and links
 */
const parseInlineMarkdown = (text, baseStyle, onActionLink = null) => {
  if (!text) return null;
  
  // First replace all instances of ** for bold
  let processedText = replaceBold(text);
  
  // Then replace all instances of * and _ for italic
  processedText = replaceItalic(processedText);
  
  // Then replace all instances of `code` for inline code
  processedText = replaceInlineCode(processedText);
  
  // Finally replace all instances of [text](url) for links
  processedText = replaceLinks(processedText, onActionLink);
  
  return processedText;
};

/**
 * Process bold text (**text**)
 */
const replaceBold = (text) => {
  if (!text) return null;
  
  const parts = [];
  let currentIndex = 0;
  
  // Regex to find bold text: **text**
  const regex = /\*\*([^*]+)\*\*/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    // Add text before the bold part
    if (match.index > currentIndex) {
      parts.push(text.substring(currentIndex, match.index));
    }
    
    // Add the bold part
    const boldText = match[1];
    parts.push(
      <Text 
        key={`bold-${match.index}`} 
        style={styles.bold}
        maxFontSizeMultiplier={1.8}
      >
        {boldText}
      </Text>
    );
    
    currentIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

/**
 * Process italic text (*text* or _text_)
 */
const replaceItalic = (textParts) => {
  // If it's just a string, process it
  if (typeof textParts === 'string') {
    const parts = [];
    let currentIndex = 0;
    
    // Regex to find italic text: *text* or _text_
    // Using a non-greedy match to avoid issues with multiple *
    const regex = /(\*([^*]+)\*)|(_([^_]+)_)/g;
    let match;
    
    const text = textParts;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the italic part
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }
      
      // Add the italic part
      const italicText = match[2] || match[4]; // Group 2 is from *text*, group 4 is from _text_
      parts.push(
        <Text 
          key={`italic-${match.index}`} 
          style={styles.italic}
          maxFontSizeMultiplier={1.8}
        >
          {italicText}
        </Text>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }
    
    return parts.length > 0 ? parts : text;
  }
  
  // If it's an array (already processed for another style), process each string element
  if (Array.isArray(textParts)) {
    return textParts.map((part, index) => {
      if (typeof part === 'string') {
        return replaceItalic(part);
      }
      // If it's a React element, leave it as is
      return part;
    });
  }
  
  // If it's neither a string nor an array, return as is
  return textParts;
};

/**
 * Process inline code (`code`)
 */
const replaceInlineCode = (textParts) => {
  // Process a string
  if (typeof textParts === 'string') {
    const parts = [];
    let currentIndex = 0;
    
    // Regex to find inline code: `code`
    const regex = /`([^`]+)`/g;
    let match;
    
    const text = textParts;
    
    while ((match = regex.exec(text)) !== null) {
      // Add text before the code
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }
      
      // Add the code
      const code = match[1];
      parts.push(
        <Text 
          key={`code-${match.index}`} 
          style={styles.inlineCode}
          maxFontSizeMultiplier={1.5}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`code: ${code}`}
        >
          {code}
        </Text>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }
    
    return parts.length > 0 ? parts : text;
  }
  
  // Process an array
  if (Array.isArray(textParts)) {
    return textParts.flatMap((part, index) => {
      if (typeof part === 'string') {
        return replaceInlineCode(part);
      }
      return part;
    });
  }
  
  return textParts;
};

/**
 * Process links ([text](url)) and special action links ([text](action://type/data))
 */
const replaceLinks = (textParts, onActionLink = null) => {
  // Process a string
  if (typeof textParts === 'string') {
    const parts = [];
    let currentIndex = 0;
    
    const text = textParts;
    console.log('🔗 Processing text for links:', text);
    
    // First try to fix broken action links by joining split parts
    let processedText = text;
    if (text.includes('action://') && text.includes('\n')) {
      console.log('🔗 Attempting to fix broken action link');
      // Try to rejoin broken action links
      processedText = text.replace(/\[([^\]]+)\]\(action:\/\/([^)]*)\n([^)]*)\)/g, '[$1](action://$2$3)');
      console.log('🔗 Fixed text:', processedText);
    }
    
    // Regex to find links: [text](url)
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    
    while ((match = regex.exec(processedText)) !== null) {
      // Add text before the link
      if (match.index > currentIndex) {
        parts.push(processedText.substring(currentIndex, match.index));
      }
      
      // Add the link
      const linkText = match[1];
      const url = match[2];
      console.log('🔗 Found link:', { linkText, url });
      
      // Check if this is a special action link
      if (url.startsWith('action://')) {
        // Parse action link: action://type/base64data
        const actionMatch = url.match(/^action:\/\/(\w+)\/(.*?)$/);
        console.log('🔗 Parsing action link:', { url, actionMatch, hasCallback: !!onActionLink });
        
        if (actionMatch && onActionLink) {
          const [, actionType, encodedData] = actionMatch;
          console.log('🔗 Parsed action link:', { actionType, encodedData });
          
          parts.push(
            <TouchableOpacity
              key={`action-link-${match.index}`}
              onPress={() => {
                console.log('🔗 Action link pressed:', { actionType, encodedData });
                onActionLink(actionType, encodedData);
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${linkText} button`}
              accessibilityHint={`Reopens the ${actionType} creation form`}
              style={styles.actionLinkButton}
            >
              <Text 
                style={[styles.link, styles.actionLink]}
                maxFontSizeMultiplier={1.8}
              >
                {linkText}
              </Text>
            </TouchableOpacity>
          );
        } else {
          console.log('❌ Invalid action link or no callback:', { actionMatch, hasCallback: !!onActionLink });
          // Invalid action link, render as regular text
          parts.push(linkText);
        }
      } else {
        // Regular link
        parts.push(
          <Text 
            key={`link-${match.index}`} 
            style={styles.link}
            maxFontSizeMultiplier={1.8}
            accessible={true}
            accessibilityRole="link"
            accessibilityHint={`Opens ${url}`}
            onPress={() => Linking.openURL(url)}
          >
            {linkText}
          </Text>
        );
      }
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (currentIndex < processedText.length) {
      parts.push(processedText.substring(currentIndex));
    }
    
    return parts.length > 0 ? parts : processedText;
  }
  
  // Process an array
  if (Array.isArray(textParts)) {
    return textParts.flatMap((part, index) => {
      if (typeof part === 'string') {
        return replaceLinks(part, onActionLink);
      }
      return part;
    });
  }
  
  return textParts;
};

// Copy button component for code blocks with accessibility
const CopyButton = ({ code }) => {
  const [copied, setCopied] = React.useState(false);
  const { showToast } = useAIAssistant();
  const isLandscape = useIsLandscape();
  
  // Get accessible size based on device and orientation
  const buttonSize = getByDeviceSize({
    small: isLandscape ? scaleWidth(28) : scaleWidth(32),
    medium: scaleWidth(36),
    large: scaleWidth(40),
    tablet: scaleWidth(48)
  });
  
  // Ensure button meets minimum touch target size
  const hitSlop = ensureAccessibleTouchTarget({
    width: buttonSize,
    height: buttonSize
  });
  
  const copyToClipboard = async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      showToast('Code copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code: ', error);
    }
  };

  return (
    <TouchableOpacity 
      onPress={copyToClipboard}
      style={{
        position: 'absolute',
        top: scaleWidth(8),
        right: scaleWidth(8),
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: scaleWidth(4),
        padding: scaleWidth(4),
        minWidth: buttonSize,
        minHeight: buttonSize,
        alignItems: 'center',
        justifyContent: 'center',
      }}
      hitSlop={{
        top: Math.max(0, accessibility.minTouchTarget - buttonSize) / 2,
        bottom: Math.max(0, accessibility.minTouchTarget - buttonSize) / 2,
        left: Math.max(0, accessibility.minTouchTarget - buttonSize) / 2,
        right: Math.max(0, accessibility.minTouchTarget - buttonSize) / 2,
      }}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={copied ? "Copied to clipboard" : "Copy code"}
      accessibilityHint="Copies the code to your clipboard"
      accessibilityState={{ selected: copied }}
    >
      <Text 
        style={{ 
          color: 'white', 
          fontSize: scaleFontSize(12),
          fontWeight: copied ? 'bold' : 'normal'
        }}
        maxFontSizeMultiplier={1.5}
      >
        {copied ? '✅ Copied' : '📋 Copy'}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * AIMessageItem - Renders a single chat message
 * Fully optimized for responsive design and accessibility across all iOS devices
 */
const AIMessageItem = ({ 
  message, 
  isSelected = false,
  onPress,
  style = 'default',
  isLastUserMessage = false,
  hasUserMessages = false,
  onActionLink = null,
  themeColor = '#19C37D' // Default green color
}) => {
  console.log('🎨 AIMessageItem received themeColor:', themeColor);
  const { showToast } = useAIAssistant();
  const isLandscape = useIsLandscape();
  
  // Determine if this is a user message
  const isUserMessage = message.type === 'user';
  
  // Determine if this message should have centered text
  const isCentered = message.centered === true;
  
  // Determine if this message is currently streaming
  const isStreaming = message.streaming === true;
  
  // If this is a centered AI message (intro) and there are user messages, don't render it
  if (isCentered && !isUserMessage && hasUserMessages) {
    return null;
  }

  // Get model color based on style
  const getModelColor = () => {
    switch(style) {
      case 'guide':
        return '#03A9F4';
      case 'navigator':
        return '#3F51B5';
      case 'compass':
        return '#673AB7';
      default:
        return '#19C37D'; // ChatGPT's green color
    }
  };
  
  // Handle message long press for copying
  const handleLongPress = () => {
    onPress(message.id);
  };
  
  // Handle tap - deselect if already selected
  const handlePress = () => {
    if (isSelected) {
      onPress(null); // Deselect when tapped if already selected
    }
  };
  
  const handleCopyMessage = async () => {
    try {
      await Clipboard.setStringAsync(message.text);
      showToast('Message copied to clipboard');
    } catch (error) {
      console.error('Failed to copy text: ', error);
      Alert.alert('Copy failed', 'Could not copy text to clipboard');
    }
    
    onPress(null); // Deselect message
  };
  
  // Sanitize markdown for potential streaming issues 
  const sanitizeMarkdown = (markdown) => {
    if (!markdown) return markdown;
    
    let sanitized = markdown;
    
    // Fix unclosed code blocks
    const codeBlockCount = (sanitized.match(/```/g) || []).length;
    if (codeBlockCount % 2 !== 0) sanitized += '\n```';
    
    // Fix unclosed emphasis
    const boldCount = (sanitized.match(/\*\*/g) || []).length;
    if (boldCount % 2 !== 0) sanitized += '**';
    
    // Fix unclosed tables
    if (sanitized.includes('|') && !sanitized.trim().endsWith('|')) {
      sanitized += ' |';
    }
    
    return sanitized;
  };
  
  // Memoize sanitized text to prevent unnecessary re-rendering
  const sanitizedText = useMemo(() => {
    const cleaned = sanitizeMarkdown(message.text);
    console.log('🔗 Raw message text:', message.text);
    console.log('🔗 Sanitized text:', cleaned);
    if (cleaned && cleaned.includes('action://')) {
      console.log('🔗 Message contains action link!');
    }
    return cleaned;
  }, [message.text]);
  
  // Get device-specific widths for message bubbles - increased to fill more screen width
  const getUserMessageWidth = () => {
    if (isLandscape) {
      return getByDeviceSize({
        small: '90%',
        medium: '85%',
        large: '80%',
        tablet: '75%'
      });
    }
    
    return getByDeviceSize({
      small: '98%',
      medium: '98%',
      large: '98%',
      tablet: '90%'
    });
  };
  
  const getAIMessageWidth = () => {
    if (isLandscape) {
      return getByDeviceSize({
        small: '95%',
        medium: '95%',
        large: '90%',
        tablet: '85%'
      });
    }
    
    return getByDeviceSize({
      small: '100%',
      medium: '100%',
      large: '98%',
      tablet: '95%'
    });
  };
  
  // Create accessibility props for message bubble
  const getMessageAccessibilityProps = () => {
    return {
      accessible: true,
      accessibilityRole: "text",
      accessibilityLabel: `${isUserMessage ? 'Your message' : 'AI response'}${isSelected ? ', selected' : ''}`,
      accessibilityHint: isSelected ? "Double tap to deselect" : "Long press to copy",
      accessibilityState: { selected: isSelected }
    };
  };
  
  return (
    <View style={[
      styles.container,
      isUserMessage ? styles.userContainer : styles.aiContainer,
      isLastUserMessage && styles.lastUserMessageContainer
    ]}>
      {/* The Message Bubble */}
      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={handleLongPress}
        delayLongPress={500}
        onPress={handlePress}
        {...getMessageAccessibilityProps()}
      >
        <View style={[
          styles.messageBubble, 
          isUserMessage ? [
            styles.userMessage,
            { maxWidth: getUserMessageWidth() }
          ] : [
            styles.aiMessage,
            { maxWidth: getAIMessageWidth() }
          ],
          isSelected && styles.selectedMessage,
          isLastUserMessage && styles.lastUserMessage
        ]}>
          {/* Use parseMarkdown to handle markdown formatting */}
          {parseMarkdown(
            sanitizedText,
            [
              styles.messageText, 
              { color: '#FFFFFF' },
              isCentered && styles.centeredText
            ],
            isUserMessage,
            onActionLink,
            themeColor
          )}
        </View>
      </TouchableOpacity>
      
      {/* Copy Button - Appears when selected */}
      {isSelected && (
        <View style={[
          styles.messageActions, 
          { 
            top: scaleHeight(-45), // Position above the message
            right: isUserMessage ? scaleWidth(20) : null, // Align right for user messages
            left: isUserMessage ? null : scaleWidth(20), // Align left for AI messages
            backgroundColor: '#000000', // Black background
            borderWidth: 1,
            borderColor: '#FFFFFF', // White border
          }
        ]}>
          <TouchableOpacity 
            style={styles.messageAction}
            onPress={handleCopyMessage}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Copy message"
            accessibilityHint="Copies the message to your clipboard"
          >
            <Ionicons name="copy-outline" size={scaleWidth(20)} color={getModelColor()} />
            <Text style={[styles.messageActionText, { 
              color: '#FFFFFF',
              fontWeight: 'bold'
            }]}>
              Copy
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Create responsive styles
const styles = StyleSheet.create({
  container: {
    marginBottom: scaleHeight(10),
    position: 'relative',
    width: '100%', // Full width container
    paddingHorizontal: scaleWidth(2), // Reduced horizontal padding to allow wider messages
  },
  userContainer: {
    alignItems: 'flex-end', // User messages still on the right
  },
  aiContainer: {
    alignItems: 'center', // AI messages centered
  },
  lastUserMessageContainer: {
    // Special styling for the latest user message (if needed)
  },
  messageBubble: {
    padding: scaleWidth(14), // Responsive padding
    borderRadius: scaleWidth(18),
    marginBottom: scaleHeight(10),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    flexShrink: 1,
    position: 'relative', // For positioning child elements
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: scaleWidth(4),
    backgroundColor: '#1E1E1E', // Darker gray for user messages
    // maxWidth set dynamically
  },
  lastUserMessage: {
    // Special styling for the latest user message bubble (if needed)
  },
  aiMessage: {
    alignSelf: 'center', // Center the AI message bubble
    borderRadius: scaleWidth(18), // Full rounded corners for centered messages
    backgroundColor: '#000000', // Pure black for AI messages
    minWidth: isSmallDevice ? '98%' : '95%', // Increased minimum width with device adaptations
    // maxWidth set dynamically
    paddingHorizontal: scaleWidth(16), // Horizontal padding for AI messages
  },
  messageText: {
    fontSize: fontSizes.m,
    lineHeight: scaleFontSize(22),
    flexShrink: 1, // Ensure text doesn't overflow bubble
  },
  centeredText: {
    textAlign: 'center', // Center-align the text
  },
  selectedMessage: {
    borderWidth: 2,
    borderColor: '#FFFFFF', // White highlight color - stays with theme
    borderRadius: scaleWidth(18), // Ensure border follows message bubble shape
  },
  messageActions: {
    position: 'absolute',
    flexDirection: 'row',
    borderRadius: scaleWidth(8),
    paddingVertical: scaleHeight(8),
    paddingHorizontal: scaleWidth(12),
    borderWidth: 1, 
    borderColor: '#2A2A2A',
    elevation: 10, // Very high elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, // Stronger shadow
    shadowRadius: 5,
    zIndex: 9999, // Extremely high z-index
  },
  messageAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleWidth(8),
    minWidth: accessibility.minTouchTarget,
    minHeight: accessibility.minTouchTarget / 2, // Half height because the container already has padding
  },
  messageActionText: {
    marginLeft: scaleWidth(4),
    fontSize: fontSizes.s,
    fontWeight: '500',
  },
  // Heading styles
  h1: {
    fontSize: scaleFontSize(24),
    fontWeight: 'bold',
    marginVertical: scaleHeight(10),
    color: '#FFFFFF',
  },
  h2: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    marginVertical: scaleHeight(8),
    color: '#FFFFFF',
  },
  h3: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    marginVertical: scaleHeight(6),
    color: '#FFFFFF',
  },
  // Formatting styles
  bold: {
    fontWeight: 'bold',
  },
  italic: {
    fontStyle: 'italic',
  },
  // List styles
  listItem: {
    flexDirection: 'row',
    marginBottom: scaleHeight(6),
    alignItems: 'flex-start',
  },
  listBullet: {
    marginRight: scaleWidth(8),
    fontSize: fontSizes.m,
    lineHeight: scaleFontSize(22),
  },
  listNumber: {
    marginRight: scaleWidth(8),
    fontSize: fontSizes.m,
    lineHeight: scaleFontSize(22),
  },
  listItemText: {
    flex: 1,
  },
  // Code block styles
  codeBlock: {
    backgroundColor: '#2A2A2A',
    padding: scaleWidth(12),
    borderRadius: scaleWidth(8),
    marginVertical: scaleHeight(8),
    width: '100%',
    position: 'relative', // For copy button positioning
  },
  codeBlockLanguage: {
    color: '#AAAAAA',
    fontSize: fontSizes.xs,
    marginBottom: scaleHeight(6),
  },
  codeBlockText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#FFFFFF',
    fontSize: scaleFontSize(14),
    lineHeight: scaleFontSize(20),
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#2A2A2A',
    color: '#FFFFFF',
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(4),
    fontSize: scaleFontSize(14),
  },
  // Blockquote style
  blockquote: {
    borderLeftWidth: scaleWidth(4),
    borderLeftColor: '#666666',
    paddingLeft: scaleWidth(12),
    marginVertical: scaleHeight(8),
  },
  blockquoteText: {
    color: '#CCCCCC',
    fontStyle: 'italic',
    fontSize: fontSizes.m,
    lineHeight: scaleFontSize(22),
  },
  // Horizontal rule
  horizontalRule: {
    height: 1,
    backgroundColor: '#666666',
    marginVertical: scaleHeight(16),
    width: '100%',
  },
  // Link style
  link: {
    color: '#4F97FF',
    textDecorationLine: 'underline',
  },
  // Action link style
  actionLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
    // Color set dynamically in renderTextWithActionLinks
  },
  // Action link button wrapper
  actionLinkButton: {
    paddingHorizontal: scaleWidth(8),
    paddingVertical: scaleWidth(4),
    borderRadius: scaleWidth(6),
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginVertical: scaleWidth(2),
    // backgroundColor and borderColor set dynamically in renderTextWithActionLinks
  },
  // Action link container
  actionLinkContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  // Empty line
  emptyLine: {
    height: scaleHeight(12),
  },
});

export default AIMessageItem;
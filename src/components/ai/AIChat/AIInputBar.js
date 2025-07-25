// src/components/ai/AIChat/AIInputBar.js - Fully device-optimized for all iPhone models
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Keyboard,
  Platform,
  Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  useScreenDimensions,
  useIsLandscape,
  accessibility,
  getByDeviceSize,
  ensureAccessibleTouchTarget
} from '../../../utils/responsive';

/**
 * AIInputBar - Responsive and accessible input component for AI chat
 * Fully optimized for all iOS device sizes with device-specific text wrapping
 */
const AIInputBar = ({ 
  value = '',
  onChangeText,
  onSend,
  onNewConversation,
  disabled = false,
  isStreaming = false,
  placeholder = 'Your move...',
  onFocus,
  onBlur,
  conversationId,
  conversationSize = 0,
  conversationWarningThreshold = 40000,
  maxThreshold = 50000,
  aiTier = 'guide'
}) => {
  // Get safe area and screen dimensions
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Responsive constants
  const MIN_HEIGHT = scaleHeight(44);
  const LINE_HEIGHT = scaleHeight(24);
  const MAX_HEIGHT = scaleHeight(150);
  
  // Get device-specific button dimensions
  const getSendButtonSize = () => {
    return getByDeviceSize({
      small: ensureAccessibleTouchTarget(scaleWidth(32), scaleHeight(32)),
      medium: ensureAccessibleTouchTarget(scaleWidth(34), scaleHeight(34)),
      large: ensureAccessibleTouchTarget(scaleWidth(36), scaleHeight(36)),
      tablet: ensureAccessibleTouchTarget(scaleWidth(40), scaleHeight(40))
    });
  };
  
  const getNewChatButtonSize = () => {
    return getByDeviceSize({
      small: ensureAccessibleTouchTarget(scaleWidth(30), scaleHeight(30)),
      medium: ensureAccessibleTouchTarget(scaleWidth(32), scaleHeight(32)),
      large: ensureAccessibleTouchTarget(scaleWidth(34), scaleHeight(34)),
      tablet: ensureAccessibleTouchTarget(scaleWidth(38), scaleHeight(38))
    });
  };
  
  // Calculate device-specific sizes
  const sendButtonSize = getSendButtonSize();
  const newChatButtonSize = getNewChatButtonSize();
  
  // Get device-specific horizontal padding
  const getHorizontalPadding = () => {
    return getByDeviceSize({
      small: spacing.m * 0.85, // Smaller devices need less padding
      medium: spacing.m * 0.95, // Standard padding for medium devices
      large: spacing.m, // Standard padding for larger devices
      tablet: spacing.m * 1.1 // More padding on tablets for balance
    });
  };
  
  // Get device-specific button offset
  const getButtonOffset = () => {
    return getByDeviceSize({
      small: scaleWidth(48), // Smaller devices
      medium: scaleWidth(50), // Medium devices
      large: scaleWidth(52), // Larger devices
      tablet: scaleWidth(56) // Tablets
    });
  };
  
  // Device-specific character width estimation
  const getDeviceSpecificCharWidth = () => {
    const baseWidth = getByDeviceSize({
      small: scaleFontSize(16) * 0.58, // iPhone SE / mini - slightly larger for small screens
      medium: scaleFontSize(16) * 0.53, // Standard iPhones
      large: scaleFontSize(16) * 0.51, // iPhone Plus/Max models
      tablet: scaleFontSize(16) * 0.48  // iPads
    });
    
    // Further adjust for orientation
    return isLandscape ? baseWidth * 0.97 : baseWidth;
  };
  
  // Get device-specific character limit buffer
  const getCharLimitBuffer = () => {
    return getByDeviceSize({
      small: 0, // No buffer for small devices
      medium: 1, // Small buffer for medium devices
      large: 2, // Larger buffer for larger devices
      tablet: 3  // Largest buffer for tablets
    });
  };
  
  // Calculate available width for text wrapping with device-specific values
  const horizontalPadding = getHorizontalPadding();
  const buttonOffset = getButtonOffset();
  const availableWidth = screenWidth - horizontalPadding - buttonOffset;
  
  // Calculate characters per line with device-specific character width
  const estimatedCharWidth = getDeviceSpecificCharWidth();
  const charLimitBuffer = getCharLimitBuffer();
  const CHARS_PER_LINE = Math.floor(availableWidth / estimatedCharWidth) + charLimitBuffer;
  
  // State and refs
  const [inputHeight, setInputHeight] = useState(MIN_HEIGHT);
  const [internalValue, setInternalValue] = useState(value);
  const [charsRemaining, setCharsRemaining] = useState(maxThreshold - conversationSize);
  const [showCharCount, setShowCharCount] = useState(false);
  
  const inputRef = useRef(null);
  const prevTextLength = useRef(0);
  const prevConversationId = useRef(conversationId);
  
  // Effect to sync value from props to internal state
  useEffect(() => {
    setInternalValue(value);
  }, [value]);
  
  // Effect to update chars remaining when conversation size changes
  useEffect(() => {
    const remaining = maxThreshold - conversationSize;
    setCharsRemaining(remaining);
    setShowCharCount(conversationSize >= conversationWarningThreshold);
  }, [conversationSize, maxThreshold, conversationWarningThreshold]);
  
  // Reset input when conversation changes
  useEffect(() => {
    if (conversationId !== prevConversationId.current) {
      setInternalValue('');
      setInputHeight(MIN_HEIGHT);
      prevTextLength.current = 0;
      
      if (inputRef.current) {
        inputRef.current.clear();
      }
      
      Keyboard.dismiss();
      
      if (onChangeText) {
        onChangeText('');
      }
      
      prevConversationId.current = conversationId;
    }
  }, [conversationId, onChangeText]);
  
  // Calculate number of lines in text
  const countLines = (text) => {
    return (text.match(/\n/g) || []).length + 1;
  };
  
  // Handle content size change
  const handleContentSizeChange = (event) => {
    if (!event?.nativeEvent?.contentSize) return;
    
    const { height } = event.nativeEvent.contentSize;
    
    if (Math.abs(height - inputHeight) > scaleHeight(5)) {
      const newHeight = Math.min(Math.max(MIN_HEIGHT, height), MAX_HEIGHT);
      setInputHeight(newHeight);
    }
  };
  
  // Device-specific wrapping threshold
  const getWrappingThreshold = () => {
    return getByDeviceSize({
      small: -2, // Wrap sooner on small devices
      medium: 0, // Standard wrapping on medium devices
      large: 1, // Allow slightly more text on larger devices
      tablet: 2  // Allow even more text on tablets
    });
  };
  
  // Device-specific break position
  const getBreakPosition = () => {
    return getByDeviceSize({
      small: -3, // Break sooner on small devices
      medium: -1, // Standard break position on medium devices
      large: 0, // Standard break position on larger devices
      tablet: 1  // Allow slightly more text on tablets
    });
  };
  
  // Handle text changes with intelligent wrapping - DEVICE OPTIMIZED
  const handleTextChange = (text) => {
    setInternalValue(text);
    
    // Auto-wrap logic with device-specific thresholds
    if (text.length > prevTextLength.current && text.length > 0) {
      const lines = text.split('\n');
      const lastLine = lines[lines.length - 1];
      
      const wrappingThreshold = getWrappingThreshold();
      const breakPosition = getBreakPosition();
      
      // Use device-specific thresholds for wrapping
      if (lastLine.length > (CHARS_PER_LINE + wrappingThreshold) && !lastLine.includes('\n')) {
        const breakPos = Math.max(0, lastLine.lastIndexOf(' ', CHARS_PER_LINE + breakPosition));
        if (breakPos > 0) {
          const newText = text.substring(0, text.length - lastLine.length + breakPos) + 
                          '\n' + 
                          text.substring(text.length - lastLine.length + breakPos + 1);
          
          setInternalValue(newText);
          onChangeText(newText);
          
          const lines = countLines(newText);
          const newHeight = Math.min(
            Math.max(MIN_HEIGHT, MIN_HEIGHT + (lines - 1) * LINE_HEIGHT),
            MAX_HEIGHT
          );
          setInputHeight(newHeight);
          
          prevTextLength.current = newText.length;
          return;
        }
      }
    }
    
    // Normal flow - update height based on lines
    const lines = countLines(text);
    const newHeight = Math.min(
      Math.max(MIN_HEIGHT, MIN_HEIGHT + (lines - 1) * LINE_HEIGHT),
      MAX_HEIGHT
    );
    setInputHeight(newHeight);
    
    if (text.length === 0) {
      setInputHeight(MIN_HEIGHT);
    }
    
    prevTextLength.current = text.length;
    onChangeText(text);
  };
  
  // Handle send button press
  const handleSendPress = () => {
    if (conversationSize + internalValue.length > maxThreshold) {
      if (onNewConversation) {
        onNewConversation();
      }
      return;
    }
    
    onSend();
    setInputHeight(MIN_HEIGHT);
    setInternalValue('');
    prevTextLength.current = 0;
    Keyboard.dismiss();
  };
  
  // Get character count color
  const getRemainingCountColor = () => {
    const percentRemaining = charsRemaining / maxThreshold;
    
    if (percentRemaining < 0.05) return '#FF5252';
    if (percentRemaining < 0.1) return '#FFD700';
    return '#999999';
  };
  
  // Get device-specific right padding for input
  const getInputRightPadding = () => {
    return getByDeviceSize({
      small: scaleWidth(36), // Smaller padding on small devices
      medium: scaleWidth(40), // Standard padding on medium devices
      large: scaleWidth(44), // More padding on larger devices
      tablet: scaleWidth(48)  // Most padding on tablets
    });
  };
  
  // Get device-specific button positioning
  const getSendButtonRight = () => {
    return getByDeviceSize({
      small: scaleWidth(3), // Closer to edge on small devices
      medium: scaleWidth(4), // Standard position on medium devices
      large: scaleWidth(5), // Further from edge on larger devices
      tablet: scaleWidth(6)  // Even further on tablets
    });
  };
  
  return (
    <View style={styles.inputContainer}>
      {/* Character count indicator */}
      {showCharCount && (
        <View style={styles.charCountContainer}>
          <Text 
            style={[styles.charCount, { color: getRemainingCountColor() }]}
            accessible={true}
            accessibilityLabel={`${charsRemaining > 0 ? 
              `${charsRemaining} characters remaining` : 
              'Character limit reached'}`}
          >
            {charsRemaining > 0 ? 
              `${charsRemaining} characters remaining` : 
              'Character limit reached'}
          </Text>
        </View>
      )}
      
      <View style={styles.inputWrapper}>
        {/* New Chat button with device-specific positioning */}
        {conversationSize > conversationWarningThreshold && onNewConversation && (
          <TouchableOpacity
            style={[
              styles.newChatButton,
              {
                width: newChatButtonSize.width,
                height: newChatButtonSize.height,
                borderRadius: newChatButtonSize.width / 2,
                left: spacing.xs,
              }
            ]}
            onPress={onNewConversation}
            disabled={disabled || isStreaming}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Start new conversation"
            accessibilityHint="Creates a new conversation to stay within message limits"
          >
            <Ionicons 
              name="add-circle-outline" 
              size={scaleWidth(18)} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        )}
      
        <TextInput
          ref={inputRef}
          style={[
            styles.input, 
            { 
              height: inputHeight,
              fontSize: fontSizes.m,
              paddingHorizontal: spacing.m,
              paddingTop: Platform.OS === 'ios' ? spacing.xs : spacing.xxs,
              paddingBottom: Platform.OS === 'ios' ? spacing.s : spacing.xs,
              // Device-specific right padding
              paddingRight: getInputRightPadding(),
              // Adjusted left padding for newChat button
              paddingLeft: conversationSize > conversationWarningThreshold ? 
                (spacing.m + newChatButtonSize.width) : 
                spacing.m,
              lineHeight: LINE_HEIGHT,
            }
          ]}
          placeholder={isStreaming ? "AI is generating..." : placeholder}
          placeholderTextColor={isStreaming ? "#888888" : "#999999"}
          value={internalValue}
          onChangeText={handleTextChange}
          onContentSizeChange={handleContentSizeChange}
          multiline={true}
          scrollEnabled={inputHeight >= MAX_HEIGHT}
          returnKeyType="default"
          blurOnSubmit={false}
          editable={!disabled && !isStreaming}
          onFocus={onFocus}
          onBlur={onBlur}
          textAlignVertical="center"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel="Message input"
          accessibilityHint={isStreaming ? 
            "AI is currently generating a response" : 
            "Type your message to the AI assistant"
          }
          maxFontSizeMultiplier={accessibility.textScaleFactor.accessibilityLarge}
        />
        
        {/* Device-optimized send button positioning */}
        <View style={[
          styles.sendButtonContainer,
          { 
            right: getSendButtonRight(),
            width: sendButtonSize.width,
            height: '100%',
            backgroundColor: 'transparent' // Ensure transparency
          }
        ]}>
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                width: sendButtonSize.width,
                height: sendButtonSize.height,
                borderRadius: sendButtonSize.width / 2,
              },
              internalValue.trim() ? 
                (conversationSize + internalValue.length <= maxThreshold ? 
                  styles.sendButtonActive : 
                  styles.sendButtonWarning) : 
                styles.sendButtonInactive,
              (disabled || isStreaming) && { opacity: 0.5 }
            ]}
            onPress={handleSendPress}
            disabled={!internalValue.trim() || disabled || isStreaming}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              !internalValue.trim() ? "Send button disabled" :
              conversationSize + internalValue.length > maxThreshold ? "Start new conversation" :
              isStreaming ? "AI is responding" :
              "Send message"
            }
            accessibilityHint={
              !internalValue.trim() ? "Type a message to enable sending" :
              conversationSize + internalValue.length > maxThreshold ? 
                "Message would exceed limit, tap to start new conversation" :
              isStreaming ? "Please wait for AI response to complete" :
              "Sends your message to the AI assistant"
            }
          >
            <Ionicons 
              name="send" 
              size={scaleWidth(18)} 
              color={internalValue.trim() ? 
                (conversationSize + internalValue.length <= maxThreshold ? 
                  "#FFFFFF" : 
                  "#FFD700") : 
                "#888888"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    paddingHorizontal: spacing.m,
    paddingTop: scaleHeight(6),
    paddingBottom: Platform.OS === 'ios' ? scaleHeight(8) : scaleHeight(6),
    backgroundColor: '#000000',
  },
  charCountContainer: {
    alignItems: 'flex-end',
    marginBottom: spacing.xxs,
    marginRight: spacing.xxs,
  },
  charCount: {
    fontSize: fontSizes.xs,
    opacity: 0.8,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: scaleWidth(24),
    minHeight: scaleHeight(44),
    maxHeight: scaleHeight(150),
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    textAlignVertical: 'center',
    includeFontPadding: false,
    // Base right padding is set in the component for device-specific values
  },
  sendButtonContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    // Right position set inline for device-specific values
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#19C37D',
  },
  sendButtonWarning: {
    backgroundColor: '#FF9800',
  },
  sendButtonInactive: {
    backgroundColor: '#2A2A2A',
  },
  newChatButton: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    // Left position set inline for better control
  }
});

export default AIInputBar;
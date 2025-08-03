// src/components/ai/AIChat/index.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard,
  Animated,
  TouchableWithoutFeedback,
  InteractionManager,
  AccessibilityInfo
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import responsive utilities
import responsive, { 
  scaleWidth, 
  scaleHeight, 
  scaleFontSize, 
  spacing, 
  fontSizes,
  isSmallDevice,
  isTablet,
  accessibility,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  ensureAccessibleTouchTarget
} from '../../../utils/responsive';

import AIMessageList from './AIMessageList';
import AIInputBar from './AIInputBar';
import AISuggestionChips from './AISuggestionChips';
import AILoadingPlaceholder from './AILoadingPlaceholder';
import AIThinkingIndicator from './AIThinkingIndicator';

/**
 * AIChat - Main chat component with ChatGPT-style user message positioning
 * Alternative approach with extra top padding in the list
 */
const AIChat = ({ 
  messages = [], 
  isLoading = false,
  isStreaming = false,
  showSuggestions = false,
  onSendMessage,
  onSuggestionPress,
  onNewConversation,
  style = 'default',
  conversationId = null,
  warningThreshold = 40000,
  maxThreshold = 50000,
  aiTier = 'guide',
  introMessageId = 'intro' // Add this prop to identify the intro message
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [prevIsLoading, setPrevIsLoading] = useState(false);
  const [isThinkingVisible, setIsThinkingVisible] = useState(false);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const [conversationSizeWarningShown, setConversationSizeWarningShown] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [hideIntroMessage, setHideIntroMessage] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  
  // Get responsive values
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // Animation values
  const thinkingOpacity = useRef(new Animated.Value(0)).current;
  const suggestionsOpacity = useRef(new Animated.Value(showSuggestions ? 1 : 0)).current;
  const suggestionsHeight = useRef(new Animated.Value(showSuggestions ? scaleHeight(65) : 0)).current;
  const warningBannerOpacity = useRef(new Animated.Value(0)).current;
  const warningBannerHeight = useRef(new Animated.Value(0)).current;
  
  const flatListRef = useRef(null);
  const userScrolledManually = useRef(false);
  
  // Key variable to handle user message positioning
  const pendingUserMessageIndex = useRef(null);
  
  // Track if we've modified the list padding for this conversation
  const hasPaddingBeenModified = useRef(false);
  
  // Common suggestions
  const suggestions = [
    { id: '1', text: 'Help me define my strategic direction' },
    { id: '2', text: 'Create a goal for me' },
    { id: '3', text: 'Help me break down a big goal' },
    { id: '4', text: 'Schedule time for an activity' },
    { id: '5', text: 'Tips for staying consistent' },
    { id: '6', text: 'Add to-dos for today' }
  ];
  
  // Check for screen reader status
  useEffect(() => {
    const checkScreenReader = async () => {
      try {
        const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
        setScreenReaderEnabled(isEnabled);
      } catch (error) {
        console.log('Error checking screen reader:', error);
      }
    };
    
    checkScreenReader();
    
    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );
    
    return () => {
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);
  
  // Check if there are any user messages in the conversation
  const hasUserMessages = messages.some(m => m.type === 'user');
  
  // Filter out intro message if needed
  const filteredMessages = messages.filter(message => {
    // Keep the message if hideIntroMessage is false or if the message is not the intro message
    // OR if there are user messages in the conversation
    return !hideIntroMessage || message.id !== introMessageId || hasUserMessages;
  });
  
  // Effect to monitor new messages and handle positioning
  useEffect(() => {
    if (messages.length > prevMessagesLength) {
      // New message was added
      const lastMessage = messages[messages.length - 1];
      
      if (lastMessage.type === 'user') {
        console.log('New USER message detected - will position at top');
        
        // Check if this is the first user message
        const isFirstUserMessage = messages.filter(m => m.type === 'user').length === 1;
        
        // Hide intro message when first user message is sent
        if (isFirstUserMessage) {
          setHideIntroMessage(true);
        }
        
        // If this is the first user message, add extra padding to ensure space at top
        if (isFirstUserMessage && !hasPaddingBeenModified.current) {
          hasPaddingBeenModified.current = true;
          
          // Update the FlatList contentContainerStyle through a ref method
          if (flatListRef.current && flatListRef.current.setExtraPadding) {
            flatListRef.current.setExtraPadding(scaleHeight(200)); // Scale the padding appropriately
          }
        }
        
        // Store the pending position
        pendingUserMessageIndex.current = messages.length - 1;
        userScrolledManually.current = false;
        
        // Use InteractionManager to ensure UI is ready
        InteractionManager.runAfterInteractions(() => {
          if (flatListRef.current && pendingUserMessageIndex.current !== null) {
            console.log(`Positioning user message at index ${pendingUserMessageIndex.current}`);
            
            try {
              // Scroll the message to the top of the screen
              flatListRef.current.scrollToIndex({
                index: pendingUserMessageIndex.current,
                animated: true,
                viewPosition: 0, // 0 = top of screen
                viewOffset: scaleHeight(-80) // Scale negative offset to position higher
              });
              
              // Clear the pending position
              pendingUserMessageIndex.current = null;
            } catch (error) {
              console.log('ScrollToIndex failed:', error);
              
              // Fallback: Try again with a timeout
              setTimeout(() => {
                if (flatListRef.current && pendingUserMessageIndex.current !== null) {
                  try {
                    flatListRef.current.scrollToIndex({
                      index: pendingUserMessageIndex.current,
                      animated: true,
                      viewPosition: 0,
                      viewOffset: scaleHeight(-80)
                    });
                    pendingUserMessageIndex.current = null;
                  } catch (retryError) {
                    console.log('Retry scrollToIndex also failed:', retryError);
                    // Final fallback - just scroll to end
                    flatListRef.current.scrollToEnd({ animated: true });
                    pendingUserMessageIndex.current = null;
                  }
                }
              }, 300);
            }
          }
        });
        
        // Announce for screen readers
        if (screenReaderEnabled) {
          AccessibilityInfo.announceForAccessibility('New message sent');
        }
      } else if (lastMessage.type === 'ai') {
        console.log('AI message detected');
        
        // For AI messages, only scroll if not streaming (final positioning)
        if (!lastMessage.streaming && !userScrolledManually.current) {
          // Use InteractionManager for AI messages too
          InteractionManager.runAfterInteractions(() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: true });
            }
          });
        }
        
        // Announce for screen readers if message is complete
        if (!lastMessage.streaming && screenReaderEnabled) {
          AccessibilityInfo.announceForAccessibility('New response received');
        }
      }
    }
    
    setPrevMessagesLength(messages.length);
  }, [messages, messages.length, screenReaderEnabled]);
  
  // Reset padding state when conversation changes
  useEffect(() => {
    hasPaddingBeenModified.current = false;
    setHideIntroMessage(false); // Reset intro message visibility for new conversations
  }, [conversationId]);
  
  // Set up keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Platform.OS === 'ios' ? 
      Keyboard.addListener('keyboardWillShow', (event) => {
        const { height } = event.endCoordinates;
        setKeyboardHeight(height);
        setKeyboardVisible(true);
      }) : null;
      
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (event) => {
        const { height } = event.endCoordinates;
        
        if (Platform.OS === 'android') {
          setKeyboardHeight(height);
          setKeyboardVisible(true);
        }
      }
    );
    
    const keyboardWillHideListener = Platform.OS === 'ios' ? 
      Keyboard.addListener('keyboardWillHide', () => {
        setKeyboardVisible(false);
      }) : null;
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );
    
    return () => {
      if (keyboardWillShowListener?.remove) keyboardWillShowListener.remove();
      if (keyboardDidShowListener?.remove) keyboardDidShowListener.remove();
      if (keyboardWillHideListener?.remove) keyboardWillHideListener.remove();
      if (keyboardDidHideListener?.remove) keyboardDidHideListener.remove();
    };
  }, []);
  
  // Handle thinking indicator with minimum 0.5 second display time
  useEffect(() => {
    // Show thinking indicator when loading starts
    if (isLoading && !prevIsLoading) {
      setIsThinkingVisible(true);
      
      Animated.timing(thinkingOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
      
      // Announce loading state for screen readers
      if (screenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility('Processing your request');
      }
    }
    
    // Hide thinking indicator when streaming starts OR loading stops
    if (prevIsLoading && (!isLoading || isStreaming)) {
      Animated.timing(thinkingOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }).start(() => {
        setIsThinkingVisible(false);
      });
      
      // Announce when loading completes
      if (screenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility('Response ready');
      }
    }
    
    // Update previous loading state
    setPrevIsLoading(isLoading);
  }, [isLoading, isStreaming, prevIsLoading, screenReaderEnabled]);
  
  // Handle suggestions visibility with smooth animation
  useEffect(() => {
    const shouldShow = showSuggestions && !isLoading && !inputFocused && !keyboardVisible;
    
    Animated.parallel([
      Animated.timing(suggestionsOpacity, {
        toValue: shouldShow ? 1 : 0,
        duration: 200,
        useNativeDriver: false
      }),
      Animated.timing(suggestionsHeight, {
        toValue: shouldShow ? scaleHeight(65) : 0,
        duration: 250,
        useNativeDriver: false
      })
    ]).start();
  }, [showSuggestions, isLoading, inputFocused, keyboardVisible]);
  
  // Handle message selection
  const handleMessagePress = (messageId) => {
    setSelectedMessageId(messageId === selectedMessageId ? null : messageId);
  };
  
  // Handle user scrolling to prevent auto-scroll
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const contentHeight = event.nativeEvent.contentSize.height;
    const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
    
    if (offsetY < contentHeight - scrollViewHeight - 20) {
      userScrolledManually.current = true;
    } else {
      userScrolledManually.current = false;
    }
  };
  
  // Handle sending message - FOCUSED ON CHATGPT-STYLE POSITIONING
  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    
    const newMessageSize = inputText.trim().length;
    const totalSize = messages.reduce((total, msg) => 
      total + (msg.text ? msg.text.length : 0), 0) + newMessageSize;
    
    if (totalSize > maxThreshold) {
      if (onNewConversation) {
        onNewConversation();
      }
      return;
    }
    
    // Hide intro message immediately when user sends a message
    setHideIntroMessage(true);
    
    onSendMessage(inputText);
    setInputText('');
    userScrolledManually.current = false;
    
    // NOTE: Not scrolling here - the useEffect for messages will handle positioning
  };
  
  // Handle input focus/blur
  const handleInputFocus = () => {
    setInputFocused(true);
  };
  
  const handleInputBlur = () => {
    setTimeout(() => {
      setInputFocused(false);
    }, 50);
  };
  
  // Handle suggestion press
  const handleSuggestionPress = (suggestion) => {
    if (onSuggestionPress) {
      onSuggestionPress(suggestion);
      
      // Announce selection for screen readers
      if (screenReaderEnabled) {
        AccessibilityInfo.announceForAccessibility(`Selected suggestion: ${suggestion.text}`);
      }
    }
  };
  
  // Render size warning banner if needed
  const renderSizeWarning = () => {
    if (!showSizeWarning) return null;
    
    return (
      <Animated.View 
        style={[
          styles.sizeWarningBanner, 
          { 
            opacity: warningBannerOpacity,
            height: warningBannerHeight,
            backgroundColor: 'rgba(255, 152, 0, 0.1)'
          }
        ]}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLabel="Warning: Approaching conversation limit"
      >
        <Ionicons name="warning-outline" size={scaleWidth(14)} color="#FFD700" />
        <Text 
          style={[
            styles.sizeWarningText,
            { fontSize: fontSizes.xs }
          ]}
          maxFontSizeMultiplier={1.3}
        >
          Approaching conversation limit
        </Text>
      </Animated.View>
    );
  };
  
  // Calculate appropriate keyboard offset based on device and OS
  const getKeyboardOffset = () => {
    if (Platform.OS === 'ios') {
      return keyboardVisible ? 0 : scaleHeight(20);
    }
    return 0;
  };
  
  // Determine KeyboardAvoidingView behavior
  const avoidingBehavior = Platform.OS === 'ios' ? 'padding' : 'padding';
  
  // Custom footer component with animated thinking indicator
  const renderFooter = () => {
    // Show thinking indicator when it's visible (timing is handled in useEffect)
    if (!isThinkingVisible) return null;
    
    return (
      <Animated.View 
        style={{ opacity: thinkingOpacity }}
        accessible={true}
        accessibilityRole="progressbar"
        accessibilityLabel="Processing your request"
        accessibilityState={{ busy: true }}
      >
        <AIThinkingIndicator style={style} />
      </Animated.View>
    );
  };
  
  // Calculate extra top padding based on device size and orientation
  const getExtraTopPadding = () => {
    const basePadding = filteredMessages.some(m => m.type === 'user') ? 180 : 80;
    
    if (isTablet) {
      return isLandscape ? scaleHeight(basePadding * 1.2) : scaleHeight(basePadding * 1.1);
    } else if (isLandscape) {
      return scaleHeight(basePadding * 0.8);
    } else if (isSmallDevice) {
      return scaleHeight(basePadding * 0.9);
    }
    
    return scaleHeight(basePadding);
  };
  
  // Get suggestion container height
  const getSuggestionContainerHeight = () => {
    if (isTablet) {
      return scaleHeight(80);
    } else if (isSmallDevice) {
      return scaleHeight(60);
    }
    return scaleHeight(65);
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={avoidingBehavior}
      keyboardVerticalOffset={getKeyboardOffset()}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Chat interface"
    >
      <TouchableWithoutFeedback 
        onPress={() => Keyboard.dismiss()}
        accessible={true}
        accessibilityRole="none"
      >
        <View style={styles.messageListContainer}>
          {/* Message List - Using filteredMessages instead of messages */}
          <AIMessageList
            ref={flatListRef}
            messages={filteredMessages}
            selectedMessageId={selectedMessageId}
            onMessagePress={handleMessagePress}
            onScroll={handleScroll}
            style={style}
            shouldScrollToEnd={!userScrolledManually.current && pendingUserMessageIndex.current === null}
            ListFooterComponent={renderFooter()}
            keyboardVisible={keyboardVisible}
            isStreaming={isStreaming}
            extraTopPadding={getExtraTopPadding()}
          />
        </View>
      </TouchableWithoutFeedback>
      
      {/* Suggestion Chips */}
      <Animated.View 
        style={[
          styles.suggestionsContainer,
          {
            height: suggestionsHeight, 
            opacity: suggestionsOpacity,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            borderWidth: 0,
            paddingBottom: scaleHeight(2)
          }
        ]}
        accessible={true}
        accessibilityRole="menubar"
        accessibilityLabel="Suggestion chips"
        accessibilityHint="Select a suggestion to start a conversation"
        importantForAccessibility={showSuggestions && !isLoading && !inputFocused && !keyboardVisible ? 'yes' : 'no-hide-descendants'}
      >
        <AISuggestionChips 
          suggestions={suggestions} 
          onPress={handleSuggestionPress}
        />
      </Animated.View>
      
      {/* Size Warning Banner */}
      {renderSizeWarning()}
      
      {/* Input Bar */}
      <AIInputBar
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onNewConversation={onNewConversation}
        disabled={isLoading}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        conversationId={conversationId}
        conversationSize={filteredMessages.reduce((total, msg) => total + (msg.text ? msg.text.length : 0), 0)}
        conversationWarningThreshold={warningThreshold}
        maxThreshold={maxThreshold}
        aiTier={aiTier}
        isStreaming={isStreaming}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#000000',
    borderWidth: 0,
  },
  messageListContainer: {
    flex: 1,
    borderBottomWidth: 0,
    borderWidth: 0,
  },
  suggestionsContainer: {
    overflow: 'hidden',
    width: '100%',
    backgroundColor: '#000000',
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    borderWidth: 0,
    marginBottom: 1,
  },
  sizeWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.m,
    borderRadius: 0,
    overflow: 'hidden',
    width: '100%',
  },
  sizeWarningText: {
    color: '#FFD700',
    marginLeft: spacing.xxs,
    fontWeight: '500',
  }
});

export default AIChat;
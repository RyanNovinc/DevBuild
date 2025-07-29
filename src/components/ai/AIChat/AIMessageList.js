// src/components/ai/AIChat/AIMessageList.js - Fully optimized for responsive design and accessibility
import React, { forwardRef, useRef, useImperativeHandle, useState, useEffect } from 'react';
import { 
  FlatList, 
  StyleSheet, 
  Platform, 
  View, 
  Dimensions,
  AccessibilityInfo
} from 'react-native';
import AIMessageItem from './AIMessageItem';
import {
  scaleWidth,
  scaleHeight,
  spacing,
  useScreenDimensions,
  useIsLandscape,
  useSafeSpacing,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  getByDeviceSize,
  accessibility,
  createResponsiveStyles
} from '../../../utils/responsive';

/**
 * AIMessageList - Displays a list of chat messages with ChatGPT-style positioning
 * Fully optimized for responsive design and accessibility across all iOS devices
 */
const AIMessageList = forwardRef(({ 
  messages = [],
  selectedMessageId = null,
  onMessagePress,
  onScroll,
  style = 'default',
  shouldScrollToEnd = true,
  ListFooterComponent = null,
  keyboardVisible = false,
  isStreaming = false,
  extraTopPadding = 80 // Default padding, can be overridden by parent
}, ref) => {
  // Track custom padding value
  const [customPadding, setCustomPadding] = useState(0);
  
  // Get device dimensions and orientation
  const dimensions = useScreenDimensions();
  const isLandscape = useIsLandscape();
  const safeSpacing = useSafeSpacing();
  
  // Track if screen reader is enabled
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  
  // Check screen reader status on mount
  useEffect(() => {
    const checkScreenReader = async () => {
      const isEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      setScreenReaderEnabled(isEnabled);
    };
    
    checkScreenReader();
    
    // Listen for screen reader changes
    const subscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReaderEnabled
    );
    
    return () => {
      // Remove subscription on unmount
      subscription.remove();
    };
  }, []);
  
  // Create a ref to the FlatList
  const flatListRef = useRef(null);
  
  // Check if any user messages exist in the conversation
  const hasUserMessages = messages.some(msg => msg.type === 'user');
  
  // Expose the FlatList methods to parent component
  useImperativeHandle(ref, () => ({
    scrollToEnd: (params) => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd(params);
      }
    },
    scrollToIndex: (params) => {
      if (flatListRef.current) {
        flatListRef.current.scrollToIndex(params);
      }
    },
    // Add a method to set extra padding
    setExtraPadding: (padding) => {
      setCustomPadding(padding);
    }
  }));

  // Get device-specific spacing values
  const getDeviceTopPadding = () => {
    return getByDeviceSize({
      small: scaleHeight(70),
      medium: scaleHeight(100),
      large: scaleHeight(110),
      tablet: scaleHeight(130)
    });
  };

  // If there's only one message (the initial greeting), use absolute positioning
  // But only if there are no user messages
  if (messages.length === 1 && messages[0].type === 'ai' && !hasUserMessages) {
    // Get screen dimensions
    const { width } = dimensions;
    
    // Use a responsive position based on device size
    const FIXED_TOP_POSITION = getByDeviceSize({
      small: dimensions.height * 0.25,  // Higher on small devices
      medium: dimensions.height * 0.32, // Standard position for medium devices
      large: dimensions.height * 0.36,  // Lower on large devices
      tablet: dimensions.height * 0.4    // Even lower on tablets
    });
    
    // Adjust position for landscape mode
    const topPosition = isLandscape ? 
      dimensions.height * 0.15 : // Higher in landscape
      FIXED_TOP_POSITION;
    
    // Create the element with absolute positioning
    const messageElement = (
      <View 
        style={styles.absoluteContainer}
        accessible={true}
        accessibilityLabel="Welcome message"
        accessibilityHint="The initial AI greeting message"
        accessibilityRole="text"
      >
        <View style={[
          styles.fixedMessageContainer,
          { 
            position: 'absolute',
            top: topPosition,
            width: width,
            alignItems: 'center',
            zIndex: 50
          }
        ]}>
          <AIMessageItem
            message={messages[0]}
            isSelected={selectedMessageId === messages[0].id}
            onPress={() => onMessagePress(messages[0].id)}
            style={style}
            hasUserMessages={hasUserMessages}
          />
        </View>
      </View>
    );
    
    return messageElement;
  }

  // Render a regular chat message
  const renderMessage = ({ item, index }) => (
    <AIMessageItem
      message={item}
      isSelected={selectedMessageId === item.id}
      onPress={() => onMessagePress(item.id)}
      style={style}
      isLastUserMessage={item.type === 'user' && index === messages.findIndex(m => m.type === 'user')}
      hasUserMessages={hasUserMessages}
    />
  );

  // Handle scroll to index failures
  const handleScrollToIndexFailed = (error) => {
    console.log('ScrollToIndex failed:', error);
    
    // Research-based fallback: wait for layout then retry
    setTimeout(() => {
      if (flatListRef.current && error.index != null) {
        try {
          flatListRef.current.scrollToIndex({
            index: error.index,
            animated: true,
            viewPosition: 0
          });
        } catch (retryError) {
          console.log('Retry failed, falling back to scrollToEnd');
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    }, 300);
  };

  // Calculate the effective top padding to use based on device and orientation
  const baseTopPadding = getDeviceTopPadding();
  const effectiveTopPadding = Math.max(
    baseTopPadding, 
    extraTopPadding, 
    customPadding,
    safeSpacing.top + scaleHeight(16) // Ensure we're below the safe area
  );

  // Adjust bottom padding based on device and safe area
  const bottomPadding = scaleHeight(24) + safeSpacing.bottom;
  
  // Adjust horizontal padding based on device size
  const horizontalPadding = getByDeviceSize({
    small: spacing.xxs,
    medium: spacing.xs,
    large: spacing.xs,
    tablet: spacing.s
  });

  // Create accessible list properties
  const getAccessibilityProps = () => {
    if (screenReaderEnabled) {
      return {
        accessible: true,
        accessibilityLabel: "Chat messages",
        accessibilityHint: "List of conversation messages",
        accessibilityRole: "list"
      };
    }
    return {};
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={item => item.id}
      renderItem={renderMessage}
      contentContainerStyle={[
        styles.messagesList,
        { 
          paddingTop: effectiveTopPadding,
          paddingBottom: bottomPadding,
          paddingHorizontal: horizontalPadding
        },
        messages.length <= 2 && styles.fewMessagesContainer,
        isLandscape && styles.landscapeContainer
      ]}
      showsVerticalScrollIndicator={true}
      onScroll={onScroll}
      scrollEventThrottle={16}
      onContentSizeChange={() => {
        if (flatListRef.current && shouldScrollToEnd) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }}
      onScrollToIndexFailed={handleScrollToIndexFailed}
      ListFooterComponent={ListFooterComponent}
      style={styles.flatList}
      // Performance optimizations
      removeClippedSubviews={Platform.OS === 'android'}
      maxToRenderPerBatch={10}
      windowSize={21}
      initialNumToRender={isSmallDevice ? 5 : isTablet ? 15 : 10}
      keyboardShouldPersistTaps="handled"
      // Accessibility properties
      {...getAccessibilityProps()}
    />
  );
});

// Create responsive styles
const styles = StyleSheet.create({
  flatList: {
    backgroundColor: '#000000', // Match ChatGPT's black background
    borderWidth: 0, // Ensure no border
  },
  messagesList: {
    // Horizontal padding set dynamically in render
    // Top padding set dynamically in render
    // Bottom padding set dynamically in render
    borderWidth: 0, // Ensure no border
  },
  fewMessagesContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  landscapeContainer: {
    paddingHorizontal: spacing.xl, // Extra horizontal space in landscape
  },
  absoluteContainer: {
    flex: 1,
    backgroundColor: '#000000',
    borderWidth: 0,
    position: 'relative',
  },
  fixedMessageContainer: {
    padding: spacing.m,
    borderWidth: 0,
  }
});

export default AIMessageList;
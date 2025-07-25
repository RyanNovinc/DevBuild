// src/screens/Onboarding/components/TypingAnimation.js
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Text, View } from 'react-native';

/**
 * TypingAnimation - Text typing animation component with ref support for external control
 * 
 * @param {string} text - The text to animate
 * @param {number} typingSpeed - The speed of typing in milliseconds
 * @param {function} onComplete - Callback when typing is complete
 * @param {boolean} skipTyping - Skip animation and show full text immediately
 * @param {object} style - Additional text styling
 */
const TypingAnimation = forwardRef(({ 
  text, 
  typingSpeed = 30, 
  onComplete, 
  skipTyping = false,
  style = {} 
}, ref) => {
  // Use ref for displayed text to prevent re-renders during typing
  const displayedTextRef = useRef('');
  
  // Use state only for triggering re-renders
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Refs for animation state
  const textIndexRef = useRef(0);
  const typingTimerRef = useRef(null);
  const isCompletedRef = useRef(false);
  
  // Track if component is mounted
  const isMountedRef = useRef(false);
  
  // Track if animation was started
  const animationStartedRef = useRef(false);
  
  // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    // Complete typing immediately - can be called by parent
    complete: () => {
      completeTypingImmediately();
    },
    // Check if typing is complete
    isComplete: () => {
      return isCompletedRef.current;
    },
    // Reset and start over - added for language changes
    reset: () => {
      if (isMountedRef.current) {
        // Reset state
        textIndexRef.current = 0;
        displayedTextRef.current = '';
        isCompletedRef.current = false;
        setForceUpdate(prev => prev + 1);
        
        // Start typing again
        if (!skipTyping) {
          if (typingTimerRef.current) {
            clearTimeout(typingTimerRef.current);
          }
          typeNextCharacter();
        } else {
          // If skipping, show full text
          displayedTextRef.current = text;
          setForceUpdate(prev => prev + 1);
        }
      }
    }
  }));
  
  // Initialize on mount
  useEffect(() => {
    isMountedRef.current = true;
    
    // Only start typing animation once the component is fully mounted
    // This prevents double animations
    const startTimeout = setTimeout(() => {
      if (isMountedRef.current && !animationStartedRef.current) {
        animationStartedRef.current = true;
        
        if (skipTyping) {
          // Show full text immediately
          displayedTextRef.current = text;
          setForceUpdate(prev => prev + 1);
          
          if (onComplete && !isCompletedRef.current) {
            isCompletedRef.current = true;
            onComplete();
          }
        } else {
          // Start typing animation
          startTypingAnimation();
        }
      }
    }, 50); // Short delay to ensure component is properly mounted
    
    return () => {
      // Clean up on unmount
      isMountedRef.current = false;
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      clearTimeout(startTimeout);
    };
  }, []);
  
  // Watch for text changes
  useEffect(() => {
    // If text changes while component is mounted, update the target text
    if (animationStartedRef.current) {
      if (skipTyping) {
        // If skipping, just show full text
        displayedTextRef.current = text;
        setForceUpdate(prev => prev + 1);
      } else if (text !== displayedTextRef.current) {
        // Reset and start typing with the new text
        textIndexRef.current = 0;
        displayedTextRef.current = '';
        isCompletedRef.current = false;
        
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        
        // Start typing with the new text
        typeNextCharacter();
      }
    }
  }, [text, skipTyping]);
  
  // Start typing animation
  const startTypingAnimation = () => {
    // Reset state
    textIndexRef.current = 0;
    displayedTextRef.current = '';
    isCompletedRef.current = false;
    
    // Start typing first character
    typeNextCharacter();
  };
  
  // Type the next character
  const typeNextCharacter = () => {
    if (!isMountedRef.current) return;
    
    if (textIndexRef.current < text.length) {
      // Update displayed text with next character
      displayedTextRef.current = text.substring(0, textIndexRef.current + 1);
      
      // Force a re-render with the new text
      setForceUpdate(prev => prev + 1);
      
      // Increment character index
      textIndexRef.current++;
      
      // Schedule next character
      typingTimerRef.current = setTimeout(typeNextCharacter, typingSpeed);
    } 
    else if (!isCompletedRef.current) {
      // Animation complete
      isCompletedRef.current = true;
      
      if (onComplete && isMountedRef.current) {
        onComplete();
      }
    }
  };
  
  // Complete typing immediately
  const completeTypingImmediately = () => {
    if (!isMountedRef.current || isCompletedRef.current) return;
    
    // Clear any existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    
    // Show the complete text
    displayedTextRef.current = text;
    setForceUpdate(prev => prev + 1);
    
    // Call completion callback if not already completed
    if (!isCompletedRef.current && onComplete) {
      isCompletedRef.current = true;
      onComplete();
    }
  };
  
  return (
    <View>
      <Text style={[{ fontSize: 15, color: '#FFFFFF', lineHeight: 22 }, style]}>
        {displayedTextRef.current}
      </Text>
    </View>
  );
});

// Fix for "Component is not a function" error - proper forwardRef export
TypingAnimation.displayName = 'TypingAnimation';

export default TypingAnimation;
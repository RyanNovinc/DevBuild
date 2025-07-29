// src/screens/Onboarding/components/ui/AIMessage.js
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scale } from '../../styles/onboardingStyles';

/**
 * Ultra-simplified AIMessage component with proper text display
 * Uses a class component with a simple character-by-character animation
 */
class AIMessage extends React.Component {
  constructor(props) {
    super(props);
    
    // Use simple state with a single string value to prevent re-render issues
    this.state = {
      displayedText: ''
    };
    
    // Instance variables
    this.fullText = props.fullText || '';
    this.animationTimer = null;
    this.isTypingComplete = false;
    this.charIndex = 0;
    this.isComponentMounted = false;
  }
  
  componentDidMount() {
    this.isComponentMounted = true;
    
    // Start typing animation after a short delay
    this.animationTimer = setTimeout(() => {
      this.startTyping();
    }, this.props.initialDelay || 300);
  }
  
  componentWillUnmount() {
    this.isComponentMounted = false;
    this.clearTimer();
  }
  
  clearTimer() {
    if (this.animationTimer) {
      clearTimeout(this.animationTimer);
      this.animationTimer = null;
    }
  }
  
  // Start typing animation
  startTyping = () => {
    this.typeNextCharacter();
  };
  
  // Type the next character
  typeNextCharacter = () => {
    if (!this.isComponentMounted) return;
    
    const { fullText, typingSpeed = 30, onTypingComplete } = this.props;
    
    if (this.charIndex < fullText.length) {
      // Update displayed text with next character
      this.setState({
        displayedText: fullText.substring(0, this.charIndex + 1)
      });
      
      // Increment character index
      this.charIndex++;
      
      // Schedule next character
      this.animationTimer = setTimeout(this.typeNextCharacter, typingSpeed);
    } 
    else if (!this.isTypingComplete) {
      // Animation complete
      this.isTypingComplete = true;
      
      if (onTypingComplete && this.isComponentMounted) {
        onTypingComplete();
      }
    }
  };
  
  // Complete typing immediately
  completeTypingImmediately = () => {
    if (!this.isComponentMounted) return;
    
    // Clear any existing timer
    this.clearTimer();
    
    // Show the complete text
    this.setState({
      displayedText: this.props.fullText
    });
    
    // Call completion callback if not already completed
    if (!this.isTypingComplete && this.props.onTypingComplete) {
      this.isTypingComplete = true;
      this.props.onTypingComplete();
    }
  };
  
  render() {
    return (
      <TouchableOpacity 
        style={styles.container}
        onPress={this.completeTypingImmediately}
        activeOpacity={0.9}
      >
        <View style={styles.messageContainer}>
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="sparkles" size={18} color="#FFD700" />
            </View>
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.messageText}>
              {this.state.displayedText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 30, 0.7)',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#2563eb',
    shadowColor: '#1e3a8a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 58, 138, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.7)',
  },
  textContainer: {
    flex: 1,
  },
  messageText: {
    fontSize: scale(15, 0.3),
    color: '#FFFFFF',
    lineHeight: 22,
  }
});

export default AIMessage;
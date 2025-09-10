// src/components/ai/AIUsageWarning.js
import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scaleWidth, scaleHeight, scaleFontSize, spacing, fontSizes } from '../../utils/responsive';

const AIUsageWarning = ({ 
  type = 'none', // 'none', 'approaching', 'limited', 'conversation', 'conversation_early', 'conversation_final'
  timeUntilReset = '',
  onDismiss = null,
  onStartNewConversation = null
}) => {
  
  if (type === 'none') {
    return null;
  }

  const getWarningConfig = () => {
    switch (type) {
      case 'approaching':
        return {
          icon: 'warning-outline',
          iconColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderColor: '#FF9800',
          title: 'Approaching usage limit',
          message: `Your AI usage will reset in ${timeUntilReset}`,
          showDismiss: true
        };
      
      case 'limited':
        return {
          icon: 'stop-circle-outline',
          iconColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderColor: '#F44336',
          title: 'Usage limit reached',
          message: `Your AI usage resets in ${timeUntilReset}`,
          showDismiss: false
        };
      
      case 'conversation':
        return {
          icon: 'chatbubbles-outline',
          iconColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderColor: '#2196F3',
          title: 'Long conversation detected',
          message: 'Consider starting a new conversation for best performance',
          showDismiss: true,
          showNewConversation: true
        };

      case 'conversation_early':
        return {
          icon: 'chatbubbles-outline',
          iconColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          borderColor: '#FF9800',
          title: 'Conversation getting long',
          message: 'Your conversation is getting long. Consider starting fresh soon for better performance.',
          showDismiss: true,
          showNewConversation: true
        };

      case 'conversation_final':
        return {
          icon: 'chatbubbles-outline',
          iconColor: '#F44336',
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          borderColor: '#F44336',
          title: 'Conversation nearly full',
          message: 'Your next message may be the last one in this chat. Consider starting a new conversation.',
          showDismiss: true,
          showNewConversation: true
        };
      
      default:
        return null;
    }
  };

  const config = getWarningConfig();
  
  if (!config) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor
        }
      ]}
    >
      <View style={styles.content}>
        <Ionicons 
          name={config.icon} 
          size={scaleWidth(20)} 
          color={config.iconColor} 
          style={styles.icon}
        />
        
        <View style={styles.textContainer}>
          <Text 
            style={[styles.title, { color: config.iconColor }]}
            maxFontSizeMultiplier={1.2}
          >
            {config.title}
          </Text>
          <Text 
            style={styles.message}
            maxFontSizeMultiplier={1.2}
          >
            {config.message}
          </Text>
        </View>

        <View style={styles.actions}>
          {config.showNewConversation && onStartNewConversation && (
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: config.iconColor }]}
              onPress={onStartNewConversation}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Start new conversation"
            >
              <Text 
                style={[styles.actionButtonText, { color: config.iconColor }]}
                maxFontSizeMultiplier={1.2}
              >
                New Chat
              </Text>
            </TouchableOpacity>
          )}
          
          {config.showDismiss && onDismiss && (
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Dismiss warning"
            >
              <Ionicons 
                name="close" 
                size={scaleWidth(18)} 
                color="#666666" 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.m,
    marginTop: spacing.s,
    borderRadius: scaleWidth(12),
    borderWidth: 1,
    overflow: 'hidden'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m
  },
  icon: {
    marginRight: spacing.m
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.s
  },
  title: {
    fontSize: fontSizes.s,
    fontWeight: '600',
    marginBottom: spacing.xs
  },
  message: {
    fontSize: fontSizes.xs,
    color: '#666666',
    lineHeight: scaleHeight(16)
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: scaleWidth(6),
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.xs,
    marginRight: spacing.s
  },
  actionButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: '500'
  },
  dismissButton: {
    padding: spacing.xs
  }
});

export default AIUsageWarning;
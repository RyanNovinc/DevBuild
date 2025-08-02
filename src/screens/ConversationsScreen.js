// src/screens/ConversationsScreen.js - With date categories and 50 conversation limit
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AIService from '../services/AIService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateConversationTitle } from '../utils/conversationUtils';

const LAST_CHAT_KEY = 'currentConversationId';
const MAX_CONVERSATIONS = 50;

// Helper function to determine text color based on background
const getContrastTextColor = (bgColor) => {
  // Default to white if theme is dark or undefined
  if (!bgColor || bgColor === '#000000') return '#FFFFFF';
  
  // For minimalist light theme with white primary, use black text
  if (bgColor === '#FFFFFF') return '#000000';
  
  // For any other colored themes, determine by brightness
  // Strip any alpha channel and convert to RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate brightness (standard formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
  // Use black text on light backgrounds, white text on dark
  return brightness > 125 ? '#000000' : '#FFFFFF';
};

// Helper function to check if a conversation has user messages
const hasUserMessages = (conversation) => {
  if (!conversation || !conversation.messages || !Array.isArray(conversation.messages)) {
    return false;
  }
  
  // Check if any message is from the user
  return conversation.messages.some(msg => msg.type === 'user');
};

// Helper function to format dates into sections
const formatDateSections = (conversations) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);
  
  const sections = [
    { title: 'Today', data: [] },
    { title: 'Yesterday', data: [] },
    { title: 'This Week', data: [] },
    { title: 'Earlier', data: [] }
  ];
  
  conversations.forEach(conversation => {
    const conversationDate = new Date(conversation.updatedAt || conversation.createdAt || Date.now());
    
    if (conversationDate >= today) {
      sections[0].data.push(conversation);
    } else if (conversationDate >= yesterday) {
      sections[1].data.push(conversation);
    } else if (conversationDate >= lastWeek) {
      sections[2].data.push(conversation);
    } else {
      sections[3].data.push(conversation);
    }
  });
  
  // Filter out empty sections
  return sections.filter(section => section.data.length > 0);
};

// Generate a preview from messages
const generatePreview = (messages) => {
  if (!messages || messages.length === 0) {
    return 'New conversation';
  }
  
  // If the conversation already has a title property, use that
  if (messages.title) {
    return messages.title;
  }
  
  // Otherwise generate a title using our smart summarization
  return generateConversationTitle(messages);
};

const ConversationsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteCountdown, setConfirmDeleteCountdown] = useState(0);
  const countdownTimerRef = useRef(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const allConversations = await AIService.getConversations();
        
        // Filter out conversations that don't have any user messages
        const validConversations = allConversations.filter(conversation => {
          return hasUserMessages(conversation);
        });
        
        console.log(`Filtered out ${allConversations.length - validConversations.length} empty conversations`);
        
        // Sort by most recent
        validConversations.sort((a, b) => 
          new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
        );
        
        // Check for conversation limit
        if (validConversations.length > MAX_CONVERSATIONS) {
          // Remove oldest conversations to stay within limit
          const conversationsToDelete = validConversations.slice(MAX_CONVERSATIONS);
          
          // Delete oldest conversations from storage
          for (const conversation of conversationsToDelete) {
            try {
              await AIService.deleteConversation(conversation._id);
              console.log(`Deleted oldest conversation ${conversation._id} to stay within limit`);
            } catch (error) {
              console.error(`Error deleting conversation ${conversation._id}:`, error);
            }
          }
          
          // Keep only the MAX_CONVERSATIONS most recent conversations
          const limitedConversations = validConversations.slice(0, MAX_CONVERSATIONS);
          setConversations(limitedConversations);
          
          // Format into date sections
          const formattedSections = formatDateSections(limitedConversations);
          setSections(formattedSections);
        } else {
          setConversations(validConversations);
          
          // Format into date sections
          const formattedSections = formatDateSections(validConversations);
          setSections(formattedSections);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Set up navigation listener to refresh when focusing screen
    const unsubscribe = navigation.addListener('focus', loadConversations);
    return unsubscribe;
  }, [navigation]);

  // Start countdown for clear all confirmation
  const startClearAllCountdown = () => {
    setConfirmDeleteCountdown(3);
    
    // Reset any existing timer
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    
    // Create a new timer that decrements the counter every second
    countdownTimerRef.current = setInterval(() => {
      setConfirmDeleteCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle clear all conversations
  const handleClearAllConversations = () => {
    // Don't show confirmation if there are no conversations
    if (conversations.length === 0) {
      Alert.alert('No Conversations', 'There are no conversations to clear.');
      return;
    }

    // Show alert with countdown
    Alert.alert(
      'Clear All Conversations',
      'Are you sure you want to delete all conversations? This action cannot be undone.',
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              setConfirmDeleteCountdown(0);
            }
          }
        },
        { 
          text: confirmDeleteCountdown > 0 ? `Clear All (${confirmDeleteCountdown}s)` : 'Clear All', 
          style: 'destructive',
          disabled: confirmDeleteCountdown > 0,
          onPress: async () => {
            // If countdown is still active, do nothing
            if (confirmDeleteCountdown > 0) {
              startClearAllCountdown(); // Re-start the countdown if it's not yet zero
              return;
            }
            
            try {
              // Clear all conversations
              await AIService.clearAllConversations();
              
              // Also clear the last conversation reference
              await AsyncStorage.removeItem(LAST_CHAT_KEY);
              
              // Update state
              setConversations([]);
              setSections([]);
              Alert.alert('Success', 'All conversations have been deleted.');
            } catch (error) {
              console.error('Error clearing all conversations:', error);
              Alert.alert(
                'Error',
                'There was a problem clearing conversations. Please try again.'
              );
            }
          }
        }
      ],
      { cancelable: true }
    );
    
    // Start the countdown
    startClearAllCountdown();
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show date with year
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Handle new conversation
  const handleNewConversation = () => {
    navigation.navigate('AIAssistant', { conversationId: null });
  };

  // Handle opening a conversation
  const handleOpenConversation = async (conversationId) => {
    // Save this as the last conversation
    await AsyncStorage.setItem(LAST_CHAT_KEY, conversationId);
    navigation.navigate('AIAssistant', { conversationId });
  };

  // Share conversation
  const handleShareConversation = async (conversation) => {
    try {
      // Get conversation messages
      const messages = conversation.messages || [];
      
      // Format messages for sharing
      const chatText = messages.map(msg => {
        const speaker = msg.type === 'ai' ? 'LifeCompassAI' : 'You';
        const timestamp = new Date(msg.timestamp).toLocaleString();
        return `${speaker} (${timestamp}):\n${msg.text}\n`;
      }).join('\n---\n\n');
      
      // Use Share API to share the text
      await Share.share({
        message: chatText,
        title: 'Conversation with LifeCompassAI'
      });
    } catch (error) {
      console.error('Error sharing conversation:', error);
      Alert.alert('Error', 'Failed to share conversation');
    }
  };

  // Handle deleting a conversation
  const handleDeleteConversation = (conversation) => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AIService.deleteConversation(conversation._id);
              
              // If this was the last conversation, remove the reference
              const lastChatId = await AsyncStorage.getItem(LAST_CHAT_KEY);
              if (lastChatId === conversation._id) {
                await AsyncStorage.removeItem(LAST_CHAT_KEY);
              }
              
              // Update conversations state
              const updatedConversations = conversations.filter(c => c._id !== conversation._id);
              setConversations(updatedConversations);
              
              // Update sections
              const updatedSections = formatDateSections(updatedConversations);
              setSections(updatedSections);
              
            } catch (error) {
              console.error('Error deleting conversation:', error);
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ],
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="chatbubble-ellipses-outline" size={64} color={theme.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No Conversations Yet</Text>
        <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
          Start a new conversation with the AI assistant
        </Text>
        <TouchableOpacity
          style={[styles.newButton, { backgroundColor: theme.primary }]}
          onPress={handleNewConversation}
        >
          <Text style={[styles.newButtonText, { color: getContrastTextColor(theme.primary) }]}>
            New Conversation
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render conversation item
  const renderItem = ({ item }) => {
    // Generate preview if not available
    const preview = item.title || generatePreview(item.messages);
    
    return (
      <TouchableOpacity
        style={[styles.conversationItem, { backgroundColor: theme.card }]}
        onPress={() => handleOpenConversation(item._id)}
      >
        <View style={styles.conversationIcon}>
          <Ionicons name="sparkles" size={20} color={theme.primary} />
        </View>
        <View style={styles.conversationContent}>
          <Text style={[styles.conversationTitle, { color: theme.text }]} numberOfLines={1}>
            {preview}
          </Text>
        </View>
        <View style={styles.conversationRight}>
          <Text style={[styles.conversationDate, { color: theme.textSecondary }]}>
            {formatDate(item.updatedAt)}
          </Text>
          <View style={styles.conversationActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleShareConversation(item)}
            >
              <Ionicons name="share-outline" size={18} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDeleteConversation(item)}
            >
              <Ionicons name="trash-outline" size={18} color={theme.error || '#ff3b30'} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Render section header
  const renderSectionHeader = ({ section }) => (
    <View style={[styles.sectionHeader, { backgroundColor: theme.background }]}>
      <Text style={[styles.sectionHeaderText, { color: theme.text }]}>
        {section.title}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Conversations</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[
              styles.clearAllButton,
              {
                backgroundColor: theme.error + '15',
                borderColor: conversations.length === 0 ? theme.textSecondary + '50' : theme.error
              }
            ]}
            onPress={handleClearAllConversations}
            disabled={conversations.length === 0}
          >
            <Ionicons 
              name="trash-outline" 
              size={18} 
              color={conversations.length === 0 ? theme.textSecondary + '50' : theme.error || '#ff3b30'} 
            />
            <Text 
              style={[
                styles.clearAllText, 
                { color: conversations.length === 0 ? theme.textSecondary + '50' : theme.error || '#ff3b30' }
              ]}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conversation count indicator */}
      <View style={[styles.countContainer, { backgroundColor: theme.card }]}>
        <Text style={[styles.countText, { color: theme.textSecondary }]}>
          {conversations.length}/{MAX_CONVERSATIONS} Conversations
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading conversations...
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item._id || item.id || String(Math.random())}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={[
            styles.listContent,
            conversations.length === 0 && styles.emptyList
          ]}
          ListEmptyComponent={renderEmptyState}
          stickySectionHeadersEnabled={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 10,
  },
  clearAllText: {
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 13,
  },
  countContainer: {
    padding: 8,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginLeft: -16,
    marginRight: -16,
    marginTop: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  newButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  newButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    marginTop: 4,
  },
  conversationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  conversationContent: {
    flex: 1,
    paddingRight: 12,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  conversationRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  conversationDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  conversationActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ConversationsScreen;
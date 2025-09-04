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
  Share,
  Modal,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as AIService from '../services/AIService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateConversationTitle } from '../utils/conversationUtils';

const LAST_CHAT_KEY = 'currentConversationId';
const MAX_CONVERSATIONS = 100;

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
  
  // Modal states for custom popups
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Modal animation functions
  const showModal = (setModalVisible) => {
    setModalVisible(true);
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.9);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      })
    ]).start();
  };

  const hideModal = (setModalVisible, callback) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      })
    ]).start(() => {
      setModalVisible(false);
      if (callback) callback();
    });
  };

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
      return;
    }

    // Show custom confirmation modal
    showModal(setShowClearConfirmModal);
    startClearAllCountdown();
  };

  // Handle confirm clear all
  const handleConfirmClearAll = async () => {
    // If countdown is still active, do nothing
    if (confirmDeleteCountdown > 0) {
      return;
    }
    
    try {
      // Hide confirm modal first
      hideModal(setShowClearConfirmModal);
      
      // Clear all conversations
      await AIService.clearAllConversations();
      
      // Also clear the last conversation reference
      await AsyncStorage.removeItem(LAST_CHAT_KEY);
      
      // Update state
      setConversations([]);
      setSections([]);
      
      // Show success modal
      setTimeout(() => {
        showModal(setShowSuccessModal);
        
        // After showing success modal, wait a bit then navigate back with clear signal
        setTimeout(() => {
          hideModal(setShowSuccessModal, () => {
            // Navigate back to AIAssistant with clearAll flag
            navigation.navigate('AIAssistant', { 
              conversationId: null, 
              clearAll: true 
            });
          });
        }, 1500);
      }, 300);
    } catch (error) {
      console.error('Error clearing all conversations:', error);
      Alert.alert(
        'Error',
        'There was a problem clearing conversations. Please try again.'
      );
    }
  };

  // Handle cancel clear all
  const handleCancelClearAll = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      setConfirmDeleteCountdown(0);
    }
    hideModal(setShowClearConfirmModal);
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
    
    // Debug logging for title generation
    if (__DEV__) {
      console.log(`📋 [TITLE DEBUG] ConversationItem ID: ${item._id}`);
      console.log(`📋 [TITLE DEBUG] Raw item.title: "${item.title}" (length: ${item.title?.length || 0})`);
      console.log(`📋 [TITLE DEBUG] Final preview: "${preview}" (length: ${preview.length})`);
      console.log(`📋 [TITLE DEBUG] Using item.title: ${!!item.title}, messages length: ${item.messages?.length || 0}`);
    }
    
    return (
      <TouchableOpacity
        style={[styles.conversationItem, { backgroundColor: theme.card }]}
        onPress={() => handleOpenConversation(item._id)}
      >
        <View style={styles.conversationIcon}>
          <Ionicons name="sparkles" size={20} color={theme.primary} />
        </View>
        <View style={styles.conversationContent}>
          <Text style={[styles.conversationTitle, { color: theme.text }]}>
            {preview}
          </Text>
          <View style={styles.conversationMeta}>
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
    <>
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
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() => showModal(setShowInfoModal)}
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
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

    {/* Custom Clear Confirmation Modal */}
    <Modal
      transparent={true}
      visible={showClearConfirmModal}
      animationType="none"
      onRequestClose={handleCancelClearAll}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.modalOverlayTouchable}
          activeOpacity={1}
          onPress={handleCancelClearAll}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.surface || theme.card,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.modalIcon}>
            <Ionicons name="trash-outline" size={28} color="#FF3B30" />
          </View>
          
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Clear All Conversations
          </Text>
          
          <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
            Are you sure you want to delete all conversations? This action cannot be undone.
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={handleCancelClearAll}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modalButton, 
                styles.modalDeleteButton,
                { 
                  backgroundColor: confirmDeleteCountdown > 0 ? theme.textSecondary + '20' : '#FF3B30',
                  opacity: confirmDeleteCountdown > 0 ? 0.6 : 1
                }
              ]}
              onPress={handleConfirmClearAll}
              activeOpacity={0.7}
              disabled={confirmDeleteCountdown > 0}
            >
              <Text style={[styles.modalButtonText, styles.modalDeleteButtonText]}>
                {confirmDeleteCountdown > 0 ? `Clear All (${confirmDeleteCountdown}s)` : 'Clear All'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>

    {/* Custom Success Modal */}
    <Modal
      transparent={true}
      visible={showSuccessModal}
      animationType="none"
      onRequestClose={() => hideModal(setShowSuccessModal)}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.modalOverlayTouchable}
          activeOpacity={1}
          onPress={() => hideModal(setShowSuccessModal)}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.surface || theme.card,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.modalIcon}>
            <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
          </View>
          
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Success
          </Text>
          
          <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
            All conversations have been deleted successfully.
          </Text>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.modalSuccessButton]}
            onPress={() => hideModal(setShowSuccessModal)}
            activeOpacity={0.7}
          >
            <Text style={[styles.modalButtonText, styles.modalSuccessButtonText]}>
              OK
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>

    {/* Info Modal */}
    <Modal
      transparent={true}
      visible={showInfoModal}
      animationType="none"
      onRequestClose={() => hideModal(setShowInfoModal)}
    >
      <Animated.View
        style={[
          styles.modalOverlay,
          {
            opacity: fadeAnim
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.modalOverlayTouchable}
          activeOpacity={1}
          onPress={() => hideModal(setShowInfoModal)}
        />
        <Animated.View
          style={[
            styles.modalContainer,
            {
              backgroundColor: theme.surface || theme.card,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.modalIcon}>
            <Ionicons name="information-circle" size={28} color={theme.primary} />
          </View>
          
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Conversation Storage
          </Text>
          
          <Text style={[styles.modalMessage, { color: theme.textSecondary }]}>
            Your conversations are saved locally on this device. When you reach 100 conversations, your oldest conversation will be automatically deleted to make room for new ones.
          </Text>
          
          <TouchableOpacity
            style={[styles.modalButton, styles.modalInfoButton, { backgroundColor: theme.primary }]}
            onPress={() => hideModal(setShowInfoModal)}
            activeOpacity={0.7}
          >
            <Text style={[styles.modalButtonText, styles.modalInfoButtonText]}>
              Got it
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  </>
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
    flexDirection: 'row',
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  infoButton: {
    marginLeft: 8,
    padding: 4,
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
    alignItems: 'flex-start',
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
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 8,
  },
  conversationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationDate: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
  },
  conversationActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Custom Modal Styles - Clean, Minimalistic, Professional
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.25,
    shadowRadius: 28,
    elevation: 12,
  },
  modalIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
    opacity: 0.85,
    paddingHorizontal: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  modalCancelButton: {
    borderWidth: 1.5,
  },
  modalDeleteButton: {
    backgroundColor: '#FF3B30',
  },
  modalSuccessButton: {
    backgroundColor: '#4CAF50',
    width: '60%',
    alignSelf: 'center',
  },
  modalButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalDeleteButtonText: {
    color: '#FFFFFF',
  },
  modalSuccessButtonText: {
    color: '#FFFFFF',
  },
  modalInfoButton: {
    width: '60%',
    alignSelf: 'center',
  },
  modalInfoButtonText: {
    color: '#FFFFFF',
  },
});

export default ConversationsScreen;
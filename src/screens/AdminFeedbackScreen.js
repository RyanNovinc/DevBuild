// src/screens/AdminFeedbackScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';

const AdminFeedbackScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new', 'in_progress', 'resolved', 'ignored'
  const [clearingItems, setClearingItems] = useState(false);

  // Fetch all feedback items
  const fetchFeedback = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setFeedbackItems(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      Alert.alert('Error', 'Failed to load feedback items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchFeedback();
  }, []);

  // Pull to refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchFeedback();
  };

  // Update feedback status
  const updateFeedbackStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setFeedbackItems(feedbackItems.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      ));
      
      Alert.alert('Success', `Feedback marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating feedback:', error);
      Alert.alert('Error', 'Failed to update feedback status');
    }
  };

  // Clear all feedback with a specific status (deleted from Supabase)
  const clearFeedbackByStatus = async (status) => {
    const statusLabel = status.replace('_', ' ');
    
    Alert.alert(
      `Clear All ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}`,
      `This will permanently delete all ${statusLabel} feedback. This action cannot be undone. Are you sure?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearingItems(true);
              
              const { error } = await supabase
                .from('feedback')
                .delete()
                .eq('status', status);
                
              if (error) throw error;
              
              // Update local state by removing all items with this status
              setFeedbackItems(feedbackItems.filter(item => item.status !== status));
              
              Alert.alert('Success', `All ${statusLabel} feedback has been cleared`);
            } catch (error) {
              console.error(`Error clearing ${statusLabel} feedback:`, error);
              Alert.alert('Error', `Failed to clear ${statusLabel} feedback`);
            } finally {
              setClearingItems(false);
            }
          }
        }
      ]
    );
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return theme.warning || '#FB8C00';
      case 'in_progress': return theme.info || '#2196F3';
      case 'resolved': return theme.success || '#4CAF50';
      case 'ignored': return theme.error || '#F44336';
      default: return theme.textSecondary;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get icon for feedback type
  const getFeedbackTypeIcon = (type) => {
    switch (type) {
      case 'suggestion': return 'bulb-outline';
      case 'issue': return 'bug-outline';
      case 'feature': return 'add-circle-outline';
      default: return 'chatbox-outline';
    }
  };

  // Filter feedback based on active tab
  const filteredFeedback = feedbackItems.filter(item => item.status === activeTab);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Feedback Admin</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading feedback...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Feedback Admin</Text>
        <TouchableOpacity onPress={fetchFeedback}>
          <Ionicons name="refresh" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {['new', 'in_progress', 'resolved', 'ignored'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { 
                borderBottomWidth: 2, 
                borderBottomColor: getStatusColor(tab) 
              }
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Text 
              style={[
                styles.tabText, 
                { 
                  color: activeTab === tab ? getStatusColor(tab) : theme.textSecondary,
                  fontWeight: activeTab === tab ? '600' : '400',
                  fontSize: tab === 'in_progress' ? 11 : 12
                }
              ]}
            >
              {tab === 'in_progress' ? 'In Progress' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              {' '}
              ({feedbackItems.filter(item => item.status === tab).length})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Clear All button for resolved tab */}
      {activeTab === 'resolved' && filteredFeedback.length > 0 && (
        <View style={styles.clearAllContainer}>
          <TouchableOpacity
            style={[styles.clearAllButton, { backgroundColor: theme.error + '15' }]}
            onPress={() => clearFeedbackByStatus('resolved')}
            disabled={clearingItems}
          >
            {clearingItems ? (
              <ActivityIndicator size="small" color={theme.error} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={16} color={theme.error} />
                <Text style={[styles.clearAllText, { color: theme.error }]}>
                  Clear All Resolved
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
      
      {/* Clear All button for ignored tab */}
      {activeTab === 'ignored' && filteredFeedback.length > 0 && (
        <View style={styles.clearAllContainer}>
          <TouchableOpacity
            style={[styles.clearAllButton, { backgroundColor: theme.error + '15' }]}
            onPress={() => clearFeedbackByStatus('ignored')}
            disabled={clearingItems}
          >
            {clearingItems ? (
              <ActivityIndicator size="small" color={theme.error} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={16} color={theme.error} />
                <Text style={[styles.clearAllText, { color: theme.error }]}>
                  Clear All Ignored
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
      >
        {filteredFeedback.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={activeTab === 'new' ? 'notifications-outline' : 
                    activeTab === 'in_progress' ? 'time-outline' : 
                    activeTab === 'resolved' ? 'checkmark-done-outline' : 
                    'close-circle-outline'} 
              size={60} 
              color={theme.textSecondary} 
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No {activeTab === 'in_progress' ? 'in progress' : activeTab} feedback items
            </Text>
          </View>
        ) : (
          filteredFeedback.map(item => (
            <View 
              key={item.id} 
              style={[styles.feedbackCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.typeAndStatus}>
                  <View style={styles.feedbackType}>
                    <Ionicons 
                      name={getFeedbackTypeIcon(item.type)} 
                      size={18} 
                      color={theme.primary} 
                    />
                    <Text style={[styles.feedbackTypeText, { color: theme.text }]}>
                      {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </Text>
                  </View>
                </View>
                
                <Text style={[styles.dateText, { color: theme.textSecondary }]}>
                  {formatDate(item.created_at)}
                </Text>
              </View>
              
              <Text style={[styles.feedbackMessage, { color: theme.text }]}>
                {item.message}
              </Text>
              
              {item.contact_email ? (
                <View style={styles.contactInfo}>
                  <Ionicons name="mail-outline" size={16} color={theme.textSecondary} />
                  <Text style={[styles.contactEmail, { color: theme.textSecondary }]}>
                    {item.contact_email}
                  </Text>
                </View>
              ) : null}
              
              {(item.user_name || item.device_info) ? (
                <View style={styles.metadataContainer}>
                  {item.user_name ? (
                    <View style={styles.metadataItem}>
                      <Ionicons name="person-outline" size={14} color={theme.textSecondary} />
                      <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
                        {item.user_name}
                      </Text>
                    </View>
                  ) : null}
                  
                  {item.device_info ? (
                    <View style={styles.metadataItem}>
                      <Ionicons name="phone-portrait-outline" size={14} color={theme.textSecondary} />
                      <Text style={[styles.metadataText, { color: theme.textSecondary }]}>
                        {item.device_info}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              
              {/* Action Buttons - Different for each tab */}
              <View style={styles.actionButtons}>
                {activeTab === 'new' && (
                  <>
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.info + '20' }
                      ]}
                      onPress={() => updateFeedbackStatus(item.id, 'in_progress')}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.info }]}>
                        Mark In Progress
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.success + '20' }
                      ]}
                      onPress={() => updateFeedbackStatus(item.id, 'resolved')}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.success }]}>
                        Mark Resolved
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.error + '20' }
                      ]}
                      onPress={() => updateFeedbackStatus(item.id, 'ignored')}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.error }]}>
                        Ignore
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {activeTab === 'in_progress' && (
                  <>
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.success + '20' }
                      ]}
                      onPress={() => updateFeedbackStatus(item.id, 'resolved')}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.success }]}>
                        Mark Resolved
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.warning + '20' }
                      ]}
                      onPress={() => updateFeedbackStatus(item.id, 'new')}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.warning }]}>
                        Move to New
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.error + '20' }
                      ]}
                      onPress={() => updateFeedbackStatus(item.id, 'ignored')}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.error }]}>
                        Ignore
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {activeTab === 'resolved' && (
                  <>
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.info + '20' }
                      ]}
                      onPress={() => updateFeedbackStatus(item.id, 'in_progress')}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.info }]}>
                        Reopen
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.error + '20' }
                      ]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Feedback',
                          'This will permanently delete this feedback. Are you sure?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Delete', 
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  const { error } = await supabase
                                    .from('feedback')
                                    .delete()
                                    .eq('id', item.id);
                                    
                                  if (error) throw error;
                                  
                                  // Remove from local state
                                  setFeedbackItems(feedbackItems.filter(feedback => feedback.id !== item.id));
                                  
                                  Alert.alert('Success', 'Feedback deleted successfully');
                                } catch (error) {
                                  console.error('Error deleting feedback:', error);
                                  Alert.alert('Error', 'Failed to delete feedback');
                                }
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.error }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                
                {activeTab === 'ignored' && (
                  <>
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.warning + '20' }
                      ]}
                      onPress={() => updateFeedbackStatus(item.id, 'new')}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.warning }]}>
                        Move to New
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.actionButton, 
                        { backgroundColor: theme.error + '20' }
                      ]}
                      onPress={() => {
                        Alert.alert(
                          'Delete Feedback',
                          'This will permanently delete this feedback. Are you sure?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { 
                              text: 'Delete', 
                              style: 'destructive',
                              onPress: async () => {
                                try {
                                  const { error } = await supabase
                                    .from('feedback')
                                    .delete()
                                    .eq('id', item.id);
                                    
                                  if (error) throw error;
                                  
                                  // Remove from local state
                                  setFeedbackItems(feedbackItems.filter(feedback => feedback.id !== item.id));
                                  
                                  Alert.alert('Success', 'Feedback deleted successfully');
                                } catch (error) {
                                  console.error('Error deleting feedback:', error);
                                  Alert.alert('Error', 'Failed to delete feedback');
                                }
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Text style={[styles.actionButtonText, { color: theme.error }]}>
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
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
    padding: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
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
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 12,
    textAlign: 'center',
  },
  clearAllContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  feedbackCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  typeAndStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  feedbackType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackTypeText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
  },
  feedbackMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactEmail: {
    fontSize: 13,
    marginLeft: 6,
  },
  metadataContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default AdminFeedbackScreen;
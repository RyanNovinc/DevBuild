// src/screens/TodoListScreen/components/notes/StandupHistory.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice
} from '../../../../utils/responsive';

/**
 * History viewer for past daily standup reflections
 * Includes calendar view, search, and analytics
 */
const StandupHistory = ({ visible, setVisible, theme, showSuccess }) => {
  const [historyData, setHistoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [analytics, setAnalytics] = useState({
    totalEntries: 0,
    completionRate: 0,
    averageLength: 0,
    mostActiveMonth: '',
    longestStreak: 0
  });

  useEffect(() => {
    if (visible) {
      loadHistoryData();
    }
  }, [visible]);

  const loadHistoryData = async () => {
    try {
      setIsLoading(true);
      const allKeys = await AsyncStorage.getAllKeys();
      const standupKeys = allKeys.filter(key => key.startsWith('dailyStandup_'));
      
      const historyPromises = standupKeys.map(async (key) => {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          const date = key.replace('dailyStandup_', '');
          return {
            date,
            ...parsed,
            key
          };
        }
        return null;
      });

      const allHistory = await Promise.all(historyPromises);
      const validHistory = allHistory.filter(entry => entry !== null);
      
      // Sort by date (newest first)
      validHistory.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setHistoryData(validHistory);
      calculateAnalytics(validHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      showSuccess?.('Error loading history', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAnalytics = (data) => {
    if (data.length === 0) {
      setAnalytics({
        totalEntries: 0,
        completionRate: 0,
        averageLength: 0,
        mostActiveMonth: '',
        longestStreak: 0
      });
      return;
    }

    // Calculate total entries and completion rate
    const totalEntries = data.length;
    const completedEntries = data.filter(entry => 
      entry.completedAt?.morning && entry.completedAt?.evening
    ).length;
    const completionRate = Math.round((completedEntries / totalEntries) * 100);

    // Calculate average response length
    const totalLength = data.reduce((sum, entry) => {
      const morningLength = (entry.morningPriority || '').length + (entry.morningGratitude || '').length;
      const eveningLength = (entry.eveningHighlight || '').length;
      return sum + morningLength + eveningLength;
    }, 0);
    const averageLength = Math.round(totalLength / totalEntries);

    // Find most active month
    const monthCounts = {};
    data.forEach(entry => {
      const month = entry.date.substring(0, 7); // YYYY-MM
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    const mostActiveMonth = Object.keys(monthCounts).reduce((a, b) => 
      monthCounts[a] > monthCounts[b] ? a : b, ''
    );

    // Calculate longest streak (simplified)
    let longestStreak = 0;
    let currentStreak = 0;
    const sortedDates = data.map(d => d.date).sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);

    setAnalytics({
      totalEntries,
      completionRate,
      averageLength,
      mostActiveMonth,
      longestStreak
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCompletionIcon = (entry) => {
    const morningComplete = entry.completedAt?.morning;
    const eveningComplete = entry.completedAt?.evening;
    
    if (morningComplete && eveningComplete) {
      return { name: 'checkmark-circle', color: '#4CAF50' };
    } else if (morningComplete || eveningComplete) {
      return { name: 'partial-circle', color: '#FF9500' };
    } else {
      return { name: 'ellipse-outline', color: theme.textSecondary };
    }
  };

  const renderHistoryItem = ({ item }) => {
    const completionIcon = getCompletionIcon(item);
    const hasContent = item.morningPriority || item.morningGratitude || item.eveningHighlight;
    
    return (
      <TouchableOpacity
        style={[styles.historyItem, { backgroundColor: theme.cardElevated }]}
        onPress={() => {
          setSelectedEntry(item);
          setShowEntryModal(true);
        }}
      >
        <View style={styles.historyHeader}>
          <View style={styles.dateSection}>
            <Text style={[styles.dateText, { color: theme.text }]}>
              {formatDate(item.date)}
            </Text>
            <Text style={[styles.dateSubtext, { color: theme.textSecondary }]}>
              {item.date === new Date().toISOString().split('T')[0] ? 'Today' : ''}
            </Text>
          </View>
          <Ionicons 
            name={completionIcon.name} 
            size={scaleFontSize(24)} 
            color={completionIcon.color} 
          />
        </View>
        
        {hasContent && (
          <View style={styles.previewSection}>
            {item.morningPriority && (
              <Text 
                style={[styles.previewText, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                🎯 {item.morningPriority}
              </Text>
            )}
            {item.eveningHighlight && (
              <Text 
                style={[styles.previewText, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                ✨ {item.eveningHighlight}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderAnalytics = () => (
    <View style={[styles.analyticsSection, { backgroundColor: theme.cardElevated }]}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>
        Your Reflection Journey
      </Text>
      
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticItem}>
          <Text style={[styles.analyticNumber, { color: theme.primary }]}>
            {analytics.totalEntries}
          </Text>
          <Text style={[styles.analyticLabel, { color: theme.textSecondary }]}>
            Total Reflections
          </Text>
        </View>
        
        <View style={styles.analyticItem}>
          <Text style={[styles.analyticNumber, { color: theme.primary }]}>
            {analytics.completionRate}%
          </Text>
          <Text style={[styles.analyticLabel, { color: theme.textSecondary }]}>
            Completion Rate
          </Text>
        </View>
        
        <View style={styles.analyticItem}>
          <Text style={[styles.analyticNumber, { color: theme.primary }]}>
            {analytics.longestStreak}
          </Text>
          <Text style={[styles.analyticLabel, { color: theme.textSecondary }]}>
            Longest Streak
          </Text>
        </View>
        
        <View style={styles.analyticItem}>
          <Text style={[styles.analyticNumber, { color: theme.primary }]}>
            {analytics.averageLength}
          </Text>
          <Text style={[styles.analyticLabel, { color: theme.textSecondary }]}>
            Avg. Words
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEntryModal = () => (
    <Modal
      visible={showEntryModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowEntryModal(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setShowEntryModal(false)}>
            <Ionicons name="close" size={scaleFontSize(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            {selectedEntry ? formatDate(selectedEntry.date) : ''}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        
        {selectedEntry && (
          <ScrollView style={styles.modalContent}>
            {selectedEntry.morningPriority && (
              <View style={styles.entrySection}>
                <Text style={[styles.entryLabel, { color: theme.primary }]}>
                  🎯 Morning Priority
                </Text>
                <Text style={[styles.entryText, { color: theme.text }]}>
                  {selectedEntry.morningPriority}
                </Text>
              </View>
            )}
            
            {selectedEntry.morningGratitude && (
              <View style={styles.entrySection}>
                <Text style={[styles.entryLabel, { color: theme.primary }]}>
                  🙏 Morning Gratitude
                </Text>
                <Text style={[styles.entryText, { color: theme.text }]}>
                  {selectedEntry.morningGratitude}
                </Text>
              </View>
            )}
            
            {selectedEntry.eveningHighlight && (
              <View style={styles.entrySection}>
                <Text style={[styles.entryLabel, { color: theme.primary }]}>
                  ✨ Evening Highlight
                </Text>
                <Text style={[styles.entryText, { color: theme.text }]}>
                  {selectedEntry.eveningHighlight}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setVisible(false)}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Ionicons name="arrow-back" size={scaleFontSize(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Reflection History
          </Text>
          <TouchableOpacity onPress={loadHistoryData}>
            <Ionicons name="refresh" size={scaleFontSize(20)} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading your reflection history...
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Analytics Section */}
            {historyData.length > 0 && renderAnalytics()}
            
            {/* History List */}
            <View style={styles.historyContainer}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Past Reflections
              </Text>
              
              {historyData.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons 
                    name="document-text-outline" 
                    size={scaleFontSize(48)} 
                    color={theme.textSecondary} 
                  />
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    No reflections yet
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                    Start your daily standup practice to build your reflection history
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={historyData}
                  renderItem={renderHistoryItem}
                  keyExtractor={(item) => item.key}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              )}
            </View>
          </ScrollView>
        )}
        
        {renderEntryModal()}
      </View>
    </Modal>
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
    padding: spacing.m,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scaleFontSize(16),
    fontStyle: 'italic',
  },
  analyticsSection: {
    margin: spacing.m,
    padding: spacing.m,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  analyticItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  analyticNumber: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    marginBottom: 2,
  },
  analyticLabel: {
    fontSize: scaleFontSize(12),
    textAlign: 'center',
  },
  historyContainer: {
    padding: spacing.m,
  },
  historyItem: {
    padding: spacing.m,
    marginBottom: spacing.s,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  dateSection: {
    flex: 1,
  },
  dateText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  dateSubtext: {
    fontSize: scaleFontSize(12),
    marginTop: 2,
  },
  previewSection: {
    marginTop: spacing.xs,
  },
  previewText: {
    fontSize: scaleFontSize(14),
    marginBottom: 2,
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: scaleFontSize(18),
    fontWeight: '500',
    marginTop: spacing.s,
  },
  emptySubtext: {
    fontSize: scaleFontSize(14),
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: scaleFontSize(20),
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: spacing.m,
  },
  entrySection: {
    marginBottom: spacing.l,
  },
  entryLabel: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    marginBottom: spacing.s,
  },
  entryText: {
    fontSize: scaleFontSize(16),
    lineHeight: scaleFontSize(24),
  },
});

export default StandupHistory;
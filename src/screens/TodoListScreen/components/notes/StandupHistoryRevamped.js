// src/screens/TodoListScreen/components/notes/StandupHistoryRevamped.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  FlatList,
  Animated,
  Dimensions,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice
} from '../../../../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Revamped History viewer with enhanced UI/UX
 * Features: Calendar view, Search, Filters, Analytics dashboard
 */
const StandupHistoryRevamped = ({ visible, setVisible, theme, showSuccess }) => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      loadHistoryData();
      startAnimations();
    }
  }, [visible]);

  useEffect(() => {
    filterData();
  }, [searchQuery, historyData]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  };

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
      setFilteredData(validHistory);
    } catch (error) {
      console.error('Error loading history:', error);
      showSuccess?.('Error loading history', { type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    if (!searchQuery) {
      setFilteredData(historyData);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = historyData.filter(entry => {
      const searchableText = [
        entry.morningPriority,
        entry.morningGratitude,
        entry.eveningHighlight
      ].filter(Boolean).join(' ').toLowerCase();
      
      return searchableText.includes(query);
    });
    
    setFilteredData(filtered);
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    
    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };

  const getCompletionColor = (entry) => {
    const morningComplete = entry.completedAt?.morning;
    const eveningComplete = entry.completedAt?.evening;
    
    if (morningComplete && eveningComplete) return '#4CAF50'; // Green for complete
    if (morningComplete || eveningComplete) return '#FF9500'; // Orange for partial
    return '#6B7280'; // Gray for incomplete
  };

  const renderHistoryItem = ({ item, index }) => {
    const completionColor = getCompletionColor(item);
    const hasContent = item.morningPriority || item.morningGratitude || item.eveningHighlight;
    
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, index * 10]
              })
            }
          ]
        }}
      >
        <TouchableOpacity
          style={[styles.historyItem, { backgroundColor: theme.cardElevated }]}
          onPress={() => {
            setSelectedEntry(item);
            setShowEntryModal(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.historyItemLeft}>
            <View style={[styles.dateIndicator, { backgroundColor: completionColor + '20' }]}>
              <Text style={[styles.dateDay, { color: completionColor }]}>
                {new Date(item.date).getDate()}
              </Text>
              <Text style={[styles.dateMonth, { color: completionColor }]}>
                {new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}
              </Text>
            </View>
            
            <View style={styles.historyContent}>
              <View style={styles.historyHeader}>
                <Text style={[styles.historyTitle, { color: theme.text }]}>
                  {formatDate(item.date)}
                </Text>
                <View style={[styles.completionBadge, { backgroundColor: completionColor + '20' }]}>
                  <Text style={[styles.completionText, { color: completionColor }]}>
                    {item.completedAt?.morning && item.completedAt?.evening ? 'Complete' :
                     item.completedAt?.morning ? 'Morning' :
                     item.completedAt?.evening ? 'Evening' : 'Incomplete'}
                  </Text>
                </View>
              </View>
              
              {hasContent && (
                <View style={styles.previewContainer}>
                  {item.morningPriority && (
                    <Text style={[styles.previewText, { color: theme.textSecondary }]} numberOfLines={1}>
                      🎯 {item.morningPriority}
                    </Text>
                  )}
                  {item.eveningHighlight && (
                    <Text style={[styles.previewText, { color: theme.textSecondary }]} numberOfLines={1}>
                      ✨ {item.eveningHighlight}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
          
          <Ionicons 
            name="chevron-forward" 
            size={scaleFontSize(18)} 
            color={theme.textSecondary} 
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };


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
          <TouchableOpacity onPress={() => {/* Share functionality */}}>
            <Ionicons name="share-outline" size={scaleFontSize(22)} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        {selectedEntry && (
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.entryCard, { backgroundColor: theme.cardElevated }]}>
              <View style={styles.entryHeader}>
                <Ionicons name="sunny" size={scaleFontSize(20)} color="#FFA500" />
                <Text style={[styles.entryTimeLabel, { color: theme.text }]}>
                  Morning Reflection
                </Text>
              </View>
              
              {selectedEntry.morningPriority && (
                <View style={styles.entrySection}>
                  <Text style={[styles.entryQuestion, { color: theme.text }]}>
                    What's your most important priority today?
                  </Text>
                  <Text style={[styles.entryAnswer, { color: theme.text }]}>
                    {selectedEntry.morningPriority}
                  </Text>
                </View>
              )}
              
              {selectedEntry.morningGratitude && (
                <View style={styles.entrySection}>
                  <Text style={[styles.entryQuestion, { color: theme.text }]}>
                    What progress are you grateful for?
                  </Text>
                  <Text style={[styles.entryAnswer, { color: theme.text }]}>
                    {selectedEntry.morningGratitude}
                  </Text>
                </View>
              )}
            </View>
            
            {selectedEntry.eveningHighlight && (
              <View style={[styles.entryCard, { backgroundColor: theme.cardElevated }]}>
                <View style={styles.entryHeader}>
                  <Ionicons name="moon" size={scaleFontSize(20)} color="#4A90E2" />
                  <Text style={[styles.entryTimeLabel, { color: theme.text }]}>
                    Evening Reflection
                  </Text>
                </View>
                
                <View style={styles.entrySection}>
                  <Text style={[styles.entryQuestion, { color: theme.text }]}>
                    What moved forward today?
                  </Text>
                  <Text style={[styles.entryAnswer, { color: theme.text }]}>
                    {selectedEntry.eveningHighlight}
                  </Text>
                </View>
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <StatusBar barStyle={theme.background === '#000000' ? 'light-content' : 'dark-content'} />
        
        {/* Header with proper spacing */}
        <View style={[styles.header, { borderBottomColor: theme.border + '30' }]}>
          <TouchableOpacity 
            onPress={() => setVisible(false)}
            style={styles.headerButton}
          >
            <View style={[styles.backButton, { backgroundColor: theme.cardElevated }]}>
              <Ionicons name="arrow-back" size={scaleFontSize(22)} color={theme.text} />
            </View>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Reflection Journey
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {historyData.length} entries
            </Text>
          </View>
          
          <TouchableOpacity 
            onPress={loadHistoryData}
            style={styles.headerButton}
          >
            <View style={[styles.refreshButton, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="refresh" size={scaleFontSize(20)} color={theme.text} />
            </View>
          </TouchableOpacity>
        </View>


        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.cardElevated }]}>
          <Ionicons name="search" size={scaleFontSize(18)} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search reflections..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={scaleFontSize(18)} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Loading your journey...
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredData}
            renderItem={renderHistoryItem}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons 
                  name="document-text-outline" 
                  size={scaleFontSize(48)} 
                  color={theme.textSecondary} 
                />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {searchQuery ? 'No matching reflections' : 'No reflections yet'}
                </Text>
                <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                  {searchQuery 
                    ? 'Try a different search term' 
                    : 'Start your daily standup practice to build your history'}
                </Text>
              </View>
            }
          />
        )}
        
        {renderEntryModal()}
      </SafeAreaView>
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
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.m,
    paddingTop: Platform.OS === 'android' ? spacing.m : 0,
    borderBottomWidth: 1,
    minHeight: scaleHeight(60),
  },
  headerButton: {
    padding: spacing.xs,
  },
  backButton: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  refreshButton: {
    width: scaleWidth(40),
    height: scaleWidth(40),
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: scaleFontSize(12),
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.m,
    padding: spacing.s,
    borderRadius: 12,
    gap: spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: scaleFontSize(15),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scaleFontSize(14),
    marginTop: spacing.m,
  },
  listContent: {
    padding: spacing.m,
    paddingBottom: scaleHeight(100),
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    marginBottom: spacing.s,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  historyItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIndicator: {
    width: scaleWidth(48),
    height: scaleWidth(48),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  dateDay: {
    fontSize: scaleFontSize(18),
    fontWeight: '700',
  },
  dateMonth: {
    fontSize: scaleFontSize(11),
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  historyContent: {
    flex: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  historyTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  completionBadge: {
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completionText: {
    fontSize: scaleFontSize(11),
    fontWeight: '600',
  },
  previewContainer: {
    gap: 2,
  },
  previewText: {
    fontSize: scaleFontSize(13),
  },
  emptyState: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: scaleHeight(50),
  },
  emptyText: {
    fontSize: scaleFontSize(18),
    fontWeight: '500',
    marginTop: spacing.m,
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
  entryCard: {
    padding: spacing.m,
    marginBottom: spacing.m,
    borderRadius: 12,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    marginBottom: spacing.m,
  },
  entryTimeLabel: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  entrySection: {
    marginBottom: spacing.m,
  },
  entryQuestion: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  entryAnswer: {
    fontSize: scaleFontSize(15),
    lineHeight: scaleFontSize(22),
  },
});

export default StandupHistoryRevamped;
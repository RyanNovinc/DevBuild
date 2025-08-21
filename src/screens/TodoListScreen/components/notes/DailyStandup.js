// src/screens/TodoListScreen/components/notes/DailyStandup.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet,
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

// Import new components and services
import { DEFAULT_PROMPTS } from './PromptLibrary';
import { StandupStreakService } from './StandupStreakService';
import StandupHistory from './StandupHistory';
import PromptSelector from './PromptSelector';

/**
 * Daily Standup component with research-backed prompts
 * 3 prompts max: 2 morning intention, 1 evening reflection
 */
const DailyStandup = ({ theme, showSuccess }) => {
  // Today's date for storage key - use local date
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const today = getLocalDateString(); // YYYY-MM-DD format
  
  // State for today's standup responses
  const [standupData, setStandupData] = useState({
    morningPriority: '',
    morningGratitude: '',
    eveningHighlight: '',
    completedAt: {
      morning: false,
      evening: false
    }
  });

  // Loading and saving states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New feature states
  const [currentPrompts, setCurrentPrompts] = useState(DEFAULT_PROMPTS);
  const [streakData, setStreakData] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showPromptSelector, setShowPromptSelector] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  // Character limits (research: 50-150 words optimal)
  const CHAR_LIMITS = {
    morningPriority: 150,
    morningGratitude: 100,
    eveningHighlight: 150
  };

  // Load today's standup data and streak info
  useEffect(() => {
    loadTodaysStandup();
    loadStreakData();
  }, []);

  const loadTodaysStandup = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(`dailyStandup_${today}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setStandupData({
          morningPriority: parsed.morningPriority || '',
          morningGratitude: parsed.morningGratitude || '',
          eveningHighlight: parsed.eveningHighlight || '',
          completedAt: parsed.completedAt || { morning: false, evening: false }
        });
      }
    } catch (error) {
      console.error('Error loading daily standup:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStreakData = async () => {
    try {
      const streak = await StandupStreakService.getStreakData();
      setStreakData(streak);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const saveStandupData = async (newData) => {
    try {
      setIsSaving(true);
      const dataToSave = {
        ...newData,
        date: today,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem(`dailyStandup_${today}`, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving daily standup:', error);
      showSuccess?.('Error saving reflection', { type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateResponse = (field, value) => {
    const newData = {
      ...standupData,
      [field]: value
    };
    setStandupData(newData);
    saveStandupData(newData);
  };

  const markSectionComplete = async (section) => {
    const newCompletedAt = {
      ...standupData.completedAt,
      [section]: true
    };
    const newData = {
      ...standupData,
      completedAt: newCompletedAt
    };
    setStandupData(newData);
    saveStandupData(newData);
    
    // Update streak if both sections completed
    if (newCompletedAt.morning && newCompletedAt.evening) {
      try {
        const updatedStreak = await StandupStreakService.recordCompletion();
        setStreakData(updatedStreak);
        
        // Show celebration for milestones
        if (StandupStreakService.isStreakMilestone(updatedStreak.currentStreak)) {
          setCelebrationMessage(`🎉 ${updatedStreak.currentStreak} day streak! Amazing consistency!`);
          setTimeout(() => setCelebrationMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error updating streak:', error);
      }
    }
    
    if (section === 'morning') {
      showSuccess?.('Morning reflection completed! 🌅');
    } else {
      showSuccess?.('Evening reflection completed! 🌙');
    }
  };

  const getCurrentHour = () => new Date().getHours();
  const isMorning = () => getCurrentHour() < 12;
  const isEvening = () => getCurrentHour() >= 17;

  const renderPromptSection = (title, subtitle, icon, prompts, sectionKey) => {
    const isCompleted = standupData.completedAt[sectionKey];
    
    return (
      <View style={[styles.section, { backgroundColor: theme.background }]}>
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <Ionicons 
              name={icon} 
              size={scaleFontSize(20)} 
              color={theme.primary} 
              style={styles.sectionIcon}
            />
            <View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {title}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                {subtitle}
              </Text>
            </View>
          </View>
          {isCompleted && (
            <Ionicons 
              name="checkmark-circle" 
              size={scaleFontSize(24)} 
              color="#4CAF50" 
            />
          )}
        </View>

        {/* Prompts */}
        {prompts.map((prompt, index) => (
          <View key={index} style={styles.promptContainer}>
            <Text style={[styles.promptText, { color: theme.text }]}>
              {prompt.question}
            </Text>
            <TextInput
              style={[
                styles.responseInput,
                { 
                  backgroundColor: theme.cardElevated,
                  color: theme.text,
                  borderColor: theme.border
                }
              ]}
              value={standupData[prompt.field]}
              onChangeText={(text) => {
                if (text.length <= CHAR_LIMITS[prompt.field]) {
                  updateResponse(prompt.field, text);
                }
              }}
              placeholder={prompt.placeholder}
              placeholderTextColor={theme.textSecondary}
              multiline={true}
              numberOfLines={3}
              maxLength={CHAR_LIMITS[prompt.field]}
              textAlignVertical="top"
            />
            <Text style={[styles.charCount, { color: theme.textSecondary }]}>
              {standupData[prompt.field].length}/{CHAR_LIMITS[prompt.field]}
            </Text>
          </View>
        ))}

        {/* Complete Section Button */}
        {!isCompleted && (
          <TouchableOpacity
            style={[
              styles.completeButton,
              { backgroundColor: theme.primary }
            ]}
            onPress={() => markSectionComplete(sectionKey)}
            disabled={prompts.some(p => !standupData[p.field].trim())}
          >
            <Ionicons name="checkmark" size={scaleFontSize(16)} color="#FFFFFF" />
            <Text style={styles.completeButtonText}>
              Complete {title}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Loading today's reflection...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Daily Standup
          </Text>
          <Text style={[styles.headerDate, { color: theme.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.cardElevated }]}
            onPress={() => setShowPromptSelector(true)}
          >
            <Ionicons name="shuffle" size={scaleFontSize(16)} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.cardElevated }]}
            onPress={() => setShowHistory(true)}
          >
            <Ionicons name="time" size={scaleFontSize(16)} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Streak Display */}
      {streakData && (
        <View style={[styles.streakContainer, { backgroundColor: theme.cardElevated }]}>
          <View style={styles.streakInfo}>
            <Text style={[styles.streakNumber, { color: theme.primary }]}>
              {streakData.currentStreak}
            </Text>
            <Text style={[styles.streakLabel, { color: theme.textSecondary }]}>
              Day Streak
            </Text>
          </View>
          <View style={styles.streakStats}>
            <Text style={[styles.streakMessage, { color: theme.text }]}>
              {StandupStreakService.getStreakMessage(streakData)}
            </Text>
            {streakData.longestStreak > streakData.currentStreak && (
              <Text style={[styles.streakBest, { color: theme.textSecondary }]}>
                Best: {streakData.longestStreak} days
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Celebration Message */}
      {celebrationMessage && (
        <View style={[styles.celebrationBanner, { backgroundColor: theme.primary }]}>
          <Text style={styles.celebrationText}>{celebrationMessage}</Text>
        </View>
      )}

      {/* Morning Section */}
      {renderPromptSection(
        'Morning', 
        'Set intentions for today',
        'sunny-outline',
        currentPrompts.morning || [
          {
            question: "What's your most important priority today?",
            placeholder: "Focus on one key milestone or task...",
            field: 'morningPriority'
          },
          {
            question: "What progress are you grateful for?",
            placeholder: "Acknowledge recent wins, however small...",
            field: 'morningGratitude'
          }
        ],
        'morning'
      )}

      {/* Evening Section */}
      {renderPromptSection(
        'Evening', 
        'Reflect on today',
        'moon-outline',
        currentPrompts.evening || [
          {
            question: "What moved forward today?",
            placeholder: "Celebrate progress, learn from setbacks...",
            field: 'eveningHighlight'
          }
        ],
        'evening'
      )}

      {/* Completion Status */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: theme.textSecondary }]}>
          Today's Progress: {standupData.completedAt.morning ? '✅' : '⏳'} Morning • {standupData.completedAt.evening ? '✅' : '⏳'} Evening
        </Text>
      </View>

      {/* Bottom padding for scroll */}
      <View style={{ height: scaleHeight(100) }} />
      
      {/* Modals */}
      <StandupHistory
        visible={showHistory}
        setVisible={setShowHistory}
        theme={theme}
        showSuccess={showSuccess}
      />
      
      <PromptSelector
        visible={showPromptSelector}
        setVisible={setShowPromptSelector}
        onPromptSelect={setCurrentPrompts}
        currentPrompts={currentPrompts}
        theme={theme}
        showSuccess={showSuccess}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  loadingText: {
    fontSize: scaleFontSize(16),
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
  },
  headerMain: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    marginBottom: spacing.xxs,
  },
  headerDate: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.s,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.m,
    padding: spacing.m,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  streakInfo: {
    alignItems: 'center',
    marginRight: spacing.m,
  },
  streakNumber: {
    fontSize: scaleFontSize(32),
    fontWeight: '700',
    lineHeight: scaleFontSize(36),
  },
  streakLabel: {
    fontSize: scaleFontSize(12),
    fontWeight: '500',
  },
  streakStats: {
    flex: 1,
  },
  streakMessage: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
    marginBottom: 2,
  },
  streakBest: {
    fontSize: scaleFontSize(12),
  },
  celebrationBanner: {
    margin: spacing.m,
    padding: spacing.s,
    borderRadius: 8,
    alignItems: 'center',
  },
  celebrationText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(14),
    fontWeight: '600',
  },
  section: {
    margin: spacing.m,
    padding: spacing.m,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: spacing.s,
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
  },
  sectionSubtitle: {
    fontSize: scaleFontSize(12),
    marginTop: 2,
  },
  promptContainer: {
    marginBottom: spacing.m,
  },
  promptText: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
    marginBottom: spacing.s,
    lineHeight: scaleFontSize(22),
  },
  responseInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.s,
    fontSize: scaleFontSize(15),
    minHeight: scaleHeight(80),
    maxHeight: scaleHeight(120),
  },
  charCount: {
    fontSize: scaleFontSize(12),
    textAlign: 'right',
    marginTop: spacing.xxs,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s,
    borderRadius: 8,
    marginTop: spacing.s,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    marginLeft: spacing.xxs,
  },
  statusContainer: {
    alignItems: 'center',
    padding: spacing.m,
  },
  statusText: {
    fontSize: scaleFontSize(14),
    fontWeight: '500',
  },
});

export default DailyStandup;
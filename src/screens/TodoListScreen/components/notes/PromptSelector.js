// src/screens/TodoListScreen/components/notes/PromptSelector.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getAllThemes, 
  getRandomPromptSet, 
  getWeeklyTheme, 
  DEFAULT_PROMPTS 
} from './PromptLibrary';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice
} from '../../../../utils/responsive';

/**
 * Prompt selection modal for choosing different prompt themes
 * Allows users to refresh prompts and explore varieties
 */
const PromptSelector = ({ 
  visible, 
  setVisible, 
  onPromptSelect, 
  currentPrompts,
  theme, 
  showSuccess 
}) => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const allThemes = getAllThemes();
  const weeklyTheme = getWeeklyTheme();

  const handleThemeSelect = (themeData) => {
    setSelectedTheme(themeData);
    onPromptSelect(themeData);
    showSuccess?.(`Switched to ${themeData.name} prompts! 🎯`);
    setVisible(false);
  };

  const handleRandomSelect = () => {
    const randomTheme = getRandomPromptSet();
    handleThemeSelect(randomTheme);
  };

  const handleDefaultSelect = () => {
    onPromptSelect(DEFAULT_PROMPTS);
    showSuccess?.('Back to default prompts! 📝');
    setVisible(false);
  };

  const renderThemeOption = (themeData, isWeekly = false, isRandom = false) => (
    <TouchableOpacity
      key={themeData.key || 'special'}
      style={[
        styles.themeOption, 
        { backgroundColor: theme.cardElevated },
        isWeekly && [styles.weeklyTheme, { borderColor: theme.primary }]
      ]}
      onPress={() => isRandom ? handleRandomSelect() : handleThemeSelect(themeData)}
    >
      <View style={styles.themeHeader}>
        <View style={styles.themeIcon}>
          <Ionicons 
            name={themeData.icon || 'shuffle-outline'} 
            size={scaleFontSize(24)} 
            color={themeData.color || theme.primary} 
          />
          {isWeekly && (
            <View style={[styles.weeklyBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.weeklyBadgeText}>Week</Text>
            </View>
          )}
        </View>
        <View style={styles.themeInfo}>
          <Text style={[styles.themeName, { color: theme.text }]}>
            {themeData.name}
          </Text>
          {isWeekly && (
            <Text style={[styles.themeSubtext, { color: theme.primary }]}>
              This Week's Focus
            </Text>
          )}
          {isRandom && (
            <Text style={[styles.themeSubtext, { color: theme.textSecondary }]}>
              Surprise me with random prompts
            </Text>
          )}
        </View>
      </View>
      
      {/* Preview prompts */}
      <View style={styles.promptPreview}>
        <Text style={[styles.previewLabel, { color: theme.textSecondary }]}>
          Sample prompts:
        </Text>
        {!isRandom && themeData.morning && (
          <Text style={[styles.previewText, { color: theme.textSecondary }]} numberOfLines={1}>
            • {themeData.morning[0]?.question}
          </Text>
        )}
        {!isRandom && themeData.evening && (
          <Text style={[styles.previewText, { color: theme.textSecondary }]} numberOfLines={1}>
            • {themeData.evening[0]?.question}
          </Text>
        )}
        {isRandom && (
          <Text style={[styles.previewText, { color: theme.textSecondary }]}>
            • Randomly selected from all themes
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setVisible(false)}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Ionicons name="close" size={scaleFontSize(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Choose Prompts
          </Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructions}>
            <Text style={[styles.instructionTitle, { color: theme.text }]}>
              Refresh Your Reflection Practice
            </Text>
            <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
              Choose themed prompts to explore different aspects of your growth, or stick with the proven defaults.
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.primary }]}
              onPress={handleRandomSelect}
            >
              <Ionicons name="shuffle" size={scaleFontSize(20)} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Random Theme</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickAction, { backgroundColor: theme.cardElevated, borderColor: theme.border }]}
              onPress={handleDefaultSelect}
            >
              <Ionicons name="refresh" size={scaleFontSize(20)} color={theme.primary} />
              <Text style={[styles.quickActionText, { color: theme.primary }]}>Default</Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Theme (Featured) */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🗓️ This Week's Featured Theme
            </Text>
            {renderThemeOption(weeklyTheme.prompts, true)}
          </View>

          {/* All Themes */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🎯 Choose Your Focus
            </Text>
            {allThemes.map(themeData => renderThemeOption(themeData))}
          </View>

          {/* Random Option */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              🎲 Surprise Me
            </Text>
            {renderThemeOption(
              { 
                name: 'Random Theme', 
                icon: 'shuffle-outline', 
                color: theme.primary,
                key: 'random'
              }, 
              false, 
              true
            )}
          </View>

          {/* Bottom padding */}
          <View style={{ height: scaleHeight(50) }} />
        </ScrollView>
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
  content: {
    flex: 1,
  },
  instructions: {
    padding: spacing.m,
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    marginBottom: spacing.s,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: scaleFontSize(14),
    textAlign: 'center',
    lineHeight: scaleFontSize(20),
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.m,
    marginBottom: spacing.m,
    gap: spacing.s,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickActionText: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    marginLeft: spacing.xs,
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: spacing.m,
    marginBottom: spacing.l,
  },
  sectionTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginBottom: spacing.m,
  },
  themeOption: {
    padding: spacing.m,
    marginBottom: spacing.s,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weeklyTheme: {
    borderWidth: 2,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  themeIcon: {
    position: 'relative',
    marginRight: spacing.s,
  },
  weeklyBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  weeklyBadgeText: {
    fontSize: scaleFontSize(8),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  themeInfo: {
    flex: 1,
  },
  themeName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginBottom: 2,
  },
  themeSubtext: {
    fontSize: scaleFontSize(12),
    fontStyle: 'italic',
  },
  promptPreview: {
    marginTop: spacing.xs,
  },
  previewLabel: {
    fontSize: scaleFontSize(12),
    fontWeight: '500',
    marginBottom: spacing.xxs,
  },
  previewText: {
    fontSize: scaleFontSize(12),
    lineHeight: scaleFontSize(16),
    marginBottom: 2,
  },
});

export default PromptSelector;
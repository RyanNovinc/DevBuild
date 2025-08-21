// src/screens/TodoListScreen/components/notes/NotesToggle.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice
} from '../../../../utils/responsive';

/**
 * Toggle component for switching between Daily Standup and Free Notes modes
 */
const NotesToggle = ({ notesMode, setNotesMode, theme }) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.cardElevated }]}>
      <TouchableOpacity
        style={[
          styles.toggleOption,
          notesMode === 'standup' && [styles.activeOption, { backgroundColor: theme.primary }]
        ]}
        onPress={() => setNotesMode('standup')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Switch to Daily Standup mode"
      >
        <Ionicons 
          name="bar-chart-outline" 
          size={scaleFontSize(16)} 
          color={notesMode === 'standup' ? '#FFFFFF' : theme.textSecondary} 
          style={styles.icon}
        />
        <Text style={[
          styles.toggleText,
          { color: notesMode === 'standup' ? '#FFFFFF' : theme.textSecondary },
          notesMode === 'standup' && styles.activeText
        ]}>
          Daily Standup
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.toggleOption,
          notesMode === 'freeform' && [styles.activeOption, { backgroundColor: theme.primary }]
        ]}
        onPress={() => setNotesMode('freeform')}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Switch to Free Notes mode"
      >
        <Ionicons 
          name="document-text-outline" 
          size={scaleFontSize(16)} 
          color={notesMode === 'freeform' ? '#FFFFFF' : theme.textSecondary} 
          style={styles.icon}
        />
        <Text style={[
          styles.toggleText,
          { color: notesMode === 'freeform' ? '#FFFFFF' : theme.textSecondary },
          notesMode === 'freeform' && styles.activeText
        ]}>
          Free Notes
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 25,
    marginHorizontal: spacing.m,
    marginVertical: spacing.s,
    padding: 3,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.xs,
    borderRadius: 22,
    minHeight: scaleHeight(44),
  },
  activeOption: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  icon: {
    marginRight: spacing.xxs,
  },
  toggleText: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
    textAlign: 'center',
  },
  activeText: {
    fontWeight: '700',
  },
});

export default NotesToggle;
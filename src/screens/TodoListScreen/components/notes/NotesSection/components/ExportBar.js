// src/screens/TodoListScreen/components/NotesSection/components/ExportBar.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../../TodoListStyles';
import { getContrastText } from '../../../TodoUtils';

/**
 * Component for export actions (copy, share) and note counter
 */
const ExportBar = ({
  filteredNotes,
  copyNotesToClipboard,
  shareNotes,
  theme,
  isDarkMode
}) => {
  return (
    <View style={styles.actionsContainer}>
      <View style={styles.exportActions}>
        <TouchableOpacity 
          style={[styles.exportButton, { backgroundColor: theme.cardElevated }]}
          onPress={copyNotesToClipboard}
        >
          <Ionicons name="copy-outline" size={18} color={theme.textSecondary} />
          <Text style={[styles.exportButtonText, { color: theme.text }]}>
            Copy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.exportButton, { backgroundColor: theme.primary }]}
          onPress={shareNotes}
        >
          <Ionicons name="share-social-outline" size={18} color={getContrastText(theme.primary, isDarkMode, theme)} />
          <Text style={[styles.exportButtonTextLight, { color: getContrastText(theme.primary, isDarkMode, theme) }]}>
            Share
          </Text>
        </TouchableOpacity>
        
        {/* Tally counter for notes */}
        <View style={styles.tallyContainer}>
          <Text style={[styles.tallyText, { color: theme.textSecondary }]}>
            {filteredNotes.length}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default React.memo(ExportBar);
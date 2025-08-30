// src/screens/ProfileScreen/SectionHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SectionHeader = ({ 
  title, 
  icon, 
  theme, 
  onActionPress, 
  actionIcon = "chevron-forward",
  actionText,
  onInfoPress,
  showInfoButton = false
}) => {
  return (
    <View style={styles.sectionHeaderContainer}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleContainer}>
          <Ionicons name={icon} size={22} color={theme.primary} />
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {title.toUpperCase()}
          </Text>
          {showInfoButton && (
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={onInfoPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={`Information about ${title}`}
            >
              <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {onActionPress && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onActionPress}
          >
            {actionText && (
              <Text style={[styles.actionText, { color: theme.primary }]}>
                {actionText}
              </Text>
            )}
            <Ionicons name={actionIcon} size={18} color={theme.primary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.divider, { backgroundColor: theme.border }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeaderContainer: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 1,
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 14,
    marginRight: 4,
  },
  infoButton: {
    marginLeft: 8,
    padding: 4,
  },
  divider: {
    height: 1,
    opacity: 0.6,
  }
});

export default SectionHeader;
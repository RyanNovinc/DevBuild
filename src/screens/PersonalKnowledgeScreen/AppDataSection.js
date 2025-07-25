// src/screens/PersonalKnowledgeScreen/AppDataSection.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AppDataSection = ({ theme }) => {
  return (
    <View style={styles.appDataContainer}>
      <View style={styles.appDataHeader}>
        <Ionicons name="apps" size={24} color={theme.primary} />
        <Text style={[styles.appDataTitle, { color: theme.text }]}>
          App Data Included in AI Context
        </Text>
      </View>
      <Text style={[styles.appDataDescription, { color: theme.textSecondary }]}>
        All your app data is automatically included in AI context to provide personalized assistance:
      </Text>
      <View style={styles.appDataItems}>
        <View style={styles.appDataItem}>
          <Ionicons name="person" size={18} color={theme.primary} />
          <Text style={[styles.appDataItemText, { color: theme.text }]}>User Profile & Life Direction</Text>
        </View>
        <View style={styles.appDataItem}>
          <Ionicons name="flag" size={18} color={theme.primary} />
          <Text style={[styles.appDataItemText, { color: theme.text }]}>Goals & Projects</Text>
        </View>
        <View style={styles.appDataItem}>
          <Ionicons name="calendar" size={18} color={theme.primary} />
          <Text style={[styles.appDataItemText, { color: theme.text }]}>Tasks & Time Blocks</Text>
        </View>
        <View style={styles.appDataItem}>
          <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
          <Text style={[styles.appDataItemText, { color: theme.text }]}>To-Do Items</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appDataContainer: {
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  appDataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  appDataTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  appDataDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  appDataItems: {
    marginLeft: 8,
  },
  appDataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appDataItemText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default AppDataSection;
// src/screens/ProfileScreen/QuickActionBar.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuickActionBar = ({ theme, navigation }) => {
  // Define quick actions that connect to other key parts of the app
  const actions = [
    {
      icon: 'add-circle-outline',
      label: 'New Goal',
      onPress: () => navigation.navigate('GoalsTab', { screen: 'AddGoal' })
    },
    {
      icon: 'folder-open-outline',
      label: 'Projects',
      onPress: () => navigation.navigate('ProjectsTab')
    },
    {
      icon: 'calendar-outline',
      label: 'Schedule',
      onPress: () => navigation.navigate('CalendarTab')
    },
    {
      icon: 'sparkles-outline',
      label: 'AI Help',
      onPress: () => navigation.navigate('AIAssistant')
    }
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.actionBar, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
      }]}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <View style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name={action.icon} size={20} color={theme.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: theme.text }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButton: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  }
});

export default QuickActionBar;
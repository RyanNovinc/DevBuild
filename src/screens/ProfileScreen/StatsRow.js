// src/screens/ProfileScreen/StatsRow.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const StatsRow = ({ theme, totalActiveGoals, activeProjects, totalActiveTasks, navigation }) => {
  const navigateToGoals = () => {
    navigation.navigate('GoalsTab');
  };

  const navigateToProjects = async () => {
    try {
      // First, save the preference to AsyncStorage
      await AsyncStorage.setItem('preferred_view_mode', 'projects');
      
      // Add a timestamp to force a refresh when navigating
      await AsyncStorage.setItem('view_mode_timestamp', Date.now().toString());

      // IMPORTANT: Reset the entire tab navigator state to force a remount
      // This will ensure the view mode is properly applied
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'ProjectsTab',
              params: { viewMode: 'projects', timestamp: Date.now() },
              state: {
                routes: [
                  {
                    name: 'Projects',
                    params: { viewMode: 'projects', timestamp: Date.now() }
                  }
                ]
              }
            }
          ]
        })
      );
    } catch (error) {
      console.error('Error navigating to projects view:', error);
      
      // Fallback to simple navigation if reset fails
      navigation.navigate('ProjectsTab', { 
        screen: 'Projects', 
        params: { viewMode: 'projects', timestamp: Date.now() }
      });
    }
  };

  const navigateToTodoList = async () => {
    try {
      // First, save the preference to AsyncStorage
      await AsyncStorage.setItem('preferred_view_mode', 'tasks');
      
      // Add a timestamp to force a refresh when navigating
      await AsyncStorage.setItem('view_mode_timestamp', Date.now().toString());

      // IMPORTANT: Reset the entire tab navigator state to force a remount
      // This will ensure the view mode is properly applied
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: 'ProjectsTab',
              params: { viewMode: 'tasks', timestamp: Date.now() },
              state: {
                routes: [
                  {
                    name: 'Projects',
                    params: { viewMode: 'tasks', timestamp: Date.now() }
                  }
                ]
              }
            }
          ]
        })
      );
    } catch (error) {
      console.error('Error navigating to tasks view:', error);
      
      // Fallback to simple navigation if reset fails
      navigation.navigate('ProjectsTab', { 
        screen: 'Projects', 
        params: { viewMode: 'tasks', timestamp: Date.now() }
      });
    }
  };

  return (
    <View style={styles.statsRow}>
      <TouchableOpacity 
        style={[styles.statCard, { 
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border 
        }]}
        onPress={navigateToGoals}
        activeOpacity={0.7}
      >
        <Ionicons name="star-outline" size={28} color={theme.primary} />
        <Text style={[styles.statValue, { color: theme.text }]}>{totalActiveGoals}</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          {totalActiveGoals === 1 ? 'Goal' : 'Goals'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.statCard, { 
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border  
        }]}
        onPress={navigateToProjects}
        activeOpacity={0.7}
      >
        <Ionicons name="folder-outline" size={28} color={theme.primary} />
        <Text style={[styles.statValue, { color: theme.text }]}>{activeProjects}</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          {activeProjects === 1 ? 'Project' : 'Projects'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.statCard, { 
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border  
        }]}
        onPress={navigateToTodoList}
        activeOpacity={0.7}
      >
        <Ionicons name="list-outline" size={28} color={theme.primary} />
        <Text style={[styles.statValue, { color: theme.text }]}>{totalActiveTasks}</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
          {totalActiveTasks === 1 ? 'Task' : 'Tasks'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles remain unchanged
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -20,
    height: 110, // Fixed height for predictable layout
    zIndex: 999, // Much higher z-index to ensure it's above the edit button
    elevation: 10, // Higher elevation for Android
    position: 'relative', // Ensure proper stacking context
  },
  statCard: {
    width: '30%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 10, // Higher elevation to ensure it's above other elements
    height: 100, // Fixed height for predictable layout
    zIndex: 1000, // Very high z-index
    opacity: 1, // Full opacity
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default StatsRow;
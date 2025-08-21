// src/screens/ProfileScreen/StatsRow.js
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';

const StatsRow = ({ theme, totalActiveGoals, activeProjects, totalActiveTasks, navigation, isTourActive = false, useDramaticEntrance = false }) => {
  // Animation values for dramatic entrance
  const entranceOpacity = useRef(new Animated.Value(useDramaticEntrance ? 0 : 1)).current;
  const entranceScale = useRef(new Animated.Value(useDramaticEntrance ? 0.8 : 1)).current;

  // Dramatic entrance effect
  useEffect(() => {
    if (useDramaticEntrance) {
      // Start entrance animation after a delay (overlay darkens first)
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(entranceOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.spring(entranceScale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true
          })
        ]).start();
      }, 400); // Wait for overlay to darken
    }
  }, [useDramaticEntrance]);

  const navigateToGoals = () => {
    navigation.navigate('GoalsTab', {
      screen: 'Goals',
      params: { filter: 'goals' }
    });
  };

  const navigateToProjects = () => {
    navigation.navigate('GoalsTab', {
      screen: 'Goals',
      params: { filter: 'milestones' }
    });
  };

  const navigateToTodoList = () => {
    navigation.navigate('GoalsTab', {
      screen: 'Goals',
      params: { filter: 'tasks' }
    });
  };

  return (
    <Animated.View style={[
      styles.statsRow, 
      isTourActive && styles.statsRowElevated,
      useDramaticEntrance && {
        opacity: entranceOpacity,
        transform: [{ scale: entranceScale }]
      }
    ]}>
      <TouchableOpacity 
        style={[
          styles.statCard, 
          { 
            backgroundColor: '#000000',
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.2)'
          },
          isTourActive && styles.statCardElevated
        ]}
        onPress={navigateToGoals}
        activeOpacity={0.7}
      >
        <Ionicons name="star-outline" size={24} color={theme.primary} />
        <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{totalActiveGoals}</Text>
        <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>
          {totalActiveGoals === 1 ? 'Goal' : 'Goals'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.statCard, 
          { 
            backgroundColor: '#000000',
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.2)'
          },
          isTourActive && styles.statCardElevated
        ]}
        onPress={navigateToProjects}
        activeOpacity={0.7}
      >
        <Ionicons name="folder-outline" size={24} color={theme.primary} />
        <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{activeProjects}</Text>
        <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>
          {activeProjects === 1 ? 'Milestone' : 'Milestones'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[
          styles.statCard, 
          { 
            backgroundColor: '#000000',
            borderWidth: 0.5,
            borderColor: 'rgba(255,255,255,0.2)'
          },
          isTourActive && styles.statCardElevated
        ]}
        onPress={navigateToTodoList}
        activeOpacity={0.7}
      >
        <Ionicons name="list-outline" size={24} color={theme.primary} />
        <Text style={[styles.statValue, { color: '#FFFFFF' }]}>{totalActiveTasks}</Text>
        <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>
          {totalActiveTasks === 1 ? 'Task' : 'Tasks'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
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
  statsRowElevated: {
    zIndex: 1001, // Super high z-index during tour
    elevation: 20, // Higher elevation for Android during tour
  },
  statCard: {
    width: '30%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    height: 100, // Fixed height for predictable layout
    zIndex: 1000, // Very high z-index
    opacity: 1, // Full opacity
  },
  statCardElevated: {
    zIndex: 1002, // Super high z-index during tour
    elevation: 25, // Higher elevation for Android during tour
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '500',
    marginVertical: 8,
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default StatsRow;
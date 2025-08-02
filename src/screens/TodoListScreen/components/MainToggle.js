// src/screens/TodoListScreen/components/MainToggle.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Toggle component for switching between Todo and Notes views
 * Completely redesigned to look distinctly different from subtabs
 */
const MainToggle = ({ mainView, setMainView, theme }) => {
  // Animation values for button presses
  const todoScale = useRef(new Animated.Value(1)).current;
  const notesScale = useRef(new Animated.Value(1)).current;
  
  // Animate button press effect
  const animatePress = (isToDoButton) => {
    const animValue = isToDoButton ? todoScale : notesScale;
    Animated.sequence([
      Animated.timing(animValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(animValue, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true
      })
    ]).start();
  };

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.background }]}>
      <View style={styles.toggleContainer}>
        {/* Left side - Todo Button */}
        <Animated.View style={[
          styles.buttonWrapper,
          { transform: [{ scale: todoScale }] }
        ]}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              { 
                backgroundColor: mainView === 'todo' ? '#000000' : theme.cardElevated,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }
            ]}
            onPress={() => {
              setMainView('todo');
              animatePress(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="checkbox"
              size={24}
              color={mainView === 'todo' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text style={[
              styles.buttonText,
              { 
                color: mainView === 'todo' ? '#FFFFFF' : theme.text,
                fontWeight: mainView === 'todo' ? '700' : '500'
              }
            ]}>
              TO-DO
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Right side - Notes Button */}
        <Animated.View style={[
          styles.buttonWrapper,
          { transform: [{ scale: notesScale }] }
        ]}>
          <TouchableOpacity
            style={[
              styles.mainButton,
              { 
                backgroundColor: mainView === 'notes' ? '#000000' : theme.cardElevated,
                borderColor: 'rgba(255, 255, 255, 0.2)',
              }
            ]}
            onPress={() => {
              setMainView('notes');
              animatePress(false);
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="document-text"
              size={24}
              color={mainView === 'notes' ? '#FFFFFF' : theme.textSecondary}
            />
            <Text style={[
              styles.buttonText,
              { 
                color: mainView === 'notes' ? '#FFFFFF' : theme.text,
                fontWeight: mainView === 'notes' ? '700' : '500'
              }
            ]}>
              NOTES
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

// Completely new styling for a distinctive look
const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    zIndex: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 16, // Space between buttons
  },
  buttonWrapper: {
    flex: 1,
  },
  mainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 0.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    fontSize: 14,
    marginLeft: 8,
    letterSpacing: 0.5,
  }
});

export default React.memo(MainToggle);
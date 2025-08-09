// src/components/ai/AIStatusIndicators/CreditsIndicator.js
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Simple credits display button that opens modal when pressed
 */
const CreditsIndicator = ({ 
  credits = {
    baseCredits: 0,         // Base monthly credits
    rolledOverCredits: 0,    // Accumulated rollover credits
    creditsUsed: 0,          // Credits used this period
    nextRefreshDate: null    // Date when credits refresh
  },
  onPress                  // Function to call when button is pressed
}) => {
  const { theme } = useTheme();
  
  // Calculate remaining credits
  const totalCredits = credits.baseCredits + credits.rolledOverCredits;
  const remainingCredits = totalCredits - credits.creditsUsed;
  
  // Format for display (1000 credits = $1)
  const formattedCredits = Math.round(remainingCredits * 1000);
  
  return (
    <TouchableOpacity 
      style={[styles.button, { 
        backgroundColor: '#1C1C1E'
      }]}
      onPress={() => {
        console.log('Credits button pressed');
        if (onPress) onPress();
      }}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="flash" size={16} color={theme.primary} />
      <Text style={styles.text}>{formattedCredits}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8, // Increased padding for better touch target
    borderRadius: 16,
    minWidth: 80,
    minHeight: 36, // Increased minimum height for better touch target
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  text: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  }
});

export default CreditsIndicator;
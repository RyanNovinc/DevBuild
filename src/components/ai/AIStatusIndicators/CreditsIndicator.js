// src/components/ai/AIStatusIndicators/CreditsIndicator.js
import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * A simple button that displays the user's remaining AI credits
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
  // Calculate remaining credits
  const totalCredits = credits.baseCredits + credits.rolledOverCredits;
  const remainingCredits = totalCredits - credits.creditsUsed;
  
  // Format for display (1000 credits = $1)
  const formattedCredits = Math.round(remainingCredits * 1000);
  
  // Determine color based on usage
  let color = '#34C759'; // Green (default)
  if (totalCredits > 0) {
    const percentUsed = (credits.creditsUsed / totalCredits) * 100;
    if (percentUsed > 80) color = '#FF3B30'; // Red - low credits
    else if (percentUsed > 50) color = '#FF9500'; // Orange - medium credits
  }
  
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: color }]}
      onPress={() => {
        console.log('Credits button pressed');
        if (onPress) onPress();
      }}
      activeOpacity={0.7}
    >
      <Ionicons name="flash" size={16} color="#FFFFFF" />
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
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    minHeight: 32,
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
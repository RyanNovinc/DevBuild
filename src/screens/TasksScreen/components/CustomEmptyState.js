// src/screens/TasksScreen/components/CustomEmptyState.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const CustomEmptyState = ({
  title,
  message,
  icon,
  iconColor,
  buttonText,
  onButtonPress,
  theme,
  illustration,
  isDarkMode
}) => {
  return (
    <View style={styles.customEmptyStateContainer}>
      {illustration}
      <Text style={[styles.customEmptyStateTitle, { color: theme.text }]}>
        {title}
      </Text>
      <Text style={[styles.customEmptyStateMessage, { color: theme.textSecondary }]}>
        {message}
      </Text>
      <TouchableOpacity
        style={[
          styles.customEmptyStateButton,
          { backgroundColor: theme.primary }
        ]}
        onPress={onButtonPress}
      >
        <Ionicons 
          name={icon || 'add-circle'} 
          size={20} 
          color={isDarkMode ? '#000000' : '#FFFFFF'} 
        />
        <Text style={[
          styles.customEmptyStateButtonText, 
          { color: isDarkMode ? '#000000' : '#FFFFFF' }
        ]}>
          {buttonText}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CustomEmptyState;
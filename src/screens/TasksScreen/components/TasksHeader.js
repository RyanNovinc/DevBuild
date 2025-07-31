// src/screens/TasksScreen/components/TasksHeader.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const TasksHeader = ({ displayedProjectCount, verifyProjectDataConsistency, theme, isDarkMode, viewMode = 'projects' }) => {
  // Determine icon and title based on view mode
  const getHeaderIcon = () => {
    return viewMode === 'projects' ? 'folder-outline' : 'list-outline';
  };
  
  const getHeaderTitle = () => {
    return viewMode === 'projects' ? 'Projects' : 'Tasks';
  };

  return (
    <View style={styles.header}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons 
          name={getHeaderIcon()} 
          size={20} 
          color={theme.primary} 
          style={{ marginRight: 8 }}
        />
        <Text style={[{ fontSize: 24, fontWeight: 'bold', color: theme.text }]}>
          {getHeaderTitle()}
        </Text>
      </View>
    </View>
  );
};

export default TasksHeader;
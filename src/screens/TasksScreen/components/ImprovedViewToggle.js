// src/screens/TasksScreen/components/ImprovedViewToggle.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const ImprovedViewToggle = ({ viewMode, setViewMode, theme, isDarkMode }) => {
  // Define consistent colors - using the theme's primary color
  const ACTIVE_COLOR = theme.primary || '#FFA500'; // Use theme primary or orange as fallback
  
  // Function to get background color based on active tab
  const getBackgroundColor = (tabName) => {
    return viewMode === tabName ? ACTIVE_COLOR : 'transparent';
  };
  
  // Function to get text/icon color based on active tab
  const getTextColor = (tabName) => {
    return viewMode === tabName 
      ? (isDarkMode ? '#000000' : '#FFFFFF') // Text on active tab
      : theme.textSecondary; // Text on inactive tab
  };

  return (
    <View style={[styles.viewToggleContainer, { backgroundColor: theme.cardElevated }]}>
      <View style={styles.viewToggle}>
        {/* List Tab */}
        <View
          style={[
            styles.viewToggleButton, 
            { 
              backgroundColor: getBackgroundColor('list'),
              borderTopLeftRadius: 20, 
              borderBottomLeftRadius: 20 
            }
          ]}
        >
          <TouchableOpacity
            style={{ 
              flex: 1, 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%' 
            }}
            onPress={() => setViewMode('list')}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="list"
                size={20}
                color={getTextColor('list')}
              />
              <Text
                style={[
                  styles.viewToggleText,
                  { color: getTextColor('list') }
                ]}
              >
                List
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Kanban Tab */}
        <View
          style={[
            styles.viewToggleButton, 
            { 
              backgroundColor: getBackgroundColor('kanban'),
              borderTopRightRadius: 20, 
              borderBottomRightRadius: 20 
            }
          ]}
        >
          <TouchableOpacity
            style={{
              flex: 1, 
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}
            onPress={() => setViewMode('kanban')}
            activeOpacity={0.8}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name="grid"
                size={20}
                color={getTextColor('kanban')}
              />
              <Text
                style={[
                  styles.viewToggleText,
                  { color: getTextColor('kanban') }
                ]}
              >
                Kanban
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ImprovedViewToggle;
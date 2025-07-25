// src/screens/TasksScreen/components/ViewToggle.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const ViewToggle = ({ viewMode, setViewMode, theme, isDarkMode, viewSwitchIndicator }) => {
  // Define consistent colors that won't change
  const VIBRANT_ORANGE = '#FFA500'; // Bright orange for both tabs
  const VIBRANT_ORANGE_KANBAN = '#FFA500'; // Same orange for kanban tab
  
  // Local state for active colors to ensure they don't change
  const listBgColor = useRef(new Animated.Value(viewMode === 'list' ? 1 : 0)).current;
  const kanbanBgColor = useRef(new Animated.Value(viewMode === 'kanban' ? 1 : 0)).current;
  
  // Update animation when view mode changes
  useEffect(() => {
    if (viewMode === 'list') {
      Animated.timing(listBgColor, {
        toValue: 1,
        duration: 0, // Instant change to avoid animation issues
        useNativeDriver: false,
      }).start();
      Animated.timing(kanbanBgColor, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(listBgColor, {
        toValue: 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
      Animated.timing(kanbanBgColor, {
        toValue: 1,
        duration: 0,
        useNativeDriver: false,
      }).start();
    }
  }, [viewMode]);

  // Interpolate background colors to ensure they're always correct
  const listBackgroundColor = listBgColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', VIBRANT_ORANGE]
  });
  
  const kanbanBackgroundColor = kanbanBgColor.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', VIBRANT_ORANGE_KANBAN]
  });

  return (
    <View style={[styles.viewToggleContainer, { backgroundColor: theme.cardElevated }]}>
      <View style={styles.viewToggle}>
        <Animated.View
          style={[
            styles.viewToggleButton,
            { 
              backgroundColor: listBackgroundColor,
              borderTopLeftRadius: 20,
              borderBottomLeftRadius: 20,
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
            <Ionicons
              name="list"
              size={20}
              color={viewMode === 'list' 
                ? (isDarkMode ? '#000000' : '#FFFFFF') 
                : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.viewToggleText,
                { 
                  color: viewMode === 'list' 
                    ? (isDarkMode ? '#000000' : '#FFFFFF') 
                    : theme.textSecondary 
                }
              ]}
            >
              List
            </Text>
          </TouchableOpacity>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.viewToggleButton,
            { 
              backgroundColor: kanbanBackgroundColor,
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
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
            <Ionicons
              name="grid"
              size={20}
              color={viewMode === 'kanban' 
                ? (isDarkMode ? '#000000' : '#FFFFFF') 
                : theme.textSecondary
              }
            />
            <Text
              style={[
                styles.viewToggleText,
                { 
                  color: viewMode === 'kanban' 
                    ? (isDarkMode ? '#000000' : '#FFFFFF') 
                    : theme.textSecondary 
                }
              ]}
            >
              Kanban
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
};

export default ViewToggle;
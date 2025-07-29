// src/screens/PricingScreen/components/ViewToggle.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ViewToggle = ({ theme, viewMode, setViewMode }) => {
  return (
    <View style={[styles.container, { backgroundColor: theme.cardElevated }]}>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          viewMode === 'cards' && [
            styles.activeButton,
            { backgroundColor: theme.primary }
          ]
        ]}
        onPress={() => setViewMode('cards')}
      >
        <Ionicons
          name="grid-outline"
          size={18}
          color={viewMode === 'cards' ? '#FFFFFF' : theme.text}
        />
        <Text
          style={[
            styles.toggleText,
            { color: viewMode === 'cards' ? '#FFFFFF' : theme.text }
          ]}
        >
          Plan Cards
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.toggleButton,
          viewMode === 'table' && [
            styles.activeButton,
            { backgroundColor: theme.primary }
          ]
        ]}
        onPress={() => setViewMode('table')}
      >
        <Ionicons
          name="list-outline"
          size={18}
          color={viewMode === 'table' ? '#FFFFFF' : theme.text}
        />
        <Text
          style={[
            styles.toggleText,
            { color: viewMode === 'table' ? '#FFFFFF' : theme.text }
          ]}
        >
          Feature Table
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    flex: 1,
  },
  activeButton: {
    borderRadius: 22,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  }
});

export default ViewToggle;
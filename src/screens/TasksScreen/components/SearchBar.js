// src/screens/TasksScreen/components/SearchBar.js
import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

const SearchBar = ({ searchQuery, setSearchQuery, theme }) => {
  return (
    <View style={[styles.searchContainer, { backgroundColor: theme.cardElevated }]}>
      <Ionicons name="search" size={20} color={theme.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: theme.text }]}
        placeholder="Search projects..."
        placeholderTextColor={theme.textSecondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery ? (
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => setSearchQuery('')}
        >
          <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;
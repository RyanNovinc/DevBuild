// src/screens/TodoListScreen/components/NotesSection/components/SearchModal.js
import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Modal component for searching notes
 */
const SearchModal = ({
  visible,
  setVisible,
  searchQuery,
  setSearchQuery,
  isSearchActive,
  setIsSearchActive,
  theme,
  showSuccess
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setVisible(false)}
    >
      <TouchableOpacity
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        activeOpacity={1}
        onPress={() => setVisible(false)}
      >
        <View 
          style={{
            width: '85%',
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 20,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
          }}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Text style={{ 
            fontSize: 18,
            fontWeight: '600',
            color: theme.text,
            marginBottom: 15
          }}>
            Search Notes
          </Text>
          
          <View style={{
            flexDirection: 'row',
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            paddingHorizontal: 10,
            marginBottom: 15
          }}>
            <TextInput
              style={{
                flex: 1,
                height: 40,
                color: theme.text
              }}
              placeholder="Search in notes..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  setIsSearchActive(true);
                  setVisible(false);
                  showSuccess(`Searching for: "${searchQuery}"`);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={{ justifyContent: 'center' }}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between'
          }}>
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.border,
              }}
              onPress={() => {
                setVisible(false);
              }}
            >
              <Text style={{ color: theme.textSecondary }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor: theme.primary,
                opacity: searchQuery.trim() ? 1 : 0.5
              }}
              onPress={() => {
                if (searchQuery.trim()) {
                  setIsSearchActive(true);
                  setVisible(false);
                  showSuccess(`Searching for: "${searchQuery}"`);
                } else {
                  // Don't activate search if query is empty
                  setIsSearchActive(false);
                  setVisible(false);
                }
              }}
              disabled={!searchQuery.trim()}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default React.memo(SearchModal);
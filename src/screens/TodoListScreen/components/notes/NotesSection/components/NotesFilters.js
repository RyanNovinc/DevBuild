// src/screens/TodoListScreen/components/NotesSection/components/NotesFilters.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Component for active filter indicators (tags and search)
 */
const NotesFilters = ({
  activeTagFilter,
  setActiveTagFilter,
  isSearchActive,
  searchQuery,
  setIsSearchActive,
  setSearchQuery,
  setShowSearchModal,
  theme,
  showSuccess
}) => {
  // Get the color for a tag (fallback to primary color if not found)
  const getTagColor = (tagName) => {
    return theme.primary;
  };

  return (
    <>
      {/* Search Indicator - only show if there's an active search WITH content */}
      {isSearchActive && searchQuery.trim() ? (
        <TouchableOpacity 
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: theme.cardElevated,
            borderWidth: 1,
            borderColor: theme.primary,
          }}
          onPress={() => setShowSearchModal(true)}
          activeOpacity={0.7}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="search" size={16} color={theme.primary} />
            <Text style={{ 
              marginLeft: 8, 
              color: theme.text, 
              fontWeight: '500',
              fontSize: 14
            }}>
              Search: <Text style={{ fontWeight: '600' }}>{searchQuery}</Text>
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation(); // Prevent triggering parent onPress
              setIsSearchActive(false);
              setSearchQuery('');
              showSuccess('Search cleared');
            }}
            style={{
              padding: 4,
              borderRadius: 12
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : null}
      
      {/* Active Filter Indicator - only show if there's an active filter */}
      {activeTagFilter && (
        <View 
          style={{
            marginHorizontal: 16,
            marginBottom: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: activeTagFilter === 'NO_TAGS' ? 
              theme.cardElevated : 
              getTagColor(activeTagFilter) + '20',
            borderWidth: 1,
            borderColor: activeTagFilter === 'NO_TAGS' ? 
              theme.border : 
              getTagColor(activeTagFilter),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={activeTagFilter === 'NO_TAGS' ? "remove-circle-outline" : "pricetag"} 
              size={16} 
              color={activeTagFilter === 'NO_TAGS' ? theme.textSecondary : getTagColor(activeTagFilter)} 
            />
            <Text style={{ 
              marginLeft: 8, 
              color: theme.text, 
              fontWeight: '500',
              fontSize: 14
            }}>
              Filtered by: <Text style={{ fontWeight: '600' }}>
                {activeTagFilter === 'NO_TAGS' ? 'No Tags' : activeTagFilter}
              </Text>
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={() => {
              setActiveTagFilter(null);
              showSuccess('Filter cleared');
            }}
            style={{
              padding: 4,
              borderRadius: 12
            }}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

export default React.memo(NotesFilters);
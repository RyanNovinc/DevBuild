// src/screens/TodoListScreen/components/NotesSection/components/FilterModal.js
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getContrastText } from '../../../TodoUtils';

/**
 * Modal component for tag filtering
 */
const FilterModal = ({
  visible,
  setVisible,
  activeTagFilter,
  setActiveTagFilter,
  getAllTags,
  createNewNote,
  theme,
  showSuccess
}) => {
  // Get the color for a tag (fallback to primary color if not found)
  const getTagColor = (tagName) => {
    return theme.primary;
  };
  
  // Check if theme is dark mode
  const isDarkMode = theme.background === '#000000';

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
            maxHeight: '80%',
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
          <View style={{ 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            paddingBottom: 10
          }}>
            <Text style={{ 
              fontSize: 18,
              fontWeight: '600',
              color: theme.text
            }}>
              Filter Notes by Tag
            </Text>
            <TouchableOpacity
              onPress={() => setVisible(false)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          {activeTagFilter && (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                marginBottom: 10
              }}
              onPress={() => {
                setActiveTagFilter(null);
                setVisible(false);
                showSuccess('Filter cleared');
              }}
            >
              <Ionicons name="close-circle-outline" size={22} color={theme.primary} style={{ marginRight: 10 }} />
              <Text style={{ fontSize: 16, color: theme.primary, fontWeight: '500' }}>
                Clear Filter
              </Text>
            </TouchableOpacity>
          )}
          
          <ScrollView 
            style={{ 
              maxHeight: 300,
              marginBottom: 10
            }}
            showsVerticalScrollIndicator={true}
          >
            {/* Option to filter for notes with no tags */}
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 1,
                backgroundColor: activeTagFilter === 'NO_TAGS' ? theme.cardElevated : 'transparent',
                borderColor: activeTagFilter === 'NO_TAGS' ? theme.primary : theme.border,
              }}
              onPress={() => {
                setActiveTagFilter(activeTagFilter === 'NO_TAGS' ? null : 'NO_TAGS');
                setVisible(false);
                showSuccess(activeTagFilter === 'NO_TAGS' ? 'Filter cleared' : 'Filtered by: No Tags');
              }}
            >
              <Ionicons 
                name="remove-circle-outline" 
                size={22} 
                color={theme.textSecondary} 
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 16, fontWeight: '500', color: theme.text }}>
                Notes with No Tags
              </Text>
              
              {activeTagFilter === 'NO_TAGS' && (
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={22} 
                    color={theme.primary} 
                  />
                </View>
              )}
            </TouchableOpacity>
            
            {/* Regular tag options */}
            {getAllTags().length > 0 ? (
              getAllTags().map(tagName => {
                const isActive = activeTagFilter === tagName;
                const tagColor = getTagColor(tagName);
                
                return (
                  <TouchableOpacity
                    key={tagName}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      backgroundColor: isActive ? tagColor + '20' : 'transparent',
                      borderColor: isActive ? tagColor : theme.border,
                    }}
                    onPress={() => {
                      setActiveTagFilter(tagName === activeTagFilter ? null : tagName);
                      setVisible(false);
                      showSuccess(tagName === activeTagFilter ? 'Filter cleared' : `Filtered by tag: ${tagName}`);
                    }}
                  >
                    <View style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: tagColor,
                      marginRight: 10
                    }} />
                    <Text style={{ fontSize: 16, fontWeight: '500', color: theme.text }}>
                      {tagName}
                    </Text>
                    
                    {isActive && (
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Ionicons 
                          name="checkmark-circle" 
                          size={22} 
                          color={tagColor} 
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={{ 
                padding: 20, 
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons 
                  name="pricetags-outline" 
                  size={40} 
                  color={theme.textSecondary}
                  style={{ marginBottom: 10, opacity: 0.7 }}
                />
                <Text style={{ 
                  color: theme.textSecondary,
                  fontSize: 16,
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  No tags available
                </Text>
                <Text style={{ 
                  color: theme.textSecondary,
                  fontSize: 14,
                  textAlign: 'center',
                  marginTop: 5
                }}>
                  Add tags to your notes to enable filtering
                </Text>
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity
            style={{
              backgroundColor: theme.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
              marginTop: 10
            }}
            onPress={() => {
              setVisible(false);
              // Open note creation with tag focus
              createNewNote();
            }}
          >
            <Text style={{ 
              color: getContrastText(theme.primary, isDarkMode, theme),
              fontWeight: '600',
              fontSize: 16
            }}>
              Create New Note
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default React.memo(FilterModal);
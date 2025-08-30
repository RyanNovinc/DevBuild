// src/components/IconPicker.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useTheme } from '../context/ThemeContext';
import { scaleWidth, scaleHeight, scaleFontSize, spacing } from '../utils/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Available icons for timeblock customization
const AVAILABLE_ICONS = [
  // Common activities
  { name: 'cafe-outline', label: 'Cafe' },
  { name: 'restaurant-outline', label: 'Food' },
  { name: 'car-outline', label: 'Transport' },
  { name: 'home-outline', label: 'Home' },
  { name: 'business-outline', label: 'Work' },
  
  // Exercise & Health
  { name: 'fitness-outline', label: 'Fitness' },
  { name: 'walk-outline', label: 'Walk' },
  { name: 'bicycle-outline', label: 'Bike' },
  { name: 'heart-outline', label: 'Health' },
  { name: 'medical-outline', label: 'Medical' },
  
  // Learning & Creativity
  { name: 'book-outline', label: 'Reading' },
  { name: 'school-outline', label: 'Study' },
  { name: 'brush-outline', label: 'Art' },
  { name: 'musical-notes-outline', label: 'Music' },
  { name: 'camera-outline', label: 'Photo' },
  
  // Social & Communication
  { name: 'people-outline', label: 'Social' },
  { name: 'call-outline', label: 'Call' },
  { name: 'chatbubble-outline', label: 'Chat' },
  { name: 'videocam-outline', label: 'Video' },
  { name: 'gift-outline', label: 'Event' },
  
  // Personal Care
  { name: 'cut-outline', label: 'Grooming' },
  { name: 'shirt-outline', label: 'Clothes' },
  { name: 'bed-outline', label: 'Sleep' },
  { name: 'water-outline', label: 'Hygiene' },
  { name: 'flower-outline', label: 'Relax' },
  
  // Technology & Tools
  { name: 'laptop-outline', label: 'Computer' },
  { name: 'phone-portrait-outline', label: 'Phone' },
  { name: 'tv-outline', label: 'TV' },
  { name: 'game-controller-outline', label: 'Gaming' },
  { name: 'construct-outline', label: 'Build' },
  
  // Nature & Outdoor
  { name: 'sunny-outline', label: 'Outdoor' },
  { name: 'partly-sunny-outline', label: 'Weather' },
  { name: 'leaf-outline', label: 'Nature' },
  { name: 'trail-sign-outline', label: 'Hiking' },
  { name: 'boat-outline', label: 'Water' },
  
  // Shopping & Errands
  { name: 'bag-outline', label: 'Shopping' },
  { name: 'card-outline', label: 'Finance' },
  { name: 'document-outline', label: 'Papers' },
  { name: 'mail-outline', label: 'Mail' },
  { name: 'storefront-outline', label: 'Store' },
  
  // Miscellaneous
  { name: 'star-outline', label: 'Special' },
  { name: 'trophy-outline', label: 'Achievement' },
  { name: 'calendar-outline', label: 'Schedule' },
  { name: 'time-outline', label: 'Time' },
  { name: 'location-outline', label: 'Location' }
];

// Emoji icons collection
const EMOJI_ICONS = [
  // Nature & Outdoors
  { emoji: '🌴', label: 'Palm Tree' },
  { emoji: '🌲', label: 'Tree' },
  { emoji: '🌸', label: 'Blossom' },
  { emoji: '🌞', label: 'Sun' },
  { emoji: '🌙', label: 'Moon' },
  { emoji: '🌟', label: 'Star' },
  { emoji: '🌈', label: 'Rainbow' },
  { emoji: '🏔️', label: 'Mountain' },
  { emoji: '🏖️', label: 'Beach' },
  { emoji: '🌊', label: 'Wave' },
  
  // Activities & Sports
  { emoji: '⚽', label: 'Soccer' },
  { emoji: '🏀', label: 'Basketball' },
  { emoji: '🎾', label: 'Tennis' },
  { emoji: '🏊', label: 'Swimming' },
  { emoji: '🚴', label: 'Cycling' },
  { emoji: '🏃', label: 'Running' },
  { emoji: '🧘', label: 'Meditation' },
  { emoji: '🎯', label: 'Target' },
  { emoji: '🏆', label: 'Trophy' },
  { emoji: '🎮', label: 'Gaming' },
  
  // Food & Drink
  { emoji: '☕', label: 'Coffee' },
  { emoji: '🍕', label: 'Pizza' },
  { emoji: '🍎', label: 'Apple' },
  { emoji: '🥗', label: 'Salad' },
  { emoji: '🍰', label: 'Cake' },
  { emoji: '🍷', label: 'Wine' },
  { emoji: '🥤', label: 'Drink' },
  { emoji: '🍔', label: 'Burger' },
  { emoji: '🍜', label: 'Noodles' },
  { emoji: '🧊', label: 'Ice' },
  
  // Transportation
  { emoji: '🚗', label: 'Car' },
  { emoji: '✈️', label: 'Plane' },
  { emoji: '🚊', label: 'Train' },
  { emoji: '🚲', label: 'Bike' },
  { emoji: '🚕', label: 'Taxi' },
  { emoji: '🚌', label: 'Bus' },
  { emoji: '⛵', label: 'Boat' },
  { emoji: '🏍️', label: 'Motorcycle' },
  { emoji: '🚁', label: 'Helicopter' },
  { emoji: '🛸', label: 'UFO' },
  
  // Work & Study
  { emoji: '💼', label: 'Briefcase' },
  { emoji: '💻', label: 'Laptop' },
  { emoji: '📚', label: 'Books' },
  { emoji: '✏️', label: 'Pencil' },
  { emoji: '📊', label: 'Chart' },
  { emoji: '📞', label: 'Phone' },
  { emoji: '💡', label: 'Idea' },
  { emoji: '🔍', label: 'Search' },
  { emoji: '📝', label: 'Note' },
  { emoji: '🎯', label: 'Goal' },
  
  // Entertainment & Arts
  { emoji: '🎵', label: 'Music' },
  { emoji: '🎬', label: 'Movie' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '📸', label: 'Camera' },
  { emoji: '🎪', label: 'Circus' },
  { emoji: '🎭', label: 'Theater' },
  { emoji: '🎸', label: 'Guitar' },
  { emoji: '🎤', label: 'Microphone' },
  { emoji: '📺', label: 'TV' },
  { emoji: '🎲', label: 'Dice' },
  
  // Health & Wellness
  { emoji: '💊', label: 'Medicine' },
  { emoji: '🩺', label: 'Stethoscope' },
  { emoji: '💉', label: 'Syringe' },
  { emoji: '🧴', label: 'Lotion' },
  { emoji: '🦷', label: 'Tooth' },
  { emoji: '👁️', label: 'Eye' },
  { emoji: '💪', label: 'Muscle' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🧠', label: 'Brain' },
  { emoji: '😴', label: 'Sleep' },
  
  // People & Social
  { emoji: '👥', label: 'People' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Family' },
  { emoji: '💑', label: 'Couple' },
  { emoji: '🤝', label: 'Handshake' },
  { emoji: '👋', label: 'Wave' },
  { emoji: '💬', label: 'Chat' },
  { emoji: '📱', label: 'Mobile' },
  { emoji: '💌', label: 'Love Letter' },
  { emoji: '🎁', label: 'Gift' },
  { emoji: '🎉', label: 'Party' },
  
  // Symbols & Objects
  { emoji: '💰', label: 'Money' },
  { emoji: '🏠', label: 'House' },
  { emoji: '🔑', label: 'Key' },
  { emoji: '🛏️', label: 'Bed' },
  { emoji: '🛁', label: 'Bath' },
  { emoji: '🚿', label: 'Shower' },
  { emoji: '🧽', label: 'Sponge' },
  { emoji: '🧻', label: 'Tissue' },
  { emoji: '🗂️', label: 'Files' },
  { emoji: '📦', label: 'Package' }
];

const IconPicker = ({ 
  visible, 
  onClose, 
  selectedIcon, // For single select mode OR selected icons array for multi-select
  onSelectIcon,
  customColor = '#6366f1',
  favoritesStorageKey = 'iconPickerFavorites', // Default key, can be overridden
  multiSelect = false, // New prop for multi-select mode
  maxSelection = 6 // Maximum number of icons that can be selected
}) => {
  const { theme } = useTheme();
  
  // Tab state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'favorites', title: 'Favorites' },
    { key: 'all', title: 'All Icons' },
  ]);
  
  // Dynamic favorites state
  const [favoriteIcons, setFavoriteIcons] = useState([]);
  
  // Emoji toggle state for All Icons tab
  const [showEmojis, setShowEmojis] = useState(false);
  
  // Multi-select state
  const [selectedIcons, setSelectedIcons] = useState([]);
  
  
  // Initialize selected icons when modal opens
  React.useEffect(() => {
    if (visible && multiSelect) {
      setSelectedIcons(Array.isArray(selectedIcon) ? [...selectedIcon] : []);
    }
  }, [visible, multiSelect, selectedIcon]);
  
  // Load favorites from storage
  useEffect(() => {
    loadFavorites();
  }, [favoritesStorageKey]); // Reload when storage key changes
  
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(favoritesStorageKey);
      if (stored) {
        setFavoriteIcons(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };
  
  const saveFavorites = async (favorites) => {
    try {
      await AsyncStorage.setItem(favoritesStorageKey, JSON.stringify(favorites));
    } catch (error) {
      console.log('Error saving favorites:', error);
    }
  };
  
  const toggleFavorite = React.useCallback((iconName) => {
    const newFavorites = favoriteIcons.includes(iconName)
      ? favoriteIcons.filter(name => name !== iconName)
      : [...favoriteIcons, iconName];
    
    setFavoriteIcons(newFavorites);
    saveFavorites(newFavorites);
  }, [favoriteIcons]);
  
  // Calculate number of columns for FlatList grid
  const numColumns = 4;
  
  const renderIconGrid = React.useCallback((icons, showFavoriteIndicator = false, isEmojiMode = false) => {
    // Prepare data for FlatList
    const flatListData = icons.map((item, index) => ({
      id: isEmojiMode ? `emoji-${index}-${item.emoji}` : `icon-${index}-${typeof item === 'string' ? item : item.name}`,
      item,
      index,
      isEmojiMode
    }));

    const renderIconItem = ({ item: dataItem }) => {
      const { item, index, isEmojiMode } = dataItem;
          let iconKey, iconDisplayData, isFavorite;
          
          if (isEmojiMode) {
            // Handle emoji items
            iconKey = item.emoji;
            iconDisplayData = item;
            isFavorite = favoriteIcons.includes(item.emoji);
          } else {
            // Handle regular icon items (string names)
            const iconName = typeof item === 'string' ? item : item.name;
            iconKey = iconName;
            iconDisplayData = AVAILABLE_ICONS.find(icon => icon.name === iconName);
            if (!iconDisplayData) return null;
            isFavorite = favoriteIcons.includes(iconName);
          }
          
          const isSelected = multiSelect 
            ? selectedIcons.includes(iconKey)
            : selectedIcon === iconKey;
          
          return (
            <TouchableOpacity
              key={`${isEmojiMode ? 'emoji' : 'icon'}-${index}-${iconKey}`}
              style={{
                width: 65,
                height: 65,
                backgroundColor: isSelected 
                  ? `${customColor}20` 
                  : (theme.card || '#FFFFFF'),
                borderColor: isSelected 
                  ? customColor 
                  : (theme.border || '#E0E0E0'),
                borderWidth: isSelected ? 2 : 1,
                borderRadius: 12,
                margin: 8, // Increased margin for better spacing
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
              onPress={() => {
                if (multiSelect) {
                  // Multi-select mode
                  if (selectedIcons.includes(iconKey)) {
                    // Remove from selection
                    setSelectedIcons(prev => prev.filter(id => id !== iconKey));
                  } else if (selectedIcons.length < maxSelection) {
                    // Add to selection if under limit
                    setSelectedIcons(prev => [...prev, iconKey]);
                  } else {
                    // Show feedback when max limit reached
                    Alert.alert(
                      'Maximum Selection Reached',
                      `You can select up to ${maxSelection} icons per day. Remove some to add new ones.`,
                      [{ text: 'OK' }]
                    );
                  }
                } else {
                  // Single select mode
                  if (selectedIcon === iconKey) {
                    onSelectIcon(null);
                  } else {
                    onSelectIcon(iconKey);
                  }
                }
              }}
              onLongPress={() => toggleFavorite(iconKey)}
              activeOpacity={0.7}
            >
              {isEmojiMode ? (
                <Text style={{
                  fontSize: 28,
                  textAlign: 'center'
                }}>
                  {item.emoji}
                </Text>
              ) : (
                <Ionicons 
                  name={iconKey} 
                  size={26} 
                  color={isSelected ? customColor : (theme.text || '#333333')} 
                />
              )}
              
              {/* Multi-select count indicator */}
              {multiSelect && isSelected && (
                <View style={{
                  position: 'absolute',
                  top: 2,
                  left: 2,
                  backgroundColor: customColor,
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 'bold'
                  }}>
                    {selectedIcons.indexOf(iconKey) + 1}
                  </Text>
                </View>
              )}
              
              {/* Favorite indicator */}
              {isFavorite && showFavoriteIndicator && (
                <View style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: customColor,
                  borderRadius: 8,
                  width: 16,
                  height: 16,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <Ionicons name="heart" size={10} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        };

    return (
      <FlatList
        style={{ flex: 1 }}
        data={flatListData}
        renderItem={renderIconItem}
        numColumns={numColumns}
        key={`${isEmojiMode ? 'emoji' : 'icon'}-${numColumns}`} // Force re-render when mode changes
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={false}
        keyboardShouldPersistTaps="handled"
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 0
        }}
        ListFooterComponent={() => (
          <View style={{ paddingHorizontal: 16, paddingBottom: 32, marginTop: 16 }}>
            <Text style={{
              textAlign: 'center',
              fontSize: 12,
              color: theme.textSecondary || '#666666',
              paddingHorizontal: 20,
              lineHeight: 16
            }}>
            {showFavoriteIndicator 
              ? (multiSelect 
                ? `${multiSelect ? 'Tap to select up to ' + maxSelection + ' ' : 'Tap to select '}${isEmojiMode ? 'emojis' : 'icons'}. Long press to add/remove from favorites.`
                : `Long press any ${isEmojiMode ? 'emoji' : 'icon'} to add/remove from favorites`
              ) 
              : (multiSelect 
                ? `Your favorite icons and emojis (${selectedIcons.length}/${maxSelection} selected)`
                : 'Your favorite icons and emojis for quick access'
              )}
            </Text>
          </View>
        )}
      />
    );
  }, [selectedIcons, multiSelect, maxSelection, favoriteIcons, customColor, theme, toggleFavorite]);
  
  const FavoritesRoute = () => {
    if (favoriteIcons.length === 0) {
      return (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          paddingHorizontal: 32 
        }}>
          <Ionicons 
            name="heart-outline" 
            size={64} 
            color={theme.textSecondary || '#CCCCCC'} 
          />
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.text || '#333333',
            textAlign: 'center',
            marginTop: 16,
            marginBottom: 8
          }}>
            No Favorites Yet
          </Text>
          <Text style={{
            fontSize: 14,
            color: theme.textSecondary || '#666666',
            textAlign: 'center',
            lineHeight: 20
          }}>
            Go to "All Icons" and long press any icon or emoji to add it to your favorites
          </Text>
        </View>
      );
    }
    
    // Separate favorites into regular icons and emojis
    const regularIconFavorites = [];
    const emojiIconFavorites = [];
    
    favoriteIcons.forEach(favorite => {
      // Check if it's an emoji (Unicode character) or regular icon name
      const isEmoji = EMOJI_ICONS.some(emoji => emoji.emoji === favorite);
      if (isEmoji) {
        const emojiData = EMOJI_ICONS.find(emoji => emoji.emoji === favorite);
        emojiIconFavorites.push(emojiData);
      } else {
        regularIconFavorites.push(favorite);
      }
    });
    
    return (
      <ScrollView 
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {/* Regular Icons Section */}
        {regularIconFavorites.length > 0 && (
          <>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.text || '#333333',
              marginBottom: 12,
              textAlign: 'center'
            }}>
              Icon Favorites
            </Text>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 24
            }}>
              {regularIconFavorites.map((iconName, index) => {
                const iconData = AVAILABLE_ICONS.find(icon => icon.name === iconName);
                if (!iconData) return null;
                
                const isSelected = multiSelect 
                  ? selectedIcons.includes(iconName)
                  : selectedIcon === iconName;
                
                return (
                  <TouchableOpacity
                    key={`regular-${index}-${iconName}`}
                    style={{
                      width: 65,
                      height: 65,
                      backgroundColor: isSelected 
                        ? `${customColor}20` 
                        : (theme.card || '#FFFFFF'),
                      borderColor: isSelected 
                        ? customColor 
                        : (theme.border || '#E0E0E0'),
                      borderWidth: isSelected ? 2 : 1,
                      borderRadius: 12,
                      margin: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                    onPress={() => {
                      if (multiSelect) {
                        if (selectedIcons.includes(iconName)) {
                          setSelectedIcons(prev => prev.filter(id => id !== iconName));
                        } else if (selectedIcons.length < maxSelection) {
                          setSelectedIcons(prev => [...prev, iconName]);
                        } else {
                          Alert.alert(
                            'Maximum Selection Reached',
                            `You can select up to ${maxSelection} icons per day. Remove some to add new ones.`,
                            [{ text: 'OK' }]
                          );
                        }
                      } else {
                        if (selectedIcon === iconName) {
                          onSelectIcon(null);
                        } else {
                          onSelectIcon(iconName);
                        }
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={iconName} 
                      size={26} 
                      color={isSelected ? customColor : (theme.text || '#333333')} 
                    />
                    
                    {/* Multi-select count indicator */}
                    {multiSelect && isSelected && (
                      <View style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        backgroundColor: customColor,
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>
                          {selectedIcons.indexOf(iconName) + 1}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
        
        {/* Emoji Icons Section */}
        {emojiIconFavorites.length > 0 && (
          <>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.text || '#333333',
              marginBottom: 12,
              textAlign: 'center'
            }}>
              Emoji Favorites
            </Text>
            <View style={{ 
              flexDirection: 'row', 
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              {emojiIconFavorites.map((emojiData, index) => {
                const isSelected = multiSelect 
                  ? selectedIcons.includes(emojiData.emoji)
                  : selectedIcon === emojiData.emoji;
                
                return (
                  <TouchableOpacity
                    key={`emoji-${index}-${emojiData.emoji}`}
                    style={{
                      width: 65,
                      height: 65,
                      backgroundColor: isSelected 
                        ? `${customColor}20` 
                        : (theme.card || '#FFFFFF'),
                      borderColor: isSelected 
                        ? customColor 
                        : (theme.border || '#E0E0E0'),
                      borderWidth: isSelected ? 2 : 1,
                      borderRadius: 12,
                      margin: 5,
                      justifyContent: 'center',
                      alignItems: 'center',
                      position: 'relative'
                    }}
                    onPress={() => {
                      if (multiSelect) {
                        if (selectedIcons.includes(emojiData.emoji)) {
                          setSelectedIcons(prev => prev.filter(id => id !== emojiData.emoji));
                        } else if (selectedIcons.length < maxSelection) {
                          setSelectedIcons(prev => [...prev, emojiData.emoji]);
                        } else {
                          Alert.alert(
                            'Maximum Selection Reached',
                            `You can select up to ${maxSelection} icons per day. Remove some to add new ones.`,
                            [{ text: 'OK' }]
                          );
                        }
                      } else {
                        if (selectedIcon === emojiData.emoji) {
                          onSelectIcon(null);
                        } else {
                          onSelectIcon(emojiData.emoji);
                        }
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{
                      fontSize: 28,
                      textAlign: 'center'
                    }}>
                      {emojiData.emoji}
                    </Text>
                    
                    {/* Multi-select count indicator */}
                    {multiSelect && isSelected && (
                      <View style={{
                        position: 'absolute',
                        top: 2,
                        left: 2,
                        backgroundColor: customColor,
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Text style={{
                          color: '#FFFFFF',
                          fontSize: 12,
                          fontWeight: 'bold'
                        }}>
                          {selectedIcons.indexOf(emojiData.emoji) + 1}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
        
        {/* Instructions */}
        <Text style={{
          textAlign: 'center',
          fontSize: 12,
          color: theme.textSecondary || '#666666',
          marginTop: 16,
          paddingHorizontal: 20,
          lineHeight: 16
        }}>
          Your favorite icons and emojis for quick access
        </Text>
      </ScrollView>
    );
  };
  
  const AllIconsRoute = () => {
    return (
      <View style={{ flex: 1 }}>
        {/* Toggle between icons and emojis */}
        <View style={{
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.border || '#E0E0E0'
        }}>
          {/* Toggle Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <TouchableOpacity
              onPress={() => setShowEmojis(false)}
              style={{
                backgroundColor: !showEmojis ? customColor : 'transparent',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                marginRight: 8,
                borderWidth: 1,
                borderColor: customColor
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: !showEmojis ? '#FFFFFF' : customColor,
                fontSize: 14,
                fontWeight: '600'
              }}>
                Icons
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowEmojis(true)}
              style={{
                backgroundColor: showEmojis ? customColor : 'transparent',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: customColor
              }}
              activeOpacity={0.7}
            >
              <Text style={{
                color: showEmojis ? '#FFFFFF' : customColor,
                fontSize: 14,
                fontWeight: '600'
              }}>
                Emojis
              </Text>
            </TouchableOpacity>
          </View>
          
          {/* Hint Text */}
          <Text style={{
            textAlign: 'center',
            fontSize: 11,
            color: theme.textSecondary || '#666666',
            fontStyle: 'italic',
          }}>
            Long press to add to favorites
          </Text>
        </View>
        
        {/* Render appropriate grid */}
        <View key={showEmojis ? 'emoji-grid' : 'icon-grid'} style={{ flex: 1 }}>
          {showEmojis 
            ? renderIconGrid(EMOJI_ICONS, true, true)
            : renderIconGrid(AVAILABLE_ICONS.map(icon => icon.name), true, false)
          }
        </View>
      </View>
    );
  };
  
  const renderScene = SceneMap({
    favorites: FavoritesRoute,
    all: AllIconsRoute,
  });
  
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: customColor }}
      style={{ 
        backgroundColor: theme.background || '#FFFFFF',
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.border || '#E0E0E0'
      }}
      labelStyle={{ 
        color: theme.text || '#333333',
        fontSize: 14,
        fontWeight: '600'
      }}
      activeColor={customColor}
      inactiveColor={theme.textSecondary || '#666666'}
    />
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.background || '#FFFFFF' }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text || '#333333' }]}>
              {multiSelect ? `Choose Icons (${selectedIcons.length}/${maxSelection})` : 'Choose Icon'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textSecondary || '#666666'} />
            </TouchableOpacity>
          </View>
          
          {/* Tab View */}
          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width }}
            renderTabBar={renderTabBar}
            style={{ flex: 1 }}
          />
          
          {/* Footer with Save/Cancel buttons */}
          <View style={styles.footer}>
            {multiSelect ? (
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%'
              }}>
                {/* Cancel Button */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { 
                      backgroundColor: 'transparent',
                      borderColor: theme.border || '#E0E0E0',
                      flex: 1,
                      marginRight: 8
                    }
                  ]}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="close-outline" 
                    size={20} 
                    color={theme.text || '#333333'} 
                  />
                  <Text 
                    style={[
                      styles.saveButtonText, 
                      { 
                        color: theme.text || '#333333',
                        fontWeight: '600'
                      }
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                {/* Commit Button */}
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    { 
                      backgroundColor: customColor,
                      borderColor: customColor,
                      flex: 1,
                      marginLeft: 8
                    }
                  ]}
                  onPress={() => {
                    onSelectIcon(selectedIcons);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name="checkmark-outline" 
                    size={20} 
                    color="#FFFFFF" 
                  />
                  <Text 
                    style={[
                      styles.saveButtonText, 
                      { 
                        color: '#FFFFFF',
                        fontWeight: '600'
                      }
                    ]}
                  >
                    Save ({selectedIcons.length})
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Single select mode - original save button */
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { 
                    backgroundColor: customColor,
                    borderColor: customColor
                  }
                ]}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="checkmark-outline" 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text 
                  style={[
                    styles.saveButtonText, 
                    { 
                      color: '#FFFFFF',
                      fontWeight: '600'
                    }
                  ]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.m,
  },
  modalContainer: {
    width: width * 0.9,
    height: '70%',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  title: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  iconGrid: {
    flex: 1,
  },
  iconGridContent: {
    paddingBottom: spacing.m,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.s,
  },
  iconItem: {
    width: 80, // Larger fixed width
    height: 80, // Larger fixed height
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6, // Simple fixed margin
    padding: 8,
  },
  iconLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: spacing.m,
    marginTop: spacing.s,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 48,
  },
  saveButtonText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IconPicker;
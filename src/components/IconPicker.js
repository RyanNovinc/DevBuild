// src/components/IconPicker.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
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

const IconPicker = ({ 
  visible, 
  onClose, 
  selectedIcon, 
  onSelectIcon,
  customColor = '#6366f1' 
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
  
  // Load favorites from storage
  useEffect(() => {
    loadFavorites();
  }, []);
  
  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('iconPickerFavorites');
      if (stored) {
        setFavoriteIcons(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };
  
  const saveFavorites = async (favorites) => {
    try {
      await AsyncStorage.setItem('iconPickerFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.log('Error saving favorites:', error);
    }
  };
  
  const toggleFavorite = (iconName) => {
    const newFavorites = favoriteIcons.includes(iconName)
      ? favoriteIcons.filter(name => name !== iconName)
      : [...favoriteIcons, iconName];
    
    setFavoriteIcons(newFavorites);
    saveFavorites(newFavorites);
  };
  
  const renderIconGrid = (icons, showFavoriteIndicator = false) => (
    <ScrollView 
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
    >
      <View style={{ 
        flexDirection: 'row', 
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {icons.map((iconName) => {
          const iconData = AVAILABLE_ICONS.find(icon => icon.name === iconName);
          if (!iconData) return null;
          
          const isFavorite = favoriteIcons.includes(iconName);
          
          return (
            <TouchableOpacity
              key={iconName}
              style={{
                width: 65,
                height: 65,
                backgroundColor: selectedIcon === iconName 
                  ? `${customColor}20` 
                  : (theme.card || '#FFFFFF'),
                borderColor: selectedIcon === iconName 
                  ? customColor 
                  : (theme.border || '#E0E0E0'),
                borderWidth: selectedIcon === iconName ? 2 : 1,
                borderRadius: 12,
                margin: 5,
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
              onPress={() => {
                // Toggle selection - if same icon is selected, deselect it
                if (selectedIcon === iconName) {
                  onSelectIcon(null);
                } else {
                  onSelectIcon(iconName);
                }
              }}
              onLongPress={() => toggleFavorite(iconName)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={iconName} 
                size={26} 
                color={selectedIcon === iconName ? customColor : (theme.text || '#333333')} 
              />
              
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
        })}
      </View>
      
      {/* Instructions */}
      <Text style={{
        textAlign: 'center',
        fontSize: 12,
        color: theme.textSecondary || '#666666',
        marginTop: 16,
        paddingHorizontal: 20,
        lineHeight: 16
      }}>
        {showFavoriteIndicator 
          ? 'Long press any icon to add/remove from favorites' 
          : 'Your favorite icons for quick access'}
      </Text>
    </ScrollView>
  );
  
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
            Go to "All Icons" and long press any icon to add it to your favorites
          </Text>
        </View>
      );
    }
    
    return renderIconGrid(favoriteIcons, false);
  };
  
  const AllIconsRoute = () => {
    return renderIconGrid(AVAILABLE_ICONS.map(icon => icon.name), true);
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
              Choose Icon
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
          
          {/* Save Button */}
          <View style={styles.footer}>
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
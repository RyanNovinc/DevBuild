// src/screens/EditProfileScreen.js - Revamped with categorized icons and color picker
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Platform,
  FlatList,
  Animated,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import { useAppContext } from '../context/AppContext';
import { useProfile } from '../context/ProfileContext';
import { useAchievements } from '../context/AchievementContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import FeatureExplorerTracker for achievement tracking
import FeatureExplorerTracker from '../services/FeatureExplorerTracker';

// Import responsive utilities
import responsive from '../utils/responsive';

// Import avatar components
import { DefaultAvatar, COLOR_PALETTE, LevelAvatar, CustomPhotoAvatar } from '../components/AvatarComponents';

// Import level-based profile picture system
import { 
  getAvailableProfilePictures, 
  getLockedProfilePictures, 
  canUseCustomPhotos,
  getNextUnlockInfo,
  LEVEL_PROFILE_PICTURES 
} from '../data/LevelProfilePictures';

// Import level service
import LevelService from '../services/LevelService';

const {
  spacing,
  fontSizes,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  scaleWidth,
  scaleHeight,
  useSafeSpacing,
  useScreenDimensions,
  useIsLandscape,
  accessibility,
  ensureAccessibleTouchTarget
} = responsive;

// Get streak emoji based on streak length
const getStreakEmoji = (days) => {
  if (days >= 365) return '👑'; // Crown (365+ days)
  if (days >= 180) return '🏆'; // Trophy (180-364 days)
  if (days >= 90) return '⭐'; // Star (90-179 days)
  if (days >= 30) return '⚡'; // Lightning (30-89 days)
  if (days >= 7) return '🚀'; // Rocket (7-29 days)
  return '🔥'; // Flame (1-6 days)
};

// Expanded avatar icon categories
const AVATAR_ICON_CATEGORIES = {
  tech: [
    { name: 'cloud-outline', label: 'Cloud' },
    { name: 'layers-outline', label: 'Layers' },
    { name: 'flask-outline', label: 'Flask' },
    { name: 'code-slash-outline', label: 'Code' },
    { name: 'globe-outline', label: 'Globe' },
    { name: 'server-outline', label: 'Server' },
    { name: 'tv-outline', label: 'Screen' },
    { name: 'hardware-chip-outline', label: 'Chip' }
  ],
  abstract: [
    { name: 'diamond-outline', label: 'Diamond' },
    { name: 'triangle-outline', label: 'Triangle' },
    { name: 'square-outline', label: 'Square' },
    { name: 'ellipse-outline', label: 'Circle' },
    { name: 'grid-outline', label: 'Grid' },
    { name: 'infinite-outline', label: 'Infinite' },
    { name: 'pulse-outline', label: 'Pulse' },
    { name: 'prism-outline', label: 'Prism' }
  ],
  fun: [
    { name: 'skull-outline', label: 'Skull' },
    { name: 'rocket-outline', label: 'Rocket' },
    { name: 'game-controller-outline', label: 'Gaming' },
    { name: 'planet-outline', label: 'Planet' },
    { name: 'happy-outline', label: 'Happy' },
    { name: 'paw-outline', label: 'Paw' },
    { name: 'construct-outline', label: 'Robot' },
    { name: 'bonfire-outline', label: 'Fire' }
  ],
  lifestyle: [
    { name: 'bicycle-outline', label: 'Bicycle' },
    { name: 'basketball-outline', label: 'Basketball' },
    { name: 'headset-outline', label: 'Headset' },
    { name: 'cafe-outline', label: 'Coffee' },
    { name: 'brush-outline', label: 'Brush' },
    { name: 'musical-notes-outline', label: 'Music' },
    { name: 'airplane-outline', label: 'Travel' },
    { name: 'book-outline', label: 'Book' }
  ],
  professional: [
    { name: 'business-outline', label: 'Business' },
    { name: 'wallet-outline', label: 'Wallet' },
    { name: 'ribbon-outline', label: 'Award' },
    { name: 'speedometer-outline', label: 'Speed' },
    { name: 'briefcase-outline', label: 'Work' },
    { name: 'shield-outline', label: 'Shield' },
    { name: 'bulb-outline', label: 'Idea' },
    { name: 'trending-up-outline', label: 'Growth' }
  ]
};

// Color Picker Component
const ColorPicker = ({ colors, onSelectColor, selectedColorIndex }) => {
  return (
    <View style={styles.colorPickerContainer}>
      <FlatList
        data={colors}
        keyExtractor={(item, index) => `color-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.colorOption,
              {
                backgroundColor: item.primary,
                borderColor: selectedColorIndex === index ? '#fff' : 'transparent',
                borderWidth: selectedColorIndex === index ? 3 : 0,
                marginHorizontal: spacing.xs,
                width: 50,
                height: 50,
                borderRadius: 25,
                marginBottom: spacing.s
              }
            ]}
            onPress={() => onSelectColor(index)}
            accessibilityLabel={`Select ${item.name} color`}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: item.secondary,
                position: 'absolute',
                bottom: 0,
                right: 0
              }}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing.m, paddingVertical: spacing.s }}
      />
    </View>
  );
};

// Tab Navigation Component
const CategoryTabs = ({ categories, activeCategory, onSelectCategory, theme }) => {
  return (
    <View style={styles.tabContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.s }}
      >
        {Object.keys(categories).map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.tab,
              {
                backgroundColor: activeCategory === category ? theme.primary : 'transparent',
                borderColor: activeCategory === category ? theme.primary : theme.border,
                borderWidth: 1,
                borderRadius: 20,
                paddingHorizontal: spacing.m,
                paddingVertical: spacing.xs,
                marginHorizontal: spacing.xs
              }
            ]}
            onPress={() => onSelectCategory(category)}
            accessibilityRole="tab"
            accessibilityLabel={`${category} icons tab`}
            accessibilityState={{ selected: activeCategory === category }}
          >
            <Text
              style={{
                color: activeCategory === category ? '#fff' : theme.text,
                fontWeight: activeCategory === category ? '600' : '400',
                fontSize: fontSizes.s,
                textTransform: 'capitalize'
              }}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// Random Avatar Generator Button
const RandomizeButton = ({ onPress, theme }) => {
  return (
    <TouchableOpacity
      style={[
        styles.randomizeButton,
        {
          backgroundColor: 'transparent',
          borderColor: theme.primary,
          borderWidth: 1,
          borderRadius: 20,
          paddingHorizontal: spacing.m,
          paddingVertical: spacing.s,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'center',
          marginVertical: spacing.m
        }
      ]}
      onPress={onPress}
      accessibilityLabel="Randomize avatar"
    >
      <Ionicons name="shuffle" size={16} color={theme.primary} style={{ marginRight: spacing.xs }} />
      <Text style={{ color: theme.primary, fontWeight: '500', fontSize: fontSizes.s }}>
        Surprise Me
      </Text>
    </TouchableOpacity>
  );
};

const EditProfileScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { user, updateUserProfile } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { updateAppSetting, settings } = useAppContext();
  const { getTotalPoints } = useAchievements();
  
  // Add the profile context
  const { profile: contextProfile, updateProfile } = useProfile();
  
  // Get safe area insets and screen dimensions
  const safeSpacing = useSafeSpacing();
  const { width, height } = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // Check if using dark mode for better contrast
  const isDarkMode = theme.background === '#000000';
  
  // Profile state
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Legacy avatar customization state (for backwards compatibility)
  const [selectedIconCategory, setSelectedIconCategory] = useState('tech');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  
  // New level-based profile picture state
  const [selectedLevelPicture, setSelectedLevelPicture] = useState(null);
  const [userLevel, setUserLevel] = useState(1);
  const [availablePictures, setAvailablePictures] = useState([]);
  const [lockedPictures, setLockedPictures] = useState([]);
  const [showLevelSystem, setShowLevelSystem] = useState(true); // Toggle between old and new system
  
  // Animation value for color picker
  const colorPickerAnimation = useRef(new Animated.Value(0)).current;
  
  // Original values for checking if there are changes
  const [originalValues, setOriginalValues] = useState({
    name: '',
    profileImage: null,
    icon: null,
    colorIndex: 0,
    levelPicture: null
  });
  
  // Streak data state
  const [streakData, setStreakData] = useState({
    currentStreak: 0,
    longestStreak: 0
  });
  
  // Load streak data
  useEffect(() => {
    const loadStreakData = async () => {
      try {
        const currentStreak = await FeatureExplorerTracker.getCurrentStreak();
        const highestStreak = await FeatureExplorerTracker.getHighestStreak();
        
        setStreakData({
          currentStreak,
          longestStreak: highestStreak
        });
      } catch (error) {
        console.error('Error loading streak data:', error);
      }
    };
    
    loadStreakData();
  }, []);
  
  // Load level-based profile picture data
  useEffect(() => {
    const loadLevelData = () => {
      try {
        const totalPoints = getTotalPoints();
        const level = LevelService.calculateLevel(totalPoints);
        
        console.log('=== LEVEL CALCULATION DEBUG ===');
        console.log('Total Points:', totalPoints);
        console.log('Calculated Level:', level);
        console.log('Level Title:', LevelService.getLevelTitle(level));
        
        // TEMPORARY: Force level 3 for testing
        const testLevel = Math.max(level, 3);
        console.log('Using test level:', testLevel);
        console.log('Available Pictures Count:', getAvailableProfilePictures(testLevel).length);
        
        setUserLevel(testLevel);
        setAvailablePictures(getAvailableProfilePictures(testLevel));
        setLockedPictures(getLockedProfilePictures(testLevel));
      } catch (error) {
        console.error('Error loading level data:', error);
        // Fallback to level 1
        setUserLevel(1);
        setAvailablePictures(getAvailableProfilePictures(1));
        setLockedPictures(getLockedProfilePictures(1));
      }
    };
    
    loadLevelData();
  }, [getTotalPoints]);
  
  // Also refresh when achievements change (for real-time updates)
  const { unlockedAchievements } = useAchievements();
  useEffect(() => {
    const loadLevelData = () => {
      try {
        // Calculate points manually from achievements data
        let calculatedPoints = 0;
        Object.keys(unlockedAchievements).forEach(achievementId => {
          if (unlockedAchievements[achievementId]?.unlocked) {
            // Import achievements data to get points
            const { ACHIEVEMENTS } = require('../screens/AchievementsScreen/data/achievementsData');
            const achievementData = ACHIEVEMENTS?.[achievementId];
            if (achievementData?.points) {
              calculatedPoints += achievementData.points;
            }
          }
        });
        
        const fallbackLevel = Math.max(1, Math.min(12, Math.floor(calculatedPoints / 50) + 1));
        const totalPoints = getTotalPoints() || calculatedPoints;
        const level = LevelService.calculateLevel(totalPoints) || fallbackLevel;
        
        // TEMPORARY: Force level 3 for testing
        const testLevel = Math.max(level, 3);
        
        console.log('=== ACHIEVEMENTS UPDATE ===');
        console.log('Unlocked Achievements:', Object.keys(unlockedAchievements).length);
        console.log('Calculated Points:', calculatedPoints);
        console.log('getTotalPoints():', getTotalPoints());
        console.log('Base Level:', level);
        console.log('Test Level:', testLevel);
        
        setUserLevel(testLevel);
        setAvailablePictures(getAvailableProfilePictures(testLevel));
        setLockedPictures(getLockedProfilePictures(testLevel));
      } catch (error) {
        console.error('Error in achievements update:', error);
      }
    };
    
    loadLevelData();
  }, [unlockedAchievements, getTotalPoints]);
  
  // Check if there are unsaved changes
  const hasChanges = useMemo(() => {
    const result = name !== originalValues.name || 
                   profileImage !== originalValues.profileImage ||
                   selectedIcon !== originalValues.icon ||
                   selectedColorIndex !== originalValues.colorIndex ||
                   selectedLevelPicture?.id !== originalValues.levelPicture?.id;
    
    console.log('Change detection:', {
      nameChanged: name !== originalValues.name,
      imageChanged: profileImage !== originalValues.profileImage,
      iconChanged: selectedIcon !== originalValues.icon,
      colorChanged: selectedColorIndex !== originalValues.colorIndex,
      levelPictureChanged: selectedLevelPicture?.id !== originalValues.levelPicture?.id,
      result
    });
    
    return result;
  }, [name, profileImage, selectedIcon, selectedColorIndex, selectedLevelPicture, originalValues]);
                     
  useEffect(() => {
    console.log('Profile state changed:', { 
      name, 
      profileImage, 
      selectedIcon, 
      selectedColorIndex 
    });
    console.log('Original values:', originalValues);
    console.log('Has changes:', hasChanges);
    
    // Debug the selected color - this helps track color selection state
    if (selectedColorIndex !== undefined) {
      console.log('Current selected color:', {
        index: selectedColorIndex,
        colorData: COLOR_PALETTE[selectedColorIndex]
      });
    }
  }, [name, profileImage, selectedIcon, selectedColorIndex, originalValues, hasChanges]);
  
  // Toggle color picker visibility
  const toggleColorPicker = (show) => {
    Animated.timing(colorPickerAnimation, {
      toValue: show ? 1 : 0,
      duration: 300,
      useNativeDriver: false
    }).start();
  };
  
  // Function to select an icon
  const selectIcon = (icon) => {
    setSelectedIcon(icon);
    setProfileImage(null);
    toggleColorPicker(true);
  };
  
  // Function to randomize avatar
  const randomizeAvatar = () => {
    // Select random category
    const categories = Object.keys(AVATAR_ICON_CATEGORIES);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setSelectedIconCategory(randomCategory);
    
    // Select random icon from that category
    const icons = AVATAR_ICON_CATEGORIES[randomCategory];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    
    // Select random color
    const randomColorIndex = Math.floor(Math.random() * COLOR_PALETTE.length);
    
    // Set the random selections
    setSelectedIcon(randomIcon.name);
    setSelectedColorIndex(randomColorIndex);
    setProfileImage(null);
    
    // Show toast
    showSuccess('Random avatar generated!');
  };
  
  // When loading profile data, ensure we parse the color index as a number
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        console.log('EditProfileScreen: Loading profile data');
        
        // First, try to get profile from context
        if (contextProfile) {
          setName(contextProfile.name || 'User');
          setProfileImage(contextProfile.profileImage || null);
          
          // Load level-based profile picture if available
          if (contextProfile.levelProfilePicture) {
            setSelectedLevelPicture(contextProfile.levelProfilePicture);
            console.log('Loaded level profile picture from context:', contextProfile.levelProfilePicture);
          }
          
          // Load legacy custom avatar data if available
          if (contextProfile.defaultAvatar) {
            setSelectedIcon(contextProfile.defaultAvatar.iconName);
            // Ensure colorIndex is treated as a number
            const colorIdx = typeof contextProfile.defaultAvatar.colorIndex === 'string' 
              ? parseInt(contextProfile.defaultAvatar.colorIndex, 10) 
              : contextProfile.defaultAvatar.colorIndex || 0;
            
            setSelectedColorIndex(colorIdx);
            console.log('Loaded color index from context:', colorIdx);
          }
          
          // Save original values
          setOriginalValues({
            name: contextProfile.name || 'User',
            profileImage: contextProfile.profileImage || null,
            icon: contextProfile.defaultAvatar?.iconName || null,
            colorIndex: typeof contextProfile.defaultAvatar?.colorIndex === 'string'
              ? parseInt(contextProfile.defaultAvatar.colorIndex, 10)
              : contextProfile.defaultAvatar?.colorIndex || 0,
            levelPicture: contextProfile.levelProfilePicture || null
          });
          
          console.log('Loaded profile from context:', contextProfile);
          return;
        }
        
        // Fallback to AsyncStorage if needed (usually shouldn't be necessary)
        const storedProfileJson = await AsyncStorage.getItem('userProfile');
        
        if (storedProfileJson) {
          const storedProfile = JSON.parse(storedProfileJson);
          setName(storedProfile.name || 'User');
          setProfileImage(storedProfile.profileImage || null);
          
          // Load level-based profile picture if available
          if (storedProfile.levelProfilePicture) {
            setSelectedLevelPicture(storedProfile.levelProfilePicture);
            console.log('Loaded level profile picture from storage:', storedProfile.levelProfilePicture);
          }
          
          // Load legacy custom avatar data if available
          if (storedProfile.defaultAvatar) {
            setSelectedIcon(storedProfile.defaultAvatar.iconName);
            // Ensure colorIndex is treated as a number
            const colorIdx = typeof storedProfile.defaultAvatar.colorIndex === 'string' 
              ? parseInt(storedProfile.defaultAvatar.colorIndex, 10) 
              : storedProfile.defaultAvatar.colorIndex || 0;
            
            setSelectedColorIndex(colorIdx);
            console.log('Loaded color index from storage:', colorIdx);
          }
          
          // Save original values
          setOriginalValues({
            name: storedProfile.name || 'User',
            profileImage: storedProfile.profileImage || null,
            icon: storedProfile.defaultAvatar?.iconName || null,
            colorIndex: typeof storedProfile.defaultAvatar?.colorIndex === 'string'
              ? parseInt(storedProfile.defaultAvatar.colorIndex, 10)
              : storedProfile.defaultAvatar?.colorIndex || 0,
            levelPicture: storedProfile.levelProfilePicture || null
          });
          
          console.log('Loaded profile from AsyncStorage:', storedProfile);
        }
        // Fallback to app settings
        else if (settings?.userProfile) {
          setName(settings.userProfile.name || 'User');
          setProfileImage(settings.userProfile.profileImage || null);
          
          // Load level-based profile picture if available
          if (settings.userProfile.levelProfilePicture) {
            setSelectedLevelPicture(settings.userProfile.levelProfilePicture);
            console.log('Loaded level profile picture from settings:', settings.userProfile.levelProfilePicture);
          }
          
          // Load legacy custom avatar data if available
          if (settings.userProfile.defaultAvatar) {
            setSelectedIcon(settings.userProfile.defaultAvatar.iconName);
            // Ensure colorIndex is treated as a number
            const colorIdx = typeof settings.userProfile.defaultAvatar.colorIndex === 'string' 
              ? parseInt(settings.userProfile.defaultAvatar.colorIndex, 10) 
              : settings.userProfile.defaultAvatar.colorIndex || 0;
            
            setSelectedColorIndex(colorIdx);
            console.log('Loaded color index from settings:', colorIdx);
          }
          
          // Save original values
          setOriginalValues({
            name: settings.userProfile.name || 'User',
            profileImage: settings.userProfile.profileImage || null,
            icon: settings.userProfile.defaultAvatar?.iconName || null,
            colorIndex: typeof settings.userProfile.defaultAvatar?.colorIndex === 'string'
              ? parseInt(settings.userProfile.defaultAvatar.colorIndex, 10)
              : settings.userProfile.defaultAvatar?.colorIndex || 0,
            levelPicture: settings.userProfile.levelProfilePicture || null
          });
          
          console.log('Loaded profile from app settings:', settings.userProfile);
        } else {
          // Default values if nothing is saved
          setName('User');
          setOriginalValues({
            name: 'User',
            profileImage: null,
            icon: null,
            colorIndex: 0,
            levelPicture: null
          });
        }
        
        // If profile data was passed from the ProfileScreen, use that
        if (route.params?.profile) {
          const { profile } = route.params;
          setName(profile.name || 'User');
          setProfileImage(profile.profileImage || null);
          
          // Load level-based profile picture if available
          if (profile.levelProfilePicture) {
            setSelectedLevelPicture(profile.levelProfilePicture);
            console.log('Loaded level profile picture from route params:', profile.levelProfilePicture);
          }
          
          // Load legacy custom avatar data if available
          if (profile.defaultAvatar) {
            setSelectedIcon(profile.defaultAvatar.iconName);
            // Ensure colorIndex is treated as a number
            const colorIdx = typeof profile.defaultAvatar.colorIndex === 'string' 
              ? parseInt(profile.defaultAvatar.colorIndex, 10) 
              : profile.defaultAvatar.colorIndex || 0;
            
            setSelectedColorIndex(colorIdx);
            console.log('Loaded color index from route params:', colorIdx);
          }
          
          // Save original values
          setOriginalValues({
            name: profile.name || 'User',
            profileImage: profile.profileImage || null,
            icon: profile.defaultAvatar?.iconName || null,
            colorIndex: typeof profile.defaultAvatar?.colorIndex === 'string'
              ? parseInt(profile.defaultAvatar.colorIndex, 10)
              : profile.defaultAvatar?.colorIndex || 0,
            levelPicture: profile.levelProfilePicture || null
          });
          
          console.log('Loaded profile from route params:', profile);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
        showError('Failed to load profile data');
      }
    };
    
    loadProfileData();
  }, [contextProfile, user, route.params, settings]);
  
  // Handle back button press
  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to save before going back?",
        [
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack()
          },
          {
            text: "Save",
            onPress: handleSave
          },
          {
            text: "Cancel",
            style: "cancel"
          }
        ]
      );
    } else {
      navigation.goBack();
    }
  };
  
  // Request permissions and pick an image
  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant permission to access your photos to change your profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Selected image URI:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
        setSelectedIcon(null);
        // Keep the custom photo level picture selected if one was chosen
        if (selectedLevelPicture?.isCustom) {
          console.log('Keeping custom level picture selection');
        } else {
          setSelectedLevelPicture(null);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Failed to select image. Please try again.');
    }
  };
  
  // Take a photo with the camera
  const takePhoto = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'You need to grant camera permission to take a new profile picture.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Launch the camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Camera image URI:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
        setSelectedIcon(null);
        // Keep the custom photo level picture selected if one was chosen
        if (selectedLevelPicture?.isCustom) {
          console.log('Keeping custom level picture selection');
        } else {
          setSelectedLevelPicture(null);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      showError('Failed to take photo. Please try again.');
    }
  };
  
  // Function to delete profile picture
  const deleteProfilePicture = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setProfileImage(null);
            showSuccess('Profile photo removed');
          }
        }
      ]
    );
  };
  
  // Show image selection options
  const showImageOptions = () => {
    // Determine which options to show based on whether there's already a profile picture
    const options = [
      {
        text: 'Take Photo',
        onPress: takePhoto
      },
      {
        text: 'Choose from Library',
        onPress: pickImage
      }
    ];
    
    // Add delete option if there's a profile picture
    if (profileImage) {
      options.push({
        text: 'Remove Photo',
        style: 'destructive',
        onPress: deleteProfilePicture
      });
    }
    
    // Add cancel option
    options.push({
      text: 'Cancel',
      style: 'cancel'
    });
    
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      options
    );
  };
  
  // Save profile changes
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Log the current state before saving
      console.log('=== SAVE PROFILE DEBUG ===');
      console.log('Profile Image:', profileImage);
      console.log('Selected Level Picture:', selectedLevelPicture);
      console.log('Selected Icon (legacy):', selectedIcon);
      console.log('Selected Color Index (legacy):', selectedColorIndex);
      console.log('Color data being saved:', COLOR_PALETTE[selectedColorIndex]);
      
      // Create updated profile object with data structure compatible with ProfileContext
      const updatedProfile = {
        name: name || 'User', // Default to 'User' if empty
        email: user?.email || '',
        profileImage,
        // Handle level-based profile pictures
        levelProfilePicture: selectedLevelPicture ? {
          id: selectedLevelPicture.id,
          name: selectedLevelPicture.name,
          icon: selectedLevelPicture.icon,
          colorScheme: selectedLevelPicture.colorScheme,
          requiredLevel: selectedLevelPicture.requiredLevel,
          description: selectedLevelPicture.description
        } : null,
        // Legacy defaultAvatar data for backwards compatibility
        defaultAvatar: selectedIcon ? {
          iconName: selectedIcon,
          colorIndex: selectedColorIndex
        } : null
      };
      
      console.log('Attempting to save profile:', updatedProfile);
      console.log('Profile image URI being saved:', profileImage);
      console.log('Level picture being saved:', updatedProfile.levelProfilePicture);
      
      // First update the profile context
      const success = await updateProfile(updatedProfile);
      
      if (!success) {
        throw new Error('Failed to update profile context');
      }
      
      // As a backup, also save to AsyncStorage directly
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        console.log('✅ Successfully saved profile to AsyncStorage');
        
        // Verify it was saved correctly by reading it back
        const verifyProfileJson = await AsyncStorage.getItem('userProfile');
        const verifyProfile = JSON.parse(verifyProfileJson);
        console.log('Verification - profile from AsyncStorage:', verifyProfile);
        console.log('Verification - defaultAvatar:', verifyProfile.defaultAvatar);
      } catch (storageError) {
        console.error('❌ AsyncStorage save error:', storageError);
        // Continue even if this fails since we've updated the context
      }
      
      // Save profile to app settings
      if (typeof updateAppSetting === 'function') {
        try {
          await updateAppSetting('userProfile', updatedProfile);
          console.log('✅ Successfully saved profile to app settings');
        } catch (settingsError) {
          console.error('❌ App settings save error:', settingsError);
          // Continue even if this fails
        }
      } else {
        console.log('⚠️ updateAppSetting is not a function, skipping app settings update');
      }
      
      // If you have an updateUserProfile function in your auth context
      if (typeof updateUserProfile === 'function') {
        try {
          await updateUserProfile(updatedProfile);
          console.log('✅ Successfully updated user profile in auth context');
        } catch (profileError) {
          console.error('❌ User profile update error:', profileError);
          // Continue even if this fails
        }
      } else {
        console.log('⚠️ updateUserProfile is not a function, skipping profile update');
      }
      
      // Track the profile picture update for achievement
      try {
        await FeatureExplorerTracker.trackProfilePictureUpdate(updatedProfile, showSuccess);
        console.log('✅ Successfully tracked profile picture update');
      } catch (trackingError) {
        console.error('⚠️ Error tracking profile picture achievement:', trackingError);
        // Don't let tracking errors affect the main functionality
      }
      
      // Update original values to match current values
      setOriginalValues({
        name,
        profileImage,
        icon: selectedIcon,
        colorIndex: selectedColorIndex,
        levelPicture: selectedLevelPicture
      });
      
      setIsSaving(false);
      showSuccess('Profile updated successfully');
      console.log('✅ Profile save complete');
      console.log('✅ Final saved profile:', updatedProfile);
      console.log('✅ Navigating back');
      
      // Navigate back without params - the context will handle data
      navigation.goBack();
      
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      setIsSaving(false);
      
      // Use Alert for visible error
      Alert.alert(
        "Save Failed",
        "There was a problem saving your profile. Please try again.",
        [{ text: "OK" }]
      );
    }
  };
  
  // Get initials from name for avatar placeholder
  const getInitials = () => {
    if (!name || name.trim() === '') return 'U';
    
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  // Get responsive size based on device type
  const getResponsiveSize = (sizeOptions) => {
    if (isTablet && sizeOptions.tablet !== undefined) return sizeOptions.tablet;
    if (isLargeDevice && sizeOptions.large !== undefined) return sizeOptions.large;
    if (isMediumDevice && sizeOptions.medium !== undefined) return sizeOptions.medium;
    if (isSmallDevice && sizeOptions.small !== undefined) return sizeOptions.small;
    
    // Default fallback - medium device
    return sizeOptions.medium !== undefined ? sizeOptions.medium : 
           sizeOptions.small !== undefined ? sizeOptions.small :
           sizeOptions.large !== undefined ? sizeOptions.large :
           sizeOptions.tablet !== undefined ? sizeOptions.tablet : 0;
  };
  
  // Visual indicator to show which fields are required
  const getInputStyle = (value, isRequired = false) => {
    const baseStyle = { 
      color: theme.text, 
      backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5',
      borderColor: theme.border,
      borderRadius: spacing.xs,
      paddingHorizontal: spacing.m,
      paddingVertical: spacing.s,
      fontSize: fontSizes.m,
      borderWidth: 1
    };

    return baseStyle;
  };
  
  // Calculate profile image size based on device
  const profileImageSize = getResponsiveSize({
    small: 120,
    medium: 140,
    large: 160,
    tablet: 180
  });
  
  // Half the image size for border radius (to make it circular)
  const profileImageRadius = profileImageSize / 2;
  
  // Calculate other responsive sizes
  const editButtonSize = getResponsiveSize({
    small: 36,
    medium: 40,
    large: 44,
    tablet: 48
  });
  
  const defaultAvatarSize = getResponsiveSize({
    small: 90,
    medium: 100,
    large: 110,
    tablet: 120
  });
  
  // Color picker height based on animation value
  const colorPickerHeight = colorPickerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130]
  });
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.card, 
        borderBottomColor: theme.border,
        borderBottomWidth: 1,
        paddingHorizontal: spacing.m,
        paddingVertical: Platform.OS === 'ios' ? 12 : 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      }]}>
        <TouchableOpacity 
          style={[
            styles.backButton,
            ensureAccessibleTouchTarget(44, 44)
          ]} 
          onPress={handleBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text 
          style={[
            styles.headerTitle, 
            { 
              color: theme.text,
              fontSize: fontSizes.l,
              fontWeight: '700'
            }
          ]}
          accessibilityRole="header"
          maxFontSizeMultiplier={1.3}
        >
          Edit Profile
        </Text>
        <TouchableOpacity 
          style={[
            styles.saveButton,
            {
              backgroundColor: hasChanges ? theme.primary : 'rgba(0, 122, 255, 0.1)',
              borderRadius: 20,
              paddingVertical: 8,
              paddingHorizontal: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 90,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 1.5,
              elevation: 2,
              marginLeft: spacing.s
            },
            ensureAccessibleTouchTarget(50, 44)
          ]} 
          onPress={handleSave}
          disabled={isSaving || !hasChanges}
          accessibilityRole="button"
          accessibilityLabel={isSaving ? "Saving profile changes" : "Save profile changes"}
        >
          <Ionicons 
            name={isSaving ? "hourglass-outline" : "save-outline"} 
            size={18} 
            color={hasChanges ? "#FFFFFF" : theme.primary} 
            style={{ marginRight: 6 }}
          />
          {isSaving ? (
            <Text 
              style={[
                styles.saveButtonText, 
                { 
                  color: "#FFFFFF",
                  fontSize: fontSizes.s,
                  fontWeight: '600'
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Saving...
            </Text>
          ) : (
            <Text 
              style={[
                styles.saveButtonText, 
                { 
                  color: hasChanges ? "#FFFFFF" : theme.primary,
                  fontSize: fontSizes.s,
                  fontWeight: '600'
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Save
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={{ paddingBottom: safeSpacing.bottom + spacing.xl }}
      >
        {/* Profile Section */}
        <View style={[styles.profileSection, {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: spacing.m,
          marginHorizontal: spacing.m,
          marginTop: spacing.m,
          padding: spacing.m,
          elevation: isDarkMode ? 0 : 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDarkMode ? 0 : 0.1,
          shadowRadius: 2
        }]}>
          {/* Profile Image */}
          <View style={[
            styles.imageContainer,
            { 
              paddingVertical: spacing.l,
              paddingHorizontal: spacing.m
            }
          ]}>
            <TouchableOpacity 
              onPress={showImageOptions}
              accessibilityRole="button"
              accessibilityLabel="Change profile picture"
              style={styles.profileImageWrapper}
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={[
                    styles.profileImage, 
                    {
                      width: profileImageSize,
                      height: profileImageSize,
                      borderRadius: profileImageRadius,
                      borderWidth: 4,
                      borderColor: isDarkMode ? '#555555' : '#FFFFFF',
                      backgroundColor: isDarkMode ? '#333333' : '#F0F0F0'
                    }
                  ]} 
                  accessibilityRole="image"
                  accessibilityLabel="Current profile picture"
                />
              ) : selectedLevelPicture ? (
                <View style={[
                  styles.defaultAvatarContainer,
                  {
                    width: profileImageSize,
                    height: profileImageSize,
                    borderRadius: profileImageRadius,
                    borderWidth: 4,
                    borderColor: isDarkMode ? '#555555' : '#FFFFFF'
                  }
                ]}>
                  <LevelAvatar
                    size={profileImageSize - 8}
                    pictureData={selectedLevelPicture}
                  />
                </View>
              ) : selectedIcon ? (
                <View style={[
                  styles.defaultAvatarContainer,
                  {
                    width: profileImageSize,
                    height: profileImageSize,
                    borderRadius: profileImageRadius,
                    borderWidth: 4,
                    borderColor: isDarkMode ? '#555555' : '#FFFFFF'
                  }
                ]}>
                  <DefaultAvatar
                    size={profileImageSize - 8}
                    colorIndex={selectedColorIndex}
                    iconName={selectedIcon}
                    initials={getInitials()}
                  />
                </View>
              ) : (
                <View style={[
                  styles.profileImagePlaceholder, 
                  { 
                    width: profileImageSize,
                    height: profileImageSize,
                    borderRadius: profileImageRadius,
                    backgroundColor: theme.card,
                    borderWidth: 4,
                    borderColor: isDarkMode ? '#444444' : '#E0E0E0'
                  }
                ]}>
                  <Text style={[
                    styles.profileInitials, 
                    {
                      fontSize: profileImageSize * 0.33,
                      color: theme.text,
                      fontWeight: '700'
                    }
                  ]}>
                    {getInitials()}
                  </Text>
                </View>
              )}
              <View style={[
                styles.editImageButton, 
                { 
                  width: editButtonSize,
                  height: editButtonSize,
                  borderRadius: editButtonSize / 2,
                  backgroundColor: theme.primary,
                  borderWidth: 2,
                  borderColor: isDarkMode ? '#000000' : '#FFFFFF'
                }
              ]}>
                <Ionicons 
                  name="camera" 
                  size={editButtonSize * 0.5} 
                  color="#FFFFFF" 
                />
              </View>
            </TouchableOpacity>
            
            <Text style={[
              styles.changePhotoText,
              {
                color: theme.primary,
                fontSize: fontSizes.s,
                marginTop: spacing.s,
                fontWeight: '500'
              }
            ]}>
              Change Profile Picture
            </Text>
          </View>
          
          {/* Name Input */}
          <View style={[
            styles.nameInputContainer,
            {
              marginHorizontal: spacing.m,
              marginTop: spacing.s,
              marginBottom: spacing.m
            }
          ]}>
            <Text 
              style={[
                styles.label, 
                { 
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  marginBottom: spacing.xs,
                  fontWeight: '500'
                }
              ]}
              maxFontSizeMultiplier={1.3}
            >
              Name
            </Text>
            <TextInput
              style={[
                styles.input,
                getInputStyle(name), // No longer marking as required
                {
                  backgroundColor: theme.card,
                  height: 50,
                  fontWeight: '500'
                }
              ]}
              value={name}
              onChangeText={setName}
              placeholder="User"
              placeholderTextColor={theme.textSecondary}
              maxFontSizeMultiplier={1.3}
              accessibilityLabel="Enter your name"
              accessibilityHint="Enter your name to display on your profile"
            />
          </View>
        </View>
        
        {/* Level-Based Profile Pictures Section */}
        {showLevelSystem ? (
          <View style={[
            styles.levelAvatarSection,
            {
              backgroundColor: theme.card,
              borderRadius: spacing.m,
              marginHorizontal: spacing.m,
              marginTop: spacing.m,
              marginBottom: spacing.l,
              padding: spacing.m,
              borderWidth: 1,
              borderColor: theme.border
            }
          ]}>
            <View style={[styles.sectionHeader, { marginBottom: spacing.s }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[
                    styles.sectionTitle,
                    {
                      color: theme.text,
                      fontSize: fontSizes.m,
                      fontWeight: '600'
                    }
                  ]}>
                    Epic Profile Pictures
                  </Text>
                  <View style={{
                    backgroundColor: theme.primary,
                    borderRadius: 12,
                    paddingHorizontal: spacing.xs,
                    paddingVertical: 2,
                    marginLeft: spacing.xs
                  }}>
                    <Text style={{
                      color: 'white',
                      fontSize: fontSizes.xs,
                      fontWeight: 'bold'
                    }}>
                      LEVEL {userLevel}
                    </Text>
                  </View>
                </View>
                
                <TouchableOpacity
                  onPress={() => setShowLevelSystem(false)}
                  style={{
                    paddingHorizontal: spacing.xs,
                    paddingVertical: spacing.xxs
                  }}
                >
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: fontSizes.xs
                  }}>
                    Classic
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Current Level Info */}
            <View style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: spacing.s,
              padding: spacing.s,
              marginBottom: spacing.m
            }}>
              <Text style={{
                color: theme.text,
                fontSize: fontSizes.s,
                fontWeight: '500',
                marginBottom: spacing.xs
              }}>
                {LevelService.getLevelTitle(userLevel)} • Level {userLevel}
              </Text>
              <Text style={{
                color: theme.textSecondary,
                fontSize: fontSizes.xs
              }}>
                You've unlocked {availablePictures.length} epic profile picture{availablePictures.length !== 1 ? 's' : ''}
              </Text>
            </View>
            
            {/* Available Pictures */}
            <Text style={{
              color: theme.text,
              fontSize: fontSizes.s,
              fontWeight: '500',
              marginBottom: spacing.s
            }}>
              Available Pictures
            </Text>
            
            <FlatList
              data={availablePictures}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.levelPictureItem,
                    {
                      margin: spacing.xs,
                      padding: spacing.s,
                      borderRadius: spacing.s,
                      backgroundColor: selectedLevelPicture?.id === item.id ? 
                        (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') : 
                        'transparent',
                      borderWidth: selectedLevelPicture?.id === item.id ? 2 : 0,
                      borderColor: theme.primary,
                      alignItems: 'center'
                    }
                  ]}
                  onPress={() => {
                    if (item.isCustom) {
                      showImageOptions();
                      setSelectedLevelPicture(item); // Set the custom photo option as selected
                    } else {
                      setSelectedLevelPicture(item);
                      setProfileImage(null); // Clear custom image
                      setSelectedIcon(null); // Clear legacy icon
                      console.log('Selected level picture:', item);
                    }
                  }}
                  accessibilityLabel={`Select ${item.name} profile picture`}
                >
                  {item.isCustom ? (
                    <CustomPhotoAvatar 
                      size={60}
                      selected={selectedLevelPicture?.id === item.id}
                      isEnabled={true}
                    />
                  ) : (
                    <LevelAvatar
                      size={60}
                      pictureData={item}
                      selected={selectedLevelPicture?.id === item.id}
                    />
                  )}
                  <Text style={{
                    fontSize: fontSizes.xs,
                    color: theme.text,
                    marginTop: spacing.xs,
                    textAlign: 'center',
                    fontWeight: selectedLevelPicture?.id === item.id ? '600' : '400'
                  }}>
                    {item.name}
                  </Text>
                  {item.description && (
                    <Text style={{
                      fontSize: fontSizes.xs,
                      color: theme.textSecondary,
                      textAlign: 'center',
                      marginTop: 2
                    }}>
                      {item.description}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
              numColumns={2}
              contentContainerStyle={{
                paddingVertical: spacing.s,
              }}
              scrollEnabled={false}
            />
            
            {/* Next Level Preview */}
            {(() => {
              const nextUnlock = getNextUnlockInfo(userLevel);
              if (nextUnlock) {
                return (
                  <>
                    <Text style={{
                      color: theme.textSecondary,
                      fontSize: fontSizes.s,
                      fontWeight: '500',
                      marginTop: spacing.m,
                      marginBottom: spacing.s
                    }}>
                      Next Level Preview
                    </Text>
                    
                    {/* Single picture preview for next level */}
                    <View style={{
                      alignItems: 'center',
                      paddingVertical: spacing.m
                    }}>
                      <LevelAvatar
                        size={80}
                        pictureData={{...nextUnlock.picture, requiredLevel: nextUnlock.level}}
                        isLocked={true}
                        requiredLevel={nextUnlock.level}
                      />
                      <Text style={{
                        fontSize: fontSizes.s,
                        color: theme.text,
                        marginTop: spacing.s,
                        textAlign: 'center',
                        fontWeight: '500'
                      }}>
                        {nextUnlock.picture.name}
                      </Text>
                      <Text style={{
                        fontSize: fontSizes.xs,
                        color: theme.textSecondary,
                        textAlign: 'center',
                        marginTop: spacing.xxs
                      }}>
                        {nextUnlock.picture.description}
                      </Text>
                    </View>
                    
                    {/* Next Unlock Info */}
                    <View style={{
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: spacing.s,
                      padding: spacing.s,
                      marginTop: spacing.s,
                      borderStyle: 'dashed',
                      borderWidth: 1,
                      borderColor: theme.border
                    }}>
                      <Text style={{
                        color: theme.primary,
                        fontSize: fontSizes.xs,
                        fontWeight: '500',
                        textAlign: 'center'
                      }}>
                        🏆 Next unlock: Level {nextUnlock.level} - {nextUnlock.title}
                      </Text>
                      <Text style={{
                        color: theme.textSecondary,
                        fontSize: fontSizes.xs,
                        textAlign: 'center',
                        marginTop: 2
                      }}>
                        Unlock this epic profile picture
                      </Text>
                    </View>
                  </>
                );
              }
              return null;
            })()}
          </View>
        ) : (
          /* Legacy Custom Avatar Section */
          <View style={[
            styles.customAvatarSection,
            {
              backgroundColor: theme.card,
              borderRadius: spacing.m,
              marginHorizontal: spacing.m,
              marginTop: spacing.m,
              marginBottom: spacing.l,
              padding: spacing.m,
              borderWidth: 1,
              borderColor: theme.border
            }
          ]}>
            <View style={[styles.sectionHeader, { marginBottom: spacing.s }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[
                  styles.sectionTitle,
                  {
                    color: theme.text,
                    fontSize: fontSizes.m,
                    fontWeight: '600'
                  }
                ]}>
                  Customize Avatar
                </Text>
                
                <TouchableOpacity
                  onPress={() => setShowLevelSystem(true)}
                  style={{
                    backgroundColor: theme.primary,
                    borderRadius: 12,
                    paddingHorizontal: spacing.s,
                    paddingVertical: spacing.xs
                  }}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: fontSizes.xs,
                    fontWeight: 'bold'
                  }}>
                    EPIC MODE
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Category Tabs */}
            <CategoryTabs 
              categories={AVATAR_ICON_CATEGORIES}
              activeCategory={selectedIconCategory}
              onSelectCategory={setSelectedIconCategory}
              theme={theme}
            />
            
            {/* Icons Grid */}
            <FlatList
              data={AVATAR_ICON_CATEGORIES[selectedIconCategory]}
              keyExtractor={(item, index) => `${selectedIconCategory}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconItem,
                    {
                      margin: spacing.xs,
                      padding: spacing.xs,
                      borderRadius: spacing.s,
                      backgroundColor: selectedIcon === item.name ? 
                        (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') : 
                        'transparent',
                      borderWidth: selectedIcon === item.name ? 1 : 0,
                      borderColor: theme.primary,
                      alignItems: 'center'
                    }
                  ]}
                  onPress={() => selectIcon(item.name)}
                  accessibilityLabel={`Select ${item.label} icon`}
                >
                  <View style={{
                    width: 50,
                    height: 50,
                    backgroundColor: COLOR_PALETTE[selectedColorIndex].primary,
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <Ionicons 
                      name={item.name} 
                      size={30} 
                      color={COLOR_PALETTE[selectedColorIndex].secondary} 
                    />
                  </View>
                  <Text style={{
                    fontSize: fontSizes.xs,
                    color: theme.text,
                    marginTop: spacing.xxs,
                    textAlign: 'center'
                  }}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              numColumns={4}
              contentContainerStyle={{
                paddingVertical: spacing.s,
              }}
              scrollEnabled={false}
            />
            
            {/* Randomize Button */}
            <RandomizeButton onPress={randomizeAvatar} theme={theme} />
            
            {/* Color Picker */}
            <Animated.View style={{
              height: colorPickerHeight,
              overflow: 'hidden',
              marginTop: spacing.s
            }}>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: spacing.xs
              }}>
                <Text style={{
                  fontSize: fontSizes.s,
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Color Theme
                </Text>
                <Text style={{
                  fontSize: fontSizes.xs,
                  color: theme.textSecondary
                }}>
                  {COLOR_PALETTE[selectedColorIndex]?.name || 'Default'}
                </Text>
              </View>
              <ColorPicker 
                colors={COLOR_PALETTE} 
                onSelectColor={(index) => {
                  console.log('Color selected:', index);
                  setSelectedColorIndex(index);
                }}
                selectedColorIndex={selectedColorIndex}
              />
            </Animated.View>
            
            {/* Color Picker Toggle */}
            {selectedIcon && (
              <TouchableOpacity
                style={{
                  alignSelf: 'center',
                  paddingVertical: spacing.xs,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                onPress={() => toggleColorPicker(colorPickerAnimation._value === 0)}
              >
                <Text style={{ color: theme.primary, fontSize: fontSizes.xs }}>
                  {colorPickerAnimation._value === 0 ? 'Show Color Options' : 'Hide Color Options'}
                </Text>
                <Ionicons 
                  name={colorPickerAnimation._value === 0 ? 'chevron-down' : 'chevron-up'} 
                  size={16} 
                  color={theme.primary} 
                  style={{ marginLeft: spacing.xxs }} 
                />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {/* Streak Info Section */}
        {streakData.currentStreak > 0 && (
          <View style={[
            styles.streakSection,
            {
              backgroundColor: theme.card,
              borderRadius: spacing.m,
              marginHorizontal: spacing.m,
              marginTop: spacing.m,
              marginBottom: spacing.l,
              padding: spacing.m,
              borderWidth: 1,
              borderColor: theme.border,
              borderStyle: 'dashed'
            }
          ]}>
            <View style={styles.streakHeader}>
              <Ionicons 
                name="flame" 
                size={18} 
                color={theme.primary} 
                style={{ marginRight: spacing.xs }}
              />
              <Text style={[
                styles.streakTitle,
                {
                  color: theme.text,
                  fontSize: fontSizes.s,
                  fontWeight: '600'
                }
              ]}>
                Your Streak
              </Text>
            </View>
            
            <View style={[
              styles.streakStatsContainer,
              {
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: spacing.s
              }
            ]}>
              <View style={styles.streakStat}>
                <View style={[
                  styles.streakBadge,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    paddingHorizontal: spacing.s,
                    paddingVertical: spacing.xs,
                    borderRadius: spacing.s,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }
                ]}>
                  <Text style={styles.streakEmoji}>
                    {getStreakEmoji(streakData.currentStreak)}
                  </Text>
                  <Text style={[
                    styles.streakCountText,
                    {
                      color: theme.text,
                      fontWeight: 'bold',
                      marginLeft: spacing.xxs,
                      fontSize: fontSizes.m
                    }
                  ]}>
                    {streakData.currentStreak}
                  </Text>
                </View>
                <Text style={[
                  styles.streakLabel,
                  {
                    color: theme.textSecondary,
                    fontSize: fontSizes.xs,
                    marginTop: spacing.xxs,
                    textAlign: 'center'
                  }
                ]}>
                  Current
                </Text>
              </View>
              
              <View style={styles.streakStat}>
                <View style={[
                  styles.streakBadge,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    paddingHorizontal: spacing.s,
                    paddingVertical: spacing.xs,
                    borderRadius: spacing.s,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }
                ]}>
                  <Text style={styles.streakEmoji}>
                    {getStreakEmoji(streakData.longestStreak)}
                  </Text>
                  <Text style={[
                    styles.streakCountText,
                    {
                      color: theme.text,
                      fontWeight: 'bold',
                      marginLeft: spacing.xxs,
                      fontSize: fontSizes.m
                    }
                  ]}>
                    {streakData.longestStreak}
                  </Text>
                </View>
                <Text style={[
                  styles.streakLabel,
                  {
                    color: theme.textSecondary,
                    fontSize: fontSizes.xs,
                    marginTop: spacing.xxs,
                    textAlign: 'center'
                  }
                ]}>
                  Best
                </Text>
              </View>
            </View>
          </View>
        )}
        
        {/* Unsaved changes indicator */}
        {hasChanges && (
          <View style={[
            styles.unsavedChangesContainer,
            {
              backgroundColor: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)',
              borderColor: '#FFC107',
              marginHorizontal: spacing.m,
              marginTop: spacing.l,
              padding: spacing.m,
              borderRadius: spacing.s,
              borderWidth: 1,
              borderStyle: 'dashed',
              flexDirection: 'row',
              alignItems: 'center'
            }
          ]}>
            <Ionicons 
              name="information-circle-outline" 
              size={fontSizes.l}
              color="#FFC107"
              style={{ marginRight: spacing.xs }}
            />
            <Text style={{
              color: isDarkMode ? '#FFC107' : '#8D6E00',
              fontSize: fontSizes.xs,
              flex: 1
            }}>
              You have unsaved changes. Tap Save to keep your updates.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
  },
  profileSection: {
    // Styling applied inline
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    // Width, height, and borderRadius set dynamically
  },
  defaultAvatarContainer: {
    // Width, height, and borderRadius set dynamically
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  profileImagePlaceholder: {
    // Width, height, and borderRadius set dynamically
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitials: {
    // FontSize set dynamically
    fontWeight: 'bold',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    // Width, height, and borderRadius set dynamically
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    // Styling applied inline
  },
  nameInputContainer: {
    // Styling applied inline
  },
  label: {
    // Styling applied inline
  },
  input: {
    // BorderRadius, padding, and fontSize set dynamically
    borderWidth: 1,
  },
  customAvatarSection: {
    // Styling applied inline
  },
  sectionTitle: {
    // Styling applied inline
  },
  iconItem: {
    // Styling applied inline
    flex: 1,
  },
  tabContainer: {
    marginBottom: 10,
  },
  tab: {
    // Styling applied inline
  },
  colorPickerContainer: {
    // Styling applied inline
  },
  colorOption: {
    // Styling applied inline
  },
  randomizeButton: {
    // Styling applied inline
  },
  unsavedChangesContainer: {
    // Styling applied inline
  },
  // Streak Section Styles
  streakSection: {
    // Styling applied inline
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakTitle: {
    // Styling applied inline
  },
  streakStatsContainer: {
    // Styling applied inline
  },
  streakStat: {
    alignItems: 'center',
    flex: 1,
  },
  streakBadge: {
    // Styling applied inline
  },
  streakEmoji: {
    fontSize: 16,
  },
  streakCountText: {
    // Styling applied inline
  },
  streakLabel: {
    // Styling applied inline
  },
  // Level-based avatar section styles
  levelAvatarSection: {
    // Styling applied inline
  },
  levelPictureItem: {
    // Styling applied inline
    flex: 1,
    maxWidth: '50%'
  }
});

export default EditProfileScreen;
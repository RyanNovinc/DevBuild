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
  Pressable,
  Modal
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
  
  // Enhanced unlock system state
  const [claimedPictures, setClaimedPictures] = useState([]); // Pictures user has claimed
  const [unclaimedPictures, setUnclaimedPictures] = useState([]); // Pictures available but not claimed yet
  const [nextLevelPreview, setNextLevelPreview] = useState(null); // Next level's locked picture
  
  // Celebration state for newly unlocked profile pictures
  const [showProfilePictureCelebration, setShowProfilePictureCelebration] = useState(false);
  const [celebratedPicture, setCelebratedPicture] = useState(null);
  const [fallingIconAnimations, setFallingIconAnimations] = useState([]);
  const [recentlyUnlockedPictures, setRecentlyUnlockedPictures] = useState([]);
  
  // Level milestone celebration state
  const [showLevelCelebration, setShowLevelCelebration] = useState(false);
  const [celebratedLevel, setCelebratedLevel] = useState(null);
  const [levelAnimations, setLevelAnimations] = useState([]);
  
  // Animation value for color picker
  const colorPickerAnimation = useRef(new Animated.Value(0)).current;
  
  // Level milestone celebrations
  const createLevelCelebration = (level) => {
    // Use screen dimensions from component hook (already available)
    switch (level) {
      case 2:
        return createFireworksAnimation(width, height);
      case 5:
        return createPremiumCelebration(width, height);
      case 8:
        return createFireAnimation(width, height);
      case 10:
        return createEpicCelebration(width, height);
      case 11:
        return createLegendaryCelebration(width, height);
      case 12:
        return createUltimateCelebration(width, height);
      default:
        return [];
    }
  };
  
  // Level 2: Fireworks Animation 🎆
  const createFireworksAnimation = (width, height) => {
    const fireworks = [];
    const numberOfFireworks = 12;
    
    for (let i = 0; i < numberOfFireworks; i++) {
      const x = Math.random() * width;
      const y = height * 0.3 + Math.random() * height * 0.4; // Middle area
      const delay = i * 200; // Staggered explosions
      
      fireworks.push({
        id: `firework_${i}`,
        type: 'firework',
        x,
        y,
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
        delay,
        colors: ['#FF6B6B', '#4ECDC4', '#45B7B8', '#FFA726', '#AB47BC']
      });
    }
    
    setLevelAnimations(fireworks);
    
    // Animate fireworks
    fireworks.forEach((firework) => {
      setTimeout(() => {
        // Explosion effect
        Animated.parallel([
          Animated.timing(firework.scale, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(firework.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            })
          ])
        ]).start();
      }, firework.delay);
    });
    
    return fireworks;
  };
  
  // Level 5: PREMIUM UNLOCK CELEBRATION 🎉✨💎👑
  // This is THE moment - user bought the app and unlocked premium!
  const createPremiumCelebration = (width, height) => {
    const elements = [];
    
    // PHASE 1: Golden Burst from Center 💫
    const centerX = width / 2;
    const centerY = height / 2;
    const numberOfBurstRays = 12;
    
    for (let i = 0; i < numberOfBurstRays; i++) {
      const angle = (i * 360 / numberOfBurstRays) * (Math.PI / 180);
      const distance = 150;
      const endX = centerX + Math.cos(angle) * distance;
      const endY = centerY + Math.sin(angle) * distance;
      
      elements.push({
        id: `burst_${i}`,
        type: 'goldenburst',
        icon: 'flash',
        x: centerX,
        y: centerY,
        endX,
        endY,
        animatedX: new Animated.Value(centerX),
        animatedY: new Animated.Value(centerY),
        scale: new Animated.Value(2),
        opacity: new Animated.Value(1),
        delay: i * 50, // Rapid succession
        color: '#FFD700'
      });
    }
    
    // PHASE 2: Premium Crown Effect 👑
    for (let i = 0; i < 3; i++) {
      elements.push({
        id: `crown_${i}`,
        type: 'crown',
        icon: 'diamond',
        x: centerX - 60 + (i * 60),
        y: centerY - 100,
        scale: new Animated.Value(0),
        rotation: new Animated.Value(0),
        opacity: new Animated.Value(0),
        delay: 500 + (i * 200),
        color: '#FFD700'
      });
    }
    
    // PHASE 3: Premium Badge Sparkles ✨
    const numberOfSparkles = 25;
    for (let i = 0; i < numberOfSparkles; i++) {
      const sparkleAngle = Math.random() * 360 * (Math.PI / 180);
      const sparkleDistance = 50 + Math.random() * 150;
      const sparkleX = centerX + Math.cos(sparkleAngle) * sparkleDistance;
      const sparkleY = centerY + Math.sin(sparkleAngle) * sparkleDistance;
      
      elements.push({
        id: `sparkle_${i}`,
        type: 'sparkle',
        icon: 'star',
        x: sparkleX,
        y: sparkleY,
        scale: new Animated.Value(0),
        rotation: new Animated.Value(0),
        opacity: new Animated.Value(0),
        delay: 800 + Math.random() * 1000,
        color: i % 2 === 0 ? '#FFD700' : '#FF6B9D'
      });
    }
    
    // PHASE 4: Confetti Explosion 🎊
    const numberOfConfetti = 30;
    for (let i = 0; i < numberOfConfetti; i++) {
      elements.push({
        id: `confetti_${i}`,
        type: 'confetti',
        icon: 'diamond-outline',
        x: centerX + (Math.random() - 0.5) * 100,
        y: centerY - 50,
        animatedValue: new Animated.Value(-50),
        rotation: new Animated.Value(0),
        scale: new Animated.Value(0.3 + Math.random() * 0.7),
        delay: 1200 + Math.random() * 500,
        color: ['#FFD700', '#FF6B9D', '#4ECDC4', '#45B7B8', '#FFA726'][i % 5]
      });
    }
    
    setLevelAnimations(elements);
    
    // Execute the celebration sequence
    elements.forEach((element) => {
      setTimeout(() => {
        if (element.type === 'goldenburst') {
          // Golden rays burst outward
          Animated.parallel([
            Animated.timing(element.animatedX, {
              toValue: element.endX,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(element.animatedY, {
              toValue: element.endY,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(element.scale, {
              toValue: 0.5,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(element.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            })
          ]).start();
        } else if (element.type === 'crown') {
          // Crown pieces appear majestically
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.spring(element.scale, {
                toValue: 1.5,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
              }),
              Animated.timing(element.rotation, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              })
            ])
          ]).start();
        } else if (element.type === 'sparkle') {
          // Sparkles twinkle around premium badge
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.spring(element.scale, {
                toValue: 1.2,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }),
              Animated.loop(
                Animated.sequence([
                  Animated.timing(element.rotation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                  }),
                  Animated.timing(element.rotation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                  })
                ])
              )
            ]),
            Animated.delay(2000), // Reduced delay for 5s total
            Animated.timing(element.opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            })
          ]).start();
        } else if (element.type === 'confetti') {
          // Confetti falls with style
          Animated.parallel([
            Animated.timing(element.animatedValue, {
              toValue: height + 100,
              duration: 3000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.timing(element.rotation, {
                toValue: 1,
                duration: 1000 + Math.random() * 1000,
                useNativeDriver: true,
              })
            )
          ]).start();
        }
      }, element.delay);
    });
    
    return elements;
  };
  
  // Level 8: Fire from Bottom 🔥
  const createFireAnimation = (width, height) => {
    const flames = [];
    const numberOfFlames = 15;
    
    for (let i = 0; i < numberOfFlames; i++) {
      flames.push({
        id: `flame_${i}`,
        type: 'flame',
        icon: 'flame',
        x: (width / numberOfFlames) * i + Math.random() * 40 - 20,
        animatedValue: new Animated.Value(height + 50),
        scale: new Animated.Value(0.5 + Math.random() * 0.5),
        opacity: new Animated.Value(0.8),
        delay: i * 100,
        color: i % 2 === 0 ? '#FF6B35' : '#F7931E'
      });
    }
    
    setLevelAnimations(flames);
    
    // Animate flames rising from bottom
    flames.forEach((flame) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(flame.animatedValue, {
            toValue: -100,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(1500),
            Animated.timing(flame.opacity, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            })
          ])
        ]).start();
      }, flame.delay);
    });
    
    return flames;
  };
  
  // Level 10: Epic Celebration ⚡🌟
  const createEpicCelebration = (width, height) => {
    const elements = [];
    
    // Lightning bolts
    for (let i = 0; i < 8; i++) {
      elements.push({
        id: `lightning_${i}`,
        type: 'lightning',
        icon: 'flash',
        x: Math.random() * width,
        y: Math.random() * height * 0.6,
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
        rotation: new Animated.Value(Math.random() * 360),
        delay: i * 150,
        color: '#FFC107'
      });
    }
    
    // Cosmic stars
    for (let i = 0; i < 25; i++) {
      elements.push({
        id: `cosmic_${i}`,
        type: 'cosmic',
        icon: 'sparkles',
        x: Math.random() * width,
        y: Math.random() * height,
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0.8),
        delay: Math.random() * 2000,
        color: '#9C27B0'
      });
    }
    
    setLevelAnimations(elements);
    
    elements.forEach((element) => {
      setTimeout(() => {
        if (element.type === 'lightning') {
          // Lightning flash effect
          Animated.sequence([
            Animated.timing(element.scale, {
              toValue: 1.5,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(element.opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            })
          ]).start();
        } else {
          // Cosmic sparkle effect
          Animated.parallel([
            Animated.timing(element.scale, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.delay(1000),
              Animated.timing(element.opacity, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              })
            ])
          ]).start();
        }
      }, element.delay);
    });
    
    return elements;
  };
  
  // Level 11: Legendary Celebration 👑⚡
  const createLegendaryCelebration = (width, height) => {
    const elements = [];
    
    // Golden crown effects
    for (let i = 0; i < 6; i++) {
      elements.push({
        id: `crown_${i}`,
        type: 'crown',
        icon: 'trophy',
        x: width * 0.5 + (Math.cos(i * 60 * Math.PI / 180) * 150),
        y: height * 0.3 + (Math.sin(i * 60 * Math.PI / 180) * 150),
        scale: new Animated.Value(0),
        opacity: new Animated.Value(1),
        rotation: new Animated.Value(0),
        delay: i * 200,
        color: '#FFD700'
      });
    }
    
    // Energy waves
    for (let i = 0; i < 12; i++) {
      elements.push({
        id: `energy_${i}`,
        type: 'energy',
        icon: 'radio-button-off',
        x: width * 0.5,
        y: height * 0.5,
        scale: new Animated.Value(0),
        opacity: new Animated.Value(0.6),
        delay: i * 100,
        color: '#E91E63'
      });
    }
    
    setLevelAnimations(elements);
    
    elements.forEach((element) => {
      setTimeout(() => {
        if (element.type === 'crown') {
          Animated.parallel([
            Animated.timing(element.scale, {
              toValue: 1.2,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.timing(element.rotation, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
              })
            )
          ]).start();
        } else {
          // Energy wave expansion
          Animated.parallel([
            Animated.timing(element.scale, {
              toValue: 3,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(element.opacity, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            })
          ]).start();
        }
      }, element.delay);
    });
    
    return elements;
  };
  
  // Level 12: Ultimate Celebration 🌟💫✨
  const createUltimateCelebration = (width, height) => {
    const elements = [];
    
    // Ultimate cosmic explosion
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * 2 * Math.PI;
      const distance = 100 + Math.random() * 200;
      
      elements.push({
        id: `ultimate_${i}`,
        type: 'ultimate',
        icon: i % 4 === 0 ? 'star' : i % 4 === 1 ? 'diamond' : i % 4 === 2 ? 'flame' : 'flash',
        x: width * 0.5,
        y: height * 0.5,
        targetX: width * 0.5 + Math.cos(angle) * distance,
        targetY: height * 0.5 + Math.sin(angle) * distance,
        animatedX: new Animated.Value(width * 0.5),
        animatedY: new Animated.Value(height * 0.5),
        scale: new Animated.Value(0.2),
        opacity: new Animated.Value(1),
        rotation: new Animated.Value(0),
        delay: Math.floor(i / 10) * 200,
        color: ['#FFD700', '#E91E63', '#00BCD4', '#4CAF50', '#FF6B35'][i % 5]
      });
    }
    
    setLevelAnimations(elements);
    
    elements.forEach((element) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(element.animatedX, {
            toValue: element.targetX,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(element.animatedY, {
            toValue: element.targetY,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(element.scale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.loop(
            Animated.timing(element.rotation, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            })
          ),
          Animated.sequence([
            Animated.delay(1500),
            Animated.timing(element.opacity, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            })
          ])
        ]).start();
      }, element.delay);
    });
    
    return elements;
  };
  
  // Load claimed pictures from storage
  const loadClaimedPictures = async () => {
    try {
      const stored = await AsyncStorage.getItem('claimedProfilePictures');
      if (stored) {
        const claimed = JSON.parse(stored);
        setClaimedPictures(claimed);
        return claimed;
      }
      return [];
    } catch (error) {
      console.error('Error loading claimed pictures:', error);
      return [];
    }
  };
  
  // Save claimed pictures to storage
  const saveClaimedPictures = async (claimed) => {
    try {
      await AsyncStorage.setItem('claimedProfilePictures', JSON.stringify(claimed));
      console.log('Claimed pictures saved:', claimed);
    } catch (error) {
      console.error('Error saving claimed pictures:', error);
    }
  };
  
  // Claim a picture (unlock it and trigger celebration)
  const claimPicture = async (picture) => {
    // Add to claimed pictures
    const newClaimed = [...claimedPictures, picture.id];
    setClaimedPictures(newClaimed);
    await saveClaimedPictures(newClaimed);
    
    // Add to available pictures (so it shows in "Claimed Pictures" section)
    setAvailablePictures(prev => [...prev, picture]);
    
    // Remove from unclaimed
    setUnclaimedPictures(prev => prev.filter(p => p.id !== picture.id));
    
    // Show celebration - SPECIAL for Level 5 (Premium unlock)
    setCelebratedPicture(picture);
    setShowProfilePictureCelebration(true);
    
    // Create special celebration based on the picture's required level
    if (picture.requiredLevel === 5) {
      // Level 5 = Premium unlock - Epic celebration!
      createPremiumPictureUnlockCelebration(picture.icon);
    } else if (picture.requiredLevel === 8) {
      // Level 8 = Legend Status - Fire celebration!
      createLegendPictureUnlockCelebration(picture.icon);
    } else if (picture.requiredLevel === 10) {
      // Level 10 = Immortal - Lightning celebration!
      createImmortalPictureUnlockCelebration(picture.icon);
    } else if (picture.requiredLevel === 11) {
      // Level 11 = Ascendant - Cosmic celebration!
      createAscendantPictureUnlockCelebration(picture.icon);
    } else if (picture.requiredLevel === 12) {
      // Level 12 = ETERNAL - ULTIMATE celebration!
      createEternalPictureUnlockCelebration(picture.icon);
    } else {
      // Regular celebration for other levels
      createFallingProfileIconAnimations(picture.icon);
    }
    
    // Mark as celebrated so it doesn't show again
    const celebrationKey = `profilePicture_${picture.id}_celebrated`;
    await AsyncStorage.setItem(celebrationKey, 'true');
  };
  
  // Create falling icon animations for profile picture celebration
  const createFallingProfileIconAnimations = (iconName) => {
    // Use screen dimensions from component hook (already available)
    const numberOfIcons = 12; // More icons for better effect
    const animations = [];
    
    for (let i = 0; i < numberOfIcons; i++) {
      const animatedValue = new Animated.Value(-100); // Start higher above screen
      const horizontalPosition = Math.random() * (width - 60); // More horizontal spread
      const delay = Math.random() * 1000; // Reduced delay for faster start
      const duration = 4000 + Math.random() * 2000; // Longer duration for better visibility
      
      animations.push({
        id: i,
        animatedValue,
        horizontalPosition,
        delay,
        duration,
        rotation: new Animated.Value(0),
        scale: new Animated.Value(0.5), // Start smaller and scale up
        iconName
      });
    }
    
    setFallingIconAnimations(animations);
    
    // Start animations with a slight delay to ensure modal is rendered
    setTimeout(() => {
      animations.forEach((icon) => {
        // Scale up animation first
        Animated.timing(icon.scale, {
          toValue: 1.2,
          duration: 200,
          delay: icon.delay,
          useNativeDriver: true,
        }).start();
        
        // Falling animation
        Animated.timing(icon.animatedValue, {
          toValue: height + 100, // Fall further past bottom of screen
          duration: icon.duration,
          delay: icon.delay,
          useNativeDriver: true,
        }).start();
        
        // Rotation animation
        Animated.loop(
          Animated.timing(icon.rotation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      });
    }, 200); // Slightly longer delay
    
    // Cleanup: Gradual fade after 7 seconds, complete disappear after 8 seconds
    setTimeout(() => {
      // Start gradual fade
      animations.forEach((element) => {
        Animated.timing(element.opacity || new Animated.Value(1), {
          toValue: 0,
          duration: 1000, // 1 second fade
          useNativeDriver: true,
        }).start();
      });
    }, 7000);
    
    // Complete cleanup after fade
    setTimeout(() => {
      setFallingIconAnimations([]);
    }, 8000);
  };
  
  // Create PREMIUM picture unlock celebration (Level 5)
  const createPremiumPictureUnlockCelebration = (iconName) => {
    // This is the EPIC celebration for Level 5 profile picture unlock
    const numberOfElements = 20; // More elements for premium effect
    const animations = [];
    
    // Center burst effect
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < numberOfElements; i++) {
      if (i < 8) {
        // Golden burst rays
        const angle = (i * 45) * (Math.PI / 180);
        const distance = 120;
        animations.push({
          id: i,
          type: 'premiumBurst',
          animatedValue: new Animated.Value(0),
          scale: new Animated.Value(2),
          opacity: new Animated.Value(1),
          angle,
          distance,
          delay: i * 100,
          iconName: 'flash'
        });
      } else if (i < 12) {
        // Premium diamonds
        const premiumX = centerX + (Math.random() - 0.5) * 200;
        const premiumY = centerY + (Math.random() - 0.5) * 200;
        animations.push({
          id: i,
          type: 'premiumDiamond',
          horizontalPosition: premiumX,
          animatedValue: new Animated.Value(-100),
          rotation: new Animated.Value(0),
          scale: new Animated.Value(0.5),
          delay: 500 + (i * 150),
          iconName: 'diamond'
        });
      } else {
        // Premium sparkles
        const sparkleX = Math.random() * width;
        const sparkleY = Math.random() * height;
        animations.push({
          id: i,
          type: 'premiumSparkle',
          horizontalPosition: sparkleX,
          verticalPosition: sparkleY,
          scale: new Animated.Value(0),
          rotation: new Animated.Value(0),
          opacity: new Animated.Value(0),
          delay: 800 + Math.random() * 1000,
          iconName: 'star'
        });
      }
    }
    
    setFallingIconAnimations(animations);
    
    // Execute premium celebration sequence
    setTimeout(() => {
      animations.forEach((element) => {
        if (element.type === 'premiumBurst') {
          // Golden rays burst outward
          const endX = centerX + Math.cos(element.angle) * element.distance;
          const endY = centerY + Math.sin(element.angle) * element.distance;
          
          Animated.parallel([
            Animated.timing(element.animatedValue, {
              toValue: element.distance,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(element.scale, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(element.opacity, {
              toValue: 0,
              duration: 1200,
              useNativeDriver: true,
            })
          ]).start();
        } else if (element.type === 'premiumDiamond') {
          // Premium diamonds fall with majesty
          Animated.parallel([
            Animated.timing(element.animatedValue, {
              toValue: height + 150,
              duration: 4000,
              useNativeDriver: true,
            }),
            Animated.spring(element.scale, {
              toValue: 1.5,
              tension: 50,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.timing(element.rotation, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              })
            )
          ]).start();
        } else if (element.type === 'premiumSparkle') {
          // Premium sparkles twinkle
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.spring(element.scale, {
                toValue: 1.3,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
              }),
              Animated.loop(
                Animated.sequence([
                  Animated.timing(element.rotation, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                  }),
                  Animated.timing(element.rotation, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                  })
                ])
              )
            ]),
            Animated.delay(4000),
            Animated.timing(element.opacity, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            })
          ]).start();
        }
      });
    }, 300); // Premium delay for dramatic effect
    
    // Cleanup: Gradual fade after 7 seconds, complete disappear after 8 seconds
    setTimeout(() => {
      // Start gradual fade
      animations.forEach((element) => {
        Animated.timing(element.opacity || new Animated.Value(1), {
          toValue: 0,
          duration: 1000, // 1 second fade
          useNativeDriver: true,
        }).start();
      });
    }, 7000);
    
    // Complete cleanup after fade
    setTimeout(() => {
      setFallingIconAnimations([]);
    }, 8000);
  };
  
  // Create LEGEND picture unlock celebration (Level 8) 🔥
  const createLegendPictureUnlockCelebration = (iconName) => {
    const numberOfElements = 25; // More intense than premium
    const animations = [];
    
    // Fire eruption from bottom
    for (let i = 0; i < numberOfElements; i++) {
      if (i < 12) {
        // Rising flames from bottom
        animations.push({
          id: i,
          type: 'legendFlame',
          horizontalPosition: (width / 12) * i + Math.random() * 40 - 20,
          animatedValue: new Animated.Value(height + 50),
          scale: new Animated.Value(0.8 + Math.random() * 0.4),
          opacity: new Animated.Value(0.9),
          delay: i * 80,
          iconName: 'flame'
        });
      } else {
        // Fire sparks explosion
        const sparkX = Math.random() * width;
        const sparkY = height * 0.6 + Math.random() * height * 0.2;
        animations.push({
          id: i,
          type: 'legendSpark',
          horizontalPosition: sparkX,
          verticalPosition: sparkY,
          animatedValue: new Animated.Value(0),
          scale: new Animated.Value(0.5),
          rotation: new Animated.Value(0),
          opacity: new Animated.Value(1),
          delay: 800 + Math.random() * 500,
          iconName: 'flash'
        });
      }
    }
    
    setFallingIconAnimations(animations);
    
    setTimeout(() => {
      animations.forEach((element) => {
        if (element.type === 'legendFlame') {
          // Flames rise from bottom
          Animated.parallel([
            Animated.timing(element.animatedValue, {
              toValue: -100,
              duration: 2500,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.delay(1000),
              Animated.timing(element.opacity, {
                toValue: 0,
                duration: 1500,
                useNativeDriver: true,
              })
            ])
          ]).start();
        } else if (element.type === 'legendSpark') {
          // Fire sparks explode outward
          const directions = [-1, 1];
          const direction = directions[Math.floor(Math.random() * directions.length)];
          
          Animated.parallel([
            Animated.timing(element.animatedValue, {
              toValue: direction * (50 + Math.random() * 100),
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.spring(element.scale, {
              toValue: 1.2,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.timing(element.rotation, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
              })
            ),
            Animated.sequence([
              Animated.delay(1000),
              Animated.timing(element.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              })
            ])
          ]).start();
        }
      });
    }, 200);
    
    // Cleanup: Gradual fade after 7 seconds, complete disappear after 8 seconds
    setTimeout(() => {
      // Start gradual fade
      animations.forEach((element) => {
        Animated.timing(element.opacity || new Animated.Value(1), {
          toValue: 0,
          duration: 1000, // 1 second fade
          useNativeDriver: true,
        }).start();
      });
    }, 7000);
    
    // Complete cleanup after fade
    setTimeout(() => {
      setFallingIconAnimations([]);
    }, 8000);
  };
  
  // Create IMMORTAL picture unlock celebration (Level 10) ⚡
  const createImmortalPictureUnlockCelebration = (iconName) => {
    const numberOfElements = 30; // Even more epic
    const animations = [];
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < numberOfElements; i++) {
      if (i < 8) {
        // Lightning strikes from sky
        animations.push({
          id: i,
          type: 'immortalLightning',
          horizontalPosition: Math.random() * width,
          animatedValue: new Animated.Value(-50),
          scale: new Animated.Value(1.5),
          opacity: new Animated.Value(1),
          delay: i * 150,
          iconName: 'flash'
        });
      } else if (i < 16) {
        // Energy orbs circling
        const angle = (i - 8) * 45 * (Math.PI / 180);
        const radius = 100;
        animations.push({
          id: i,
          type: 'immortalOrb',
          angle,
          radius,
          centerX,
          centerY,
          animatedAngle: new Animated.Value(0),
          scale: new Animated.Value(0),
          opacity: new Animated.Value(0.8),
          delay: 400 + (i - 8) * 100,
          iconName: 'radio-button-on'
        });
      } else {
        // Power surge effects
        const surgeX = centerX + (Math.random() - 0.5) * 300;
        const surgeY = centerY + (Math.random() - 0.5) * 300;
        animations.push({
          id: i,
          type: 'immortalSurge',
          horizontalPosition: surgeX,
          verticalPosition: surgeY,
          scale: new Animated.Value(0),
          rotation: new Animated.Value(0),
          opacity: new Animated.Value(0),
          delay: 800 + Math.random() * 800,
          iconName: 'sunny'
        });
      }
    }
    
    setFallingIconAnimations(animations);
    
    setTimeout(() => {
      animations.forEach((element) => {
        if (element.type === 'immortalLightning') {
          // Lightning strikes down
          Animated.sequence([
            Animated.timing(element.animatedValue, {
              toValue: height + 50,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(element.opacity, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            })
          ]).start();
        } else if (element.type === 'immortalOrb') {
          // Energy orbs circle around
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.spring(element.scale, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.timing(element.animatedAngle, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
              })
            )
          ]).start();
        } else if (element.type === 'immortalSurge') {
          // Power surge pulses
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.sequence([
                Animated.spring(element.scale, {
                  toValue: 1.8,
                  tension: 50,
                  friction: 8,
                  useNativeDriver: true,
                }),
                Animated.timing(element.scale, {
                  toValue: 0,
                  duration: 800,
                  useNativeDriver: true,
                })
              ]),
              Animated.timing(element.rotation, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
              })
            ])
          ]).start();
        }
      });
    }, 150);
    
    // Cleanup: Gradual fade after 7 seconds, complete disappear after 8 seconds
    setTimeout(() => {
      // Start gradual fade
      animations.forEach((element) => {
        Animated.timing(element.opacity || new Animated.Value(1), {
          toValue: 0,
          duration: 1000, // 1 second fade
          useNativeDriver: true,
        }).start();
      });
    }, 7000);
    
    // Complete cleanup after fade
    setTimeout(() => {
      setFallingIconAnimations([]);
    }, 8000);
  };
  
  // Create ASCENDANT picture unlock celebration (Level 11) 🌟
  const createAscendantPictureUnlockCelebration = (iconName) => {
    const numberOfElements = 35; // Getting more intense
    const animations = [];
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < numberOfElements; i++) {
      if (i < 10) {
        // Ascending light pillars
        const pillarX = (width / 10) * i;
        animations.push({
          id: i,
          type: 'ascendantPillar',
          horizontalPosition: pillarX,
          animatedValue: new Animated.Value(height + 100),
          scale: new Animated.Value(1),
          opacity: new Animated.Value(0.3),
          delay: i * 100,
          iconName: 'trending-up'
        });
      } else if (i < 20) {
        // Cosmic winds spiral
        const spiralAngle = (i - 10) * 36 * (Math.PI / 180);
        const spiralRadius = 80 + ((i - 10) * 15);
        animations.push({
          id: i,
          type: 'ascendantWind',
          spiralAngle,
          spiralRadius,
          centerX,
          centerY,
          animatedSpiral: new Animated.Value(0),
          scale: new Animated.Value(0.7),
          opacity: new Animated.Value(0.6),
          delay: 300 + (i - 10) * 80,
          iconName: 'airplane-outline'
        });
      } else {
        // Divine stars descending
        const starX = centerX + (Math.random() - 0.5) * 400;
        animations.push({
          id: i,
          type: 'ascendantStar',
          horizontalPosition: starX,
          animatedValue: new Animated.Value(-100),
          scale: new Animated.Value(0.3),
          rotation: new Animated.Value(0),
          opacity: new Animated.Value(1),
          delay: 800 + Math.random() * 1000,
          iconName: 'star'
        });
      }
    }
    
    setFallingIconAnimations(animations);
    
    setTimeout(() => {
      animations.forEach((element) => {
        if (element.type === 'ascendantPillar') {
          // Light pillars rise to heaven
          Animated.parallel([
            Animated.timing(element.animatedValue, {
              toValue: -200,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.timing(element.opacity, {
                toValue: 0.8,
                duration: 500,
                useNativeDriver: true,
              }),
              Animated.delay(2000),
              Animated.timing(element.opacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              })
            ])
          ]).start();
        } else if (element.type === 'ascendantWind') {
          // Cosmic winds spiral upward
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.loop(
                Animated.timing(element.animatedSpiral, {
                  toValue: 1,
                  duration: 2000,
                  useNativeDriver: true,
                })
              ),
              Animated.spring(element.scale, {
                toValue: 1.2,
                tension: 80,
                friction: 8,
                useNativeDriver: true,
              })
            ])
          ]).start();
        } else if (element.type === 'ascendantStar') {
          // Divine stars descend with grace
          Animated.parallel([
            Animated.timing(element.animatedValue, {
              toValue: height + 150,
              duration: 4000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.spring(element.scale, {
              toValue: 1.5,
              tension: 60,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.loop(
              Animated.timing(element.rotation, {
                toValue: 1,
                duration: 2500,
                useNativeDriver: true,
              })
            )
          ]).start();
        }
      });
    }, 100);
    
    // Cleanup: Gradual fade after 7 seconds, complete disappear after 8 seconds
    setTimeout(() => {
      // Start gradual fade
      animations.forEach((element) => {
        Animated.timing(element.opacity || new Animated.Value(1), {
          toValue: 0,
          duration: 1000, // 1 second fade
          useNativeDriver: true,
        }).start();
      });
    }, 7000);
    
    // Complete cleanup after fade
    setTimeout(() => {
      setFallingIconAnimations([]);
    }, 8000);
  };
  
  // Create ETERNAL picture unlock celebration (Level 12) - THE ULTIMATE! 🌟💫✨
  const createEternalPictureUnlockCelebration = (iconName) => {
    const numberOfElements = 50; // Maximum epicness!
    const animations = [];
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let i = 0; i < numberOfElements; i++) {
      if (i < 12) {
        // Cosmic explosion rays
        const explosionAngle = (i * 30) * (Math.PI / 180);
        const explosionDistance = 200;
        animations.push({
          id: i,
          type: 'eternalExplosion',
          angle: explosionAngle,
          distance: explosionDistance,
          centerX,
          centerY,
          animatedDistance: new Animated.Value(0),
          scale: new Animated.Value(3),
          opacity: new Animated.Value(1),
          delay: i * 80,
          iconName: 'flash'
        });
      } else if (i < 24) {
        // Galaxy spiral formation
        const galaxyAngle = (i - 12) * 30 * (Math.PI / 180);
        const galaxyRadius = 60 + ((i - 12) * 20);
        animations.push({
          id: i,
          type: 'eternalGalaxy',
          baseAngle: galaxyAngle,
          radius: galaxyRadius,
          centerX,
          centerY,
          animatedRotation: new Animated.Value(0),
          scale: new Animated.Value(0.5),
          opacity: new Animated.Value(0.7),
          delay: 200 + (i - 12) * 60,
          iconName: 'planet'
        });
      } else if (i < 36) {
        // Dimension rifts
        const riftX = Math.random() * width;
        const riftY = Math.random() * height;
        animations.push({
          id: i,
          type: 'eternalRift',
          horizontalPosition: riftX,
          verticalPosition: riftY,
          scale: new Animated.Value(0),
          rotation: new Animated.Value(0),
          opacity: new Animated.Value(0),
          delay: 500 + Math.random() * 800,
          iconName: 'ellipse-outline'
        });
      } else {
        // Ultimate cosmic essence
        const essenceAngle = Math.random() * 360 * (Math.PI / 180);
        const essenceDistance = 50 + Math.random() * 150;
        const essenceX = centerX + Math.cos(essenceAngle) * essenceDistance;
        const essenceY = centerY + Math.sin(essenceAngle) * essenceDistance;
        animations.push({
          id: i,
          type: 'eternalEssence',
          horizontalPosition: essenceX,
          verticalPosition: essenceY,
          scale: new Animated.Value(0.2),
          rotation: new Animated.Value(0),
          opacity: new Animated.Value(0),
          delay: 1000 + Math.random() * 1500,
          iconName: 'sparkles'
        });
      }
    }
    
    setFallingIconAnimations(animations);
    
    setTimeout(() => {
      animations.forEach((element) => {
        if (element.type === 'eternalExplosion') {
          // Massive cosmic explosion
          const endX = centerX + Math.cos(element.angle) * element.distance;
          const endY = centerY + Math.sin(element.angle) * element.distance;
          
          Animated.parallel([
            Animated.timing(element.animatedDistance, {
              toValue: element.distance,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(element.scale, {
              toValue: 0.5,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.sequence([
              Animated.delay(800),
              Animated.timing(element.opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              })
            ])
          ]).start();
        } else if (element.type === 'eternalGalaxy') {
          // Galaxy formation spiral
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.spring(element.scale, {
                toValue: 1.3,
                tension: 40,
                friction: 8,
                useNativeDriver: true,
              }),
              Animated.loop(
                Animated.timing(element.animatedRotation, {
                  toValue: 1,
                  duration: 4000,
                  useNativeDriver: true,
                })
              )
            ])
          ]).start();
        } else if (element.type === 'eternalRift') {
          // Dimension rift opening
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 0.9,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.sequence([
                Animated.spring(element.scale, {
                  toValue: 2.5,
                  tension: 30,
                  friction: 8,
                  useNativeDriver: true,
                }),
                Animated.delay(1500),
                Animated.timing(element.scale, {
                  toValue: 0,
                  duration: 1000,
                  useNativeDriver: true,
                })
              ]),
              Animated.loop(
                Animated.timing(element.rotation, {
                  toValue: 1,
                  duration: 3000,
                  useNativeDriver: true,
                })
              )
            ])
          ]).start();
        } else if (element.type === 'eternalEssence') {
          // Ultimate cosmic essence manifestation
          Animated.sequence([
            Animated.timing(element.opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.sequence([
                Animated.spring(element.scale, {
                  toValue: 2,
                  tension: 50,
                  friction: 6,
                  useNativeDriver: true,
                }),
                Animated.delay(2000),
                Animated.timing(element.scale, {
                  toValue: 0,
                  duration: 1500,
                  useNativeDriver: true,
                })
              ]),
              Animated.loop(
                Animated.sequence([
                  Animated.timing(element.rotation, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                  }),
                  Animated.timing(element.rotation, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                  })
                ])
              )
            ])
          ]).start();
        }
      });
    }, 50); // Immediate ultimate power!
    
    // Cleanup: Gradual fade after 7 seconds, complete disappear after 8 seconds
    setTimeout(() => {
      // Start gradual fade
      animations.forEach((element) => {
        Animated.timing(element.opacity || new Animated.Value(1), {
          toValue: 0,
          duration: 1000, // 1 second fade
          useNativeDriver: true,
        }).start();
      });
    }, 7000);
    
    // Complete cleanup after fade
    setTimeout(() => {
      setFallingIconAnimations([]);
    }, 8000);
  };
  
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
    const loadLevelData = async () => {
      try {
        // Check for dev level override first (same as achievements screen)
        const storedTestMode = await AsyncStorage.getItem('testMode');
        const storedTestLevel = await AsyncStorage.getItem('testLevel');
        
        let level;
        if (storedTestMode === 'true' && storedTestLevel) {
          // Use dev override level
          level = parseInt(storedTestLevel);
          console.log('Using dev level override:', level);
        } else {
          // Use real level calculation
          const totalPoints = getTotalPoints();
          const levelInfo = LevelService.getLevelInfo(totalPoints);
          level = levelInfo.level;
        }
        
        // Load claimed pictures
        const claimed = await loadClaimedPictures();
        
        // Get all pictures available at this level
        const allAvailable = getAvailableProfilePictures(level);
        
        // Separate into claimed and unclaimed
        const claimedPics = allAvailable.filter(pic => claimed.includes(pic.id));
        const unclaimedPics = allAvailable.filter(pic => !claimed.includes(pic.id));
        
        // Get next level preview (locked picture)
        const nextUnlock = getNextUnlockInfo(level);
        
        // Removed excessive logging
        
        setUserLevel(level);
        setAvailablePictures(claimedPics); // Only show claimed pictures as "available"
        setUnclaimedPictures(unclaimedPics); // Pictures user can claim
        setNextLevelPreview(nextUnlock?.picture || null);
        setLockedPictures(getLockedProfilePictures(level));
      } catch (error) {
        console.error('Error loading level data:', error);
        // Fallback to level 1
        const fallbackLevel = 1;
        setUserLevel(fallbackLevel);
        
        try {
          const claimed = await loadClaimedPictures();
          const allAvailable = getAvailableProfilePictures(fallbackLevel);
          const claimedPics = allAvailable.filter(pic => claimed.includes(pic.id));
          const unclaimedPics = allAvailable.filter(pic => !claimed.includes(pic.id));
          
          setAvailablePictures(claimedPics);
          setUnclaimedPictures(unclaimedPics);
          setLockedPictures(getLockedProfilePictures(fallbackLevel));
        } catch (fallbackError) {
          console.error('Error in fallback level setup:', fallbackError);
        }
      }
    };
    
    loadLevelData();
  }, [getTotalPoints]);
  
  // Also refresh when achievements change (for real-time updates)
  const { unlockedAchievements } = useAchievements();
  useEffect(() => {
    const loadLevelData = async () => {
      try {
        // Check for dev level override first (same as achievements screen)
        const storedTestMode = await AsyncStorage.getItem('testMode');
        const storedTestLevel = await AsyncStorage.getItem('testLevel');
        
        let level;
        if (storedTestMode === 'true' && storedTestLevel) {
          // Use dev override level
          level = parseInt(storedTestLevel);
        } else {
          // Use real level calculation
          const totalPoints = getTotalPoints();
          const levelInfo = LevelService.getLevelInfo(totalPoints);
          level = levelInfo.level;
        }
        
        // Removed excessive logging
        
        // Load claimed pictures
        const claimed = await loadClaimedPictures();
        
        // Check for level changes and handle multi-level jumps
        const previousLevel = userLevel;
        
        // Always check for milestone celebrations when the calculated level changes
        // This ensures celebrations trigger when you unlock a level through achievements
        if (level > 0) {
          const milestones = [2, 5, 8, 10, 11, 12];
          
          // Check each milestone to see if it should be celebrated
          for (const milestone of milestones) {
            if (level >= milestone) {
              const celebrationKey = `levelMilestone_${milestone}_celebrated`;
              const alreadyCelebrated = await AsyncStorage.getItem(celebrationKey);
              
              if (!alreadyCelebrated) {
                console.log(`🎉 New milestone unlocked: Level ${milestone}!`);
                setCelebratedLevel(milestone);
                setShowLevelCelebration(true);
                createLevelCelebration(milestone);
                await AsyncStorage.setItem(celebrationKey, 'true');
                
                // Only celebrate one milestone at a time (the lowest uncelebrated one)
                break;
              }
            }
          }
        }
        
        // Handle level state changes for picture unlocking
        if (previousLevel > 0 && level > previousLevel) {
          console.log(`Level state updated from ${previousLevel} to ${level}`);
          
          // Get all pictures that should now be available (handling multi-level jumps)
          const allNewAvailable = getAvailableProfilePictures(level);
          const allPreviousAvailable = getAvailableProfilePictures(previousLevel);
          
          // Find truly new pictures (not previously available)
          const newlyUnlocked = allNewAvailable.filter(pic => 
            !allPreviousAvailable.some(prev => prev.id === pic.id)
          );
          
          if (newlyUnlocked.length > 0) {
            // Add all new pictures to unclaimed list
            setUnclaimedPictures(prev => {
              const unclaimedIds = prev.map(p => p.id);
              const toAdd = newlyUnlocked.filter(pic => !unclaimedIds.includes(pic.id));
              return [...prev, ...toAdd];
            });
            
            // Track for UI highlighting
            setRecentlyUnlockedPictures(newlyUnlocked.map(pic => pic.id));
            
            // Clear highlighting after 10 seconds
            setTimeout(() => {
              setRecentlyUnlockedPictures([]);
            }, 10000);
          }
        }
        
        // Update level and pictures
        const allAvailable = getAvailableProfilePictures(level);
        const claimedPics = allAvailable.filter(pic => claimed.includes(pic.id));
        const unclaimedPics = allAvailable.filter(pic => !claimed.includes(pic.id));
        const nextUnlock = getNextUnlockInfo(level);
        
        // Removed excessive logging
        
        setUserLevel(level);
        setAvailablePictures(claimedPics);
        setUnclaimedPictures(unclaimedPics);
        setNextLevelPreview(nextUnlock?.picture || null);
        setLockedPictures(getLockedProfilePictures(level));
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
  
  // Show image selection options
  const showImageOptions = () => {
    const options = [
      {
        text: 'Camera',
        onPress: takePhoto,
      },
      {
        text: 'Photo Library',
        onPress: pickImage,
      }
    ];
    
    // Add remove option if there's a current photo
    if (profileImage) {
      options.push({
        text: 'Remove Photo',
        onPress: deleteProfilePicture,
        style: 'destructive',
      });
    }
    
    options.push({
      text: 'Cancel',
      style: 'cancel',
    });
    
    Alert.alert(
      'Change Profile Picture',
      'Choose how you want to update your profile picture:',
      options
    );
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
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={async () => {
                      // Debug current level - check dev override first
                      const storedTestMode = await AsyncStorage.getItem('testMode');
                      const storedTestLevel = await AsyncStorage.getItem('testLevel');
                      
                      const currentPoints = getTotalPoints();
                      const currentLevelInfo = LevelService.getLevelInfo(currentPoints);
                      
                      let actualLevel, isDevMode;
                      if (storedTestMode === 'true' && storedTestLevel) {
                        actualLevel = parseInt(storedTestLevel);
                        isDevMode = true;
                      } else {
                        actualLevel = currentLevelInfo.level;
                        isDevMode = false;
                      }
                      
                      const currentAvailable = getAvailableProfilePictures(actualLevel);
                      
                      // Also manually calculate points to compare
                      let manualPoints = 0;
                      Object.keys(unlockedAchievements).forEach(achievementId => {
                        if (unlockedAchievements[achievementId]?.unlocked) {
                          const { ACHIEVEMENTS } = require('../screens/AchievementsScreen/data/achievementsData');
                          const achievementData = ACHIEVEMENTS?.[achievementId];
                          if (achievementData?.points) {
                            manualPoints += achievementData.points;
                          }
                        }
                      });
                      
                      console.log('🚨 DEBUG:');
                      console.log('Mode:', isDevMode ? 'DEV OVERRIDE' : 'REAL');
                      console.log('Actual Level:', actualLevel, LevelService.getLevelTitle(actualLevel));
                      console.log('Real Points/Level:', currentPoints, currentLevelInfo.level);
                      console.log('Pictures available:', currentAvailable.length);
                      
                      alert(`Level Debug:\n${isDevMode ? '🛠️ DEV MODE' : '📊 REAL MODE'}\nActual Level: ${actualLevel} (${LevelService.getLevelTitle(actualLevel)})\nReal Points: ${currentPoints} (Level ${currentLevelInfo.level})\nPictures: ${currentAvailable.length}\nClaimed: ${claimedPictures.length} | Unclaimed: ${unclaimedPictures.length}`);
                    }}
                    style={{
                      backgroundColor: '#4CAF50',
                      borderRadius: 8,
                      paddingHorizontal: spacing.xs,
                      paddingVertical: spacing.xxs,
                      marginRight: spacing.xs
                    }}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: fontSizes.xs,
                      fontWeight: 'bold'
                    }}>
                      DEBUG
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={async () => {
                      // Force refresh the level data - check dev override
                      const storedTestMode = await AsyncStorage.getItem('testMode');
                      const storedTestLevel = await AsyncStorage.getItem('testLevel');
                      
                      let level;
                      if (storedTestMode === 'true' && storedTestLevel) {
                        level = parseInt(storedTestLevel);
                      } else {
                        const currentPoints = getTotalPoints();
                        const currentLevelInfo = LevelService.getLevelInfo(currentPoints);
                        level = currentLevelInfo.level;
                      }
                      
                      // Force update the level and pictures
                      const claimed = await loadClaimedPictures();
                      const allAvailable = getAvailableProfilePictures(level);
                      const claimedPics = allAvailable.filter(pic => claimed.includes(pic.id));
                      const unclaimedPics = allAvailable.filter(pic => !claimed.includes(pic.id));
                      const nextUnlock = getNextUnlockInfo(level);
                      
                      setUserLevel(level);
                      setAvailablePictures(claimedPics);
                      setUnclaimedPictures(unclaimedPics);
                      setNextLevelPreview(nextUnlock?.picture || null);
                      
                      alert(`Refreshed!\nLevel: ${level}\nPictures: ${allAvailable.length}`);
                    }}
                    style={{
                      backgroundColor: '#2196F3',
                      borderRadius: 8,
                      paddingHorizontal: spacing.xs,
                      paddingVertical: spacing.xxs,
                      marginRight: spacing.xs
                    }}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: fontSizes.xs,
                      fontWeight: 'bold'
                    }}>
                      REFRESH
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={async () => {
                      // Reset claimed pictures for testing
                      await AsyncStorage.removeItem('claimedProfilePictures');
                      setClaimedPictures([]);
                      setAvailablePictures([]);
                      
                      // Move all current available pictures to unclaimed
                      const allAvailable = getAvailableProfilePictures(userLevel);
                      setUnclaimedPictures(allAvailable);
                      
                      // Reset complete
                    }}
                    style={{
                      backgroundColor: '#FF6B6B',
                      borderRadius: 8,
                      paddingHorizontal: spacing.xs,
                      paddingVertical: spacing.xxs,
                      marginRight: spacing.xs
                    }}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: fontSizes.xs,
                      fontWeight: 'bold'
                    }}>
                      RESET
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={async () => {
                      // Reset all level milestone celebrations
                      const milestones = [2, 5, 8, 10, 11, 12];
                      for (const milestone of milestones) {
                        await AsyncStorage.removeItem(`levelMilestone_${milestone}_celebrated`);
                      }
                      console.log('Reset all level milestone celebrations');
                      alert('Level celebrations reset! You can now see them again when you reach milestones.');
                    }}
                    style={{
                      backgroundColor: '#FF9800',
                      borderRadius: 8,
                      paddingHorizontal: spacing.xs,
                      paddingVertical: spacing.xxs,
                      marginRight: spacing.xs
                    }}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: fontSizes.xs,
                      fontWeight: 'bold'
                    }}>
                      🎆
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => {
                      // Test level celebrations
                      const testLevels = [2, 5, 8, 10, 11, 12];
                      const randomLevel = testLevels[Math.floor(Math.random() * testLevels.length)];
                      setCelebratedLevel(randomLevel);
                      setShowLevelCelebration(true);
                      createLevelCelebration(randomLevel);
                    }}
                    style={{
                      backgroundColor: '#9C27B0',
                      borderRadius: 8,
                      paddingHorizontal: spacing.xs,
                      paddingVertical: spacing.xxs,
                      marginRight: spacing.xs
                    }}
                  >
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: fontSizes.xs,
                      fontWeight: 'bold'
                    }}>
                      🎉
                    </Text>
                  </TouchableOpacity>
                  
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
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{
                  color: theme.textSecondary,
                  fontSize: fontSizes.xs
                }}>
                  {availablePictures.length} claimed ✨
                </Text>
                {unclaimedPictures.length > 0 && (
                  <Text style={{
                    color: '#FFD700',
                    fontSize: fontSizes.xs,
                    fontWeight: 'bold'
                  }}>
                    {unclaimedPictures.length} ready to unlock! 🎁
                  </Text>
                )}
              </View>
            </View>
            
            {/* Claimed Pictures */}
            {availablePictures.length > 0 && (
              <>
                <Text style={{
                  color: theme.text,
                  fontSize: fontSizes.s,
                  fontWeight: '500',
                  marginBottom: spacing.s
                }}>
                  Claimed Pictures ✨
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
                        recentlyUnlockedPictures.includes(item.id) ?
                          (isDarkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)') :
                          'transparent',
                      borderWidth: selectedLevelPicture?.id === item.id ? 2 : 
                                  recentlyUnlockedPictures.includes(item.id) ? 1 : 0,
                      borderColor: selectedLevelPicture?.id === item.id ? theme.primary :
                                  recentlyUnlockedPictures.includes(item.id) ? '#FF6B6B' : 'transparent',
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
                  <View style={{ position: 'relative' }}>
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
                    
                  </View>
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
                </>
            )}
            
            {/* Unclaimed Pictures (Click to Unlock) */}
            {unclaimedPictures.length > 0 && (
              <>
                <Text style={{
                  color: theme.text,
                  fontSize: fontSizes.s,
                  fontWeight: '500',
                  marginTop: spacing.m,
                  marginBottom: spacing.s
                }}>
                  Click to Unlock! 🎁
                </Text>
                
                <FlatList
                  data={unclaimedPictures}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.levelPictureItem,
                        {
                          margin: spacing.xs,
                          padding: spacing.s,
                          borderRadius: spacing.s,
                          backgroundColor: recentlyUnlockedPictures.includes(item.id) ?
                            (isDarkMode ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)') :
                            (isDarkMode ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 215, 0, 0.05)'),
                          borderWidth: 2,
                          borderColor: recentlyUnlockedPictures.includes(item.id) ? '#FF6B6B' : '#FFD700',
                          borderStyle: 'dashed',
                          alignItems: 'center'
                        }
                      ]}
                      onPress={() => claimPicture(item)}
                      accessibilityLabel={`Unlock ${item.name} profile picture`}
                    >
                      <View style={{ position: 'relative' }}>
                        <LevelAvatar
                          size={60}
                          pictureData={item}
                          selected={false}
                        />
                        
                        {/* Unlock Button Overlay */}
                        <View style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: 'rgba(0, 0, 0, 0.6)',
                          borderRadius: 30,
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <Ionicons name="gift" size={24} color="#FFD700" />
                        </View>
                        
                      </View>
                      <Text style={{
                        fontSize: fontSizes.xs,
                        color: theme.text,
                        marginTop: spacing.xs,
                        textAlign: 'center',
                        fontWeight: '600'
                      }}>
                        {item.name}
                      </Text>
                      <Text style={{
                        fontSize: fontSizes.xs,
                        color: '#FFD700',
                        textAlign: 'center',
                        marginTop: 2,
                        fontWeight: 'bold'
                      }}>
                        TAP TO UNLOCK
                      </Text>
                    </TouchableOpacity>
                  )}
                  numColumns={2}
                  contentContainerStyle={{
                    paddingVertical: spacing.s,
                  }}
                  scrollEnabled={false}
                />
              </>
            )}
            
            {/* Next Level Preview */}
            {nextLevelPreview && (
              <>
                <Text style={{
                  color: theme.textSecondary,
                  fontSize: fontSizes.s,
                  fontWeight: '500',
                  marginTop: spacing.m,
                  marginBottom: spacing.s
                }}>
                  Next Level Preview 🔮
                </Text>
                
                {/* Single picture preview for next level */}
                <View style={{
                  alignItems: 'center',
                  paddingVertical: spacing.m
                }}>
                  <LevelAvatar
                    size={80}
                    pictureData={nextLevelPreview}
                    isLocked={true}
                    requiredLevel={userLevel + 1}
                  />
                  <Text style={{
                    fontSize: fontSizes.s,
                    color: theme.text,
                    marginTop: spacing.s,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    {nextLevelPreview.name}
                  </Text>
                  <Text style={{
                    fontSize: fontSizes.xs,
                    color: theme.textSecondary,
                    textAlign: 'center',
                    marginTop: spacing.xxs
                  }}>
                    {nextLevelPreview.description}
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
                    🏆 Next unlock: Level {userLevel + 1} - {LevelService.getLevelTitle(userLevel + 1)}
                  </Text>
                  <Text style={{
                    color: theme.textSecondary,
                    fontSize: fontSizes.xs,
                    textAlign: 'center',
                    marginTop: 2
                  }}>
                    Level up to unlock this epic profile picture
                  </Text>
                </View>
              </>
            )}
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
        
        {/* Dev Tools for Testing Profile Picture Celebrations */}
        <View style={{
          backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
          borderColor: '#4CAF50',
          marginHorizontal: spacing.m,
          marginTop: spacing.l,
          marginBottom: spacing.xl, // Add bottom margin so it's not cut off
          padding: spacing.m,
          borderRadius: spacing.s,
          borderWidth: 1,
          borderStyle: 'dashed',
        }}>
          <Text style={{
            color: isDarkMode ? '#4CAF50' : '#2E7D32',
            fontSize: fontSizes.xs,
            fontWeight: '600',
            marginBottom: spacing.s
          }}>
            Dev Tools - Profile Picture Celebrations
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              onPress={async () => {
                // Reset all profile picture celebrations
                const allPictures = getAvailableProfilePictures(12); // Get all possible pictures
                for (const picture of allPictures) {
                  await AsyncStorage.removeItem(`profilePicture_${picture.id}_celebrated`);
                }
                console.log('Reset all profile picture celebrations');
                Alert.alert('Success', 'Profile picture celebrations reset! You can now see them again when you claim pictures.');
              }}
              style={{
                backgroundColor: '#FF5722',
                paddingHorizontal: spacing.s,
                paddingVertical: spacing.xs,
                borderRadius: spacing.xs,
                flex: 0.48
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: fontSizes.xs,
                textAlign: 'center',
                fontWeight: '600'
              }}>
                🔄 Reset Celebrations
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                // Test Level 5 PREMIUM profile picture celebration
                const testPicture = {
                  icon: 'diamond',
                  colorScheme: { primary: '#FFD700' },
                  name: 'Premium Test Picture',
                  requiredLevel: 5
                };
                setCelebratedPicture(testPicture);
                setShowProfilePictureCelebration(true);
                createPremiumPictureUnlockCelebration('diamond');
              }}
              style={{
                backgroundColor: '#9C27B0',
                paddingHorizontal: spacing.s,
                paddingVertical: spacing.xs,
                borderRadius: spacing.xs,
                flex: 0.48
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: fontSizes.xs,
                textAlign: 'center',
                fontWeight: '600'
              }}>
                💎 Test Level 5
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      
      {/* Profile Picture Unlock Celebration Modal */}
      <Modal
        visible={showProfilePictureCelebration}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowProfilePictureCelebration(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.m
        }}>
          {/* Profile Picture Unlock Animations */}
          {fallingIconAnimations.map((icon) => {
            if (icon.type === 'premiumBurst') {
              // Level 5: Golden burst rays
              const centerX = width / 2;
              const centerY = height / 2;
              const endX = centerX + Math.cos(icon.angle) * icon.animatedValue._value;
              const endY = centerY + Math.sin(icon.angle) * icon.animatedValue._value;
              
              return (
                <Animated.View
                  key={icon.id}
                  style={{
                    position: 'absolute',
                    left: endX - 16,
                    top: endY - 16,
                    transform: [{ scale: icon.scale }],
                    opacity: icon.opacity,
                    zIndex: 2,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name="flash" 
                    size={32} 
                    color="#FFD700"
                    style={{
                      shadowColor: '#FFD700',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 12,
                      elevation: 12,
                    }}
                  />
                </Animated.View>
              );
            } else if (icon.type === 'premiumDiamond') {
              // Level 5: Premium diamonds
              return (
                <Animated.View
                  key={icon.id}
                  style={{
                    position: 'absolute',
                    left: icon.horizontalPosition - 20,
                    top: 0,
                    transform: [
                      { translateY: icon.animatedValue },
                      { scale: icon.scale },
                      { rotate: icon.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }
                    ],
                    zIndex: 2,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name="diamond" 
                    size={40} 
                    color="#FF6B9D"
                    style={{
                      shadowColor: '#FF6B9D',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 16,
                      elevation: 16,
                    }}
                  />
                </Animated.View>
              );
            } else if (icon.type === 'premiumSparkle') {
              // Level 5: Premium sparkles
              return (
                <Animated.View
                  key={icon.id}
                  style={{
                    position: 'absolute',
                    left: icon.horizontalPosition - 12,
                    top: icon.verticalPosition - 12,
                    transform: [
                      { scale: icon.scale },
                      { rotate: icon.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }
                    ],
                    opacity: icon.opacity,
                    zIndex: 2,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name="star" 
                    size={24} 
                    color="#4ECDC4"
                    style={{
                      shadowColor: '#4ECDC4',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  />
                </Animated.View>
              );
            } else if (icon.type === 'legendFlame' || icon.type === 'legendSpark') {
              // Level 8: Legend fire effects
              return (
                <Animated.View
                  key={icon.id}
                  style={{
                    position: 'absolute',
                    left: icon.horizontalPosition - 16,
                    top: icon.type === 'legendFlame' ? undefined : icon.verticalPosition - 16,
                    bottom: icon.type === 'legendFlame' ? 0 : undefined,
                    transform: icon.type === 'legendFlame' ? [
                      { translateY: icon.animatedValue },
                      { scale: icon.scale }
                    ] : [
                      { translateX: icon.animatedValue },
                      { scale: icon.scale },
                      { rotate: icon.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }
                    ],
                    opacity: icon.opacity,
                    zIndex: 2,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name={icon.iconName} 
                    size={icon.type === 'legendFlame' ? 48 : 28} 
                    color={icon.type === 'legendFlame' ? '#FF6B35' : '#F7931E'}
                    style={{
                      shadowColor: '#FF6B35',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 15,
                      elevation: 15,
                    }}
                  />
                </Animated.View>
              );
            } else if (icon.type === 'immortalLightning' || icon.type === 'immortalOrb' || icon.type === 'immortalSurge') {
              // Level 10: Immortal effects
              let transformStyle = [];
              let positionStyle = {};
              
              if (icon.type === 'immortalLightning') {
                transformStyle = [{ translateY: icon.animatedValue }, { scale: icon.scale }];
                positionStyle = { left: icon.horizontalPosition - 20, top: 0 };
              } else if (icon.type === 'immortalOrb') {
                const orbX = icon.centerX + Math.cos(icon.angle + icon.animatedAngle._value * 6.28) * icon.radius;
                const orbY = icon.centerY + Math.sin(icon.angle + icon.animatedAngle._value * 6.28) * icon.radius;
                transformStyle = [{ scale: icon.scale }];
                positionStyle = { left: orbX - 16, top: orbY - 16 };
              } else {
                transformStyle = [{ scale: icon.scale }, { rotate: icon.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }];
                positionStyle = { left: icon.horizontalPosition - 20, top: icon.verticalPosition - 20 };
              }
              
              return (
                <Animated.View
                  key={icon.id}
                  style={{
                    position: 'absolute',
                    ...positionStyle,
                    transform: transformStyle,
                    opacity: icon.opacity,
                    zIndex: 2,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name={icon.iconName} 
                    size={icon.type === 'immortalSurge' ? 40 : 32} 
                    color={icon.type === 'immortalLightning' ? '#FFE66D' : icon.type === 'immortalOrb' ? '#4ECDC4' : '#FFD93D'}
                    style={{
                      shadowColor: icon.type === 'immortalLightning' ? '#FFE66D' : '#4ECDC4',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 20,
                      elevation: 20,
                    }}
                  />
                </Animated.View>
              );
            } else if (icon.type === 'ascendantPillar' || icon.type === 'ascendantWind' || icon.type === 'ascendantStar') {
              // Level 11: Ascendant effects
              let transformStyle = [];
              let positionStyle = {};
              
              if (icon.type === 'ascendantPillar') {
                transformStyle = [{ translateY: icon.animatedValue }, { scale: icon.scale }];
                positionStyle = { left: icon.horizontalPosition - 16, bottom: 0 };
              } else if (icon.type === 'ascendantWind') {
                const windX = icon.centerX + Math.cos(icon.spiralAngle + icon.animatedSpiral._value * 6.28) * icon.spiralRadius;
                const windY = icon.centerY + Math.sin(icon.spiralAngle + icon.animatedSpiral._value * 6.28) * icon.spiralRadius;
                transformStyle = [{ scale: icon.scale }];
                positionStyle = { left: windX - 16, top: windY - 16 };
              } else {
                transformStyle = [{ translateY: icon.animatedValue }, { scale: icon.scale }, { rotate: icon.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }];
                positionStyle = { left: icon.horizontalPosition - 12, top: 0 };
              }
              
              return (
                <Animated.View
                  key={icon.id}
                  style={{
                    position: 'absolute',
                    ...positionStyle,
                    transform: transformStyle,
                    opacity: icon.opacity,
                    zIndex: 2,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name={icon.iconName} 
                    size={icon.type === 'ascendantPillar' ? 50 : 28} 
                    color={icon.type === 'ascendantPillar' ? '#FF6B9D' : icon.type === 'ascendantWind' ? '#45B7B8' : '#FFD700'}
                    style={{
                      shadowColor: '#FF6B9D',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 18,
                      elevation: 18,
                    }}
                  />
                </Animated.View>
              );
            } else if (icon.type === 'eternalExplosion' || icon.type === 'eternalGalaxy' || icon.type === 'eternalRift' || icon.type === 'eternalEssence') {
              // Level 12: ETERNAL - Ultimate effects
              let transformStyle = [];
              let positionStyle = {};
              let iconSize = 32;
              let iconColor = '#9C27B0';
              
              if (icon.type === 'eternalExplosion') {
                const explodeX = icon.centerX + Math.cos(icon.angle) * icon.animatedDistance._value;
                const explodeY = icon.centerY + Math.sin(icon.angle) * icon.animatedDistance._value;
                transformStyle = [{ scale: icon.scale }];
                positionStyle = { left: explodeX - 24, top: explodeY - 24 };
                iconSize = 48;
                iconColor = '#FFD700';
              } else if (icon.type === 'eternalGalaxy') {
                const galaxyX = icon.centerX + Math.cos(icon.baseAngle + icon.animatedRotation._value * 6.28) * icon.radius;
                const galaxyY = icon.centerY + Math.sin(icon.baseAngle + icon.animatedRotation._value * 6.28) * icon.radius;
                transformStyle = [{ scale: icon.scale }];
                positionStyle = { left: galaxyX - 20, top: galaxyY - 20 };
                iconSize = 40;
                iconColor = '#4ECDC4';
              } else if (icon.type === 'eternalRift') {
                transformStyle = [{ scale: icon.scale }, { rotate: icon.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }];
                positionStyle = { left: icon.horizontalPosition - 30, top: icon.verticalPosition - 30 };
                iconSize = 60;
                iconColor = '#9C27B0';
              } else {
                transformStyle = [{ scale: icon.scale }, { rotate: icon.rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })
                }];
                positionStyle = { left: icon.horizontalPosition - 16, top: icon.verticalPosition - 16 };
                iconSize = 32;
                iconColor = '#FF6B9D';
              }
              
              return (
                <Animated.View
                  key={icon.id}
                  style={{
                    position: 'absolute',
                    ...positionStyle,
                    transform: transformStyle,
                    opacity: icon.opacity,
                    zIndex: 3,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name={icon.iconName} 
                    size={iconSize} 
                    color={iconColor}
                    style={{
                      shadowColor: iconColor,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 25,
                      elevation: 25,
                    }}
                  />
                </Animated.View>
              );
            } else {
              // Regular falling icons for other levels
              return (
                <Animated.View
                  key={icon.id}
                  style={{
                    position: 'absolute',
                    top: 0,
                    zIndex: 1,
                    left: icon.horizontalPosition,
                    transform: [
                      {
                        translateY: icon.animatedValue
                      },
                      {
                        scale: icon.scale
                      },
                      {
                        rotate: icon.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }
                    ]
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name={icon.iconName} 
                    size={32} 
                    color={celebratedPicture?.colorScheme?.primary || theme.primary}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.5,
                      shadowRadius: 6,
                      elevation: 8,
                    }}
                  />
                </Animated.View>
              );
            }
          })}
          
          <View style={{
            backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
            borderColor: theme.border,
            maxWidth: 400,
            width: '90%',
            borderRadius: spacing.l,
            borderWidth: 1,
            padding: spacing.l,
            alignItems: 'center'
          }}>
            {/* Celebration Icon */}
            <View style={{
              backgroundColor: celebratedPicture?.colorScheme?.primary || theme.primary,
              width: 80,
              height: 80,
              borderRadius: 40,
              marginBottom: spacing.m,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Ionicons 
                name={celebratedPicture?.icon || 'person'} 
                size={40} 
                color="#FFFFFF" 
              />
            </View>
            
            <Text style={{
              color: theme.text,
              fontSize: fontSizes.l,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: spacing.xs
            }}>
              🎉 New Profile Picture!
            </Text>
            
            <Text style={{
              color: celebratedPicture?.colorScheme?.primary || theme.primary,
              fontSize: fontSizes.m,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: spacing.m
            }}>
              {celebratedPicture?.name}
            </Text>
            
            <Text style={{
              color: theme.text,
              fontSize: fontSizes.s,
              lineHeight: 20,
              textAlign: 'center',
              marginBottom: spacing.l
            }}>
              {celebratedPicture?.description}
            </Text>
            
            {/* Select This Picture Button */}
            <TouchableOpacity
              style={{
                backgroundColor: celebratedPicture?.colorScheme?.primary || theme.primary,
                paddingVertical: spacing.s,
                paddingHorizontal: spacing.l,
                borderRadius: spacing.s,
                width: '100%',
                marginBottom: spacing.s,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={() => {
                if (celebratedPicture) {
                  setSelectedLevelPicture(celebratedPicture);
                  setProfileImage(null);
                  setSelectedIcon(null);
                }
                setShowProfilePictureCelebration(false);
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: fontSizes.s,
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                Select This Picture! ✨
              </Text>
            </TouchableOpacity>
            
            {/* Continue Later Button */}
            <TouchableOpacity
              style={{
                paddingVertical: spacing.s,
                paddingHorizontal: spacing.l,
                borderRadius: spacing.s,
                width: '100%',
              }}
              onPress={() => setShowProfilePictureCelebration(false)}
            >
              <Text style={{
                color: theme.textSecondary,
                fontSize: fontSizes.s,
                textAlign: 'center'
              }}>
                Continue Later
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Level Milestone Celebration Modal */}
      <Modal
        visible={showLevelCelebration}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLevelCelebration(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.m
        }}>
          {/* Animated Elements Overlay */}
          {levelAnimations.map((animation) => {
            if (animation.type === 'firework') {
              // Fireworks (Level 2)
              return (
                <Animated.View
                  key={animation.id}
                  style={{
                    position: 'absolute',
                    left: animation.x - 30,
                    top: animation.y - 30,
                    width: 60,
                    height: 60,
                    transform: [{ scale: animation.scale }],
                    opacity: animation.opacity,
                  }}
                  pointerEvents="none"
                >
                  <View style={{
                    width: 60,
                    height: 60,
                    backgroundColor: animation.colors[Math.floor(Math.random() * animation.colors.length)],
                    borderRadius: 30,
                    opacity: 0.8
                  }} />
                </Animated.View>
              );
            } else if (animation.type === 'ultimate') {
              // Ultimate celebration (Level 12)
              return (
                <Animated.View
                  key={animation.id}
                  style={{
                    position: 'absolute',
                    transform: [
                      { translateX: animation.animatedX || animation.x },
                      { translateY: animation.animatedY || animation.y },
                      { scale: animation.scale },
                      { rotate: animation.rotation?.interpolate ? animation.rotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg']
                      }) : '0deg' }
                    ],
                    opacity: animation.opacity,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name={animation.icon} 
                    size={24} 
                    color={animation.color}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  />
                </Animated.View>
              );
            } else if (animation.type === 'goldenburst') {
              // Level 5: Golden burst rays from center
              return (
                <Animated.View
                  key={animation.id}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    transform: [
                      { translateX: animation.animatedX },
                      { translateY: animation.animatedY },
                      { scale: animation.scale }
                    ],
                    opacity: animation.opacity,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name="flash" 
                    size={32} 
                    color="#FFD700"
                    style={{
                      shadowColor: '#FFD700',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 8,
                      elevation: 8,
                    }}
                  />
                </Animated.View>
              );
            } else if (animation.type === 'crown') {
              // Level 5: Premium crown pieces
              return (
                <Animated.View
                  key={animation.id}
                  style={{
                    position: 'absolute',
                    left: animation.x - 20,
                    top: animation.y - 20,
                    transform: [
                      { scale: animation.scale },
                      { rotate: animation.rotation.interpolate ? 
                        animation.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        }) : '0deg' 
                      }
                    ],
                    opacity: animation.opacity,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name="diamond" 
                    size={40} 
                    color="#FFD700"
                    style={{
                      shadowColor: '#FFD700',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 1,
                      shadowRadius: 12,
                      elevation: 12,
                    }}
                  />
                </Animated.View>
              );
            } else if (animation.type === 'sparkle') {
              // Level 5: Premium sparkles around badge
              return (
                <Animated.View
                  key={animation.id}
                  style={{
                    position: 'absolute',
                    left: animation.x - 15,
                    top: animation.y - 15,
                    transform: [
                      { scale: animation.scale },
                      { rotate: animation.rotation.interpolate ? 
                        animation.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        }) : '0deg' 
                      }
                    ],
                    opacity: animation.opacity,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name="star" 
                    size={20} 
                    color={animation.color}
                    style={{
                      shadowColor: animation.color,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 6,
                      elevation: 6,
                    }}
                  />
                </Animated.View>
              );
            } else if (animation.type === 'confetti') {
              // Level 5: Premium confetti
              return (
                <Animated.View
                  key={animation.id}
                  style={{
                    position: 'absolute',
                    left: animation.x - 12,
                    top: 0,
                    transform: [
                      { translateY: animation.animatedValue },
                      { scale: animation.scale },
                      { rotate: animation.rotation.interpolate ? 
                        animation.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        }) : '0deg' 
                      }
                    ],
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name="diamond-outline" 
                    size={16} 
                    color={animation.color}
                    style={{
                      shadowColor: animation.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.5,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  />
                </Animated.View>
              );
            } else {
              // All other animations (flames, lightning, etc.)
              return (
                <Animated.View
                  key={animation.id}
                  style={{
                    position: 'absolute',
                    left: animation.x - 12,
                    top: animation.type === 'flame' ? undefined : animation.y - 12,
                    bottom: animation.type === 'flame' ? height - animation.animatedValue._value : undefined,
                    transform: [
                      animation.animatedValue ? { translateY: animation.animatedValue } : {},
                      { scale: animation.scale },
                      animation.rotation ? { rotate: animation.rotation.interpolate ? 
                        animation.rotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        }) : '0deg' 
                      } : {}
                    ].filter(transform => Object.keys(transform).length > 0),
                    opacity: animation.opacity,
                  }}
                  pointerEvents="none"
                >
                  <Ionicons 
                    name={animation.icon} 
                    size={24} 
                    color={animation.color}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 4,
                    }}
                  />
                </Animated.View>
              );
            }
          })}
          
          {/* Celebration Modal Content */}
          <View style={{
            backgroundColor: isDarkMode ? '#121214' : '#F5F5F7',
            borderColor: theme.border,
            maxWidth: 400,
            width: '90%',
            borderRadius: spacing.l,
            borderWidth: 1,
            padding: spacing.l,
            alignItems: 'center'
          }}>
            {/* Level Badge */}
            <View style={{
              backgroundColor: celebratedLevel === 12 ? '#9C27B0' :
                            celebratedLevel === 11 ? '#FFD700' :
                            celebratedLevel === 10 ? '#FF6B35' :
                            celebratedLevel === 8 ? '#FF5722' :
                            celebratedLevel === 5 ? '#4CAF50' :
                            '#2196F3',
              width: 100,
              height: 100,
              borderRadius: 50,
              marginBottom: spacing.m,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontSize: fontSizes.xxl,
                fontWeight: 'bold',
              }}>
                {celebratedLevel}
              </Text>
            </View>
            
            <Text style={{
              color: theme.text,
              fontSize: fontSizes.xl,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: spacing.xs
            }}>
              {celebratedLevel === 12 ? '🌟 ULTIMATE LEVEL!' :
               celebratedLevel === 11 ? '👑 LEGENDARY!' :
               celebratedLevel === 10 ? '⚡ EPIC LEVEL!' :
               celebratedLevel === 8 ? '🔥 LEGEND STATUS!' :
               celebratedLevel === 5 ? '💎 PREMIUM UNLOCKED!' :
               '🎆 Level Up!'}
            </Text>
            
            <Text style={{
              color: theme.primary,
              fontSize: fontSizes.l,
              fontWeight: '600',
              textAlign: 'center',
              marginBottom: spacing.m
            }}>
              Level {celebratedLevel} - {LevelService.getLevelTitle(celebratedLevel)}
            </Text>
            
            <Text style={{
              color: theme.text,
              fontSize: fontSizes.s,
              lineHeight: 20,
              textAlign: 'center',
              marginBottom: spacing.l
            }}>
              {celebratedLevel === 12 ? 'You have achieved the ultimate mastery! You are among the legends of life optimization.' :
               celebratedLevel === 11 ? 'Legendary status achieved! Your dedication to growth is truly inspiring.' :
               celebratedLevel === 10 ? 'Epic milestone reached! You\'ve shown incredible commitment to your goals.' :
               celebratedLevel === 8 ? 'You\'ve reached legend status! Your journey is truly remarkable.' :
               celebratedLevel === 5 ? '🎉 CONGRATULATIONS! 🎉\n\nYou\'ve unlocked LifeCompass Premium! Welcome to the full experience with unlimited AI assistance, advanced features, and priority support. Your journey to mastering life just got supercharged!' :
               'Congratulations on reaching this milestone! Keep up the amazing progress.'}
            </Text>
            
            {/* Continue Button */}
            <TouchableOpacity
              style={{
                backgroundColor: celebratedLevel === 12 ? '#9C27B0' :
                              celebratedLevel === 11 ? '#FFD700' :
                              celebratedLevel === 10 ? '#FF6B35' :
                              celebratedLevel === 8 ? '#FF5722' :
                              celebratedLevel === 5 ? '#4CAF50' :
                              theme.primary,
                paddingVertical: spacing.s,
                paddingHorizontal: spacing.l,
                borderRadius: spacing.s,
                width: '100%',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 4,
              }}
              onPress={() => {
                setShowLevelCelebration(false);
                setLevelAnimations([]);
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: fontSizes.s,
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                {celebratedLevel === 12 ? '✨ AMAZING!' :
                 celebratedLevel === 11 ? '👑 LEGENDARY!' :
                 celebratedLevel === 10 ? '⚡ EPIC!' :
                 celebratedLevel === 8 ? '🔥 INCREDIBLE!' :
                 celebratedLevel === 5 ? '💎 AWESOME!' :
                 '🎉 CONTINUE!'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
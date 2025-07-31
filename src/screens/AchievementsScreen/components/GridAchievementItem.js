// src/screens/AchievementsScreen/components/GridAchievementItem.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
// Calculate a smaller item size - using 80% of the original calculation
const ITEM_SIZE = ((width - 56) / 3) * 0.8; // Reduced by 20%

const GridAchievementItem = ({
  achievement,
  theme,
  isUnlocked,
  onPress,
  onLongPress,
  userSubscriptionStatus = 'free',
  isHighlighted = false
}) => {
  // Get category color or default to primary theme color
  const getCategoryColor = () => {
    const categoryColors = {
      'strategic': '#2563eb', // Blue
      'consistency': '#9333ea', // Purple
      'ai': '#16a34a',        // Green
      'explorer': '#db2777',   // Pink
      'premium': '#f59e0b'     // Amber
    };
    
    return categoryColors[achievement.category] || theme.primary;
  };
  
  // Check if achievement is premium and if user can unlock it
  const isPremium = achievement.premium === true;
  const canUnlockPremium = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  const isPremiumLocked = isPremium && !canUnlockPremium;
  
  // Animation for highlighting
  const highlightAnim = useRef(new Animated.Value(0)).current;
  
  // Animate highlight when isHighlighted changes
  useEffect(() => {
    if (isHighlighted) {
      // Start highlight animation
      Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        })
      ]).start();
    }
  }, [isHighlighted]);
  
  // Interpolate highlight animation to create pulsing effect
  const highlightBackgroundColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isUnlocked 
        ? `${getCategoryColor()}15` 
        : theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      isUnlocked 
        ? `${getCategoryColor()}40` 
        : theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
    ]
  });
  
  const highlightBorderColor = highlightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isPremium ? 'rgba(255,215,0,0.5)' : 'transparent',
      getCategoryColor()
    ]
  });
  
  // Handle press with haptic feedback
  const handlePress = () => {
    if (onPress) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };
  
  // Handle long press with haptic feedback
  const handleLongPress = () => {
    if (onLongPress) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onLongPress(achievement.id);
    }
  };
  
  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: isHighlighted ? highlightBackgroundColor : (
            isUnlocked 
              ? `${getCategoryColor()}15` 
              : theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
          ),
          width: ITEM_SIZE,
          height: ITEM_SIZE,
          borderWidth: isHighlighted ? 2 : (isPremium ? 1 : 0),
          borderColor: isHighlighted ? highlightBorderColor : (
            isPremium ? 'rgba(255,215,0,0.5)' : 'transparent'
          ),
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchableContent}
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={onLongPress}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${achievement.title} achievement, ${isUnlocked ? 'unlocked' : 'locked'}${isPremium ? ', premium only' : ''}${isHighlighted ? ', recently unlocked' : ''}`}
        accessibilityHint="Tap to view achievement details"
      >
      {/* Main Circle Background */}
      <View style={[
        styles.iconBackground,
        { 
          backgroundColor: isUnlocked 
            ? getCategoryColor()
            : 'transparent'
        }
      ]}>
        {/* Icon */}
        <Ionicons 
          name={achievement.icon || 'trophy-outline'} 
          size={Math.round(ITEM_SIZE * 0.5)} 
          color={isUnlocked ? '#FFFFFF' : theme.textSecondary} 
        />
      </View>
      
      {/* Points Badge */}
      <View style={styles.pointsBadge}>
        <Text style={[
          styles.pointsText,
          { 
            color: '#FFFFFF', 
            backgroundColor: isUnlocked ? getCategoryColor() : theme.textSecondary 
          }
        ]}>
          {achievement.points || 1}
        </Text>
      </View>
      
      {/* Lock icon for locked achievements */}
      {!isUnlocked && (
        <View style={styles.lockContainer}>
          <Ionicons 
            name="lock-closed" 
            size={11} 
            color={isPremiumLocked ? '#FFD700' : theme.textSecondary} 
          />
        </View>
      )}
      
      {/* Premium indicator */}
      {isPremium && (
        <View style={[
          styles.premiumIndicator,
          { backgroundColor: isUnlocked ? '#FFD700' : 'rgba(255,215,0,0.3)' }
        ]}>
          <Ionicons name="star" size={9} color={isUnlocked ? '#000000' : '#888888'} />
        </View>
      )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    margin: 4,
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    maxWidth: '33%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  touchableContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconBackground: {
    width: '90%',
    height: '90%',
    borderRadius: 1000, // Large value to ensure circle
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  pointsBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
  pointsText: {
    fontSize: 10,
    fontWeight: 'bold',
    width: 16,
    height: 16,
    borderRadius: 8,
    textAlign: 'center',
    lineHeight: 16,
    overflow: 'hidden',
  },
  lockContainer: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default GridAchievementItem;
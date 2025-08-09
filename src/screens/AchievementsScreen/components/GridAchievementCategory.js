// src/screens/AchievementsScreen/components/GridAchievementCategory.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import GridAchievementItem from './GridAchievementItem';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const GridAchievementCategory = ({
  category,
  achievements,
  theme,
  isAchievementUnlocked,
  getAchievementUnlockDate,
  onAchievementPress,
  onAchievementLongPress,
  isLastCategory = false,
  defaultExpanded = false,
  onToggleExpand, // New prop to handle accordion behavior
  userSubscriptionStatus = 'free',
  highlightAchievement = null // New prop for highlighting specific achievement
}) => {
  // Initialize expansion state
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotateAnim = useRef(new Animated.Value(defaultExpanded ? 0 : 1)).current;
  const fadeAnim = useRef(new Animated.Value(defaultExpanded ? 1 : 0)).current;
  
  // Calculate how many achievements are unlocked in this category
  const unlockedCount = achievements.filter(a => isAchievementUnlocked(a.id)).length;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  
  // Update local expanded state when defaultExpanded prop changes
  useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);
  
  // Animate icon rotation when expanding/collapsing
  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    
    // Animate opacity
    Animated.timing(fadeAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
    
    // Use LayoutAnimation for height changes
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [isExpanded]);
  
  // Toggle expansion with haptic feedback
  const toggleExpanded = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Call the parent's toggle function to handle accordion behavior
    if (onToggleExpand) {
      onToggleExpand();
    }
  };
  
  // Rotation interpolation for the chevron
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });
  
  // Render individual grid item
  const renderGridItem = ({ item }) => (
    <GridAchievementItem
      achievement={item}
      theme={theme}
      isUnlocked={isAchievementUnlocked(item.id)}
      onPress={() => onAchievementPress(item)}
      onLongPress={onAchievementLongPress ? () => onAchievementLongPress(item.id) : undefined}
      userSubscriptionStatus={userSubscriptionStatus}
      isHighlighted={highlightAchievement === item.id}
    />
  );
  
  return (
    <View style={[
      styles.container,
      isLastCategory && styles.lastCategory
    ]}>
      {/* Category Header */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={[
          styles.headerContainer,
          { backgroundColor: `${category.color}15` }
        ]}>
          <View style={styles.headerContent}>
            <View style={[
              styles.categoryIconContainer,
              { backgroundColor: `${category.color}25` }
            ]}>
              <Ionicons name={category.icon} size={20} color={category.color} />
            </View>
            
            <View style={styles.categoryTextContainer}>
              <Text 
                style={[styles.categoryTitle, { color: theme.text }]} 
                numberOfLines={1}
              >
                {category.title}
              </Text>
              
              <View style={styles.progressIndicator}>
                <Text style={[styles.categorySubtitle, { color: theme.textSecondary }]}>
                  {unlockedCount} of {totalCount} unlocked ({progressPercentage}%)
                </Text>
              </View>
            </View>
          </View>
          
          <Animated.View style={[
            styles.chevronContainer,
            { transform: [{ rotate: spin }] }
          ]}>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={category.color} 
            />
          </Animated.View>
        </View>
        
        {/* Category Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBarBackground, 
              { backgroundColor: `${category.color}25` }
            ]}
          >
            <LinearGradient
              colors={[`${category.color}70`, category.color]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                styles.progressBarFill,
                { width: `${progressPercentage}%` }
              ]}
            />
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Achievements Grid */}
      {isExpanded && (
        <Animated.View 
          style={[styles.achievementsContainer, { opacity: 1 }]}
          pointerEvents="box-none"
        >
          {achievements.length > 0 ? (
            <FlatList
              data={achievements}
              renderItem={renderGridItem}
              keyExtractor={item => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
              nestedScrollEnabled={true}
              removeClippedSubviews={false}
            />
          ) : (
            <View style={[
              styles.emptyContainer, 
              { backgroundColor: 'rgba(255,255,255,0.05)' }
            ]}>
              <Ionicons 
                name="trophy-outline" 
                size={22} 
                color={theme.textSecondary} 
                style={styles.emptyIcon} 
              />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No achievements in this category
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
    overflow: 'hidden',
  },
  lastCategory: {
    marginBottom: 0,
  },
  headerButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  progressIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categorySubtitle: {
    fontSize: 14,
  },
  chevronContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    overflow: 'hidden',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  progressBarBackground: {
    height: '100%',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
  },
  achievementsContainer: {
    width: '100%',
    paddingTop: 8,
  },
  gridContainer: {
    width: '100%',
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  gridRow: {
    justifyContent: 'space-evenly',
    width: '100%',
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  emptyIcon: {
    marginRight: 8,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  }
});

export default GridAchievementCategory;
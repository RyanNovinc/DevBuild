// src/screens/AchievementsScreen/index.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
  Dimensions,
  Animated,
  PanResponder
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Import components
import AchievementDetailsModal from './components/AchievementDetailsModal';
import LevelTrophy from './components/LevelTrophy';

// Import achievement data
import { ACHIEVEMENTS, CATEGORIES } from './data/achievementsData';

// Import achievement context
import { useAchievements } from '../../context/AchievementContext';

// Import app context
import { useAppContext } from '../../context/AppContext';

// Import level service
import LevelService from '../../services/LevelService';

// Default theme as fallback - DARK THEME
const DEFAULT_THEME = {
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  primary: '#3B82F6',
  card: '#111111',
  border: '#1F2937',
  statusBar: '#000000',
  dark: true
};

const { width } = Dimensions.get('window');

// Grid Achievement Item Component
const AchievementGridItem = ({ achievement, theme, isUnlocked, onPress, userSubscriptionStatus = 'free' }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const getCategoryColor = () => {
    const categoryColors = {
      'strategic': '#2563eb',
      'consistency': '#9333ea', 
      'ai': '#16a34a',
      'explorer': '#db2777',
      'premium': '#f59e0b'
    };
    return categoryColors[achievement.category] || theme.primary;
  };

  const isPremium = achievement.premium === true;
  const canUnlockPremium = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited' || userSubscriptionStatus === 'founder';
  const isPremiumLocked = isPremium && !canUnlockPremium;

  const ITEM_SIZE = ((width - 56) / 3) * 0.9;

  return (
    <Animated.View 
      style={[
        styles.achievementGridItem,
        { 
          opacity: fadeAnim,
          width: ITEM_SIZE,
          height: ITEM_SIZE,
        }
      ]}
    >
      <TouchableOpacity
        style={[
          styles.achievementGridTouchable,
          { 
            backgroundColor: '#0A0A0A',
            borderColor: (isUnlocked && !isPremiumLocked) ? getCategoryColor() : '#1F1F1F',
            borderWidth: 1,
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[
          styles.achievementGridCircle,
          { 
            backgroundColor: (isUnlocked && !isPremiumLocked) 
              ? getCategoryColor()
              : 'transparent',
            borderColor: (isUnlocked && !isPremiumLocked) 
              ? getCategoryColor()
              : '#2A2A2A',
            borderWidth: (isUnlocked && !isPremiumLocked) ? 0 : 2,
          }
        ]}>
          <Ionicons 
            name={achievement.icon || 'trophy-outline'} 
            size={Math.round(ITEM_SIZE * 0.45)} 
            color={(isUnlocked && !isPremiumLocked) ? '#FFFFFF' : '#6B7280'} 
          />
        </View>
        
        {/* Points Badge */}
        <View style={[
          styles.gridPointsBadge,
          { 
            backgroundColor: (isUnlocked && !isPremiumLocked) 
              ? getCategoryColor() 
              : '#1F1F1F'
          }
        ]}>
          <Text style={styles.gridPointsText}>
            {achievement.points || 1}
          </Text>
        </View>
        
        {/* Lock icon */}
        {(!isUnlocked || isPremiumLocked) && (
          <View style={styles.gridLockContainer}>
            <Ionicons 
              name="lock-closed" 
              size={12} 
              color={isPremiumLocked ? '#F59E0B' : '#6B7280'} 
            />
          </View>
        )}
        
        {/* Premium indicator */}
        {isPremium && (
          <View style={[
            styles.gridPremiumIndicator,
            { backgroundColor: (isUnlocked && !isPremiumLocked) ? '#F59E0B' : '#2A2A2A' }
          ]}>
            <Ionicons name="star" size={10} color={(isUnlocked && !isPremiumLocked) ? '#000000' : '#F59E0B'} />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Minimal Category Section Component
const CategorySection = ({ 
  category, 
  achievements, 
  theme, 
  isAchievementUnlocked, 
  onAchievementPress, 
  isExpanded,
  onToggleExpand,
  userSubscriptionStatus
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();
  }, [isExpanded]);

  const unlockedCount = achievements.filter(a => isAchievementUnlocked(a.id)).length;
  const totalCount = achievements.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) : 0;

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <View style={styles.categorySection}>
      <TouchableOpacity
        style={[
          styles.categoryHeader,
          { backgroundColor: '#0A0A0A' }
        ]}
        onPress={() => onToggleExpand(category.id)}
        activeOpacity={0.7}
      >
        <View style={styles.categoryHeaderLeft}>
          <View style={[
            styles.categoryIcon,
            { backgroundColor: `${category.color}15` }
          ]}>
            <Ionicons name={category.icon} size={20} color={category.color} />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={[styles.categoryTitle, { color: theme.text }]}>
              {category.title}
            </Text>
            <Text style={[styles.categoryProgress, { color: theme.textSecondary }]}>
              {unlockedCount}/{totalCount} completed
            </Text>
          </View>
        </View>
        
        <View style={styles.categoryHeaderRight}>
          <View style={[
            styles.progressCircle,
            { borderColor: '#1F1F1F' }
          ]}>
            <Text style={[styles.progressPercentage, { color: category.color }]}>
              {Math.round(progressPercentage * 100)}%
            </Text>
          </View>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              color={theme.textSecondary} 
            />
          </Animated.View>
        </View>
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.achievementsGrid}>
          <View style={styles.achievementsGridContainer}>
            {achievements.map((achievement, index) => {
              if (index % 3 === 0) {
                const rowItems = achievements.slice(index, index + 3);
                return (
                  <View key={`row-${index}`} style={styles.achievementGridRow}>
                    {rowItems.map((item) => (
                      <AchievementGridItem
                        key={item.id}
                        achievement={item}
                        theme={theme}
                        isUnlocked={isAchievementUnlocked(item.id)}
                        onPress={() => onAchievementPress(item)}
                        userSubscriptionStatus={userSubscriptionStatus}
                      />
                    ))}
                    {/* Fill empty spaces */}
                    {rowItems.length < 3 && Array.from({ length: 3 - rowItems.length }, (_, emptyIndex) => (
                      <View key={`empty-${index}-${emptyIndex}`} style={styles.emptyGridSpace} />
                    ))}
                  </View>
                );
              }
              return null;
            }).filter(Boolean)}
          </View>
        </View>
      )}
    </View>
  );
};

// Main Component
const AchievementsScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  
  // Get theme safely
  let theme = DEFAULT_THEME;
  try {
    const themeContext = require('../../context/ThemeContext');
    if (themeContext && themeContext.useTheme) {
      const { theme: contextTheme } = themeContext.useTheme();
      theme = contextTheme || DEFAULT_THEME;
    }
  } catch (error) {
    console.log('Error accessing theme:', error);
  }

  const isDarkMode = theme.dark;

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [achievementFilter, setAchievementFilter] = useState('all'); // 'all', 'unlocked', 'remaining'
  
  // Swipe animation
  const swipeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  // Get achievement context
  const { 
    isAchievementUnlocked, 
    getTotalPoints
  } = useAchievements();

  // Get user subscription status
  const appContext = useAppContext();
  const userSubscriptionStatus = appContext?.userSubscriptionStatus || 'free';

  // Stats
  const totalPoints = getTotalPoints();
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const unlockedCount = Object.keys(ACHIEVEMENTS).filter(id => isAchievementUnlocked(id)).length;
  
  // Calculate current stage info
  const stageInfo = LevelService.getStageInfo(totalPoints);
  const currentStage = stageInfo.stage;
  const stageTitle = stageInfo.title;
  const pointsForNextStage = stageInfo.scoreForNextStage;
  const completionPercent = Math.round((unlockedCount / totalAchievements) * 100);

  const handleCategoryToggle = (categoryId) => {
    setExpandedCategories(prev => {
      // If this category is already expanded, close it
      if (prev[categoryId]) {
        return {};
      }
      // Otherwise, close all categories and open only this one
      return { [categoryId]: true };
    });
  };

  const handleAchievementPress = (achievement) => {
    setSelectedAchievement(achievement);
    setIsDetailsModalVisible(true);
  };

  const handleStatCardPress = (filterType) => {
    if (filterType === 'unlocked') {
      setAchievementFilter('unlocked');
      setActiveTab('achievements');
      scrollViewRef.current?.scrollTo({ x: width, animated: true });
    } else if (filterType === 'remaining') {
      setAchievementFilter('remaining');
      setActiveTab('achievements');
      scrollViewRef.current?.scrollTo({ x: width, animated: true });
    } else if (filterType === 'complete') {
      setAchievementFilter('all');
      setActiveTab('achievements');
      scrollViewRef.current?.scrollTo({ x: width, animated: true });
    }
  };

  const renderOverviewTab = () => {
    return (
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.overviewContent}
      >
        {/* Clean Stats Section */}
        <View style={styles.statsSection}>
          <View style={[styles.mainStatCard, { backgroundColor: '#0A0A0A' }]}>
            <View style={styles.levelBadge}>
              <LevelTrophy 
                level={currentStage} 
                size={80} 
                animate={false}
              />
            </View>
            <Text style={[styles.stageTitle, { color: theme.text }]}>
              {stageTitle}
            </Text>
            <Text style={[styles.stageSubtitle, { color: theme.textSecondary }]}>
              Stage {currentStage}
            </Text>
            
            <View style={styles.pointsContainer}>
              <Text style={[styles.totalPoints, { color: theme.primary }]}>
                {totalPoints}
              </Text>
              <Text style={[styles.pointsLabel, { color: theme.textSecondary }]}>
                Total Points
              </Text>
            </View>
            
            {pointsForNextStage > 0 && (
              <View style={styles.progressToNext}>
                <View style={[styles.progressBar, { backgroundColor: '#1F1F1F' }]}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        backgroundColor: theme.primary,
                        width: `${Math.min(100, (totalPoints / (totalPoints + pointsForNextStage)) * 100)}%`
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                  {pointsForNextStage} points to next stage
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#0A0A0A' }]}
              onPress={() => handleStatCardPress('unlocked')}
              activeOpacity={0.7}
            >
              <Ionicons name="trophy" size={24} color="#F59E0B" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {unlockedCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Unlocked
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#0A0A0A' }]}
              onPress={() => handleStatCardPress('remaining')}
              activeOpacity={0.7}
            >
              <Ionicons name="lock-open" size={24} color="#6366F1" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {totalAchievements - unlockedCount}
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Remaining
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.statCard, { backgroundColor: '#0A0A0A' }]}
              onPress={() => handleStatCardPress('complete')}
              activeOpacity={0.7}
            >
              <Ionicons name="analytics" size={24} color="#10B981" />
              <Text style={[styles.statValue, { color: theme.text }]}>
                {completionPercent}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Complete
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Upgrade CTA for free users */}
        {userSubscriptionStatus === 'free' && (
          <TouchableOpacity
            style={styles.premiumCTA}
            onPress={() => navigation.navigate('PricingScreen')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F59E0B', '#DC2626']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.premiumCTAGradient}
            >
              <Ionicons name="star" size={24} color="#FFFFFF" />
              <View style={styles.premiumCTAText}>
                <Text style={styles.premiumCTATitle}>
                  Unlock Premium Achievements
                </Text>
                <Text style={styles.premiumCTASubtitle}>
                  Get access to exclusive achievements and rewards
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  const renderAchievementsTab = () => {
    // Filter achievements based on current filter
    const getFilteredAchievements = (categoryAchievements) => {
      switch (achievementFilter) {
        case 'unlocked':
          return categoryAchievements.filter(a => isAchievementUnlocked(a.id));
        case 'remaining':
          return categoryAchievements.filter(a => !isAchievementUnlocked(a.id));
        case 'all':
        default:
          return categoryAchievements;
      }
    };

    // Check if category has any achievements matching the filter
    const hasMatchingAchievements = (categoryAchievements) => {
      const filtered = getFilteredAchievements(categoryAchievements);
      return filtered.length > 0;
    };

    return (
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.achievementsContent}
      >
        {/* Filter indicator */}
        {achievementFilter !== 'all' && (
          <View style={styles.filterIndicator}>
            <Ionicons 
              name={achievementFilter === 'unlocked' ? 'trophy' : 'lock-closed'} 
              size={16} 
              color="#F59E0B" 
            />
            <Text style={styles.filterText}>
              Showing {achievementFilter === 'unlocked' ? 'Unlocked' : 'Remaining'} Achievements
            </Text>
            <TouchableOpacity 
              onPress={() => setAchievementFilter('all')}
              style={styles.filterCloseButton}
            >
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        )}
        
        {CATEGORIES.map((category) => {
          const categoryAchievements = Object.values(ACHIEVEMENTS).filter(
            a => a.category === category.id
          );
          
          // Skip category if no achievements match the filter
          if (!hasMatchingAchievements(categoryAchievements)) {
            return null;
          }
          
          const filteredAchievements = getFilteredAchievements(categoryAchievements);
          
          return (
            <CategorySection
              key={category.id}
              category={category}
              achievements={filteredAchievements}
              theme={theme}
              isAchievementUnlocked={isAchievementUnlocked}
              onAchievementPress={handleAchievementPress}
              isExpanded={expandedCategories[category.id] || false}
              onToggleExpand={handleCategoryToggle}
              userSubscriptionStatus={userSubscriptionStatus}
            />
          );
        })}
        
        {/* Show message when no achievements match filter */}
        {achievementFilter !== 'all' && !CATEGORIES.some(category => {
          const categoryAchievements = Object.values(ACHIEVEMENTS).filter(a => a.category === category.id);
          return hasMatchingAchievements(categoryAchievements);
        }) && (
          <View style={styles.emptyFilterState}>
            <Ionicons 
              name={achievementFilter === 'unlocked' ? 'trophy-outline' : 'lock-closed-outline'} 
              size={48} 
              color={theme.textSecondary} 
            />
            <Text style={[styles.emptyFilterTitle, { color: theme.text }]}>
              No {achievementFilter === 'unlocked' ? 'Unlocked' : 'Remaining'} Achievements
            </Text>
            <Text style={[styles.emptyFilterSubtitle, { color: theme.textSecondary }]}>
              {achievementFilter === 'unlocked' 
                ? 'Start using the app to unlock achievements!' 
                : 'Great job! You\'ve unlocked all available achievements!'}
            </Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={['left', 'right']}
    >
      <StatusBar 
        backgroundColor={theme.statusBar || theme.background} 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
      />
      
      {/* Header with Tabs - PricingScreen Style */}
      <View style={styles.headerTabContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.tabsWrapper}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => {
                setActiveTab('overview');
                scrollViewRef.current?.scrollTo({ x: 0, animated: true });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.tabInner}>
                <Ionicons 
                  name="stats-chart" 
                  size={16} 
                  color={activeTab === 'overview' ? '#F59E0B' : '#9CA3AF'} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'overview' ? '#F59E0B' : '#9CA3AF' }
                ]}>
                  Overview
                </Text>
              </View>
              {activeTab === 'overview' && (
                <View style={styles.tabIndicator} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
              onPress={() => {
                setActiveTab('achievements');
                scrollViewRef.current?.scrollTo({ x: width, animated: true });
              }}
              activeOpacity={0.7}
            >
              <View style={styles.tabInner}>
                <Ionicons 
                  name="trophy" 
                  size={16} 
                  color={activeTab === 'achievements' ? '#F59E0B' : '#9CA3AF'} 
                  style={{ marginRight: 6 }}
                />
                <Text style={[
                  styles.tabText,
                  { color: activeTab === 'achievements' ? '#F59E0B' : '#9CA3AF' }
                ]}>
                  Achievements
                </Text>
              </View>
              {activeTab === 'achievements' && (
                <View style={styles.tabIndicator} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Swipeable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveTab(newIndex === 0 ? 'overview' : 'achievements');
        }}
        style={{ flex: 1 }}
      >
        <View style={{ width, flex: 1 }}>
          {renderOverviewTab()}
        </View>
        <View style={{ width, flex: 1 }}>
          {renderAchievementsTab()}
        </View>
      </ScrollView>
      
      {/* Achievement Details Modal */}
      <AchievementDetailsModal
        visible={isDetailsModalVisible}
        achievement={selectedAchievement}
        isUnlocked={selectedAchievement ? isAchievementUnlocked(selectedAchievement.id) : false}
        theme={theme}
        onClose={() => setIsDetailsModalVisible(false)}
        navigation={navigation}
        userSubscriptionStatus={userSubscriptionStatus}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header and Tab Container - PricingScreen Style
  headerTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F1F',
    zIndex: 999,
    elevation: 5,
  },
  backButton: {
    padding: 8,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    zIndex: 1000,
  },
  headerSpacer: {
    width: 44,
  },
  tabsWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 2,
    width: '90%',
    maxWidth: 300,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'rgba(245,158,11,0.1)',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#F59E0B',
    borderRadius: 1,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  tabContent: {
    flex: 1,
  },
  overviewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  achievementsContent: {
    padding: 16,
    paddingBottom: 32,
  },
  
  // Stats Section
  statsSection: {
    marginBottom: 24,
  },
  mainStatCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  levelBadge: {
    marginBottom: 16,
  },
  stageTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  stageSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalPoints: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  pointsLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  progressToNext: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
  },
  
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Premium CTA
  premiumCTA: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumCTAGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  premiumCTAText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  premiumCTATitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  premiumCTASubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  
  // Category Section
  categorySection: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  categoryProgress: {
    fontSize: 13,
  },
  categoryHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Grid Styles
  achievementsGrid: {
    width: '100%',
    paddingTop: 8,
  },
  achievementsGridContainer: {
    width: '100%',
    paddingVertical: 4,
  },
  achievementGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 12,
  },
  achievementGridItem: {
    borderRadius: 14,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementGridTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  achievementGridCircle: {
    width: '85%',
    height: '85%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPointsBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPointsText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  gridLockContainer: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridPremiumIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyGridSpace: {
    flex: 1,
    maxWidth: '33%',
  },
  // Filter indicator styles
  filterIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1F1F1F',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  filterCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  // Empty filter state styles
  emptyFilterState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyFilterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyFilterSubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AchievementsScreen;
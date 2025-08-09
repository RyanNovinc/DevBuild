// src/screens/AchievementsScreen/index_new.js
import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
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

// Default theme as fallback
const DEFAULT_THEME = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#757575',
  primary: '#3F51B5',
  card: '#F5F5F5',
  border: '#E0E0E0',
  statusBar: '#FFFFFF',
  dark: false
};

// Simple Achievement Item Component
const SimpleAchievementItem = ({ achievement, theme, isUnlocked, onPress }) => {
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

  const handlePress = () => {
    console.log('Achievement pressed:', achievement.title);
    Alert.alert('Achievement Clicked', achievement.title);
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.achievementItem,
        {
          backgroundColor: isUnlocked ? `${getCategoryColor()}15` : theme.card,
          borderColor: isUnlocked ? getCategoryColor() : theme.border,
        }
      ]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.achievementIcon,
        { backgroundColor: isUnlocked ? getCategoryColor() : theme.textSecondary }
      ]}>
        <Ionicons 
          name={achievement.icon || 'trophy-outline'} 
          size={24} 
          color="#FFFFFF" 
        />
      </View>
      
      <View style={styles.achievementContent}>
        <Text style={[styles.achievementTitle, { color: theme.text }]} numberOfLines={1}>
          {achievement.title}
        </Text>
        <Text style={[styles.achievementPoints, { color: theme.textSecondary }]}>
          {achievement.points || 1} pts
        </Text>
      </View>
      
      {!isUnlocked && (
        <View style={styles.lockIcon}>
          <Ionicons name="lock-closed" size={16} color={theme.textSecondary} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// Simple Category Component
const SimpleCategory = ({ category, achievements, theme, isAchievementUnlocked, onAchievementPress }) => {
  const [expanded, setExpanded] = useState(category.id === 'strategic'); // First category expanded

  const unlockedCount = achievements.filter(a => isAchievementUnlocked(a.id)).length;
  const totalCount = achievements.length;

  const handleToggle = () => {
    console.log('Category toggle:', category.title);
    setExpanded(!expanded);
  };

  const handleAchievementPress = (achievement) => {
    console.log('Category achievement press:', achievement.title);
    onAchievementPress(achievement);
  };

  return (
    <View style={[styles.categoryContainer, { backgroundColor: theme.card }]}>
      <TouchableOpacity
        style={styles.categoryHeader}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
          <Ionicons name={category.icon} size={20} color="#FFFFFF" />
        </View>
        
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryTitle, { color: theme.text }]}>
            {category.title}
          </Text>
          <Text style={[styles.categoryStats, { color: theme.textSecondary }]}>
            {unlockedCount}/{totalCount} unlocked
          </Text>
        </View>
        
        <Ionicons 
          name={expanded ? "chevron-up" : "chevron-down"} 
          size={20} 
          color={theme.textSecondary} 
        />
      </TouchableOpacity>
      
      {expanded && (
        <View style={styles.achievementsList}>
          {achievements.map((achievement) => (
            <SimpleAchievementItem
              key={achievement.id}
              achievement={achievement}
              theme={theme}
              isUnlocked={isAchievementUnlocked(achievement.id)}
              onPress={() => handleAchievementPress(achievement)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// Main Component
const AchievementsScreen = ({ navigation, route }) => {
  const { width } = Dimensions.get('window');
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

  const isDarkMode = theme.background === '#000000';

  // Tab state
  const [activeTab, setActiveTab] = useState(0); // 0 = Progress, 1 = Achievements

  // Modal state
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);

  // Get achievement context
  const { 
    isAchievementUnlocked, 
    getTotalPoints
  } = useAchievements();

  // Stats
  const totalPoints = getTotalPoints();
  const totalAchievements = Object.keys(ACHIEVEMENTS).length;
  const unlockedCount = Object.keys(ACHIEVEMENTS).filter(id => isAchievementUnlocked(id)).length;

  const handleTabPress = (index) => {
    console.log('Tab pressed:', index);
    setActiveTab(index);
  };

  const handleAchievementPress = (achievement) => {
    console.log('Achievement modal open:', achievement.title);
    setSelectedAchievement(achievement);
    setIsDetailsModalVisible(true);
  };

  const renderProgressTab = () => {
    return (
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.progressContent}
      >
        <View style={styles.progressContainer}>
          {/* Stats Circle */}
          <View style={[styles.statsCircle, { borderColor: theme.primary }]}>
            <Text style={[styles.pointsText, { color: theme.text }]}>
              {totalPoints}
            </Text>
            <Text style={[styles.pointsLabel, { color: theme.textSecondary }]}>
              Points
            </Text>
          </View>
          
          {/* Level Trophy */}
          <View style={styles.trophyContainer}>
            <LevelTrophy level={1} size={80} animate={false} />
            <Text style={[styles.levelText, { color: theme.text }]}>
              Level 1 - Explorer
            </Text>
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsCards}>
            <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statsValue, { color: theme.text }]}>
                {unlockedCount}
              </Text>
              <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
                Unlocked
              </Text>
            </View>
            
            <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statsValue, { color: theme.text }]}>
                {totalAchievements}
              </Text>
              <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
                Total
              </Text>
            </View>
            
            <View style={[styles.statsCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statsValue, { color: theme.text }]}>
                {Math.round((unlockedCount / totalAchievements) * 100)}%
              </Text>
              <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>
                Complete
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderAchievementsTab = () => {
    return (
      <ScrollView 
        style={styles.tabContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.achievementsContent}
      >
        {CATEGORIES.map((category) => {
          const categoryAchievements = Object.values(ACHIEVEMENTS).filter(
            a => a.category === category.id
          );
          
          return (
            <SimpleCategory
              key={category.id}
              category={category}
              achievements={categoryAchievements}
              theme={theme}
              isAchievementUnlocked={isAchievementUnlocked}
              onAchievementPress={handleAchievementPress}
            />
          );
        })}
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
      
      {/* Header with Back Button and Tabs */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
          <Text style={[styles.backText, { color: theme.text }]}>Back</Text>
        </TouchableOpacity>
        
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 0 && [styles.activeTabButton, { backgroundColor: theme.primary }]
            ]}
            onPress={() => handleTabPress(0)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabButtonText,
              { color: activeTab === 0 ? '#FFFFFF' : theme.textSecondary }
            ]}>
              Progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 1 && [styles.activeTabButton, { backgroundColor: theme.primary }]
            ]}
            onPress={() => handleTabPress(1)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabButtonText,
              { color: activeTab === 1 ? '#FFFFFF' : theme.textSecondary }
            ]}>
              Achievements
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 0 ? renderProgressTab() : renderAchievementsTab()}
      </View>
      
      {/* Achievement Details Modal */}
      <AchievementDetailsModal
        visible={isDetailsModalVisible}
        achievement={selectedAchievement}
        isUnlocked={selectedAchievement ? isAchievementUnlocked(selectedAchievement.id) : false}
        theme={theme}
        onClose={() => setIsDetailsModalVisible(false)}
        navigation={navigation}
        userSubscriptionStatus="free"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  tabButtons: {
    flexDirection: 'row',
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    // backgroundColor set dynamically
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },
  progressContent: {
    padding: 20,
  },
  progressContainer: {
    alignItems: 'center',
  },
  statsCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  pointsText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  pointsLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  trophyContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  levelText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
  },
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  statsCard: {
    flex: 1,
    padding: 20,
    margin: 6,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  achievementsContent: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryStats: {
    fontSize: 14,
    marginTop: 2,
  },
  achievementsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  achievementPoints: {
    fontSize: 12,
    marginTop: 2,
  },
  lockIcon: {
    padding: 4,
  },
});

export default AchievementsScreen;
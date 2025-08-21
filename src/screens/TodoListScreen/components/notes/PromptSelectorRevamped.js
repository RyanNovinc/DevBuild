// src/screens/TodoListScreen/components/notes/PromptSelectorRevamped.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Modal,
  Animated,
  Dimensions,
  Platform,
  Vibration
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  getAllThemes, 
  getRandomPromptSet, 
  DEFAULT_PROMPTS 
} from './PromptLibrary';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  isSmallDevice
} from '../../../../utils/responsive';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Theme descriptions for each focus area
const THEME_BENEFITS = {
  productivity: {
    description: 'Focus on getting things done and making meaningful progress on your goals',
    icon: '⚡',
    gradient: ['#FF9500', '#FF7A00']
  },
  growth: {
    description: 'Reflect on learning, challenges, and personal development opportunities',
    icon: '🌱',
    gradient: ['#34C759', '#30D158']
  },
  relationships: {
    description: 'Strengthen connections with family, friends, and meaningful relationships',
    icon: '❤️',
    gradient: ['#FF3B30', '#FF6B6B']
  },
  wellness: {
    description: 'Check in on your physical and mental health, self-care, and balance',
    icon: '🧘',
    gradient: ['#30D158', '#34C759']
  },
  purpose: {
    description: 'Explore what gives your life meaning and direction',
    icon: '🎯',
    gradient: ['#5856D6', '#5E5CE6']
  },
  career: {
    description: 'Reflect on professional growth, skills, and career advancement',
    icon: '💼',
    gradient: ['#007AFF', '#0051D5']
  },
  creativity: {
    description: 'Nurture your creative side and explore new ideas and projects',
    icon: '🎨',
    gradient: ['#FF9500', '#FF3B30']
  },
  gratitude: {
    description: 'Practice appreciation and recognize the good things in your life',
    icon: '🙏',
    gradient: ['#FF3B30', '#FF9500']
  }
};

/**
 * Revamped Prompt Selector with research-backed benefits and beautiful UI
 */
const PromptSelectorRevamped = ({ 
  visible, 
  setVisible, 
  onPromptSelect, 
  currentPrompts,
  focusMode,
  getTodaysRandomTheme,
  theme, 
  showSuccess 
}) => {
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [activeTab, setActiveTab] = useState('themed'); // 'themed', 'random'
  
  const allThemes = getAllThemes();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (visible) {
      startAnimations();
    }
  }, [visible]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();
  };

  const handleThemeSelect = (themeData) => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Vibration.vibrate(10);
    }
    
    setSelectedTheme(themeData);
    onPromptSelect(themeData);
    showSuccess?.(`Switched to ${themeData.name} prompts! ${THEME_BENEFITS[themeData.key]?.icon || '🎯'}`);
    
    // Don't auto-close anymore - let user see the selection and use back button
  };

  const handleRandomSelect = () => {
    const todaysTheme = getTodaysRandomTheme();
    setSelectedTheme(todaysTheme);
    onPromptSelect(todaysTheme, true); // true = isRandomMode
    showSuccess?.(`Daily Surprise Mode activated! Today: ${todaysTheme.name} 🎲`);
  };



  const renderThemeCard = (themeData, index, isWeekly = false) => {
    const benefits = THEME_BENEFITS[themeData.key];
    const cardDelay = index * 50;
    const isSelected = focusMode?.key === themeData.key;

    return (
      <Animated.View
        key={themeData.key}
        style={{
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 50],
                outputRange: [0, cardDelay]
              })
            },
            { scale: scaleAnim }
          ]
        }}
      >
        <TouchableOpacity
          style={[
            styles.themeCard,
            { backgroundColor: theme.cardElevated },
            isWeekly && styles.weeklyCard,
            isSelected && [styles.selectedCard, { borderColor: '#4CAF50' }]
          ]}
          onPress={() => handleThemeSelect(themeData)}
          activeOpacity={0.7}
        >
          {isWeekly && (
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.weeklyBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.weeklyBadgeText}>This Week</Text>
            </LinearGradient>
          )}
          
          {isSelected && (
            <View style={[styles.selectedBadge, { backgroundColor: '#4CAF50' }]}>
              <Text style={styles.selectedBadgeText}>✓ Active</Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <LinearGradient
              colors={benefits?.gradient || [theme.primary, theme.primary + '80']}
              style={styles.iconContainer}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={themeData.icon} 
                size={scaleFontSize(24)} 
                color="#FFFFFF" 
              />
            </LinearGradient>

            <View style={styles.cardContent}>
              <Text style={[styles.themeName, { color: theme.text }]}>
                {themeData.name}
              </Text>
              <Text style={[styles.themeDescription, { color: theme.textSecondary }]}>
                {benefits?.description || themeData.morning?.[0]?.question.substring(0, 40) + '...'}
              </Text>
            </View>
          </View>


          <View style={[styles.selectButton, { backgroundColor: theme.primary + '10' }]}>
            <Text style={[styles.selectButtonText, { color: theme.text }]}>
              Select Theme
            </Text>
            <Ionicons name="arrow-forward" size={scaleFontSize(16)} color={theme.text} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };


  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setVisible(false)}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Ionicons name="close" size={scaleFontSize(24)} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Choose Your Focus
          </Text>
          <View style={{ width: scaleFontSize(24) }} />
        </View>

        {/* Hero Section */}
        <LinearGradient
          colors={[theme.primary + '20', 'transparent']}
          style={styles.heroSection}
        >
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Personalize Your Reflection
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Each theme is scientifically designed to enhance specific areas of your life
          </Text>
        </LinearGradient>

        {/* Tab Selector */}
        <View style={[styles.tabContainer, { backgroundColor: theme.cardElevated }]}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'themed' && [styles.activeTab, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setActiveTab('themed')}
          >
            <Ionicons 
              name="color-palette" 
              size={scaleFontSize(18)} 
              color={activeTab === 'themed' ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'themed' ? '#FFFFFF' : theme.textSecondary }
            ]}>
              Themes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'random' && [styles.activeTab, { backgroundColor: theme.primary }]
            ]}
            onPress={() => setActiveTab('random')}
          >
            <Ionicons 
              name="shuffle" 
              size={scaleFontSize(18)} 
              color={activeTab === 'random' ? '#FFFFFF' : theme.textSecondary} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === 'random' ? '#FFFFFF' : theme.textSecondary }
            ]}>
              Surprise
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {activeTab === 'themed' && (
            <View style={styles.themesGrid}>
              {allThemes.map((theme, index) => renderThemeCard(theme, index))}
            </View>
          )}

          {activeTab === 'random' && (
            <View style={styles.randomSection}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <LinearGradient
                  colors={focusMode?.isRandomMode ? ['#4CAF50', '#45A049'] : [theme.primary, theme.primary + '80']}
                  style={[styles.randomCard, focusMode?.isRandomMode && styles.activeRandomCard]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {focusMode?.isRandomMode && (
                    <Text style={styles.activeRandomBadge}>✓ ACTIVE</Text>
                  )}
                  <Text style={styles.randomEmoji}>🎲</Text>
                  <Text style={styles.randomTitle}>
                    {focusMode?.isRandomMode ? 'Daily Surprise Active' : 'Activate Daily Surprise'}
                  </Text>
                  <Text style={styles.randomDescription}>
                    {focusMode?.isRandomMode 
                      ? 'You\'ll get a new random theme every day automatically'
                      : 'Get a different theme each day to keep things interesting'
                    }
                  </Text>
                  <TouchableOpacity
                    style={styles.randomButton}
                    onPress={handleRandomSelect}
                  >
                    <Text style={styles.randomButtonText}>
                      {focusMode?.isRandomMode ? 'Daily Surprise On' : 'Activate Daily Surprise'}
                    </Text>
                    <Ionicons name="shuffle" size={scaleFontSize(20)} color={theme.primary} />
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            </View>
          )}

          {/* Bottom padding */}
          <View style={{ height: scaleHeight(100) }} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.m,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: '600',
  },
  heroSection: {
    padding: spacing.l,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: scaleFontSize(14),
    textAlign: 'center',
    lineHeight: scaleFontSize(20),
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.m,
    padding: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.m,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    borderRadius: 10,
    gap: spacing.xs,
  },
  activeTab: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: scaleFontSize(14),
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
  },
  themesGrid: {
    gap: spacing.m,
  },
  themeCard: {
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: spacing.s,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  weeklyCard: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  weeklyBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.m,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  weeklyBadgeText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(11),
    fontWeight: '700',
  },
  selectedCard: {
    borderWidth: 2,
    elevation: 4,
    shadowOpacity: 0.15,
  },
  selectedBadge: {
    position: 'absolute',
    top: -6,
    left: spacing.s,
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  selectedBadgeText: {
    color: '#FFFFFF',
    fontSize: scaleFontSize(11),
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  iconContainer: {
    width: scaleWidth(44),
    height: scaleWidth(44),
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s,
  },
  cardContent: {
    flex: 1,
  },
  themeName: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    marginBottom: 2,
  },
  themeDescription: {
    fontSize: scaleFontSize(13),
  },
  infoButton: {
    width: scaleWidth(32),
    height: scaleWidth(32),
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsPreview: {
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  benefitDot: {
    fontSize: scaleFontSize(12),
    marginRight: spacing.xs,
    color: '#4CAF50',
  },
  benefitText: {
    fontSize: scaleFontSize(13),
    flex: 1,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.s,
    borderRadius: 10,
    marginTop: spacing.s,
  },
  selectButtonText: {
    fontSize: scaleFontSize(15),
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  randomSection: {
    paddingTop: spacing.l,
  },
  randomCard: {
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
  },
  randomEmoji: {
    fontSize: scaleFontSize(48),
    marginBottom: spacing.m,
  },
  randomTitle: {
    fontSize: scaleFontSize(24),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.s,
  },
  randomDescription: {
    fontSize: scaleFontSize(15),
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: spacing.l,
    opacity: 0.9,
  },
  randomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    borderRadius: 25,
    gap: spacing.s,
  },
  randomButtonText: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: '#000000',
  },
  activeRandomCard: {
    elevation: 6,
    shadowOpacity: 0.2,
  },
  activeRandomBadge: {
    position: 'absolute',
    top: spacing.s,
    right: spacing.s,
    color: '#FFFFFF',
    fontSize: scaleFontSize(11),
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.s,
    paddingVertical: 4,
    borderRadius: 8,
  },
  benefitsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  benefitsModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: SCREEN_HEIGHT * 0.6,
    maxHeight: SCREEN_HEIGHT * 0.85,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#C0C0C0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.s,
    marginBottom: spacing.s,
  },
  benefitModalHeader: {
    padding: spacing.l,
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  benefitModalIcon: {
    fontSize: scaleFontSize(40),
    marginBottom: spacing.s,
  },
  benefitModalTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  benefitModalScroll: {
    flex: 1,
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },
  benefitsList: {
    marginBottom: spacing.l,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.s,
  },
  benefitNumber: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  benefitNumberText: {
    fontSize: scaleFontSize(14),
    fontWeight: '700',
  },
  benefitCardText: {
    flex: 1,
    fontSize: scaleFontSize(15),
    lineHeight: scaleFontSize(20),
  },
  researchSection: {
    padding: spacing.m,
    borderRadius: 16,
    marginBottom: spacing.m,
  },
  researchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
    gap: spacing.s,
  },
  researchTitle: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  researchStudy: {
    fontSize: scaleFontSize(16),
    fontWeight: '500',
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  researchAuthor: {
    fontSize: scaleFontSize(14),
    marginBottom: spacing.m,
  },
  keyFindingBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.m,
    borderRadius: 12,
    marginBottom: spacing.m,
    gap: spacing.s,
  },
  keyFinding: {
    flex: 1,
    fontSize: scaleFontSize(14),
    lineHeight: scaleFontSize(20),
  },
  researchLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.m,
    borderRadius: 12,
    gap: spacing.s,
  },
  researchLinkText: {
    fontSize: scaleFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default PromptSelectorRevamped;
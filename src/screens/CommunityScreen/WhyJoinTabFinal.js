// src/screens/CommunityScreen/WhyJoinTabFinal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WhyJoinTabFinal = ({ theme }) => {
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(0);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const domainScrollRef = useRef(null);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const benefits = [
    { 
      id: 1,
      icon: 'rocket',
      title: '3x Faster Progress',
      desc: 'Accountability accelerates your goals',
      color: '#10B981',
      detail: 'Studies show that people with accountability partners are 95% more likely to achieve their goals compared to 43% for those going solo.'
    },
    { 
      id: 2,
      icon: 'people',
      title: 'Find Your Tribe',
      desc: 'Connect with goal-driven people',
      color: '#3B82F6',
      detail: 'Join specialized channels for your specific goals and interests. Find mentors, partners, and friends who understand your journey.'
    },
    { 
      id: 3,
      icon: 'bulb',
      title: 'Proven Strategies',
      desc: 'Learn from successful members',
      color: '#F59E0B',
      detail: 'Access battle-tested strategies, templates, and resources shared by members who have already achieved what you\'re working towards.'
    },
    { 
      id: 4,
      icon: 'shield-checkmark',
      title: '24/7 Support',
      desc: 'Never feel alone in your journey',
      color: '#EC4899',
      detail: 'Get encouragement during tough times, celebrate wins together, and receive constructive feedback whenever you need it.'
    }
  ];

  const domains = [
    {
      id: 0,
      emoji: '💼',
      title: 'Career & Work',
      color: '#3B82F6',
      gradient: ['#3B82F6', '#2563EB'],
      description: 'Level up professionally',
      channels: [
        { name: 'skill-development-learning', desc: 'Master new skills and advance your career' },
        { name: 'leadership-management', desc: 'Develop leadership and management abilities' },
        { name: 'entrepreneurship-side-hustles', desc: 'Start your business or side project' },
      ],
    },
    {
      id: 1,
      emoji: '🏃',
      title: 'Health & Wellness',
      color: '#22C55E',
      gradient: ['#22C55E', '#16A34A'],
      description: 'Transform your wellbeing',
      channels: [
        { name: 'fitness-exercise', desc: 'Build strength and stay active' },
        { name: 'nutrition-wellness', desc: 'Eat better and feel amazing' },
        { name: 'mental-health-stress-management', desc: 'Manage stress and boost mental health' },
      ],
    },
    {
      id: 2,
      emoji: '👥',
      title: 'Relationships',
      color: '#EC4899',
      gradient: ['#EC4899', '#db2777'],
      description: 'Build deeper connections',
      channels: [
        { name: 'family-parenting', desc: 'Strengthen family bonds' },
        { name: 'dating-romance', desc: 'Find love and build relationships' },
        { name: 'friendships-social-life', desc: 'Make friends and expand your circle' },
      ],
    },
    {
      id: 3,
      emoji: '📚',
      title: 'Personal Growth',
      color: '#F97316',
      gradient: ['#F97316', '#EA580C'],
      description: 'Never stop growing',
      channels: [
        { name: 'academic-professional-education', desc: 'Advance your education' },
        { name: 'personal-development', desc: 'Grow as a person' },
        { name: 'creative-skills-hobbies', desc: 'Explore creativity and new talents' },
      ],
    },
    {
      id: 4,
      emoji: '💰',
      title: 'Financial Security',
      color: '#EAB308',
      gradient: ['#EAB308', '#CA8A04'],
      description: 'Master your money',
      channels: [
        { name: 'budgeting-debt-management', desc: 'Take control of your finances' },
        { name: 'investing-wealth-building', desc: 'Grow your wealth through smart investing' },
        { name: 'financial-independence-fire', desc: 'Achieve financial independence' },
      ],
    },
    {
      id: 5,
      emoji: '🚴',
      title: 'Recreation & Leisure',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#7C3AED'],
      description: 'Enjoy life more',
      channels: [
        { name: 'travel-adventure', desc: 'Explore the world and have adventures' },
        { name: 'hobbies-creative-pursuits', desc: 'Pursue hobbies and creative interests' },
        { name: 'entertainment-social-activities', desc: 'Have fun and enjoy social activities' },
      ],
    },
    {
      id: 6,
      emoji: '🧭',
      title: 'Purpose & Meaning',
      color: '#EF4444',
      gradient: ['#EF4444', '#DC2626'],
      description: 'Make a difference',
      channels: [
        { name: 'volunteering-community-service', desc: 'Give back to your community' },
        { name: 'environmental-sustainability', desc: 'Create positive environmental impact' },
        { name: 'spiritual-values-development', desc: 'Explore spirituality and core values' },
      ],
    },
    {
      id: 7,
      emoji: '🏠',
      title: 'Community & Environment',
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0891B2'],
      description: 'Build better spaces',
      channels: [
        { name: 'community-building', desc: 'Connect with your local community' },
        { name: 'home-organization', desc: 'Create organized and peaceful living spaces' },
        { name: 'environmental-impact', desc: 'Make positive environmental changes' },
      ],
    }
  ];

  const handleBenefitPress = (benefitId) => {
    setSelectedBenefit(selectedBenefit === benefitId ? null : benefitId);
  };

  const handleDomainSelect = (index) => {
    setSelectedDomain(index);
    // Scroll to selected domain card
    if (domainScrollRef.current) {
      domainScrollRef.current.scrollTo({
        x: index * (SCREEN_WIDTH * 0.75 + 16),
        animated: true
      });
    }
  };

  const openChannelModal = () => {
    setShowChannelModal(true);
  };

  const renderDomainCard = (domain, index) => {
    const isSelected = selectedDomain === index;
    
    return (
      <TouchableOpacity
        key={domain.id}
        onPress={() => handleDomainSelect(index)}
        activeOpacity={0.9}
        style={[
          styles.domainCard,
          isSelected && styles.domainCardSelected,
          { borderColor: isSelected ? domain.color : 'transparent' }
        ]}
      >
        <LinearGradient
          colors={domain.gradient}
          style={styles.domainGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.domainCardHeader}>
            <Text style={styles.domainEmoji}>{domain.emoji}</Text>
            <View style={styles.domainBadge}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.domainCardTitle}>{domain.title}</Text>
          <Text style={styles.domainCardDesc}>{domain.description}</Text>
          
          <View style={styles.domainStats}>
            <View style={styles.domainStatItem}>
              <Ionicons name="chatbubbles" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.domainStatText}>{domain.channels.length} channels</Text>
            </View>
          </View>

          <View style={styles.domainChannelPreview}>
            <Text style={styles.domainChannelPreviewTitle}>Channels:</Text>
            {domain.channels.slice(0, 3).map((channel, idx) => (
              <Text key={idx} style={styles.domainChannelPreviewItem}>
                #{channel.name}
              </Text>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const currentDomain = domains[selectedDomain];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroIconContainer, { backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)' }]}>
            <Ionicons name="people-circle" size={48} color="#3B82F6" />
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Join a Community That Gets Results
          </Text>
          <Text style={[styles.heroSubtitle, { color: theme.textSecondary }]}>
            Where ambitious people achieve extraordinary goals together
          </Text>
        </View>

        {/* Key Benefits Section - KEEPING THIS AS IS */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Why Our Members Succeed
          </Text>
          
          <View style={styles.benefitsContainer}>
            {benefits.map((benefit) => {
              const isSelected = selectedBenefit === benefit.id;
              return (
                <TouchableOpacity
                  key={benefit.id}
                  style={[
                    styles.benefitItem,
                    { 
                      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: isSelected ? benefit.color : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                    }
                  ]}
                  onPress={() => handleBenefitPress(benefit.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.benefitHeader}>
                    <View style={[styles.benefitIconContainer, { backgroundColor: benefit.color + '20' }]}>
                      <Ionicons name={benefit.icon} size={28} color={benefit.color} />
                    </View>
                    <View style={styles.benefitText}>
                      <Text style={[styles.benefitTitle, { color: theme.text }]}>
                        {benefit.title}
                      </Text>
                      <Text style={[styles.benefitDesc, { color: theme.textSecondary }]}>
                        {benefit.desc}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isSelected ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={theme.textSecondary} 
                    />
                  </View>
                  
                  {isSelected && (
                    <View style={styles.benefitDetail}>
                      <Text style={[styles.benefitDetailText, { color: theme.textSecondary }]}>
                        {benefit.detail}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* NEW Discord Communities Section */}
        <Animated.View 
          style={[
            styles.communitiesSection,
            { transform: [{ translateY: slideAnim }], opacity: fadeAnim }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text, paddingHorizontal: 16 }]}>
            Explore Discord Communities
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary, paddingHorizontal: 16 }]}>
            8 life domains • 24 specialized channels
          </Text>

          {/* Horizontal Scrollable Domain Cards */}
          <ScrollView
            ref={domainScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.domainCardsContainer}
            decelerationRate="fast"
            snapToInterval={SCREEN_WIDTH * 0.75 + 16}
            snapToAlignment="start"
          >
            {domains.map((domain, index) => renderDomainCard(domain, index))}
          </ScrollView>


        </Animated.View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={[styles.ctaButton, { backgroundColor: '#5865F2' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-discord" size={24} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Join Discord Community</Text>
          </TouchableOpacity>
          <Text style={[styles.ctaNote, { color: theme.textSecondary }]}>
            Free for all LifeCompass users
          </Text>
        </View>

      </Animated.View>

      {/* Channel Modal */}
      <Modal
        visible={showChannelModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChannelModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>{currentDomain.emoji}</Text>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {currentDomain.title} Channels
              </Text>
              <TouchableOpacity
                onPress={() => setShowChannelModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalChannelList}>
              {currentDomain.channels.map((channel, idx) => (
                <View key={idx} style={[styles.modalChannelItem, { borderColor: theme.border }]}>
                  <View style={[styles.channelIcon, { backgroundColor: currentDomain.color + '15' }]}>
                    <Text style={[styles.channelHash, { color: currentDomain.color }]}>#</Text>
                  </View>
                  <View style={styles.channelInfo}>
                    <Text style={[styles.channelName, { color: theme.text }]}>
                      {channel.name}
                    </Text>
                    <Text style={[styles.channelDesc, { color: theme.textSecondary }]}>
                      {channel.desc}
                    </Text>
                  </View>
                  <Ionicons 
                    name="arrow-forward" 
                    size={16} 
                    color={currentDomain.color} 
                    style={{ opacity: 0.6 }}
                  />
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.modalJoinButton, { backgroundColor: currentDomain.color }]}
              onPress={() => setShowChannelModal(false)}
            >
              <Text style={styles.modalJoinButtonText}>Join These Channels</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    opacity: 0.8,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  benefitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  benefitDesc: {
    fontSize: 13,
    opacity: 0.8,
  },
  benefitDetail: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  benefitDetailText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // New Communities Section Styles
  communitiesSection: {
    marginBottom: 20,
  },
  domainCardsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  domainCard: {
    width: SCREEN_WIDTH * 0.75,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  domainCardSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  domainGradient: {
    padding: 20,
    minHeight: 200,
  },
  domainCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  domainEmoji: {
    fontSize: 40,
  },
  domainBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  domainBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  domainCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  domainCardDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  domainStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  domainStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  domainStatText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginLeft: 4,
  },
  domainChannelPreview: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  domainChannelPreviewTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  domainChannelPreviewItem: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.95)',
    marginBottom: 3,
  },
  ctaSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  ctaNote: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalChannelList: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  modalChannelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalJoinButton: {
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalJoinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WhyJoinTabFinal;
// src/screens/CommunityScreen/WhyJoinTabSimple.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WhyJoinTabSimple = ({ theme }) => {
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const [expandedDomain, setExpandedDomain] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Simple entrance animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
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
      id: 1,
      emoji: '💼',
      title: 'Career Growth',
      color: '#2563EB',
      channels: [
        '#career-transitions',
        '#skill-development',
        '#leadership-skills',
        '#side-hustles'
      ],
      members: '2.3k active'
    },
    {
      id: 2,
      emoji: '💰',
      title: 'Financial Freedom',
      color: '#10B981',
      channels: [
        '#investing-101',
        '#debt-free-journey',
        '#fire-movement',
        '#passive-income'
      ],
      members: '1.8k active'
    },
    {
      id: 3,
      emoji: '💪',
      title: 'Health & Fitness',
      color: '#EF4444',
      channels: [
        '#workout-accountability',
        '#nutrition-tips',
        '#mental-health',
        '#sleep-optimization'
      ],
      members: '3.1k active'
    },
    {
      id: 4,
      emoji: '❤️',
      title: 'Relationships',
      color: '#EC4899',
      channels: [
        '#dating-advice',
        '#marriage-support',
        '#parenting-tips',
        '#social-skills'
      ],
      members: '1.5k active'
    },
    {
      id: 5,
      emoji: '📚',
      title: 'Learning',
      color: '#8B5CF6',
      channels: [
        '#book-club',
        '#online-courses',
        '#study-groups',
        '#skill-exchange'
      ],
      members: '2.7k active'
    },
    {
      id: 6,
      emoji: '🌍',
      title: 'Impact',
      color: '#0D9488',
      channels: [
        '#volunteering',
        '#sustainability',
        '#social-causes',
        '#community-projects'
      ],
      members: '980 active'
    },
    {
      id: 7,
      emoji: '💻',
      title: 'Digital Life',
      color: '#3B82F6',
      channels: [
        '#productivity-tools',
        '#digital-detox',
        '#ai-automation',
        '#remote-work'
      ],
      members: '2.1k active'
    },
    {
      id: 8,
      emoji: '🎨',
      title: 'Recreation',
      color: '#F59E0B',
      channels: [
        '#travel-buddies',
        '#hobby-groups',
        '#gaming-squad',
        '#creative-projects'
      ],
      members: '1.6k active'
    }
  ];

  const handleBenefitPress = (benefitId) => {
    setSelectedBenefit(selectedBenefit === benefitId ? null : benefitId);
  };

  const handleDomainPress = (domainId) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

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

        {/* Key Benefits Section */}
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

        {/* Community Channels Section */}
        <View style={[styles.section, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Active Discord Communities
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Join specialized channels for every area of life
          </Text>
          
          <View style={styles.domainsGrid}>
            {domains.map((domain) => {
              const isExpanded = expandedDomain === domain.id;
              return (
                <TouchableOpacity
                  key={domain.id}
                  style={[
                    styles.domainCard,
                    {
                      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderColor: isExpanded ? domain.color : theme.border,
                      borderWidth: isExpanded ? 2 : 1,
                    }
                  ]}
                  onPress={() => handleDomainPress(domain.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.domainHeader}>
                    <Text style={styles.domainEmoji}>{domain.emoji}</Text>
                    <View style={styles.domainTitleContainer}>
                      <Text style={[styles.domainTitle, { color: theme.text }]}>
                        {domain.title}
                      </Text>
                      <Text style={[styles.domainMembers, { color: domain.color }]}>
                        {domain.members}
                      </Text>
                    </View>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={domain.color} 
                    />
                  </View>
                  
                  {isExpanded && (
                    <View style={styles.channelsList}>
                      {domain.channels.map((channel, idx) => (
                        <View key={idx} style={styles.channelItem}>
                          <Text style={[styles.channelName, { color: theme.textSecondary }]}>
                            {channel}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Community Stats */}
        <View style={[styles.statsSection, { backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)', borderColor: theme.border }]}>
          <Text style={[styles.statsTitle, { color: theme.text }]}>
            Join Our Growing Community
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>15k+</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Active Members</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>50+</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Channels</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>24/7</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Support</Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity 
            style={[styles.ctaButton, { backgroundColor: '#3B82F6' }]}
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
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
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
  domainsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  domainCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    borderRadius: 12,
    padding: 12,
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  domainEmoji: {
    fontSize: 28,
    marginRight: 10,
  },
  domainTitleContainer: {
    flex: 1,
  },
  domainTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  domainMembers: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  channelsList: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  channelItem: {
    paddingVertical: 4,
  },
  channelName: {
    fontSize: 13,
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  ctaSection: {
    paddingHorizontal: 16,
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
});

export default WhyJoinTabSimple;
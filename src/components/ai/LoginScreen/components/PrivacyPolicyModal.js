import React, { useRef, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

const PrivacyPolicyModal = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;
  const headerScale = useRef(new Animated.Value(1)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  
  // Scroll tracking
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  
  // Section animations
  const sectionAnimations = useRef({
    intro: new Animated.Value(0),
    collection: new Animated.Value(0),
    usage: new Animated.Value(0),
    sharing: new Animated.Value(0),
    security: new Animated.Value(0),
    rights: new Animated.Value(0),
    cookies: new Animated.Value(0),
    children: new Animated.Value(0),
    changes: new Animated.Value(0),
    contact: new Animated.Value(0),
  }).current;

  useEffect(() => {
    if (visible) {
      // Entrance animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Content fade in after modal slides up
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          delay: 100,
          useNativeDriver: true,
        }).start();
        
        // Animate sections in sequence
        animateSections();
      });
    } else {
      // Reset animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reset section animations
      Object.values(sectionAnimations).forEach(anim => {
        anim.setValue(0);
      });
      contentOpacity.setValue(0);
    }
  }, [visible]);
  
  const animateSections = () => {
    const animations = Object.values(sectionAnimations).map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 60,
        useNativeDriver: true,
      })
    );
    
    Animated.stagger(60, animations).start();
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  // Dynamic header opacity based on scroll
  const headerBorderOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Refs for each section
  const sectionRefs = useRef({
    intro: useRef(null),
    collection: useRef(null),
    usage: useRef(null),
    sharing: useRef(null),
    security: useRef(null),
    rights: useRef(null),
    cookies: useRef(null),
    children: useRef(null),
    changes: useRef(null),
    contact: useRef(null),
  }).current;

  const navigateToSection = (sectionId) => {
    // Measure the section position and scroll to it
    if (sectionRefs[sectionId]?.current) {
      sectionRefs[sectionId].current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current?.scrollTo({
            y: y - 20, // Subtract 20 for some padding
            animated: true,
          });
          setActiveSection(sectionId);
        },
        () => console.log('Failed to measure')
      );
    }
  };

  const SectionCard = ({ children, animValue, gradient = false, sectionRef }) => {
    const translateY = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [30, 0],
    });
    
    return (
      <Animated.View 
        ref={sectionRef}
        style={[
          styles.sectionCard,
          {
            opacity: animValue,
            transform: [{ translateY }],
          }
        ]}
      >
        {gradient ? (
          <LinearGradient
            colors={[theme.cardElevated + '40', theme.cardElevated + '10']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            {children}
          </LinearGradient>
        ) : (
          children
        )}
      </Animated.View>
    );
  };

  const TableOfContents = () => (
    <View style={styles.tocContainer}>
      <Text style={[styles.tocTitle, { color: theme.text }]}>Quick Navigation</Text>
      <View style={styles.tocItems}>
        {[
          { id: 'intro', title: 'Introduction', icon: 'information-circle' },
          { id: 'collection', title: 'How Your Data is Stored', icon: 'folder' },
          { id: 'usage', title: 'How We Use Your Information', icon: 'analytics' },
          { id: 'sharing', title: 'Information Sharing', icon: 'share-social' },
          { id: 'security', title: 'Data Security', icon: 'lock-closed' },
          { id: 'rights', title: 'Your Privacy Rights', icon: 'key' },
          { id: 'cookies', title: 'Cookies & Tracking', icon: 'globe' },
          { id: 'children', title: "Children's Privacy", icon: 'people' },
          { id: 'changes', title: 'Changes to This Policy', icon: 'refresh' },
          { id: 'contact', title: 'Contact Us', icon: 'mail' },
        ].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.tocItem,
              activeSection === item.id && styles.tocItemActive
            ]}
            onPress={() => navigateToSection(item.id)}
          >
            <Ionicons 
              name={item.icon} 
              size={18} 
              color={activeSection === item.id ? theme.primary : theme.textSecondary} 
            />
            <Text style={[
              styles.tocItemText, 
              { color: activeSection === item.id ? theme.primary : theme.textSecondary }
            ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const DataTypeCard = ({ icon, title, items, color }) => (
    <View style={[styles.dataTypeCard, { borderLeftColor: color }]}>
      <View style={styles.dataTypeHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={[styles.dataTypeTitle, { color }]}>{title}</Text>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.dataTypeItem}>
          <Ionicons name="checkmark-circle-outline" size={16} color={theme.textSecondary} />
          <Text style={styles.dataTypeText}>{item}</Text>
        </View>
      ))}
    </View>
  );

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
    },
    modalContent: {
      flex: 1,
      backgroundColor: theme.background,
      marginTop: Platform.OS === 'ios' ? 44 : 20,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.background,
      zIndex: 10,
      elevation: 5,
    },
    headerBorder: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 1,
      backgroundColor: theme.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      flex: 1,
      textAlign: 'center',
      letterSpacing: -0.5,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.cardElevated,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    heroSection: {
      padding: 24,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.border + '30',
    },
    heroGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 200,
      opacity: 0.15,
    },
    heroIcon: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#10b98120',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      letterSpacing: -1,
    },
    lastUpdated: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 4,
      fontWeight: '500',
    },
    effectiveBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10b98115',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 12,
    },
    effectiveText: {
      fontSize: 12,
      color: '#10b981',
      fontWeight: '600',
      marginLeft: 4,
    },
    tocContainer: {
      margin: 20,
      padding: 16,
      backgroundColor: theme.cardElevated,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border + '30',
    },
    tocTitle: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      opacity: 0.8,
    },
    tocItems: {
      gap: 2,
    },
    tocItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    tocItemActive: {
      backgroundColor: theme.primary + '15',
    },
    tocItemText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 10,
      flex: 1,
    },
    sectionCard: {
      marginHorizontal: 20,
      marginVertical: 8,
      padding: 20,
      backgroundColor: theme.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border + '20',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    gradientCard: {
      borderRadius: 16,
      padding: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      flex: 1,
      letterSpacing: -0.5,
    },
    sectionNumber: {
      fontSize: 12,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    sectionText: {
      fontSize: 15,
      color: theme.text,
      lineHeight: 24,
      marginBottom: 12,
      opacity: 0.9,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      letterSpacing: -0.3,
    },
    bulletContainer: {
      marginLeft: 8,
      marginTop: 8,
    },
    bulletPoint: {
      flexDirection: 'row',
      marginBottom: 10,
      paddingRight: 8,
    },
    bulletIcon: {
      marginTop: 3,
      marginRight: 10,
    },
    bulletText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
      flex: 1,
      opacity: 0.85,
    },
    infoCard: {
      backgroundColor: '#10b98110',
      borderLeftWidth: 4,
      borderLeftColor: '#10b981',
      padding: 16,
      borderRadius: 12,
      marginVertical: 16,
    },
    infoText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
      fontWeight: '500',
    },
    warningCard: {
      backgroundColor: '#f59e0b15',
      borderLeftWidth: 4,
      borderLeftColor: '#f59e0b',
      padding: 16,
      borderRadius: 12,
      marginVertical: 16,
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    warningTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#f59e0b',
      marginLeft: 8,
      letterSpacing: -0.3,
    },
    warningText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
      marginTop: 4,
    },
    dataTypeCard: {
      backgroundColor: theme.cardElevated + '50',
      borderLeftWidth: 3,
      borderRadius: 12,
      padding: 14,
      marginVertical: 8,
    },
    dataTypeHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    dataTypeTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginLeft: 8,
      letterSpacing: -0.3,
    },
    dataTypeItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginLeft: 28,
      marginBottom: 6,
    },
    dataTypeText: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 20,
      marginLeft: 8,
      flex: 1,
      opacity: 0.8,
    },
    securityFeature: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.cardElevated,
      borderRadius: 12,
      padding: 12,
      marginVertical: 6,
    },
    securityFeatureIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: '#10b98115',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    securityFeatureContent: {
      flex: 1,
    },
    securityFeatureTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    securityFeatureText: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    rightCard: {
      backgroundColor: theme.primary + '10',
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
    },
    rightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    rightIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: '#FFFFFF20',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    rightContent: {
      flex: 1,
    },
    rightTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    rightText: {
      fontSize: 13,
      color: theme.text,
      lineHeight: 20,
      opacity: 0.8,
    },
    emphasis: {
      fontWeight: '700',
      color: theme.primary,
    },
    footer: {
      padding: 24,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.border + '30',
      marginTop: 20,
    },
    footerText: {
      fontSize: 13,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 16,
    },
    acceptButton: {
      backgroundColor: '#10b981',
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 25,
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    acceptButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
        
        <Animated.View 
          style={[
            styles.modalContent,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Sticky Header */}
          <View style={styles.header}>
            <View style={{ width: 36 }} />
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>
            <Animated.View 
              style={[
                styles.headerBorder,
                { opacity: headerBorderOpacity }
              ]} 
            />
          </View>

          <Animated.ScrollView
            ref={scrollViewRef}
            style={[styles.scrollView, { opacity: contentOpacity }]}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {/* Hero Section */}
            <View style={styles.heroSection}>
              <LinearGradient
                colors={['#10b981', '#10b98100']}
                style={styles.heroGradient}
              />
              <View style={styles.heroIcon}>
                <Ionicons name="shield-checkmark" size={36} color="#10b981" />
              </View>
              <Text style={styles.title}>Privacy Policy</Text>
              <Text style={styles.lastUpdated}>Last updated: September 2025</Text>
              <View style={styles.effectiveBadge}>
                <Ionicons name="lock-closed" size={14} color="#10b981" />
                <Text style={styles.effectiveText}>Your data is protected</Text>
              </View>
            </View>

            {/* Table of Contents */}
            <TableOfContents />

            {/* Introduction Section */}
            <SectionCard animValue={sectionAnimations.intro} sectionRef={sectionRefs.intro}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#10b98120' }]}>
                  <Ionicons name="information-circle" size={24} color="#10b981" />
                </View>
                <Text style={styles.sectionTitle}>Introduction</Text>
                <Text style={styles.sectionNumber}>1</Text>
              </View>
              
              <Text style={styles.sectionText}>
                At LifeCompass, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
              </Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy or practices, please contact us.
                </Text>
              </View>
              
              <Text style={styles.sectionText}>
                By using LifeCompass, you agree to the collection and use of information in accordance with this policy.
              </Text>
            </SectionCard>

            {/* Data Collection Section */}
            <SectionCard animValue={sectionAnimations.collection} gradient={true} sectionRef={sectionRefs.collection}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#6366f120' }]}>
                  <Ionicons name="folder" size={24} color="#6366f1" />
                </View>
                <Text style={styles.sectionTitle}>How Your Data is Stored</Text>
                <Text style={styles.sectionNumber}>2</Text>
              </View>
              
              <Text style={styles.sectionText}>
                LifeCompass prioritizes your privacy by storing your personal data locally on your device. We do NOT collect or store your goals, milestones, tasks, notes, AI conversations, time tracking data, or dashboard widgets on our servers.
              </Text>
              
              <DataTypeCard
                icon="cloud-offline"
                title="Account Information (Minimal Server Storage)"
                color="#3b82f6"
                items={[
                  'Email address for authentication only',
                  'Encrypted account credentials',
                  'Subscription status (no payment details)',
                  'Basic profile settings',
                ]}
              />
              
              <DataTypeCard
                icon="phone-portrait"
                title="Your Private Data (Stored Locally ONLY)"
                color="#10b981"
                items={[
                  'All your goals and objectives',
                  'All your milestones and tasks',
                  'All your notes and to-dos',
                  'All your AI conversations and personal knowledge documents',
                  'All your time tracking and dashboard widgets',
                  'All your achievement progress and streaks',
                  'Calendar integration preferences (iOS calendar access is optional)',
                ]}
              />
              
              <DataTypeCard
                icon="analytics"
                title="Anonymous Analytics (Required)"
                color="#f59e0b"
                items={[
                  'General app usage patterns (anonymized via Firebase)',
                  'Feature popularity and usage statistics',
                  'Device type and OS version for compatibility',
                  'Crash reports and performance data (no personal content)',
                  'Geographic region (country-level only, if provided)',
                ]}
              />
              
              <DataTypeCard
                icon="sparkles"
                title="AI Features (When Using AI Assistant)"
                color="#8b5cf6"
                items={[
                  'AI conversation content (processed via OpenAI API)',
                  'Personal knowledge documents uploaded by you',
                  'App context summary (goals, milestones, tasks overview)',
                  'Ad viewing events for free AI credits',
                ]}
              />
              
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="information-circle" size={20} color="#f59e0b" />
                  <Text style={styles.warningTitle}>IMPORTANT NOTE</Text>
                </View>
                <Text style={styles.warningText}>
                  We do NOT collect or store sensitive financial information. All payments are processed securely through Apple's App Store. Purchase receipts are stored locally on your device for pro feature verification.
                </Text>
              </View>
            </SectionCard>

            {/* How We Use Data Section */}
            <SectionCard animValue={sectionAnimations.usage} sectionRef={sectionRefs.usage}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#60a5fa20' }]}>
                  <Ionicons name="analytics" size={24} color="#60a5fa" />
                </View>
                <Text style={styles.sectionTitle}>How We Use Your Information</Text>
                <Text style={styles.sectionNumber}>3</Text>
              </View>
              
              <Text style={styles.sectionText}>
                Since your data is stored locally on your device, we use only minimal server information to:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Provide and maintain app functionality</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Authenticate your account securely</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Enable AI assistant features (processed via OpenAI API, not stored on our servers)</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Process personal knowledge documents for AI context</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Deliver targeted advertisements for free AI credits</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Manage your subscription status</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Improve app performance and features</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Respond to support requests</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Comply with legal obligations</Text>
                </View>
              </View>
              
              <Text style={styles.subsectionTitle}>AI Processing & Personal Knowledge</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  When you use our AI assistant, your messages are processed via OpenAI's API for immediate response generation. We do NOT store your AI conversations on our servers. When you enable "Personal Knowledge" features, the app can share your app context (goals, milestones, tasks summary) and uploaded documents with the AI for personalized assistance. All original data remains stored locally on your device.
                </Text>
              </View>
              
              <Text style={styles.subsectionTitle}>Analytics Collection</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  By using LifeCompass, you consent to the collection of anonymous usage analytics via Firebase. This helps us understand feature popularity, fix bugs, and improve the app experience. No personal content from your goals, milestones, or tasks is included in this data.
                </Text>
              </View>
              
              <Text style={styles.subsectionTitle}>iOS Calendar Integration</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  When you choose to integrate with your iOS calendar, we access your calendar data solely to provide time-blocking features. This integration is entirely optional and can be disabled at any time through your device settings. Calendar data remains on your device and is not transmitted to our servers.
                </Text>
              </View>
            </SectionCard>

            {/* Data Sharing Section */}
            <SectionCard animValue={sectionAnimations.sharing} sectionRef={sectionRefs.sharing}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#f87c7c20' }]}>
                  <Ionicons name="share-social" size={24} color="#f87c7c" />
                </View>
                <Text style={styles.sectionTitle}>Information Sharing</Text>
                <Text style={styles.sectionNumber}>4</Text>
              </View>
              
              <Text style={styles.sectionText}>
                We do not sell, trade, or rent your personal information to third parties. Since most of your data is stored locally on your device, we only share minimal account information in these situations:
              </Text>
              
              <Text style={styles.subsectionTitle}>4.1 Service Providers</Text>
              <Text style={styles.sectionText}>
                We work with trusted third-party services to provide app functionality:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="cloud-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>AWS - Database and authentication services</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="person-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>AWS Cognito - Secure user authentication</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="sparkles-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>OpenAI - AI assistant processing and document analysis</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="analytics-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Firebase - Anonymous usage analytics and crash reporting</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="card-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Apple App Store - In-app purchase processing</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="tv-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Advertisement networks - For optional ad-supported AI credits</Text>
                </View>
              </View>
              
              <Text style={styles.subsectionTitle}>4.2 Legal Requirements</Text>
              <Text style={styles.sectionText}>
                We may disclose your information if required by law or in response to valid legal requests by public authorities.
              </Text>
              
              <Text style={styles.subsectionTitle}>4.3 Business Transfers</Text>
              <Text style={styles.sectionText}>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </Text>
            </SectionCard>

            {/* Data Security Section */}
            <SectionCard animValue={sectionAnimations.security} gradient={true} sectionRef={sectionRefs.security}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#10b98120' }]}>
                  <Ionicons name="lock-closed" size={24} color="#10b981" />
                </View>
                <Text style={styles.sectionTitle}>Data Security</Text>
                <Text style={styles.sectionNumber}>5</Text>
              </View>
              
              <Text style={styles.sectionText}>
                We implement appropriate technical and organizational security measures to protect your personal information:
              </Text>
              
              <View style={styles.securityFeature}>
                <View style={styles.securityFeatureIcon}>
                  <Ionicons name="shield" size={20} color="#10b981" />
                </View>
                <View style={styles.securityFeatureContent}>
                  <Text style={styles.securityFeatureTitle}>Encryption</Text>
                  <Text style={styles.securityFeatureText}>Data encrypted in transit and at rest</Text>
                </View>
              </View>
              
              <View style={styles.securityFeature}>
                <View style={styles.securityFeatureIcon}>
                  <Ionicons name="key" size={20} color="#10b981" />
                </View>
                <View style={styles.securityFeatureContent}>
                  <Text style={styles.securityFeatureTitle}>Secure Authentication</Text>
                  <Text style={styles.securityFeatureText}>Industry-standard authentication protocols</Text>
                </View>
              </View>
              
              <View style={styles.securityFeature}>
                <View style={styles.securityFeatureIcon}>
                  <Ionicons name="server" size={20} color="#10b981" />
                </View>
                <View style={styles.securityFeatureContent}>
                  <Text style={styles.securityFeatureTitle}>Secure Infrastructure</Text>
                  <Text style={styles.securityFeatureText}>Hosted on secure cloud platforms</Text>
                </View>
              </View>
              
              <View style={styles.securityFeature}>
                <View style={styles.securityFeatureIcon}>
                  <Ionicons name="refresh-circle" size={20} color="#10b981" />
                </View>
                <View style={styles.securityFeatureContent}>
                  <Text style={styles.securityFeatureTitle}>Regular Updates</Text>
                  <Text style={styles.securityFeatureText}>Security patches and vulnerability fixes</Text>
                </View>
              </View>
              
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                  <Text style={styles.warningTitle}>SECURITY NOTE</Text>
                </View>
                <Text style={styles.warningText}>
                  While we implement strong security measures, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your data.
                </Text>
              </View>
            </SectionCard>

            {/* Your Rights Section */}
            <SectionCard animValue={sectionAnimations.rights} sectionRef={sectionRefs.rights}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="key" size={24} color={theme.primary} />
                </View>
                <Text style={styles.sectionTitle}>Your Privacy Rights</Text>
                <Text style={styles.sectionNumber}>6</Text>
              </View>
              
              <Text style={styles.sectionText}>
                You have certain rights regarding your personal information. Since most data is stored locally on your device, you have direct control over your information:
              </Text>
              
              <View style={styles.rightCard}>
                <View style={styles.rightItem}>
                  <View style={styles.rightIcon}>
                    <Ionicons name="eye" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.rightContent}>
                    <Text style={styles.rightTitle}>Access Your Data</Text>
                    <Text style={styles.rightText}>Request a copy of your personal information</Text>
                  </View>
                </View>
                
                <View style={styles.rightItem}>
                  <View style={styles.rightIcon}>
                    <Ionicons name="create" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.rightContent}>
                    <Text style={styles.rightTitle}>Update Information</Text>
                    <Text style={styles.rightText}>Correct or update your personal data</Text>
                  </View>
                </View>
                
                <View style={styles.rightItem}>
                  <View style={styles.rightIcon}>
                    <Ionicons name="trash" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.rightContent}>
                    <Text style={styles.rightTitle}>Delete Your Account</Text>
                    <Text style={styles.rightText}>Request deletion of your account and data</Text>
                  </View>
                </View>
                
                <View style={styles.rightItem}>
                  <View style={styles.rightIcon}>
                    <Ionicons name="download" size={18} color={theme.primary} />
                  </View>
                  <View style={styles.rightContent}>
                    <Text style={styles.rightTitle}>Data Portability</Text>
                    <Text style={styles.rightText}>Export your locally stored data through the app's backup features</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.sectionText}>
                Since your data is stored locally, you can access, update, and delete most information directly in the app. For account-related requests or questions about server-stored information, contact us at Ryan.Novinc@gmail.com.
              </Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  <Text style={styles.emphasis}>Special Pricing Information:</Text> The first 1,000 users receive lifetime access through our Founder program with special pricing ($0.99, $2.99, or $4.99). After founder spots are filled, the app transitions to monthly subscription pricing. We reserve the right to offer additional special promotions in the future.
                </Text>
              </View>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  <Text style={styles.emphasis}>Third-Party Communities:</Text> LifeCompass provides optional access to Discord communities. Once you join these communities, you are subject to Discord's privacy policy and terms of service. We are not responsible for data handling or privacy practices within third-party platforms.
                </Text>
              </View>
            </SectionCard>

            {/* Cookies Section */}
            <SectionCard animValue={sectionAnimations.cookies} sectionRef={sectionRefs.cookies}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#f59e0b20' }]}>
                  <Ionicons name="globe" size={24} color="#f59e0b" />
                </View>
                <Text style={styles.sectionTitle}>Cookies & Tracking</Text>
                <Text style={styles.sectionNumber}>7</Text>
              </View>
              
              <Text style={styles.sectionText}>
                LifeCompass uses limited tracking technologies to improve your experience:
              </Text>
              
              <Text style={styles.subsectionTitle}>7.1 Analytics (Required)</Text>
              <Text style={styles.sectionText}>
                We collect anonymous analytics via Firebase to understand app usage patterns, feature popularity, and technical performance. This data is aggregated and does not personally identify you. By using the app, you consent to this collection.
              </Text>
              
              <Text style={styles.subsectionTitle}>7.2 Advertisement Tracking</Text>
              <Text style={styles.sectionText}>
                When you choose to watch advertisements for free AI credits, we track ad completion events to award credits appropriately. No personal information is shared with advertisers.
              </Text>
              
              <Text style={styles.subsectionTitle}>7.3 Local Storage</Text>
              <Text style={styles.sectionText}>
                We store certain preferences and data locally on your device to improve app performance and maintain your settings between sessions.
              </Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  Analytics collection is required for app operation and cannot be disabled individually. You can disable app usage entirely by uninstalling the app. This data helps us maintain service quality and fix critical issues.
                </Text>
              </View>
            </SectionCard>

            {/* Children's Privacy Section */}
            <SectionCard animValue={sectionAnimations.children} sectionRef={sectionRefs.children}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#a78bfa20' }]}>
                  <Ionicons name="people" size={24} color="#a78bfa" />
                </View>
                <Text style={styles.sectionTitle}>Children's Privacy</Text>
                <Text style={styles.sectionNumber}>8</Text>
              </View>
              
              <Text style={styles.sectionText}>
                LifeCompass is not intended for use by children under the age of 13, in compliance with the Children's Online Privacy Protection Act (COPPA). We do not knowingly collect personal information from children under 13.
              </Text>
              
              <Text style={styles.sectionText}>
                COPPA regulations require explicit parental consent before collecting any personal information from children under 13. Since we cannot verify age or obtain proper parental consent within our app structure, we must restrict usage to users 13 and older.
              </Text>
              
              <Text style={styles.sectionText}>
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately at Ryan.Novinc@gmail.com so we can delete such information.
              </Text>
            </SectionCard>

            {/* Changes to Policy Section */}
            <SectionCard animValue={sectionAnimations.changes} sectionRef={sectionRefs.changes}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#6366f120' }]}>
                  <Ionicons name="refresh" size={24} color="#6366f1" />
                </View>
                <Text style={styles.sectionTitle}>Changes to This Policy</Text>
                <Text style={styles.sectionNumber}>9</Text>
              </View>
              
              <Text style={styles.sectionText}>
                We may update our Privacy Policy from time to time. We will notify you of any changes by:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="notifications-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Posting the new Privacy Policy in the app</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="mail-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Sending you an email notification for significant changes</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="calendar-outline" size={18} color="#6366f1" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Updating the "Last updated" date at the top of this policy</Text>
                </View>
              </View>
              
              <Text style={styles.sectionText}>
                Your continued use of LifeCompass after any changes indicates your acceptance of the updated policy.
              </Text>
            </SectionCard>

            {/* Contact Section */}
            <SectionCard animValue={sectionAnimations.contact} gradient={true} sectionRef={sectionRefs.contact}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#10b98120' }]}>
                  <Ionicons name="mail" size={24} color="#10b981" />
                </View>
                <Text style={styles.sectionTitle}>Contact Us</Text>
                <Text style={styles.sectionNumber}>10</Text>
              </View>
              
              <Text style={styles.sectionText}>
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  <Text style={styles.emphasis}>Email:</Text> Ryan.Novinc@gmail.com{'\n'}
                  <Text style={styles.emphasis}>Address:</Text> 13 Musson Close, Florey, ACT, Canberra 2615{'\n'}
                  <Text style={styles.emphasis}>Business:</Text> AppLabs{'\n'}
                  <Text style={styles.emphasis}>ABN:</Text> 45 426 853 055{'\n'}
                  <Text style={styles.emphasis}>Response Time:</Text> Within 48 hours
                </Text>
              </View>
              
              <Text style={styles.sectionText}>
                We take all privacy concerns seriously and will work to address your questions promptly and thoroughly.
              </Text>
            </SectionCard>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Thank you for trusting LifeCompass with your personal information. We are committed to protecting your privacy and providing a secure, valuable service.
              </Text>
              <TouchableOpacity style={styles.acceptButton} onPress={onClose}>
                <Text style={styles.acceptButtonText}>I Understand</Text>
              </TouchableOpacity>
            </View>
          </Animated.ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default PrivacyPolicyModal;
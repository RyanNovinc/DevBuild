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

const TermsOfServiceModal = ({ visible, onClose }) => {
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
    services: new Animated.Value(0),
    financial: new Animated.Value(0),
    ai: new Animated.Value(0),
    accounts: new Animated.Value(0),
    acceptable: new Animated.Value(0),
    liability: new Animated.Value(0),
    general: new Animated.Value(0),
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
        delay: index * 80,
        useNativeDriver: true,
      })
    );
    
    Animated.stagger(80, animations).start();
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
    services: useRef(null),
    financial: useRef(null),
    ai: useRef(null),
    accounts: useRef(null),
    acceptable: useRef(null),
    liability: useRef(null),
    general: useRef(null),
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
          { id: 'services', title: 'Our Services', icon: 'apps' },
          { id: 'financial', title: 'Financial Disclaimer', icon: 'warning' },
          { id: 'ai', title: 'AI Features', icon: 'sparkles' },
          { id: 'accounts', title: 'User Accounts & Data', icon: 'person' },
          { id: 'acceptable', title: 'Acceptable Use', icon: 'checkmark-circle' },
          { id: 'liability', title: 'Limitation of Liability', icon: 'shield' },
          { id: 'general', title: 'General Terms', icon: 'document-text' },
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
      backgroundColor: theme.primary + '20',
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
      backgroundColor: theme.primary + '15',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginTop: 12,
    },
    effectiveText: {
      fontSize: 12,
      color: theme.primary,
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
    warningCard: {
      backgroundColor: '#ff6b6b15',
      borderLeftWidth: 4,
      borderLeftColor: '#ff6b6b',
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
      color: '#ff6b6b',
      marginLeft: 8,
      letterSpacing: -0.3,
    },
    warningText: {
      fontSize: 14,
      color: theme.text,
      lineHeight: 22,
      marginTop: 4,
    },
    infoCard: {
      backgroundColor: theme.primary + '10',
      borderLeftWidth: 4,
      borderLeftColor: theme.primary,
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
      backgroundColor: theme.primary,
      paddingHorizontal: 32,
      paddingVertical: 14,
      borderRadius: 25,
      shadowColor: theme.primary,
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
            <Text style={styles.headerTitle}>Terms of Service</Text>
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
                colors={[theme.primary, theme.primary + '00']}
                style={styles.heroGradient}
              />
              <View style={styles.heroIcon}>
                <Ionicons name="document-text" size={36} color={theme.primary} />
              </View>
              <Text style={styles.title}>Terms of Service</Text>
              <Text style={styles.lastUpdated}>Last updated: September 2025</Text>
              <View style={styles.effectiveBadge}>
                <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                <Text style={styles.effectiveText}>Currently in effect</Text>
              </View>
            </View>

            {/* Table of Contents */}
            <TableOfContents />

            {/* Introduction Section */}
            <SectionCard animValue={sectionAnimations.intro} sectionRef={sectionRefs.intro}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="information-circle" size={24} color={theme.primary} />
                </View>
                <Text style={styles.sectionTitle}>Introduction</Text>
                <Text style={styles.sectionNumber}>1</Text>
              </View>
              
              <Text style={styles.sectionText}>
                Welcome to LifeCompass! These Terms of Service ("Terms") govern your use of our goal-tracking and productivity application.
              </Text>
              
              <Text style={styles.sectionText}>
                By using LifeCompass, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access the service.
              </Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  LifeCompass is designed to help you track goals, manage milestones, and improve productivity through structured planning and AI-assisted features.
                </Text>
              </View>
            </SectionCard>

            {/* Services Section */}
            <SectionCard animValue={sectionAnimations.services} sectionRef={sectionRefs.services}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#60a5fa20' }]}>
                  <Ionicons name="apps" size={24} color="#60a5fa" />
                </View>
                <Text style={styles.sectionTitle}>Our Services</Text>
                <Text style={styles.sectionNumber}>2</Text>
              </View>
              
              <Text style={styles.sectionText}>
                LifeCompass provides the following services:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Goal setting and tracking across eight life domains</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Milestone and task management tools</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Notes and to-do management features</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Customizable dashboard widgets</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>AI-powered assistant for guidance and motivation</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Time blocking with iOS calendar integration</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Achievement and progress tracking systems</Text>
                </View>
              </View>
            </SectionCard>

            {/* Financial Disclaimer Section */}
            <SectionCard animValue={sectionAnimations.financial} gradient={true} sectionRef={sectionRefs.financial}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#ff6b6b20' }]}>
                  <Ionicons name="warning" size={24} color="#ff6b6b" />
                </View>
                <Text style={styles.sectionTitle}>Financial Disclaimer</Text>
                <Text style={styles.sectionNumber}>3</Text>
              </View>
              
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="alert-circle" size={20} color="#ff6b6b" />
                  <Text style={styles.warningTitle}>IMPORTANT NOTICE</Text>
                </View>
                <Text style={styles.warningText}>
                  <Text style={styles.emphasis}>LifeCompass is NOT a financial advisory service.</Text>
                  {'\n\n'}
                  We are a productivity and goal tracking app only.
                </Text>
              </View>
              
              <Text style={styles.subsectionTitle}>3.1 No Financial Advice</Text>
              <Text style={styles.sectionText}>
                LifeCompass does not provide financial, investment, legal, tax, or accounting advice. Any financial information, tools, or features within the App are:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Provided for personal data tracking purposes only</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Based on information you voluntarily enter</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Not recommendations or advice from us</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>General educational information only</Text>
                </View>
              </View>
              
              <Text style={styles.subsectionTitle}>3.2 Your Responsibility</Text>
              <Text style={styles.sectionText}>
                You are solely responsible for:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="alert-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>All financial decisions and actions you take</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="alert-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Verifying any information before making financial decisions</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="alert-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Consulting qualified financial professionals for advice</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="alert-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Understanding the risks associated with any financial activities</Text>
                </View>
              </View>
              
              <Text style={styles.subsectionTitle}>3.3 Professional Consultation Required</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  Before making any financial decisions, you should consult with qualified financial, legal, tax, or accounting professionals who can assess your individual situation and provide personalized advice.
                </Text>
              </View>
            </SectionCard>

            {/* AI Features Section */}
            <SectionCard animValue={sectionAnimations.ai} sectionRef={sectionRefs.ai}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#a78bfa20' }]}>
                  <Ionicons name="sparkles" size={24} color="#a78bfa" />
                </View>
                <Text style={styles.sectionTitle}>AI Features</Text>
                <Text style={styles.sectionNumber}>4</Text>
              </View>
              
              <Text style={styles.subsectionTitle}>4.1 AI Assistant Service</Text>
              <Text style={styles.sectionText}>
                LifeCompass includes an AI assistant powered by OpenAI's API. This feature operates on a token allocation system within time windows, with different tiers of access based on your subscription.
              </Text>
              
              <Text style={styles.subsectionTitle}>4.2 Token Allocation System</Text>
              <Text style={styles.sectionText}>
                AI usage is managed through a time-window token allocation system rather than traditional credits:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="time-outline" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Tokens are allocated within specific time periods</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="refresh-outline" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Allocation windows reset automatically based on your subscription</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="layers-outline" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Different subscription tiers provide different token allowances</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="tv-outline" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Additional tokens available through advertisement viewing</Text>
                </View>
              </View>
              
              <Text style={styles.subsectionTitle}>4.3 AI Limitations and Disclaimers</Text>
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="information-circle" size={20} color="#ff6b6b" />
                  <Text style={styles.warningTitle}>AI DISCLAIMER</Text>
                </View>
                <Text style={styles.warningText}>
                  AI responses are generated by algorithms, not human experts.
                </Text>
              </View>
              
              <Text style={styles.sectionText}>
                AI responses may be:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="information-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Inaccurate or incomplete</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="information-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Based on outdated information</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="information-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Inappropriate for your specific situation</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="information-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Subject to technical errors or bias</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="information-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Not suitable as a substitute for professional advice</Text>
                </View>
              </View>
            </SectionCard>

            {/* User Accounts Section */}
            <SectionCard animValue={sectionAnimations.accounts} sectionRef={sectionRefs.accounts}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#10b98120' }]}>
                  <Ionicons name="person" size={24} color="#10b981" />
                </View>
                <Text style={styles.sectionTitle}>User Accounts & Data</Text>
                <Text style={styles.sectionNumber}>5</Text>
              </View>
              
              <Text style={styles.subsectionTitle}>5.1 Account Creation</Text>
              <Text style={styles.sectionText}>
                You must provide accurate information when creating your account. You are responsible for maintaining the security of your account credentials.
              </Text>
              
              <Text style={styles.subsectionTitle}>5.2 Data Privacy</Text>
              <Text style={styles.sectionText}>
                Your use of LifeCompass is also governed by our Privacy Policy. We respect your privacy and handle your data in accordance with applicable data protection laws.
              </Text>
              
              <Text style={styles.subsectionTitle}>5.3 User Content and Data Storage</Text>
              <Text style={styles.sectionText}>
                You retain full ownership of all content you create in LifeCompass. Your personal data is stored locally on your device, ensuring your privacy and control.
              </Text>
              
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  <Text style={styles.emphasis}>Local Data Storage:</Text> All your goals, milestones, tasks, notes, and personal information are stored locally on your device. We do not store this personal content on our servers.
                  {"\n\n"}
                  <Text style={styles.emphasis}>Server-Stored Data:</Text> We only store essential account information via AWS for AI functionality and subscription management, including login credentials and subscription status.
                </Text>
              </View>
            </SectionCard>

            {/* Acceptable Use Section */}
            <SectionCard animValue={sectionAnimations.acceptable} sectionRef={sectionRefs.acceptable}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#06b6d420' }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#06b6d4" />
                </View>
                <Text style={styles.sectionTitle}>Acceptable Use</Text>
                <Text style={styles.sectionNumber}>6</Text>
              </View>
              
              <Text style={styles.sectionText}>
                You may use LifeCompass for personal goal tracking and productivity management. You may NOT use the service to:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Violate any laws or regulations</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Share harmful or offensive content</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Attempt to hack or disrupt the app</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Share sensitive financial information with AI features</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="close-circle" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Impersonate others or misrepresent yourself</Text>
                </View>
              </View>
            </SectionCard>

            {/* Liability Section */}
            <SectionCard animValue={sectionAnimations.liability} gradient={true} sectionRef={sectionRefs.liability}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#f87c7c20' }]}>
                  <Ionicons name="shield" size={24} color="#f87c7c" />
                </View>
                <Text style={styles.sectionTitle}>Limitation of Liability</Text>
                <Text style={styles.sectionNumber}>7</Text>
              </View>
              
              <View style={styles.warningCard}>
                <View style={styles.warningHeader}>
                  <Ionicons name="shield-checkmark" size={20} color="#ff6b6b" />
                  <Text style={styles.warningTitle}>LIABILITY LIMITATION</Text>
                </View>
                <Text style={styles.warningText}>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW:{'\n\n'}
                  • We are not liable for any indirect, incidental, or consequential damages{'\n'}
                  • Our total liability is limited to the amount you paid for the service in the past 12 months{'\n'}
                  • We are specifically NOT liable for any financial losses resulting from decisions you make
                </Text>
              </View>
              
              <Text style={styles.sectionText}>
                The app is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the service will be uninterrupted, secure, or error-free.
              </Text>
            </SectionCard>

            {/* General Terms Section */}
            <SectionCard animValue={sectionAnimations.general} sectionRef={sectionRefs.general}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#6366f120' }]}>
                  <Ionicons name="document-text" size={24} color="#6366f1" />
                </View>
                <Text style={styles.sectionTitle}>General Terms</Text>
                <Text style={styles.sectionNumber}>8</Text>
              </View>
              
              <Text style={styles.subsectionTitle}>8.1 Changes to Terms</Text>
              <Text style={styles.sectionText}>
                We reserve the right to modify these terms at any time. We will notify you of significant changes through the app or via email.
              </Text>
              
              <Text style={styles.subsectionTitle}>8.2 Lifetime Access Definition</Text>
              <Text style={styles.sectionText}>
                When you purchase lifetime access to LifeCompass, "lifetime" means:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Permanent access to all core app features for as long as the app exists</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="checkmark-circle" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>No recurring fees for the core functionality</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="information-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>AI features require separate subscription and are not included in lifetime access</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="information-circle-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Founder program members receive special AI access terms as specified in their purchase</Text>
                </View>
              </View>
              
              <Text style={styles.subsectionTitle}>8.3 Third-Party Services and Communities</Text>
              <Text style={styles.sectionText}>
                LifeCompass provides access to external services and communities, including Discord servers. Your use of these services is governed by their respective terms of service:
              </Text>
              
              <View style={styles.bulletContainer}>
                <View style={styles.bulletPoint}>
                  <Ionicons name="link-outline" size={18} color="#06b6d4" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Discord communities are subject to Discord's Terms of Service and Community Guidelines</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="shield-outline" size={18} color="#f59e0b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>We are not responsible for content, conduct, or policies within third-party platforms</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="people-outline" size={18} color="#10b981" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Pro users may receive enhanced access to community features</Text>
                </View>
                <View style={styles.bulletPoint}>
                  <Ionicons name="warning-outline" size={18} color="#ff6b6b" style={styles.bulletIcon} />
                  <Text style={styles.bulletText}>Your participation in external communities is at your own risk</Text>
                </View>
              </View>
              
              <Text style={styles.subsectionTitle}>8.4 Termination</Text>
              <Text style={styles.sectionText}>
                We may terminate or suspend your account at any time for violations of these terms. You may also delete your account at any time through the app settings.
              </Text>
              
              <Text style={styles.subsectionTitle}>8.5 Governing Law</Text>
              <Text style={styles.sectionText}>
                These Terms shall be governed by the laws of the jurisdiction in which LifeCompass operates, without regard to conflict of law provisions.
              </Text>
              
              <Text style={styles.subsectionTitle}>8.6 Contact Information</Text>
              <View style={styles.infoCard}>
                <Text style={styles.infoText}>
                  If you have any questions about these Terms, please contact us through the app's support feature or at Ryan.Novinc@gmail.com{'\n\n'}
                  <Text style={styles.emphasis}>Business Details:</Text>{'\n'}
                  AppLabs{'\n'}
                  ABN: 45 426 853 055
                </Text>
              </View>
            </SectionCard>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By using LifeCompass, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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

export default TermsOfServiceModal;
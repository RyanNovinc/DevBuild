// src/screens/CommunityScreen/CommunityTabRevamped.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import founderCodeService from '../../services/founderCodeService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DISCORD_BLUE = "#5865F2";

const CommunityTabRevamped = ({ 
  founderCode, 
  isVerified, 
  isLoading, 
  isAssigning, 
  error, 
  theme, 
  onAssignCode, 
  onCopyCode, 
  onOpenDiscord, 
  isCopied 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const codeScale = useRef(new Animated.Value(1)).current;
  const [showFounderModal, setShowFounderModal] = useState(false);
  const [activeSection, setActiveSection] = useState('benefits'); // 'benefits' or 'features'

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for CTA button if no founder code
    if (!founderCode && !isLoading) {
      const startPulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setTimeout(startPulse, 500);
        });
      };
      startPulse();
    }
  }, [founderCode, isLoading]);

  // Animation when code is copied
  useEffect(() => {
    if (isCopied) {
      Animated.sequence([
        Animated.timing(codeScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(codeScale, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCopied]);

  const handleGetAccess = () => {
    setShowFounderModal(true);
  };

  const confirmGetAccess = () => {
    setShowFounderModal(false);
    onAssignCode();
  };

  const benefits = [
    {
      icon: 'star',
      title: 'Founder Badge',
      description: 'Exclusive recognition in the community',
      color: '#FFD700',
    },
    {
      icon: 'trending-up',
      title: 'Early Access',
      description: 'First to try new features',
      color: '#10B981',
    },
    {
      icon: 'gift',
      title: 'Special Perks',
      description: 'Founder-only benefits and rewards',
      color: '#EC4899',
    },
    {
      icon: 'people',
      title: 'VIP Channels',
      description: 'Access to founder-only Discord channels',
      color: '#3B82F6',
    },
  ];

  const features = [
    {
      icon: 'shield-checkmark',
      title: 'Verified Status',
      description: 'Show your founder status in Discord',
      color: '#8B5CF6',
    },
    {
      icon: 'megaphone',
      title: 'Direct Feedback',
      description: 'Your voice shapes the app',
      color: '#F59E0B',
    },
    {
      icon: 'rocket',
      title: 'Priority Support',
      description: 'Get help faster as a founder',
      color: '#0D9488',
    },
    {
      icon: 'heart',
      title: 'Lifetime Gratitude',
      description: 'Forever remembered as an early supporter',
      color: '#EF4444',
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={DISCORD_BLUE} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Checking your status...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        style={{ 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={['#5865F2', '#4752C4', '#3A45A8']}
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <View style={[styles.heroIconGradient, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                <Ionicons name="people" size={40} color="#FFFFFF" />
              </View>
            </View>
            
            <Text style={styles.heroTitle}>
              {founderCode ? 'Welcome, Founder!' : 'Join Our Founders'}
            </Text>
            
            <Text style={styles.heroSubtitle}>
              {founderCode 
                ? 'You\'re part of an exclusive group shaping LifeCompass'
                : 'Be one of the first 1,000 members to shape our community'
              }
            </Text>

            {/* Progress Indicator */}
            {!founderCode && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={['#10B981', '#34D399']}
                    style={[styles.progressFill, { width: '23%' }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressText}>
                  230 of 1,000 spots claimed
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Main Content */}
        {founderCode ? (
          // Founder Member View
          <>
            {/* Code Card */}
            <View style={[styles.codeSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.codeHeader}>
                <View style={[styles.verifiedBadge, { backgroundColor: '#10B981' }]}>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.verifiedBadgeText}>Verified Founder</Text>
                </View>
              </View>

              <Text style={[styles.codeLabel, { color: theme.textSecondary }]}>
                Your Exclusive Code
              </Text>
              
              <TouchableOpacity
                onPress={onCopyCode}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.codeContainer,
                    { 
                      backgroundColor: theme.isDark ? 'rgba(88, 101, 242, 0.1)' : 'rgba(88, 101, 242, 0.05)',
                      borderColor: DISCORD_BLUE,
                      transform: [{ scale: codeScale }]
                    }
                  ]}
                >
                  <Text style={styles.codeValue}>{founderCode}</Text>
                  <View style={[styles.copyButton, { backgroundColor: DISCORD_BLUE }]}>
                    <Ionicons
                      name={isCopied ? "checkmark" : "copy"}
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
                </Animated.View>
              </TouchableOpacity>

              {isCopied && (
                <Animated.Text 
                  style={[
                    styles.copiedText, 
                    { 
                      color: '#10B981',
                      opacity: fadeAnim 
                    }
                  ]}
                >
                  Copied to clipboard!
                </Animated.Text>
              )}
            </View>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={onOpenDiscord}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: DISCORD_BLUE + '20' }]}>
                  <Ionicons name="logo-discord" size={24} color={DISCORD_BLUE} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: theme.text }]}>
                    Join Discord
                  </Text>
                  <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                    Connect with founders
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                activeOpacity={0.8}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                  <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionTitle, { color: theme.text }]}>
                    Verify Status
                  </Text>
                  <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                    Use !verify in Discord
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Founder Benefits - Enhanced */}
            <View style={[styles.benefitsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.benefitsHeader}>
                <View style={[styles.benefitsHeaderIcon, { backgroundColor: '#FFD700' + '15' }]}>
                  <Ionicons name="diamond" size={24} color="#FFD700" />
                </View>
                <View style={styles.benefitsHeaderText}>
                  <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 4 }]}>
                    Your Founder Benefits
                  </Text>
                  <Text style={[styles.benefitsSubtitle, { color: theme.textSecondary }]}>
                    Exclusive perks for early supporters
                  </Text>
                </View>
              </View>
              
              <View style={styles.benefitsContainer}>
                {benefits.map((benefit, index) => (
                  <View key={index} style={[
                    styles.benefitCard,
                    { 
                      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                      borderColor: theme.border,
                    }
                  ]}>
                    <LinearGradient
                      colors={[benefit.color + '15', benefit.color + '05']}
                      style={styles.benefitGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <View style={styles.benefitCardContent}>
                        <View style={[styles.benefitIconContainer, { backgroundColor: benefit.color + '20' }]}>
                          <Ionicons name={benefit.icon} size={24} color={benefit.color} />
                        </View>
                        <View style={styles.benefitTextContainer}>
                          <Text style={[styles.benefitCardTitle, { color: theme.text }]}>
                            {benefit.title}
                          </Text>
                          <Text style={[styles.benefitCardDesc, { color: theme.textSecondary }]}>
                            {benefit.description}
                          </Text>
                        </View>
                        <View style={[styles.benefitCheck, { backgroundColor: benefit.color }]}>
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </View>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
              
              <View style={[styles.benefitsFooter, { borderTopColor: theme.border }]}>
                <Ionicons name="information-circle" size={16} color="#10B981" />
                <Text style={[styles.benefitsFooterText, { color: theme.textSecondary }]}>
                  All benefits are permanent and exclusive to founders
                </Text>
              </View>
            </View>
          </>
        ) : (
          // Non-Founder View
          <>
            {/* CTA Section */}
            <View style={[styles.ctaSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.ctaContent}>
                <View style={[styles.ctaIcon, { backgroundColor: '#FFD700' + '20' }]}>
                  <Ionicons name="star" size={32} color="#FFD700" />
                </View>
                <Text style={[styles.ctaTitle, { color: theme.text }]}>
                  Become a Founding Member
                </Text>
                <Text style={[styles.ctaDesc, { color: theme.textSecondary }]}>
                  Join the exclusive group of early supporters who are shaping the future of LifeCompass
                </Text>
                
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={styles.ctaButton}
                    onPress={handleGetAccess}
                    activeOpacity={0.8}
                    disabled={isAssigning}
                  >
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.ctaButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isAssigning ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <Ionicons name="unlock" size={20} color="#FFFFFF" />
                          <Text style={styles.ctaButtonText}>Get Founder Access</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>

                {error && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </View>
            </View>

            {/* Benefits/Features Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  activeSection === 'benefits' && styles.toggleButtonActive,
                  { borderColor: activeSection === 'benefits' ? '#10B981' : theme.border }
                ]}
                onPress={() => setActiveSection('benefits')}
              >
                <Text style={[
                  styles.toggleButtonText,
                  { color: activeSection === 'benefits' ? '#10B981' : theme.textSecondary }
                ]}>
                  Benefits
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  activeSection === 'features' && styles.toggleButtonActive,
                  { borderColor: activeSection === 'features' ? '#10B981' : theme.border }
                ]}
                onPress={() => setActiveSection('features')}
              >
                <Text style={[
                  styles.toggleButtonText,
                  { color: activeSection === 'features' ? '#10B981' : theme.textSecondary }
                ]}>
                  Features
                </Text>
              </TouchableOpacity>
            </View>

            {/* Benefits/Features Grid */}
            <View style={[styles.gridSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.gridContainer}>
                {(activeSection === 'benefits' ? benefits : features).map((item, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.gridItem,
                      {
                        backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderColor: theme.border,
                        opacity: fadeAnim,
                        transform: [{
                          translateY: slideAnim.interpolate({
                            inputRange: [0, 30],
                            outputRange: [0, index * 5],
                          })
                        }]
                      }
                    ]}
                  >
                    <View style={[styles.gridItemIcon, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon} size={24} color={item.color} />
                    </View>
                    <Text style={[styles.gridItemTitle, { color: theme.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.gridItemDesc, { color: theme.textSecondary }]}>
                      {item.description}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Bottom Info */}
            <View style={styles.bottomInfo}>
              <Ionicons name="information-circle" size={16} color={theme.textSecondary} />
              <Text style={[styles.bottomInfoText, { color: theme.textSecondary }]}>
                Limited to first 1,000 members • Free forever
              </Text>
            </View>
          </>
        )}
      </Animated.View>

      {/* Founder Access Modal */}
      <Modal
        visible={showFounderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFounderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.modalGradient}
            >
              <Ionicons name="star" size={48} color="#FFFFFF" />
            </LinearGradient>
            
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Welcome to the Founders Club!
            </Text>
            
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              You're about to join an exclusive group of early supporters. Your founder status will be permanent and comes with special perks.
            </Text>
            
            <View style={styles.modalFeatures}>
              <View style={styles.modalFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={[styles.modalFeatureText, { color: theme.text }]}>
                  Permanent founder badge
                </Text>
              </View>
              <View style={styles.modalFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={[styles.modalFeatureText, { color: theme.text }]}>
                  Access to VIP channels
                </Text>
              </View>
              <View style={styles.modalFeatureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={[styles.modalFeatureText, { color: theme.text }]}>
                  Early access to features
                </Text>
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel, { borderColor: theme.border }]}
                onPress={() => setShowFounderModal(false)}
              >
                <Text style={[styles.modalButtonCancelText, { color: theme.textSecondary }]}>
                  Maybe Later
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmGetAccess}
              >
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.modalButtonGradient}
                >
                  <Text style={styles.modalButtonConfirmText}>
                    Join Founders
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  // Hero Section
  heroGradient: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: '#5865F2', // Fallback color
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    marginBottom: 16,
  },
  heroIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  progressContainer: {
    width: '100%',
    maxWidth: 300,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  // Code Section
  codeSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  codeLabel: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: DISCORD_BLUE,
    letterSpacing: 2,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copiedText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  // Quick Actions
  quickActions: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
  },
  // Benefits Section - Enhanced
  benefitsSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  benefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  benefitsHeaderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitsHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  benefitsSubtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  benefitsContainer: {
    gap: 12,
  },
  benefitCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  benefitGradient: {
    padding: 16,
  },
  benefitCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  benefitCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.8,
  },
  benefitCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  benefitsFooterText: {
    fontSize: 12,
    flex: 1,
  },
  // CTA Section
  ctaSection: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 280,
  },
  ctaButtonGradient: {
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
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  // Toggle Section
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Grid Section
  gridSection: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 64) / 2,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  gridItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  gridItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  gridItemDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  // Bottom Info
  bottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 6,
  },
  bottomInfoText: {
    fontSize: 12,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalFeatures: {
    width: '100%',
    marginBottom: 24,
  },
  modalFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  modalFeatureText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
  },
  modalButtonCancel: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CommunityTabRevamped;
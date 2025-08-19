// src/components/ReferralSummaryPopup.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import * as FeatureExplorerTracker from '../services/FeatureExplorerTracker';
import ReferralService from '../screens/Referral/ReferralService';

// Import responsive utilities
import responsive from '../utils/responsive';

const {
  spacing,
  fontSizes,
  scaleWidth,
  scaleHeight,
  scaleFontSize
} = responsive;

const { width, height } = Dimensions.get('window');

const ReferralSummaryPopup = ({ visible, onClose, onNavigateToReferrals }) => {
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(height));
  const [referralStats, setReferralStats] = useState(null);
  const [streakData, setStreakData] = useState({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);

  // Load data when modal becomes visible
  useEffect(() => {
    if (visible) {
      loadData();
      animateIn();
    } else {
      animateOut();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('[ReferralPopup] Loading data...');
      
      // Load referral stats
      const stats = await ReferralService.getReferralStats();
      console.log('[ReferralPopup] Loaded stats:', stats);
      setReferralStats(stats);
      
      // Load streak data
      const currentStreak = await FeatureExplorerTracker.getCurrentStreak();
      const longestStreak = await FeatureExplorerTracker.getHighestStreak();
      console.log('[ReferralPopup] Loaded streaks:', { currentStreak, longestStreak });
      
      setStreakData({
        currentStreak,
        longestStreak
      });
    } catch (error) {
      console.error('Error loading referral summary data:', error);
    } finally {
      setLoading(false);
      console.log('[ReferralPopup] Data loading complete');
    }
  };

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(height);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      })
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleClose = () => {
    animateOut();
    setTimeout(onClose, 250);
  };

  const handleSendReferral = () => {
    handleClose();
    setTimeout(() => {
      onNavigateToReferrals();
    }, 300);
  };

  // Calculate total referral limit based on streak achievements
  const getTotalReferralLimit = () => {
    const currentStreak = streakData.currentStreak;
    let limit = 3; // Base limit
    
    if (currentStreak >= 90) limit += 1; // 90-day achievement adds 1
    if (currentStreak >= 180) limit += 1; // 180-day achievement adds 1
    
    return limit; // Max of 5 total
  };

  // Calculate referrals remaining vs total limit
  const getReferralsRemaining = () => {
    if (!referralStats) return getTotalReferralLimit();
    const total = getTotalReferralLimit();
    const used = referralStats.converted || 0;
    return Math.max(0, total - used);
  };

  // Get referral progress in X/Y format
  const getReferralProgress = () => {
    const total = getTotalReferralLimit();
    const used = referralStats?.converted || 0;
    const remaining = Math.max(0, total - used);
    return { remaining, total };
  };

  // Calculate days until next referral unlock
  const getDaysUntilNextUnlock = () => {
    const currentStreak = streakData.currentStreak;
    if (currentStreak < 90) {
      return 90 - currentStreak;
    } else if (currentStreak < 180) {
      return 180 - currentStreak;
    }
    return 0; // All referrals unlocked
  };

  // Get next referral unlock info
  const getNextReferralInfo = () => {
    const currentStreak = streakData.currentStreak;
    if (currentStreak < 90) {
      return { referralNumber: 4, daysNeeded: 90 };
    } else if (currentStreak < 180) {
      return { referralNumber: 5, daysNeeded: 180 };
    }
    return null; // All unlocked
  };

  // Get streak emoji
  const getStreakEmoji = (days) => {
    if (days >= 365) return '👑';
    if (days >= 180) return '🏆';
    if (days >= 90) return '⭐';
    if (days >= 30) return '⚡';
    if (days >= 7) return '🚀';
    return '🔥';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View 
          style={[
            styles.backdrop,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouchable}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
              backgroundColor: theme.surface || theme.background || (theme.isDark ? '#1C1C1E' : '#FFFFFF'),
              borderColor: theme.border || (theme.isDark ? '#3C3C3E' : 'transparent'),
              borderWidth: 0
            }
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="people" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.title, { color: theme.text }]}>
              Referral Status
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading your referral data...
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Referrals Remaining */}
              <View style={[styles.card, { backgroundColor: theme.background || (theme.isDark ? '#2C2C2E' : '#F2F2F7'), borderColor: theme.border || (theme.isDark ? '#3C3C3E' : '#E5E5EA') }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="gift" size={20} color={theme.primary} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Referrals Available
                  </Text>
                </View>
                <View style={styles.referralCount}>
                  <Text style={[styles.referralNumber, { color: theme.primary }]}>
                    {getReferralProgress().remaining}
                  </Text>
                  <Text style={[styles.referralTotal, { color: theme.textSecondary }]}>
                    / {getReferralProgress().total} total
                  </Text>
                </View>
                <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                  When someone uses your referral code to purchase the app, you both get 1 month AI Light!
                </Text>
              </View>

              {/* Current Streak */}
              <View style={[styles.card, { backgroundColor: theme.background || (theme.isDark ? '#2C2C2E' : '#F2F2F7'), borderColor: theme.border || (theme.isDark ? '#3C3C3E' : '#E5E5EA') }]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.streakEmoji}>
                    {getStreakEmoji(streakData.currentStreak)}
                  </Text>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    Daily Streak
                  </Text>
                </View>
                <View style={styles.streakInfo}>
                  <Text style={[styles.streakDays, { color: theme.text }]}>
                    {streakData.currentStreak} days
                  </Text>
                  {getDaysUntilNextUnlock() > 0 && (
                    <Text style={[styles.streakProgress, { color: theme.textSecondary }]}>
                      {getDaysUntilNextUnlock()} days until referral {getNextReferralInfo()?.referralNumber} unlocks
                    </Text>
                  )}
                </View>
              </View>

              {/* Referral Stats */}
              {referralStats && (
                <View style={[styles.card, { backgroundColor: theme.background || (theme.isDark ? '#2C2C2E' : '#F2F2F7'), borderColor: theme.border || (theme.isDark ? '#3C3C3E' : '#E5E5EA') }]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="bar-chart" size={20} color={theme.primary} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      Your Impact
                    </Text>
                  </View>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, { color: theme.text }]}>
                        {referralStats.sent}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                        Sent
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, { color: theme.primary }]}>
                        {referralStats.converted}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                        Successful
                      </Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={[styles.statNumber, { color: theme.text }]}>
                        {referralStats.plansEarned * 500}
                      </Text>
                      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                        Credits Earned
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* How Referrals Work */}
              <View style={[styles.card, { backgroundColor: theme.background || (theme.isDark ? '#2C2C2E' : '#F2F2F7'), borderColor: theme.border || (theme.isDark ? '#3C3C3E' : '#E5E5EA') }]}>
                <View style={styles.cardHeader}>
                  <Ionicons name="information-circle" size={20} color={theme.primary} />
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    How Referrals Work
                  </Text>
                </View>
                <View style={styles.howItWorks}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                      <Text style={styles.stepNumberText}>1</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.text }]}>
                      Share your referral link with friends
                    </Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                      <Text style={styles.stepNumberText}>2</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.text }]}>
                      They purchase the app using your referral code
                    </Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                      <Text style={styles.stepNumberText}>3</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.text }]}>
                      You both get 1 month AI Light
                    </Text>
                  </View>
                </View>
              </View>

              {/* Unlock More Referrals */}
              {getDaysUntilNextUnlock() > 0 && (
                <View style={[styles.card, styles.unlockCard, { backgroundColor: theme.primary + '10', borderColor: theme.primary }]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="lock-closed" size={20} color={theme.primary} />
                    <Text style={[styles.cardTitle, { color: theme.text }]}>
                      Unlock More Referrals
                    </Text>
                  </View>
                  <Text style={[styles.unlockDescription, { color: theme.text }]}>
                    Keep your daily streak going! Reach {getNextReferralInfo()?.daysNeeded} days to unlock referral #{getNextReferralInfo()?.referralNumber}.
                  </Text>
                  <View style={styles.unlockProgress}>
                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { 
                            backgroundColor: theme.primary,
                            width: `${(streakData.currentStreak / (getNextReferralInfo()?.daysNeeded || 1)) * 100}%`
                          }
                        ]} 
                      />
                    </View>
                    <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                      {streakData.currentStreak} / {getNextReferralInfo()?.daysNeeded} days
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.sendReferralButton, { backgroundColor: theme.primary }]}
              onPress={handleSendReferral}
            >
              <Ionicons name="paper-plane" size={18} color="white" />
              <Text style={styles.sendReferralText}>
                Go to Referrals
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouchable: {
    width: '100%',
    height: '100%',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: height * 0.6,
    maxHeight: height * 0.9,
    paddingBottom: spacing.xl,
    opacity: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(128, 128, 128, 0.5)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
  },
  headerIcon: {
    marginRight: spacing.m,
  },
  title: {
    flex: 1,
    fontSize: fontSizes.xl,
    fontWeight: '600',
  },
  closeButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.m,
    fontSize: fontSizes.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.l,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.l,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: '600',
    marginLeft: spacing.s,
  },
  cardDescription: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  referralCount: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.s,
  },
  referralNumber: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  referralTotal: {
    fontSize: fontSizes.lg,
    marginLeft: spacing.xs,
  },
  streakEmoji: {
    fontSize: 20,
    marginRight: spacing.s,
  },
  streakInfo: {
    marginBottom: spacing.s,
  },
  streakDays: {
    fontSize: fontSizes.xl,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  streakProgress: {
    fontSize: fontSizes.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: fontSizes.sm,
  },
  howItWorks: {
    gap: spacing.m,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  stepNumberText: {
    color: 'white',
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  unlockCard: {
    borderWidth: 2,
  },
  unlockDescription: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
    marginBottom: spacing.m,
  },
  unlockProgress: {
    gap: spacing.s,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    borderTopWidth: 1,
  },
  sendReferralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.l,
    borderRadius: 16,
    gap: spacing.s,
  },
  sendReferralText: {
    color: 'white',
    fontSize: fontSizes.md,
    fontWeight: '600',
  },
});

export default ReferralSummaryPopup;
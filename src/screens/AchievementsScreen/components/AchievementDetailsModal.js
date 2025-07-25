// src/screens/AchievementsScreen/components/AchievementDetailsModal.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const AchievementDetailsModal = ({
  visible,
  achievement,
  isUnlocked,
  unlockDate,
  theme,
  onClose,
  onUnlock,
  navigation,
  userSubscriptionStatus = 'free'
}) => {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  
  // Check if achievement is premium and if user can unlock it
  const isPremium = achievement?.premium === true;
  const canUnlockPremium = userSubscriptionStatus === 'pro' || userSubscriptionStatus === 'unlimited';
  const isPremiumLocked = isPremium && !canUnlockPremium;
  
  // Format the unlock date
  const formatUnlockDate = (date) => {
    if (!date) return 'Not yet unlocked';
    
    try {
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Date unknown';
    }
  };
  
  // Animate modal entrance
  useEffect(() => {
    if (visible) {
      // Play haptic feedback when modal opens
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true
        }),
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Reset animation values
      scaleAnim.setValue(0.9);
      opacityAnim.setValue(0);
      slideAnim.setValue(50);
      iconRotateAnim.setValue(0);
    }
  }, [visible]);
  
  // Handle navigation to upgrade screen
  const handleUpgrade = () => {
    onClose();
    
    // Add a small delay before navigating
    setTimeout(() => {
      if (navigation && navigation.navigate) {
        navigation.navigate('PricingScreen');
      }
    }, 300);
  };
  
  // Handle unlock (for development)
  const handleUnlock = () => {
    if (onUnlock && achievement && !isUnlocked) {
      onUnlock(achievement.id);
      
      // Play haptic success feedback
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      // Close modal after a short delay
      setTimeout(() => onClose(), 300);
    }
  };
  
  // Get category color
  const getCategoryColor = () => {
    if (!achievement) return theme.primary;
    
    const categoryColors = {
      'strategic': '#2563eb', // Blue
      'consistency': '#9333ea', // Purple
      'ai': '#16a34a',        // Green
      'explorer': '#db2777',   // Pink
      'premium': '#f59e0b'     // Amber
    };
    
    return categoryColors[achievement.category] || theme.primary;
  };
  
  // Get gradient colors based on category
  const getGradientColors = () => {
    if (!achievement) return ['#3b82f6', '#1d4ed8'];
    
    // Special gold gradient for premium achievements
    if (isPremium) {
      return ['#FFD700', '#FFA500']; // Gold gradient
    }
    
    const gradients = {
      'strategic': ['#3b82f6', '#1d4ed8'], // Blue
      'consistency': ['#a855f7', '#7e22ce'], // Purple
      'ai': ['#22c55e', '#15803d'],        // Green
      'explorer': ['#ec4899', '#be185d'],   // Pink
      'premium': ['#f59e0b', '#d97706']     // Amber
    };
    
    return gradients[achievement.category] || ['#3b82f6', '#1d4ed8'];
  };
  
  // Get category name
  const getCategoryName = () => {
    if (!achievement) return '';
    
    const categoryNames = {
      'strategic': 'Strategic Progress',
      'consistency': 'Consistency Champions',
      'ai': 'AI Mastery',
      'explorer': 'Feature Explorer',
      'premium': 'Premium Perks'
    };
    
    return categoryNames[achievement.category] || '';
  };
  
  // Icon rotation interpolation
  const rotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  // If no achievement selected, don't render anything
  if (!achievement) return null;
  
  // Render different layouts based on locked/unlocked status
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop with blur */}
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={30}
              style={StyleSheet.absoluteFill}
              tint={theme.dark ? 'dark' : 'light'}
            />
          )}
        </TouchableOpacity>
        
        {/* Modal Content */}
        <Animated.View 
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.background,
              borderColor: isUnlocked && isPremium ? '#FFD700' : theme.border,
              borderWidth: isUnlocked && isPremium ? 1 : 0.5,
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          {/* Close Button - Always visible */}
          <TouchableOpacity
            style={[styles.closeButton, { 
              top: 12, 
              right: 12, 
              backgroundColor: 'rgba(0,0,0,0.2)',
              zIndex: 10
            }]}
            onPress={onClose}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Ionicons name="close" size={22} color={theme.text} />
          </TouchableOpacity>

          {isUnlocked ? (
            // UNLOCKED ACHIEVEMENT - Full colorful display
            <>
              {/* Modal Header with Achievement Icon */}
              <LinearGradient
                colors={getGradientColors()}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalHeader}
              >
                <View style={styles.headerContent}>
                  <Animated.View 
                    style={[
                      styles.achievementIconWrapper,
                      { transform: [{ rotate: rotate }] }
                    ]}
                  >
                    <Ionicons 
                      name={achievement.icon || 'trophy-outline'} 
                      size={32} 
                      color={getCategoryColor()} 
                    />
                  </Animated.View>
                  
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      {getCategoryName()}
                    </Text>
                  </View>
                  
                  {/* Premium Badge */}
                  {isPremium && (
                    <View style={styles.premiumBadge}>
                      <Text style={styles.premiumBadgeText}>
                        PRO
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
              
              {/* Achievement Status */}
              <View style={[
                styles.statusContainer,
                { backgroundColor: `${getCategoryColor()}15` }
              ]}>
                <View style={styles.statusRow}>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={20} 
                    color={getCategoryColor()} 
                  />
                  
                  <Text style={[styles.statusText, { color: getCategoryColor() }]}>
                    Unlocked
                  </Text>
                </View>
                
                <Text style={[styles.unlockDateText, { color: theme.textSecondary }]}>
                  Achieved on {formatUnlockDate(unlockDate)}
                </Text>
              </View>
              
              {/* Achievement Details */}
              <View style={styles.detailsContainer}>
                {/* Description */}
                <View style={styles.detailSection}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Description
                  </Text>
                  <Text style={[styles.sectionText, { color: theme.text }]}>
                    {achievement.description}
                  </Text>
                </View>
                
                {/* How to Unlock */}
                <View style={[styles.detailSection, { borderTopColor: theme.border }]}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    How to Unlock
                  </Text>
                  <Text style={[styles.sectionText, { color: theme.text }]}>
                    {achievement.criteria || achievement.description}
                  </Text>
                </View>
                
                {/* Reward (if applicable) */}
                {achievement.reward && (
                  <View style={[styles.detailSection, { borderTopColor: theme.border }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Reward
                    </Text>
                    <View style={styles.rewardRow}>
                      <Ionicons name="gift-outline" size={18} color={getCategoryColor()} />
                      <Text style={[styles.rewardText, { color: theme.text }]}>
                        {achievement.reward}
                      </Text>
                    </View>
                  </View>
                )}
                
                {/* Points */}
                <View style={styles.pointsContainer}>
                  <LinearGradient
                    colors={isPremium ? ['#FFD700', '#FFA500'] : getGradientColors()}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.pointsBadge}
                  >
                    <Text style={styles.pointsText}>
                      {achievement.points || 1} {(achievement.points || 1) === 1 ? 'POINT' : 'POINTS'}
                    </Text>
                  </LinearGradient>
                </View>
              </View>
            </>
          ) : (
            // LOCKED ACHIEVEMENT - Simplified display
            <>
              {/* Simple Header */}
              <View style={[styles.simpleHeader, { borderBottomColor: theme.border }]}>
                <Text style={[styles.simpleTitle, { color: theme.text }]}>
                  {achievement.title}
                </Text>
                
                {/* Premium Badge */}
                {isPremium && (
                  <View style={styles.simplePremiumBadge}>
                    <Text style={styles.simplePremiumBadgeText}>
                      PRO
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Simple Content */}
              <View style={styles.simpleContent}>
                {/* Description */}
                <View style={styles.simpleSection}>
                  <Text style={[styles.simpleSectionTitle, { color: theme.text }]}>
                    Description
                  </Text>
                  <Text style={[styles.simpleSectionText, { color: theme.text }]}>
                    {achievement.description}
                  </Text>
                </View>
                
                {/* How to Unlock */}
                <View style={[styles.simpleSection, { borderTopColor: theme.border }]}>
                  <Text style={[styles.simpleSectionTitle, { color: theme.text }]}>
                    How to Unlock
                  </Text>
                  <Text style={[styles.simpleSectionText, { color: theme.text }]}>
                    {achievement.criteria || achievement.description}
                  </Text>
                </View>
                
                {/* Premium Upgrade Note - only for premium locked achievements */}
                {isPremiumLocked && (
                  <View style={[styles.simpleSection, { borderTopColor: theme.border }]}>
                    <Text style={[styles.simpleSectionTitle, { color: '#FFD700' }]}>
                      Pro Feature
                    </Text>
                    <Text style={[styles.simpleSectionText, { color: theme.text }]}>
                      This is a premium achievement exclusively available to Pro users. Upgrade once to unlock all premium achievements forever.
                    </Text>
                  </View>
                )}
                
                {/* Simple Points Badge */}
                <View style={styles.simplePointsContainer}>
                  <View style={[
                    styles.simplePointsBadge, 
                    { backgroundColor: theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                  ]}>
                    <Text style={[styles.simplePointsText, { color: theme.text }]}>
                      {achievement.points || 1} {(achievement.points || 1) === 1 ? 'point' : 'points'} when unlocked
                    </Text>
                  </View>
                </View>
                
                {/* Premium Upgrade Button - only for premium locked achievements */}
                {isPremiumLocked && (
                  <TouchableOpacity
                    style={[styles.upgradeButton, { backgroundColor: '#FFD700' }]}
                    onPress={handleUpgrade}
                  >
                    <Ionicons name="star" size={18} color="#000000" />
                    <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: width * 0.85,
    maxWidth: 380,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  closeButton: {
    position: 'absolute',
    zIndex: 1,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Unlocked Achievement Styles
  modalHeader: {
    paddingVertical: 16,
    position: 'relative',
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  achievementIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  achievementTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  premiumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    marginTop: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  statusContainer: {
    padding: 16,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  unlockDateText: {
    fontSize: 13,
  },
  detailsContainer: {
    padding: 20,
  },
  detailSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 15,
    marginLeft: 8,
  },
  pointsContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  pointsBadge: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  pointsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Locked Achievement Styles (Simplified)
  simpleHeader: {
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  simpleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  simplePremiumBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    marginTop: 4,
  },
  simplePremiumBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  simpleContent: {
    padding: 20,
  },
  simpleSection: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  simpleSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  simpleSectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  simplePointsContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  simplePointsBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  simplePointsText: {
    fontSize: 14,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  upgradeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AchievementDetailsModal;
// src/screens/CommunityScreen/CommunityScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ScrollView,
  Animated,
  Clipboard,
  Alert,
  ActivityIndicator,
  Platform,
  Switch,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import founderCodeService from '../../services/founderCodeService';
import referralService from '../../services/referralService';
import responsive from '../../utils/responsive';
import { useTheme } from '../../context/ThemeContext';
import Confetti from '../../components/Confetti';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Discord brand color
const DISCORD_BLUE = "#5865F2";

// Create Tab Navigator
const Tab = createMaterialTopTabNavigator();

// Clean Community Tab Component
const CommunityTab = ({ 
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
  const codeScale = useRef(new Animated.Value(1)).current;

  // Animation when code is copied
  useEffect(() => {
    if (isCopied) {
      Animated.sequence([
        Animated.timing(codeScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(codeScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isCopied, codeScale]);

  return (
    <ScrollView 
      style={[styles.tabContent, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.tabContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Discord Branding */}
      <View style={styles.discordSection}>
        <View style={styles.discordLogoContainer}>
          <View style={styles.discordLogo}>
            <Ionicons name="logo-discord" size={60} color="#FFFFFF" />
          </View>
          <Text style={[styles.discordTitle, { color: theme.text }]}>
            LifeCompass Community
          </Text>
          <Text style={[styles.discordSubtitle, { color: theme.textSecondary }]}>
            Join our exclusive Discord community
          </Text>
        </View>
      </View>

      {/* Founder Status */}
      <View style={[styles.statusCard, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
        shadowColor: theme.shadow,
      }]}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Checking founder status...
            </Text>
          </View>
        ) : founderCode ? (
          <>
            <View style={styles.founderHeader}>
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={[styles.founderTitle, { color: theme.text }]}>
                You're a Founder! 
              </Text>
            </View>
            
            <Text style={[styles.founderSubtitle, { color: theme.textSecondary }]}>
              You're one of the exclusive 1,000 LifeCompass Founders
            </Text>

            <TouchableOpacity
              style={[styles.codeDisplayContainer, { 
                backgroundColor: theme.isDark ? '#2D1B69' : '#F0F4FF',
                borderColor: theme.isDark ? '#6366F1' : '#4F46E5',
              }]}
              onPress={onCopyCode}
              activeOpacity={0.7}
            >
              <View style={styles.codeDisplay}>
                <Text style={[styles.codeLabel, { color: theme.isDark ? '#FFFFFF' : '#000000' }]}>
                  Your founder code:
                </Text>
                <Animated.Text
                  style={[
                    styles.codeValue,
                    { 
                      color: theme.isDark ? '#A5B4FC' : '#4F46E5',
                      transform: [{ scale: codeScale }] 
                    }
                  ]}
                >
                  {founderCode}
                </Animated.Text>
              </View>
              
              <View style={styles.copyIcon}>
                <Ionicons
                  name={isCopied ? "checkmark-circle" : "copy-outline"}
                  size={20}
                  color={isCopied ? "#4CAF50" : (theme.isDark ? '#A5B4FC' : '#6366F1')}
                />
              </View>
            </TouchableOpacity>

            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified in Discord</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.noCodeContainer}>
            <Ionicons name="gift-outline" size={48} color={theme.primary} />
            <Text style={[styles.noCodeTitle, { color: theme.text }]}>
              Become a Founder
            </Text>
            <Text style={[styles.noCodeDescription, { color: theme.textSecondary }]}>
              Purchase LifeCompass to join our exclusive community of 1,000 founders
            </Text>
            
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.primary }]}
              onPress={onAssignCode}
              disabled={isAssigning}
            >
              {isAssigning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="star-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>
                    Get Founder Code
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Welcome Section */}
      <View style={[styles.welcomeSection, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
      }]}>
        <View style={styles.welcomeIcon}>
          <Ionicons name="heart" size={32} color="#FF6B6B" />
        </View>
        <Text style={[styles.welcomeTitle, { color: theme.text }]}>
          Welcome to LifeCompass Community
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: theme.textSecondary }]}>
          <Text style={{ color: theme.primary, fontWeight: '600' }}>Free for everyone</Text> • Connect with like-minded achievers
        </Text>
      </View>

      {/* Community Features */}
      <View style={styles.featuresGrid}>
        {[
          {
            icon: 'globe',
            color: '#4CAF50',
            title: 'Free Community',
            subtitle: 'Open to all LifeCompass users'
          },
          {
            icon: 'people',
            color: '#2196F3',
            title: 'Find Your Tribe',
            subtitle: 'Connect by shared goals & domains'
          },
          {
            icon: 'chatbubbles',
            color: '#FF9800',
            title: '8 Life Domains',
            subtitle: '24 focused subcommunities'
          },
          {
            icon: 'trophy',
            color: '#9C27B0',
            title: 'Achieve Together',
            subtitle: 'Accountability & support'
          }
        ].map((feature, index) => (
          <View key={index} style={[styles.featureCard, { 
            backgroundColor: theme.card,
            borderColor: theme.border,
          }]}>
            <View style={[styles.featureIcon, { backgroundColor: `${feature.color}15` }]}>
              <Ionicons name={feature.icon} size={24} color={feature.color} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text }]}>
              {feature.title}
            </Text>
            <Text style={[styles.featureSubtitle, { color: theme.textSecondary }]}>
              {feature.subtitle}
            </Text>
          </View>
        ))}
      </View>

      {/* Benefits */}
      <View style={[styles.benefitsCard, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
        shadowColor: theme.shadow,
      }]}>
        <View style={styles.founderBenefitsHeader}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={[styles.founderBenefitsTitle, { color: theme.text }]}>
            Founder Perks
          </Text>
        </View>
        <Text style={[styles.founderBenefitsSubtitle, { color: theme.textSecondary }]}>
          Exclusive benefits for our first 1,000 users
        </Text>
        
        <View style={styles.founderBenefitsGrid}>
          {[
            { icon: 'shield-checkmark', title: 'Founder Badge', color: '#FFD700' },
            { icon: 'chatbubble-ellipses', title: 'Private Channels', color: '#9C27B0' },
            { icon: 'sparkles', title: 'Early Access', color: '#4CAF50' },
            { icon: 'people', title: 'Direct Dev Line', color: '#2196F3' }
          ].map((benefit, index) => (
            <View key={index} style={[styles.founderBenefitItem, { 
              backgroundColor: theme.isDark ? '#1A1A1A' : '#FFFBF0',
              borderColor: benefit.color + '30'
            }]}>
              <Ionicons name={benefit.icon} size={20} color={benefit.color} />
              <Text style={[styles.founderBenefitText, { color: theme.isDark ? '#FFFFFF' : '#000000' }]}>
                {benefit.title}
              </Text>
            </View>
          ))}
        </View>
      </View>


      {/* Discord Button */}
      {founderCode && (
        <TouchableOpacity
          style={[styles.discordButton, { backgroundColor: DISCORD_BLUE }]}
          onPress={onOpenDiscord}
        >
          <Ionicons name="logo-discord" size={24} color="#FFFFFF" />
          <Text style={styles.discordButtonText}>
            {isVerified ? "Open Discord Community" : "Join Discord & Verify"}
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};


// FounderSpotsBanner Component
const FounderSpotsBanner = ({ 
  spotsRemaining, 
  totalSpots = 1000,
  theme,
  style = {}
}) => {
  // Calculate spots claimed and percentage
  const spotsClaimed = totalSpots - spotsRemaining;
  const percentClaimed = Math.floor((spotsClaimed / totalSpots) * 100);
  
  // Animated value for progress bar
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for pulse effect on low availability
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Set up animations on mount and when spots change
  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: percentClaimed / 100,
      duration: 1000,
      useNativeDriver: false
    }).start();
    
    // Only add pulse animation when spots are low (less than 200)
    if (spotsRemaining < 200) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: false
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false
          })
        ])
      ).start();
    }
  }, [spotsRemaining]);
  
  // Determine background color based on availability
  const getProgressColor = () => {
    if (spotsRemaining < 100) return '#FF3B30'; // Red for urgent
    if (spotsRemaining < 200) return '#FF9500'; // Orange for very limited
    if (spotsRemaining < 500) return '#FFD700'; // Gold for limited
    return '#3F51B5'; // Primary blue for available
  };
  
  // Get message based on threshold
  const getMessage = () => {
    if (spotsRemaining < 100) {
      return `URGENT: Only ${spotsRemaining} founder spots remaining!`;
    } else if (spotsRemaining < 200) {
      return `Almost gone! Only ${spotsRemaining} founder spots left`;
    } else if (spotsRemaining < 500) {
      return `Founder spots going fast - ${percentClaimed}% already claimed!`;
    } else if (spotsRemaining < 800) {
      return `Join our growing founder community - ${percentClaimed}% claimed!`;
    } else {
      return `Be one of our founding members! Limited to 1,000 spots.`;
    }
  };
  
  // Get appropriate icon based on availability
  const getIcon = () => {
    if (spotsRemaining < 200) return "timer-outline";
    if (spotsRemaining < 500) return "people-outline";
    return "star-outline";
  };
  
  // Get banner background color based on urgency
  const getBannerColor = () => {
    if (spotsRemaining < 100) return 'rgba(255, 59, 48, 0.1)'; // Red bg for urgent
    if (spotsRemaining < 200) return 'rgba(255, 149, 0, 0.1)'; // Orange bg for very limited
    if (spotsRemaining < 500) return 'rgba(255, 215, 0, 0.1)'; // Gold bg for limited
    return 'rgba(63, 81, 181, 0.07)'; // Blue bg for available
  };
  
  // Scale badge size based on urgency
  const badgeScale = pulseAnim.interpolate({
    inputRange: [1, 1.1],
    outputRange: [1, 1.1]
  });
  
  // Background color for the badge (more dramatic when fewer spots)
  const badgeColor = spotsRemaining < 100 ? '#FF3B30' : 
                    spotsRemaining < 200 ? '#FF9500' : 
                    spotsRemaining < 500 ? '#FFD700' : '#3F51B5';
  
  return (
    <Animated.View 
      style={[
        bannerStyles.container, 
        { 
          backgroundColor: getBannerColor(),
          borderColor: getProgressColor(),
          transform: [{ scale: spotsRemaining < 200 ? pulseAnim : 1 }]
        },
        style
      ]}
    >
      <View style={bannerStyles.content}>
        {/* Icon and message */}
        <View style={bannerStyles.messageRow}>
          <Animated.View 
            style={[
              bannerStyles.iconBadge,
              { 
                backgroundColor: badgeColor,
                transform: [{ scale: badgeScale }] 
              }
            ]}
          >
            <Ionicons name={getIcon()} size={22} color="#FFFFFF" />
          </Animated.View>
          <Text style={[
            bannerStyles.message, 
            { 
              color: theme?.text || '#000000',
              fontWeight: spotsRemaining < 200 ? '700' : '600'
            }
          ]}>
            {getMessage()}
          </Text>
        </View>
        
        {/* Progress bar */}
        <View style={bannerStyles.progressContainer}>
          <Animated.View 
            style={[
              bannerStyles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: getProgressColor()
              }
            ]}
          />
          <View style={bannerStyles.progressOverlay}>
            <Text style={bannerStyles.progressText}>
              {spotsClaimed} of {totalSpots} claimed
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Test Mode Panel Component
const TestModePanel = ({ 
  theme, 
  serviceMode, 
  setServiceMode, 
  testScenario, 
  setTestScenario, 
  onClearData 
}) => {
  return (
    <View style={[styles.testModePanel, { 
      backgroundColor: 'rgba(255, 0, 0, 0.05)',
      borderColor: 'rgba(255, 0, 0, 0.3)',
    }]}>
      <View style={styles.testModeHeader}>
        <Ionicons name="construct" size={20} color="#FF3B30" />
        <Text style={[styles.testModeTitle, { color: theme.text }]}>
          DEVELOPER TEST MODE
        </Text>
      </View>
      
      <View style={styles.testModeOption}>
        <Text style={[styles.testModeLabel, { color: theme.text }]}>Service Mode:</Text>
        <View style={styles.testModeSegment}>
          {Object.values(founderCodeService.constants.MODES).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.testModeSegmentButton,
                { 
                  backgroundColor: serviceMode === mode ? theme.primary : 'transparent',
                  borderColor: theme.border,
                }
              ]}
              onPress={() => setServiceMode(mode)}
            >
              <Text style={[
                styles.testModeSegmentText,
                { color: serviceMode === mode ? '#FFFFFF' : theme.textSecondary }
              ]}>
                {mode}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {serviceMode === founderCodeService.constants.MODES.MOCK && (
        <View style={styles.testModeOption}>
          <Text style={[styles.testModeLabel, { color: theme.text }]}>Test Scenario:</Text>
          <View style={styles.testModeSegment}>
            {['success', 'already_assigned', 'no_spots', 'error'].map((scenario) => (
              <TouchableOpacity
                key={scenario}
                style={[
                  styles.testModeSegmentButton,
                  { 
                    backgroundColor: testScenario === scenario ? theme.primary : 'transparent',
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => setTestScenario(scenario)}
              >
                <Text style={[
                  styles.testModeSegmentText,
                  { color: testScenario === scenario ? '#FFFFFF' : theme.textSecondary }
                ]}>
                  {scenario.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.testModeButton, { backgroundColor: '#FF3B30' }]}
        onPress={onClearData}
      >
        <Text style={styles.testModeButtonText}>Clear Founder Data</Text>
      </TouchableOpacity>
      
      <Text style={[styles.testModeNote, { color: theme.textSecondary }]}>
        This panel is only visible in development builds.
      </Text>
    </View>
  );
};

// Status Log Component
const StatusLog = ({ logs, theme }) => {
  // Get the ScrollView ref to auto-scroll to bottom on updates
  const scrollViewRef = useRef(null);
  
  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);
  
  if (logs.length === 0) return null;
  
  return (
    <View style={[styles.statusLogContainer, { 
      backgroundColor: theme.isDark ? '#1A1A1A' : '#F0F0F0',
      borderColor: theme.border,
    }]}>
      <View style={styles.statusLogHeader}>
        <Ionicons name="terminal-outline" size={16} color={theme.textSecondary} />
        <Text style={[styles.statusLogTitle, { color: theme.textSecondary }]}>
          Status Log
        </Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.statusLogContent}
        contentContainerStyle={styles.statusLogItems}
      >
        {logs.map((log, index) => (
          <Text key={index} style={[
            styles.statusLogItem,
            { 
              color: log.type === 'error' ? '#FF3B30' : 
                    log.type === 'success' ? '#4CD964' : 
                    log.type === 'info' ? theme.text : 
                    theme.textSecondary 
            }
          ]}>
            {log.message}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

// Success Celebration Modal Component
const SuccessCelebrationModal = ({ 
  visible, 
  onClose, 
  founderCode, 
  theme 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      
      // Start entrance animation
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    } else {
      setShowConfetti(false);
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
    }
  }, [visible]);

  const handleClose = () => {
    setShowConfetti(false);
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const celebrationColors = [
    '#FFD700', // Gold
    '#FFC125', // Golden
    '#FF6B35', // Orange
    '#6366F1', // Indigo  
    '#10B981', // Emerald
    '#F59E0B', // Amber
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Confetti Effect */}
        <Confetti 
          active={showConfetti}
          colors={celebrationColors}
          duration={3000}
          type="fireworks"
          onComplete={() => setShowConfetti(false)}
        />
        
        <Animated.View 
          style={[
            styles.celebrationModal,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              transform: [
                { scale: scaleAnim },
                { 
                  rotate: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-3deg', '0deg']
                  })
                }
              ]
            }
          ]}
        >
          {/* Success Icon */}
          <View style={[styles.successIconContainer, { borderColor: '#FFD700' }]}>
            <Animated.View
              style={{
                transform: [{
                  scale: rotateAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 1.2, 1]
                  })
                }]
              }}
            >
              <Ionicons name="trophy" size={48} color="#FFD700" />
            </Animated.View>
          </View>

          {/* Success Message */}
          <Text style={[styles.celebrationTitle, { color: theme.text }]}>
            🎉 Congratulations! 🎉
          </Text>
          <Text style={[styles.celebrationSubtitle, { color: theme.textSecondary }]}>
            You're now one of the exclusive 1,000 LifeCompass Founders!
          </Text>

          {/* Founder Code Display */}
          <View style={[styles.successCodeContainer, { 
            backgroundColor: theme.isDark ? '#1A1A1A' : '#FFF8DC',
            borderColor: '#FFD700',
          }]}>
            <Text style={[styles.successCodeLabel, { 
              color: theme.isDark ? '#CCCCCC' : '#8B6914'
            }]}>
              Your exclusive founder code:
            </Text>
            <Text style={[styles.successCodeText, { 
              color: theme.isDark ? '#FFD700' : '#B8860B'
            }]}>
              {founderCode}
            </Text>
          </View>

          {/* Benefits Preview */}
          <View style={styles.benefitsPreview}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                Private Discord access
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                Early feature access
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                Direct developer access
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.celebrationButton, { backgroundColor: '#FFD700' }]}
            onPress={handleClose}
          >
            <Text style={styles.celebrationButtonText}>
              Awesome! Let's Verify in Discord
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Already Assigned Celebration Modal Component  
const AlreadyAssignedModal = ({ 
  visible, 
  onClose, 
  founderCode, 
  theme 
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (visible) {
      setShowConfetti(true);
      
      // Start entrance animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Pulse effect
      Animated.loop(
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
        ])
      ).start();
    } else {
      setShowConfetti(false);
      scaleAnim.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const handleClose = () => {
    setShowConfetti(false);
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const celebrationColors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Violet  
    '#EC4899', // Pink
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        {/* Confetti Effect */}
        <Confetti 
          active={showConfetti}
          colors={celebrationColors}
          duration={2500}
          type="confetti"
          onComplete={() => setShowConfetti(false)}
        />
        
        <Animated.View 
          style={[
            styles.celebrationModal,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {/* Success Icon */}
          <Animated.View 
            style={[
              styles.successIconContainer, 
              { 
                borderColor: '#6366F1',
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Ionicons name="star" size={48} color="#6366F1" />
          </Animated.View>

          {/* Success Message */}
          <Text style={[styles.celebrationTitle, { color: theme.text }]}>
            ✨ You Already Have a Code! ✨
          </Text>
          <Text style={[styles.celebrationSubtitle, { color: theme.textSecondary }]}>
            Welcome back, Founder! Your exclusive code is ready to use.
          </Text>

          {/* Founder Code Display */}
          <View style={[styles.successCodeContainer, { 
            backgroundColor: theme.isDark ? '#1A1A1A' : '#F8F4FF',
            borderColor: '#6366F1',
          }]}>
            <Text style={[styles.successCodeLabel, { 
              color: theme.isDark ? '#CCCCCC' : '#4C1D95'
            }]}>
              Your founder code:
            </Text>
            <Text style={[styles.successCodeText, { 
              color: theme.isDark ? '#8B5CF6' : '#5B21B6'
            }]}>
              {founderCode}
            </Text>
          </View>

          {/* Upbeat Message */}
          <View style={[styles.upbeatMessage, { backgroundColor: theme.isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }]}>
            <Ionicons name="heart" size={20} color="#EC4899" />
            <Text style={[styles.upbeatText, { color: theme.text }]}>
              You're part of an exclusive group of early supporters!
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: theme.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>
                Got it!
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.celebrationButton, { backgroundColor: '#6366F1', flex: 1, marginLeft: 12 }]}
              onPress={handleClose}
            >
              <Text style={styles.celebrationButtonText}>
                Verify in Discord
              </Text>
              <Ionicons name="logo-discord" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Developer Tab Component
const DeveloperTab = ({ 
  theme,
  serviceMode,
  setServiceMode,
  testScenario,
  setTestScenario,
  statusLogs,
  onClearData,
  founderSpotsRemaining
}) => {
  const [showTestMode, setShowTestMode] = useState(true);

  return (
    <ScrollView 
      style={[styles.tabContent, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.tabContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Dev Mode Banner */}
      <View style={styles.devBanner}>
        <Ionicons name="warning" size={18} color="#FFFFFF" />
        <Text style={styles.devBannerText}>DEVELOPMENT MODE</Text>
      </View>

      {/* Founder Spots Banner */}
      <FounderSpotsBanner
        spotsRemaining={founderSpotsRemaining}
        totalSpots={1000}
        theme={theme}
        style={{ marginBottom: 16 }}
      />

      {/* Test Mode Panel */}
      <TestModePanel
        theme={theme}
        serviceMode={serviceMode}
        setServiceMode={setServiceMode}
        testScenario={testScenario}
        setTestScenario={setTestScenario}
        onClearData={onClearData}
      />

      {/* Status Log */}
      {statusLogs.length > 0 && (
        <StatusLog logs={statusLogs} theme={theme} />
      )}

      {/* Referral Management */}
      <ReferralManagement theme={theme} />

      {/* Dev Instructions */}
      <View style={[styles.devInstructions, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
      }]}>
        <View style={styles.devInstructionsHeader}>
          <Ionicons name="information-circle" size={20} color={theme.primary} />
          <Text style={[styles.devInstructionsTitle, { color: theme.text }]}>
            Developer Testing
          </Text>
        </View>
        
        <Text style={[styles.devInstructionsText, { color: theme.textSecondary }]}>
          Use the controls above to test different founder code scenarios and referral system functionality. The test mode allows you to simulate various purchase outcomes and referral conversions.
        </Text>

        <View style={styles.devTip}>
          <Ionicons name="bulb" size={16} color="#FFD700" />
          <Text style={[styles.devTipText, { color: theme.textSecondary }]}>
            Set service mode to "Mock" to test celebration animations and referral stats without API calls.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Referral Management Component for Developer Tab
const ReferralManagement = ({ theme }) => {
  const [referralStatus, setReferralStatus] = useState('idle');
  const [lastAction, setLastAction] = useState(null);

  const handleReferralAction = async (action) => {
    setReferralStatus('loading');
    setLastAction(action);

    try {
      switch (action) {
        case 'clear_data':
          const cleared = await referralService.clearReferralData();
          setReferralStatus(cleared ? 'success' : 'error');
          break;

        case 'refresh_stats':
          // Force refresh by bypassing cache
          await AsyncStorage.removeItem('referral_stats');
          await AsyncStorage.removeItem('last_stats_update');
          const stats = await referralService.getReferralStats();
          setReferralStatus(stats.success ? 'success' : 'error');
          break;

        case 'mock_conversion':
          const mockResult = await referralService.mockApiCall('track-referral', {
            referralCode: 'REF-LC-TEST',
            userId: 'mock-user-' + Date.now()
          });
          setReferralStatus(mockResult.success ? 'success' : 'error');
          break;

        case 'test_sharing':
          const sharingResult = await referralService.getSharingMessages();
          if (sharingResult.success) {
            Alert.alert(
              'Test Sharing Message',
              sharingResult.messages.short,
              [{ text: 'OK' }]
            );
            setReferralStatus('success');
          } else {
            setReferralStatus('error');
          }
          break;

        default:
          setReferralStatus('error');
      }
    } catch (error) {
      console.error('Referral action error:', error);
      setReferralStatus('error');
    }

    // Reset status after 2 seconds
    setTimeout(() => {
      setReferralStatus('idle');
      setLastAction(null);
    }, 2000);
  };

  const getStatusIcon = () => {
    switch (referralStatus) {
      case 'loading': return 'refresh-outline';
      case 'success': return 'checkmark-circle-outline';
      case 'error': return 'alert-circle-outline';
      default: return 'settings-outline';
    }
  };

  const getStatusColor = () => {
    switch (referralStatus) {
      case 'loading': return theme.primary;
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      default: return theme.textSecondary;
    }
  };

  return (
    <View style={[styles.referralManagement, { 
      backgroundColor: 'rgba(255, 149, 0, 0.05)',
      borderColor: 'rgba(255, 149, 0, 0.3)',
    }]}>
      <View style={styles.referralManagementHeader}>
        <Ionicons name="gift-outline" size={20} color="#FF9500" />
        <Text style={[styles.referralManagementTitle, { color: theme.text }]}>
          REFERRAL SYSTEM TESTING
        </Text>
      </View>

      {/* Status Indicator */}
      <View style={styles.referralStatusContainer}>
        <Ionicons 
          name={getStatusIcon()} 
          size={16} 
          color={getStatusColor()}
          style={{ marginRight: 8 }}
        />
        <Text style={[styles.referralStatusText, { color: getStatusColor() }]}>
          {referralStatus === 'loading' ? `${lastAction}...` :
           referralStatus === 'success' ? `${lastAction} successful` :
           referralStatus === 'error' ? `${lastAction} failed` :
           'Ready for testing'}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.referralButtonsContainer}>
        <TouchableOpacity
          style={[styles.referralTestButton, { backgroundColor: '#FF9500' }]}
          onPress={() => handleReferralAction('clear_data')}
          disabled={referralStatus === 'loading'}
        >
          <Text style={styles.referralTestButtonText}>Clear Referral Data</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.referralTestButton, { backgroundColor: '#2196F3' }]}
          onPress={() => handleReferralAction('refresh_stats')}
          disabled={referralStatus === 'loading'}
        >
          <Text style={styles.referralTestButtonText}>Refresh Stats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.referralTestButton, { backgroundColor: '#4CAF50' }]}
          onPress={() => handleReferralAction('mock_conversion')}
          disabled={referralStatus === 'loading'}
        >
          <Text style={styles.referralTestButtonText}>Mock Conversion</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.referralTestButton, { backgroundColor: '#9C27B0' }]}
          onPress={() => handleReferralAction('test_sharing')}
          disabled={referralStatus === 'loading'}
        >
          <Text style={styles.referralTestButtonText}>Test Sharing</Text>
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.referralManagementInfo}>
        <Ionicons name="information-circle-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.referralManagementInfoText, { color: theme.textSecondary }]}>
          Referral system uses mock data until Lambda functions are deployed.
        </Text>
      </View>
    </View>
  );
};

// Verification Tab Component
const WhyJoinTab = ({ theme }) => {
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [showDomainModal, setShowDomainModal] = useState(false);

  const handleDomainPress = (domain) => {
    setSelectedDomain(domain);
    setShowDomainModal(true);
  };
  return (
    <ScrollView 
      style={[styles.tabContent, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.tabContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.whyJoinHeader, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
      }]}>
        <Ionicons name="heart" size={28} color="#FF6B6B" />
        <Text style={[styles.whyJoinTitle, { color: theme.text }]}>
          Why Join Our Community?
        </Text>
        <Text style={[styles.whyJoinSubtitle, { color: theme.textSecondary }]}>
          Transform your life alongside others on the same journey
        </Text>
      </View>

      {/* Main Benefits */}
      <View style={[styles.whyJoinSection, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          The Power of Community
        </Text>
        
        {[
          {
            icon: 'trending-up',
            color: '#4CAF50',
            title: 'Increase Achievement',
            desc: 'People who share their goals with others are 65% more likely to achieve them'
          },
          {
            icon: 'people',
            color: '#2196F3',
            title: 'Find Accountability Partners',
            desc: 'Connect with others working on similar goals for mutual support and motivation'
          },
          {
            icon: 'bulb',
            color: '#FF9800',
            title: 'Share Knowledge & Tips',
            desc: 'Learn from others\' experiences and shortcuts to success'
          },
          {
            icon: 'heart',
            color: '#E91E63',
            title: 'Emotional Support',
            desc: 'Get encouragement during tough times and celebrate wins together'
          }
        ].map((benefit, index) => (
          <View key={index} style={styles.whyJoinBenefit}>
            <View style={[styles.whyJoinIcon, { backgroundColor: `${benefit.color}15` }]}>
              <Ionicons name={benefit.icon} size={24} color={benefit.color} />
            </View>
            <View style={styles.whyJoinBenefitContent}>
              <Text style={[styles.whyJoinBenefitTitle, { color: theme.text }]}>
                {benefit.title}
              </Text>
              <Text style={[styles.whyJoinBenefitDesc, { color: theme.textSecondary }]}>
                {benefit.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Domain Structure */}
      <View style={[styles.whyJoinSection, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Organized by Life Domains
        </Text>
        <Text style={[styles.sectionDesc, { color: theme.textSecondary }]}>
          Our community is structured around the 8 key areas of life, just like your Domain Wheel in LifeCompass.
        </Text>
        
        <View style={styles.domainsGrid}>
          {[
            { 
              name: 'Career & Professional Growth', 
              icon: 'briefcase', 
              color: '#2563EB',
              subcommunities: ['Skill Development & Learning', 'Leadership & Management', 'Entrepreneurship & Side Hustles'],
              fullDesc: 'Focus on your professional development, workplace satisfaction, and career progression. This includes building new skills, advancing in your current role, exploring entrepreneurship, and creating meaningful work that aligns with your values.'
            },
            { 
              name: 'Financial Security & Wealth', 
              icon: 'wallet', 
              color: '#10B981',
              subcommunities: ['Budgeting & Debt Management', 'Investing & Wealth Building', 'Financial Independence & Early Retirement'],
              fullDesc: 'Develop financial literacy and security through smart money management, strategic investments, and building multiple income streams. Create a sustainable financial foundation that supports your life goals and provides freedom of choice.'
            },
            { 
              name: 'Health & Energy', 
              icon: 'fitness', 
              color: '#EF4444',
              subcommunities: ['Fitness & Exercise', 'Nutrition & Wellness', 'Mental Health & Stress Management'],
              fullDesc: 'Prioritize your physical and mental wellbeing through regular exercise, proper nutrition, quality sleep, and stress management. Build sustainable habits that increase your energy and vitality for pursuing other life goals.'
            },
            { 
              name: 'Relationships & Connection', 
              icon: 'people', 
              color: '#EC4899',
              subcommunities: ['Family & Parenting', 'Dating & Romance', 'Friendships & Social Life'],
              fullDesc: 'Strengthen and nurture meaningful connections with family, friends, romantic partners, and your broader community. Develop communication skills, practice empathy, and invest time in relationships that matter most to you.'
            },
            { 
              name: 'Learning & Growth', 
              icon: 'school', 
              color: '#8B5CF6',
              subcommunities: ['Academic & Professional Education', 'Personal Development', 'Creative Skills & Hobbies'],
              fullDesc: 'Commit to lifelong learning and personal development. Acquire new skills, expand your knowledge, develop emotional intelligence, and engage in activities that challenge you to grow intellectually and personally.'
            },
            { 
              name: 'Purpose & Impact', 
              icon: 'earth', 
              color: '#0D9488',
              subcommunities: ['Volunteering & Community Service', 'Environmental & Sustainability', 'Spiritual & Values Development'],
              fullDesc: 'Discover and live according to your core values while making a positive impact on the world. Contribute to causes you care about, volunteer your time and skills, and create a meaningful legacy for future generations.'
            },
            { 
              name: 'Digital Wellbeing & Innovation', 
              icon: 'laptop', 
              color: '#3B82F6',
              subcommunities: ['Productivity & Organization', 'Digital Detox & Boundaries', 'Tech Skills & AI Tools'],
              fullDesc: 'Develop a healthy relationship with technology while leveraging innovation to enhance your productivity. Set digital boundaries, stay current with useful tools and AI, and use technology intentionally to support your goals.'
            },
            { 
              name: 'Recreation & Renewal', 
              icon: 'happy', 
              color: '#F59E0B',
              subcommunities: ['Travel & Adventure', 'Hobbies & Creative Pursuits', 'Entertainment & Social Activities'],
              fullDesc: 'Make time for activities that bring joy, relaxation, and renewal. Pursue hobbies, travel to new places, enjoy entertainment, and engage in leisure activities that help you recharge and maintain work-life balance.'
            }
          ].map((domain, index) => (
            <TouchableOpacity
              key={index} 
              style={[styles.domainGridCard, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
              }]}
              activeOpacity={0.7}
              onPress={() => handleDomainPress(domain)}
            >
              <View style={[styles.domainGridIconContainer, { backgroundColor: `${domain.color}15` }]}>
                <Ionicons name={domain.icon} size={28} color={domain.color} />
              </View>
              <Text style={[styles.domainGridTitle, { color: theme.text }]}>
                {domain.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Call to Action */}
      <View style={[styles.whyJoinCTA, { 
        backgroundColor: theme.primary + '15',
        borderColor: theme.primary,
      }]}>
        <Text style={[styles.ctaTitle, { color: theme.text }]}>
          Ready to accelerate your growth?
        </Text>
        <Text style={[styles.ctaDesc, { color: theme.textSecondary }]}>
          Join a growing community of ambitious individuals committed to personal growth and achievement.
        </Text>
      </View>

      {/* Domain Detail Modal */}
      <Modal
        visible={showDomainModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowDomainModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBackdrop} />
          <View style={[styles.modalPopup, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {selectedDomain && (
              <>
                <View style={styles.modalPopupHeader}>
                  <View style={[styles.modalPopupIcon, { backgroundColor: `${selectedDomain.color}15` }]}>
                    <Ionicons name={selectedDomain.icon} size={32} color={selectedDomain.color} />
                  </View>
                  <TouchableOpacity
                    style={styles.modalPopupClose}
                    onPress={() => setShowDomainModal(false)}
                  >
                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.modalPopupTitle, { color: theme.text }]}>
                  {selectedDomain.name}
                </Text>
                
                <View style={styles.modalPopupContent}>
                  <Text style={[styles.modalPopupDesc, { color: theme.text }]}>
                    {selectedDomain.fullDesc}
                  </Text>
                  
                  <View style={styles.modalPopupCommunities}>
                    <Text style={[styles.modalPopupCommunitiesTitle, { color: theme.text }]}>
                      Community Channels:
                    </Text>
                    <Text style={[styles.modalPopupCommunitiesSubtitle, { color: theme.textSecondary }]}>
                      Join focused subcommunities within this domain
                    </Text>
                    <View style={styles.modalPopupChannelsContainer}>
                      {selectedDomain.subcommunities.map((channel, index) => (
                        <View key={index} style={[styles.modalPopupChannel, { 
                          backgroundColor: theme.isDark ? '#1A1A1A' : '#F0F4FF',
                          borderColor: selectedDomain.color + '30'
                        }]}>
                          <Ionicons name="people" size={16} color={selectedDomain.color} />
                          <Text style={[styles.modalPopupChannelText, { 
                            color: theme.isDark ? '#FFFFFF' : '#1A1A1A'
                          }]}>
                            #{channel.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const VerificationTab = ({ founderCode, theme }) => {
  return (
    <ScrollView 
      style={[styles.tabContent, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.tabContentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.verificationHeader}>
        <View style={[styles.verificationIconContainer, { backgroundColor: `${DISCORD_BLUE}15` }]}>
          <Ionicons name="shield-checkmark" size={32} color={DISCORD_BLUE} />
        </View>
        <Text style={[styles.verificationTitle, { color: theme.text }]}>
          Founder Verification Guide
        </Text>
        <Text style={[styles.verificationSubtitle, { color: theme.textSecondary }]}>
          Follow these steps to verify your founder status and access exclusive founder channels
        </Text>
      </View>

      {/* Verification Steps */}
      <View style={[styles.stepsContainer, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
        shadowColor: theme.shadow,
      }]}>
        {/* Step 1 */}
        <View style={styles.verificationStep}>
          <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Ionicons name="log-in-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                Join our Discord server
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Tap the Discord button in the Community tab to join our server
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Accept the server invitation when prompted
            </Text>
          </View>
        </View>
        
        {/* Step 2 */}
        <View style={styles.verificationStep}>
          <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Ionicons name="navigate-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                Find the verification channel
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Look for the #verify-your-founder-status channel in the server
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              This channel is specifically for founder verification
            </Text>
          </View>
        </View>
        
        {/* Step 3 */}
        <View style={styles.verificationStep}>
          <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Ionicons name="copy-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                Copy your founder code
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Go back to the Community tab and tap your founder code to copy it
            </Text>
            
            {/* Code highlight box */}
            {founderCode && (
              <View style={[styles.codeHighlight, {
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99, 102, 241, 0.1)',
                borderColor: '#6366F1',
              }]}>
                <Text style={[styles.codeHighlightText, { color: theme.text }]}>
                  {founderCode}
                </Text>
                <Ionicons name="copy-outline" size={16} color={theme.textSecondary} />
              </View>
            )}
          </View>
        </View>
        
        {/* Step 4 */}
        <View style={styles.verificationStep}>
          <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
            <Text style={styles.stepNumberText}>4</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Ionicons name="chatbox-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                Run the verification command
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              In the verification channel, type the following command:
            </Text>
            
            {/* Command box */}
            <View style={[styles.commandContainer, {
              backgroundColor: theme.isDark ? '#2A2A2A' : '#F0F0F0',
              borderColor: theme.border
            }]}>
              <Text style={[styles.commandText, { color: theme.isDark ? '#FFFFFF' : '#000000' }]}>
                !verify {founderCode || 'YOUR-FOUNDER-CODE'} YourDiscordUsername
              </Text>
              <Text style={[styles.commandExample, { color: theme.textSecondary }]}>
                Example: !verify {founderCode || 'LC-1234'} JohnDoe#1234
              </Text>
            </View>
          </View>
        </View>
        
        {/* Step 5 */}
        <View style={styles.verificationStep}>
          <View style={[styles.stepNumber, { backgroundColor: DISCORD_BLUE }]}>
            <Text style={styles.stepNumberText}>5</Text>
          </View>
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <Ionicons name="checkmark-circle-outline" size={18} color={DISCORD_BLUE} style={{marginRight: 6}} />
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                Verification complete!
              </Text>
            </View>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              Once verified, you'll automatically receive the Founder role
            </Text>
            <Text style={[styles.stepDescription, { color: theme.textSecondary }]}>
              This gives you access to exclusive #founders-corner channels
            </Text>
          </View>
        </View>
      </View>

      {/* Help Section */}
      <View style={[styles.helpSection, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
      }]}>
        <View style={styles.helpHeader}>
          <Ionicons name="help-circle-outline" size={22} color={theme.primary} />
          <Text style={[styles.helpTitle, { color: theme.text }]}>
            Need Help?
          </Text>
        </View>
        <Text style={[styles.helpText, { color: theme.textSecondary }]}>
          If you encounter issues during verification, you can:
        </Text>
        <View style={styles.helpOption}>
          <Ionicons name="chatbubble-outline" size={16} color={theme.primary} />
          <Text style={[styles.helpOptionText, { color: theme.textSecondary }]}>
            Type <Text style={styles.helpCommand}>!help</Text> in the verification channel
          </Text>
        </View>
        <View style={styles.helpOption}>
          <Ionicons name="person-outline" size={16} color={theme.primary} />
          <Text style={[styles.helpOptionText, { color: theme.textSecondary }]}>
            Contact an admin or moderator in Discord
          </Text>
        </View>
      </View>

      {/* Important Note */}
      <View style={[styles.noteSection, { 
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
        borderColor: '#FFC107',
      }]}>
        <Ionicons name="information-circle-outline" size={20} color="#FFC107" />
        <Text style={[styles.noteText, { color: theme.text }]}>
          Each founder code can only be verified once and is permanently linked to your Discord account.
        </Text>
      </View>
    </ScrollView>
  );
};

// Screen wrapper components for Tab Navigator
const CommunityTabScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [founderCode, setFounderCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);

  // Get shared state from parent - we'll need to pass these down
  // For now, let's load them here too
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const existingCode = await founderCodeService.getFounderCode();
        if (existingCode) {
          setFounderCode(existingCode);
          const verified = await founderCodeService.isVerified();
          setIsVerified(verified);
        }
      } catch (error) {
        setError('Unable to load founder status');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleAssignCode = async () => {
    // Implementation similar to main component
    setIsAssigning(true);
    try {
      const result = await founderCodeService.assignFounderCode({});
      if (result.success) {
        setFounderCode(result.founderCode);
        setError(null);
      } else {
        setError(result.error || "Unable to assign founder code");
      }
    } catch (error) {
      setError("Unable to assign founder code");
    } finally {
      setIsAssigning(false);
    }
  };

  const copyToClipboard = () => {
    if (founderCode) {
      Clipboard.setString(founderCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const openDiscord = () => {
    Linking.openURL('https://discord.gg/HstGurfC');
  };

  return (
    <CommunityTab
      founderCode={founderCode}
      isVerified={isVerified}
      isLoading={isLoading}
      isAssigning={isAssigning}
      error={error}
      theme={theme}
      onAssignCode={handleAssignCode}
      onCopyCode={copyToClipboard}
      onOpenDiscord={openDiscord}
      isCopied={isCopied}
    />
  );
};

const WhyJoinTabScreen = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <WhyJoinTab theme={theme} />
  );
};

const VerificationTabScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [founderCode, setFounderCode] = useState(null);

  useEffect(() => {
    const loadFounderCode = async () => {
      try {
        const existingCode = await founderCodeService.getFounderCode();
        setFounderCode(existingCode);
      } catch (error) {
        console.error('Error loading founder code:', error);
      }
    };
    
    loadFounderCode();
  }, []);

  return (
    <VerificationTab
      founderCode={founderCode}
      theme={theme}
    />
  );
};

const DeveloperTabScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [serviceMode, setServiceMode] = useState(founderCodeService.constants.MODES.MOCK);
  const [testScenario, setTestScenario] = useState('success');
  const [statusLogs, setStatusLogs] = useState([]);
  const [founderSpotsRemaining, setFounderSpotsRemaining] = useState(237);

  const addLog = (message, type = 'info') => {
    setStatusLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const handleSetServiceMode = async (mode) => {
    await founderCodeService.setServiceMode(mode);
    setServiceMode(mode);
    addLog(`Switched to ${mode} mode`, 'info');
  };

  const handleClearFounderData = async () => {
    const success = await founderCodeService.clearFounderData();
    if (success) {
      addLog('Founder data cleared successfully', 'info');
    } else {
      addLog('Failed to clear founder data', 'error');
    }
    return success;
  };

  return (
    <DeveloperTab
      theme={theme}
      serviceMode={serviceMode}
      setServiceMode={handleSetServiceMode}
      testScenario={testScenario}
      setTestScenario={setTestScenario}
      statusLogs={statusLogs}
      onClearData={handleClearFounderData}
      founderSpotsRemaining={founderSpotsRemaining}
    />
  );
};

const CommunityScreen = ({ navigation, route }) => {
  // Get theme from context instead of props
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const isDarkMode = theme.background === '#000000';
  const [founderCode, setFounderCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [error, setError] = useState(null);
  
  // Celebration modal states
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [showAlreadyAssignedModal, setShowAlreadyAssignedModal] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState('community');
  
  // For founder spots banner - start with a default that will be updated
  const [founderSpotsRemaining, setFounderSpotsRemaining] = useState(237);
  
  // For test mode
  const [showTestMode, setShowTestMode] = useState(__DEV__);
  const [serviceMode, setServiceMode] = useState(founderCodeService.constants.MODES.MOCK);
  const [testScenario, setTestScenario] = useState('success');
  const [statusLogs, setStatusLogs] = useState([]);
  
  // Animation values
  const codeScale = useRef(new Animated.Value(1)).current;
  
  // Function to add a log entry
  const addLog = (message, type = 'info') => {
    setStatusLogs(prev => [...prev, { message, type, timestamp: new Date() }]);
  };
  
  // Function to clear logs
  const clearLogs = () => {
    setStatusLogs([]);
  };
  
  // Function to set service mode
  const handleSetServiceMode = async (mode) => {
    await founderCodeService.setServiceMode(mode);
    setServiceMode(mode);
    addLog(`Switched to ${mode} mode`, 'info');
  };
  
  // Function to clear founder data
  const handleClearFounderData = async () => {
    const success = await founderCodeService.clearFounderData();
    if (success) {
      setFounderCode(null);
      setIsVerified(false);
      addLog('Founder data cleared', 'success');
    } else {
      addLog('Failed to clear founder data', 'error');
    }
  };
  
  // Function to fetch the latest count of available founder spots
  const fetchFounderSpotsRemaining = async () => {
    try {
      addLog('Fetching founder spots remaining...', 'info');
      
      // Using your actual API Gateway endpoint
      const response = await fetch('https://8uucuqeys9.execute-api.ap-southeast-2.amazonaws.com/prod/available-spots');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (data && data.success && typeof data.availableSpots === 'number') {
        addLog(`Founder spots: ${data.availableSpots} remaining`, 'success');
        setFounderSpotsRemaining(data.availableSpots);
        
        // Store in AsyncStorage for offline access
        await AsyncStorage.setItem('founderSpotsRemaining', data.availableSpots.toString());
        
        // We could also store the total, assigned, and verified spots for more detailed displays
        if (typeof data.totalSpots === 'number') {
          await AsyncStorage.setItem('founderTotalSpots', data.totalSpots.toString());
        }
        if (typeof data.assignedSpots === 'number') {
          await AsyncStorage.setItem('founderAssignedSpots', data.assignedSpots.toString());
        }
        if (typeof data.verifiedSpots === 'number') {
          await AsyncStorage.setItem('founderVerifiedSpots', data.verifiedSpots.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching founder spots:', error);
      addLog(`Error fetching spots: ${error.message}`, 'error');
      // If fetch fails, we'll rely on the cached value from AsyncStorage (already loaded in initial effect)
    }
  };
  
  // Fetch the founder code and check verification status on component mount
  useEffect(() => {
    const initializeScreen = async () => {
      try {
        clearLogs();
        addLog('Initializing community screen...', 'info');
        
        // Get the current service mode
        const mode = await founderCodeService.getServiceMode();
        setServiceMode(mode);
        addLog(`Service mode: ${mode}`, 'info');
        
        // Get initial spots remaining from AsyncStorage (if available)
        const remainingSpots = await AsyncStorage.getItem('founderSpotsRemaining');
        if (remainingSpots) {
          setFounderSpotsRemaining(parseInt(remainingSpots));
          addLog(`Loaded cached spots: ${remainingSpots}`, 'info');
        }
        
        // Fetch the latest data
        await fetchFounderSpotsRemaining();
        
        // Fetch founder code and check verification status
        await fetchFounderCode();
        await checkVerificationStatus();
        
        addLog('Screen initialization complete', 'success');
      } catch (error) {
        console.error('Error initializing community screen:', error);
        addLog(`Initialization error: ${error.message}`, 'error');
        setError('Unable to initialize screen');
        setIsLoading(false);
      }
    };
    
    initializeScreen();
    
    // Set up a refresh interval to periodically update the count
    const refreshInterval = setInterval(fetchFounderSpotsRemaining, 60000); // Refresh every minute
    
    return () => {
      clearInterval(refreshInterval); // Clean up the interval when component unmounts
    };
  }, []);
  
  // Animation when code is copied
  useEffect(() => {
    if (isCopied) {
      Animated.sequence([
        Animated.timing(codeScale, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(codeScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Reset the copied state after 2 seconds
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isCopied, codeScale]);
  
  const fetchFounderCode = async () => {
    try {
      setIsLoading(true);
      addLog('Checking for existing founder code...', 'info');
      
      // First check if we already have a code stored
      const existingCode = await founderCodeService.getFounderCode();
      
      if (existingCode) {
        addLog(`Found existing code: ${existingCode}`, 'success');
        setFounderCode(existingCode);
        setIsLoading(false);
        return;
      }
      
      addLog('No existing code found', 'info');
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching founder code:', error);
      addLog(`Error fetching code: ${error.message}`, 'error');
      setError('Unable to load founder status');
      setIsLoading(false);
    }
  };
  
  const checkVerificationStatus = async () => {
    try {
      addLog('Checking verification status...', 'info');
      const verified = await founderCodeService.isVerified();
      setIsVerified(verified);
      addLog(`Verification status: ${verified ? 'Verified' : 'Not verified'}`, 'info');
    } catch (error) {
      console.error('Error checking verification status:', error);
      addLog(`Error checking verification: ${error.message}`, 'error');
    }
  };
  
  const handleAssignCode = async () => {
    try {
      setIsAssigning(true);
      setError(null);
      addLog('Assigning founder code...', 'info');
      
      let options = {};
      
      if (serviceMode === founderCodeService.constants.MODES.MOCK) {
        // Test mode options
        options = {
          testScenario: testScenario,
          isTestMode: true
        };
      } else {
        // Production mode - get App Store receipt
        addLog('Getting App Store receipt...', 'info');
        try {
          const receiptData = await getAppStoreReceipt();
          options = {
            receiptData: receiptData,
            isTestMode: false
          };
          addLog('Receipt obtained successfully', 'success');
        } catch (receiptError) {
          addLog(`Receipt error: ${receiptError.message}`, 'error');
          // Fallback to test mode if receipt fails in development
          if (__DEV__) {
            options = {
              testScenario: 'success',
              isTestMode: true
            };
            addLog('Falling back to test mode', 'info');
          } else {
            throw receiptError;
          }
        }
      }
      
      // Call the appropriate method based on mode
      const result = await founderCodeService.assignFounderCode(options);
      
      if (result.success) {
        setFounderCode(result.code);
        addLog(`Assigned code: ${result.code}`, 'success');
        
        if (result.alreadyAssigned) {
          addLog('Code was already assigned', 'info');
          // Show upbeat already assigned modal instead of basic alert
          setShowAlreadyAssignedModal(true);
        } else {
          // Show congratulations celebration modal for new founder code
          addLog('New code assigned successfully', 'success');
          setShowSuccessCelebration(true);
          
          // Update the founder spots count if a new code was assigned
          const newSpotsRemaining = founderSpotsRemaining - 1;
          setFounderSpotsRemaining(newSpotsRemaining);
          await AsyncStorage.setItem('founderSpotsRemaining', newSpotsRemaining.toString());
          addLog(`Updated spots remaining: ${newSpotsRemaining}`, 'info');
        }
      } else {
        setError(result.error || "Unable to assign founder code");
        addLog(`Assignment failed: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Error assigning founder code:', error);
      addLog(`Assignment error: ${error.message}`, 'error');
      setError('Network error or service unavailable');
    } finally {
      setIsAssigning(false);
    }
  };
  
  const copyToClipboard = () => {
    if (founderCode) {
      Clipboard.setString(founderCode);
      setIsCopied(true);
      addLog('Code copied to clipboard', 'success');
    }
  };
  
  // Get App Store receipt for production validation
  const getAppStoreReceipt = async () => {
    try {
      // Import React Native IAP for receipt handling
      const RNIap = require('react-native-iap');
      
      // Get the receipt
      const receiptData = await RNIap.getReceiptIOS();
      
      if (!receiptData) {
        throw new Error('No receipt found on device');
      }
      
      // Convert to base64 if needed
      return receiptData;
    } catch (error) {
      console.error('Error getting App Store receipt:', error);
      throw new Error(`Failed to get receipt: ${error.message}`);
    }
  };
  
  const openDiscord = () => {
    addLog('Opening Discord...', 'info');
    Linking.openURL('https://discord.gg/HstGurfC');
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with safe area */}
      <View style={[styles.header, { 
        paddingTop: insets.top + 10,
        paddingHorizontal: insets.left || 20,
      }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          accessible={true}
          accessibilityLabel="Back button"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Join Our Community
        </Text>
        <View style={styles.placeholderRight} />
      </View>

      {/* Tab Navigator - Swipeable */}
      <NavigationContainer 
        independent={true}
        theme={{
          dark: isDarkMode,
          colors: {
            background: theme.background,
            card: theme.card,
            text: theme.text,
            border: theme.border,
            notification: theme.primary,
            primary: theme.primary,
          },
        }}
      >
        <Tab.Navigator
          initialRouteName="Community"
          screenOptions={{
            tabBarActiveTintColor: isDarkMode ? '#FFFFFF' : '#000000',
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: { 
              backgroundColor: isDarkMode ? '#000000' : theme.card,
              elevation: 0,
              shadowOpacity: 0,
              borderRadius: 0,
              marginHorizontal: 0,
            },
            tabBarIndicatorStyle: {
              backgroundColor: theme.primary,
              height: 3,
            },
            tabBarLabelStyle: {
              fontSize: 14,
              fontWeight: '600',
              textTransform: 'none',
            },
            tabBarContentContainerStyle: {
              alignItems: 'center',
            },
            swipeEnabled: true,
            tabBarScrollEnabled: false,
            sceneStyle: { backgroundColor: theme.background },
          }}
        >
          <Tab.Screen 
            name="Community" 
            component={CommunityTabScreen}
            options={{
              tabBarAccessibilityLabel: "Community tab",
            }}
          />
          <Tab.Screen 
            name="Why Join?" 
            component={WhyJoinTabScreen}
            options={{
              tabBarAccessibilityLabel: "Why Join tab",
            }}
          />
          <Tab.Screen 
            name="Verification" 
            component={VerificationTabScreen}
            options={{
              tabBarAccessibilityLabel: "Verification tab",
            }}
          />
          <Tab.Screen 
            name="Developer" 
            component={DeveloperTabScreen}
            options={{
              tabBarAccessibilityLabel: "Developer tab",
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
};

const bannerStyles = StyleSheet.create({
  container: {
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    alignSelf: 'center',
  },
  content: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    fontSize: 16,
    flex: 1,
  },
  progressContainer: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRadius: 12,
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  }
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholderRight: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 120,
  },
  discordLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  discordLogo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: DISCORD_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  discordText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: DISCORD_BLUE,
    marginTop: 8,
  },
  
  // Dev Mode Banner
  devBanner: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  devBannerText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 6,
  },
  
  // Test Mode Panel
  testModePanel: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  testModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  testModeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testModeOption: {
    marginBottom: 12,
  },
  testModeLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  testModeSegment: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    flexWrap: 'wrap',
  },
  testModeSegmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 6,
  },
  testModeSegmentText: {
    fontSize: 12,
  },
  testModeButton: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  testModeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  testModeNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'center',
  },
  testModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  testModeToggleText: {
    fontSize: 12,
    marginRight: 4,
  },
  
  // Status Log
  statusLogContainer: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    maxHeight: 150,
  },
  statusLogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  statusLogTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  statusLogContent: {
    maxHeight: 120,
  },
  statusLogItems: {
    padding: 8,
  },
  statusLogItem: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
  
  // Founder Card
  founderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  founderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  founderCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  founderCardBody: {
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  codeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  copyIconContainer: {
    padding: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginTop: 10,
  },
  verifiedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DISCORD_BLUE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  noCodeContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCodeText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 16,
    textAlign: 'center',
  },
  assignButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  mockPurchaseButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  mockPurchaseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mockPurchaseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Benefits Card
  // Welcome Section Styles
  welcomeSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  welcomeIcon: {
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Features Grid Styles
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  featureCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Founder Benefits Styles
  founderBenefitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  founderBenefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  founderBenefitsSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  founderBenefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  founderBenefitItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  founderBenefitText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },

  // Why Join Tab Styles
  whyJoinHeader: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  whyJoinTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  whyJoinSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  whyJoinSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 16,
  },
  whyJoinBenefit: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  whyJoinIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  whyJoinBenefitContent: {
    flex: 1,
  },
  whyJoinBenefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  whyJoinBenefitDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  domainsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  domainGridCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    minHeight: 110,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  domainGridIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  domainGridTitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
  },

  // Modal Popup Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalPopup: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalPopupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalPopupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPopupClose: {
    padding: 4,
  },
  modalPopupTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 26,
  },
  modalPopupContent: {
    // Remove maxHeight to allow full content to show
  },
  modalPopupDesc: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalPopupCommunities: {
    marginTop: 8,
  },
  modalPopupCommunitiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalPopupCommunitiesSubtitle: {
    fontSize: 14,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  modalPopupChannelsContainer: {
    gap: 8,
  },
  modalPopupChannel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  modalPopupChannelText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  whyJoinCTA: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaDesc: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },

  benefitsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitsSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitContent: {
    marginLeft: 12,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  benefitDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  
  // Instructions Card
  instructionsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  verificationHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  instructionsSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  verificationStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  codeHighlight: {
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  codeHighlightText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    fontWeight: '500',
  },
  commandContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  commandText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  commandExample: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  helpContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(63, 81, 181, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  helpText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    marginTop: 12,
    padding: 8,
    alignItems: 'center',
  },
  noteText: {
    fontSize: 13,
    marginLeft: 6,
    fontStyle: 'italic',
    flex: 1,
  },
  
  // Bottom Button
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'transparent',
  },
  discordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  discordButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Celebration Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  celebrationModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  successCodeContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
    alignItems: 'center',
  },
  successCodeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  successCodeText: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  benefitsPreview: {
    width: '100%',
    marginBottom: 20,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
  },
  celebrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: '100%',
  },
  celebrationButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  upbeatMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  upbeatText: {
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  
  tabContent: {
    flex: 1,
  },
  tabContentContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  
  // Clean Community Tab Styles
  discordSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  discordTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  discordSubtitle: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  founderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'center',
  },
  founderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  founderSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  codeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 16,
  },
  codeDisplay: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  copyIcon: {
    padding: 4,
  },
  noCodeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  noCodeDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  
  // Developer Tab Styles
  devInstructions: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
  },
  devInstructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  devInstructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  devInstructionsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  devTip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  devTipText: {
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  
  // Verification Tab Styles
  verificationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  verificationIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  stepsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  helpSection: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helpOptionText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  helpCommand: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: 'bold',
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  
  // Referral Section Styles
  referralCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  referralHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  referralTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  referralSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    marginBottom: 20,
  },
  referralCodeContent: {
    flex: 1,
  },
  referralCodeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  referralCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  referralActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  referralButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
  },
  primaryReferralButton: {
    // backgroundColor set dynamically
  },
  secondaryReferralButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  referralButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  referralButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  recentActivity: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 16,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentDate: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Referral Management Styles (Developer Tab)
  referralManagement: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  referralManagementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  referralManagementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  referralStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 6,
  },
  referralStatusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  referralButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  referralTestButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    minWidth: '48%',
    alignItems: 'center',
    marginBottom: 8,
  },
  referralTestButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  referralManagementInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  referralManagementInfoText: {
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});

export default CommunityScreen;
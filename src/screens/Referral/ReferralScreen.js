// src/screens/Referral/ReferralScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import PagerView from 'react-native-pager-view';

// Import components
import ReferralDetails from './ReferralDetails';
import ReferralStats from './ReferralStats';
import ReferralInfo from './ReferralInfo';

// Import service
import ReferralService from './ReferralService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ReferralScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { showSuccess, showError } = useNotification() || { 
    showSuccess: (msg) => console.log(msg),
    showError: (msg) => console.log(msg)
  };
  const { user } = useAuth() || { user: { id: 'test-user', email: 'test@example.com' } };
  
  // State
  const [activeTab, setActiveTab] = useState(0); // Use numeric index for PagerView
  const [referralData, setReferralData] = useState({
    code: '',
    link: '',
    stats: { sent: 0, clicked: 0, converted: 0, plansEarned: 0, plansGifted: 0 },
    referrals: [],
    remainingCount: 3,
    loading: true
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  
  // Animation values
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const listFadeIn = useRef(new Animated.Value(0)).current;
  const tabPressAnim = useRef(new Animated.Value(1)).current;
  const celebrationScale = useRef(new Animated.Value(0)).current;
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const trophyBounce = useRef(new Animated.Value(0)).current;
  const statsSlideIn = useRef(new Animated.Value(50)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const buttonPulse = useRef(new Animated.Value(1)).current;
  
  // Sparkle animations (6 sparkles)
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const sparkle3 = useRef(new Animated.Value(0)).current;
  const sparkle4 = useRef(new Animated.Value(0)).current;
  const sparkle5 = useRef(new Animated.Value(0)).current;
  const sparkle6 = useRef(new Animated.Value(0)).current;
  
  // Add pager ref for swipe functionality
  const pagerRef = useRef(null);
  
  useEffect(() => {
    loadReferralData();
  }, []);
  
  const loadReferralData = async () => {
    try {
      setReferralData(prev => ({ ...prev, loading: true }));
      
      // Check for new conversions first
      const newConversions = await ReferralService.checkForNewConversions();
      
      // Get or generate referral code (now device-based)
      const userIdentifier = user?.email?.split('@')[0] || null;
      const code = await ReferralService.setupReferralCode(userIdentifier);
      const link = ReferralService.getReferralLink(code);
      
      // Load referrals and stats
      const referrals = await ReferralService.getSentReferrals();
      const stats = await ReferralService.getReferralStats();
      const remainingCount = await ReferralService.getReferralsRemaining();
      
      setReferralData({
        code,
        link,
        stats,
        referrals,
        remainingCount,
        loading: false
      });
      
      // Show celebration if there are new conversions
      if (newConversions) {
        setCelebrationData(newConversions);
        setShowCelebration(true);
        startCelebrationAnimation();
      }
      
      // Animate the list fade-in
      Animated.timing(listFadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
    } catch (error) {
      console.error('Error loading referral data:', error);
      showError('Could not load referral data. Please try again.');
      setReferralData(prev => ({ ...prev, loading: false }));
    }
  };
  
  // Handle page change when PagerView page changes
  const onPageSelected = (e) => {
    const newIndex = e.nativeEvent.position;
    setActiveTab(newIndex);
  };
  
  // Handle real-time scrolling for tab indicator
  const onPageScroll = (e) => {
    const { position, offset } = e.nativeEvent;
    // Calculate the exact position based on current page and offset
    const exactPosition = position + offset;
    // Update the tab indicator position in real-time
    tabIndicatorPosition.setValue(exactPosition);
  };
  
  // Animation for tab press
  const animateTabPress = (index) => {
    Animated.sequence([
      Animated.timing(tabPressAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(tabPressAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    
    // Set the page using PagerView
    if (pagerRef.current) {
      pagerRef.current.setPage(index);
    }
  };

  // Start celebration animation
  const startCelebrationAnimation = () => {
    // Reset animation values
    celebrationScale.setValue(0);
    celebrationOpacity.setValue(0);
    trophyBounce.setValue(0);
    statsSlideIn.setValue(50);
    statsOpacity.setValue(0);
    buttonPulse.setValue(1);
    
    // Reset sparkles
    sparkle1.setValue(0);
    sparkle2.setValue(0);
    sparkle3.setValue(0);
    sparkle4.setValue(0);
    sparkle5.setValue(0);
    sparkle6.setValue(0);
    
    // Animate in sequence
    Animated.sequence([
      // First: Scale in the modal
      Animated.parallel([
        Animated.spring(celebrationScale, {
          toValue: 1,
          tension: 120,
          friction: 8,
          useNativeDriver: true
        }),
        Animated.timing(celebrationOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]),
      // Then: Bounce the trophy after a short delay
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(trophyBounce, {
          toValue: 1,
          tension: 200,
          friction: 4,
          useNativeDriver: true
        }),
        // Start sparkles with staggered timing
        Animated.stagger(150, [
          Animated.timing(sparkle1, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
          }),
          Animated.timing(sparkle2, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
          }),
          Animated.timing(sparkle3, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
          }),
          Animated.timing(sparkle4, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
          }),
          Animated.timing(sparkle5, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
          }),
          Animated.timing(sparkle6, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
          })
        ])
      ]),
      // Finally: Slide in the stats (reduced delay from 300ms to 100ms)
      Animated.delay(100),
      Animated.parallel([
        Animated.spring(statsSlideIn, {
          toValue: 0,
          tension: 120,
          friction: 7,
          useNativeDriver: true
        }),
        Animated.timing(statsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ])
    ]).start(() => {
      // Start pulsing the button after all animations complete
      const startButtonPulse = () => {
        Animated.sequence([
          Animated.timing(buttonPulse, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true
          }),
          Animated.timing(buttonPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
          })
        ]).start(() => {
          // Repeat the pulse
          setTimeout(startButtonPulse, 1000);
        });
      };
      startButtonPulse();
    });

    // Auto-close after 8 seconds
    setTimeout(() => {
      if (showCelebration) {
        closeCelebration();
      }
    }, 8000);
  };

  // Close celebration modal
  const closeCelebration = () => {
    Animated.parallel([
      Animated.spring(celebrationScale, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true
      }),
      Animated.timing(celebrationOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowCelebration(false);
      setCelebrationData(null);
    });
  };
  
  // Dev-only function to mock a conversion
  const mockConversion = async () => {
    if (__DEV__) {
      try {
        // Find an unconverted referral to convert
        const unconvertedReferral = referralData.referrals.find(ref => ref.status !== 'subscribed');
        
        if (unconvertedReferral) {
          // Convert existing unconverted referral
          await ReferralService.mockReferralConversion(unconvertedReferral.id);
          showSuccess('Converted existing referral!');
        } else if (referralData.referrals.length === 0) {
          // No referrals exist, create and convert one
          const newReferral = await ReferralService.createTestReferral('created');
          await ReferralService.mockReferralConversion(newReferral.id);
          showSuccess('Created and converted a test referral!');
        } else {
          // All referrals are already converted, create a new one
          const newReferral = await ReferralService.createTestReferral('created');
          await ReferralService.mockReferralConversion(newReferral.id);
          showSuccess('Created and converted a new test referral!');
        }
        
        // Reload data to reflect changes
        loadReferralData();
      } catch (error) {
        console.error('Error in mock conversion:', error);
        showError('Failed to mock conversion: ' + error.message);
      }
    }
  };

  // Dev-only function to add test data
  const addTestData = async () => {
    if (__DEV__) {
      try {
        await ReferralService.addTestData();
        loadReferralData();
        showSuccess('Added test referral data!');
      } catch (error) {
        console.error('Error adding test data:', error);
        showError('Failed to add test data: ' + error.message);
      }
    }
  };

  // Dev-only function to clear all data
  const clearAllData = async () => {
    if (__DEV__) {
      try {
        await ReferralService.clearAllData();
        loadReferralData();
        showSuccess('Cleared all referral data!');
      } catch (error) {
        console.error('Error clearing data:', error);
        showError('Failed to clear data: ' + error.message);
      }
    }
  };

  // Dev-only function to test celebration
  const testCelebration = async () => {
    if (__DEV__) {
      // Cycle through different conversion counts for testing
      const testScenarios = [
        { newConversions: 1, newPlansEarned: 1, newPlansGifted: 1 },
        { newConversions: 2, newPlansEarned: 2, newPlansGifted: 2 },
        { newConversions: 3, newPlansEarned: 3, newPlansGifted: 3 }
      ];
      
      const scenario = testScenarios[Math.floor(Math.random() * testScenarios.length)];
      const testData = {
        ...scenario,
        totalConverted: 3,
        totalPlansEarned: 3,
        totalPlansGifted: 3
      };
      
      setCelebrationData(testData);
      setShowCelebration(true);
      startCelebrationAnimation();
    }
  };

  // Dev-only function to test first visit scenario
  const testFirstVisit = async () => {
    if (__DEV__) {
      try {
        // Clear last visit stats to simulate first visit
        await AsyncStorage.removeItem('lastVisitStats');
        // Add some test data so user has conversions on "first" visit
        await ReferralService.addTestData();
        // Reload to trigger celebration
        loadReferralData();
        showSuccess('Simulated first visit with existing conversions!');
      } catch (error) {
        console.error('Error testing first visit:', error);
        showError('Failed to test first visit: ' + error.message);
      }
    }
  };

  // Get sparkle position around the trophy
  const getSparklePosition = (index) => {
    const positions = [
      { top: 10, left: -20 },  // Top left
      { top: 10, right: -20 }, // Top right  
      { top: 30, left: -35 },  // Middle left
      { top: 30, right: -35 }, // Middle right
      { bottom: 10, left: -20 }, // Bottom left
      { bottom: 10, right: -20 } // Bottom right
    ];
    return positions[index] || positions[0];
  };
  
  // Render the tab bar with animated indicator
  const renderTabBar = () => {
    // Get dimensions for the tab indicator
    const tabWidth = width / 3;
    
    // Calculate the indicator position
    const indicatorPosition = tabIndicatorPosition.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, tabWidth, tabWidth * 2]
    });
    
    return (
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBar}>
          {/* Animated Tab Indicator */}
          <Animated.View 
            style={[
              styles.tabIndicator, 
              { 
                width: tabWidth * 0.5,
                left: Animated.add(
                  indicatorPosition,
                  tabWidth * 0.25 // Center the indicator
                ),
                backgroundColor: '#4CAF50',
              }
            ]} 
          />
          
          {/* Share Tab */}
          <TouchableOpacity 
            style={styles.tab} 
            onPress={() => animateTabPress(0)}
            activeOpacity={0.7}
          >
            <Animated.View style={styles.tabInner}>
              <Ionicons
                name={activeTab === 0 ? "share" : "share-outline"}
                size={18}
                color={activeTab === 0 ? '#4CAF50' : '#9E9E9E'}
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText, 
                { 
                  color: activeTab === 0 ? '#4CAF50' : '#9E9E9E',
                  fontWeight: activeTab === 0 ? '700' : '500' 
                }
              ]}>
                Share
              </Text>
            </Animated.View>
          </TouchableOpacity>
          
          {/* Stats Tab */}
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => animateTabPress(1)}
            activeOpacity={0.7}
          >
            <Animated.View style={styles.tabInner}>
              <Ionicons
                name={activeTab === 1 ? "stats-chart" : "stats-chart-outline"}
                size={18}
                color={activeTab === 1 ? '#4CAF50' : '#9E9E9E'}
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText, 
                { 
                  color: activeTab === 1 ? '#4CAF50' : '#9E9E9E',
                  fontWeight: activeTab === 1 ? '700' : '500' 
                }
              ]}>
                Stats
              </Text>
            </Animated.View>
          </TouchableOpacity>
          
          {/* How It Works Tab */}
          <TouchableOpacity 
            style={styles.tab}
            onPress={() => animateTabPress(2)}
            activeOpacity={0.7}
          >
            <Animated.View style={styles.tabInner}>
              <Ionicons
                name={activeTab === 2 ? "information-circle" : "information-circle-outline"}
                size={18}
                color={activeTab === 2 ? '#4CAF50' : '#9E9E9E'}
                style={styles.tabIcon}
              />
              <Text style={[
                styles.tabText, 
                { 
                  color: activeTab === 2 ? '#4CAF50' : '#9E9E9E',
                  fontWeight: activeTab === 2 ? '700' : '500' 
                }
              ]}>
                How It Works
              </Text>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#3F51B5' }]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#3F51B5" 
      />
      
      {/* Hero Banner with Back Button Integrated */}
      <View style={styles.heroSection}>
        {/* Back Button Positioned in Hero */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Hero Content */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>
            Give 500 Credits, Get 500 Credits
          </Text>
          <Text style={styles.heroSubtitle}>
            Share LifeCompass with friends and you'll both get 500 AI credits when they sign up
          </Text>
        </View>
        
        <View style={styles.heroIconContainer}>
          <Ionicons name="gift-outline" size={45} color="#FFFFFF" />
          <Ionicons name="share-social" size={24} color="#FFFFFF" style={styles.secondaryIcon} />
        </View>
      </View>
      
      {/* Remaining Counter */}
      <View style={styles.remainingContainer}>
        <Text style={styles.remainingText}>
          <Ionicons name="people" size={16} color="#4CAF50" /> Referrals Remaining: {' '}
          <Text style={{ fontWeight: 'bold', color: '#4CAF50' }}>
            {referralData.remainingCount}/3
          </Text>
        </Text>
      </View>
      
      {/* Tab Bar */}
      {renderTabBar()}
      
      {/* Loading Indicator */}
      {referralData.loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <Animated.View 
          style={{
            flex: 1,
            opacity: listFadeIn
          }}
        >
          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={activeTab}
            onPageSelected={onPageSelected}
            onPageScroll={onPageScroll}
            pageMargin={10}
          >
            {/* Share Page */}
            <View key="share" style={styles.pageContainer}>
              <ReferralDetails 
                data={referralData} 
                onRefresh={loadReferralData} 
                showSuccess={showSuccess}
                showError={showError}
                theme={theme}
              />
            </View>
            
            {/* Stats Page */}
            <View key="stats" style={styles.pageContainer}>
              <ReferralStats 
                data={referralData} 
                theme={theme} 
              />
            </View>
            
            {/* How It Works Page */}
            <View key="info" style={styles.pageContainer}>
              <ReferralInfo 
                theme={theme} 
              />
            </View>
          </PagerView>
        </Animated.View>
      )}
      
      {/* Debug buttons in dev mode */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <View style={styles.debugRow}>
            <TouchableOpacity
              style={[styles.debugButton, styles.debugButtonSmall]}
              onPress={mockConversion}
            >
              <Text style={styles.debugButtonText}>Mock Conversion</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.debugButton, styles.debugButtonSmall, { backgroundColor: '#2196F3' }]}
              onPress={addTestData}
            >
              <Text style={styles.debugButtonText}>Add Test Data</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.debugRow}>
            <TouchableOpacity
              style={[styles.debugButton, styles.debugButtonSmall, { backgroundColor: '#FF9800' }]}
              onPress={testCelebration}
            >
              <Text style={styles.debugButtonText}>Test Celebration</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.debugButton, styles.debugButtonSmall, { backgroundColor: '#9C27B0' }]}
              onPress={testFirstVisit}
            >
              <Text style={styles.debugButtonText}>Test First Visit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.debugRow}>
            <TouchableOpacity
              style={[styles.debugButton, styles.debugButtonSmall, { backgroundColor: '#F44336' }]}
              onPress={clearAllData}
            >
              <Text style={styles.debugButtonText}>Clear Data</Text>
            </TouchableOpacity>
            <View style={[styles.debugButton, styles.debugButtonSmall, { opacity: 0 }]} />
          </View>
        </View>
      )}

      {/* Celebration Modal */}
      <Modal
        visible={showCelebration}
        transparent={true}
        animationType="none"
        onRequestClose={closeCelebration}
      >
        <View style={styles.celebrationOverlay}>
          <Animated.View 
            style={[
              styles.celebrationModal,
              {
                transform: [{ scale: celebrationScale }],
                opacity: celebrationOpacity
              }
            ]}
          >
            {/* Celebration Header */}
            <View style={styles.celebrationHeader}>
              <View style={styles.trophyContainer}>
                <Animated.View
                  style={{
                    transform: [{
                      scale: trophyBounce.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.3, 1.2, 1]
                      })
                    }]
                  }}
                >
                  <Ionicons name="trophy" size={60} color="#FFD700" />
                </Animated.View>
                
                {/* Sparkle Effects */}
                {[sparkle1, sparkle2, sparkle3, sparkle4, sparkle5, sparkle6].map((sparkle, index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.sparkle,
                      {
                        ...getSparklePosition(index),
                        transform: [
                          {
                            translateY: sparkle.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, -60]
                            })
                          },
                          {
                            scale: sparkle.interpolate({
                              inputRange: [0, 0.2, 0.8, 1],
                              outputRange: [0, 1, 1, 0]
                            })
                          },
                          {
                            rotate: sparkle.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg']
                            })
                          }
                        ],
                        opacity: sparkle.interpolate({
                          inputRange: [0, 0.1, 0.9, 1],
                          outputRange: [0, 1, 1, 0]
                        })
                      }
                    ]}
                  >
                    <Text style={styles.sparkleText}>✨</Text>
                  </Animated.View>
                ))}
              </View>
              <Text style={styles.celebrationTitle}>🎉 Congratulations! 🎉</Text>
            </View>
            
            {/* Celebration Content */}
            <View style={styles.celebrationContent}>
              <Text style={styles.celebrationSubtitle}>
                {celebrationData?.newConversions === 1 
                  ? "You got a new referral conversion!" 
                  : celebrationData?.newConversions === 2
                  ? "Amazing! You got 2 new referral conversions!"
                  : celebrationData?.newConversions === 3
                  ? "Incredible! You got 3 new referral conversions!"
                  : `Wow! You got ${celebrationData?.newConversions} new referral conversions!`
                }
              </Text>
              
              <Animated.View 
                style={[
                  styles.celebrationStats,
                  {
                    transform: [{ translateY: statsSlideIn }],
                    opacity: statsOpacity
                  }
                ]}
              >
                <View style={styles.celebrationStat}>
                  <Text style={styles.celebrationStatLabel}>You Earned</Text>
                  <Text style={styles.celebrationStatValue}>
                    {(celebrationData?.newPlansEarned || 0) * 500} credits
                  </Text>
                  <Text style={styles.celebrationStatSubtext}>AI Assistant</Text>
                </View>
                
                <View style={styles.celebrationStat}>
                  <Text style={styles.celebrationStatLabel}>You Gifted</Text>
                  <Text style={styles.celebrationStatValue}>
                    {(celebrationData?.newPlansGifted || 0) * 500} credits
                  </Text>
                  <Text style={styles.celebrationStatSubtext}>AI Assistant</Text>
                </View>
              </Animated.View>
              
              <Text style={styles.celebrationMessage}>
                Keep sharing LifeCompass with friends to earn even more AI credits! 🚀
              </Text>
            </View>
            
            {/* Close Button */}
            <Animated.View
              style={{
                transform: [{ scale: buttonPulse }]
              }}
            >
              <TouchableOpacity 
                style={styles.celebrationCloseButton}
                onPress={closeCelebration}
              >
                <Text style={styles.celebrationCloseText}>Awesome!</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F51B5',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    paddingTop: 15,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#3F51B5',
    position: 'relative',
  },
  heroContent: {
    flex: 1,
    paddingRight: 12,
    marginLeft: 30,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  heroIconContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  secondaryIcon: {
    position: 'absolute',
    bottom: 10,
    right: 0,
  },
  remainingContainer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#1E1E1E',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  remainingText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: '500',
  },
  // Tab Bar Styles
  tabBarContainer: {
    position: 'relative',
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 2,
  },
  tabBar: {
    flexDirection: 'row',
    position: 'relative',
    paddingTop: 8,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 4,
    borderRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    marginRight: 8,
  },
  tabText: {
    fontSize: 14,
  },
  pagerView: {
    flex: 1,
    backgroundColor: '#121212',
  },
  pageContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  debugContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  debugRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  debugButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  debugButtonSmall: {
    paddingVertical: 6,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  // Celebration Modal Styles
  celebrationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  celebrationModal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    padding: 30,
    maxWidth: 350,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  celebrationHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trophyContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 80,
  },
  sparkle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkleText: {
    fontSize: 16,
    color: '#FFD700',
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 15,
  },
  celebrationContent: {
    alignItems: 'center',
    marginBottom: 25,
  },
  celebrationSubtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  celebrationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  celebrationStat: {
    alignItems: 'center',
    flex: 1,
  },
  celebrationStatLabel: {
    fontSize: 14,
    color: '#9E9E9E',
    marginBottom: 5,
  },
  celebrationStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  celebrationStatSubtext: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginTop: 2,
  },
  celebrationMessage: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: 20,
  },
  celebrationCloseButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  celebrationCloseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ReferralScreen;
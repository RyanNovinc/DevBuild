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
  Dimensions
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
    stats: { sent: 0, clicked: 0, converted: 0, earned: '$0.00' },
    referrals: [],
    remainingCount: 3,
    loading: true
  });
  
  // Animation values
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const listFadeIn = useRef(new Animated.Value(0)).current;
  const tabPressAnim = useRef(new Animated.Value(1)).current;
  
  // Add pager ref for swipe functionality
  const pagerRef = useRef(null);
  
  useEffect(() => {
    loadReferralData();
  }, []);
  
  const loadReferralData = async () => {
    try {
      setReferralData(prev => ({ ...prev, loading: true }));
      
      // Get or generate referral code
      const userIdentifier = user?.email?.split('@')[0] || 'user';
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
  
  // Dev-only function to mock a conversion
  const mockConversion = async () => {
    if (__DEV__ && referralData.referrals.length > 0) {
      await ReferralService.mockReferralConversion(referralData.referrals[0].id);
      loadReferralData();
      showSuccess('Mocked a referral conversion!');
    }
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
            Give 50% Off, Get 50% Off
          </Text>
          <Text style={styles.heroSubtitle}>
            Share LifeCompass with friends and you'll both get 50% off your next month of any AI subscription
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
      
      {/* Debug button in dev mode */}
      {__DEV__ && (
        <TouchableOpacity
          style={styles.debugButton}
          onPress={mockConversion}
        >
          <Text style={styles.debugButtonText}>DEV: Mock Conversion</Text>
        </TouchableOpacity>
      )}
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
  debugButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
});

export default ReferralScreen;
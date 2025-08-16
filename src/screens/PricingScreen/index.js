// src/screens/PricingScreen/index.js - Updated with scarcity implementation
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Share,
  Animated,
  Easing,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
  FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CountdownTimer from './components/CountdownTimer';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import ReferralCodeInputModal from '../../components/ReferralCodeInputModal';

// Import responsive utilities
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  isSmallDevice,
  isTablet,
  spacing,
  fontSizes,
  useScreenDimensions,
  useSafeSpacing,
  useIsLandscape,
  ensureAccessibleTouchTarget,
  getByDeviceSize
} from '../../utils/responsive';

// Import styles
import styles from './styles';

// Import utility functions
import { generateReferralCode, getMonthlyRate } from './utils';

// Import scarcity utilities
import FounderCheckpoint from './utils/FounderCheckpoint';
import FounderMessaging from './utils/FounderMessaging';

// Import referral backend service
import referralBackendService from '../../services/ReferralBackendService';

// Component imports
import ViewToggle from './components/ViewToggle';
import TestModeToggles from './components/TestModeToggles';
import BillingSelector from './components/BillingSelector';
import MinimalFounderPlan from './components/PlanCards/MinimalFounderPlan';
import BlackMinimalFounderPlan from './components/PlanCards/BlackMinimalFounderPlan';
import UnifiedBlackPlan from './components/PlanCards/UnifiedBlackPlan';
import CompassAIPlan from './components/PlanCards/CompassAIPlan';
import NavigatorAIPlan from './components/PlanCards/NavigatorAIPlan';
import GuideAIPlan from './components/PlanCards/GuideAIPlan';
import BlackMinimalAIPlans from './components/PlanCards/BlackMinimalAIPlans';
import IsolatedAIPlans from './components/PlanCards/IsolatedAIPlans';
import StaticAIPlans from './components/PlanCards/StaticAIPlans';
import UltraMinimalAIPlans from './components/PlanCards/UltraMinimalAIPlans';
import DumbAIPlans from './components/PlanCards/DumbAIPlans';
import FinalAIPlans from './components/PlanCards/FinalAIPlans';
import SubscriptionPlans from './components/PlanCards/SubscriptionPlans';
import FeatureComparisonTable from './components/FeatureComparisons/FeatureComparisonTable';
import MinimalFeatureTable from './components/FeatureComparisons/MinimalFeatureTable';
import StickyCTA from './components/StickyCTA';
import MinimalStickyCTA from './components/MinimalStickyCTA';
import PricingFootnote from './components/PricingFootnote';

// Scarcity component imports
import FounderSpotsBanner from './components/FounderSpotsBanner';
import FounderContextBanner from './components/FounderContextBanner';
import FounderSocialProof from './components/FounderSocialProof';

const { width, height } = Dimensions.get('window');

const PricingScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { showSuccess } = useNotification() || { 
    showSuccess: (msg) => console.log(msg) 
  };
  
  // Extract initialTab from route params if provided
  const initialTabFromParams = route.params?.initialTab;
  console.log('Initial tab from params:', initialTabFromParams);
  
  // Get responsive dimensions and safe areas
  const safeSpacing = useSafeSpacing();
  const screenDimensions = useScreenDimensions();
  const isLandscape = useIsLandscape();
  
  // State variables - use initialTabFromParams if provided
  const [activeTab, setActiveTab] = useState(initialTabFromParams || 'lifetime');
  
  // Navigation state for TabView - dynamic based on founder spots
  const getNavigationRoutes = () => {
    const isFounderSoldOut = founderSpotsRemaining <= 0;
    return [
      { key: 'lifetime', title: isFounderSoldOut ? 'LifeCompass Plans' : 'Founder Access' },
      { key: 'subscription', title: 'AI Add-ons' }
    ];
  };

  const [navigationState, setNavigationState] = useState({
    index: activeTab === 'subscription' ? 1 : 0,
    routes: getNavigationRoutes()
  });
  
  // Sync navigationState with activeTab
  useEffect(() => {
    const newIndex = activeTab === 'lifetime' ? 0 : 1;
    if (navigationState.index !== newIndex) {
      setNavigationState(prev => ({ ...prev, index: newIndex }));
    }
  }, [activeTab]);

  // Update navigation routes when founder spots change
  useEffect(() => {
    const newRoutes = getNavigationRoutes();
    
    setNavigationState(prev => ({
      ...prev,
      routes: newRoutes
    }));
  }, [founderSpotsRemaining]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState('monthly');
  const [localSubscription, setLocalSubscription] = useState('monthly');
  const [aiPlansBilling, setAiPlansBilling] = useState('monthly');
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [isLifetimeMember, setIsLifetimeMember] = useState(false);
  const [showTestModeToggles, setShowTestModeToggles] = useState(__DEV__);
  const [referralCode, setReferralCode] = useState('');
  const [referralsLeft, setReferralsLeft] = useState(3);
  const [isFromReferral, setIsFromReferral] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [founderSpotsRemaining, setFounderSpotsRemaining] = useState(1000);
  const [founderEndDate, setFounderEndDate] = useState("2025-08-15T23:59:59");
  const [viewMode, setViewMode] = useState('cards');
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const [hasEnteredReferralCode, setHasEnteredReferralCode] = useState(false);
  const [highlightPlan, setHighlightPlan] = useState(null);
  const [showDevButtons, setShowDevButtons] = useState(false);
  const [pulseCredits, setPulseCredits] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [realFounderSpots, setRealFounderSpots] = useState(1000);
  
  
  // Removed countdown state - now handled by isolated component
  
  // Refs to preserve scroll position for each tab
  const lifetimeScrollRef = useRef(null);
  const subscriptionScrollRef = useRef(null);
  const lifetimeScrollPosition = useRef(0);
  const subscriptionScrollPosition = useRef(0);
  
  // Removed unused refs
  
  // Helper function to get current user number based on spots remaining
  const getUserNumber = (spotsRemaining) => {
    return 1001 - spotsRemaining; // Users 1-1000
  };

  // Helper function to determine pricing tier and AI plan based on user number
  const getPricingTier = (userNumber) => {
    if (userNumber <= 100) {
      return { 
        tier: 'early', 
        price: '$0.99', 
        aiPlan: 'compass', // AI Light for users 1-100
        description: 'Early Bird Special'
      };
    } else if (userNumber <= 500) {
      return { 
        tier: 'mid', 
        price: '$2.99', 
        aiPlan: 'compass', // AI Light for users 101-500
        description: 'Mid Tier Pricing'
      };
    } else {
      return { 
        tier: 'final', 
        price: '$4.99', 
        aiPlan: 'compass', // AI Light for users 501-1000
        description: 'Final Tier Pricing'
      };
    }
  };

  // Helper function to determine which AI plan to highlight - Always AI Light now
  const getAIPlanToHighlight = (spotsRemaining) => {
    return 'compass'; // Always AI Light for all user tiers
  };
  
  const isDarkMode = theme.dark;
  
  // Benefits data for the carousel
  const founderBenefits = [
    {
      icon: 'flash',
      text: '1 month of AI Light free ($2.99 value)'
    },
    {
      icon: 'star',
      text: 'Permanent access to all core features'
    },
    {
      icon: 'gift',
      text: '600 AI credits included ($0.60 value)'
    },
    {
      icon: 'people',
      text: 'Refer friends for 500 credits each'
    },
    {
      icon: 'trophy',
      text: 'Exclusive Founder\'s Badge'
    },
    {
      icon: 'lock-closed',
      text: 'Limited to first 1,000 members'
    }
  ];
  
  // Countdown timer now handled by isolated CountdownTimer component
  // No timer logic needed in main component - prevents scroll interference
  
  // Set up the correct tab based on route params
  useEffect(() => {
    if (initialTabFromParams) {
      setActiveTab(initialTabFromParams);
    }
  }, [initialTabFromParams]);
  
  // Function to fetch the latest count of available founder spots
  const fetchFounderSpotsRemaining = async () => {
    try {
      // Using your actual API Gateway endpoint
      const response = await fetch('https://8uucuqeys9.execute-api.ap-southeast-2.amazonaws.com/prod/available-spots');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (data && data.success && typeof data.availableSpots === 'number') {
        console.log(`Fetched founder spots: ${data.availableSpots}`);
        setRealFounderSpots(data.availableSpots); // Store the real value
        if (!isTestMode) {
          setFounderSpotsRemaining(data.availableSpots);
        }
        
        // Store in AsyncStorage for offline access
        await AsyncStorage.setItem('founderSpotsRemaining', data.availableSpots.toString());
        await AsyncStorage.setItem('founderSpotsLastCheck', Date.now().toString());
        
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
        if (data.endDate) {
          setFounderEndDate(data.endDate);
          await AsyncStorage.setItem('founderEndDate', data.endDate);
        }
      }
    } catch (error) {
      console.error('Error fetching founder spots:', error);
      // If fetch fails, we'll rely on the cached value from AsyncStorage (already loaded in checkMembershipStatus)
    }
  };
  
  // Check if user is already a lifetime member and get referral info
  useEffect(() => {
    const checkMembershipStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('subscriptionStatus');
        
        const isLifetime = status === 'founding';
        setIsLifetimeMember(isLifetime);
        
        // If lifetime member, get referral code and available referrals
        if (isLifetime) {
          const code = await AsyncStorage.getItem('referralCode') || generateReferralCode();
          if (!await AsyncStorage.getItem('referralCode')) {
            await AsyncStorage.setItem('referralCode', code);
          }
          setReferralCode(code);
          
          const referralsRemaining = await AsyncStorage.getItem('referralsRemaining') || '3';
          setReferralsLeft(parseInt(referralsRemaining));
        }
        
        // Check if user came from a referral
        const referralSource = await AsyncStorage.getItem('referralSource');
        if (referralSource) {
          setIsFromReferral(true);
          setReferrerName(referralSource);
        }
        
        // Get the remaining founder spots count (or use default 1000)
        const remainingSpots = await AsyncStorage.getItem('founderSpotsRemaining');
        if (remainingSpots) {
          const spots = parseInt(remainingSpots);
          setRealFounderSpots(spots);
          if (!isTestMode) {
            setFounderSpotsRemaining(spots);
          }
        }
        
        // Get the founder end date if available
        const storedEndDate = await AsyncStorage.getItem('founderEndDate');
        if (storedEndDate) {
          setFounderEndDate(storedEndDate);
        }
        
        // Check if user has entered a referral code
        const hasEntered = await AsyncStorage.getItem('hasEnteredReferralCode');
        setHasEnteredReferralCode(hasEntered === 'true');
      } catch (error) {
        console.error('Error checking membership status:', error);
      }
    };
    
    checkMembershipStatus();
    
    // Fetch the latest founder spots count
    fetchFounderSpotsRemaining();
    
    // Optionally, set up a refresh interval to periodically update the count
    const refreshInterval = setInterval(() => {
      if (!isTestMode) {
        fetchFounderSpotsRemaining();
      }
    }, 60000); // Refresh every minute
    
    return () => {
      clearInterval(refreshInterval); // Clean up the interval when component unmounts
    };
  }, [isTestMode]);
  
  // Toggle lifetime membership status (for testing only)
  const handleToggleLifetimeMember = async (value) => {
    try {
      setIsLifetimeMember(value);
      setSelectedPlan('');
      
      const newStatus = value ? 'founding' : 'free';
      await AsyncStorage.setItem('subscriptionStatus', newStatus);
      
      if (value) {
        let code = await AsyncStorage.getItem('referralCode');
        if (!code) {
          code = generateReferralCode();
          await AsyncStorage.setItem('referralCode', code);
          setReferralCode(code);
        }
        
        await AsyncStorage.setItem('referralsRemaining', '3');
        setReferralsLeft(3);
      }
    } catch (error) {
      console.error('Error toggling lifetime member status:', error);
      Alert.alert('Error', 'Failed to update lifetime member status');
    }
  };
  
  // Track scroll position for sticky CTA
  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    setIsScrolledDown(scrollPosition > scaleHeight(200));
  };
  
  
  // Handle tab change
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSelectedPlan('');
  };

  // Handle plan selection - preserve scroll position
  const handleSelectPlan = (plan) => {
    // Get the correct ref and position based on active tab
    const currentScrollRef = activeTab === 'lifetime' ? lifetimeScrollRef : subscriptionScrollRef;
    const currentScrollPosition = activeTab === 'lifetime' ? lifetimeScrollPosition : subscriptionScrollPosition;
    
    // Store current scroll position before state update
    if (currentScrollRef.current) {
      // For React Native ScrollView, we need to get the scroll position differently
      // The position is already tracked by onScroll, so we don't need to get it here
    }
    
    if (selectedPlan === plan) {
      setSelectedPlan('');
    } else {
      setSelectedPlan(plan);
    }
    
    // Restore scroll position after state update
    setTimeout(() => {
      if (currentScrollRef.current && currentScrollPosition.current > 0) {
        currentScrollRef.current.scrollTo({
          y: currentScrollPosition.current,
          animated: false
        });
      }
    }, 0);
  };
  
  // Handle sharing referral code
  const shareReferralCode = async () => {
    if (referralsLeft <= 0) {
      Alert.alert(
        "No Referrals Left",
        "You've used all your available referrals. Complete app challenges to earn more!"
      );
      return;
    }
    
    try {
      await Share.share({
        message: `Join me on LifeCompass and get 500 AI credits free (worth $0.50)! Use my referral code: ${referralCode} when you sign up. https://lifecompass.app/refer?code=${referralCode}`
      });
    } catch (error) {
      Alert.alert("Error", "Could not share the referral code");
    }
  };
  
  // Copy referral code to clipboard
  const copyReferralCode = async () => {
    if (referralsLeft <= 0) {
      Alert.alert(
        "No Referrals Left",
        "You've used all your available referrals. Complete app challenges to earn more!"
      );
      return;
    }
    
    try {
      await Clipboard.setStringAsync(referralCode);
      showSuccess("Referral code copied to clipboard!");
    } catch (error) {
      Alert.alert("Error", "Could not copy the referral code");
    }
  };
  
  // Check for available referral discounts
  const checkAvailableDiscounts = async () => {
    try {
      const discounts = await referralBackendService.getEarnedDiscounts();
      return discounts.filter(discount => 
        discount.validForPurchaseType === 'AI_MONTHLY' && !discount.isRedeemed
      );
    } catch (error) {
      console.error('Error checking discounts:', error);
      return [];
    }
  };

  // Handle purchase with achievement recognition for founders
  const handlePurchase = async (plan) => {
    // TODO: Integrate with App Store payment processing
    // For now, do nothing when purchase buttons are clicked
    console.log(`Purchase attempt for plan: ${plan}`);
  };




  // Render lifetime tab content
  const renderLifetimeContent = useCallback(() => {
    const horizontalPadding = getByDeviceSize({
      small: spacing.s,
      medium: spacing.m,
      large: spacing.l,
      tablet: spacing.xl
    });
    
    // Calculate spots claimed for social proof
    const spotsClaimed = 1000 - founderSpotsRemaining;

    // Check if founder spots are sold out
    const isFounderSoldOut = founderSpotsRemaining <= 0;

    return (
      <>
        {/* Cards View - Unified design with timer integrated (or regular pricing when sold out) */}
        {viewMode === 'cards' && (
          <View style={{
            paddingHorizontal: 0,
            marginTop: spacing.s,
            width: '100%'
          }}>
            {/* Always use the same UnifiedBlackPlan layout, but behavior changes when sold out */}
            <UnifiedBlackPlan 
              theme={theme}
              selectedPlan={selectedPlan}
              handleSelectPlan={handleSelectPlan}
              handlePurchase={handlePurchase}
              isLifetimeMember={isLifetimeMember}
              spotsRemaining={founderSpotsRemaining}
              initialTime={{
                days: 26,
                hours: 12,
                minutes: 45,
                seconds: 30
              }}
              responsive={{
                fontSize: fontSizes,
                spacing: spacing,
                isSmallDevice: isSmallDevice,
                isTablet: isTablet
              }}
              billing={selectedSubscription}
              setBilling={setSelectedSubscription}
              onNavigateToAIPlans={() => {
                setActiveTab('subscription');
                setNavigationState(prev => ({ ...prev, index: 1 }));
                setSelectedPlan('');
                
                // Only animate/highlight for founder spots (first 1000), not sold out
                if (founderSpotsRemaining > 0) {
                  // Force monthly billing since $2.99 value is for monthly plan
                  setAiPlansBilling('monthly');
                  // Highlight the appropriate AI plan based on current founder tier AND pulse credits
                  const targetPlan = getAIPlanToHighlight(founderSpotsRemaining);
                  setHighlightPlan(targetPlan);
                  setPulseCredits(true);
                  // Clear highlight and pulse after animations complete
                  setTimeout(() => {
                    setHighlightPlan(null);
                    setPulseCredits(false);
                  }, 6000); // 6 seconds - matches new longer animation duration
                }
              }}
            />
          </View>
        )}
            
            {/* Table View */}
            {viewMode === 'table' && (
              <View style={{
                width: '100%',
                flex: 1,
              }}>
                <MinimalFeatureTable 
                  theme={theme}
                  isLifetimeMember={isLifetimeMember}
                  spotsRemaining={founderSpotsRemaining}
                  onNavigateToAIPlans={() => {
                    setActiveTab('subscription');
                    setNavigationState(prev => ({ ...prev, index: 1 }));
                    setSelectedPlan('');
                    
                    // Only animate/highlight for founder spots (first 1000), not sold out
                    if (founderSpotsRemaining > 0) {
                      // Force monthly billing since $2.99 value is for monthly plan
                      setAiPlansBilling('monthly');
                      // Highlight the appropriate AI plan based on current founder tier AND pulse credits
                      const targetPlan = getAIPlanToHighlight(founderSpotsRemaining);
                      setHighlightPlan(targetPlan);
                      setPulseCredits(true);
                      // Clear highlight and pulse after animations complete
                      setTimeout(() => {
                        setHighlightPlan(null);
                        setPulseCredits(false);
                      }, 6000); // 6 seconds - matches new longer animation duration
                    }
                  }}
                  responsive={{
                    fontSize: fontSizes,
                    spacing: spacing,
                    isSmallDevice: isSmallDevice,
                    isTablet: isTablet,
                    isLandscape: isLandscape,
                    width: width - 16
                  }}
                />
              </View>
            )}
      </>
    );
  }, [selectedPlan, handleSelectPlan, isLifetimeMember, founderSpotsRemaining, viewMode, theme, spacing, fontSizes, isSmallDevice, isTablet]);
  
  // Render subscription tab content
  const renderSubscriptionContent = useCallback(() => {
    return (
      <>
        {/* Black Minimal AI Plans - All in one component */}
        <DumbAIPlans 
          selectedPlan={selectedPlan}
          handleSelectPlan={handleSelectPlan}
          billing={aiPlansBilling}
          setBilling={setAiPlansBilling}
          highlightPlan={highlightPlan}
          pulseCredits={pulseCredits}
        />
        
      </>
    );
  }, [selectedPlan, handleSelectPlan, highlightPlan]);


  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: '#000000' 
    }}>
      {/* Status bar */}
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Header with Back Button and Title - Black Minimal */}
      <View style={{
        paddingTop: safeSpacing.top,
        backgroundColor: '#000000',
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingBottom: founderSpotsRemaining <= 0 ? 12 : 16,
          paddingTop: founderSpotsRemaining <= 0 ? 12 : 16,
          height: founderSpotsRemaining <= 0 ? 56 : 64,
        }}>
          {/* Back button - same position, different behavior based on current screen */}
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => {
              if (activeTab === 'subscription') {
                // From AI Plans -> Back to main pricing
                setActiveTab('lifetime');
                setNavigationState(prev => ({ ...prev, index: 0 }));
                setSelectedPlan('');
              } else if (activeTab === 'lifetime' && viewMode === 'table') {
                // From feature table -> Back to card view
                setViewMode('cards');
              } else {
                // Main pricing screen -> Exit pricing
                navigation.goBack();
              }
            }}
          >
            <Ionicons 
              name="arrow-back" 
              size={20} 
              color="#FFFFFF"
            />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 18,
            fontWeight: '300',
            color: '#FFFFFF',
            textAlign: 'center',
            flex: 1,
            letterSpacing: 1,
          }}>
            {founderSpotsRemaining <= 0 ? 'LIFECOMPASS PLANS' : 'PRICING'}
          </Text>
          
{/* Only show AI toggle when founder spots are available - when sold out, AI is included in all tiers */}
          {founderSpotsRemaining > 0 ? (
            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
              }}
              onPress={() => {
                if (activeTab === 'lifetime') {
                  // Go to AI Plans
                  setActiveTab('subscription');
                  setNavigationState(prev => ({ ...prev, index: 1 }));
                } else {
                  // Go back to Pro Access
                  setActiveTab('lifetime');
                  setNavigationState(prev => ({ ...prev, index: 0 }));
                }
                setSelectedPlan('');
              }}
            >
              <Ionicons 
                name={activeTab === 'lifetime' ? 'sparkles' : 'compass'} 
                size={18} 
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 40, height: 40 }} />
          )}
        </View>
      </View>
      
      {/* TabView with Native Real-time Swiping - disable swiping when sold out */}
      <TabView
        navigationState={navigationState}
        renderScene={useCallback(({ route }) => {
          switch (route.key) {
            case 'lifetime':
              return (
                <View style={{ flex: 1 }}>
                  <ScrollView
                    ref={lifetimeScrollRef}
                    style={{ flex: 1, backgroundColor: '#000000' }}
                    contentContainerStyle={{
                      paddingTop: spacing.s,
                      paddingBottom: safeSpacing.bottom + 20,
                      alignItems: 'center',
                    }}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    onScroll={(event) => {
                      lifetimeScrollPosition.current = event.nativeEvent.contentOffset.y;
                    }}
                    scrollEventThrottle={16}
                  >
                    {renderLifetimeContent()}
                  </ScrollView>
                </View>
              );
            case 'subscription':
              return (
                <View style={{ flex: 1 }}>
                  <ScrollView
                    ref={subscriptionScrollRef}
                    style={{ flex: 1, backgroundColor: '#000000' }}
                    contentContainerStyle={{
                      paddingTop: spacing.s,
                      paddingBottom: safeSpacing.bottom + 20,
                      alignItems: 'center',
                    }}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                    onScroll={(event) => {
                      subscriptionScrollPosition.current = event.nativeEvent.contentOffset.y;
                    }}
                    scrollEventThrottle={16}
                  >
                    {renderSubscriptionContent()}
                  </ScrollView>
                </View>
              );
            default:
              return null;
          }
        }, [renderLifetimeContent, renderSubscriptionContent, spacing, safeSpacing])}
        onIndexChange={(index) => {
          const newTab = index === 0 ? 'lifetime' : 'subscription';
          setActiveTab(newTab);
          setNavigationState(prev => ({ ...prev, index }));
          setSelectedPlan('');
        }}
        initialLayout={{ width }}
        renderTabBar={(props) => {
          const isFounderSoldOut = founderSpotsRemaining <= 0;
          // Only show tab bar when sold out
          if (isFounderSoldOut) {
            return (
              <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: '#FFD700', height: 3 }}
                style={{ backgroundColor: '#000000', elevation: 0, shadowOpacity: 0 }}
                labelStyle={{ 
                  fontSize: 14, 
                  fontWeight: '600',
                  textTransform: 'none'
                }}
                activeColor="#FFD700"
                inactiveColor="rgba(255,255,255,0.5)"
              />
            );
          }
          // Hide tab bar when founder spots available (original design)
          return null;
        }}
        swipeEnabled={true}
        lazy={false}
        animationEnabled={true}
        swipeVelocityImpact={0.5}
        pagerStyle={{ flex: 1 }}
      />
      
      {/* Minimal Sticky CTA */}
      <MinimalStickyCTA 
        theme={theme}
        selectedPlan={selectedPlan}
        activeTab={activeTab}
        isLifetimeMember={isLifetimeMember}
        selectedSubscription={selectedSubscription}
        aiPlansBilling={aiPlansBilling}
        handlePurchase={handlePurchase}
        spotsRemaining={founderSpotsRemaining}
        responsive={{
          fontSize: fontSizes,
          spacing: spacing,
          isSmallDevice: isSmallDevice,
          isTablet: isTablet,
          safeSpacing: safeSpacing
        }}
      />
      
      {/* View Toggle - Fixed position for both views - moved lower */}
      {!selectedPlan && activeTab === 'lifetime' && (
        <View style={{ 
          position: 'absolute',
          bottom: 5,
          left: 0,
          right: 0,
          paddingHorizontal: spacing.m,
        }}>
          <ViewToggle 
            theme={theme}
            viewMode={viewMode}
            setViewMode={setViewMode}
            activeTab={activeTab}
            responsive={{
              fontSize: fontSizes,
              spacing: spacing,
              isSmallDevice: isSmallDevice,
              isTablet: isTablet
            }}
          />
        </View>
      )}
      
      {/* Referral Code Input Modal */}
      <ReferralCodeInputModal
        visible={referralModalVisible}
        onClose={() => setReferralModalVisible(false)}
        theme={theme}
        onSuccess={(referralCode) => {
          // Update state to hide the referral button
          setHasEnteredReferralCode(true);
          setReferralModalVisible(false);
        }}
      />
      
      {/* Tiny Developer Toggle - Only in dev mode - moved to bottom right */}
      {__DEV__ && (
        <View style={{
          position: 'absolute',
          bottom: 10,
          right: 20,
        }}>
          <TouchableOpacity
            style={{
              width: 30,
              height: 30,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
            onPress={() => setShowDevButtons(!showDevButtons)}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>
              {showDevButtons ? '×' : '⚙'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Developer Testing Buttons - At bottom of scrollable content */}
      {__DEV__ && showDevButtons && (
        <View style={{
          backgroundColor: 'rgba(0,0,0,0.95)',
          padding: 20,
          marginTop: 100,
          position: 'relative',
        }}>
          {/* Close Button */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 30,
              height: 30,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              zIndex: 1,
            }}
            onPress={() => setShowDevButtons(false)}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>

          <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>
            🧪 TIER TESTING
          </Text>
          
          {/* Early Bird Section - Users 1-100 ($0.99) */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#4CAF50', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
              🕊️ Early Bird ($0.99) - Users 1-100 + AI Light
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <TouchableOpacity
                style={{ backgroundColor: '#4CAF50', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(950);
                }} // User 51
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 51</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>$0.99 tier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ backgroundColor: '#4CAF50', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(920);
                }} // User 81
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 81</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>$0.99 tier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ backgroundColor: '#4CAF50', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(901);
                }} // User 100
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 100</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>Last $0.99</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mid Tier Section - Users 101-500 ($2.99) */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#FF8C42', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
              🚀 Mid Tier ($2.99) - Users 101-500 + AI Light
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <TouchableOpacity
                style={{ backgroundColor: '#FF8C42', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(750);
                }} // User 251
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 251</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>$2.99 tier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ backgroundColor: '#FF8C42', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(600);
                }} // User 401
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 401</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>$2.99 tier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ backgroundColor: '#FF8C42', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(501);
                }} // User 500
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 500</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>Last $2.99</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Final Tier Section - Users 501-1000 ($4.99) */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: '#FF6B6B', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
              ⚡ Final Tier ($4.99) - Users 501-1000 + AI Light
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <TouchableOpacity
                style={{ backgroundColor: '#FF6B6B', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(250);
                }} // User 751
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 751</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>$4.99 tier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ backgroundColor: '#FF6B6B', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(100);
                }} // User 901
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 901</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>$4.99 tier</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ backgroundColor: '#FF6B6B', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(1);
                }} // User 1000
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>User 1000</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>Last founder</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Special Cases */}
          <View>
            <Text style={{ color: '#888', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>
              🔧 Special Cases
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              <TouchableOpacity
                style={{ backgroundColor: '#333', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(0);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>SOLD OUT</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>Monthly Plans</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ backgroundColor: '#666', padding: 10, margin: 4, borderRadius: 8, minWidth: 90 }}
                onPress={() => {
                  setIsTestMode(true);
                  setFounderSpotsRemaining(1000);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>RESET</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>Back to 1000</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{ 
                  backgroundColor: '#22C55E', 
                  padding: 10, 
                  margin: 4, 
                  borderRadius: 8, 
                  minWidth: 90,
                  borderWidth: isTestMode ? 0 : 2,
                  borderColor: '#22C55E'
                }}
                onPress={() => {
                  setIsTestMode(false);
                  setFounderSpotsRemaining(realFounderSpots);
                }}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>REAL MODE</Text>
                <Text style={{ color: '#fff', fontSize: 8, textAlign: 'center' }}>API: {realFounderSpots}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PricingScreen;
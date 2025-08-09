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
  
  // Navigation state for TabView
  const [navigationState, setNavigationState] = useState({
    index: activeTab === 'subscription' ? 1 : 0,
    routes: [
      { key: 'lifetime', title: 'Founder Access' },
      { key: 'subscription', title: 'AI Plans' }
    ]
  });
  
  // Sync navigationState with activeTab
  useEffect(() => {
    const newIndex = activeTab === 'lifetime' ? 0 : 1;
    if (navigationState.index !== newIndex) {
      setNavigationState(prev => ({ ...prev, index: newIndex }));
    }
  }, [activeTab]);
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
  
  
  // Removed countdown state - now handled by isolated component
  
  // Refs to preserve scroll position for each tab
  const lifetimeScrollRef = useRef(null);
  const subscriptionScrollRef = useRef(null);
  const lifetimeScrollPosition = useRef(0);
  const subscriptionScrollPosition = useRef(0);
  
  // Removed unused refs
  
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
        setFounderSpotsRemaining(data.availableSpots);
        
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
          setFounderSpotsRemaining(parseInt(remainingSpots));
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
    const refreshInterval = setInterval(fetchFounderSpotsRemaining, 60000); // Refresh every minute
    
    return () => {
      clearInterval(refreshInterval); // Clean up the interval when component unmounts
    };
  }, []);
  
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
    if (plan === 'free') return;
    
    try {
      let confirmMessage = "";
      let planName = "";
      let price = "";
      
      switch(plan) {
        case 'free':
          planName = "Free";
          price = "Free";
          confirmMessage = "Continue with Free plan? You can upgrade anytime.";
          break;
        case 'founding':
          planName = "Founder's Lifetime Access";
          price = "$4.99";
          confirmMessage = "Confirm your one-time purchase of LifeCompass Founder's Lifetime Access for $4.99?\n\nYou'll get:\n• Permanent access to all core productivity features\n• 600 AI credits free ($0.60 value)\n• The ability to refer friends for 500 credits each\n• Exclusive Founder's Badge\n• Limited to first 1,000 members";
          break;
        case 'starter':
          planName = "Guide AI";
          price = `$${getMonthlyRate('starter', isLifetimeMember, selectedSubscription)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'}`;
          confirmMessage = `Subscribe to the Guide AI plan for ${price}?\n\nYou'll get $0.60 in AI credits monthly for AI assistance and access to all AI models. Your monthly credits refresh with each billing cycle.${!isLifetimeMember ? "\n\nThis subscription will also include all Pro app features while your subscription is active." : ""}`;
          break;
        case 'professional':
          planName = "Navigator AI";
          price = `$${getMonthlyRate('professional', isLifetimeMember, selectedSubscription)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'}`;
          confirmMessage = `Subscribe to the Navigator AI plan for ${price}?\n\nYou'll get $1.50 in AI credits monthly (2.5x the Guide plan) for AI assistance and access to all AI models. Your monthly credits refresh with each billing cycle.${!isLifetimeMember ? "\n\nThis subscription will also include all Pro app features while your subscription is active." : ""}`;
          break;
        case 'business':
          planName = "Compass AI";
          price = `$${getMonthlyRate('business', isLifetimeMember, selectedSubscription)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'}`;
          confirmMessage = `Subscribe to the Compass AI plan for ${price}?\n\nYou'll get $5.00 in AI credits monthly (8.3x the Guide plan) for AI assistance and access to all AI models. Your monthly credits refresh with each billing cycle.${!isLifetimeMember ? "\n\nThis subscription will also include all Pro app features while your subscription is active." : ""}`;
          break;
        case 'credits':
          planName = "AI Credits";
          price = "$0.99";
          confirmMessage = "Purchase 150 AI credits for $0.99?\n\nOne-time purchase • No subscription required\nPerfect for testing our AI features!";
          break;
        default:
          confirmMessage = "Confirm your selection?";
      }
      
      Alert.alert(
        `Purchase ${planName} - ${price}`,
        confirmMessage,
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Confirm Purchase", 
            onPress: async () => {
              // Handle purchase based on plan type
              if (plan === 'founding') {
                // Use the FounderCheckpoint utility for founder purchase
                await FounderCheckpoint.handleSuccessfulFounderPurchase(navigation, founderSpotsRemaining);
                
                // Update local state
                setIsLifetimeMember(true);
                setFounderSpotsRemaining(founderSpotsRemaining - 1);
              } else {
                // Handle AI plan purchases
                await AsyncStorage.setItem('aiPlan', plan);
                
                if (isFromReferral) {
                  await AsyncStorage.removeItem('referralSource');
                  setIsFromReferral(false);
                }
                
                // Show success message
                let successMessage = "";
                
                switch(plan) {
                  case 'starter':
                    successMessage = `You've successfully subscribed to the Guide AI plan! Your ${selectedSubscription} subscription gives you $0.60 in AI credits monthly with access to all AI models.`;
                    break;
                  case 'professional':
                    successMessage = `You've successfully subscribed to the Navigator AI plan! Your ${selectedSubscription} subscription provides $1.50 in AI credits monthly (2.5x the Guide plan) with access to all AI models.`;
                    break;
                  case 'business':
                    successMessage = `You've successfully subscribed to the Compass AI plan! Your ${selectedSubscription} subscription delivers $5.00 in AI credits monthly (8.3x the Guide plan) with access to all AI models.`;
                    break;
                  case 'credits':
                    successMessage = "150 AI credits have been added to your account! You can now test all our AI features.";
                    break;
                }
                
                showSuccess(successMessage);
                navigation.goBack();
              }
            } 
          }
        ]
      );
    } catch (error) {
      console.error('Error during purchase:', error);
      Alert.alert("Purchase Failed", "There was an error processing your request. Please try again.");
    }
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

    return (
      <>
        {/* Cards View - Unified design with timer integrated */}
        {viewMode === 'cards' && (
          <View style={{
            paddingHorizontal: 0,
            marginTop: spacing.s,
            width: '100%'
          }}>
            <UnifiedBlackPlan 
              theme={theme}
              selectedPlan={selectedPlan}
              handleSelectPlan={handleSelectPlan}
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
        
        {/* View Toggle - At bottom of screen */}
        <View style={{ 
          position: 'absolute',
          bottom: 120,
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
        
        {/* Bottom spacing */}
        <View style={{ height: scaleHeight(100) }} />
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
        />
        
        {/* Bottom spacing */}
        <View style={{ height: scaleHeight(100) }} />
      </>
    );
  }, [selectedPlan, handleSelectPlan]);


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
          paddingBottom: 16,
          paddingTop: 16,
          height: 64,
        }}>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.05)',
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => navigation.goBack()}
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
            PRICING
          </Text>
          
          <View style={{ width: 40 }} />
        </View>
      </View>
      
      {/* TabView with Native Real-time Swiping */}
      <TabView
        navigationState={navigationState}
        renderScene={useCallback(({ route }) => {
          switch (route.key) {
            case 'lifetime':
              return (
                <Animated.View style={{ flex: 1 }}>
                  <ScrollView
                    ref={lifetimeScrollRef}
                    style={{ flex: 1, backgroundColor: '#000000' }}
                    contentContainerStyle={{
                      paddingTop: spacing.s,
                      paddingBottom: safeSpacing.bottom + scaleHeight(100),
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
                </Animated.View>
              );
            case 'subscription':
              return (
                <Animated.View style={{ flex: 1 }}>
                  <ScrollView
                    ref={subscriptionScrollRef}
                    style={{ flex: 1, backgroundColor: '#000000' }}
                    contentContainerStyle={{
                      paddingTop: spacing.s,
                      paddingBottom: safeSpacing.bottom + scaleHeight(100),
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
                </Animated.View>
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
        renderTabBar={(props) => (
          <View style={{
            backgroundColor: '#000000',
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 8,
          }}>
            <View style={{
              backgroundColor: '#000000',
              borderRadius: 12,
              padding: 4,
              flexDirection: 'row',
            }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 10,
                  backgroundColor: activeTab === 'lifetime' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setActiveTab('lifetime');
                  setNavigationState(prev => ({ ...prev, index: 0 }));
                  setSelectedPlan('');
                }}
              >
                <Ionicons
                  name="compass"
                  size={16}
                  color={activeTab === 'lifetime' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                  style={{ marginRight: 6 }}
                />
                <Text style={{
                  color: activeTab === 'lifetime' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                }}>
                  PRO ACCESS
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 10,
                  backgroundColor: activeTab === 'subscription' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  setActiveTab('subscription');
                  setNavigationState(prev => ({ ...prev, index: 1 }));
                  setSelectedPlan('');
                }}
              >
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={activeTab === 'subscription' ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}
                  style={{ marginRight: 6 }}
                />
                <Text style={{
                  color: activeTab === 'subscription' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                  fontSize: 14,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                }}>
                  AI PLANS
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        swipeEnabled={true}
        lazy={false}
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
        responsive={{
          fontSize: fontSizes,
          spacing: spacing,
          isSmallDevice: isSmallDevice,
          isTablet: isTablet,
          safeSpacing: safeSpacing
        }}
      />
      
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
    </View>
  );
};

export default PricingScreen;
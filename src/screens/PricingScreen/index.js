// src/screens/PricingScreen/index.js - Updated with scarcity implementation
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  Platform,
  Share,
  Animated,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import PagerView from 'react-native-pager-view';

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

// Component imports
import ViewToggle from './components/ViewToggle';
import TestModeToggles from './components/TestModeToggles';
import BillingSelector from './components/BillingSelector';
import FounderPlan from './components/PlanCards/FounderPlan';
import CompassAIPlan from './components/PlanCards/CompassAIPlan';
import NavigatorAIPlan from './components/PlanCards/NavigatorAIPlan';
import GuideAIPlan from './components/PlanCards/GuideAIPlan';
import FeatureComparisonTable from './components/FeatureComparisons/FeatureComparisonTable';
import StickyCTA from './components/StickyCTA';
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
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState('monthly');
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
  
  // Add state for countdown
  const [countdownTime, setCountdownTime] = useState({
    days: 26,
    hours: 12,
    minutes: 45,
    seconds: 20
  });
  
  // Countdown animation ref
  const countdownPulseAnim = useRef(new Animated.Value(1)).current;
  
  // Refs for scrollable content
  const lifetimeScrollRef = useRef(null);
  const subscriptionScrollRef = useRef(null);
  const pagerRef = useRef(null);
  
  const isDarkMode = theme.dark;
  
  // Effect to update countdown timer
  useEffect(() => {
    // Set up countdown animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(countdownPulseAnim, {
          toValue: 1.03,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(countdownPulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
    
    // Simple timer for demo
    const interval = setInterval(() => {
      setCountdownTime(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              hours = 23;
              if (days > 0) {
                days--;
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Set up the correct tab based on route params
  useEffect(() => {
    if (initialTabFromParams && pagerRef.current) {
      // Set the correct tab based on navigation params
      setActiveTab(initialTabFromParams);
      
      // Set the PagerView page
      const pageIndex = initialTabFromParams === 'lifetime' ? 0 : 1;
      setTimeout(() => {
        pagerRef.current.setPage(pageIndex);
      }, 100);
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
  
  // Handle page selection from PagerView
  const onPageSelected = (e) => {
    const newIndex = e.nativeEvent.position;
    const newTab = newIndex === 0 ? 'lifetime' : 'subscription';
    
    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setSelectedPlan('');
    }
  };
  
  // Handle plan selection
  const handleSelectPlan = (plan) => {
    if (selectedPlan === plan) {
      setSelectedPlan('');
    } else {
      setSelectedPlan(plan);
    }
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
        message: `Join me on LifeCompass and get 50% off your first month of any AI plan! Use my referral code: ${referralCode} when you sign up. https://lifecompass.app/refer?code=${referralCode}`
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
          confirmMessage = "Confirm your one-time purchase of LifeCompass Founder's Lifetime Access for $4.99?\n\nYou'll get:\n• Permanent access to all core productivity features\n• 1 month of Guide AI free ($4.99 value)\n• The ability to refer friends for 50% off their first month\n• Exclusive Founder's Badge\n• Limited to first 1,000 members";
          break;
        case 'starter':
          planName = "Guide AI";
          price = isFromReferral ? 
            `$${getMonthlyRate('starter', isLifetimeMember, selectedSubscription, true)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'} (50% off first month)` : 
            `$${getMonthlyRate('starter', isLifetimeMember, selectedSubscription)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'}`;
          confirmMessage = `Subscribe to the Guide AI plan for ${price}?\n\nYou'll get standard monthly capacity for AI assistance and access to all AI models. Your monthly capacity refreshes with each billing cycle.${!isLifetimeMember ? "\n\nThis subscription will also include all premium app features while your subscription is active." : ""}`;
          break;
        case 'professional':
          planName = "Navigator AI";
          price = isFromReferral ? 
            `$${getMonthlyRate('professional', isLifetimeMember, selectedSubscription, true)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'} (50% off first month)` : 
            `$${getMonthlyRate('professional', isLifetimeMember, selectedSubscription)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'}`;
          confirmMessage = `Subscribe to the Navigator AI plan for ${price}?\n\nYou'll get enhanced monthly capacity (3x the standard plan) for AI assistance and access to all AI models. Your monthly capacity refreshes with each billing cycle.${!isLifetimeMember ? "\n\nThis subscription will also include all premium app features while your subscription is active." : ""}`;
          break;
        case 'business':
          planName = "Compass AI";
          price = isFromReferral ? 
            `$${getMonthlyRate('business', isLifetimeMember, selectedSubscription, true)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'} (50% off first month)` : 
            `$${getMonthlyRate('business', isLifetimeMember, selectedSubscription)}/${selectedSubscription === 'monthly' ? 'month' : 'month, billed annually'}`;
          confirmMessage = `Subscribe to the Compass AI plan for ${price}?\n\nYou'll get our highest monthly capacity (7x the standard plan) for AI assistance and access to all AI models. Your monthly capacity refreshes with each billing cycle.${!isLifetimeMember ? "\n\nThis subscription will also include all premium app features while your subscription is active." : ""}`;
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
                    successMessage = `You've successfully subscribed to the Guide AI plan! Your ${selectedSubscription} subscription gives you standard monthly capacity for AI assistance with access to all AI models.`;
                    break;
                  case 'professional':
                    successMessage = `You've successfully subscribed to the Navigator AI plan! Your ${selectedSubscription} subscription provides enhanced monthly capacity (3x standard) for AI assistance with access to all AI models.`;
                    break;
                  case 'business':
                    successMessage = `You've successfully subscribed to the Compass AI plan! Your ${selectedSubscription} subscription delivers our highest monthly capacity (7x standard) for AI assistance with access to all AI models.`;
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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedPlan('');
    
    if (pagerRef.current) {
      const pageIndex = tab === 'lifetime' ? 0 : 1;
      pagerRef.current.setPage(pageIndex);
    }
  };

  // Render lifetime tab content
  const renderLifetimeContent = () => {
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
        {/* Directly embedded countdown timer */}
        <Animated.View 
          style={{
            width: '90%',
            alignSelf: 'center',
            borderRadius: 12,
            padding: 16,
            backgroundColor: theme.cardElevated,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
            marginTop: 8,
            marginBottom: 16,
            transform: [{ scale: countdownPulseAnim }]
          }}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: 12,
            color: theme.text
          }}>
            Founder access ends in:
          </Text>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {/* Days */}
            <View style={{ alignItems: 'center', marginHorizontal: 4 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
                backgroundColor: theme.primary
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#FFFFFF'
                }}>{countdownTime.days < 10 ? `0${countdownTime.days}` : countdownTime.days}</Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: theme.textSecondary
              }}>days</Text>
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginHorizontal: 2,
              color: theme.primary
            }}>:</Text>
            
            {/* Hours */}
            <View style={{ alignItems: 'center', marginHorizontal: 4 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
                backgroundColor: theme.primary
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#FFFFFF'
                }}>{countdownTime.hours < 10 ? `0${countdownTime.hours}` : countdownTime.hours}</Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: theme.textSecondary
              }}>hours</Text>
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginHorizontal: 2,
              color: theme.primary
            }}>:</Text>
            
            {/* Minutes */}
            <View style={{ alignItems: 'center', marginHorizontal: 4 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
                backgroundColor: theme.primary
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#FFFFFF'
                }}>{countdownTime.minutes < 10 ? `0${countdownTime.minutes}` : countdownTime.minutes}</Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: theme.textSecondary
              }}>min</Text>
            </View>
            
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              marginHorizontal: 2,
              color: theme.primary
            }}>:</Text>
            
            {/* Seconds */}
            <View style={{ alignItems: 'center', marginHorizontal: 4 }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 4,
                backgroundColor: theme.primary
              }}>
                <Text style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: '#FFFFFF'
                }}>{countdownTime.seconds < 10 ? `0${countdownTime.seconds}` : countdownTime.seconds}</Text>
              </View>
              <Text style={{
                fontSize: 12,
                color: theme.textSecondary
              }}>sec</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* View Toggle */}
        <ViewToggle 
          theme={theme}
          viewMode={viewMode}
          setViewMode={setViewMode}
          responsive={{
            fontSize: fontSizes,
            spacing: spacing,
            isSmallDevice: isSmallDevice,
            isTablet: isTablet
          }}
        />
        
        {/* Cards View */}
        {viewMode === 'cards' && (
          <View style={{
            paddingHorizontal: 0,
            marginTop: spacing.m,
            alignItems: 'center',
            width: '100%'
          }}>
            {/* Founder's Access Plan */}
            <FounderPlan 
              theme={theme}
              selectedPlan={selectedPlan}
              handleSelectPlan={handleSelectPlan}
              isLifetimeMember={isLifetimeMember}
              handlePurchase={handlePurchase}
              responsive={{
                fontSize: fontSizes,
                spacing: spacing,
                isSmallDevice: isSmallDevice,
                isTablet: isTablet,
                width: width * 0.92 // Make founder plan take up 92% of screen width
              }}
            />
            
            {/* Spots Remaining Banner - Below the card */}
            <FounderSpotsBanner
              spotsRemaining={founderSpotsRemaining}
              totalSpots={1000}
              theme={theme}
              style={{ marginTop: 16, marginBottom: 12, width: '92%' }}
            />
          </View>
        )}
        
        {/* Table View */}
        {viewMode === 'table' && (
          <View style={{
            width: '100%',
            paddingHorizontal: 8,
            alignItems: 'center'
          }}>
            <FeatureComparisonTable 
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
        
        {/* Context Banner - Moved to the bottom */}
        <FounderContextBanner 
          theme={theme}
          style={{ marginTop: 24, marginBottom: 8 }}
        />
        
        {/* Test Mode Toggles */}
        {showTestModeToggles && (
          <TestModeToggles 
            theme={theme}
            showTestModeToggles={showTestModeToggles}
            isLifetimeMember={isLifetimeMember}
            handleToggleLifetimeMember={handleToggleLifetimeMember}
            responsive={{
              fontSize: fontSizes,
              spacing: spacing,
              isSmallDevice: isSmallDevice
            }}
          />
        )}
        
        {/* Bottom spacing */}
        <View style={{ height: scaleHeight(100) }} />
      </>
    );
  };
  
  // Render subscription tab content
  const renderSubscriptionContent = () => {
    const horizontalPadding = getByDeviceSize({
      small: spacing.s,
      medium: spacing.m,
      large: spacing.l,
      tablet: spacing.xl
    });

    const tabletLayout = isTablet && {
      flexDirection: isLandscape ? 'row' : 'column',
      flexWrap: isLandscape ? 'wrap' : 'nowrap',
      justifyContent: 'space-between'
    };

    return (
      <>
        {/* Billing cycle selector */}
        <BillingSelector 
          theme={theme}
          selectedSubscription={selectedSubscription}
          setSelectedSubscription={setSelectedSubscription}
          responsive={{
            fontSize: fontSizes,
            spacing: spacing,
            isSmallDevice: isSmallDevice,
            isTablet: isTablet
          }}
        />
        
        {/* AI Power Plans */}
        <View style={[
          styles.planSelectionContainer,
          {
            paddingHorizontal: 0,
            marginTop: spacing.m,
            ...(tabletLayout || {})
          }
        ]}>
          {/* Compass AI Plan */}
          <CompassAIPlan 
            theme={theme}
            selectedPlan={selectedPlan}
            handleSelectPlan={handleSelectPlan}
            isLifetimeMember={isLifetimeMember}
            isFromReferral={isFromReferral}
            selectedSubscription={selectedSubscription}
            handlePurchase={handlePurchase}
            responsive={{
              fontSize: fontSizes,
              spacing: spacing,
              isSmallDevice: isSmallDevice,
              isTablet: isTablet,
              isLandscape: isLandscape,
              width: isTablet && isLandscape ? 
                (width * 0.3) : // 30% of screen width on tablet landscape
                width * 0.92 // 92% of screen width otherwise
            }}
          />
          
          {/* Navigator AI Plan */}
          <NavigatorAIPlan 
            theme={theme}
            selectedPlan={selectedPlan}
            handleSelectPlan={handleSelectPlan}
            isLifetimeMember={isLifetimeMember}
            isFromReferral={isFromReferral}
            selectedSubscription={selectedSubscription}
            handlePurchase={handlePurchase}
            responsive={{
              fontSize: fontSizes,
              spacing: spacing,
              isSmallDevice: isSmallDevice,
              isTablet: isTablet,
              isLandscape: isLandscape,
              width: isTablet && isLandscape ? 
                (width * 0.3) : // 30% of screen width on tablet landscape
                width * 0.92 // 92% of screen width otherwise
            }}
          />
          
          {/* Guide AI Plan */}
          <GuideAIPlan 
            theme={theme}
            selectedPlan={selectedPlan}
            handleSelectPlan={handleSelectPlan}
            isLifetimeMember={isLifetimeMember}
            isFromReferral={isFromReferral}
            selectedSubscription={selectedSubscription}
            handlePurchase={handlePurchase}
            responsive={{
              fontSize: fontSizes,
              spacing: spacing,
              isSmallDevice: isSmallDevice,
              isTablet: isTablet,
              isLandscape: isLandscape,
              width: isTablet && isLandscape ? 
                (width * 0.3) : // 30% of screen width on tablet landscape
                width * 0.92 // 92% of screen width otherwise
            }}
          />
        </View>
        
        {/* Pricing Footnote */}
        <PricingFootnote 
          theme={theme}
          responsive={{
            fontSize: fontSizes,
            spacing: spacing,
            isSmallDevice: isSmallDevice
          }}
        />
        
        {/* Join Founder's Club Button for non-lifetime members */}
        {!isLifetimeMember && (
          <View style={{
            padding: spacing.l,
            alignItems: 'center',
            marginVertical: spacing.m
          }}>
            <TouchableOpacity
              style={[
                styles.planButton,
                { 
                  backgroundColor: '#3F51B5',
                  width: '90%',
                  paddingVertical: spacing.m,
                  borderRadius: scaleWidth(8)
                }
              ]}
              onPress={() => {
                setActiveTab('lifetime');
                setSelectedPlan('');
                if (pagerRef.current) {
                  pagerRef.current.setPage(0);
                }
              }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Join Founder's Club"
              accessibilityHint="Switch to the lifetime tab to join the Founder's Club"
            >
              <Text 
                style={[
                  styles.planButtonText, 
                  { 
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: fontSizes.l,
                  }
                ]}
                maxFontSizeMultiplier={1.3}
              >
                {FounderMessaging.getCtaText(founderSpotsRemaining)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Test Mode Toggles */}
        {showTestModeToggles && (
          <TestModeToggles 
            theme={theme}
            showTestModeToggles={showTestModeToggles}
            isLifetimeMember={isLifetimeMember}
            handleToggleLifetimeMember={handleToggleLifetimeMember}
            responsive={{
              fontSize: fontSizes,
              spacing: spacing,
              isSmallDevice: isSmallDevice
            }}
          />
        )}
        
        {/* Bottom spacing */}
        <View style={{ height: scaleHeight(100) }} />
      </>
    );
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: theme.background 
    }}>
      {/* Status bar */}
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent={true}
      />
      
      {/* Fixed Header */}
      <View style={{
        paddingTop: safeSpacing.top,
        backgroundColor: theme.background,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        {/* Top Navigation Bar */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: scaleHeight(56),
          paddingHorizontal: spacing.m,
        }}>
          <TouchableOpacity
            style={{
              width: 44,
              height: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            onPress={() => navigation.goBack()}
          >
            <Ionicons 
              name="arrow-back" 
              size={24} 
              color={theme.text}
            />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: fontSizes.l,
            fontWeight: '600',
            color: theme.text,
          }}>
            Pricing
          </Text>
          
          <View style={{ width: 44 }} />
        </View>
        
        {/* Modern Segmented Control for Tabs */}
        <View style={{
          paddingHorizontal: spacing.l,
          paddingBottom: spacing.m,
          paddingTop: spacing.xs,
        }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: theme.cardElevated,
            borderRadius: 12,
            padding: 4,
            height: scaleHeight(48),
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: activeTab === 'lifetime' ? theme.primary : 'transparent',
                flexDirection: 'row',
              }}
              onPress={() => handleTabChange('lifetime')}
            >
              <Ionicons
                name="trophy" // Changed from phone-portrait-outline to trophy
                size={18}
                color={activeTab === 'lifetime' ? '#FFFFFF' : theme.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text style={{
                color: activeTab === 'lifetime' ? '#FFFFFF' : theme.textSecondary,
                fontWeight: '600',
                fontSize: fontSizes.m,
              }}>
                Founder Access
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: activeTab === 'subscription' ? theme.primary : 'transparent',
                flexDirection: 'row',
              }}
              onPress={() => handleTabChange('subscription')}
            >
              <Ionicons
                name="sparkles" // Changed from sparkles-outline to solid sparkles
                size={18}
                color={activeTab === 'subscription' ? '#FFFFFF' : theme.textSecondary}
                style={{ marginRight: 8 }}
              />
              <Text style={{
                color: activeTab === 'subscription' ? '#FFFFFF' : theme.textSecondary,
                fontWeight: '600',
                fontSize: fontSizes.m,
              }}>
                AI Plans
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Scrollable Content Area with PagerView for swiping */}
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={activeTab === 'lifetime' ? 0 : 1}
        onPageSelected={onPageSelected}
        pageMargin={0}
      >
        {/* Lifetime Tab Content */}
        <View key="0">
          <ScrollView
            ref={lifetimeScrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: 0,
              paddingTop: spacing.m,
              paddingBottom: safeSpacing.bottom + scaleHeight(100),
              alignItems: 'center',
            }}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {renderLifetimeContent()}
          </ScrollView>
        </View>
        
        {/* Subscription Tab Content */}
        <View key="1">
          <ScrollView
            ref={subscriptionScrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ 
              paddingHorizontal: 0,
              paddingTop: spacing.m,
              paddingBottom: safeSpacing.bottom + scaleHeight(100),
            }}
            showsVerticalScrollIndicator={true}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {renderSubscriptionContent()}
          </ScrollView>
        </View>
      </PagerView>
      
      {/* Sticky CTA */}
      <StickyCTA 
        theme={theme}
        selectedPlan={selectedPlan}
        activeTab={activeTab}
        isFromReferral={isFromReferral}
        isLifetimeMember={isLifetimeMember}
        selectedSubscription={selectedSubscription}
        handlePurchase={handlePurchase}
        responsive={{
          fontSize: fontSizes,
          spacing: spacing,
          isSmallDevice: isSmallDevice,
          isTablet: isTablet,
          safeSpacing: safeSpacing
        }}
      />
    </View>
  );
};

export default PricingScreen;
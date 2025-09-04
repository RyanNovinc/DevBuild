// src/screens/PricingScreen/components/AIUpsellModal.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  StatusBar,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import {
  scaleWidth,
  scaleHeight,
  scaleFontSize,
  spacing,
  fontSizes,
  useSafeSpacing,
} from '../../../utils/responsive';

const { width, height } = Dimensions.get('window');

const AIUpsellModal = ({ 
  visible, 
  onClose, 
  onPurchaseAI,
  basePlan, // 'monthly', 'annual', 'lifetime' - can be null for standalone AI
  theme,
  standalone = false, // new prop to indicate standalone AI purchase
  founderUpsell = false, // new prop to indicate founder upsell with free month credit
  spotsRemaining = 1000, // new prop to calculate founder pricing
  initialAITier = 'navigator' // allow setting initial tier for standalone
}) => {
  const [selectedAITier, setSelectedAITier] = useState(initialAITier); // Use initialAITier prop
  const [selectedDuration, setSelectedDuration] = useState(''); // No default selection - user must choose or default to 1month
  const [currentStep, setCurrentStep] = useState(1); // 1 = AI tier selection, 2 = duration selection, 3 = order summary
  const [currentScrollIndex, setCurrentScrollIndex] = useState(1); // Track which card is centered
  const [aiSkipped, setAiSkipped] = useState(false); // Track if user skipped AI
  const safeSpacing = useSafeSpacing();
  
  // Calculate current price based on user number (same logic as MinimalStickyCTA)
  const getCurrentPrice = () => {
    const spotsExhausted = spotsRemaining <= 0;
    if (spotsExhausted) {
      // When sold out, show billing-based pricing
      if (basePlan === 'lifetime') return { amount: 99.99, display: '$99.99' };
      if (basePlan === 'annual') return { amount: 34.99, display: '$34.99' };
      return { amount: 3.49, display: '$3.49' };
    }
    
    const userNumber = 1001 - spotsRemaining;
    if (userNumber <= 100) return { amount: 0.99, display: '$0.99' }; // Users 1-100
    if (userNumber <= 500) return { amount: 2.99, display: '$2.99' }; // Users 101-500
    return { amount: 4.99, display: '$4.99' }; // Users 501-1000
  };
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Ref for horizontal scroll view to set initial position
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (visible) {
      // Reset modal state to fresh start every time it opens
      // For standalone AI purchases, start at step 1 (duration selection), otherwise start at step 1 (tier selection)
      setCurrentStep(1);
      setSelectedAITier(initialAITier);
      setSelectedDuration('');
      setAiSkipped(false);
      setCurrentScrollIndex(1);
      
      // Entry animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 10,
          friction: 6,
          useNativeDriver: true,
        })
      ]).start();
      
      // Scroll to center the actually selected tier - not always AI Plus
      if (!standalone) {
        setTimeout(() => {
          if (scrollViewRef.current) {
            const cardWidth = width * 0.7 + 12;
            
            // Get the correct index based on selected tier
            let targetIndex = 1; // Default to AI Plus (middle)
            if (selectedAITier === 'compass') targetIndex = 0; // AI Light (left)
            else if (selectedAITier === 'guide') targetIndex = 2; // AI Max (right)
            
            const scrollX = targetIndex * cardWidth;
            scrollViewRef.current.scrollTo({ x: scrollX, animated: false });
            setCurrentScrollIndex(targetIndex); // Keep scroll indicator in sync
          }
        }, 100);
      }
    }
  }, [visible]);

  // Don't render anything if modal isn't visible, or if basePlan isn't set (except for standalone AI purchases)
  if (!visible || (!basePlan && !standalone)) {
    return null;
  }

  // AI Tier definitions (from DumbAIPlans.js)
  const aiTiers = {
    compass: {
      name: 'AI Light',
      shortName: 'Light',
      description: 'Perfect for casual planning',
      monthlyPrice: 2.99,
      annualPrice: 29.99,
      icon: 'compass-outline',
      gradient: ['#6B46C1', '#9333EA'],
      features: [
        'Standard user context',
        'For occasional users',
        'Basic AI assistance'
      ]
    },
    navigator: {
      name: 'AI Plus',
      shortName: 'Plus',
      description: 'Built for everyday productivity',
      monthlyPrice: 4.99,
      annualPrice: 49.99,
      icon: 'navigate-circle-outline',
      gradient: ['#DC2626', '#F97316'],
      popular: true,
      features: [
        'Enhanced user context',
        '3x more daily usage',
        'For daily users'
      ]
    },
    guide: {
      name: 'AI Max',
      shortName: 'Max',
      description: 'Maximum AI capabilities',
      monthlyPrice: 9.99,
      annualPrice: 99.99,
      icon: 'shield-checkmark-outline',
      gradient: ['#0891B2', '#0D9488'],
      features: [
        'Complete user context',
        '10x more daily usage',
        'For power users'
      ]
    }
  };

  // Calculate AI pricing based on base plan and selected AI tier
  const getAIPricing = () => {
    const selectedTier = aiTiers[selectedAITier];
    const baseTierPrice = selectedTier.monthlyPrice;
    
    const baseRates = {
      monthly: { discount: 0 },
      annual: { discount: 0.17 }, // 17% off
      lifetime: { discount: 0.33 }, // 33% off
    };

    // If basePlan is null, default to monthly rates
    const rate = baseRates[basePlan] || baseRates.monthly;
    const discountedPrice = baseTierPrice * (1 - rate.discount);

    // Calculate clean .99 pricing for psychological impact
    const baseMonthly = discountedPrice;
    
    // Apply founder credit (subtract 1 month from totals)
    const applyFounderCredit = (originalTotal) => {
      if (!founderUpsell) return originalTotal;
      
      const creditedTotal = Math.max(0, originalTotal - baseMonthly);
      
      // Apply psychological pricing
      if (creditedTotal > 0) {
        const wholeDollars = Math.floor(creditedTotal);
        const cents = creditedTotal - wholeDollars;
        
        if (cents === 0.5) {
          // $8.50 → $8.49 (just change 50 cents to 49 cents)
          return wholeDollars + 0.49;
        } else if (cents === 0) {
          // $20.00 → $19.99 (round down whole dollar and add .99)
          return (wholeDollars - 1) + 0.99;
        }
      }
      
      return creditedTotal;
    };
    
    const basePricing = {
      '1month': {
        price: baseMonthly,
        total: baseMonthly,
        savings: 0,
        savingsMonths: 0,
        period: '1 Month',
        subtitle: founderUpsell ? 'FREE with founder package' : 'Try it out'
      },
      '3months': {
        price: baseMonthly * 0.90, // 10% discount = 90% of original price
        total: founderUpsell ?
          // Pay for 3 months with 10% discount (then founder credit removes 1 more = pay for 2) - psychological pricing
          (baseMonthly === 2.99 ? 8.09 : baseMonthly === 4.99 ? 13.49 : 26.99) :
          // Regular pricing - 10% discount
          (baseMonthly === 2.99 ? 8.09 : baseMonthly === 4.99 ? 13.49 : 26.99),
        savings: baseMonthly === 2.99 ? 0.90 : baseMonthly === 4.99 ? 1.50 : 3.00, // 10% savings
        savingsMonths: 0, // Keep as 0 to show percentage savings instead
        period: '3 Months',
        subtitle: founderUpsell ? 'Pay for 2, get 3 + 10% off' : 'Save 10%'
      },
      '6months': {
        price: baseMonthly === 2.99 ? 2.50 : baseMonthly === 4.99 ? 4.17 : 8.33, // Back-calculated from total
        total: founderUpsell ? 
          // Pay for 4 months (5 months - 1 founder credit) - psychological pricing
          (baseMonthly === 2.99 ? 11.99 : baseMonthly === 4.99 ? 19.99 : 39.99) :
          // Regular pricing - save 1 month 
          (baseMonthly === 2.99 ? 14.99 : baseMonthly === 4.99 ? 24.99 : 49.99),
        savings: baseMonthly === 2.99 ? 2.95 : baseMonthly === 4.99 ? 4.95 : 9.95,
        savingsMonths: 1,
        period: '6 Months',
        subtitle: founderUpsell ? 'Pay for 4, get 6' : 'Most popular',
        badge: founderUpsell ? 'FOUNDER SPECIAL' : 'RECOMMENDED'
      },
      '12months': {
        price: baseMonthly === 2.99 ? 2.25 : baseMonthly === 4.99 ? 3.75 : 7.50, // Back-calculated from total
        total: founderUpsell ?
          // Pay for 7 months (8 months - 1 founder credit) - psychological pricing  
          (baseMonthly === 2.99 ? 20.99 : baseMonthly === 4.99 ? 34.99 : 69.99) :
          // Regular pricing - save 3 months
          (baseMonthly === 2.99 ? 26.99 : baseMonthly === 4.99 ? 44.99 : 89.99),
        savings: baseMonthly === 2.99 ? 8.89 : baseMonthly === 4.99 ? 14.89 : 29.89,
        savingsMonths: 3,
        period: '12 Months',
        subtitle: founderUpsell ? 'Pay for 7, get 12' : 'Best value',
        badge: founderUpsell ? 'MAXIMUM SAVINGS' : '3 MONTHS FREE'
      }
    };
    
    // Recalculate per-month prices for founder upsells (totals already include founder credit)
    if (founderUpsell) {
      Object.keys(basePricing).forEach(duration => {
        const monthCount = duration === '1month' ? 1 : duration === '3months' ? 3 : duration === '6months' ? 6 : 12;
        basePricing[duration].price = basePricing[duration].total / monthCount;
        basePricing[duration].savings = basePricing[duration].savings + baseMonthly; // Add the free month to savings
      });
    }
    
    return basePricing;
  };

  const pricing = getAIPricing();
  const formatPrice = (price) => `$${price.toFixed(2)}`;

  const getMaxStep = () => standalone ? 2 : 3;
  const isLastStep = () => currentStep >= getMaxStep();
  
  // Helper function to determine what the current step represents
  const getCurrentStepType = () => {
    if (standalone) {
      return currentStep === 1 ? 'duration' : 'summary';
    } else {
      return currentStep === 1 ? 'tier' : currentStep === 2 ? 'duration' : 'summary';
    }
  };
  
  const handleNextStep = () => {
    if (!isLastStep()) {
      const currentStepType = getCurrentStepType();
      
      // For founders (spotsRemaining > 0) on duration step with no selection, give them free AI Light
      if (currentStepType === 'duration' && !selectedDuration && spotsRemaining > 0) {
        // Set them up with AI Light for free and go to summary - EXACTLY like "Just Give Me 1 Month AI Light" button
        setSelectedAITier('compass'); // AI Light
        setSelectedDuration('1month');
        setAiSkipped(false); // They're getting AI, just for free
        
        // Navigate to order summary (step 3)
        fadeAnim.setValue(0);
        slideAnim.setValue(30);
        setCurrentStep(3);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
        return;
      }
      
      // If moving from duration step and no duration is selected, default to 1month (for non-founders)
      if (currentStepType === 'duration' && !selectedDuration) {
        setSelectedDuration('1month');
      }
      
      // Reset animations for step transition
      fadeAnim.setValue(0);
      slideAnim.setValue(30);
      setCurrentStep(currentStep + 1);
      
      // Animate in the new step
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      fadeAnim.setValue(0);
      slideAnim.setValue(-30);
      
      // If AI was skipped and we're on step 3, go back to step 1 instead of step 2
      const targetStep = (aiSkipped && currentStep === 3) ? 1 : currentStep - 1;
      
      // Reset aiSkipped state when going back to step 1
      if (targetStep === 1) {
        setAiSkipped(false);
      }
      
      setCurrentStep(targetStep);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const handlePurchase = () => {
    const selected = pricing[selectedDuration];
    onPurchaseAI({
      aiTier: selectedAITier,
      duration: selectedDuration,
      price: selected.total,
      savings: selected.savings,
      basePlan: basePlan
    });
  };
  
  // Handle scroll events to update dots
  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const cardWidth = width * 0.7 + 12;
    const index = Math.round(scrollX / cardWidth);
    setCurrentScrollIndex(index);
    
    // Update selected tier based on scroll position
    const tierKeys = Object.keys(aiTiers);
    if (index >= 0 && index < tierKeys.length) {
      setSelectedAITier(tierKeys[index]);
    }
  };

  const getPlanBenefits = () => {
    switch (basePlan) {
      case 'lifetime': 
        return {
          title: 'Lifetime Member Exclusive',
          subtitle: '33% OFF all AI plans',
          icon: 'trophy',
          color: '#FFD700'
        };
      case 'annual': 
        return {
          title: 'Annual Member Benefit',
          subtitle: '17% OFF all AI plans',
          icon: 'star',
          color: '#818CF8'
        };
      default:
        return {
          title: 'Enhance Your Experience',
          subtitle: 'Add AI to accelerate goals',
          icon: 'rocket',
          color: '#10B981'
        };
    }
  };

  const getPlanName = () => {
    if (standalone) {
      return aiTiers[selectedAITier].name + ' Assistant';
    }
    switch (basePlan) {
      case 'monthly': return 'LifeCompass Pro Monthly';
      case 'annual': return 'LifeCompass Pro Annual';
      case 'lifetime': return 'Lifetime Pro Access';
      default: return 'LifeCompass Pro';
    }
  };

  const benefits = getPlanBenefits();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={{
        flex: 1,
        backgroundColor: '#000000',
      }}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        
        {/* Animated Container */}
        <Animated.View style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ]
        }}>
          {/* Header */}
          <View style={{
            paddingTop: safeSpacing.top,
            paddingHorizontal: 20,
            paddingBottom: 20,
          }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}>
              {currentStep > 1 ? (
                <TouchableOpacity
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={handleBackStep}
                >
                  <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <View style={{ width: 40 }} />
              )}

              {/* Progress Indicator */}
              <View style={{ alignItems: 'center' }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 4,
                }}>
                  <View style={{
                    width: 24,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: currentStep >= 1 ? '#FFD700' : 'rgba(255,255,255,0.2)',
                    marginRight: 4,
                  }} />
                  <View style={{
                    width: 24,
                    height: 3,
                    borderRadius: 2,
                    backgroundColor: currentStep >= 2 ? '#FFD700' : 'rgba(255,255,255,0.2)',
                    marginRight: standalone ? 0 : 4,
                  }} />
                  {!standalone && (
                    <View style={{
                      width: 24,
                      height: 3,
                      borderRadius: 2,
                      backgroundColor: currentStep >= 3 ? '#FFD700' : 'rgba(255,255,255,0.2)',
                    }} />
                  )}
                </View>
                <Text style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                  letterSpacing: 0.5,
                }}>
                  STEP {currentStep} OF {getMaxStep()}
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={onClose}
              >
                <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            {/* Dynamic Header Content */}
            <View style={{
              alignItems: 'center',
            }}>
              <View style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: 'rgba(255,255,255,0.08)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 16,
              }}>
                <Ionicons 
                  name={currentStep === 1 ? benefits.icon : currentStep === 2 ? aiTiers[selectedAITier].icon : 'receipt-outline'} 
                  size={26} 
                  color={currentStep === 1 ? benefits.color : currentStep === 2 ? '#FFD700' : '#10B981'} 
                />
              </View>
              
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: '#FFFFFF',
                marginBottom: 8,
                textAlign: 'center',
              }}>
                {getCurrentStepType() === 'tier' ? benefits.title : getCurrentStepType() === 'duration' ? 'Complete Your Upgrade' : 'Order Summary'}
              </Text>
              
              <Text style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.6)',
                textAlign: 'center',
                paddingHorizontal: 40,
              }}>
                {getCurrentStepType() === 'tier' ? benefits.subtitle : getCurrentStepType() === 'duration' ? `Add ${aiTiers[selectedAITier].name} to your ${standalone ? 'collection' : 'plan'}` : 'Review your selection before purchasing'}
              </Text>
            </View>
          </View>

          {/* Content */}
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingBottom: 60, // Reduced padding since buttons now float
            }}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }}>
              {getCurrentStepType() === 'tier' ? (
                // Step 1: AI Tier Selection - Horizontal cards
                <>
                  {/* Indicator showing swipeable cards */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 10,
                  }}>
                    <Ionicons name="chevron-back" size={16} color="rgba(255,255,255,0.3)" />
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      marginHorizontal: 10,
                      letterSpacing: 0.5,
                    }}>
                      SWIPE TO EXPLORE
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
                  </View>
                  
                  <ScrollView 
                    ref={scrollViewRef}
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 20 }}
                    snapToInterval={width * 0.7 + 12}
                    decelerationRate="fast"
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {Object.entries(aiTiers).map(([tierId, tier], index) => {
                      const isSelected = selectedAITier === tierId;
                      return (
                        <TouchableOpacity
                          key={tierId}
                          style={{
                            width: width * 0.7,
                            marginRight: 12,
                            marginLeft: index === 0 ? (width - width * 0.7) / 2 : 0,
                            marginEnd: index === Object.keys(aiTiers).length - 1 ? (width - width * 0.7) / 2 : 12,
                          }}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            setSelectedAITier(tierId);
                          }}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={isSelected ? tier.gradient : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{
                              borderRadius: 24,
                              padding: 24,
                              borderWidth: isSelected ? 2 : 1,
                              borderColor: isSelected ? tier.gradient[0] : 'rgba(255,255,255,0.3)',
                              minHeight: 380,
                              position: 'relative',
                            }}
                          >
                            {/* Popular Badge */}
                            {tier.popular && (
                              <View style={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                backgroundColor: '#FF6B6B',
                                paddingHorizontal: 12,
                                paddingVertical: 6,
                                borderRadius: 12,
                                shadowColor: '#FF6B6B',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 8,
                                zIndex: 2,
                              }}>
                                <Text style={{
                                  fontSize: 9,
                                  fontWeight: '700',
                                  color: '#FFFFFF',
                                  letterSpacing: 0.5,
                                }}>
                                  POPULAR
                                </Text>
                              </View>
                            )}

                            {/* Icon */}
                            <View style={{
                              width: 60,
                              height: 60,
                              borderRadius: 30,
                              backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                              justifyContent: 'center',
                              alignItems: 'center',
                              marginBottom: 20,
                              alignSelf: 'center',
                            }}>
                              <Ionicons 
                                name={tier.icon} 
                                size={32} 
                                color={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.8)'}
                              />
                            </View>

                            {/* Title */}
                            <Text style={{
                              fontSize: 24,
                              fontWeight: '700',
                              color: '#FFFFFF',
                              textAlign: 'center',
                              marginBottom: 8,
                            }}>
                              {tier.name}
                            </Text>

                            {/* Description */}
                            <Text style={{
                              fontSize: 14,
                              color: 'rgba(255,255,255,0.6)',
                              textAlign: 'center',
                              marginBottom: 20,
                              lineHeight: 20,
                            }}>
                              {tier.description}
                            </Text>

                            {/* Price */}
                            <View style={{
                              alignItems: 'center',
                              marginBottom: 24,
                            }}>
                              <Text style={{
                                fontSize: 36,
                                fontWeight: '300',
                                color: '#FFFFFF',
                              }}>
                                ${(tier.monthlyPrice * (1 - (basePlan === 'lifetime' ? 0.33 : basePlan === 'annual' ? 0.17 : 0))).toFixed(2)}
                              </Text>
                              <Text style={{
                                fontSize: 13,
                                color: 'rgba(255,255,255,0.5)',
                              }}>
                                per month
                              </Text>
                            </View>

                            {/* Features */}
                            <View style={{ flex: 1 }}>
                              {tier.features.map((feature, index) => (
                                <View key={index} style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  marginBottom: 12,
                                }}>
                                  <View style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    backgroundColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginRight: 12,
                                  }}>
                                    <Ionicons 
                                      name="checkmark" 
                                      size={12} 
                                      color={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
                                    />
                                  </View>
                                  <Text style={{
                                    fontSize: 13,
                                    color: 'rgba(255,255,255,0.8)',
                                    flex: 1,
                                  }}>
                                    {feature}
                                  </Text>
                                </View>
                              ))}
                            </View>

                            {/* Selection Indicator */}
                            {isSelected && (
                              <View style={{
                                position: 'absolute',
                                bottom: 20,
                                right: 20,
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: tier.gradient[0],
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                              </View>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Dots indicator */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    marginBottom: 20,
                  }}>
                    {Object.keys(aiTiers).map((tierId, index) => (
                      <View
                        key={tierId}
                        style={{
                          width: currentScrollIndex === index ? 24 : 6,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: currentScrollIndex === index ? '#FFD700' : 'rgba(255,255,255,0.2)',
                          marginHorizontal: 4,
                        }}
                      />
                    ))}
                  </View>
                </>
              ) : getCurrentStepType() === 'duration' ? (
                // Duration Selection
                <>
                  {/* Selected Tier Summary */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,215,0,0.08)',
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 24,
                    borderWidth: 1,
                    borderColor: 'rgba(255,215,0,0.2)',
                  }}>
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: 'rgba(255,215,0,0.15)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 16,
                    }}>
                      <Ionicons 
                        name={aiTiers[selectedAITier].icon} 
                        size={22} 
                        color="#FFD700" 
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: '600',
                        color: '#FFFFFF',
                        marginBottom: 2,
                      }}>
                        {aiTiers[selectedAITier].name}
                      </Text>
                      <Text style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.6)',
                      }}>
                        {aiTiers[selectedAITier].description}
                      </Text>
                    </View>
                  </View>

                  {/* Duration Cards */}
                  <View style={{ marginBottom: 20 }}>
                    {Object.entries(pricing).filter(([duration]) => duration !== '1month').map(([duration, info]) => {
                      const isSelected = selectedDuration === duration;
                      return (
                        <TouchableOpacity
                          key={duration}
                          style={{
                            marginBottom: 12,
                            borderRadius: 20,
                            overflow: 'hidden',
                          }}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            // Toggle selection - if already selected, deselect it
                            if (selectedDuration === duration) {
                              setSelectedDuration('');
                            } else {
                              setSelectedDuration(duration);
                            }
                          }}
                          activeOpacity={0.9}
                        >
                          <LinearGradient
                            colors={isSelected ? 
                              ['rgba(255,215,0,0.12)', 'rgba(255,215,0,0.05)'] : 
                              ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.02)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                              padding: 20,
                              borderWidth: isSelected ? 2 : 1,
                              borderColor: isSelected ? '#FFD700' : 'rgba(255,255,255,0.08)',
                              borderRadius: 20,
                              position: 'relative',
                            }}
                          >
                            {/* Badge */}
                            {info.badge && (
                              <View style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                backgroundColor: info.badge === 'RECOMMENDED' ? '#FF6B6B' : '#10B981',
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                borderBottomLeftRadius: 16,
                              }}>
                                <Text style={{
                                  fontSize: 10,
                                  fontWeight: '700',
                                  color: '#FFFFFF',
                                  letterSpacing: 0.5,
                                }}>
                                  {info.badge}
                                </Text>
                              </View>
                            )}

                            <View style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}>
                              {/* Left content */}
                              <View style={{ flex: 1 }}>
                                <Text style={{
                                  fontSize: 20,
                                  fontWeight: '700',
                                  color: isSelected ? '#FFD700' : '#FFFFFF',
                                  marginBottom: 4,
                                }}>
                                  {info.period}
                                </Text>
                                <Text style={{
                                  fontSize: 13,
                                  color: 'rgba(255,255,255,0.5)',
                                  marginBottom: info.savingsMonths > 0 ? 8 : 0,
                                }}>
                                  {info.subtitle}
                                </Text>
                                {info.savingsMonths > 0 && !founderUpsell && (
                                  <View style={{
                                    backgroundColor: 'rgba(34,197,94,0.1)',
                                    paddingHorizontal: 10,
                                    paddingVertical: 4,
                                    borderRadius: 8,
                                    alignSelf: 'flex-start',
                                  }}>
                                    <Text style={{
                                      fontSize: 11,
                                      color: '#22C55E',
                                      fontWeight: '600',
                                    }}>
                                      Save {info.savingsMonths} month{info.savingsMonths > 1 ? 's' : ''}
                                    </Text>
                                  </View>
                                )}
                              </View>

                              {/* Right content - Price */}
                              <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{
                                  fontSize: 28,
                                  fontWeight: '700',
                                  color: isSelected ? '#FFD700' : '#FFFFFF',
                                }}>
                                  {formatPrice(info.total)}
                                </Text>
                                <Text style={{
                                  fontSize: 12,
                                  color: 'rgba(255,255,255,0.4)',
                                }}>
                                  {formatPrice(info.price)}/mo
                                </Text>
                              </View>
                            </View>
                          </LinearGradient>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                </>
              ) : (
                // Order Summary
                <>
                  {/* Main Order Card */}
                  <LinearGradient
                    colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      borderRadius: 24,
                      padding: 20,
                      marginBottom: 20,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Receipt-style header */}
                    <View style={{
                      alignItems: 'center',
                      paddingBottom: 16,
                      marginBottom: 16,
                      borderBottomWidth: 2,
                      borderBottomColor: 'rgba(255,255,255,0.08)',
                      borderStyle: 'dashed',
                    }}>
                      <Text style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.4)',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}>
                        LifeCompass
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.3)',
                      }}>
                        Order #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                      </Text>
                    </View>

                    {/* Base Plan Item - only show if not standalone */}
                    {!standalone && (
                      <View style={{
                        marginBottom: 16,
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                          marginBottom: 8,
                        }}>
                          <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            backgroundColor: 'rgba(255,255,255,0.08)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}>
                            <Ionicons name="rocket" size={18} color="#FFFFFF" />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: 15,
                              fontWeight: '600',
                              color: '#FFFFFF',
                              marginBottom: 2,
                            }}>
                              {getPlanName()}
                            </Text>
                            <Text style={{
                              fontSize: 12,
                              color: 'rgba(255,255,255,0.4)',
                            }}>
                              {basePlan === 'lifetime' ? 'One-time purchase' : basePlan === 'annual' ? 'Billed annually' : 'Billed monthly'}
                            </Text>
                          </View>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#FFFFFF',
                          }}>
                            {getCurrentPrice().display}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* AI Add-on Item */}
                    <View style={{
                      marginBottom: 20,
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                      }}>
                        <View style={{
                          width: 36,
                          height: 36,
                          borderRadius: 12,
                          backgroundColor: aiSkipped ? 'rgba(255,255,255,0.04)' : 'rgba(255,215,0,0.15)',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 12,
                        }}>
                          <Ionicons 
                            name={aiSkipped ? 'remove-circle-outline' : 'sparkles'} 
                            size={18} 
                            color={aiSkipped ? 'rgba(255,255,255,0.3)' : '#FFD700'}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{
                            fontSize: 15,
                            fontWeight: '600',
                            color: aiSkipped ? 'rgba(255,255,255,0.4)' : '#FFFFFF',
                            marginBottom: 2,
                          }}>
                            {aiSkipped ? (standalone ? 'No AI Selected' : 'No AI Assistant') : 
                              founderUpsell ? 
                                `${selectedDuration === '1month' ? '1' : selectedDuration === '3months' ? '3' : selectedDuration === '6months' ? '6' : '12'} months of ${aiTiers[selectedAITier].name}` :
                                (standalone ? getPlanName() : aiTiers[selectedAITier].name)
                            }
                          </Text>
                          <Text style={{
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.4)',
                          }}>
                            {aiSkipped ? 'Can be added anytime' : 
                              founderUpsell ?
                                `Full value: ${formatPrice(aiTiers[selectedAITier].monthlyPrice * (selectedDuration === '1month' ? 1 : selectedDuration === '3months' ? 3 : selectedDuration === '6months' ? 6 : 12))}` :
                                pricing[selectedDuration].subtitle
                            }
                          </Text>
                          {!aiSkipped && pricing[selectedDuration].savingsMonths > 0 && !founderUpsell && (
                            <View style={{
                              backgroundColor: 'rgba(34,197,94,0.15)',
                              paddingHorizontal: 8,
                              paddingVertical: 2,
                              borderRadius: 6,
                              alignSelf: 'flex-start',
                              marginTop: 4,
                            }}>
                              <Text style={{
                                fontSize: 10,
                                color: '#22C55E',
                                fontWeight: '600',
                              }}>
                                {pricing[selectedDuration].savingsMonths} MONTHS FREE
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={{
                          fontSize: 16,
                          fontWeight: '600',
                          color: aiSkipped ? 'rgba(255,255,255,0.3)' : '#FFFFFF',
                          textDecorationLine: aiSkipped ? 'line-through' : 'none',
                        }}>
                          {aiSkipped ? 
                            (founderUpsell ? formatPrice(aiTiers.compass.monthlyPrice) : '$0.00') : 
                            formatPrice(aiTiers[selectedAITier].monthlyPrice * (selectedDuration === '1month' ? 1 : selectedDuration === '3months' ? 3 : selectedDuration === '6months' ? 6 : 12))
                          }
                        </Text>
                      </View>
                    </View>

                    {/* Founder Credit Applied - only show for founder upsells */}
                    {founderUpsell && !aiSkipped && (
                      <View style={{
                        marginBottom: 20,
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                        }}>
                          <View style={{
                            width: 36,
                            height: 36,
                            borderRadius: 12,
                            backgroundColor: 'rgba(34,197,94,0.15)',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 12,
                          }}>
                            <Ionicons 
                              name="gift" 
                              size={18} 
                              color="#22C55E"
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{
                              fontSize: 15,
                              fontWeight: '600',
                              color: '#22C55E',
                              marginBottom: 2,
                            }}>
                              Founder offer
                            </Text>
                            <Text style={{
                              fontSize: 12,
                              color: 'rgba(34,197,94,0.7)',
                            }}>
                              {aiSkipped ? 
                                '1 month AI Light free with founder access' :
                                `${selectedDuration === '1month' ? '1 month' : 
                                  selectedDuration === '3months' ? '1 month + 10% off' :
                                  selectedDuration === '6months' ? '2 months' : 
                                  '5 months'} free with founder access`
                              }
                            </Text>
                          </View>
                          <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#22C55E',
                          }}>
                            -{formatPrice(
                              // For "Just Give Me 1 Month AI Light" - hardcode $2.99 savings
                              selectedDuration === '1month' && selectedAITier === 'compass' ? 
                                2.99 : 
                                // For other durations, calculate normally
                                (aiTiers[selectedAITier].monthlyPrice * (selectedDuration === '1month' ? 1 : selectedDuration === '3months' ? 3 : selectedDuration === '6months' ? 6 : 12)) - 
                                pricing[selectedDuration].total
                            )}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Divider */}
                    <View style={{
                      height: 1,
                      backgroundColor: 'rgba(255,255,255,0.08)',
                      marginVertical: 16,
                    }} />

                    {/* Total Section */}
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <View>
                        <Text style={{
                          fontSize: 12,
                          color: 'rgba(255,255,255,0.4)',
                          marginBottom: 2,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                        }}>
                          Total Due
                        </Text>
                        <Text style={{
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.3)',
                        }}>
                          {standalone || founderUpsell ? 'One-time' : basePlan === 'lifetime' ? 'One-time' : basePlan === 'annual' ? 'Per year' : 'Per month'}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{
                          fontSize: 28,
                          fontWeight: '700',
                          color: '#FFD700',
                          letterSpacing: -0.5,
                        }}>
                          {formatPrice(
                            (standalone ? 0 : getCurrentPrice().amount) + 
                            (aiSkipped ? 0 : 
                              // For "Just Give Me 1 Month AI Light" - total should be $0.00
                              (selectedDuration === '1month' && selectedAITier === 'compass' && founderUpsell) ? 0 : 
                              pricing[selectedDuration].total
                            )
                          )}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* 1-Month Downsell Offer - only show when AI is skipped */}
                  {aiSkipped && (
                    <View style={{
                      backgroundColor: 'rgba(255,215,0,0.05)',
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 20,
                      borderWidth: 1,
                      borderColor: 'rgba(255,215,0,0.2)',
                    }}>
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}>
                        <View style={{
                          width: 28,
                          height: 28,
                          borderRadius: 14,
                          backgroundColor: 'rgba(255,215,0,0.15)',
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginRight: 10,
                        }}>
                          <Ionicons name="sparkles" size={14} color="#FFD700" />
                        </View>
                        <Text style={{
                          fontSize: 14,
                          fontWeight: '600',
                          color: '#FFD700',
                        }}>
                          Wait! Try AI for just 1 month
                        </Text>
                      </View>
                      
                      <Text style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: 12,
                        paddingLeft: 38,
                      }}>
                        Get {aiTiers[selectedAITier].name} AI assistant for just ${aiTiers[selectedAITier].monthlyPrice.toFixed(2)}/month. Cancel anytime.
                      </Text>

                      <TouchableOpacity
                        style={{
                          backgroundColor: 'rgba(255,215,0,0.1)',
                          borderRadius: 12,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderWidth: 1,
                          borderColor: 'rgba(255,215,0,0.3)',
                          alignSelf: 'flex-start',
                          marginLeft: 38,
                        }}
                        onPress={() => {
                          // Add 1 month AI to the order
                          setAiSkipped(false);
                          setSelectedDuration('1month');
                        }}
                      >
                        <Text style={{
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#FFD700',
                        }}>
                          Add 1 Month AI - ${aiTiers[selectedAITier].monthlyPrice.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}


                  {/* Security Badge */}
                  <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.4)" />
                    <Text style={{
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.4)',
                      marginLeft: 6,
                    }}>
                      Secure checkout • Cancel anytime
                    </Text>
                  </View>
                </>
              )}
            </Animated.View>
          </ScrollView>

          {/* Fixed Bottom CTA */}
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 20,
            paddingBottom: safeSpacing.bottom + 20,
            paddingTop: 20,
            pointerEvents: 'box-none', // Allow touches to pass through empty areas
          }}>
            <TouchableOpacity
              style={{
                overflow: 'hidden',
                borderRadius: 16,
                shadowColor: '#FFD700',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 8,
              }}
              onPress={isLastStep() ? handlePurchase : handleNextStep}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingVertical: 18,
                  alignItems: 'center',
                }}
              >
                {getCurrentStepType() === 'tier' ? (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: '#000000',
                      marginBottom: 2,
                    }}>
                      Continue with {aiTiers[selectedAITier].shortName}
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(0,0,0,0.6)',
                    }}>
                      Select duration →
                    </Text>
                  </View>
                ) : getCurrentStepType() === 'duration' ? (
                  <View style={{ alignItems: 'center' }}>
                    {selectedDuration ? (
                      <>
                        <Text style={{
                          fontSize: 17,
                          fontWeight: '700',
                          color: '#000000',
                          marginBottom: 2,
                        }}>
                          Review Order
                        </Text>
                        <Text style={{
                          fontSize: 13,
                          color: 'rgba(0,0,0,0.6)',
                        }}>
                          {`${pricing[selectedDuration].period} for ${formatPrice(pricing[selectedDuration].total)} →`}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text style={{
                          fontSize: 17,
                          fontWeight: '700',
                          color: '#000000',
                          marginBottom: 2,
                        }}>
                          Get 1 Month AI
                        </Text>
                        <Text style={{
                          fontSize: 13,
                          color: 'rgba(0,0,0,0.6)',
                        }}>
                          {spotsRemaining > 0 ? 'FREE • Start with monthly →' : `${formatPrice(pricing['1month'].total)} • Start with monthly →`}
                        </Text>
                      </>
                    )}
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: 17,
                      fontWeight: '700',
                      color: '#000000',
                      marginBottom: 2,
                    }}>
                      Complete Purchase - {formatPrice(
                        (standalone ? 0 : (basePlan === 'lifetime' ? 99.99 : basePlan === 'annual' ? 34.99 : 3.49)) + 
                        (aiSkipped ? 0 : pricing[selectedDuration].total)
                      )}
                    </Text>
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(0,0,0,0.6)',
                    }}>
                      Secure checkout with App Store
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
            
            {/* Skip/Continue Options */}
            {founderUpsell && !isLastStep() ? (
              // Prominent skip option for founders - they get AI Light for free (only show before final step)
              <TouchableOpacity
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 12,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  alignItems: 'center',
                  marginTop: 16,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
                onPress={() => {
                  // Set them up with AI Light for free and go to summary
                  setSelectedAITier('compass'); // AI Light
                  setSelectedDuration('1month');
                  setAiSkipped(false); // They're getting AI, just for free
                  
                  // Navigate to order summary (step 3 or step 2 for standalone)
                  const targetStep = standalone ? 2 : 3;
                  fadeAnim.setValue(0);
                  slideAnim.setValue(30);
                  setCurrentStep(targetStep);
                  
                  Animated.parallel([
                    Animated.timing(fadeAnim, {
                      toValue: 1,
                      duration: 300,
                      useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                      toValue: 0,
                      duration: 300,
                      useNativeDriver: true,
                    })
                  ]).start();
                  
                  console.log('Founder selected free AI Light, showing order summary');
                }}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  marginBottom: 2,
                }}>
                  Just Give Me 1 Month AI Light
                </Text>
                <Text style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                }}>
                  Free with your founder membership
                </Text>
              </TouchableOpacity>
            ) : (
              // Regular skip link for non-founders
              (currentStep === 1 || currentStep === 2) && !standalone && (
                <TouchableOpacity
                  style={{
                    alignItems: 'center',
                    marginTop: 16,
                  }}
                  onPress={() => {
                    // Skip to step 3 (order summary) without AI
                    setAiSkipped(true);
                    fadeAnim.setValue(0);
                    slideAnim.setValue(30);
                    setCurrentStep(3);
                    
                    Animated.parallel([
                      Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                      }),
                      Animated.timing(slideAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                      })
                    ]).start();
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.4)',
                    textDecorationLine: 'underline',
                  }}>
                    Continue without AI
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default AIUpsellModal;
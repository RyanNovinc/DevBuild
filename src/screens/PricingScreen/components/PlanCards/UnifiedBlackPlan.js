// src/screens/PricingScreen/components/PlanCards/UnifiedBlackPlan.js
import React, { useState, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, Modal, Animated, Dimensions } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import AIUpsellModal from '../AIUpsellModal';

const UnifiedBlackPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  handlePurchase,
  isLifetimeMember,
  isMonthlySubscriber = false, // Add monthly subscriber prop
  founderNumber = null, // Add founder number prop
  spotsRemaining = 1000,
  responsive = {},
  initialTime,
  onNavigateToAIPlans,
  billing = 'monthly',
  setBilling
}) => {
  const isSelected = selectedPlan === 'founding';
  const { isTablet } = responsive;
  const navigation = useNavigation();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  
  // Crown rain animation state
  const [crowns, setCrowns] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Countdown state
  const [countdownTime, setCountdownTime] = useState(initialTime || {
    days: 26,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

  // Modal state for founder info
  const [showFounderInfo, setShowFounderInfo] = useState(false);
  
  // Modal state for guarantee info
  const [showGuaranteeInfo, setShowGuaranteeInfo] = useState(false);
  const [guaranteeDetailsView, setGuaranteeDetailsView] = useState('main'); // 'main' or 'details'
  
  // AI Upsell Modal state
  const [showAIUpsell, setShowAIUpsell] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState(null);

  // Timer logic
  useEffect(() => {
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
  
  // Determine urgency levels and tiered pricing
  const showUrgentBadge = spotsRemaining <= 22 && spotsRemaining > 0;
  const spotsExhausted = spotsRemaining <= 0;
  const isMonthlyPlan = spotsExhausted;
  
  // Calculate current price based on user number
  const getCurrentPrice = () => {
    if (spotsExhausted) {
      // When sold out, show billing-based pricing
      if (billing === 'lifetime') return '$99.99';
      return billing === 'annual' ? '$34.99' : '$3.49';
    }
    
    const userNumber = 1001 - spotsRemaining;
    if (userNumber <= 100) return '$0.99'; // Users 1-100
    if (userNumber <= 500) return '$2.99'; // Users 101-500
    return '$4.99'; // Users 501-1000
  };
  
  // Get current tier info for AI benefits messaging
  const getCurrentTier = () => {
    if (spotsExhausted) return { tier: 'monthly', nextTier: null };
    
    const userNumber = 1001 - spotsRemaining;
    if (userNumber <= 100) return { tier: 'early', nextTier: 'Mid tier', nextAt: 101, price: '$0.99' };
    if (userNumber <= 500) return { tier: 'mid', nextTier: 'Final tier', nextAt: 501, price: '$2.99' };
    return { tier: 'final', nextTier: 'Monthly subscription', nextAt: 1001, price: '$4.99' };
  };

  // Get AI benefit for current tier - All users get 1 month AI Light
  const getAIBenefit = () => {
    if (spotsExhausted) return 'All Pro features';
    
    return '1 month AI Light included'; // All founder tiers get 1 month AI Light
  };
  
  // Rain animation function (crowns for founders, compass for monthly subscribers)
  const triggerRainAnimation = () => {
    if ((!isLifetimeMember && !isMonthlySubscriber) || isAnimating) return; // Prevent if already animating
    
    setIsAnimating(true); // Mark animation as started
    const numberOfIcons = 12;
    const newIcons = [];
    
    for (let i = 0; i < numberOfIcons; i++) {
      const iconId = Date.now() + i;
      const randomX = Math.random() * (screenWidth - 30); // 30px for crown width
      const randomDelay = Math.random() * 1000; // Stagger the drops
      const randomDuration = 2000 + Math.random() * 1000; // 2-3 seconds fall time
      
      const translateY = new Animated.Value(-150);
      const opacity = new Animated.Value(1);
      const rotate = new Animated.Value(0);
      
      newIcons.push({
        id: iconId,
        x: randomX,
        translateY,
        opacity,
        rotate,
        delay: randomDelay,
        duration: randomDuration
      });
    }
    
    setCrowns(newIcons); // Reusing same state array for both types
    
    // Animate each icon
    newIcons.forEach((icon) => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(icon.translateY, {
            toValue: screenHeight + 100,
            duration: icon.duration,
            useNativeDriver: true,
          }),
          Animated.timing(icon.rotate, {
            toValue: 1,
            duration: icon.duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(icon.duration * 0.8), // Fade out in last 20% of animation
            Animated.timing(icon.opacity, {
              toValue: 0,
              duration: icon.duration * 0.2,
              useNativeDriver: true,
            })
          ])
        ]).start();
      }, icon.delay);
    });
    
    // Clean up crowns after animation completes
    setTimeout(() => {
      setCrowns([]);
      setIsAnimating(false); // Reset animation state
    }, 4000); // Clean up after all animations complete
  };
  
  return (
    <View style={{
      paddingHorizontal: 24,
      paddingVertical: 32,
      marginTop: 24,
    }}>
      {/* Main Black Container */}
      <View style={{
        backgroundColor: '#000000',
        borderRadius: 20,
      }}>
        {/* Social Proof Counter - Always show when there are sales */}
        {(() => {
          const spotsSold = 1000 - spotsRemaining;
          const shouldShowSocialProof = spotsSold > 0;
          
          if (shouldShowSocialProof) {
            return (
              <View style={{
                paddingTop: 12,
                paddingBottom: 8,
                paddingHorizontal: 24,
                marginTop: -48,
                alignItems: 'center',
              }}>
                <Text style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}>
                  {(() => {
                    if (spotsRemaining === 0) {
                      // When sold out, show 1000+ SOLD
                      return '1000+ SOLD';
                    } else if (spotsSold < 100) {
                      // 10 increments under 100
                      const increment = Math.floor(spotsSold / 10) * 10;
                      return increment > 0 ? `${increment}+ SOLD` : '';
                    } else {
                      // 50 increments for 100+
                      const increment = Math.floor(spotsSold / 50) * 50;
                      return `${increment}+ SOLD`;
                    }
                  })()}
                </Text>
              </View>
            );
          }
          return null;
        })()}

        {/* Billing Toggle - Only show when sold out - Now with 3 options */}
        {spotsExhausted && setBilling && (
          <View style={{
            backgroundColor: '#000000',
            borderRadius: 12,
            padding: 4,
            flexDirection: 'row',
            marginBottom: 20,
            marginTop: 12,
            alignSelf: 'center',
            width: '95%',
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: billing === 'monthly' ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
              onPress={() => setBilling('monthly')}
            >
              <Text style={{
                textAlign: 'center',
                fontSize: 13,
                fontWeight: '600',
                color: billing === 'monthly' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
              }}>
                Monthly
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: billing === 'annual' ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
              onPress={() => setBilling('annual')}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: billing === 'annual' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
                }}>
                  Annual
                </Text>
                <Text style={{
                  fontSize: 10,
                  color: billing === 'annual' ? '#FFD700' : 'transparent',
                  marginTop: 2,
                  height: 12, // Reserve consistent height
                  fontWeight: '600',
                }}>
                  2 months free
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                backgroundColor: billing === 'lifetime' ? 'rgba(255,215,0,0.15)' : 'transparent',
                borderWidth: billing === 'lifetime' ? 1 : 0,
                borderColor: billing === 'lifetime' ? '#FFD700' : 'transparent',
              }}
              onPress={() => setBilling('lifetime')}
            >
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color: billing === 'lifetime' ? '#FFD700' : 'rgba(255,255,255,0.5)',
                }}>
                  Lifetime
                </Text>
                <Text style={{
                  fontSize: 10,
                  color: billing === 'lifetime' ? '#FFD700' : 'transparent',
                  marginTop: 2,
                  height: 12, // Reserve consistent height
                  fontWeight: '600',
                }}>
                  Best Value
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Timer Section at Top - Only show when not sold out */}
        {!isMonthlyPlan && (
          <TouchableOpacity 
            style={{
              paddingTop: 12,
              paddingBottom: 16,
              paddingHorizontal: 24,
              marginTop: (() => {
                const spotsSold = 1000 - spotsRemaining;
                return spotsSold > 0 ? -8 : -48; // Adjust spacing based on social proof
              })(),
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowFounderInfo(true);
            }}
            activeOpacity={0.8}
          >
          
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
            <FontAwesome5 
              name="crown" 
              size={12} 
              color="#FFD700"
              style={{ marginRight: 6 }}
            />
            <Text style={{
              fontSize: 11,
              fontWeight: '600',
              color: '#FFD700',
              letterSpacing: 0.5,
              textTransform: 'uppercase',
            }}>
              Launch Offer Ends In
            </Text>
          </View>
          
          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}>
            <TimeUnit value={countdownTime.days} label="days" />
            <TimeSeparator />
            <TimeUnit value={countdownTime.hours} label="hrs" />
            <TimeSeparator />
            <TimeUnit value={countdownTime.minutes} label="min" />
            <TimeSeparator />
            <TimeUnit value={countdownTime.seconds} label="sec" isSeconds />
          </View>
          
          {/* Tier-specific spots remaining */}
          <View style={{
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#FF6B6B',
              letterSpacing: 0.5,
            }}>
              {(() => {
                const userNumber = 1001 - spotsRemaining;
                const tier = getCurrentTier();
                
                if (tier.tier === 'early') {
                  const spotsLeftInTier = 100 - userNumber;
                  if (spotsLeftInTier === 0) {
                    return 'Last Early Bird spot!';
                  }
                  return (
                    <>
                      Only <Text style={{ textDecorationLine: 'underline' }}>{spotsLeftInTier}</Text> Early Bird spots left
                    </>
                  );
                } else if (tier.tier === 'mid') {
                  const spotsLeftInTier = 500 - userNumber;
                  if (spotsLeftInTier === 0) {
                    return 'Last Mid Tier spot!';
                  }
                  return (
                    <>
                      Only <Text style={{ textDecorationLine: 'underline' }}>{spotsLeftInTier}</Text> Mid Tier spots left
                    </>
                  );
                } else if (tier.tier === 'final') {
                  const spotsLeftInTier = 1000 - userNumber;
                  if (spotsLeftInTier === 0) {
                    return 'Last founder spot!';
                  }
                  return (
                    <>
                      Only <Text style={{ textDecorationLine: 'underline' }}>{spotsLeftInTier}</Text> Final Tier spots left
                    </>
                  );
                }
                return '';
              })()}
            </Text>
            <Text style={{
              fontSize: 12,
              fontWeight: '500',
              color: 'rgba(255,107,107,0.8)',
              letterSpacing: 0.3,
              marginTop: 4,
              textAlign: 'center',
            }}>
              (This price and deal is limited)
            </Text>
          </View>
        </TouchableOpacity>
        )}

        {/* Pricing Section */}
        <TouchableOpacity
          style={{
            paddingTop: isMonthlyPlan ? 48 : 32,
            paddingHorizontal: 32,
            paddingBottom: 50,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: isLifetimeMember ? 'rgba(255,215,0,0.6)' : isMonthlySubscriber ? `${theme.primary || '#2196F3'}99` : (isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'),
            borderRadius: 18,
            margin: 2,
            marginTop: isMonthlyPlan ? 24 : 48,
            height: 380,
            position: 'relative',
            backgroundColor: isLifetimeMember ? 'rgba(255,215,0,0.05)' : isMonthlySubscriber ? `${theme.primary || '#2196F3'}0D` : 'transparent',
          }}
          onPress={() => {
            if (isLifetimeMember || isMonthlySubscriber) {
              // Trigger rain animation for both lifetime members and monthly subscribers
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              triggerRainAnimation();
            } else {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              handleSelectPlan('founding');
            }
          }}
          activeOpacity={0.7}
        >

          {/* Title */}
          <View style={{
            alignItems: 'center',
            marginBottom: isMonthlyPlan ? 16 : 8,
            position: 'relative',
          }}>
            {isLifetimeMember ? (
              <>
                <FontAwesome5 
                  name="crown" 
                  size={16} 
                  color="#FFD700"
                  style={{ marginBottom: 8 }}
                />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#FFD700',
                  letterSpacing: 0.5,
                  textAlign: 'center',
                }}>
                  YOU'RE A FOUNDER
                </Text>
              </>
            ) : isMonthlySubscriber ? (
              <>
                <Ionicons 
                  name="compass" 
                  size={24} 
                  color={theme.primary || '#2196F3'}
                  style={{ marginBottom: 8 }}
                />
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: theme.primary || '#2196F3',
                  letterSpacing: 0.5,
                  textAlign: 'center',
                }}>
                  ACTIVE SUBSCRIBER
                </Text>
              </>
            ) : (
              <>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '600',
                  color: '#FFFFFF',
                  letterSpacing: 0.5,
                }}>
                  {spotsExhausted ? (billing === 'lifetime' ? 'LIFETIME PRO ACCESS' : 'LIFECOMPASS PRO') : 'LIFETIME PRO ACCESS'}
                </Text>
                <Ionicons 
                  name="compass" 
                  size={16} 
                  color="#2196F3"
                  style={{ 
                    position: 'absolute',
                    left: -20,
                    top: 1,
                  }}
                />
              </>
            )}
          </View>
          
          {/* Subtitle */}
          <Text style={{
            fontSize: 13,
            color: isLifetimeMember ? 'rgba(255,215,0,0.8)' : isMonthlySubscriber ? `${theme.primary || '#2196F3'}CC` : 'rgba(255,255,255,0.5)',
            marginBottom: isMonthlyPlan ? 32 : 24,
            textAlign: 'center',
          }}>
            {isLifetimeMember 
              ? `Founder #${founderNumber || '???'} • Lifetime Pro Access`
              : isMonthlySubscriber
                ? '' // Empty string for cleaner look
                : (spotsExhausted ? (billing === 'lifetime' ? 'Plan your life like a CEO • One-time payment' : 'Plan your life like a CEO') : 'Plan your life like a CEO • One-time payment')
            }
          </Text>

          {/* Price */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
            marginBottom: isMonthlyPlan ? 24 : 16,
            paddingTop: isMonthlyPlan ? 16 : 8,
          }}>
            {isLifetimeMember ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 36,
                  fontWeight: '300',
                  color: '#FFD700',
                  letterSpacing: -1,
                  textAlign: 'center',
                }}>
                  UNLOCKED
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255,215,0,0.7)',
                  marginTop: 4,
                  fontWeight: '400',
                  textAlign: 'center',
                }}>
                  All features included forever
                </Text>
              </View>
            ) : isMonthlySubscriber ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 36,
                  fontWeight: '300',
                  color: theme.primary || '#2196F3',
                  letterSpacing: -1,
                  textAlign: 'center',
                }}>
                  ACTIVE
                </Text>
                <Text style={{
                  fontSize: 14,
                  color: `${theme.primary || '#2196F3'}B3`,
                  marginTop: 4,
                  fontWeight: '400',
                  textAlign: 'center',
                }}>
                  Pro features unlocked
                </Text>
              </View>
            ) : (
              <>
                <Text style={{
                  fontSize: 48,
                  fontWeight: '200',
                  color: '#FFFFFF',
                  letterSpacing: -2,
                }}>
                  {getCurrentPrice()}
                </Text>
                <Text style={{
                  fontSize: 16,
                  color: 'rgba(255,255,255,0.4)',
                  marginLeft: 6,
                  fontWeight: '400',
                }}>
                  {spotsExhausted ? (billing === 'lifetime' ? 'once' : billing === 'annual' ? '/year' : '/mo') : 'once'}
                </Text>
              </>
            )}
          </View>


          {/* Visual separator */}
          <View style={{
            height: 1,
            backgroundColor: 'rgba(255,255,255,0.1)',
            marginHorizontal: 40,
            marginBottom: 20,
          }} />

          {/* Key Features - Inline */}
          <View style={{
            alignItems: 'center',
            marginBottom: 24,
            position: 'relative',
            width: '100%',
            paddingHorizontal: 20,
          }}>
            {isLifetimeMember ? (
              /* Lifetime member: Special founder features */
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 14,
                  color: '#FFD700',
                  fontWeight: '600',
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                  ✓ All Pro Features Unlocked
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (onNavigateToAIPlans) {
                      onNavigateToAIPlans();
                    }
                  }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: 'rgba(255,215,0,0.1)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(255,215,0,0.3)',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: '#FFD700',
                    fontWeight: '500',
                    marginRight: 4,
                  }}>
                    Add AI Plans
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={12} 
                    color="#FFD700"
                  />
                </TouchableOpacity>
              </View>
            ) : isMonthlySubscriber ? (
              /* Monthly subscriber: Focus on AI add-ons */
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 14,
                  color: theme.primary || '#2196F3',
                  fontWeight: '600',
                  marginBottom: 8,
                  textAlign: 'center',
                }}>
                  ✓ All Pro Features Active
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    if (onNavigateToAIPlans) {
                      onNavigateToAIPlans();
                    }
                  }}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: `${theme.primary || '#2196F3'}1A`,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: `${theme.primary || '#2196F3'}4D`,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: theme.primary || '#2196F3',
                    fontWeight: '500',
                    marginRight: 4,
                  }}>
                    Add AI Plans
                  </Text>
                  <Ionicons 
                    name="arrow-forward" 
                    size={12} 
                    color={theme.primary || '#2196F3'}
                  />
                </TouchableOpacity>
              </View>
            ) : spotsExhausted ? (
              /* Sold out: Only 2 pills centered - Fortune 500 tools and All features */
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <FeaturePill text="Fortune 500 tools" isSelected={isSelected} />
                <FeaturePill text="All features" isSelected={isSelected} />
              </View>
            ) : (
              /* Founder: 3 pills with AI benefit */
              <>
                {/* Center pill - perfectly centered */}
                <FeaturePill text="All features" isSelected={isSelected} />
                
                {/* Left pill */}
                <View style={{ position: 'absolute', left: -10, top: 0 }}>
                  <FeaturePill text="Fortune 500 tools" isSelected={isSelected} />
                </View>
                
                {/* Right pill - Clickable AI benefit */}
                <View style={{ position: 'absolute', right: -10, top: 0 }}>
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (onNavigateToAIPlans) {
                        onNavigateToAIPlans();
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <FeaturePill text="1 Month AI Light" isSelected={isSelected} clickable={true} />
                      <Ionicons 
                        name="arrow-forward" 
                        size={10} 
                        color="rgba(255,255,255,0.6)" 
                        style={{ marginLeft: -8 }}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* CTA Button */}
          <View
            style={{
              backgroundColor: isLifetimeMember ? '#FFD700' : isMonthlySubscriber ? (theme.primary || '#2196F3') : '#FFFFFF',
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 48,
              shadowColor: isLifetimeMember ? '#FFD700' : '#FFFFFF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              opacity: isLifetimeMember ? 0.9 : 1,
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: isLifetimeMember ? '#000000' : isMonthlySubscriber ? '#FFFFFF' : '#000000',
              letterSpacing: 0.5,
              textAlign: 'center',
            }}>
              {isLifetimeMember ? 'FOUNDER MEMBER' : isMonthlySubscriber ? 'SUBSCRIPTION ACTIVE' : 'GET PRO ACCESS'}
            </Text>
          </View>

          {/* Limited founders text inside selection area - Hide for lifetime members */}
          {!isMonthlyPlan && !isLifetimeMember && !isMonthlySubscriber && (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 25,
            }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                  paddingVertical: 4,
                  paddingHorizontal: 8,
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowFounderInfo(true);
                }}
                activeOpacity={0.7}
              >
                <FontAwesome5 
                  name="crown" 
                  size={11} 
                  color="#FFD700"
                  style={{ marginRight: 6 }}
                />
                <Text style={{
                  fontSize: 11,
                  color: isSelected ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)',
                  fontWeight: '600',
                  letterSpacing: 0.3,
                }}>
                  {(() => {
                    const tier = getCurrentTier();
                    const userNumber = 1001 - spotsRemaining;
                    if (tier.tier === 'early') {
                      return `You are user ${userNumber} • Early Bird pricing`;
                    } else if (tier.tier === 'mid') {
                      return `You are user ${userNumber} • Mid tier pricing`;
                    } else if (tier.tier === 'final') {
                      return `You are user ${userNumber} • Final tier pricing`;
                    }
                    return 'Limited to first 1,000 users';
                  })()}
                </Text>
                <Ionicons 
                  name="information-circle-outline" 
                  size={14} 
                  color="rgba(255,255,255,0.4)"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
              
              <Text style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.7)',
                fontWeight: '400',
                letterSpacing: 0.2,
              }}>
                Usually $3.49/month
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Money Back Guarantee - Clickable - Hide for lifetime members and monthly subscribers */}
        {!isLifetimeMember && !isMonthlySubscriber && (
          <TouchableOpacity 
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 4,
              paddingHorizontal: 20,
              paddingVertical: 8,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowGuaranteeInfo(true);
            }}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="checkmark-circle" 
              size={14} 
              color="#4CAF50"
              style={{ marginRight: 6 }}
            />
            <Text style={{
              fontSize: 12,
              color: '#4CAF50',
              textAlign: 'center',
              fontWeight: '600',
              textDecorationLine: 'underline',
              textDecorationColor: '#4CAF50',
            }}>
              100% Money Back Guarantee
            </Text>
            <Ionicons 
              name="information-circle-outline" 
              size={12} 
              color="#4CAF50"
              style={{ marginLeft: 4 }}
            />
          </TouchableOpacity>
        )}

        {/* Security message under the card - Hide for lifetime members and monthly subscribers */}
        {!isLifetimeMember && !isMonthlySubscriber && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 0,
          }}>
            <Text style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
            }}>
              One-time payment • 
            </Text>
            <Ionicons 
              name="shield-checkmark" 
              size={12} 
              color="rgba(255,255,255,0.6)"
              style={{ marginLeft: 4, marginRight: 2 }}
            />
            <Text style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
            }}>
              Secure App Store billing
            </Text>
          </View>
        )}
      </View>

      {/* Rain Animation Overlay */}
      {crowns.length > 0 && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1000,
        }}>
          {crowns.map((icon) => (
            <Animated.View
              key={icon.id}
              style={{
                position: 'absolute',
                left: icon.x,
                top: 0,
                transform: [
                  { translateY: icon.translateY },
                  { 
                    rotate: icon.rotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg']
                    })
                  }
                ],
                opacity: icon.opacity,
              }}
            >
              {isLifetimeMember ? (
                <FontAwesome5 
                  name="crown" 
                  size={28} 
                  color="#FFD700"
                />
              ) : (
                <Ionicons 
                  name="compass" 
                  size={28} 
                  color={theme.primary || '#2196F3'}
                />
              )}
            </Animated.View>
          ))}
        </View>
      )}

      {/* Founder Info Modal */}
      <Modal
        visible={showFounderInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFounderInfo(false)}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowFounderInfo(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={{
              backgroundColor: '#000000',
              borderRadius: 24,
              paddingVertical: 32,
              paddingHorizontal: 28,
              width: '90%',
              maxWidth: 340,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.2)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.8,
              shadowRadius: 40,
              elevation: 25,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with crown */}
            <View style={{
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <FontAwesome5 
                name="crown" 
                size={20} 
                color="#FFD700"
                style={{ marginBottom: 12 }}
              />
              <Text style={{
                fontSize: 18,
                fontWeight: '300',
                color: '#FFFFFF',
                letterSpacing: 1,
                textAlign: 'center',
              }}>
                LIMITED TIME & SPOTS
              </Text>
              
              <Text style={{
                fontSize: 12,
                color: '#FFD700',
                textAlign: 'center',
                marginTop: 8,
                fontWeight: '400',
              }}>
                You: #{(() => {
                  const userNumber = 1001 - spotsRemaining;
                  return userNumber;
                })()}
              </Text>
            </View>

            {/* Divider */}
            <View style={{
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
              marginBottom: 24,
            }} />

            {/* Content */}
            <View style={{ alignItems: 'center' }}>

              {/* Tier Cards */}
              <View style={{ width: '100%', marginBottom: 20 }}>
                {(() => {
                  const currentTier = getCurrentTier();
                  const userNumber = 1001 - spotsRemaining;
                  const isEarlySoldOut = userNumber > 100;
                  const isMidSoldOut = userNumber > 500;
                  
                  const tiers = [
                    {
                      id: 'early',
                      name: 'Early Bird',
                      icon: 'star',
                      users: 'Users 1-100',
                      price: '$0.99',
                      aiBenefit: currentTier.tier === 'early' ? '1 Month AI Light Included' : '',
                      aiColor: '#4CAF50',
                      value: '',
                      isSoldOut: isEarlySoldOut,
                      isActive: currentTier.tier === 'early'
                    },
                    {
                      id: 'mid',
                      name: 'Mid Tier',
                      icon: 'rocket',
                      users: 'Users 101-500',
                      price: '$2.99',
                      aiBenefit: currentTier.tier === 'mid' ? '1 Month AI Light Included' : '',
                      aiColor: '#4CAF50',
                      value: '',
                      isSoldOut: isMidSoldOut,
                      isActive: currentTier.tier === 'mid'
                    },
                    {
                      id: 'final',
                      name: 'Final Tier',
                      icon: 'bolt',
                      users: 'Users 501-1000',
                      price: '$4.99',
                      aiBenefit: currentTier.tier === 'final' ? '1 Month AI Light Included' : '',
                      aiColor: '#4CAF50',
                      value: '',
                      isSoldOut: false,
                      isActive: currentTier.tier === 'final'
                    },
                    {
                      id: 'monthly',
                      name: 'Regular Pricing',
                      icon: 'calendar',
                      users: 'Users 1000+',
                      price: '$42',
                      priceType: '/year',
                      aiBenefit: '',
                      aiColor: '#4CAF50',
                      value: '',
                      isSoldOut: false,
                      isActive: false,
                      isMonthly: true,
                      isWarning: true
                    }
                  ];

                  return tiers.map((tier, index) => (
                    <View
                      key={tier.id}
                      style={{
                        backgroundColor: tier.isActive ? 'rgba(255,215,0,0.08)' : (tier.isWarning ? 'rgba(255,107,107,0.08)' : 'rgba(255,255,255,0.03)'),
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: tier.isActive ? 'rgba(255,215,0,0.3)' : (tier.isWarning ? 'rgba(255,107,107,0.4)' : 'rgba(255,255,255,0.2)'),
                        opacity: tier.isSoldOut ? 0.5 : 1,
                      }}
                    >
                      <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                      }}>
                        <View style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                          <FontAwesome5 
                            name={tier.icon} 
                            size={14} 
                            color={tier.isSoldOut ? 'rgba(255,255,255,0.3)' : (tier.isActive ? '#FFD700' : (tier.isWarning ? '#FF6B6B' : 'rgba(255,255,255,0.6)'))}
                            style={{ marginRight: 8 }}
                          />
                          <Text style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: tier.isSoldOut ? 'rgba(255,255,255,0.4)' : '#FFFFFF',
                            textDecorationLine: tier.isSoldOut ? 'line-through' : 'none',
                          }}>
                            {tier.name} {tier.isSoldOut && '(SOLD OUT)'}
                          </Text>
                        </View>
                        <View style={{
                          backgroundColor: '#000000',
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: 'rgba(255,255,255,0.1)',
                        }}>
                          <Text style={{
                            fontSize: tier.isWarning ? 16 : 12,
                            fontWeight: '600',
                            color: tier.isWarning ? '#FF6B6B' : '#FFFFFF',
                          }}>
                            {tier.price}<Text style={{ fontSize: tier.isWarning ? 11 : 9 }}>{tier.isMonthly ? '/year' : '/OTP*'}</Text>
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={{
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.6)',
                        marginBottom: 8,
                      }}>
                        {tier.users}
                      </Text>
                      
                      <Text style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: tier.isSoldOut ? 'rgba(255,255,255,0.4)' : (tier.isActive ? '#FFD700' : 'rgba(255,255,255,0.8)'),
                        marginBottom: 4,
                      }}>
                        {tier.aiBenefit}
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.5)',
                        fontStyle: 'italic',
                      }}>
                        {tier.value}
                      </Text>
                    </View>
                  ));
                })()}
              </View>


              {/* Expiration info */}
              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                fontWeight: '400',
                marginBottom: 8,
              }}>
                Offer expires August 15th AEDT or when spots fill
              </Text>
              
              {/* OTP Footnote */}
              <Text style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                textAlign: 'center',
                fontWeight: '400',
                marginBottom: 24,
              }}>
                *OTP - One Time Payment
              </Text>

              {/* Close button */}
              <TouchableOpacity
                onPress={() => setShowFounderInfo(false)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)',
                }}
              >
                <Text style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: '500',
                  letterSpacing: 0.5,
                }}>
                  GOT IT
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Guarantee Info Modal */}
      <Modal
        visible={showGuaranteeInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGuaranteeInfo(false)}
      >
        <TouchableOpacity 
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          activeOpacity={1}
          onPress={() => setShowGuaranteeInfo(false)}
        >
          <TouchableOpacity 
            activeOpacity={1}
            style={{
              backgroundColor: '#000000',
              borderRadius: 24,
              paddingVertical: 32,
              paddingHorizontal: 28,
              width: '90%',
              maxWidth: 340,
              borderWidth: 1,
              borderColor: 'rgba(75, 181, 67, 0.3)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.8,
              shadowRadius: 40,
              elevation: 25,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header with checkmark */}
            <View style={{
              alignItems: 'center',
              marginBottom: 24,
            }}>
              <Ionicons 
                name="checkmark-circle" 
                size={24} 
                color="#4CAF50"
                style={{ marginBottom: 12 }}
              />
              <Text style={{
                fontSize: 18,
                fontWeight: '300',
                color: '#FFFFFF',
                letterSpacing: 1,
                textAlign: 'center',
              }}>
                100% MONEY BACK GUARANTEE
              </Text>
            </View>

            {/* Divider */}
            <View style={{
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
              marginBottom: 24,
            }} />

            {/* Content */}
            {guaranteeDetailsView === 'main' ? (
              // Main View - Clean and Simple
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 20,
                  textAlign: 'center',
                  marginBottom: 24,
                  fontWeight: '400',
                }}>
                  Not 100% satisfied with your Pro Access purchase?
                </Text>

                {/* Benefits List */}
                <View style={{
                  backgroundColor: 'rgba(75, 181, 67, 0.05)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'rgba(75, 181, 67, 0.1)',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      Get all your money back
                    </Text>
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      Keep lifetime access anyway
                    </Text>
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      Quick & fair process
                    </Text>
                  </View>

                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color="#4CAF50"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.8)',
                      fontWeight: '500',
                      flex: 1,
                    }}>
                      No time limit on refunds
                    </Text>
                  </View>
                </View>

                {/* Button Row */}
                <View style={{
                  flexDirection: 'row',
                  width: '100%',
                  gap: 12,
                }}>
                  <TouchableOpacity
                    onPress={() => setGuaranteeDetailsView('details')}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: '500',
                      letterSpacing: 0.5,
                      textAlign: 'center',
                    }}>
                      DETAILS
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setShowGuaranteeInfo(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 20,
                      backgroundColor: 'rgba(75, 181, 67, 0.1)',
                      borderWidth: 1,
                      borderColor: 'rgba(75, 181, 67, 0.3)',
                    }}
                  >
                    <Text style={{
                      fontSize: 12,
                      color: '#4CAF50',
                      fontWeight: '500',
                      letterSpacing: 0.5,
                      textAlign: 'center',
                    }}>
                      GOT IT
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Details View - Requirements
              <View style={{ alignItems: 'center' }}>
                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  lineHeight: 20,
                  textAlign: 'center',
                  marginBottom: 24,
                  fontWeight: '400',
                }}>
                  How to Request a Refund
                </Text>

                <Text style={{
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.7)',
                  lineHeight: 18,
                  textAlign: 'center',
                  fontWeight: '400',
                  marginBottom: 20,
                }}>
                  Send us{' '}
                  <Text 
                    style={{
                      color: '#4CAF50',
                      textDecorationLine: 'underline',
                      textDecorationColor: '#4CAF50',
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowGuaranteeInfo(false);
                      navigation.navigate('FeedbackScreen', { feedbackType: 'refund' });
                    }}
                  >
                    feedback
                  </Text>
                  {' '}through the app including:
                </Text>

                {/* Requirements List */}
                <View style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  width: '100%',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                }}>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      marginRight: 8,
                      marginTop: 2,
                    }}>
                      •
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 16,
                      flex: 1,
                    }}>
                      Why Pro Access didn't meet your expectations
                    </Text>
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    marginBottom: 12,
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      marginRight: 8,
                      marginTop: 2,
                    }}>
                      •
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 16,
                      flex: 1,
                    }}>
                      What you were hoping to achieve
                    </Text>
                  </View>
                  
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                  }}>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.5)',
                      marginRight: 8,
                      marginTop: 2,
                    }}>
                      •
                    </Text>
                    <Text style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.8)',
                      lineHeight: 16,
                      flex: 1,
                    }}>
                      What you would like to see changed
                    </Text>
                  </View>
                </View>
                
                <Text style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.5)',
                  textAlign: 'center',
                  fontWeight: '400',
                  lineHeight: 14,
                  marginBottom: 24,
                }}>
                  Your{' '}
                  <Text 
                    style={{
                      color: '#4CAF50',
                      textDecorationLine: 'underline',
                      textDecorationColor: '#4CAF50',
                    }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowGuaranteeInfo(false);
                      navigation.navigate('FeedbackScreen', { feedbackType: 'refund' });
                    }}
                  >
                    feedback
                  </Text>
                  {' '}helps us improve • Refunds processed within 24 hours
                </Text>

                {/* Back button only */}
                <TouchableOpacity
                  onPress={() => setGuaranteeDetailsView('main')}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 24,
                    borderRadius: 20,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                    fontWeight: '500',
                    letterSpacing: 0.5,
                    textAlign: 'center',
                  }}>
                    BACK
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// Time unit component
const TimeUnit = ({ value, label, isSeconds }) => (
  <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
    <Text style={{
      fontSize: 32,
      fontWeight: '300',
      color: isSeconds ? '#FF6B6B' : '#FFFFFF',
      fontVariant: ['tabular-nums'],
      letterSpacing: -1,
    }}>
      {value < 10 ? `0${value}` : value}
    </Text>
    <Text style={{
      fontSize: 10,
      color: 'rgba(255,255,255,0.6)',
      marginTop: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      fontWeight: '600',
      textAlign: 'center',
      marginLeft: label === 'hrs' ? 2 : 0,
    }}>
      {label}
    </Text>
  </View>
);

// Timer separator
const TimeSeparator = () => (
  <Text style={{
    fontSize: 24,
    fontWeight: '200',
    color: 'rgba(255,255,255,0.2)',
    marginHorizontal: 2,
    marginBottom: 14,
  }}>:</Text>
);

// Feature pill
const FeaturePill = ({ text, isSelected, clickable = false }) => (
  <View style={{
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginHorizontal: 12,
  }}>
    <Text style={{
      fontSize: 12,
      color: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
      fontWeight: '500',
      textDecorationLine: clickable ? 'underline' : 'none',
      textDecorationColor: clickable ? 'rgba(255,255,255,0.6)' : 'transparent',
    }}>
      {text}
    </Text>
  </View>
);

export default memo(UnifiedBlackPlan);
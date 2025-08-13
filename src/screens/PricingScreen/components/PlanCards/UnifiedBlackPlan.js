// src/screens/PricingScreen/components/PlanCards/UnifiedBlackPlan.js
import React, { useState, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';

const UnifiedBlackPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  handlePurchase,
  isLifetimeMember,
  spotsRemaining = 1000,
  responsive = {},
  initialTime,
  onNavigateToAIPlans
}) => {
  const isSelected = selectedPlan === 'founding';
  const { isTablet } = responsive;
  const navigation = useNavigation();
  
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
  
  // Calculate current price based on spots remaining (single $3.49 price with different AI benefits)
  const getCurrentPrice = () => {
    if (spotsExhausted) return '$3.49'; // Basic tier pricing when sold out
    
    return '$3.49'; // Same price for all founder spots
  };
  
  // Get current tier info for AI benefits messaging
  const getCurrentTier = () => {
    if (spotsExhausted) return { tier: 'monthly', nextTier: null };
    
    if (spotsRemaining > 900) return { tier: 'early', nextTier: 'AI Plus', nextAt: 900 };
    if (spotsRemaining > 500) return { tier: 'mid', nextTier: 'AI Light', nextAt: 500 };
    return { tier: 'final', nextTier: 'Monthly subscription', nextAt: 0 };
  };

  // Get AI benefit for current tier
  const getAIBenefit = () => {
    if (spotsExhausted) return 'AI subscription separate';
    
    if (spotsRemaining > 900) return 'Free AI Max forever'; // First 100 spots
    if (spotsRemaining > 500) return 'Free AI Plus forever'; // Next 400 spots
    return 'Free AI Light forever'; // Last 500 spots
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
                    } else if (spotsSold <= 500) {
                      // 50 increments up to 500
                      const increment = Math.floor(spotsSold / 50) * 50;
                      return increment > 0 ? `${increment}+ SOLD` : '';
                    } else {
                      // 100 increments after 500
                      const increment = 500 + Math.floor((spotsSold - 500) / 100) * 100;
                      return `${increment}+ SOLD`;
                    }
                  })()}
                </Text>
              </View>
            );
          }
          return null;
        })()}

        {/* Timer Section at Top - Only show when not sold out */}
        {!isMonthlyPlan && (
          <View style={{
            paddingTop: 12,
            paddingBottom: 16,
            paddingHorizontal: 24,
            marginTop: (() => {
              const spotsSold = 1000 - spotsRemaining;
              return spotsSold > 0 ? -8 : -48; // Adjust spacing based on social proof
            })(),
          }}>
          
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
          }}>
            <TimeUnit value={countdownTime.days} label="days" />
            <TimeSeparator />
            <TimeUnit value={countdownTime.hours} label="hrs" />
            <TimeSeparator />
            <TimeUnit value={countdownTime.minutes} label="min" />
            <TimeSeparator />
            <TimeUnit value={countdownTime.seconds} label="sec" isSeconds />
          </View>
        </View>
        )}

        {/* Pricing Section */}
        <TouchableOpacity
          style={{
            paddingTop: isMonthlyPlan ? 48 : 32,
            paddingHorizontal: 32,
            paddingBottom: 50,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
            borderRadius: 18,
            margin: 2,
            marginTop: isMonthlyPlan ? 24 : 48,
            height: 380,
            position: 'relative',
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleSelectPlan('founding');
          }}
          activeOpacity={0.7}
          disabled={isLifetimeMember}
        >
          {/* Tier-based urgency badge - Top right corner - Hide when sold out */}
          {spotsRemaining > 0 && (() => {
            const tier = getCurrentTier();
            let badgeColor = '#FF6B6B'; // Red for urgency
            let badgeText = '';
            
            let badgeIcon = '';
            
            if (tier.tier === 'early') {
              badgeIcon = 'star';
              // AI Max Tier: First 100 spots
              if (spotsRemaining > 950) {
                badgeText = 'AI MAX - 100 SPOTS';
              } else {
                // Real-time counting from 50 and below
                badgeText = `AI MAX - ${spotsRemaining - 900} LEFT`;
              }
            } else if (tier.tier === 'mid') {
              badgeIcon = 'rocket';
              // AI Plus Tier: Spots 101-500
              const midTierSpotsUsed = 100 - (spotsRemaining - 500); // How many of the 400 mid-tier spots are used
              const midTierSpotsLeft = 400 - midTierSpotsUsed;
              
              if (spotsRemaining > 600) {
                badgeText = 'AI PLUS - 400 SPOTS';
              } else if (spotsRemaining > 700) {
                badgeText = 'AI PLUS - 300 LEFT';
              } else if (spotsRemaining > 800) {
                badgeText = 'AI PLUS - 200 LEFT';
              } else if (spotsRemaining > 500) {
                // Real-time counting when ≤100 spots left in mid tier
                badgeText = `AI PLUS - ${spotsRemaining - 500} LEFT`;
              }
            } else if (tier.tier === 'final') {
              badgeIcon = 'flashlight';
              // AI Light Tier: Spots 501-1000
              if (spotsRemaining > 400) {
                badgeText = 'AI LIGHT - 500 LEFT';
              } else if (spotsRemaining > 300) {
                badgeText = 'AI LIGHT - 400 LEFT';
              } else if (spotsRemaining > 200) {
                badgeText = 'AI LIGHT - 300 LEFT';
              } else {
                // Real-time counting for final 200
                badgeText = `AI LIGHT - ${spotsRemaining} LEFT`;
              }
            }
            
            // Don't show badge if no text
            if (!badgeText) return null;
            
            return (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                  backgroundColor: badgeColor,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  zIndex: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowFounderInfo(true);
                }}
                activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{
                  fontSize: 9,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  letterSpacing: 0.3,
                }}>
                  {badgeText}
                </Text>
                <FontAwesome5 
                  name={badgeIcon} 
                  size={8} 
                  color="#FFFFFF" 
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            );
          })()}

          {/* Title */}
          <View style={{
            alignItems: 'center',
            marginBottom: isMonthlyPlan ? 16 : 8,
            position: 'relative',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#FFFFFF',
              letterSpacing: 0.5,
            }}>
              PRO ACCESS
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
          </View>
          
          {/* Subtitle */}
          <Text style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: isMonthlyPlan ? 32 : 24,
          }}>
            {isMonthlyPlan ? 'Monthly subscription' : 'Plan your life like a CEO • One-time payment'}
          </Text>

          {/* Price */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'center',
            marginBottom: isMonthlyPlan ? 24 : 16,
            paddingTop: isMonthlyPlan ? 16 : 8,
          }}>
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
              {isMonthlyPlan ? '/mo' : 'once'}
            </Text>
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
            {/* Center pill - perfectly centered */}
            <FeaturePill text="Fortune 500 tools" isSelected={isSelected} />
            
            {/* Left pill */}
            <View style={{ position: 'absolute', left: -10, top: 0 }}>
              <FeaturePill text="All features" isSelected={isSelected} />
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
                <FeaturePill text={(() => {
                  if (spotsExhausted) return 'AI subscription';
                  if (spotsRemaining > 900) return '1 Month AI Max';
                  if (spotsRemaining > 500) return '1 Month AI Plus';
                  return '1 Month AI Light';
                })()} isSelected={isSelected} clickable={true} />
              </TouchableOpacity>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 14,
              paddingVertical: 16,
              paddingHorizontal: 48,
              shadowColor: '#FFFFFF',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
            }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (handlePurchase) {
                handlePurchase('founding');
              } else {
                handleSelectPlan('founding');
              }
            }}
            disabled={isLifetimeMember}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#000000',
              letterSpacing: 0.5,
            }}>
              {isLifetimeMember ? 'YOU HAVE PRO' : 'GET PRO ACCESS'}
            </Text>
          </TouchableOpacity>

          {/* Limited founders text inside selection area */}
          {!isMonthlyPlan && (
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 25,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}>
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
                    if (tier.tier === 'early') {
                      return 'Limited to first 100 users';
                    } else if (tier.tier === 'mid') {
                      return 'Limited to first 500 users';
                    } else if (tier.tier === 'final') {
                      return 'Limited to first 1,000 users';
                    }
                    return 'Limited to first 1,000 users';
                  })()}
                </Text>
                <TouchableOpacity
                  style={{ marginLeft: 6 }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowFounderInfo(true);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name="information-circle-outline" 
                    size={14} 
                    color="rgba(255,255,255,0.4)"
                  />
                </TouchableOpacity>
              </View>
              
              <Text style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                fontWeight: '400',
                letterSpacing: 0.2,
              }}>
                Usually $3.49/month
              </Text>
            </View>
          )}
        </TouchableOpacity>
        
        {/* Money Back Guarantee - Clickable */}
        <TouchableOpacity 
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 16,
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

        {/* Security message under the card */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 12,
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
      </View>

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
            </View>

            {/* Divider */}
            <View style={{
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.08)',
              marginBottom: 24,
            }} />

            {/* Content */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 14,
                color: 'rgba(255,255,255,0.8)',
                lineHeight: 20,
                textAlign: 'center',
                marginBottom: 24,
                fontWeight: '400',
              }}>
                Same $3.49 price • Lifetime Pro access{'\n'}1 month AI included
              </Text>

              {/* Tier Cards */}
              <View style={{ width: '100%', marginBottom: 20 }}>
                {(() => {
                  const currentTier = getCurrentTier();
                  const isEarlySoldOut = spotsRemaining <= 900;
                  const isMidSoldOut = spotsRemaining <= 500;
                  
                  const tiers = [
                    {
                      id: 'early',
                      name: 'Early Bird',
                      icon: 'star',
                      users: 'Users 1-100',
                      aiBenefit: '1 Month AI Max Included',
                      aiColor: '#FFD700',
                      value: '$9.99/month value',
                      isSoldOut: isEarlySoldOut,
                      isActive: currentTier.tier === 'early'
                    },
                    {
                      id: 'mid',
                      name: 'Mid Tier',
                      icon: 'rocket',
                      users: 'Users 101-500',
                      aiBenefit: '1 Month AI Plus Included',
                      aiColor: '#4CAF50',
                      value: '$4.99/month value',
                      isSoldOut: isMidSoldOut,
                      isActive: currentTier.tier === 'mid'
                    },
                    {
                      id: 'final',
                      name: 'Final Tier',
                      icon: 'bolt',
                      users: 'Users 501-1000',
                      aiBenefit: '1 Month AI Light Included',
                      aiColor: '#2196F3',
                      value: '$2.99/month value',
                      isSoldOut: false,
                      isActive: currentTier.tier === 'final'
                    }
                  ];

                  return tiers.map((tier, index) => (
                    <View
                      key={tier.id}
                      style={{
                        backgroundColor: tier.isActive ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.03)',
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 12,
                        borderWidth: tier.isActive ? 1 : 0,
                        borderColor: tier.isActive ? 'rgba(255,215,0,0.3)' : 'transparent',
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
                            color={tier.isSoldOut ? 'rgba(255,255,255,0.3)' : tier.aiColor}
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
                            fontSize: 12,
                            fontWeight: '600',
                            color: '#FFFFFF',
                          }}>
                            $3.49<Text style={{ fontSize: 9 }}>/OTP*</Text>
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
                        color: tier.isSoldOut ? 'rgba(255,255,255,0.4)' : tier.aiColor,
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

              {/* After 1000 note */}
              <View style={{
                backgroundColor: 'rgba(255,255,255,0.02)',
                borderRadius: 8,
                padding: 12,
                width: '100%',
                marginBottom: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.05)',
              }}>
                <Text style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'center',
                  fontWeight: '500',
                }}>
                  After 1000 founders: $3.49/month subscription
                </Text>
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
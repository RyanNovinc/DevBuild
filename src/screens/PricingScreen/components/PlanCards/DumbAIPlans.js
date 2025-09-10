// STUPIDEST POSSIBLE SOLUTION - 4 separate cards, no scrolling bullshit
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Modal, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const DumbAIPlans = ({ selectedPlan, handleSelectPlan, billing, setBilling, highlightPlan, pulseCredits }) => {
  const subscription = billing || 'monthly';
  const setSubscription = setBilling || (() => {});

  // AI Tier definitions (same as AIUpsellModal)
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
        'Standard personal knowledge',
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
        'More personal knowledge',
        '3x more daily usage',
        'For daily users'
      ]
    },
    guide: {
      name: 'AI Max',
      shortName: 'Max',
      description: 'Maximum AI capabilities',
      monthlyPrice: 19.99,
      annualPrice: 199.99,
      icon: 'shield-checkmark-outline',
      gradient: ['#0891B2', '#0D9488'],
      features: [
        'Maximum personal knowledge',
        '10x more daily usage',
        'For power users'
      ]
    }
  };

  // ScrollView ref for resetting position
  const scrollViewRef = useRef(null);
  
  // Track which card is currently centered
  const [currentScrollIndex, setCurrentScrollIndex] = useState(1); // Default to AI Plus (middle)
  
  // Handle scroll events to track centered card
  const handleScroll = (event) => {
    const cardWidth = width * 0.7 + 12;
    const scrollX = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollX / cardWidth);
    setCurrentScrollIndex(index);
  };

  // Animation for highlighting using Animated.sequence like achievement screen
  const highlightAnim = useRef(new Animated.Value(0)).current;
  
  // Animation for pulsating credits text
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Removed complex modal system - no longer needed
  
  useEffect(() => {
    if (highlightPlan) {
      // Position scroll to show the highlighted card
      if (scrollViewRef.current) {
        let scrollX = 0;
        // Calculate scroll position based on highlighted plan
        // Cards are: compass (left), navigator (middle), guide (right)
        if (highlightPlan === 'compass') {
          scrollX = 0; // AI Light - leftmost position
        } else if (highlightPlan === 'navigator') {
          scrollX = 320; // AI Plus - middle position (card width + margin)
        } else if (highlightPlan === 'guide') {
          scrollX = 640; // AI Max - rightmost position (2 * card width + margins)
        }
        
        scrollViewRef.current.scrollTo({ x: scrollX, animated: true });
      }
      
      // Wait for scroll to complete before starting animations
      setTimeout(() => {
        // Start highlight animation - 3 cycles ending with smooth fade to dim
        Animated.sequence([
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(highlightAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
          easing: Easing.out(Easing.cubic),
        })
      ]).start();
      }, 400); // Wait 400ms for scroll to complete
    }
  }, [highlightPlan]);

  // Pulse animation for credits text - same as border highlight
  useEffect(() => {
    if (pulseCredits) {
      // Wait for scroll to complete before starting pulse animation
      setTimeout(() => {
        // Start pulsating color animation - 3 cycles ending bright
        Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1, // End at bright state instead of dim
          duration: 600,
          useNativeDriver: false,
        })
      ]).start();
      }, 400); // Wait 400ms for scroll to complete
    }
  }, [pulseCredits]);

  // Helper function to add commas to numbers
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const CardTemplate = ({ id, name, icon, description, features, color, popular, monthlyPrice, annualPrice, monthlyCredits, annualCreditsPerDollar }) => {
    const isSelected = selectedPlan === id;
    const isCredits = id === 'credits';
    const price = isCredits ? '$0.99' : (subscription === 'annual' ? annualPrice : monthlyPrice);
    const period = isCredits ? 'one-time' : (subscription === 'annual' ? '/year' : '/month');
    
    // Determine haptic feedback intensity based on plan
    const getHapticFeedback = () => {
      switch(id) {
        case 'compass': return Haptics.ImpactFeedbackStyle.Light;
        case 'navigator': return Haptics.ImpactFeedbackStyle.Medium;
        case 'guide': return Haptics.ImpactFeedbackStyle.Heavy;
        default: return Haptics.ImpactFeedbackStyle.Light;
      }
    };
    
    // Get the correct credits per dollar based on billing type
    const creditsPerDollar = !isCredits && subscription === 'annual' ? annualCreditsPerDollar : null;
    
    // Calculate credits display based on billing type
    const creditsDisplay = !isCredits && monthlyCredits ? 
      (subscription === 'annual' ? `${formatNumber(monthlyCredits * 12)} credits/year` : `${formatNumber(monthlyCredits)} credits/mo`) : 
      null;
    
    // No longer needed - we show simple daily limits instead

    const shouldHighlight = highlightPlan === id;
    
    // Interpolate highlight animation like achievement screen
    const highlightBorderColor = highlightAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        'rgba(255,255,255,0.15)',
        'rgba(255,255,255,0.8)'
      ]
    });
    
    // Determine border color
    let borderColor;
    if (shouldHighlight) {
      borderColor = highlightBorderColor;
    } else if (isSelected) {
      borderColor = 'rgba(255,255,255,0.4)';
    } else {
      borderColor = 'rgba(255,255,255,0.15)';
    }
    
    return (
      <Animated.View
        style={{
          backgroundColor: '#000000',
          borderRadius: 18,
          padding: 32,
          marginRight: 20,
          width: 300,
          height: 380,
          borderWidth: 2,
          borderColor: borderColor,
          position: 'relative',
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            Haptics.impactAsync(getHapticFeedback());
            handleSelectPlan(id);
          }}
          activeOpacity={0.7}
          pointerEvents="auto"
      >
        {popular && (
          <View style={{
            position: 'absolute',
            top: 0,
            right: 20,
            backgroundColor: '#FFD700',
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
          }}>
            <Text style={{
              fontSize: 10,
              fontWeight: '700',
              color: '#000000',
              letterSpacing: 0.5,
            }}>
              MOST POPULAR
            </Text>
          </View>
        )}


        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.05)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <Ionicons 
            name={icon} 
            size={22} 
            color={isCredits ? color : '#FFFFFF'}
          />
        </View>

        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#FFFFFF',
          marginBottom: 4,
        }}>
          {name}
        </Text>

        <Text style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 16,
        }}>
          {description}
        </Text>

        {/* Usage Level Indicator */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: 12,
          padding: 12,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
        }}>
          <Text style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            marginBottom: 4,
          }}>
            Usage Level
          </Text>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#FFFFFF',
          }}>
            {id === 'compass' ? 'Light Usage' : id === 'navigator' ? 'Daily Usage' : 'Power Usage'}
          </Text>
        </View>

        <View style={{ marginBottom: 40 }}>
          {features.map((feature, index) => (
            <View 
              key={index} 
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Ionicons 
                name="checkmark" 
                size={14} 
                color="rgba(255,255,255,0.6)"
                style={{ marginRight: 8 }}
              />
              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
              }}>
                {feature}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
          }}
          onPress={() => {
            Haptics.impactAsync(getHapticFeedback());
            handleSelectPlan(id);
          }}
          pointerEvents="auto"
        >
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
          }}>
            {isSelected ? 'Selected' : 'Select'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 24, width: '100%', flex: 1 }}>
      
      {/* Header section to match Pro Access countdown timer height */}
      <View style={{
        paddingTop: 12,
        paddingBottom: 24,
        paddingHorizontal: 24,
        marginTop: -48,
        height: 82,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '300',
          color: '#FFFFFF',
          letterSpacing: 1,
          textAlign: 'center',
        }}>
          AI PLANS
        </Text>
      </View>
      
      {/* Spacer to push cards down a bit */}
      <View style={{ height: 20 }} />

      {/* SWIPE TO EXPLORE hint */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        paddingHorizontal: 24,
      }}>
        <Text style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.3)',
          fontWeight: '500',
          letterSpacing: 0.5,
        }}>
          SWIPE TO EXPLORE
        </Text>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.3)" />
      </View>
      
      {/* GRADIENT CARDS - PREMIUM DESIGN */}
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
          const isSelected = selectedPlan === tierId;
          const isCentered = index === currentScrollIndex;
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
                handleSelectPlan(tierId);
              }}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={isCentered ? tier.gradient : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 24,
                  padding: 24,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isCentered ? tier.gradient[0] : 'rgba(255,255,255,0.3)',
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
                  backgroundColor: isCentered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Ionicons 
                    name={tier.icon} 
                    size={28} 
                    color={isCentered ? '#FFFFFF' : 'rgba(255,255,255,0.8)'} 
                  />
                </View>

                {/* Title */}
                <Text style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#FFFFFF',
                  marginBottom: 8,
                }}>
                  {tier.name}
                </Text>

                {/* Description */}
                <Text style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.7)',
                  marginBottom: 20,
                  lineHeight: 20,
                }}>
                  {tier.description}
                </Text>

                {/* Price */}
                <View style={{
                  marginBottom: 20,
                }}>
                  <Text style={{
                    fontSize: 32,
                    fontWeight: '300',
                    color: '#FFFFFF',
                    letterSpacing: -1,
                  }}>
                    ${tier.monthlyPrice}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.6)',
                    marginTop: 4,
                  }}>
                    per month
                  </Text>
                </View>

                {/* Features */}
                <View style={{ flex: 1 }}>
                  {tier.features.map((feature, featureIndex) => (
                    <View key={featureIndex} style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={isCentered ? '#FFFFFF' : 'rgba(255,255,255,0.8)'} 
                        style={{ marginRight: 8 }}
                      />
                      <Text style={{
                        fontSize: 14,
                        color: isCentered ? '#FFFFFF' : 'rgba(255,255,255,0.8)',
                        flex: 1,
                      }}>
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Select Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                    marginTop: 'auto',
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? 'rgba(255,255,255,0.3)' : 'transparent',
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    handleSelectPlan(tierId);
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: '#FFFFFF',
                  }}>
                    {isSelected ? 'Selected' : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom spacing and info section */}
      <View style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 60,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 8,
        }}>
          <Text style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
          }}>
            Monthly subscription • 
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
        
        <Text style={{
          fontSize: 10,
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          fontStyle: 'italic',
          lineHeight: 14,
        }}>
          *Personal knowledge uploads include documents like resumes, personality tests, and other files that help AI provide more personalized planning assistance.
        </Text>
      </View>


      {/* Modal removed - no longer needed */}
    </View>
  );
};

// Prevent re-render only when props haven't changed (this allows selection highlighting)
export default React.memo(DumbAIPlans);
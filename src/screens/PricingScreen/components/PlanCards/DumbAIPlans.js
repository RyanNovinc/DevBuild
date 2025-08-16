// STUPIDEST POSSIBLE SOLUTION - 4 separate cards, no scrolling bullshit
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Modal, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const DumbAIPlans = ({ selectedPlan, handleSelectPlan, billing, setBilling, highlightPlan, pulseCredits }) => {
  const subscription = billing || 'monthly';
  const setSubscription = setBilling || (() => {});

  // ScrollView ref for resetting position
  const scrollViewRef = useRef(null);

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

        <View style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          marginBottom: 20,
        }}>
          {id === highlightPlan && pulseCredits ? (
            <Animated.Text style={{
              fontSize: 28,
              fontWeight: '300',
              color: pulseAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(255,255,255,0.6)', 'rgba(255,255,255,1)']
              })
            }}>
              {price}
            </Animated.Text>
          ) : (
            <Text style={{
              fontSize: 28,
              fontWeight: '300',
              color: '#FFFFFF',
            }}>
              {price}
            </Text>
          )}
          {period !== 'one-time' && (
            <Text style={{
              fontSize: 14,
              color: 'rgba(255,255,255,0.4)',
              marginLeft: 4,
            }}>
              {period}
            </Text>
          )}
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
    <View style={{ paddingHorizontal: 0, paddingVertical: 0, marginTop: 24, width: '100%' }}>
      
      {/* Header section to match Pro Access countdown timer height */}
      <View style={{
        paddingTop: 12,
        paddingBottom: 16,
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
      
      {/* Billing Toggle */}
      <View style={{
        backgroundColor: '#000000',
        borderRadius: 12,
        padding: 4,
        flexDirection: 'row',
        marginBottom: 20,
        alignSelf: 'center',
        width: '85%',
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: subscription === 'monthly' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
          onPress={() => setSubscription('monthly')}
        >
          <Text style={{
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '600',
            color: subscription === 'monthly' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
          }}>
            Monthly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: subscription === 'annual' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
          onPress={() => setSubscription('annual')}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: subscription === 'annual' ? '#FFFFFF' : 'rgba(255,255,255,0.5)',
            }}>
              Annual
            </Text>
            <Text style={{
              fontSize: 11,
              color: subscription === 'annual' ? '#FFD700' : 'transparent',
              marginTop: 2,
              height: 14, // Reserve consistent height
              fontWeight: '600',
            }}>
              2 months free
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 4 SEPARATE CARDS - BASIC SCROLLVIEW */}
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        style={{ marginHorizontal: -16, marginTop: 8 }}
      >
        
        <View style={{ flexDirection: 'row', paddingLeft: 16 }}>
        
        <CardTemplate 
          id="compass"
          name="AI Light"
          icon="compass-outline"
          description="Perfect for casual planning"
          features={[
            'Standard user context*',
            'For occasional users'
          ]}
          popular={false}
          monthlyPrice="$2.99"
          annualPrice="$29.99"
          monthlyCredits={500}
          annualCreditsPerDollar={200}
        />
        
        <CardTemplate 
          id="navigator"
          name="AI Plus"
          icon="navigate-circle-outline"
          description="Built for everyday productivity"
          features={[
            'Additional user context*',
            'More daily usage (3x AI Light)',
            'For daily users'
          ]}
          popular={true}
          monthlyPrice="$4.99"
          annualPrice="$49.99"
          monthlyCredits={1500}
          annualCreditsPerDollar={360}
        />
        
        <CardTemplate 
          id="guide"
          name="AI Max"
          icon="shield-checkmark-outline"
          description="Get the most out of LifeCompass AI"
          features={[
            'Maximum user context*',
            'Heavy usage capacity (10x AI Light)',
            'For power users'
          ]}
          popular={false}
          monthlyPrice="$9.99"
          annualPrice="$99.99"
          monthlyCredits={5000}
          annualCreditsPerDollar={600}
        />
        </View>
      </ScrollView>

      <View style={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        paddingHorizontal: 20,
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
          *Context refers to how much AI knows about your goals, milestones, tasks and any documents you upload (resumes, personality tests) to help with your planning.
        </Text>
      </View>

      {/* Try with credits hint - only show when no AI plan selected OR credits selected */}
      {(!selectedPlan || selectedPlan === 'credits') && (
        <TouchableOpacity
          style={{
            marginTop: 20,
            marginHorizontal: 20,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: selectedPlan === 'credits' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            borderWidth: 2,
            borderColor: selectedPlan === 'credits' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.08)',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            // Toggle the credits option
            if (selectedPlan === 'credits') {
              handleSelectPlan(''); // Deselect if already selected
            } else {
              handleSelectPlan('credits'); // Select credits
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="sparkles-outline" 
            size={14} 
            color={selectedPlan === 'credits' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)'}
            style={{ marginRight: 6 }}
          />
          <Text style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.5)',
            fontWeight: '500',
          }}>
            Or try AI with 150 credits for $0.99
          </Text>
          <Text style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.3)',
            marginLeft: 6,
          }}>
            • No subscription
          </Text>
        </TouchableOpacity>
      )}

      {/* Modal removed - no longer needed */}
    </View>
  );
};

// Prevent re-render only when props haven't changed (this allows selection highlighting)
export default React.memo(DumbAIPlans);
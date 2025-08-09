// src/screens/PricingScreen/components/PlanCards/UnifiedBlackPlan.js
import React, { useState, useEffect, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UnifiedBlackPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  isLifetimeMember,
  spotsRemaining = 1000,
  responsive = {},
  initialTime
}) => {
  const isSelected = selectedPlan === 'founding';
  const { isTablet } = responsive;
  
  // Countdown state
  const [countdownTime, setCountdownTime] = useState(initialTime || {
    days: 26,
    hours: 12,
    minutes: 45,
    seconds: 30
  });

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
  
  // Determine urgency levels
  const showUrgentBadge = spotsRemaining <= 22 && spotsRemaining > 0;
  const spotsExhausted = spotsRemaining <= 0;
  const isMonthlyPlan = spotsExhausted;
  
  return (
    <View style={{
      paddingHorizontal: 16,
      paddingVertical: 20,
    }}>
      {/* Main Black Container */}
      <View style={{
        backgroundColor: '#000000',
        borderRadius: 20,
      }}>
        {/* Timer Section at Top */}
        <View style={{
          paddingTop: 12,
          paddingBottom: 20,
          paddingHorizontal: 24,
          marginTop: -48,
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '600',
            color: '#FFD700',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            textAlign: 'center',
            marginBottom: 12,
          }}>
            Founder Offer Ends In
          </Text>
          
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

        {/* Pricing Section */}
        <TouchableOpacity
          style={{
            paddingTop: 32,
            paddingHorizontal: 32,
            paddingBottom: 50,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
            borderRadius: 18,
            margin: 2,
            marginTop: 24,
          }}
          onPress={() => handleSelectPlan('founding')}
          activeOpacity={0.7}
          disabled={isLifetimeMember}
        >
          {/* Title */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
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
                left: -24,
              }}
            />
          </View>
          
          {/* Subtitle */}
          <Text style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 24,
          }}>
            {isMonthlyPlan ? 'Monthly subscription' : 'Lifetime membership • One-time payment'}
          </Text>

          {/* Price */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: 24,
          }}>
            <Text style={{
              fontSize: 56,
              fontWeight: '200',
              color: '#FFFFFF',
              letterSpacing: -3,
            }}>
              $4.99
            </Text>
            <Text style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.4)',
              marginLeft: 8,
              fontWeight: '400',
            }}>
              {isMonthlyPlan ? '/mo' : 'once'}
            </Text>
          </View>

          {/* Limited spots indicator - Only when urgent */}
          {showUrgentBadge && (
            <View style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              marginBottom: 20,
            }}>
              <Text style={{
                fontSize: 11,
                fontWeight: '600',
                color: '#FF6B6B',
                letterSpacing: 0.5,
                textAlign: 'center',
              }}>
                ONLY {spotsRemaining} SPOTS REMAINING
              </Text>
            </View>
          )}

          {/* Key Features - Inline */}
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 24,
            paddingHorizontal: 20,
          }}>
            <FeaturePill text="All features" />
            <FeaturePill text="No limits" />
            <FeaturePill text="500 AI credits" />
            {isMonthlyPlan && <FeaturePill text="Cancel anytime" />}
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
            onPress={() => handleSelectPlan('founding')}
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
          {!isMonthlyPlan && spotsRemaining > 22 && (
            <Text style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              textAlign: 'center',
              marginTop: 25,
            }}>
              Limited to first 1,000 founders
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
      fontSize: 9,
      color: 'rgba(255,255,255,0.3)',
      marginTop: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
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
const FeaturePill = ({ text }) => (
  <View style={{
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    margin: 4,
  }}>
    <Text style={{
      fontSize: 12,
      color: 'rgba(255,255,255,0.7)',
      fontWeight: '500',
    }}>
      {text}
    </Text>
  </View>
);

export default memo(UnifiedBlackPlan);
// src/screens/PricingScreen/components/PlanCards/MinimalFounderPlan.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MinimalFounderPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  isLifetimeMember,
  spotsRemaining = 1000,
  responsive = {}
}) => {
  const isSelected = selectedPlan === 'founding';
  const { isTablet } = responsive;
  
  // Determine badge display and urgency
  const showUrgentBadge = spotsRemaining <= 22 && spotsRemaining > 0;
  const showLimitedBadge = spotsRemaining > 22 && spotsRemaining <= 1000;
  const spotsExhausted = spotsRemaining <= 0;
  
  // If spots are exhausted, this becomes a monthly plan
  const isMonthlyPlan = spotsExhausted;
  
  return (
    <View style={{
      width: isTablet ? '75%' : '92%',
      alignSelf: 'center',
      marginVertical: 20,
      position: 'relative',
    }}>
      {/* Limited/Urgent Badge - Top Right Corner */}
      {(showLimitedBadge || showUrgentBadge) && (
        <View style={{
          position: 'absolute',
          top: -10,
          right: '4%',
          backgroundColor: showUrgentBadge ? '#FF5722' : theme.primary,
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 20,
          zIndex: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
          elevation: 4,
        }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: 0.3,
          }}>
            {showUrgentBadge 
              ? `ONLY ${spotsRemaining} SPOTS LEFT!` 
              : 'LIMITED TO 1,000 FOUNDERS'}
          </Text>
        </View>
      )}
      
      {/* Main Card */}
      <TouchableOpacity
        style={{
          backgroundColor: isSelected ? theme.primary : theme.card,
          borderRadius: 16,
          padding: 24,
          borderWidth: isSelected ? 0 : 1,
          borderColor: theme.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 3,
        }}
        onPress={() => handleSelectPlan('founding')}
        activeOpacity={0.9}
        disabled={isLifetimeMember}
      >
        {/* Header Section */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}>
          <View style={{ flex: 1 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 4,
            }}>
              <Ionicons 
                name="rocket" 
                size={24} 
                color={isSelected ? '#FFFFFF' : theme.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={{
                fontSize: 24,
                fontWeight: '700',
                color: isSelected ? '#FFFFFF' : theme.text,
              }}>
                Pro Access
              </Text>
            </View>
            <Text style={{
              fontSize: 14,
              color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary,
              fontWeight: '400',
            }}>
              {isMonthlyPlan ? 'Monthly subscription' : 'Lifetime founder membership'}
            </Text>
          </View>
        </View>

        {/* Price Section */}
        <View style={{
          marginBottom: 24,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            marginBottom: 8,
          }}>
            <Text style={{
              fontSize: 36,
              fontWeight: '700',
              color: isSelected ? '#FFFFFF' : theme.text,
            }}>
              $4.99
            </Text>
            <Text style={{
              fontSize: 16,
              color: isSelected ? 'rgba(255,255,255,0.7)' : theme.textSecondary,
              marginLeft: 8,
              fontWeight: '500',
            }}>
              {isMonthlyPlan ? '/month' : 'once'}
            </Text>
          </View>
          
          {!isMonthlyPlan && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 14,
                color: isSelected ? 'rgba(255,255,255,0.6)' : theme.textSecondary,
                textDecorationLine: 'line-through',
                marginRight: 8,
              }}>
                $4.99/month
              </Text>
              <View style={{
                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : '#4CAF50' + '20',
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 4,
              }}>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isSelected ? '#FFFFFF' : '#4CAF50',
                }}>
                  NO MONTHLY FEES
                </Text>
              </View>
            </View>
          )}
          
          {isMonthlyPlan && (
            <Text style={{
              fontSize: 13,
              color: isSelected ? 'rgba(255,255,255,0.7)' : theme.textSecondary,
              fontStyle: 'italic',
            }}>
              Founder spots are sold out • Cancel anytime
            </Text>
          )}
        </View>

        {/* Benefits List */}
        <View style={{
          borderTopWidth: 1,
          borderTopColor: isSelected ? 'rgba(255,255,255,0.1)' : theme.border,
          paddingTop: 20,
        }}>
          <BenefitRow 
            icon="checkmark-circle"
            text={isMonthlyPlan ? "All Pro features" : "All Pro features forever"}
            isSelected={isSelected}
            theme={theme}
          />
          <BenefitRow 
            icon="gift"
            text={isMonthlyPlan ? "No AI credits included" : "600 AI credits included"}
            isSelected={isSelected}
            theme={theme}
          />
          <BenefitRow 
            icon="people"
            text={isMonthlyPlan ? "Standard referral program" : "Earn 500 credits per referral"}
            isSelected={isSelected}
            theme={theme}
          />
          <BenefitRow 
            icon="shield-checkmark"
            text={isMonthlyPlan ? "Monthly subscription" : "Founder badge & early access"}
            isSelected={isSelected}
            theme={theme}
          />
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={{
            backgroundColor: isSelected ? '#FFFFFF' : theme.primary,
            borderRadius: 12,
            paddingVertical: 16,
            marginTop: 24,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
          }}
          onPress={() => handleSelectPlan('founding')}
          disabled={isLifetimeMember}
        >
          <Ionicons 
            name="rocket" 
            size={20} 
            color={isSelected ? theme.primary : '#FFFFFF'}
            style={{ marginRight: 8 }}
          />
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: isSelected ? theme.primary : '#FFFFFF',
          }}>
            {isLifetimeMember ? 'Already a Pro Member' : 'Unlock Pro Access'}
          </Text>
        </TouchableOpacity>

        {/* Disabled Overlay */}
        {isLifetimeMember && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            borderRadius: 16,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Ionicons 
              name="rocket" 
              size={48} 
              color="#4CAF50" 
            />
            <Text style={{
              color: '#FFFFFF',
              fontSize: 18,
              fontWeight: '600',
              marginTop: 12,
            }}>
              You have Pro Access!
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Subtle Info Text */}
      {!isMonthlyPlan && (
        <Text style={{
          fontSize: 12,
          color: theme.textSecondary,
          textAlign: 'center',
          marginTop: 12,
          opacity: 0.7,
        }}>
          Limited founder offer • No recurring fees
        </Text>
      )}
      
      {isMonthlyPlan && (
        <Text style={{
          fontSize: 12,
          color: theme.textSecondary,
          textAlign: 'center',
          marginTop: 12,
          opacity: 0.7,
        }}>
          Founder offer ended • Monthly subscription
        </Text>
      )}
    </View>
  );
};

// Benefit Row Component
const BenefitRow = ({ icon, text, isSelected, theme }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  }}>
    <Ionicons 
      name={icon}
      size={20}
      color={isSelected ? '#FFFFFF' : theme.primary}
      style={{ marginRight: 12 }}
    />
    <Text style={{
      fontSize: 14,
      color: isSelected ? 'rgba(255,255,255,0.9)' : theme.text,
      flex: 1,
    }}>
      {text}
    </Text>
  </View>
);

export default MinimalFounderPlan;
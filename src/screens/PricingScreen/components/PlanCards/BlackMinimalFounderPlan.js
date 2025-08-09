// src/screens/PricingScreen/components/PlanCards/BlackMinimalFounderPlan.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BlackMinimalFounderPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  isLifetimeMember,
  spotsRemaining = 1000,
  responsive = {}
}) => {
  const isSelected = selectedPlan === 'founding';
  const { isTablet } = responsive;
  
  // Determine urgency levels
  const showUrgentBadge = spotsRemaining <= 22 && spotsRemaining > 0;
  const spotsExhausted = spotsRemaining <= 0;
  const isMonthlyPlan = spotsExhausted;
  
  return (
    <View style={{
      paddingHorizontal: 16,
      paddingVertical: 20,
    }}>
      {/* Price Section - Clean and centered */}
      <TouchableOpacity
        style={{
          backgroundColor: '#000000',
          borderRadius: 16,
          padding: 32,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
        }}
        onPress={() => handleSelectPlan('founding')}
        activeOpacity={0.7}
        disabled={isLifetimeMember}
      >
        {/* Rocket Icon */}
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: 'rgba(255,255,255,0.05)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
        }}>
          <Ionicons 
            name="rocket" 
            size={24} 
            color="#FFFFFF"
          />
        </View>

        {/* Title */}
        <Text style={{
          fontSize: 20,
          fontWeight: '700',
          color: '#FFFFFF',
          marginBottom: 4,
        }}>
          Pro Access
        </Text>
        
        {/* Subtitle */}
        <Text style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          marginBottom: 24,
        }}>
          {isMonthlyPlan ? 'Monthly subscription' : 'Lifetime membership'}
        </Text>

        {/* Price */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          marginBottom: 24,
        }}>
          <Text style={{
            fontSize: 48,
            fontWeight: '300',
            color: '#FFFFFF',
            letterSpacing: -2,
          }}>
            $4.99
          </Text>
          <Text style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.5)',
            marginLeft: 8,
            fontWeight: '400',
          }}>
            {isMonthlyPlan ? '/mo' : 'once'}
          </Text>
        </View>

        {/* Limited spots indicator - Only when urgent */}
        {showUrgentBadge && (
          <View style={{
            backgroundColor: 'rgba(255,107,107,0.15)',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,107,107,0.3)',
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: '#FF6B6B',
              letterSpacing: 0.5,
            }}>
              ONLY {spotsRemaining} SPOTS LEFT
            </Text>
          </View>
        )}

        {/* CTA Button */}
        <TouchableOpacity
          style={{
            backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 32,
            marginTop: 8,
          }}
          onPress={() => handleSelectPlan('founding')}
          disabled={isLifetimeMember}
        >
          <Text style={{
            fontSize: 15,
            fontWeight: '600',
            color: isSelected ? '#FFFFFF' : '#000000',
          }}>
            {isLifetimeMember ? 'You have Pro' : isSelected ? 'Selected' : 'Select Plan'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Key Benefits - Simple list below */}
      <View style={{
        marginTop: 24,
        paddingHorizontal: 8,
      }}>
        <BenefitItem 
          text={isMonthlyPlan ? "All Pro features" : "All Pro features forever"}
          included={true}
        />
        <BenefitItem 
          text={isMonthlyPlan ? "Cancel anytime" : "600 AI credits included"}
          included={true}
        />
        <BenefitItem 
          text={isMonthlyPlan ? "Monthly billing" : "No recurring fees"}
          included={true}
        />
        <BenefitItem 
          text={isMonthlyPlan ? "Standard support" : "Founder badge + early access"}
          included={true}
        />
      </View>

      {/* Subtle footer text */}
      {!isMonthlyPlan && spotsRemaining > 22 && (
        <Text style={{
          fontSize: 11,
          color: theme.textSecondary,
          textAlign: 'center',
          marginTop: 20,
          opacity: 0.5,
        }}>
          Limited to first 1,000 founders
        </Text>
      )}
    </View>
  );
};

// Minimal benefit row
const BenefitItem = ({ text, included }) => (
  <View style={{
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  }}>
    <Ionicons 
      name={included ? "checkmark" : "close"}
      size={16}
      color={included ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.2)'}
      style={{ marginRight: 12, width: 20 }}
    />
    <Text style={{
      fontSize: 14,
      color: 'rgba(255,255,255,0.8)',
      flex: 1,
    }}>
      {text}
    </Text>
  </View>
);

export default BlackMinimalFounderPlan;
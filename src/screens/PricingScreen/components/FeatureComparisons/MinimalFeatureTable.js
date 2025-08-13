// src/screens/PricingScreen/components/FeatureComparisons/MinimalFeatureTable.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

const MinimalFeatureTable = ({ theme, isLifetimeMember, responsive = {}, onNavigateToAIPlans, spotsRemaining = 1000 }) => {
  
  // Check if founder spots are sold out
  const isFounderSoldOut = spotsRemaining <= 0;
  
  // Helper function to get AI benefit text based on founder spots
  const getAIBenefitText = () => {
    if (spotsRemaining > 900) {
      return '1 Month AI Max included ($9.99 value)'; // First 100 spots
    } else if (spotsRemaining > 500) {
      return '1 Month AI Plus included ($4.99 value)'; // Next 400 spots
    } else {
      return '1 Month AI Light included ($2.99 value)'; // Last 500 spots
    }
  };
  
  // Feature data changes based on founder availability
  const features = isFounderSoldOut ? [
    // Monthly subscription features when founder spots are sold out
    { name: 'All current and future Pro features', free: false, pro: true },
    { name: getAIBenefitText(), free: false, pro: true, clickable: true },
    { name: 'Set unlimited goals', free: false, pro: true },
    { name: 'Create unlimited projects', free: false, pro: true },
    { name: 'Add unlimited tasks', free: false, pro: true },
    { name: 'Plan beyond 2 weeks in calendar view', free: false, pro: true },
    { name: 'PDF export for all calendar views', free: false, pro: true },
    { name: 'Choose from 10+ theme colors', free: false, pro: true },
    { name: 'Cancel anytime', free: false, pro: true },
  ] : [
    // Founder features when spots are available
    { name: 'One-time payment • No monthly fees ever', free: false, pro: true },
    { name: 'Lifetime access to all features and updates', free: false, pro: true },
    { name: getAIBenefitText(), free: false, pro: true, clickable: true },
    { name: 'Set unlimited goals', free: false, pro: true },
    { name: 'Create unlimited projects', free: false, pro: true },
    { name: 'Add unlimited tasks', free: false, pro: true },
    { name: 'Plan beyond 2 weeks in calendar view', free: false, pro: true },
    { name: 'Refer friends: both get 1 month AI Light (limit 3)', free: false, pro: true },
    { name: 'PDF export for all calendar views', free: false, pro: true },
    { name: 'Choose from 10+ theme colors', free: false, pro: true },
    { name: 'Exclusive founder title in Discord community', free: false, pro: true },
  ];

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#000000',
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginTop: 8,
      }}>

        {/* Clear Header */}
        <View style={{
          alignItems: 'center',
          marginBottom: 20,
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
            marginBottom: 8,
          }}>
            {isFounderSoldOut ? 'WHAT YOU GET WITH PRO' : 'WHAT YOU GET WITH PRO'}
          </Text>
          <Text style={{
            fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            fontWeight: '400',
          }}>
            {isFounderSoldOut 
              ? 'Monthly subscription with all Pro features'
              : 'All current features, plus these Pro exclusives'
            }
          </Text>
        </View>

        {/* Simple Feature List */}
        <View style={{
          backgroundColor: '#000000',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
          paddingVertical: 8,
        }}>
          {features.map((feature, index) => {
            const Container = feature.clickable ? TouchableOpacity : View;
            
            return (
              <Container 
                key={index} 
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 20,
                  borderBottomWidth: index === features.length - 1 ? 0 : 1,
                  borderBottomColor: 'rgba(255,255,255,0.05)',
                }}
                onPress={feature.clickable ? onNavigateToAIPlans : undefined}
                activeOpacity={feature.clickable ? 0.7 : 1}
              >
                <Ionicons 
                  name="checkmark-circle" 
                  size={20} 
                  color="#FFD700"
                  style={{ marginRight: 12 }}
                />
                <Text style={{
                  fontSize: 14,
                  color: '#FFFFFF',
                  fontWeight: '400',
                  flex: 1,
                  lineHeight: 20,
                  textDecorationLine: feature.clickable ? 'underline' : 'none',
                  textDecorationColor: feature.clickable ? 'rgba(255,255,255,0.6)' : 'transparent',
                }}>
                  {feature.name}
                </Text>
                {feature.clickable && (
                  <Ionicons 
                    name="arrow-forward" 
                    size={14} 
                    color="rgba(255,255,255,0.6)"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </Container>
            );
          })}
        </View>

        {/* Simple CTA */}
        <View style={{
          marginTop: 16,
          alignItems: 'center',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              fontWeight: '400',
            }}>
              AI credits never expire • 
            </Text>
            <Ionicons 
              name="shield-checkmark" 
              size={12} 
              color="rgba(255,255,255,0.5)"
              style={{ marginLeft: 4, marginRight: 2 }}
            />
            <Text style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
              textAlign: 'center',
              fontWeight: '400',
            }}>
              Secure App Store billing
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MinimalFeatureTable;
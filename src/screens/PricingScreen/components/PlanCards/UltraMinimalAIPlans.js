// COMPLETE RECREATION - Minimal React, Maximum Native Control
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UltraMinimalAIPlans = ({ selectedPlan, handleSelectPlan, responsive = {} }) => {
  const { isTablet } = responsive;
  const [subscription, setSubscription] = useState('monthly');

  // Render individual plan card
  const PlanCard = ({ plan, isSelected, isCredits }) => (
    <TouchableOpacity
      style={{
        backgroundColor: '#000000',
        borderRadius: 16,
        padding: 20,
        marginRight: 12,
        width: 280,
        borderWidth: 1,
        borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
        position: 'relative',
      }}
      onPress={() => handleSelectPlan(plan.id)}
      activeOpacity={0.7}
    >
      {plan.popular && (
        <View style={{
          position: 'absolute',
          top: -10,
          right: 20,
          backgroundColor: '#4CAF50',
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 12,
        }}>
          <Text style={{
            fontSize: 10,
            fontWeight: '700',
            color: '#FFFFFF',
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
          name={plan.icon} 
          size={22} 
          color={isCredits ? plan.color : '#FFFFFF'}
        />
      </View>

      <Text style={{
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 4,
      }}>
        {plan.name}
      </Text>

      <Text style={{
        fontSize: 12,
        color: 'rgba(255,255,255,0.5)',
        marginBottom: 16,
      }}>
        {plan.description}
      </Text>

      <View style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 20,
      }}>
        <Text style={{
          fontSize: 28,
          fontWeight: '300',
          color: '#FFFFFF',
        }}>
          {plan.price}
        </Text>
        {plan.period !== 'one-time' && (
          <Text style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            marginLeft: 4,
          }}>
            {plan.period}
          </Text>
        )}
      </View>

      <View style={{ marginBottom: 20 }}>
        {plan.features.map((feature, index) => (
          <View key={index} style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}>
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
          borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
        }}
        onPress={() => handleSelectPlan(plan.id)}
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
  );

  // Static plan definitions with dynamic pricing
  const plans = [
    {
      id: 'credits',
      name: '150 Credits',
      price: '$0.99',
      period: 'one-time',
      description: 'Try AI features',
      icon: 'sparkles',
      features: ['150 AI credits', 'No expiration', 'Test the AI'],
      color: '#FF8C42',
    },
    {
      id: 'compass',
      name: 'AI Light',
      price: subscription === 'annual' ? '$29.99' : '$2.99',
      period: subscription === 'annual' ? '/year' : '/month',
      description: '500 credits monthly',
      icon: 'compass-outline',
      features: ['500 credits/mo', 'Basic AI chat', 'Email support'],
      popular: false,
    },
    {
      id: 'navigator',
      name: 'AI Plus',
      price: subscription === 'annual' ? '$49.99' : '$4.99',
      period: subscription === 'annual' ? '/year' : '/month',
      description: '2,500 credits monthly',
      icon: 'navigate-circle-outline',
      features: ['2,500 credits/mo', 'Advanced AI', 'Priority support'],
      popular: true,
    },
    {
      id: 'guide',
      name: 'AI Pro',
      price: subscription === 'annual' ? '$99.99' : '$9.99',
      period: subscription === 'annual' ? '/year' : '/month',
      description: '10,000 credits monthly',
      icon: 'shield-checkmark-outline',
      features: ['10,000 credits/mo', 'All AI features', 'Premium support'],
      popular: false,
    },
  ];

  return (
    <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
      {/* Billing Toggle */}
      <View style={{
        backgroundColor: '#000000',
        borderRadius: 12,
        padding: 4,
        flexDirection: 'row',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
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
            {subscription === 'annual' && (
              <Text style={{
                fontSize: 10,
                color: '#4CAF50',
                marginTop: 2,
              }}>
                Save 20%
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Plans ScrollView - Pure Native */}
      <ScrollView 
        horizontal={!isTablet}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={292} // 280 width + 12 margin
        snapToAlignment="start"
      >
        {plans.map(plan => {
          const isSelected = selectedPlan === plan.id;
          const isCredits = plan.id === 'credits';
          
          return (
            <PlanCard 
              key={plan.id}
              plan={plan}
              isSelected={isSelected}
              isCredits={isCredits}
            />
          );
        })}
      </ScrollView>

      <Text style={{
        fontSize: 11,
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        marginTop: 16,
      }}>
        AI credits never expire • Cancel anytime
      </Text>
    </View>
  );
};

export default UltraMinimalAIPlans;
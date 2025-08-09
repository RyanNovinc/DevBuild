// ULTRA NUCLEAR - Component that NEVER EVER re-renders
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let globalSubscription = 'monthly';
let globalSelectedPlan = '';
let globalHandleSelectPlan = null;

const StaticAIPlans = ({ 
  selectedPlan, 
  handleSelectPlan,
  initialSubscription = 'monthly',
  isLifetimeMember,
  responsive = {}
}) => {
  const { isTablet } = responsive;
  
  // Update global references but NEVER cause re-render
  globalSelectedPlan = selectedPlan;
  globalHandleSelectPlan = handleSelectPlan;
  
  // Refs to directly manipulate DOM/text content
  const monthlyButtonRef = useRef(null);
  const annualButtonRef = useRef(null);
  const priceRefs = useRef({});
  const periodRefs = useRef({});
  
  // Static plan data that NEVER changes
  const staticPlans = [
    {
      id: 'credits',
      name: '150 Credits',
      basePrice: '$0.99',
      period: 'one-time',
      description: 'Try AI features',
      icon: 'sparkles',
      features: ['150 AI credits', 'No expiration', 'Test the AI'],
      color: '#FF8C42',
    },
    {
      id: 'compass',
      name: 'AI Light',
      monthlyPrice: '$2.99',
      annualPrice: '$29.99',
      description: '500 credits monthly',
      icon: 'compass-outline',
      features: ['500 credits/mo', 'Basic AI chat', 'Email support'],
      popular: false,
    },
    {
      id: 'navigator',
      name: 'AI Plus',
      monthlyPrice: '$4.99',
      annualPrice: '$49.99',
      description: '2,500 credits monthly',
      icon: 'navigate-circle-outline',
      features: ['2,500 credits/mo', 'Advanced AI', 'Priority support'],
      popular: true,
    },
    {
      id: 'guide',
      name: 'AI Pro',
      monthlyPrice: '$9.99',
      annualPrice: '$99.99',
      description: '10,000 credits monthly',
      icon: 'shield-checkmark-outline',
      features: ['10,000 credits/mo', 'All AI features', 'Premium support'],
      popular: false,
    },
  ];

  // Function to update prices without re-rendering
  const updatePricing = (subscription) => {
    globalSubscription = subscription;
    
    // Update price text directly via refs
    staticPlans.forEach(plan => {
      if (plan.id !== 'credits') {
        const priceRef = priceRefs.current[plan.id];
        const periodRef = periodRefs.current[plan.id];
        
        if (priceRef && priceRef.setNativeProps) {
          const price = subscription === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          priceRef.setNativeProps({ text: price });
        }
        
        if (periodRef && periodRef.setNativeProps) {
          const period = subscription === 'annual' ? '/year' : '/month';
          periodRef.setNativeProps({ text: period });
        }
      }
    });
  };

  return (
    <View style={{
      paddingHorizontal: 16,
      paddingVertical: 20,
    }}>
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
          ref={monthlyButtonRef}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: globalSubscription === 'monthly' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
          onPress={() => {
            updatePricing('monthly');
            // Update button styles directly
            monthlyButtonRef.current?.setNativeProps({ 
              style: { backgroundColor: 'rgba(255,255,255,0.1)' }
            });
            annualButtonRef.current?.setNativeProps({ 
              style: { backgroundColor: 'transparent' }
            });
          }}
        >
          <Text style={{
            textAlign: 'center',
            fontSize: 14,
            fontWeight: '600',
            color: '#FFFFFF',
          }}>
            Monthly
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          ref={annualButtonRef}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 10,
            backgroundColor: globalSubscription === 'annual' ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
          onPress={() => {
            updatePricing('annual');
            // Update button styles directly
            annualButtonRef.current?.setNativeProps({ 
              style: { backgroundColor: 'rgba(255,255,255,0.1)' }
            });
            monthlyButtonRef.current?.setNativeProps({ 
              style: { backgroundColor: 'transparent' }
            });
          }}
        >
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: '#FFFFFF',
          }}>
            Annual
          </Text>
        </TouchableOpacity>
      </View>

      {/* Plans FlatList - STATIC DATA */}
      <FlatList 
        data={staticPlans}
        horizontal={!isTablet}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item: plan }) => {
          const isSelected = globalSelectedPlan === plan.id;
          const isCredits = plan.id === 'credits';
          
          return (
            <TouchableOpacity
              style={{
                backgroundColor: '#000000',
                borderRadius: 16,
                padding: 20,
                marginRight: isTablet ? 0 : 12,
                marginBottom: isTablet ? 12 : 0,
                width: 280,
                borderWidth: 1,
                borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                position: 'relative',
              }}
              onPress={() => globalHandleSelectPlan && globalHandleSelectPlan(plan.id)}
              activeOpacity={0.7}
            >
              {/* Popular badge */}
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

              {/* Icon */}
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

              {/* Name */}
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#FFFFFF',
                marginBottom: 4,
              }}>
                {plan.name}
              </Text>

              {/* Description */}
              <Text style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 16,
              }}>
                {plan.description}
              </Text>

              {/* Price */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                marginBottom: 20,
              }}>
                <Text 
                  ref={(ref) => { priceRefs.current[plan.id] = ref; }}
                  style={{
                    fontSize: 28,
                    fontWeight: '300',
                    color: '#FFFFFF',
                  }}
                >
                  {isCredits ? plan.basePrice : plan.monthlyPrice}
                </Text>
                {!isCredits && (
                  <Text 
                    ref={(ref) => { periodRefs.current[plan.id] = ref; }}
                    style={{
                      fontSize: 14,
                      color: 'rgba(255,255,255,0.4)',
                      marginLeft: 4,
                    }}
                  >
                    /month
                  </Text>
                )}
              </View>

              {/* Features */}
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

              {/* Select Button */}
              <TouchableOpacity
                style={{
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                }}
                onPress={() => globalHandleSelectPlan && globalHandleSelectPlan(plan.id)}
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
        }}
      />

      {/* Info Text */}
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

// This component NEVER re-renders
export default React.memo(StaticAIPlans, () => true);
// src/screens/PricingScreen/components/MinimalStickyCTA.js
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MinimalStickyCTA = ({ 
  theme, 
  selectedPlan, 
  activeTab, 
  isLifetimeMember, 
  selectedSubscription,
  aiPlansBilling = 'monthly',
  handlePurchase,
  spotsRemaining = 1000,
  responsive = {}
}) => {
  // Don't show if user is already a lifetime member
  if (isLifetimeMember) {
    return null;
  }

  // Calculate current price based on spots remaining (single $3.49 price with different AI benefits)
  const getCurrentPrice = () => {
    const spotsExhausted = spotsRemaining <= 0;
    if (spotsExhausted) return '$3.49/mo'; // Monthly pricing when sold out
    
    return '$3.49'; // Same price for all founder spots
  };

  // Determine what to show based on selection
  const isFounderPlan = selectedPlan === 'founding';
  const isCredits = selectedPlan === 'credits';
  const isAIPlan = selectedPlan === 'compass' || selectedPlan === 'navigator' || selectedPlan === 'guide';
  const isSubscriptionPlan = selectedPlan === 'basic' || selectedPlan === 'pro' || selectedPlan === 'premium';
  const noSelection = !selectedPlan;
  
  // Get price and text
  let priceText = '';
  let buttonText = '';
  let subText = '';
  
  if (noSelection) {
    // Don't show anything when nothing is selected
    // User can click the hint button to learn about the credits option
    return null;
  } else if (isFounderPlan) {
    priceText = getCurrentPrice();
    buttonText = 'Unlock Pro Access';
    subText = spotsRemaining <= 0 ? 'Monthly subscription' : 'One-time payment';
  } else if (isCredits) {
    priceText = '$0.99';
    buttonText = 'Get 150 Credits';
    subText = '';
  } else if (isAIPlan) {
    // AI Plan pricing - use aiPlansBilling for AI plans
    const currentBilling = activeTab === 'subscription' ? aiPlansBilling : selectedSubscription;
    const prices = {
      compass: currentBilling === 'annual' ? '$29.99/year' : '$2.99/month',
      navigator: currentBilling === 'annual' ? '$49.99/year' : '$4.99/month',
      guide: currentBilling === 'annual' ? '$99.99/year' : '$9.99/month'
    };
    priceText = prices[selectedPlan];
    buttonText = 'Start AI Plan';
    subText = currentBilling === 'annual' ? 'Billed yearly' : 'Billed monthly';
  } else if (isSubscriptionPlan) {
    // Subscription Plan pricing - use selectedSubscription for billing
    const currentBilling = selectedSubscription;
    const prices = {
      basic: currentBilling === 'annual' ? '$34.99/year' : '$3.49/month',
      pro: currentBilling === 'annual' ? '$49.99/year' : '$4.99/month',
      premium: currentBilling === 'annual' ? '$99.99/year' : '$9.99/month'
    };
    const names = {
      basic: 'LifeCompass Basic',
      pro: 'LifeCompass Pro', 
      premium: 'LifeCompass Premium'
    };
    priceText = prices[selectedPlan];
    buttonText = `Start ${names[selectedPlan]}`;
    subText = currentBilling === 'annual' ? 'Billed yearly' : 'Billed monthly';
  }
  
  const { safeSpacing } = responsive;
  
  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingBottom: safeSpacing?.bottom || 20,
      pointerEvents: 'box-none', // Allow touches to pass through empty areas
    }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
          pointerEvents: 'box-none',
        }}
      >
        {/* Left side - Description (just floating text) */}
        <View style={{ 
          flex: 1,
          marginRight: 10,
          justifyContent: 'center',
        }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: 2,
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 3,
          }}>
            {buttonText}
          </Text>
          {subText ? (
            <Text style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.7)',
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}>
              {subText}
            </Text>
          ) : null}
        </View>
        
        {/* Right side - Price button (floating) */}
        <TouchableOpacity
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 24,
            flexDirection: 'row',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={() => handlePurchase(noSelection ? 'credits' : selectedPlan)}
          activeOpacity={0.8}
        >
          <Text style={{
            fontSize: 16,
            fontWeight: '700',
            color: '#000000',
            letterSpacing: 0.5,
          }}>
            {priceText}
          </Text>
          <Ionicons 
            name="arrow-forward" 
            size={18} 
            color="#000000"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MinimalStickyCTA;
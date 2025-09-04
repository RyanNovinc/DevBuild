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
  handleSelectPlan,
  spotsRemaining = 1000,
  responsive = {}
}) => {
  // Don't show if user is already a lifetime member
  if (isLifetimeMember) {
    return null;
  }

  // Calculate current price based on user number
  const getCurrentPrice = () => {
    const spotsExhausted = spotsRemaining <= 0;
    if (spotsExhausted) {
      // When sold out, show billing-based pricing
      if (selectedSubscription === 'lifetime') return '$99.99';
      return selectedSubscription === 'annual' ? '$34.99/year' : '$3.49/mo';
    }
    
    const userNumber = 1001 - spotsRemaining;
    if (userNumber <= 100) return '$0.99'; // Users 1-100
    if (userNumber <= 500) return '$2.99'; // Users 101-500
    return '$4.99'; // Users 501-1000
  };

  // Determine what to show based on selection
  const isFounderPlan = selectedPlan === 'founding';
  const isCredits = selectedPlan === 'credits';
  const isAIPlan = selectedPlan === 'compass' || selectedPlan === 'navigator' || selectedPlan === 'guide';
  const isSubscriptionPlan = selectedPlan === 'basic' || selectedPlan === 'pro' || selectedPlan === 'premium';
  const noSelection = !selectedPlan;
  
  // Hide CTA completely for AI plans on AI Add-ons tab
  if (isAIPlan && activeTab === 'subscription') {
    return null;
  }
  
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
    subText = spotsRemaining <= 0 ? (selectedSubscription === 'lifetime' ? 'One-time payment' : selectedSubscription === 'annual' ? 'Annual subscription' : 'Monthly subscription') : 'One-time payment';
  } else if (isCredits) {
    priceText = '$0.99';
    buttonText = 'Get 150 Credits';
    subText = '';
  } else if (isAIPlan) {
    // AI Plan names instead of prices - users see pricing in the modal
    const planNames = {
      compass: 'AI Light',
      navigator: 'AI Plus',
      guide: 'AI Max'
    };
    priceText = planNames[selectedPlan];
    buttonText = `Continue with ${planNames[selectedPlan]}`;
    subText = 'Select duration and see pricing';
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
          onPress={() => {
            const planToHandle = noSelection ? 'credits' : selectedPlan;
            // Use handleSelectPlan for AI plans, handlePurchase for others
            if (isAIPlan && handleSelectPlan) {
              handleSelectPlan(planToHandle);
            } else {
              handlePurchase(planToHandle);
            }
          }}
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
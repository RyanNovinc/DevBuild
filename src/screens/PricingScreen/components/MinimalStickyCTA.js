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
  responsive = {}
}) => {
  // Don't show if user is already a lifetime member
  if (isLifetimeMember) {
    return null;
  }

  // Determine what to show based on selection
  const isFounderPlan = selectedPlan === 'founding';
  const isCredits = selectedPlan === 'credits';
  const isAIPlan = selectedPlan === 'compass' || selectedPlan === 'navigator' || selectedPlan === 'guide';
  const noSelection = !selectedPlan;
  
  // Get price and text
  let priceText = '';
  let buttonText = '';
  let subText = '';
  
  if (noSelection) {
    // Only show Try AI Features button on AI Plans tab, not on Pro Access tab
    if (activeTab !== 'subscription') {
      return null;
    }
    
    // Show 150 credits option when no plan selected on AI Plans tab
    priceText = '$0.99';
    buttonText = 'Try AI Features';
    subText = 'Get 150 credits • No subscription required';
  } else if (isFounderPlan) {
    priceText = '$4.99';
    buttonText = 'Unlock Pro Access';
    subText = 'One-time payment';
  } else if (isCredits) {
    priceText = '$0.99';
    buttonText = 'Get 150 Credits';
    subText = '';
  } else if (isAIPlan) {
    // AI Plan pricing - use aiPlansBilling for AI plans
    const currentBilling = activeTab === 'subscription' ? aiPlansBilling : selectedSubscription;
    const prices = {
      compass: currentBilling === 'annual' ? '$29.99/year' : '$2.99/mo',
      navigator: currentBilling === 'annual' ? '$49.99/year' : '$4.99/mo',
      guide: currentBilling === 'annual' ? '$99.99/year' : '$9.99/mo'
    };
    priceText = prices[selectedPlan];
    buttonText = 'Start AI Plan';
    subText = currentBilling === 'annual' ? 'Billed annually' : 'Billed monthly';
  }
  
  const { safeSpacing } = responsive;
  
  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#000000',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.05)',
      paddingBottom: safeSpacing?.bottom || 20,
    }}>
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
        onPress={() => handlePurchase(noSelection ? 'credits' : selectedPlan)}
        activeOpacity={0.8}
      >
        {/* Left side - Description */}
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
            marginBottom: 2,
          }}>
            {buttonText}
          </Text>
          {subText ? (
            <Text style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
            }}>
              {subText}
            </Text>
          ) : null}
        </View>
        
        {/* Right side - Price button */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
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
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default MinimalStickyCTA;
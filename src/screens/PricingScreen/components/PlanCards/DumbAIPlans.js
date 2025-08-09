// STUPIDEST POSSIBLE SOLUTION - 4 separate cards, no scrolling bullshit
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DumbAIPlans = ({ selectedPlan, handleSelectPlan, billing, setBilling }) => {
  const subscription = billing || 'monthly';
  const setSubscription = setBilling || (() => {});

  // Helper function to add commas to numbers
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const CardTemplate = ({ id, name, icon, description, features, color, popular, monthlyPrice, annualPrice, monthlyCredits, annualCreditsPerDollar }) => {
    const isSelected = selectedPlan === id;
    const isCredits = id === 'credits';
    const price = isCredits ? '$0.99' : (subscription === 'annual' ? annualPrice : monthlyPrice);
    const period = isCredits ? 'one-time' : (subscription === 'annual' ? '/year' : '/month');
    
    // Get the correct credits per dollar based on billing type
    const creditsPerDollar = !isCredits && subscription === 'annual' ? annualCreditsPerDollar : null;
    
    // Calculate credits display based on billing type
    const creditsDisplay = !isCredits && monthlyCredits ? 
      (subscription === 'annual' ? `${formatNumber(monthlyCredits * 12)} credits/year` : `${formatNumber(monthlyCredits)} credits/mo`) : 
      null;

    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#000000',
          borderRadius: 24,
          padding: 32,
          marginRight: 20,
          width: 320,
          height: 380,
          borderWidth: 2,
          borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
          position: 'relative',
        }}
        onPress={() => handleSelectPlan(id)}
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
          {subscription === 'annual' && monthlyCredits ? 
            `${formatNumber(monthlyCredits * 12)} credits annually` : 
            description}
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
            {price}
          </Text>
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
          {features.map((feature, index) => {
            // Replace features with dynamic values
            let displayFeature = feature;
            if (feature.includes('credits/mo') && creditsDisplay) {
              displayFeature = creditsDisplay;
            } else if (feature.includes('credits per $') && creditsPerDollar) {
              displayFeature = formatNumber(creditsPerDollar) + ' credits per $';
            }
            
            return (
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
                {displayFeature}
              </Text>
            </View>
          )})}
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
            borderRadius: 10,
            paddingVertical: 10,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
          }}
          onPress={() => handleSelectPlan(id)}
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
  };

  return (
    <View style={{ paddingHorizontal: 0, paddingVertical: 20, width: '100%', maxWidth: 400 }}>
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
            <Text style={{
              fontSize: 10,
              color: subscription === 'annual' ? '#FFD700' : 'transparent',
              marginTop: 2,
              height: 12, // Reserve consistent height
            }}>
              Save 20%
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 4 SEPARATE CARDS - BASIC SCROLLVIEW */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        style={{ marginHorizontal: -16, marginTop: 4 }}
      >
        <View style={{ flexDirection: 'row', paddingLeft: 16 }}>
        
        <CardTemplate 
          id="compass"
          name="AI Light"
          icon="compass-outline"
          description="500 credits per month"
          features={['167 credits per $', 'For casual users']}
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
          description="1,500 credits per month"
          features={['300 credits per $', 'For daily users']}
          popular={true}
          monthlyPrice="$4.99"
          annualPrice="$49.99"
          monthlyCredits={1500}
          annualCreditsPerDollar={360}
        />
        
        <CardTemplate 
          id="guide"
          name="AI Pro"
          icon="shield-checkmark-outline"
          description="5,000 credits per month"
          features={['500 credits per $', 'For heavy users']}
          popular={false}
          monthlyPrice="$9.99"
          annualPrice="$99.99"
          monthlyCredits={5000}
          annualCreditsPerDollar={600}
        />
        </View>
      </ScrollView>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
      }}>
        <Text style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
        }}>
          AI credits never expire • 
        </Text>
        <Ionicons 
          name="shield-checkmark" 
          size={12} 
          color="rgba(255,255,255,0.3)"
          style={{ marginLeft: 4, marginRight: 2 }}
        />
        <Text style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
        }}>
          Secure App Store billing
        </Text>
      </View>
    </View>
  );
};

// Prevent re-render only when props haven't changed (this allows selection highlighting)
export default React.memo(DumbAIPlans);
// src/screens/PricingScreen/components/PlanCards/CompactFounderPlan.js
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CompactFounderPlan = ({ 
  theme, 
  selectedPlan, 
  handleSelectPlan, 
  isLifetimeMember, 
  responsive = {}
}) => {
  // Animation values for glow effect
  const glowAnim = useRef(new Animated.Value(0)).current;
  
  // Set up glow animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad)
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
          easing: Easing.inOut(Easing.quad)
        })
      ])
    ).start();
  }, []);
  
  // Determine if this plan is selected
  const isSelected = selectedPlan === 'founding';
  
  // Get responsive values
  const { isTablet } = responsive;
  
  // Calculate width based on device size
  const cardWidth = isTablet ? '75%' : '90%';
  
  // Card background color based on selection state
  const cardBackgroundColor = isSelected ? '#3F51B5' : theme.card;
  
  // Main text color based on selection state
  const textColor = isSelected ? '#FFFFFF' : theme.text;
  
  // Secondary text color based on selection state
  const secondaryTextColor = isSelected ? 'rgba(255, 255, 255, 0.7)' : theme.textSecondary;
  
  // Calculate the shadow radius for the glow effect
  const shadowRadius = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [3, 15]
  });
  
  // Calculate the shadow opacity for the glow effect
  const shadowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8]
  });
  
  // Calculate the border color intensity
  const borderColorInterpolation = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D4AF37', '#FFD700']
  });
  
  // Status badge component
  const StatusBadge = () => (
    <View style={{
      position: 'absolute',
      top: -12,
      left: '50%',
      transform: [{ translateX: -90 }],
      backgroundColor: '#FFD700',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 3,
      zIndex: 10,
    }}>
      <Text style={{
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000000',
      }}>
        EARLY ADOPTER ADVANTAGE
      </Text>
    </View>
  );
  
  return (
    <View style={{
      width: cardWidth,
      alignSelf: 'center',
      marginVertical: 10,
      position: 'relative'
    }}>
      {/* Status badge */}
      <StatusBadge />
      
      {/* Compact main card */}
      <Animated.View
        style={{
          backgroundColor: cardBackgroundColor,
          borderWidth: 3,
          borderColor: borderColorInterpolation,
          borderRadius: 16,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity,
          shadowRadius,
          elevation: 8,
          overflow: 'hidden'
        }}
      >
        <TouchableOpacity
          style={{
            padding: 20,
            alignItems: 'center',
            opacity: isLifetimeMember ? 0.7 : 1
          }}
          onPress={() => handleSelectPlan('founding')}
          activeOpacity={0.8}
          disabled={isLifetimeMember}
        >
          {/* Title */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <Ionicons
              name="trophy"
              size={20}
              color={isSelected ? '#FFD700' : '#FFD700'}
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: textColor,
              textAlign: 'center'
            }}>
              Founder Access
            </Text>
          </View>
          
          {/* Crossed out price */}
          <Text style={{
            fontSize: 14,
            color: secondaryTextColor,
            textDecorationLine: 'line-through',
            marginBottom: 4
          }}>
            Regular price: $4.99/month
          </Text>
          
          {/* Main price */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 8
          }}>
            <Text style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: textColor,
              textAlign: 'center'
            }}>
              $4.99
            </Text>
            <Text style={{
              fontSize: 11,
              fontWeight: '600',
              color: textColor,
              marginLeft: 6,
              opacity: 0.7
            }}>
              One Time Purchase
            </Text>
          </View>
          
          {/* Limited spots indicator */}
          <View style={{
            backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.2)' : theme.primary + '20',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            marginTop: 4
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: '600',
              color: isSelected ? '#FFFFFF' : theme.primary,
              textAlign: 'center'
            }}>
              Limited to first 1,000 members
            </Text>
          </View>
          
          {/* Disabled state overlay */}
          {isLifetimeMember && (
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.3)',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 16
            }}>
              <Text style={{
                color: '#FFFFFF',
                fontWeight: 'bold',
                fontSize: 16
              }}>
                Already a Member
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default CompactFounderPlan;
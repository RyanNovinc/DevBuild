// src/screens/PricingScreen/components/ViewToggle.js
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ViewToggle = ({ theme, viewMode, setViewMode, activeTab }) => {
  const isFounderTab = activeTab === 'lifetime';
  
  // Animation values for chevron bounce
  const chevronScaleAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Only animate when in cards view (showing "View What's Included")
    if (viewMode === 'cards') {
      // Create a gentle bounce animation for the chevron
      const chevronAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(chevronScaleAnim, {
            toValue: 1.3,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(chevronScaleAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      chevronAnimation.start();
      
      return () => {
        chevronAnimation.stop();
      };
    }
  }, [viewMode, chevronScaleAnim]);
  
  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
      {/* Single toggle button */}
      <TouchableOpacity
        style={{
          backgroundColor: '#000000',
          borderRadius: 12,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onPress={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={viewMode === 'cards' ? 'list-outline' : 'card-outline'}
          size={20}
          color="#FFFFFF"
          style={{ marginRight: 10 }}
        />
        <Text style={{
          fontSize: 15,
          fontWeight: '600',
          color: '#FFFFFF',
        }}>
          {viewMode === 'cards' 
            ? `View ${isFounderTab ? 'What\'s Included' : 'Feature Comparison'}`
            : `View ${isFounderTab ? 'Pro Pricing' : 'Plan Options'}`}
        </Text>
        <Animated.View
          style={{
            marginLeft: 8,
            transform: [{ scale: viewMode === 'cards' ? chevronScaleAnim : 1 }],
          }}
        >
          <Ionicons
            name={viewMode === 'cards' ? "chevron-forward" : "chevron-back"}
            size={18}
            color="rgba(255,255,255,0.6)"
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 25,
    padding: 4,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
    flex: 1,
  },
  activeButton: {
    borderRadius: 22,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  }
});

export default ViewToggle;
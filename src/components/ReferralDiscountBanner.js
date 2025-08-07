// src/components/ReferralDiscountBanner.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReferralIntegration from '../utils/ReferralIntegration';

const ReferralDiscountBanner = ({ 
  onApplyDiscount, 
  originalPrice, 
  subscriptionType,
  style 
}) => {
  const [hasDiscounts, setHasDiscounts] = useState(false);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  
  // Animation values
  const slideAnim = useState(new Animated.Value(-100))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    checkForDiscounts();
  }, []);

  const checkForDiscounts = async () => {
    try {
      const discounts = await ReferralIntegration.checkForReferralDiscounts();
      if (discounts && discounts.length > 0) {
        setHasDiscounts(true);
        setDiscountInfo(discounts[0]);
        animateIn();
      }
    } catch (error) {
      console.error('Error checking for discounts:', error);
    }
  };

  const animateIn = () => {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      )
    ]).start();
  };

  const handleApplyDiscount = async () => {
    if (loading || applied) return;
    
    setLoading(true);
    
    try {
      const result = await ReferralIntegration.applyReferralDiscount(
        originalPrice, 
        subscriptionType
      );
      
      if (result.success) {
        setApplied(true);
        if (onApplyDiscount) {
          onApplyDiscount(result);
        }
      }
    } catch (error) {
      console.error('Error applying discount:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasDiscounts || !discountInfo) {
    return null;
  }

  const discountAmount = discountInfo.reward_amount || 50;
  const savings = originalPrice * (discountAmount / 100);

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        {
          transform: [
            { translateY: slideAnim },
            { scale: pulseAnim }
          ]
        }
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name="gift" 
            size={24} 
            color="#FFD700" 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            🎉 Referral Reward Available!
          </Text>
          <Text style={styles.subtitle}>
            Save {discountAmount}% (${savings.toFixed(2)}) with your referral reward
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.applyButton,
            applied && styles.appliedButton,
            loading && styles.loadingButton
          ]}
          onPress={handleApplyDiscount}
          disabled={loading || applied}
        >
          <Text style={[
            styles.applyButtonText,
            applied && styles.appliedButtonText
          ]}>
            {loading ? 'Applying...' : applied ? 'Applied!' : 'Apply'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {applied && (
        <View style={styles.appliedBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.appliedText}>
            Discount applied! New price: ${(originalPrice - savings).toFixed(2)}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    lineHeight: 18,
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  appliedButton: {
    backgroundColor: '#2E7D32',
  },
  loadingButton: {
    backgroundColor: '#66BB6A',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  appliedButtonText: {
    color: '#FFFFFF',
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  appliedText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ReferralDiscountBanner;
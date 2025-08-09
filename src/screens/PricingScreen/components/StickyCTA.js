// src/screens/PricingScreen/components/StickyCTA.js
import React, { useState, useEffect, useRef } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMonthlyRate } from '../utils';

const StickyCTA = ({ 
  theme, 
  selectedPlan, 
  activeTab, 
  isFromReferral, 
  isLifetimeMember, 
  selectedSubscription,
  handlePurchase,
  responsive = {}
}) => {
  // Timer states
  const timerRef = useRef(null);
  const timerStartTimeRef = useRef(null);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(300); // 5 minutes in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [timerStatus, setTimerStatus] = useState('active'); // 'active', 'checking', 'securing', 'reset'
  
  // Animation for button scaling with smoother transitions
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  // Initialize or update timer when founder plan is selected
  useEffect(() => {
    // Only initialize a new timer if plan is selected and timer not already running
    if (selectedPlan === 'founding' && activeTab === 'lifetime') {
      if (!timerStartTimeRef.current && timerStatus === 'active') {
        // First time selection - start new timer
        timerStartTimeRef.current = Date.now();
        setTimerActive(true);
      } else if (!timerActive && timerStatus === 'active') {
        // Re-selected after deselection - resume timer with remaining time
        setTimerActive(true);
      }
    } else if (selectedPlan !== 'founding' && timerActive && timerStatus === 'active') {
      // Different plan selected - pause timer
      setTimerActive(false);
    }
    
    // Clean up on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [selectedPlan, activeTab, timerStatus]);
  
  // Handle timer logic when active
  useEffect(() => {
    if (timerActive && timerStatus === 'active') {
      // Calculate time elapsed since start
      const calculateRemainingTime = () => {
        if (!timerStartTimeRef.current) return 0;
        
        const elapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
        const remaining = Math.max(300 - elapsed, 0);
        return remaining;
      };
      
      // Initial calculation
      setSessionTimeLeft(calculateRemainingTime());
      
      // Start interval
      timerRef.current = setInterval(() => {
        const remaining = calculateRemainingTime();
        setSessionTimeLeft(remaining);
        
        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setTimerActive(false);
          // Start the checking-securing-reset sequence
          handleTimerExpiration();
        }
      }, 1000);
    } else if (timerRef.current && timerStatus === 'active') {
      // Clear interval if timer becomes inactive
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timerStatus]);
  
  // Handle timer expiration with checking-securing-reset sequence
  const handleTimerExpiration = () => {
    // First show "checking for available spots"
    setTimerStatus('checking');
    
    // After 2 seconds, show "securing new spot"
    setTimeout(() => {
      setTimerStatus('securing');
      
      // After another 2 seconds, reset the timer
      setTimeout(() => {
        timerStartTimeRef.current = Date.now();
        setTimerStatus('active');
        setTimerActive(true);
      }, 2000);
    }, 2000);
  };
  
  // Create smooth pulse animation for last minute with increasing intensity
  useEffect(() => {
    if (timerActive && sessionTimeLeft <= 60 && sessionTimeLeft > 0 && timerStatus === 'active') {
      // Make animation faster and more intense as time decreases, with smooth easing
      const duration = sessionTimeLeft < 10 ? 600 : (sessionTimeLeft < 30 ? 800 : 1000);
      const scale = sessionTimeLeft < 10 ? 1.06 : (sessionTimeLeft < 30 ? 1.04 : 1.03);
      
      // Cancel any existing animations first
      buttonScale.stopAnimation();
      
      // Start new animation with easeInOut for smoother transitions
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: scale,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sine), // Add easing for smoothness
            useNativeDriver: true
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sine), // Add easing for smoothness
            useNativeDriver: true
          })
        ])
      ).start();
    } else if (timerStatus === 'active') {
      // Reset scale smoothly if not in last minute
      buttonScale.stopAnimation();
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 300,
        easing: Easing.inOut(Easing.cubic), // Smoother reset
        useNativeDriver: true
      }).start();
    }
  }, [sessionTimeLeft, timerActive, timerStatus]);
  
  // Create pulse animation for last minute with increasing intensity
  useEffect(() => {
    if (timerActive && sessionTimeLeft <= 60 && sessionTimeLeft > 0) {
      // Make animation faster and more intense as time decreases
      const duration = sessionTimeLeft < 10 ? 300 : (sessionTimeLeft < 30 ? 400 : 500);
      const scale = sessionTimeLeft < 10 ? 1.08 : (sessionTimeLeft < 30 ? 1.06 : 1.05);
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(buttonScale, {
            toValue: scale,
            duration: duration,
            useNativeDriver: true
          }),
          Animated.timing(buttonScale, {
            toValue: 1,
            duration: duration,
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      // Reset scale if not in last minute
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [sessionTimeLeft, timerActive]);
  
  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Only show the button if:
  // 1. A plan is actually selected AND
  // 2. Selected plan is not 'free' AND
  // 3. For 'lifetime' tab, only show if selectedPlan is 'founding'
  // 4. For 'lifetime' tab, hide if user is already a lifetime member
  if (
    !selectedPlan || 
    selectedPlan === '' || 
    selectedPlan === 'free' || 
    (activeTab === 'lifetime' && selectedPlan !== 'founding') ||
    (activeTab === 'lifetime' && selectedPlan === 'founding' && isLifetimeMember)
  ) return null;
  
  // Calculate price once to ensure consistency
  const priceDisplay = (() => {
    if (activeTab === 'lifetime') {
      return '$4.99';
    } else {
      const price = getMonthlyRate(selectedPlan, isLifetimeMember, selectedSubscription, isFromReferral);
      return `$${price}/mo`;
    }
  })();
  
  // Get button text with appropriate benefit-focused label
  const getButtonText = () => {
    if (activeTab === 'lifetime') {
      // Change text in last minute for urgency
      if (timerActive && sessionTimeLeft <= 60) {
        return 'Secure Your Spot Now!';
      }
      return 'Claim Your Founder Access';
    } else if (selectedPlan === 'credits') {
      return 'Get 150 AI Credits';
    } else if (selectedPlan === 'starter') {
      return 'Get 600 Monthly Credits';
    } else if (selectedPlan === 'professional') {
      return 'Get 1,500 Monthly Credits';
    } else if (selectedPlan === 'business') {
      return 'Get 5,000 Monthly Credits';
    } else {
      return 'Get Started';
    }
  };
  
  // Reservation message component
  const ReservationMessage = () => {
    if (selectedPlan !== 'founding' || !timerActive) return null;
    
    // Determine color based on time left - more granular changes
    const getTimerColor = () => {
      if (sessionTimeLeft <= 10) return '#FF0000'; // Bright red for last 10 seconds
      if (sessionTimeLeft <= 30) return '#FF2D00'; // Strong red for last 30 seconds
      if (sessionTimeLeft <= 60) return '#FF3B30'; // Red for last minute
      if (sessionTimeLeft <= 120) return '#FF9500'; // Orange for last 2 minutes
      return '#FFCC00'; // Yellow for rest of time
    };
    
    return (
      <View style={[
        styles.reservationContainer,
        { 
          backgroundColor: sessionTimeLeft <= 10 ? '#FFDDDD' :
                          sessionTimeLeft <= 30 ? '#FFEBEB' :
                          sessionTimeLeft <= 60 ? '#FFF0F0' : '#FFF9EB',
          borderLeftWidth: 3,
          borderLeftColor: getTimerColor(),
          borderWidth: sessionTimeLeft <= 30 ? 1 : 0,
          borderColor: sessionTimeLeft <= 30 ? getTimerColor() + '40' : 'transparent'
        }
      ]}>
        <Ionicons 
          name={sessionTimeLeft <= 30 ? "alarm" : "timer-outline"} 
          size={sessionTimeLeft <= 30 ? 18 : 16} 
          color={getTimerColor()} 
        />
          <Text style={[
            styles.reservationText,
            { 
              color: sessionTimeLeft <= 10 ? '#D00000' : 
                     sessionTimeLeft <= 30 ? '#E02020' : 
                     sessionTimeLeft <= 60 ? '#E03030' : '#DD8500',
              fontWeight: sessionTimeLeft <= 30 ? '700' : '600'
            }
          ]}>
            {sessionTimeLeft <= 10
              ? `Last chance! ${formatTime(sessionTimeLeft)}`
              : sessionTimeLeft <= 30
              ? `Hurry! ${formatTime(sessionTimeLeft)} left`
              : sessionTimeLeft <= 60
              ? `Spot reserved for ${formatTime(sessionTimeLeft)}`
              : `Spot reserved for ${formatTime(sessionTimeLeft)}`}
          </Text>
      </View>
    );
  };
  
  return (
    <View style={[
      styles.container,
      responsive?.safeSpacing && { paddingBottom: responsive.safeSpacing.bottom }
    ]}>
      {/* Reservation Timer Message */}
      <ReservationMessage />
      
      {/* CTA Button */}
      <Animated.View style={{ 
        transform: [{ scale: selectedPlan === 'founding' ? buttonScale : 1 }],
        width: '100%'
      }}>
        <TouchableOpacity
          style={[
            styles.stickyPurchaseButton,
            { 
              backgroundColor: activeTab === 'lifetime' ? 
                '#3F51B5' : 
                (selectedPlan === 'credits' ? '#FF8C42' :
                 selectedPlan === 'starter' ? '#03A9F4' : 
                 selectedPlan === 'professional' ? '#3F51B5' : '#673AB7'),
              // Add border for extra emphasis in last minute
              borderWidth: (timerActive && sessionTimeLeft <= 60) ? 2 : 0,
              borderColor: '#FFD700',
              // Ensure minimum height for touch target
              minHeight: 56
            }
          ]}
          onPress={() => handlePurchase(selectedPlan)}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={getButtonText()}
          accessibilityHint="Completes the purchase for the selected plan"
        >
          <Text style={styles.buttonText}>
            {getButtonText()}
          </Text>
          
          {/* Quantity indicator for founder plan */}
          {selectedPlan === 'founding' && (
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>
                1 of 1,000
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 8, // Shifted down by reducing this value
    left: 20,
    right: 20,
    zIndex: 1000,
  },
  reservationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reservationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  stickyPurchaseButton: {
    paddingVertical: 16,
    paddingHorizontal: 20, // Added horizontal padding to make room for badge
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
    position: 'relative', // For absolute positioning of the quantity badge
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginRight: 45, // Added space for the badge
  },
  quantityBadge: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

export default StickyCTA;
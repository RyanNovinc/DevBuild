// src/screens/PricingScreen/utils/FounderCheckpoint.js
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Utility for checking founder availability at strategic navigation points
 * Creates urgency through timely alerts about remaining spots
 */
class FounderCheckpoint {
  /**
   * Check the availability of founder spots and show appropriate alerts
   * @param {object} navigation - React Navigation navigation object
   * @param {string} sourceScreen - The screen name this check is being performed from
   * @returns {Promise<boolean>} - Returns true if spots are available
   */
  static async checkFounderAvailability(navigation, sourceScreen = 'unknown') {
    try {
      // Get latest spot count from API or AsyncStorage
      let spotsRemaining = 0;
      let lastCheckTime = 0;
      
      try {
        // Try to get cached values first
        const cachedSpots = await AsyncStorage.getItem('founderSpotsRemaining');
        const cachedTimestamp = await AsyncStorage.getItem('founderSpotsLastCheck');
        
        if (cachedSpots) spotsRemaining = parseInt(cachedSpots);
        if (cachedTimestamp) lastCheckTime = parseInt(cachedTimestamp);
      } catch (error) {
        console.error('Error reading cached founder spots:', error);
      }
      
      // Check if we need a fresh count (every 15 minutes)
      const currentTime = Date.now();
      const timeSinceLastCheck = currentTime - lastCheckTime;
      const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
      
      // Fetch fresh data if needed
      if (timeSinceLastCheck > REFRESH_INTERVAL || spotsRemaining <= 0) {
        try {
          const response = await fetch('https://8uucuqeys9.execute-api.ap-southeast-2.amazonaws.com/prod/available-spots');
          const data = await response.json();
          
          if (data && data.success && typeof data.availableSpots === 'number') {
            spotsRemaining = data.availableSpots;
            
            // Update cache
            await AsyncStorage.setItem('founderSpotsRemaining', spotsRemaining.toString());
            await AsyncStorage.setItem('founderSpotsLastCheck', currentTime.toString());
          }
        } catch (fetchError) {
          console.error('Error fetching founder spots:', fetchError);
          // Continue with cached data if fetch fails
        }
      }
      
      // Check if user is already a founder (skip alerts)
      const subscriptionStatus = await AsyncStorage.getItem('subscriptionStatus');
      if (subscriptionStatus === 'founding') {
        return true;
      }
      
      // Check if user has seen alerts recently (don't be too annoying)
      const lastAlertTime = await AsyncStorage.getItem('founderAlertLastShown');
      const timeSinceLastAlert = currentTime - (lastAlertTime ? parseInt(lastAlertTime) : 0);
      const ALERT_COOLDOWN = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      // Skip alerts if shown recently, unless spots are critically low
      if (timeSinceLastAlert < ALERT_COOLDOWN && spotsRemaining > 50) {
        return true;
      }
      
      // Handle different availability scenarios
      if (spotsRemaining <= 0) {
        // No spots left - show closed message
        Alert.alert(
          "Founder Spots Filled",
          "All 1,000 founder spots have been claimed. Would you like to join our waitlist for future special offers?",
          [
            { text: "No Thanks", style: "cancel" },
            { 
              text: "Join Waitlist", 
              onPress: () => {
                // Handle waitlist signup
                AsyncStorage.setItem('founderWaitlist', 'true');
              }
            }
          ]
        );
        return false;
      } else if (spotsRemaining <= 50) {
        // Critical availability - show urgent message
        Alert.alert(
          "Final Founder Spots",
          `Only ${spotsRemaining} founder spots remain! These last spots are being claimed quickly and won't be offered again.`,
          [
            { text: "I'll Think About It", style: "cancel" },
            { 
              text: "Secure My Spot Now", 
              onPress: () => {
                navigation.navigate('PricingScreen', { initialTab: 'lifetime' });
              }
            }
          ]
        );
        
        await AsyncStorage.setItem('founderAlertLastShown', currentTime.toString());
        return true;
      } else if (spotsRemaining <= 200) {
        // Low availability - show alert based on source screen
        if (sourceScreen === 'Dashboard' || sourceScreen === 'Settings') {
          Alert.alert(
            "Founder Spots Going Fast",
            `Only ${spotsRemaining} founder spots remain out of 1,000. Claim lifetime access before all spots are gone.`,
            [
              { text: "Not Now", style: "cancel" },
              { 
                text: "Learn More", 
                onPress: () => {
                  navigation.navigate('PricingScreen', { initialTab: 'lifetime' });
                }
              }
            ]
          );
          
          await AsyncStorage.setItem('founderAlertLastShown', currentTime.toString());
        }
        return true;
      } else if (Math.random() < 0.3 && sourceScreen === 'Dashboard') {
        // Random reminder for dashboard views (30% chance)
        // This prevents showing too many alerts while still creating awareness
        Alert.alert(
          "Limited Founder Access",
          `${1000 - spotsRemaining} of 1000 founder spots have already been claimed. Secure lifetime access at our special founder pricing.`,
          [
            { text: "Maybe Later", style: "cancel" },
            { 
              text: "View Offer", 
              onPress: () => {
                navigation.navigate('PricingScreen', { initialTab: 'lifetime' });
              }
            }
          ]
        );
        
        await AsyncStorage.setItem('founderAlertLastShown', currentTime.toString());
      }
      
      return true;
    } catch (error) {
      console.error('Error in founder checkpoint:', error);
      return true; // Default to allowing access if check fails
    }
  }
  
  /**
   * Handle successful founder purchase with achievement recognition
   * @param {object} navigation - React Navigation navigation object
   * @param {number} spotsRemaining - Current number of spots remaining
   * @returns {Promise<void>}
   */
  static async handleSuccessfulFounderPurchase(navigation, spotsRemaining) {
    try {
      // Store purchase details
      await AsyncStorage.setItem('subscriptionStatus', 'founding');
      await AsyncStorage.setItem('referralCode', this.generateReferralCode());
      await AsyncStorage.setItem('referralsRemaining', '3');
      await AsyncStorage.setItem('founderJoinDate', new Date().toISOString());
      
      // Update the founder spots count
      const newSpotsRemaining = spotsRemaining - 1;
      await AsyncStorage.setItem('founderSpotsRemaining', newSpotsRemaining.toString());
      
      // Activate 1 month of free AI
      const currentDate = new Date();
      const expiryDate = new Date(currentDate);
      expiryDate.setMonth(currentDate.getMonth() + 1);
      
      await AsyncStorage.setItem('aiPlan', 'starter');
      await AsyncStorage.setItem('aiPlanExpiry', expiryDate.toISOString());
      
      // Show achievement modal
      setTimeout(() => {
        Alert.alert(
          "🏆 Founder Status Achieved!",
          "Congratulations! You're one of the first 1,000 LifeCompass founders. Your account has been permanently upgraded with lifetime access to all premium features.",
          [
            { 
              text: "Continue to App", 
              onPress: () => navigation.navigate('Dashboard')
            }
          ]
        );
      }, 500);
    } catch (error) {
      console.error('Error processing founder purchase:', error);
    }
  }
  
  /**
   * Generate a random referral code
   * @returns {string} A random 8-character alphanumeric code
   */
  static generateReferralCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export default FounderCheckpoint;
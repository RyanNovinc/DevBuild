// src/services/AdService.js - Rewarded Ads Only Implementation
import { Platform } from 'react-native';

// Country tiers for credit distribution
const COUNTRY_TIERS = {
  'US': 1, 'GB': 1, 'CA': 1, 'AU': 1, 'DE': 1, 'JP': 1,
  'FR': 2, 'IT': 2, 'ES': 2, 'KR': 2, 'AE': 2,
};

// Credits awarded by tier
const CREDITS_BY_TIER = {
  1: 10,  // High-value regions
  2: 5,   // Medium-value regions
  3: 2    // Low-value regions
};

// Real Ad Unit ID from AdMob
const REWARDED_AD_UNIT_IOS = 'ca-app-pub-3464348366745772/3168719626';

// Test Ad Unit IDs from Google
const TEST_AD_UNIT_IOS = 'ca-app-pub-3940256099942544/1712485313';
const TEST_AD_UNIT_ANDROID = 'ca-app-pub-3940256099942544/5224354917';

class AdService {
  constructor() {
    this.initialized = false;
  }
  
  // Initialize service
  async initialize() {
    if (this.initialized) return true;
    
    console.log('[AdService] Initializing...');
    this.initialized = true;
    return true;
  }
  
  // Show a simulated rewarded ad
  async showRewardedAd() {
    try {
      console.log('[AdService] Showing simulated ad...');
      
      // Show simulated ad with delay
      return new Promise(resolve => {
        setTimeout(() => {
          console.log('[AdService] Ad completed successfully');
          resolve({
            completed: true,
            reward: 1
          });
        }, 1500);
      });
    } catch (error) {
      console.log('[AdService] Error:', error);
      return { completed: false, error };
    }
  }
  
  // Get the tier for a country
  getCountryTier(countryCode) {
    return COUNTRY_TIERS[countryCode] || 3;
  }
  
  // Get the number of credits for a tier
  getCreditsForTier(tier) {
    return CREDITS_BY_TIER[tier] || CREDITS_BY_TIER[3];
  }
  
  // Cleanup method
  cleanup() {
    this.initialized = false;
  }
}

export default new AdService();
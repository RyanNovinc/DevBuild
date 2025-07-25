// src/screens/PricingScreen/utils/FounderMessaging.js

/**
 * Utility for consistent, achievement-oriented messaging for founder spots
 * Provides strategic language that appeals to the male 25-35 demographic
 */
class FounderMessaging {
  /**
   * Get urgency-appropriate main message for founder spots based on spots remaining
   * @param {number} spotsRemaining - Number of spots still available
   * @returns {string} Appropriate message
   */
  static getMainMessage(spotsRemaining) {
    if (spotsRemaining <= 50) {
      return `Final opportunity: Only ${spotsRemaining} founder spots remain`;
    } else if (spotsRemaining <= 100) {
      return `Act fast: Only ${spotsRemaining} founder spots left`;
    } else if (spotsRemaining <= 250) {
      return `Limited access: ${spotsRemaining} founder spots available`;
    } else if (spotsRemaining <= 500) {
      return `Exclusive access: Be among the first 1,000 founders`;
    } else {
      return `Join the founding team: Limited to 1,000 early adopters`;
    }
  }

  /**
   * Get achievement-focused CTA text based on urgency level
   * @param {number} spotsRemaining - Number of spots still available
   * @returns {string} CTA text
   */
  static getCtaText(spotsRemaining) {
    if (spotsRemaining <= 50) {
      return 'Secure Your Founder Access Now';
    } else if (spotsRemaining <= 200) {
      return 'Claim Your Founder Status';
    } else {
      return 'Join the Founder\'s Circle';
    }
  }

  /**
   * Get competitive-oriented secondary message based on spots claimed
   * @param {number} spotsClaimed - Number of spots already claimed
   * @param {number} totalSpots - Total available spots
   * @returns {string} Secondary message
   */
  static getCompetitiveMessage(spotsClaimed, totalSpots = 1000) {
    const percentClaimed = Math.floor((spotsClaimed / totalSpots) * 100);
    
    if (percentClaimed >= 90) {
      return `Beat the crowd - only ${totalSpots - spotsClaimed} spots left`;
    } else if (percentClaimed >= 75) {
      return `${percentClaimed}% of founder spots already claimed`;
    } else if (percentClaimed >= 50) {
      return `Join ${spotsClaimed} early adopters who made the smart choice`;
    } else if (percentClaimed >= 25) {
      return `${spotsClaimed} founders have already secured their access`;
    } else {
      return `Be among the first to secure lifetime founder access`;
    }
  }

  /**
   * Get exclusivity-focused benefit message
   * @param {number} spotsRemaining - Number of spots still available
   * @returns {string} Benefit message
   */
  static getBenefitMessage(spotsRemaining) {
    if (spotsRemaining <= 100) {
      return 'Final chance for lifetime access - never pay again';
    } else if (spotsRemaining <= 300) {
      return 'Founder benefits unavailable to regular subscribers';
    } else {
      return 'Permanent premium access other users will pay monthly for';
    }
  }

  /**
   * Get social proof message about other founders
   * @param {number} spotsClaimed - Number of spots already claimed
   * @returns {string} Social proof message
   */
  static getSocialProofMessage(spotsClaimed) {
    if (spotsClaimed >= 900) {
      return `You could be among the final founders to join ${spotsClaimed} others`;
    } else if (spotsClaimed >= 500) {
      return `${spotsClaimed} ambitious users have already claimed their founder status`;
    } else if (spotsClaimed >= 250) {
      return `${spotsClaimed} forward-thinking users have secured lifetime access`;
    } else {
      return `Join the exclusive first ${spotsClaimed} founding members`;
    }
  }

  /**
   * Get status-oriented achievement message
   * @returns {string} Achievement message
   */
  static getAchievementMessage() {
    // Rotate between a few options for variety
    const messages = [
      'Founder status includes permanent recognition badge',
      'Distinguish yourself as an original founder member',
      'Secure privileged position in the LifeCompass community',
      'Founding members receive priority access to all future features'
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get authentic reason for founder limitation
   * @returns {string} Authentic reason
   */
  static getAuthenticReason() {
    return 'We\'re limiting founder access to our first 1,000 users to ensure we can collect quality feedback and build the best possible experience while rewarding early believers in our vision.';
  }

  /**
   * Get time-sensitive message about founder availability
   * @param {string} endDate - ISO date string for the founder offer end date
   * @returns {string} Time-sensitive message
   */
  static getTimeSensitiveMessage(endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 3) {
      return `Final ${daysRemaining} days to claim founder access`;
    } else if (daysRemaining <= 7) {
      return `Less than a week left - offer ends in ${daysRemaining} days`;
    } else if (daysRemaining <= 14) {
      return `Limited time offer - ${daysRemaining} days remaining`;
    } else {
      return `Early access pricing available until ${end.toLocaleDateString()}`;
    }
  }
}

export default FounderMessaging;
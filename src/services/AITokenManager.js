// src/services/AITokenManager.js - Updated for 4-hour window rate limiting with Lambda backend
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth } from 'aws-amplify';

// Import API configuration
import { API_BASE_URL } from '../config/apiConfig';

// Token allocations per 4-hour window based on pricing tiers
const TOKEN_ALLOCATIONS = {
  light: 18750,      // $0.45/month tier: 18,750 tokens per window
  standard: 56250,   // $1.35/month tier: 56,250 tokens per window
  max: 208333        // $5.00/month tier: 208,333 tokens per window
};

// Maximum buffer (3x window allocation)
const MAX_BUFFER = {
  light: 56250,      // 3x light allocation
  standard: 168750,  // 3x standard allocation  
  max: 625000        // 3x max allocation
};

// Conversation length limits (in tokens) - 100k for all tiers
const CONVERSATION_LIMITS = {
  light: 100000,     // ~400,000 characters
  standard: 100000,  // ~400,000 characters  
  max: 100000        // ~400,000 characters
};

// API endpoint for Lambda functions  
const API_ENDPOINT = API_BASE_URL;

// Storage keys for conversation tokens (rate limiting handled by backend)
const STORAGE_KEYS = {
  CONVERSATION_TOKENS: 'ai_conversation_tokens',
  USER_TIER: 'ai_user_tier'
};

class AITokenManager {
  constructor() {
    this.currentTier = 'light';
    this.conversationTokens = {};
    this.cachedWindowStatus = null;
    this.lastWindowCheck = 0;
  }

  // Initialize the manager and load saved state
  async initialize(userTier = 'light') {
    // Map subscription tiers to our internal names
    const tierMapping = {
      'light': 'light',
      'standard': 'standard',
      'max': 'max'
    };
    
    this.currentTier = tierMapping[userTier] || 'light';
    await this.loadState();
    console.log('[TokenManager] Initialized with tier:', this.currentTier);
  }

  // Load saved state from storage
  async loadState() {
    try {
      const [conversations, tier] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.CONVERSATION_TOKENS),
        AsyncStorage.getItem(STORAGE_KEYS.USER_TIER)
      ]);

      this.conversationTokens = conversations ? JSON.parse(conversations) : {};
      if (tier) {
        this.currentTier = tier;
      }

      console.log('[TokenManager] Loaded state:', {
        tier: this.currentTier,
        conversationsCount: Object.keys(this.conversationTokens).length
      });
    } catch (error) {
      console.error('[TokenManager] Error loading state:', error);
    }
  }

  // Save current state to storage
  async saveState() {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.CONVERSATION_TOKENS, JSON.stringify(this.conversationTokens)),
        AsyncStorage.setItem(STORAGE_KEYS.USER_TIER, this.currentTier)
      ]);
    } catch (error) {
      console.error('[TokenManager] Error saving state:', error);
    }
  }

  // Check if user can send a message (calls Lambda function)
  async canSendMessage(messageText = '', estimatedTokens = null) {
    try {
      // Get current user's email
      let userEmail;
      try {
        const user = await Auth.currentAuthenticatedUser();
        userEmail = user.attributes.email;
      } catch (error) {
        console.error('[TokenManager] User not authenticated:', error);
        return { canSend: false, reason: 'Not authenticated' };
      }

      // Calculate estimated tokens if not provided
      let finalEstimatedTokens = estimatedTokens;
      if (!finalEstimatedTokens && messageText) {
        finalEstimatedTokens = this.estimateTokens(messageText) * 3; // Estimate for input + output
      }
      finalEstimatedTokens = finalEstimatedTokens || 1000; // Default

      console.log('[TokenManager] Checking if user can send message:', {
        userEmail,
        messageLength: messageText.length,
        estimatedTokens: finalEstimatedTokens
      });

      // Call the CheckWindowLimits Lambda function
      const response = await fetch(`${API_ENDPOINT}/window-limits/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userEmail,
          estimatedTokens: finalEstimatedTokens,
          messageText: messageText
        })
      });

      if (!response.ok) {
        console.error('[TokenManager] API error:', response.status, response.statusText);
        return { canSend: false, reason: 'API error' };
      }

      const result = await response.json();
      console.log('[TokenManager] Window check result:', result);

      // Cache the result for UI display
      this.cachedWindowStatus = result.rateLimit;
      this.lastWindowCheck = Date.now();

      return {
        canSend: result.canSend,
        reason: result.reason,
        rateLimit: result.rateLimit,
        estimation: result.estimation
      };

    } catch (error) {
      console.error('[TokenManager] Error checking rate limits:', error);
      return { canSend: false, reason: 'Network error' };
    }
  }

  // Get current rate limit status (uses cached data if recent)
  async getRateLimitStatus() {
    try {
      // Use cached data if it's less than 1 minute old
      const now = Date.now();
      if (this.cachedWindowStatus && (now - this.lastWindowCheck) < 60000) {
        return this.cachedWindowStatus;
      }

      // Refresh status
      const checkResult = await this.canSendMessage('', 100); // Small check with minimal tokens
      return checkResult.rateLimit || null;

    } catch (error) {
      console.error('[TokenManager] Error getting rate limit status:', error);
      return null;
    }
  }

  // Track token usage for a message (calls Lambda function)
  async trackTokenUsage(inputTokens, outputTokens, cachedInputTokens = 0) {
    try {
      // Get current user's email
      let userEmail;
      try {
        const user = await Auth.currentAuthenticatedUser();
        userEmail = user.attributes.email;
      } catch (error) {
        console.error('[TokenManager] User not authenticated for token tracking:', error);
        return false;
      }

      console.log('[TokenManager] Tracking token usage:', {
        userEmail,
        inputTokens,
        outputTokens,
        cachedInputTokens
      });

      // Call the TrackCreditUsage Lambda function
      const response = await fetch(`${API_ENDPOINT}/credits/usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userEmail,
          inputTokens,
          outputTokens,
          cachedInputTokens,
          operation: 'deduct'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('[TokenManager] Token tracking failed:', result);
        
        // Check if it's a rate limit error
        if (response.status === 429) {
          // Rate limit exceeded
          return {
            success: false,
            rateLimited: true,
            windowInfo: result.windowInfo
          };
        }
        
        return { success: false, error: result.error };
      }

      console.log('[TokenManager] Token usage tracked successfully:', result);
      
      // Update cached status if available
      if (result.windowInfo) {
        this.cachedWindowStatus = result.windowInfo;
        this.lastWindowCheck = Date.now();
      }

      return {
        success: true,
        cost: result.cost,
        tokenUsage: result.tokenUsage,
        remainingBudget: result.remainingBudget,
        windowInfo: result.windowInfo
      };

    } catch (error) {
      console.error('[TokenManager] Error tracking token usage:', error);
      return { success: false, error: 'Network error' };
    }
  }

  // Get detailed credit balance (calls Lambda function)
  async getCreditBalance(includeHistory = false) {
    try {
      // Get current user's email
      let userEmail;
      try {
        const user = await Auth.currentAuthenticatedUser();
        userEmail = user.attributes.email;
      } catch (error) {
        console.error('[TokenManager] User not authenticated:', error);
        return null;
      }

      console.log('[TokenManager] Getting credit balance for:', userEmail);

      // Call the GetCreditBalance Lambda function
      const response = await fetch(`${API_ENDPOINT}/credits/balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userEmail,
          includeHistory,
          includeWindowInfo: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TokenManager] Credit balance API error:', errorText);
        return null;
      }

      const result = await response.json();
      console.log('[TokenManager] Credit balance retrieved:', result);

      // Update tier based on subscription
      if (result.subscription?.tier) {
        const tierMapping = {
          'light': 'light',
          'standard': 'standard',
          'max': 'max'
        };
        const newTier = tierMapping[result.subscription.tier] || 'light';
        if (newTier !== this.currentTier) {
          await this.updateTier(newTier);
        }
      }

      // Cache rate limit info
      if (result.rateLimit?.currentWindow) {
        this.cachedWindowStatus = result.rateLimit.currentWindow;
        this.lastWindowCheck = Date.now();
      }

      return result;

    } catch (error) {
      console.error('[TokenManager] Error getting credit balance:', error);
      return null;
    }
  }

  // Get conversation token count (local tracking)
  getConversationTokens(conversationId) {
    return this.conversationTokens[conversationId] || 0;
  }

  // Update conversation token count (local tracking)
  async updateConversationTokens(conversationId, tokens) {
    this.conversationTokens[conversationId] = tokens;
    await this.saveState();
  }

  // Check if conversation exceeds limit (local check)
  isConversationAtLimit(conversationId) {
    const tokens = this.getConversationTokens(conversationId);
    const limit = CONVERSATION_LIMITS[this.currentTier] || CONVERSATION_LIMITS.light;
    return tokens >= limit;
  }

  // Get conversation limit for current tier
  getConversationLimit() {
    return CONVERSATION_LIMITS[this.currentTier] || CONVERSATION_LIMITS.light;
  }

  // Get warning threshold (80% of limit) - kept for compatibility
  getConversationWarningThreshold() {
    return Math.floor(this.getConversationLimit() * 0.8);
  }

  // Get progressive warning thresholds
  getConversationWarningThresholds() {
    const limit = this.getConversationLimit();
    return {
      earlyWarning: Math.floor(limit * 0.85),  // 85k tokens
      finalWarning: Math.floor(limit * 0.95),  // 95k tokens
      hardLimit: limit                         // 100k tokens
    };
  }

  // Check conversation warning level
  getConversationWarningLevel(conversationId, newMessageTokens = 0) {
    const currentTokens = this.getConversationTokens(conversationId);
    const totalTokens = currentTokens + newMessageTokens;
    const thresholds = this.getConversationWarningThresholds();

    if (totalTokens >= thresholds.hardLimit) {
      return 'over_limit';
    } else if (totalTokens >= thresholds.finalWarning) {
      return 'final_warning';
    } else if (totalTokens >= thresholds.earlyWarning) {
      return 'early_warning';
    }
    return 'normal';
  }

  // Estimate tokens from text (rough approximation)
  estimateTokens(text) {
    // GPT-4 uses approximately 1 token per 4 characters
    // This is a rough estimate, actual tokenization may vary
    return Math.ceil(text.length / 4);
  }

  // Calculate total tokens for a conversation
  calculateConversationTokens(messages, personalContext = null) {
    let totalTokens = 0;
    
    // Add personal knowledge context (sent with first message)
    if (personalContext) {
      totalTokens += this.estimateTokens(personalContext);
    }
    
    // Add all messages
    for (const message of messages) {
      if (message.text) {
        totalTokens += this.estimateTokens(message.text);
      }
    }
    
    return totalTokens;
  }

  // Get usage statistics (combines backend + local data)
  async getUsageStats() {
    try {
      const creditBalance = await this.getCreditBalance();
      const rateLimitStatus = await this.getRateLimitStatus();
      
      if (!creditBalance || !rateLimitStatus) {
        // Fallback to basic info
        return {
          tier: this.currentTier,
          error: 'Unable to fetch current usage'
        };
      }

      return {
        tier: this.currentTier,
        monthly: creditBalance.monthly,
        window: rateLimitStatus,
        conversationLimits: {
          limit: this.getConversationLimit(),
          warningThreshold: this.getConversationWarningThreshold()
        }
      };

    } catch (error) {
      console.error('[TokenManager] Error getting usage stats:', error);
      return {
        tier: this.currentTier,
        error: 'Failed to fetch usage statistics'
      };
    }
  }

  // Reset conversation tokens (for when conversation is cleared)
  async resetConversationTokens(conversationId) {
    delete this.conversationTokens[conversationId];
    await this.saveState();
  }

  // Update user tier
  async updateTier(newTier) {
    const validTiers = ['light', 'standard', 'max'];
    if (validTiers.includes(newTier)) {
      this.currentTier = newTier;
      await this.saveState();
      console.log('[TokenManager] Tier updated to:', newTier);
    }
  }

  // Get rate limit message for user
  async getRateLimitMessage() {
    try {
      const status = await this.getRateLimitStatus();
      
      if (!status) {
        return null;
      }

      if (status.usage.isAtLimit) {
        return `You've reached your token limit for this window. Resets in ${status.timeUntilReset}.`;
      } else if (status.usage.isNearLimit) {
        return `You're approaching your token limit. ${status.tokens.available} tokens remaining, resets in ${status.timeUntilReset}.`;
      }
      
      return null;

    } catch (error) {
      console.error('[TokenManager] Error getting rate limit message:', error);
      return null;
    }
  }

  // Check if conversation needs truncation based on length
  shouldTruncateConversation(conversationId, newMessageTokens = 0) {
    const currentTokens = this.getConversationTokens(conversationId);
    const totalTokens = currentTokens + newMessageTokens;
    const limit = this.getConversationLimit();
    
    return totalTokens >= limit;
  }

  // Check if conversation should block new messages (ALREADY over limit)
  shouldBlockNewMessage(conversationId) {
    const currentTokens = this.getConversationTokens(conversationId);
    const limit = this.getConversationLimit();
    
    // Block only if ALREADY over the limit (allows "one over" behavior)
    return currentTokens >= limit;
  }

  // Check if message would put conversation over limit (for warnings)
  wouldExceedLimit(conversationId, newMessageTokens = 0) {
    const currentTokens = this.getConversationTokens(conversationId);
    const totalTokens = currentTokens + newMessageTokens;
    const limit = this.getConversationLimit();
    
    return totalTokens >= limit;
  }

  // Get recommended truncation point
  getRecommendedTruncationPoint(conversationId) {
    const limit = this.getConversationLimit();
    // Keep last 60% of the limit to provide context while staying under limit
    return Math.floor(limit * 0.6);
  }

  // Clear all data (for debugging/reset)
  async clearAllData() {
    this.conversationTokens = {};
    this.cachedWindowStatus = null;
    this.lastWindowCheck = 0;
    
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.CONVERSATION_TOKENS),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_TIER)
    ]);
    
    console.log('[TokenManager] All data cleared');
  }
}

// Export singleton instance
const tokenManager = new AITokenManager();
export default tokenManager;
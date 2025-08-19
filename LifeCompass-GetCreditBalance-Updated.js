// UPDATED Lambda function to get user's credit balance with 4-hour window rate limiting info
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize the DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// 4-hour window allocations per tier (in USD)
const WINDOW_ALLOCATIONS = {
  'light': 0.01875,    // $0.45/month ÷ 24 windows = $0.01875 per 4-hour window
  'standard': 0.05625, // $1.35/month ÷ 24 windows = $0.05625 per 4-hour window  
  'max': 0.20833      // $5.00/month ÷ 24 windows = $0.20833 per 4-hour window
};

// Token conversion rate (approximate for mixed usage)
const TOKENS_PER_DOLLAR = 1000000; // 1M tokens per $1 USD

// Maximum buffer (3x window allocation)
const MAX_BUFFER_MULTIPLIER = 3;

// 4-hour window duration in milliseconds
const WINDOW_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

// UTC window start times (12am, 4am, 8am, 12pm, 4pm, 8pm)
const WINDOW_START_HOURS = [0, 4, 8, 12, 16, 20];

/**
 * Get the current 4-hour window start time in UTC
 * @returns {Date} Start time of current window
 */
function getCurrentWindowStart() {
  const now = new Date();
  const currentHour = now.getUTCHours();
  
  // Find the most recent window start hour
  let windowStartHour = 0;
  for (const startHour of WINDOW_START_HOURS) {
    if (currentHour >= startHour) {
      windowStartHour = startHour;
    }
  }
  
  // Create window start time
  const windowStart = new Date();
  windowStart.setUTCHours(windowStartHour, 0, 0, 0);
  
  return windowStart;
}

/**
 * Get the next window start time
 * @returns {Date} Start time of next window
 */
function getNextWindowStart() {
  const currentWindow = getCurrentWindowStart();
  const nextWindow = new Date(currentWindow.getTime() + WINDOW_DURATION_MS);
  return nextWindow;
}

/**
 * Generate window ID for storage (YYYY-MM-DD-HH format)
 * @param {Date} windowStart - Window start time
 * @returns {string} Window ID
 */
function generateWindowId(windowStart) {
  const year = windowStart.getUTCFullYear();
  const month = String(windowStart.getUTCMonth() + 1).padStart(2, '0');
  const day = String(windowStart.getUTCDate()).padStart(2, '0');
  const hour = String(windowStart.getUTCHours()).padStart(2, '0');
  
  return `${year}-${month}-${day}-${hour}`;
}

/**
 * Get current window status and rate limiting info
 * @param {string} userId - User ID
 * @param {string} tier - User's subscription tier
 * @returns {Object} Window status information
 */
async function getCurrentWindowStatus(userId, tier) {
  try {
    const windowAllocation = WINDOW_ALLOCATIONS[tier];
    const maxBuffer = windowAllocation * MAX_BUFFER_MULTIPLIER;
    
    if (!windowAllocation) {
      throw new Error(`Unknown subscription tier: ${tier}`);
    }
    
    // Get current window info
    const windowStart = getCurrentWindowStart();
    const windowId = generateWindowId(windowStart);
    const nextWindowStart = getNextWindowStart();
    
    // Get window usage record
    const windowResponse = await docClient.send(new GetCommand({
      TableName: 'LifeCompass-AICredits',
      Key: { 
        userId,
        billingPeriodId: `window-${windowId}`
      }
    }));
    
    let windowUsage = 0;
    if (windowResponse.Item) {
      windowUsage = windowResponse.Item.creditsUsed || 0;
    }
    
    // Calculate available credits and tokens
    const availableCredits = Math.min(maxBuffer, windowAllocation) - windowUsage;
    const availableTokens = Math.round(availableCredits * TOKENS_PER_DOLLAR);
    const totalWindowTokens = Math.round(windowAllocation * TOKENS_PER_DOLLAR);
    const maxBufferTokens = Math.round(maxBuffer * TOKENS_PER_DOLLAR);
    const usedTokens = Math.round(windowUsage * TOKENS_PER_DOLLAR);
    
    // Calculate time until next reset
    const now = new Date();
    const millisecondsUntilReset = nextWindowStart.getTime() - now.getTime();
    const minutesUntilReset = Math.max(0, Math.ceil(millisecondsUntilReset / (1000 * 60)));
    const hoursUntilReset = Math.floor(minutesUntilReset / 60);
    const remainingMinutes = minutesUntilReset % 60;
    
    // Generate user-friendly countdown
    let timeUntilReset = '';
    if (hoursUntilReset > 0) {
      timeUntilReset = `${hoursUntilReset}h ${remainingMinutes}m`;
    } else {
      timeUntilReset = `${remainingMinutes}m`;
    }
    
    // Calculate usage percentage
    const usagePercentage = Math.min(100, Math.round((windowUsage / windowAllocation) * 100));
    
    return {
      windowId,
      windowStart: windowStart.toISOString(),
      nextReset: nextWindowStart.toISOString(),
      timeUntilReset,
      minutesUntilReset,
      credits: {
        allocated: windowAllocation,
        maxBuffer: maxBuffer,
        used: windowUsage,
        available: availableCredits
      },
      tokens: {
        allocated: totalWindowTokens,
        maxBuffer: maxBufferTokens,
        used: usedTokens,
        available: availableTokens
      },
      usage: {
        percentage: usagePercentage,
        isNearLimit: usagePercentage >= 90,
        isOverLimit: availableCredits <= 0
      }
    };
  } catch (error) {
    console.error('Error getting window status:', error);
    throw error;
  }
}

/**
 * Get a user's credit balance in a user-friendly format with rate limiting info
 */
exports.handler = async (event) => {
  try {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    // Extract user info from Cognito token when available
    let userId;
    
    // First try to get userId from Cognito claims (API Gateway authorizer)
    if (event.requestContext && 
        event.requestContext.authorizer && 
        event.requestContext.authorizer.claims) {
      // Get email from token (primary identifier)
      userId = event.requestContext.authorizer.claims.email;
      console.log(`User identified from Cognito token: ${userId}`);
    } else {
      // Fallback: Get from request body (backward compatibility)
      const requestBody = typeof event.body === 'string' ? 
                          JSON.parse(event.body) : event.body || {};
      userId = requestBody.userId;
      console.log(`User identified from request body: ${userId}`);
    }
    
    // Include history parameter if present in request body
    let includeHistory = false;
    let includeWindowInfo = true; // New parameter for window rate limiting info
    if (event.body) {
      const requestBody = typeof event.body === 'string' ? 
                          JSON.parse(event.body) : event.body;
      includeHistory = requestBody.includeHistory || false;
      includeWindowInfo = requestBody.includeWindowInfo !== false; // Default to true
    }
    
    // Validate inputs
    if (!userId) {
      return formatResponse(400, { error: 'Missing required parameter: userId' });
    }
    
    // Get current month in YYYY-MM format
    const now = new Date();
    const currentMonth = now.toISOString().substring(0, 7);
    
    // Get user's subscription info to determine their tier
    const subscriptionResponse = await docClient.send(new GetCommand({
      TableName: 'LifeCompass-UserSubscriptions',
      Key: { userId }
    }));
    
    if (!subscriptionResponse.Item) {
      return formatResponse(404, { error: 'No active subscription found for user' });
    }
    
    const subscription = subscriptionResponse.Item;
    
    // Get current month's credits
    const creditsResponse = await docClient.send(new GetCommand({
      TableName: 'LifeCompass-AICredits',
      Key: { 
        userId,
        billingPeriodId: currentMonth
      }
    }));
    
    if (!creditsResponse.Item) {
      return formatResponse(404, { error: 'No credit allocation found for current period' });
    }
    
    const credits = creditsResponse.Item;
    
    // Calculate monthly usage percentage
    const totalCredits = credits.currentCredits;
    const usedCredits = credits.creditsUsed;
    const remainingCredits = totalCredits - usedCredits;
    const monthlyPercentUsed = Math.min(100, Math.round((usedCredits / totalCredits) * 100));
    const monthlyPercentRemaining = 100 - monthlyPercentUsed;
    
    // Convert monthly credits to tokens for display
    const monthlyTokensTotal = Math.round(totalCredits * TOKENS_PER_DOLLAR);
    const monthlyTokensUsed = Math.round(usedCredits * TOKENS_PER_DOLLAR);
    const monthlyTokensRemaining = Math.round(remainingCredits * TOKENS_PER_DOLLAR);
    
    // Calculate next refresh date
    const nextRefreshDate = calculateNextRefreshDate(subscription.startDate);
    
    // Generate usage meter for monthly usage
    const monthlyUsageMeter = generateUsageMeter(monthlyPercentUsed);
    
    // Prepare response
    const response = {
      subscription: {
        tier: subscription.subscriptionTier,
        status: subscription.subscriptionStatus,
        billingCycle: subscription.billingCycle
      },
      monthly: {
        credits: {
          total: totalCredits,
          used: usedCredits,
          remaining: remainingCredits
        },
        tokens: {
          total: monthlyTokensTotal,
          used: monthlyTokensUsed,
          remaining: monthlyTokensRemaining
        },
        usage: {
          percentUsed: monthlyPercentUsed,
          percentRemaining: monthlyPercentRemaining,
          usageMeter: monthlyUsageMeter
        }
      },
      refreshInfo: {
        nextRefreshDate: nextRefreshDate.toISOString(),
        daysRemaining: calculateDaysRemaining(nextRefreshDate)
      }
    };
    
    // Include 4-hour window rate limiting information
    if (includeWindowInfo) {
      try {
        const windowStatus = await getCurrentWindowStatus(userId, subscription.subscriptionTier);
        response.rateLimit = {
          currentWindow: windowStatus,
          explanation: `Tokens refresh every 4 hours at: 12am, 4am, 8am, 12pm, 4pm, 8pm UTC`
        };
      } catch (windowError) {
        console.error('Error getting window status:', windowError);
        response.rateLimit = {
          error: 'Failed to get rate limit status'
        };
      }
    }
    
    // Include usage history if requested
    if (includeHistory) {
      // Get usage for last 6 months
      const historyResponse = await docClient.send(new QueryCommand({
        TableName: 'LifeCompass-AICredits',
        KeyConditionExpression: 'userId = :userId AND begins_with(billingPeriodId, :yearPrefix)',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':yearPrefix': now.getFullYear().toString() // Only get current year to avoid window records
        },
        ScanIndexForward: false, // descending order (newest first)
        Limit: 6 // last 6 months
      }));
      
      if (historyResponse.Items && historyResponse.Items.length > 0) {
        // Filter out window records and convert to user-friendly format
        const monthlyRecords = historyResponse.Items.filter(item => 
          !item.billingPeriodId.startsWith('window-')
        );
        
        const history = monthlyRecords.map(item => ({
          period: item.billingPeriodId,
          percentUsed: Math.round((item.creditsUsed / item.currentCredits) * 100),
          usageMeter: generateUsageMeter(Math.round((item.creditsUsed / item.currentCredits) * 100)),
          tokensUsed: Math.round(item.creditsUsed * TOKENS_PER_DOLLAR),
          tokensTotal: Math.round(item.currentCredits * TOKENS_PER_DOLLAR)
        }));
        
        response.history = history;
      }
    }
    
    return formatResponse(200, response);
  } catch (error) {
    console.error('Error getting credit balance:', error);
    return formatResponse(500, {
      error: 'Failed to get credit balance',
      message: error.message
    });
  }
};

/**
 * Generate a visual usage meter using ASCII characters for better compatibility
 * @param {number} percentUsed - Percentage of credits used
 * @returns {string} Visual representation of usage
 */
function generateUsageMeter(percentUsed) {
  const totalBlocks = 10;
  const filledBlocks = Math.max(1, Math.round((percentUsed / 100) * totalBlocks));
  const emptyBlocks = totalBlocks - filledBlocks;
  
  // Using ASCII characters for better compatibility
  const filledChar = '#'; // Hash symbol
  const emptyChar = '-'; // Dash
  
  return filledChar.repeat(filledBlocks) + emptyChar.repeat(emptyBlocks);
}

/**
 * Calculate next refresh date based on subscription start date
 * @param {string} startDateStr - ISO date string of subscription start
 * @returns {Date} Next refresh date
 */
function calculateNextRefreshDate(startDateStr) {
  const startDate = new Date(startDateStr);
  const now = new Date();
  
  // Clone the start date
  const refreshDate = new Date(startDate);
  
  // Set to same day next month
  refreshDate.setMonth(now.getMonth() + 1);
  
  // If start date is 31st and next month doesn't have 31 days, use last day of month
  if (startDate.getDate() > 28) {
    // Set to 1st of month after
    refreshDate.setMonth(refreshDate.getMonth() + 1, 0);
  }
  
  return refreshDate;
}

/**
 * Calculate days remaining until next refresh
 * @param {Date} nextRefreshDate - Next refresh date
 * @returns {number} Days remaining
 */
function calculateDaysRemaining(nextRefreshDate) {
  const now = new Date();
  const diffTime = nextRefreshDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Helper function to format response
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
}
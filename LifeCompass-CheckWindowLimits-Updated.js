// UPDATED Lambda function to check 4-hour window rate limits with simple 10k warning threshold
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize the DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// 4-hour window allocations per tier (in USD)
const WINDOW_ALLOCATIONS = {
  'light': 0.01875,    // $0.45/month ÷ 24 windows = $0.01875 per 4-hour window
  'standard': 0.05625, // $1.35/month ÷ 24 windows = $0.05625 per 4-hour window  
  'max': 0.20833      // $5.00/month ÷ 24 windows = $0.20833 per 4-hour window
};

// Maximum buffer (3x window allocation)
const MAX_BUFFER_MULTIPLIER = 3;

// Token conversion rate (approximate for mixed usage)
const TOKENS_PER_DOLLAR = 1000000; // 1M tokens per $1 USD

// Warning threshold - show warning when 10k tokens remaining
const WARNING_BUFFER = 10000;

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
 * Estimate token cost in USD based on typical usage patterns
 * @param {number} estimatedTokens - Estimated tokens for the request
 * @returns {number} Estimated cost in USD
 */
function estimateTokenCost(estimatedTokens) {
  // Assume 50% input, 50% output for typical conversation
  // This is a rough estimate for pre-checking limits
  const inputTokens = estimatedTokens * 0.5;
  const outputTokens = estimatedTokens * 0.5;
  
  // Use current pricing (these should match your LifeCompass-APIPricing table)
  const inputPrice = 0.0006; // per 1000 tokens
  const outputPrice = 0.0024; // per 1000 tokens
  
  const inputCost = (inputTokens / 1000) * inputPrice;
  const outputCost = (outputTokens / 1000) * outputPrice;
  
  return inputCost + outputCost;
}

/**
 * Check if user can send a message with estimated token count
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
    
    // Parse request body
    const requestBody = typeof event.body === 'string' ? 
                        JSON.parse(event.body) : event.body || {};
    
    const { 
      estimatedTokens = 1000, // Default to 1000 tokens if not provided
      messageText = '' // Optional: for better estimation based on text length
    } = requestBody;
    
    // Validate inputs
    if (!userId) {
      return formatResponse(400, { error: 'Missing required parameter: userId' });
    }
    
    // If messageText is provided, estimate tokens from text length
    let finalEstimatedTokens = estimatedTokens;
    if (messageText && messageText.trim()) {
      // Rough estimation: 4 characters = 1 token
      // For conversation, we need to estimate both input and AI response
      const inputTokens = Math.ceil(messageText.length / 4);
      const expectedOutputTokens = inputTokens * 2; // AI responses are typically 2x input length
      finalEstimatedTokens = inputTokens + expectedOutputTokens;
    }
    
    console.log(`Checking window limits for ${userId} with ${finalEstimatedTokens} estimated tokens`);
    
    // Get user subscription tier
    const subscriptionResponse = await docClient.send(new GetCommand({
      TableName: 'LifeCompass-UserSubscriptions',
      Key: { userId }
    }));
    
    if (!subscriptionResponse.Item) {
      return formatResponse(404, { 
        error: 'No active subscription found',
        canSend: false,
        reason: 'No subscription'
      });
    }
    
    const tier = subscriptionResponse.Item.subscriptionTier;
    const windowAllocation = WINDOW_ALLOCATIONS[tier];
    const maxBuffer = windowAllocation * MAX_BUFFER_MULTIPLIER;
    
    if (!windowAllocation) {
      return formatResponse(400, { 
        error: `Unknown subscription tier: ${tier}`,
        canSend: false,
        reason: 'Invalid tier'
      });
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
    
    // Calculate available credits
    const availableCredits = Math.min(maxBuffer, windowAllocation) - windowUsage;
    
    // Estimate cost for the request
    const estimatedCost = estimateTokenCost(finalEstimatedTokens);
    
    // Check if request can be sent
    const canSend = availableCredits >= estimatedCost;
    
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
    
    // Convert to tokens for user-friendly display
    const availableTokens = Math.round(availableCredits * TOKENS_PER_DOLLAR);
    const windowTokens = Math.round(windowAllocation * TOKENS_PER_DOLLAR);
    const maxBufferTokens = Math.round(maxBuffer * TOKENS_PER_DOLLAR);
    const usedTokens = Math.round(windowUsage * TOKENS_PER_DOLLAR);
    
    // Simple warning logic: warn when 10k tokens remaining
    const isNearLimit = availableTokens <= WARNING_BUFFER;
    const isAtLimit = !canSend;
    
    console.log(`Window check result: canSend=${canSend}, available=${availableTokens} tokens, estimated=${finalEstimatedTokens} tokens, nearLimit=${isNearLimit}`);
    
    return formatResponse(200, {
      canSend,
      reason: canSend ? 'Within rate limits' : 'Rate limit exceeded',
      estimation: {
        inputTokens: Math.ceil(finalEstimatedTokens * 0.33), // Roughly 1/3 input
        outputTokens: Math.ceil(finalEstimatedTokens * 0.67), // Roughly 2/3 output
        totalTokens: finalEstimatedTokens,
        estimatedCost
      },
      rateLimit: {
        tier,
        windowId,
        windowStart: windowStart.toISOString(),
        nextReset: nextWindowStart.toISOString(),
        timeUntilReset,
        minutesUntilReset,
        tokens: {
          allocated: windowTokens,
          maxBuffer: maxBufferTokens,
          used: usedTokens,
          available: availableTokens
        },
        usage: {
          isNearLimit: isNearLimit,
          isAtLimit: isAtLimit,
          warningThreshold: WARNING_BUFFER
        }
      }
    });
    
  } catch (error) {
    console.error('Error checking window limits:', error);
    return formatResponse(500, {
      error: 'Failed to check rate limits',
      message: error.message,
      canSend: false,
      reason: 'System error'
    });
  }
};

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
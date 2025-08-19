// UPDATED Lambda function to track AI credit usage with 4-hour window rate limiting
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require('@aws-sdk/lib-dynamodb');

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
 * Check if user has enough credits in current window
 * @param {string} userId - User ID
 * @param {number} requestCost - Cost of the request in USD
 * @returns {Object} Window status and allowance info
 */
async function checkWindowLimits(userId, requestCost) {
  try {
    // Get user subscription tier
    const subscriptionResponse = await docClient.send(new GetCommand({
      TableName: 'LifeCompass-UserSubscriptions',
      Key: { userId }
    }));
    
    if (!subscriptionResponse.Item) {
      return {
        allowed: false,
        error: 'No active subscription found',
        insufficientFunds: true
      };
    }
    
    const tier = subscriptionResponse.Item.subscriptionTier;
    const windowAllocation = WINDOW_ALLOCATIONS[tier];
    const maxBuffer = windowAllocation * MAX_BUFFER_MULTIPLIER;
    
    if (!windowAllocation) {
      return {
        allowed: false,
        error: `Unknown subscription tier: ${tier}`,
        insufficientFunds: true
      };
    }
    
    // Get current window info
    const windowStart = getCurrentWindowStart();
    const windowId = generateWindowId(windowStart);
    const nextWindowStart = getNextWindowStart();
    
    // Get or create window usage record
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
    
    // Calculate available credits (considering buffer from previous windows)
    const availableCredits = Math.min(maxBuffer, windowAllocation) - windowUsage;
    
    console.log(`Window check for ${userId}: Tier=${tier}, Window=${windowId}, Used=${windowUsage}, Available=${availableCredits}, Request=${requestCost}`);
    
    if (availableCredits < requestCost) {
      return {
        allowed: false,
        error: 'Rate limit exceeded for current window',
        windowInfo: {
          windowId,
          tier,
          windowAllocation,
          maxBuffer,
          windowUsage,
          availableCredits,
          nextReset: nextWindowStart.toISOString(),
          minutesUntilReset: Math.ceil((nextWindowStart.getTime() - Date.now()) / (1000 * 60))
        },
        insufficientFunds: true
      };
    }
    
    return {
      allowed: true,
      windowInfo: {
        windowId,
        tier,
        windowAllocation,
        maxBuffer,
        windowUsage,
        availableCredits,
        nextReset: nextWindowStart.toISOString(),
        minutesUntilReset: Math.ceil((nextWindowStart.getTime() - Date.now()) / (1000 * 60))
      }
    };
  } catch (error) {
    console.error('Error checking window limits:', error);
    return {
      allowed: false,
      error: 'Failed to check rate limits',
      insufficientFunds: true
    };
  }
}

/**
 * Track AI credit usage for a user with 4-hour window rate limiting
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
    
    // Parse request body to get other parameters
    const requestBody = typeof event.body === 'string' ? 
                        JSON.parse(event.body) : event.body || {};
    
    const { 
      inputTokens, 
      outputTokens, 
      cachedInputTokens = 0, // New parameter for cached input tokens
      operation = 'deduct' 
    } = requestBody;
    
    // Calculate regular input tokens (total - cached)
    const regularInputTokens = (inputTokens || 0) - (cachedInputTokens || 0);
    
    console.log(`Input tokens: ${inputTokens}, Cached: ${cachedInputTokens}, Regular: ${regularInputTokens}`);
    
    // Validate inputs
    if (!userId) {
      return formatResponse(400, { error: 'Missing required parameter: userId' });
    }
    
    // Fetch current pricing from DynamoDB
    console.log('Fetching current pricing from DynamoDB');
    const pricingResponse = await docClient.send(new GetCommand({
      TableName: 'LifeCompass-APIPricing',
      Key: { model: 'gpt-4o-mini' }
    }));
    
    if (!pricingResponse.Item) {
      console.error('Pricing information not found for gpt-4o-mini');
      return formatResponse(500, { error: 'Pricing information not available' });
    }
    
    const pricing = pricingResponse.Item;
    console.log('Current pricing:', pricing);
    
    // Handle different operations
    if (operation === 'check') {
      // Just return rate limit status without deducting
      const windowCheck = await checkWindowLimits(userId, 0);
      return formatResponse(200, {
        rateLimitCheck: windowCheck
      });
    }
    
    if (operation === 'checkCost') {
      // Calculate cost and check if allowed without deducting
      if ((inputTokens === undefined && cachedInputTokens === undefined) || outputTokens === undefined) {
        return formatResponse(400, { error: 'For checkCost operation, input tokens and outputTokens are required' });
      }
      
      const regularInputCost = (regularInputTokens / 1000) * pricing.inputTokenPrice;
      const cachedInputCost = (cachedInputTokens / 1000) * pricing.cachedInputTokenPrice;
      const outputCost = (outputTokens / 1000) * pricing.outputTokenPrice;
      const totalCost = regularInputCost + cachedInputCost + outputCost;
      
      const windowCheck = await checkWindowLimits(userId, totalCost);
      
      return formatResponse(200, {
        estimatedCost: {
          regularInput: regularInputCost,
          cachedInput: cachedInputCost,
          output: outputCost,
          total: totalCost
        },
        rateLimitCheck: windowCheck
      });
    }
    
    if (operation === 'deduct') {
      // Validate required parameters for deduction
      if ((inputTokens === undefined && cachedInputTokens === undefined) || outputTokens === undefined) {
        return formatResponse(400, { error: 'For deduct operation, input tokens and outputTokens are required' });
      }
      
      // Calculate costs
      const regularInputCost = (regularInputTokens / 1000) * pricing.inputTokenPrice;
      const cachedInputCost = (cachedInputTokens / 1000) * pricing.cachedInputTokenPrice;
      const outputCost = (outputTokens / 1000) * pricing.outputTokenPrice;
      const totalCost = regularInputCost + cachedInputCost + outputCost;
      
      console.log(`Calculated costs: Regular Input: ${regularInputCost.toFixed(6)}, Cached Input: ${cachedInputCost.toFixed(6)}, Output: ${outputCost.toFixed(6)}, Total: ${totalCost.toFixed(6)}`);
      
      // Check 4-hour window limits FIRST
      const windowCheck = await checkWindowLimits(userId, totalCost);
      if (!windowCheck.allowed) {
        console.log('Request blocked by 4-hour window rate limit');
        return formatResponse(429, { // 429 = Too Many Requests
          error: windowCheck.error,
          rateLimitExceeded: true,
          windowInfo: windowCheck.windowInfo,
          estimatedCost: {
            regularInput: regularInputCost,
            cachedInput: cachedInputCost,
            output: outputCost,
            total: totalCost
          }
        });
      }
      
      // Check monthly budget (existing logic)
      const now = new Date();
      const currentMonth = now.toISOString().substring(0, 7);
      
      const budgetResponse = await docClient.send(new GetCommand({
        TableName: 'LifeCompass-AICredits',
        Key: { 
          userId,
          billingPeriodId: currentMonth
        }
      }));
      
      // If no monthly record found, user might not have an active subscription
      if (!budgetResponse.Item) {
        console.log(`No monthly budget found for user ${userId} in period ${currentMonth}`);
        return formatResponse(404, { 
          error: 'No budget found for current billing period',
          insufficientFunds: true
        });
      }
      
      const userBudget = budgetResponse.Item;
      const remainingBudget = userBudget.currentCredits - userBudget.creditsUsed;
      
      // Check monthly budget
      if (remainingBudget < totalCost) {
        console.log(`Insufficient monthly funds: ${remainingBudget.toFixed(6)} < ${totalCost.toFixed(6)}`);
        return formatResponse(403, { 
          error: 'Insufficient monthly funds for this request',
          remainingBudget,
          requestCost: totalCost,
          insufficientFunds: true
        });
      }
      
      // Update monthly usage
      const updateMonthlyResponse = await docClient.send(new UpdateCommand({
        TableName: 'LifeCompass-AICredits',
        Key: { 
          userId,
          billingPeriodId: currentMonth
        },
        UpdateExpression: 'SET creditsUsed = creditsUsed + :cost, lastUpdated = :now',
        ExpressionAttributeValues: {
          ':cost': totalCost,
          ':now': now.toISOString()
        },
        ReturnValues: 'ALL_NEW'
      }));
      
      // Update 4-hour window usage
      const windowStart = getCurrentWindowStart();
      const windowId = generateWindowId(windowStart);
      const windowBillingPeriodId = `window-${windowId}`;
      
      try {
        // Try to update existing window record
        const updateWindowResponse = await docClient.send(new UpdateCommand({
          TableName: 'LifeCompass-AICredits',
          Key: { 
            userId,
            billingPeriodId: windowBillingPeriodId
          },
          UpdateExpression: 'SET creditsUsed = if_not_exists(creditsUsed, :zero) + :cost, lastUpdated = :now, windowStart = :windowStart',
          ExpressionAttributeValues: {
            ':cost': totalCost,
            ':now': now.toISOString(),
            ':windowStart': windowStart.toISOString(),
            ':zero': 0
          },
          ReturnValues: 'ALL_NEW'
        }));
        
        console.log(`Window usage updated for ${windowBillingPeriodId}`);
      } catch (windowError) {
        console.error('Error updating window usage:', windowError);
        // Continue execution - monthly tracking is more critical
      }
      
      const updatedBudget = updateMonthlyResponse.Attributes;
      const newRemainingBudget = updatedBudget.currentCredits - updatedBudget.creditsUsed;
      
      console.log(`Usage tracked successfully. Monthly remaining: ${newRemainingBudget.toFixed(6)}`);
      
      return formatResponse(200, {
        message: 'Usage tracked successfully',
        cost: {
          regularInput: regularInputCost,
          cachedInput: cachedInputCost,
          output: outputCost,
          total: totalCost
        },
        tokenUsage: {
          regularInputTokens,
          cachedInputTokens,
          outputTokens,
          totalTokens: regularInputTokens + cachedInputTokens + outputTokens
        },
        remainingBudget: newRemainingBudget,
        windowInfo: windowCheck.windowInfo
      });
    }
    
    return formatResponse(400, { error: 'Invalid operation. Use check, checkCost, or deduct.' });
    
  } catch (error) {
    console.error('Error tracking usage:', error);
    return formatResponse(500, {
      error: 'Failed to track usage',
      message: error.message
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
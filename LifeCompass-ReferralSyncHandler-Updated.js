// Enhanced Lambda Function for LifeCompass Referral System
// Updated to award AI Light months instead of credits
// This function handles all referral business logic including validation, conversions, and AI Light rewards

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: 'ap-southeast-2' });
const docClient = DynamoDBDocumentClient.from(client);

// Table names
const TABLES = {
  FOUNDER_CODES: 'LifeCompassFounderCodes',
  REFERRALS: 'LifeCompass-Referrals',
  USERS: 'LifeCompass-Users',
  CONVERSIONS: 'LifeCompass-ReferralConversions',
  AI_LIGHT_REWARDS: 'LifeCompass-AILightRewards' // Updated table name for AI Light months
};

// Business logic constants
const REFERRAL_LIMITS = {
  DEFAULT: 3,
  STREAK_90_DAYS: 4,
  STREAK_180_DAYS: 5
};

const AI_LIGHT_REWARD_MONTHS = 1; // Each successful referral awards 1 month of AI Light

exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Handle CORS
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'CORS preflight successful' })
      };
    }

    // Extract path and method
    const path = event.path || event.pathParameters?.proxy || '/';
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    console.log(`Processing ${method} request to ${path}`);

    // Route requests
    switch (path) {
      case '/health':
        return handleHealthCheck(headers);
        
      case '/validate-referral-code':
        if (method === 'POST') {
          return await handleValidateReferralCode(body, headers);
        }
        break;
        
      case '/sync-referral-code':
        if (method === 'POST') {
          return await handleSyncReferralCode(body, headers);
        }
        break;
        
      case '/record-conversion':
        if (method === 'POST') {
          return await handleRecordConversion(body, headers);
        }
        break;
        
      case '/get-referral-stats':
        if (method === 'GET') {
          return await handleGetReferralStats(event.queryStringParameters, headers);
        }
        break;
        
      case '/get-ai-light-rewards':
        if (method === 'GET') {
          return await handleGetAILightRewards(event.queryStringParameters, headers);
        }
        break;
        
      case '/redeem-ai-light':
        if (method === 'POST') {
          return await handleRedeemAILight(body, headers);
        }
        break;
        
      case '/link-account':
        if (method === 'POST') {
          return await handleLinkAccount(body, headers);
        }
        break;

      default:
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            success: false, 
            error: `Path not found: ${path}` 
          })
        };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: `Method ${method} not allowed for ${path}` 
      })
    };

  } catch (error) {
    console.error('Lambda error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      })
    };
  }
};

// Health check endpoint
function handleHealthCheck(headers) {
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ 
      success: true, 
      message: 'LifeCompass Referral Service is healthy (AI Light Edition)',
      timestamp: new Date().toISOString()
    })
  };
}

// Generate referral codes for a user when they buy the app
async function generateReferralCodes(deviceId, userId = null, count = 3) {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = generateUniqueCode();
    const referralData = {
      code: code,
      ownerDeviceId: deviceId,
      ownerUserId: userId,
      createdAt: new Date().toISOString(),
      isActive: true,
      usedBy: null,
      usedAt: null,
      conversions: 0,
      maxConversions: 1 // Each code can only be used once
    };
    
    await docClient.send(new PutCommand({
      TableName: TABLES.REFERRALS,
      Item: referralData
    }));
    
    codes.push(code);
  }
  
  return codes;
}

// Generate a unique referral code
function generateUniqueCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate a referral code
async function handleValidateReferralCode(body, headers) {
  try {
    const { code, deviceId, deviceFingerprint } = body;
    
    if (!code || !deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: code, deviceId' 
        })
      };
    }

    // Get referral code from database
    const result = await docClient.send(new GetCommand({
      TableName: TABLES.REFERRALS,
      Key: { code: code.toUpperCase() }
    }));

    if (!result.Item) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Referral code not found' 
        })
      };
    }

    const referralData = result.Item;

    // Check if code is active
    if (!referralData.isActive) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Referral code is no longer active' 
        })
      };
    }

    // Check if code has already been used
    if (referralData.usedBy) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Referral code has already been used' 
        })
      };
    }

    // Check if user is trying to use their own code
    if (referralData.ownerDeviceId === deviceId) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'You cannot use your own referral code' 
        })
      };
    }

    // Check if user has already bought the app (should be done client-side but double-check)
    const userResult = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { deviceId: deviceId }
    }));

    if (userResult.Item && userResult.Item.hasPurchasedApp) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Users who have already purchased the app cannot use referral codes' 
        })
      };
    }

    // Code is valid
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        referralData: {
          code: referralData.code,
          ownerDeviceId: referralData.ownerDeviceId,
          createdAt: referralData.createdAt
        }
      })
    };

  } catch (error) {
    console.error('Error validating referral code:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error during validation' 
      })
    };
  }
}

// Sync referral code (store the referral code input by user)
async function handleSyncReferralCode(body, headers) {
  try {
    const { deviceId, deviceFingerprint, code, userIdentifier } = body;
    
    if (!deviceId || !code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: deviceId, code' 
        })
      };
    }

    // First validate the code
    const validation = await handleValidateReferralCode({ code, deviceId, deviceFingerprint }, headers);
    const validationResult = JSON.parse(validation.body);
    
    if (!validationResult.success) {
      return validation; // Return the validation error
    }

    // Store the referral code input for this user
    const userData = {
      deviceId: deviceId,
      deviceFingerprint: deviceFingerprint,
      enteredReferralCode: code.toUpperCase(),
      enteredAt: new Date().toISOString(),
      userIdentifier: userIdentifier,
      hasPurchasedApp: false,
      conversionRecorded: false
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: userData
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Referral code synced successfully' 
      })
    };

  } catch (error) {
    console.error('Error syncing referral code:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error during sync' 
      })
    };
  }
}

// Record a referral conversion (when user buys the app)
async function handleRecordConversion(body, headers) {
  try {
    const { referralCode, purchaserDeviceId, deviceFingerprint } = body;
    
    if (!purchaserDeviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required field: purchaserDeviceId' 
        })
      };
    }

    // Get user data to see if they entered a referral code
    const userResult = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { deviceId: purchaserDeviceId }
    }));

    let actualReferralCode = referralCode;
    
    // If no referral code provided, check if user has one stored
    if (!actualReferralCode && userResult.Item && userResult.Item.enteredReferralCode) {
      actualReferralCode = userResult.Item.enteredReferralCode;
    }

    // Update user purchase status
    await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { deviceId: purchaserDeviceId },
      UpdateExpression: 'SET hasPurchasedApp = :purchased, purchasedAt = :purchasedAt',
      ExpressionAttributeValues: {
        ':purchased': true,
        ':purchasedAt': new Date().toISOString()
      }
    }));

    // If user used a referral code, process the conversion
    if (actualReferralCode) {
      await processReferralConversion(actualReferralCode, purchaserDeviceId, deviceFingerprint);
      
      // Generate referral codes for the new user (they can now refer others)
      const referralCodes = await generateReferralCodes(purchaserDeviceId, null, REFERRAL_LIMITS.DEFAULT);
      
      // Store user's referral codes
      await docClient.send(new UpdateCommand({
        TableName: TABLES.USERS,
        Key: { deviceId: purchaserDeviceId },
        UpdateExpression: 'SET referralCodes = :codes, referralLimit = :limit, referralsUsed = :used',
        ExpressionAttributeValues: {
          ':codes': referralCodes,
          ':limit': REFERRAL_LIMITS.DEFAULT,
          ':used': 0
        }
      }));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Conversion recorded successfully',
        referralProcessed: !!actualReferralCode
      })
    };

  } catch (error) {
    console.error('Error recording conversion:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error during conversion recording' 
      })
    };
  }
}

// Process referral conversion and award AI Light months to both users
async function processReferralConversion(referralCode, purchaserDeviceId, deviceFingerprint) {
  try {
    // Get referral data
    const referralResult = await docClient.send(new GetCommand({
      TableName: TABLES.REFERRALS,
      Key: { code: referralCode.toUpperCase() }
    }));

    if (!referralResult.Item) {
      throw new Error('Referral code not found during conversion');
    }

    const referralData = referralResult.Item;
    const referrerDeviceId = referralData.ownerDeviceId;

    // Mark referral code as used
    await docClient.send(new UpdateCommand({
      TableName: TABLES.REFERRALS,
      Key: { code: referralCode.toUpperCase() },
      UpdateExpression: 'SET usedBy = :usedBy, usedAt = :usedAt, conversions = conversions + :inc',
      ExpressionAttributeValues: {
        ':usedBy': purchaserDeviceId,
        ':usedAt': new Date().toISOString(),
        ':inc': 1
      }
    }));

    // Create conversion record
    const conversionId = `${referralCode}-${purchaserDeviceId}-${Date.now()}`;
    const conversionData = {
      conversionId: conversionId,
      referralCode: referralCode.toUpperCase(),
      referrerDeviceId: referrerDeviceId,
      purchaserDeviceId: purchaserDeviceId,
      purchaserFingerprint: deviceFingerprint,
      convertedAt: new Date().toISOString(),
      aiLightMonthsAwarded: AI_LIGHT_REWARD_MONTHS,
      rewardType: 'AI_LIGHT_MONTHLY'
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.CONVERSIONS,
      Item: conversionData
    }));

    // Award AI Light months to both users
    const aiLightRewardData = {
      monthsAwarded: AI_LIGHT_REWARD_MONTHS,
      rewardType: 'AI_LIGHT_MONTHLY',
      createdAt: new Date().toISOString(),
      isRedeemed: false,
      conversionId: conversionId,
      expiresAt: new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)).toISOString() // Expires in 1 year
    };

    // AI Light months for referrer
    await docClient.send(new PutCommand({
      TableName: TABLES.AI_LIGHT_REWARDS,
      Item: {
        ...aiLightRewardData,
        rewardId: `${conversionId}-referrer`,
        deviceId: referrerDeviceId,
        rewardSource: 'REFERRAL_REWARD',
        description: `${AI_LIGHT_REWARD_MONTHS} month${AI_LIGHT_REWARD_MONTHS > 1 ? 's' : ''} of AI Light for successful referral`
      }
    }));

    // AI Light months for purchaser (referee)
    await docClient.send(new PutCommand({
      TableName: TABLES.AI_LIGHT_REWARDS,
      Item: {
        ...aiLightRewardData,
        rewardId: `${conversionId}-referee`,
        deviceId: purchaserDeviceId,
        rewardSource: 'REFERRAL_BONUS',
        description: `${AI_LIGHT_REWARD_MONTHS} month${AI_LIGHT_REWARD_MONTHS > 1 ? 's' : ''} of AI Light for using referral code`
      }
    }));

    // Update referrer's stats
    await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { deviceId: referrerDeviceId },
      UpdateExpression: 'ADD referralsUsed :inc SET lastConversionAt = :timestamp',
      ExpressionAttributeValues: {
        ':inc': 1,
        ':timestamp': new Date().toISOString()
      }
    }));

    console.log(`Referral conversion processed with AI Light rewards: ${conversionId}`);
    return conversionData;

  } catch (error) {
    console.error('Error processing referral conversion:', error);
    throw error;
  }
}

// Get user referral statistics
async function handleGetReferralStats(queryParams, headers) {
  try {
    const deviceId = queryParams?.deviceId;
    
    if (!deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required parameter: deviceId' 
        })
      };
    }

    // Get user data
    const userResult = await docClient.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { deviceId: deviceId }
    }));

    if (!userResult.Item) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          stats: {
            referralCodes: [],
            referralLimit: 0,
            referralsUsed: 0,
            availableAILightMonths: 0
          }
        })
      };
    }

    const userData = userResult.Item;

    // Get available AI Light rewards for this user
    const aiLightResult = await docClient.send(new QueryCommand({
      TableName: TABLES.AI_LIGHT_REWARDS,
      IndexName: 'DeviceIdIndex', // You'll need to create this GSI
      KeyConditionExpression: 'deviceId = :deviceId',
      FilterExpression: 'isRedeemed = :notRedeemed',
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
        ':notRedeemed': false
      }
    }));

    // Calculate total available AI Light months
    const totalAILightMonths = (aiLightResult.Items || []).reduce((total, reward) => {
      return total + (reward.monthsAwarded || 0);
    }, 0);

    const stats = {
      referralCodes: userData.referralCodes || [],
      referralLimit: userData.referralLimit || 0,
      referralsUsed: userData.referralsUsed || 0,
      availableAILightMonths: totalAILightMonths,
      aiLightRewards: aiLightResult.Items || [],
      hasPurchasedApp: userData.hasPurchasedApp || false
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        stats: stats
      })
    };

  } catch (error) {
    console.error('Error getting referral stats:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error getting stats' 
      })
    };
  }
}

// Get available AI Light rewards for a user
async function handleGetAILightRewards(queryParams, headers) {
  try {
    const deviceId = queryParams?.deviceId;
    
    if (!deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required parameter: deviceId' 
        })
      };
    }

    // Query unredeemed AI Light rewards for this device
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.AI_LIGHT_REWARDS,
      IndexName: 'DeviceIdIndex', // You'll need to create this GSI
      KeyConditionExpression: 'deviceId = :deviceId',
      FilterExpression: 'isRedeemed = :notRedeemed AND expiresAt > :now',
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
        ':notRedeemed': false,
        ':now': new Date().toISOString()
      }
    }));

    // Calculate total months available
    const totalMonths = (result.Items || []).reduce((total, reward) => {
      return total + (reward.monthsAwarded || 0);
    }, 0);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        totalAILightMonths: totalMonths,
        rewards: result.Items || []
      })
    };

  } catch (error) {
    console.error('Error getting AI Light rewards:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error getting AI Light rewards' 
      })
    };
  }
}

// Redeem AI Light months (activate subscription)
async function handleRedeemAILight(body, headers) {
  try {
    const { rewardId, deviceId, userId, monthsToRedeem } = body;
    
    if (!rewardId || !deviceId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: rewardId, deviceId' 
        })
      };
    }

    // Find the specific reward
    const rewardResult = await docClient.send(new GetCommand({
      TableName: TABLES.AI_LIGHT_REWARDS,
      Key: { rewardId: rewardId }
    }));

    if (!rewardResult.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'AI Light reward not found' 
        })
      };
    }

    const reward = rewardResult.Item;

    // Verify the reward belongs to this device
    if (reward.deviceId !== deviceId) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Reward does not belong to this device' 
        })
      };
    }

    // Check if already redeemed
    if (reward.isRedeemed) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Reward has already been redeemed' 
        })
      };
    }

    // Check if expired
    if (new Date(reward.expiresAt) < new Date()) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Reward has expired' 
        })
      };
    }

    // Calculate subscription end date
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date(subscriptionStartDate);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + reward.monthsAwarded);

    // Mark reward as redeemed
    await docClient.send(new UpdateCommand({
      TableName: TABLES.AI_LIGHT_REWARDS,
      Key: { rewardId: rewardId },
      UpdateExpression: 'SET isRedeemed = :redeemed, redeemedAt = :timestamp, redeemedForUserId = :userId, subscriptionStartDate = :startDate, subscriptionEndDate = :endDate',
      ExpressionAttributeValues: {
        ':redeemed': true,
        ':timestamp': new Date().toISOString(),
        ':userId': userId,
        ':startDate': subscriptionStartDate.toISOString(),
        ':endDate': subscriptionEndDate.toISOString()
      }
    }));

    // Update user's AI Light subscription status
    await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { deviceId: deviceId },
      UpdateExpression: 'SET aiLightSubscriptionActive = :active, aiLightSubscriptionEnd = :endDate, lastAILightRedemption = :timestamp',
      ExpressionAttributeValues: {
        ':active': true,
        ':endDate': subscriptionEndDate.toISOString(),
        ':timestamp': new Date().toISOString()
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `${reward.monthsAwarded} month${reward.monthsAwarded > 1 ? 's' : ''} of AI Light activated`,
        subscriptionEndDate: subscriptionEndDate.toISOString(),
        monthsActivated: reward.monthsAwarded,
        rewardId: rewardId
      })
    };

  } catch (error) {
    console.error('Error redeeming AI Light:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error during AI Light redemption' 
      })
    };
  }
}

// Link anonymous user to real account
async function handleLinkAccount(body, headers) {
  try {
    const { deviceId, userId, email } = body;
    
    if (!deviceId || !userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: deviceId, userId' 
        })
      };
    }

    // Update user record with real account info
    await docClient.send(new UpdateCommand({
      TableName: TABLES.USERS,
      Key: { deviceId: deviceId },
      UpdateExpression: 'SET userId = :userId, email = :email, linkedAt = :timestamp',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':email': email,
        ':timestamp': new Date().toISOString()
      }
    }));

    // Update all related AI Light rewards with userId
    const rewardsResult = await docClient.send(new QueryCommand({
      TableName: TABLES.AI_LIGHT_REWARDS,
      IndexName: 'DeviceIdIndex',
      KeyConditionExpression: 'deviceId = :deviceId',
      ExpressionAttributeValues: {
        ':deviceId': deviceId
      }
    }));

    // Update each reward with the userId
    for (const reward of rewardsResult.Items || []) {
      await docClient.send(new UpdateCommand({
        TableName: TABLES.AI_LIGHT_REWARDS,
        Key: { rewardId: reward.rewardId },
        UpdateExpression: 'SET linkedUserId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Account linked successfully with AI Light rewards' 
      })
    };

  } catch (error) {
    console.error('Error linking account:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error during account linking' 
      })
    };
  }
}
// Enhanced Lambda Function for LifeCompass Referral System
// This function handles all referral business logic including validation, conversions, and discounts

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
  DISCOUNTS: 'LifeCompass-ReferralDiscounts'
};

// Business logic constants
const REFERRAL_LIMITS = {
  DEFAULT: 3,
  STREAK_90_DAYS: 4,
  STREAK_180_DAYS: 5
};

const DISCOUNT_PERCENTAGE = 0.5; // 50% discount

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
        
      case '/get-discounts':
        if (method === 'GET') {
          return await handleGetDiscounts(event.queryStringParameters, headers);
        }
        break;
        
      case '/redeem-discount':
        if (method === 'POST') {
          return await handleRedeemDiscount(body, headers);
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
      message: 'LifeCompass Referral Service is healthy',
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

// Process referral conversion and award discounts to both users
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
      discountAwarded: true,
      discountPercentage: DISCOUNT_PERCENTAGE
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.CONVERSIONS,
      Item: conversionData
    }));

    // Award 50% discount to both users for their next AI plan
    const discountData = {
      discountPercentage: DISCOUNT_PERCENTAGE,
      validForPurchaseType: 'AI_MONTHLY',
      createdAt: new Date().toISOString(),
      isRedeemed: false,
      conversionId: conversionId
    };

    // Discount for referrer
    await docClient.send(new PutCommand({
      TableName: TABLES.DISCOUNTS,
      Item: {
        ...discountData,
        discountId: `${conversionId}-referrer`,
        deviceId: referrerDeviceId,
        discountType: 'REFERRAL_REWARD'
      }
    }));

    // Discount for purchaser (referee)
    await docClient.send(new PutCommand({
      TableName: TABLES.DISCOUNTS,
      Item: {
        ...discountData,
        discountId: `${conversionId}-referee`,
        deviceId: purchaserDeviceId,
        discountType: 'REFERRAL_BONUS'
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

    console.log(`Referral conversion processed: ${conversionId}`);
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
            availableDiscounts: []
          }
        })
      };
    }

    const userData = userResult.Item;

    // Get available discounts for this user
    const discountResult = await docClient.send(new QueryCommand({
      TableName: TABLES.DISCOUNTS,
      IndexName: 'DeviceIdIndex', // You'll need to create this GSI
      KeyConditionExpression: 'deviceId = :deviceId',
      FilterExpression: 'isRedeemed = :notRedeemed',
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
        ':notRedeemed': false
      }
    }));

    const stats = {
      referralCodes: userData.referralCodes || [],
      referralLimit: userData.referralLimit || 0,
      referralsUsed: userData.referralsUsed || 0,
      availableDiscounts: discountResult.Items || [],
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

// Get available discounts for a user
async function handleGetDiscounts(queryParams, headers) {
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

    // Query unredeemed discounts for this device
    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.DISCOUNTS,
      IndexName: 'DeviceIdIndex', // You'll need to create this GSI
      KeyConditionExpression: 'deviceId = :deviceId',
      FilterExpression: 'isRedeemed = :notRedeemed',
      ExpressionAttributeValues: {
        ':deviceId': deviceId,
        ':notRedeemed': false
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        discounts: result.Items || []
      })
    };

  } catch (error) {
    console.error('Error getting discounts:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error getting discounts' 
      })
    };
  }
}

// Redeem a discount during purchase
async function handleRedeemDiscount(body, headers) {
  try {
    const { conversionId, userId, subscriptionType, originalPrice } = body;
    
    if (!conversionId || !originalPrice) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Missing required fields: conversionId, originalPrice' 
        })
      };
    }

    // Find the discount
    const discountResult = await docClient.send(new QueryCommand({
      TableName: TABLES.DISCOUNTS,
      IndexName: 'ConversionIdIndex', // You'll need to create this GSI
      KeyConditionExpression: 'conversionId = :conversionId',
      FilterExpression: 'isRedeemed = :notRedeemed',
      ExpressionAttributeValues: {
        ':conversionId': conversionId,
        ':notRedeemed': false
      }
    }));

    if (!discountResult.Items || discountResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'No unredeemed discount found for this conversion' 
        })
      };
    }

    const discount = discountResult.Items[0];
    const discountAmount = originalPrice * discount.discountPercentage;
    const discountedPrice = originalPrice - discountAmount;

    // Mark discount as redeemed
    await docClient.send(new UpdateCommand({
      TableName: TABLES.DISCOUNTS,
      Key: { discountId: discount.discountId },
      UpdateExpression: 'SET isRedeemed = :redeemed, redeemedAt = :timestamp, redeemedForUserId = :userId',
      ExpressionAttributeValues: {
        ':redeemed': true,
        ':timestamp': new Date().toISOString(),
        ':userId': userId
      }
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        discountedPrice: discountedPrice,
        discountAmount: discountAmount,
        redemptionId: discount.discountId
      })
    };

  } catch (error) {
    console.error('Error redeeming discount:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Internal server error during redemption' 
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

    // Update all related records (referrals, discounts, conversions) with userId
    // This would involve multiple update operations...

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Account linked successfully' 
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
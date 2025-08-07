const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Table names - update these to match your naming convention
const TABLES = {
  ANONYMOUS_USERS: 'LifeCompass-AnonymousUsers',
  REFERRAL_CODES: 'LifeCompass-ReferralCodes',
  REFERRAL_STATS: 'LifeCompass-ReferralStats',
  REFERRAL_CONVERSIONS: 'LifeCompass-ReferralConversions',
  DISCOUNT_REDEMPTIONS: 'LifeCompass-DiscountRedemptions'
};

exports.handler = async (event, context) => {
  try {
    console.log('Referral sync handler received:', JSON.stringify(event));
    
    const { httpMethod, path, body } = event;
    const requestBody = body ? JSON.parse(body) : {};
    
    // Route based on path and method
    const route = `${httpMethod} ${path}`;
    
    switch (route) {
      case 'POST /sync-referral-code':
        return await syncReferralCode(requestBody);
      
      case 'POST /sync-referral-stats':
        return await syncReferralStats(requestBody);
      
      case 'POST /record-conversion':
        return await recordConversion(requestBody);
      
      case 'GET /get-discounts':
        return await getEarnedDiscounts(event.queryStringParameters);
      
      case 'POST /link-account':
        return await linkAnonymousToAccount(requestBody);
      
      case 'POST /redeem-discount':
        return await redeemDiscount(requestBody);
      
      case 'GET /health':
        return await healthCheck();
        
      default:
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Route not found' })
        };
    }
  } catch (error) {
    console.error('Error in referral sync handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error', details: error.message })
    };
  }
};

// Create or get anonymous user
async function getOrCreateAnonymousUser(deviceId, deviceFingerprint) {
  const anonymousUserId = `anon_${deviceId}`;
  
  try {
    // Try to get existing user
    const getParams = {
      TableName: TABLES.ANONYMOUS_USERS,
      Key: { deviceId }
    };
    
    const result = await dynamodb.get(getParams).promise();
    
    if (result.Item) {
      // Update last seen
      const updateParams = {
        TableName: TABLES.ANONYMOUS_USERS,
        Key: { deviceId },
        UpdateExpression: 'SET lastSeen = :lastSeen',
        ExpressionAttributeValues: {
          ':lastSeen': new Date().toISOString()
        }
      };
      await dynamodb.update(updateParams).promise();
      return result.Item;
    }
    
    // Create new anonymous user
    const newUser = {
      deviceId,
      anonymousUserId,
      deviceFingerprint,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      linkedUserId: null,
      linkedAt: null
    };
    
    const putParams = {
      TableName: TABLES.ANONYMOUS_USERS,
      Item: newUser
    };
    
    await dynamodb.put(putParams).promise();
    return newUser;
  } catch (error) {
    console.error('Error in getOrCreateAnonymousUser:', error);
    throw error;
  }
}

// Sync referral code
async function syncReferralCode(requestBody) {
  const { deviceId, deviceFingerprint, code, userIdentifier } = requestBody;
  
  if (!deviceId || !code) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing required fields: deviceId, code' })
    };
  }
  
  try {
    // Get or create anonymous user
    const anonymousUser = await getOrCreateAnonymousUser(deviceId, deviceFingerprint);
    
    // Upsert referral code
    const params = {
      TableName: TABLES.REFERRAL_CODES,
      Item: {
        code,
        ownerId: anonymousUser.anonymousUserId,
        ownerType: 'anonymous',
        linkedEmail: null,
        createdAt: new Date().toISOString(),
        isActive: true
      }
    };
    
    await dynamodb.put(params).promise();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Referral code synced successfully' })
    };
  } catch (error) {
    console.error('Error syncing referral code:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to sync referral code' })
    };
  }
}

// Sync referral stats
async function syncReferralStats(requestBody) {
  const { deviceId, deviceFingerprint, stats } = requestBody;
  
  if (!deviceId || !stats) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing required fields: deviceId, stats' })
    };
  }
  
  try {
    const anonymousUser = await getOrCreateAnonymousUser(deviceId, deviceFingerprint);
    
    const params = {
      TableName: TABLES.REFERRAL_STATS,
      Item: {
        ownerId: anonymousUser.anonymousUserId,
        ownerType: 'anonymous',
        sent: stats.sent || 0,
        clicked: stats.clicked || 0,
        converted: stats.converted || 0,
        plansEarned: stats.plansEarned || 0,
        plansGifted: stats.plansGifted || 0,
        createdAt: stats.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    await dynamodb.put(params).promise();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Referral stats synced successfully' })
    };
  } catch (error) {
    console.error('Error syncing referral stats:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to sync referral stats' })
    };
  }
}

// Record referral conversion
async function recordConversion(requestBody) {
  const { referralCode, purchaserDeviceId, deviceFingerprint } = requestBody;
  
  if (!referralCode || !purchaserDeviceId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing required fields: referralCode, purchaserDeviceId' })
    };
  }
  
  try {
    // Find referral code owner
    const codeParams = {
      TableName: TABLES.REFERRAL_CODES,
      Key: { code: referralCode }
    };
    
    const codeResult = await dynamodb.get(codeParams).promise();
    
    if (!codeResult.Item || !codeResult.Item.isActive) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid or inactive referral code' })
      };
    }
    
    // Create purchaser anonymous user
    const purchaserUser = await getOrCreateAnonymousUser(purchaserDeviceId, deviceFingerprint);
    
    // Create conversion record
    const conversionId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    const conversionParams = {
      TableName: TABLES.REFERRAL_CONVERSIONS,
      Item: {
        conversionId,
        referralCode,
        referrerId: codeResult.Item.ownerId,
        purchaserId: purchaserUser.anonymousUserId,
        conversionDate: new Date().toISOString(),
        rewardStatus: 'pending',
        rewardAmount: 50,
        rewardType: 'percentage_discount',
        appliedAt: null,
        expiresAt: null
      }
    };
    
    await dynamodb.put(conversionParams).promise();
    
    // Update referrer stats
    await incrementReferrerStats(codeResult.Item.ownerId);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Conversion recorded successfully',
        conversionId 
      })
    };
  } catch (error) {
    console.error('Error recording conversion:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to record conversion' })
    };
  }
}

// Increment referrer stats
async function incrementReferrerStats(referrerId) {
  const params = {
    TableName: TABLES.REFERRAL_STATS,
    Key: { ownerId: referrerId },
    UpdateExpression: 'ADD converted :inc, plansEarned :inc, plansGifted :inc SET updatedAt = :updatedAt',
    ExpressionAttributeValues: {
      ':inc': 1,
      ':updatedAt': new Date().toISOString()
    }
  };
  
  await dynamodb.update(params).promise();
}

// Get earned discounts
async function getEarnedDiscounts(queryParams) {
  const { deviceId } = queryParams || {};
  
  if (!deviceId) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing required parameter: deviceId' })
    };
  }
  
  try {
    const anonymousUserId = `anon_${deviceId}`;
    
    // Query conversions where user is referrer or purchaser
    const referrerParams = {
      TableName: TABLES.REFERRAL_CONVERSIONS,
      IndexName: 'ReferrerIdIndex',
      KeyConditionExpression: 'referrerId = :userId',
      FilterExpression: 'rewardStatus = :status',
      ExpressionAttributeValues: {
        ':userId': anonymousUserId,
        ':status': 'pending'
      }
    };
    
    const purchaserParams = {
      TableName: TABLES.REFERRAL_CONVERSIONS,
      IndexName: 'PurchaserIdIndex',
      KeyConditionExpression: 'purchaserId = :userId',
      FilterExpression: 'rewardStatus = :status',
      ExpressionAttributeValues: {
        ':userId': anonymousUserId,
        ':status': 'pending'
      }
    };
    
    const [referrerResult, purchaserResult] = await Promise.all([
      dynamodb.query(referrerParams).promise(),
      dynamodb.query(purchaserParams).promise()
    ]);
    
    const allDiscounts = [...(referrerResult.Items || []), ...(purchaserResult.Items || [])];
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        discounts: allDiscounts 
      })
    };
  } catch (error) {
    console.error('Error getting earned discounts:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get earned discounts' })
    };
  }
}

// Link anonymous account to real user
async function linkAnonymousToAccount(requestBody) {
  const { deviceId, userId, email } = requestBody;
  
  if (!deviceId || !userId || !email) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing required fields: deviceId, userId, email' })
    };
  }
  
  try {
    const anonymousUserId = `anon_${deviceId}`;
    
    // Update anonymous user record
    const userUpdateParams = {
      TableName: TABLES.ANONYMOUS_USERS,
      Key: { deviceId },
      UpdateExpression: 'SET linkedUserId = :userId, linkedAt = :linkedAt',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':linkedAt': new Date().toISOString()
      }
    };
    
    // Update referral codes
    const codeUpdateParams = {
      TableName: TABLES.REFERRAL_CODES,
      IndexName: 'OwnerIdIndex',
      KeyConditionExpression: 'ownerId = :anonymousUserId',
      ExpressionAttributeValues: {
        ':anonymousUserId': anonymousUserId
      }
    };
    
    const codeResult = await dynamodb.query(codeUpdateParams).promise();
    
    // Update all referral codes to point to real user
    const codeUpdates = (codeResult.Items || []).map(item => ({
      Update: {
        TableName: TABLES.REFERRAL_CODES,
        Key: { code: item.code },
        UpdateExpression: 'SET ownerId = :userId, ownerType = :ownerType, linkedEmail = :email',
        ExpressionAttributeValues: {
          ':userId': userId,
          ':ownerType': 'authenticated',
          ':email': email
        }
      }
    }));
    
    // Update referral stats
    const statsUpdateParams = {
      TableName: TABLES.REFERRAL_STATS,
      Key: { ownerId: anonymousUserId },
      UpdateExpression: 'SET ownerId = :userId, ownerType = :ownerType',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':ownerType': 'authenticated'
      }
    };
    
    // Execute all updates
    await Promise.all([
      dynamodb.update(userUpdateParams).promise(),
      dynamodb.update(statsUpdateParams).promise(),
      ...codeUpdates.map(update => dynamodb.update(update.Update).promise())
    ]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true, 
        message: 'Account linked successfully' 
      })
    };
  } catch (error) {
    console.error('Error linking account:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to link account' })
    };
  }
}

// Redeem discount
async function redeemDiscount(requestBody) {
  const { conversionId, userId, subscriptionType, originalPrice } = requestBody;
  
  if (!conversionId || !userId || !subscriptionType || !originalPrice) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }
  
  try {
    // Get conversion record
    const conversionParams = {
      TableName: TABLES.REFERRAL_CONVERSIONS,
      Key: { conversionId }
    };
    
    const conversionResult = await dynamodb.get(conversionParams).promise();
    
    if (!conversionResult.Item || conversionResult.Item.rewardStatus !== 'pending') {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid or already used conversion' })
      };
    }
    
    const conversion = conversionResult.Item;
    const discountAmount = originalPrice * (conversion.rewardAmount / 100);
    const finalPrice = Math.max(0, originalPrice - discountAmount);
    
    // Mark conversion as applied
    const updateConversionParams = {
      TableName: TABLES.REFERRAL_CONVERSIONS,
      Key: { conversionId },
      UpdateExpression: 'SET rewardStatus = :status, appliedAt = :appliedAt',
      ExpressionAttributeValues: {
        ':status': 'applied',
        ':appliedAt': new Date().toISOString()
      }
    };
    
    // Record redemption
    const redemptionId = `redeem_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const redemptionParams = {
      TableName: TABLES.DISCOUNT_REDEMPTIONS,
      Item: {
        redemptionId,
        conversionId,
        userId,
        redeemedAt: new Date().toISOString(),
        subscriptionType,
        originalPrice,
        discountedPrice: finalPrice,
        discountAmount
      }
    };
    
    await Promise.all([
      dynamodb.update(updateConversionParams).promise(),
      dynamodb.put(redemptionParams).promise()
    ]);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        success: true,
        discountedPrice: finalPrice,
        discountAmount,
        redemptionId
      })
    };
  } catch (error) {
    console.error('Error redeeming discount:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to redeem discount' })
    };
  }
}

// Health check endpoint
async function healthCheck() {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      success: true,
      message: 'Referral system is healthy',
      timestamp: new Date().toISOString()
    })
  };
}
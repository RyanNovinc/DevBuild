const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { referralCode, userId, action, userEmail } = body;
    
    console.log('Tracking referral:', { referralCode, userId, action });
    
    if (!referralCode || !userId || !action) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: 'referralCode, userId, and action are required'
        })
      };
    }
    
    // Verify referral code exists
    const referralParams = {
      TableName: 'LifeCompass-ReferralCodes',
      Key: { referralCode: referralCode }
    };
    
    const referralResult = await dynamoDB.get(referralParams).promise();
    
    if (!referralResult.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: 'Invalid referral code'
        })
      };
    }
    
    const timestamp = new Date().toISOString();
    const referralId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    switch (action) {
      case 'visit':
        // Track anonymous user visit
        const visitParams = {
          TableName: 'LifeCompass-AnonymousUsers',
          Item: {
            userId: userId,
            referralCode: referralCode,
            visitDate: timestamp,
            status: 'visited',
            userAgent: event.headers?.['User-Agent'] || 'unknown',
            ip: event.requestContext?.identity?.sourceIp || 'unknown'
          }
        };
        
        await dynamoDB.put(visitParams).promise();
        
        // Update referral code stats
        const updateVisitParams = {
          TableName: 'LifeCompass-ReferralCodes',
          Key: { referralCode: referralCode },
          UpdateExpression: 'ADD totalVisits :inc SET lastActivity = :timestamp',
          ExpressionAttributeValues: {
            ':inc': 1,
            ':timestamp': timestamp
          }
        };
        
        await dynamoDB.update(updateVisitParams).promise();
        break;
        
      case 'signup':
        // Update anonymous user to signup status
        const signupParams = {
          TableName: 'LifeCompass-AnonymousUsers',
          Key: { userId: userId },
          UpdateExpression: 'SET #status = :status, signupDate = :timestamp, email = :email',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':status': 'signed_up',
            ':timestamp': timestamp,
            ':email': userEmail || 'unknown'
          }
        };
        
        await dynamoDB.update(signupParams).promise();
        
        // Increment referral count
        const updateSignupParams = {
          TableName: 'LifeCompass-ReferralCodes',
          Key: { referralCode: referralCode },
          UpdateExpression: 'ADD totalReferrals :inc SET lastActivity = :timestamp',
          ExpressionAttributeValues: {
            ':inc': 1,
            ':timestamp': timestamp
          }
        };
        
        await dynamoDB.update(updateSignupParams).promise();
        break;
        
      case 'purchase':
        // Record successful conversion
        const conversionParams = {
          TableName: 'LifeCompass-ReferralConversions',
          Item: {
            conversionId: referralId,
            referralCode: referralCode,
            userId: userId,
            conversionDate: timestamp,
            status: 'converted',
            rewardAmount: 50, // $5.00 reward for founder
            anonymizedName: generateAnonymizedName(userEmail || userId)
          }
        };
        
        await dynamoDB.put(conversionParams).promise();
        
        // Update anonymous user status
        const purchaseUserParams = {
          TableName: 'LifeCompass-AnonymousUsers',
          Key: { userId: userId },
          UpdateExpression: 'SET #status = :status, purchaseDate = :timestamp',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':status': 'converted',
            ':timestamp': timestamp
          }
        };
        
        await dynamoDB.update(purchaseUserParams).promise();
        
        // Update referral code with successful conversion
        const updateConversionParams = {
          TableName: 'LifeCompass-ReferralCodes',
          Key: { referralCode: referralCode },
          UpdateExpression: 'ADD successfulConversions :inc, totalRewards :reward, availableRewards :reward SET lastActivity = :timestamp',
          ExpressionAttributeValues: {
            ':inc': 1,
            ':reward': 50, // 50 cents reward
            ':timestamp': timestamp
          }
        };
        
        await dynamoDB.update(updateConversionParams).promise();
        break;
        
      default:
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            error: 'Invalid action. Must be visit, signup, or purchase'
          })
        };
    }
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        referralId: referralId,
        message: `Referral ${action} tracked successfully`
      })
    };
    
  } catch (error) {
    console.error('Error tracking referral:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: 'Internal server error'
      })
    };
  }
};

// Helper function to generate anonymized names for privacy
function generateAnonymizedName(identifier) {
  const firstNames = ['Alex', 'Sam', 'Jordan', 'Casey', 'Taylor', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Cameron'];
  const lastInitials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];
  
  // Use identifier to generate consistent but anonymized name
  const hash = identifier.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const firstNameIndex = Math.abs(hash) % firstNames.length;
  const lastInitialIndex = Math.abs(hash >> 8) % lastInitials.length;
  
  return `${firstNames[firstNameIndex]} ${lastInitials[lastInitialIndex]}.`;
}
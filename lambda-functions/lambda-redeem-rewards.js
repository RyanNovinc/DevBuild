const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { referralCode, rewardAmount, paymentMethod } = body;
    
    console.log('Redeeming rewards:', { referralCode, rewardAmount });
    
    if (!referralCode || !rewardAmount) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: 'referralCode and rewardAmount are required'
        })
      };
    }
    
    // Get referral code record
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
          error: 'Referral code not found'
        })
      };
    }
    
    const referralData = referralResult.Item;
    const availableRewards = referralData.availableRewards || 0;
    
    // Check if user has enough rewards
    if (availableRewards < rewardAmount) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: `Insufficient rewards. Available: ${availableRewards}, Requested: ${rewardAmount}`
        })
      };
    }
    
    // Minimum redemption amount (e.g., $5.00 = 500 cents)
    if (rewardAmount < 500) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: 'Minimum redemption amount is $5.00'
        })
      };
    }
    
    const timestamp = new Date().toISOString();
    const redemptionId = `redeem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Record the redemption
    const redemptionParams = {
      TableName: 'LifeCompass-DiscountRedemptions',
      Item: {
        redemptionId: redemptionId,
        referralCode: referralCode,
        founderCode: referralData.founderCode,
        rewardAmount: rewardAmount,
        paymentMethod: paymentMethod || 'pending',
        redemptionDate: timestamp,
        status: 'pending', // pending, processed, failed
        transactionId: null // Will be filled when payment is processed
      }
    };
    
    await dynamoDB.put(redemptionParams).promise();
    
    // Update referral code to deduct available rewards
    const updateParams = {
      TableName: 'LifeCompass-ReferralCodes',
      Key: { referralCode: referralCode },
      UpdateExpression: 'ADD availableRewards :deduction SET lastRedemption = :timestamp',
      ExpressionAttributeValues: {
        ':deduction': -rewardAmount,
        ':timestamp': timestamp
      }
    };
    
    await dynamoDB.update(updateParams).promise();
    
    // In a real implementation, you would:
    // 1. Integrate with payment processor (PayPal, Stripe, etc.)
    // 2. Send email notification to founder
    // 3. Update redemption status to 'processed' when payment completes
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        redemptionId: redemptionId,
        rewardAmount: rewardAmount,
        message: 'Reward redemption initiated. You will receive payment within 5-7 business days.',
        newAvailableRewards: availableRewards - rewardAmount
      })
    };
    
  } catch (error) {
    console.error('Error redeeming rewards:', error);
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
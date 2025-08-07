const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { founderCode, deviceId } = body;
    
    console.log('Creating referral code for founder:', founderCode);
    
    if (!founderCode || !deviceId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: 'founderCode and deviceId are required'
        })
      };
    }
    
    // Verify the founder code exists and is assigned
    const founderParams = {
      TableName: 'LifeCompassFounderCodes',
      Key: { code: founderCode }
    };
    
    const founderResult = await dynamoDB.get(founderParams).promise();
    
    if (!founderResult.Item || founderResult.Item.status !== 'assigned') {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: 'Invalid or unassigned founder code'
        })
      };
    }
    
    // Generate referral code from founder code
    const founderNumber = founderCode.replace('LC-', '');
    const referralCode = `REF-LC-${founderNumber}`;
    
    // Check if referral code already exists
    const existingParams = {
      TableName: 'LifeCompass-ReferralCodes',
      Key: { referralCode: referralCode }
    };
    
    const existingResult = await dynamoDB.get(existingParams).promise();
    
    if (existingResult.Item) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          code: referralCode,
          message: 'Referral code already exists',
          alreadyExists: true
        })
      };
    }
    
    // Create new referral code
    const referralParams = {
      TableName: 'LifeCompass-ReferralCodes',
      Item: {
        referralCode: referralCode,
        founderCode: founderCode,
        deviceId: deviceId,
        createdDate: new Date().toISOString(),
        totalReferrals: 0,
        successfulConversions: 0,
        totalRewards: 0,
        status: 'active'
      }
    };
    
    await dynamoDB.put(referralParams).promise();
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        code: referralCode,
        message: 'Referral code created successfully',
        alreadyExists: false
      })
    };
    
  } catch (error) {
    console.error('Error creating referral code:', error);
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
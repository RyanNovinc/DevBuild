const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { referralCode } = body;
    
    console.log('Getting referral stats for:', referralCode);
    
    if (!referralCode) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: 'referralCode is required'
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
    
    // Get recent conversions
    const conversionsParams = {
      TableName: 'LifeCompass-ReferralConversions',
      IndexName: 'ReferralCodeIndex', // You'll need to create this GSI
      KeyConditionExpression: 'referralCode = :referralCode',
      ExpressionAttributeValues: {
        ':referralCode': referralCode
      },
      ScanIndexForward: false, // Most recent first
      Limit: 10
    };
    
    let recentReferrals = [];
    try {
      const conversionsResult = await dynamoDB.query(conversionsParams).promise();
      recentReferrals = conversionsResult.Items.map(item => ({
        name: item.anonymizedName || 'Anonymous User',
        date: item.conversionDate,
        status: item.status || 'converted'
      }));
    } catch (error) {
      console.log('No conversions index found, using empty array');
    }
    
    // Calculate this month's referrals
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthReferrals = recentReferrals.filter(referral => 
      new Date(referral.date) >= thisMonth
    ).length;
    
    // Calculate referral rate
    const referralRate = referralData.totalReferrals > 0 
      ? Math.round((referralData.successfulConversions / referralData.totalReferrals) * 100)
      : 0;
    
    // Get pending referrals (from anonymous users table)
    let pendingReferrals = 0;
    try {
      const pendingParams = {
        TableName: 'LifeCompass-AnonymousUsers',
        IndexName: 'ReferralCodeIndex', // You'll need to create this GSI
        KeyConditionExpression: 'referralCode = :referralCode',
        FilterExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':referralCode': referralCode,
          ':status': 'pending'
        }
      };
      
      const pendingResult = await dynamoDB.query(pendingParams).promise();
      pendingReferrals = pendingResult.Count || 0;
    } catch (error) {
      console.log('No pending referrals index found');
    }
    
    const stats = {
      totalReferrals: referralData.totalReferrals || 0,
      successfulConversions: referralData.successfulConversions || 0,
      pendingReferrals: pendingReferrals,
      totalRewards: referralData.totalRewards || 0,
      availableRewards: referralData.availableRewards || 0,
      referralRate: `${referralRate}%`,
      thisMonthReferrals: thisMonthReferrals,
      recentReferrals: recentReferrals.slice(0, 5) // Last 5 referrals
    };
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        stats: stats
      })
    };
    
  } catch (error) {
    console.error('Error getting referral stats:', error);
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
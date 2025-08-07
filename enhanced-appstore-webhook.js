const AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const lambda = new AWS.Lambda();

exports.handler = async (event, context) => {
  try {
    console.log('Received App Store notification:', JSON.stringify(event));
    
    const requestBody = JSON.parse(event.body || '{}');
    const signedPayload = requestBody.signedPayload;
    
    if (!signedPayload) {
      throw new Error('Missing signedPayload in request');
    }
    
    // Decode payload (JWT verification can be added later for production)
    const decodedPayload = Buffer.from(signedPayload.split('.')[1], 'base64').toString();
    console.log('Decoded payload:', decodedPayload);
    
    const payload = JSON.parse(decodedPayload);
    const notificationType = payload.notificationType;
    const data = payload.data;
    
    console.log('Notification type:', notificationType);
    
    // Handle app purchases for founder codes
    if (notificationType === 'INITIAL_BUY' || notificationType === 'DID_PURCHASE') {
      console.log('Processing app purchase for founder code assignment');
      
      const transactionInfo = data.transactionInfo;
      const originalTransactionId = transactionInfo.originalTransactionId;
      const transactionId = transactionInfo.transactionId;
      const bundleId = transactionInfo.bundleId;
      const purchaseDate = new Date(parseInt(transactionInfo.purchaseDate)).toISOString();
      
      console.log('Transaction details:', {
        originalTransactionId,
        transactionId,
        bundleId,
        purchaseDate
      });
      
      // Reserve a founder code immediately
      await reserveFounderCode({
        originalTransactionId,
        transactionId,
        bundleId,
        purchaseDate
      });
      
      console.log('Founder code reserved for transaction:', originalTransactionId);
    }
    
    // Handle subscription events (your existing logic)
    if (notificationType === 'SUBSCRIBED' || notificationType === 'DID_RENEW') {
      console.log('Processing subscription event:', notificationType);
      // Your existing subscription logic here
    }
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ received: true })
    };
    
  } catch (error) {
    console.error('Error processing App Store notification:', error);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        received: true,
        error: 'Error processing notification'
      })
    };
  }
};

// Reserve founder code function
async function reserveFounderCode({ originalTransactionId, transactionId, bundleId, purchaseDate }) {
  try {
    // Check if this transaction already has a reserved code
    const existingParams = {
      TableName: 'LifeCompassFounderCodes',
      FilterExpression: 'originalTransactionId = :transactionId OR transactionId = :transactionId',
      ExpressionAttributeValues: {
        ':transactionId': originalTransactionId
      }
    };
    
    const existingResult = await dynamoDB.scan(existingParams).promise();
    
    if (existingResult.Items && existingResult.Items.length > 0) {
      console.log('Transaction already has a reserved code:', originalTransactionId);
      return existingResult.Items[0].code;
    }
    
    // Find an unused code
    let unusedCode = null;
    let lastEvaluatedKey = undefined;
    
    do {
      const scanParams = {
        TableName: 'LifeCompassFounderCodes',
        FilterExpression: '#status = :statusValue',
        ExpressionAttributeNames: {
          '#status': 'status'
        },
        ExpressionAttributeValues: {
          ':statusValue': 'unused'
        },
        Limit: 10
      };
      
      if (lastEvaluatedKey) {
        scanParams.ExclusiveStartKey = lastEvaluatedKey;
      }
      
      const result = await dynamoDB.scan(scanParams).promise();
      
      if (result.Items && result.Items.length > 0) {
        unusedCode = result.Items[0];
        break;
      }
      
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);
    
    if (!unusedCode) {
      console.log('No unused founder codes available!');
      return null;
    }
    
    // Reserve the code
    const updateParams = {
      TableName: 'LifeCompassFounderCodes',
      Key: { code: unusedCode.code },
      UpdateExpression: `
        SET #status = :status, 
            originalTransactionId = :originalTransactionId,
            transactionId = :transactionId,
            bundleId = :bundleId,
            purchaseDate = :purchaseDate,
            reservedDate = :reservedDate
      `,
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': 'reserved',
        ':originalTransactionId': originalTransactionId,
        ':transactionId': transactionId,
        ':bundleId': bundleId,
        ':purchaseDate': purchaseDate,
        ':reservedDate': new Date().toISOString()
      },
      ConditionExpression: '#status = :unusedStatus',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':unusedStatus': 'unused',
        ':status': 'reserved',
        ':originalTransactionId': originalTransactionId,
        ':transactionId': transactionId,
        ':bundleId': bundleId,
        ':purchaseDate': purchaseDate,
        ':reservedDate': new Date().toISOString()
      }
    };
    
    await dynamoDB.update(updateParams).promise();
    console.log('Successfully reserved code:', unusedCode.code);
    
    return unusedCode.code;
    
  } catch (error) {
    console.error('Error reserving founder code:', error);
    throw error;
  }
}
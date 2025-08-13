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
      const productId = transactionInfo.productId;
      const purchaseDate = new Date(parseInt(transactionInfo.purchaseDate)).toISOString();
      
      // Extract price in micros (App Store provides price in micros - divide by 1,000,000 for actual price)
      const priceInMicros = transactionInfo.price;
      const purchasePrice = priceInMicros ? (priceInMicros / 1000000).toFixed(2) : null;
      
      console.log('Transaction details:', {
        originalTransactionId,
        transactionId,
        bundleId,
        productId,
        purchaseDate,
        priceInMicros,
        purchasePrice
      });
      
      // Check if this is a Pro Access purchase (not an AI subscription)
      const isProAccessPurchase = isFounderAccessProduct(productId);
      
      if (isProAccessPurchase) {
        console.log('Identified as Pro Access purchase, processing founder code and AI tier assignment');
        
        // Reserve a founder code and assign AI tier
        await reserveFounderCodeWithAITier({
          originalTransactionId,
          transactionId,
          bundleId,
          productId,
          purchaseDate,
          purchasePrice
        });
        
        console.log('Founder code reserved and AI tier assigned for transaction:', originalTransactionId);
      } else {
        console.log('Non-Pro Access purchase, skipping founder code assignment');
      }
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

// Helper function to identify Pro Access purchases
function isFounderAccessProduct(productId) {
  // Pro Access product IDs based on bundle identifier: com.lifecompass.app
  const proAccessProductIds = [
    'com.lifecompass.app.pro_access',
    'com.lifecompass.app.founder_access', 
    'com.lifecompass.app.lifetime_access',
    'com.lifecompass.app.pro',
    'com.lifecompass.app.founder',
    // Add other Pro Access product ID variations when created in App Store Connect
  ];
  
  return proAccessProductIds.includes(productId);
}

// Enhanced function to calculate purchase rank
async function calculatePurchaseRank(purchaseDate) {
  try {
    console.log('Calculating purchase rank for date:', purchaseDate);
    
    // Count how many founder purchases happened before this one
    const params = {
      TableName: 'LifeCompassFounderCodes',
      FilterExpression: 'purchaseDate < :currentPurchaseDate AND #status <> :unusedStatus',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':currentPurchaseDate': purchaseDate,
        ':unusedStatus': 'unused'
      }
    };
    
    const result = await dynamoDB.scan(params).promise();
    const purchaseRank = (result.Items?.length || 0) + 1;
    
    console.log(`Purchase rank calculated: ${purchaseRank} for purchase date: ${purchaseDate}`);
    return purchaseRank;
    
  } catch (error) {
    console.error('Error calculating purchase rank:', error);
    return null;
  }
}

// Determine AI tier based on purchase rank
function determineAITier(purchaseRank) {
  if (!purchaseRank) return null;
  
  if (purchaseRank <= 100) {
    return 'MAX';
  } else if (purchaseRank <= 500) {
    return 'PLUS';
  } else if (purchaseRank <= 1000) {
    return 'LIGHT';
  } else {
    return null; // Not eligible for founder AI benefits
  }
}

// Enhanced reserve founder code function with AI tier assignment
async function reserveFounderCodeWithAITier({ originalTransactionId, transactionId, bundleId, productId, purchaseDate, purchasePrice }) {
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
      
      // Update existing entry with price and AI tier if missing
      const existingCode = existingResult.Items[0];
      const purchaseRank = await calculatePurchaseRank(purchaseDate);
      const aiTier = determineAITier(purchaseRank);
      
      if (!existingCode.purchasePrice && purchasePrice) {
        const updatePriceParams = {
          TableName: 'LifeCompassFounderCodes',
          Key: { code: existingCode.code },
          UpdateExpression: 'SET purchasePrice = :purchasePrice, productId = :productId, purchaseRank = :purchaseRank, aiTier = :aiTier',
          ExpressionAttributeValues: {
            ':purchasePrice': purchasePrice,
            ':productId': productId,
            ':purchaseRank': purchaseRank,
            ':aiTier': aiTier
          }
        };
        await dynamoDB.update(updatePriceParams).promise();
        console.log('Updated existing code with purchase price and AI tier:', purchasePrice, aiTier);
      }
      
      return existingCode.code;
    }
    
    // Calculate purchase rank and AI tier for new purchase
    const purchaseRank = await calculatePurchaseRank(purchaseDate);
    const aiTier = determineAITier(purchaseRank);
    
    console.log('Purchase rank:', purchaseRank, 'AI Tier:', aiTier);
    
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
    
    // Reserve the code with purchase price tracking and AI tier assignment
    const updateParams = {
      TableName: 'LifeCompassFounderCodes',
      Key: { code: unusedCode.code },
      UpdateExpression: `
        SET #status = :status, 
            originalTransactionId = :originalTransactionId,
            transactionId = :transactionId,
            bundleId = :bundleId,
            productId = :productId,
            purchaseDate = :purchaseDate,
            purchasePrice = :purchasePrice,
            purchaseRank = :purchaseRank,
            aiTier = :aiTier,
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
        ':productId': productId,
        ':purchaseDate': purchaseDate,
        ':purchasePrice': purchasePrice,
        ':purchaseRank': purchaseRank,
        ':aiTier': aiTier,
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
        ':productId': productId,
        ':purchaseDate': purchaseDate,
        ':purchasePrice': purchasePrice,
        ':purchaseRank': purchaseRank,
        ':aiTier': aiTier,
        ':reservedDate': new Date().toISOString()
      }
    };
    
    await dynamoDB.update(updateParams).promise();
    console.log('Successfully reserved code with purchase price and AI tier:', unusedCode.code, 'Price:', purchasePrice, 'Rank:', purchaseRank, 'AI Tier:', aiTier);
    
    // Also create a purchase record for easy refund lookup and AI access tracking
    await createPurchaseRecordWithAITier({
      originalTransactionId,
      transactionId,
      founderCode: unusedCode.code,
      purchasePrice,
      productId,
      purchaseDate,
      purchaseRank,
      aiTier
    });
    
    return unusedCode.code;
    
  } catch (error) {
    console.error('Error reserving founder code:', error);
    throw error;
  }
}

// Enhanced purchase record creation with AI tier tracking
async function createPurchaseRecordWithAITier({ originalTransactionId, transactionId, founderCode, purchasePrice, productId, purchaseDate, purchaseRank, aiTier }) {
  try {
    const purchaseRecord = {
      TableName: 'LifeCompassPurchases', // New table for purchase tracking
      Item: {
        originalTransactionId: originalTransactionId,
        transactionId: transactionId,
        founderCode: founderCode,
        purchasePrice: parseFloat(purchasePrice),
        productId: productId,
        purchaseDate: purchaseDate,
        purchaseRank: purchaseRank,
        aiTier: aiTier,
        purchaseType: 'PRO_ACCESS',
        refundStatus: 'NONE', // NONE, REQUESTED, PROCESSING, COMPLETED
        aiAccessClaimed: false, // Track if user has claimed their AI access
        createdAt: new Date().toISOString()
      }
    };
    
    await dynamoDB.put(purchaseRecord).promise();
    console.log('Purchase record created with AI tier info:', originalTransactionId, 'AI Tier:', aiTier);
    
  } catch (error) {
    console.error('Error creating purchase record:', error);
    // Don't throw - this is supplementary data
  }
}
const AWS = require('aws-sdk');
const https = require('https');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const deviceId = body.deviceId;
    const isTestMode = body.isTestMode === true;
    const receiptData = body.receiptData; // Base64 encoded receipt
    const testScenario = body.testScenario; // For testing
    
    console.log("Processing request:", { deviceId, isTestMode, testScenario });
    
    if (!deviceId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          success: false,
          message: 'deviceId is required' 
        })
      };
    }
    
    // Handle test scenarios
    if (isTestMode && testScenario) {
      return await handleTestScenario(testScenario, deviceId);
    }
    
    // Check if device already has an assigned code
    const existingCode = await findExistingCode(deviceId);
    if (existingCode) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          alreadyAssigned: true,
          code: existingCode.code,
          message: 'This device already has a founder code assigned'
        })
      };
    }
    
    let transactionId = null;
    
    // Production: Validate receipt to get transaction ID
    if (!isTestMode && receiptData) {
      try {
        transactionId = await validateReceiptAndGetTransactionId(receiptData);
        console.log('Validated transaction ID:', transactionId);
      } catch (error) {
        console.error('Receipt validation failed:', error);
        return {
          statusCode: 400,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            message: 'Invalid receipt or purchase verification failed'
          })
        };
      }
    }
    
    // Find reserved code (by transaction ID) or unused code (for test mode)
    let codeToAssign = null;
    
    if (transactionId) {
      // Production: Find reserved code by transaction ID
      codeToAssign = await findReservedCodeByTransaction(transactionId);
      if (!codeToAssign) {
        return {
          statusCode: 404,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            message: 'No founder code found for this purchase. Please contact support.'
          })
        };
      }
    } else {
      // Test mode: Find any unused code
      codeToAssign = await findUnusedCode();
      if (!codeToAssign) {
        return {
          statusCode: 409,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            success: false,
            message: 'No founder spots remaining. All 1000 have been claimed.'
          })
        };
      }
    }
    
    // Assign the code to the device
    await assignCodeToDevice(codeToAssign.code, deviceId, transactionId);
    
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        alreadyAssigned: false,
        code: codeToAssign.code,
        message: 'Founder code successfully assigned'
      })
    };
    
  } catch (error) {
    console.error('Error in AssignFounderCode:', error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        message: 'Error assigning founder code',
        error: error.message
      })
    };
  }
};

// Find existing code for device or transaction
async function findExistingCode(deviceId) {
  const params = {
    TableName: 'LifeCompassFounderCodes',
    FilterExpression: 'deviceId = :deviceId',
    ExpressionAttributeValues: {
      ':deviceId': deviceId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

// Find reserved code by transaction ID
async function findReservedCodeByTransaction(transactionId) {
  const params = {
    TableName: 'LifeCompassFounderCodes',
    FilterExpression: '(originalTransactionId = :transactionId OR transactionId = :transactionId) AND #status = :status',
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':transactionId': transactionId,
      ':status': 'reserved'
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  return result.Items && result.Items.length > 0 ? result.Items[0] : null;
}

// Find unused code (for test mode)
async function findUnusedCode() {
  let lastEvaluatedKey = undefined;
  
  do {
    const params = {
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
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
    
    const result = await dynamoDB.scan(params).promise();
    
    if (result.Items && result.Items.length > 0) {
      return result.Items[0];
    }
    
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  return null;
}

// Assign code to device
async function assignCodeToDevice(code, deviceId, transactionId) {
  const updateParams = {
    TableName: 'LifeCompassFounderCodes',
    Key: { code: code },
    UpdateExpression: `
      SET #status = :status, 
          deviceId = :deviceId, 
          assignedDate = :assignedDate
          ${transactionId ? ', originalTransactionId = :transactionId' : ''}
    `,
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: {
      ':status': 'assigned',
      ':deviceId': deviceId,
      ':assignedDate': new Date().toISOString()
    }
  };
  
  if (transactionId) {
    updateParams.ExpressionAttributeValues[':transactionId'] = transactionId;
  }
  
  await dynamoDB.update(updateParams).promise();
}

// Validate App Store receipt
async function validateReceiptAndGetTransactionId(receiptData) {
  const validateReceipt = async (url, receiptDataB64) => {
    return new Promise((resolve, reject) => {
      const postData = JSON.stringify({
        'receipt-data': receiptDataB64
      });
      
      const options = {
        hostname: url.includes('sandbox') ? 'sandbox.itunes.apple.com' : 'buy.itunes.apple.com',
        port: 443,
        path: '/verifyReceipt',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response from Apple'));
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  };
  
  // Try production first
  let result = await validateReceipt('https://buy.itunes.apple.com/verifyReceipt', receiptData);
  
  // If sandbox receipt, try sandbox endpoint
  if (result.status === 21007) {
    result = await validateReceipt('https://sandbox.itunes.apple.com/verifyReceipt', receiptData);
  }
  
  if (result.status !== 0) {
    throw new Error(`Receipt validation failed with status: ${result.status}`);
  }
  
  // Verify it's your app
  if (result.receipt.bundle_id !== 'com.lifecompass.app') {
    throw new Error('Receipt is not for this app');
  }
  
  // Return the original transaction ID
  return result.receipt.original_transaction_id;
}

// Handle test scenarios
async function handleTestScenario(scenario, deviceId) {
  const testCode = `TEST-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  
  switch (scenario) {
    case 'success':
      // Simulate new assignment
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          alreadyAssigned: false,
          code: testCode,
          message: 'Founder code successfully assigned (TEST)'
        })
      };
      
    case 'already_assigned':
      // Simulate already assigned
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: true,
          alreadyAssigned: true,
          code: 'TEST-EXISTING',
          message: 'This device already has a founder code assigned (TEST)'
        })
      };
      
    case 'no_spots':
      return {
        statusCode: 409,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: 'No founder spots remaining. All 1000 have been claimed. (TEST)'
        })
      };
      
    case 'error':
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: 'Simulated error for testing (TEST)'
        })
      };
      
    default:
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          message: 'Invalid test scenario'
        })
      };
  }
}
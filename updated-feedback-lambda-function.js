// Using direct HTTPS calls to DynamoDB instead of AWS SDK
const crypto = require('crypto');
const https = require('https');

// Helper function to sign AWS requests (Signature Version 4)
function signRequest(method, host, path, region, service, payload) {
  const now = new Date();
  const amzdate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const datestamp = amzdate.slice(0, 8);
  
  // Get AWS credentials from environment variables
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const sessionToken = process.env.AWS_SESSION_TOKEN;
  
  // Create canonical request
  const canonicalUri = path;
  const canonicalQueryString = '';
  const canonicalHeaders = 
    'content-type:application/x-amz-json-1.0\n' +
    'host:' + host + '\n' +
    'x-amz-date:' + amzdate + '\n';
  const signedHeaders = 'content-type;host;x-amz-date';
  const payloadHash = crypto.createHash('sha256')
    .update(payload)
    .digest('hex');
  const canonicalRequest = method + '\n' +
    canonicalUri + '\n' +
    canonicalQueryString + '\n' +
    canonicalHeaders + '\n' +
    signedHeaders + '\n' +
    payloadHash;
  
  // Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = datestamp + '/' + region + '/' + service + '/aws4_request';
  const stringToSign = algorithm + '\n' +
    amzdate + '\n' +
    credentialScope + '\n' +
    crypto.createHash('sha256')
      .update(canonicalRequest)
      .digest('hex');
  
  // Calculate signature
  function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = crypto.createHmac('sha256', 'AWS4' + key).update(dateStamp).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
    return kSigning;
  }
  
  const signingKey = getSignatureKey(secretKey, datestamp, region, service);
  const signature = crypto.createHmac('sha256', signingKey)
    .update(stringToSign)
    .digest('hex');
  
  // Create authorization header
  const authorizationHeader = algorithm + ' ' +
    'Credential=' + accessKey + '/' + credentialScope + ', ' +
    'SignedHeaders=' + signedHeaders + ', ' +
    'Signature=' + signature;
  
  // Return headers
  const headers = {
    'Content-Type': 'application/x-amz-json-1.0',
    'X-Amz-Date': amzdate,
    'Authorization': authorizationHeader
  };
  
  // Add session token if it exists
  if (sessionToken) {
    headers['X-Amz-Security-Token'] = sessionToken;
  }
  
  return headers;
}

// Function to make a request to DynamoDB
async function callDynamoDB(action, payload, region) {
  return new Promise((resolve, reject) => {
    const host = `dynamodb.${region}.amazonaws.com`;
    const path = '/';
    const method = 'POST';
    
    // Convert payload to string
    const stringPayload = JSON.stringify(payload);
    
    // Sign the request
    const headers = signRequest(method, host, path, region, 'dynamodb', stringPayload);
    headers['X-Amz-Target'] = `DynamoDB_20120810.${action}`;
    headers['Content-Length'] = Buffer.byteLength(stringPayload);
    
    // Request options
    const options = {
      hostname: host,
      port: 443,
      path: path,
      method: method,
      headers: headers
    };
    
    // Make the request
    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const data = responseBody ? JSON.parse(responseBody) : {};
            resolve(data);
          } else {
            reject(new Error(`DynamoDB returned status code ${res.statusCode}: ${responseBody}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    req.write(stringPayload);
    req.end();
  });
}

// Function to put an item in DynamoDB
async function putItem(tableName, item, region) {
  // Convert JavaScript object to DynamoDB format
  const dynamoDBItem = {};
  
  for (const [key, value] of Object.entries(item)) {
    if (value === null || value === undefined) {
      dynamoDBItem[key] = { NULL: true };
    } else if (typeof value === 'string') {
      dynamoDBItem[key] = { S: value };
    } else if (typeof value === 'number') {
      dynamoDBItem[key] = { N: value.toString() };
    } else if (typeof value === 'boolean') {
      dynamoDBItem[key] = { BOOL: value };
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        dynamoDBItem[key] = { L: [] };
      } else if (typeof value[0] === 'string') {
        dynamoDBItem[key] = { SS: value };
      } else if (typeof value[0] === 'number') {
        dynamoDBItem[key] = { NS: value.map(n => n.toString()) };
      } else {
        dynamoDBItem[key] = { 
          L: value.map(item => {
            if (typeof item === 'string') return { S: item };
            if (typeof item === 'number') return { N: item.toString() };
            if (typeof item === 'boolean') return { BOOL: item };
            return { S: JSON.stringify(item) };
          }) 
        };
      }
    } else if (typeof value === 'object') {
      dynamoDBItem[key] = { S: JSON.stringify(value) };
    }
  }
  
  const payload = {
    TableName: tableName,
    Item: dynamoDBItem
  };
  
  return callDynamoDB('PutItem', payload, region);
}

exports.handler = async (event, context) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };
  
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Preflight call successful' })
    };
  }
  
  try {
    // Get environment variables
    const TABLE_NAME = process.env.TABLE_NAME || 'user-feedback';
    const REGION = process.env.REGION || 'ap-southeast-2';
    
    // Parse the request body
    const feedbackData = JSON.parse(event.body);
    console.log('Parsed feedback data:', feedbackData);
    
    // Validate required fields - skip message requirement for refund requests
    if (feedbackData.type !== 'refund' && (!feedbackData.message || !feedbackData.message.trim())) {
      console.log('Validation error: Message is required');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Feedback message is required' 
        })
      };
    }
    
    if (!feedbackData.type) {
      console.log('Validation error: Type is required');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false, 
          error: 'Feedback type is required' 
        })
      };
    }
    
    // Generate UUID
    const id = crypto.randomUUID();
    
    // Check if user is a founder based on subscription status
    const isFounder = feedbackData.is_founder || 
                      feedbackData.founder_status === 'pro' || 
                      feedbackData.founder_status === 'unlimited';
    
    // Convert subscription status to proper founder label
    const founderStatus = isFounder ? 'Founder' : 'free';
    
    // Prepare the feedback object
    const feedback = {
      id,
      type: feedbackData.type,
      target: feedbackData.target || 'app',
      message: feedbackData.message ? feedbackData.message.trim() : null,
      contact_email: feedbackData.contact_email || null,
      user_id: feedbackData.user_id || null,
      user_name: feedbackData.user_name || null,
      created_at: new Date().toISOString(),
      device_info: feedbackData.device_info || null,
      app_version: feedbackData.app_version || null,
      status: 'new',
      marketing_consent: feedbackData.marketing_consent || false,
      
      // Add founder status fields with proper labels
      is_founder: isFounder,
      founder_status: founderStatus,
      priority: isFounder ? 'high' : 'normal',
      
      // Add refund-specific fields if this is a refund request
      refund_reason: feedbackData.refund_reason || null,
      refund_expectations: feedbackData.refund_expectations || null,
      refund_suggestions: feedbackData.refund_suggestions || null,
      payment_method: feedbackData.payment_method || null,
      payment_details: feedbackData.payment_details || null,
      refund_status: feedbackData.type === 'refund' ? 'requested' : null
    };
    
    console.log('Prepared feedback object:', feedback);
    
    // Save to DynamoDB using direct API calls
    console.log(`Saving to DynamoDB table: ${TABLE_NAME}`);
    await putItem(TABLE_NAME, feedback, REGION);
    console.log('Successfully saved to DynamoDB');
    
    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Thank you for your feedback!',
        id: feedback.id
      })
    };
    
  } catch (error) {
    console.error('Error processing feedback:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: `Server error: ${error.message}` 
      })
    };
  }
};
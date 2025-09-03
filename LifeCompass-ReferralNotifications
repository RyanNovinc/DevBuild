// Updated Lambda Function for LifeCompass Referral Notifications
// Now sends notifications about AI Light month rewards instead of credits

const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'ap-southeast-2' });

// Configure these constants for your system
const FROM_EMAIL = 'noreply@lifecompass.app'; // Verified SES sender
const ADMIN_EMAIL = 'admin@lifecompass.app'; // Your admin email

exports.handler = async (event, context) => {
  try {
    console.log('Processing referral conversion notification (AI Light Edition):', JSON.stringify(event));
    
    // Extract referral details from the event
    // In production, this would come from the App Store webhook Lambda
    const referralData = event.detail || {};
    
    // Basic validation
    if (!referralData.referralCode || !referralData.referrerId) {
      console.error('Missing required referral data');
      return { success: false, error: 'Missing required data' };
    }
    
    // Prepare email to admin
    const adminParams = {
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [ADMIN_EMAIL] },
      Message: {
        Subject: {
          Data: `New Referral Conversion: ${referralData.referralCode} (AI Light Reward)`
        },
        Body: {
          Text: {
            Data: `
New LifeCompass Referral Conversion (AI Light Edition):

Referral Code: ${referralData.referralCode}
Referrer ID: ${referralData.referrerId}
New User ID: ${referralData.newUserId || 'Not provided'}
Conversion Time: ${new Date().toISOString()}

AI Light Rewards Awarded:
- Referrer: x1 month of AI Light
- New User: x1 month of AI Light

Both users now have access to AI Light features for 1 month.

This is an automated notification from the LifeCompass referral system.
            `
          }
        }
      }
    };
    
    await ses.sendEmail(adminParams).promise();
    console.log('Admin notification sent successfully');
    
    // If we have referrer email, send them a notification too
    if (referralData.referrerEmail) {
      const referrerParams = {
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [referralData.referrerEmail] },
        Message: {
          Subject: {
            Data: 'Your LifeCompass referral was successful! 🎉'
          },
          Body: {
            Text: {
              Data: `
Congratulations! Someone you referred has subscribed to LifeCompass.

🎁 You've earned: x1 month of AI Light (free)
🎁 Your friend also got: x1 month of AI Light (free)

AI Light gives you access to:
• Advanced AI assistance
• Personalized goal recommendations  
• Smart project planning
• Enhanced productivity insights

Your AI Light access has been automatically activated and will be available for the next month.

Thank you for sharing LifeCompass with your friends! 🚀

Best regards,
The LifeCompass Team
              `
            },
            Html: {
              Data: `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #3F51B5, #4CAF50); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f9f9f9; }
    .reward-box { background: #4CAF50; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
    .footer { text-align: center; padding: 20px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Referral Success!</h1>
    <p>Someone you referred has joined LifeCompass</p>
  </div>
  
  <div class="content">
    <div class="reward-box">
      <h2>🎁 Your Reward</h2>
      <p><strong>x1 Month of AI Light (Free)</strong></p>
      <p>Your friend also received x1 month of AI Light!</p>
    </div>
    
    <div class="feature-list">
      <h3>AI Light Features Now Available:</h3>
      <ul>
        <li>🤖 Advanced AI assistance</li>
        <li>🎯 Personalized goal recommendations</li>
        <li>📋 Smart project planning</li>
        <li>📊 Enhanced productivity insights</li>
      </ul>
    </div>
    
    <p>Your AI Light access has been automatically activated and will be available for the next month.</p>
    
    <p>Thank you for sharing LifeCompass with your friends! 🚀</p>
  </div>
  
  <div class="footer">
    <p>Best regards,<br>The LifeCompass Team</p>
  </div>
</body>
</html>
              `
            }
          }
        }
      };
      
      await ses.sendEmail(referrerParams).promise();
      console.log('Referrer notification sent successfully');
    }
    
    // If we have new user email, send them a welcome notification too
    if (referralData.newUserEmail) {
      const newUserParams = {
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [referralData.newUserEmail] },
        Message: {
          Subject: {
            Data: 'Welcome to LifeCompass! Your AI Light is ready ✨'
          },
          Body: {
            Text: {
              Data: `
Welcome to LifeCompass! 🎉

Thanks to your friend's referral, you've received a special welcome gift:

🎁 x1 month of AI Light (free)

AI Light gives you access to:
• Advanced AI assistance
• Personalized goal recommendations  
• Smart project planning
• Enhanced productivity insights

Your AI Light access has been automatically activated and is ready to use right now!

Get started by:
1. Setting up your first goals
2. Asking the AI assistant for guidance
3. Creating your productivity roadmap

Welcome to your productivity journey!

Best regards,
The LifeCompass Team
              `
            },
            Html: {
              Data: `
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .header { background: linear-gradient(135deg, #3F51B5, #4CAF50); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { padding: 30px; background: #f9f9f9; }
    .welcome-box { background: #4CAF50; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
    .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
    .steps-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3F51B5; }
    .footer { text-align: center; padding: 20px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>✨ Welcome to LifeCompass!</h1>
    <p>Your AI Light is ready to use</p>
  </div>
  
  <div class="content">
    <p>Thanks to your friend's referral, you've received a special welcome gift:</p>
    
    <div class="welcome-box">
      <h2>🎁 Welcome Gift</h2>
      <p><strong>x1 Month of AI Light (Free)</strong></p>
      <p>Automatically activated and ready to use!</p>
    </div>
    
    <div class="feature-list">
      <h3>AI Light Features Available Now:</h3>
      <ul>
        <li>🤖 Advanced AI assistance</li>
        <li>🎯 Personalized goal recommendations</li>
        <li>📋 Smart project planning</li>
        <li>📊 Enhanced productivity insights</li>
      </ul>
    </div>
    
    <div class="steps-list">
      <h3>Get Started:</h3>
      <ol>
        <li>Set up your first goals</li>
        <li>Ask the AI assistant for guidance</li>
        <li>Create your productivity roadmap</li>
      </ol>
    </div>
    
    <p>Welcome to your productivity journey! 🚀</p>
  </div>
  
  <div class="footer">
    <p>Best regards,<br>The LifeCompass Team</p>
  </div>
</body>
</html>
              `
            }
          }
        }
      };
      
      await ses.sendEmail(newUserParams).promise();
      console.log('New user welcome notification sent successfully');
    }
    
    return { success: true, message: 'AI Light referral notifications sent successfully' };
  } catch (error) {
    console.error('Error sending referral notification:', error);
    return { success: false, error: error.message };
  }
};
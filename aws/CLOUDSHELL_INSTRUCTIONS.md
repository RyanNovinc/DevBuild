# 🚀 CloudShell Deployment Instructions

## **Super Easy 3-Step Process**

### **Step 1: Open AWS CloudShell**
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Sign in to your AWS account
3. Click the CloudShell icon (terminal icon) in the top toolbar
4. Wait for CloudShell to load (takes ~30 seconds)

### **Step 2: Run the Setup Script**
Copy and paste this entire command into CloudShell:

```bash
curl -s https://raw.githubusercontent.com/your-repo-path/aws/cloudshell-setup.sh | bash
```

**OR** manually upload and run the script:

```bash
# Copy the content from cloudshell-setup.sh and paste it into CloudShell
# Then run:
chmod +x cloudshell-setup.sh
./cloudshell-setup.sh
```

**OR** create the script directly in CloudShell:

```bash
# Create the script file
cat > setup-lifecompass.sh << 'EOF'
[PASTE THE ENTIRE CONTENT OF cloudshell-setup.sh HERE]
EOF

# Make it executable and run
chmod +x setup-lifecompass.sh
./setup-lifecompass.sh
```

### **Step 3: Save Your Credentials**
The script will output:
- ✅ **AWS Access Key ID**
- ✅ **AWS Secret Access Key**  
- ✅ **API Gateway URL**

Save these immediately!

## 🎯 **What This Does Automatically**

1. **Creates IAM User**: `lifecompass-deploy` with exact permissions needed
2. **Generates Access Keys**: For your local development
3. **Deploys Infrastructure**: 
   - 5 DynamoDB tables
   - 1 Lambda function (alongside your existing 22)
   - 1 API Gateway with all endpoints
4. **Tests Deployment**: Verifies everything works
5. **Gives You the API URL**: Ready to use in your React Native app

## 📱 **After Deployment**

Add this to your React Native app environment:
```env
REFERRAL_API_URL=https://your-api-id.execute-api.region.amazonaws.com/prod
```

Use the generated credentials to configure your local AWS CLI:
```bash
aws configure
# Enter the Access Key ID and Secret Access Key when prompted
```

## 🔍 **Verify Success**

Your AWS Console will show:
- **Lambda**: `LifeCompass-ReferralSyncHandler` (new function #23!)
- **DynamoDB**: 5 new tables with `LifeCompass-` prefix
- **API Gateway**: `LifeCompass-ReferralAPI`

Test your API:
```bash
curl https://your-api-url/health
```

## 🚨 **If Something Goes Wrong**

The script is idempotent - you can run it multiple times safely. If there's an error:

1. **Check CloudFormation Console** - Look for stack creation errors
2. **Re-run the script** - It will skip existing resources
3. **Clean up and retry**:
   ```bash
   aws cloudformation delete-stack --stack-name lifecompass-referral-system
   # Wait 5 minutes, then re-run the script
   ```

## 🎉 **Success Looks Like**

```
🎉 Deployment successful!

📋 Your API Gateway URL:
https://abc123.execute-api.us-east-1.amazonaws.com/prod

✅ Health check passed!
{
  "success": true,
  "message": "LifeCompass Referral system is healthy",
  "timestamp": "2024-08-04T..."
}

📋 Next Steps:
1. Add this to your React Native app environment:
   REFERRAL_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod

2. Use the credentials saved in ~/lifecompass-aws-credentials.txt
   to configure your local AWS CLI

3. Your Lambda function 'LifeCompass-ReferralSyncHandler' is now
   deployed alongside your other 22 functions!
```

Ready to open CloudShell and run this?
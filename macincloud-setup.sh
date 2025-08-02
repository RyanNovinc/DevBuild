#!/bin/bash
# macincloud-setup.sh - Setup script for MacInCloud
# Run this script after logging into MacInCloud and extracting your project

echo "📱 Setting up your React Native iOS project on MacInCloud..."

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Run Expo prebuild to generate iOS files
echo "🛠️ Generating iOS project files..."
npx expo prebuild --platform ios --clean

# Create the privacy manifest file
echo "🔒 Creating PrivacyInfo.xcprivacy file..."
cat > ios/PrivacyInfo.xcprivacy << 'EOL'
{
  "NSPrivacyAccessedAPITypes": [
    {
      "NSPrivacyAccessedAPIType": "NSFileTimestampsAccessedAPI",
      "NSPrivacyAccessedAPITypeReasons": ["C617.1"]
    },
    {
      "NSPrivacyAccessedAPIType": "NSUserDefaultsAccessedAPI",
      "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
    },
    {
      "NSPrivacyAccessedAPIType": "NSSystemBootTimeAccessedAPI",
      "NSPrivacyAccessedAPITypeReasons": ["35F9.1"]
    },
    {
      "NSPrivacyAccessedAPIType": "NSFileSystemFreeSpaceAccessedAPI",
      "NSPrivacyAccessedAPITypeReasons": ["E174.1"]
    }
  ]
}
EOL

# Run the prepare-ios script
echo "🔧 Running preparation script..."
npm run prepare-ios

# Install CocoaPods
echo "📦 Installing CocoaPods dependencies..."
cd ios
pod install --repo-update
cd ..

echo "✅ Setup complete! Now open Xcode with the command: open ios/*.xcworkspace"
echo "If you still encounter privacy manifest errors in Xcode:"
echo "1. Open Build Phases → Copy Bundle Resources"
echo "2. Remove duplicate PrivacyInfo.xcprivacy files, keeping only your app's version"
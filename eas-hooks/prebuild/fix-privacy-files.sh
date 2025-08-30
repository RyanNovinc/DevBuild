#!/bin/bash
echo "🔧 Fixing duplicate PrivacyInfo.xcprivacy files..."

# Remove duplicate privacy files from pods to avoid conflicts
if [ -d "ios/Pods" ]; then
    find ios/Pods -name "PrivacyInfo.xcprivacy" -type f -delete
    echo "✅ Removed duplicate privacy files from Pods"
else
    echo "⚠️  ios/Pods directory not found"
fi

# Keep only the main app privacy file
if [ -f "ios/LifeCompass/PrivacyInfo.xcprivacy" ]; then
    echo "✅ Main app privacy file exists"
else
    echo "⚠️  Main app privacy file not found"
fi

echo "🎉 Privacy info fix completed!"
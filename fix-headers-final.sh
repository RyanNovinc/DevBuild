#!/bin/bash
# Direct fix for ExpoModulesCore header issues - Final approach

echo "🔧 Creating ExpoModulesCore header workaround..."

# Create directory for dummy headers
mkdir -p ~/Downloads/LCiOS-2/ios/FixHeaders/ExpoModulesCore

# Create dummy header file
cat > ~/Downloads/LCiOS-2/ios/FixHeaders/ExpoModulesCore/EXViewManager.h << 'EOL'
// Dummy header file to fix build issues
#ifndef EXViewManager_h
#define EXViewManager_h

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface EXViewManager : NSObject
// Empty interface to satisfy imports
@end

#endif /* EXViewManager_h */
EOL

echo "✅ Created dummy header file"

# Update Podfile to include our header directory
echo "📱 Updating Podfile to include header search paths..."
if [ -f "ios/Podfile" ]; then
  # Find where the post_install block is or ends
  if grep -q "post_install do |installer|" ios/Podfile; then
    # Add to existing post_install block right at the beginning
    sed -i '' '/post_install do |installer|/a\
  # Add custom header search paths\
  installer.pods_project.targets.each do |target|\
    target.build_configurations.each do |config|\
      config.build_settings["HEADER_SEARCH_PATHS"] ||= "$(inherited)"\
      config.build_settings["HEADER_SEARCH_PATHS"] << " \\"${PROJECT_DIR}/FixHeaders\\""\
    end\
  end\
' ios/Podfile
    echo "✅ Updated Podfile with header search paths"
  else
    echo "⚠️ Couldn't find post_install block in Podfile"
  fi
else
  echo "⚠️ Podfile not found"
fi

# Install pods with our updated Podfile
echo "📱 Reinstalling pods with fixed header search paths..."
cd ios
pod install
cd ..

echo "Done! Try building again in Xcode."


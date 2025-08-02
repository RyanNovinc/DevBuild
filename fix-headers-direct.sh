#!/bin/bash
# Direct fix for ExpoModulesCore header issues

echo "🔧 Applying direct header fix..."

# Find problematic target file
HEADER_FILE=$(find ~/Downloads/LCiOS-2/ios -name "EXAdsAdMobBannerViewManager.h" 2>/dev/null)

if [ -n "$HEADER_FILE" ]; then
  echo "Found header file: $HEADER_FILE"
  echo "Fixing import..."
  
  # Create a backup
  cp "$HEADER_FILE" "${HEADER_FILE}.backup"
  
  # Replace the problematic import
  sed -i '' 's/#import <ExpoModulesCore\/EXViewManager.h>/#import "EXViewManager.h"/g' "$HEADER_FILE"
  
  echo "✅ Header file fixed"
else
  echo "⚠️ Banner view manager header not found, trying alternate approach..."
  
  # Try to find all files with the problematic import
  FILES_WITH_IMPORT=$(grep -l "ExpoModulesCore/EXViewManager.h" $(find ~/Downloads/LCiOS-2/ios -name "*.h" -o -name "*.m") 2>/dev/null || echo "")
  
  if [ -n "$FILES_WITH_IMPORT" ]; then
    echo "Found files with problematic import:"
    echo "$FILES_WITH_IMPORT"
    
    for FILE in $FILES_WITH_IMPORT; do
      echo "Fixing import in $FILE..."
      cp "$FILE" "${FILE}.backup"
      sed -i '' 's/#import <ExpoModulesCore\/EXViewManager.h>/#import "EXViewManager.h"/g' "$FILE"
    done
    
    echo "✅ All files fixed"
  else
    echo "⚠️ No files with problematic import found"
    
    # Create a hack for the build phase
    echo "🔧 Creating build phase workaround..."
    mkdir -p ~/Downloads/LCiOS-2/ios/FixHeaders
    
    # Create a dummy header file
    cat > ~/Downloads/LCiOS-2/ios/FixHeaders/EXViewManager.h << 'EOL'
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
    
    # Update header search paths in Xcode project
    echo "⚠️ Please add ~/Downloads/LCiOS-2/ios/FixHeaders to your Header Search Paths in Xcode"
    echo "1. Click on your project in the left sidebar"
    echo "2. Select your target"
    echo "3. Go to Build Settings tab"
    echo "4. Search for 'Header Search Paths'"
    echo "5. Add this path: $(pwd)/ios/FixHeaders"
  fi
fi

echo "Done! Try building again in Xcode."


#!/bin/bash
# Script to fix AdMob header issues while preserving privacy manifest fixes

echo "🔧 Running AdMob header fix script..."

# Change to the project directory
cd ~/Downloads/LCiOS-2

# 1. Temporarily disable AdMob module in app.json
echo "📱 Temporarily disabling AdMob in app.json..."
if [ -f "app.json" ]; then
  # Create backup
  cp app.json app.json.backup
  
  # Use perl to comment out the AdMob plugin section
  perl -i -pe 's/(\[.*"expo-ads-admob".*\])/\/\* $1 \*\//g' app.json
  echo "✅ AdMob disabled in app.json"
else
  echo "⚠️ app.json not found"
fi

# 2. Create a header search path fix for Xcode
echo "📱 Creating header search path fix..."
cat > ios/expo-fix-headers.rb << 'EOL'
# expo-fix-headers.rb
# Fixes header search paths for ExpoModulesCore

def fix_expo_headers(installer)
  puts "📱 Applying header search paths fix for ExpoModulesCore..."
  
  installer.pods_project.targets.each do |target|
    if target.name.include?('EXAdsAdMob') || target.name.include?('ExpoModulesCore')
      target.build_configurations.each do |config|
        # Add header search paths
        config.build_settings['HEADER_SEARCH_PATHS'] ||= '$(inherited)'
        config.build_settings['HEADER_SEARCH_PATHS'] << ' "${PODS_ROOT}/Headers/Public/ExpoModulesCore"'
        config.build_settings['HEADER_SEARCH_PATHS'] << ' "${PODS_ROOT}/Headers/Private/ExpoModulesCore"'
        
        # Ensure modulemap is properly included
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
        
        # Turn off validation for problematic headers
        config.build_settings['VALIDATE_WORKSPACE'] = 'NO'
      end
    end
  end
  
  puts "✅ Header search paths fix applied"
end
EOL

# 3. Update Podfile to include header fix
echo "📱 Updating Podfile with header fix..."
if [ -f "ios/Podfile" ]; then
  # Create backup
  cp ios/Podfile ios/Podfile.backup
  
  # Check if we need to add the require line
  if ! grep -q "require_relative 'expo-fix-headers.rb'" ios/Podfile; then
    sed -i.bak '1s/^/require_relative '"'"'expo-fix-headers.rb'"'"'\n/' ios/Podfile
  fi
  
  # Add the header fix to post_install
  if grep -q "post_install do |installer|" ios/Podfile; then
    # Add to existing post_install block if it exists
    sed -i.bak '/post_install do |installer|/a\
  fix_expo_headers(installer)' ios/Podfile
  else
    # Add new post_install block if it doesn't exist
    cat >> ios/Podfile << 'EOL'

post_install do |installer|
  fix_expo_headers(installer)
  fix_privacy_manifests(installer)
  react_native_post_install(installer, config[:reactNativePath], :mac_catalyst_enabled => false)
end
EOL
  fi
  
  echo "✅ Podfile updated"
else
  echo "⚠️ ios/Podfile not found"
fi

# 4. Run pod install with header fix
echo "📱 Reinstalling pods with fixes..."
cd ios
pod install
cd ..

# 5. Disable AdMob in Xcode build settings
echo "📱 Creating script to disable AdMob in Xcode..."
cat > disable-admob-xcode.sh << 'EOL'
#!/bin/bash
# Run this script to disable AdMob in Xcode build settings
# This is an alternative approach if the previous steps don't work

cd ~/Downloads/LCiOS-2/ios
if [ -d "Pods/EXAdsAdMob" ]; then
  # Create a GCC preprocessor definition to disable AdMob
  echo "#define DISABLE_ADMOB 1" > Pods/EXAdsAdMob/DISABLE_ADMOB.h
  
  # Add this header to all source files
  find Pods/EXAdsAdMob -name "*.m" -o -name "*.mm" | xargs -I{} sed -i.bak '1s/^/#import "DISABLE_ADMOB.h"\n/' {}
  
  echo "✅ AdMob disabled in source files"
else
  echo "⚠️ EXAdsAdMob pod directory not found"
fi
EOL

chmod +x disable-admob-xcode.sh

echo "✅ AdMob fix scripts created successfully!"
echo ""
echo "Instructions:"
echo "1. Try building the app in Xcode"
echo "2. If you still see AdMob errors, run: ./disable-admob-xcode.sh"
echo "3. Then clean and build again in Xcode"
echo ""
echo "After your build succeeds, remember to restore your app.json from backup:"
echo "cp app.json.backup app.json"


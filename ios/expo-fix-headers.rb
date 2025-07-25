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

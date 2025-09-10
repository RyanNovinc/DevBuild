const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withPrivacyManifestFix(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      
      if (fs.existsSync(podfilePath)) {
        let podfileContent = fs.readFileSync(podfilePath, 'utf-8');
        
        const postInstallHook = `
require 'xcodeproj'

post_install do |installer|
  # Remove duplicate PrivacyInfo.xcprivacy files
  puts "🔧 Removing duplicate PrivacyInfo.xcprivacy files..."
  
  seen_privacy_files = Set.new
  files_removed = 0
  
  installer.pods_project.targets.each do |target|
    resources_phase = target.resources_build_phase
    next unless resources_phase
    
    files_to_remove = []
    
    resources_phase.files.each do |build_file|
      file_ref = build_file.file_ref
      next unless file_ref&.path&.end_with?('PrivacyInfo.xcprivacy')
      
      privacy_file_id = "#{File.basename(file_ref.path)}_#{file_ref.source_tree}"
      
      if seen_privacy_files.include?(privacy_file_id)
        files_to_remove << build_file
        files_removed += 1
      else
        seen_privacy_files.add(privacy_file_id)
      end
    end
    
    files_to_remove.each do |build_file|
      resources_phase.files.delete(build_file)
      build_file.remove_from_project
    end
  end
  
  puts "✅ Removed #{files_removed} duplicate PrivacyInfo.xcprivacy files"
  installer.pods_project.save
  
  # Standard React Native post_install
  react_native_post_install(
    installer,
    config[:reactNativePath],
    :mac_catalyst_enabled => false,
    :ccache_enabled => ENV['RN_CCACHE'] == '1'
  )
end`;

        // Check if post_install already exists
        if (podfileContent.includes('post_install do |installer|')) {
          console.log('⚠️ post_install hook already exists - skipping addition');
        } else {
          podfileContent += postInstallHook;
          fs.writeFileSync(podfilePath, podfileContent);
          console.log('✅ Added PrivacyInfo.xcprivacy cleanup to Podfile');
        }
      }
      
      return config;
    },
  ]);
}

module.exports = withPrivacyManifestFix;
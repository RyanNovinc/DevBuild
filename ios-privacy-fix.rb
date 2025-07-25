# ios-privacy-fix.rb
# Handles iOS privacy manifest conflicts during pod installation

def fix_privacy_manifests(installer)
  puts "📱 Applying privacy manifest conflict fixes..."
  
  project_privacy_path = File.join(File.dirname(__FILE__), 'ios', 'PrivacyInfo.xcprivacy')
  
  # Process all targets to handle privacy manifest conflicts
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      # Exclude PrivacyInfo.xcprivacy from library build phases
      config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] ||= ''
      config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] << ' PrivacyInfo.xcprivacy'
    end
    
    # Find problematic Copy Bundle Resources build phases
    target.build_phases.each do |build_phase|
      next unless build_phase.respond_to?(:name) && build_phase.name == 'Copy Bundle Resources'
      
      # Remove privacy files from Copy Bundle Resources phase
      build_phase.files_references.each do |files_reference|
        next unless files_reference.respond_to?(:path) && files_reference.path.end_with?('PrivacyInfo.xcprivacy')
        
        build_phase.remove_file_reference(files_reference)
        puts "✅ Removed duplicate PrivacyInfo.xcprivacy from #{target.name}"
      end
    end
  end
  
  puts "✅ Privacy manifest fix applied successfully"
end
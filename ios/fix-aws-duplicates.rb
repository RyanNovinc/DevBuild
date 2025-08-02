def fix_aws_duplicates(installer)
  puts "Fixing AWS duplicate symbols..."
  
  installer.pods_project.targets.each do |target|
    if target.name == 'RNAWSCognito'
      target.build_configurations.each do |config|
        # Exclude JKBigInteger from RNAWSCognito to prevent duplication
        config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] ||= ''
        config.build_settings['EXCLUDED_SOURCE_FILE_NAMES'] << ' JKBigInteger.* JKBigDecimal.*'
      end
    end
  end
  
  puts "✅ AWS duplicate fix applied"
end


#!/usr/bin/env ruby
require 'xcodeproj'

# Path to your Xcode project
project_path = 'ios/LifeCompass.xcodeproj'
project = Xcodeproj::Project.open(project_path)

puts "Opening project: #{project_path}"

# Iterate through all targets in the project
project.targets.each do |target|
  puts "Checking target: #{target.name}"
  
  # Get the "Copy Bundle Resources" build phase
  copy_resources_phase = target.build_phases.find { |phase| phase.is_a?(Xcodeproj::Project::Object::PBXResourcesBuildPhase) }
  
  if copy_resources_phase
    puts "Found Copy Bundle Resources phase in target: #{target.name}"
    
    # Find and remove all privacy info files
    privacy_files = copy_resources_phase.files.select do |file|
      file_name = file.file_ref.path
      file_name.end_with?('PrivacyInfo.xcprivacy')
    end
    
    if privacy_files.empty?
      puts "No PrivacyInfo.xcprivacy files found in #{target.name}"
    else
      puts "Removing #{privacy_files.count} PrivacyInfo.xcprivacy files from #{target.name}"
      privacy_files.each do |file|
        copy_resources_phase.remove_build_file(file)
      end
    end
  end
end

# Save the project
project.save
puts "Project saved!"

#!/bin/bash
echo "Running privacy info fix script..."
# Install required Ruby gem
gem install xcodeproj
# Run the fix script
ruby scripts/fix_privacy_info.rb
echo "Privacy info fix script completed!"

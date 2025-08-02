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

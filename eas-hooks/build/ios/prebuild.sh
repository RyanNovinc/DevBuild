#!/bin/bash
# Disable privacy manifests in bundle targets

echo "Fixing multiple privacy manifest issue..."

# Find all podspec files and disable privacy manifests
find "$PODS_ROOT" -name "*.xcodeproj" -exec bash -c '
    echo "Processing $1..."
    for target in $(xcodebuild -project "$1" -list | grep "Information about project" -A 100 | grep "Targets:" -A 100 | grep -v "Targets:" | grep -v "Pods-" | grep -v "^$" | sed "s/^ *//g")
    do
        echo "Checking target: $target"
        if xcodebuild -project "$1" -target "$target" -showBuildSettings | grep -q "PRODUCT_TYPE = com.apple.product-type.bundle"; then
            echo "Disabling privacy manifest for bundle target: $target"
            xcrun xcodebuild -project "$1" -target "$target" GENERATE_PRIVACY_MANIFEST=NO build
        fi
    done
' bash {} \;

echo "Privacy manifest fix applied!"

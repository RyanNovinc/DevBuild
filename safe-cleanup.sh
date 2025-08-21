#!/bin/bash
# Safe deletion script for LifeCompass unused files
# Generated: August 21, 2025
# Total: 15 files, 155.4 KB

echo "🗑️ Starting safe cleanup of confirmed unused development files..."
echo "📊 This will remove 15 files totaling 155.4 KB"
echo ""

# Confirm with user
read -p "Are you sure you want to proceed? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled."
    exit 1
fi

echo "🔄 Creating git backup before cleanup..."
git add -A
git commit -m "Backup before safe file cleanup - 15 development files to be removed

Files to be removed:
- 8 LifeCompass-*.js Lambda development files (129.6 KB)
- 2 enhanced-*.js files excluded by Metro (22.4 KB) 
- 5 development utility files (3.4 KB)

🤖 Generated with Claude Code"

echo ""
echo "🗑️ Deleting files..."

# Track deletion results
deleted_count=0
total_size=0

delete_file() {
    local file="$1"
    local size_kb="$2"
    
    if [ -f "$file" ]; then
        rm "$file"
        if [ $? -eq 0 ]; then
            echo "✅ Deleted: $file ($size_kb KB)"
            ((deleted_count++))
            total_size=$(echo "$total_size + $size_kb" | bc -l 2>/dev/null || echo "0")
        else
            echo "❌ Failed to delete: $file"
        fi
    else
        echo "⚠️  File not found: $file"
    fi
}

echo ""
echo "🔧 Lambda development files (not bundled by Metro):"
delete_file "LifeCompass-AIChat-Updated.js" "32.6"
delete_file "LifeCompass-CheckWindowLimits-New.js" "9.6"
delete_file "LifeCompass-CheckWindowLimits-Updated.js" "9.7"  
delete_file "LifeCompass-GetCreditBalance-Updated.js" "13.8"
delete_file "LifeCompass-ReferralNotifications-Updated.js" "8.1"
delete_file "LifeCompass-ReferralSyncHandler-Updated.js" "25.0"
delete_file "LifeCompass-TrackCreditUsage-Updated.js" "14.6"
delete_file "LifeCompass-TrackCreditUsage-Updated-v2.js" "16.8"

echo ""
echo "🚫 Enhanced files (blocked by Metro config):"
delete_file "enhanced-appstore-webhook.js" "12.3"
delete_file "enhanced-assign-founder-code.js" "10.1"

echo ""
echo "🛠️  Development utilities:"
delete_file "cleanup.js" "2.1"
delete_file "debug-imports.js" "2.7"
delete_file "test-color-wheel.js" "0.9"
delete_file "temp_original.js" "0.0"
delete_file "aus_goals_temp.txt" "0.0"

echo ""
echo "📊 CLEANUP SUMMARY:"
echo "   Files deleted: $deleted_count/15"
echo "   Space freed: ${total_size} KB"
echo ""

if [ $deleted_count -eq 15 ]; then
    echo "✅ Safe cleanup completed successfully!"
    echo "🧪 Recommended next steps:"
    echo "   1. Run 'npm start' to verify app builds"
    echo "   2. Test navigation through main app sections"
    echo "   3. If any issues occur, use 'git reset HEAD~1' to restore files"
else
    echo "⚠️  Cleanup completed with some files missing or failed"
    echo "   Check the output above for details"
fi

echo ""
echo "🔗 Full analysis available in: FINAL_UNUSED_FILES_DELETION_REPORT.md"
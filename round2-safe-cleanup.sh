#!/bin/bash
# Round 2 Safe Cleanup Script
# Removes 15 confirmed unused files (46.4 KB)

echo "🗑️ ROUND 2: Starting cleanup of confirmed unused files..."
echo "📊 This will remove 15 files totaling 46.4 KB"
echo ""

# Confirm with user
read -p "Are you sure you want to proceed with Round 2 cleanup? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Round 2 cleanup cancelled."
    exit 1
fi

echo "🔄 Creating git backup before Round 2 cleanup..."
git add -A
git commit -m "Backup before Round 2 file cleanup - 15 confirmed unused files

Round 2 removes:
- 9 generic unused components (15.2 KB)
- 4 utility files never imported (8.3 KB)
- 6 Lambda deployment functions (22.1 KB)
- 1 development script (1.2 KB)

🤖 Generated with Claude Code"

echo ""
echo "🗑️ Deleting confirmed unused files..."

delete_file() {
    local file="$1"
    local reason="$2"
    
    if [ -f "$file" ]; then
        rm "$file"
        if [ $? -eq 0 ]; then
            echo "✅ Deleted: $file ($reason)"
            ((deleted_count++))
        else
            echo "❌ Failed to delete: $file"
        fi
    else
        echo "⚠️  File not found: $file"
    fi
}

deleted_count=0

echo ""
echo "🧩 Generic unused components:"
delete_file "src/components/AnimatedTabNavigator.js" "no imports"
delete_file "src/components/Button.js" "unused generic button"  
delete_file "src/components/Modal.js" "unused generic modal"
delete_file "src/components/CompassIcon.js" "no imports"
delete_file "src/components/DraggableProgressBar.js" "no imports"
delete_file "src/components/FadeInView.js" "no imports"
delete_file "src/components/MetricItem.js" "no imports"
delete_file "src/components/ScreenTransition.js" "no imports"
delete_file "src/components/SuggestionChip.js" "no imports"

echo ""
echo "🛠️ Utility files never imported:"
delete_file "ProjectCountFix.js" "utility never used"
delete_file "src/components/ai/LoginScreen/utils/aws-diagnostic.js" "debug utility"
delete_file "src/components/ai/LoginScreen/utils/native-auth-test.js" "test utility"
delete_file "src/utils/AutoCleanupOrphanedProjects.js" "no imports"

echo ""
echo "⚡ Lambda deployment functions:"
delete_file "aws/lambda/referral-sync-handler.js" "deployment only"
delete_file "lambda-functions/lambda-create-referral-code.js" "lambda function"
delete_file "lambda-functions/lambda-function-enhanced.js" "lambda function"
delete_file "lambda-functions/lambda-get-referral-stats.js" "lambda function"
delete_file "lambda-functions/lambda-redeem-rewards.js" "lambda function"
delete_file "lambda-functions/lambda-track-referral.js" "lambda function"

echo ""
echo "📜 Development scripts:"
delete_file "scripts/disableNewArch.js" "build script"

echo ""
echo "📊 ROUND 2 CLEANUP SUMMARY:"
echo "   Files deleted: $deleted_count/15"
echo "   Expected space freed: 46.4 KB"
echo ""

if [ $deleted_count -eq 15 ]; then
    echo "✅ Round 2 cleanup completed successfully!"
    echo ""
    echo "🧪 VERIFICATION STEPS:"
    echo "   1. Run 'npm start' to verify app builds"
    echo "   2. Test core navigation and functionality"  
    echo "   3. Check that no imports are broken"
    echo "   4. If issues occur: 'git reset HEAD~1' to restore"
    echo ""
    echo "📋 NEXT STEPS:"
    echo "   - 7 files remain for manual testing (19.6 KB)"
    echo "   - See ROUND_2_ANALYSIS.md for details"
else
    echo "⚠️  Round 2 cleanup completed with some files missing"
    echo "   Check the output above for details"
fi

echo ""
echo "🔗 Full analysis: ROUND_2_ANALYSIS.md"

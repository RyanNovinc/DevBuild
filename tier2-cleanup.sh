#!/bin/bash
# TIER 2 CLEANUP - High Confidence (90-95% safe)
# 6 additional files, 11.9 KB - Very low risk

echo "🎯 TIER 2: High Confidence Cleanup"
echo "📊 Removing 6 additional files (11.9 KB) with 90-95% confidence"
echo "⚡ Risk Level: Very low"
echo "🧪 Verification: Build + quick navigation test (2-3 minutes)"
echo ""

# Confirm with user
read -p "Proceed with Tier 2 cleanup? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Tier 2 cleanup cancelled."
    exit 1
fi

echo "🔄 Creating git backup..."
git add -A
git commit -m "Backup before Tier 2 cleanup - 6 high confidence files

Tier 2 removes (90-95% confidence):
- 1 standalone utility never imported (3.2 KB)
- 5 unused components with no imports found (8.7 KB)

Risk: Very low - no imports detected

🤖 Generated with Claude Code"

echo ""
echo "🗑️ Deleting Tier 2 files..."

deleted_count=0

delete_file() {
    local file="$1"
    local reason="$2"
    
    if [ -f "$file" ]; then
        rm "$file"
        if [ $? -eq 0 ]; then
            echo "✅ $file ($reason)"
            ((deleted_count++))
        else
            echo "❌ Failed: $file"
        fi
    else
        echo "⚠️  Not found: $file"
    fi
}

echo ""
echo "🛠️ Standalone utility (90% safe):"
delete_file "ProjectCountFix.js" "never imported"

echo ""
echo "🧩 Unused components (90-95% safe):"
delete_file "src/components/AnimatedTabNavigator.js" "no imports"
delete_file "src/components/CompassIcon.js" "no imports"
delete_file "src/components/DraggableProgressBar.js" "no imports"
delete_file "src/components/FadeInView.js" "no imports"
delete_file "src/components/MetricItem.js" "no imports"
delete_file "src/components/ScreenTransition.js" "no imports"

echo ""
echo "📊 TIER 2 RESULTS:"
echo "   ✅ Files deleted: $deleted_count/6"
echo "   🎯 Additional space freed: 11.9 KB"
echo "   📈 Total cleanup so far: 40.3 KB"
echo ""

if [ $deleted_count -eq 6 ]; then
    echo "🎉 Tier 2 cleanup completed successfully!"
    echo ""
    echo "🧪 VERIFICATION NEEDED (2-3 minutes):"
    echo "   1. Run: npm start (check build)"
    echo "   2. Open app and test navigation:"
    echo "      • Tap each bottom tab (Dashboard, Goals, Projects, Time, Todo)"
    echo "      • Try opening one screen/modal in each tab"
    echo "   3. If all works → Tier 2 is safe!"
    echo ""
    echo "🚀 NEXT OPTIONS:"
    echo "   • Stop here (excellent 40.3 KB cleanup)"
    echo "   • Continue to Tier 3 (final 3.2 KB, medium risk)"
    echo "   • If any issues: git reset HEAD~1"
else
    echo "⚠️  Some files were missing or failed to delete"
fi

echo ""
echo "📋 Full plan: TIERED_DELETION_PLAN.md"

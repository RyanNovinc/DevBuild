// cleanup.js
const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'src/components/AppLoading.js',
  'src/components/CustomScreenHeader.js',
  'src/components/DomainCard.js',
  'src/components/FabActionsModal.js',
  'src/components/FinancialMetric.js',
  'src/components/FIRatioGauge.js',
  'src/components/LifeBalanceWheel.js',
  'src/components/Modal.js',
  'src/components/NetWorthChart.js',
  'src/components/PassiveIncomeCard.js',
  'src/components/ProgressMeter.js',
  'src/components/ProjectCard.js',
  'src/components/TaskList.js',
  'src/components/TimelineItem.js',
  'src/lib/supabase.js',
  'src/screens/FinanceScreen.js',
  'src/screens/FinancialGoalScreen.js',
  'src/screens/GoalAnalyticsScreen.js',
  'src/screens/GoalRemindersScreen.js',
  'src/screens/LinkProjectsScreen.js',
  'src/screens/MonkModeScreen.js',
  'src/screens/ShareGoalScreen.js',
  'src/services/AuthService.js',
  'src/services/DirectAuthService.js',
  'src/utils/animations.js',
  'src/utils/AutoFixUtility.js',
  'src/utils/CompleteStorageCleaner.js',
  'src/utils/DataCleanupUtility.js',
  'src/utils/DeepStorageScanner.js',
  'src/utils/DefinitiveProjectFixer.js',
  'src/utils/DeleteProjectsWithoutGoals.js',
  'src/utils/DiagnosticUtility.js',
  'src/utils/DirectCountDebugger.js',
  'src/utils/ExtremeFixUtility.js',
  'src/utils/ForceDeleteProjectsWithoutGoals.js',
  'src/utils/NuclearFix.js',
  'src/utils/ResetProjectsUtility.js',
  'src/utils/RobustStorageScanner.js',
  'src/utils/SupabaseAuth.js',
  'src/utils/SupabaseClient.js'
];

let deletedCount = 0;

filesToDelete.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`✅ Deleted: ${filePath}`);
      deletedCount++;
    } catch (error) {
      console.error(`❌ Error deleting ${filePath}: ${error.message}`);
    }
  } else {
    console.log(`⚠️ File not found: ${filePath}`);
  }
});

console.log(`\n🧹 Cleanup complete! Deleted ${deletedCount} files.`);
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the dependency analysis report
const reportPath = './dependency-analysis-report.json';
if (!fs.existsSync(reportPath)) {
  console.error('❌ Dependency analysis report not found. Run dependency-analyzer.js first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

console.log('🗑️  COMPREHENSIVE UNUSED FILES ANALYSIS');
console.log('='.repeat(60));

// Categorize unused files
const categories = {
  rootScripts: [],
  buildTools: [],
  testFiles: [],
  backupFiles: [],
  developmentFiles: [],
  components: [],
  screens: [],
  services: [],
  utils: [],
  lambdaFunctions: [],
  other: []
};

const sizeByCategory = {};
let totalUnusedSize = 0;

report.unusedFiles.forEach(filePath => {
  const fileInfo = report.largestFiles.find(f => f.file === filePath) || 
                  { sizeKB: 0 };
  
  totalUnusedSize += fileInfo.sizeKB || 0;
  
  // Categorize files
  if (filePath.includes('lambda-functions/') || filePath.includes('aws/')) {
    categories.lambdaFunctions.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else if (filePath.includes('src/components/')) {
    categories.components.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else if (filePath.includes('src/screens/')) {
    categories.screens.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else if (filePath.includes('src/services/')) {
    categories.services.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else if (filePath.includes('src/utils/')) {
    categories.utils.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else if (filePath.includes('test') || filePath.includes('debug') || filePath.includes('enhanced-') || filePath.includes('LifeCompass-')) {
    categories.developmentFiles.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else if (filePath.includes('backup') || filePath.includes('_old') || filePath.includes('temp')) {
    categories.backupFiles.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else if (filePath.includes('scripts/') || filePath.includes('.config.') || filePath.includes('build') || filePath.includes('deploy')) {
    categories.buildTools.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else if (!filePath.includes('/')) {
    categories.rootScripts.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  } else {
    categories.other.push({ path: filePath, size: fileInfo.sizeKB || 0 });
  }
});

// Calculate size by category
Object.keys(categories).forEach(cat => {
  sizeByCategory[cat] = categories[cat].reduce((sum, file) => sum + file.size, 0);
});

console.log(`\n📊 SUMMARY:`);
console.log(`Total potentially unused files: ${report.unusedFiles.length}`);
console.log(`Total size of unused files: ${totalUnusedSize.toFixed(2)} KB`);

console.log(`\n📋 BY CATEGORY:`);
Object.entries(categories).forEach(([category, files]) => {
  if (files.length > 0) {
    console.log(`\n${category.toUpperCase().replace(/([A-Z])/g, ' $1').trim()} (${files.length} files, ${sizeByCategory[category].toFixed(2)} KB):`);
    files.sort((a, b) => b.size - a.size).forEach(file => {
      console.log(`  • ${file.path} (${file.size.toFixed(2)} KB)`);
    });
  }
});

console.log(`\n🔍 RECOMMENDED ACTIONS:`);

// High-priority recommendations
console.log(`\n🟡 HIGH PRIORITY - SAFE TO REMOVE:`);
if (categories.developmentFiles.length > 0) {
  console.log(`• Development/Debug files (${categories.developmentFiles.length} files, ${sizeByCategory.developmentFiles.toFixed(2)} KB)`);
  console.log(`  - These appear to be development scripts, debug tools, or enhanced versions`);
  console.log(`  - Safe to remove unless actively debugging`);
}

if (categories.backupFiles.length > 0) {
  console.log(`• Backup files (${categories.backupFiles.length} files, ${sizeByCategory.backupFiles.toFixed(2)} KB)`);
  console.log(`  - These appear to be backup or temporary files`);
  console.log(`  - Safe to remove if current versions are working`);
}

if (categories.lambdaFunctions.length > 0) {
  console.log(`• AWS Lambda functions (${categories.lambdaFunctions.length} files, ${sizeByCategory.lambdaFunctions.toFixed(2)} KB)`);
  console.log(`  - These are standalone Lambda functions not imported by the main app`);
  console.log(`  - Review if they're still needed for deployment`);
}

// Medium-priority recommendations
console.log(`\n🟠 MEDIUM PRIORITY - REVIEW CAREFULLY:`);
if (categories.components.length > 0) {
  console.log(`• Components (${categories.components.length} files, ${sizeByCategory.components.toFixed(2)} KB)`);
  console.log(`  - These may be unused UI components`);
  console.log(`  - Check if they're used dynamically or in navigation`);
}

if (categories.screens.length > 0) {
  console.log(`• Screen components (${categories.screens.length} files, ${sizeByCategory.screens.toFixed(2)} KB)`);
  console.log(`  - These may be unused screen components`);
  console.log(`  - Check navigation configuration and conditional rendering`);
}

if (categories.utils.length > 0) {
  console.log(`• Utility files (${categories.utils.length} files, ${sizeByCategory.utils.toFixed(2)} KB)`);
  console.log(`  - These may be utility functions not being used`);
  console.log(`  - Some might be used dynamically or as entry points`);
}

// Low-priority recommendations
console.log(`\n🟢 LOW PRIORITY - INVESTIGATE:`);
if (categories.services.length > 0) {
  console.log(`• Service files (${categories.services.length} files, ${sizeByCategory.services.toFixed(2)} KB)`);
  console.log(`  - These may be service classes or modules`);
  console.log(`  - Often used as singletons or imported dynamically`);
}

if (categories.rootScripts.length > 0) {
  console.log(`• Root scripts (${categories.rootScripts.length} files, ${sizeByCategory.rootScripts.toFixed(2)} KB)`);
  console.log(`  - These are scripts in the root directory`);
  console.log(`  - May be build tools, deployment scripts, or standalone utilities`);
}

// Special notes
console.log(`\n⚠️  SPECIAL CONSIDERATIONS:`);
console.log(`• Files may be used in navigation configuration (check App.js, navigation files)`);
console.log(`• Files may be loaded dynamically (Platform.select, conditional imports)`);
console.log(`• React Native screens may be registered but not directly imported`);
console.log(`• Some files may be entry points for specific build targets or environments`);

// Generate deletion script
console.log(`\n🗂️  GENERATING SAFE DELETION SCRIPT...`);

const safeDeletionFiles = [
  ...categories.developmentFiles,
  ...categories.backupFiles
].filter(file => 
  // Only include obvious development/backup files
  file.path.includes('debug') || 
  file.path.includes('test-') || 
  file.path.includes('temp') || 
  file.path.includes('backup') || 
  file.path.includes('LifeCompass-') ||
  file.path.includes('enhanced-') ||
  file.path.includes('_old') ||
  file.path.includes('_backup')
);

if (safeDeletionFiles.length > 0) {
  const deletionScript = safeDeletionFiles.map(file => `# rm "${file.path}"`).join('\n');
  
  fs.writeFileSync('./safe-deletion-script.sh', `#!/bin/bash
# Safe deletion script for obviously unused files
# Generated on ${new Date().toISOString()}
# Total files: ${safeDeletionFiles.length}
# Total size: ${safeDeletionFiles.reduce((sum, f) => sum + f.size, 0).toFixed(2)} KB

echo "🗑️  Deleting obviously unused files..."
${deletionScript}
echo "✅ Safe deletion completed!"
`);
  
  console.log(`💾 Safe deletion script saved to: ./safe-deletion-script.sh`);
  console.log(`   This script will remove ${safeDeletionFiles.length} obviously unused files (${safeDeletionFiles.reduce((sum, f) => sum + f.size, 0).toFixed(2)} KB)`);
}

console.log(`\n📈 IMPACT ANALYSIS:`);
console.log(`• Removing all unused files would reduce codebase by ${totalUnusedSize.toFixed(2)} KB`);
console.log(`• Safe removals would reduce codebase by ${safeDeletionFiles.reduce((sum, f) => sum + f.size, 0).toFixed(2)} KB`);
console.log(`• Current most connected files: ${report.mostConnectedFiles.slice(0, 3).map(f => f.file).join(', ')}`);
console.log(`• Average dependencies per file: ${report.dependencyStats.averageDependenciesPerFile}`);

console.log('\n='.repeat(60));
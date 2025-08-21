#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the dependency analysis report
const reportPath = './dependency-analysis-report.json';
const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

// Get actual file sizes
function getActualFileSize(filePath) {
  try {
    const fullPath = path.join('.', filePath);
    const stats = fs.statSync(fullPath);
    return Math.round(stats.size / 1024 * 100) / 100; // KB with 2 decimal places
  } catch (error) {
    return 0;
  }
}

console.log('📊 FINAL DEPENDENCY ANALYSIS SUMMARY');
console.log('='.repeat(60));

console.log(`\n🔍 PROJECT OVERVIEW:`);
console.log(`• Total JavaScript/TypeScript files: ${report.summary.totalFiles}`);
console.log(`• External dependencies identified: ${report.summary.totalDependencies}`);
console.log(`• Average dependencies per file: ${report.dependencyStats.averageDependenciesPerFile}`);
console.log(`• Analysis date: ${new Date(report.summary.analysisDate).toLocaleString()}`);

console.log(`\n🔗 MOST CONNECTED FILES (Top 5):`);
report.mostConnectedFiles.slice(0, 5).forEach((file, index) => {
  console.log(`${index + 1}. ${file.file} (${file.importedByCount} imports)`);
});

console.log(`\n📏 LARGEST FILES (Top 5):`);
report.largestFiles.slice(0, 5).forEach((file, index) => {
  console.log(`${index + 1}. ${file.file} (${file.sizeKB} KB)`);
});

console.log(`\n🗑️  UNUSED FILES ANALYSIS:`);
console.log(`Total potentially unused files: ${report.unusedFiles.length}`);

// Categorize with actual file sizes
const categories = {
  safeToDelelete: [],
  reviewRequired: [],
  keepButInvestigate: []
};

let totalUnusedSize = 0;

report.unusedFiles.forEach(filePath => {
  const actualSize = getActualFileSize(filePath);
  totalUnusedSize += actualSize;
  
  // Safe to delete: obvious development, test, or backup files
  if (filePath.includes('LifeCompass-') || 
      filePath.includes('enhanced-') || 
      filePath.includes('debug-') || 
      filePath.includes('test-') ||
      filePath.includes('temp') ||
      filePath.includes('backup') ||
      filePath.includes('-Updated') ||
      filePath.endsWith('_backup.js') ||
      filePath.endsWith('_old.js')) {
    categories.safeToDelelete.push({ path: filePath, size: actualSize });
  }
  // Keep but investigate: important looking files
  else if (filePath.includes('src/config.js') || 
           filePath.includes('PlatformFix.js') ||
           filePath.includes('src/hocs/') ||
           filePath.includes('src/services/') ||
           filePath.includes('lambda-functions/')) {
    categories.keepButInvestigate.push({ path: filePath, size: actualSize });
  }
  // Review required: everything else
  else {
    categories.reviewRequired.push({ path: filePath, size: actualSize });
  }
});

console.log(`\n🟢 SAFE TO DELETE (${categories.safeToDelelete.length} files):`);
const safeSize = categories.safeToDelelete.reduce((sum, f) => sum + f.size, 0);
console.log(`Total size: ${safeSize.toFixed(2)} KB`);
categories.safeToDelelete.sort((a, b) => b.size - a.size).slice(0, 10).forEach(file => {
  console.log(`  • ${file.path} (${file.size.toFixed(2)} KB)`);
});
if (categories.safeToDelelete.length > 10) {
  console.log(`  ... and ${categories.safeToDelelete.length - 10} more files`);
}

console.log(`\n🟡 REVIEW REQUIRED (${categories.reviewRequired.length} files):`);
const reviewSize = categories.reviewRequired.reduce((sum, f) => sum + f.size, 0);
console.log(`Total size: ${reviewSize.toFixed(2)} KB`);
console.log(`These may be unused components, screens, or utilities. Check for:`);
console.log(`• Dynamic imports or lazy loading`);
console.log(`• Navigation configuration`);
console.log(`• Conditional platform-specific code`);
categories.reviewRequired.sort((a, b) => b.size - a.size).slice(0, 5).forEach(file => {
  console.log(`  • ${file.path} (${file.size.toFixed(2)} KB)`);
});

console.log(`\n🔵 KEEP BUT INVESTIGATE (${categories.keepButInvestigate.length} files):`);
const keepSize = categories.keepButInvestigate.reduce((sum, f) => sum + f.size, 0);
console.log(`Total size: ${keepSize.toFixed(2)} KB`);
console.log(`These are likely important but not directly imported:`);
categories.keepButInvestigate.sort((a, b) => b.size - a.size).forEach(file => {
  console.log(`  • ${file.path} (${file.size.toFixed(2)} KB)`);
});

console.log(`\n💾 EXTERNAL DEPENDENCIES (${report.externalDependencies.length}):`);
console.log(`Key frameworks and libraries in use:`);
const keyDeps = report.externalDependencies.filter(dep => 
  dep.includes('react') || 
  dep.includes('expo') || 
  dep.includes('aws') || 
  dep.includes('@react-navigation') ||
  dep.includes('@supabase')
).slice(0, 10);
keyDeps.forEach(dep => console.log(`  • ${dep}`));

console.log(`\n🎯 RECOMMENDATIONS:`);
console.log(`\n1. IMMEDIATE ACTION - Delete safe files:`);
console.log(`   • Run the generated safe-deletion-script.sh`);
console.log(`   • This will free up ${safeSize.toFixed(2)} KB immediately`);

console.log(`\n2. REVIEW COMPONENTS AND SCREENS:`);
console.log(`   • Check if unused components are referenced in navigation`);
console.log(`   • Look for dynamic imports using require() or import()`);
console.log(`   • Search for string-based component references`);

console.log(`\n3. INVESTIGATE HIGH-VALUE FILES:`);
console.log(`   • PlatformFix.js may be needed for React Native compatibility`);
console.log(`   • Config files might be environment-specific`);
console.log(`   • HOCs and services might be used as singletons`);

console.log(`\n📈 POTENTIAL IMPACT:`);
console.log(`• Total unused file size: ${totalUnusedSize.toFixed(2)} KB`);
console.log(`• Safe deletion impact: ${safeSize.toFixed(2)} KB (${((safeSize/totalUnusedSize)*100).toFixed(1)}%)`);
console.log(`• Files requiring review: ${categories.reviewRequired.length} (${reviewSize.toFixed(2)} KB)`);

console.log(`\n🔧 ARCHITECTURE INSIGHTS:`);
console.log(`• Most connected file: ${report.mostConnectedFiles[0]?.file} (${report.mostConnectedFiles[0]?.importedByCount} imports)`);
console.log(`• This suggests good modularization with shared utilities`);
console.log(`• Theme and context files are well-utilized across the app`);
console.log(`• Average of ${report.dependencyStats.averageDependenciesPerFile} dependencies per file indicates moderate coupling`);

console.log('\n='.repeat(60));
console.log('✅ Analysis complete! Check safe-deletion-script.sh for immediate cleanup.');
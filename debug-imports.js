const fs = require('fs');

// Test import extraction on a specific file
const filePath = 'src/screens/GoalsScreen.js';
const content = fs.readFileSync(filePath, 'utf-8');

console.log('File content preview:');
console.log(content.substring(0, 500));
console.log('\n' + '='.repeat(50) + '\n');

function removeCommentsAndStrings(content) {
  // Remove single-line comments but preserve the line
  content = content.replace(/\/\/.*$/gm, '');
  
  // Remove multi-line comments
  content = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Don't remove import/require strings - we need them
  // Only remove template literals and regular strings that aren't in import statements
  
  // First, extract all import/require lines
  const importLines = [];
  const lines = content.split('\n');
  
  const cleanedLines = lines.map(line => {
    // Keep import and require lines as-is
    if (/^\s*(import|const\s+.*=\s*require)\s/.test(line)) {
      return line;
    }
    
    // For other lines, remove strings and template literals
    line = line.replace(/`(?:[^`\\]|\\.)*`/g, '""');
    line = line.replace(/'(?:[^'\\]|\\.)*'/g, '""');
    line = line.replace(/"(?:[^"\\]|\\.)*"/g, '""');
    
    return line;
  });
  
  return cleanedLines.join('\n');
}

function extractImports(fileContent, filePath) {
  const imports = new Set();
  
  // Remove comments and strings to avoid false positives
  const cleanContent = removeCommentsAndStrings(fileContent);
  
  console.log('Clean content preview:');
  console.log(cleanContent.substring(0, 500));
  console.log('\n' + '='.repeat(50) + '\n');
  
  // ES6 imports
  const importPatterns = [
    // import React from 'react'
    /import\s+(?:\w+|\{[^}]*\}|\*\s+as\s+\w+)\s+from\s+['"`]([^'"`]+)['"`]/g,
    // import('dynamic-import')
    /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
    // require('module')
    /require\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
  ];
  
  for (const pattern of importPatterns) {
    console.log(`Testing pattern: ${pattern}`);
    let match;
    let matchCount = 0;
    while ((match = pattern.exec(cleanContent)) !== null) {
      const importPath = match[1];
      console.log(`  Found: ${importPath}`);
      if (importPath) {
        imports.add(importPath.trim());
        matchCount++;
      }
    }
    console.log(`  Total matches: ${matchCount}\n`);
  }
  
  return imports;
}

const imports = extractImports(content, filePath);
console.log('All extracted imports:');
Array.from(imports).forEach(imp => {
  const isExternal = !imp.startsWith('.');
  console.log(`  ${imp} (${isExternal ? 'EXTERNAL' : 'INTERNAL'})`);
});